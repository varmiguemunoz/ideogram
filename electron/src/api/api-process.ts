import { utilityProcess, type UtilityProcess } from 'electron';
import * as fs from 'node:fs';
import type { ElectronConfig } from '../config';

export class ApiProcess {
  private child: UtilityProcess | null = null;

  constructor(private readonly config: ElectronConfig) {}

  /** Returns false when there is nothing to start, which is the dev case. */
  start(): boolean {
    if (!this.config.isPackaged) return false;
    if (this.child) return true;

    const entry = this.config.packagedApiEntry;
    if (!fs.existsSync(entry)) {
      throw new Error(
        `The api bundle is missing from the packaged app at ${entry}. ` +
          'Run "npm run prepare:resources" before packaging.',
      );
    }

    this.child = utilityProcess.fork(entry, [], {
      serviceName: 'congen-api',
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(this.config.apiPort),
        // The api refuses to guess this in production. Electron is the only
        // party that knows the correct per user location.
        DB_PATH: this.config.apiDbPath,
      },
    });

    // Without this the api's output disappears, which makes a packaged only
    // failure almost impossible to diagnose.
    this.child.stdout?.on('data', (chunk) => process.stdout.write(`[api] ${chunk}`));
    this.child.stderr?.on('data', (chunk) => process.stderr.write(`[api] ${chunk}`));

    this.child.on('exit', (code) => {
      console.error(`[congen] the api process exited with code ${code}`);
      this.child = null;
    });

    return true;
  }

  stop(): void {
    if (!this.child) return;
    this.child.kill();
    this.child = null;
  }
}

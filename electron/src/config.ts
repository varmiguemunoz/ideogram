import { app } from 'electron';
import * as path from 'node:path';

export interface ElectronConfig {
  readonly apiPort: number;
  readonly apiBaseUrl: string;

  /** Set only in development. When absent, the packaged UI is loaded. */
  readonly uiDevServerUrl: string | undefined;

  readonly isPackaged: boolean;

  /** Packaged UI entry point. Only meaningful when isPackaged is true. */
  readonly packagedUiEntry: string;

  /** Packaged api bundle entry point. Only meaningful when isPackaged is true. */
  readonly packagedApiEntry: string;

  readonly apiDbPath: string;
}

const DEFAULT_API_PORT = 4317;

export function loadConfig(): ElectronConfig {
  const apiPort = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  const userData = app.getPath('userData');

  const resources = path.join(app.getAppPath(), 'resources');

  return {
    apiPort,
    apiBaseUrl: process.env.API_BASE_URL ?? `http://127.0.0.1:${apiPort}`,
    uiDevServerUrl: process.env.ELECTRON_START_URL ?? MAIN_WINDOW_VITE_DEV_SERVER_URL,
    isPackaged: app.isPackaged,
    packagedUiEntry: path.join(resources, 'ui', 'index.html'),
    packagedApiEntry: path.join(resources, 'api', 'index.js'),
    apiDbPath: path.join(userData, 'congen.db'),
  };
}

export function credentialsFilePath(): string {
  return path.join(app.getPath('userData'), 'credentials.enc');
}

import { app } from 'electron';
import * as path from 'node:path';

export interface ElectronConfig {
  readonly apiPort: number;
  readonly apiBaseUrl: string;

  /** Set only in development. When undefined, the packaged UI is loaded. */
  readonly uiDevServerUrl: string | undefined;

  readonly isPackaged: boolean;

  /** Packaged UI entry point. Only meaningful when isPackaged is true. */
  readonly packagedUiEntry: string;

  /** Packaged api bundle entry point. Only meaningful when isPackaged is true. */
  readonly packagedApiEntry: string;

  readonly apiDbPath: string;
}

const DEFAULT_API_PORT = 4317;

/**
 * Must match server.port in ui/vite.config.ts, which uses strictPort so it
 * either binds this exact port or fails loudly rather than drifting.
 */
const DEFAULT_UI_DEV_SERVER_URL = 'http://localhost:5173';

export function loadConfig(): ElectronConfig {
  const apiPort = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  const userData = app.getPath('userData');

  const resources = path.join(app.getAppPath(), 'resources');

  return {
    apiPort,
    apiBaseUrl: process.env.API_BASE_URL ?? `http://127.0.0.1:${apiPort}`,
    uiDevServerUrl: resolveUiDevServerUrl(),
    isPackaged: app.isPackaged,
    packagedUiEntry: path.join(resources, 'ui', 'index.html'),
    packagedApiEntry: path.join(resources, 'api', 'index.js'),
    apiDbPath: path.join(userData, 'congen.db'),
  };
}

/**
 * Where the renderer is loaded from in development.
 *
 * This used to read MAIN_WINDOW_VITE_DEV_SERVER_URL, a constant the Forge
 * Vite plugin substitutes at build time. That constant only exists when the
 * plugin has a renderer entry to build, and this project deliberately has
 * none: the UI is an independent Vite project Forge does not touch.
 *
 * So the identifier was never substituted, survived into the bundle as a bare
 * global, and threw a ReferenceError the moment the app booted.
 *
 * Resolving it here drops the dependency on Forge entirely. The UI runs on a
 * known fixed port, and ELECTRON_START_URL overrides it when needed. Kept as
 * a default rather than an env var in the dev script so it works on Windows
 * without pulling in cross-env.
 */
function resolveUiDevServerUrl(): string | undefined {
  if (process.env.ELECTRON_START_URL) return process.env.ELECTRON_START_URL;
  if (app.isPackaged) return undefined;
  return DEFAULT_UI_DEV_SERVER_URL;
}

export function credentialsFilePath(): string {
  return path.join(app.getPath('userData'), 'credentials.enc');
}

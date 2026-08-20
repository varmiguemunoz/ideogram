import * as path from 'node:path';

export interface AppConfig {
  readonly port: number;
  readonly dbPath: string;
  readonly isProduction: boolean;
}

/**
 * Loads and validates configuration once, at boot, failing fast with a clear
 * message rather than falling back silently.
 *
 * DB_PATH matters more than it looks. In a packaged build this process is
 * spawned by Electron, and the working directory of a spawned child is not
 * predictable, so process.cwd() would put the database somewhere arbitrary.
 * Electron must pass its own userData path in. We only fall back to a local
 * folder in development.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const isProduction = env.NODE_ENV === 'production';

  const port = Number(env.PORT ?? 4317);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${env.PORT}`);
  }

  const dbPath = env.DB_PATH;
  if (isProduction && !dbPath) {
    throw new Error(
      'DB_PATH is required in production. Electron must pass its userData path when spawning the api.',
    );
  }

  return {
    port,
    dbPath: dbPath ?? path.join(process.cwd(), 'data', 'congen.db'),
    isProduction,
  };
}

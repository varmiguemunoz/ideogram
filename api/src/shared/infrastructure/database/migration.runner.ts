import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SqliteConnection } from './sqlite.connection';

/**
 * Applies numbered .sql files from migrations/ in order, tracked by SQLite's
 * built in user_version counter.
 *
 * This replaces the old approach of running CREATE TABLE IF NOT EXISTS on
 * every boot plus a hand written ALTER TABLE patch, which had no way to
 * express a second schema change.
 *
 * File naming: NNN_description.sql, where NNN is the version it brings the
 * database up to. 001_initial_schema.sql takes an empty database to version 1.
 */
export class MigrationRunner {
  constructor(
    private readonly connection: SqliteConnection,
    private readonly migrationsDir: string = path.join(__dirname, 'migrations'),
  ) {}

  run(): void {
    const db = this.connection.handle;
    const currentVersion = Number(
      (db.pragma('user_version', { simple: true }) as number | bigint) ?? 0,
    );

    for (const migration of this.pendingMigrations(currentVersion)) {
      const sql = fs.readFileSync(migration.file, 'utf-8');
      this.connection.transaction(() => {
        db.exec(sql);
        db.pragma(`user_version = ${migration.version}`);
      });
    }
  }

  private pendingMigrations(currentVersion: number): Array<{ version: number; file: string }> {
    if (!fs.existsSync(this.migrationsDir)) return [];

    return fs
      .readdirSync(this.migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .map((name) => ({
        version: Number(name.split('_')[0]),
        file: path.join(this.migrationsDir, name),
      }))
      .filter((m) => Number.isInteger(m.version) && m.version > currentVersion)
      .sort((a, b) => a.version - b.version);
  }
}

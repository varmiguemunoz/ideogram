import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type SqliteDatabase = Database.Database;

/**
 * Owns exactly one job: open the database file and set pragmas.
 *
 * Repositories never open their own connection. They receive this one through
 * the constructor, which is what keeps a single WAL writer and lets the whole
 * api share one prepared statement cache.
 */
export class SqliteConnection {
  private readonly db: SqliteDatabase;

  constructor(location: string) {
    fs.mkdirSync(path.dirname(location), { recursive: true });
    this.db = new Database(location);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  get handle(): SqliteDatabase {
    return this.db;
  }

  /**
   * Runs fn atomically. better-sqlite3 transactions are synchronous by design,
   * so fn must not await anything.
   */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  close(): void {
    this.db.close();
  }
}

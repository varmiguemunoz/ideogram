import type { Statement } from 'better-sqlite3';
import type { SqliteConnection } from '../../../../shared/infrastructure/database/sqlite.connection';
import type { PhotoSelectionRepositoryPort } from '../../application/ports/photo-selection.repository.port';
import type { PhotoSelection } from '../../domain/photo-selection.entity';

interface SelectionRow {
  training_selection_paths: string | null;
}

/**
 * The selection lives in a JSON column on the single app_state row.
 *
 * better-sqlite3 rewards preparing statements once and reusing them, so they
 * are built in the constructor rather than on every call, which is what the
 * previous implementation did.
 */
export class SqlitePhotoSelectionRepository implements PhotoSelectionRepositoryPort {
  private readonly selectStmt: Statement;
  private readonly updateStmt: Statement;
  private readonly clearStmt: Statement;

  constructor(connection: SqliteConnection) {
    const db = connection.handle;
    this.selectStmt = db.prepare('SELECT training_selection_paths FROM app_state WHERE id = 1');
    this.updateStmt = db.prepare('UPDATE app_state SET training_selection_paths = ? WHERE id = 1');
    this.clearStmt = db.prepare('UPDATE app_state SET training_selection_paths = NULL WHERE id = 1');
  }

  save(selection: PhotoSelection): void {
    if (selection.isEmpty) {
      this.clear();
      return;
    }
    this.updateStmt.run(JSON.stringify(selection.absolutePaths));
  }

  loadPaths(): string[] {
    const row = this.selectStmt.get() as SelectionRow | undefined;
    if (!row?.training_selection_paths) return [];
    try {
      const parsed = JSON.parse(row.training_selection_paths);
      return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
    } catch {
      return [];
    }
  }

  clear(): void {
    this.clearStmt.run();
  }
}

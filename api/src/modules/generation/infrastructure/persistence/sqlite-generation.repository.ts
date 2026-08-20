import type { Statement } from 'better-sqlite3';
import type { SqliteConnection } from '../../../../shared/infrastructure/database/sqlite.connection';
import type {
  CreateGenerationRecord,
  GenerationRepositoryPort,
  UpdateGenerationRecord,
} from '../../application/ports/generation.repository.port';
import { Generation, type GenerationSnapshot, type GenerationStatus } from '../../domain/generation.entity';
import { GenerationNotFoundError } from '../../domain/generation.errors';
import type { Scenario } from '../../domain/scenario.vo';
import type { Framing } from '../../domain/framing.vo';

/** The raw generations row. Private to this file by design. */
interface GenerationRow {
  id: number;
  scenario: Scenario;
  framing: Framing;
  clothing_description: string;
  prompt: string;
  prediction_id: string | null;
  output_url: string | null;
  error: string | null;
  status: GenerationStatus;
  created_at: number;
  updated_at: number;
}

function toSnapshot(row: GenerationRow): GenerationSnapshot {
  return {
    id: row.id,
    scenario: row.scenario,
    framing: row.framing,
    clothingDescription: row.clothing_description,
    prompt: row.prompt,
    predictionId: row.prediction_id,
    outputUrl: row.output_url,
    error: row.error,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqliteGenerationRepository implements GenerationRepositoryPort {
  private readonly insertStmt: Statement;
  private readonly updateStmt: Statement;
  private readonly findStmt: Statement;
  private readonly listStmt: Statement;

  constructor(connection: SqliteConnection) {
    const db = connection.handle;

    this.insertStmt = db.prepare(
      `INSERT INTO generations
         (scenario, framing, clothing_description, prompt, prediction_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, 'pending', ?, ?)`,
    );
    this.updateStmt = db.prepare(
      `UPDATE generations
          SET status = ?, output_url = ?, error = ?, prediction_id = ?, updated_at = ?
        WHERE id = ?`,
    );
    this.findStmt = db.prepare('SELECT * FROM generations WHERE id = ?');
    this.listStmt = db.prepare('SELECT * FROM generations ORDER BY created_at DESC LIMIT ?');
  }

  create(record: CreateGenerationRecord): Generation {
    const result = this.insertStmt.run(
      record.scenario,
      record.framing,
      record.clothingDescription,
      record.prompt,
      record.now,
      record.now,
    );

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) throw new Error('create: failed to read back the inserted generation');
    return created;
  }

  /**
   * Partial update. Fields left undefined keep their current value, which is
   * what lets a poll tick advance the status without clearing the output url
   * it wrote a moment earlier.
   */
  update(id: number, record: UpdateGenerationRecord): void {
    const current = this.findById(id);
    if (!current) throw new GenerationNotFoundError(id);

    const snapshot = current.toSnapshot();
    this.updateStmt.run(
      record.status,
      record.outputUrl !== undefined ? record.outputUrl : snapshot.outputUrl,
      record.error !== undefined ? record.error : snapshot.error,
      record.predictionId !== undefined ? record.predictionId : snapshot.predictionId,
      record.now,
      id,
    );
  }

  findById(id: number): Generation | null {
    const row = this.findStmt.get(id) as GenerationRow | undefined;
    return row ? Generation.fromSnapshot(toSnapshot(row)) : null;
  }

  list(limit: number): Generation[] {
    const rows = this.listStmt.all(limit) as GenerationRow[];
    return rows.map((row) => Generation.fromSnapshot(toSnapshot(row)));
  }
}

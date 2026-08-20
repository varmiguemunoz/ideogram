import type { Statement } from 'better-sqlite3';
import type { SqliteConnection } from '../../../../shared/infrastructure/database/sqlite.connection';
import type {
  StartTrainingRecord,
  TrainingRunRepositoryPort,
  UpdateStatusRecord,
} from '../../application/ports/training-run.repository.port';
import { TrainingRun, type TrainingRunSnapshot } from '../../domain/training-run.entity';
import type { TrainingStatus } from '../../domain/training-status.vo';

/** The raw app_state row. Private to this file by design. */
interface AppStateRow {
  trigger_word: string | null;
  destination_model: string | null;
  trained_version: string | null;
  training_status: TrainingStatus;
  training_prediction_id: string | null;
  training_zip_url: string | null;
  training_started_at: number | null;
}

function toSnapshot(row: AppStateRow): TrainingRunSnapshot {
  return {
    triggerWord: row.trigger_word,
    destinationModel: row.destination_model,
    trainedVersion: row.trained_version,
    trainingStatus: row.training_status,
    trainingPredictionId: row.training_prediction_id,
    trainingZipUrl: row.training_zip_url,
    trainingStartedAt: row.training_started_at,
  };
}

export class SqliteTrainingRunRepository implements TrainingRunRepositoryPort {
  private readonly selectStmt: Statement;
  private readonly setModelStmt: Statement;
  private readonly startStmt: Statement;
  private readonly setZipStmt: Statement;
  private readonly clearZipStmt: Statement;
  private readonly updateStatusStmt: Statement;

  constructor(private readonly connection: SqliteConnection) {
    const db = connection.handle;

    this.selectStmt = db.prepare('SELECT * FROM app_state WHERE id = 1');
    this.setModelStmt = db.prepare('UPDATE app_state SET destination_model = ? WHERE id = 1');
    this.startStmt = db.prepare(
      `UPDATE app_state
          SET trigger_word = ?,
              training_prediction_id = ?,
              training_started_at = ?,
              training_status = 'pending'
        WHERE id = 1`,
    );
    this.setZipStmt = db.prepare('UPDATE app_state SET training_zip_url = ? WHERE id = 1');
    this.clearZipStmt = db.prepare('UPDATE app_state SET training_zip_url = NULL WHERE id = 1');
    this.updateStatusStmt = db.prepare(
      'UPDATE app_state SET training_status = ?, trained_version = ? WHERE id = 1',
    );
  }

  load(): TrainingRun {
    return TrainingRun.fromSnapshot(toSnapshot(this.selectStmt.get() as AppStateRow));
  }

  setDestinationModel(slug: string): void {
    this.setModelStmt.run(slug);
  }

  /**
   * Recording the run and remembering its archive url must not be able to
   * half apply, otherwise a crash between them leaks a blob with nothing
   * pointing at it.
   */
  start(record: StartTrainingRecord): void {
    this.connection.transaction(() => {
      this.startStmt.run(record.triggerWord, record.predictionId, record.startedAt);
      this.setZipStmt.run(record.zipUrl);
    });
  }

  updateStatus(record: UpdateStatusRecord): void {
    const current = this.load();
    const trainedVersion =
      record.trainedVersion !== undefined ? record.trainedVersion : current.trainedVersion;
    this.updateStatusStmt.run(record.status, trainedVersion);
  }

  clearZipUrl(): void {
    this.clearZipStmt.run();
  }
}

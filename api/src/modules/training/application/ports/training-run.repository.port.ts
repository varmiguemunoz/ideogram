import type { TrainingRun } from '../../domain/training-run.entity';
import type { TrainingStatus } from '../../domain/training-status.vo';

export interface StartTrainingRecord {
  triggerWord: string;
  predictionId: string;
  startedAt: number;
  zipUrl: string;
}

export interface UpdateStatusRecord {
  status: TrainingStatus;
  trainedVersion?: string | null;
}

export interface TrainingRunRepositoryPort {
  load(): TrainingRun;
  setDestinationModel(slug: string): void;

  /** Records the start of a run. Atomic with clearing the photo selection. */
  start(record: StartTrainingRecord): void;

  updateStatus(record: UpdateStatusRecord): void;
  clearZipUrl(): void;
}

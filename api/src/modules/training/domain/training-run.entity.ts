import { isInFlight, isTerminal, type TrainingStatus } from './training-status.vo';

/**
 * The single, long lived training aggregate. There is exactly one of these
 * per installation, stored in the single app_state row.
 *
 * It carries both the configuration the user sets before training, the
 * destination model, and the outcome of the last run, the trained version.
 * Generation reads the trained version and trigger word from here.
 */
export interface TrainingRunSnapshot {
  triggerWord: string | null;
  destinationModel: string | null;
  trainedVersion: string | null;
  trainingStatus: TrainingStatus;
  trainingPredictionId: string | null;
  trainingZipUrl: string | null;
  trainingStartedAt: number | null;
}

/**
 * A run that has been in flight for longer than this, or that the provider
 * no longer recognizes, is treated as abandoned and marked failed, so nothing
 * can hang in pending forever.
 */
export const ABANDON_AFTER_MS = 24 * 60 * 60 * 1000;

export class TrainingRun {
  constructor(private readonly snapshot: TrainingRunSnapshot) {}

  static fromSnapshot(snapshot: TrainingRunSnapshot): TrainingRun {
    return new TrainingRun(snapshot);
  }

  toSnapshot(): TrainingRunSnapshot {
    return { ...this.snapshot };
  }

  get status(): TrainingStatus {
    return this.snapshot.trainingStatus;
  }

  get predictionId(): string | null {
    return this.snapshot.trainingPredictionId;
  }

  get zipUrl(): string | null {
    return this.snapshot.trainingZipUrl;
  }

  get startedAt(): number | null {
    return this.snapshot.trainingStartedAt;
  }

  get destinationModel(): string | null {
    return this.snapshot.destinationModel;
  }

  get triggerWord(): string | null {
    return this.snapshot.triggerWord;
  }

  get trainedVersion(): string | null {
    return this.snapshot.trainedVersion;
  }

  get isInFlight(): boolean {
    return isInFlight(this.snapshot.trainingStatus);
  }

  get isTerminal(): boolean {
    return isTerminal(this.snapshot.trainingStatus);
  }

  /** True once a run has finished and produced a usable model version. */
  get isReadyForGeneration(): boolean {
    return (
      this.snapshot.trainingStatus === 'succeeded' &&
      Boolean(this.snapshot.trainedVersion) &&
      Boolean(this.snapshot.triggerWord)
    );
  }

  /**
   * Pure rule, kept here rather than next to the SQL it used to live beside.
   * notFound means the provider returned 404 for this run.
   */
  isAbandoned(nowMs: number, notFound = false): boolean {
    if (notFound) return true;
    if (this.snapshot.trainingStartedAt === null) return false;
    return nowMs - this.snapshot.trainingStartedAt > ABANDON_AFTER_MS;
  }

  /** True when a poll result belongs to the run currently being tracked. */
  isTracking(predictionId: string): boolean {
    return this.snapshot.trainingPredictionId === predictionId;
  }
}

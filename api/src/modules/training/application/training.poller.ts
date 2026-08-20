import type { SchedulerPort } from '../../../shared/application/ports/scheduler.port';
import type { SyncTrainingStatusCommand } from './commands/sync-training-status.command';

export const TRAINING_POLL_INTERVAL_MS = 10_000;

/**
 * Owns the repeating side of training: it repeatedly runs one sync tick until
 * that tick reports the run has settled, then cancels itself.
 *
 * This is the only class in the training module that knows a timer exists.
 * The command it drives stays a single, testable, one shot operation.
 */
export class TrainingPoller {
  private static readonly KEY = 'training';

  constructor(
    private readonly scheduler: SchedulerPort,
    private readonly syncStatus: SyncTrainingStatusCommand,
  ) {}

  track(predictionId: string): void {
    this.scheduler.every(TrainingPoller.KEY, TRAINING_POLL_INTERVAL_MS, async () => {
      const outcome = await this.syncStatus.execute(predictionId);
      if (outcome === 'settled') this.stop();
    });
  }

  stop(): void {
    this.scheduler.cancel(TrainingPoller.KEY);
  }
}

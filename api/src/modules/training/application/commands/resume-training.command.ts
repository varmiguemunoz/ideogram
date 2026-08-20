import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { TrainingRunRepositoryPort } from '../ports/training-run.repository.port';
import type { TrainingPoller } from '../training.poller';

/**
 * Restores polling for a run that was still in flight when the api last shut
 * down. A run that has since passed the abandon window is failed immediately
 * instead of being polled.
 */
export class ResumeTrainingCommand {
  constructor(
    private readonly repository: TrainingRunRepositoryPort,
    private readonly poller: TrainingPoller,
    private readonly clock: ClockPort,
  ) {}

  execute(): void {
    const run = this.repository.load();
    if (!run.isInFlight || !run.predictionId) return;

    if (run.isAbandoned(this.clock.now())) {
      this.repository.updateStatus({ status: 'failed' });
      return;
    }

    this.poller.track(run.predictionId);
  }
}

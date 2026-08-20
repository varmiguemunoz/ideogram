import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { TrainingRunRepositoryPort } from '../ports/training-run.repository.port';
import type { TrainingProviderPort } from '../ports/training-provider.port';
import type { FileStoragePort } from '../ports/file-storage.port';

/** What the caller should do with the polling loop after this tick. */
export type SyncOutcome = 'settled' | 'still-running';

/**
 * One tick of the training poll, and nothing else.
 *
 * The old orchestrator interleaved this logic with setInterval bookkeeping,
 * which made it impossible to run a single tick in isolation. Here the
 * command describes only the work of one check and reports whether the run
 * has settled. Whoever owns the timer decides what to do with that.
 */
export class SyncTrainingStatusCommand {
  constructor(
    private readonly repository: TrainingRunRepositoryPort,
    private readonly provider: TrainingProviderPort,
    private readonly fileStorage: FileStoragePort,
    private readonly clock: ClockPort,
  ) {}

  async execute(predictionId: string): Promise<SyncOutcome> {
    const run = this.repository.load();

    // Another run took over, or this one already finished.
    if (!run.isTracking(predictionId) || run.isTerminal) return 'settled';

    let state;
    try {
      state = await this.provider.getState(predictionId);
    } catch {
      // Transient upstream failure. Leave the state untouched and let the
      // next tick retry, which is what the original poll loop did.
      return 'still-running';
    }

    if (run.isAbandoned(this.clock.now(), state.notFound)) {
      this.repository.updateStatus({
        status: 'failed',
        trainedVersion: null,
      });
      return 'settled';
    }

    if (state.status === 'succeeded') {
      if (!state.trainedVersion) {
        this.repository.updateStatus({ status: 'failed' });
        return 'settled';
      }

      this.repository.updateStatus({ status: 'succeeded', trainedVersion: state.trainedVersion });
      await this.discardArchive(run.zipUrl);
      return 'settled';
    }

    if (state.status === 'failed') {
      // The archive is deliberately kept on failure, so a retry does not have
      // to re-upload the same twenty photos.
      this.repository.updateStatus({ status: 'failed' });
      return 'settled';
    }

    this.repository.updateStatus({ status: state.status });
    return 'still-running';
  }

  private async discardArchive(zipUrl: string | null): Promise<void> {
    if (!zipUrl) return;
    try {
      await this.fileStorage.remove(zipUrl);
    } catch {
      // A leftover scratch file is not worth failing a successful training
      // run over. It costs storage, not correctness.
    }
    this.repository.clearZipUrl();
  }
}

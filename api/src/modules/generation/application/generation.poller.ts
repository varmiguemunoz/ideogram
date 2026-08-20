import type { SchedulerPort } from '../../../shared/application/ports/scheduler.port';
import type { SyncGenerationStatusCommand } from './commands/sync-generation-status.command';

export const GENERATION_POLL_INTERVAL_MS = 10_000;

/**
 * Tracks each in flight generation independently, keyed by its id, so several
 * can run at once and each stops itself as soon as it settles.
 */
export class GenerationPoller {
  constructor(
    private readonly scheduler: SchedulerPort,
    private readonly syncStatus: SyncGenerationStatusCommand,
  ) {}

  track(generationId: number, runId: string): void {
    const key = GenerationPoller.keyFor(generationId);
    this.scheduler.every(key, GENERATION_POLL_INTERVAL_MS, async () => {
      const outcome = await this.syncStatus.execute(generationId, runId);
      if (outcome === 'settled') this.scheduler.cancel(key);
    });
  }

  private static keyFor(generationId: number): string {
    return `generation:${generationId}`;
  }
}

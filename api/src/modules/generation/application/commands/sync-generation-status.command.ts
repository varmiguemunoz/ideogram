import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { GenerationRepositoryPort } from '../ports/generation.repository.port';
import type { ImageGeneratorPort } from '../ports/image-generator.port';

export type SyncOutcome = 'settled' | 'still-running';

/**
 * One tick of a generation poll. Same shape as the training equivalent: it
 * performs a single check and reports whether the run has settled, leaving
 * timer ownership entirely to the poller.
 */
export class SyncGenerationStatusCommand {
  constructor(
    private readonly repository: GenerationRepositoryPort,
    private readonly generator: ImageGeneratorPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(generationId: number, runId: string): Promise<SyncOutcome> {
    const generation = this.repository.findById(generationId);
    if (!generation || generation.isTerminal) return 'settled';

    let state;
    try {
      state = await this.generator.getState(runId);
    } catch {
      // Transient upstream failure. Retry on the next tick.
      return 'still-running';
    }

    const now = this.clock.now();

    if (generation.isAbandoned(now, state.notFound)) {
      this.repository.update(generationId, {
        status: 'failed',
        error: state.notFound
          ? 'Generation run not found on the provider.'
          : 'Generation abandoned after 24h with no terminal status.',
        now,
      });
      return 'settled';
    }

    if (state.status === 'succeeded') {
      this.repository.update(generationId, {
        status: 'succeeded',
        outputUrl: state.outputUrl,
        now,
      });
      return 'settled';
    }

    if (state.status === 'failed') {
      this.repository.update(generationId, {
        status: 'failed',
        error: state.error ?? 'Generation failed.',
        now,
      });
      return 'settled';
    }

    this.repository.update(generationId, { status: state.status, now });
    return 'still-running';
  }
}

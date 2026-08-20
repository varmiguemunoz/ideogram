import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { GenerationRepositoryPort } from '../ports/generation.repository.port';
import type { GenerationPoller } from '../generation.poller';

/** How far back to look for runs left in flight by a previous process. */
const RESUME_SCAN_LIMIT = 200;

export class ResumeGenerationsCommand {
  constructor(
    private readonly repository: GenerationRepositoryPort,
    private readonly poller: GenerationPoller,
    private readonly clock: ClockPort,
  ) {}

  execute(): void {
    const inFlight = this.repository
      .list(RESUME_SCAN_LIMIT)
      .filter((generation) => generation.isInFlight && generation.predictionId);

    const now = this.clock.now();

    for (const generation of inFlight) {
      if (generation.isAbandoned(now)) {
        this.repository.update(generation.id, {
          status: 'failed',
          error: 'Generation abandoned after 24h with no terminal status.',
          now,
        });
        continue;
      }

      // Narrowed by the filter above.
      this.poller.track(generation.id, generation.predictionId as string);
    }
  }
}

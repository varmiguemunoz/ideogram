import type { GenerationRepositoryPort } from '../ports/generation.repository.port';
import type { GenerationSnapshot } from '../../domain/generation.entity';

export const DEFAULT_HISTORY_LIMIT = 20;

export class ListGenerationsQuery {
  constructor(private readonly repository: GenerationRepositoryPort) {}

  execute(requestedLimit: unknown): GenerationSnapshot[] {
    const limit = Number(requestedLimit);
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_HISTORY_LIMIT;

    return this.repository.list(safeLimit).map((generation) => generation.toSnapshot());
  }
}

import type { TrainingRunRepositoryPort } from '../ports/training-run.repository.port';
import type { TrainingRunSnapshot } from '../../domain/training-run.entity';

/**
 * The state the renderer polls. The snapshot shape is the AppState contract
 * ui/src/types.ts already declares, so it is preserved field for field.
 */
export class GetTrainingStateQuery {
  constructor(private readonly repository: TrainingRunRepositoryPort) {}

  execute(): TrainingRunSnapshot {
    return this.repository.load().toSnapshot();
  }
}

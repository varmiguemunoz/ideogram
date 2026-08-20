import type { TrainingRunRepositoryPort } from '../../training/application/ports/training-run.repository.port';
import type {
  TrainedModel,
  TrainedModelProviderPort,
} from '../application/ports/trained-model.provider.port';

/**
 * The single seam between generation and training.
 *
 * This is the only file in the generation module that knows a training module
 * exists. Everything upstream depends on TrainedModelProviderPort instead.
 */
export class TrainingModuleTrainedModel implements TrainedModelProviderPort {
  constructor(private readonly trainingRepository: TrainingRunRepositoryPort) {}

  getTrainedModel(): TrainedModel | null {
    const run = this.trainingRepository.load();
    if (!run.isReadyForGeneration) return null;

    return {
      version: run.trainedVersion as string,
      triggerWord: run.triggerWord as string,
    };
  }
}

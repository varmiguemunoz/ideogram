import type { TrainingRunRepositoryPort } from '../ports/training-run.repository.port';
import { DestinationModel } from '../../domain/destination-model.vo';

export class SetDestinationModelCommand {
  constructor(private readonly repository: TrainingRunRepositoryPort) {}

  execute(input: { slug: unknown }): void {
    this.repository.setDestinationModel(DestinationModel.create(input.slug).slug);
  }
}

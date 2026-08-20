import { DomainError } from '../../../shared/domain/domain.error';

export class InvalidScenarioOrFramingError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Invalid scenario or framing.');
  }
}

export class ModelNotTrainedError extends DomainError {
  readonly code = 'E_NOT_TRAINED' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Training has not completed successfully yet.');
  }
}

export class GenerationNotFoundError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 404;

  constructor(id: number) {
    super(`No generation with id ${id}.`);
  }
}

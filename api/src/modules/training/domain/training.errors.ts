import { DomainError } from '../../../shared/domain/domain.error';

export class TriggerWordRequiredError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('A trigger word is required.');
  }
}

export class InvalidDestinationModelError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Destination model must look like "owner/name".');
  }
}

export class DestinationModelNotSetError extends DomainError {
  readonly code = 'E_NO_MODEL' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Set a destination model before training.');
  }
}

export class WrongPhotoCountError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor(required: number, actual: number) {
    super(`Se requieren exactamente ${required} fotos validas. Tenes ${actual}.`);
  }
}

export class TrainingVersionMissingError extends DomainError {
  readonly code = 'E_UPSTREAM' as const;
  readonly httpStatus = 502;

  constructor() {
    super('Training succeeded but no model version was returned.');
  }
}

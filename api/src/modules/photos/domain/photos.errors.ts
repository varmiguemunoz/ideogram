import { DomainError } from '../../../shared/domain/domain.error';

export class NoValidPhotosError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('No valid image files selected.');
  }
}

export class InvalidPhotoIndexError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Invalid photo index.');
  }
}

export class NoActiveSelectionError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('There is no active photo selection.');
  }
}

export class SelectionMismatchError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Photo selection does not match current session.');
  }
}

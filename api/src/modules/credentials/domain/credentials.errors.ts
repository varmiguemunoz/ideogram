import { DomainError } from '../../../shared/domain/domain.error';

export class ReplicateTokenMissingError extends DomainError {
  readonly code = 'E_NO_CREDS' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Replicate token is not set.');
  }
}

export class BlobTokenMissingError extends DomainError {
  readonly code = 'E_NO_CREDS' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Vercel Blob token is not set.');
  }
}

export class InvalidCredentialsPayloadError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;

  constructor() {
    super('Both a Replicate token and a Vercel Blob token are required.');
  }
}

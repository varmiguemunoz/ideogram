import type { ErrCode } from '../types/result';

/**
 * Base class for every error the domain and application layers throw.
 *
 * Carrying the ErrCode here is what lets the error middleware serialize any
 * domain failure straight into the Result envelope the renderer expects,
 * without the controllers needing a single try catch block.
 */
export abstract class DomainError extends Error {
  abstract readonly code: ErrCode;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** Caller sent something malformed. Maps to HTTP 400. */
export class InvalidInputError extends DomainError {
  readonly code = 'E_INVALID_INPUT' as const;
  readonly httpStatus = 400;
}

/** A required provider token has not been supplied yet. Maps to HTTP 400. */
export class MissingCredentialsError extends DomainError {
  readonly code = 'E_NO_CREDS' as const;
  readonly httpStatus = 400;
}

/** An external provider failed or was unreachable. Maps to HTTP 502. */
export class UpstreamError extends DomainError {
  readonly code = 'E_UPSTREAM' as const;
  readonly httpStatus = 502;
}

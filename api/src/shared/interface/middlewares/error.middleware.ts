import type { NextFunction, Request, Response } from 'express';
import { DomainError } from '../../domain/domain.error';
import { err } from '../../types/result';

/**
 * The only error handling code in the api.
 *
 * Domain and application layers throw. Controllers stay thin and let errors
 * escape. This middleware is what turns a thrown DomainError back into the
 * { ok: false, code, message } envelope the renderer already reads, so the
 * wire contract is unchanged even though the internals now use exceptions.
 *
 * Express 4 identifies an error handler by its four argument signature, so
 * next must stay in the list even though it is unused.
 */
export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof DomainError) {
    res.status(error.httpStatus).json(err(error.code, error.message));
    return;
  }

  console.error('[congen api] unhandled error', error);
  res.status(500).json(err('E_UPSTREAM', 'An unexpected error occurred.'));
}

/**
 * Express 4 does not forward rejected promises from async handlers to the
 * error middleware. Wrapping a handler here is what makes `throw` work the
 * same way in async controllers as it does in sync ones.
 */
export function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void> | void,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(handler(req, res)).catch(next);
  };
}

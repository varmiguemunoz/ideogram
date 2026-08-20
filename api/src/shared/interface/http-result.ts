import type { Response } from 'express';
import { ok, type Result } from '../types/result';

/**
 * The single place a success response is written. Keeps every controller
 * emitting the exact envelope the renderer expects.
 */
export function sendOk<T>(res: Response, value: T): void {
  res.json(ok(value));
}

export type { Result };

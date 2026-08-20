/**
 * The wire envelope every HTTP response uses.
 *
 * This shape is a hard contract with the renderer: ui/src/adapters/in/electron/
 * congenAdapter.ts reads it directly. Do not change it without changing that
 * file in the same commit.
 */
export type ErrCode =
  | 'E_NO_KEYCHAIN'
  | 'E_NO_CREDS'
  | 'E_NO_MODEL'
  | 'E_NOT_TRAINED'
  | 'E_UPSTREAM'
  | 'E_INVALID_INPUT';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: ErrCode; message: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(code: ErrCode, message: string): Result<T> {
  return { ok: false, code, message };
}

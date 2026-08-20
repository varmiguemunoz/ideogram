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

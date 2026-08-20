import { API_BASE_URL } from '../config';
import type { Result } from '../types';

/**
 * The only place in the UI that calls fetch.
 *
 * Always returns a Result, never throws, so a dropped connection and an api
 * domain error arrive in the same shape and every caller has exactly one
 * branch to write. The api already speaks Result, including for its own
 * errors, so a well formed body passes straight through whatever the status
 * code.
 */
async function request<T>(pathname: string, init?: RequestInit): Promise<Result<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${pathname}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch (e) {
    return {
      ok: false,
      code: 'E_UPSTREAM',
      message: e instanceof Error ? e.message : 'Could not reach the api.',
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      code: 'E_UPSTREAM',
      message: `The api returned a non JSON response with status ${response.status}.`,
    };
  }

  if (typeof body === 'object' && body !== null && 'ok' in body) {
    return body as Result<T>;
  }

  return {
    ok: false,
    code: 'E_UPSTREAM',
    message: `Unexpected api response with status ${response.status}.`,
  };
}

export const http = {
  get: <T>(pathname: string) => request<T>(pathname),
  post: <T>(pathname: string, body: unknown) =>
    request<T>(pathname, { method: 'POST', body: JSON.stringify(body) }),
};

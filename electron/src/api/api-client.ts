import { err, type Result } from '../result';

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async post<T>(pathname: string, body: unknown): Promise<Result<T>> {
    return this.request<T>(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async waitUntilHealthy(timeoutMs = 30_000, intervalMs = 300): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${this.baseUrl}/api/health`);
        if (response.ok) return true;
      } catch {
        // Not listening yet. Keep waiting.
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false;
  }

  private async request<T>(pathname: string, init: RequestInit): Promise<Result<T>> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${pathname}`, init);
    } catch (e) {
      return err('E_UPSTREAM', e instanceof Error ? e.message : 'Could not reach the local api.');
    }

    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      return err('E_UPSTREAM', `The api returned a non JSON response with status ${response.status}.`);
    }

    // The api already speaks Result, including for its own domain errors, so
    // a well formed body is passed straight through whatever the status code.
    if (isResult<T>(parsed)) return parsed;

    return err('E_UPSTREAM', `Unexpected api response with status ${response.status}.`);
  }
}

function isResult<T>(value: unknown): value is Result<T> {
  return typeof value === 'object' && value !== null && 'ok' in value;
}

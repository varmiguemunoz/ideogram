import { UpstreamError } from '../../domain/domain.error';

/**
 * Low level transport for api.replicate.com. Knows about auth headers, JSON
 * and network failure. Knows nothing about training or generation.
 *
 * The two module adapters, ReplicateTrainingProvider and
 * ReplicateImageGenerator, sit on top of this and are the only things that
 * translate its responses into domain language.
 *
 * fetchFn is injected so the existing replicate tests can keep stubbing it.
 */
export type ReplicateRawStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

/** Replicate's raw statuses collapsed to the four the application cares about. */
export type MappedStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export function mapReplicateStatus(status: ReplicateRawStatus): MappedStatus {
  switch (status) {
    case 'starting':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'succeeded':
      return 'succeeded';
    case 'failed':
    case 'canceled':
      return 'failed';
    default:
      return 'failed';
  }
}

export interface ReplicateResponse<T> {
  /** True when Replicate answered 404. Callers treat this as an abandoned run. */
  notFound: boolean;
  body: T | null;
}

export class ReplicateHttpClient {
  private static readonly BASE_URL = 'https://api.replicate.com/v1';

  constructor(
    private readonly token: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async get<T>(pathname: string): Promise<ReplicateResponse<T>> {
    return this.request<T>('GET', pathname);
  }

  async post<T>(pathname: string, body: unknown): Promise<ReplicateResponse<T>> {
    return this.request<T>('POST', pathname, body);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    pathname: string,
    body?: unknown,
  ): Promise<ReplicateResponse<T>> {
    let response: Response;
    try {
      response = await this.fetchFn(`${ReplicateHttpClient.BASE_URL}${pathname}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      throw new UpstreamError(e instanceof Error ? e.message : 'Network request failed');
    }

    if (response.status === 404) {
      return { notFound: true, body: null };
    }
    if (!response.ok) {
      throw new UpstreamError(`Replicate ${method} ${pathname} failed with status ${response.status}`);
    }

    return { notFound: false, body: (await response.json()) as T };
  }
}

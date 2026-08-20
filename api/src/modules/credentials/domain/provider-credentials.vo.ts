import { InvalidCredentialsPayloadError } from './credentials.errors';

/**
 * The pair of provider tokens the api needs to do any real work.
 *
 * Encryption at rest is deliberately not modelled here. Electron owns that,
 * because safeStorage only exists inside Electron's main process. The api
 * only ever holds the already decrypted pair, in memory, for the lifetime of
 * the running process.
 */
export class ProviderCredentials {
  private constructor(
    readonly replicateToken: string,
    readonly blobToken: string,
  ) {
    Object.freeze(this);
  }

  static create(replicateToken: unknown, blobToken: unknown): ProviderCredentials {
    const replicate = typeof replicateToken === 'string' ? replicateToken.trim() : '';
    const blob = typeof blobToken === 'string' ? blobToken.trim() : '';

    if (replicate.length === 0 || blob.length === 0) {
      throw new InvalidCredentialsPayloadError();
    }

    return new ProviderCredentials(replicate, blob);
  }
}

import type { CredentialsStorePort } from '../application/ports/credentials-store.port';
import type { ProviderCredentials } from '../domain/provider-credentials.vo';
import { BlobTokenMissingError, ReplicateTokenMissingError } from '../domain/credentials.errors';

/**
 * In memory only, on purpose. Nothing here ever touches disk.
 *
 * Electron decrypts the tokens on startup and pushes them to
 * POST /api/internal/credentials, so restarting the api simply clears them
 * and waits for the next push, exactly like restarting Electron does.
 */
export class InMemoryCredentialsStore implements CredentialsStorePort {
  private credentials: ProviderCredentials | null = null;

  save(credentials: ProviderCredentials): void {
    this.credentials = credentials;
  }

  requireReplicateToken(): string {
    if (!this.credentials?.replicateToken) throw new ReplicateTokenMissingError();
    return this.credentials.replicateToken;
  }

  requireBlobToken(): string {
    if (!this.credentials?.blobToken) throw new BlobTokenMissingError();
    return this.credentials.blobToken;
  }

  status(): { replicate: boolean; blob: boolean } {
    return {
      replicate: Boolean(this.credentials?.replicateToken),
      blob: Boolean(this.credentials?.blobToken),
    };
  }
}

import type { ProviderCredentials } from '../../domain/provider-credentials.vo';

/**
 * Where the decrypted provider tokens live while the api is running.
 *
 * Modelled as a port so the training and generation modules depend on the
 * capability of reading a token, never on the fact that it currently happens
 * to be a variable in memory.
 */
export interface CredentialsStorePort {
  save(credentials: ProviderCredentials): void;

  /** Throws ReplicateTokenMissingError when nothing has been supplied yet. */
  requireReplicateToken(): string;

  /** Throws BlobTokenMissingError when nothing has been supplied yet. */
  requireBlobToken(): string;

  status(): { replicate: boolean; blob: boolean };
}

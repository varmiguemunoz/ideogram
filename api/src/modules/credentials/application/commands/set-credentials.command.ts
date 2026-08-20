import type { CredentialsStorePort } from '../ports/credentials-store.port';
import { ProviderCredentials } from '../../domain/provider-credentials.vo';

export interface SetCredentialsInput {
  replicate: unknown;
  blob: unknown;
}

/**
 * Accepts the decrypted token pair pushed by Electron and stores it for the
 * rest of the process to use.
 */
export class SetCredentialsCommand {
  constructor(private readonly store: CredentialsStorePort) {}

  execute(input: SetCredentialsInput): void {
    this.store.save(ProviderCredentials.create(input.replicate, input.blob));
  }
}

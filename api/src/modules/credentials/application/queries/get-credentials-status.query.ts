import type { CredentialsStorePort } from '../ports/credentials-store.port';

export interface CredentialsStatus {
  replicate: boolean;
  blob: boolean;
}

/** Reports which tokens are present. Never returns the tokens themselves. */
export class GetCredentialsStatusQuery {
  constructor(private readonly store: CredentialsStorePort) {}

  execute(): CredentialsStatus {
    return this.store.status();
  }
}

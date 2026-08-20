import type { Router } from 'express';
import { InMemoryCredentialsStore } from './infrastructure/in-memory-credentials.store';
import { SetCredentialsCommand } from './application/commands/set-credentials.command';
import { GetCredentialsStatusQuery } from './application/queries/get-credentials-status.query';
import { CredentialsController } from './interface/credentials.controller';
import { createCredentialsRoutes } from './interface/credentials.routes';
import type { CredentialsStorePort } from './application/ports/credentials-store.port';

/**
 * Composition root for this module. Instantiates its own pieces and exposes
 * only two things outwards: its router, and the credentials store, which the
 * training and generation modules need in order to authenticate.
 */
export class CredentialsModule {
  readonly routes: Router;
  readonly store: CredentialsStorePort;

  constructor() {
    this.store = new InMemoryCredentialsStore();

    const controller = new CredentialsController(
      new SetCredentialsCommand(this.store),
      new GetCredentialsStatusQuery(this.store),
    );

    this.routes = createCredentialsRoutes(controller);
  }
}

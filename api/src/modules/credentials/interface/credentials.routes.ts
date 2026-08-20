import { Router } from 'express';
import type { CredentialsController } from './credentials.controller';

/**
 * /internal is called only by electron/src/credentialsBridge.ts, never by the
 * renderer. The api binds to 127.0.0.1, so this stays off the network.
 */
export function createCredentialsRoutes(controller: CredentialsController): Router {
  const router = Router();
  router.post('/internal/credentials', controller.set);
  router.get('/internal/credentials/status', controller.status);
  return router;
}

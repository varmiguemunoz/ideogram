import express, { type Express } from 'express';
import cors from 'cors';
import type { Container } from './container';
import { errorMiddleware } from './shared/interface/middlewares/error.middleware';

/**
 * Mounts every module under /api.
 *
 * Bound to 127.0.0.1 by index.ts. This is a local companion process for the
 * desktop app, not a public server.
 *
 * The error middleware is registered last, which is what Express requires for
 * it to receive anything the routes throw.
 */
export function createApp(container: Container): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', container.credentials.routes);
  app.use('/api', container.photos.routes);
  app.use('/api', container.training.routes);
  app.use('/api', container.generation.routes);

  app.use(errorMiddleware);

  return app;
}

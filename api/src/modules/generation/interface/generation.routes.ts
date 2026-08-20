import { Router } from 'express';
import type { GenerationController } from './generation.controller';
import { asyncHandler } from '../../../shared/interface/middlewares/error.middleware';

export function createGenerationRoutes(controller: GenerationController): Router {
  const router = Router();
  router.post('/generation/start', asyncHandler(controller.start));
  router.get('/generations', controller.list);
  router.get('/catalog', controller.catalog);
  return router;
}

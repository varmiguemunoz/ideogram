import { Router } from 'express';
import type { TrainingController } from './training.controller';
import { asyncHandler } from '../../../shared/interface/middlewares/error.middleware';

export function createTrainingRoutes(controller: TrainingController): Router {
  const router = Router();
  router.post('/model', controller.setModel);
  router.post('/training/start', asyncHandler(controller.start));
  router.get('/state', controller.state);
  router.get('/training/requirements', controller.requirements);
  return router;
}

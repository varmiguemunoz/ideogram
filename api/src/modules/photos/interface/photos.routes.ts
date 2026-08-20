import { Router } from 'express';
import type { PhotosController } from './photos.controller';

export function createPhotosRoutes(controller: PhotosController): Router {
  const router = Router();
  router.post('/photos/register', controller.register);
  router.post('/photos/remove', controller.remove);
  return router;
}

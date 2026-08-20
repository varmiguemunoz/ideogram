import type { Request, Response } from 'express';
import type { RegisterPhotosCommand } from '../application/commands/register-photos.command';
import type { RemovePhotoCommand } from '../application/commands/remove-photo.command';
import { sendOk } from '../../../shared/interface/http-result';

export class PhotosController {
  constructor(
    private readonly registerPhotos: RegisterPhotosCommand,
    private readonly removePhoto: RemovePhotoCommand,
  ) {}

  register = (req: Request, res: Response): void => {
    sendOk(res, this.registerPhotos.execute({ paths: req.body?.paths }));
  };

  remove = (req: Request, res: Response): void => {
    sendOk(res, this.removePhoto.execute({ index: req.body?.index }));
  };
}

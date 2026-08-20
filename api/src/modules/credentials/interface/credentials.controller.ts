import type { Request, Response } from 'express';
import type { SetCredentialsCommand } from '../application/commands/set-credentials.command';
import type { GetCredentialsStatusQuery } from '../application/queries/get-credentials-status.query';
import { sendOk } from '../../../shared/interface/http-result';

export class CredentialsController {
  constructor(
    private readonly setCredentials: SetCredentialsCommand,
    private readonly getStatus: GetCredentialsStatusQuery,
  ) {}

  set = (req: Request, res: Response): void => {
    this.setCredentials.execute({
      replicate: req.body?.replicate,
      blob: req.body?.blob,
    });
    sendOk(res, undefined);
  };

  status = (_req: Request, res: Response): void => {
    sendOk(res, this.getStatus.execute());
  };
}

import type { Request, Response } from 'express';
import type { SetDestinationModelCommand } from '../application/commands/set-destination-model.command';
import type { StartTrainingCommand } from '../application/commands/start-training.command';
import type { GetTrainingStateQuery } from '../application/queries/get-training-state.query';
import type { GetTrainingRequirementsQuery } from '../application/queries/get-training-requirements.query';
import { sendOk } from '../../../shared/interface/http-result';

export class TrainingController {
  constructor(
    private readonly setDestinationModel: SetDestinationModelCommand,
    private readonly startTraining: StartTrainingCommand,
    private readonly getState: GetTrainingStateQuery,
    private readonly getRequirements: GetTrainingRequirementsQuery,
  ) {}

  setModel = (req: Request, res: Response): void => {
    this.setDestinationModel.execute({ slug: req.body?.slug });
    sendOk(res, undefined);
  };

  start = async (req: Request, res: Response): Promise<void> => {
    const result = await this.startTraining.execute({
      selectionId: req.body?.selectionId,
      triggerWord: req.body?.triggerWord,
    });
    sendOk(res, result);
  };

  state = (_req: Request, res: Response): void => {
    sendOk(res, this.getState.execute());
  };

  requirements = (_req: Request, res: Response): void => {
    sendOk(res, this.getRequirements.execute());
  };
}

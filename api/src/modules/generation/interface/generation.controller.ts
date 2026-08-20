import type { Request, Response } from 'express';
import type { StartGenerationCommand } from '../application/commands/start-generation.command';
import type { ListGenerationsQuery } from '../application/queries/list-generations.query';
import type { GetCatalogQuery } from '../application/queries/get-catalog.query';
import { sendOk } from '../../../shared/interface/http-result';

export class GenerationController {
  constructor(
    private readonly startGeneration: StartGenerationCommand,
    private readonly listGenerations: ListGenerationsQuery,
    private readonly getCatalog: GetCatalogQuery,
  ) {}

  start = async (req: Request, res: Response): Promise<void> => {
    const result = await this.startGeneration.execute({
      scenario: req.body?.scenario,
      framing: req.body?.framing,
      clothing: req.body?.clothing,
    });
    sendOk(res, result);
  };

  list = (req: Request, res: Response): void => {
    sendOk(res, this.listGenerations.execute(req.query.limit));
  };

  catalog = (_req: Request, res: Response): void => {
    sendOk(res, this.getCatalog.execute());
  };
}

import type { Router } from 'express';
import type { SqliteConnection } from '../../shared/infrastructure/database/sqlite.connection';
import type { ClockPort } from '../../shared/application/ports/clock.port';
import type { SchedulerPort } from '../../shared/application/ports/scheduler.port';
import { ReplicateHttpClient } from '../../shared/infrastructure/replicate/replicate.http-client';
import type { CredentialsStorePort } from '../credentials/application/ports/credentials-store.port';
import type { TrainingModule } from '../training/training.module';

import { SqliteGenerationRepository } from './infrastructure/persistence/sqlite-generation.repository';
import { ReplicateImageGenerator } from './infrastructure/replicate-image-generator.adapter';
import { TrainingModuleTrainedModel } from './infrastructure/training-module-trained-model.adapter';

import { PromptBuilder } from './domain/prompt-builder.service';
import { StartGenerationCommand } from './application/commands/start-generation.command';
import { SyncGenerationStatusCommand } from './application/commands/sync-generation-status.command';
import { ResumeGenerationsCommand } from './application/commands/resume-generations.command';
import { ListGenerationsQuery } from './application/queries/list-generations.query';
import { GetCatalogQuery } from './application/queries/get-catalog.query';
import { GenerationPoller } from './application/generation.poller';

import { GenerationController } from './interface/generation.controller';
import { createGenerationRoutes } from './interface/generation.routes';

export interface GenerationModuleDependencies {
  connection: SqliteConnection;
  clock: ClockPort;
  scheduler: SchedulerPort;
  credentials: CredentialsStorePort;
  training: TrainingModule;
}

/** Composition root for this module. */
export class GenerationModule {
  readonly routes: Router;

  private readonly resumeGenerations: ResumeGenerationsCommand;

  constructor(deps: GenerationModuleDependencies) {
    const repository = new SqliteGenerationRepository(deps.connection);

    const generator = new ReplicateImageGenerator(
      () => new ReplicateHttpClient(deps.credentials.requireReplicateToken()),
    );
    const trainedModel = new TrainingModuleTrainedModel(deps.training.repository);

    const poller = new GenerationPoller(
      deps.scheduler,
      new SyncGenerationStatusCommand(repository, generator, deps.clock),
    );

    const startGeneration = new StartGenerationCommand(
      repository,
      generator,
      trainedModel,
      new PromptBuilder(),
      deps.clock,
      (generationId, runId) => poller.track(generationId, runId),
    );

    this.resumeGenerations = new ResumeGenerationsCommand(repository, poller, deps.clock);

    const controller = new GenerationController(
      startGeneration,
      new ListGenerationsQuery(repository),
      new GetCatalogQuery(),
    );

    this.routes = createGenerationRoutes(controller);
  }

  /** Re-enters poll loops for runs left in flight by a previous process. */
  resume(): void {
    this.resumeGenerations.execute();
  }
}

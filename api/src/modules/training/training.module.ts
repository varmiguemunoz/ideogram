import type { Router } from 'express';
import type { SqliteConnection } from '../../shared/infrastructure/database/sqlite.connection';
import type { ClockPort } from '../../shared/application/ports/clock.port';
import type { SchedulerPort } from '../../shared/application/ports/scheduler.port';
import { ReplicateHttpClient } from '../../shared/infrastructure/replicate/replicate.http-client';
import type { CredentialsStorePort } from '../credentials/application/ports/credentials-store.port';
import type { PhotosModule } from '../photos/photos.module';

import { SqliteTrainingRunRepository } from './infrastructure/persistence/sqlite-training-run.repository';
import { ReplicateTrainingProvider } from './infrastructure/replicate-training-provider.adapter';
import { AdmZipArchiveBuilder } from './infrastructure/adm-zip-archive-builder.adapter';
import { VercelBlobFileStorage } from './infrastructure/vercel-blob-file-storage.adapter';
import { PhotosModuleTrainingPhotos } from './infrastructure/photos-module-training-photos.adapter';

import { StartTrainingCommand } from './application/commands/start-training.command';
import { SetDestinationModelCommand } from './application/commands/set-destination-model.command';
import { SyncTrainingStatusCommand } from './application/commands/sync-training-status.command';
import { ResumeTrainingCommand } from './application/commands/resume-training.command';
import { GetTrainingStateQuery } from './application/queries/get-training-state.query';
import { GetTrainingRequirementsQuery } from './application/queries/get-training-requirements.query';
import { TrainingPoller } from './application/training.poller';

import { TrainingController } from './interface/training.controller';
import { createTrainingRoutes } from './interface/training.routes';
import type { TrainingRunRepositoryPort } from './application/ports/training-run.repository.port';

export interface TrainingModuleDependencies {
  connection: SqliteConnection;
  clock: ClockPort;
  scheduler: SchedulerPort;
  credentials: CredentialsStorePort;
  photos: PhotosModule;
}

/**
 * Composition root for this module.
 *
 * The Replicate client is built per call through a factory rather than once
 * at construction, because the token only arrives after Electron pushes
 * credentials, which can happen after the container is already assembled.
 */
export class TrainingModule {
  readonly routes: Router;
  readonly repository: TrainingRunRepositoryPort;

  private readonly poller: TrainingPoller;
  private readonly resumeTraining: ResumeTrainingCommand;

  constructor(deps: TrainingModuleDependencies) {
    this.repository = new SqliteTrainingRunRepository(deps.connection);

    const provider = new ReplicateTrainingProvider(
      () => new ReplicateHttpClient(deps.credentials.requireReplicateToken()),
    );
    const fileStorage = new VercelBlobFileStorage(() => deps.credentials.requireBlobToken());
    const archiveBuilder = new AdmZipArchiveBuilder();
    const trainingPhotos = new PhotosModuleTrainingPhotos(
      deps.photos.session,
      deps.photos.fileSystem,
    );

    this.poller = new TrainingPoller(
      deps.scheduler,
      new SyncTrainingStatusCommand(this.repository, provider, fileStorage, deps.clock),
    );

    const startTraining = new StartTrainingCommand(
      this.repository,
      provider,
      archiveBuilder,
      fileStorage,
      trainingPhotos,
      deps.clock,
      (predictionId) => this.poller.track(predictionId),
    );

    this.resumeTraining = new ResumeTrainingCommand(this.repository, this.poller, deps.clock);

    const controller = new TrainingController(
      new SetDestinationModelCommand(this.repository),
      startTraining,
      new GetTrainingStateQuery(this.repository),
      new GetTrainingRequirementsQuery(),
    );

    this.routes = createTrainingRoutes(controller);
  }

  /** Re-enters the poll loop for a run left in flight by a previous process. */
  resume(): void {
    this.resumeTraining.execute();
  }

  stopPolling(): void {
    this.poller.stop();
  }
}

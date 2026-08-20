import { loadConfig, type AppConfig } from './shared/infrastructure/config/env';
import { SqliteConnection } from './shared/infrastructure/database/sqlite.connection';
import { MigrationRunner } from './shared/infrastructure/database/migration.runner';
import { SystemClock } from './shared/infrastructure/clock/system.clock';
import { IntervalScheduler } from './shared/infrastructure/scheduler/interval.scheduler';

import { CredentialsModule } from './modules/credentials/credentials.module';
import { PhotosModule } from './modules/photos/photos.module';
import { TrainingModule } from './modules/training/training.module';
import { GenerationModule } from './modules/generation/generation.module';

/**
 * The only file in the api allowed to instantiate concrete classes.
 *
 * Everything above this line depends on interfaces. Everything below it is
 * wiring. Swapping any implementation, the database, the provider, the
 * scheduler, is a change here and nowhere else.
 */
export class Container {
  readonly config: AppConfig;
  readonly connection: SqliteConnection;
  readonly credentials: CredentialsModule;
  readonly photos: PhotosModule;
  readonly training: TrainingModule;
  readonly generation: GenerationModule;

  private readonly scheduler: IntervalScheduler;

  constructor() {
    this.config = loadConfig();

    this.connection = new SqliteConnection(this.config.dbPath);
    new MigrationRunner(this.connection).run();

    const clock = new SystemClock();
    this.scheduler = new IntervalScheduler();

    this.credentials = new CredentialsModule();
    this.photos = new PhotosModule(this.connection);

    this.training = new TrainingModule({
      connection: this.connection,
      clock,
      scheduler: this.scheduler,
      credentials: this.credentials.store,
      photos: this.photos,
    });

    this.generation = new GenerationModule({
      connection: this.connection,
      clock,
      scheduler: this.scheduler,
      credentials: this.credentials.store,
      training: this.training,
    });
  }

  /**
   * Restores everything a previous process left behind: the photo selection,
   * and any training or generation run still in flight.
   */
  resume(): void {
    this.photos.hydrate();
    this.training.resume();
    this.generation.resume();
  }

  shutdown(): void {
    this.scheduler.cancelAll();
    this.connection.close();
  }
}

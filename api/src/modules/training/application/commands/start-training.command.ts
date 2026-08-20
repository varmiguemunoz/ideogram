import { randomUUID } from 'node:crypto';
import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { TrainingRunRepositoryPort } from '../ports/training-run.repository.port';
import type { TrainingProviderPort } from '../ports/training-provider.port';
import type { ArchiveBuilderPort } from '../ports/archive-builder.port';
import type { FileStoragePort } from '../ports/file-storage.port';
import type { TrainingPhotosPort } from '../ports/training-photos.port';
import { TriggerWord } from '../../domain/trigger-word.vo';
import { DestinationModelNotSetError, WrongPhotoCountError } from '../../domain/training.errors';

/** The trainer needs exactly this many photos. Not a minimum, an exact count. */
export const REQUIRED_PHOTO_COUNT = 20;

export interface StartTrainingInput {
  selectionId: unknown;
  triggerWord: unknown;
}

/**
 * Orchestrates a training run: validate, archive, upload, hand off to the
 * provider, record the run and consume the photo selection.
 *
 * Every step above is a call to an injected port. This command contains no
 * SQL, no fetch, no zip library and no timer. Polling the run to completion
 * is a separate concern, see SyncTrainingStatusCommand.
 */
export class StartTrainingCommand {
  constructor(
    private readonly repository: TrainingRunRepositoryPort,
    private readonly provider: TrainingProviderPort,
    private readonly archiveBuilder: ArchiveBuilderPort,
    private readonly fileStorage: FileStoragePort,
    private readonly photos: TrainingPhotosPort,
    private readonly clock: ClockPort,
    private readonly onStarted: (predictionId: string) => void,
  ) {}

  async execute(input: StartTrainingInput): Promise<{ predictionId: string }> {
    const triggerWord = TriggerWord.create(input.triggerWord);
    this.photos.requireMatchingSelection(input.selectionId);

    const photoPaths = this.photos.readableAbsolutePaths();
    if (photoPaths.length !== REQUIRED_PHOTO_COUNT) {
      throw new WrongPhotoCountError(REQUIRED_PHOTO_COUNT, photoPaths.length);
    }

    const run = this.repository.load();
    if (!run.destinationModel) throw new DestinationModelNotSetError();

    const archive = this.archiveBuilder.zip(photoPaths);
    const uploaded = await this.fileStorage.upload(
      `training-zips/${randomUUID()}.zip`,
      archive,
      'application/zip',
    );

    const handle = await this.provider.start({
      destination: run.destinationModel,
      inputImagesZipUrl: uploaded.url,
      triggerWord: triggerWord.value,
    });

    this.repository.start({
      triggerWord: triggerWord.value,
      predictionId: handle.id,
      startedAt: this.clock.now(),
      zipUrl: uploaded.url,
    });
    this.photos.consume();

    this.onStarted(handle.id);

    return { predictionId: handle.id };
  }
}

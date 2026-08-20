import type { PhotoSelectionSession } from '../../photos/application/photo-selection.session';
import type { FileSystemPort } from '../../photos/application/ports/file-system.port';
import { SelectionMismatchError } from '../../photos/domain/photos.errors';
import { PhotoPath } from '../../photos/domain/photo-path.vo';
import type { TrainingPhotosPort } from '../application/ports/training-photos.port';

/**
 * The single seam between training and photos.
 *
 * This is the only file in the training module that knows a photos module
 * exists. Everything upstream of it depends on TrainingPhotosPort, which is
 * training's own description of what it needs.
 */
export class PhotosModuleTrainingPhotos implements TrainingPhotosPort {
  constructor(
    private readonly session: PhotoSelectionSession,
    private readonly fileSystem: FileSystemPort,
  ) {}

  requireMatchingSelection(selectionId: unknown): void {
    const selection = this.session.peek();
    if (!selection || !selection.matchesId(selectionId)) {
      throw new SelectionMismatchError();
    }
  }

  /**
   * Re-checks the file system at submit time. A path stored in an earlier
   * session may have been moved, renamed or deleted since it was picked.
   */
  readableAbsolutePaths(): string[] {
    const selection = this.session.peek();
    if (!selection) return [];

    return selection.absolutePaths.filter(
      (absolutePath) =>
        PhotoPath.hasAllowedExtension(absolutePath) && this.fileSystem.isReadableFile(absolutePath),
    );
  }

  consume(): void {
    this.session.discard();
  }
}

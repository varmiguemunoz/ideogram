import type { Router } from 'express';
import type { SqliteConnection } from '../../shared/infrastructure/database/sqlite.connection';
import { SqlitePhotoSelectionRepository } from './infrastructure/persistence/sqlite-photo-selection.repository';
import { NodeFileSystemAdapter } from './infrastructure/node-file-system.adapter';
import { PhotoSelectionSession } from './application/photo-selection.session';
import { RegisterPhotosCommand } from './application/commands/register-photos.command';
import { RemovePhotoCommand } from './application/commands/remove-photo.command';
import { PhotosController } from './interface/photos.controller';
import { createPhotosRoutes } from './interface/photos.routes';
import type { FileSystemPort } from './application/ports/file-system.port';

/**
 * Composition root for this module.
 *
 * Exposes the session and the file system adapter outwards, because the
 * training module needs to read and consume the selection when a run starts.
 * It reaches them through its own port, never by importing this module's
 * internals.
 */
export class PhotosModule {
  readonly routes: Router;
  readonly session: PhotoSelectionSession;
  readonly fileSystem: FileSystemPort;

  constructor(connection: SqliteConnection) {
    this.fileSystem = new NodeFileSystemAdapter();
    this.session = new PhotoSelectionSession(new SqlitePhotoSelectionRepository(connection));

    const controller = new PhotosController(
      new RegisterPhotosCommand(this.session),
      new RemovePhotoCommand(this.session),
    );

    this.routes = createPhotosRoutes(controller);
  }

  /** Rebuilds the selection from the database. Called once at boot. */
  hydrate(): void {
    this.session.hydrate();
  }
}

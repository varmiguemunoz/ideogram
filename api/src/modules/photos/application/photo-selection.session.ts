import { PhotoSelection } from '../domain/photo-selection.entity';
import { NoActiveSelectionError } from '../domain/photos.errors';
import type { PhotoSelectionRepositoryPort } from './ports/photo-selection.repository.port';

/**
 * Holds the one selection the current api process is working with, and keeps
 * it in step with the database on every change.
 *
 * A session object is needed because the selection id is intentionally not
 * persisted: it identifies this run of the process, so that a selection the
 * renderer submits after a restart is correctly rejected as stale. The paths
 * are persisted, the identity is not.
 */
export class PhotoSelectionSession {
  private selection: PhotoSelection | null = null;

  constructor(private readonly repository: PhotoSelectionRepositoryPort) {}

  /** Rebuilds the selection from the database at boot, under a fresh id. */
  hydrate(): void {
    const paths = this.repository.loadPaths();
    this.selection = paths.length > 0 ? PhotoSelection.restore(paths) : null;
  }

  /** Creates the selection on first use. */
  getOrCreate(): PhotoSelection {
    if (!this.selection) this.selection = PhotoSelection.empty();
    return this.selection;
  }

  require(): PhotoSelection {
    if (!this.selection) throw new NoActiveSelectionError();
    return this.selection;
  }

  peek(): PhotoSelection | null {
    return this.selection;
  }

  persist(): void {
    if (!this.selection) {
      this.repository.clear();
      return;
    }
    this.repository.save(this.selection);
  }

  /**
   * Drops the selection entirely. Called once a training run has consumed it,
   * so the next run starts from a clean slate with a new id.
   */
  discard(): void {
    this.selection = null;
    this.repository.clear();
  }
}

import { randomUUID } from 'node:crypto';
import { PhotoPath } from './photo-path.vo';
import { InvalidPhotoIndexError, NoValidPhotosError } from './photos.errors';

/**
 * The cumulative set of photos chosen for the next training run.
 *
 * This used to be two module level mutable variables in photoSelection.ts,
 * which meant the state was invisible from outside, shared silently between
 * callers and impossible to reset between tests. It is now an entity with an
 * identity and its own invariants.
 *
 * The selection id exists so the renderer can prove that the selection it is
 * submitting is the same one the api currently holds. A restart mints a new
 * id, which correctly invalidates a stale submission from the UI.
 */
export class PhotoSelection {
  private constructor(
    readonly id: string,
    private paths: PhotoPath[],
  ) {}

  static empty(): PhotoSelection {
    return new PhotoSelection(randomUUID(), []);
  }

  /** Rebuilds a selection from persisted paths under a fresh id. */
  static restore(absolutePaths: string[]): PhotoSelection {
    const paths = absolutePaths
      .map((p) => PhotoPath.tryCreate(p))
      .filter((p): p is PhotoPath => p !== null);
    return new PhotoSelection(randomUUID(), paths);
  }

  /**
   * Adds photos, ignoring anything that is not a supported image and anything
   * already present. Deduplication is by absolute path.
   */
  add(candidates: unknown[]): void {
    const incoming = candidates
      .map((c) => PhotoPath.tryCreate(c))
      .filter((p): p is PhotoPath => p !== null);

    if (incoming.length === 0) throw new NoValidPhotosError();

    for (const photo of incoming) {
      if (!this.paths.some((existing) => existing.equals(photo))) {
        this.paths.push(photo);
      }
    }
  }

  removeAt(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.paths.length) {
      throw new InvalidPhotoIndexError();
    }
    this.paths.splice(index, 1);
  }

  clear(): void {
    this.paths = [];
  }

  get count(): number {
    return this.paths.length;
  }

  get isEmpty(): boolean {
    return this.paths.length === 0;
  }

  /** Absolute paths. Stays inside the api, never sent to the renderer. */
  get absolutePaths(): string[] {
    return this.paths.map((p) => p.absolutePath);
  }

  /** What the renderer is allowed to see. */
  get fileNames(): string[] {
    return this.paths.map((p) => p.fileName);
  }

  matchesId(candidateId: unknown): boolean {
    return typeof candidateId === 'string' && candidateId === this.id;
  }
}

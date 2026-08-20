import * as path from 'node:path';

/**
 * An absolute path to a training photo on the user's machine.
 *
 * Extension checking lives here rather than in a helper function because it
 * is the rule that defines what counts as a photo. The renderer never sees
 * these paths, only the basenames.
 */
export class PhotoPath {
  private static readonly ALLOWED_EXTENSIONS = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.heic',
  ]);

  private constructor(readonly absolutePath: string) {
    Object.freeze(this);
  }

  /** Returns null instead of throwing, so a mixed batch can be filtered. */
  static tryCreate(candidate: unknown): PhotoPath | null {
    if (typeof candidate !== 'string' || candidate.length === 0) return null;
    if (!PhotoPath.hasAllowedExtension(candidate)) return null;
    return new PhotoPath(candidate);
  }

  static hasAllowedExtension(filePath: string): boolean {
    return PhotoPath.ALLOWED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
  }

  static allowedExtensions(): string[] {
    return [...PhotoPath.ALLOWED_EXTENSIONS];
  }

  get fileName(): string {
    return path.basename(this.absolutePath);
  }

  equals(other: PhotoPath): boolean {
    return other.absolutePath === this.absolutePath;
  }
}

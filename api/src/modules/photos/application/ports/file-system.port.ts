/**
 * The application's only window onto the real file system.
 *
 * Validation of a selection needs to know whether each path still points at a
 * readable file, which used to mean calling fs.statSync in the middle of
 * business logic. Behind this port, that check becomes injectable and the
 * command that uses it is testable without touching disk.
 */
export interface FileSystemPort {
  /** True when the path exists and is a regular file. */
  isReadableFile(absolutePath: string): boolean;

  readFile(absolutePath: string): Buffer;
}

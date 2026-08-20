/**
 * What training needs from the photos module, expressed as training's own
 * requirement rather than as a dependency on how photos works internally.
 *
 * The adapter that satisfies this lives in this module's infrastructure and
 * is the only file aware that a photos module exists.
 */
export interface TrainingPhotosPort {
  /** Rejects when the id does not match the selection the api currently holds. */
  requireMatchingSelection(selectionId: unknown): void;

  /** Absolute paths that still point at readable image files. */
  readableAbsolutePaths(): string[];

  /** Called once a run has started, so the next run begins from empty. */
  consume(): void;
}

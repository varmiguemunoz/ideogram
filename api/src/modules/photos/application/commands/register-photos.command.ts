import type { PhotoSelectionSession } from '../photo-selection.session';

export interface RegisterPhotosInput {
  paths: unknown;
}

export interface SelectionView {
  selectionId: string;
  fileNames: string[];
}

/**
 * Adds freshly picked photos to the selection.
 *
 * Electron owns the native file dialog, so it hands this command absolute
 * paths. The command answers with basenames only, never paths, because the
 * renderer is sandboxed and has no business seeing the user's file system.
 */
export class RegisterPhotosCommand {
  constructor(private readonly session: PhotoSelectionSession) {}

  execute(input: RegisterPhotosInput): SelectionView {
    const candidates = Array.isArray(input.paths) ? input.paths : [];

    const selection = this.session.getOrCreate();
    selection.add(candidates);
    this.session.persist();

    return { selectionId: selection.id, fileNames: selection.fileNames };
  }
}

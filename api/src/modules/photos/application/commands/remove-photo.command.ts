import type { PhotoSelectionSession } from '../photo-selection.session';
import type { SelectionView } from './register-photos.command';

export interface RemovePhotoInput {
  index: unknown;
}

export class RemovePhotoCommand {
  constructor(private readonly session: PhotoSelectionSession) {}

  execute(input: RemovePhotoInput): SelectionView {
    const selection = this.session.require();
    selection.removeAt(typeof input.index === 'number' ? input.index : Number.NaN);
    this.session.persist();

    return { selectionId: selection.id, fileNames: selection.fileNames };
  }
}

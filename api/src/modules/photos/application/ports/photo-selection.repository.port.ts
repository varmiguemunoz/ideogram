import type { PhotoSelection } from '../../domain/photo-selection.entity';

/**
 * Persists the selection so it survives an api restart.
 *
 * Only the paths are stored. The selection id is deliberately not persisted,
 * because a restart must invalidate any id the renderer is still holding.
 */
export interface PhotoSelectionRepositoryPort {
  save(selection: PhotoSelection): void;
  loadPaths(): string[];
  clear(): void;
}

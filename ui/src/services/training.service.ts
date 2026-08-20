import { http } from './http';
import { nativeService } from './native.service';
import type { AppState, PhotoSelection, Result } from '../types';

export const trainingService = {
  /** Native OS dialog. The api registers the chosen paths and answers with basenames. */
  pickPhotos: (): Promise<Result<PhotoSelection>> => nativeService.pickPhotos(),

  /**
   * Straight to the api. This used to hop through the Electron preload, which
   * added nothing, so the bridge method was removed.
   */
  removePhoto: (index: number): Promise<Result<PhotoSelection>> =>
    http.post('/api/photos/remove', { index }),

  start: (payload: { selectionId: string; triggerWord: string }): Promise<Result<{ predictionId: string }>> =>
    http.post('/api/training/start', payload),

  getState: (): Promise<Result<AppState>> => http.get('/api/state'),

  /** The photo count the api requires before it will accept a run. */
  getRequirements: (): Promise<Result<{ requiredPhotoCount: number }>> =>
    http.get('/api/training/requirements'),
};

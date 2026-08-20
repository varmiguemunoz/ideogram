import type { StateCreator } from 'zustand';
import type { AppState, TrainingStatus } from '../../types';

export interface LastAttempt {
  fileNames: string[];
  triggerWord: string;
  selectionId: string;
}

export type FeedbackType = 'idle' | 'info' | 'success' | 'error';

export interface TrainingSlice {
  // Persistent. Survives tab switches and app restarts.
  fileNames: string[];
  triggerWord: string;
  lastAttempt: LastAttempt | null;

  // Session only. The api mints a new selectionId on restart, which
  // invalidates any id still held here.
  selectionId: string | null;

  // Mirrored from GET /api/state, which is authoritative.
  trainingStatus: TrainingStatus;
  trainedVersion: string | null;
  predictionId: string | null;
  trainingStartedAt: number | null;

  feedbackMessage: string;
  feedbackType: FeedbackType;

  setSelection: (selectionId: string, fileNames: string[]) => void;
  setTriggerWord: (word: string) => void;
  setTrainingState: (appState: AppState) => void;
  saveLastAttempt: () => void;
  restoreLastAttempt: () => void;
  setFeedback: (message: string, type: FeedbackType) => void;
  clearFeedback: () => void;
}

/**
 * State only. No network calls live here.
 *
 * removePhoto used to be an action on this slice that awaited a dynamic
 * import and then made a request. A store that performs I/O cannot be reset
 * or reasoned about without a network, and it hides a request in a place
 * nobody looks for one. That request now lives in useTraining, and the store
 * is left holding nothing but state and setters.
 */
export const createTrainingSlice: StateCreator<TrainingSlice, [], [], TrainingSlice> = (set, get) => ({
  fileNames: [],
  triggerWord: '',
  lastAttempt: null,
  selectionId: null,
  trainingStatus: 'idle',
  trainedVersion: null,
  predictionId: null,
  trainingStartedAt: null,
  feedbackMessage: '',
  feedbackType: 'idle',

  setSelection: (selectionId, fileNames) => set({ selectionId, fileNames }),

  setTriggerWord: (word) => set({ triggerWord: word }),

  setTrainingState: (appState) =>
    set({
      trainingStatus: appState.trainingStatus,
      trainedVersion: appState.trainedVersion,
      predictionId: appState.trainingPredictionId,
      trainingStartedAt: appState.trainingStartedAt,
    }),

  saveLastAttempt: () => {
    const { fileNames, triggerWord, selectionId } = get();
    if (!selectionId) return;
    set({ lastAttempt: { fileNames, triggerWord, selectionId } });
  },

  restoreLastAttempt: () => {
    const { lastAttempt } = get();
    if (!lastAttempt) return;
    set({
      fileNames: lastAttempt.fileNames,
      triggerWord: lastAttempt.triggerWord,
      selectionId: lastAttempt.selectionId,
    });
  },

  setFeedback: (message, type) => set({ feedbackMessage: message, feedbackType: type }),
  clearFeedback: () => set({ feedbackMessage: '', feedbackType: 'idle' }),
});

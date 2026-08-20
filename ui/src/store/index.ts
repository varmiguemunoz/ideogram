import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTrainingSlice, type TrainingSlice } from './slices/trainingSlice';
import { createAppSlice, type AppSlice } from './slices/appSlice';

export type AppStore = TrainingSlice & AppSlice;

/**
 * Moved here from components/pages/store. A store is neither a page nor a
 * component, and living under two layers of UI folders is what forced the
 * four level relative imports it used to need.
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createTrainingSlice(...a),
      ...createAppSlice(...a),
    }),
    {
      name: 'congen-training',
      // selectionId is session only: the api invalidates it on restart.
      partialize: (state) => ({
        fileNames: state.fileNames,
        triggerWord: state.triggerWord,
        lastAttempt: state.lastAttempt,
      }),
    },
  ),
);

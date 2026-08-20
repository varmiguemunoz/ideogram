import type { StateCreator } from 'zustand';
import type { CredentialsStatus } from '../../types';

export interface AppSlice {
  canGenerate: boolean;
  credStatus: CredentialsStatus | null;
  setCanGenerate: (value: boolean) => void;
  setCredStatus: (status: CredentialsStatus | null) => void;
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (set) => ({
  canGenerate: false,
  credStatus: null,
  setCanGenerate: (value) => set({ canGenerate: value }),
  setCredStatus: (status) => set({ credStatus: status }),
});

import type { CredentialsStatus, PhotoSelection, Result } from '../types';

/**
 * The Electron bridge, wrapped so no component ever touches a global.
 *
 * The UI is a standalone Vite app that can also be opened in a plain browser,
 * where window.congenNative does not exist. Rather than crashing, each call
 * returns a Result explaining that the feature needs the desktop app, which
 * is something the UI can render.
 */
function unavailable<T>(feature: string): Result<T> {
  return {
    ok: false,
    code: 'E_UPSTREAM',
    message: `${feature} is only available in the desktop app.`,
  };
}

export const nativeService = {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && window.congenNative !== undefined;
  },

  async setCredentials(credentials: { replicate: string; blob: string }): Promise<Result<void>> {
    if (!window.congenNative) return unavailable('Saving credentials');
    return window.congenNative.setCredentials(credentials);
  },

  async credentialsStatus(): Promise<Result<CredentialsStatus>> {
    if (!window.congenNative) return unavailable('Reading credentials');
    return window.congenNative.credentialsStatus();
  },

  async pickPhotos(): Promise<Result<PhotoSelection>> {
    if (!window.congenNative) return unavailable('Choosing photos');
    return window.congenNative.pickPhotos();
  },
};

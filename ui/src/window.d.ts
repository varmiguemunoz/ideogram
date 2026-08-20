import type { CredentialsStatus, PhotoSelection, Result } from './types';

/**
 * The three capabilities that only exist inside Electron: encrypted
 * credential storage, and the native file dialog.
 *
 * removePhoto used to be here. It was a pure proxy to the api with no native
 * capability behind it, so it was removed from the preload and the UI now
 * calls POST /api/photos/remove directly.
 *
 * This is optional at run time. The UI is a standalone Vite app and can be
 * opened in a plain browser, where window.congenNative simply is not there.
 */
export interface CongenNativeBridge {
  setCredentials(c: { replicate: string; blob: string }): Promise<Result<void>>;
  credentialsStatus(): Promise<Result<CredentialsStatus>>;
  pickPhotos(): Promise<Result<PhotoSelection>>;
}

declare global {
  interface Window {
    congenNative?: CongenNativeBridge;
  }
}

export {};

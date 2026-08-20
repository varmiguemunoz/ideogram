import { dialog, ipcMain, safeStorage } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CHANNELS } from './channels';
import { credentialsFilePath } from '../config';
import { err, ok, type Result } from '../result';
import {
  credentialsStatus,
  loadCredentials,
  saveCredentials,
  type CredentialsFile,
  type SecureStorePorts,
} from '../credentials/secure-store';
import type { ApiClient } from '../api/api-client';
import type { MainWindow } from '../window/main-window';

const DIALOG_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'heic'];

export interface IpcDependencies {
  window: MainWindow;
  api: ApiClient;
}

function makeSecureStorePorts(): SecureStorePorts {
  const filePath = credentialsFilePath();

  return {
    isEncryptionAvailable: () => safeStorage.isEncryptionAvailable(),
    platform: process.platform,
    getSelectedStorageBackend:
      process.platform === 'linux' ? () => safeStorage.getSelectedStorageBackend() : undefined,
    encrypt: (plainText: string) => safeStorage.encryptString(plainText),
    decrypt: (buffer: Buffer) => safeStorage.decryptString(buffer),
    readFile: () => {
      try {
        return fs.readFileSync(filePath);
      } catch {
        return null;
      }
    },
    writeFile: (buffer: Buffer) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);
    },
  };
}

function handle<T>(channel: string, handler: (...args: never[]) => Promise<Result<T>> | Result<T>): void {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await handler(...(args as never[]));
    } catch (e) {
      return err('E_UPSTREAM', e instanceof Error ? e.message : `IPC handler ${channel} failed.`);
    }
  });
}

export function registerIpcHandlers(deps: IpcDependencies): void {
  handle<void>(CHANNELS.credentialsSet, async (payload: { replicate?: string; blob?: string }) => {
    const replicate = payload?.replicate?.trim() ?? '';
    const blob = payload?.blob?.trim() ?? '';

    if (replicate.length === 0 || blob.length === 0) {
      return err('E_INVALID_INPUT', 'Both a Replicate token and a Vercel Blob token are required.');
    }

    const credentials: CredentialsFile = { replicate, blob };

    const saved = saveCredentials(credentials, makeSecureStorePorts());
    if (!saved.ok) return saved;

    return deps.api.post<void>('/api/internal/credentials', credentials);
  });

  handle(CHANNELS.credentialsStatus, () => credentialsStatus(makeSecureStorePorts()));

  handle(CHANNELS.photosPick, async () => {
    const parent = deps.window.current;
    if (!parent) return err('E_INVALID_INPUT', 'The application window is not open.');

    const selection = await dialog.showOpenDialog(parent, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: DIALOG_IMAGE_EXTENSIONS }],
    });

    if (selection.canceled || selection.filePaths.length === 0) {
      return err('E_INVALID_INPUT', 'No photos selected.');
    }

    return deps.api.post<{ selectionId: string; fileNames: string[] }>('/api/photos/register', {
      paths: selection.filePaths,
    });
  });
}

export async function pushStoredCredentials(api: ApiClient): Promise<void> {
  const loaded = loadCredentials(makeSecureStorePorts());
  if (!loaded.ok || !loaded.value) return;

  await api.post('/api/internal/credentials', loaded.value);
}

export { ok };

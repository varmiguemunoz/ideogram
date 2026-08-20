import { contextBridge, ipcRenderer } from 'electron';
import { CHANNELS } from './ipc/channels';

const bridge = {
  setCredentials: (credentials: { replicate: string; blob: string }) =>
    ipcRenderer.invoke(CHANNELS.credentialsSet, credentials),

  credentialsStatus: () => ipcRenderer.invoke(CHANNELS.credentialsStatus),

  pickPhotos: () => ipcRenderer.invoke(CHANNELS.photosPick),
};

contextBridge.exposeInMainWorld('congenNative', bridge);

export type CongenNativeBridge = typeof bridge;

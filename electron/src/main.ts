import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';
import { loadConfig } from './config';
import { ApiClient } from './api/api-client';
import { ApiProcess } from './api/api-process';
import { MainWindow } from './window/main-window';
import { pushStoredCredentials, registerIpcHandlers } from './ipc/ipc';

// Windows installer housekeeping. Squirrel launches the app during install
// and uninstall purely to create and remove shortcuts.
if (started) {
  app.quit();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let apiProcess: ApiProcess | undefined;
let mainWindow: MainWindow | undefined;

app.whenReady().then(async () => {
  const config = loadConfig();
  const api = new ApiClient(config.apiBaseUrl);

  apiProcess = new ApiProcess(config);
  apiProcess.start();

  mainWindow = new MainWindow(config);
  mainWindow.open();

  registerIpcHandlers({ window: mainWindow, api });

  if (await api.waitUntilHealthy()) {
    await pushStoredCredentials(api);
  } else {
    console.error('[congen] the api did not become healthy in time.');
  }
});

app.on('second-instance', () => {
  const window = mainWindow?.current;
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.focus();
});

app.on('activate', () => {
  // macOS: clicking the dock icon with no windows open reopens one.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow?.open();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  apiProcess?.stop();
});

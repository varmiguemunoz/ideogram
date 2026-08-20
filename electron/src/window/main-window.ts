import { BrowserWindow, shell } from 'electron';
import * as path from 'node:path';
import type { ElectronConfig } from '../config';

export class MainWindow {
  private window: BrowserWindow | null = null;

  constructor(private readonly config: ElectronConfig) {}

  open(): BrowserWindow {
    const window = new BrowserWindow({
      width: 1000,
      height: 760,
      minWidth: 720,
      minHeight: 560,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        // Stated explicitly rather than relying on defaults. This window
        // loads a dev server url in development, so the renderer is treated
        // as untrusted in every mode.
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    this.harden(window);

    // Avoids the white flash while the renderer boots.
    window.once('ready-to-show', () => window.show());
    window.on('closed', () => {
      this.window = null;
    });

    void this.load(window);

    if (!this.config.isPackaged) {
      window.webContents.openDevTools({ mode: 'detach' });
    }

    this.window = window;
    return window;
  }

  /** The live window, or null when none is open. */
  get current(): BrowserWindow | null {
    return this.window;
  }

  get isOpen(): boolean {
    return this.window !== null && !this.window.isDestroyed();
  }

  private async load(window: BrowserWindow): Promise<void> {
    if (this.config.uiDevServerUrl) {
      await window.loadURL(this.config.uiDevServerUrl);
      return;
    }
    await window.loadFile(this.config.packagedUiEntry);
  }

  /**
   * Two rules the renderer cannot talk its way past.
   *
   * Anything that tries to open a window goes to the user's real browser
   * instead, and anything that tries to navigate the app window away from
   * where it started is refused. Without these, a stray link or an injected
   * anchor can move the window somewhere arbitrary while keeping the preload
   * bridge attached to it.
   */
  private harden(window: BrowserWindow): void {
    window.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https://')) void shell.openExternal(url);
      return { action: 'deny' };
    });

    window.webContents.on('will-navigate', (event, url) => {
      const allowedOrigin = this.config.uiDevServerUrl;

      if (!allowedOrigin) {
        // Packaged: the UI is loaded from a file, so no navigation is valid.
        event.preventDefault();
        return;
      }

      if (!url.startsWith(allowedOrigin)) {
        event.preventDefault();
      }
    });
  }
}

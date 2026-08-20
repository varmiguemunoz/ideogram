import { defineConfig } from 'vite';

/**
 * Bundles src/main.ts for the Electron main process.
 *
 * electron is external because it is provided by the runtime.
 * better-sqlite3 is external because it is a native module: it is never
 * loaded by this process, only by the api child, but marking it keeps the
 * bundler from trying to follow it if a transitive import ever appears.
 *
 * node:sqlite used to be listed here. Nothing in this workspace has ever
 * imported it, and the api stopped using it when it moved to better-sqlite3.
 */
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron', 'better-sqlite3'],
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone frontend project — this is the entire scope of the ui
// workspace. It never imports anything from electron/ or api/, it only
// talks to the api over http (see src/adapters/in/electron/congenAdapter.ts)
// and, for the two Electron-only native features, over the preload bridge.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});

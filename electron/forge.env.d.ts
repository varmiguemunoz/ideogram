/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

// MAIN_WINDOW_VITE_DEV_SERVER_URL and MAIN_WINDOW_VITE_NAME used to be
// declared here. The Forge Vite plugin only injects them when it builds a
// renderer, and this project has none: the UI is an independent Vite project.
//
// Declaring them anyway told TypeScript they existed, which is exactly what
// let a ReferenceError compile cleanly and then crash at runtime.
//
// Do not add them back. See resolveUiDevServerUrl in src/config.ts.

export {};

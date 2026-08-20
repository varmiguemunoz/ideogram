/**
 * Where the api lives.
 *
 * Resolved once, from the Vite env, with a localhost fallback so the UI can
 * be run standalone with `npm run dev` against a locally running api,
 * completely outside Electron.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4317';

/**
 * How often to re-read state from the api while something is running.
 *
 * The UI used to receive push events over Electron IPC. The api is a plain
 * http server with no push channel, so anything live is polled instead.
 * Polling only runs while a training or generation is actually in flight,
 * and stops the moment everything has settled.
 */
export const POLL_INTERVAL_MS = 3000;

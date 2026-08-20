import { useEffect, useRef } from 'react';
import { POLL_INTERVAL_MS } from '../config';

/**
 * Replaces the Electron IPC push channels the UI used to subscribe to,
 * onStateChange and onGenerationsChanged, which no longer exist now that the
 * renderer talks to a plain http api.
 *
 * Two rules keep it quiet. It only runs while `active` is true, which callers
 * set from whether anything is actually in flight, and it pauses entirely
 * while the window is hidden, so a backgrounded app is not polling for
 * nothing.
 *
 * The callback is kept in a ref so a caller does not have to memoize it to
 * avoid restarting the interval on every render.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  active: boolean,
  intervalMs: number = POLL_INTERVAL_MS,
): void {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      void savedCallback.current();
    };

    const start = () => {
      if (timer !== undefined) return;
      timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer === undefined) return;
      clearInterval(timer);
      timer = undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
        return;
      }
      // Catch up immediately on return, then resume the interval.
      void savedCallback.current();
      start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [active, intervalMs]);
}

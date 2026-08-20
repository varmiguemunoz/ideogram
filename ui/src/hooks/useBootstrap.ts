import { useCallback, useEffect } from 'react';
import { trainingService } from '../services/training.service';
import { credentialsService } from '../services/credentials.service';
import { useAppStore } from '../store';
import { usePolling } from './usePolling';

/**
 * Loads the state the whole app reads, then keeps it fresh.
 *
 * This was a 28 line effect inside App.tsx, whose other job is rendering a
 * tab bar. It also subscribed to an Electron IPC push channel that no longer
 * exists, so staying current is now polling, and only while a run is actually
 * in flight.
 */
export function useBootstrap(): void {
  const trainingStatus = useAppStore((s) => s.trainingStatus);

  const refreshState = useCallback(async () => {
    const result = await trainingService.getState();
    if (!result.ok) return;

    const store = useAppStore.getState();
    store.setTrainingState(result.value);
    store.setCanGenerate(
      result.value.trainingStatus === 'succeeded' && Boolean(result.value.trainedVersion),
    );
  }, []);

  useEffect(() => {
    void refreshState();

    void (async () => {
      const credentials = await credentialsService.status();
      if (credentials.ok) useAppStore.getState().setCredStatus(credentials.value);
    })();
  }, [refreshState]);

  const isRunning = trainingStatus === 'pending' || trainingStatus === 'processing';
  usePolling(refreshState, isRunning);
}

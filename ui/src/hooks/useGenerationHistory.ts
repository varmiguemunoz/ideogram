import { useCallback, useEffect, useState } from 'react';
import { generationService } from '../services/generation.service';
import { usePolling } from './usePolling';
import type { Generation } from '../types';

/**
 * The history list, kept current.
 *
 * It used to subscribe to an Electron push channel and carried its own
 * HISTORY_LIMIT constant that duplicated the api's default. The limit is no
 * longer sent at all, and staying live is polling, active only while at least
 * one entry is still running.
 */
export function useGenerationHistory() {
  const [history, setHistory] = useState<Generation[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const result = await generationService.list();

    if (result.ok) {
      setHistory(result.value);
      setError('');
    } else {
      setError(`Unable to load history: ${result.message}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasRunning = history.some((g) => g.status === 'pending' || g.status === 'processing');
  usePolling(refresh, hasRunning);

  return { history, error };
}

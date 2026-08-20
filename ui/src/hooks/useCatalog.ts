import { useEffect, useState } from 'react';
import { catalogService } from '../services/catalog.service';
import type { Catalog } from '../types';

const EMPTY: Catalog = { scenarios: [], framings: [], requiredPhotoCount: 0 };

/**
 * The scenario and framing lists and the required photo count, all owned by
 * the api.
 *
 * These used to be a broken import of a catalog module and a hardcoded
 * REQUIRED_PHOTOS constant sitting in a component. Both are business data,
 * so both come from the api now.
 */
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await catalogService.load();
      if (cancelled) return;

      if (result.ok) {
        setCatalog(result.value);
        setError('');
      } else {
        setError(result.message);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading, error };
}

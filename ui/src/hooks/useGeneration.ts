import { useCallback, useEffect, useState } from 'react';
import { generationService } from '../services/generation.service';
import { useCatalog } from './useCatalog';
import { useSubmit } from './useSubmit';
import type { Framing, Scenario } from '../types';

/**
 * The generation form. The scenario and framing options come from the api
 * catalog, which is where that list belongs, so the defaults are only known
 * once the catalog has loaded.
 */
export function useGeneration() {
  const { catalog } = useCatalog();
  const [scenario, setScenario] = useState<Scenario>('');
  const [framing, setFraming] = useState<Framing>('');
  const [clothing, setClothing] = useState('');
  const { submit, submitting, message, isError } = useSubmit();

  useEffect(() => {
    if (!scenario && catalog.scenarios.length > 0) setScenario(catalog.scenarios[0].id);
    if (!framing && catalog.framings.length > 0) setFraming(catalog.framings[0].id);
  }, [catalog, scenario, framing]);

  const generate = useCallback(async () => {
    await submit(() => generationService.start({ scenario, framing, clothing }), {
      pending: 'Starting generation…',
      success: 'Generation started.',
    });
  }, [submit, scenario, framing, clothing]);

  return {
    // Named to match what the JSX already binds to, so the markup did not
    // have to change when this stopped being a static import.
    scenarioCatalog: catalog.scenarios,
    framingCatalog: catalog.framings,
    scenario,
    setScenario,
    framing,
    setFraming,
    clothing,
    setClothing,
    generate,
    submitting,
    message,
    isError,
  };
}

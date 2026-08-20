import React, { JSX } from 'react';
import CatalogSelect from '../atoms/CatalogSelect';
import Textarea from '../atoms/Textarea';
import Button from '../atoms/Button';
import StatusMessage from '../molecules/StatusMessage';
import { useGeneration } from '../../hooks/useGeneration';

interface GenerationFormProps {
  canGenerate: boolean;
}

/**
 * Generation form. Scenario and framing options come from the api catalog,
 * so the UI holds no copy of that list. GenerationHistory picks up the new
 * entry on its own.
 */
export default function GenerationForm({ canGenerate }: GenerationFormProps): JSX.Element {
  const {
    scenarioCatalog,
    framingCatalog,
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
  } = useGeneration();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void generate();
  }

  const disabled = !canGenerate || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CatalogSelect
        label="Scenario"
        value={scenario}
        options={scenarioCatalog}
        onChange={setScenario}
        disabled={disabled}
      />

      <CatalogSelect
        label="Framing"
        value={framing}
        options={framingCatalog}
        onChange={setFraming}
        disabled={disabled}
      />

      <Textarea
        label="Clothing description"
        value={clothing}
        onChange={(e) => setClothing(e.target.value)}
        rows={3}
        placeholder="e.g. a red hoodie and jeans"
        disabled={disabled}
      />

      <Button type="submit" disabled={disabled}>
        {submitting ? 'Starting…' : 'Generate'}
      </Button>

      <StatusMessage message={message} isError={isError} />
    </form>
  );
}

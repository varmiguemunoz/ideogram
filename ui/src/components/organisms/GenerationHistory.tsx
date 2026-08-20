import { JSX } from 'react';
import PageTitle from '../atoms/PageTitle';
import GenerationCard from '../molecules/GenerationCard';
import StatusMessage from '../molecules/StatusMessage';
import { useGenerationHistory } from '../../hooks/useGenerationHistory';

/**
 * Loads and displays the generation history. Stays current by polling the
 * api while at least one entry is still running.
 */
export default function GenerationHistory(): JSX.Element {
  const { history, error } = useGenerationHistory();

  return (
    <section>
      <PageTitle>History</PageTitle>
      {error && <StatusMessage message={error} isError />}
      {!error && history.length === 0 ? (
        <p className="text-sm text-slate-500">No generations yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {history.map((g) => (
            <GenerationCard key={g.id} generation={g} />
          ))}
        </ul>
      )}
    </section>
  );
}

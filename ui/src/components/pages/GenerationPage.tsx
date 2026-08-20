import { JSX } from 'react';
import PageTitle from '../atoms/PageTitle';
import StatusMessage from '../molecules/StatusMessage';
import GenerationForm from '../organisms/GenerationForm';
import GenerationHistory from '../organisms/GenerationHistory';
import { useAppStore } from '../../store';

/**
 * Generation page — thin coordination shell.
 *
 * GenerationHistory stays live on its own via the generation:changed push.
 * canGenerate comes from the shared store (populated once in App.tsx).
 */
export default function GenerationPage(): JSX.Element {
  const canGenerate = useAppStore((s) => s.canGenerate);

  return (
    <div className="space-y-8">
      <section>
        <PageTitle>Generate</PageTitle>

        {!canGenerate && (
          <StatusMessage
            message="Training must complete successfully before you can generate images."
          />
        )}

        <div className="mt-3">
          <GenerationForm canGenerate={canGenerate} />
        </div>
      </section>

      <hr className="border-slate-200" />

      <GenerationHistory />
    </div>
  );
}

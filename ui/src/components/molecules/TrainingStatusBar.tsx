import { JSX } from 'react';
import type { TrainingStatus } from '../../types';
import StatusBadge from '../atoms/StatusBadge';

interface TrainingStatusBarProps {
  status: TrainingStatus;
  trainedVersion: string | null;
}

function resolveVariant(status: TrainingStatus) {
  switch (status) {
    case 'idle':
      return 'neutral' as const;
    case 'pending':
    case 'processing':
      return 'pending' as const;
    case 'succeeded':
      return 'ok' as const;
    case 'failed':
      return 'error' as const;
  }
}

function resolveLabel(status: TrainingStatus, trainedVersion: string | null): string {
  switch (status) {
    case 'idle':
      return 'No training started yet.';
    case 'pending':
      return 'Training queued…';
    case 'processing':
      return 'Training in progress…';
    case 'succeeded':
      return `Training complete — version ${trainedVersion ?? 'unknown'}.`;
    case 'failed':
      return 'Training failed. You can start a new run.';
  }
}

export default function TrainingStatusBar({
  status,
  trainedVersion,
}: TrainingStatusBarProps): JSX.Element {
  return (
    <div className="space-y-1.5">
      <StatusBadge
        status={resolveVariant(status)}
        label={resolveLabel(status, trainedVersion)}
      />
      {(status === 'pending' || status === 'processing') && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-amber-400" />
        </div>
      )}
    </div>
  );
}

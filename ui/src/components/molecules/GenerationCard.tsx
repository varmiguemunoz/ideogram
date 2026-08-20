import { JSX } from 'react';
import type { Generation } from '../../types';
import StatusBadge from '../atoms/StatusBadge';

interface GenerationCardProps {
  generation: Generation;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function statusVariant(status: Generation['status']) {
  switch (status) {
    case 'succeeded':
      return 'ok' as const;
    case 'failed':
      return 'error' as const;
    default:
      return 'pending' as const;
  }
}

/**
 * Single row in the generation history list.
 * Shows thumbnail (if available), scenario/framing label, date, and status.
 */
export default function GenerationCard({ generation: g }: GenerationCardProps): JSX.Element {
  return (
    <li className="flex gap-4 items-start py-3 border-b border-slate-100 last:border-0">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
        {g.status === 'succeeded' && g.outputUrl ? (
          <img
            src={g.outputUrl}
            alt={`Generated: ${g.scenario} / ${g.framing}`}
            className="w-full h-full object-cover"
          />
        ) : g.status === 'failed' ? (
          <span className="text-xl text-red-400" aria-label="Failed">
            ✕
          </span>
        ) : (
          <span className="text-xl text-slate-300 animate-pulse" aria-label="Processing">
            ⏳
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 capitalize">
          {g.scenario} · {g.framing.replace('_', ' ')}
        </p>
        {g.clothingDescription && (
          <p className="text-xs text-slate-500 truncate">{g.clothingDescription}</p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(g.createdAt)}</p>
        <div className="mt-1">
          <StatusBadge status={statusVariant(g.status)} label={g.status} />
        </div>
        {g.error && (
          <p className="text-xs text-red-500 mt-0.5 truncate">{g.error}</p>
        )}
      </div>
    </li>
  );
}

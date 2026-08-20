import { JSX } from 'react';

type StatusVariant = 'ok' | 'missing' | 'pending' | 'error' | 'neutral';

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  className?: string;
}

const DOT_CLASSES: Record<StatusVariant, string> = {
  ok: 'bg-emerald-500',
  missing: 'bg-red-500',
  pending: 'bg-amber-400',
  error: 'bg-red-500',
  neutral: 'bg-slate-400',
};

const TEXT_CLASSES: Record<StatusVariant, string> = {
  ok: 'text-emerald-700',
  missing: 'text-red-600',
  pending: 'text-amber-700',
  error: 'text-red-600',
  neutral: 'text-slate-500',
};

export default function StatusBadge({
  status,
  label,
  className = '',
}: StatusBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${TEXT_CLASSES[status]} ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${DOT_CLASSES[status]}`}
      />
      {label}
    </span>
  );
}

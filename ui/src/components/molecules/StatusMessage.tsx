import { JSX } from 'react';

interface StatusMessageProps {
  message: string;
  /** When true the text renders in red — used for error feedback. */
  isError?: boolean;
}

/**
 * Single-line feedback slot. Always occupies space (min-height) so the
 * layout does not shift when a message appears or disappears.
 */
export default function StatusMessage({ message, isError = false }: StatusMessageProps): JSX.Element {
  return (
    <p
      className={`min-h-[1.25rem] text-sm ${
        isError ? 'text-red-600' : 'text-slate-600'
      }`}
      aria-live="polite"
    >
      {message}
    </p>
  );
}

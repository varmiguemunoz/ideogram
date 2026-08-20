import { JSX } from 'react';
import StatusBadge from '../atoms/StatusBadge';

interface CredentialStatusLineProps {
  replicate: boolean;
  blob: boolean;
}

/**
 * Shows the set / not-set state of both API credentials side by side.
 */
export default function CredentialStatusLine({
  replicate,
  blob,
}: CredentialStatusLineProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-4">
      <StatusBadge
        status={replicate ? 'ok' : 'missing'}
        label={`Replicate: ${replicate ? 'set' : 'not set'}`}
      />
      <StatusBadge
        status={blob ? 'ok' : 'missing'}
        label={`Blob: ${blob ? 'set' : 'not set'}`}
      />
    </div>
  );
}

import React, { JSX } from 'react';
import PageTitle from '../atoms/PageTitle';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import CredentialStatusLine from '../molecules/CredentialStatusLine';
import StatusMessage from '../molecules/StatusMessage';
import { useCredentials } from '../../hooks/useCredentials';

/**
 * API credentials section: shows current set/not-set status, lets the user
 * enter and save a Replicate token and a Vercel Blob token.
 */
export default function CredentialsForm(): JSX.Element {
  const { credStatus, replicate, setReplicate, blob, setBlob, save, submitting, message, isError } =
    useCredentials();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    void save();
  }

  return (
    <section className="space-y-4">
      <PageTitle>Credentials</PageTitle>

      {credStatus && (
        <CredentialStatusLine replicate={credStatus.replicate} blob={credStatus.blob} />
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Replicate API token"
          type="password"
          value={replicate}
          onChange={(e) => setReplicate(e.target.value)}
          placeholder="r8_..."
          autoComplete="off"
          disabled={submitting}
        />

        <Input
          label="Vercel Blob read-write token"
          type="password"
          value={blob}
          onChange={(e) => setBlob(e.target.value)}
          placeholder="vercel_blob_rw_..."
          autoComplete="off"
          disabled={submitting}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save credentials'}
        </Button>
      </form>

      <StatusMessage message={message} isError={isError} />
    </section>
  );
}

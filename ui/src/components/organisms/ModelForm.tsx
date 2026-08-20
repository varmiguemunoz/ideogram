import React, { JSX } from 'react';
import PageTitle from '../atoms/PageTitle';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import StatusMessage from '../molecules/StatusMessage';
import { useDestinationModel } from '../../hooks/useDestinationModel';

/**
 * Destination model section: lets the user enter and save the
 * Replicate model slug (owner/name) that training will write to.
 */
export default function ModelForm(): JSX.Element {
  const { slug, setSlug, save, submitting, message, isError } = useDestinationModel();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    void save();
  }

  return (
    <section className="space-y-4">
      <PageTitle>Destination model</PageTitle>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Model slug (owner/name)"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="me/my-lora-model"
          disabled={submitting}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save model'}
        </Button>
      </form>

      <StatusMessage message={message} isError={isError} />
    </section>
  );
}

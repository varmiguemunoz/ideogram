import React, { JSX } from 'react';
import PageTitle from '../atoms/PageTitle';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Banner from '../atoms/Banner';
import FileList from '../molecules/FileList';
import StatusMessage from '../molecules/StatusMessage';
import TrainingStatusBar from '../molecules/TrainingStatusBar';
import { useTraining } from '../../hooks/useTraining';

/**
 * Full training section: pick photos, set trigger word, start training,
 * and display live training status.
 */
export default function TrainingForm(): JSX.Element {
  const {
    fileNames,
    triggerWord,
    setTriggerWord,
    trainingStatus,
    trainedVersion,
    lastAttempt,
    feedbackMessage,
    feedbackType,
    canStart,
    photosMessage,
    submitting,
    removingIndex,
    pickPhotos,
    removePhoto,
    startTraining,
    retry,
  } = useTraining();

  function handlePick() {
    void pickPhotos();
  }

  function handleRemove(index: number) {
    void removePhoto(index);
  }

  function handleStart(e?: React.FormEvent) {
    e?.preventDefault();
    void startTraining();
  }

  function handleRetry() {
    retry();
  }

  const trigger = triggerWord;

  return (
    <section className="space-y-5">
      <PageTitle>Training photos</PageTitle>

      {/* Photo picker */}
      <div className="space-y-2">
        <Button variant="secondary" type="button" onClick={handlePick}>
          Choose photos…
        </Button>
        <FileList fileNames={fileNames} onRemove={handleRemove} removingIndex={removingIndex} />
        <p className={`text-sm ${canStart ? 'text-emerald-600' : 'text-amber-600'}`}>{photosMessage}</p>
      </div>

      {/* Trigger word + submit */}
      <form onSubmit={handleStart} className="space-y-4">
        <Input
          label="Trigger word"
          type="text"
          value={trigger}
          onChange={(e) => setTriggerWord(e.target.value)}
          placeholder="sks_person"
          disabled={submitting}
        />
        <Button type="submit" disabled={submitting || !canStart}>
          {submitting ? 'Starting…' : 'Start training'}
        </Button>
      </form>

      <StatusMessage message={feedbackMessage} isError={feedbackType === 'error'} />

      {trainingStatus === 'succeeded' && (
        <Banner variant="success" message={`Training complete — version ${trainedVersion}.`} />
      )}

      {trainingStatus === 'failed' && (
        <div className="space-y-2">
          <Banner variant="error" message="Training failed." />
          <Button variant="secondary" type="button" onClick={handleRetry} disabled={!lastAttempt}>
            Retry
          </Button>
        </div>
      )}

      <TrainingStatusBar status={trainingStatus} trainedVersion={trainedVersion} />
    </section>
  );
}

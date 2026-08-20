import { useCallback, useState } from 'react';
import { trainingService } from '../services/training.service';
import { useAppStore } from '../store';
import { useCatalog } from './useCatalog';

/**
 * The whole training screen's behaviour.
 *
 * This absorbs roughly 70 of TrainingForm's 142 lines: the four handlers, the
 * two pending flags, and the derived values.
 *
 * Two business rules left the UI on the way in. The required photo count now
 * comes from the api instead of a local REQUIRED_PHOTOS constant, and the
 * pre-submit re-validation of that count is gone, because the api decides and
 * its message is what the user sees.
 */
export function useTraining() {
  const fileNames = useAppStore((s) => s.fileNames);
  const selectionId = useAppStore((s) => s.selectionId);
  const triggerWord = useAppStore((s) => s.triggerWord);
  const trainingStatus = useAppStore((s) => s.trainingStatus);
  const trainedVersion = useAppStore((s) => s.trainedVersion);
  const lastAttempt = useAppStore((s) => s.lastAttempt);
  const feedbackMessage = useAppStore((s) => s.feedbackMessage);
  const feedbackType = useAppStore((s) => s.feedbackType);

  const setSelection = useAppStore((s) => s.setSelection);
  const setTriggerWord = useAppStore((s) => s.setTriggerWord);
  const saveLastAttempt = useAppStore((s) => s.saveLastAttempt);
  const restoreLastAttempt = useAppStore((s) => s.restoreLastAttempt);
  const setFeedback = useAppStore((s) => s.setFeedback);

  const { catalog } = useCatalog();
  const requiredPhotos = catalog.requiredPhotoCount;

  const [submitting, setSubmitting] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  // A local gate so the user is not sent on a round trip to discover they
  // have nineteen photos. The number driving it comes from the api.
  const canStart = requiredPhotos > 0 && fileNames.length === requiredPhotos;

  const photosMessage =
    requiredPhotos === 0
      ? ''
      : fileNames.length < requiredPhotos
        ? `Faltan ${requiredPhotos - fileNames.length} fotos (mínimo ${requiredPhotos})`
        : fileNames.length > requiredPhotos
          ? `Máximo ${requiredPhotos} fotos permitidas (tenés ${fileNames.length})`
          : `${requiredPhotos} fotos — listo para entrenar`;

  const pickPhotos = useCallback(async () => {
    const result = await trainingService.pickPhotos();

    if (!result.ok) {
      setFeedback(result.message, 'error');
      return;
    }

    setSelection(result.value.selectionId, result.value.fileNames);
    setFeedback(`${result.value.fileNames.length} foto(s) seleccionada(s).`, 'info');
  }, [setSelection, setFeedback]);

  /**
   * Straight to the api. This used to be an action on the zustand store that
   * made its own network call.
   */
  const removePhoto = useCallback(
    async (index: number) => {
      setRemovingIndex(index);
      const result = await trainingService.removePhoto(index);
      setRemovingIndex(null);

      if (result.ok) {
        setSelection(result.value.selectionId, result.value.fileNames);
      } else {
        setFeedback(result.message, 'error');
      }
    },
    [setSelection, setFeedback],
  );

  const startTraining = useCallback(async () => {
    if (!selectionId) {
      setFeedback('Choose photos before starting training.', 'error');
      return;
    }

    setSubmitting(true);
    setFeedback('Starting training…', 'info');
    saveLastAttempt();

    const result = await trainingService.start({ selectionId, triggerWord });

    setSubmitting(false);

    if (result.ok) {
      setFeedback(`Training started (prediction ${result.value.predictionId}).`, 'success');
    } else {
      setFeedback(result.message, 'error');
    }
  }, [selectionId, triggerWord, saveLastAttempt, setFeedback]);

  const retry = useCallback(() => {
    restoreLastAttempt();
    void startTraining();
  }, [restoreLastAttempt, startTraining]);

  return {
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
  };
}

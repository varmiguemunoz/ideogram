import { useCallback, useEffect, useState } from 'react';
import { credentialsService } from '../services/credentials.service';
import { useAppStore } from '../store';
import { useSubmit } from './useSubmit';

/**
 * Everything the credentials form does. The component keeps only its markup.
 */
export function useCredentials() {
  const credStatus = useAppStore((s) => s.credStatus);
  const setCredStatus = useAppStore((s) => s.setCredStatus);

  const [replicate, setReplicate] = useState('');
  const [blob, setBlob] = useState('');
  const { submit, submitting, message, isError } = useSubmit();

  const refreshStatus = useCallback(async () => {
    const result = await credentialsService.status();
    if (result.ok) setCredStatus(result.value);
  }, [setCredStatus]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const save = useCallback(async () => {
    const result = await submit(() => credentialsService.save({ replicate, blob }), {
      pending: 'Saving…',
      success: 'Credentials saved.',
    });

    if (result.ok) {
      setReplicate('');
      setBlob('');
      await refreshStatus();
    }
  }, [submit, replicate, blob, refreshStatus]);

  return {
    credStatus,
    replicate,
    setReplicate,
    blob,
    setBlob,
    save,
    submitting,
    message,
    isError,
  };
}

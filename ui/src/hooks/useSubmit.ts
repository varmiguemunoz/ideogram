import { useCallback, useState } from 'react';
import type { Result } from '../types';

export interface SubmitMessages {
  pending: string;
  success: string;
}

export interface UseSubmit {
  submit: <T>(action: () => Promise<Result<T>>, messages: SubmitMessages) => Promise<Result<T>>;
  submitting: boolean;
  message: string;
  isError: boolean;
  setMessage: (message: string, isError?: boolean) => void;
  clear: () => void;
}

/**
 * The async submit pattern that was written out by hand in four separate
 * components: raise a pending flag, show a pending message, clear the error
 * flag, await, lower the flag, then branch on result.ok to show either a
 * success line or the failure message.
 *
 * Each of those four blocks was seven lines and they only differed in the
 * two strings. They are now one call.
 *
 * The Result is handed back as well, so a caller that needs the value, for
 * example the prediction id after starting a training run, can still read it.
 */
export function useSubmit(): UseSubmit {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessageState] = useState('');
  const [isError, setIsError] = useState(false);

  const submit = useCallback(
    async <T,>(action: () => Promise<Result<T>>, messages: SubmitMessages): Promise<Result<T>> => {
      setSubmitting(true);
      setIsError(false);
      setMessageState(messages.pending);

      const result = await action();

      setSubmitting(false);

      if (result.ok) {
        setMessageState(messages.success);
        setIsError(false);
      } else {
        setMessageState(result.message);
        setIsError(true);
      }

      return result;
    },
    [],
  );

  const setMessage = useCallback((next: string, nextIsError = false) => {
    setMessageState(next);
    setIsError(nextIsError);
  }, []);

  const clear = useCallback(() => {
    setMessageState('');
    setIsError(false);
  }, []);

  return { submit, submitting, message, isError, setMessage, clear };
}

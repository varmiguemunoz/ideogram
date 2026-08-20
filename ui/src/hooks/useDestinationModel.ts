import { useCallback, useState } from 'react';
import { credentialsService } from '../services/credentials.service';
import { useSubmit } from './useSubmit';

/**
 * The destination model form. The slug format rule is not repeated here:
 * the api validates it and its message is what gets displayed.
 */
export function useDestinationModel() {
  const [slug, setSlug] = useState('');
  const { submit, submitting, message, isError } = useSubmit();

  const save = useCallback(async () => {
    await submit(() => credentialsService.setDestinationModel(slug), {
      pending: 'Saving…',
      success: 'Destination model saved.',
    });
  }, [submit, slug]);

  return { slug, setSlug, save, submitting, message, isError };
}

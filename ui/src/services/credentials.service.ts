import { http } from './http';
import { nativeService } from './native.service';
import type { CredentialsStatus, Result } from '../types';

/**
 * Credentials are split across two transports on purpose.
 *
 * The tokens themselves go through Electron, because encrypting them at rest
 * needs safeStorage, which only exists in the main process. The destination
 * model is ordinary api state and goes straight over http.
 */
export const credentialsService = {
  save: (credentials: { replicate: string; blob: string }): Promise<Result<void>> =>
    nativeService.setCredentials(credentials),

  status: (): Promise<Result<CredentialsStatus>> => nativeService.credentialsStatus(),

  setDestinationModel: (slug: string): Promise<Result<void>> => http.post('/api/model', { slug }),
};

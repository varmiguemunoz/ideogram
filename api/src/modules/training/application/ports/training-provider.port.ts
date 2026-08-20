/**
 * The capability of training a model somewhere else.
 *
 * Named for the role, not for Replicate, which is the whole point: swapping
 * provider means writing one new adapter and changing one line in the module
 * composition root, with nothing inside the application layer touched.
 */
export type ProviderRunStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface StartRemoteTrainingInput {
  destination: string;
  inputImagesZipUrl: string;
  triggerWord: string;
}

export interface RemoteTrainingHandle {
  id: string;
  status: ProviderRunStatus;
}

export interface RemoteTrainingState {
  status: ProviderRunStatus;
  /** The published model version, present only once the run has succeeded. */
  trainedVersion: string | null;
  error: string | null;
  /** True when the provider no longer recognizes this run. */
  notFound: boolean;
}

export interface TrainingProviderPort {
  start(input: StartRemoteTrainingInput): Promise<RemoteTrainingHandle>;
  getState(runId: string): Promise<RemoteTrainingState>;
}

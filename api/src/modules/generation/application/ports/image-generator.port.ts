/**
 * The capability of turning a prompt into an image somewhere else.
 *
 * Deliberately named for the role rather than for Replicate, so the provider
 * can be replaced without the application layer noticing.
 */
export type ProviderRunStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface StartImageGenerationInput {
  modelVersion: string;
  prompt: string;
}

export interface ImageGenerationHandle {
  id: string;
  status: ProviderRunStatus;
}

export interface ImageGenerationState {
  status: ProviderRunStatus;
  outputUrl: string | null;
  error: string | null;
  notFound: boolean;
}

export interface ImageGeneratorPort {
  start(input: StartImageGenerationInput): Promise<ImageGenerationHandle>;
  getState(runId: string): Promise<ImageGenerationState>;
}

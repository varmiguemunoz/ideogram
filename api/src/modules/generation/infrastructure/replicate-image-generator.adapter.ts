import {
  mapReplicateStatus,
  type ReplicateHttpClient,
  type ReplicateRawStatus,
} from '../../../shared/infrastructure/replicate/replicate.http-client';
import { UpstreamError } from '../../../shared/domain/domain.error';
import type {
  ImageGenerationHandle,
  ImageGenerationState,
  ImageGeneratorPort,
  StartImageGenerationInput,
} from '../application/ports/image-generator.port';

interface PredictionResponse {
  id: string;
  status: ReplicateRawStatus;
  output: string[] | string | null;
  error: string | null;
}

export class ReplicateImageGenerator implements ImageGeneratorPort {
  /**
   * Fixed 1:1. Every generated image is destined for Instagram or Twitter,
   * which both crop to square regardless of what is sent. Product decision,
   * not a technical constraint.
   */
  private static readonly ASPECT_RATIO = '1:1';

  constructor(private readonly clientFactory: () => ReplicateHttpClient) {}

  async start(input: StartImageGenerationInput): Promise<ImageGenerationHandle> {
    const response = await this.clientFactory().post<PredictionResponse>('/predictions', {
      version: input.modelVersion,
      input: {
        prompt: input.prompt,
        aspect_ratio: ReplicateImageGenerator.ASPECT_RATIO,
        disable_safety_checker: true,
      },
    });

    if (!response.body) throw new UpstreamError('Replicate did not return a prediction.');

    return {
      id: response.body.id,
      status: mapReplicateStatus(response.body.status),
    };
  }

  async getState(runId: string): Promise<ImageGenerationState> {
    const response = await this.clientFactory().get<PredictionResponse>(`/predictions/${runId}`);

    if (response.notFound || !response.body) {
      return { status: 'failed', outputUrl: null, error: null, notFound: true };
    }

    return {
      status: mapReplicateStatus(response.body.status),
      outputUrl: ReplicateImageGenerator.firstUrl(response.body.output),
      error: response.body.error,
      notFound: false,
    };
  }

  /** Replicate returns either a single url or an array of them. */
  private static firstUrl(output: string[] | string | null): string | null {
    if (Array.isArray(output)) return output[0] ?? null;
    return output ?? null;
  }
}

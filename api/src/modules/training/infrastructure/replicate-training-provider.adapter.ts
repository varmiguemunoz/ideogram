import {
  mapReplicateStatus,
  type ReplicateHttpClient,
  type ReplicateRawStatus,
} from '../../../shared/infrastructure/replicate/replicate.http-client';
import { UpstreamError } from '../../../shared/domain/domain.error';
import type {
  RemoteTrainingHandle,
  RemoteTrainingState,
  StartRemoteTrainingInput,
  TrainingProviderPort,
} from '../application/ports/training-provider.port';

interface TrainingResponse {
  id: string;
  status: ReplicateRawStatus;
  output: { version?: string } | null;
  error: string | null;
}

interface ModelResponse {
  latest_version?: { id: string };
}

/**
 * Speaks Replicate on behalf of the training module.
 *
 * The trainer is pinned by owner and name rather than by a hardcoded version,
 * and the latest version is resolved at run time, so a trainer update is
 * picked up without a code change.
 *
 * The input field names input_images and trigger_word follow Replicate's
 * documented training API for ostris/flux-dev-lora-trainer.
 */
export class ReplicateTrainingProvider implements TrainingProviderPort {
  private static readonly TRAINER_OWNER = 'ostris';
  private static readonly TRAINER_NAME = 'flux-dev-lora-trainer';

  constructor(private readonly clientFactory: () => ReplicateHttpClient) {}

  async start(input: StartRemoteTrainingInput): Promise<RemoteTrainingHandle> {
    const client = this.clientFactory();
    const owner = ReplicateTrainingProvider.TRAINER_OWNER;
    const name = ReplicateTrainingProvider.TRAINER_NAME;

    const trainerVersion = await this.latestTrainerVersion(client, owner, name);

    const response = await client.post<TrainingResponse>(
      `/models/${owner}/${name}/versions/${trainerVersion}/trainings`,
      {
        destination: input.destination,
        input: {
          input_images: input.inputImagesZipUrl,
          trigger_word: input.triggerWord,
        },
      },
    );

    if (!response.body) throw new UpstreamError('Replicate did not return a training run.');

    return {
      id: response.body.id,
      status: mapReplicateStatus(response.body.status),
    };
  }

  async getState(runId: string): Promise<RemoteTrainingState> {
    const response = await this.clientFactory().get<TrainingResponse>(`/trainings/${runId}`);

    if (response.notFound || !response.body) {
      return { status: 'failed', trainedVersion: null, error: null, notFound: true };
    }

    return {
      status: mapReplicateStatus(response.body.status),
      trainedVersion: response.body.output?.version ?? null,
      error: response.body.error,
      notFound: false,
    };
  }

  private async latestTrainerVersion(
    client: ReplicateHttpClient,
    owner: string,
    name: string,
  ): Promise<string> {
    const response = await client.get<ModelResponse>(`/models/${owner}/${name}`);
    const version = response.body?.latest_version?.id;
    if (!version) {
      throw new UpstreamError(`Replicate model ${owner}/${name} has no latest_version.`);
    }
    return version;
  }
}

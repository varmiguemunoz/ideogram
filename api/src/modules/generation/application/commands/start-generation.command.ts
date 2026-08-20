import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import type { GenerationRepositoryPort } from '../ports/generation.repository.port';
import type { ImageGeneratorPort } from '../ports/image-generator.port';
import type { TrainedModelProviderPort } from '../ports/trained-model.provider.port';
import { PromptBuilder } from '../../domain/prompt-builder.service';
import { ClothingDescription } from '../../domain/clothing-description.vo';
import { isScenario } from '../../domain/scenario.vo';
import { isFraming } from '../../domain/framing.vo';
import { InvalidScenarioOrFramingError, ModelNotTrainedError } from '../../domain/generation.errors';

export interface StartGenerationInput {
  scenario: unknown;
  framing: unknown;
  clothing: unknown;
}

/**
 * Builds the prompt, records the request, and hands it to the provider.
 *
 * The record is created before the provider call on purpose. If the provider
 * rejects the request, the failure is written against a row the renderer can
 * already see, rather than disappearing.
 */
export class StartGenerationCommand {
  constructor(
    private readonly repository: GenerationRepositoryPort,
    private readonly generator: ImageGeneratorPort,
    private readonly trainedModel: TrainedModelProviderPort,
    private readonly promptBuilder: PromptBuilder,
    private readonly clock: ClockPort,
    private readonly onStarted: (generationId: number, runId: string, startedAt: number) => void,
  ) {}

  async execute(input: StartGenerationInput): Promise<{ id: number }> {
    if (!isScenario(input.scenario) || !isFraming(input.framing)) {
      throw new InvalidScenarioOrFramingError();
    }

    const model = this.trainedModel.getTrainedModel();
    if (!model) throw new ModelNotTrainedError();

    const clothing = ClothingDescription.create(input.clothing);
    const prompt = this.promptBuilder.build({
      triggerWord: model.triggerWord,
      scenario: input.scenario,
      framing: input.framing,
      clothing,
    });

    const now = this.clock.now();
    const generation = this.repository.create({
      scenario: input.scenario,
      framing: input.framing,
      clothingDescription: clothing.value,
      prompt,
      now,
    });

    let handle;
    try {
      handle = await this.generator.start({ modelVersion: model.version, prompt });
    } catch (e) {
      this.repository.update(generation.id, {
        status: 'failed',
        error: e instanceof Error ? e.message : 'Generation could not be started.',
        now: this.clock.now(),
      });
      throw e;
    }

    this.repository.update(generation.id, {
      status: 'processing',
      predictionId: handle.id,
      now: this.clock.now(),
    });

    this.onStarted(generation.id, handle.id, now);

    return { id: generation.id };
  }
}

import { REQUIRED_PHOTO_COUNT } from '../commands/start-training.command';

export interface TrainingRequirements {
  requiredPhotoCount: number;
}

/**
 * Publishes the photo count a run requires, so the UI can gate its own submit
 * button without holding a second copy of the number.
 *
 * The value is read from the same constant StartTrainingCommand enforces, so
 * the two can never disagree. This is exposure, not a new rule.
 */
export class GetTrainingRequirementsQuery {
  execute(): TrainingRequirements {
    return { requiredPhotoCount: REQUIRED_PHOTO_COUNT };
  }
}

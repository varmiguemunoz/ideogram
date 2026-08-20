/**
 * What generation needs from training, expressed as generation's own
 * requirement.
 *
 * Generation cannot start without a finished model, but it must not know how
 * training stores anything. The adapter that satisfies this port is the only
 * file in this module aware that a training module exists.
 */
export interface TrainedModel {
  version: string;
  triggerWord: string;
}

export interface TrainedModelProviderPort {
  /** Null while no training run has completed successfully. */
  getTrainedModel(): TrainedModel | null;
}

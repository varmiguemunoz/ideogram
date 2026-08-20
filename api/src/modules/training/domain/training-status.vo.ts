export const TRAINING_STATUSES = ['idle', 'pending', 'processing', 'succeeded', 'failed'] as const;

export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export function isTrainingStatus(value: unknown): value is TrainingStatus {
  return typeof value === 'string' && (TRAINING_STATUSES as readonly string[]).includes(value);
}

export function isTerminal(status: TrainingStatus): boolean {
  return status === 'succeeded' || status === 'failed';
}

export function isInFlight(status: TrainingStatus): boolean {
  return status === 'pending' || status === 'processing';
}

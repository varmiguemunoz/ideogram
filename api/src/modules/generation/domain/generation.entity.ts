import type { Framing } from './framing.vo';
import type { Scenario } from './scenario.vo';

export const GENERATION_STATUSES = ['pending', 'processing', 'succeeded', 'failed'] as const;

export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

/**
 * A single image request. The snapshot shape matches the Generation type the
 * renderer already consumes, so the wire contract is unchanged.
 */
export interface GenerationSnapshot {
  id: number;
  scenario: Scenario;
  framing: Framing;
  clothingDescription: string;
  prompt: string;
  predictionId: string | null;
  outputUrl: string | null;
  error: string | null;
  status: GenerationStatus;
  createdAt: number;
  updatedAt: number;
}

/** Same abandon window as training, for the same reason. */
export const ABANDON_AFTER_MS = 24 * 60 * 60 * 1000;

export class Generation {
  constructor(private readonly snapshot: GenerationSnapshot) {}

  static fromSnapshot(snapshot: GenerationSnapshot): Generation {
    return new Generation(snapshot);
  }

  toSnapshot(): GenerationSnapshot {
    return { ...this.snapshot };
  }

  get id(): number {
    return this.snapshot.id;
  }

  get status(): GenerationStatus {
    return this.snapshot.status;
  }

  get predictionId(): string | null {
    return this.snapshot.predictionId;
  }

  get createdAt(): number {
    return this.snapshot.createdAt;
  }

  get isTerminal(): boolean {
    return this.snapshot.status === 'succeeded' || this.snapshot.status === 'failed';
  }

  get isInFlight(): boolean {
    return this.snapshot.status === 'pending' || this.snapshot.status === 'processing';
  }

  isAbandoned(nowMs: number, notFound = false): boolean {
    if (notFound) return true;
    return nowMs - this.snapshot.createdAt > ABANDON_AFTER_MS;
  }
}

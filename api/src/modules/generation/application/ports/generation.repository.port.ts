import type { Generation, GenerationStatus } from '../../domain/generation.entity';
import type { Framing } from '../../domain/framing.vo';
import type { Scenario } from '../../domain/scenario.vo';

export interface CreateGenerationRecord {
  scenario: Scenario;
  framing: Framing;
  clothingDescription: string;
  prompt: string;
  now: number;
}

export interface UpdateGenerationRecord {
  status: GenerationStatus;
  outputUrl?: string | null;
  error?: string | null;
  predictionId?: string | null;
  now: number;
}

export interface GenerationRepositoryPort {
  create(record: CreateGenerationRecord): Generation;
  update(id: number, record: UpdateGenerationRecord): void;
  findById(id: number): Generation | null;
  list(limit: number): Generation[];
}

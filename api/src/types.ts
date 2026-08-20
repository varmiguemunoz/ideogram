/**
 * LEGACY COMPATIBILITY SURFACE. Test suite only.
 *
 * Before the hexagonal refactor this file was the api's grab bag of types.
 * Everything in it now has a proper home:
 *
 *   Result, ok, err, ErrCode  ->  shared/types/result
 *   SCENARIOS, Scenario       ->  modules/generation/domain/scenario.vo
 *   FRAMINGS, Framing         ->  modules/generation/domain/framing.vo
 *   Generation, status        ->  modules/generation/domain/generation.entity
 *   AppState, TrainingStatus  ->  modules/training/domain/training-run.entity
 *   AppStateRow, GenerationRow-> private to their repositories
 *
 * The existing test files import a few of these from here by their old
 * names. Per the agreement not to modify test logic, this file survives as a
 * pure re-export so those imports keep resolving.
 *
 * No production file imports it. Delete it the day the tests are rewritten
 * against the new module paths.
 */
export { SCENARIOS, isScenario, type Scenario } from './modules/generation/domain/scenario.vo';
export { FRAMINGS, isFraming, type Framing } from './modules/generation/domain/framing.vo';
export { ok, err, type Result, type ErrCode } from './shared/types/result';
export type { TrainingStatus } from './modules/training/domain/training-status.vo';
export type { TrainingRunSnapshot as AppState } from './modules/training/domain/training-run.entity';
export type {
  GenerationSnapshot as Generation,
  GenerationStatus,
} from './modules/generation/domain/generation.entity';

import type { Scenario } from './modules/generation/domain/scenario.vo';
import type { Framing } from './modules/generation/domain/framing.vo';
import type { TrainingStatus } from './modules/training/domain/training-status.vo';
import type { GenerationStatus } from './modules/generation/domain/generation.entity';

/** Raw app_state row. Now private to SqliteTrainingRunRepository. */
export interface AppStateRow {
  id: 1;
  trigger_word: string | null;
  destination_model: string | null;
  trained_version: string | null;
  training_status: TrainingStatus;
  training_prediction_id: string | null;
  training_zip_url: string | null;
  training_started_at: number | null;
}

/** Raw generations row. Now private to SqliteGenerationRepository. */
export interface GenerationRow {
  id: number;
  scenario: Scenario;
  framing: Framing;
  clothing_description: string;
  prompt: string;
  prediction_id: string | null;
  output_url: string | null;
  error: string | null;
  status: GenerationStatus;
  created_at: number;
  updated_at: number;
}

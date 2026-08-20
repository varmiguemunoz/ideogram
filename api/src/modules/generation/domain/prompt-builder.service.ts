import { getFramingClause } from './catalog/framing.catalog';
import { getScenarioClause } from './catalog/scenario.catalog';
import { ClothingDescription } from './clothing-description.vo';
import type { Framing } from './framing.vo';
import type { Scenario } from './scenario.vo';

/**
 * Structural clause. A hardcoded module constant on purpose.
 *
 * There is no parameter, flag or toggle anywhere in this module or its
 * callers that can omit this from the prompt.
 */
export const MASK_CLAUSE = 'wearing a black balaclava covering the entire head and face';

export interface BuildPromptInput {
  /**
   * Required and non-optional. Always sourced from the stored training state,
   * never from a per request user input.
   */
  triggerWord: string;
  scenario: Scenario;
  framing: Framing;
  clothing: ClothingDescription;
}

/**
 * Assembles the final prompt.
 *
 * The trigger word and the mask clause are concatenated unconditionally.
 * There is no branch, flag or code path in this function that can skip
 * either of them. This is the invariant the whole module exists to protect.
 *
 * The clause maps used to be duplicated here as a fallback and injected from
 * the catalog at the call site. Now that the catalog lives inside this
 * domain, it is simply the single source of truth and the injection point is
 * gone.
 */
export class PromptBuilder {
  build(input: BuildPromptInput): string {
    const clauses: string[] = [
      input.triggerWord,
      getFramingClause(input.framing),
      MASK_CLAUSE,
    ];

    if (!input.clothing.isEmpty) {
      clauses.push(input.clothing.value);
    }

    clauses.push(getScenarioClause(input.scenario));

    return clauses.join(', ');
  }
}

import { TriggerWordRequiredError } from './training.errors';

/**
 * The unique token that summons the trained likeness in a prompt.
 *
 * It is set once when training starts and read back from stored state on
 * every generation. It is never a per request user input at generation time,
 * which is what guarantees the prompt builder can always include it.
 */
export class TriggerWord {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(candidate: unknown): TriggerWord {
    const trimmed = typeof candidate === 'string' ? candidate.trim() : '';
    if (trimmed.length === 0) throw new TriggerWordRequiredError();
    return new TriggerWord(trimmed);
  }

  toString(): string {
    return this.value;
  }
}

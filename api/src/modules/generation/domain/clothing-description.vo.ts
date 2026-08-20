/**
 * The one free text segment a user contributes to a prompt.
 *
 * Because it is the only untrusted input that reaches the prompt, it is
 * normalized here: newlines collapsed, trimmed, and capped. This sanitization
 * can never touch the trigger word or the mask clause, since neither of them
 * passes through this class.
 */
export class ClothingDescription {
  private static readonly MAX_LENGTH = 300;

  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  static create(candidate: unknown): ClothingDescription {
    const raw = typeof candidate === 'string' ? candidate : '';
    const normalized = raw
      .replace(/[\r\n]+/g, ' ')
      .trim()
      .slice(0, ClothingDescription.MAX_LENGTH);
    return new ClothingDescription(normalized);
  }

  get isEmpty(): boolean {
    return this.value.length === 0;
  }

  toString(): string {
    return this.value;
  }
}

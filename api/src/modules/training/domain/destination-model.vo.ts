import { InvalidDestinationModelError } from './training.errors';

/**
 * The Replicate model the trained weights are published to, as owner/name.
 */
export class DestinationModel {
  private static readonly SLUG_PATTERN = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

  private constructor(readonly slug: string) {
    Object.freeze(this);
  }

  static create(candidate: unknown): DestinationModel {
    if (typeof candidate !== 'string' || !DestinationModel.SLUG_PATTERN.test(candidate)) {
      throw new InvalidDestinationModelError();
    }
    return new DestinationModel(candidate);
  }

  toString(): string {
    return this.slug;
  }
}

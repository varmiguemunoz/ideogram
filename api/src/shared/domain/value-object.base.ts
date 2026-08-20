/**
 * Minimal base for value objects. A value object is immutable, validates
 * itself on construction, and is compared by value rather than identity.
 */
export abstract class ValueObject<T> {
  protected constructor(protected readonly _value: T) {
    Object.freeze(this);
  }

  get value(): T {
    return this._value;
  }

  equals(other: ValueObject<T>): boolean {
    return other instanceof ValueObject && other._value === this._value;
  }

  toString(): string {
    return String(this._value);
  }
}

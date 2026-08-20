export const FRAMINGS = ['headshot', 'knees_up'] as const;

export type Framing = (typeof FRAMINGS)[number];

export function isFraming(value: unknown): value is Framing {
  return typeof value === 'string' && (FRAMINGS as readonly string[]).includes(value);
}

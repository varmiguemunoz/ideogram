import type { FramingPlugin } from './catalog.types';

/** Registry of how tightly the subject is framed. */
export const framingCatalog: FramingPlugin[] = [
  {
    id: 'headshot',
    label: 'Headshot',
    promptClause: 'close-up headshot portrait',
  },
  {
    id: 'knees_up',
    label: 'Knees up',
    promptClause: 'full body knees-up shot',
  },
];

/** Fails fast rather than silently producing a prompt with a missing clause. */
export function getFramingClause(id: string): string {
  const plugin = framingCatalog.find((f) => f.id === id);
  if (!plugin) {
    throw new Error(`getFramingClause: no framing plugin registered for id "${id}"`);
  }
  return plugin.promptClause;
}

import type { ScenarioPlugin } from './catalog.types';

/**
 * Registry of the scenes a generation can be placed in.
 *
 * Adding a scene means adding an entry here and to the scenario CHECK
 * constraint in a new migration. The four one-entry files this replaced were
 * three lines each, which was structure without benefit.
 */
export const scenarioCatalog: ScenarioPlugin[] = [
  {
    id: 'mirror',
    label: 'Mirror selfie',
    promptClause: 'standing in front of a bathroom mirror, selfie style',
  },
  {
    id: 'beach',
    label: 'Beach',
    promptClause: 'standing on a beach',
  },
  {
    id: 'office',
    label: 'Office',
    promptClause: 'standing in a modern professional office setting',
  },
];

/** Fails fast rather than silently producing a prompt with a missing clause. */
export function getScenarioClause(id: string): string {
  const plugin = scenarioCatalog.find((s) => s.id === id);
  if (!plugin) {
    throw new Error(`getScenarioClause: no scenario plugin registered for id "${id}"`);
  }
  return plugin.promptClause;
}

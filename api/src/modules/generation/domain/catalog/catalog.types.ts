import type { Scenario } from '../scenario.vo';
import type { Framing } from '../framing.vo';

export interface ScenarioPlugin {
  id: Scenario;
  label: string;
  promptClause: string;
}

export interface FramingPlugin {
  id: Framing;
  label: string;
  promptClause: string;
}

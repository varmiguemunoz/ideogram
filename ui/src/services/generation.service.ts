import { http } from './http';
import type { Framing, Generation, Result, Scenario } from '../types';

export const generationService = {
  start: (payload: {
    scenario: Scenario;
    framing: Framing;
    clothing: string;
  }): Promise<Result<{ id: number }>> => http.post('/api/generation/start', payload),

  /**
   * No limit is sent. The api applies its own default, which used to be
   * duplicated here as a HISTORY_LIMIT constant.
   */
  list: (): Promise<Result<Generation[]>> => http.get('/api/generations'),
};

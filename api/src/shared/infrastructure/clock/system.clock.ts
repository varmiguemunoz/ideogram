import type { ClockPort } from '../../application/ports/clock.port';

export class SystemClock implements ClockPort {
  now(): number {
    return Date.now();
  }
}

/**
 * Injectable source of "now". Every timestamp in the application goes through
 * this, so tests can freeze time instead of racing against Date.now.
 */
export interface ClockPort {
  now(): number;
}

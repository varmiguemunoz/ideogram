/**
 * Injectable repeating timer.
 *
 * The orchestrators used to own setInterval handles as module level mutable
 * variables, which made polling impossible to stop, inspect or fake. Timers
 * now live behind this port, keyed by a caller supplied string, so a command
 * only ever describes the work of one tick.
 */
export interface SchedulerPort {
  /** Starts a repeating task. Re-registering the same key replaces the old one. */
  every(key: string, intervalMs: number, task: () => void | Promise<void>): void;

  /** Stops the task registered under this key. Safe to call when absent. */
  cancel(key: string): void;

  /** Stops every task. Called on process shutdown. */
  cancelAll(): void;
}

import type { SchedulerPort } from '../../application/ports/scheduler.port';

/**
 * setInterval based implementation. Holds every handle so shutdown can clear
 * them, which the previous code never did.
 */
export class IntervalScheduler implements SchedulerPort {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  every(key: string, intervalMs: number, task: () => void | Promise<void>): void {
    this.cancel(key);
    const timer = setInterval(() => {
      void Promise.resolve(task()).catch(() => {
        // A failing tick must never crash the process. The task itself is
        // responsible for recording why it failed; here we only keep the
        // loop alive so the next tick can retry.
      });
    }, intervalMs);
    this.timers.set(key, timer);
  }

  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(key);
    }
  }

  cancelAll(): void {
    for (const timer of this.timers.values()) clearInterval(timer);
    this.timers.clear();
  }
}

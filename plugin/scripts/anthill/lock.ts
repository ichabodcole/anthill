/**
 * A cross-process serialize lock, shared by every anthill path where several
 * seats race on one resource.
 *
 * Extracted from `team-commit`, which needed it for git's shared index. `comms
 * send` needs the same guarantee for a different reason: message ids are
 * `max(existing) + 1`, computed from a READ that happens before the APPEND, so
 * two concurrent senders both read the same log and both claim the same id.
 * `O_APPEND` protects the bytes; it does nothing for a value decided beforehand.
 * (Reproduced: six concurrent sends yielded ids 1,2,3,4,4,5,5,6,7.)
 *
 * Timeouts are parameters because the two callers want different ones — a gate
 * run can legitimately hold for a minute, a log append cannot.
 */
import { closeSync, openSync, readFileSync, statSync, unlinkSync, writeSync } from "node:fs";
import { nowMillis } from "./runtime.ts";

export interface LockOptions {
  /** Give up after this long waiting for a peer. */
  waitMs: number;
  /** Treat a lock older than this as abandoned by a crashed holder, and steal it. */
  staleMs: number;
  /** Delay between attempts. */
  pollMs?: number;
}

/**
 * A lock file's age in ms, on the WALL clock.
 *
 * `nowMillis()` is `Bun.nanoseconds()` — milliseconds since THIS PROCESS started,
 * as its own docblock says ("since an arbitrary start — use for duration
 * timing"). `mtimeMs` is epoch. Subtracting one from the other gave roughly
 * -1.78e12, so `age > staleMs` was **never true** and the stale-lock steal — the
 * entire crash-recovery path — had never once fired. A crashed holder wedged the
 * lock permanently, which is the exact thing this module's header promises it
 * will not do.
 *
 * Cold review (m7) saw the symptom and diagnosed a `waitMs < staleMs` window.
 * That window is real arithmetic but it was never reachable, because the branch
 * it gates was dead. Two clocks, two jobs: monotonic for "how long have I
 * waited", wall for "how old is this file". Using one for both is the bug.
 */
function lockAgeMs(path: string): number {
  return Date.now() - statSync(path).mtimeMs;
}

/**
 * Acquire via atomic `O_EXCL` create, waiting for a peer to release. Steals a
 * stale lock (a crashed holder must not wedge the team forever — bounded by
 * `staleMs`, NOT by `waitMs`; see the dead-window note at the timeout). Returns
 * the wait in ms, or throws on timeout.
 */
export function acquireLock(path: string, opts: LockOptions): number {
  const pollMs = opts.pollMs ?? 200;
  const startedAt = nowMillis();
  for (;;) {
    try {
      const fd = openSync(path, "wx");
      // `Date.now()`, not `nowMillis()`: this is a WALL-CLOCK stamp a human reads
      // out of the lock file. The monotonic clock produced `1970-01-01T00:00:00Z`
      // on every lock ever written — third instance of the same one-clock-for-two-
      // jobs bug in this file, and the only one visible without a debugger.
      writeSync(fd, `${process.pid} ${new Date().toISOString()}\n`);
      closeSync(fd);
      return nowMillis() - startedAt;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      try {
        if (lockAgeMs(path) > opts.staleMs) {
          unlinkSync(path);
          continue;
        }
      } catch {
        // Vanished between the open and the stat — just retry.
      }
      if (nowMillis() - startedAt > opts.waitMs) {
        let holder = "unknown";
        try {
          holder = readFileSync(path, "utf8").trim();
        } catch {
          // ignore
        }
        // The staleness test is on the lock's OWN AGE, not on how long we have
        // been waiting — so when `waitMs < staleMs` (true of both callers) there
        // is a DEAD WINDOW of `staleMs - waitMs` after a crash in which a waiter
        // gives up before the abandoned lock becomes stealable. Take one last
        // look first: the final poll can straddle the threshold, and throwing
        // while the lock is already stealable would be a spurious failure.
        let ageMs: number | undefined;
        try {
          ageMs = lockAgeMs(path);
        } catch {
          // Vanished right at the deadline — the holder released. Retry rather
          // than fail: we are inside the loop and the next open will succeed.
          continue;
        }
        if (ageMs > opts.staleMs) {
          unlinkSync(path);
          continue;
        }
        // Say WHEN it becomes stealable. "If that peer crashed, remove it" asks
        // the operator to decide something they cannot see; the remaining time
        // is the fact that makes waiting-vs-removing an informed choice.
        const stealableInMs = Math.max(0, opts.staleMs - ageMs);
        throw new Error(
          `timed out after ${opts.waitMs}ms waiting for the lock at ${path} (held by: ${holder}). ` +
            `The lock is ${Math.round(ageMs / 1000)}s old and is treated as abandoned at ` +
            `${Math.round(opts.staleMs / 1000)}s, so a retry in ${Math.round(stealableInMs / 1000)}s ` +
            `will steal it automatically. If that peer crashed and you do not want to wait, remove ${path}.`,
        );
      }
      // Synchronous wait — these CLIs are one-shot, so a blocking poll keeps the
      // logic deterministic and avoids an async colour change through callers.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, pollMs);
    }
  }
}

export function releaseLock(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // already gone — fine
  }
}

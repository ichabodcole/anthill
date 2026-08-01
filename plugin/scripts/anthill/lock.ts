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
 * Acquire via atomic `O_EXCL` create, waiting for a peer to release. Steals a
 * stale lock (a crashed holder must not wedge the team forever). Returns the
 * wait in ms, or throws on timeout.
 */
export function acquireLock(path: string, opts: LockOptions): number {
  const pollMs = opts.pollMs ?? 200;
  const startedAt = nowMillis();
  for (;;) {
    try {
      const fd = openSync(path, "wx");
      writeSync(fd, `${process.pid} ${new Date(nowMillis()).toISOString()}\n`);
      closeSync(fd);
      return nowMillis() - startedAt;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      try {
        if (nowMillis() - statSync(path).mtimeMs > opts.staleMs) {
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
        throw new Error(
          `timed out after ${opts.waitMs}ms waiting for the lock at ${path} (held by: ${holder}). ` +
            `If that peer crashed, remove ${path}.`,
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

/**
 * The serialize lock's recovery behaviour after a crashed holder.
 *
 * Cold review (m7) reported that "the first peer after a crash always throws
 * before the lock is old enough to steal." Measured, that is too strong: the
 * staleness test is on the lock file's OWN AGE, so a peer arriving at an
 * already-old lock steals it on the first iteration. The real defect is a DEAD
 * WINDOW of `staleMs - waitMs` — both callers have `waitMs < staleMs`
 * (commit 90s/120s, comms 10s/30s) — in which a waiter gives up before the
 * abandoned lock ages into stealability.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { acquireLock } from "./lock.ts";

function tmpLock(): string {
  return join(mkdtempSync(join(tmpdir(), "anthill-lock-")), "x.lock");
}

describe("acquireLock — a crashed holder must not wedge the team", () => {
  test("a lock already older than staleMs is stolen on the FIRST attempt", () => {
    const path = tmpLock();
    writeFileSync(path, "9999 crashed-holder\n");
    const old = new Date(Date.now() - 60_000);
    utimesSync(path, old, old);

    // waitMs is deliberately SHORTER than staleMs here — the caller shape the
    // finding called always-broken. It is not: age, not elapsed wait, decides.
    const waited = acquireLock(path, { waitMs: 100, staleMs: 5_000, pollMs: 10 });
    expect(waited).toBeLessThan(100);
    rmSync(path, { force: true });
  });

  test("a FRESH lock still times out — the dead window is real, and the error says when it ends", () => {
    const path = tmpLock();
    writeFileSync(path, "1234 live-holder\n");

    let message = "";
    try {
      acquireLock(path, { waitMs: 60, staleMs: 600_000, pollMs: 10 });
      throw new Error("expected a timeout");
    } catch (err) {
      message = (err as Error).message;
    }

    expect(message).toMatch(/timed out/);
    // The point of the fix: an operator deciding wait-vs-remove needs the
    // remaining time. "If that peer crashed, remove it" asks them to judge
    // something they cannot see.
    expect(message).toMatch(/abandoned at/);
    expect(message).toMatch(/will steal it automatically/);
    expect(message).toContain("live-holder");
    expect(existsSync(path)).toBe(true); // a timeout must not delete a LIVE lock
    rmSync(path, { force: true });
  });

  test("a lock that crosses the stale threshold WHILE waiting is stolen, not thrown over", () => {
    // The final poll can straddle the threshold. Throwing while the lock is
    // already stealable would be a spurious failure — this is the re-check.
    const path = tmpLock();
    writeFileSync(path, "4321 crashed-holder\n");
    const old = new Date(Date.now() - 200);
    utimesSync(path, old, old);

    const waited = acquireLock(path, { waitMs: 50, staleMs: 150, pollMs: 10 });
    expect(waited).toBeGreaterThanOrEqual(0);
    rmSync(path, { force: true });
  });
});

describe("the clock bug that made all of the above dead code", () => {
  test("a stale lock is stolen even when the process has just started", () => {
    // The regression guard for the root cause. `nowMillis()` is ms since THIS
    // process started, so in a freshly-spawned CLI it is ~0 — and `0 - mtimeMs`
    // is about -1.78e12, never greater than any staleMs. Every anthill command
    // is a fresh one-shot process, so the steal branch was dead in production
    // 100% of the time while looking correct in review.
    const path = tmpLock();
    writeFileSync(path, "9999 crashed\n");
    const old = new Date(Date.now() - 3_600_000);
    utimesSync(path, old, old);
    expect(() => acquireLock(path, { waitMs: 20, staleMs: 1_000, pollMs: 5 })).not.toThrow();
    rmSync(path, { force: true });
  });

  test("the lock file records a real wall-clock time, not 1970", () => {
    const path = tmpLock();
    acquireLock(path, { waitMs: 100, staleMs: 1_000, pollMs: 5 });
    const stamp = readFileSync(path, "utf8").trim().split(" ")[1] as string;
    expect(new Date(stamp).getUTCFullYear()).toBeGreaterThan(2000);
    rmSync(path, { force: true });
  });
});

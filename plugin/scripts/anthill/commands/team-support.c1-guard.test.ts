import { describe, expect, test } from "bun:test";
import { shouldBlockTeardown } from "./team-down.ts";
import { commsPresence } from "./team-support.ts";

/**
 * C1's guard: a destructive act proceeds only on a POSITIVE observation.
 *
 * `anthill down` kills panes. Before C1, `none` meant "zero position records" —
 * an absence of data — and `shouldBlockTeardown(none)` authorises. That was
 * REPRODUCED in session 9, not inferred: an isolated session with an empty
 * positions directory and an untailed vine returned `{tornDown: true,
 * presence: "none"}` and killed a pane running work, with no `--force`.
 *
 * C1 redefines `none` as "a departure record for every SPAWNED seat", which
 * routes every recordless world onto `unknown` — a state every consumer already
 * has a policy for, so no consumer gains a case it must invent a fallback for.
 *
 * WHY THIS FILE IS SEPARATE from `team-support.test.ts`: that file is forager's
 * lane and this one is the verifier's. On a shared tree an explicit pathspec
 * protects a peer's FILES, never their uncommitted edits inside a file you both
 * write to — so two seats editing one test file is the one hazard the land
 * command cannot see. Precedent: `team-down.command-path.test.ts`.
 */

type Row = {
  handle: string;
  hasRecord: boolean;
  followerAlive: boolean | null;
  departed: boolean;
};

/**
 * FIXTURES ARE BUILT FROM REACHABLE WORLDS, NOT FROM FIELD NAMES.
 *
 * The rule this file exists to encode, paid for twice in one session: the
 * fixture space is larger than the reachable state space, and the type system
 * does not mark the boundary. `{departed: true, hasRecord: false}` type-checks,
 * constructs cleanly, and reads like a departed seat — but no sequence of real
 * events produces it, because a seat that worked a session emitted messages
 * (`recordPosition` fires on `highestEmitted > 0`) and standing down kills its
 * follower. A matrix built on that row reported cell 2 GREEN while `none` was
 * unreachable in every real session.
 *
 * So each helper below names the event sequence that produces it. If you add a
 * row and cannot write that sentence, it is not a test case.
 */

/** Spawned, follower attached, has NOT yet received a message: no position file. */
const fresh = (handle: string): Row => ({
  handle,
  hasRecord: false,
  followerAlive: null,
  departed: false,
});

/** Working now: emitted at least once, follower process confirmed alive. */
const working = (handle: string): Row => ({
  handle,
  hasRecord: true,
  followerAlive: true,
  departed: false,
});

/** Stood down cleanly: emitted during the session, tombstone written, follower gone. */
const departed = (handle: string): Row => ({
  handle,
  hasRecord: true,
  followerAlive: false,
  departed: true,
});

/** Crashed: emitted during the session, follower dead, NO tombstone. Unexplained. */
const crashed = (handle: string): Row => ({
  handle,
  hasRecord: true,
  followerAlive: false,
  departed: false,
});

const SEATS = ["maestro", "forager", "weaver", "sentinel", "steward", "scout"];
const all = (f: (h: string) => Row): Row[] => SEATS.map(f);
const split = (f: (h: string) => Row, g: (h: string) => Row, at = 3): Row[] =>
  SEATS.map((h, i) => (i < at ? f(h) : g(h)));

describe("C1 — teardown is authorised only by a positive observation of departure", () => {
  /**
   * The acceptance cell. `spawned === null` means NO session-open record exists.
   *
   * Stated as a quantifier, `none ⟺ ∀ s ∈ spawned : departed(s)` is VACUOUSLY
   * TRUE over the empty set — so the rule as first written returned `none` at a
   * fresh session and authorised the pane-kill above. The non-emptiness conjunct
   * is the whole safety property, and this is the cell that fails without it.
   *
   * Note the failure is monotone in the wrong direction: the LESS the tool knows,
   * the more confidently the vacuous form authorises.
   */
  test("no session-open record: blocks, and reports spawnedCount null", () => {
    const v = commsPresence(all(fresh), null);
    expect(v.presence.state).toBe("unknown");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
    expect(v.spawnedCount).toBeNull();
  });

  test("open record naming no seats: blocks, and reports spawnedCount 0", () => {
    const v = commsPresence(all(fresh), []);
    expect(v.presence.state).toBe("unknown");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
    expect(v.spawnedCount).toBe(0);
  });

  /**
   * `null` vs `0` asserted AS A PAIR, per Contract 6(c): `null` is not a
   * rounded-down zero. Either assertion alone passes against a hardcoded value;
   * only the pair fails when the two are fused.
   *
   * ⚠ THE COUNT PAIR ALONE CANNOT CATCH A FUSION OF THE TWO BRANCHES, and this
   * codebase is the case where that matters. `spawnedCount` is derived from the
   * ARGUMENT (`spawned === null ? null : spawned.length`) before any branch is
   * chosen — so fusing the two branches leaves it reporting `[null, 0]` exactly
   * as before. Measured against the real implementation: fuse them and the count
   * pair still passes.
   *
   * `because` is stamped BY THE BRANCH THAT FIRED, so it is the only observable
   * that changes. Both are asserted, as pairs, and the `because` pair is the one
   * carrying the weight — `no-open-record` and `empty-open-record` collapse to a
   * single value the moment the branches merge.
   *
   * The verdict cannot distinguish these two worlds (both are `unknown`), which
   * is precisely why an observable must. Contract 6(c): `null` is not a
   * rounded-down zero, one layer out.
   */
  test("null and 0 are distinct observations, not one rounded into the other", () => {
    const pair = [
      commsPresence(all(fresh), null).spawnedCount,
      commsPresence(all(fresh), []).spawnedCount,
    ];
    expect(pair).toEqual([null, 0]);
  });

  /**
   * THE ASSERTION THAT ACTUALLY FAILS WHEN THE BRANCHES FUSE.
   *
   * Asserted as a PAIR rather than two singles: either value alone passes
   * against a hardcoded string, and only the pair fails when the two branches
   * become one. This test was added after measuring that the count pair above
   * does NOT fail under that mutation — the remedy was recommended, adopted, and
   * only then run against the mutation it was designed for.
   */
  test("no-open-record and empty-open-record stay distinguishable", () => {
    const pair = [commsPresence(all(fresh), null).because, commsPresence(all(fresh), []).because];
    expect(pair).toEqual(["no-open-record", "empty-open-record"]);
  });

  test("fresh session with an open record: nobody has departed, so it blocks", () => {
    const v = commsPresence(all(fresh), SEATS);
    expect(v.presence.state).toBe("unknown");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
    expect(v.departedCount).toBe(0);
  });

  /**
   * THE REACHABILITY CELL. `none` must be reachable from a world the system can
   * actually produce, or the guard is always-block — the degradation that trains
   * people to pass `--force` reflexively and thereby removes the guard for real.
   *
   * This cell failed on the first corrected spec: a departed seat necessarily has
   * a position record and a dead follower, so the liveness branch fired before
   * departure was ever consulted and branch 5 was dead code. The `&& !departed`
   * qualifier is what makes it reachable — a tombstone EXPLAINS a dead follower,
   * which is exactly what the liveness branch demands.
   */
  test("clean end — every spawned seat departed: authorises teardown", () => {
    const v = commsPresence(all(departed), SEATS);
    expect(v.presence.state).toBe("none");
    expect(shouldBlockTeardown(v.presence, false)).toBe(false);
    expect(v.departedCount).toBe(SEATS.length);
  });

  test("a live follower is presence, and presence blocks", () => {
    const v = commsPresence(split(departed, working), SEATS);
    expect(v.presence.state).toBe("present");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
  });

  test("partial departure with seats still live: blocks", () => {
    const v = commsPresence(split(departed, working), SEATS);
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
  });

  /** Half stood down, half never emitted: incomplete, so not a positive observation. */
  test("partial departure, nobody live: blocks", () => {
    const v = commsPresence(split(departed, fresh), SEATS);
    expect(v.presence.state).toBe("unknown");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
  });

  /**
   * The crashed seat — the case the `&& !departed` qualifier must NOT swallow.
   * A dead follower with no tombstone is unexplained, and an unexplained absence
   * is not evidence the seat is gone: the agent may still be working in its pane,
   * and its scratch is gitignored and exists nowhere else.
   *
   * This is the cell that fails if anyone widens the qualifier to discharge
   * branch 2 for any dead follower rather than only for a tombstoned one.
   */
  test("a crashed seat is unexplained, not departed: blocks", () => {
    const v = commsPresence(split(departed, crashed), SEATS);
    expect(v.presence.state).toBe("unknown");
    expect(shouldBlockTeardown(v.presence, false)).toBe(true);
  });

  /**
   * TOTALITY (Contract 5(a)): `departedCount` is present on EVERY verdict, so a
   * `0` reads as an observation rather than as an unpopulated field. Asserted
   * across three different states so a value hardcoded on one path fails.
   */
  test("the counts are TOTAL — present on every state, not just the ones that use them", () => {
    const states = [
      commsPresence(all(fresh), null),
      commsPresence(all(departed), SEATS),
      commsPresence(split(departed, working), SEATS),
    ];
    for (const v of states) {
      expect(v).toHaveProperty("spawnedCount");
      expect(typeof v.departedCount).toBe("number");
    }
    expect(states.map((v) => v.presence.state)).toEqual(["unknown", "none", "present"]);
  });

  /**
   * `--force` is the human's override and must still work — otherwise the guard
   * has no escape hatch and the next person removes it entirely.
   */
  test("--force overrides every blocking state", () => {
    for (const v of [
      commsPresence(all(fresh), null),
      commsPresence(split(departed, crashed), SEATS),
    ]) {
      expect(shouldBlockTeardown(v.presence, true)).toBe(false);
    }
  });
});

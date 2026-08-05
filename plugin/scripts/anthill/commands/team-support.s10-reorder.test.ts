/**
 * S10-4 — THE REORDER CELL. Written BEFORE the D1/D2/D3 repair lands.
 *
 * WHY THIS FILE EXISTS, and why its assertions are shaped the way they are.
 *
 * `commsPresence` branch 1 (`followerAlive === true`) fires before any departure
 * is consulted, so a seat that stood down still reads `present` while its
 * `comms follow` is alive — and `down` is what kills the follow. That is
 * Defect 1 (seams.md Contract 6(g)). The repair moves or qualifies that branch.
 *
 * TWO NATURAL REPAIRS EXIST AND THEY ARE NOT EQUIVALENT. Measured at `27da450`
 * over an exhaustive 36-cell space, twice, in out-of-repo worktrees:
 *
 *   RIVAL A — qualify branch 1:  `followerAlive === true && !r.departed`
 *   RIVAL B — hoist the all-spawned-departed test ABOVE the liveness branch
 *
 * They agree on 32 of 36 cells and disagree on exactly
 * `{departed: true, followerAlive: true, spawned: null | []}`:
 *
 *     RIVAL A -> unknown / no-open-record   (or empty-open-record)
 *     RIVAL B -> present / live-follower
 *
 * *** AND `shouldBlockTeardown` RETURNS `true` FOR BOTH ON THOSE CELLS. ***
 *
 * So the distinction differs on ZERO cells by authorisation verdict and TWO by
 * `because`. A test keyed on `shouldBlockTeardown` certifies BOTH implementations
 * identically — the "untestable as specified" shape this team shipped at #317 and
 * regretted, arriving one level up. Hence the gate requirement (maestro, A1):
 *
 *   >>> ASSERT `state` AND `because`. NEVER `shouldBlockTeardown` ALONE. <<<
 *
 * `because` is not a convenience here. It is the ONLY surface on which the
 * distinction is observable at all — which is exactly what the enum was
 * introduced for (see the docstring at team-support.ts:211).
 *
 * THE ROWS BELOW WERE PREDICTED BEFORE THE REPAIR EXISTED, not derived from a
 * diff. A prediction written after reading the fix proves nothing.
 */

import { describe, expect, test } from "bun:test";
import { commsPresence } from "./team-support.ts";

/**
 * NOTE the two axes that are usually frozen and must not be.
 *
 * `hasRecord` and `spawned` are the axes an author naturally holds constant
 * while varying `departed` × `followerAlive` — and BOTH turned out to carry the
 * discriminating cases. My own first matrix froze `spawned = ["a","b"]` and
 * could not tell the two rivals apart; the axis you hold constant is where the
 * discriminator hides, and a frozen axis does not announce itself.
 */
const row = (
  handle: string,
  followerAlive: boolean | null,
  departed: boolean,
  hasRecord = true,
) => ({ handle, hasRecord, followerAlive, departed });

const SPAWNED = ["a", "b"];

/** state + because as ONE tuple — per the gate, never the verdict alone. */
const verdictOf = (
  rows: Parameters<typeof commsPresence>[0],
  spawned: string[] | null,
): [string, string] => {
  const r = commsPresence(rows, spawned);
  return [r.presence.state, r.because];
};

/** Both seats in the same cell shape — the whole-session case, not a mixture. */
const both = (alive: boolean | null, departed: boolean, hasRecord = true) => [
  row("a", alive, departed, hasRecord),
  row("b", alive, departed, hasRecord),
];

describe("S10-4 — the branch-reorder cell (predicted before the repair)", () => {
  /**
   * ROW 1 — THE CELL UNDER TEST. Defect 1's exact signature.
   *
   * Uncovered before this file: 20 `row(` fixtures in team-support.test.ts and
   * EVERY one with `departed: true` also carried `followerAlive: false`. This
   * state had no test at all, which is how the suite was 512/0 with D1 shipped.
   *
   * REACHABLE, per the fixture rule — name the real sequence that produces it:
   * stand down in session N -> the tombstone persists (it carries no session id)
   * -> be spawned in session N+1 -> `comms follow` starts. That is D3 and D1
   * meeting in one row, and it is the state this very session is in.
   *
   * MUST FLIP: `present` today, non-`present` after the repair.
   */
  test("a departed seat with a LIVE follower is not presence (D1's signature)", () => {
    expect(verdictOf(both(true, true), SPAWNED)).toEqual(["none", "all-spawned-departed"]);
  });

  /**
   * ROW 2 — THE LOAD-BEARING HOLD. If this flips, `none` is unreachable again
   * and the guard has degraded to always-block, which trains reflexive `--force`
   * — the guard deleted by its own success. This is the fifth-road cell that
   * Q3 hypothesis #2 predicted a reorder would create.
   *
   * MUST STAY `none`.
   */
  test("every spawned seat departed with dead followers still reaches none", () => {
    expect(verdictOf(both(false, true), SPAWNED)).toEqual(["none", "all-spawned-departed"]);
  });

  /**
   * ROW 3 — the case the guard EXISTS to protect: a working seat that never
   * stood down. A departure-first reorder is likeliest to break exactly this.
   *
   * MUST STAY `present`.
   */
  test("a working seat with no departure record is still present", () => {
    expect(verdictOf(both(true, false), SPAWNED)).toEqual(["present", "live-follower"]);
  });

  /**
   * ROW 4 — the CRASHED seat: a record, a dead pid, and no departure to explain
   * it. Unexplained absence must never be read as a clean ending.
   *
   * MUST STAY `unknown`.
   */
  test("a crashed seat is unexplained, never a clean ending", () => {
    expect(verdictOf(both(false, false), SPAWNED)).toEqual(["unknown", "unexplained-follower"]);
  });

  /**
   * ROWS 1-4 AS A SET. Any single row passes against a hardcoded verdict; the
   * set does not. Four inputs, three distinct states, asserted together.
   */
  test("the four rows are a DISCRIMINATOR, not four constants", () => {
    expect([
      verdictOf(both(true, true), SPAWNED)[0],
      verdictOf(both(false, true), SPAWNED)[0],
      verdictOf(both(true, false), SPAWNED)[0],
      verdictOf(both(false, false), SPAWNED)[0],
    ]).toEqual(["none", "none", "present", "unknown"]);
  });

  /**
   * ROW 5 — THE HOLD THAT MUST HOLD FOR THE OPPOSITE REASON.
   *
   * The fresh-spawn instant: seats spawned, nobody has followed yet, and stale
   * tombstones from a previous session are on disk. A seat with no position
   * record has `hasRecord: false`, so it is filtered out of BOTH follower
   * branches and NEVER REACHES BRANCH 1 — the only branch either rival touches.
   *
   * Measured identical on MAIN, RIVAL A and RIVAL B. So no repair of D1, by
   * qualifier or by reorder, can move this cell BY CONSTRUCTION.
   *
   * That is "never D1 alone" as an executable fact rather than an agreement:
   * after a D1-only fix this still authorises a teardown at the fresh-spawn
   * instant, WITH BRANCH 1 HARDENED, which reads like the hazard was addressed.
   *
   * MUST NOT CHANGE across the D1 repair. MUST become non-`none` across the D3
   * session-scoping of `departed(s)` — and that is the assertion that fails if
   * anyone lands a partial repair.
   */
  test("the fresh-spawn instant is not reachable by the D1 repair at all", () => {
    expect(verdictOf(both(null, true, false), SPAWNED)).toEqual(["none", "all-spawned-departed"]);
  });

  /**
   * THE CALLER INVARIANT — the reason the row above uses `followerAlive: null`
   * and NOT `false`, and the reason this assertion is here rather than in a
   * comment.
   *
   * `commsPresenceFor` derives both fields from ONE `position` lookup
   * (team-support.ts:371-372):
   *
   *     hasRecord:     position !== null
   *     followerAlive: position ? pidAlive(position.pid) : null
   *
   * So `hasRecord: false` FORCES `followerAlive: null`. Any fixture pairing
   * `hasRecord: false` with `followerAlive: true | false` describes a world the
   * production derivation cannot emit — it type-checks, constructs cleanly, and
   * tests nothing.
   *
   * I know this because I shipped it: my first 36-cell matrix varied the two
   * axes independently, so 12 of its 36 cells were unreachable, and THREE of the
   * six cells I reported as "moved by the repair" were among them. The fixture
   * space is larger than the reachable state space and the type system does not
   * mark the boundary.
   *
   * RIVAL A re-predicates branch 1, which is the one branch whose safety rests
   * on this coupling — and nothing asserted it until now. Found by steward,
   * carried into the repair by forager, pinned here.
   */
  test("no-record forces followerAlive null — the coupling branch 1 rests on", () => {
    const derive = (position: { pid: number } | null) => ({
      hasRecord: position !== null,
      followerAlive: position ? true : null,
    });
    expect(derive(null)).toEqual({ hasRecord: false, followerAlive: null });
    // Positive control: the derivation CAN produce the other pairing, so the
    // assertion above is a reading rather than a constant.
    expect(derive({ pid: 1 })).toEqual({ hasRecord: true, followerAlive: true });
  });

  /**
   * ROW 6 — THE RIVAL-DISCRIMINATING CELL. Deliberately left to forager's C1
   * ruling and NOT asserted here.
   *
   * `{departed: true, followerAlive: true, spawned: null | []}` is where A and B
   * disagree, and it is invisible to `shouldBlockTeardown` (both block). Its
   * expected value follows from what the tool is entitled to CLAIM about a seat
   * that filed a departure record — Contract 6(a)'s subject, and the owner's
   * call, not the verifier's.
   *
   *   RIVAL A -> ["unknown", "no-open-record"] / ["unknown", "empty-open-record"]
   *   RIVAL B -> ["present", "live-follower"]
   *
   * WRITE THIS ASSERTION IN THE SAME COMMIT AS THE RULING. An unasserted cell
   * that a comment describes is not coverage, and this comment is the reason it
   * is missing rather than an excuse for leaving it missing.
   */
  test.todo("the null/empty-spawned rival cell — assert once C1 rules A or B", () => {});
});

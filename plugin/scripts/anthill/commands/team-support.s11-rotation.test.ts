/**
 * S11 — what SESSION ROTATION does to the teardown guard (`t-ac09ffa9`, gate item 3).
 *
 * Gate item 3 was labelled INFERRED from session 9 to session 11: *"it stays INFERRED
 * until someone stands up a session and runs `down` against it."* These assertions pin
 * what a session-11 reproduction MEASURED, so the next instance inherits a guard rather
 * than a story.
 *
 * ⚠ WHAT THESE COVER, stated so a reader cannot mistake the scope: the PRESENCE
 * boundary, not the COMMAND boundary. The link from presence to `killSession` lives in
 * `down`'s `run()` and is pinned separately by `team-down.command-path.test.ts`.
 *
 * ⚠ AND WHY EVERY CASE ASSERTS `state` AND `because` AS A PAIR (gate 2c): the two natural
 * D1 repairs differ on ZERO cells by verdict and two by `because`, so a verdict-keyed
 * assertion certifies both implementations identically. A matrix keyed on the
 * authorisation alone is a harness test wearing a coverage badge.
 */
import { describe, expect, test } from "bun:test";
import { commsPresence } from "./team-support.ts";

const SEATS = ["maestro", "forager", "weaver", "sentinel", "steward", "scout"];
/** Production's own shape: the lead CONVENES, the other five are SPAWNED. */
const SPAWNED = ["forager", "weaver", "sentinel", "steward", "scout"];

/**
 * Rows as the single production caller derives them.
 *
 * ⚠ THE COUPLING IS LOAD-BEARING AND IS THE REASON THIS HELPER EXISTS: `hasRecord:false`
 * FORCES `followerAlive:null`, because `commsPresenceFor` derives both from ONE `position`
 * lookup. Branch 1 does not test `hasRecord`, so its correctness for a seat that has never
 * followed — or whose position ROTATION JUST DELETED — is inherited from this coupling and
 * from nowhere else. A helper that let the two vary independently would manufacture cells
 * production cannot emit, which is how a previous matrix here reported 6-of-36 moved when
 * the reachable answer was 3-of-24.
 */
function rows(opts: { positions: "preserved" | "emptied"; alive: boolean; departed: string[] }) {
  const hasRecord = opts.positions === "preserved";
  return SEATS.map((handle) => ({
    handle,
    hasRecord,
    followerAlive: hasRecord ? opts.alive : null,
    departed: opts.departed.includes(handle),
  }));
}

const verdict = (r: ReturnType<typeof commsPresence>) => [r.presence.state, r.because];

describe("S11 — session rotation and the teardown guard", () => {
  // POSITIVE ANCHOR, FIRST ON PURPOSE. Without it a permanently-blocking predicate
  // passes every other case here, and always-block trains reflexive `--force`, which
  // deletes the guard for real.
  test("ANCHOR: before rotation, live non-departed followers report present", () => {
    const r = commsPresence(rows({ positions: "preserved", alive: true, departed: [] }), SPAWNED);
    expect(verdict(r)).toEqual(["present", "live-follower"]);
  });

  test("rotation ALONE does not authorise teardown — blinded positions fall through to the conjunct", () => {
    const r = commsPresence(rows({ positions: "emptied", alive: true, departed: [] }), SPAWNED);
    expect(verdict(r)).toEqual(["unknown", "outstanding-departures"]);
  });

  // THE PANE-KILL. Reproduced session 11; INFERRED for two sessions before that.
  test("THE PANE-KILL: rotation plus IN-WINDOW departures authorises teardown while seats still work", () => {
    const r = commsPresence(
      rows({ positions: "emptied", alive: true, departed: SPAWNED }),
      SPAWNED,
    );
    expect(verdict(r)).toEqual(["none", "all-spawned-departed"]);
  });

  // A SET, not two cases: any single row is satisfied by a hardcoded verdict; the pair is not.
  test("the rotation pair DISCRIMINATES — in-window departures are the ONLY difference", () => {
    const before = commsPresence(
      rows({ positions: "emptied", alive: true, departed: [] }),
      SPAWNED,
    );
    const after = commsPresence(
      rows({ positions: "emptied", alive: true, departed: SPAWNED }),
      SPAWNED,
    );
    expect([verdict(before), verdict(after)]).toEqual([
      ["unknown", "outstanding-departures"],
      ["none", "all-spawned-departed"],
    ]);
  });

  /**
   * ROTATION REMOVES THE LEAD'S TEARDOWN VETO.
   *
   * Contract 6(g) property 1 says a lead who is in the roster and not in `spawned`
   * "blocks teardown with his own live follower until he stands down himself." That is
   * TRUE before rotation and FALSE after it, and the clause does not carry the bound.
   * The lead's veto is not surrendered by a decision — it is deleted by a maintenance
   * operation, because his liveness is observable only THROUGH a position record.
   */
  test("the LEAD'S VETO pair: the same live non-departed lead blocks BEFORE rotation and not AFTER", () => {
    const beforeRotation = commsPresence(
      rows({ positions: "preserved", alive: true, departed: SPAWNED }),
      SPAWNED,
    );
    const afterRotation = commsPresence(
      rows({ positions: "emptied", alive: true, departed: SPAWNED }),
      SPAWNED,
    );
    expect(beforeRotation.presence).toEqual({ state: "present", seats: ["maestro"] });
    expect([verdict(beforeRotation), verdict(afterRotation)]).toEqual([
      ["present", "live-follower"],
      ["none", "all-spawned-departed"],
    ]);
  });

  /**
   * THE SAFE SET, handed to rotation's author as a constraint rather than a red test.
   * Every design is safe EXCEPT preserving the session-open record across the rotation.
   */
  /**
   * ⚠ RE-MINTING and STALE-TOMBSTONE safety are NOT asserted here, deliberately, and the
   * reason is worth more than the coverage: both work by making `departed` FALSE upstream
   * in `hasDeparted` (`record.at >= sessionOpenedAt`), so at THIS function's boundary they
   * are byte-identical to "rotation alone" above. Three drafts of this file asserted them
   * as three separate cases — three names over ONE cell, which reads as breadth and is a
   * frozen axis. `hasDeparted`'s stale/fresh/absent discriminator is pinned where it can
   * actually vary, in `comms.test.ts`. Point at it; do not re-assert it here.
   */
  test("SAFE DESIGN: a DROPPED session record blocks — spawned is unknowable", () => {
    const r = commsPresence(rows({ positions: "emptied", alive: true, departed: SPAWNED }), null);
    expect(verdict(r)).toEqual(["unknown", "no-open-record"]);
  });

  test("SAFE DESIGN: a record naming NOBODY blocks — and is distinct from no record at all", () => {
    const empty = commsPresence(rows({ positions: "emptied", alive: true, departed: SEATS }), []);
    const absent = commsPresence(
      rows({ positions: "emptied", alive: true, departed: SEATS }),
      null,
    );
    // Same verdict, DIFFERENT knowledge — the split Contract 6(g) forbids collapsing.
    expect([verdict(empty), verdict(absent)]).toEqual([
      ["unknown", "empty-open-record"],
      ["unknown", "no-open-record"],
    ]);
    expect([empty.spawnedCount, absent.spawnedCount]).toEqual([0, null]);
  });
});

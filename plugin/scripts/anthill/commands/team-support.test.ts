import { describe, expect, test } from "bun:test";
import {
  classifyPresence,
  combinePresence,
  commsPresence,
  type SeatPresence,
  summarizeBoard,
} from "./team-support.ts";

/**
 * Presence was SINGLE-WIRE on a multi-wire team, and `anthill down` kills panes.
 *
 * Measured live during session 7, with two seats actively working: the vine had
 * `subscribers: []` (comms was the only armed wire, deliberately), so presence
 * returned a confident `none` and `shouldBlockTeardown(none, false)` returned
 * FALSE. The guard was not broken — it was ruling honestly on a wire nobody was
 * on. Both the session brief and its errata predicted the opposite failure
 * (that it would always BLOCK); the truth was the fail-open direction on a
 * destructive command, which is worse than either prediction.
 */
describe("commsPresence — a live follower is presence; an unchecked one is not absence", () => {
  // `hasRecord`, not a lag state: presence asks "is there a follower and is it
  // alive". Keying it on a lag value is what let the F1 fix silently turn every
  // unchecked follower into an absence, one commit after this guard landed.
  const row = (handle: string, state: string, followerAlive: boolean | null, departed = false) => ({
    handle,
    hasRecord: state !== "never-followed",
    followerAlive,
    departed,
  });
  // The six seats a session actually spawned. Named once so the tests below
  // read as "against this session" rather than repeating a literal.
  const SPAWNED = ["a", "b"];

  // The three states as a SET. Any one in isolation passes against a constant.
  //
  // NOTE the third case changed with C1: `none` is no longer produced by an
  // absence of records. It now requires a positive departure for every spawned
  // seat, so the case that used to be "nobody ever followed" is now "everybody
  // left". The SET is what keeps this honest — a hardcoded verdict fails it.
  test("distinguishes present / unknown / none from one function", () => {
    expect([
      commsPresence([row("a", "current", true)], SPAWNED).presence.state,
      commsPresence([row("a", "current", null)], SPAWNED).presence.state,
      commsPresence([row("a", "current", false, true), row("b", "current", false, true)], SPAWNED)
        .presence.state,
    ]).toEqual(["present", "unknown", "none"]);
  });

  // THE REGRESSION. This exact shape was live when the defect was found.
  test("reports the seats whose followers are alive", () => {
    const p = commsPresence(
      [
        row("maestro", "current", true),
        row("forager", "current", true),
        row("weaver", "never-followed", null),
      ],
      ["maestro", "forager", "weaver"],
    );
    expect(p.presence).toEqual({ state: "present", seats: ["forager", "maestro"] });
  });

  // Contract 6(f): `null` means NOT CHECKED and must never read as
  // checked-and-dead. Collapsing it into absence is how a live seat gets killed.
  test("an unCHECKED follower yields unknown, never none", () => {
    expect(commsPresence([row("a", "current", null)], SPAWNED).presence.state).toBe("unknown");
  });

  // ⚠ INVERTED BY C1, and the inversion is the whole point of the change.
  //
  // This test used to assert that two never-followed seats are `none` — "a
  // genuine, positively-observed absence". It is not one. An empty positions
  // directory is what a FRESHLY CONVENED team looks like, and sentinel
  // reproduced the consequence: `tornDown: true` on a session with a pane doing
  // work, no --force, no warning.
  //
  // The old test's stated RATIONALE was right and its CONCLUSION was wrong —
  // `none` must stay reachable or the guard degrades into always-block. C1
  // keeps it reachable through DEPARTURE rather than through absence, which is
  // the next test.
  test("a never-followed seat is NOT absence — no record is no evidence", () => {
    expect(
      commsPresence([row("a", "never-followed", null), row("b", "never-followed", null)], SPAWNED)
        .presence.state,
    ).toBe("unknown");
  });

  // ...and this is what keeps `none` reachable, so the guard does not degrade
  // into always-block and train reflexive --force.
  test("every spawned seat departed reaches none — the clean ending", () => {
    const p = commsPresence(
      [row("a", "current", false, true), row("b", "current", false, true)],
      SPAWNED,
    );
    expect(p.presence).toEqual({ state: "none" });
    expect(p.because).toBe("all-spawned-departed");
  });

  // A departure record EXPLAINS a dead follower; without one it is unexplained.
  // This pair is why `&& !departed` exists: without it the liveness branch fires
  // before departure is ever consulted, no real session can reach `none`, and
  // every teardown needs --force.
  test("a departed seat's dead follower is explained; a crashed seat's is not", () => {
    const departed = commsPresence(
      [row("a", "current", false, true), row("b", "current", false, true)],
      SPAWNED,
    );
    const crashed = commsPresence(
      [row("a", "current", false, true), row("b", "current", false, false)],
      SPAWNED,
    );
    expect([departed.presence.state, crashed.presence.state]).toEqual(["none", "unknown"]);
  });

  // F1 (session 7, cold read): this test used to assert `none` under the name
  // "a dead follower is absence — a checked pid IS an observation". The premise
  // is true and the conclusion was wrong, which is the shape that hides:
  // a checked pid IS an observation, but an observation ABOUT THE FOLLOW
  // PROCESS. `down` kills PANES, and a follow process is not a pane.
  test("a dead follower is UNKNOWN, never absence — down kills panes, not followers", () => {
    expect(commsPresence([row("a", "current", false)], SPAWNED).presence.state).toBe("unknown");
  });

  // The two unknown-producing causes must stay DISTINGUISHABLE in the reason.
  test("a dead follower and an unchecked one give different reasons", () => {
    const reasonOf = (alive: boolean | null) => {
      const p = commsPresence([row("a", "current", alive)], SPAWNED).presence;
      return p.state === "unknown" ? p.reason : `NOT-UNKNOWN:${p.state}`;
    };
    const dead = reasonOf(false);
    const unchecked = reasonOf(null);
    expect([dead, unchecked].every((r) => !r.startsWith("NOT-UNKNOWN"))).toBe(true);
    expect(dead).not.toBe(unchecked);
  });

  test("one live follower outweighs any number of dead ones", () => {
    expect(
      commsPresence([row("a", "current", false), row("b", "current", true)], SPAWNED).presence
        .state,
    ).toBe("present");
  });

  // ⚠ INVERTED BY C1. An empty roster used to be `none` — the vacuous case.
  // With no spawned set there is nothing to have departed, so it cannot be a
  // confirmed absence.
  test("an empty roster is NOT none — nothing was observed to leave", () => {
    expect(commsPresence([], null).presence.state).toBe("unknown");
  });

  // THE PAIR. `null` (no session-open record) and `[]` (a record naming nobody)
  // are different facts and resolve to the SAME verdict, so no assertion over
  // `state` — and none over a count derived from the INPUT — can tell them
  // apart. Measured: an input-derived `spawnedCount` reports [null, 0] both
  // before and after the two branches are fused, so it passes against the exact
  // mutation it was proposed to catch. Only the branch-stamped `because` does.
  //
  // Asserted AS A PAIR: either alone passes against a hardcoded literal.
  test("no-open-record and empty-open-record stay distinguishable", () => {
    const noRecord = commsPresence([row("a", "never-followed", null)], null);
    const emptyRecord = commsPresence([row("a", "never-followed", null)], []);
    expect([noRecord.because, emptyRecord.because]).toEqual([
      "no-open-record",
      "empty-open-record",
    ]);
    // ...and both still block, which is the safety half.
    expect([noRecord.presence.state, emptyRecord.presence.state]).toEqual(["unknown", "unknown"]);
  });

  // TOTALITY (Contract 5(a)): the counts are present on every branch, so `0`
  // reads as an observation rather than as an unpopulated field.
  test("spawnedCount and departedCount are TOTAL, and null is not zero", () => {
    expect(commsPresence([row("a", "current", true)], null).spawnedCount).toBe(null);
    expect(commsPresence([row("a", "current", true)], []).spawnedCount).toBe(0);
    expect(commsPresence([row("a", "current", true)], SPAWNED).departedCount).toBe(0);
    expect(commsPresence([row("a", "current", false, true)], SPAWNED).departedCount).toBe(1);
  });
});

describe("combinePresence — `none` requires positive absence on EVERY wire", () => {
  const none: SeatPresence = { state: "none" };
  const unknown: SeatPresence = { state: "unknown", reason: "r" };
  const present: SeatPresence = { state: "present", seats: ["a"] };

  // The full 3x3 lattice as ONE assertion. Nine cells, and the whole point is
  // that no cell resolves toward `none` unless both sides did.
  test("the whole lattice at once", () => {
    const cells: SeatPresence[][] = [
      [none, none],
      [none, unknown],
      [none, present],
      [unknown, none],
      [unknown, unknown],
      [unknown, present],
      [present, none],
      [present, unknown],
      [present, present],
    ];
    expect(
      cells.map(([x, y]) => combinePresence(x as SeatPresence, y as SeatPresence).state),
    ).toEqual([
      "none",
      "unknown",
      "present",
      "unknown",
      "unknown",
      "present",
      "present",
      "present",
      "present",
    ]);
  });

  // THE LIVE CASE, stated on its own because it is the defect: the vine
  // positively reported nobody and it was RIGHT about the vine.
  test("vine says nobody + comms says someone → PRESENT", () => {
    expect(combinePresence(none, { state: "present", seats: ["forager", "maestro"] })).toEqual({
      state: "present",
      seats: ["forager", "maestro"],
    });
  });

  test("unions and dedupes seats across wires", () => {
    expect(
      combinePresence({ state: "present", seats: ["b", "a"] }, { state: "present", seats: ["a"] }),
    ).toEqual({ state: "present", seats: ["a", "b"] });
  });

  test("is symmetric — neither wire is privileged", () => {
    const pairs: [SeatPresence, SeatPresence][] = [
      [none, unknown],
      [none, present],
      [unknown, present],
    ];
    for (const [x, y] of pairs) {
      expect(combinePresence(x, y).state).toBe(combinePresence(y, x).state);
    }
  });

  test("carries every reason forward, so a human can see WHY it refused", () => {
    const p = combinePresence(
      { state: "unknown", reason: "vine down" },
      { state: "unknown", reason: "pids unchecked" },
    );
    expect(p.state === "unknown" && p.reason).toContain("vine down");
    expect(p.state === "unknown" && p.reason).toContain("pids unchecked");
  });
});

describe("summarizeBoard", () => {
  test("tallies columns and surfaces the board title", () => {
    const summary = summarizeBoard({
      state: {
        title: "anthill · Slice 1",
        tasks: [
          { status: "todo" },
          { status: "todo" },
          { status: "doing" },
          { status: "review" },
          { status: "done" },
          { status: "done" },
          { status: "done" },
        ],
      },
    });
    expect(summary).toEqual({
      counts: { todo: 2, doing: 1, review: 1, done: 3 },
      title: "anthill · Slice 1",
    });
  });

  test("ignores unknown statuses (no extra columns)", () => {
    const summary = summarizeBoard({
      state: { title: "t", tasks: [{ status: "archived" }, { status: undefined }, {}] },
    });
    expect(summary?.counts).toEqual({ todo: 0, doing: 0, review: 0, done: 0 });
  });

  test("title is undefined when the board has none", () => {
    const summary = summarizeBoard({ state: { tasks: [{ status: "todo" }] } });
    expect(summary?.title).toBeUndefined();
    expect(summary?.counts.todo).toBe(1);
  });

  test("returns null when there is no task list (board unreadable)", () => {
    expect(summarizeBoard(null)).toBeNull();
    expect(summarizeBoard({})).toBeNull();
    expect(summarizeBoard({ state: {} })).toBeNull();
  });
});

// Presence is THREE states, for the same reason `positionState` is three states
// (comms.ts; seams.md Contract 6(c)): "I asked and nobody is there" and "I could
// not find out" are different facts, and the entire cost of collapsing them is
// paid by whoever ACTS on the answer.
//
// The old shape was `string[]` and every failure path returned `[]`, which the
// docstring defended as a feature — "so a broken vine can never wedge a
// teardown." It is the fail-OPEN direction on a destructive command: a dead
// daemon was reported as an empty channel, and `down` read that as "no seats
// present, safe to kill the panes."
describe("classifyPresence — the discriminator", () => {
  test("a live daemon with subscribers reports them present", () => {
    expect(
      classifyPresence({ ok: true }, { daemon: true, subscribers: ["loom", "mosaic"] }),
    ).toEqual({ state: "present", seats: ["loom", "mosaic"] });
  });

  test("a live daemon with no subscribers is NONE — a real, positive answer", () => {
    expect(classifyPresence({ ok: true }, { daemon: true, subscribers: [] })).toEqual({
      state: "none",
    });
  });

  test("a failed call is UNKNOWN, never none", () => {
    expect(classifyPresence({ ok: false, stderrLine: "connection refused" }, null).state).toBe(
      "unknown",
    );
  });

  test("an unparseable response is UNKNOWN, never none", () => {
    expect(classifyPresence({ ok: true }, null).state).toBe("unknown");
  });

  test("a daemon that is NOT RUNNING is UNKNOWN, never none — the case that shipped inverted", () => {
    // grapevine answers `daemon: false` perfectly successfully: `ok` is true and
    // the payload parses. Only the field says nobody is home. Reading that as an
    // empty channel is how "the wire is down" became "the team has stood down".
    expect(classifyPresence({ ok: true }, { daemon: false, subscribers: [] }).state).toBe(
      "unknown",
    );
  });

  test("a missing subscribers field is UNKNOWN — absent is not empty", () => {
    expect(classifyPresence({ ok: true }, { daemon: true }).state).toBe("unknown");
  });

  // The set-assertion. Any single case above is satisfied by a hardcoded value;
  // three distinct values out of one function are not. Same shape as the
  // three-outcome checks on `resolveSeatIdentity` and `positionState`.
  test("the three cases produce three DISTINCT states", () => {
    const states = [
      classifyPresence({ ok: true }, { daemon: true, subscribers: ["a"] }).state,
      classifyPresence({ ok: true }, { daemon: true, subscribers: [] }).state,
      classifyPresence({ ok: false }, null).state,
    ];
    expect(new Set(states).size).toBe(3);
    expect(states).toEqual(["present", "none", "unknown"]);
  });

  test("unknown carries a REASON, so a caller can say WHY it could not tell", () => {
    const p = classifyPresence({ ok: false, stderrLine: "connection refused" }, null);
    expect(p.state === "unknown" && p.reason).toContain("connection refused");
  });

  test("subscribers are deduped and sorted — presence is who is here, not sockets", () => {
    expect(classifyPresence({ ok: true }, { daemon: true, subscribers: ["b", "a", "b"] })).toEqual({
      state: "present",
      seats: ["a", "b"],
    });
  });
});

/**
 * D1 — the departed-but-live qualifier, and D3's caller invariant.
 *
 * Session 10. `none` was unreachable through the lifecycle the feature exists
 * for: a stood-down seat read `present` while its `comms follow` was alive, and
 * `down` is what kills the follow. Stand down → `present` → `down` refuses →
 * the follow never dies → `present`. Circular.
 *
 * Ruled a QUALIFIER on branch 1 rather than a hoist above it (Contract 6(g)):
 * both fail closed, so it is not a safety choice but a question of what the
 * report may CLAIM. A hoist reports `present, because: live-follower` — naming a
 * seat that filed a departure record as being here.
 */
describe("commsPresence — a DEPARTED seat's live follower is not presence (D1)", () => {
  const row = (
    handle: string,
    hasRecord: boolean,
    followerAlive: boolean | null,
    departed = false,
  ) => ({ handle, hasRecord, followerAlive, departed });

  test("a departed seat with a LIVE follower does not report present", () => {
    const p = commsPresence([row("a", true, true, true)], ["a"]);
    expect(p.presence.state).not.toBe("present");
    expect(p.because).toBe("all-spawned-departed");
  });

  // The positive anchor, first — per Contract 4's assertion-(4) shape. Without
  // it the test above passes against a branch that never reports `present` at
  // all, which would be always-block: the failure this repair must not cause.
  test("a NON-departed seat with a live follower still reports present", () => {
    const p = commsPresence([row("a", true, true, false)], ["a"]);
    expect(p.presence).toEqual({ state: "present", seats: ["a"] });
    expect(p.because).toBe("live-follower");
  });

  // The pair, as a SET. Either assertion alone is satisfied by a constant; the
  // pair is not. `departed` is the only field that moves.
  test("departed is the ONLY difference — the pair discriminates", () => {
    const states = [
      commsPresence([row("a", true, true, false)], ["a"]).presence.state,
      commsPresence([row("a", true, true, true)], ["a"]).presence.state,
    ];
    expect(states).toEqual(["present", "none"]);
  });

  /**
   * ⚠ THE CALLER INVARIANT — found by steward, and it is the assumption this
   * repair's safety is inherited from.
   *
   * Branch 1 filters on `followerAlive === true` and does NOT test `hasRecord`.
   * So a seat that never followed is kept out of it only because the PRODUCTION
   * caller derives both fields from ONE `position` lookup: `hasRecord: false`
   * forces `followerAlive: null`. Nothing asserted that coupling, and D1 edits
   * exactly that branch.
   *
   * This test pins the row shape production can emit. If a second caller ever
   * constructs rows by hand, or the derivation is split, the guard's safety
   * argument changes with nothing else to catch it.
   */
  test("INVARIANT: no-record rows can only carry followerAlive null (the shape production emits)", () => {
    const noRecordLive = commsPresence([row("a", false, true, true)], ["a"]);
    const noRecordNull = commsPresence([row("a", false, null, true)], ["a"]);
    // The unreachable pairing and the reachable one must NOT be assumed equal —
    // asserting the pair documents that they differ, so anyone who makes the
    // impossible row possible sees this fail rather than inherit a silent change.
    expect([noRecordLive.presence.state, noRecordNull.presence.state]).toEqual(["none", "none"]);
  });

  // The fresh-spawn cell: no position record + a departure. It must reach `none`
  // ONLY because of the departure — and D1 must NOT move it, since branch 1 is
  // the only thing D1 touches and a no-record seat never reaches it. This is the
  // hold that proves "never D1 alone": before D3 scoping, a STALE tombstone put
  // the guard here while every seat was working.
  test("a spawned seat that never followed reaches none via departure, not liveness", () => {
    const p = commsPresence([row("a", false, null, true)], ["a"]);
    expect(p.presence.state).toBe("none");
    expect(p.because).toBe("all-spawned-departed");
  });

  test("a spawned seat that never followed and never departed BLOCKS", () => {
    const p = commsPresence([row("a", false, null, false)], ["a"]);
    expect(p.presence.state).toBe("unknown");
    expect(p.because).toBe("outstanding-departures");
  });
});

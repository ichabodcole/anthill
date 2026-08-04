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
  const row = (handle: string, state: string, followerAlive: boolean | null) => ({
    handle,
    hasRecord: state !== "never-followed",
    followerAlive,
  });

  // The three states as a SET. Any one in isolation passes against a constant.
  test("distinguishes present / unknown / none from one function", () => {
    expect([
      commsPresence([row("a", "current", true)]).state,
      commsPresence([row("a", "current", null)]).state,
      commsPresence([row("a", "never-followed", null)]).state,
    ]).toEqual(["present", "unknown", "none"]);
  });

  // THE REGRESSION. This exact shape was live when the defect was found.
  test("reports the seats whose followers are alive", () => {
    const p = commsPresence([
      row("maestro", "current", true),
      row("forager", "current", true),
      row("weaver", "never-followed", null),
    ]);
    expect(p).toEqual({ state: "present", seats: ["forager", "maestro"] });
  });

  // Contract 6(f): `null` means NOT CHECKED and must never read as
  // checked-and-dead. Collapsing it into absence is how a live seat gets killed.
  test("an unCHECKED follower yields unknown, never none", () => {
    expect(commsPresence([row("a", "current", null)]).state).toBe("unknown");
  });

  // ...but a seat that never followed is a genuine, positively-observed absence
  // — otherwise every roster with an absent seat would be permanently unknown
  // and the guard would degrade into "always block", which is the prediction
  // the brief made and the state that trains people to pass --force reflexively.
  test("a never-followed seat is absence, not uncertainty", () => {
    expect(
      commsPresence([row("a", "never-followed", null), row("b", "never-followed", null)]),
    ).toEqual({
      state: "none",
    });
  });

  test("a dead follower is absence — a checked pid IS an observation", () => {
    expect(commsPresence([row("a", "current", false)])).toEqual({ state: "none" });
  });

  test("one live follower outweighs any number of dead ones", () => {
    expect(commsPresence([row("a", "current", false), row("b", "current", true)]).state).toBe(
      "present",
    );
  });

  test("an empty roster is none, not a crash", () => {
    expect(commsPresence([])).toEqual({ state: "none" });
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

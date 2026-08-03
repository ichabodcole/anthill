import { describe, expect, test } from "bun:test";
import { classifyPresence, summarizeBoard } from "./team-support.ts";

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

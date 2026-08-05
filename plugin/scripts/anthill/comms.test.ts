import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  buildCommsIncantation,
  buildPositionsReport,
  commsDeparturePath,
  commsLogPath,
  commsPositionPath,
  encodeMessage,
  hasDeparted,
  nextMessageId,
  parseLog,
  positionState,
  resolveSeatIdentity,
  type SeatPosition,
} from "./comms.ts";

/**
 * These assertions ARE `seams.md` Contract 4's proof. They are numbered to match
 * it, and the numbering is load-bearing: assertion (4) is the success-path one,
 * and it exists because (1)–(3) can all be green while the success field was
 * never implemented — at which point the seat-identity wedge has silently
 * disappeared and nothing notices.
 *
 * The field is proven as a DISCRIMINATOR, not a constant: a hardcoded
 * "resolved-from-roster" passes assertion (4) alone and fails the set.
 */
const roster = [
  { handle: "forager", role: "hands (CLI/engine)", scope: "scripts/anthill/", spawn: true },
  { handle: "weaver", role: "skills", scope: "plugin/skills/", spawn: true },
];

describe("resolveSeatIdentity — (4) the success path states where identity came from", () => {
  test("a valid seat resolves with outcome resolved-from-roster", () => {
    const result = resolveSeatIdentity({ roster, handle: "forager" });
    expect(result.outcome).toBe("resolved-from-roster");
  });

  test("a resolved seat carries the roster's role and scope, not just the handle", () => {
    // Proves it READ the roster rather than echoing the string it was given —
    // role/scope cannot be recovered from `--as forager` alone.
    const result = resolveSeatIdentity({ roster, handle: "forager" });
    expect(result).toMatchObject({
      outcome: "resolved-from-roster",
      handle: "forager",
      role: "hands (CLI/engine)",
      scope: "scripts/anthill/",
    });
  });
});

describe("resolveSeatIdentity — (1) a handle that is not in the roster", () => {
  test("does not resolve", () => {
    const result = resolveSeatIdentity({ roster, handle: "ghost" });
    expect(result.outcome).toBe("not-a-seat");
  });

  test("enumerates the valid seats, so a typo is self-correcting (anthill#54)", () => {
    const result = resolveSeatIdentity({ roster, handle: "ghost" });
    expect(result.outcome).toBe("not-a-seat");
    if (result.outcome === "resolved-from-roster") throw new Error("unreachable");
    expect(result.error).toContain("forager");
    expect(result.error).toContain("weaver");
  });
});

describe("resolveSeatIdentity — (3) --as omitted never becomes an ambient identity", () => {
  // Asserted POSITIVELY. `not.toBe("resolved-from-roster")` would also pass if
  // the outcome were `undefined`, a typo, or a fourth value nobody intended —
  // negative inference proves only "not that one thing". Naming the expected
  // outcome is the same discipline this whole file exists to enforce, and it
  // had no business being absent from the file enforcing it.
  test("an undefined handle reports not-a-seat", () => {
    const result = resolveSeatIdentity({ roster, handle: undefined });
    expect(result.outcome).toBe("not-a-seat");
  });

  test("an empty handle reports not-a-seat", () => {
    const result = resolveSeatIdentity({ roster, handle: "" });
    expect(result.outcome).toBe("not-a-seat");
  });
});

describe("resolveSeatIdentity — (2) no config on disk", () => {
  test("a null roster reports no-config rather than resolving", () => {
    const result = resolveSeatIdentity({ roster: null, handle: "forager" });
    expect(result.outcome).toBe("no-config");
  });

  test("passes through the locator the config layer actually produced", () => {
    // NOT an absolute config path — the walk checked many places, so naming one
    // would be a fabrication. The honest locator is "<startDir> or any parent",
    // which is what `findConfigFile` already says. A test that supplies a
    // prettier input than reality certifies a message that will never occur.
    const result = resolveSeatIdentity({
      roster: null,
      handle: "forager",
      configSearch: "could not find .anthill/config.json in /private/tmp/probe or any parent.",
    });
    if (result.outcome === "resolved-from-roster") throw new Error("unreachable");
    expect(result.error).toContain("/private/tmp/probe or any parent");
  });

  test("no-config wins over not-a-seat — you cannot know it isn't a seat", () => {
    // Ordering matters: with no roster to check against, reporting "not a seat"
    // would be an assertion the tool is not entitled to make.
    const result = resolveSeatIdentity({ roster: null, handle: "ghost" });
    expect(result.outcome).toBe("no-config");
  });
});

describe("resolveSeatIdentity — the outcome is a discriminator, not a constant", () => {
  test("the three cases produce three distinct outcome values", () => {
    const outcomes = [
      resolveSeatIdentity({ roster, handle: "forager" }).outcome,
      resolveSeatIdentity({ roster, handle: "ghost" }).outcome,
      resolveSeatIdentity({ roster: null, handle: "forager" }).outcome,
    ];
    expect(new Set(outcomes).size).toBe(3);
  });
});

const msg = {
  id: 1,
  channel: "anthill-dev",
  from: "forager",
  role: "hands (CLI/engine)",
  text: "ratified as of #14",
  ts: 1785542176043,
};

describe("encodeMessage — an append-only log survives any message body", () => {
  test("encodes to exactly one line", () => {
    const line = encodeMessage(msg);
    expect(line.includes("\n")).toBe(false);
  });

  test("a message containing newlines still encodes to one line", () => {
    // The whole log format rests on this: a raw multi-line body would corrupt
    // every subsequent message's framing, not just its own.
    const line = encodeMessage({ ...msg, text: "## forager → maestro:\n\nline two\nline three" });
    expect(line.includes("\n")).toBe(false);
  });

  test("round-trips through parseLog with the body intact", () => {
    const text = "## forager → maestro:\n\nline two";
    const { messages } = parseLog(`${encodeMessage({ ...msg, text })}\n`);
    expect(messages[0]?.text).toBe(text);
  });
});

describe("parseLog — a detector reports damage, it does not throw", () => {
  test("reads every well-formed message", () => {
    const log = `${encodeMessage(msg)}\n${encodeMessage({ ...msg, id: 2 })}\n`;
    expect(parseLog(log).messages.map((m) => m.id)).toEqual([1, 2]);
  });

  test("ignores blank lines, including a trailing newline", () => {
    expect(parseLog(`${encodeMessage(msg)}\n\n`).messages).toHaveLength(1);
  });

  test("a corrupt line does not sink the messages around it", () => {
    const log = `${encodeMessage(msg)}\n{not json\n${encodeMessage({ ...msg, id: 3 })}\n`;
    expect(parseLog(log).messages.map((m) => m.id)).toEqual([1, 3]);
  });

  test("a corrupt line is reported as a warning rather than swallowed", () => {
    const { warnings } = parseLog(`${encodeMessage(msg)}\n{not json\n`);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("2");
  });

  test("an empty log is empty, not an error", () => {
    expect(parseLog("")).toEqual({ messages: [], warnings: [] });
  });
});

describe("nextMessageId — ids are dense and monotonic", () => {
  test("the first message in an empty channel is 1", () => {
    expect(nextMessageId([])).toBe(1);
  });

  test("continues from the highest existing id", () => {
    expect(
      nextMessageId([
        { ...msg, id: 1 },
        { ...msg, id: 2 },
      ]),
    ).toBe(3);
  });

  test("is driven by the max id, not the message count", () => {
    // A dropped or hand-deleted line must never cause an id to be REUSED —
    // `read <id>` would then resolve two different messages.
    expect(
      nextMessageId([
        { ...msg, id: 1 },
        { ...msg, id: 7 },
      ]),
    ).toBe(8);
  });
});

describe("buildCommsIncantation — the emitted value the consumer renders verbatim", () => {
  const base = {
    cliPath: "/plugin/scripts/anthill/cli.ts",
    channel: "anthill-dev",
    handle: "forager",
  };

  test("is fully resolved — the handle is already interpolated", () => {
    // Contract 4(a): the consumer renders this verbatim and never interpolates.
    // A template reaching the consumer IS the seam violation.
    expect(buildCommsIncantation(base)).toContain("--as forager");
  });

  test("names the channel, so the consumer never resolves it", () => {
    expect(buildCommsIncantation(base)).toContain("anthill-dev");
  });

  test("uses the streaming verb, not the terminating one", () => {
    expect(buildCommsIncantation(base)).toContain("follow");
  });

  test("carries NO grep filter — verbatim means verbatim (F3)", () => {
    // `follow` emits no keepalives, so there is nothing to filter. The two
    // silent-failure modes the other wires carry (plain `grep` swallowing an
    // alternation, block buffering withholding frames) both exist only because
    // a filter was needed at all.
    expect(buildCommsIncantation(base)).not.toContain("grep");
  });

  test("is a single line an agent can run as-is", () => {
    expect(buildCommsIncantation(base).includes("\n")).toBe(false);
  });
});

describe("commsLogPath", () => {
  test("puts a channel's log under the team dir", () => {
    expect(commsLogPath("/repo/.anthill", "anthill-dev")).toBe(
      "/repo/.anthill/comms/anthill-dev.ndjson",
    );
  });

  test("rejects a channel name that would escape the comms dir", () => {
    // A channel name reaches this from config and from `--channel`; a traversal
    // would write the log wherever the caller pointed it.
    expect(() => commsLogPath("/repo/.anthill", "../../etc/passwd")).toThrow();
  });
});

describe("positionState — the slice-two primitive's discriminator", () => {
  const pos = (emittedThrough: number): SeatPosition => ({
    handle: "forager",
    channel: "anthill-dev",
    emittedThrough,
    at: 1_785_621_000_000,
    pid: 4242,
  });

  /**
   * THREE distinguishable values, asserted as a set. Any one of these alone is
   * satisfied by a hardcoded return, so the discriminator is only proven by
   * showing the same function produce all three from different inputs — the
   * shape Contract 4's assertion (4) exists to enforce.
   */
  test("distinguishes never-followed, current and behind", () => {
    const states = [
      positionState(10, null),
      positionState(10, pos(10)),
      positionState(10, pos(7)),
    ].map((s) => s.state);
    expect(states).toEqual(["never-followed", "current", "behind"]);
    expect(new Set(states).size).toBe(3);
  });

  test("behind reports HOW FAR behind, not just that it is", () => {
    const s = positionState(10, pos(7));
    expect(s).toEqual({ state: "behind", emittedThrough: 7, behindBy: 3 });
  });

  test("never-followed is NOT behind-by-everything", () => {
    // A seat that never started a follow and a seat whose follow died at #3 are
    // different facts. Collapsing them is the ambiguity that made a NaN --since
    // indistinguishable from a quiet channel.
    expect(positionState(10, null)).toEqual({ state: "never-followed" });
    expect(positionState(10, null)).not.toHaveProperty("behindBy");
  });

  test("a QUIET channel leaves every live follower current — the control that fails if lag is measured by clock", () => {
    // The design's load-bearing claim. Wall-clock freshness would report this
    // follower stale purely because nobody has spoken; head-lag reports current
    // no matter how old `at` is, because the head has not moved either.
    const ancient = { ...pos(10), at: 0 };
    expect(positionState(10, ancient).state).toBe("current");
  });

  /**
   * REVISED, and the old version's REASON is why — it is not being discarded.
   *
   * It asserted ahead-of-head is `current`, on the grounds that a follower can
   * emit and then read the head an instant before another append. **That race is
   * real.** But treating its symptom as normal is exactly what hid F1: at
   * convene, six seats' records from a previous session survived the log's
   * deletion, `head` was 0, `gap` was 0 − 389 = **negative**, and every one of
   * them reported `current`, gap 0 — five of whom had never existed on that log.
   * **Rounding a negative up to the most reassuring state, on the wire whose
   * whole purpose is to stop silence being mistaken for safety.**
   *
   * So the race is CLOSED rather than tolerated: `comms positions` now reads
   * positions FIRST and the head SECOND, guaranteeing the head is >= anything a
   * position could have seen. The benign race can now only produce "behind by
   * 1"; a remaining negative is genuinely impossible for a live follower, and
   * `never-followed` is the honest classification because the tool has no idea
   * what that seat has seen.
   */
  test("a follower AHEAD of the head is an INCOHERENT record — never-followed, not current", () => {
    expect(positionState(9, pos(10)).state).toBe("never-followed");
  });

  test("F1: the convene scenario — a surviving record against a deleted log", () => {
    // The exact numbers the lead measured as the instrument's first user.
    const row = buildPositionsReport(
      0,
      [{ handle: "maestro", role: "lead" }],
      new Map([["maestro", { ...pos(389), handle: "maestro", pid: 424242 }]]),
      () => false,
    )[0];
    // Every field must refuse to reassure. `gap: 0` and `emittedThrough: 389`
    // were BOTH lies here — the second is what would make a reader believe the
    // first, so the row may not report a number it cannot stand behind.
    expect(row).toMatchObject({
      state: "never-followed",
      gap: null,
      emittedThrough: null,
      staleRecord: true,
    });
  });

  test("staleRecord distinguishes a surviving record from having never followed", () => {
    // Both are honestly `never-followed` about what the TOOL KNOWS, and they are
    // different facts about the WORLD. Collapsing them would throw away the free
    // mechanical tell that nothing was looking at.
    const seats = [{ handle: "a", role: "r" }];
    const never = buildPositionsReport(5, seats, new Map([["a", null]]), () => null)[0];
    const stale = buildPositionsReport(
      5,
      seats,
      new Map([["a", { ...pos(99), handle: "a" }]]),
      () => null,
    )[0];
    expect([never?.state, never?.staleRecord]).toEqual(["never-followed", false]);
    expect([stale?.state, stale?.staleRecord]).toEqual(["never-followed", true]);
  });

  test("staleRecord is FALSE, not absent, on healthy rows — an absent flag is unreadable", () => {
    const rows = buildPositionsReport(
      10,
      [
        { handle: "cur", role: "r" },
        { handle: "beh", role: "r" },
      ],
      new Map([
        ["cur", { ...pos(10), handle: "cur" }],
        ["beh", { ...pos(7), handle: "beh" }],
      ]),
      () => true,
    );
    expect(rows.map((r) => r.staleRecord)).toEqual([false, false]);
    expect(rows.map((r) => r.state)).toEqual(["current", "behind"]);
  });
});

describe("commsPositionPath — it becomes a filename", () => {
  test("puts each seat in its own file under the channel's positions dir", () => {
    const p = commsPositionPath("/team", "anthill-dev", "forager");
    expect(p.endsWith("/comms/anthill-dev.positions/forager.json")).toBe(true);
  });

  test("refuses a handle that would escape the comms dir", () => {
    // The handle comes from the roster, not argv — but "it came from config" is
    // not a charset guarantee, and this value is concatenated into a path.
    expect(() => commsPositionPath("/team", "anthill-dev", "../../etc/passwd")).toThrow(
      /unsafe seat handle/,
    );
    expect(() => commsPositionPath("/team", "../evil", "forager")).toThrow(/unsafe channel/);
  });
});

// The CROSS-SEAT read. The producer (`positionState`) was already a three-value
// discriminator; the defect this file has recorded twice is a CONSUMER one
// case away, flattening those three into a scalar. So the gap is asserted as a
// SET here, not one case at a time — my own scar: I asserted the three states
// on the producer and then checked the consumer's fields one case at a time,
// and the collapse happened in the derivation of the number.
function firstRow<T>(rows: T[]): T {
  const r = rows[0];
  if (!r) throw new Error("expected at least one row");
  return r;
}

describe("buildPositionsReport — the consumer must not flatten what the producer distinguished", () => {
  const alpha = { handle: "alpha", role: "hands" };
  const seats = [alpha, { handle: "beta", role: "verify" }, { handle: "gamma", role: "lead" }];
  const at = (emittedThrough: number, pid = 1) => ({
    handle: "x",
    channel: "c",
    emittedThrough,
    at: 0,
    pid,
  });

  test("gap is null / 0 / N across the three states — asserted as a SET", () => {
    const rows = buildPositionsReport(
      10,
      seats,
      new Map([
        ["alpha", null], // never followed
        ["beta", at(10)], // current
        ["gamma", at(7)], // behind by 3
      ]),
    );
    expect(rows.map((r) => r.gap)).toEqual([null, 0, 3]);
    expect(rows.map((r) => r.state)).toEqual(["never-followed", "current", "behind"]);
  });

  test("a never-followed seat reports gap NULL, never 0 — the claim it may not make", () => {
    const row = firstRow(buildPositionsReport(99, [alpha], new Map([["alpha", null]])));
    expect(row.gap).toBeNull();
    expect(row.emittedThrough).toBeNull();
    // 0 would assert "you missed nothing" about a seat that may have read the
    // entire log via `read`, which records nothing by design.
    expect(row.gap).not.toBe(0);
  });

  test("a seat with no entry in the map is never-followed, not an error", () => {
    const row = firstRow(buildPositionsReport(5, [alpha], new Map()));
    expect(row.state).toBe("never-followed");
    expect(row.gap).toBeNull();
  });

  // The QUIET-CHANNEL control. This is the assertion that fails if anyone ever
  // "simplifies" liveness to wall-clock freshness — `at: 0` is 1970 and the row
  // must still be current, because the head has not moved. Freshness measures
  // the traffic, not the wire.
  test("an ancient `at` is still CURRENT when the head has not moved", () => {
    const row = firstRow(buildPositionsReport(4, [alpha], new Map([["alpha", at(4)]])));
    expect(row.state).toBe("current");
    expect(row.gap).toBe(0);
  });

  test("followerAlive is advisory and NEVER contradicts state", () => {
    const row = firstRow(
      buildPositionsReport(4, [alpha], new Map([["alpha", at(4, 424242)]]), () => false),
    );
    // A dead pid means emittedThrough is a high-water mark, not a live reading
    // — but the seat is still arithmetically current, and the report says both
    // rather than resolving them into one verdict.
    expect(row.state).toBe("current");
    expect(row.gap).toBe(0);
    expect(row.followerAlive).toBe(false);
  });

  test("followerAlive is null when no liveness probe is supplied — not false", () => {
    const row = firstRow(buildPositionsReport(4, [alpha], new Map([["alpha", at(4)]])));
    // "not checked" and "checked, dead" must not look alike. This is the same
    // rule as gap null-vs-0, one field over.
    expect(row.followerAlive).toBeNull();
  });

  test("carries the roster role, so a reader need not re-resolve identity", () => {
    const rows = buildPositionsReport(1, seats, new Map());
    expect(rows.map((r) => r.role)).toEqual(["hands", "verify", "lead"]);
  });
});

/**
 * D3 — a departure is scoped to THIS session, and the tombstone lifetime bug.
 *
 * Session 10, measured on the real tree before a line was changed: four
 * session-9 tombstones sat on disk for exactly the four seats then working.
 * `hasDeparted` was a bare `existsSync`, so Contract 6(g)'s conjunct — *every
 * spawned seat has departed* — was satisfied by files nobody wrote that
 * session, and `commsPresence` returned `none` / `all-spawned-departed`:
 * **teardown authorised while four seats worked.** Remove only those files, one
 * variable, and it returns `unknown`.
 *
 * **A mask fails safe; a stale departure fails OPEN.** Nothing here deletes a
 * tombstone — session 9's records are the only copy of what its retro cites.
 */
describe("hasDeparted — a PAST session's tombstone is not this session's departure (D3)", () => {
  const OPENED_AT = 1_785_911_170_127; // this session's real openedAt
  const STALE = 1_785_900_211_050; // the real session-9 forager tombstone, 3.04h earlier

  const tree = (at: number | null) => {
    const dir = mkdtempSync(join(tmpdir(), "anthill-d3-"));
    if (at !== null) {
      const path = commsDeparturePath(dir, "ch", "seat");
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `${JSON.stringify({ handle: "seat", channel: "ch", at })}\n`);
    }
    return dir;
  };

  // The discriminator, asserted as a SET. Any single row is satisfied by a
  // hardcoded `false`; the set is not — and the FIRST element is the positive
  // anchor, without which a permanently-false predicate passes everything else
  // here and `none` becomes unreachable (always-block, which trains --force).
  test("stale / fresh / absent produce three distinct answers", () => {
    expect([
      hasDeparted(tree(OPENED_AT + 60_000), "ch", "seat", OPENED_AT), // departed THIS session
      hasDeparted(tree(STALE), "ch", "seat", OPENED_AT), // session 9's tombstone
      hasDeparted(tree(null), "ch", "seat", OPENED_AT), // never departed
    ]).toEqual([true, false, false]);
  });

  // The real numbers from the incident, so the case is the one that happened
  // rather than a synthetic pair either side of an arbitrary line.
  test("the session-9 tombstone does not count against session 10 (the live case)", () => {
    expect(hasDeparted(tree(STALE), "ch", "seat", OPENED_AT)).toBe(false);
  });

  // `>=`, not `>`. Stated as an assertion because the boundary is exactly the
  // kind of thing a later "tidy" flips without anything noticing.
  test("a departure stamped AT the session origin counts — the boundary is inclusive", () => {
    expect(hasDeparted(tree(OPENED_AT), "ch", "seat", OPENED_AT)).toBe(true);
  });

  /**
   * Fail-safe in every direction that is not a positive, in-session departure.
   * `false` BLOCKS teardown, so an unreadable world must never authorise a kill.
   * A session-open record written before `openedAt` existed yields `null` here —
   * that is the upgrade path, not a hypothetical.
   */
  test("no session origin, or a damaged record, is NOT a departure", () => {
    const withRecord = tree(OPENED_AT + 60_000);
    expect(hasDeparted(withRecord, "ch", "seat", null)).toBe(false);

    const damaged = mkdtempSync(join(tmpdir(), "anthill-d3-bad-"));
    const path = commsDeparturePath(damaged, "ch", "seat");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "{not json");
    expect(hasDeparted(damaged, "ch", "seat", OPENED_AT)).toBe(false);

    // A record with no `at` at all — the pre-D3 tombstone shape.
    const noAt = mkdtempSync(join(tmpdir(), "anthill-d3-noat-"));
    const p2 = commsDeparturePath(noAt, "ch", "seat");
    mkdirSync(dirname(p2), { recursive: true });
    writeFileSync(p2, `${JSON.stringify({ handle: "seat", channel: "ch" })}\n`);
    expect(hasDeparted(noAt, "ch", "seat", OPENED_AT)).toBe(false);
  });
});

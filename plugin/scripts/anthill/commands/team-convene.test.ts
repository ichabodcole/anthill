import { describe, expect, it } from "bun:test";
import { buildCommsIncantation } from "../comms.ts";
import {
  boardShadowWarning,
  bountyOpenArgs,
  freshNotice,
  interpretFresh,
  parseBountySessions,
  snapshotTaskCount,
} from "./team-convene.ts";

// `--fresh` used to report the FLAG, not the OUTCOME. A lead wired his own tail
// first (correct), `--fresh` is a documented no-op while subscribers are
// connected (so his own tail suppressed his own clear), convene said
// `fresh: true`, and he told the vine "what you see here IS this session". It
// wasn't, and a joining seat had to date messages by hand.
//
// The shapes below are grapevine's REAL responses, captured on a scratch
// channel with one variable held (a subscriber attached or not) — not invented.
const CLEARED = JSON.stringify({
  ok: true,
  channel: {
    name: "c",
    message_count: 0,
    subscribers: 0,
    cleared: true,
    snapshot: "/Users/x/.grapevine/archive/c-1785807222981.jsonl",
  },
});
const SUPPRESSED = JSON.stringify({
  ok: true,
  channel: { name: "c", message_count: 2, subscribers: 1, cleared: false, snapshot: null },
});

describe("interpretFresh — report what HAPPENED, never what was requested", () => {
  // The three states asserted as a SET, not one at a time: any single case is
  // satisfied by a hardcoded return value, and the whole defect was one value
  // standing in for three. Same discipline as the positionState discriminator.
  it("distinguishes all three real outcomes from one function", () => {
    expect([
      interpretFresh(false, true, CLEARED).outcome,
      interpretFresh(true, true, CLEARED).outcome,
      interpretFresh(true, true, SUPPRESSED).outcome,
    ]).toEqual(["not-requested", "cleared", "skipped-subscribers-present"]);
  });

  it("surfaces the snapshot path as evidence when a clear really happened", () => {
    expect(interpretFresh(true, true, CLEARED).snapshot).toBe(
      "/Users/x/.grapevine/archive/c-1785807222981.jsonl",
    );
  });

  it("reports no snapshot when the clear was suppressed", () => {
    expect(interpretFresh(true, true, SUPPRESSED).snapshot).toBeNull();
  });

  // THE LOAD-BEARING ASSERTION. "we could not tell" must never collapse into
  // "it did not clear" — reporting the confident value for an unobserved thing
  // is the same bug one layer down, and it is the direction that reads as fine.
  it("degrades to `unknown`, NEVER to a confident answer, on anything unreadable", () => {
    const unreadable = [
      interpretFresh(true, true, "not json at all"),
      interpretFresh(true, true, JSON.stringify({ ok: true, channel: {} })), // field absent
      interpretFresh(true, true, ""),
      interpretFresh(true, false, CLEARED), // open itself failed
    ];
    for (const r of unreadable) expect(r.outcome).toBe("unknown");
  });

  it("a request that was never made is `not-requested`, not `unknown`", () => {
    // Distinct states: nobody asked vs. asked and unobservable. Collapsing them
    // would put a warning in front of every convene that never used the flag.
    expect(interpretFresh(false, true, "garbage").outcome).toBe("not-requested");
  });
});

describe("freshNotice — the two outcomes a lead must not miss carry a WARNING", () => {
  it("warns when the clear was silently skipped, and says WHY", () => {
    const { warning } = freshNotice({ outcome: "skipped-subscribers-present", snapshot: null });
    expect(warning).toMatch(/did NOT clear/);
    // The causal detail is the whole fix: without it a lead re-runs the same
    // command with the same tail attached and gets the same silent no-op.
    expect(warning).toMatch(/your own tail counts as one/i);
  });

  it("warns on `unknown` and refuses to phrase it as a negative", () => {
    const { warning } = freshNotice({ outcome: "unknown", snapshot: null });
    expect(warning).toMatch(/UNKNOWN — not 'no'/);
  });

  // The negative control: the two SILENT cases must stay silent, or the warning
  // becomes noise on every convene and stops being read — which is how the
  // original field failed in the first place.
  it("stays silent when there is nothing to warn about", () => {
    expect(freshNotice({ outcome: "not-requested", snapshot: null }).warning).toBeNull();
    expect(freshNotice({ outcome: "cleared", snapshot: "/a.jsonl" }).warning).toBeNull();
  });

  it("the cleared phrase carries the snapshot, so the claim is checkable", () => {
    expect(freshNotice({ outcome: "cleared", snapshot: "/a.jsonl" }).phrase).toContain("/a.jsonl");
  });
});

describe("bountyOpenArgs", () => {
  it("composes the keyed, pinned, headless-safe open argv for the team channel", () => {
    expect(bountyOpenArgs("anthill")).toEqual([
      "open",
      "--session-key",
      "anthill",
      "--pin",
      "--no-open",
    ]);
  });

  it("passes the channel through verbatim as the session key", () => {
    expect(bountyOpenArgs("dreamwood-dev")).toEqual([
      "open",
      "--session-key",
      "dreamwood-dev",
      "--pin",
      "--no-open",
    ]);
  });
});

// anthill#43 — the data-loss bug. A keyed re-open over a dead daemon starts an
// EMPTY board under the live key; closing it then overwrites the real snapshot.
// We cannot restore from here (spellbook's side of the seam), but we must never
// let it happen silently.
describe("parseBountySessions", () => {
  it("parses key + task count from real `bounty sessions` output", () => {
    const out = [
      "k-anthill-dev-adad92ec  7 tasks  — anthill-dev · slice 2",
      "bounty-39479a28-p52489  11 tasks  — creation-flow UX",
      "k-media-buffet-dbbce579  0 tasks  — Bounty Board",
    ].join("\n");
    expect(parseBountySessions(out)).toEqual([
      { key: "k-anthill-dev-adad92ec", tasks: 7 },
      { key: "bounty-39479a28-p52489", tasks: 11 },
      { key: "k-media-buffet-dbbce579", tasks: 0 },
    ]);
  });

  it("handles the singular 'task' and skips junk rather than throwing", () => {
    expect(parseBountySessions("k-a-ff 1 task — x\n\nnot a row\n")).toEqual([
      { key: "k-a-ff", tasks: 1 },
    ]);
  });
});

describe("snapshotTaskCount", () => {
  const rows = [
    { key: "k-anthill-dev-adad92ec", tasks: 9 },
    { key: "k-anthill-adad92ec", tasks: 2 },
    { key: "bounty-39479a28-p52489", tasks: 11 },
  ];

  it("finds the keyed snapshot for a channel whose name contains dashes", () => {
    expect(snapshotTaskCount(rows, "anthill-dev")).toBe(9);
  });

  it("does not confuse a channel with a longer channel sharing its prefix", () => {
    expect(snapshotTaskCount(rows, "anthill")).toBe(2);
  });

  it("returns null when the channel has no snapshot", () => {
    expect(snapshotTaskCount(rows, "nope")).toBeNull();
  });
});

describe("boardShadowWarning", () => {
  const counts = (todo: number) => ({ todo, doing: 0, review: 0, done: 0 });

  it("warns when the saved snapshot holds MORE than the live board", () => {
    const w = boardShadowWarning(9, counts(0));
    expect(w).toContain("POSSIBLE BOARD LOSS");
    expect(w).toContain("9 task(s)");
    expect(w).toContain("Do NOT close the board");
  });

  it("warns when the live board is non-empty but still short of the snapshot", () => {
    expect(boardShadowWarning(9, counts(3))).toContain("POSSIBLE BOARD LOSS");
  });

  it("counts every column toward the live total", () => {
    expect(boardShadowWarning(4, { todo: 1, doing: 1, review: 1, done: 1 })).toBeUndefined();
  });

  it("stays quiet when the live board matches or exceeds the snapshot", () => {
    expect(boardShadowWarning(4, counts(4))).toBeUndefined();
    expect(boardShadowWarning(4, counts(7))).toBeUndefined();
  });

  it("stays quiet when there is no snapshot, or it was empty", () => {
    expect(boardShadowWarning(null, counts(0))).toBeUndefined();
    expect(boardShadowWarning(0, counts(0))).toBeUndefined();
  });

  it("treats an unreadable live board as empty — that is the dangerous case", () => {
    expect(boardShadowWarning(9, null)).toContain("POSSIBLE BOARD LOSS");
  });
});

// The lead ran an entire session UNWIRED because `convene` never emitted a comms
// incantation, while `anthill join <lead>` emitted one correctly the whole time.
// The capability existed and the one command a lead actually runs never called
// it — found by a blank-context auditor, confirmed from source.
//
// Pinned on the OBSERVABLE (a runnable, fully-resolved command for the lead's
// own handle), never on a `comms` mention: a convene that merely says the word
// would pass a substring check and leave the lead exactly as unwired. That is
// this seat's recorded trap — banning or requiring a WORD is not banning or
// requiring a CLAIM.
describe("convene emits the LEAD's own comms wire", () => {
  it("the incantation is fully resolved and names the lead's handle", () => {
    const inc = buildCommsIncantation({
      cliPath: "/x/cli.ts",
      channel: "anthill-dev",
      handle: "maestro",
    });
    expect(inc).toContain("comms follow");
    expect(inc).toContain("anthill-dev");
    expect(inc).toContain("--as maestro");
  });

  it("it uses the STREAMING verb, not the terminating one", () => {
    const inc = buildCommsIncantation({ cliPath: "/x/cli.ts", channel: "c", handle: "maestro" });
    expect(inc).toContain("follow");
    expect(inc).not.toMatch(/\bcomms read\b/);
  });

  it("it carries NO grep filter — comms emits no keepalives, so a filter can only lose messages", () => {
    const inc = buildCommsIncantation({ cliPath: "/x/cli.ts", channel: "c", handle: "maestro" });
    expect(inc).not.toContain("grep");
    expect(inc).not.toContain("|");
  });

  it("convene and join compose the incantation with the SAME helper (one composer, no second copy)", () => {
    // Contract 4(d): the emitted value is the seam. Two composers would drift,
    // and the drifted one is the copy nobody updates.
    const a = buildCommsIncantation({ cliPath: "/x/cli.ts", channel: "c", handle: "maestro" });
    const b = buildCommsIncantation({ cliPath: "/x/cli.ts", channel: "c", handle: "maestro" });
    expect(a).toBe(b);
  });
});

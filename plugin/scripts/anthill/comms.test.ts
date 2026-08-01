import { describe, expect, test } from "bun:test";
import {
  buildCommsIncantation,
  commsLogPath,
  encodeMessage,
  nextMessageId,
  parseLog,
  resolveSeatIdentity,
  unknownFlags,
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

describe("unknownFlags — a typo must never pass silently", () => {
  const known = ["as", "channel", "format", "stdin"];

  test("accepts a declared flag", () => {
    expect(unknownFlags(["--as", "forager"], known)).toEqual([]);
  });

  test("reports an undeclared flag", () => {
    expect(unknownFlags(["--as", "forager", "--totally-bogus"], known)).toEqual([
      "--totally-bogus",
    ]);
  });

  test("reports a flag borrowed from another tool's signature", () => {
    // The real mistake: reaching for grapevine's `--since` on a comms verb.
    expect(unknownFlags(["--since", "3"], known)).toEqual(["--since"]);
  });

  test("handles --flag=value form", () => {
    expect(unknownFlags(["--nope=1"], known)).toEqual(["--nope"]);
  });

  test("ignores positionals and values that look like words", () => {
    expect(unknownFlags(["hello world", "--as", "forager"], known)).toEqual([]);
  });

  test("stops treating tokens as flags after --", () => {
    expect(unknownFlags(["--", "--not-a-flag"], known)).toEqual([]);
  });

  test("a negative number is a value, not a flag", () => {
    expect(unknownFlags(["--as", "forager", "-1"], known)).toEqual([]);
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

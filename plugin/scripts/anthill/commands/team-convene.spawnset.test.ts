import { describe, expect, mock, test } from "bun:test";

/**
 * Criterion 2, the absence-of-OPENING half: `convene` must not stand up the
 * grapevine. Artifact specified and mutation-proven by sentinel (comms #702,
 * #709); pinned here. Cards `t-7bc57308`-adjacent — sentinel's S12-2.
 *
 * ⚠ ASSERT THE WHOLE SPAWN SET, NEVER `not.toContain("grapevine")`, and the
 * reason is measured rather than stylistic:
 *
 *   IN CI THERE IS NO SPELLBOOK CACHE. `resolveCoordCli` throws, `convene`
 *   catches it into `warnings`, and the ledger is EMPTY.
 *
 *     expect(ledger).not.toContain("grapevine")   -> PASSES on []   <- vacuous
 *     expect(ledger).toEqual([...the 3 bounty verbs]) -> FAILS on []
 *
 * The membership form is green in the exact world where the command never ran
 * — a positive control that passes in the world it exists to detect, which is
 * what a blank-context stranger found in this team's own fixture in session 8.
 * The three bounty entries ARE this assertion's positive control, carried
 * inside it rather than bolted beside it.
 *
 * Second reason, and it is the one that survives a rename: membership is an
 * enumeration of ONE, so it catches the vine only under that name. Set
 * equality fails on ANY new external invocation, whatever it is called.
 *
 * ⚠ BOUND — do not quote this test wider than it measures. The ledger observes
 * exactly one boundary: spawns routed through `execCoord`. A direct spawn of an
 * absolute path, a `Bun.spawn` outside the coord layer, or an in-process call
 * to a running daemon is INVISIBLE here. The honest claim is "convene makes no
 * vine invocation through the coordination layer", NOT "convene cannot touch
 * the vine." (sentinel's residue statement, kept at his width.)
 *
 * Cross-checked against a second, independent leg before landing: a PATH shim
 * on `bun` recording every child argv at the real process boundary (sentinel's
 * L2). L1 and L2 agree on 3 of 3 shared cells and both discriminate the mutant.
 * L2 needs a live spellbook so it cannot run in CI; this leg replicates the
 * boundary instead of crossing it, which is why the agreement mattered.
 */

const calls: string[] = [];

// `mock.module` replaces the module WHOLESALE — every export that `convene`
// (and `team-support.ts`, which resolves the same specifier) imports must be
// named here. Spreading the real module does NOT work: inside this context the
// import resolves to the already-mocked module and yields nothing. Measured by
// sentinel at the cost of a session; taken as measured, not re-derived.
mock.module("../coord.ts", () => ({
  resolveCoordCli: (tool: string) => `<${tool}-cli>`,
  execCoord: async (cli: string, args: string[]) => {
    calls.push(`${cli} ${args.join(" ")}`);
    return { ok: true, exitCode: 0, stdout: "{}", stderr: "" };
  },
  firstErrorLine: (s: string, fallback: string) => s || fallback,
  parseJsonLine: () => null,
}));

describe("convene's coordination spawn set — criterion 2, absence of OPENING", () => {
  test("invokes EXACTLY the bounty verbs — the SET, not the absence of a member", async () => {
    const { teamConveneCommand } = await import("./team-convene.ts");
    // `run` is optional on CommandDef (a group may only dispatch subcommands),
    // so assert it exists rather than reaching through it — the prototype this
    // was adapted from passed `bun test`, which does not typecheck, and tsc
    // rejected it. Asserting also makes "convene lost its run()" a named
    // failure instead of a confusing undefined-call.
    const run = teamConveneCommand.run;
    expect(typeof run).toBe("function");
    calls.length = 0;
    await run?.({ args: { format: "json" } } as never);

    // `team-support.ts`'s readBoardCounts -> `bounty state` lands in the same
    // ledger, and that third entry is not a bonus: it is part of why this
    // assertion has a positive control at all.
    expect(calls).toEqual([
      "<bounty-cli> sessions",
      "<bounty-cli> open --session-key anthill-dev --pin --no-open",
      "<bounty-cli> state",
    ]);
  });

  test("the ledger is NON-EMPTY — the control that makes the equality mean something", async () => {
    // Stated as its own assertion rather than trusted as a side effect of the
    // one above: an empty ledger would satisfy any membership check, and this
    // is the cell that fails first if the harness ever stops recording.
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c.startsWith("<bounty-cli> "))).toBe(true);
  });
});

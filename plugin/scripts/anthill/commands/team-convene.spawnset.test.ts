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

/**
 * Drive the real `run()` once and return the ledger it produced.
 *
 * ⚠ EACH TEST CALLS THIS FOR ITSELF. An earlier draft populated the ledger in
 * test 1 and read it in test 2, so test 2 passed only while its sibling ran
 * first and FAILED IN ISOLATION (found by steward, comms #752). That is this
 * seat's own recorded rule — an assertion must positively pin its subject
 * WITHIN the same test, because the sibling it silently leans on is exactly
 * what a later refactor or a `--test-name-pattern` run removes. It failed
 * safe, but a test that depends on execution order is not evidence about the
 * code; it is evidence about the runner.
 */
async function conveneLedger(): Promise<{ ledger: string[]; emitted: string }> {
  const { teamConveneCommand } = await import("./team-convene.ts");
  // `run` is optional on CommandDef (a group may only dispatch subcommands),
  // so assert it exists rather than reaching through it — the prototype this
  // was adapted from passed `bun test`, which does not typecheck, and tsc
  // rejected it. Asserting also makes "convene lost its run()" a named failure
  // instead of a confusing undefined-call.
  const run = teamConveneCommand.run;
  expect(typeof run).toBe("function");
  calls.length = 0;

  // ⚠ CAPTURE stdout for the duration. Driving the real `run()` makes it
  // `emit()` a PRODUCTION-SHAPED envelope into the middle of `bun test`'s
  // output — naming the live channel, with `board: null` and a "bounty board
  // not running" warning. weaver stopped a land to check whether the team's
  // board had died, and was one command from posting "the board is down"
  // (comms #747).
  //
  // The finding is the shape, not the incident: THE GATE'S STDOUT IS THE ONE
  // SURFACE EVERY SEAT READS, and a test that prints a production envelope
  // into it is indistinguishable from the real thing at a glance.
  //
  // Restored in `finally` — if an assertion throws while stdout is patched,
  // every later test in the run goes silent and the suite's own output becomes
  // untrustworthy, which is a worse defect than the one being fixed.
  const realWrite = process.stdout.write.bind(process.stdout);
  const chunks: string[] = [];
  process.stdout.write = ((chunk: unknown) => {
    chunks.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  try {
    await run?.({ args: { format: "json" } } as never);
  } finally {
    process.stdout.write = realWrite;
  }
  return { ledger: [...calls], emitted: chunks.join("") };
}

describe("convene's coordination spawn set — criterion 2, absence of OPENING", () => {
  test("invokes EXACTLY the bounty verbs — the SET, not the absence of a member", async () => {
    const { ledger, emitted } = await conveneLedger();

    // The capture is not merely suppression — it is the positive control that
    // the command actually RAN and emitted. A silent stdout would mean `run()`
    // did nothing, in which case the equality below would be passing over an
    // empty set for the wrong reason — the exact vacuity this test exists to
    // prevent.
    expect(emitted).toContain(`"command":"convene"`);

    // `team-support.ts`'s readBoardCounts -> `bounty state` lands in the same
    // ledger, and that third entry is not a bonus: it is part of why this
    // assertion has a positive control at all.
    expect(ledger).toEqual([
      "<bounty-cli> sessions",
      "<bounty-cli> open --session-key anthill-dev --pin --no-open",
      "<bounty-cli> state",
    ]);
  });

  test("the ledger is NON-EMPTY and wholly bounty — self-contained, runs alone", async () => {
    // Drives its OWN run. An empty ledger satisfies any membership check, so
    // this is the cell that fails first if the harness ever stops recording —
    // which only means anything if it cannot inherit a populated ledger from
    // the test above.
    const { ledger } = await conveneLedger();
    expect(ledger.length).toBeGreaterThan(0);
    expect(ledger.every((c) => c.startsWith("<bounty-cli> "))).toBe(true);
  });
});

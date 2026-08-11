import { beforeAll, describe, expect, mock, test } from "bun:test";

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

/**
 * ⚠ CAPTURED AT LOAD TIME, ON PURPOSE — this is the fix for a CI-only red.
 *
 * `team-down.command-path.test.ts` installs `mock.module("./team-support.ts", …)`
 * with a stub `requireConfig` that returns `{channel, seats, grounding}` — no
 * `paths`, no `lead`. `team-convene.ts` imports `requireConfig` from that same
 * module, and its `run()` does:
 *
 *     config.lead ? config.seatDocPath(config.lead) : `${config.paths.seatDir}/…`
 *
 * Against that stub, `lead` is falsy so the else-branch runs and `config.paths`
 * is undefined:
 *
 *     TypeError: undefined is not an object (evaluating 'config.paths.seatDir')
 *     at run (team-convene.ts:181)      <- CI, run 31058632391, BOTH cells
 *
 * 🔴 **IT PASSED ON darwin AND FAILED ON LINUX, AND THE VARIABLE IS FILE ORDER.**
 * The suite's own file order comes from the runner, so `bun run check` being
 * green locally was **luck, not evidence** — the merge-result gate could not
 * catch it either, because the merge result is green here too.
 *
 * ⚠ THE MECHANISM IS NOT FULLY EXPLAINED AND I AM SAYING SO RATHER THAN
 * IMPLYING IT IS. A reduced probe (mock installed in an earlier file, consumed
 * by a separate module, dynamic import — the same shape) did **not** reproduce
 * the leak on bun 1.3.14: the consumer saw the real module both with and
 * without `mock.restore()`. **So the repair below is deliberately built to hold
 * WITHOUT depending on that mechanism**, and the diagnostic in `conveneLedger`
 * exists so a recurrence names what it got instead of dying on a TypeError.
 *
 * ⚠ A FIRST ATTEMPT CAPTURED THE MODULE AT LOAD TIME AND FAILED IN CI — recorded
 * because the reasoning is the trap. It assumed bun loads every test file, then
 * runs them, so a load-time `import * as realTeamSupport` would predate any
 * stub. **Bun loads and runs PER FILE**, so team-down's file has already run —
 * and installed its mock — before this file is loaded. The capture captured the
 * stub. CI said so verbatim:
 *
 *     Received: "STUBBED team-support: {"channel":"test-channel",...}"
 *
 * The working repair does not capture anything: it rebuilds a real
 * `requireConfig` from `../config.ts`, which no test mocks, so it cannot inherit
 * a stub no matter what ran first.
 *
 * ⚠ AND IT MUST BE THE REAL MODULE, NOT A STUB OF OUR OWN. `convene` reaches
 * `readBoardCounts` → `bounty state`, which is the THIRD ledger entry the
 * equality below pins. A hand-written stub here would silently drop it and the
 * assertion would be pinning two calls while claiming to pin the set.
 */
import { loadProject } from "../config.ts";

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
  // ⚠ POSITIVE CHECK ON THE HARNESS ITSELF, not on the subject. If a stubbed
  // `requireConfig` is still installed, `run()` dies inside `team-convene.ts`
  // with `undefined is not an object (evaluating 'config.paths.seatDir')` —
  // a TypeError that names neither the cause nor the culprit, which cost a
  // full CI investigation once. Fail here instead, naming what we got.
  const { requireConfig } = await import("./team-support.ts");
  const probeConfig = requireConfig("json", "convene");
  expect(
    typeof probeConfig.paths?.seatDir === "string"
      ? "real-config"
      : `STUBBED team-support: ${JSON.stringify(probeConfig)}`,
  ).toBe("real-config");

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
  // Undo any `./team-support.ts` stub a previously-run file left installed.
  // `realTeamSupport` was captured at load time (see the note at the top), so
  // this restores the genuine module rather than re-mocking it with our own.
  beforeAll(() => {
    // Restore a REAL `requireConfig`, rebuilt from the config layer (which no
    // test mocks). `mock.module` MERGES rather than replacing wholesale — proven
    // by the CI failure itself, which reached team-convene.ts:181, i.e. PAST the
    // `readBoardCounts()` call at :173 that team-down's stub does not define. So
    // naming only `requireConfig` here leaves `readBoardCounts` real, which the
    // three-entry ledger assertion depends on.
    mock.module("./team-support.ts", () => ({
      requireConfig: () => {
        const team = loadProject().teams[0];
        if (!team) throw new Error("fixture config resolved no team");
        return team;
      },
    }));
  });

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
    //
    // ⚠ `toEqual` ON AN ARRAY IS ORDER-SENSITIVE, AND THAT IS DELIBERATE.
    // DO NOT weaken this to a set comparison. Beyond the spawn SET this test is
    // named for, the sequence pins seams.md CONTRACT 3: convene opens the board
    // BEFORE it reads counts, so `bounty state` resolves the PINNED board
    // rather than the daemon's global `latest` — which, with two boards live,
    // silently reads a stranger's board (anthill #23/#19; it froze live
    // sessions).
    //
    // Found by steward, who controlled it rather than assuming it
    // (["a","b","c"] vs ["a","c","b"] fails); ruled deliberate by sentinel, who
    // specified the artifact and did not know he was holding it (comms
    // #752/#753). Written here because that ruling otherwise lives only on a
    // wire that does not survive teardown.
    //
    // THE HAZARD THIS COMMENT EXISTS TO STOP: a future seat hits a red after a
    // legitimate reorder, reads this test's name — "the SET, not the absence of
    // a member" — concludes order was never the point, relaxes the assertion,
    // and drops Contract 3's ONLY executable proof without ever knowing they
    // held it. `principles.md`: A MASK IS NOT A DEPENDENCY — a side effect that
    // happens to be load-bearing appears in no graph, so nothing announces when
    // a correct, unrelated decision removes it.
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

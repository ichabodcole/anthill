import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildChecklist,
  buildGroundingRefs,
  buildLandCommand,
  buildMissingWarnings,
  type CoordWires,
  decideGate,
  oneLineTitle,
  parseReviewCards,
  type ReviewCard,
  toManifestEntry,
} from "./team-join.ts";
import { cleanGitEnv } from "./test-support.ts";

// TWO prose warnings failed in ONE session, each against an agent who had read
// it, on the two most safety-critical commands this team runs. These assertions
// exist because a third wording would be the next thing to fail — the guard has
// to be a string we EMIT, not a rule we state.
describe("buildLandCommand — the composition an agent cannot get wrong", () => {
  const base = {
    handle: "forager",
    msgFileRel: ".anthill/scratch/forager/commit-msg.txt",
    cliPath: "/plugin/scripts/anthill/cli.ts",
  };

  // THE assertion. `bun run check | tail -6 && anthill commit …` reported a
  // failing gate and committed anyway, because `&&` tested `tail`'s status.
  // Keyed on the pipe CHARACTER, because any pipe at all reintroduces it — this
  // must not be narrowed to `| tail` when the next agent reaches for `| head`.
  test("contains NO pipe — a filter would make `&&` test the filter's exit status", () => {
    expect(buildLandCommand({ ...base, gate: "bun run check" })).not.toContain("|");
  });

  test("puts the gate BEFORE the commit, joined by &&", () => {
    expect(buildLandCommand({ ...base, gate: "bun run check" })).toBe(
      `bun run check && bun ${base.cliPath} commit --as forager -F .anthill/scratch/forager/commit-msg.txt <path>…`,
    );
  });

  // The second failure: a backticked span in an inline body is executed by the
  // shell before the tool sees it. The landed commit `73e8fea` is missing a word
  // for exactly this reason, and `-F` was built by the seat who then used `-m`.
  test("passes the body by FILE, never inline with -m", () => {
    const cmd = buildLandCommand({ ...base, gate: "bun run check" });
    expect(cmd).toContain("-F .anthill/scratch/forager/commit-msg.txt");
    // Keyed on the FLAG, not the token: a bare `not.toContain("-m")` matches
    // inside `commit-msg.txt` and fails against a correct command. Banning a
    // token is not banning the claim — this seat has now made that mistake
    // three times, twice while writing a test for an honesty rule.
    expect(cmd).not.toMatch(/(^|\s)-m(\s|$)/);
    expect(cmd).not.toMatch(/--message(\s|=|$)/);
  });

  test("carries the seat, fully resolved — never a <handle> template", () => {
    const cmd = buildLandCommand({ ...base, gate: "bun run check" });
    expect(cmd).toContain("--as forager");
    expect(cmd).not.toContain("<handle>");
  });

  // THE F2 ASSERTION, and it is `bash -n` rather than a substring because a
  // SUBSTRING IS NOT USABILITY. The old test asserted
  // toContain("anthill commit --as forager -F") under the comment "Still emits a
  // usable, correct commit" — and passed against a string that was a shell
  // syntax error carrying backticks, on every existing footprint.
  //
  // Every branch, including ones no config here produces, because the emitted
  // string is run VERBATIM by a seat in a consuming repo.
  test("EVERY branch parses as a shell command — bash -n, not toContain", () => {
    const gates = [undefined, "bun run check", "make verify", "tsc --noEmit && bun test"];
    const results = gates.map((gate) => {
      const cmd = buildLandCommand({ ...base, gate });
      const file = `${tmpdir()}/anthill-land-${Bun.hash(cmd)}.sh`;
      writeFileSync(file, cmd);
      const p = Bun.spawnSync(["bash", "-n", file]);
      rmSync(file, { force: true });
      return { exit: p.exitCode, backticks: (cmd.match(/`/g) ?? []).length };
    });
    // Asserted as a SET: one cell passing proves nothing about the branch that
    // actually shipped broken.
    expect(results).toEqual(gates.map(() => ({ exit: 0, backticks: 0 })));
  });

  // The gate is the PROJECT's. Hard-coding one would be the anti-pattern
  // AGENTS.md names; emitting a bare commit when none is configured would be a
  // silent absence. So the absence is stated loudly — as a SIBLING notice, never
  // inside the command.
  test("an unconfigured gate is announced OUTSIDE the command, not inside it", () => {
    const cmd = buildLandCommand({ ...base, gate: undefined });
    // The command carries no prose at all...
    expect(cmd).not.toMatch(/NO GATE CONFIGURED/);
    expect(cmd).toBe(
      `bun ${base.cliPath} commit --as forager -F .anthill/scratch/forager/commit-msg.txt <path>…`,
    );
    // ...and the announcement still exists, on the decision the checklist renders.
    const d = decideGate(undefined);
    expect(d.composable).toBe(false);
    expect(d.composable === false && d.notice).toMatch(/NO GATE CONFIGURED/);
    expect(d.composable === false && d.notice).toContain("config.gate");
  });

  // F2b: the ORIGINAL commit-on-a-red-gate defect, arriving through the config
  // field instead of the agent's shell. `bash -n` is CLEAN on it, so syntax
  // checking cannot catch this one — only refusing to compose it can.
  test("a gate that would defeat && is refused, not composed", () => {
    const defeats = [
      "bun run check | tail -6",
      "bun run check || true",
      "bun run check; true",
      "bun run check &",
      "bun run check `echo hi`",
      "bun run check $(echo hi)",
    ];
    // Asserted as a set: none of these may reach the command string.
    expect(defeats.map((g) => decideGate(g).composable)).toEqual(defeats.map(() => false));
    expect(defeats.map((g) => buildLandCommand({ ...base, gate: g }))).toEqual(
      defeats.map(
        () =>
          `bun ${base.cliPath} commit --as forager -F .anthill/scratch/forager/commit-msg.txt <path>…`,
      ),
    );
  });

  // ...but a gate whose operator PRESERVES failure must still compose, or the
  // guard degrades into "no gate is ever good enough" and stops running anyone's
  // verification. This is the positive anchor for the test above.
  test("&& preserves failure, so it is allowed through", () => {
    expect(decideGate("tsc --noEmit && bun test").composable).toBe(true);
    expect(buildLandCommand({ ...base, gate: "tsc --noEmit && bun test" })).toStartWith(
      `tsc --noEmit && bun test && bun ${base.cliPath} commit`,
    );
  });

  test("does not invent a default gate command", () => {
    // A wrong gate is worse than a named absence: someone else's command can
    // exit 0 without checking anything this project cares about.
    expect(buildLandCommand({ ...base, gate: undefined })).not.toContain("bun run check");
  });

  test("uses the project's gate verbatim, whatever it is", () => {
    expect(buildLandCommand({ ...base, gate: "make verify" })).toStartWith("make verify && ");
  });
});

// These assertions pin SILENT failure modes. Each one shipped, looked correct,
// and cost live sessions before anyone diagnosed it — so the fix is pinned here
// rather than trusted to prose. See anthill#39, #40, #54, #56.
const base = {
  coord: {
    grapevine: { available: true, cli: "/cache/grapevine/cli.ts" },
    bounty: { available: true, cli: "/cache/bounty/cli.ts" },
  } as CoordWires,
  channel: "dev",
  commsIncantation: "bun /plugin/cli.ts comms follow dev --as forager",
  handle: "forager",
  seatDocRel: ".anthill/dev/forager.md",
  lead: "maestro" as string | undefined,
  gate: "bun run check" as string | undefined,
  msgFileRel: ".anthill/scratch/forager/commit-msg.txt",
  cliPath: "/plugin/scripts/anthill/cli.ts",
  // The DEFAULT fixture reads "we looked and you owe nothing", so every
  // pre-existing assertion below runs against the read-back's quiet state and
  // the loud states are exercised deliberately. A `null` default would have made
  // every legacy test silently assert the not-performed branch.
  reviewCards: [] as ReviewCard[] | null,
};

/** Find the one checklist line starting with `prefix`, failing loudly if absent. */
function line(prefix: string, input = base): string {
  const found = buildChecklist(input).find((l) => l.startsWith(prefix));
  if (found === undefined) throw new Error(`no checklist line starting with "${prefix}"`);
  return found;
}

// The grounding list had NO test before this. It was assembled inline in
// `run()`, so `principles.md` was missing from it while both `join/SKILL.md` and
// `convene/SKILL.md` called it "the highest-leverage read in that list" — a doc
// and its code disagreeing, with nothing mechanical watching. The command was
// green throughout.
describe("buildGroundingRefs — the read order IS the claim", () => {
  const g = {
    root: "/repo",
    configured: ["AGENTS.md", "docs/README.md"],
    teamDir: "/repo/.anthill",
    seamsPath: "/repo/.anthill/dev/seams.md",
    seatDocPath: "/repo/.anthill/dev/forager.md",
  };
  const paths = () => buildGroundingRefs(g).map((r) => r.path);

  test("principles.md is in the manifest at all (the defect)", () => {
    expect(paths()).toContain("/repo/.anthill/principles.md");
  });

  // Membership alone would pass with principles appended last, after the seat
  // doc — which reverses the skills' stated order and puts the "highest-leverage
  // read" behind the doc that assumes you've done it. The ORDER is the contract,
  // so it is asserted as a full sequence rather than as N independent contains.
  test("emits the full documented order, not merely the right set", () => {
    expect(paths()).toEqual([
      "/repo/AGENTS.md",
      "/repo/docs/README.md",
      "/repo/.anthill/README.md",
      "/repo/.anthill/principles.md",
      "/repo/.anthill/dev/seams.md",
      "/repo/.anthill/dev/forager.md",
    ]);
  });

  test("principles comes AFTER the SOP and BEFORE the seat doc", () => {
    const p = paths();
    expect(p.indexOf("/repo/.anthill/principles.md")).toBeGreaterThan(
      p.indexOf("/repo/.anthill/README.md"),
    );
    expect(p.indexOf("/repo/.anthill/principles.md")).toBeLessThan(
      p.indexOf("/repo/.anthill/dev/forager.md"),
    );
  });

  test("an absolute configured path is passed through, not re-rooted", () => {
    expect(buildGroundingRefs({ ...g, configured: ["/elsewhere/SPEC.md"] })[0]?.path).toBe(
      "/elsewhere/SPEC.md",
    );
  });

  // seams/seat doc are config-overridable; the SOP and principles are not. If
  // that ever changes, this is the test that should force the decision rather
  // than letting a hardcoded join quietly ignore a configured path.
  test("configured seams/seatDoc paths are honoured verbatim", () => {
    const refs = buildGroundingRefs({
      ...g,
      seamsPath: "/repo/team/contracts.md",
      seatDocPath: "/repo/team/seats/forager.md",
    }).map((r) => r.path);
    expect(refs).toContain("/repo/team/contracts.md");
    expect(refs).toContain("/repo/team/seats/forager.md");
  });

  test("origin distinguishes config-supplied docs from team docs", () => {
    const refs = buildGroundingRefs(g);
    expect(refs.filter((r) => r.origin === "configured").map((r) => r.path)).toEqual([
      "/repo/AGENTS.md",
      "/repo/docs/README.md",
    ]);
    expect(refs.filter((r) => r.origin === "team")).toHaveLength(4);
  });
});

// Adding principles.md to the manifest makes this warning fire on real repos:
// any footprint bootstrapped before 2026-08-01 lacks the file. The single
// pre-existing warning told every miss to "fix `config.grounding`" — which for
// a team doc names a file that does not mention it, sending the reader after a
// cause that isn't there.
describe("buildMissingWarnings — the remedy has to match the origin", () => {
  test("a missing team doc is NOT blamed on config.grounding", () => {
    const [w] = buildMissingWarnings([{ rel: ".anthill/principles.md", origin: "team" }]);
    expect(w).toContain(".anthill/principles.md");
    expect(w).toContain("anthill init");
    // The load-bearing negative: the old text sent this case to the wrong file.
    expect(w).not.toMatch(/fix `config\.grounding`/);
  });

  // D1 (blank-context verify of 322a48a). The original assertion here was
  // `toContain("config.grounding")` — and that literal appears in BOTH remedies,
  // because the team remedy reads "these are NOT in `config.grounding`". So it
  // could not fail for ANY partition of the origins, leaving the `configured`
  // half of the split unguarded. Reproduced by inverting the split: only the
  // team-side test died, exactly as reported.
  //
  // The lesson is the asymmetry, not the string: the sibling test carried a
  // load-bearing NEGATIVE and this one did not take the symmetric form. A test
  // whose subject is a SPLIT must assert what each side is NOT, or it passes on
  // the collapsed world.
  test("a dangling configured ref gets the config.grounding remedy and NOT the team one", () => {
    const [w] = buildMissingWarnings([{ rel: "AGENTS.md", origin: "configured" }]);
    expect(w).toMatch(/fix `config\.grounding`/);
    expect(w).not.toMatch(/anthill init/);
    expect(w).not.toMatch(/NOT in `config\.grounding`/);
  });

  // Asserted as a SET of two: a single combined warning would satisfy either
  // one-origin case alone. That much the original version did do.
  //
  // D2 (blank-context verify): its COMMENT claimed it also guarded against
  // "handing one of the two origins the other's remedy", and it did not — it
  // located each warning by content (`includes("AGENTS.md")`), which is
  // invariant to which remedy is attached, so it survived origin inversion
  // intact. The test was real and its stated justification was false: the
  // clause advanced and its proof did not, which is the drift class seams.md
  // records against itself. Now it actually pairs FILE to REMEDY.
  test("a mixed set pairs each file with its OWN remedy, not just its own warning", () => {
    const w = buildMissingWarnings([
      { rel: "AGENTS.md", origin: "configured" },
      { rel: ".anthill/principles.md", origin: "team" },
    ]);
    expect(w).toHaveLength(2);
    const configured = w.find((x) => x.includes("AGENTS.md"));
    const team = w.find((x) => x.includes("principles.md"));
    // Separation of subjects...
    expect(configured).not.toContain("principles.md");
    expect(team).not.toContain("AGENTS.md");
    // ...and the pairing itself, which is what the comment always claimed.
    expect(configured).toMatch(/fix `config\.grounding`/);
    expect(configured).not.toMatch(/anthill init/);
    expect(team).toMatch(/anthill init/);
    expect(team).not.toMatch(/fix `config\.grounding`/);
  });

  test("nothing missing means no warning at all", () => {
    expect(buildMissingWarnings([])).toEqual([]);
  });
});

// D3 (blank-context verify): the origin strip had no test, and it is the one
// line holding the "emitted payload shape is unchanged" promise. Every other
// test exercised buildGroundingRefs, which INCLUDES origin — so the suite was
// green on a manifest that could have leaked it.
describe("toManifestEntry — origin is bookkeeping and must not reach the payload", () => {
  test("strips origin while preserving every emitted field", () => {
    expect(toManifestEntry({ path: "/a.md", exists: true, origin: "team" })).toEqual({
      path: "/a.md",
      exists: true,
    });
  });

  // Keyed on the KEY SET, not on `origin` alone: an assertion naming only the
  // forbidden field goes stale the moment a second internal field is added, and
  // the next leak would be of whatever that new field is.
  test("emits exactly the manifest keys, for every entry variant", () => {
    const variants = [
      { path: "/a.md", exists: true, origin: "team" as const },
      { path: "/b.md", exists: false, origin: "configured" as const },
      { path: "/c.md", exists: true, placeholder: true, origin: "team" as const },
    ];
    const keys = variants.map((v) => Object.keys(toManifestEntry(v)).sort());
    expect(keys).toEqual([
      ["exists", "path"],
      ["exists", "path"],
      ["exists", "path", "placeholder"],
    ]);
  });

  test("placeholder survives the strip — it IS part of the manifest", () => {
    // The negative control for the test above: if the strip ever became an
    // allow-list that dropped optional fields, the key-set test alone would
    // still pass on the two entries that have none.
    expect(
      toManifestEntry({ path: "/c.md", exists: true, placeholder: true, origin: "team" }),
    ).toHaveProperty("placeholder", true);
  });
});

describe("buildChecklist — the board Monitor filter (anthill#39)", () => {
  test("uses grep -E — plain grep treats (a|b) as a literal and matches NOTHING", () => {
    expect(line("Monitor your board lane")).toContain("grep -E");
  });

  test("excludes heartbeat frames so a fresh seat's Monitor is quiet by default", () => {
    expect(line("Monitor your board lane")).not.toContain("heartbeat");
  });

  test("the alternation it ships actually matches a real board frame", () => {
    // Extract the shipped pattern and run it the way grep -E would, proving the
    // regex flavor and the filter agree. This is the assertion that would have
    // caught the original bug, where the pattern matched nothing at all.
    const m = line("Monitor your board lane").match(/grep -E --line-buffered '(.+)'$/);
    const pattern = m?.[1];
    expect(pattern).toBeTruthy();
    const re = new RegExp(pattern ?? "(never-matches)");
    expect(re.test('{"type":"task","id":7}')).toBe(true);
    expect(re.test('{"type":"closed","id":7}')).toBe(true);
    expect(re.test('{"type":"heartbeat"}')).toBe(false);
  });
});

describe("buildChecklist — the comms wire carries NO filter", () => {
  test("the comms line has no grep at all — verbatim means verbatim", () => {
    // `comms follow` emits no keepalives, so there is nothing to strip. The two
    // filters above exist ONLY to drop keepalives, and both of their silent
    // failure modes are downstream of needing a filter at all.
    expect(line("Monitor the team comms")).not.toContain("| grep");
  });

  test("it still tells the seat to wrap it with Monitor", () => {
    expect(line("Monitor the team comms")).toContain("Monitor");
  });

  test("it carries the resolved incantation verbatim", () => {
    expect(line("Monitor the team comms")).toContain(base.commsIncantation);
  });

  test("the no-filter rule is stated, so it does not read as an omission", () => {
    // A seat that has just read two emphatic "always append grep -E
    // --line-buffered" lines will add one by analogy unless told not to.
    expect(line("Monitor the team comms").toLowerCase()).toContain("no filter");
  });
});

describe("buildChecklist — buffering (anthill#54)", () => {
  test("every grep on a LIVE tail is line-buffered", () => {
    // Keyed on the presence of a `grep`, NOT on the line starting with
    // "Monitor". The original form asserted the latter, which quietly encoded
    // "every wire has a filter" — an analogy that was true of the only two
    // wires that existed, and became false the moment a filter-free one landed.
    // A test that generalizes from a complete set is right until the set grows.
    // Scoped to the WIRES (lines that arm a Monitor) that actually pipe to
    // grep. Not every `| grep` in the checklist is a live wire — the catch-up
    // line quotes `tail --from-start | grep` precisely as the thing NOT to do,
    // and demanding `--line-buffered` on an anti-pattern would be nonsense.
    const wires = buildChecklist(base).filter((l) => l.startsWith("Monitor"));
    const filtered = wires.filter((l) => l.includes("| grep"));
    expect(filtered.length).toBeGreaterThan(0);
    for (const l of filtered) expect(l).toContain("--line-buffered");
  });

  test("a wire with no grep needs no buffering flag — and there is one", () => {
    const wires = buildChecklist(base).filter((l) => l.startsWith("Monitor"));
    expect(wires.some((l) => !l.includes("| grep"))).toBe(true);
  });
});

describe("buildChecklist — claim + catch-up guidance", () => {
  test("names a concrete command to resolve the seat's own card (anthill#40)", () => {
    expect(line("Find your card")).toContain("state --mine --as forager");
  });

  // anthill#54, re-keyed by STEP 4 onto the only wire left. The DEFECT this
  // guards is unchanged and is not about the vine: a live stream used for
  // catch-up returns nothing and then times out, which reads as "the channel is
  // empty" — so a seat joins contextless and never learns what it missed.
  // `--from-start` was the vine's name for that trap; on comms the trap is
  // `follow`, so the assertion names the verb that can actually be typed here.
  test("steers catch-up AWAY from the live stream and says why (anthill#54)", () => {
    const l = line("Catching up");
    expect(l).toContain("NEVER");
    expect(l).toContain("follow");
    // The CONSEQUENCE, not just the prohibition — a rule with no failure mode
    // attached is the half a reader drops.
    expect(l).toMatch(/the channel is empty/i);
  });

  // This used to assert the line DISTINGUISHED two wires, because the danger was
  // one procedure being applied to both. STEP 4 removed the second wire, so the
  // distinction is gone — but the FACT it existed to convey is not, and it is
  // now the whole hazard rather than half of it: nothing clears the comms log,
  // so a bare read replays every session this team has ever had.
  //
  // Deliberately NOT asserted as `toContain("comms")`: a line that mentions
  // comms while still implying a fresh log would pass that and be exactly as
  // wrong. The assertion is on the CLAIM, not the token — this seat's own
  // anti-pattern about banning a word instead of a proposition.
  test("the catch-up line states WHY comms needs an anchor, not just that it does", () => {
    const l = line("Catching up");
    expect(l).toContain("anthill:comms");
    expect(l).toMatch(/nothing clears the comms log/i);
    // The consequence that makes the rule actionable.
    expect(l).toMatch(/every session/i);
    // And no resurrected vine procedure.
    expect(l).not.toMatch(/grapevine|vine/i);
  });

  // Contract 4(d): this emitted text IS a consuming team's onboarding, so item
  // 1 is a recommendation about which wire to reach for first. Pinned because
  // the previous order was never chosen — it was the order the wires happened
  // to be built in, and it read as advice.
  test("comms is the FIRST wire the manifest arms", () => {
    const wires = buildChecklist(base).filter((l) => l.startsWith("Monitor"));
    expect(wires[0]).toContain("team comms");
  });

  /**
   * ⚠ THIS TEST USED TO PIN THE FALSE CLAIM. It asserted the checklist warned
   * scratch "does not survive the session" — which is FALSE, and the assertion
   * is what made it durable: 465 scratch files across six seats, back to July
   * 10, were on disk when a seat finally measured it. **Gitignore governs
   * TRACKING, not DELETION.**
   *
   * The urgency is real and its REASON was wrong, which is the worse defect: a
   * reader who doubts it runs `ls`, sees their notes intact, and discounts the
   * whole instruction. So this now pins the TRUE mechanism — scratch never
   * TRAVELS — and explicitly forbids the false one, because a test asserting a
   * substring cannot tell the two apart and the false wording is the one that
   * reads more urgently.
   */
  test("warns that scratch never TRAVELS — and never claims it is deleted (anthill#56)", () => {
    const finalize = line("Finalize BEFORE");
    expect(finalize).toContain("never TRAVELS");
    expect(finalize).not.toContain("does not survive");
  });
});

describe("buildChecklist — shape", () => {
  test("omits the lead's name when no lead is configured", () => {
    const l = line("Route questions", { ...base, lead: undefined });
    // RE-KEYED off "the vine": this line is EMITTED to every consuming project,
    // and a comms-only team was being told to route decisions on a wire nobody
    // reads. Keyed on the CLAIM (route to the lead, never direct to the human),
    // which is the durable part, rather than on which wire happens to exist.
    expect(l).toContain("Route questions + decisions to the lead");
    expect(l).toMatch(/NOT direct to the human/i);
    expect(l).not.toMatch(/on the vine/i);
    expect(l).not.toContain("()");
  });

  test("is pure — same input, same output, no ambient state", () => {
    expect(buildChecklist(base)).toEqual(buildChecklist(base));
  });
});

// `anthill commit` gained `--as <handle>` + an `Anthill-Seat:` trailer, requested
// independently by all four seats of a consuming team: git records the HUMAN as
// the author of every seat's commit, so "who landed this?" was unanswerable and
// their lead had to ask the channel to identify one.
//
// The feature ships DEAD unless something tells a seat to use it. Contract 4's
// own rule applies — emit the RESOLVED incantation, don't make the consumer
// compose it — and this checklist is the seat-resolved surface that gets read.
describe("buildChecklist — the commit incantation carries the seat (attribution)", () => {
  // RE-KEYED, not deleted, when the resolved incantation moved to the LAND
  // line: this asserts that the checklist emits it SOMEWHERE, which is the
  // actual rule (Contract 4(d) — the consumer never composes it). Keying it to
  // one line's prefix encoded which line happened to carry it, and that is the
  // same "a test written when the set is complete encodes the set" trap that
  // already cost this file two cycles.
  test("emits the commit invocation fully resolved — a PATH, never a bare `anthill`", () => {
    const all = buildChecklist(base);
    // RE-KEYED off the bare word `anthill`: the land string now resolves to the
    // emitting cli.ts, because a bare `anthill` goes through PATH to the
    // launcher — which on a dogfooding machine is a DIFFERENT binary with a
    // different flag surface, and it lacked the very `-F` this line depends on.
    // The rule the old literal was standing in for is "fully resolved, never a
    // template", and that rule is now stronger, not weaker.
    const carrier = all.filter((l) => l.includes(`commit --as ${base.handle}`));
    expect(carrier.length).toBeGreaterThan(0);
    for (const l of carrier) {
      expect(l).not.toContain("<handle>");
      expect(l).not.toContain("{handle}");
      // THE ASSERTION THAT MATTERS NOW: no bare `anthill commit`, which would
      // resolve through PATH to whatever release happens to be cached.
      expect(l).not.toMatch(/(^|\s)anthill commit/);
      expect(l).toContain(base.cliPath);
    }
  });

  test("still forbids the bare-git escape hatches", () => {
    const l = line("Commit file-scoped");
    expect(l).toContain("git add -A");
    expect(l).toContain("EXPLICIT pathspec");
  });

  test("says WHY, so a seat that drops the flag knows the cost", () => {
    expect(line("Commit file-scoped")).toMatch(/who landed this/i);
  });
});

/**
 * S8-1 — the EMITTED manifest, run as a real process, with spellbook ABSENT.
 *
 * Every other test in this file is pure, and the file says why: the exact
 * emitted strings can then be asserted in CI, where no spellbook plugin cache
 * exists. **This block is the one case that inverts that constraint and is
 * therefore the one real-process assertion that belongs here** — it needs
 * spellbook to be MISSING, which CI supplies for free and a dev machine has to
 * fake with `HOME`.
 *
 * The defect: `join` resolved grapevine + bounty and `process.exit(1)` BEFORE
 * building anything, so a **spellbook** absence suppressed the **anthill** comms
 * block — which depends on neither — and withheld the grounding list, which
 * depends on nothing but the repo. The same function already degrades a failed
 * grounding-doc READ under the comment "must not sink the whole manifest — the
 * grounding list is the seat's lifeline"; the rule simply stopped one layer
 * short of the thing that sank the whole manifest.
 *
 * Contract 4(b) is amended in the same change: "ALWAYS present" is bounded to
 * every manifest `join` EMITS. `join bogus` and a config-less tree still exit
 * before any manifest, and must — there is no seat doc and no roster to emit —
 * so an unbounded "always" was false no matter what this fix does.
 */
describe("join — a missing spellbook must not sink the manifest (S8-1)", () => {
  const CLI = resolve(import.meta.dir, "..", "cli.ts");

  /**
   * Build a fake spellbook cache containing exactly the tools named.
   *
   * This is what makes the control below a REAL control: it can construct BOTH
   * worlds — spellbook present and spellbook absent — anywhere, including CI,
   * with no dependency on the developer's machine. A control that can only ever
   * produce one of the two answers is not a control.
   */
  function fakeHome(tools: Array<"grapevine" | "bounty">): string {
    const home = mkdtempSync(join(tmpdir(), "anthill-s8-1-home-"));
    for (const tool of tools) {
      const dir = join(
        home,
        ".claude/plugins/cache/spellbook-marketplace/spellbook/9.0.0/skills",
        tool,
        "scripts",
      );
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "cli.ts"), "// stub\n");
    }
    return home;
  }

  /** Run `join` in a real team tree against a caller-chosen HOME. */
  function joinWith(home: string) {
    const dir = mkdtempSync(join(tmpdir(), "anthill-s8-1-"));
    try {
      mkdirSync(join(dir, ".anthill", "dev"), { recursive: true });
      writeFileSync(
        join(dir, ".anthill", "config.json"),
        JSON.stringify({
          version: 2,
          channel: "s8-channel",
          lead: "maestro",
          seats: [
            { handle: "maestro", role: "lead", scope: ".", spawn: true },
            { handle: "forager", role: "hands (CLI/engine)", scope: "scripts/", spawn: true },
          ],
        }),
      );
      const proc = Bun.spawnSync(["bun", CLI, "join", "forager", "--format", "json"], {
        cwd: dir,
        env: { ...cleanGitEnv(), HOME: home },
      });
      const stdout = proc.stdout.toString();
      const lines = stdout.trim().split("\n").filter(Boolean);
      // The SAME fixture rendered as text, so a text assertion cannot drift
      // onto a different world than the JSON one it sits beside. The partial
      // world was covered in JSON and never in text, and that is exactly where
      // the renderer bug lived.
      const textProc = Bun.spawnSync(["bun", CLI, "join", "forager", "--format", "text"], {
        cwd: dir,
        env: { ...cleanGitEnv(), HOME: home },
      });
      return {
        code: proc.exitCode,
        stdout,
        stderr: proc.stderr.toString(),
        lineCount: lines.length,
        envelope: lines.length === 1 ? JSON.parse(lines[0] as string) : undefined,
        textOut: textProc.stdout.toString(),
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(home, { recursive: true, force: true });
    }
  }

  /** The original case: a genuinely empty HOME, so neither wire resolves. */
  function joinWithoutSpellbook() {
    return joinWith(mkdtempSync(join(tmpdir(), "anthill-s8-1-empty-")));
  }

  /**
   * THE CONTROL — REWRITTEN, because the first version could not fire.
   *
   * It asserted `JSON.stringify(envelope)` matched `/spellbook/i` to prove the
   * fixture had no spellbook. **A RESOLVED spellbook matches that too**, because
   * the cache path is `…/spellbook-marketplace/spellbook/1.16.0/…` — so the
   * guard passed in exactly the world it existed to detect, and the comment
   * above it ("if the harness ever resolved a real spellbook, every assertion
   * below would pass for the wrong reason") described a protection that did not
   * exist. Found by a blank-context reader, whose mutation swapped the empty
   * HOME for the real one and got 48 pass / 1 fail — the control silent.
   *
   * The replacement is a DISCRIMINATOR asserted as a SET: the same command, in
   * two constructed worlds, must produce two different answers. A single case
   * passes against a hardcoded value; the pair does not. This is the shape this
   * seat prescribes everywhere and did not apply to its own control.
   */
  test("CONTROL — the fixture's two worlds produce DIFFERENT answers", () => {
    const withSpellbook = joinWith(fakeHome(["grapevine", "bounty"]));
    const without = joinWithoutSpellbook();
    // The discriminating pair. If the fixture silently resolved a real
    // spellbook, these two would be equal and the assertion dies.
    // STEP 4 re-keyed this onto `boardTailCommand`. The control's SHAPE is the
    // load-bearing part, not which wire carries it: one field, two constructed
    // worlds, asserted as a SET, because a single case is satisfied by a
    // hardcoded value. `tailCommand` is gone, `boardTailCommand` still has both
    // worlds (bounty is spellbook's), so the discriminator survives intact.
    expect([
      typeof withSpellbook.envelope?.data?.boardTailCommand,
      typeof without.envelope?.data?.boardTailCommand,
    ]).toEqual(["string", "object"]); // typeof null === "object"
    expect(without.envelope?.data?.boardTailCommand).toBeNull();
    expect(withSpellbook.envelope?.data?.boardTailCommand).toContain("tail --mine");
  });

  test("emits a manifest at all — a missing spellbook is not fatal", () => {
    const r = joinWithoutSpellbook();
    expect(r.envelope?.ok).toBe(true);
    expect(r.code).toBe(0);
  });

  test("the comms block survives — it depends on neither grapevine nor bounty", () => {
    const r = joinWithoutSpellbook();
    const comms = r.envelope?.data?.comms;
    expect(comms?.channel).toBe("s8-channel");
    // Fully resolved, per Contract 4(a) — never a template the consumer fills in.
    expect(comms?.incantation).toContain("comms follow s8-channel --as forager");
    expect(comms?.incantation).not.toContain("<handle>");
  });

  test("the grounding list survives — it is the seat's lifeline and needs only the repo", () => {
    const r = joinWithoutSpellbook();
    const grounding = r.envelope?.data?.grounding;
    expect(Array.isArray(grounding)).toBe(true);
    expect(grounding.length).toBeGreaterThan(0);
    // The seat doc specifically: this is the one file the seat cannot re-ground
    // without, and it is the one the old exit withheld.
    expect(JSON.stringify(grounding)).toContain("forager.md");
  });

  /**
   * D3 — the origin strip, asserted on the REAL EMITTED MANIFEST at last.
   *
   * `origin` is internal bookkeeping (it picks which remedy a missing doc gets)
   * and must never reach the payload. `toManifestEntry` was pinned in both
   * directions, but the `.map` CALL SITE in `run()` was not: reverting it to
   * `.map(e => e)` leaks `origin` into the real manifest with tsc, biome and the
   * full suite GREEN — tsc cannot see it, because there is no excess-property
   * check on a non-literal `.map` result even under a `GroundingEntry[]`
   * annotation.
   *
   * IT WAS PARKED AS UNTESTABLE, AND S8-1 DISSOLVED THE BLOCKER RATHER THAN
   * SOLVING IT. The card (t-ca407189) reasoned — correctly, against the code as
   * it then stood — that reaching the real emission required a resolvable
   * spellbook cache, which CI does not have; the alternative was injecting a
   * seam, which is the trap that needs pinning to the production path. **Making
   * a missing spellbook non-fatal means the manifest now emits WITHOUT one**, so
   * the honest assertion is available for free and needs no seam at all.
   *
   * Worth stating because the general form is cheap: a fix aimed at one defect
   * can retire another defect's STATED IMPOSSIBILITY, and nothing re-reads a
   * card to notice. This one was found by re-reading the card, not by the tree.
   */
  test("D3 — `origin` is stripped from the emitted manifest, asserted on the real payload", () => {
    const r = joinWithoutSpellbook();
    const grounding = r.envelope?.data?.grounding as Array<Record<string, unknown>>;
    // Positive anchor first: we are looking at real entries with the real keys,
    // so this cannot pass by finding an empty list (Contract 4 assertion-(4)).
    expect(grounding.length).toBeGreaterThan(0);
    for (const entry of grounding) {
      expect(Object.hasOwn(entry, "path")).toBe(true);
      expect(Object.hasOwn(entry, "exists")).toBe(true);
      expect(Object.hasOwn(entry, "origin")).toBe(false);
    }
  });

  // The envelope is the agent's whole input. A stray warning line printed
  // beside it makes `JSON.parse(stdout)` throw for every real caller while a
  // last-line-picking assertion stays green — the M1 leak, in a new place.
  test("the degraded manifest is STILL a single parseable envelope", () => {
    const r = joinWithoutSpellbook();
    expect(r.lineCount).toBe(1);
  });

  /**
   * THE DEGRADED CHECKLIST LINE — the seat-facing instruction this whole fix
   * exists to produce, and it had ZERO coverage. Deleting the entire
   * unavailable branch left 49 pass / 0 fail: `available` appeared once in 674
   * test lines, in a fixture set to `true`. Every assertion landed on the side
   * that already worked — this seat's standing pattern, in the commit that
   * records it.
   */
  test("the degraded checklist TELLS the seat what it lost, and to tell the lead", () => {
    const r = joinWithoutSpellbook();
    const checklist = (r.envelope?.data?.checklist as string[]).join("\n");
    expect(checklist).toMatch(/NO BOARD/);
    // The consequence, not just the fact — a seat that cannot claim a card is
    // invisible, which looks identical to a seat with nothing to do.
    expect(checklist).toMatch(/invisible on the board|cannot claim or advance/i);
    expect(checklist).toMatch(/tell your lead/i);
    // ...and it must NOT hand out a broken command in place of the real one.
    expect(checklist).not.toMatch(/wrap with Monitor: bun null/);
    // STEP 4: the vine is gone, so the checklist must not mention it AT ALL —
    // neither as a wire to arm nor as one that is unavailable. "Told there is
    // none" and "wasn't told anything" must not look alike (Contract 4), and
    // here the honest state is that the concept no longer exists.
    expect(checklist).not.toMatch(/grapevine/i);
  });

  /**
   * STEP 4 REMOVED THE FOUR PER-WIRE "MIRROR" TESTS THAT STOOD HERE, AND THIS
   * NOTE IS WHY — deleting a guard is exactly where a real assertion gets lost.
   *
   * They asserted that a missing BOUNTY must not report the GRAPEVINE as gone,
   * and the mirror, in JSON and in text. That property is about TWO wires
   * summarised by one verdict. With the vine deleted there is one wire, so the
   * coupling they guarded is not merely untested — it is UNEXPRESSIBLE.
   * Keeping them re-keyed onto a single wire would assert that one boolean does
   * not collapse one boolean, which passes against any implementation.
   *
   * WHAT SURVIVES THEM, and where it now lives, so nothing is silently dropped:
   *   - "one wire down must not black out the others" -> the comms + grounding
   *     tests above, which are the S8-1 thesis itself and still fail if bounty's
   *     absence leaks into either.
   *   - "a null must never render as a command" -> the text test directly below,
   *     which is the one that caught the real shipped defect (`1efc161`).
   *   - "the fixture's two worlds differ" -> the CONTROL, re-keyed onto
   *     `boardTailCommand`.
   * Below is the single-wire successor: bounty down must say UNAVAILABLE and
   * must not invent a vine to blame.
   */
  test("bounty down: the manifest reports the BOARD gone and invents no other wire", () => {
    const r = joinWithoutSpellbook();
    const d = r.envelope?.data as Record<string, unknown>;
    expect(d.boardTailCommand).toBeNull();
    // The comms wire is anthill's own and must be untouched by a spellbook miss.
    expect((d.comms as { incantation: string }).incantation).toContain("comms follow");
    const all = JSON.stringify(d);
    // No resurrected vine anywhere in the payload — not as a wire, not as a
    // warning, not as a field. `tailCommand` is GONE, not null: a consumer must
    // not be able to read its absence as "the vine is unavailable".
    expect(all).not.toMatch(/grapevine/i);
    expect(Object.keys(d)).not.toContain("tailCommand");
  });

  test("text mode never renders a null as if it were a command", () => {
    const dir = mkdtempSync(join(tmpdir(), "anthill-s8-1-text-"));
    const emptyHome = mkdtempSync(join(tmpdir(), "anthill-s8-1-texthome-"));
    try {
      mkdirSync(join(dir, ".anthill", "dev"), { recursive: true });
      writeFileSync(
        join(dir, ".anthill", "config.json"),
        JSON.stringify({
          version: 2,
          channel: "s8-channel",
          seats: [{ handle: "forager", role: "hands", scope: ".", spawn: true }],
        }),
      );
      const proc = Bun.spawnSync(["bun", CLI, "join", "forager", "--format", "text"], {
        cwd: dir,
        env: { ...cleanGitEnv(), HOME: emptyHome },
      });
      const out = proc.stdout.toString();
      // Positive anchor FIRST: assert we rendered the degraded text at all, so
      // this cannot pass by rendering nothing (Contract 4's assertion-(4) shape).
      expect(out).toMatch(/UNAVAILABLE/);
      expect(out).not.toMatch(/^\s*(grapevine|board):\s*null\s*$/m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(emptyHome, { recursive: true, force: true });
    }
  });
});

// THE BOARD READ-BACK (criterion 7). `principles.md`: no store without a named
// re-read moment. The board has a write trigger and none of these, so a `review`
// card decays into an unchecked claim about the tree — every audit that has
// looked found MOST of the review column mis-stating it, and one sent a seat to
// write a test that already existed. No rate is quoted anywhere: the figure was
// revised twice inside the session that built this. These assertions are DISCRIMINATORS: each is built so a hardcoded
// return value fails the SET even where it would satisfy any single row.
describe("parseReviewCards — the board read-back's detector", () => {
  const board = (tasks: unknown[]) => JSON.stringify({ state: { tasks } });
  const card = (over: Record<string, unknown> = {}) => ({
    id: "t-aaa",
    title: "a card",
    status: "review",
    owner: "forager",
    tags: [],
    ...over,
  });

  test("unreadable / read-and-empty / read-with-cards are THREE distinct answers", () => {
    const unreadable = parseReviewCards("{ not json", "forager");
    const empty = parseReviewCards(board([card({ status: "done" })]), "forager");
    const owed = parseReviewCards(board([card()]), "forager");
    // Asserted as a SET. Any ONE of these rows is satisfied by a hardcoded
    // value; all three together are not.
    expect([unreadable, empty?.length, owed?.length]).toEqual([null, 0, 1]);
  });

  test("a TRUNCATED payload is null, NEVER [] — the difference is a claim we are not entitled to", () => {
    // Cut mid-value, which is the shape a severed pipe actually produces.
    const truncated = board([card()]).slice(0, 40);
    expect(parseReviewCards(truncated, "forager")).toBeNull();
  });

  test("BOTH conjuncts filter — status AND owner — and either one alone lets a stranger through", () => {
    const tasks = [
      card({ id: "t-mine-review", status: "review", owner: "forager" }),
      card({ id: "t-mine-todo", status: "todo", owner: "forager" }),
      card({ id: "t-peer-review", status: "review", owner: "weaver" }),
    ];
    // Dropping EITHER conjunct yields 2 rows, so this fails against a
    // one-conjunct implementation — the exact defect this seat shipped in
    // session 11, where a published two-conjunct criterion became its first
    // conjunct alone at the fix site and broke `anthill commit`.
    expect(parseReviewCards(board(tasks), "forager")?.map((c) => c.id)).toEqual(["t-mine-review"]);
  });

  test("tags is TOTAL — a card carrying none reports [], never an absent key", () => {
    const noTags = parseReviewCards(
      board([{ id: "t-a", title: "t", status: "review", owner: "forager" }]),
      "forager",
    );
    // A value comparison cannot tell an absent key from an empty one, so the
    // key-set is asserted separately — Contract 4(b)'s `tailCommand` lesson.
    expect(Object.keys(noTags?.[0] ?? {}).sort()).toEqual(["id", "tags", "title"]);
    expect(noTags?.[0]?.tags).toEqual([]);
  });

  test("a `moot` tag reaches the reader — the verdict the status column cannot carry", () => {
    // Statuses are a CLOSED union of four in spellbook (cli.ts:64, server.ts:329),
    // so MOOT cannot be a status. Tags are free-form AND a filter dimension
    // (server.ts:203), which is why the ruling rests on them.
    const r = parseReviewCards(board([card({ tags: ["moot", "session13"] })]), "forager");
    expect(r?.[0]?.tags).toEqual(["moot", "session13"]);
  });
});

// 🔴 FOUND BY RUNNING `anthill join forager`, NOT BY THE SUITE — and the suite
// could not have found it, because every fixture title above is a tidy
// one-liner. A REAL card on this board (`t-d1c17fc6`) has a ~1000-character
// title with EMBEDDED NEWLINES: someone used the title field as a notes field.
// Rendered verbatim, one card detonated the read-back across a dozen lines of
// unrelated prose and a seat could not tell where the card list ended.
//
// This is this seat's session-8 scar exactly — the JSON payload was CORRECT and
// the human render was not — so the assertion is keyed on the CAUSE (a title
// containing newlines) rather than on the one card that exposed it.
describe("oneLineTitle — the human projection of a card title", () => {
  test("a title with EMBEDDED NEWLINES renders as exactly one line", () => {
    expect(oneLineTitle("first\nsecond\n\nthird")).toBe("first second third");
  });

  test("a long title is bounded and marked, not silently cut", () => {
    const out = oneLineTitle("x".repeat(500));
    expect(out.length).toBe(96);
    expect(out.endsWith("…")).toBe(true);
  });

  test("a short one-line title is untouched — the positive anchor", () => {
    // Without this, a function that returned "" for everything passes the two
    // assertions above.
    expect(oneLineTitle("resolveFormat reads isTTY ambiently")).toBe(
      "resolveFormat reads isTTY ambiently",
    );
  });

  test("the read-back emits ONE LINE PER CARD however ugly the titles are", () => {
    const entry = buildChecklist({
      ...base,
      reviewCards: [
        { id: "t-a", title: "a tidy one", tags: [] },
        { id: "t-b", title: "an essay\nwith newlines\nand more\n\nparagraphs", tags: ["moot"] },
        { id: "t-c", title: "y".repeat(900), tags: [] },
      ],
    }).find((l) => l.startsWith("BOARD READ-BACK —"));
    if (entry === undefined) throw new Error("no read-back line");
    // Exactly three indented card rows — one per card, regardless of the shape
    // of what the board handed us.
    const rows = entry.split("\n").filter((l) => /^ {4}t-/.test(l));
    expect(rows.length).toBe(3);
    expect(rows.every((r) => r.length < 140)).toBe(true);
  });
});

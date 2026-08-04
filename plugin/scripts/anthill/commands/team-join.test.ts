import { describe, expect, test } from "bun:test";
import {
  buildChecklist,
  buildGroundingRefs,
  buildLandCommand,
  buildMissingWarnings,
  toManifestEntry,
} from "./team-join.ts";

// TWO prose warnings failed in ONE session, each against an agent who had read
// it, on the two most safety-critical commands this team runs. These assertions
// exist because a third wording would be the next thing to fail — the guard has
// to be a string we EMIT, not a rule we state.
describe("buildLandCommand — the composition an agent cannot get wrong", () => {
  const base = { handle: "forager", msgFileRel: ".anthill/scratch/forager/commit-msg.txt" };

  // THE assertion. `bun run check | tail -6 && anthill commit …` reported a
  // failing gate and committed anyway, because `&&` tested `tail`'s status.
  // Keyed on the pipe CHARACTER, because any pipe at all reintroduces it — this
  // must not be narrowed to `| tail` when the next agent reaches for `| head`.
  test("contains NO pipe — a filter would make `&&` test the filter's exit status", () => {
    expect(buildLandCommand({ ...base, gate: "bun run check" })).not.toContain("|");
  });

  test("puts the gate BEFORE the commit, joined by &&", () => {
    expect(buildLandCommand({ ...base, gate: "bun run check" })).toBe(
      "bun run check && anthill commit --as forager -F .anthill/scratch/forager/commit-msg.txt <path>…",
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

  // The gate is the PROJECT's. Hard-coding one would be the anti-pattern
  // AGENTS.md names; emitting a bare commit when none is configured would be a
  // silent absence. So the absence is stated loudly instead.
  test("an unconfigured gate is announced, not silently dropped", () => {
    const cmd = buildLandCommand({ ...base, gate: undefined });
    expect(cmd).toMatch(/NO GATE CONFIGURED/);
    expect(cmd).toContain("config.gate");
    // Still emits a usable, correct commit — a seat is not left with nothing.
    expect(cmd).toContain("anthill commit --as forager -F");
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
  tailCommand: "bun /cache/grapevine/cli.ts tail dev --as forager",
  boardTailCommand: "bun /cache/bounty/cli.ts tail --mine --as forager",
  commsIncantation: "bun /plugin/cli.ts comms follow dev --as forager",
  bountyCli: "/cache/bounty/cli.ts",
  handle: "forager",
  seatDocRel: ".anthill/dev/forager.md",
  lead: "maestro" as string | undefined,
  gate: "bun run check" as string | undefined,
  msgFileRel: ".anthill/scratch/forager/commit-msg.txt",
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

  test("steers catch-up to a bounded verb and names the broken one (anthill#54)", () => {
    const l = line("Catching up");
    expect(l).toContain("grapevine pull");
    expect(l).toContain("NEVER");
    expect(l).toContain("--from-start");
  });

  // The catch-up line covered ONE of the two wires it is the only catch-up
  // instruction for. A seat told "use `grapevine pull`" on a comms-bearing team
  // replays every session the team has ever had, and nothing in the manifest
  // said otherwise. Asserted as the DISTINCTION rather than as a comms mention:
  // a line naming comms while still implying one procedure would pass a
  // `toContain("comms")` check and be exactly as wrong.
  test("the catch-up line distinguishes the two wires, not just names them", () => {
    const l = line("Catching up");
    expect(l).toContain("anthill:comms");
    // The load-bearing asymmetry — it is WHY the two verbs differ, and a future
    // edit that drops it leaves a reader with two commands and no rule.
    expect(l).toMatch(/nothing clears the comms log/i);
    expect(l).toMatch(/clears the vine/i);
  });

  // Contract 4(d): this emitted text IS a consuming team's onboarding, so item
  // 1 is a recommendation about which wire to reach for first. Pinned because
  // the previous order was never chosen — it was the order the wires happened
  // to be built in, and it read as advice.
  test("comms is the FIRST wire the manifest arms", () => {
    const wires = buildChecklist(base).filter((l) => l.startsWith("Monitor"));
    expect(wires[0]).toContain("team comms");
  });

  test("warns that scratch does not survive the session (anthill#56)", () => {
    expect(line("Finalize BEFORE")).toContain("does not survive");
  });
});

describe("buildChecklist — shape", () => {
  test("omits the lead's name when no lead is configured", () => {
    const l = line("Route questions", { ...base, lead: undefined });
    expect(l).toContain("Route questions + decisions to the lead on the vine");
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
  test("emits `anthill commit --as <handle>` fully resolved, not a template", () => {
    const all = buildChecklist(base);
    const carrier = all.filter((l) => l.includes(`anthill commit --as ${base.handle}`));
    expect(carrier.length).toBeGreaterThan(0);
    for (const l of carrier) {
      expect(l).not.toContain("<handle>");
      expect(l).not.toContain("{handle}");
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

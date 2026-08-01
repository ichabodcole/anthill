import { describe, expect, test } from "bun:test";
import { buildChecklist } from "./team-join.ts";

// These assertions pin SILENT failure modes. Each one shipped, looked correct,
// and cost live sessions before anyone diagnosed it — so the fix is pinned here
// rather than trusted to prose. See anthill#39, #40, #54, #56.
const base = {
  tailCommand: "bun /cache/grapevine/cli.ts tail dev --as forager",
  boardTailCommand: "bun /cache/bounty/cli.ts tail --mine --as forager",
  bountyCli: "/cache/bounty/cli.ts",
  handle: "forager",
  seatDocRel: ".anthill/dev/forager.md",
  lead: "maestro" as string | undefined,
};

/** Find the one checklist line starting with `prefix`, failing loudly if absent. */
function line(prefix: string, input = base): string {
  const found = buildChecklist(input).find((l) => l.startsWith(prefix));
  if (found === undefined) throw new Error(`no checklist line starting with "${prefix}"`);
  return found;
}

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

describe("buildChecklist — buffering (anthill#54)", () => {
  test("every grep on a LIVE tail is line-buffered", () => {
    const monitors = buildChecklist(base).filter((l) => l.startsWith("Monitor"));
    expect(monitors.length).toBeGreaterThan(0);
    for (const l of monitors) expect(l).toContain("--line-buffered");
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
  test("emits `anthill commit --as <handle>` fully resolved, not a template", () => {
    const l = line("Commit file-scoped");
    expect(l).toContain(`anthill commit --as ${base.handle}`);
    expect(l).not.toContain("<handle>");
    expect(l).not.toContain("{handle}");
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

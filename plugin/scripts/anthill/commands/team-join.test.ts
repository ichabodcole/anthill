import { describe, expect, test } from "bun:test";
import { buildChecklist } from "./team-join.ts";

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

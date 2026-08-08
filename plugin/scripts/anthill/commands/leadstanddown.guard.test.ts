/**
 * K1 — the `leadStandDown` emission had NO assertion of any kind.
 *
 * `convene` hands the lead a `comms follow`, and that follower is what makes
 * `anthill down` refuse the lead BY NAME after every seat has correctly stood
 * down (seams.md 6(g), property 1). `leadStandDown` is the emitted release for
 * that blocker. weaver landed it at `9a4c666` and said plainly that nothing
 * covers it; forager confirmed the property by READING the source (#863).
 *
 * ⚠ WHAT THIS GUARD IS, AND THE BOUND IS THE POINT: it proves the SOURCE
 * composes the command correctly. It does NOT prove `run()` emits it — only
 * running `anthill convene` proves emission, and that is forbidden while the
 * board holds hand-restored tasks (#863/#864), because convene calls
 * `bounty open`. So this is strictly weaker than the test nobody can safely
 * write tonight, and strictly stronger than the nothing that covers it now.
 * **It must never be recorded as "leadStandDown is covered."**
 *
 * ⚠ AND WHY IT IS NOT `toContain("stand-down")` — weaver's K5, and he is
 * right: a bare mention passes on prose that says the OPPOSITE. Every
 * assertion below pins a DISTINCTION (the verb AND the resolution together, as
 * one object), so a half-correct composition cannot pass.
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = readFileSync(join(new URL(".", import.meta.url).pathname, "team-convene.ts"), "utf8");

/** The `leadStandDown = …` composition, source text only. */
function composition(): string {
  const m = SRC.match(/const leadStandDown\s*=([\s\S]*?);\n/);
  return m?.[1] ?? "";
}

describe("K1 — the lead's teardown release is composed correctly (source-level)", () => {
  it("the composition is FOUND — a positive control, so the assertions below cannot pass on an empty string", () => {
    // Without this, a regex that stops matching (a rename, a reformat) makes
    // every assertion below vacuously true against "". That is the failure this
    // whole seat exists to catch, and it belongs first.
    expect(composition().length).toBeGreaterThan(0);
  });

  it("resolves to the EMITTING cli and NOT to PATH — Contract 7(d), as a pair", () => {
    const c = composition();
    // Asserted together: a command that names the verb but resolves through
    // PATH satisfies neither half of 7(d), and would pass either check alone.
    expect({
      resolvesToEmittingCli: c.includes('new URL("../cli.ts"') && c.includes("import.meta.url"),
      namesTheVerb: /comms stand-down --as/.test(c),
    }).toEqual({ resolvesToEmittingCli: true, namesTheVerb: true });
  });

  it("does not invoke a bare `anthill` — the PATH launcher lacks the flags and is a different binary", () => {
    // The scar: two binaries reported an identical --version while differing in
    // two behaviours, and the emitted LAND string was unrunnable on the one
    // PATH resolved. A dogfooding window is exactly when they diverge.
    expect(/`anthill |"anthill |'anthill /.test(composition())).toBe(false);
  });

  it("stays a TOTAL field — `string | null`, never an absent key (Contract 5(a))", () => {
    // A missing key cannot be told apart from "no lead resolvable". `null` is a
    // positive observation; absence is unreadable.
    expect(/leadStandDown:\s*string\s*\|\s*null/.test(SRC)).toBe(true);
  });
});

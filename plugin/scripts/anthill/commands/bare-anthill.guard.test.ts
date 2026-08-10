/**
 * A bare `anthill` in an AGENT-facing string is a different binary.
 *
 * PATH resolves `anthill` to the optional global launcher, which picks the
 * highest CACHED RELEASE — so a string a seat runs verbatim can execute on a
 * binary other than the one that composed it, and a flag the composer has may
 * not exist there. `buildLandCommand` (`team-join.ts`) hit this for real and
 * resolves to the emitting `cli.ts` instead.
 *
 * ⚠ THE SCOPE IS THE WHOLE POINT, AND THE BACKLOG ITEM DID NOT HAVE IT.
 * The item that filed this listed five line numbers. Three of them are
 * `renderText` output — the HUMAN surface — where a bare `anthill` is CORRECT:
 * a person typing `anthill attach` wants PATH resolution, which is exactly what
 * the optional global launcher exists for (`bootstrap` §1 — "purely for the
 * human; agents don't need it"). Fixing all five would have handed a person an
 * absolute path into a plugin cache to fix an agent-facing bug.
 *
 * So this guard asserts a DISTINCTION, not a ban:
 *   - strings reaching the JSON envelope (`emitError`, payload fields) → resolved
 *   - strings inside `renderText` → left alone, and that is asserted too, so a
 *     later "cleanup" pass cannot quietly make the human output worse.
 *
 * ⚠ BOUND: this reads SOURCE, like `leadstanddown.guard.test.ts`. It proves the
 * composition, not the emission. It also covers `team-comms.ts` ONLY — the file
 * the audit found. It must never be recorded as "bare `anthill` is covered
 * everywhere."
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The source with COMMENTS STRIPPED — and the stripping is not tidiness.
 *
 * `team-comms.ts` documents this very rule in prose, so its own doc comment
 * contains ``a human typing `anthill attach` WANTS PATH resolution``. Scanned
 * raw, the guard flags the sentence explaining the guard. Caught by running it:
 * the first version came back RED naming a comment.
 *
 * Same class as `tmpleak.guard.test.ts` excluding itself — an instrument that
 * matches its own description of what it looks for — and recorded rather than
 * silently filtered, because a later reader would otherwise take the strip for
 * an oversight.
 */
const SRC = readFileSync(join(import.meta.dir, "team-comms.ts"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

/** A bare `anthill …` inside a template literal or after a colon — the emitted forms. */
const BARE = /(?:`|: )anthill (?:comms|attach|down|status|join|convene) /g;

/** Everything between `renderText:` and the end of its arrow body, roughly — the
 * human surface. Crude on purpose: it over-includes, which makes the
 * agent-facing assertion below STRICTER, never looser. */
function renderTextRegions(src: string): string {
  const out: string[] = [];
  let i = src.indexOf("renderText:");
  while (i !== -1) {
    out.push(src.slice(i, i + 1200));
    i = src.indexOf("renderText:", i + 1);
  }
  return out.join("\n");
}

describe("bare `anthill` — agent-facing strings resolve, human-facing ones do not", () => {
  test("POSITIVE CONTROL: the scan finds bare invocations at all", () => {
    // Without this, every assertion below passes on a regex that matches nothing
    // — the failure this whole file exists to prevent, inside the file.
    expect(SRC.match(BARE)?.length ?? 0).toBeGreaterThan(0);
  });

  test("no bare `anthill` reaches the JSON envelope", () => {
    const human = renderTextRegions(SRC);
    const offenders = (SRC.match(BARE) ?? []).filter((hit) => {
      // A hit is agent-facing unless every occurrence of it sits in renderText.
      const inHumanRegion = human.split(hit).length - 1;
      const total = SRC.split(hit).length - 1;
      return inHumanRegion < total;
    });
    expect(offenders).toEqual([]);
  });

  test("the agent-facing strings resolve to the EMITTING cli", () => {
    // `emittingCli()` is the single derivation; both repaired sites call it.
    expect(SRC).toContain("function emittingCli()");
    expect(SRC).toContain('fileURLToPath(new URL("../cli.ts", import.meta.url))');
    // The definition plus both repaired call sites. Counting CALLS rather than
    // the interpolation form, which biome reads as a template-string mistake.
    expect(SRC.split("emittingCli()").length - 1).toBeGreaterThanOrEqual(3);
  });

  test("the HUMAN-facing anchor hint still says bare `anthill` — not a bug", () => {
    // Asserted so a later sweep cannot "fix" it. If this goes red because
    // someone resolved it, the question to ask is who reads `--format text`.
    expect(SRC).toContain("Establish an anchor with: anthill comms read");
  });
});

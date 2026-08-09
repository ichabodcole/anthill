/**
 * THE GATE CELL FOR #100 — a leak that depends on someone remembering is not
 * fixed. This makes forgetting RED.
 *
 * The three leakers (`lock.test.ts` +5, `comms.test.ts` +8,
 * `comms.rotation.test.ts` +7 per run, measured prefix-attributed) were repaired
 * by REGISTERING every minted tree and removing it in `afterAll`. That repair is
 * one added test away from being undone, and the undoing is silent: a leak
 * produces no failing assertion, no red gate, and no output of any kind. It is
 * visible only to someone who thinks to count directories in `$TMPDIR`.
 *
 * ⚠ WHY THIS IS A STATIC GUARD AND NOT A RUNTIME ONE, stated because the
 * runtime version is the obvious design and it is WRONG HERE. Counting
 * `$TMPDIR` before and after a run is the truer measurement, and it is
 * unusable in this repo: seats share one machine, so a peer's concurrent
 * `bun test` moves the count underneath you. Measured while writing this —
 * a global count returned a delta of **-1**, which a leak cannot produce. The
 * negative was the only reason the contamination was visible at all; had it
 * come back `+1` it would have been believed.
 *
 * ⚠ AND WHY IT IS AN ALLOW-LIST RATHER THAN A BAN on raw `mkdtempSync`:
 * `team-commit.test.ts` mints raw and is CLEAN (try/finally at all 28
 * `makeRepo` sites, measured +0). A blanket ban would go red on correct code
 * and force an edit to the one file #100 explicitly says not to touch. An
 * allow-list fails CLOSED on anything new while leaving verified-clean files
 * alone — the errors run toward false-positive, which costs one measurement,
 * rather than toward silent escape.
 *
 * To add an entry you must state HOW the file cleans up. That sentence is the
 * whole point: it is a named re-read moment, not a rubber stamp.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;

/** A raw mint: `mkdtempSync(join(tmpdir(), …))` written directly in a test. */
const RAW_MINT = /mkdtempSync\(\s*join\(\s*tmpdir\(\)/;

/**
 * Files permitted to mint raw, each with the mechanism that makes it safe.
 * A file NOT listed here that mints raw fails this guard.
 */
const ALLOWED: Record<string, string> = {
  "commands/team-commit.test.ts": "try/finally at every makeRepo site; measured +0 per run",
  "commands/team-comms.test.ts": "per-test cleanup; measured +0 per run",
  "commands/team-field-notes.test.ts": "try/finally; measured +0 per run",
  "commands/team-init.test.ts": "one module-level mint + afterAll(rmSync); measured +0 per run",
  "commands/team-join.test.ts": "try/finally; measured +0 per run",
  "commands/team-migrate.test.ts": "try/finally; measured +0 per run",
  "config.test.ts":
    "try/finally, plus two module-level mints with afterAll(rmSync); measured +0 per run",
  "scan.test.ts": "try/finally; measured +0 per run",
  "team-resolve.test.ts": "one module-level mint + afterAll(rmSync); measured +0 per run",
  // The three #100 leakers now mint through a registered helper, so their only
  // remaining `mkdtempSync` is INSIDE that helper. They are listed because the
  // helper itself is a raw mint — removing the registry would leave this entry
  // true while the leak returned, which is why the runtime assertion below
  // exists as well.
  "lock.test.ts": "registry + afterAll (MADE)",
  "comms.test.ts": "registry + afterAll (MADE)",
  "comms.rotation.test.ts": "registry + afterAll (MADE)",
};

/**
 * This guard's OWN filename. It is excluded from the scan because it carries
 * the `RAW_MINT` pattern as a PATTERN and therefore matches itself — it calls
 * `mkdtempSync` nowhere. Caught by running the guard rather than by reading it:
 * the unmutated control came back RED, naming this file.
 *
 * Recorded rather than silently filtered, because "the instrument matched its
 * own description of what it looks for" is the same class as a grep hitting the
 * prose that discusses the string, and the exclusion is the thing a later
 * reader would otherwise mistake for an oversight.
 */
const SELF = "tmpleak.guard.test.ts";

/** Every `*.test.ts` under the anthill scripts tree, repo-relative. */
function testFiles(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...testFiles(join(dir, entry.name), rel));
    else if (entry.name.endsWith(".test.ts") && rel !== SELF) out.push(rel);
  }
  return out;
}

describe("#100 — a new temp-dir leak must be RED, not merely unnoticed", () => {
  test("every test file that mints a temp dir is accounted for", () => {
    const files = testFiles(ROOT);

    // POSITIVE CONTROL: the scan must actually reach files that mint. A zero
    // here would make the assertion below pass for the wrong reason — the
    // failure mode this whole guard exists to prevent, inside the guard.
    const minters = files.filter((f) => RAW_MINT.test(readFileSync(join(ROOT, f), "utf8")));
    expect(minters.length).toBeGreaterThan(0);

    const unaccounted = minters.filter((f) => !(f in ALLOWED));
    expect(unaccounted).toEqual([]);
  });

  test("the three repaired leakers still register what they mint", () => {
    // Pinned separately from the allow-list because the allow-list entry stays
    // TRUE if someone deletes the registry — the file still mints raw, and it
    // is still listed. This is the assertion that goes red on that edit.
    for (const f of ["lock.test.ts", "comms.test.ts", "comms.rotation.test.ts"]) {
      const src = readFileSync(join(ROOT, f), "utf8");
      expect({ file: f, registers: src.includes("MADE.push") }).toEqual({
        file: f,
        registers: true,
      });
      expect({ file: f, cleansUp: /afterAll\(/.test(src) }).toEqual({ file: f, cleansUp: true });
    }
  });
});

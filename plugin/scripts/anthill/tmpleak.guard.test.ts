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
  "commands/team-init.multiteam.test.ts":
    "one module-level mint + afterAll(rmSync); every repo() is a subdir of it; measured +0 per run",
  "commands/team-join.test.ts": "try/finally; measured +0 per run",
  "commands/team-migrate.test.ts": "try/finally; measured +0 per run",
  "commands/team-scan.test.ts":
    "one module-level mint + afterAll(rmSync); both fixtures are subdirs; measured +0 per run",
  "commands/team-support.boardbinding.test.ts":
    "one module-level mint + afterAll(rmSync); every fixture is a subdir of it; measured +0 per run",
  "commands/team-support.liveteams.test.ts":
    "one module-level mint + afterAll(rmSync); measured +0 per run",
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

/** The detector, as a pure function of source text. */
function mintsRaw(src: string): boolean {
  return RAW_MINT.test(src);
}

/**
 * The verdict, over `[relative path, source]` pairs rather than over the tree.
 *
 * Split from the filesystem walk so it can be handed synthetic files. A detector
 * reachable only through the real tree can only be tested by BREAKING the real
 * tree — which means, in practice, it is tested once by hand and never again.
 */
function unaccountedIn(entries: Array<readonly [string, string]>): string[] {
  return entries.filter(([rel, src]) => mintsRaw(src) && !(rel in ALLOWED)).map(([rel]) => rel);
}

describe("#100 — a new temp-dir leak must be RED, not merely unnoticed", () => {
  test("every test file that mints a temp dir is accounted for", () => {
    const entries = testFiles(ROOT).map((f) => [f, readFileSync(join(ROOT, f), "utf8")] as const);

    // POSITIVE CONTROL: the scan must actually reach files that mint. A zero
    // here would make the assertion below pass for the wrong reason — the
    // failure mode this whole guard exists to prevent, inside the guard.
    expect(entries.filter(([, src]) => mintsRaw(src)).length).toBeGreaterThan(0);

    expect(unaccountedIn(entries)).toEqual([]);
  });

  /**
   * POSITIVE CONTROLS ON THE DETECTOR — the guard proving it can still SEE.
   *
   * ⚠ THE CONTROL ABOVE ASSERTS THE SCAN REACHES MINTERS. IT DOES NOT ASSERT THE
   * DETECTOR STILL RECOGNISES ONE. Both failures print the same thing on a clean
   * tree — an empty list — so `toEqual([])` is satisfied just as well by a guard
   * that has gone blind as by a tree that is clean.
   *
   * Written after `bare-anthill.guard.test.ts` shipped twice with a detector that
   * could not see the defect it was built for, both times caught by a reviewer
   * injecting one by hand. Hand injection happens once, by whoever remembers.
   */
  test("POSITIVE CONTROL: an unlisted file that mints raw is reported", () => {
    const raw = "const dir = mkdtempSync(join(tmpdir(), 'anthill-x-'));";
    expect(unaccountedIn([["commands/brand-new.test.ts", raw] as const])).toEqual([
      "commands/brand-new.test.ts",
    ]);
  });

  test("POSITIVE CONTROL: the pattern matches the real shape, and tolerates wrapping", () => {
    // ⚠ ONLY `inline` IS AN OBSERVED SHAPE. Every raw mint in this tree today is
    // single-line with double quotes, and biome — not prettier — formats it, so
    // the wrapped and spaced cases are INSURANCE against a future formatter or a
    // longer path, not evidence of anything. Labelled rather than implied,
    // because an earlier version of this comment claimed all three were real
    // shapes and review falsified it by grepping the tree.
    expect({
      inline: mintsRaw('mkdtempSync(join(tmpdir(), "anthill-x-"))'),
      wrapped: mintsRaw('mkdtempSync(\n  join(\n    tmpdir(),\n    "anthill-x-",\n  ),\n)'),
      spaced: mintsRaw('mkdtempSync( join( tmpdir(), "anthill-x-" ) )'),
      // NEGATIVE half — without it, a detector stuck at `true` passes every case
      // above while the verdict test stays green only because everything is
      // allow-listed.
      unrelated: mintsRaw("const dir = makeRepo();"),
    }).toEqual({ inline: true, wrapped: true, spaced: true, unrelated: false });
  });

  /**
   * THE SCAN SET — uncontrolled until review measured it. Narrowing the walk to
   * one subdirectory, or dropping a file by name, left this file green.
   *
   * Floor plus one named file per level, so ADDING a test file never fails this
   * and only LOSING reach does.
   */
  test("the scan reaches the whole test tree — root, subdirectory, and a floor", () => {
    const files = testFiles(ROOT);
    expect({
      root: files.includes("config.test.ts"),
      commands: files.includes("commands/team-commit.test.ts"),
      atLeast: files.length >= 20,
      excludesSelf: !files.includes(SELF),
    }).toEqual({ root: true, commands: true, atLeast: true, excludesSelf: true });
  });

  /**
   * ⚠ A STATED LIMIT, NOT A GAP LEFT UNNOTICED — and it is the same class of
   * defect that cost `bare-anthill.guard.test.ts` two review rounds.
   *
   * **This allow-list is keyed by FILE.** A second raw mint added to an already
   * listed file is exonerated by its neighbour, exactly as one allow-listed
   * `anthill comms` once exonerated every `anthill comms` in its file. Asserted
   * here so the property is visible rather than assumed.
   *
   * Kept deliberately, because unlike that case the ENTRY'S REASON is genuinely a
   * file-level claim — *"try/finally at every `makeRepo` site; measured +0 per
   * run"* is a statement about the whole file, re-measurable by rerunning the
   * suite and counting `$TMPDIR`. Per-occurrence keying would buy strictness the
   * reasons could not honestly support.
   *
   * **The cost is real: an unclean mint added to a listed file passes.** The
   * mitigation is that the entry's `measured +0 per run` goes stale, and re-
   * measuring is what a reviewer of that file is supposed to do.
   */
  /**
   * ⚠ THE SECOND KNOWN LIMIT, AND THE WIDER OF THE TWO — declared because this
   * repo's own rule is to assert a limit rather than leave it implied, and the
   * per-file one below was shipped alone while this was merely true.
   *
   * `RAW_MINT` is SYNTACTIC. It matches one spelling: `mkdtempSync(join(tmpdir()`.
   * Every form below is a real leak this guard does not see. All are measured.
   * None appears in the tree today, which is why the narrow pattern is still the
   * right trade — a broader one would flag prose and helper names — but a reader
   * must not read a green here as "no test can leak".
   */
  test("KNOWN LIMIT: the pattern is syntactic, so other spellings of the same leak pass", () => {
    expect({
      // Built, not written literally: a `${…}` inside a plain string is a biome error.
      templateLiteral: mintsRaw(`mkdtempSync(\`\${tmpdir()}/x-\`)`),
      asyncForm: mintsRaw('await mkdtemp(join(tmpdir(), "x-"))'),
      viaResolve: mintsRaw('mkdtempSync(resolve(tmpdir(), "x-"))'),
      throughALocal: mintsRaw('const base = tmpdir(); mkdtempSync(join(base, "x-"))'),
      namespaced: mintsRaw('mkdtempSync(join(os.tmpdir(), "x-"))'),
    }).toEqual({
      templateLiteral: false,
      asyncForm: false,
      viaResolve: false,
      throughALocal: false,
      namespaced: false,
    });
  });

  test("KNOWN LIMIT: exoneration is per FILE, so a listed file's new mint is not caught", () => {
    const listed = "commands/team-commit.test.ts";
    expect(listed in ALLOWED).toBe(true);
    expect(unaccountedIn([[listed, "mkdtempSync(join(tmpdir(), 'leaky-'))"] as const])).toEqual([]);
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

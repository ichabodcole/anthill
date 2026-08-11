/**
 * A bare `anthill` in a string an AGENT re-invokes is a different binary.
 *
 * PATH resolves `anthill` to the optional global launcher, which picks the
 * highest CACHED RELEASE — so a string a seat runs verbatim can execute on a
 * binary other than the one that composed it, and a flag the composer has may
 * not exist there. `buildLandCommand` (`team-join.ts`) hit this for real.
 *
 * ⚠ IT IS NOT A BAN. `renderText` is the one surface an agent can NEVER read
 * (`agent-layer.ts`'s `resolveFormat` returns "text" only for a TTY, so an
 * agent's piped subprocess cannot reach it without asking), and a person typing
 * `anthill attach` WANTS PATH resolution — that is what the optional global
 * launcher is for. Resolving there hands them an absolute path into a plugin
 * cache. So the rule is a DISTINCTION, and both halves are asserted below.
 *
 * ⚠⚠ THE DISCRIMINATOR IS "CAN AN AGENT EVER READ IT", NOT "IS THE READER
 * HUMAN". Review found this file arguing the second while enforcing the first.
 * **`emitError` fires in BOTH formats** — under `--format text` a TTY human
 * reads it, and gets the long path. Payload fields are dual-read the same way
 * (`submitCmd` is in the JSON envelope AND printed by `feedback`'s
 * `renderText`). They resolve anyway, because an unresolved agent string runs a
 * different binary and fails silently while an unresolved human string is only
 * ugly. That cost is ACCEPTED, and `emittingCli`'s doc comment records why the
 * format-aware alternative was rejected.
 *
 * ⚠⚠ THIS IS AN ALLOW-LIST, AND THE FIRST VERSION WAS NOT — that is the repair.
 * v1 scanned ONE file with a CLOSED VERB LIST and classified hits by whether
 * they fell inside a 1200-character window after `renderText:`. Review broke it
 * three ways in one pass, each reproduced:
 *
 *   - the window made the guard LOOSER, not stricter as its own comment
 *     claimed — a hit swallowed by a window is silently exonerated, and those
 *     windows land in live handler code;
 *   - the verb list omitted `spawn`, `feedback`, `commit`, `init`, `team`,
 *     `migrate` … including the verb of the biggest real miss;
 *   - it covered `team-comms.ts` alone, while three same-class defects sat in
 *     `team-feedback.ts` and `team-attach.ts` — one of which
 *     `.anthill/dev/seams.md` (Contract 2) had ALREADY enumerated as
 *     "the stronger case because it is a string we hand a seat to re-invoke".
 *
 * An allow-list inverts all three: it scans EVERY source file, needs no verb
 * list, and anything unrecognised fails CLOSED. To add an entry you must state
 * why the string is safe — that sentence is the point, as in
 * `tmpleak.guard.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

/**
 * The CLI's OWN command names, read from its help output — not a list typed here.
 *
 * ⚠ THIS IS THE FIX FOR v1's CLOSED VERB LIST, which review broke by injecting
 * variants it could not see — including `spawn` and `feedback`, and `feedback`
 * was the verb of the biggest real miss.
 * Deriving means A NEW COMMAND JOINS THE SCAN THE DAY IT IS ADDED, with nobody
 * remembering to update this file.
 *
 * It also stops the guard matching ENGLISH. A bare `/anthill [a-z]+/` flagged
 * "anthill depends on spellbook", "anthill itself", "anthill footprint" — prose,
 * not invocations. Constraining to real verbs removes every one of those without
 * a hand-maintained exclusion list.
 */
function cliVerbs(): string[] {
  const out = Bun.spawnSync(["bun", join(ROOT, "cli.ts"), "help", "--format", "json"]);
  const parsed = JSON.parse(out.stdout.toString()) as {
    data: { commands: Array<{ name: string }> };
  };
  return parsed.data.commands.map((c) => c.name);
}

const VERBS = cliVerbs();

/**
 * `anthill <verb>`, `anthill help`, or `anthill --flag`.
 *
 * ⚠ `help` IS NOT IN `cliVerbs()` — the help output does not list itself, so the
 * derivation is self-blind and has to be topped up by hand. Same for a bare
 * `anthill --version`. Both were demonstrated as guard-defeat vectors.
 */
const BARE = new RegExp(`anthill (?:${VERBS.join("|")}|help|--?[a-z])`, "g");

/** How much preceding text distinguishes one occurrence from another. */
const CONTEXT = 52;

/**
 * Every bare-`anthill` string that is ALLOWED, and why. A hit not listed fails.
 *
 * Two legitimate kinds:
 *   **human**    — reached only via `renderText` / a TTY, where PATH resolution
 *                  is what the person wants.
 *   **template** — a syntax illustration carrying `<placeholders>`, not runnable
 *                  as written, so it cannot be executed by the wrong binary.
 */
const ALLOWED: Record<string, string> = {
  "config.ts :: anthill attach @ tbeprefixfreenotmerelyunique":
    "prose - explains WHY channels must be prefix-free, by describing attach's folding",
  "feedback.ts :: anthill feedback @ pmessagetrimFiledvia":
    "prose - a footer written INTO a GitHub issue body, read by a human on github.com",
  "team-resolve.ts :: anthill team @ nfigErrorerrmessageRepinwith":
    "template - `anthill team use <name>`, a syntax illustration",
  "team-resolve.ts :: anthill team @ mejoinPickoneforthisrepowith":
    "template - the same, in the ambiguity error",
  "commands/team-commit.ts :: anthill commit @ rroracommitmessageisrequired":
    "template - the usage line, with <msg> and <path> placeholders",
  "commands/team-commit.ts :: anthill commit @ agedfilepassexactlyyourpaths":
    "template - the same usage line in the no-pathspec refusal",
  "commands/team-comms.ts :: anthill comms @ oguessnEstablishananchorwith":
    "human - inside renderText",
  "commands/team-convene.ts :: anthill join @ eadwillbeUNWIREDunlessitruns":
    "template - `anthill join <handle>`; reaches warnings[] but is not runnable as written",
  "commands/team-convene.ts :: anthill down @ ushYourLASTactandrunitBEFORE":
    "human - inside renderText (lines.push on the render callback)",
  "commands/team-feedback.ts :: anthill feedback @ orafeedbackmessageisrequired":
    "template - the usage line carrying <message>",
  "commands/team-spawn.ts :: anthill attach @ hAttachingelselinespushWatch":
    "human - the Watch: line, inside renderText",
  "commands/team-spawn.ts :: anthill down @ hillattachlinespushStanddown":
    "human - the Stand down: line, inside renderText",
  "commands/team-team.ts :: anthill team @ inthepinatanthillcurrentteam":
    "template - `anthill team use <name>` in the rung prose",
  "commands/team-team.ts :: anthill team @ gth1rowspushNoteamisselected":
    "template - the same, in the ls footer",
};

/** Every `*.ts` under the anthill scripts tree, excluding tests. */
function sourceFiles(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...sourceFiles(join(dir, e.name), rel));
    else if (e.name.endsWith(".ts") && !e.name.endsWith(".test.ts")) out.push(rel);
  }
  return out;
}

/**
 * Source, normalized so the scan cannot be dodged by formatting.
 *
 * Comments go first — this file's own prose would otherwise match. Then adjacent
 * string literals are JOINED: this codebase splits long error strings at ~100
 * columns (`config.ts`, `team-convene.ts`, `team-team.ts` all do), so a
 * formatter break landing between `anthill` and its verb silently exonerated the
 * string. Finally runs of spaces collapse, closing the double-space dodge.
 * Every one of these was demonstrated against the previous version.
 */
function normalize(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/"\s*\+\s*"/g, "")
    .replace(/`\s*\+\s*`/g, "")
    .replace(/\s+/g, " ");
}

/**
 * `normalize` split from the file read ON PURPOSE — it is the DETECTOR, and a
 * detector that can only be fed the real tree can only be tested by breaking the
 * real tree. Taking a string lets `POSITIVE CONTROLS` below hand it synthetic
 * defects on every run instead of once, by hand, at authoring time.
 */
function code(rel: string): string {
  return normalize(readFileSync(join(ROOT, rel), "utf8"));
}

/**
 * A stable key per OCCURRENCE — the matched text plus the text before it.
 *
 * ⚠ THIS IS THE REPAIR FOR THE WORST DEFECT THIS GUARD HAS HAD. It keyed on the
 * matched substring alone, deduped per file — so ONE allow-listed
 * `anthill comms` in `team-comms.ts` exonerated EVERY `anthill comms` in that
 * file, including the two agent-facing ones the branch existed to fix.
 * Demonstrated: reverting the `emitError` fix left the guard green AND the whole
 * 688-test suite green. Keying on context makes each occurrence its own entry,
 * so a new agent-facing string in an already-listed file fails CLOSED.
 */
function occurrences(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(BARE)) {
    const at = m.index ?? 0;
    // A QUOTE-FREE slug of the preceding text. The raw source context carries
    // quotes and backticks, which cannot go in a string-literal key — and the
    // slug is stable under requoting, which raw context is not.
    const slug = src
      .slice(Math.max(0, at - CONTEXT), at)
      .replace(/[^a-zA-Z0-9]+/g, "")
      .slice(-28);
    out.push(`${m[0]} @ ${slug}`);
  }
  return [...new Set(out)];
}

describe("bare `anthill` — every occurrence is accounted for", () => {
  const hits = sourceFiles(ROOT).flatMap((rel) =>
    occurrences(code(rel)).map((m) => `${rel} :: ${m}`),
  );

  test("POSITIVE CONTROL: the scan reaches files that mention it", () => {
    // A zero makes every assertion below pass for the wrong reason — the
    // failure this guard exists to prevent, inside the guard.
    expect(hits.length).toBeGreaterThan(0);
  });

  test("every bare `anthill` is on the allow-list, with a stated reason", () => {
    expect(hits.filter((h) => !(h in ALLOWED))).toEqual([]);
  });

  test("the strings an AGENT re-invokes resolve to the emitting cli", () => {
    // Named individually rather than derived, because these are exactly the
    // ones seams.md Contract 2 enumerates as agent-re-invoked.
    for (const [file, needle] of [
      ["commands/team-comms.ts", "catchUpWith"],
      ["commands/team-feedback.ts", "buildSubmitCmd"],
      ["commands/team-attach.ts", "spawn one with"],
    ] as const) {
      const src = code(file);
      expect({ file, needle, present: src.includes(needle) }).toEqual({
        file,
        needle,
        present: true,
      });
      expect({ file, resolves: src.includes("emittingCli()") }).toEqual({ file, resolves: true });
    }
  });

  test("the HUMAN-facing hints still say bare `anthill` — not a bug", () => {
    // Asserted so a later sweep cannot "fix" them into absolute plugin-cache
    // paths. If this goes red, the question is who reads `--format text`.
    expect(code("commands/team-comms.ts")).toContain(
      "Establish an anchor with: anthill comms read",
    );
    expect(code("commands/team-spawn.ts")).toContain("anthill attach");
  });
});

/**
 * POSITIVE CONTROLS ON THE DETECTOR — the guard proving it can still SEE.
 *
 * ⚠ EVERY TEST ABOVE ASSERTS THE TREE IS CLEAN. Not one of them asserts this
 * file could tell if it were not. Those are different claims, and a guard that
 * has quietly stopped detecting satisfies the first one perfectly — it reports
 * an empty list, which is exactly what a clean tree reports.
 *
 * This is not hypothetical here. It is the documented history of this file:
 * a closed verb list missed **6 of 6** injected variants including the branch's
 * own biggest miss, and a dedup key let one allow-listed string exonerate its
 * neighbours — **so reverting the fix left this guard green and all 688 tests
 * green.** Both were found by a reviewer injecting defects BY HAND. Hand
 * injection happens once, by whoever remembers; these run on every `bun test`.
 *
 * Each case below is a defect that once defeated this guard, kept as a
 * regression test on the INSTRUMENT rather than on the tree.
 */
describe("bare `anthill` — POSITIVE CONTROLS: the detector still detects", () => {
  const detects = (src: string) => occurrences(normalize(src)).length > 0;

  test("a plainly injected agent-facing invocation is seen", () => {
    expect(detects('emitError({ error: "Read them with: anthill comms read --channel x" })')).toBe(
      true,
    );
  });

  test("the four historic guard-defeat vectors are all still seen", () => {
    expect({
      // `help` is absent from `anthill help --format json`'s own output, so the
      // derived verb set is self-blind to it and `BARE` tops it up by hand.
      help: detects('lines.push("run anthill help for the command set")'),
      // `--?[a-z]` — a flag, not a verb, so no derivation can supply it.
      flag: detects('lines.push("check anthill --version before filing")'),
      // The formatter splits long errors at ~100 columns. A break landing between
      // the binary and its verb used to exonerate the whole string.
      concatenated: detects('error: "spawn one with: anthill " + "spawn --as forager"'),
      // ⚠ THE BACKTICK FORM IS THE DOMINANT ONE IN THIS TREE (`migrate.ts` splits
      // this way five times), and `normalize` repairs it with a SEPARATE branch
      // from the double-quote case above. Review measured that blinding that
      // branch left this whole file green — the commoner shape was the
      // uncontrolled one.
      backtickConcatenated: detects("error: `spawn one with: anthill ` + `spawn --as forager`"),
      // Two spaces made the literal `anthill <verb>` pattern miss.
      doubleSpaced: detects('error: "run anthill  down to release the board"'),
    }).toEqual({
      help: true,
      flag: true,
      concatenated: true,
      backtickConcatenated: true,
      doubleSpaced: true,
    });
  });

  /**
   * THE F1 CONTROL, AND THE MOST IMPORTANT TEST IN THIS FILE.
   *
   * The failure was not "the detector missed a string" — it saw it. The KEY
   * collapsed: hits were deduped by matched text per file, so the one
   * allow-listed human-facing `anthill comms` in `team-comms.ts` covered every
   * `anthill comms` in it, including the two agent-facing ones the fix existed to
   * repair. **Nothing in a clean tree can show that**, because a clean tree has
   * no neighbour to be exonerated. It needs a defect injected into a file the
   * allow-list ALREADY covers — so that is what this does, every run.
   */
  test("a NEW defect in an already-allow-listed file is reported, not exonerated by its neighbour", () => {
    const file = "commands/team-comms.ts";
    const listedAlready = Object.keys(ALLOWED).some((k) =>
      k.startsWith(`${file} :: anthill comms`),
    );
    expect({ file, hasAnAllowListedTwin: listedAlready }).toEqual({
      file,
      hasAnAllowListedTwin: true,
    });

    const clean = occurrences(code(file));
    const injected = occurrences(
      normalize(
        `${readFileSync(join(ROOT, file), "utf8")}
         const leak = 'catch up with: anthill comms read --channel x --since 0';`,
      ),
    );
    const fresh = injected.filter((h) => !clean.includes(h));

    expect({ newOccurrences: fresh.length }).toEqual({ newOccurrences: 1 });
    expect({ file, wouldBeReported: !(`${file} :: ${fresh[0]}` in ALLOWED) }).toEqual({
      file,
      wouldBeReported: true,
    });
  });

  /**
   * THE SCAN SET, WHICH IS THE OTHER HALF OF GOING BLIND — and review found it
   * uncontrolled after the detector had been fixed.
   *
   * Every control above feeds `occurrences` a string. **None of them cares which
   * FILES ever reach it.** Narrow the walk to `commands/` alone, or drop one file
   * by name, and this file stays green — measured. That is not a hypothetical
   * failure mode here: it is **the third of the three v1 defects this file's own
   * header enumerates** ("it covered `team-comms.ts` alone, while three
   * same-class defects sat in `team-feedback.ts` and `team-attach.ts`"). The
   * repair made the detector falsifiable and left the scan set exactly as
   * unfalsifiable as it was.
   *
   * Pinned as a floor plus one named file per directory level, rather than an
   * exact list, so adding a source file does not fail this — only LOSING reach
   * does.
   */
  test("the scan reaches the whole tree — root, subdirectory, and a floor on the count", () => {
    const files = sourceFiles(ROOT);
    expect({
      root: files.includes("config.ts"),
      commands: files.includes("commands/team-comms.ts"),
      // Well under the real count, so this pins REACH and not a census.
      atLeast: files.length >= 20,
      excludesTests: files.every((f) => !f.endsWith(".test.ts")),
    }).toEqual({ root: true, commands: true, atLeast: true, excludesTests: true });
  });

  test("NEGATIVE CONTROL: the resolved form is not flagged, so the guard is not just matching everything", () => {
    // Without this, every control above is satisfied by a detector that returns
    // true unconditionally — which would fail the tree assertions loudly, but
    // only because it flags the allow-listed strings too. Stated separately so
    // the discrimination is asserted rather than inferred.
    // Built, not written literally: a `${…}` inside a plain string is a biome
    // error, and the fixture is only faithful if it carries the interpolation.
    const sub = (expr: string) => `\${${expr}}`;
    expect(
      detects(`error: \`Read them with: ${sub("emittingCli()")} comms read --channel x\``),
    ).toBe(false);
  });
});

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
 *
 * ⚠⚠ THIS GUARD COVERS TWO MEDIA, AND THE SECOND WAS ADDED AFTER IT SHIPPED A
 * DEFECT. Everything above is about `*.ts`. But agents read MARKDOWN too, by
 * three routes: `anthill field-notes` prints `field-notes.md` verbatim, `anthill
 * init` renders `templates/docs-team/**` into a team's living docs that every
 * seat reads at join, and **`skills/` is read by every agent in every consuming
 * project on every invocation**. The `.ts` walk saw none of them, and
 * `principles.md` shipped a fenced `sh` block whose whole content was a bare
 * `anthill field-notes` — a copy-paste target, in the medium people copy from.
 *
 * **It was invisible from inside this repo**: `init` never clobbers, so our own
 * `.anthill/` predates the block and a clean local tree proved nothing.
 *
 * ⚠ THE SKILLS SURFACE WAS THE LAST ONE ANYBODY THOUGHT OF, and it is the
 * largest. It arrived from running the cascade check on the other two rather
 * than from reasoning about who reads what — which is the argument for running
 * the cascade check even when the change feels finished. It held three fenced
 * bare invocations and two sub-documents using the shorthand with no legend,
 * one of them `plan/methodology.md`, the PORTABLE half that travels alone.
 *
 * Markdown needs a DIFFERENT rule, not the same one. Prose about a tool has to
 * be able to name it — banning `anthill comms` from a sentence would make the
 * docs unwritable, and this file already learned that lesson once (see
 * `cliVerbs`, "it stops the guard matching ENGLISH"). So the two rules below key
 * on what a reader DOES with the text:
 *
 *   1. **A fenced code block is a copy-paste target.** A legend explaining that
 *      `anthill` is shorthand is prose, and prose does not travel with the copy.
 *      A bare invocation inside a fence fails, legend or not.
 *   2. **Prose may use the shorthand, if its OWN document says so.** The legend
 *      is a per-document contract, and a document is what gets emitted — so it
 *      is checked per document rather than per occurrence.
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

const PLUGIN_ROOT = join(ROOT, "..", "..");

/**
 * The claim that makes prose shorthand safe.
 *
 * ⚠ A PATTERN, NOT A STRING, AND THE FIRST DRAFT WAS A STRING — which is how
 * this nearly shipped wrong. It pinned `"SHORTHAND, not a binary on your PATH"`,
 * the wording of the docs being written at the time, and **the seven skills say
 * `"shorthand, not a binary on PATH"`** — same claim, different sentence. A
 * guard keyed to one author's phrasing reports every other author as a defect,
 * so it matches the load-bearing assertion (`anthill` is not a binary on PATH)
 * and lets the sentence around it vary.
 */
const LEGEND = /shorthand, not a binary on (?:your )?PATH/i;

/**
 * Markdown an AGENT reads, and the three routes it travels.
 *
 * Derived by walking, not listed, for the same reason `cliVerbs` is derived: a
 * new doc dropped into any of these trees joins the scan the day it is added,
 * with nobody remembering to come here.
 *
 * ⚠ `skills/` IS THE BIGGEST OF THE THREE and was the last one anybody thought
 * of. `templates/` reaches teams that run `init`; `field-notes.md` reaches
 * whoever asks for it; **`skills/` is read by every agent in every consuming
 * project, on every invocation.** It was found by running the cascade check on
 * the other two rather than by anyone reasoning about blast radius.
 */
function agentReadMarkdown(): string[] {
  const out = ["scripts/anthill/field-notes.md"];
  const walk = (dir: string): void => {
    for (const e of readdirSync(join(PLUGIN_ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith(".md")) out.push(rel);
    }
  };
  walk("templates/docs-team");
  walk("skills");
  return out;
}

function markdown(rel: string): string {
  return readFileSync(join(PLUGIN_ROOT, rel), "utf8");
}

/**
 * Bare invocations sitting inside a FENCED code block.
 *
 * Split from the file read, like `normalize`, so the controls can hand it
 * synthetic documents on every run rather than depending on the real tree
 * carrying a defect.
 *
 * ⚠ THE FIRST VERSION TOGGLED A BOOLEAN ON ANY ``` OR ~~~ LINE, and review
 * broke it three ways, each reproduced against a real doc:
 *
 *   - **a fence inside a BLOCKQUOTE was invisible** — and that is the shape
 *     that matters most here, because every legend this guard requires is
 *     itself a blockquote, so blockquoted content is the house idiom;
 *   - **a `~~~` line quoted INSIDE a ``` block flipped parity for the rest of
 *     the file**, so a document that merely illustrates a tilde fence turned
 *     every later fence into prose;
 *   - **a 4-backtick fence containing a 3-backtick example** closed early, for
 *     the same reason.
 *
 * So the marker's CHARACTER and LENGTH are tracked, a closing fence must match
 * or exceed the opener and carry no info string, and leading `>` is stripped.
 */
function fencedInvocations(src: string): string[] {
  const out: string[] = [];
  let fence: { marker: string; length: number } | null = null;
  for (const raw of src.split("\n")) {
    const line = raw.replace(/^\s*(?:>\s?)+/, "");
    const m = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (m) {
      const marker = (m[1] as string)[0] as string;
      const length = (m[1] as string).length;
      if (fence === null) {
        fence = { marker, length };
      } else if (marker === fence.marker && length >= fence.length && (m[2] ?? "").trim() === "") {
        fence = null;
      }
      continue;
    }
    if (fence === null) continue;
    for (const hit of line.replace(/\s+/g, " ").matchAll(BARE)) out.push(hit[0]);
  }
  return out;
}

/** Does this document use the bare shorthand at all — fence or prose? */
function usesShorthand(src: string): boolean {
  return [...src.replace(/\s+/g, " ").matchAll(BARE)].length > 0;
}

/**
 * Does the document carry the legend where a READER will meet it?
 *
 * ⚠ FENCED CONTENT IS STRIPPED FIRST. Review found the legend satisfied by text
 * sitting inside a code block — a doc that merely QUOTES the legend as an
 * example (this file's own controls do exactly that) would otherwise license
 * every bare mention in it. The legend has to be an assertion the document
 * makes, not a string it happens to contain.
 *
 * KNOWN LIMIT, unfixable by pattern: a NEGATED legend ("ignore anyone who says
 * this is shorthand, not a binary on PATH") still satisfies this. Detecting
 * that needs a reader, and the reader is the cold read.
 */
function carriesLegend(src: string): boolean {
  const prose = src.replace(/^\s*(?:>\s?)*(?:```|~~~)[\s\S]*?^\s*(?:>\s?)*(?:```|~~~)\s*$/gm, "");
  return LEGEND.test(prose);
}

/**
 * A fenced bare invocation that is nonetheless allowed, and why.
 *
 * **Empty, and that is a claim rather than an oversight**: after `principles.md`
 * was repaired there is no fence in the emitted set that needs the shorthand,
 * because a fence's whole purpose is to be run verbatim and the resolved form is
 * no harder to read. An entry here would have to argue that a copy-paste target
 * should not work when copied.
 */
const FENCE_ALLOWED: Record<string, string> = {};

/** A document that uses the shorthand without carrying the legend, and why. */
const LEGENDLESS_ALLOWED: Record<string, string> = {};

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

  /**
   * ⚠ THE OTHER DIRECTION, AND THE ONE THAT CATCHES A SHRINKING SCAN.
   *
   * The assertion above asks *"is every hit allowed?"* — which **a scan that
   * reaches nothing satisfies perfectly.** This asks *"is every allowance still
   * earning itself?"*, so a file dropped from the walk orphans its entries and
   * goes RED.
   *
   * Review measured why this is needed: after the walk was pinned by level, an
   * unnamed file could still be skipped silently — including `team-attach.ts` and
   * `team-feedback.ts`, **two of the three files `seams.md` Contract 2 names as
   * agent-re-invoked**, which is the exact class of the original miss. It also
   * closes a second hole: a verb quietly lost from `cliVerbs()` stops matching,
   * which orphans that verb's entries here.
   *
   * The allow-list stops being write-only: an entry that no longer describes
   * anything real must be deleted, and deleting it is a decision someone makes on
   * purpose rather than a silence nobody notices.
   */
  test("every allow-list entry is still EARNED — a stale or orphaned one fails", () => {
    expect(Object.keys(ALLOWED).filter((k) => !hits.includes(k))).toEqual([]);
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

describe("bare `anthill` — the MARKDOWN we emit to agents", () => {
  const docs = agentReadMarkdown();

  test("POSITIVE CONTROL: the walk reaches all THREE emitted routes", () => {
    // Named, not counted. `field-notes.md` is the `anthill field-notes` payload
    // and `principles.md` is where the shipped defect actually lived — a floor
    // would let either leave the walk silently, which is the failure this
    // guard's own scan-set history is made of.
    //
    // ⚠ THE SKILLS ROW EXISTS BECAUSE REVIEW MEASURED ITS ABSENCE. The first
    // version of this test named `field-notes.md` and four template paths and
    // pinned NOTHING under `skills/` — the surface this file's own header calls
    // the biggest of the three. Deleting `walk("skills")` left the guard green
    // AND the whole suite green **with the branch's own defect put back** (the
    // fenced `anthill comms` in `comms/SKILL.md` restored from develop). Worse
    // than the `.ts` half it was written to improve on: not a weak floor, no
    // floor at all. Both allow-lists are empty, so the read-backwards assertion
    // could not cover for it either — an empty allow-list orphans nothing.
    expect({
      fieldNotes: docs.includes("scripts/anthill/field-notes.md"),
      sopSeed: docs.includes("templates/docs-team/README.md"),
      principles: docs.includes("templates/docs-team/principles.md"),
      seatLayer: docs.includes("templates/docs-team/dev/README.md"),
      nested: docs.some((d) => d.startsWith("templates/docs-team/dev/")),
      // The three skill docs that HELD a fenced defect, plus the portable half
      // — the files a shrinking walk would have to keep reaching to stay honest.
      skillsThatHeldDefects: ["skills/bootstrap/SKILL.md", "skills/comms/SKILL.md"].every((f) =>
        docs.includes(f),
      ),
      portableHalf: docs.includes("skills/plan/methodology.md"),
      skillSubdocs: docs.includes("skills/upgrade/migrations/v1-to-v2.md"),
    }).toEqual({
      fieldNotes: true,
      sopSeed: true,
      principles: true,
      seatLayer: true,
      nested: true,
      skillsThatHeldDefects: true,
      portableHalf: true,
      skillSubdocs: true,
    });
  });

  test("no fenced code block hands an agent a bare `anthill` to run", () => {
    // A fence is copied. The legend is not copied with it.
    const fenced = docs.flatMap((d) =>
      fencedInvocations(markdown(d)).map((hit) => `${d} :: ${hit}`),
    );
    expect(fenced.filter((h) => !(h in FENCE_ALLOWED))).toEqual([]);
  });

  test("every document that uses the shorthand carries the legend explaining it", () => {
    // Per DOCUMENT, because a document is the unit that gets emitted. A seat
    // reading `principles.md` in its own footprint never sees `README.md`'s
    // legend, and `anthill field-notes` prints its payload to an agent who may
    // have no team and no footprint at all.
    const legendless = docs.filter(
      (d) => usesShorthand(markdown(d)) && !carriesLegend(markdown(d)),
    );
    expect(legendless.filter((d) => !(d in LEGENDLESS_ALLOWED))).toEqual([]);
  });

  test("every allow-list entry is still EARNED — read backwards, like the `.ts` one", () => {
    const fenced = docs.flatMap((d) =>
      fencedInvocations(markdown(d)).map((hit) => `${d} :: ${hit}`),
    );
    const legendless = docs.filter(
      (d) => usesShorthand(markdown(d)) && !carriesLegend(markdown(d)),
    );
    expect({
      staleFenceEntries: Object.keys(FENCE_ALLOWED).filter((k) => !fenced.includes(k)),
      staleLegendEntries: Object.keys(LEGENDLESS_ALLOWED).filter((k) => !legendless.includes(k)),
    }).toEqual({ staleFenceEntries: [], staleLegendEntries: [] });
  });
});

/**
 * POSITIVE CONTROLS ON THE MARKDOWN DETECTORS.
 *
 * ⚠ THE TESTS ABOVE ALL ASSERT THE EMITTED DOCS ARE CLEAN, and every one of them
 * is satisfied by a detector that has stopped seeing — an empty list of fenced
 * hits is exactly what a clean set of docs produces. The `.ts` half of this file
 * learned that the expensive way; the markdown half is born with it.
 */
describe("bare `anthill` — POSITIVE CONTROLS: the markdown detectors still detect", () => {
  const doc = (body: string) => `# Title\n\n${body}\n`;

  test("a fenced bare invocation is seen", () => {
    expect(fencedInvocations(doc("```sh\nanthill field-notes\n```"))).toEqual([
      "anthill field-notes",
    ]);
  });

  test("the double-space dodge is closed inside a fence", () => {
    expect(fencedInvocations(doc("```sh\nanthill   comms read --channel x\n```"))).toEqual([
      "anthill comms",
    ]);
  });

  test("a fence inside a BLOCKQUOTE is seen — the house idiom, and the first version's worst miss", () => {
    // Every legend this guard requires is a blockquote, so blockquoted content
    // is how this repo writes. The boolean-toggle version could not see in.
    expect(fencedInvocations(doc("> ```sh\n> anthill down\n> ```"))).toEqual(["anthill down"]);
  });

  test("fence PARITY survives a quoted fence of the other kind, and a nested shorter one", () => {
    // A doc that merely ILLUSTRATES a `~~~` fence used to invert parity for its
    // whole remainder, turning every later fence into prose. Same for a
    // 4-backtick block containing a 3-backtick example.
    expect(fencedInvocations(doc("```md\n~~~\n```\n\n```sh\nanthill down\n```"))).toEqual([
      "anthill down",
    ]);
    expect(
      fencedInvocations(
        doc("````md\n```\nnot a real fence\n```\n````\n\n```sh\nanthill init\n```"),
      ),
    ).toEqual(["anthill init"]);
  });

  /**
   * KNOWN LIMITS, asserted rather than implied — the `tmpleak.guard.test.ts`
   * shape. Each is a construct the fence rule genuinely cannot see, kept as a
   * failing-by-design expectation so nobody infers coverage from silence.
   *
   * ⚠ AN EARLIER VERSION OF THIS FILE CLAIMED THE OPPOSITE for the wrap case,
   * in a test NAMED "still seen" whose assertion said the reverse, justified by
   * a rationale that was also false — this repo sets `proseWrap: preserve` and
   * prettier never reflows fenced content in any case. Corrected here rather
   * than quietly dropped, because the wrong version is instructive: the test
   * name is what a future reader trusts.
   */
  test("KNOWN LIMIT: an indented block, an HTML <pre>, and a hand-wrapped line are NOT seen", () => {
    expect({
      // Measured, and the reason it stays a limit: treating 4-space indentation
      // as code produces 26 hits across four skills, every one a nested LIST
      // CONTINUATION rather than a command. A rule with that false-positive
      // rate would be turned off within a week.
      indented: fencedInvocations(doc("    anthill down")),
      html: fencedInvocations(doc("<pre>anthill down</pre>")),
      // A hand-authored break between the binary and its verb. Whitespace is
      // collapsed PER LINE, so this survives; `usesShorthand` collapses the
      // whole document and does see it, which is why the legend rule is the
      // one that catches a wrapped prose mention.
      handWrapped: fencedInvocations(doc("```sh\nanthill\n  down\n```")),
    }).toEqual({ indented: [], html: [], handWrapped: [] });
    expect(usesShorthand("```sh\nanthill\n  down\n```")).toBe(true);
  });

  test("NEGATIVE CONTROL: prose and the RESOLVED fenced form are both left alone", () => {
    // Without this the fence rule is satisfied by a detector that flags
    // everything — which would fail loudly, but only because it also flags the
    // docs that are correct. Discrimination asserted, not inferred.
    expect(fencedInvocations(doc("Catch up on the wire with `anthill comms read`."))).toEqual([]);
    expect(
      fencedInvocations(
        doc('```sh\nbun "$CLAUDE_PLUGIN_ROOT/scripts/anthill/cli.ts" field-notes\n```'),
      ),
    ).toEqual([]);
  });

  test("the legend detector reports a document that uses the shorthand without one", () => {
    const bare = doc("Tell us with `anthill feedback`.");
    expect({ uses: usesShorthand(bare), hasLegend: carriesLegend(bare) }).toEqual({
      uses: true,
      hasLegend: false,
    });
    // And the converse, so a detector stuck on `true` cannot pass this.
    const quiet = doc("The team keeps its own principles here.");
    expect(usesShorthand(quiet)).toBe(false);
  });

  /**
   * THE F1 CONTROL FOR THE MARKDOWN HALF — the twin of the `.ts` one above.
   *
   * A document that ALREADY carries the legend is the dangerous case: the legend
   * satisfies rule 2 for the whole file, so a fence added to it later is exactly
   * the hit a per-document check would exonerate. `README.md` is that document,
   * and it is the largest and most-edited of them — so the injection goes there,
   * every run, rather than into a synthetic string that proves nothing about the
   * real one.
   */
  test("a fence injected into a doc that ALREADY carries the legend is still reported", () => {
    const rel = "templates/docs-team/README.md";
    const src = markdown(rel);
    expect({ rel, carriesLegend: carriesLegend(src) }).toEqual({ rel, carriesLegend: true });
    expect(fencedInvocations(src)).toEqual([]);

    const injected = fencedInvocations(`${src}\n\`\`\`sh\nanthill down\n\`\`\`\n`);
    expect({ rel, reportedAnyway: injected.includes("anthill down") }).toEqual({
      rel,
      reportedAnyway: true,
    });
  });

  /**
   * KNOWN LIMIT, asserted rather than implied — the shape `tmpleak.guard.test.ts`
   * uses for its per-file exoneration.
   *
   * The walk covers what this plugin SHIPS. It does not cover `.anthill/`, this
   * repo's own rendered footprint, which is a living doc our seats edit freely
   * and which `init` deliberately never overwrites. So our footprint can drift
   * from the templates and nothing here fails — that reconciliation belongs to
   * `cascade-check`, and naming it is the point: the drift is invisible to the
   * gate BY DESIGN, and a reader should know that rather than infer coverage
   * from the guard's existence.
   */
  test("KNOWN LIMIT: the repo's own `.anthill/` footprint is outside the walk", () => {
    expect(agentReadMarkdown().some((d) => d.startsWith(".anthill"))).toBe(false);
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
      // ⚠ THE BACKTICK FORM IS THE DOMINANT ONE IN THIS TREE — it outnumbers the
      // double-quote split across the scanned sources — and `normalize` repairs
      // it with a SEPARATE branch
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
  test("the scan reaches both directory levels and every agent-re-invoked file", () => {
    const files = sourceFiles(ROOT);
    expect({
      root: files.includes("config.ts"),
      commands: files.includes("commands/team-comms.ts"),
      // ⚠ NAMED, NOT DERIVED: these are `seams.md` Contract 2's agent-re-invoked
      // strings, and they are the files the v1 miss actually lived in. The
      // allow-list consumption assertion cannot protect them — they hold NO
      // entries, precisely because their strings were all fixed — so a walk that
      // silently stopped reaching them would be green on every other assertion
      // here. Review measured exactly that.
      contract2: ["commands/team-attach.ts", "commands/team-feedback.ts"].every((f) =>
        files.includes(f),
      ),
      // Well under the real count, so this pins REACH and not a census.
      atLeast: files.length >= 20,
      excludesTests: files.every((f) => !f.endsWith(".test.ts")),
    }).toEqual({
      root: true,
      commands: true,
      contract2: true,
      atLeast: true,
      excludesTests: true,
    });
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

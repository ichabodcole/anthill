/**
 * A bare `anthill` in a string an AGENT re-invokes is a different binary.
 *
 * PATH resolves `anthill` to the optional global launcher, which picks the
 * highest CACHED RELEASE — so a string a seat runs verbatim can execute on a
 * binary other than the one that composed it, and a flag the composer has may
 * not exist there. `buildLandCommand` (`team-join.ts`) hit this for real.
 *
 * ⚠ IT IS NOT A BAN. `renderText` is the HUMAN half of the envelope
 * (`agent-layer.ts`'s `resolveFormat` returns "text" only for a TTY, so an
 * agent's piped subprocess cannot reach it without asking), and a person typing
 * `anthill attach` WANTS PATH resolution — that is what the optional global
 * launcher is for. Resolving there hands them an absolute path into a plugin
 * cache. So the rule is a DISTINCTION, and both halves are asserted below.
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
 * ⚠ THIS IS THE FIX FOR v1's CLOSED VERB LIST, which review broke: it omitted
 * `spawn` and `feedback`, and `feedback` was the verb of the biggest real miss.
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
const BARE = new RegExp(`anthill (?:${VERBS.join("|")})\\b`, "g");

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
  // ── human: reached only through renderText / a TTY ──────────────────────────
  "commands/team-comms.ts:anthill comms":
    "human — the `Establish an anchor with:` hint, inside renderText",
  "commands/team-spawn.ts:anthill attach": "human — the `Watch:` line, inside renderText",
  "commands/team-spawn.ts:anthill down": "human — the `Stand down:` line, inside renderText",

  // ── template: carries <placeholders>, so it cannot be pasted and run ────────
  "commands/team-commit.ts:anthill commit":
    'template — the usage line `anthill commit -m "<msg>" <path>...`',
  "commands/team-feedback.ts:anthill feedback":
    "template — the usage line carrying <message>; the RUNNABLE submitCmd resolves, asserted below",
  "team-resolve.ts:anthill team": "template — `anthill team use <name>` in a ConfigError",
  "commands/team-team.ts:anthill team": "template — `anthill team use <name>` in the rung prose",

  // ── prose: the command is NAMED as a remedy, with no arguments to run ───────
  "commands/team-convene.ts:anthill down":
    "prose — names the remedy in the one-team-at-a-time guard",
  "commands/team-team.ts:anthill down": "prose — the same remedy in `team use`'s live-team guard",
  "commands/team-convene.ts:anthill join":
    "prose — explains that seats join; not addressed to the reader as a command",
  "commands/team-join.ts:anthill init":
    "prose — names the remedy for a missing team doc, no arguments given",
  "config.ts:anthill attach":
    "prose — explains WHY channels must be prefix-free, describing attach's folding",
  "feedback.ts:anthill feedback":
    "prose — the `_Filed via ..._` footer written into a GitHub issue body, read by a human on github.com",
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

/** Source with comments stripped — this file's own prose would otherwise match. */
function code(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("bare `anthill` — every occurrence is accounted for", () => {
  const hits = sourceFiles(ROOT).flatMap((rel) =>
    [...new Set(code(rel).match(BARE) ?? [])].map((m) => `${rel}:${m}`),
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

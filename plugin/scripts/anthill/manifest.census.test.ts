import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { main } from "./cli.ts";
import { buildManifest, type ManifestCommand } from "./manifest.ts";

/**
 * THE CENSUS — what the manifest DECLARES against what the parser ACCEPTS, at
 * every command path INCLUDING the root, read out of the tool's own rejection.
 *
 * Why this exists: `bun run check` was green on all four manifest defects the
 * upstream standard found (docs/projects/cli-declared-surface/proposal.md).
 * The generator is not stale — it walks `define.ts` live — it is INCOMPLETE,
 * and "there is no test you can write against a field your type does not
 * have." Only running the tool and comparing what it DOES against what it SAYS
 * reaches that class. So this test is black-box on purpose: it spawns the CLI,
 * provokes one parser rejection per path, and diffs the set the rejection names
 * against the set the manifest publishes. Every probe fails at parse, so no
 * command body ever runs.
 *
 * Why the root is in the sweep: the upstream recorded-surface guide says to
 * leave the root out — correct while `acc` is the observer, because the kit
 * probes the root itself. With no kit in the loop that instruction is a hole,
 * and the worst-placed one: the root is where a global flag gets added, so a
 * token added at the root is exactly what a census following the guide would
 * miss. 26 paths, not 25.
 *
 * Three enumeration states, deliberately (the "empty-set trap" in
 * docs/backlog/2026-08-26-group-nodes-refuse-without-naming-a-route.md):
 *   enumerated       — the rejection named a non-empty set
 *   enumerated-none  — the rejection said, in words, that this node takes no
 *                      flags (and named its subcommands instead)
 *   not-enumerated   — the rejection named nothing. NOT a tool with no flags.
 * "Named an empty set" and "named nothing" must never collapse into one state,
 * or this gate reproduces upstream's own defect on the one node type it was
 * built to see.
 */

const CLI = resolve(import.meta.dir, "cli.ts");
const SENTINEL_FLAG = "--acc-not-a-flag";
const SENTINEL_VERB = "acc-not-a-verb";

/**
 * KNOWN DISAGREEMENTS — pinned so the gate is green at commit and each fix has
 * something to turn green. The assertion is EXACT equality with this set, so a
 * row that stops reproducing fails the test until it is deleted: a pin cannot
 * outlive its defect. Each row names the phase of
 * docs/projects/cli-declared-surface/plan.md that deletes it.
 */
const KNOWN = new Set<string>([
  // Phase 2 — defect 1: `refused` has no manifest slot, publishes as valid.
  "declared-not-accepted --team at info show",
  "declared-not-accepted --team at info env",
  "declared-not-accepted --as at comms read",
  "declared-not-accepted --as at comms positions",
  "declared-not-accepted --team at scan",
  "declared-not-accepted --team at feedback",
  "declared-not-accepted --team at field-notes",
  "declared-not-accepted --team at migrate",
  // Phase 2 — defect 4: the manifest has no root entry, so root `--format` is
  // accepted and undeclared.
  "accepted-not-declared --format at (root)",
  // Phase 3 — group nodes refuse an unknown flag naming nothing.
  "not-enumerated at info",
  "not-enumerated at comms",
  "not-enumerated at team",
  // Phase 3 — an unknown verb is refused without naming the valid verbs.
  "verbs-not-named at (root)",
  "verbs-not-named at info",
  "verbs-not-named at comms",
  "verbs-not-named at team",
]);

type Reading = {
  path: string[];
  status: "enumerated" | "enumerated-none" | "not-enumerated";
  accepted: Set<string>;
  subcommandsNamed: Set<string>;
};

function label(path: string[]): string {
  return path.length === 0 ? "(root)" : path.join(" ");
}

function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const r = Bun.spawnSync(["bun", CLI, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: resolve(import.meta.dir, "..", "..", ".."),
    // Piped stdout ⇒ JSON envelope, which is the surface an agent reads.
    env: { ...process.env, NO_COLOR: "1" },
  });
  return { stdout: r.stdout.toString(), stderr: r.stderr.toString(), exitCode: r.exitCode };
}

/** Every declared path, root first, from the manifest's own tree. */
function declaredPaths(commands: ManifestCommand[]): ManifestCommand[] {
  const out: ManifestCommand[] = [];
  const walk = (cmds: ManifestCommand[]) => {
    for (const c of cmds) {
      out.push(c);
      walk(c.subcommands);
    }
  };
  walk(commands);
  return out;
}

/** The set a rejection names, as the tool's own bytes say it. */
function readRejection(error: string): Pick<Reading, "status" | "accepted" | "subcommandsNamed"> {
  const flags = /Valid flags: ([^.\n]+)/.exec(error);
  const subs = /[Ss]ubcommands?: ([^.\n]+)/.exec(error);
  const takesNoFlags = /takes no flags/.test(error);
  const accepted = new Set(
    (flags?.[1] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const subcommandsNamed = new Set(
    (subs?.[1] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  if (accepted.size > 0) return { status: "enumerated", accepted, subcommandsNamed };
  if (takesNoFlags) return { status: "enumerated-none", accepted, subcommandsNamed };
  return { status: "not-enumerated", accepted, subcommandsNamed };
}

function declaredFlags(cmd: ManifestCommand | undefined): Set<string> {
  if (!cmd) return new Set();
  return new Set(
    cmd.flags
      .filter((f) => f.type === "string" || f.type === "boolean")
      .filter((f) => (f as { status?: string }).status !== "refused")
      .map((f) => `--${f.name}`),
  );
}

describe("the census — declared versus accepted, at every path including the root", () => {
  test("every path, one inert rejection, diffed against the manifest", async () => {
    const manifest = await buildManifest(main);
    const byLabel = new Map<string, ManifestCommand>();
    for (const c of declaredPaths(manifest.commands)) byLabel.set(label(c.path), c);

    // The root is declared only once Phase 2 lands; probe it either way.
    const paths: string[][] = [[], ...declaredPaths(manifest.commands).map((c) => c.path)];
    const disagreements = new Set<string>();

    for (const path of paths) {
      const at = label(path);
      const r = run([...path, SENTINEL_FLAG]);
      // Inert by construction: a rejection, never an execution.
      expect(r.exitCode, `${at}: a sentinel flag must be refused`).not.toBe(0);
      expect(r.stdout, `${at}: stdout must stay empty on a usage error`).toBe("");
      const env = JSON.parse(r.stderr.trim().split("\n").at(-1) ?? "{}");
      expect(env.ok, `${at}: the rejection must be an envelope`).toBe(false);
      // The kit refuses any set that echoes the sentinel; so do we.
      expect(env.error).not.toMatch(new RegExp(`Valid flags:.*${SENTINEL_FLAG}`));

      const reading = readRejection(String(env.error));
      const declared = declaredFlags(byLabel.get(at));

      if (reading.status === "not-enumerated") {
        disagreements.add(`not-enumerated at ${at}`);
        continue;
      }
      for (const f of declared) {
        if (!reading.accepted.has(f)) disagreements.add(`declared-not-accepted ${f} at ${at}`);
      }
      for (const f of reading.accepted) {
        if (!declared.has(f)) disagreements.add(`accepted-not-declared ${f} at ${at}`);
      }
      if (reading.status === "enumerated-none") {
        // A node that takes no flags must name its subcommands instead — a
        // refusal that offers nothing is not a design, it is an omission.
        const subs = new Set(byLabel.get(at)?.subcommands.map((s) => s.name) ?? []);
        for (const s of subs) {
          if (!reading.subcommandsNamed.has(s))
            disagreements.add(`subcommand-not-named ${s} at ${at}`);
        }
      }
    }

    // A node with subcommands, sent an unknown verb, must name the verbs it has.
    const nodesWithVerbs: Array<{ path: string[]; verbs: string[] }> = [
      { path: [], verbs: manifest.commands.map((c) => c.name) },
      ...declaredPaths(manifest.commands)
        .filter((c) => c.subcommands.length > 0)
        .map((c) => ({ path: c.path, verbs: c.subcommands.map((s) => s.name) })),
    ];
    for (const { path, verbs } of nodesWithVerbs) {
      const at = label(path);
      const r = run([...path, SENTINEL_VERB]);
      expect(r.exitCode, `${at}: a sentinel verb must be refused`).not.toBe(0);
      expect(r.stdout).toBe("");
      const env = JSON.parse(r.stderr.trim().split("\n").at(-1) ?? "{}");
      expect(env.ok).toBe(false);
      const named = verbs.every((v) => new RegExp(`\\b${v}\\b`).test(String(env.error)));
      if (!named) disagreements.add(`verbs-not-named at ${at}`);
    }

    // EXACT equality, both directions: a new disagreement fails, and so does a
    // pin whose defect no longer reproduces.
    const unexpected = [...disagreements].filter((d) => !KNOWN.has(d)).sort();
    const stale = [...KNOWN].filter((d) => !disagreements.has(d)).sort();
    expect(unexpected, "NEW disagreements between manifest and parser").toEqual([]);
    expect(stale, "pinned KNOWN rows that no longer reproduce — delete them").toEqual([]);
  });
});

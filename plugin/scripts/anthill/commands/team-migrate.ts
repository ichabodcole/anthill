import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { emit, emitError, refuseArg, resolveFormat } from "../agent-layer.ts";
import { CURRENT_VERSION } from "../config.ts";
import { defineAnthillCommand } from "../define.ts";
import {
  ANTHILL_DIR,
  type MigrationOp,
  pendingMigrations,
  type RepoScan,
  V1_CONFIG_DIR,
  V1_DEFAULT_TEAM_DIR,
} from "../migrate.ts";
import { nowMillis } from "../runtime.ts";

/**
 * `anthill migrate` — the IO HANDS for the pure planner in `migrate.ts` (design
 * D5: the planner decides, the CLI executes). It scans the consumer repo into a
 * `RepoScan`, lets the planner produce the ordered `MigrationOp`s, and (unless
 * `--dry-run`) applies them: history-preserving `git mv`, the gitignore swap, the
 * version stamp, and the vacated-dir cleanup. Every exit routes through the
 * dual-audience envelope.
 */

function git(args: string[], cwd: string): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}

/** Resolve the git working-tree root (so `git mv` anchors to the real repo). */
function repoRoot(cwd: string): string {
  const top = git(["rev-parse", "--show-toplevel"], cwd);
  return top.ok && top.stdout ? top.stdout : cwd;
}

/**
 * Dual-marker lookup: walk up for EITHER `.anthill/config.json` (already v2) OR
 * `.team/config.json` (v1, needs migrating) — the migrate command must find a v1
 * repo even though `config.ts`'s normal resolver only looks for `.anthill/`.
 */
function findFootprintConfig(
  startDir: string,
): { root: string; configDir: string; configPath: string } | null {
  let dir = resolve(startDir);
  for (;;) {
    for (const cd of [ANTHILL_DIR, V1_CONFIG_DIR]) {
      const p = resolve(dir, cd, "config.json");
      if (existsSync(p)) return { root: dir, configDir: cd, configPath: p };
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

type RawConfig = { version?: unknown; paths?: { teamDir?: unknown }; teams?: unknown };

/**
 * REFUSE A MULTI-TEAM CONFIG — before a `RepoScan` is built, because the scan is
 * where the wrong answer is manufactured.
 *
 * `scanRepo` below reads `raw.paths.teamDir` from the **top level only**. Under a
 * `teams` map that key lives at `teams.<name>.paths.teamDir`, so `pathsExplicit`
 * silently comes back `false`, `teamDir` falls back to the era default, and the
 * planner plans a move of a directory the team does not use.
 *
 * **Measured, on a v1 config carrying a `teams` map with `teamDir: "docs/crew"`:**
 *
 *     living docs: docs/team/* → .anthill/* (0 entries)
 *     stamped version → 2
 *
 * `ok: true`, seven ops applied, and the team's living docs still at `docs/crew`
 * while the config now claims v2 with no `paths` — so every command resolves to an
 * empty `.anthill/`. That is the empty-footprint failure this whole project treats
 * as the governing invariant, produced by the one command whose failure the
 * proposal calls a data-integrity bug.
 *
 * ⚠ **A GUARD, NOT A MIGRATOR, and deliberately so.** `MIGRATIONS` holds exactly
 * one entry (v1→v2) which cannot apply to a `teams` config anyway, and
 * `MigrationOp` (`migrate.ts:31-42`) has **no op that can restructure config
 * content** — `config-drop-paths` only deletes a key. There is nothing here that
 * could do the right thing, so the honest move is to say so by name.
 *
 * Checked once, at the entry point: the apply loop re-reads the config between
 * steps, but no `MigrationOp` can introduce a `teams` key, so a config that lacked
 * one on the first read cannot grow one mid-migration.
 *
 * ⚠ **TWO MESSAGES, DERIVED FROM WHAT IS ACTUALLY PENDING — do not collapse them
 * back into one.** Both refuse and exit 1, so from the outside they look
 * redundant. The difference is the only part a reader can act on: one says *go do
 * the living-doc reconcile*, the other says *stop, this needs work that does not
 * exist yet.*
 *
 * The first version of this guard asserted "there is nothing here to migrate"
 * unconditionally. That was true only because `MIGRATIONS` holds one obsolete
 * entry, and the guard fires before the version is read — so the claim rested on
 * nothing. Add a v2→v3 layout migration (which this design anticipates) and every
 * multi-team repo would be told there is nothing to migrate **in the one state
 * where that is false and the human most needs the truth.** Refusing is the safe
 * direction, so nothing would have failed loudly when it went stale. Same rule the
 * convene guard follows: a guard whose stated reason is wrong outlives the
 * constraint that justified it, because nobody can tell when it stopped applying.
 */
function multiTeamRefusal(raw: RawConfig, configPath: string): string | null {
  if (!("teams" in raw) || typeof raw.teams !== "object" || raw.teams === null) return null;
  const names = Object.keys(raw.teams as Record<string, unknown>);
  // The same read `scanRepo` does — an unstamped config is v1.
  const version = typeof raw.version === "number" ? raw.version : 1;
  const who = `${configPath} configures ${names.length} team(s) (${names.join(", ")}), and migrate refuses a multi-team config.`;
  // Why the scan is never built: it reads `paths.teamDir` from the top level only,
  // so under a `teams` map it finds none, plans against the era default, and
  // reports a successful move of zero living docs.
  const why =
    "This command reads paths.teamDir from the TOP LEVEL only; under a `teams` map it finds none, " +
    "plans against the era default, and would report a successful move of zero living docs while " +
    "leaving them where they are.";

  const pending = pendingMigrations(version)[0];
  if (!pending) {
    return (
      `${who} There is nothing here to migrate: the \`teams\` map is a config SHAPE, not a footprint ` +
      `layout — nothing moved on disk when it was adopted, and this repo is already at v${version}. ` +
      `${why} If a release changed the SOP or the team guidance, that is the living-doc reconcile in ` +
      "`anthill:upgrade` — not this command."
    );
  }

  // ⚠ TO WHOEVER ADDS THE NEXT LAYOUT MIGRATION: this branch going live is the
  // signal that the blanket refusal has to become per-team-aware — `scanRepo` needs
  // to plan one move per configured team's `teamDir`. It is NOT a signal that this
  // message needs rewording.
  return (
    `${who} This repo ALSO has a pending footprint migration (v${pending.from} → v${pending.to}), ` +
    `and migrate cannot run it against a multi-team config. ${why} ` +
    "Do not hand-edit the config to get past this, and do not treat it as the content-only case: " +
    "the layout genuinely needs to move and this command cannot move it. Stop here and report it — " +
    "a multi-team repo with a pending layout migration needs work that does not exist yet."
  );
}

/** Build the pure `RepoScan` from disk — the only place IO meets the planner. */
function scanRepo(root: string, configDir: string, raw: RawConfig, keepPaths: boolean): RepoScan {
  const version = typeof raw.version === "number" ? raw.version : 1;
  const pathsExplicit =
    typeof raw.paths === "object" &&
    raw.paths !== null &&
    typeof (raw.paths as { teamDir?: unknown }).teamDir === "string";

  // Where the living docs currently live: the override if set, else the era's
  // default (v1 → docs/team; v2 → .anthill).
  const teamDir = pathsExplicit
    ? ((raw.paths as { teamDir: string }).teamDir as string)
    : version < 2
      ? V1_DEFAULT_TEAM_DIR
      : ANTHILL_DIR;

  const teamDirAbs = resolve(root, teamDir);
  const docsEntries = existsSync(teamDirAbs)
    ? readdirSync(teamDirAbs).filter((e) => e !== "config.json")
    : [];

  const giPath = join(root, ".gitignore");
  const gitignore = existsSync(giPath) ? readFileSync(giPath, "utf8") : null;

  return { version, pathsExplicit, teamDir, docsEntries, configDir, gitignore, keepPaths };
}

/** Apply one `MigrationOp` to disk. Throws on a hard failure (caught + enveloped). */
function applyOp(op: MigrationOp, root: string): void {
  switch (op.kind) {
    case "git-mv": {
      const toAbs = resolve(root, op.to);
      mkdirSync(dirname(toAbs), { recursive: true });
      const r = git(["mv", op.from, op.to], root);
      if (!r.ok) {
        // Untracked / not-a-repo fallback: a plain filesystem rename.
        if (
          /not under version control|not under source control|bad source|fatal: not a git/i.test(
            r.stderr,
          )
        ) {
          renameSync(resolve(root, op.from), toAbs);
        } else {
          throw new Error(`git mv ${op.from} → ${op.to} failed: ${r.stderr || r.stdout || "?"}`);
        }
      }
      return;
    }
    case "gitignore": {
      const giPath = join(root, ".gitignore");
      const existing = existsSync(giPath) ? readFileSync(giPath, "utf8") : "";
      const kept = existing.split("\n").filter((l) => l.trim() !== op.remove);
      const body = kept.join("\n").replace(/\n*$/, "");
      const hasAdd = kept.some((l) => l.trim() === op.add);
      const next = hasAdd ? `${body}\n` : `${body ? `${body}\n` : ""}${op.add}\n`;
      writeFileSync(giPath, next);
      return;
    }
    case "stamp-version": {
      const fileAbs = resolve(root, op.file);
      const parsed = JSON.parse(readFileSync(fileAbs, "utf8")) as Record<string, unknown>;
      parsed.version = op.version;
      writeFileSync(fileAbs, `${JSON.stringify(parsed, null, 2)}\n`);
      return;
    }
    case "rm": {
      rmSync(resolve(root, op.path), { recursive: true, force: true });
      return;
    }
    case "config-drop-paths": {
      const fileAbs = resolve(root, op.file);
      const parsed = JSON.parse(readFileSync(fileAbs, "utf8")) as Record<string, unknown>;
      delete parsed.paths;
      writeFileSync(fileAbs, `${JSON.stringify(parsed, null, 2)}\n`);
      return;
    }
  }
}

interface MigrateData {
  dryRun: boolean;
  from: number;
  to: number;
  ops: MigrationOp[];
  notes: string[];
  alreadyCurrent: boolean;
}

/** Why this verb refuses `--team`. ONE string, used by the arg def AND the
 * refusal in `run` — two copies of a reason drift, and a refusal that argues
 * with itself teaches worse than the generic "unknown option" it replaced. */
const REFUSED_TEAM =
  "`migrate` moves the whole FOOTPRINT, which every team shares — and it refuses a multi-team config outright";

export const teamMigrateCommand = defineAnthillCommand({
  meta: {
    name: "migrate",
    description: "Upgrade this repo's anthill footprint to the current version (.anthill/ layout)",
    scope: "workspace",
  },
  args: {
    "dry-run": { type: "boolean", description: "Preview the plan without changing anything" },
    "keep-paths": {
      type: "boolean",
      description:
        "Honor a `paths` override even when it just repeats the v1 default (don't consolidate the docs)",
    },
    team: { type: "string", refused: REFUSED_TEAM },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    refuseArg({
      format: resolveFormat(ctx.args.format as string | undefined),
      command: "migrate",
      flag: "--team",
      value: ctx.args.team,
      why: REFUSED_TEAM,
    });
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const dryRun = ctx.args["dry-run"] === true;
    const keepPaths = ctx.args["keep-paths"] === true;

    const found = findFootprintConfig(process.cwd());
    if (!found) {
      emitError({
        format,
        command: "migrate",
        error: `no \`${ANTHILL_DIR}/config.json\` or \`${V1_CONFIG_DIR}/config.json\` found in this repo or any parent. Run \`anthill:bootstrap\` to set up a team.`,
      });
      process.exit(1);
    }

    const root = repoRoot(found.root);

    let firstScan: RepoScan;
    try {
      const raw = JSON.parse(readFileSync(found.configPath, "utf8")) as RawConfig;
      const refusal = multiTeamRefusal(raw, relative(root, found.configPath));
      if (refusal) {
        emitError({ format, command: "migrate", error: refusal });
        process.exit(1);
      }
      firstScan = scanRepo(root, found.configDir, raw, keepPaths);
    } catch (err) {
      emitError({
        format,
        command: "migrate",
        error: `could not read ${found.configPath}: ${err instanceof Error ? err.message : String(err)}`,
      });
      process.exit(1);
    }

    const finish = (data: MigrateData): void => {
      emit({
        format,
        command: "migrate",
        data,
        startedAt: started,
        renderText: (d) => {
          if (d.alreadyCurrent) return `Already at v${d.from} — nothing to migrate.`;
          const head = d.dryRun
            ? `Dry run — would migrate v${d.from} → v${d.to} (${d.ops.length} op(s)):`
            : `Migrated v${d.from} → v${d.to} (${d.ops.length} op(s) applied):`;
          return [head, ...d.notes.map((n) => `  · ${n}`)].join("\n");
        },
      });
    };

    // Already current → clean no-op.
    if (pendingMigrations(firstScan.version).length === 0) {
      finish({
        dryRun,
        from: firstScan.version,
        to: firstScan.version,
        ops: [],
        notes: [`already at v${firstScan.version}`],
        alreadyCurrent: true,
      });
      return;
    }

    // Dry run → show the next migration's plan, change nothing.
    if (dryRun) {
      const next = pendingMigrations(firstScan.version)[0];
      const plan = next ? next.plan(firstScan) : null;
      finish({
        dryRun: true,
        from: plan?.from ?? firstScan.version,
        to: plan?.to ?? firstScan.version,
        ops: plan?.ops ?? [],
        notes: plan?.notes ?? [],
        alreadyCurrent: false,
      });
      return;
    }

    // Apply: re-scan + apply each pending migration until current (so a future
    // multi-step chain sees the post-move tree between steps).
    try {
      const allOps: MigrationOp[] = [];
      const allNotes: string[] = [];
      for (;;) {
        const f = findFootprintConfig(root);
        if (!f) break;
        const raw = JSON.parse(readFileSync(f.configPath, "utf8")) as RawConfig;
        const scan = scanRepo(root, f.configDir, raw, keepPaths);
        const next = pendingMigrations(scan.version)[0];
        if (!next) break;
        const plan = next.plan(scan);
        for (const op of plan.ops) applyOp(op, root);
        allOps.push(...plan.ops);
        allNotes.push(...plan.notes);
      }
      finish({
        dryRun: false,
        from: firstScan.version,
        to: CURRENT_VERSION,
        ops: allOps,
        notes: allNotes,
        alreadyCurrent: false,
      });
    } catch (err) {
      emitError({
        format,
        command: "migrate",
        error: `migration failed partway: ${err instanceof Error ? err.message : String(err)}. The tree may be partly moved — inspect \`git status\` before retrying.`,
      });
      process.exit(1);
    }
  },
});

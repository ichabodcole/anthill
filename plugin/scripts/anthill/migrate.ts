/**
 * The PURE migration planner — the deterministic core of `anthill migrate`.
 *
 * Given a `RepoScan` (a plain description of a consumer repo's current tree,
 * gathered by the IO layer in `commands/team-migrate.ts`), each migration emits a
 * `MigrationPlan` — an ordered list of `MigrationOp`s. No filesystem, no git, no
 * config loading happens here; that's exactly why it unit-tests against fixtures
 * with zero scaffolding, and why `--dry-run` can print the plan a real run will
 * apply (same function, the executor just stops before touching disk).
 *
 * The registry (`MIGRATIONS` + `migrationsBetween`) chains migrations in order and
 * never skips a version — mirroring `project-docs:update-project-docs`.
 *
 * v1 → v2 = the `.anthill/` consolidation: the v1 layout split config at
 * `.team/config.json` from living docs at `docs/team/` (the default); v2 puts both
 * under a single `.anthill/` root. See the footprint-migration project + spec §5.
 */

import { CURRENT_VERSION } from "./config.ts";

/** The consolidated v2 root every migration target lands in. */
export const ANTHILL_DIR = ".anthill";

/** The v1 config-dir marker (its `config.json` was the v1 root marker). */
export const V1_CONFIG_DIR = ".team";

/** The v1 DEFAULT living-docs dir (immutable history — v1 with no `paths` override
 * put the living docs here). The IO scanner needs it to locate a v1 repo's docs. */
export const V1_DEFAULT_TEAM_DIR = "docs/team";

export type MigrationOp =
  /** Move a git-TRACKED path (history-preserving `git mv` in the executor). */
  | { kind: "git-mv"; from: string; to: string }
  /** Swap a line in `.gitignore` (remove the old, ensure the new). */
  | { kind: "gitignore"; remove: string; add: string }
  /** Bump the `version` field of a config file. */
  | { kind: "stamp-version"; file: string; version: number }
  /** Remove a vacated directory (its only remaining content is disposable). */
  | { kind: "rm"; path: string }
  /** Drop the `paths` block from a config file — a redundant-default override is
   * being consolidated away, so the config falls back to the v2 default. */
  | { kind: "config-drop-paths"; file: string };

export interface MigrationPlan {
  from: number;
  to: number;
  ops: MigrationOp[];
  /** Human-facing lines explaining what the plan does + any judgement calls. */
  notes: string[];
}

/**
 * A plain description of a consumer repo's current footprint — the PURE input.
 * The IO scanner (Phase 3) builds this; the planner never reads disk.
 */
export interface RepoScan {
  /** Resolved config version — an unstamped config reads as 1 (legacy). */
  version: number;
  /** Was `paths` explicitly set in the raw config? (the escape-hatch override). */
  pathsExplicit: boolean;
  /** Current living-docs dir, relative to repo root (v1 default: `docs/team`). */
  teamDir: string;
  /** Top-level entries under `teamDir` (relative names) — what to relocate. */
  docsEntries: string[];
  /** Current config dir, relative to repo root (`.team` in v1). */
  configDir: string;
  /** Current `.gitignore` contents (null when the file is absent). */
  gitignore: string | null;
  /** Honor a REDUNDANT-default `paths` override anyway (leave docs in place) rather
   * than consolidating it. Set from `--keep-paths`; irrelevant to a bespoke override
   * (always honored) or no override (always consolidated). */
  keepPaths: boolean;
}

/**
 * Is a `paths` override just the v1 DEFAULT spelled out — a redundant, almost-certainly
 * non-deliberate override — rather than a bespoke location the team deliberately chose?
 * Shared truth (via `V1_DEFAULT_TEAM_DIR`) for `migrate` (consolidate it) and for
 * `bootstrap`'s guidance (confirm before writing `paths` == the default).
 */
export function isRedundantDefaultPaths(teamDir: string): boolean {
  return teamDir === V1_DEFAULT_TEAM_DIR;
}

export interface Migration {
  from: number;
  to: number;
  plan: (scan: RepoScan) => MigrationPlan;
}

/** A no-op plan (already at/after the target version). */
function noop(version: number, note: string): MigrationPlan {
  return { from: version, to: version, ops: [], notes: [note] };
}

/**
 * v1 → v2 — consolidate the footprint into `.anthill/`.
 *
 * Always moves the config dir (`<configDir>/config.json` → `.anthill/config.json`),
 * swaps the gitignored scratch line, removes the vacated config dir, and stamps
 * the version. The living docs move ONLY when they sit at the v1 default (no
 * `paths` override): an explicit override is the escape hatch and is left in place
 * (a note explains it). A pure relocate — `git mv` preserves content untouched, so
 * there's no hand-edited-doc reconciliation to do at this version.
 */
export function planV1ToV2(scan: RepoScan): MigrationPlan {
  if (scan.version >= 2) {
    return noop(scan.version, `already at v${scan.version} — nothing to migrate`);
  }

  const ops: MigrationOp[] = [];
  const notes: string[] = [];
  const configDir = scan.configDir;

  // 1. The config dir → .anthill/ (this is what makes .anthill/ the new marker).
  ops.push({ kind: "git-mv", from: `${configDir}/config.json`, to: `${ANTHILL_DIR}/config.json` });
  notes.push(`config: ${configDir}/config.json → ${ANTHILL_DIR}/config.json`);

  // 2. The living docs. A `paths` override that just spells out the v1 DEFAULT
  //    (`docs/team`) is almost never a deliberate escape hatch — it's the old default
  //    written out, and honoring it silently HALF-consolidates (config moves, docs
  //    don't), defeating v2. So a REDUNDANT override consolidates by default (dropping
  //    the override); only a GENUINELY BESPOKE location — or a redundant one kept via
  //    `--keep-paths` — is honored.
  const redundant = isRedundantDefaultPaths(scan.teamDir) && scan.pathsExplicit;
  const honorOverride = scan.pathsExplicit && (!redundant || scan.keepPaths);

  if (honorOverride) {
    notes.push(
      redundant
        ? `\`paths\` override kept per --keep-paths — living docs stay at \`${scan.teamDir}/\`; only ` +
            `config + scratch consolidate to \`${ANTHILL_DIR}/\`.`
        : `\`paths\` override honored (a bespoke location) — living docs stay at \`${scan.teamDir}/\`; ` +
            `only config + scratch consolidate to \`${ANTHILL_DIR}/\`.`,
    );
  } else {
    for (const entry of scan.docsEntries) {
      ops.push({ kind: "git-mv", from: `${scan.teamDir}/${entry}`, to: `${ANTHILL_DIR}/${entry}` });
    }
    notes.push(
      `living docs: ${scan.teamDir}/* → ${ANTHILL_DIR}/* (${scan.docsEntries.length} entr` +
        `${scan.docsEntries.length === 1 ? "y" : "ies"})`,
    );
    ops.push({ kind: "rm", path: scan.teamDir });
    if (redundant) {
      ops.push({ kind: "config-drop-paths", file: `${ANTHILL_DIR}/config.json` });
      notes.push(
        `⚠ your \`paths\` override just spelled out the v1 default (\`${V1_DEFAULT_TEAM_DIR}\`), so it ` +
          `was consolidated into \`${ANTHILL_DIR}/\` and the redundant override dropped. To keep the ` +
          `docs at \`${scan.teamDir}/\` deliberately, re-run with \`--keep-paths\`.`,
      );
    }
  }

  // 3. The gitignored scratch line moves with the config dir.
  ops.push({ kind: "gitignore", remove: `${configDir}/scratch/`, add: `${ANTHILL_DIR}/scratch/` });
  notes.push(`gitignore: ${configDir}/scratch/ → ${ANTHILL_DIR}/scratch/`);

  // 4. Remove the vacated config dir (only the disposable, gitignored scratch
  //    remains in it). An active session's scratch is transient by design.
  ops.push({ kind: "rm", path: configDir });
  notes.push(`removed vacated ${configDir}/ (disposable scratch discarded)`);

  // 5. Stamp the new version onto the relocated config.
  ops.push({ kind: "stamp-version", file: `${ANTHILL_DIR}/config.json`, version: 2 });
  notes.push("stamped version → 2");

  return { from: 1, to: 2, ops, notes };
}

/** The ordered migration registry. Add the next `vN → vM` here as releases break. */
export const MIGRATIONS: Migration[] = [{ from: 1, to: 2, plan: planV1ToV2 }];

/**
 * The ordered chain of migrations from `from` to `to`, never skipping a version.
 * Stops (returns the partial chain) if there's a gap with no migration for a step.
 */
export function migrationsBetween(from: number, to: number): Migration[] {
  const chain: Migration[] = [];
  let cur = from;
  while (cur < to) {
    const next = MIGRATIONS.find((m) => m.from === cur);
    if (!next) break;
    chain.push(next);
    cur = next.to;
  }
  return chain;
}

/** Convenience: the chain needed to bring `version` up to the plugin's current. */
export function pendingMigrations(version: number): Migration[] {
  return migrationsBetween(version, CURRENT_VERSION);
}

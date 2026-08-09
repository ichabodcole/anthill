/**
 * The `.anthill/config.json` config layer — the keystone every team command reads.
 *
 * `.anthill/config.json` is THE project-root marker for the team layer: we walk up
 * from cwd looking for it (the same pattern git/cargo/deno use), which replaces
 * the seed's brittle package.json-name matching in `paths.ts`. `paths.ts` stays
 * for shell bits that still want the package root; team commands key off this.
 *
 * Split for testability:
 * - `resolveConfig(raw, ctx)` — PURE: validate + apply plugin defaults + build
 *   resolvers. No filesystem; feed it a fixture object and a fake projectRoot.
 *   Resolves ONE team.
 * - `resolveProject(raw, ctx)` — PURE: detect the shape (flat, or a `teams` map)
 *   and resolve EVERY team, in config order. Built on `resolveConfig`, not
 *   instead of it, so the single-team answer is the same function's.
 * - `findConfigFile(startDir)` — walk up for `.anthill/config.json`.
 * - `loadConfig(startDir)` / `loadProject(startDir)` — the fs entrypoints.
 *
 * Schema: spec §5 (`docs/architecture/2026-06-28-anthill-portable-team-os-design.md`).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

/** Where `.anthill/config.json` lives, relative to a project root. */
export const CONFIG_DIR = ".anthill";
export const CONFIG_FILE = "config.json";
export const CONFIG_REL_PATH = `${CONFIG_DIR}/${CONFIG_FILE}`;

/** Plugin defaults — a minimal config (just `channel` + `seats`) resolves fully via these. */
export const DEFAULT_GROUNDING = ["AGENTS.md", "README.md"] as const;
export const DEFAULT_PATHS = {
  teamDir: ".anthill",
  seatDir: ".anthill/dev",
  seams: ".anthill/dev/seams.md",
} as const;
export const DEFAULT_LAUNCH = 'claude "/anthill:join {handle}"';
/** Unstamped / legacy configs resolve as v1 — the old `.team/` + `docs/team/` layout. */
export const DEFAULT_VERSION = 1;
/** The plugin's CURRENT footprint version: what a fresh bootstrap stamps and what
 * `anthill:upgrade` migrates toward. v2 = the consolidated `.anthill/` layout. */
export const CURRENT_VERSION = 2;

/** A single seat in the roster (spec §5). `role` + `scope` only — no timing/owns. */
export interface SeatConfig {
  handle: string;
  role: string;
  scope: string;
  /** Membership in the zero-args default spawn set; the lead overrides per phase. */
  spawn: boolean;
}

export interface TeamPaths {
  teamDir: string;
  seatDir: string;
  seams: string;
}

/** The on-disk shape, as parsed before defaults/validation (everything optional). */
export interface RawTeamConfig {
  version?: number;
  channel?: string;
  lead?: string;
  seats?: Array<Partial<SeatConfig>>;
  grounding?: string[];
  paths?: Partial<TeamPaths>;
  launch?: string;
  gate?: string;
  /** Lineage, when this team was forked from another. */
  forkedFrom?: string;
  forkedAt?: string;
}

/**
 * The on-disk shape of a config carrying a `teams` MAP (one project, many teams).
 * Detected structurally — `"teams" in raw` — and **no new version is stamped**:
 * `version` means FOOTPRINT LAYOUT (`migrate.ts`), so overloading it with schema
 * shape would make `team-migrate` report "already at v3" while `CURRENT_VERSION`
 * is 2, reading as "ahead of the plugin" when nothing moved on disk. AWS has
 * carried `[default]` beside `[profile foo]` for a decade with no version field.
 */
export interface RawProjectConfig {
  version?: number;
  launch?: string;
  grounding?: string[];
  gate?: string;
  teams?: Record<string, RawTeamConfig>;
}

/** The name a v2 flat config's single team resolves under. */
export const DEFAULT_TEAM_NAME = "default";

/** Keys a team entry inherits from the project level unless it names its own. */
const PROJECT_LEVEL_KEYS = ["version", "launch", "grounding", "gate"] as const;

/**
 * Keys that belong to a TEAM and must not appear at the project level beside a
 * `teams` map. Their presence there means a half-finished conversion, and
 * silently ignoring them makes the incumbent team vanish.
 */
const TEAM_LEVEL_KEYS = ["channel", "seats", "lead", "paths"] as const;

/**
 * A project: one or more teams, resolved in config order.
 *
 * Mirrors the `seats`/`seat()` pattern rather than exposing a Map, and carries
 * **no `soleTeam` field**. A top-level field is TOTAL, so an absence cannot carry
 * a verdict — `null` and `0` are different facts and must never be fused
 * (`team-support.ts`, `agent-layer.ts`, `cli.ts` all say this). Deciding which
 * team applies is `resolveTeam`'s job, and it computes the single-team case in
 * one line inside the function whose job that is.
 */
export interface ResolvedProject {
  projectRoot: string;
  configPath: string;
  /** Every configured team, in config order. */
  teams: ResolvedConfig[];
  /** Look up a team by name — mirrors `seat(handle)`. */
  team(name: string): ResolvedConfig | undefined;
}

/** A fully-resolved config: defaults applied, helpers + path resolvers attached. */
export interface ResolvedConfig {
  /**
   * This team's name — the key under `teams` in a v3 config, or `"default"` for a
   * v2 flat one. NOT derived from `channel`: AWS, Terraform and Docker all
   * terminate on a *named* default, it gives `anthill team use default` something
   * to say, and it gives an error message a noun.
   */
  name: string;
  version: number;
  channel: string;
  /** The lead handle: explicit `lead`, else the sole `role:"lead"` seat. May be undefined. */
  lead: string | undefined;
  seats: SeatConfig[];
  grounding: string[];
  /** Path templates as configured (relative to project root), after defaults. */
  paths: TeamPaths;
  launch: string;
  /**
   * The PROJECT's pre-land verification command (e.g. `bun run check`), used to
   * emit a ready-composed land. `undefined` when the project hasn't declared one.
   *
   * anthill supplies the TRIGGER (a resolved land command with the gate already
   * in front of it) and the project supplies the CONTENT. Hard-coding a gate
   * here would be the convention-baked-into-a-default anti-pattern; leaving the
   * composition to the agent is what this exists to stop.
   */
  gate: string | undefined;
  /** The team this one was forked from, and when — lineage, for `anthill team ls`. */
  forkedFrom: string | undefined;
  forkedAt: string | undefined;
  /** Directory containing `.anthill/` — the resolved project root. */
  projectRoot: string;
  /** Absolute path to the config file (when loaded from disk; "" for pure resolves). */
  configPath: string;

  // --- helpers ---
  /** The roster (= `seats`). */
  roster(): SeatConfig[];
  /** Seats with `spawn: true`, in array order — the zero-args default spawn set. */
  defaultSpawnSet(): SeatConfig[];
  /** The lead seat, if one is present in the roster. */
  leadSeat(): SeatConfig | undefined;
  /** Look up a seat by handle. */
  seat(handle: string): SeatConfig | undefined;

  // --- path resolvers (absolute, joined to projectRoot) ---
  teamDirPath(): string;
  seatDirPath(): string;
  seamsPath(): string;
  /** Absolute path to a seat's doc: `<seatDir>/<handle>.md`. */
  seatDocPath(handle: string): string;
}

export class ConfigError extends Error {
  override name = "ConfigError";
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Join `rel` onto `root` unless it's already absolute. */
function underRoot(root: string, rel: string): string {
  return isAbsolute(rel) ? rel : resolve(root, rel);
}

function validateSeat(raw: unknown, index: number): SeatConfig {
  if (!isObject(raw)) {
    throw new ConfigError(`seats[${index}] must be an object`);
  }
  const { handle, role, scope, spawn } = raw;
  if (typeof handle !== "string" || handle.trim() === "") {
    throw new ConfigError(`seats[${index}].handle is required (non-empty string)`);
  }
  if (typeof role !== "string" || role.trim() === "") {
    throw new ConfigError(`seats[${index}] (${handle}).role is required (non-empty string)`);
  }
  if (typeof scope !== "string") {
    throw new ConfigError(`seats[${index}] (${handle}).scope must be a string`);
  }
  if (spawn !== undefined && typeof spawn !== "boolean") {
    throw new ConfigError(`seats[${index}] (${handle}).spawn must be a boolean`);
  }
  return { handle, role, scope, spawn: spawn === true };
}

/**
 * Validate `raw`, apply plugin defaults, and build a fully-resolved config.
 * Pure — no filesystem access. `ctx.projectRoot` anchors the path resolvers.
 */
export function resolveConfig(
  raw: unknown,
  ctx: { projectRoot: string; configPath?: string; name?: string },
): ResolvedConfig {
  if (!isObject(raw)) {
    throw new ConfigError("config must be a JSON object");
  }

  if (typeof raw.channel !== "string" || raw.channel.trim() === "") {
    throw new ConfigError("config.channel is required (non-empty string)");
  }
  if (!Array.isArray(raw.seats) || raw.seats.length === 0) {
    throw new ConfigError("config.seats is required (non-empty array)");
  }
  if (raw.lead !== undefined && typeof raw.lead !== "string") {
    throw new ConfigError("config.lead must be a string");
  }
  if (raw.version !== undefined && typeof raw.version !== "number") {
    throw new ConfigError("config.version must be a number");
  }
  if (raw.grounding !== undefined) {
    if (!Array.isArray(raw.grounding) || raw.grounding.some((g) => typeof g !== "string")) {
      throw new ConfigError("config.grounding must be an array of strings");
    }
  }
  if (raw.launch !== undefined && typeof raw.launch !== "string") {
    throw new ConfigError("config.launch must be a string");
  }
  if (raw.gate !== undefined && typeof raw.gate !== "string") {
    throw new ConfigError("config.gate must be a string");
  }

  const seats = raw.seats.map((s, i) => validateSeat(s, i));

  // Guard against duplicate handles — they'd make seat lookups ambiguous.
  const seen = new Set<string>();
  for (const s of seats) {
    if (seen.has(s.handle)) {
      throw new ConfigError(`duplicate seat handle "${s.handle}"`);
    }
    seen.add(s.handle);
  }

  const rawPaths = isObject(raw.paths) ? raw.paths : {};
  // The three path knobs CASCADE: `seatDir` derives from `teamDir`, and `seams`
  // derives from `seatDir` — so overriding one knob moves everything under it and
  // the config stays coherent. They used to be three independent literal defaults,
  // which meant `{"paths": {"teamDir": "docs/team"}}` still resolved the seat docs
  // and seams to `.anthill/dev/…`: a config that reads as one relocation and
  // resolves as two teams' worth of locations. `seams` follows `seatDir` rather
  // than `teamDir` because it is a seat-layer artifact — the seam register between
  // seats — and moving the seats has to move it.
  const teamDir = typeof rawPaths.teamDir === "string" ? rawPaths.teamDir : DEFAULT_PATHS.teamDir;
  const seatDir = typeof rawPaths.seatDir === "string" ? rawPaths.seatDir : `${teamDir}/dev`;
  const paths: TeamPaths = {
    teamDir,
    seatDir,
    seams: typeof rawPaths.seams === "string" ? rawPaths.seams : `${seatDir}/seams.md`,
  };

  const lead =
    typeof raw.lead === "string" ? raw.lead : seats.find((s) => s.role === "lead")?.handle;

  const projectRoot = ctx.projectRoot;
  const resolved: ResolvedConfig = {
    name: ctx.name ?? DEFAULT_TEAM_NAME,
    version: typeof raw.version === "number" ? raw.version : DEFAULT_VERSION,
    channel: raw.channel,
    lead,
    seats,
    grounding: raw.grounding ? [...(raw.grounding as string[])] : [...DEFAULT_GROUNDING],
    paths,
    launch: typeof raw.launch === "string" ? raw.launch : DEFAULT_LAUNCH,
    // No default: a wrong gate is worse than a named absence, because an agent
    // that runs someone else's gate command gets a green that means nothing.
    gate: typeof raw.gate === "string" && raw.gate.trim() !== "" ? raw.gate : undefined,
    forkedFrom: typeof raw.forkedFrom === "string" ? raw.forkedFrom : undefined,
    forkedAt: typeof raw.forkedAt === "string" ? raw.forkedAt : undefined,
    projectRoot,
    configPath: ctx.configPath ?? "",

    roster: () => seats,
    defaultSpawnSet: () => seats.filter((s) => s.spawn),
    leadSeat: () => seats.find((s) => s.role === "lead"),
    seat: (handle: string) => seats.find((s) => s.handle === handle),

    teamDirPath: () => underRoot(projectRoot, paths.teamDir),
    seatDirPath: () => underRoot(projectRoot, paths.seatDir),
    seamsPath: () => underRoot(projectRoot, paths.seams),
    seatDocPath: (handle: string) => resolve(underRoot(projectRoot, paths.seatDir), `${handle}.md`),
  };
  return resolved;
}

/**
 * A team name must be usable as a tmux session key and a directory segment.
 * Mirrors `SAFE_SESSION_KEY` (`team-spawn.ts`) — the name reaches a shell prefix.
 */
const SAFE_TEAM_NAME = /^[a-zA-Z0-9._-]+$/;

/** Names that pass `SAFE_TEAM_NAME` but traverse when used as a path segment. */
const TRAVERSAL_NAMES = new Set([".", ".."]);

/** Every path knob two teams must not share, with its resolver. */
const LIVING_DOC_PATHS = [
  ["teamDir", (t: ResolvedConfig) => t.teamDirPath()],
  ["seatDir", (t: ResolvedConfig) => t.seatDirPath()],
  ["seams", (t: ResolvedConfig) => t.seamsPath()],
] as const;

/**
 * The checks that only exist once a project has MORE THAN ONE team. Never runs on
 * the v2 flat path: a lone team cannot collide with itself, and criterion 1 is
 * that a single-team project sees zero change.
 */
function validateAcrossTeams(teams: ResolvedConfig[]): void {
  // Each unordered pair once; both orderings are checked inside, so the message
  // can always name the offender rather than whichever came first in the config.
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const a = teams[i] as ResolvedConfig;
      const b = teams[j] as ResolvedConfig;

      if (a.channel === b.channel) {
        throw new ConfigError(
          `config.teams.${b.name}: channel "${b.channel}" is already used by team "${a.name}". ` +
            "A channel is the message log's filename, so two teams sharing one would read and " +
            "write each other's messages.",
        );
      }

      // The channel checks above protect the WIRE; this protects the DIRECTORY,
      // which is where the durable knowledge lives. `teamDir` defaults to
      // `.anthill/teams/<name>` and is distinct by construction — but the design
      // requires the INCUMBENT team to carry an explicit `.anthill`, so the one
      // team that escapes the derived default is the one nothing else checks.
      //
      // ⚠ EQUALITY, not prefix-free — the opposite of the channel rule. Teams
      // NEST by design: the incumbent sits at `.anthill` and every other team
      // under `.anthill/teams/<name>`, so the incumbent's dir is a prefix of all
      // of them. A prefix check here would reject the intended layout.
      //
      // Compared on the RESOLVED absolute paths, not the configured strings: a
      // collision is only visible after defaults apply, and `resolve()`
      // normalizes `.anthill/` and `.anthill` to the same answer.
      for (const [knob, resolvePath] of LIVING_DOC_PATHS) {
        if (resolvePath(a) === resolvePath(b)) {
          throw new ConfigError(
            `config.teams.${b.name}: \`paths.${knob}\` resolves to "${resolvePath(b)}", the same ` +
              `location as team "${a.name}". Two teams sharing a living-docs directory would write ` +
              "their seat docs, seams and comms log on top of each other — the knowledge each team " +
              "accumulates is the thing this whole layer exists to keep separate.",
          );
        }
      }

      // PREFIX-free, which is stricter than unique: `relatedSessions`
      // (`team-attach.ts`) treats `<channel>-<suffix>` as the SAME team's sibling
      // session, so `anthill-dev` + `anthill-dev-lean` would put a fork's panes in
      // its parent's attach menu — and the human would reach the wrong team.
      const nested = b.channel.startsWith(`${a.channel}-`)
        ? { outer: a, inner: b }
        : a.channel.startsWith(`${b.channel}-`)
          ? { outer: b, inner: a }
          : undefined;
      if (nested) {
        throw new ConfigError(
          `config.teams.${nested.inner.name}: channel "${nested.inner.channel}" has team ` +
            `"${nested.outer.name}"'s channel "${nested.outer.channel}" as a prefix. Channels must ` +
            "be prefix-free, not merely unique: `anthill attach` folds `<channel>-<suffix>` sessions " +
            `in as siblings of \`<channel>\`, so "${nested.inner.name}"'s panes would appear in ` +
            `"${nested.outer.name}"'s menu.`,
        );
      }
    }
  }
}

/**
 * Resolve a project — every configured team — from one raw config. PURE.
 *
 * **Added BESIDE `resolveConfig` rather than replacing it**, which is this
 * codebase's idiom for adding a layer (`migrate.ts` adds planners to a registry
 * rather than generalizing one). `resolveConfig` still resolves ONE team entry
 * and is unchanged, so the v2 path is *provably* byte-identical: it is literally
 * the same function on the same object.
 *
 * Shape detection is STRUCTURAL — `"teams" in raw` — and nothing stamps a new
 * version. See `RawProjectConfig` for why.
 */
export function resolveProject(
  raw: unknown,
  ctx: { projectRoot: string; configPath?: string },
): ResolvedProject {
  if (!isObject(raw)) {
    throw new ConfigError("config must be a JSON object");
  }

  const teams: ResolvedConfig[] = [];

  if ("teams" in raw) {
    const rawTeams = raw.teams;
    if (!isObject(rawTeams)) {
      throw new ConfigError("config.teams must be a JSON object mapping team name → team config");
    }
    const names = Object.keys(rawTeams);
    if (names.length === 0) {
      throw new ConfigError("config.teams must configure at least one team");
    }

    // A half-finished conversion is the hazard: add `teams`, forget to delete the
    // flat keys, and the incumbent team silently disappears. An empty or missing
    // team is the one outcome this layer must never produce, so name both sides.
    const strays = TEAM_LEVEL_KEYS.filter((k) => raw[k] !== undefined);
    if (strays.length > 0) {
      throw new ConfigError(
        `config has both a \`teams\` map and top-level ${strays.map((k) => `\`${k}\``).join(", ")} — ` +
          "a team's own keys belong inside its entry. Move them under the team they describe, " +
          "or remove `teams` to keep the single-team shape; leaving both would silently drop the " +
          "top-level team.",
      );
    }

    for (const name of names) {
      const entry = rawTeams[name];
      if (!isObject(entry)) {
        throw new ConfigError(`config.teams.${name} must be a JSON object`);
      }
      // Project-level keys cascade in as DEFAULTS; the entry overrides what it
      // names. `channel` defaults to the team's own name, so `{lead, seats}` is a
      // complete entry.
      const merged: Record<string, unknown> = { channel: name, ...entry };
      for (const key of PROJECT_LEVEL_KEYS) {
        if (merged[key] === undefined && raw[key] !== undefined) merged[key] = raw[key];
      }
      // Every team gets its own container by default, so two teams' living docs
      // cannot land on top of each other.
      if (!isObject(merged.paths) || typeof merged.paths.teamDir !== "string") {
        merged.paths = { teamDir: `${CONFIG_DIR}/teams/${name}`, ...(merged.paths ?? {}) };
      }
      // The name reaches a shell prefix — `SAFE_SESSION_KEY` in `team-spawn.ts`
      // guards the session key built from it. Checked here, at the only place a
      // name is minted, rather than at each of the places it is used.
      if (!SAFE_TEAM_NAME.test(name)) {
        throw new ConfigError(
          `config.teams: "${name}" is not a usable team name — it becomes a tmux session key and a ` +
            `directory segment, so it must match ${String(SAFE_TEAM_NAME)}.`,
        );
      }
      // `SAFE_TEAM_NAME` matches `.` and `..`, and it has to: it was inherited
      // from `SAFE_SESSION_KEY`, which guards a tmux session key, where dots are
      // unremarkable. As a DIRECTORY SEGMENT they traverse — `..` resolves this
      // team's seatDir to `.anthill/teams/../dev`, i.e. `.anthill/dev`, the
      // incumbent's. And it does that WITHOUT colliding with any other configured
      // team, so the directory-collision check below cannot see it.
      if (TRAVERSAL_NAMES.has(name)) {
        throw new ConfigError(
          `config.teams: "${name}" cannot be a team name — a team name is a directory segment, and ` +
            `"${name}" would resolve this team's living docs into another team's directory. ` +
            "A dot inside a name (`v1.2`) is fine; the name may not BE `.` or `..`.",
        );
      }
      try {
        teams.push(resolveConfig(merged, { ...ctx, name }));
      } catch (err) {
        // Name WHICH team failed — with N teams, "seats is required" alone does
        // not say where to look.
        throw err instanceof ConfigError
          ? new ConfigError(`config.teams.${name}: ${err.message}`)
          : err;
      }
    }
    validateAcrossTeams(teams);
  } else {
    teams.push(resolveConfig(raw, { ...ctx, name: DEFAULT_TEAM_NAME }));
  }

  return {
    projectRoot: ctx.projectRoot,
    configPath: ctx.configPath ?? "",
    teams,
    team: (name: string) => teams.find((t) => t.name === name),
  };
}

/**
 * Walk up from `startDir` looking for `.anthill/config.json` (THE root marker).
 * Returns the config file path + the project root (the dir containing `.anthill/`).
 * Throws a clear `ConfigError` if none is found up to the filesystem root.
 */
export function findConfigFile(startDir: string = process.cwd()): {
  configPath: string;
  projectRoot: string;
} {
  let dir = resolve(startDir);
  while (true) {
    const candidate = resolve(dir, CONFIG_REL_PATH);
    if (existsSync(candidate)) {
      return { configPath: candidate, projectRoot: dir };
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new ConfigError(
        `could not find ${CONFIG_REL_PATH} in ${resolve(startDir)} or any parent. ` +
          `Run \`anthill:bootstrap\` (or create ${CONFIG_REL_PATH}) to set up the team.`,
      );
    }
    dir = parent;
  }
}

/**
 * Find, read, parse, and resolve `.anthill/config.json` starting from `startDir`.
 * Clear `ConfigError`s for a missing file (via `findConfigFile`) or malformed JSON.
 */
export function loadConfig(startDir: string = process.cwd()): ResolvedConfig {
  const { raw, projectRoot, configPath } = readConfigFile(startDir);
  return resolveConfig(raw, { projectRoot, configPath });
}

/**
 * The fs entrypoint for the PROJECT — beside `loadConfig`, same discovery.
 * Resolves every configured team; deciding which one applies is `resolveTeam`'s job.
 */
export function loadProject(startDir: string = process.cwd()): ResolvedProject {
  const { raw, projectRoot, configPath } = readConfigFile(startDir);
  return resolveProject(raw, { projectRoot, configPath });
}

/** Find + read + parse — the shared half of `loadConfig` and `loadProject`. */
function readConfigFile(startDir: string): {
  raw: unknown;
  projectRoot: string;
  configPath: string;
} {
  const { configPath, projectRoot } = findConfigFile(startDir);

  let text: string;
  try {
    text = readFileSync(configPath, "utf8");
  } catch (err) {
    throw new ConfigError(
      `could not read ${configPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  try {
    return { raw: JSON.parse(text), projectRoot, configPath };
  } catch (err) {
    throw new ConfigError(
      `invalid JSON in ${configPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

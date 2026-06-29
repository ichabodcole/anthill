/**
 * The `.team/config.json` config layer — the keystone every team command reads.
 *
 * `.team/config.json` is THE project-root marker for the team layer: we walk up
 * from cwd looking for it (the same pattern git/cargo/deno use), which replaces
 * the seed's brittle package.json-name matching in `paths.ts`. `paths.ts` stays
 * for shell bits that still want the package root; team commands key off this.
 *
 * Split for testability:
 * - `resolveConfig(raw, ctx)` — PURE: validate + apply plugin defaults + build
 *   resolvers. No filesystem; feed it a fixture object and a fake projectRoot.
 * - `findConfigFile(startDir)` — walk up for `.team/config.json`.
 * - `loadConfig(startDir)` — find + read + parse + resolve (the fs entrypoint).
 *
 * Schema: spec §5 (`docs/specs/2026-06-28-anthill-portable-team-os-design.md`).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

/** Where `.team/config.json` lives, relative to a project root. */
export const CONFIG_DIR = ".team";
export const CONFIG_FILE = "config.json";
export const CONFIG_REL_PATH = `${CONFIG_DIR}/${CONFIG_FILE}`;

/** Plugin defaults — a minimal config (just `channel` + `seats`) resolves fully via these. */
export const DEFAULT_GROUNDING = ["AGENTS.md", "README.md"] as const;
export const DEFAULT_PATHS = {
  teamDir: "docs/team",
  seatDir: "docs/team/dev",
  seams: "docs/team/dev/seams.md",
} as const;
export const DEFAULT_LAUNCH = 'claude "/anthill:join {handle}"';
export const DEFAULT_VERSION = 1;

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
}

/** A fully-resolved config: defaults applied, helpers + path resolvers attached. */
export interface ResolvedConfig {
  version: number;
  channel: string;
  /** The lead handle: explicit `lead`, else the sole `role:"lead"` seat. May be undefined. */
  lead: string | undefined;
  seats: SeatConfig[];
  grounding: string[];
  /** Path templates as configured (relative to project root), after defaults. */
  paths: TeamPaths;
  launch: string;
  /** Directory containing `.team/` — the resolved project root. */
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
  ctx: { projectRoot: string; configPath?: string },
): ResolvedConfig {
  if (!isObject(raw)) {
    throw new ConfigError("config must be a JSON object");
  }

  if (typeof raw.channel !== "string" || raw.channel.trim() === "") {
    throw new ConfigError('config.channel is required (non-empty string)');
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
  const paths: TeamPaths = {
    teamDir: typeof rawPaths.teamDir === "string" ? rawPaths.teamDir : DEFAULT_PATHS.teamDir,
    seatDir: typeof rawPaths.seatDir === "string" ? rawPaths.seatDir : DEFAULT_PATHS.seatDir,
    seams: typeof rawPaths.seams === "string" ? rawPaths.seams : DEFAULT_PATHS.seams,
  };

  const lead =
    typeof raw.lead === "string"
      ? raw.lead
      : seats.find((s) => s.role === "lead")?.handle;

  const projectRoot = ctx.projectRoot;
  const resolved: ResolvedConfig = {
    version: typeof raw.version === "number" ? raw.version : DEFAULT_VERSION,
    channel: raw.channel,
    lead,
    seats,
    grounding: raw.grounding ? [...(raw.grounding as string[])] : [...DEFAULT_GROUNDING],
    paths,
    launch: typeof raw.launch === "string" ? raw.launch : DEFAULT_LAUNCH,
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
 * Walk up from `startDir` looking for `.team/config.json` (THE root marker).
 * Returns the config file path + the project root (the dir containing `.team/`).
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
 * Find, read, parse, and resolve `.team/config.json` starting from `startDir`.
 * Clear `ConfigError`s for a missing file (via `findConfigFile`) or malformed JSON.
 */
export function loadConfig(startDir: string = process.cwd()): ResolvedConfig {
  const { configPath, projectRoot } = findConfigFile(startDir);

  let text: string;
  try {
    text = readFileSync(configPath, "utf8");
  } catch (err) {
    throw new ConfigError(
      `could not read ${configPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new ConfigError(
      `invalid JSON in ${configPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return resolveConfig(raw, { projectRoot, configPath });
}

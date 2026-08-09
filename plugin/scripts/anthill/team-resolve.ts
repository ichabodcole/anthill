/**
 * WHICH TEAM is this command talking about?
 *
 * A project may configure several teams (`config.ts` §5a). An agent must never
 * have to name one: a seat that has to remember `--team dev` on every command is
 * one forgotten flag away from posting into another team's channel. So the team
 * is resolved AMBIENTLY, from a ladder of increasingly implicit sources.
 *
 * ⚠ THE INVARIANT THAT OUTRANKS EVERYTHING ELSE HERE: a mis-resolved team is a
 * HARD ERROR, never an empty roster/board/channel. **There is no fallback at any
 * rung.** An empty team is precisely what a lead is trained to read as "my seats
 * are missing", so a silent wrong answer here does not look like a bug — it looks
 * like a different, plausible bug, in another part of the system.
 *
 * Split the way `config.ts` is, and for the same reason: `resolveTeam` is PURE
 * (feed it a project and the three inputs), while `readPin`/`writePin` are the
 * filesystem half. A ladder that read the disk itself could not be tested rung by
 * rung.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CONFIG_DIR, ConfigError, type ResolvedConfig, type ResolvedProject } from "./config.ts";

/** The env var carrying an ambient team name — rung 2. */
export const TEAM_ENV_VAR = "ANTHILL_TEAM";

/**
 * The pin: **a fixed literal beside `config.json`, NOT under any `teamDir`.**
 *
 * A file that SELECTS between teamDirs cannot live inside one — under a v3 config
 * `teamDir` is `.anthill/teams/<name>`, so a pin stored there could only be found
 * by first knowing the answer it holds.
 *
 * **Why a file and not a `currentTeam` field in `config.json`:** kubectl and
 * Docker put `current-context` *inside* their config, correctly, because those
 * files are per-user and never committed. **`.anthill/config.json` here IS
 * committed** — a field in it would mutate a tracked file, show up in
 * `git status`, and conflict between two people working on two different teams.
 * The precedents for this shape are Terraform's `.terraform/environment` and
 * `.git/HEAD`: **the selector lives at the same lifetime and sharing scope as the
 * thing it selects.**
 *
 * Written without this comment, the first reader who knows kubectl will
 * "simplify" it back into the config.
 */
export const PIN_FILE = "current-team";
export const PIN_REL_PATH = `${CONFIG_DIR}/${PIN_FILE}`;

/** Which rung answered. Reported so a wrong ambient binding is self-evident. */
export type TeamRung = "flag" | "env" | "pin" | "sole";

export interface TeamResolution {
  team: ResolvedConfig;
  /** The rung that decided — `anthill team show` prints it. */
  via: TeamRung;
}

export interface TeamSelector {
  /** `--team <name>` — rung 1. */
  team?: string | undefined;
  /** The process env — rung 2 reads `ANTHILL_TEAM` from it. */
  env?: Record<string, string | undefined> | undefined;
  /** The pin's contents — rung 3. Read with `readPin(projectRoot)`. */
  pin?: string | undefined;
}

/** A team name that resolves to nothing, phrased as the ladder's failure. */
function unknownTeam(source: string, name: string, project: ResolvedProject): ConfigError {
  return new ConfigError(
    `${source} names team "${name}", which is not configured. ` +
      `Configured teams: ${project.teams.map((t) => t.name).join(", ")}.`,
  );
}

/**
 * Resolve which team a command is about. PURE.
 *
 * The ladder, most explicit first — and **every rung that finds a name and cannot
 * match it THROWS.** A found pin is never second-guessed and never retargeted
 * (kubectl's semantics, and correct): the config enumerates every legal team, so
 * a stale or copied pin fails the same registry lookup as a typo.
 */
export function resolveTeam(project: ResolvedProject, sel: TeamSelector): TeamResolution {
  // 1. The explicit flag.
  if (sel.team !== undefined && sel.team.trim() !== "") {
    const name = sel.team.trim();
    const team = project.team(name);
    if (!team) throw unknownTeam("--team", name, project);
    return { team, via: "flag" };
  }

  // 2. The env var, exported by `buildSeatLaunch` beside `BOUNTY_SESSION_KEY` so a
  //    spawned seat inherits its team without the launch template carrying a token.
  //    An empty/whitespace value is the shell's way of saying "not set"; reading it
  //    as a name would throw on a config that is otherwise fine.
  const fromEnv = sel.env?.[TEAM_ENV_VAR]?.trim();
  if (fromEnv) {
    const team = project.team(fromEnv);
    if (!team) throw unknownTeam(TEAM_ENV_VAR, fromEnv, project);
    return { team, via: "env" };
  }

  // 3. The pin. ABOVE the single-team fast path deliberately: letting rung 4
  //    rescue a stale pin would make the pin advisory, and "the pin is sometimes
  //    obeyed" is worse than either always or never.
  const pinned = sel.pin?.trim();
  if (pinned) {
    const team = project.team(pinned);
    if (!team) {
      const err = unknownTeam(`the pin (${PIN_REL_PATH})`, pinned, project);
      throw new ConfigError(
        `${err.message} Re-pin with \`anthill team use <name>\`, or delete ${PIN_REL_PATH}.`,
      );
    }
    return { team, via: "pin" };
  }

  // 4. Exactly one configured team. THIS is what keeps a single-team project
  //    unchanged — it is the rung every existing repo lands on, having set none
  //    of the three above.
  if (project.teams.length === 1) {
    return { team: project.teams[0] as ResolvedConfig, via: "sole" };
  }

  // 5. Ambiguous. Never a guess, never an empty team.
  throw new ConfigError(
    `this project configures ${project.teams.length} teams and nothing selected one: ` +
      `${project.teams.map((t) => t.name).join(", ")}. ` +
      "Pick one for this repo with `anthill team use <name>` (it persists), or pass `--team <name>` " +
      "for a single command.",
  );
}

/** Read the pinned team name, or `undefined` when there is no usable pin. */
export function readPin(projectRoot: string): string | undefined {
  const path = join(projectRoot, PIN_REL_PATH);
  if (!existsSync(path)) return undefined;
  const name = readFileSync(path, "utf8").trim();
  return name === "" ? undefined : name;
}

/**
 * Write the pin at the RESOLVED PROJECT ROOT — never `process.cwd()`.
 *
 * bounty writes its marker at raw cwd while scoping from the nearest `.git`, so
 * convening from a subdirectory misplaces it. The project root is the directory
 * `.anthill/config.json` was found in, and it is the only correct anchor.
 */
export function writePin(projectRoot: string, name: string): void {
  const path = join(projectRoot, PIN_REL_PATH);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${name}\n`);
}

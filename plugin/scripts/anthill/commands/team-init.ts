import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { emit, emitError, type OutputFormat, resolveFormat } from "../agent-layer.ts";
// The same constant `commsLogPath()` builds the log path from — so the ignore
// line and the thing it guards cannot drift apart.
import { COMMS_DIR } from "../comms.ts";
import { ConfigError, type ResolvedConfig, type ResolvedProject } from "../config.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { PIN_REL_PATH, resolveTeam } from "../team-resolve.ts";
import { requireProject } from "./team-support.ts";

/**
 * The deterministic template renderer behind `anthill init` (design D5: the skill
 * is the smart compositor that writes `.anthill/config.json`; the CLI is the dumb,
 * idempotent renderer). The PURE core (`renderTemplates`) is the unit-test target.
 *
 * TOKEN SCHEME (init owns both sides — these are the tokens T7's templates use):
 *   Path token (filename):  {{handle}}  — a template whose RELATIVE PATH contains
 *     {{handle}} is fanned out once PER SEAT (e.g. dev/{{handle}}.md → dev/loom.md).
 *   Content tokens (global, every template):
 *     {{channel}}      config.channel
 *     {{lead}}         config.lead (or "")
 *     {{rosterTable}}  a generated markdown table of all seats
 *     {{teamDir}} {{seatDir}}  this team's resolved doc locations, repo-relative
 *   Content tokens (per-seat, only inside a {{handle}} template):
 *     {{handle}} {{role}} {{scope}}
 *   Unknown {{tokens}} are left untouched (so literal braces survive).
 *
 * IDEMPOTENT: a target that already exists is SKIPPED, never clobbered — so the
 * team can re-run init when it reshapes and only NEW seat docs get rendered.
 */

const PER_SEAT_TOKEN = "{{handle}}";

export interface TemplateFile {
  relPath: string;
  content: string;
}

export interface RenderConfig {
  channel: string;
  lead: string | undefined;
  seats: Array<{ handle: string; role: string; scope: string }>;
  /**
   * The team's resolved doc locations, REPO-RELATIVE, for `{{teamDir}}` /
   * `{{seatDir}}`.
   *
   * A rendered doc must never carry `<teamDir>` verbatim. The skills write it as
   * a placeholder and say so in a legend, because a skill is read by an agent in
   * an unknown repo — but a TEMPLATE is rendered once into a repo where the value
   * is known, and it ships with no legend. It went out as literal `<teamDir>`,
   * which regressed a single-team project's SOP from `.anthill/scratch/…` to an
   * undefined placeholder: criterion 1, caught by diffing a rendered footprint
   * against one rendered from `develop`.
   */
  teamDir: string;
  seatDir: string;
}

export interface RenderPlan {
  /** ABSOLUTE destinations — `dest` has already been applied. */
  writes: Array<{ path: string; content: string }>;
  skipped: string[];
}

/**
 * The template tree's `dev/` segment is LAYOUT, not a path: it says "this file
 * belongs to the seat layer", and where the seat layer lives is `seatDir`'s
 * answer, not the template folder's. So map every relPath through the config's
 * resolvers instead of joining it onto `teamDir`:
 *
 *   README.md, principles.md, paper-cuts.md, retro.md  ->  <teamDir>/…
 *   dev/README.md, dev/<handle>.md                     ->  seatDirPath()
 *   dev/seams.md                                       ->  seamsPath()
 *
 * Under the defaults (`seatDir = <teamDir>/dev`) this is byte-identical to the
 * old `join(teamDir, relPath)`, which is what makes it safe for every existing
 * project. It is the ONE place a destination is decided — `init` asks its
 * idempotency predicate and its write about the same string, because remapping
 * one and not the other clobbers a live seat doc.
 */
const SEAT_TEMPLATE_DIR = "dev";
const SEAMS_TEMPLATE_REL = "dev/seams.md";

export function templateDestination(
  relPath: string,
  paths: { teamDir: string; seatDir: string; seams: string },
): string {
  const rel = relPath.split(sep).join("/");
  if (rel === SEAMS_TEMPLATE_REL) return paths.seams;
  const prefix = `${SEAT_TEMPLATE_DIR}/`;
  if (rel.startsWith(prefix)) return join(paths.seatDir, rel.slice(prefix.length));
  return join(paths.teamDir, rel);
}

function applyTokens(s: string, tokens: Record<string, string>): string {
  return s.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const v = tokens[key];
    return v !== undefined ? v : match;
  });
}

function rosterTable(seats: RenderConfig["seats"]): string {
  const rows = seats.map((s) => `| ${s.handle} | ${s.role} | ${s.scope} |`);
  return ["| Handle | Role | Scope |", "| --- | --- | --- |", ...rows].join("\n");
}

/**
 * PURE render: expand `templates` against `config`, fanning {{handle}} templates
 * out per seat and substituting tokens. `dest(relPath)` places each expanded
 * target; `exists(dest)` decides idempotency — existing targets land in
 * `skipped`, the rest in `writes`, both as destinations. No filesystem.
 */
export function renderTemplates(opts: {
  templates: TemplateFile[];
  config: RenderConfig;
  dest: (relPath: string) => string;
  exists: (path: string) => boolean;
}): RenderPlan {
  const { templates, config, dest, exists } = opts;
  const globalTokens: Record<string, string> = {
    channel: config.channel,
    lead: config.lead ?? "",
    rosterTable: rosterTable(config.seats),
    teamDir: config.teamDir,
    seatDir: config.seatDir,
  };

  const writes: RenderPlan["writes"] = [];
  const skipped: string[] = [];

  for (const t of templates) {
    const targets = t.relPath.includes(PER_SEAT_TOKEN)
      ? config.seats.map((seat) => ({
          relPath: applyTokens(t.relPath, { handle: seat.handle }),
          tokens: { ...globalTokens, handle: seat.handle, role: seat.role, scope: seat.scope },
        }))
      : [{ relPath: t.relPath, tokens: globalTokens }];

    for (const target of targets) {
      const path = dest(target.relPath);
      if (exists(path)) {
        skipped.push(path);
        continue;
      }
      writes.push({ path, content: applyTokens(t.content, target.tokens) });
    }
  }

  return { writes, skipped };
}

/**
 * The gitignore lines init ensures for a team's local state, DERIVED from that
 * team's `teamDir` — because the paths they guard are derived from it too
 * (`commsLogPath()` resolves under `teamDir`; the seat scratch is
 * `<teamDir>/scratch/<handle>`). They were fixed literals, which meant moving
 * `teamDir` silently made every seat's scratch and the whole comms log TRACKED
 * files. Under the default `teamDir` these reproduce the old literals exactly.
 */
function normalizeTeamDir(teamDir: string): string {
  return teamDir.replace(/\/+$/, "");
}

/** The per-session running scratch (spec §6). `.anthill/config.json` + the
 * rendered team docs are committed; the scratch is disposable, so it's ignored. */
export function scratchGitignoreLine(teamDir: string): string {
  return `${normalizeTeamDir(teamDir)}/scratch/`;
}

/** The gitignore line init ensures at the REPO ROOT — not derived from any
 * team's `teamDir`, because the file isn't under one: the pinned bounty-session marker.
 * `anthill convene` writes `.bounty-session` at the repo root (`bounty open --pin`)
 * to bind the team board; it's per-session/local state, so — like the scratch
 * dir — it's ignored, never committed. See seams.md, the board-binding contract. */
export const BOUNTY_SESSION_GITIGNORE_LINE = ".bounty-session";

/** The team's comms message log. `anthill comms send` appends to
 * `<teamDir>/comms/<channel>.ndjson` — per-session conversational state, the same
 * genre as scratch, and never a committed artifact.
 * It needs its OWN line: `<teamDir>/scratch/` does not match `<teamDir>/comms/`, and
 * assuming "the local-state line already covers it" is exactly how the log
 * sat committable. Directory-scoped, not per-channel: channels are named per team,
 * so a filename-scoped ignore would leak every other channel's log. */
/**
 * NO TRAILING SLASH, and that one character is load-bearing.
 *
 * A slash-suffixed rule matches a DIRECTORY only. The moment `<teamDir>/comms` is
 * a SYMLINK — which is how a team sharing one log across per-seat worktrees sets
 * it up — the rule stops matching and the link shows up untracked in every
 * seat's tree.
 *
 * Measured, in the session that hit it: it then rode `anthill commit`'s
 * `uncheckedAgainst` on 9 of 9 lands, with ZERO informative values. That field
 * exists to tell a seat its green was measured against work the commit does not
 * contain — a session-5 scar — and a false positive on every single land is
 * worse than no field at all, because it trains the reader to skip the thing
 * they were told to check.
 *
 * Slashless still matches the directory, so this is strictly wider.
 */
export function commsGitignoreLine(teamDir: string): string {
  return `${normalizeTeamDir(teamDir)}/${COMMS_DIR}`;
}

/**
 * Every line `init` ensures, for EVERY configured team's `teamDir` (config order),
 * plus the two project-level markers. A repo with two teams needs both teams'
 * scratch and comms ignored — the second team's log is not covered by the first's.
 *
 * The two project-level lines are local state, not team state: `.bounty-session`
 * binds this checkout's board, and `.anthill/current-team` is this checkout's
 * answer to "which team am I on". Committing either switches somebody else's
 * session out from under them on their next pull.
 */
export function gitignoreLines(teamDirs: string[]): string[] {
  const lines: string[] = [];
  for (const dir of teamDirs) lines.push(scratchGitignoreLine(dir), commsGitignoreLine(dir));
  lines.push(BOUNTY_SESSION_GITIGNORE_LINE, PIN_REL_PATH);
  return lines;
}

export interface GitignorePlan {
  action: "added" | "present";
  content: string;
}

/**
 * PURE idempotent gitignore-ensure: append `line` to `.gitignore` content if it's
 * absent, never duplicate. `existing` is the current file content (null/"" when
 * there's no file). Per-line trimmed comparison so a trailing-whitespace variant
 * doesn't double-add. Re-runnable: a second call finds it present.
 */
export function planGitignore(existing: string | null, line: string): GitignorePlan {
  const content = existing ?? "";
  const present = content.split("\n").some((l) => l.trim() === line);
  if (present) return { action: "present", content };
  const sep = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
  return { action: "added", content: `${content}${sep}${line}\n` };
}

/** Recursively read a directory into a flat list of {relPath, content}. */
function readTemplateDir(dir: string): TemplateFile[] {
  const out: TemplateFile[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        out.push({ relPath: relative(dir, abs), content: readFileSync(abs, "utf8") });
      }
    }
  };
  walk(dir);
  return out;
}

/** The bundled templates dir: <plugin-root>/templates/docs-team. */
function defaultTemplatesDir(): string {
  // commands/ -> anthill/ -> scripts/ -> <plugin root>
  return resolve(import.meta.dir, "..", "..", "..", "templates", "docs-team");
}

interface InitData {
  /**
   * Every team this run rendered, in config order. One entry on a single-team
   * project.
   *
   * **There is deliberately no top-level `teamDir` beside this.** There was, meaning
   * "the first rendered team, in config order" — a TOTAL field carrying a partial
   * answer, identical to `teams[0].teamDir` where it was right and quietly wrong
   * where it was not. It is the same shape `ResolvedProject.soleTeam` was refused
   * for: an absence cannot carry a verdict, and neither can a singular field over a
   * plural fact.
   */
  teams: Array<{ name: string; teamDir: string }>;
  written: string[];
  skipped: string[];
  /** Per-line status for each gitignore line init ensures (scratch + bounty-session). */
  gitignore: Array<{ line: string; action: "added" | "present" }>;
}

/**
 * WHICH TEAMS DOES `init` RENDER — **the whole project's, unless `--team` narrows
 * it.** `init` is the one command that does not sit on the resolution ladder.
 *
 * Every other command routes through `requireConfig`, so an unselected team on a
 * multi-team project is a hard refusal. That is right for commands that ACT AS a
 * team (post to its wire, read its board, spawn its seats): acting as the wrong
 * team is the failure the ladder exists to prevent.
 *
 * `init` is not one of those. It renders the PROJECT's footprint — deterministic,
 * file-level idempotent, never clobbering — so rendering a team's scaffold that is
 * already there is a no-op, and rendering all of them is that no-op N times.
 *
 * ⚠ **ONLY RUNG 1 NARROWS, and the distinction is not a detail.** `--team lean` is
 * a deliberate act on *this invocation*. The pin and `ANTHILL_TEAM` are ambient
 * state answering a different question — *which team am I operating AS* — and
 * letting them narrow a renderer means the project's own footprint depends on
 * which team someone last switched to.
 *
 * Both halves of this were found the same way, by running the documented
 * add-a-team route (`bootstrap` §0a) against a fixture repo:
 *
 * 1. Through `requireConfig`, `init` **refused** on the freshly-converted two-team
 *    repo — no pin yet, so the new team's docs could never be rendered at all.
 * 2. Fixing only that left the pin narrowing, so the route worked **exactly once**:
 *    every later add-a-team runs on a repo that HAS a pin, and there `init` reports
 *    `ok: true` with `written: []` while the new team gets its gitignore lines, its
 *    `team ls` row — and **no living docs**. `convene` then hands its seats an empty
 *    footprint, through the documented route, with a success envelope at every step.
 *
 * Same rule as `team ls` and `team use`: **a command that helps you resolve
 * ambiguity must not require ambiguity to be already resolved.** A **bad** `--team`
 * still hard-errors — it names a team that does not exist, which is a typo to
 * report rather than an absence to fill.
 */
function teamsToRender(
  format: OutputFormat,
  teamArg: string | undefined,
): { project: ResolvedProject; targets: ResolvedConfig[] } {
  const project = requireProject(format, "init");
  const name = teamArg?.trim();
  if (!name) return { project, targets: project.teams };
  try {
    // Rung 1 alone: no `env`, no `pin`. The ladder still owns the not-configured
    // message, so a bad `--team` reads identically here and everywhere else.
    const { team } = resolveTeam(project, { team: name });
    return { project, targets: [team] };
  } catch (err) {
    if (err instanceof ConfigError) {
      emitError({ format, command: "init", error: err.message });
      process.exit(1);
    }
    throw err;
  }
}

// `anthill init` — deterministic, idempotent renderer. Reads .anthill/config.json,
// expands templates/docs-team into the target repo's teamDir, substituting the
// token scheme above. Re-runnable: existing files are skipped, never clobbered.
export const teamInitCommand = defineAnthillCommand({
  meta: {
    name: "init",
    description: "Render the team scaffold from .anthill/config.json (idempotent — never clobbers)",
    scope: "workspace",
  },
  args: {
    templates: {
      type: "string",
      description: "Templates dir (default: bundled templates/docs-team)",
      valueHint: "path",
    },
    team: {
      type: "string",
      description: "Render only this configured team (default: every configured team)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const { project, targets } = teamsToRender(format, ctx.args.team as string | undefined);
    const config = targets[0] as ResolvedConfig;

    const templatesDir = (ctx.args.templates as string | undefined) || defaultTemplatesDir();
    if (!existsSync(templatesDir)) {
      emitError({
        format,
        command: "init",
        error: `templates dir not found: ${templatesDir}. (The bundled templates live at <plugin>/templates/docs-team; pass --templates <dir> to render a custom set.)`,
      });
      process.exit(1);
    }

    const templates = readTemplateDir(templatesDir);
    const written: string[] = [];
    const skipped: string[] = [];
    const teams: InitData["teams"] = [];

    for (const team of targets) {
      const teamDir = team.teamDirPath();
      teams.push({ name: team.name, teamDir: relative(team.projectRoot, teamDir) });

      // Every destination is decided ONCE, through the config's resolvers — the
      // idempotency predicate below and the write loop ask the same question.
      const resolvedPaths = { teamDir, seatDir: team.seatDirPath(), seams: team.seamsPath() };
      const plan = renderTemplates({
        templates,
        config: {
          channel: team.channel,
          lead: team.lead,
          seats: team.roster(),
          teamDir: relative(team.projectRoot, teamDir),
          seatDir: relative(team.projectRoot, team.seatDirPath()),
        },
        dest: (relPath) => templateDestination(relPath, resolvedPaths),
        exists: existsSync,
      });

      for (const w of plan.writes) {
        mkdirSync(dirname(w.path), { recursive: true });
        writeFileSync(w.path, w.content);
        written.push(relative(team.projectRoot, w.path));
      }
      for (const abs of plan.skipped) skipped.push(relative(team.projectRoot, abs));
    }

    // Ensure the gitignored lines in the target repo (idempotent): EVERY configured
    // team's running scratch and comms log, plus the two project-level markers.
    // Every team, not just the rendered ones — the ignore file is project-level, and
    // a repo pinned to `dev` that leaves `lean`'s comms log trackable is the same
    // committed-log bug those lines exist to prevent, just one team over.
    // Chain planGitignore over the resulting content so they land in one write.
    const gitignorePath = join(config.projectRoot, ".gitignore");
    const before = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : null;
    const ignored: Array<{ line: string; action: "added" | "present" }> = [];
    let content = before;
    for (const line of gitignoreLines(project.teams.map((t) => t.paths.teamDir))) {
      const plan = planGitignore(content, line);
      ignored.push({ line, action: plan.action });
      content = plan.content;
    }
    if (content !== (before ?? "")) writeFileSync(gitignorePath, content ?? "");

    const data: InitData = {
      teams,
      written,
      skipped,
      gitignore: ignored,
    };

    emit({
      format,
      command: "init",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines =
          d.teams.length > 1
            ? [
                `Rendered ${d.teams.length} team scaffolds:`,
                ...d.teams.map((t) => `  ${t.name} -> ${t.teamDir}/`),
              ]
            : [`Rendered team scaffold into ${d.teams[0]?.teamDir ?? "?"}/`];
        if (d.written.length) {
          lines.push(`Wrote ${d.written.length} file(s):`);
          for (const p of d.written) lines.push(`  + ${p}`);
        }
        if (d.skipped.length) {
          lines.push(`Skipped ${d.skipped.length} existing (not clobbered):`);
          for (const p of d.skipped) lines.push(`  · ${p}`);
        }
        if (!d.written.length && !d.skipped.length) lines.push("(no templates to render)");
        for (const g of d.gitignore) {
          lines.push(
            g.action === "added"
              ? `.gitignore: added "${g.line}"`
              : `.gitignore: "${g.line}" already present`,
          );
        }
        return lines.join("\n");
      },
    });
  },
});

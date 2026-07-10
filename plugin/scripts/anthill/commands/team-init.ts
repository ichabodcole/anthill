import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { requireConfig } from "./team-support.ts";

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
}

export interface RenderPlan {
  writes: Array<{ relPath: string; content: string }>;
  skipped: string[];
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
 * out per seat and substituting tokens. `exists(relPath)` decides idempotency —
 * existing targets land in `skipped`, the rest in `writes`. No filesystem.
 */
export function renderTemplates(opts: {
  templates: TemplateFile[];
  config: RenderConfig;
  exists: (relPath: string) => boolean;
}): RenderPlan {
  const { templates, config, exists } = opts;
  const globalTokens: Record<string, string> = {
    channel: config.channel,
    lead: config.lead ?? "",
    rosterTable: rosterTable(config.seats),
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
      if (exists(target.relPath)) {
        skipped.push(target.relPath);
        continue;
      }
      writes.push({ relPath: target.relPath, content: applyTokens(t.content, target.tokens) });
    }
  }

  return { writes, skipped };
}

/** The gitignore line init ensures in the target repo: the per-session running
 * scratch (spec §6). `.anthill/config.json` + the rendered `.anthill/` docs are
 * committed; the scratch under `.anthill/scratch/` is disposable, so it's ignored. */
export const SCRATCH_GITIGNORE_LINE = ".anthill/scratch/";

/** The second gitignore line init ensures: the pinned bounty-session marker.
 * `anthill convene` writes `.bounty-session` at the repo root (`bounty open --pin`)
 * to bind the team board; it's per-session/local state, so — like the scratch
 * dir — it's ignored, never committed. See seams.md, the board-binding contract. */
export const BOUNTY_SESSION_GITIGNORE_LINE = ".bounty-session";

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
  teamDir: string;
  written: string[];
  skipped: string[];
  /** Per-line status for each gitignore line init ensures (scratch + bounty-session). */
  gitignore: Array<{ line: string; action: "added" | "present" }>;
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
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "init");

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
    const teamDir = config.teamDirPath();

    const plan = renderTemplates({
      templates,
      config: { channel: config.channel, lead: config.lead, seats: config.roster() },
      exists: (relPath) => existsSync(join(teamDir, relPath)),
    });

    const written: string[] = [];
    for (const w of plan.writes) {
      const abs = join(teamDir, w.relPath);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, w.content);
      written.push(relative(config.projectRoot, abs));
    }
    const skipped = plan.skipped.map((rel) => relative(config.projectRoot, join(teamDir, rel)));

    // Ensure the gitignored lines in the target repo (idempotent): the running
    // scratch dir AND the pinned bounty-session marker. Chain planGitignore over
    // the resulting content so both land in one write.
    const gitignorePath = join(config.projectRoot, ".gitignore");
    const before = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : null;
    const scratchGi = planGitignore(before, SCRATCH_GITIGNORE_LINE);
    const bountyGi = planGitignore(scratchGi.content, BOUNTY_SESSION_GITIGNORE_LINE);
    if (bountyGi.content !== (before ?? "")) writeFileSync(gitignorePath, bountyGi.content);

    const data: InitData = {
      teamDir: relative(config.projectRoot, teamDir),
      written,
      skipped,
      gitignore: [
        { line: SCRATCH_GITIGNORE_LINE, action: scratchGi.action },
        { line: BOUNTY_SESSION_GITIGNORE_LINE, action: bountyGi.action },
      ],
    };

    emit({
      format,
      command: "init",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines = [`Rendered team scaffold into ${d.teamDir}/`];
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

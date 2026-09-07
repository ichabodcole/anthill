import { existsSync } from "node:fs";
import { relative } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { collectDocsLint, type DocsLintReport, docsLintSummary } from "../docs-lint/index.ts";
import { nowMillis } from "../runtime.ts";
import { requireConfig } from "./team-support.ts";

/**
 * `anthill wiki lint` — lint the team wiki and emit its knowledge graph.
 *
 * The wiki is the project-owned half of every lifecycle touch point: a skill says
 * WHEN and WHAT TO READ, the wiki page says HOW. That split only holds if the
 * pages stay linked and cataloged — an orphan page is method nobody's skill
 * points at, which is the accumulation failure this wiki exists to end. So the
 * lint is the one mechanical check the design carries, and it is binary by
 * construction: broken links, missing front matter, orphans, bad `related`
 * keys. It never judges prose.
 *
 * OUTCOMES ARE NOT ERRORS (CONTRACT.md). A wiki with problems is an ANSWER —
 * `clean: false`, the problems listed — at exit 0, exactly as `acc check`'s
 * verdict is data. A gate that wants a non-zero exit reads `clean` off the
 * envelope; the SCHEMA page shows the one-liner. What IS an error: no wiki to
 * lint, which is a `failed` — the fix is in the world.
 */

/** The OKF `type` vocabulary for a team wiki. Disjoint from acc's by design —
 * a `touchpoint` is the page a lifecycle skill points at; the rest are the
 * shapes a team reaches for when its method outgrows one page per event. */
export const TEAM_WIKI_TYPES = ["touchpoint", "guide", "decision", "concept", "index"] as const;

export interface WikiLintData extends DocsLintReport {
  /** `problems.length === 0`, surfaced so a gate never has to count. */
  clean: boolean;
  /** Where the wiki was read from, repo-relative. */
  wikiDir: string;
}

export function lintTeamWiki(wikiDir: string, projectRoot: string): WikiLintData {
  const report = collectDocsLint({
    root: wikiDir,
    types: [...TEAM_WIKI_TYPES],
    dateField: "generated",
    // Pages are edited by hand at curation; nobody types a timezone offset correctly.
    allowDateOnly: true,
  });
  return {
    ...report,
    clean: report.problems.length === 0,
    wikiDir: relative(projectRoot, wikiDir),
  };
}

export function renderWikiLint(data: WikiLintData): string {
  const lines = [...data.problems, docsLintSummary(data)];
  return lines.join("\n");
}

export const teamWikiLintCommand = defineAnthillCommand({
  meta: {
    name: "lint",
    description:
      "Lint the team wiki (links, anchors, OKF front matter, orphans) and emit its graph",
    scope: "workspace",
  },
  args: {
    team: {
      type: "string",
      description: "Which configured team (default: resolved from the pin / sole team)",
      valueHint: "name",
    },
    format: {
      type: "string",
      description: "Output format",
      valueHint: "text|json",
      values: ["text", "json"],
    },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "wiki lint", {
      team: ctx.args.team as string | undefined,
    });
    const wikiDir = config.wikiPath();
    if (!existsSync(wikiDir)) {
      emitError({
        format,
        command: "wiki lint",
        error:
          `this team has no wiki at ${relative(config.projectRoot, wikiDir)}. ` +
          "Render the skeleton with anthill's init (it only creates files that are missing, so " +
          "running it on an existing team adds the wiki and touches nothing else).",
      });
      process.exit(1);
    }
    emit({
      format,
      command: "wiki lint",
      data: lintTeamWiki(wikiDir, config.projectRoot),
      startedAt: started,
      renderText: renderWikiLint,
    });
  },
});

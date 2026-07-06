import { spawnSync } from "node:child_process";
import { platform, release } from "node:os";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import {
  buildIssueUrl,
  composeFeedbackBody,
  FEEDBACK_CATEGORIES,
  FEEDBACK_LABEL,
  FEEDBACK_REPO,
  feedbackTitle,
  type GhResult,
  interpretGhResult,
  isFeedbackCategory,
} from "../feedback.ts";
import { nowMillis } from "../runtime.ts";

// The auto-context the composer folds into the issue body — read from real
// globals HERE (never inside the pure composer) so the composer stays a golden
// target. Version comes from `main.meta.version` (the release-please-tracked CLI
// version), NOT `info env` (which only lists .env keys).
interface FeedbackEnv {
  version: string;
  platform: string;
  osRelease: string;
  bunVersion: string;
}

// The injectable submit seam: array args, no shell (so a message can never be a
// shell footgun). Stubbed in tests — real gh is never spawned there.
export type GhRunner = (title: string, body: string) => GhResult;

export interface FeedbackDeps {
  gh: GhRunner;
  env: FeedbackEnv;
}

export interface FeedbackInput {
  message: string;
  category: string;
  skill?: string;
  submit: boolean;
}

export interface FeedbackData {
  title: string;
  body: string;
  repo?: string;
  issueUrl: string;
  submitCmd?: string;
  warnings?: string[];
}

/** The self-re-invocation string a seat hands the lead — NOT raw `gh`, so the
 * send always goes back through this command's no-loss guards. `JSON.stringify`
 * quotes + escapes the message/skill safely. */
function buildSubmitCmd(message: string, category: string, skill?: string): string {
  const parts = [`anthill feedback ${JSON.stringify(message)}`, `--category ${category}`];
  if (skill?.trim()) parts.push(`--skill ${JSON.stringify(skill.trim())}`);
  parts.push("--submit");
  return parts.join(" ");
}

/**
 * The command core, with the environment + `gh` seam injected (deps) so it's
 * exercisable in tests with no network. Compose is always done; `--submit`
 * additionally routes through the injected `gh()` + `interpretGhResult`.
 *
 * NEVER throws and NEVER drops the report:
 *   - default (no submit) → prefilled issueUrl + repo + submitCmd, sends nothing
 *   - submit success       → the created issueUrl
 *   - submit ANY failure   → the prefilled issueUrl + a manual-route warning
 */
export function buildFeedback(input: FeedbackInput, deps: FeedbackDeps): FeedbackData {
  const title = feedbackTitle(input.category, input.message);
  const body = composeFeedbackBody({
    message: input.message,
    category: input.category,
    skill: input.skill,
    version: deps.env.version,
    platform: deps.env.platform,
    osRelease: deps.env.osRelease,
    bunVersion: deps.env.bunVersion,
  });
  const prefilled = buildIssueUrl(FEEDBACK_REPO, title, body, FEEDBACK_LABEL);

  if (!input.submit) {
    return {
      title,
      body,
      repo: FEEDBACK_REPO,
      issueUrl: prefilled,
      submitCmd: buildSubmitCmd(input.message, input.category, input.skill),
    };
  }

  const { issueUrl, warnings } = interpretGhResult(deps.gh(title, body));
  if (issueUrl) {
    return { title, body, issueUrl };
  }
  return { title, body, issueUrl: prefilled, warnings };
}

/** The real submit seam. `spawnSync` never throws on a missing binary (it
 * returns `status: null` + an `error`), so this always yields a `GhResult` that
 * `interpretGhResult` degrades gracefully. */
function realGh(title: string, body: string): GhResult {
  const r = spawnSync(
    "gh",
    [
      "issue",
      "create",
      "--repo",
      FEEDBACK_REPO,
      "--title",
      title,
      "--body",
      body,
      "--label",
      FEEDBACK_LABEL,
    ],
    { encoding: "utf8" },
  );
  return {
    status: r.status,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? "").trim(),
  };
}

/**
 * Real auto-context. Version comes from `main.meta.version` (the
 * release-please-tracked CLI version) via a LAZY dynamic import of `cli.ts` —
 * static importing it would form a cycle (cli.ts eagerly builds its subCommands
 * map, so it can't be evaluated before this command's binding exists). Deferring
 * to call-time sidesteps that: at run-time cli.ts is already the evaluated entry
 * module, so the import resolves from cache without re-running the CLI.
 */
async function realEnv(): Promise<FeedbackEnv> {
  const { main } = await import("../cli.ts");
  const bun = (globalThis as { Bun?: { version: string } }).Bun;
  return {
    version: main.meta?.version ?? "unknown",
    platform: platform(),
    osRelease: release(),
    bunVersion: bun?.version ?? process.versions.bun ?? "unknown",
  };
}

// `anthill feedback "<message>" [--category …] [--skill …] [--submit]` — send an
// idea, rough edge, or bug about anthill ITSELF upstream. A bare call composes +
// emits, sending nothing; `--submit` files it via `gh` and degrades to the
// prefilled URL (never dropping the report) on any failure. Team-routing framing
// (who submits on a team) lives in the SOP, NOT here — the command has no team
// concept.
export const teamFeedbackCommand = defineAnthillCommand({
  meta: {
    name: "feedback",
    description:
      "Send an idea, rough edge, or bug about anthill itself upstream to the anthill project (not your team) — on a team the lead submits; see your team SOP.",
    scope: "workspace",
  },
  args: {
    category: {
      type: "string",
      description: `Feedback kind: ${FEEDBACK_CATEGORIES.join("|")} (default: friction)`,
      default: "friction",
      valueHint: FEEDBACK_CATEGORIES.join("|"),
    },
    skill: {
      type: "string",
      description: "The skill/surface the feedback is about (free-form)",
      valueHint: "name",
    },
    submit: {
      type: "boolean",
      description: "File the issue via gh (default: compose + emit only, send nothing)",
      default: false,
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);

    // Positional message: the full positional list, joined + trimmed (so both a
    // single quoted arg and bare words work).
    const message = ((ctx.args._ as string[] | undefined) ?? [])
      .filter((p) => p.length > 0)
      .join(" ")
      .trim();
    const category = ((ctx.args.category as string | undefined) ?? "friction").trim();
    const skill = (ctx.args.skill as string | undefined)?.trim() || undefined;
    const submit = Boolean(ctx.args.submit);

    // Guards emit the dual-audience envelope (clean {ok:false} in JSON mode)
    // rather than throwing — mirrors team-commit's precondition guards.
    if (!message) {
      emitError({
        format,
        command: "feedback",
        error:
          'a feedback message is required: `anthill feedback "<message>" [--category …] [--submit]`',
      });
      process.exit(1);
    }
    if (!isFeedbackCategory(category)) {
      emitError({
        format,
        command: "feedback",
        error: `unknown --category "${category}". Use one of: ${FEEDBACK_CATEGORIES.join(", ")}.`,
      });
      process.exit(1);
    }

    const data = buildFeedback(
      { message, category, skill, submit },
      { gh: realGh, env: await realEnv() },
    );

    emit({
      format,
      command: "feedback",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines = [d.title, ""];
        if (d.submitCmd) {
          // Default (composed, nothing sent).
          lines.push(
            "Composed — nothing sent. To file it upstream (or hand this to your lead):",
            `  ${d.submitCmd}`,
            "",
            `Or open the prefilled issue: ${d.issueUrl}`,
          );
        } else if (d.warnings && d.warnings.length > 0) {
          // Submit failed — degraded to the prefilled URL, nothing lost.
          lines.push(...d.warnings.map((w) => `! ${w}`), "", `Prefilled issue: ${d.issueUrl}`);
        } else {
          // Submit succeeded.
          lines.push(`Filed: ${d.issueUrl}`);
        }
        return lines.join("\n");
      },
    });
  },
});

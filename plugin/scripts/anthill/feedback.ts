/**
 * Pure composers for `anthill feedback` — the golden-test target.
 *
 * Every function here is side-effect-free and reads NOTHING from globals: the
 * environment (version, platform, os release, bun version) is injected as
 * params. That keeps the composers deterministic (goldens don't flake on the
 * host) and keeps the privacy contract auditable in one place — the body
 * carries the message + non-sensitive env ONLY, never a repo name/path/code.
 *
 * No `node:*` imports live here on purpose; the thin `gh()` shell-out + the
 * real env reads belong to the command (`commands/team-feedback.ts`).
 */

/** The upstream repo every feedback issue is filed against (command-controlled). */
export const FEEDBACK_REPO = "ichabodcole/anthill";

/** Provenance label, always applied at create so filed issues are traceable. */
export const FEEDBACK_LABEL = "anthill-feedback";

/** The category set (default = `friction`). Kept corrective-heavy by design;
 * weaver's prose leads generative-first so ideas aren't suppressed. */
export const FEEDBACK_CATEGORIES = ["bug", "friction", "idea", "docs"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

/** Soft cap on the issue title length (the whole `[feedback/…] ` + summary). */
const TITLE_MAX = 72;

/** First non-blank line of `message`, whitespace-collapsed to a single line. */
function firstLine(message: string): string {
  const line = message.split("\n").find((l) => l.trim().length > 0) ?? "";
  return line.replace(/\s+/g, " ").trim();
}

/**
 * `feedbackTitle("friction", "…")` → `"[feedback/friction]  <first line>"`,
 * whitespace-collapsed and truncated (with an ellipsis) so the whole title
 * stays ≤ ~72c. The `[feedback/<category>]` prefix is always kept intact.
 */
export function feedbackTitle(category: string, message: string): string {
  const prefix = `[feedback/${category}]  `;
  const summary = firstLine(message);
  const full = `${prefix}${summary}`;
  if (full.length <= TITLE_MAX) return full;
  const room = Math.max(0, TITLE_MAX - prefix.length - 1);
  return `${prefix}${summary.slice(0, room).trimEnd()}…`;
}

export interface FeedbackBodyParams {
  message: string;
  category: string;
  /** Optional free-form skill/surface the feedback is about. */
  skill?: string;
  /** anthill CLI version — from `main.meta.version`, injected by the command. */
  version: string;
  /** `os.platform()` — e.g. "darwin". */
  platform: string;
  /** `os.release()` — kernel release string. */
  osRelease: string;
  /** `Bun.version`. */
  bunVersion: string;
}

/**
 * The markdown issue body: the author's message, then a fenced "filed via"
 * footer carrying ONLY non-sensitive env. NEVER emits a repo name, path, or
 * code — the privacy contract. `skill` is omitted when empty.
 */
export function composeFeedbackBody(p: FeedbackBodyParams): string {
  const lines: string[] = [
    p.message.trim(),
    "",
    "---",
    "",
    "_Filed via `anthill feedback`._",
    "",
    `- **Category:** ${p.category}`,
  ];
  const skill = p.skill?.trim();
  if (skill) lines.push(`- **Skill:** ${skill}`);
  lines.push(
    `- **anthill:** ${p.version}`,
    `- **Platform:** ${p.platform} ${p.osRelease}`,
    `- **Bun:** ${p.bunVersion}`,
  );
  return `${lines.join("\n")}\n`;
}

/**
 * The prefilled GitHub "new issue" URL — the no-loss fallback the caller can
 * always open by hand. Each field is `encodeURIComponent`-escaped.
 */
export function buildIssueUrl(repo: string, title: string, body: string, label: string): string {
  const query = [
    `title=${encodeURIComponent(title)}`,
    `body=${encodeURIComponent(body)}`,
    `labels=${encodeURIComponent(label)}`,
  ].join("&");
  return `https://github.com/${repo}/issues/new?${query}`;
}

export interface GhResult {
  /** Process exit status; `null` when the binary couldn't be spawned (missing). */
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Interpret a `gh issue create` result WITHOUT deciding the fallback URL (that
 * stays in the command, which holds the prefilled URL).
 *
 * Success (exit 0 with a parseable created-issue URL) → `{ issueUrl:<created>,
 * warnings: [] }`. ANY failure — non-zero status, a null status (gh missing),
 * or an exit-0 whose stdout carries no issue URL — → `{ issueUrl: null,
 * warnings: [<manual-route note>] }`. `issueUrl: null` is the signal for the
 * command to take the prefilled-URL branch; it never throws and never drops.
 */
export function interpretGhResult(r: GhResult): { issueUrl: string | null; warnings: string[] } {
  if (r.status === 0) {
    const url = parseIssueUrl(r.stdout);
    if (url) return { issueUrl: url, warnings: [] };
    return {
      issueUrl: null,
      warnings: [
        "gh reported success but printed no issue URL — nothing was lost; open the prefilled URL below to file it, or hand the --submit command to your lead.",
      ],
    };
  }
  return {
    issueUrl: null,
    warnings: [
      "couldn't file via gh (missing, unauthenticated, offline, or the API errored) — nothing was lost; open the prefilled URL below to file it, or hand the --submit command to your lead.",
    ],
  };
}

/** First `https://github.com/<owner>/<repo>/issues/<n>` URL in `stdout`, or null. */
function parseIssueUrl(stdout: string): string | null {
  const m = stdout.match(/https:\/\/github\.com\/[^\s]+\/issues\/\d+/);
  return m ? m[0] : null;
}

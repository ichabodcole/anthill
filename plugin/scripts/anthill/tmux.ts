/**
 * A thin, mostly-pure tmux helper — exactly the surface `anthill spawn` needs.
 *
 * The PURE arg-builders (return `string[]`, no I/O) are the unit-test target; the
 * async composers just shell those argv arrays out through `execTmux`, which
 * mirrors `execCoord` in coord.ts (never throws — a failing tmux resolves to
 * `ok: false` so callers can degrade instead of crashing).
 *
 * Deliberately small: no composer paste-buffer / boot-wait dance (that's for
 * messaging INTO Claude's TUI composer). We type a single shell line + Enter into
 * a fresh shell prompt and let `claude` boot with the prompt as an argv.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

/** Common Homebrew / system install locations, tried after `Bun.which`. */
const TMUX_FALLBACKS = ["/opt/homebrew/bin/tmux", "/usr/local/bin/tmux", "/usr/bin/tmux"];

/** Resolve the tmux binary: `which tmux` → known fallbacks → bare `tmux`. */
export function tmuxPath(): string {
  const found = Bun.which("tmux");
  if (found) return found;
  for (const candidate of TMUX_FALLBACKS) {
    if (existsSync(candidate)) return candidate;
  }
  return "tmux";
}

/** True if a real tmux binary resolves (used for a clean preflight failure). */
export function hasTmux(): boolean {
  if (Bun.which("tmux")) return true;
  return TMUX_FALLBACKS.some((candidate) => existsSync(candidate));
}

// ── Pure arg-builders (no I/O — the unit-test target) ───────────────────────

/** `new-session -d` (detached), printing the session name on stdout. */
export function newSessionArgs(name: string, cwd: string): string[] {
  return ["new-session", "-d", "-s", name, "-c", cwd, "-P", "-F", "#{session_name}"];
}

/** `split-window`, printing the NEW pane's id (`%N`) on stdout. */
export function splitWindowArgs(session: string, cwd: string): string[] {
  return ["split-window", "-t", session, "-c", cwd, "-P", "-F", "#{pane_id}"];
}

/** Re-tile the window so every pane is visible. */
export function tileArgs(session: string): string[] {
  return ["select-layout", "-t", session, "tiled"];
}

/**
 * Type a single shell line into `target` then send Enter. A shell prompt (unlike
 * Claude's composer) does NOT absorb Enter, so one send-keys with a trailing
 * `Enter` keystroke submits the line.
 */
export function sendLineArgs(target: string, line: string): string[] {
  return ["send-keys", "-t", target, line, "Enter"];
}

/**
 * Stamp the seat handle into a custom PANE user-option (`@seat`). Unlike the
 * native pane title (which a running TUI can overwrite via an OSC escape), a
 * user-option is untouched by the program running in the pane — so the border
 * label survives claude's redraws. Rendered by `paneBorderFormatArgs`.
 */
export function paneSeatArgs(paneId: string, label: string): string[] {
  return ["set-option", "-p", "-t", paneId, "@seat", label];
}

/** Enable the top pane-border line. */
export function paneBorderArgs(session: string): string[] {
  return ["set-option", "-t", session, "pane-border-status", "top"];
}

/** Render each pane's `@seat` user-option in its border (immune to TUI renames). */
export function paneBorderFormatArgs(session: string): string[] {
  return ["set-option", "-t", session, "pane-border-format", " #{@seat} "];
}

/** Kill an existing session (used by `--force` recreate). */
export function killSessionArgs(name: string): string[] {
  return ["kill-session", "-t", name];
}

/** `has-session` — exit 0 if the named session exists. */
export function hasSessionArgs(name: string): string[] {
  return ["has-session", "-t", name];
}

/** `attach` to a session (interactive; for a human TTY OUTSIDE tmux). */
export function attachArgs(name: string): string[] {
  return ["attach", "-t", name];
}

/** `switch-client` to a session (interactive; for a human ALREADY inside tmux — can't nest attach). */
export function switchClientArgs(name: string): string[] {
  return ["switch-client", "-t", name];
}

/** `list-sessions` printing one session name per line. */
export function listSessionsArgs(): string[] {
  return ["list-sessions", "-F", "#{session_name}"];
}

/** Dump a pane's visible buffer to stdout (verification / debugging). */
export function capturePaneArgs(target: string): string[] {
  return ["capture-pane", "-t", target, "-p"];
}

/** List a session's pane ids (`%N`), one per line, in pane-index order. */
export function listPanesArgs(session: string): string[] {
  return ["list-panes", "-t", session, "-F", "#{pane_id}"];
}

/** Keep alnum / `-` / `_`; map every other code point to a single `-`. */
export function sanitizeSessionName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/gu, "-");
}

// ── Exec + async composers ──────────────────────────────────────────────────

export interface ExecResult {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Thin `spawn(tmuxPath(), args)` wrapper. Same shape/contract as `execCoord`:
 * never throws — a spawn error or non-zero exit resolves to `ok: false`.
 */
export function execTmux(args: string[]): Promise<ExecResult> {
  return new Promise((resolveP) => {
    const child = spawn(tmuxPath(), args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      resolveP({ ok: false, exitCode: 1, stdout, stderr: err.message });
    });
    child.on("close", (code) => {
      resolveP({ ok: (code ?? 1) === 0, exitCode: code ?? 1, stdout, stderr });
    });
  });
}

/** Promise-based sleep — lets a fresh layout settle before listing panes. */
function settle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** True if a session with this name already exists. */
export async function sessionExists(name: string): Promise<boolean> {
  return (await execTmux(hasSessionArgs(name))).ok;
}

/**
 * Names of all running tmux sessions. Empty (never throws) when tmux is missing
 * or has no server — `execTmux` degrades to `ok: false`, which we read as "none".
 */
export async function listSessions(): Promise<string[]> {
  const res = await execTmux(listSessionsArgs());
  if (!res.ok) return [];
  return res.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Create the detached session (first seat lives in the initial pane) and enable
 * the title border. Returns the `new-session` result (stdout = session name).
 */
export async function createSession(name: string, cwd: string): Promise<ExecResult> {
  const res = await execTmux(newSessionArgs(name, cwd));
  if (res.ok) {
    await execTmux(paneBorderArgs(name));
    await execTmux(paneBorderFormatArgs(name));
  }
  return res;
}

/**
 * Split off a new pane, re-tile, then settle ~500ms so the layout stabilizes
 * before the caller lists panes. Returns the split result (stdout = pane id).
 */
export async function splitAndTile(session: string, cwd: string): Promise<ExecResult> {
  const res = await execTmux(splitWindowArgs(session, cwd));
  await execTmux(tileArgs(session));
  await settle(500);
  return res;
}

/** List the session's pane ids (`%N`) in index order. */
export async function listPanes(session: string): Promise<string[]> {
  const res = await execTmux(listPanesArgs(session));
  return res.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Stamp a pane's `@seat` user-option with the seat handle (shown on its border). */
export function labelPane(paneId: string, label: string): Promise<ExecResult> {
  return execTmux(paneSeatArgs(paneId, label));
}

/** Type a shell command into a pane and submit it. */
export function launchInPane(target: string, command: string): Promise<ExecResult> {
  return execTmux(sendLineArgs(target, command));
}

/** Kill a session. */
export function killSession(name: string): Promise<ExecResult> {
  return execTmux(killSessionArgs(name));
}

/** Capture a pane's visible buffer. */
export function capturePane(target: string): Promise<ExecResult> {
  return execTmux(capturePaneArgs(target));
}

/**
 * Shared helpers for the `anthill` team command facade.
 *
 * The facade is a thin, agent-aware wrapper over the spellbook `grapevine` +
 * `bounty` CLIs (via coord.ts) and the `.anthill/config.json` config layer (config.ts).
 * Everything that was hardcoded in flute's team-support.ts — the channel, the
 * roster, the default spawn set — is config-driven now.
 */

import { emitError, type OutputFormat } from "../agent-layer.ts";
import { ConfigError, loadConfig, type ResolvedConfig } from "../config.ts";
import { execCoord, firstErrorLine, parseJsonLine, resolveCoordCli } from "../coord.ts";

/**
 * Load the resolved `.anthill/config.json` for a team command, or emit a clear
 * error and exit(1). Centralizes the "no config yet" failure so every command
 * fails the same way (pointing at `anthill:bootstrap`).
 */
export function requireConfig(format: OutputFormat, command: string): ResolvedConfig {
  try {
    return loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      emitError({ format, command, error: err.message });
      process.exit(1);
    }
    throw err;
  }
}

export interface BoardCounts {
  todo: number;
  doing: number;
  review: number;
  done: number;
}

/** The shape `bounty state` returns (the bits we read): a title + the task list. */
interface BoardState {
  state?: { title?: string; tasks?: Array<{ status?: string }> };
}

export interface BoardSummary {
  counts: BoardCounts;
  /** The board's title — surfaced so an AMBIENT board (a stranger's, read off the
   * bounty daemon's global "latest" pointer) is self-evidently labeled, not passed
   * off as this team's. */
  title: string | undefined;
}

/**
 * PURE: tally a parsed `bounty state` payload into column counts + the board title.
 * Returns null when the payload carries no task list (board not readable).
 */
export function summarizeBoard(parsed: BoardState | null): BoardSummary | null {
  const tasks = parsed?.state?.tasks;
  if (!tasks) return null;
  const counts: BoardCounts = { todo: 0, doing: 0, review: 0, done: 0 };
  for (const task of tasks) {
    if (task.status && task.status in counts) {
      counts[task.status as keyof BoardCounts] += 1;
    }
  }
  return { counts, title: parsed?.state?.title };
}

/**
 * Read the bounty board's column counts + title. Returns `board: null` (never
 * throws) when the board isn't running / can't be read; the warning text is
 * returned alongside so callers can surface it in `data.warnings`.
 *
 * NOTE: `bounty state` (no `--session`) resolves the board AMBIENTLY. Once
 * `anthill convene` has opened the board keyed + pinned (`--session-key <channel>
 * --pin`), `.bounty-session` at the repo root binds this call to THIS team's board
 * via walk-up — not the daemon's global "latest" (a stranger's). See seams.md, the
 * board-binding contract (owner: forager). We still return the `title` so an
 * unexpectedly-ambient read (convene never ran) is self-evidently labeled.
 */
export async function readBoardCounts(): Promise<{
  board: BoardCounts | null;
  title?: string;
  warning?: string;
}> {
  try {
    const bountyCli = resolveCoordCli("bounty");
    const state = await execCoord(bountyCli, ["state"]);
    const summary = state.ok ? summarizeBoard(parseJsonLine<BoardState>(state.stdout)) : null;
    if (!summary) {
      return { board: null, warning: "bounty board not running (open one via the bounty skill)" };
    }
    return { board: summary.counts, title: summary.title };
  } catch (err) {
    return { board: null, warning: `bounty CLI unresolved: ${(err as Error).message}` };
  }
}

/**
 * Who is on the channel, as THREE distinguishable states rather than a list that
 * is empty for two unrelated reasons.
 *
 * This mirrors `positionState` in `comms.ts` deliberately (seams.md Contract
 * 6(c)): `never-followed` is not a rounded-down zero, and `unknown` is not an
 * empty channel. Both are the same rule — a tool may not report an absence it
 * did not observe.
 */
export type SeatPresence =
  | { state: "unknown"; reason: string }
  | { state: "none" }
  | { state: "present"; seats: string[] };

/**
 * PURE classifier (the unit-test target) over what grapevine's `who` returned.
 *
 * Every branch that is not a positively-observed subscriber list is `unknown`.
 * The one that reads like an answer and is not: `daemon: false` arrives with
 * `ok: true` and parses cleanly — the call succeeded and told us the wire is
 * down. That is the least information available about who is present, not the
 * most.
 */
export function classifyPresence(
  result: { ok: boolean; stderrLine?: string },
  parsed: { daemon?: boolean; subscribers?: string[] } | null,
): SeatPresence {
  if (!result.ok) {
    return { state: "unknown", reason: result.stderrLine || "grapevine 'who' failed" };
  }
  if (!parsed) return { state: "unknown", reason: "grapevine 'who' returned no parseable JSON" };
  if (parsed.daemon === false) {
    return { state: "unknown", reason: "grapevine daemon not running — no presence available" };
  }
  // Absent is not empty. A payload with no `subscribers` key is a shape we did
  // not expect, and guessing "empty" is the fail-open direction.
  if (!parsed.subscribers) {
    return { state: "unknown", reason: "grapevine 'who' returned no subscribers field" };
  }
  // Dedupe by handle — a seat with >1 live connection (vine tail + board tail)
  // otherwise shows up twice. Presence is "who's here", not sockets.
  const seats = [...new Set(parsed.subscribers)].sort();
  return seats.length === 0 ? { state: "none" } : { state: "present", seats };
}

/**
 * Seat presence on the grapevine channel. NEVER throws — but a failure now
 * reports `unknown` rather than an empty list.
 *
 * The previous contract was "any failure returns `[]` so a broken vine can never
 * wedge a teardown." That traded a wedged teardown for a silent one: the only
 * consumer is `down`'s guard, which read `[]` as "the team has stood down" and
 * killed the panes. `--force` is where "tear down anyway" belongs — a human
 * saying so, not a guard guessing on our behalf.
 */
export async function seatPresence(channel: string): Promise<SeatPresence> {
  try {
    const grapevineCli = resolveCoordCli("grapevine");
    const who = await execCoord(grapevineCli, ["who", channel]);
    return classifyPresence(
      { ok: who.ok, stderrLine: firstErrorLine(who.stderr, "could not read channel") },
      parseJsonLine<{ daemon?: boolean; subscribers?: string[] }>(who.stdout),
    );
  } catch (err) {
    return { state: "unknown", reason: `grapevine CLI unresolved: ${(err as Error).message}` };
  }
}

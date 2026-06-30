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
import { execCoord, parseJsonLine, resolveCoordCli } from "../coord.ts";

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
 * NOTE: `bounty state` (no `--session`) reads the daemon's global "latest" board,
 * which may belong to ANOTHER project. We can't yet scope to this team's own board
 * (anthill persists no board id — that lands with the `.anthill/` footprint work);
 * until then we return the `title` so callers can label which board this is.
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
 * Deduped, sorted list of seats currently on the grapevine channel. NEVER throws
 * — any failure (CLI unresolved, dead daemon, parse miss) returns `[]` so a
 * broken vine can never wedge a teardown or other presence guard.
 */
export async function presentSeats(channel: string): Promise<string[]> {
  try {
    const grapevineCli = resolveCoordCli("grapevine");
    const who = await execCoord(grapevineCli, ["who", channel]);
    if (!who.ok) return [];
    const parsed = parseJsonLine<{ subscribers?: string[] }>(who.stdout);
    if (!parsed) return [];
    return [...new Set(parsed.subscribers ?? [])].sort();
  } catch {
    return [];
  }
}

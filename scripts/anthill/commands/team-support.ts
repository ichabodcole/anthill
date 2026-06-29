/**
 * Shared helpers for the `anthill` team command facade.
 *
 * The facade is a thin, agent-aware wrapper over the spellbook `grapevine` +
 * `bounty` CLIs (via coord.ts) and the `.team/config.json` config layer (config.ts).
 * Everything that was hardcoded in flute's team-support.ts — the channel, the
 * roster, the default spawn set — is config-driven now.
 */

import { emitError, type OutputFormat } from "../agent-layer.ts";
import { ConfigError, loadConfig, type ResolvedConfig } from "../config.ts";
import { execCoord, parseJsonLine, resolveCoordCli } from "../coord.ts";

/**
 * Load the resolved `.team/config.json` for a team command, or emit a clear
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

/**
 * Read the bounty board's column counts. Returns null (never throws) when the
 * board isn't running / can't be read; the warning text is returned alongside so
 * callers can surface it in `data.warnings`.
 */
export async function readBoardCounts(): Promise<{ board: BoardCounts | null; warning?: string }> {
  try {
    const bountyCli = resolveCoordCli("bounty");
    const state = await execCoord(bountyCli, ["state"]);
    const parsed = parseJsonLine<{ state?: { tasks?: Array<{ status?: string }> } }>(state.stdout);
    if (!state.ok || !parsed?.state?.tasks) {
      return { board: null, warning: "bounty board not running (open one via the bounty skill)" };
    }
    const board: BoardCounts = { todo: 0, doing: 0, review: 0, done: 0 };
    for (const task of parsed.state.tasks) {
      if (task.status && task.status in board) {
        board[task.status as keyof BoardCounts] += 1;
      }
    }
    return { board };
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

/**
 * Shared helpers for the `anthill` team command facade.
 *
 * The facade is a thin, agent-aware wrapper over the spellbook `grapevine` +
 * `bounty` CLIs (via coord.ts) and the `.anthill/config.json` config layer (config.ts).
 * Everything that was hardcoded in flute's team-support.ts — the channel, the
 * roster, the default spawn set — is config-driven now.
 */

import { emitError, type OutputFormat } from "../agent-layer.ts";
import { readPosition } from "../comms.ts";
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
 * PURE: presence as seen from the COMMS wire, from the same rows
 * `comms positions` reports.
 *
 * Why this exists: presence was single-wire on a multi-wire team. `seatPresence`
 * read grapevine's `who` and nothing else, so on a session where comms is the
 * only armed wire it returned a confident `none` — **measured live, with five
 * seats working** — and `shouldBlockTeardown` correctly let a pane-killing
 * command through. The guard was not wrong; it was answering honestly about a
 * wire nobody was on.
 *
 * `followerAlive` is ADVISORY under seams.md Contract 6(f) — pids are reused, so
 * it narrows a question and never answers one. **It is used here in one
 * direction only: to say PRESENT, never to say absent.** That is legitimate
 * precisely because the costs are asymmetric — a false "present" costs one
 * `--force`, and a false "absent" kills a seat mid-build. An advisory signal may
 * push toward the recoverable failure and must never push toward the other.
 *
 * `null` means NOT CHECKED and must not be read as checked-and-dead (6(f)
 * again), so it yields `unknown` rather than contributing to an absence.
 */
export function commsPresence(
  rows: { handle: string; hasRecord: boolean; followerAlive: boolean | null }[],
): SeatPresence {
  const live = rows.filter((r) => r.followerAlive === true).map((r) => r.handle);
  if (live.length > 0) return { state: "present", seats: [...new Set(live)].sort() };
  // A record we could not check is not evidence of absence.
  //
  // Keyed on `hasRecord`, NOT on a lag state. It was briefly keyed on
  // `state !== "never-followed"`, and the F1 fix — which reclassifies an
  // incoherent record as `never-followed` — silently turned every unchecked
  // follower into an ABSENCE, i.e. a fail-open regression on the pane-killing
  // command, introduced one commit after the guard itself. Presence asks "is
  // there a follower and is it alive"; it must never be derived from a value
  // that means something about LAG.
  const unchecked = rows.filter((r) => r.hasRecord && r.followerAlive === null);
  if (unchecked.length > 0) {
    return {
      state: "unknown",
      reason: `${unchecked.length} comms follower(s) could not be checked (liveness unknown, not dead)`,
    };
  }
  return { state: "none" };
}

/**
 * PURE: combine presence across the wires into ONE verdict, fail-closed.
 *
 * The lattice, and every rule is the same rule: **`none` requires a positive
 * observation of absence on EVERY wire consulted.**
 *
 *   - either wire `present`  → present (union of seats)
 *   - either wire `unknown`  → unknown
 *   - both `none`            → none
 *
 * A team that runs one wire and not the other is the normal case, not an edge
 * case: this session armed comms alone and deliberately left the vine
 * unsubscribed. So a verdict derived from one wire is a verdict about that wire,
 * and the bug was reporting it as a verdict about the team.
 */
export function combinePresence(a: SeatPresence, b: SeatPresence): SeatPresence {
  const seats = [
    ...(a.state === "present" ? a.seats : []),
    ...(b.state === "present" ? b.seats : []),
  ];
  if (seats.length > 0) return { state: "present", seats: [...new Set(seats)].sort() };
  const unknowns = [a, b].filter(
    (p): p is { state: "unknown"; reason: string } => p.state === "unknown",
  );
  if (unknowns.length > 0) {
    return { state: "unknown", reason: unknowns.map((u) => u.reason).join(" · ") };
  }
  return { state: "none" };
}

/**
 * Advisory pid liveness — `process.kill(pid, 0)`. ESRCH means gone; **EPERM
 * means it EXISTS** but we may not signal it, so that branch is alive rather
 * than unknown. Anything else we decline to guess about.
 */
function pidAlive(pid: number): boolean | null {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    return code === "ESRCH" ? false : code === "EPERM" ? true : null;
  }
}

/** Read the comms wire's view of who is here. Any failure is `unknown`, never absence. */
function commsPresenceFor(config: ResolvedConfig, channel: string): SeatPresence {
  try {
    // Deliberately NOT via `buildPositionsReport`: that report is about LAG, and
    // borrowing it meant inventing a `head` to satisfy a parameter presence does
    // not care about. The invented value then changed the lag classification and
    // broke this guard. Presence reads the two things it actually needs.
    return commsPresence(
      config.seats.map((s) => {
        const position = readPosition(config.teamDirPath(), channel, s.handle);
        return {
          handle: s.handle,
          hasRecord: position !== null,
          followerAlive: position ? pidAlive(position.pid) : null,
        };
      }),
    );
  } catch (err) {
    return { state: "unknown", reason: `comms positions unreadable: ${(err as Error).message}` };
  }
}

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
export interface TeamPresence {
  presence: SeatPresence;
  /** Humans watching the VINE. Not part of the presence verdict — they are
   * observers, not seats — but read from the same payload, which is why this
   * rides along rather than costing a second call. */
  humans: string[];
}

export async function seatPresence(
  channel: string,
  config?: ResolvedConfig,
): Promise<TeamPresence> {
  let vine: SeatPresence;
  let humans: string[] = [];
  try {
    const grapevineCli = resolveCoordCli("grapevine");
    const who = await execCoord(grapevineCli, ["who", channel]);
    const parsed = parseJsonLine<{
      daemon?: boolean;
      subscribers?: string[];
      humans?: string[];
    }>(who.stdout);
    vine = classifyPresence(
      { ok: who.ok, stderrLine: firstErrorLine(who.stderr, "could not read channel") },
      parsed,
    );
    humans = [...new Set(parsed?.humans ?? [])].sort();
  } catch (err) {
    vine = { state: "unknown", reason: `grapevine CLI unresolved: ${(err as Error).message}` };
  }
  // With no config we cannot reach the comms wire at all — and saying so is the
  // point. Returning the vine's verdict alone here would be the original bug
  // with an extra step: a one-wire answer presented as a team-wide one.
  if (!config) {
    return {
      presence:
        vine.state === "none"
          ? {
              state: "unknown",
              reason: "comms wire not consulted (no config) — vine alone reported nobody",
            }
          : vine,
      humans,
    };
  }
  return { presence: combinePresence(vine, commsPresenceFor(config, channel)), humans };
}

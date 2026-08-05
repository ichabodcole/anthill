/**
 * Shared helpers for the `anthill` team command facade.
 *
 * The facade is a thin, agent-aware wrapper over the spellbook `grapevine` +
 * `bounty` CLIs (via coord.ts) and the `.anthill/config.json` config layer (config.ts).
 * Everything that was hardcoded in flute's team-support.ts — the channel, the
 * roster, the default spawn set — is config-driven now.
 */

import { emitError, type OutputFormat } from "../agent-layer.ts";
import { hasDeparted, readPosition, readSessionOpen } from "../comms.ts";
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
 *
 * **`false` yields `unknown` TOO, and that is the F1 ruling** — the sentence
 * above used to be a promise the code broke. `followerAlive === false` was
 * neither `live` nor `unchecked`, so it fell through to `none`, and `none` is
 * the only state `shouldBlockTeardown` permits teardown on. The docstring said
 * PRESENT-never-absent while the code did the opposite, on the pane-killing
 * command. The reason it is a ruling and not a coin-flip:
 *
 *   **`down` kills PANES. `followerAlive` observes FOLLOW PROCESSES. A follow
 *   process is not a pane.**
 *
 * A seat whose `comms follow` died is the single most common failure this team
 * hits; the agent keeps working in its pane, and its scratch is gitignored and
 * exists nowhere else. Contract 6(f) already fixes what a dead pid means — that
 * `emittedThrough` is a HIGH-WATER MARK, not that the seat is gone — so deriving
 * an absence from it contradicts the contract this file's own comments cite.
 * `pidAlive` is ESRCH-only and pids are reused, so a **restarted** follower with
 * a new pid reads identically to a dead one; an instrument that cannot separate
 * those two may not be the one that authorises a teardown.
 *
 * **`none` NO LONGER MEANS "no records".** It used to, and that was an ABSENCE
 * OF DATA authorising a destructive act: a freshly-convened team has an empty
 * positions directory (`recordPosition` only fires once a follower has emitted,
 * `team-comms.ts`), so the guard permitted teardown during exactly the window
 * when seats were spawning. sentinel reproduced the kill — `tornDown: true` on a
 * session with a pane doing work, no `--force`, no warning.
 *
 * So `none` now requires a POSITIVE observation of departure:
 *
 *   **none  ⟺  spawned ≠ ∅  ∧  every spawned seat has a departure record**
 *
 * The non-emptiness conjunct is not decoration — it is the whole safety
 * property. `∀ s ∈ ∅` is vacuously TRUE, so without it a fresh session (no
 * open record ⇒ no spawned set) satisfies the rule and authorises the very kill
 * this exists to prevent. That defect was caught in review before it was built.
 *
 * And `none` stays REACHABLE — by the normal clean ending rather than by an
 * empty directory — which is what stops the guard degrading into "always block",
 * the state that trains people to pass `--force` reflexively and thereby removes
 * the guard for real. Both failure directions are real and an answer that avoids
 * only one is not an answer.
 */
export interface CommsPresenceReport {
  presence: SeatPresence;
  /**
   * TOTAL — present on every branch, per seams.md Contract 5(a), so `0` reads as
   * an observation rather than as an unpopulated field.
   *
   * **`null` and `0` are different facts and must never be fused.** `null` = no
   * session-open record EXISTS; `0` = a record exists and names no seats. That is
   * Contract 6(c)'s *`null` is not a rounded-down zero*, one layer out.
   *
   * **What this field does and does NOT protect — the distinction cost a peer a
   * vacuous test, so it is stated precisely rather than reassuringly.**
   *
   * It reports the ARGUMENT, computed once before any branch is chosen. So it
   * distinguishes the two INPUTS (`null` vs `0`) and **survives a fusion of the
   * two branches unchanged** — fuse `no-open-record` into `empty-open-record`
   * and this still reads `[null, 0]` exactly as before. **It therefore cannot
   * detect the collapse it looks like it guards.**
   *
   * **`because` is what makes the split observable**, because it is stamped by
   * the branch that fired. Assert the pair there, not here. Measured: a mutation
   * fusing the branches fails the `because` pair and **no** count assertion.
   */
  spawnedCount: number | null;
  /** TOTAL — seats with a positively-observed departure record. */
  departedCount: number;
  /**
   * TOTAL — WHICH BRANCH decided this verdict, stamped by that branch.
   *
   * **This exists because the verdict alone cannot discriminate the branches.**
   * `no-open-record` and `empty-open-record` both resolve to `unknown` by
   * design, so no assertion over `state` — and none over a count DERIVED FROM
   * THE INPUT — can tell them apart. Measured: a count computed once from the
   * argument reports `[null, 0]` both before and after the two branches are
   * fused, so it passes against the exact mutation it was proposed to catch.
   * Only a value stamped BY the branch that fired distinguishes them.
   *
   * Deliberately an enum and NOT the `reason` prose: a reason string is
   * ungated and rename-fragile, so keying a test on it breaks the day someone
   * improves the wording. This is the same choice as `staleRecord` in Contract
   * 6(c-bis) — carry the diagnostic as a total field rather than growing the
   * state set, so no consumer switching on `state` meets a case it has no
   * policy for.
   */
  because:
    | "live-follower"
    | "unexplained-follower"
    | "no-open-record"
    | "empty-open-record"
    | "outstanding-departures"
    | "all-spawned-departed";
}

export function commsPresence(
  rows: {
    handle: string;
    hasRecord: boolean;
    followerAlive: boolean | null;
    /** TOTAL — a departure record was positively observed for this seat. */
    departed: boolean;
  }[],
  /** `null` = no session-open record exists. `[]` = one exists naming nobody. */
  spawned: string[] | null,
): CommsPresenceReport {
  const spawnedCount = spawned === null ? null : spawned.length;
  const departedCount = rows.filter((r) => r.departed).length;
  const report = (
    presence: SeatPresence,
    because: CommsPresenceReport["because"],
  ): CommsPresenceReport => ({ presence, spawnedCount, departedCount, because });

  const live = rows.filter((r) => r.followerAlive === true).map((r) => r.handle);
  if (live.length > 0)
    return report({ state: "present", seats: [...new Set(live)].sort() }, "live-follower");

  // An UNEXPLAINED non-live follower. `&& !r.departed` is the qualifier that
  // makes `none` reachable at all: this branch exists to demand an EXPLANATION
  // for a follower that is not confirmed alive, and a departure record IS that
  // explanation — the seat said it left, so its dead follower is expected rather
  // than mysterious. Without the qualifier this fired before departure was ever
  // consulted, so any session in which anyone spoke ended in `unknown` and every
  // teardown needed `--force`. A CRASHED seat (record, dead pid, no departure)
  // is still unexplained and still blocks, which is the case this protects.
  //
  // Keyed on `hasRecord`, NOT on a lag state (6(f)): a dead pid means
  // `emittedThrough` is a high-water mark, not that the seat is gone. `down`
  // kills PANES; `followerAlive` observes FOLLOW PROCESSES; a follow process is
  // not a pane.
  const dead = rows.filter((r) => r.hasRecord && r.followerAlive === false && !r.departed);
  const unchecked = rows.filter((r) => r.hasRecord && r.followerAlive === null && !r.departed);
  if (dead.length + unchecked.length > 0) {
    const why = [
      dead.length > 0 &&
        `${dead.length} follower process(es) not running with no departure record — the SEAT may still be working (6(f): a dead pid means the position is a high-water mark, not that the seat is gone)`,
      unchecked.length > 0 &&
        `${unchecked.length} comms follower(s) could not be checked (liveness unknown, not dead)`,
    ].filter((s): s is string => typeof s === "string");
    return report({ state: "unknown", reason: why.join(" · ") }, "unexplained-follower");
  }

  // No session-open record: we cannot know who SHOULD be here, so we cannot
  // establish that everyone left. Distinct from the empty-record case below —
  // same verdict, different knowledge, and the counts carry the difference.
  if (spawned === null) {
    return report(
      {
        state: "unknown",
        reason:
          "no session-open record — cannot establish which seats were spawned, so departure cannot be confirmed",
      },
      "no-open-record",
    );
  }
  if (spawned.length === 0) {
    return report(
      {
        state: "unknown",
        reason: "session-open record names no seats — no departure can be confirmed against it",
      },
      "empty-open-record",
    );
  }

  const departed = new Set(rows.filter((r) => r.departed).map((r) => r.handle));
  const outstanding = spawned.filter((h) => !departed.has(h));
  if (outstanding.length === 0) return report({ state: "none" }, "all-spawned-departed");

  return report(
    {
      state: "unknown",
      reason: `${outstanding.length} spawned seat(s) have not departed (${outstanding.sort().join(", ")})`,
    },
    "outstanding-departures",
  );
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
    const teamDir = config.teamDirPath();
    // `null` (no record) and `[]` (a record naming nobody) are different facts
    // and are carried through as such — see `CommsPresenceReport.because`.
    const session = readSessionOpen(teamDir, channel);
    // Deliberately NOT via `buildPositionsReport`: that report is about LAG, and
    // borrowing it meant inventing a `head` to satisfy a parameter presence does
    // not care about. The invented value then changed the lag classification and
    // broke this guard. Presence reads the two things it actually needs.
    return commsPresence(
      config.seats.map((s) => {
        const position = readPosition(teamDir, channel, s.handle);
        return {
          handle: s.handle,
          hasRecord: position !== null,
          followerAlive: position ? pidAlive(position.pid) : null,
          departed: hasDeparted(teamDir, channel, s.handle),
        };
      }),
      session === null ? null : session.spawned,
    ).presence;
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

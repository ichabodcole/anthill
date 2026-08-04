/**
 * team-comms: the seat-aware message layer.
 *
 * Identity here is a SEAT, read from `.anthill/config.json` — not a free-form
 * alias. That is the one thing this layer has that a general agent-to-agent
 * channel structurally cannot, and every later idea depends on it.
 *
 * `resolveSeatIdentity` is PURE (a roster array in, a verdict out) so the whole
 * contract can be asserted without a filesystem. The fs walk lives in the
 * command, which hands the roster — or `null` when there is no config — in here.
 *
 * The contract lives ONCE in `.anthill/dev/seams.md` Contract 4; this module is
 * where it is true in code. Two properties of it are easy to erode and are
 * pinned by `comms.test.ts` rather than trusted to this comment:
 *
 *   * The outcome is stated on EVERY path, SUCCESS INCLUDED. A send that read
 *     the roster and a send that merely echoed the caller's string would
 *     otherwise be indistinguishable from outside the process — which would make
 *     the seat-identity wedge unverifiable and the spike's own open question
 *     ("does seat-awareness change anything on day one?") unanswerable.
 *   * There is NO free-form-alias fallback. A handle that isn't in the roster is
 *     an error, and an omitted handle is an error; neither degrades to an
 *     ambient identity. A silent fallback would let a whole session run under an
 *     identity the roster never granted.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SeatConfig } from "./config.ts";

/** Where a channel's log lives, relative to the team dir. */
export const COMMS_DIR = "comms";

/**
 * Channel names are charset-guarded because they arrive from `config.channel`
 * AND from `--channel`, and are then joined into a filesystem path. Same
 * reasoning as Contract 3's `SAFE_SESSION_KEY`: guard the value where it enters,
 * so a bad one fails clean instead of writing the log somewhere unintended.
 */
export const SAFE_CHANNEL = /^[A-Za-z0-9._-]+$/;

/** One message in a channel's append-only log. */
export interface CommsMessage {
  id: number;
  channel: string;
  from: string;
  /** The seat's role at send time — the roster-derived half of seat identity. */
  role: string;
  text: string;
  ts: number;
  /**
   * How far the SENDER had been emitted when it wrote this — artifact tier, and
   * the only field here that describes the sender's state rather than the
   * message's.
   *
   * Optional because the log is append-only and never rewritten: every record
   * written before this field existed lacks it, and `undefined` here means
   * "written by an older binary", NOT "the sender had seen nothing". Those must
   * not be conflated — the same never-followed-vs-zero distinction the
   * follow-start notice already carries.
   *
   * It makes a crossing diagnosable from the log ALONE, after the fact, with no
   * live process involved — which is the property a `meta` field could never
   * have had, since `meta` is never stored.
   */
  emittedThrough?: number;
}

/** The three distinguishable ways identity resolution can end. */
export type IdentityOutcome = "resolved-from-roster" | "not-a-seat" | "no-config";

export interface ResolvedIdentity {
  outcome: "resolved-from-roster";
  handle: string;
  /** Carried from the roster — proof the roster was READ, not echoed. */
  role: string;
  scope: string;
}

export interface UnresolvedIdentity {
  outcome: "not-a-seat" | "no-config";
  /** Always actionable: says what is wrong AND what to do about it. A bare
   * non-zero exit is indistinguishable from a broken tool (anthill#54). */
  error: string;
}

export type IdentityResult = ResolvedIdentity | UnresolvedIdentity;

export interface IdentityInput {
  /** The roster, or `null` when no `.anthill/config.json` was found. */
  roster: SeatConfig[] | null;
  /** The `--as` value. `undefined` / `""` is an error, never an ambient default. */
  handle: string | undefined;
  /**
   * The locator the config layer itself produced, passed through verbatim.
   *
   * Deliberately NOT an absolute config path. `findConfigFile` walks UP, so it
   * checks many places and no single path is the truth — reconstructing one
   * ("<cwd>/.anthill/config.json") names a location the search never singled
   * out, which is a fabrication that reads as precision. Its own message
   * ("could not find X in <startDir> or any parent") is the honest form, and
   * threading it through is strictly less work than rebuilding a worse one.
   */
  configSearch?: string;
}

export function resolveSeatIdentity(input: IdentityInput): IdentityResult {
  // No-config is checked FIRST and deliberately: with no roster to check
  // against, reporting "not a seat" would be a claim this code is not entitled
  // to make. Absent evidence is not evidence of absence.
  if (input.roster === null) {
    const where = input.configSearch ? ` ${input.configSearch}` : "";
    return {
      outcome: "no-config",
      error:
        "no team config found — comms identity is a seat, not a free-form alias, " +
        `and seats come from the roster.${where}`,
    };
  }

  const handles = input.roster.map((s) => s.handle);
  const valid = handles.join(", ") || "(none in config)";

  if (input.handle === undefined || input.handle.trim() === "") {
    return {
      outcome: "not-a-seat",
      error: `--as <handle> is required — identity is never inferred. Valid seats: ${valid}`,
    };
  }

  const seat = input.roster.find((s) => s.handle === input.handle);
  if (!seat) {
    return {
      outcome: "not-a-seat",
      error: `unknown seat "${input.handle}". Valid seats: ${valid}`,
    };
  }

  return {
    outcome: "resolved-from-roster",
    handle: seat.handle,
    role: seat.role,
    scope: seat.scope,
  };
}

/**
 * The incantation a seat runs to follow its team's channel — fully resolved,
 * per-seat, composed HERE and rendered verbatim by the consumer.
 *
 * Two properties are contract, not style (Contract 4(a), and F3 from sentinel's
 * cold-read):
 *   * The handle and channel are already interpolated. A template reaching the
 *     consumer is the seam violation — the consumer must never compose.
 *   * It carries NO grep filter, because `follow` emits no keepalives. The
 *     filters on the older wires exist only to strip keepalives, and both of
 *     their silent-failure modes (basic `grep` treating `(a|b)` as a literal;
 *     block buffering withholding frames) are downstream of needing a filter at
 *     all. No keepalives, no filter, no filter bugs.
 */
export function buildCommsIncantation(i: {
  cliPath: string;
  channel: string;
  handle: string;
}): string {
  return `bun ${i.cliPath} comms follow ${i.channel} --as ${i.handle}`;
}

// ---------------------------------------------------------------------------
// The log. NDJSON, append-only: one message per line, never rewritten.
// ---------------------------------------------------------------------------

export function commsLogPath(teamDir: string, channel: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(
      `unsafe channel name "${channel}" — must match ${String(SAFE_CHANNEL)} ` +
        "(it becomes a filename)",
    );
  }
  return resolve(teamDir, COMMS_DIR, `${channel}.ndjson`);
}

/**
 * One message → one line. `JSON.stringify` is what makes a multi-line body safe:
 * it escapes the newlines, so a message with paragraphs cannot corrupt the
 * framing of every message after it.
 */
export function encodeMessage(message: CommsMessage): string {
  return JSON.stringify(message);
}

export interface ParsedLog {
  messages: CommsMessage[];
  /** Damaged lines, reported rather than thrown — a torn write at the tail of
   * the log must not make the whole channel unreadable. */
  warnings: string[];
}

export function parseLog(text: string): ParsedLog {
  const messages: CommsMessage[] = [];
  const warnings: string[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    try {
      messages.push(JSON.parse(line) as CommsMessage);
    } catch {
      warnings.push(`skipped unreadable log line ${i + 1}`);
    }
  }
  return { messages, warnings };
}

/**
 * Next id = highest existing + 1, NOT count + 1. A hand-deleted or lost line
 * would otherwise cause an id to be reused, and `read <id>` — the one operation
 * that fetches exactly one message — would then resolve two different messages.
 */
export function nextMessageId(existing: CommsMessage[]): number {
  let max = 0;
  for (const m of existing) if (m.id > max) max = m.id;
  return max + 1;
}

// ---------------------------------------------------------------------------
// Per-seat position — the slice-two primitive.
//
// THE SEAM, and it is the whole reason this is not called `deliveredThrough`:
// the tool can only observe what it EMITTED — a write to its own stdout. What
// arrived at the agent is downstream of a pipe buffer, the harness, and its
// batching, none of which this process can see. `emittedThrough` is an
// artifact; what a seat has READ stays testimony and stays hand-written.
// Ruled on comms #151. Contract 4 in `.anthill/dev/seams.md` owns the wording.
//
// Only `follow` records. `read` deliberately records NOTHING: it is
// identity-free by Contract 4(c-bis), so it has no seat to attribute a position
// to, and inventing one would be the ambient-identity fallback that contract
// forbids. The cost is real and accepted — a seat that only ever reads has no
// position at all, which is why "never followed" is its own state below and not
// a null.
// ---------------------------------------------------------------------------

/** Where one seat's position lives. Per-seat FILE, deliberately: each follower
 * writes only its own, so concurrent followers never contend and this needs no
 * lock at all. A single shared positions file would reintroduce the
 * read-compute-write race that duplicate message ids already cost us. */
export function commsPositionPath(teamDir: string, channel: string, handle: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(`unsafe channel name "${channel}" — it becomes a filename`);
  }
  // The handle becomes a filename too. It arrives from the roster rather than
  // from argv, but "it came from config" is not a charset guarantee, and a
  // handle of `../../x` would escape the comms dir entirely.
  if (!SAFE_CHANNEL.test(handle)) {
    throw new Error(`unsafe seat handle "${handle}" — it becomes a filename`);
  }
  return resolve(teamDir, COMMS_DIR, `${channel}.positions`, `${handle}.json`);
}

export interface SeatPosition {
  handle: string;
  channel: string;
  /** Highest message id this seat's `follow` has WRITTEN TO STDOUT. Not read. */
  emittedThrough: number;
  /** Epoch ms — `Date.now()`, NEVER `nowMillis()`. `nowMillis()` is ms since
   * PROCESS START, and `lock.ts` shipped a stale-steal that never once fired
   * because it compared exactly those two clocks. A timestamp that will be
   * compared against anything outside this process must be epoch. */
  at: number;
  /** The recording follower's pid, so a stale position can be told apart from a
   * live one that is merely idle. Advisory: pids are reused, so this narrows a
   * question rather than answering it. */
  pid: number;
}

export type PositionState =
  | { state: "never-followed" }
  | { state: "current"; emittedThrough: number }
  | { state: "behind"; emittedThrough: number; behindBy: number };

/**
 * Where a seat stands, as THREE distinguishable states rather than one nullable
 * number.
 *
 * Measured as lag against the log head, NOT as wall-clock freshness of `at`.
 * Freshness measures the TRAFFIC, not the wire: on a quiet channel no position
 * moves, so every healthy follower would look equally dead — during exactly the
 * silent stretch where a real drop is hardest to notice. Head-lag is 0 for every
 * live follower no matter how quiet it is, and grows only for one that has
 * actually stopped consuming.
 *
 * Its honest limit: it can only convict a follower once SOMEONE SENDS. A dead
 * wire on a silent channel is invisible to this and to everything else we have.
 *
 * "never-followed" is not "behind by everything". A seat that never started a
 * follow and a seat whose follow died at message 3 are different facts, and
 * collapsing them is the same ambiguity that made `--since` garbage look like a
 * quiet channel.
 */
export function positionState(head: number, position: SeatPosition | null): PositionState {
  if (position === null) return { state: "never-followed" };
  const behindBy = head - position.emittedThrough;
  if (behindBy <= 0) return { state: "current", emittedThrough: position.emittedThrough };
  return { state: "behind", emittedThrough: position.emittedThrough, behindBy };
}

/** One seat's row in the cross-seat position report. */
export interface SeatPositionRow {
  handle: string;
  role: string;
  state: PositionState["state"];
  /** Highest id emitted to this seat, or `null` when it has never followed. */
  emittedThrough: number | null;
  /**
   * `null` / `0` / `N` — and `null` is NOT a rounded-down zero. With no recorded
   * position the tool has no idea what that seat has seen; it may have read the
   * whole log via `read`, which records nothing by design (Contract 4(c-bis)).
   * Reporting `0` there asserts "you missed nothing", the one claim it is not
   * entitled to make, on the wire whose whole purpose is to stop silence being
   * mistaken for safety.
   */
  gap: number | null;
  /** Advisory ONLY. `false` means the recording follower's pid is gone, so
   * `emittedThrough` is a high-water mark rather than a live reading. `null`
   * means we could not check. Pids are reused, so this narrows a question
   * rather than answering it — it never contradicts `state`. */
  followerAlive: boolean | null;
}

/**
 * A seat's last recorded position, or null if it has never followed.
 *
 * A damaged file is treated as null: **an unreadable position is not evidence
 * of a position**, and a caller must not report a gap it invented.
 *
 * Lives here rather than in the `comms` command because it is now read by TWO
 * consumers — `comms positions` and the teardown presence guard — and the
 * null-on-damage rule is the kind of thing that drifts the moment it is
 * reimplemented beside its second caller.
 */
export function readPosition(
  teamDir: string,
  channel: string,
  handle: string,
): SeatPosition | null {
  try {
    const path = commsPositionPath(teamDir, channel, handle);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as SeatPosition;
  } catch {
    return null;
  }
}

/**
 * The cross-seat read: where every seat stands against one head.
 *
 * PURE (the unit-test target) — `positions` and `alive` are passed in, so the
 * whole report is testable without a filesystem or live processes.
 *
 * **What this observes is EMITTED, and the report may not imply otherwise**
 * (Contract 6(a)). Three tiers: `emitted` is an artifact this tool owns;
 * `delivered` is downstream of a pipe buffer and the consuming harness and is
 * NOT observable from here; `read` is testimony and stays hand-written. The
 * useful direction is the negative one — a peer reading your position against
 * the head establishes messages were **not emitted** to you, and nothing
 * unemitted was ever delivered. That is a fact about someone else obtained
 * without their cooperation, and it is how a dead wire actually gets found.
 *
 * Its honest limit, worth stating where the code is rather than in a footnote:
 * head-lag can only convict a follower **once somebody sends**. A dead wire on
 * a silent channel is invisible to this and to everything else we have.
 */
export function buildPositionsReport(
  head: number,
  seats: { handle: string; role: string }[],
  positions: Map<string, SeatPosition | null>,
  alive?: (pid: number) => boolean | null,
): SeatPositionRow[] {
  return seats.map((seat) => {
    const position = positions.get(seat.handle) ?? null;
    const state = positionState(head, position);
    return {
      handle: seat.handle,
      role: seat.role,
      state: state.state,
      emittedThrough: position ? position.emittedThrough : null,
      gap: state.state === "never-followed" ? null : state.state === "behind" ? state.behindBy : 0,
      followerAlive: position && alive ? alive(position.pid) : null,
    };
  });
}

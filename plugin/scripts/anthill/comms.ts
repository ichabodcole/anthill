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

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
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
  /**
   * The team to bind to, when — and ONLY when — this project configures several.
   *
   * ⚠ AN EMITTED COMMAND MUST CARRY ITS OWN TEAM. The seat runs this string
   * verbatim in a fresh process, where the ladder starts over: `--team lean` on
   * `anthill join` does NOT survive into the command join printed. On a repo
   * pinned to another team the positional channel then belongs to one team while
   * resolution lands on another, and `rejectOtherTeam` refuses — loudly, which is
   * the good case. The bad case is `commit`, which has no channel to disagree
   * with; see `buildLandCommand`.
   *
   * Omitted on a single-team project: there is nothing to disambiguate, and a
   * flag appearing in every existing repo's incantation is criterion 1.
   */
  team?: string | undefined;
}): string {
  const team = i.team ? ` --team ${i.team}` : "";
  return `bun ${i.cliPath} comms follow ${i.channel} --as ${i.handle}${team}`;
}

// ---------------------------------------------------------------------------
// The log. NDJSON, append-only: one message per line, never rewritten.
// ---------------------------------------------------------------------------

export function commsLogPath(teamDir: string, channel: string, sessionId?: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(
      `unsafe channel name "${channel}" — must match ${String(SAFE_CHANNEL)} ` +
        "(it becomes a filename)",
    );
  }
  if (sessionId === undefined) return resolve(teamDir, COMMS_DIR, `${channel}.ndjson`);
  if (!SAFE_CHANNEL.test(sessionId)) {
    throw new Error(`unsafe session id "${sessionId}" — it becomes a filename`);
  }
  return resolve(teamDir, COMMS_DIR, channel, `${sessionId}.ndjson`);
}

// ---------------------------------------------------------------------------
// ROTATION. A session is an ADDRESSABLE UNIT: its own log, its own positions.
//
// ⚠ NOTHING HERE DELETES ANYTHING, EVER. The log is the provenance of
// everything a session ships — a lead pulled a peer's upstream issue draft out
// of it after teardown, and a whole measurement lane read from it. Rotation
// MINTS a successor and leaves every predecessor on disk, addressable by id.
// **Deleting is the human's choice, never the tool's.** That is why this is
// rotation and not the `--fresh`/clear it replaces.
//
// ⚠ AND ROTATING A LIVE CHANNEL IS THE HAZARD seams.md 6(e) DESCRIBES, fired
// deliberately and on every follower at once. `follow` resolves its log path
// ONCE at attach, so a survivor across a boundary reads a dead path forever
// while carrying its old `emittedThrough` — reporting `current`, gap 0, having
// emitted none of the new log. **The tool cannot observe that**, because 6(a)
// gives us `emitted` and never `delivered`.
//
// THE MECHANISM IS THEREFORE SAFE TO LAND AND NOT SAFE TO FIRE ON A CHANNEL
// WITH LIVE FOLLOWERS. Rotate at a session boundary, when nobody is attached.
// Stated here rather than in a card because the next reader meets this function
// and not the card.
// ---------------------------------------------------------------------------

/** The CURRENT pointer: which session id this channel is writing to now. */
export function commsCurrentPath(teamDir: string, channel: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(`unsafe channel name "${channel}" — it becomes a filename`);
  }
  return resolve(teamDir, COMMS_DIR, `${channel}.current`);
}

/**
 * Which session is this channel writing to?
 *
 * **`null` means the LEGACY layout** — a pre-rotation `<channel>.ndjson` with
 * no pointer — and it is a positive answer, not a failure. Every existing
 * footprint is in that state, and none of them may become unreadable because
 * this function shipped. `null` is what keeps them working, so it is handled
 * everywhere rather than treated as an error.
 */
export function readCurrentSession(teamDir: string, channel: string): string | null {
  try {
    const path = commsCurrentPath(teamDir, channel);
    if (!existsSync(path)) return null;
    const id = readFileSync(path, "utf8").trim();
    return id.length > 0 && SAFE_CHANNEL.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** The log this channel is writing to NOW — session-scoped, or legacy. */
export function resolveCommsLog(teamDir: string, channel: string): string {
  const id = readCurrentSession(teamDir, channel);
  return commsLogPath(teamDir, channel, id ?? undefined);
}

/** The positions dir in force NOW — session-scoped, or legacy. */
export function resolveCommsPosition(teamDir: string, channel: string, handle: string): string {
  const id = readCurrentSession(teamDir, channel);
  return commsPositionPath(teamDir, channel, handle, id ?? undefined);
}

/**
 * Mint a session id. Sortable, and it carries its own timestamp so a directory
 * listing is chronological without reading any file.
 */
export function mintSessionId(atMillis: number): string {
  return `s${new Date(atMillis).toISOString().replace(/[:.]/g, "-").replace(/Z$/, "")}`;
}

export interface RotationResult {
  sessionId: string;
  logPath: string;
  /** The session this one succeeds — `null` when rotating out of the legacy layout. */
  previous: string | null;
  warnings: string[];
}

/**
 * Rotate: mint a new session, point CURRENT at it, and DROP the session-open
 * record.
 *
 * **DROPPING the record is the safe half and it is NOT the tidy-looking one.**
 * The alternative — carrying it across — leaves `spawned` naming the previous
 * session's seats while the positions directory is empty, which is the
 * pane-kill conjunction: blinded positions AND in-window tombstones AND a
 * spawned set to satisfy. `c9a33e7` instruments both: a DROPPED record blocks
 * teardown (`spawned` unknowable ⇒ `unknown` ⇒ block) and a record naming
 * NOBODY blocks and is distinct from no record at all. **Preserving it is the
 * one unsafe design and it is the one that looks like housekeeping.**
 *
 * Never throws: rotation failing must not take the wire down with it.
 */
export function rotateSession(
  teamDir: string,
  channel: string,
  atMillis: number,
): RotationResult | { sessionId: null; warnings: string[] } {
  const warnings: string[] = [];
  try {
    const previous = readCurrentSession(teamDir, channel);
    const sessionId = mintSessionId(atMillis);
    const logPath = commsLogPath(teamDir, channel, sessionId);
    mkdirSync(dirname(logPath), { recursive: true });
    // Create the log empty so the successor exists before anything points at
    // it. A CURRENT naming a file that is not there would make a fresh channel
    // indistinguishable from a broken one.
    if (!existsSync(logPath)) writeFileSync(logPath, "", "utf8");

    const currentPath = commsCurrentPath(teamDir, channel);
    const tmp = `${currentPath}.${process.pid}.tmp`;
    writeFileSync(tmp, `${sessionId}\n`, "utf8");
    renameSync(tmp, currentPath);

    // DROP the session-open record. Not deleted for tidiness — deleted because
    // a carried-over `spawned` set is the middle term of the pane-kill
    // conjunction. Its ABSENCE is what makes teardown block (fail-safe).
    try {
      const sessionPath = commsSessionPath(teamDir, channel);
      if (existsSync(sessionPath)) rmSync(sessionPath);
    } catch (err) {
      warnings.push(
        `could not drop the session-open record: ${(err as Error).message} — ` +
          "the new session may inherit the previous spawned set, which is the UNSAFE direction; " +
          "remove it by hand before relying on the teardown guard",
      );
    }

    return { sessionId, logPath, previous, warnings };
  } catch (err) {
    return {
      sessionId: null,
      warnings: [`rotation failed: ${(err as Error).message} — the channel is unchanged`],
    };
  }
}

/**
 * Every session on disk, newest last. The LEGACY log appears as `null` when it
 * exists, because "the log from before rotation" is a real session that simply
 * has no id — reporting only the ids would make it unaddressable, which is the
 * one thing rotation promised not to do.
 */
export function listSessions(teamDir: string, channel: string): (string | null)[] {
  const out: (string | null)[] = [];
  if (existsSync(commsLogPath(teamDir, channel))) out.push(null);
  try {
    const dir = resolve(teamDir, COMMS_DIR, channel);
    if (existsSync(dir)) {
      out.push(
        ...readdirSync(dir)
          .filter((f) => f.endsWith(".ndjson"))
          .map((f) => f.slice(0, -".ndjson".length))
          .sort(),
      );
    }
  } catch {
    // A listing that cannot be produced is an empty listing, never a throw:
    // callers use this to OFFER history, not to decide anything safety-bearing.
  }
  return out;
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
export function commsPositionPath(
  teamDir: string,
  channel: string,
  handle: string,
  sessionId?: string,
): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(`unsafe channel name "${channel}" — it becomes a filename`);
  }
  // The handle becomes a filename too. It arrives from the roster rather than
  // from argv, but "it came from config" is not a charset guarantee, and a
  // handle of `../../x` would escape the comms dir entirely.
  if (!SAFE_CHANNEL.test(handle)) {
    throw new Error(`unsafe seat handle "${handle}" — it becomes a filename`);
  }
  if (sessionId === undefined) {
    return resolve(teamDir, COMMS_DIR, `${channel}.positions`, `${handle}.json`);
  }
  if (!SAFE_CHANNEL.test(sessionId)) {
    throw new Error(`unsafe session id "${sessionId}" — it becomes a filename`);
  }
  // Positions are PER SESSION, and that is the point rather than a side effect:
  // a position is a claim about a specific log, so carrying one across a
  // rotation would assert a watermark into a log that never contained it —
  // seams.md 6(e)'s false `current`, manufactured by us. A new session starts
  // every seat at `never-followed`, which is the honest state: the tool has no
  // idea what this seat has seen of THIS log.
  return resolve(teamDir, COMMS_DIR, channel, `${sessionId}.positions`, `${handle}.json`);
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
  // INCOHERENT: a position AHEAD of the head is impossible for a live follower
  // of THIS log, so the record does not describe this log. `never-followed` is
  // the honest classification — the tool has no idea what this seat has seen,
  // which is exactly what that state means (Contract 6(c)).
  //
  // This is the F1 defect, found by the lead at convene as the FIRST user of the
  // instrument: the positions directory outlived the log it described, so
  // `comms positions` reported six seats `current`, gap 0, against `head: 0` —
  // five of whom had never existed on that log. `gap = head - emittedThrough`
  // was NEGATIVE (0 − 389) and the old `behindBy <= 0` silently rounded it into
  // the single most reassuring state, on the wire whose entire purpose is to
  // stop silence being mistaken for safety.
  //
  // Deliberately NOT a fix for Contract 6(e) (a live follower whose log is
  // swapped underneath it) — that needs `follow` to record a log identity, which
  // is a revision of 6(a). This changes only how an already-recorded value is
  // CLASSIFIED, so it carries none of that cost. The expensive half is carried,
  // not built.
  if (behindBy < 0) return { state: "never-followed" };
  if (behindBy === 0) return { state: "current", emittedThrough: position.emittedThrough };
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
  /**
   * A position record EXISTS but cannot describe this log — its `emittedThrough`
   * is ahead of the head, which is impossible for a live follower. TOTAL (always
   * present) so its `false` is readable as an observation rather than as an
   * unpopulated field.
   *
   * The state is still `never-followed`, honestly: the tool has no idea what the
   * seat has seen. This flag preserves the DIAGNOSTIC that the old code threw
   * away by rounding a negative gap up to `current` — the difference between
   * "nobody ever followed" and "a record from another log survived here".
   */
  staleRecord: boolean;
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
/**
 * Where one seat's DEPARTURE RECORD lives — the tombstone `comms stand-down`
 * writes. Per-seat file, same reasoning as the position path: only the departing
 * seat writes its own, so there is nothing to contend over.
 *
 * **A TOMBSTONE, never a deletion.** Deleting the position record would make a
 * stood-down seat byte-identical to one that never followed, which is precisely
 * the ambiguity the teardown guard now depends on separating: departure is a
 * POSITIVE observation, absence is not. Deletion would restore the fused world.
 */
export function commsDeparturePath(teamDir: string, channel: string, handle: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(`unsafe channel name "${channel}" — it becomes a filename`);
  }
  if (!SAFE_CHANNEL.test(handle)) {
    throw new Error(`unsafe seat handle "${handle}" — it becomes a filename`);
  }
  return resolve(teamDir, COMMS_DIR, `${channel}.departures`, `${handle}.json`);
}

/**
 * Where the SESSION-OPEN RECORD lives: which seats this session spawned.
 *
 * The teardown guard cannot confirm "everyone left" without knowing who was
 * supposed to be here. Deriving that set from `config.seats` instead would mean
 * a seat that was never spawned has no departure record and blocks teardown
 * forever — always-block by another road.
 */
export function commsSessionPath(teamDir: string, channel: string): string {
  if (!SAFE_CHANNEL.test(channel)) {
    throw new Error(`unsafe channel name "${channel}" — it becomes a filename`);
  }
  return resolve(teamDir, COMMS_DIR, `${channel}.session.json`);
}

export interface SessionOpenRecord {
  /** Seats this session spawned. `[]` is a real value: a record naming nobody. */
  spawned: string[];
  /**
   * When this session opened — the ORIGIN a departure is scoped against (D3).
   *
   * `writeSessionOpen` has always written this; the interface never declared
   * it, so every reader cast it away. That is the enumeration defect in its
   * quietest form: a field the writer emits and the type denies, which no gate
   * can see because nothing ever asked for it.
   *
   * **Optional on purpose, and the optionality is load-bearing.** A record
   * written before this field existed has no `openedAt`, and the honest reading
   * of that is *"I cannot scope a departure"* — which must fail SAFE (nothing
   * counts as departed, teardown blocks), never fail open.
   */
  openedAt?: number;
}

/**
 * Read the session-open record.
 *
 * **Returns `null` when NO record exists, which is NOT the same as a record
 * naming no seats** (`{spawned: []}`). Same discipline as `readPosition`'s
 * never-followed: `null` is not a rounded-down empty, and the teardown guard
 * reports the two through distinct branches.
 */
/**
 * Write the session-open record. Atomic (tmp + rename) for the same reason the
 * position write is: a reader must never see a half-written record, and this one
 * feeds a verdict that authorises killing panes.
 *
 * NEVER THROWS — a spawn must not die because a record could not be written. It
 * returns the warning instead, and the guard fails SAFE without it: no record
 * means `spawned === null` means `unknown` means teardown blocks.
 */
export function writeSessionOpen(
  teamDir: string,
  channel: string,
  spawned: string[],
): { path: string | null; warning?: string } {
  try {
    const path = commsSessionPath(teamDir, channel);
    mkdirSync(dirname(path), { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    writeFileSync(tmp, `${JSON.stringify({ channel, spawned, openedAt: Date.now() })}\n`, "utf8");
    renameSync(tmp, path);
    return { path };
  } catch (err) {
    return {
      path: null,
      warning: `could not write the session-open record: ${(err as Error).message} — teardown will refuse until it exists (fail-safe)`,
    };
  }
}

export function readSessionOpen(teamDir: string, channel: string): SessionOpenRecord | null {
  try {
    const path = commsSessionPath(teamDir, channel);
    if (!existsSync(path)) return null;
    const parsed = JSON.parse(readFileSync(path, "utf8")) as SessionOpenRecord;
    return Array.isArray(parsed?.spawned) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Has this seat positively recorded a departure **IN THIS SESSION**?
 * Absence is NOT a departure, and neither is a departure from a PAST one.
 *
 * **D3 — the tombstone had no session scope, and that was an ABSENT choice
 * rather than a wrong one:** the record is `{handle, channel, at}` and
 * `hasDeparted` was a bare `existsSync`, so a tombstone written by any past
 * session counted forever. Contract 6(g)'s conjunct — *every spawned seat has
 * departed* — was therefore satisfiable by files nobody wrote this session.
 *
 * **Measured on the real tree (session 10):** four session-9 tombstones on disk
 * for exactly the four seats then working. With them, `commsPresence` returned
 * `none` / `all-spawned-departed` — **teardown authorised while four seats
 * worked.** Remove only those files, one variable, and it returns `unknown`.
 * The hazard is reachable at the fresh-spawn instant (no seat has a position
 * record yet, so nothing reaches the follower branches) **and at teardown**.
 *
 * **A mask fails safe; a stale departure fails OPEN.** That is the whole reason
 * this is scoped rather than swept: nothing here deletes a tombstone, so
 * session 9's records survive — they are the only copy of what its retro cites.
 *
 * **Fail-safe in every direction that is not a positive, in-session departure:**
 * no session origin, no record, damaged record, or a record predating the
 * session all return `false`. `false` blocks teardown. An unreadable world must
 * never authorise killing a pane.
 */
export function hasDeparted(
  teamDir: string,
  channel: string,
  handle: string,
  /** This session's origin. `null` ⇒ nothing to scope against ⇒ never departed. */
  sessionOpenedAt: number | null,
): boolean {
  if (sessionOpenedAt === null) return false;
  try {
    const path = commsDeparturePath(teamDir, channel, handle);
    if (!existsSync(path)) return false;
    const record = JSON.parse(readFileSync(path, "utf8")) as { at?: unknown };
    // `>=`, not `>`: a departure stamped in the same millisecond as the open is
    // this session's. The boundary is asserted rather than left to taste.
    return typeof record?.at === "number" && record.at >= sessionOpenedAt;
  } catch {
    return false;
  }
}

export function readPosition(
  teamDir: string,
  channel: string,
  handle: string,
): SeatPosition | null {
  try {
    // Resolve through CURRENT: a position belongs to the session whose log it
    // is a watermark into. Reading the legacy path after a rotation would hand
    // back a number measured against a DIFFERENT log — 6(e)'s false `current`,
    // manufactured by the reader rather than by a swap.
    const path = resolveCommsPosition(teamDir, channel, handle);
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
    // A record classified `never-followed` must not also report a number: the
    // row would then assert both "no idea what this seat has seen" and a
    // specific high-water mark, and a reader would believe the number. Derived
    // from the STATE rather than from the record's existence, so the two can
    // never disagree.
    const incoherent = position !== null && state.state === "never-followed";
    return {
      handle: seat.handle,
      role: seat.role,
      state: state.state,
      emittedThrough: state.state === "never-followed" ? null : (position?.emittedThrough ?? null),
      gap: state.state === "never-followed" ? null : state.state === "behind" ? state.behindBy : 0,
      followerAlive: position && alive ? alive(position.pid) : null,
      // TOTAL, not optional: an absent flag would be unreadable (Contract 5(a)'s
      // rule). `true` is the mechanical tell nothing looked at — it says a record
      // EXISTS and does not describe this log, which is different from never
      // having followed, even though both are honestly `never-followed` about
      // what the tool KNOWS.
      staleRecord: incoherent,
    };
  });
}

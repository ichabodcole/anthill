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

/**
 * Flags the caller passed that this verb doesn't declare.
 *
 * The CLI's parser runs `strict: false`, so an undeclared flag is silently
 * swallowed and the command reports `ok: true`. On a send verb that is the worst
 * possible shape of wrong: a seat reaching for a flag it half-remembers from a
 * neighbouring tool gets no error, and its positional lands somewhere it didn't
 * intend — one real case stored a CHANNEL NAME as the message body and reported
 * success. The seat believes it sent a paragraph and has shipped one word.
 *
 * Pure so the tokenizing rules (`--flag=value`, the `--` terminator, negative
 * numbers) are pinned rather than argued about.
 */
export function unknownFlags(rawArgs: string[], known: string[]): string[] {
  const out: string[] = [];
  for (const arg of rawArgs) {
    if (arg === "--") break;
    if (!arg.startsWith("--")) continue;
    const name = arg.slice(2).split("=")[0] ?? "";
    if (name === "") continue;
    if (!known.includes(name) && !known.includes(name.replace(/^no-/, ""))) {
      out.push(`--${name}`);
    }
  }
  return out;
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

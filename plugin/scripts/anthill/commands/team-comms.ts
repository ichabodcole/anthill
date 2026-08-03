/**
 * `anthill comms` — the team's seat-aware message log.
 *
 * Verb surface is deliberately rigid, and the rigidity IS the guardrail:
 *
 *   * `follow` STREAMS and can never terminate — no `--since`, no `--last`, no
 *     `--from-start`.
 *   * `read` TERMINATES and can never stream — no `--follow`.
 *
 * Neither verb has a flag that lets it impersonate the other. That is not
 * stylistic minimalism: a prose warning against using a live tail for catch-up
 * has already been read, edited, believed, and then violated by the person who
 * wrote it, in this repo, on the day he wrote it. A guardrail that instruction
 * text can override is not a guardrail — so this one lives in the verb surface,
 * where the mistake cannot be expressed. (`--since 0` on a streaming verb is the
 * canonical shape of the trap: a flag that makes a stream LOOK finite.)
 *
 * Identity is a seat, resolved from `.anthill/config.json`, stated on every path
 * including success. See `.anthill/dev/seams.md` Contract 4 — the mechanism
 * lives in `comms.ts` and the contract lives there; this file wires them to argv.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import {
  buildCommsIncantation,
  buildPositionsReport,
  type CommsMessage,
  commsLogPath,
  commsPositionPath,
  encodeMessage,
  type IdentityResult,
  nextMessageId,
  type PositionState,
  parseLog,
  positionState,
  resolveSeatIdentity,
  type SeatPosition,
  type SeatPositionRow,
} from "../comms.ts";
import { ConfigError, loadConfig, type ResolvedConfig } from "../config.ts";
import { defineAnthillCommand, defineCommand } from "../define.ts";
import { acquireLock, releaseLock } from "../lock.ts";
import { nowMillis } from "../runtime.ts";

/**
 * Load config WITHOUT the usual `requireConfig` exit. A missing config is not a
 * generic command failure here — it is one of identity resolution's three
 * outcomes, and it has to reach the caller AS that outcome rather than as a
 * different error shape. Absent evidence is not evidence of absence.
 */
function loadTeam(): { config: ResolvedConfig | null; configSearch: string } {
  try {
    return { config: loadConfig(), configSearch: "" };
  } catch (err) {
    if (err instanceof ConfigError) {
      // Pass the config layer's OWN locator through verbatim. It names the start
      // dir and says "or any parent", which is what actually happened; rebuilding
      // an absolute path here would name one place out of the many it checked.
      return { config: null, configSearch: err.message };
    }
    throw err;
  }
}

function identify(config: ResolvedConfig | null, configSearch: string, handle: unknown) {
  return resolveSeatIdentity({
    roster: config ? config.roster() : null,
    handle: handle === undefined ? undefined : String(handle),
    configSearch,
  });
}

/** Resolve the channel: explicit flag wins, else the team's configured channel. */
function resolveChannel(config: ResolvedConfig | null, flag: unknown): string | null {
  if (typeof flag === "string" && flag.trim() !== "") return flag;
  return config ? config.channel : null;
}

function readChannel(teamDir: string, channel: string) {
  const path = commsLogPath(teamDir, channel);
  if (!existsSync(path)) return { path, messages: [] as CommsMessage[], warnings: [] as string[] };
  const { messages, warnings } = parseLog(readFileSync(path, "utf8"));
  return { path, messages, warnings };
}

// --- send ------------------------------------------------------------------

interface SendData {
  id: number;
  channel: string;
  from: string;
  role: string;
  /** Stated on the SUCCESS path, not only on failure — this field is the whole
   * seat-identity wedge, and without it a send that read the roster and a send
   * that echoed the caller's string are indistinguishable from outside. */
  identity: IdentityResult["outcome"];
  /** Present ONLY when `--as-of` was stale and `--anyway` overrode the refusal —
   * a deliberate crossing, recorded so it is visible rather than silent. */
  staleness?: { asOf: number; crossed: number };
  warnings?: string[];
}

/**
 * What a `--dry-run` send reports. Deliberately NOT `SendData` with a flag:
 * a real send's `id` is a fact and a dry run has none, so sharing the shape
 * would force either a fabricated id or an optional one whose absence is
 * unreadable (Contract 5(a): a field populated on one path only).
 */
interface DryRunData {
  dryRun: true;
  channel: string;
  from: string;
  role: string;
  identity: IdentityResult["outcome"];
  /** The body that WOULD be stored, echoed so a caller can audit shell mangling. */
  text: string;
  wouldAppendTo: string;
  /** A dry run REPORTS staleness and never refuses on it: refusing would make
   * the safe way to check a crossing the one way you cannot check it. */
  staleness?: { asOf: number; crossed: number };
  warnings?: string[];
}

const sendCommand = defineCommand({
  meta: { name: "send", description: "Append a message to the team's channel as a seat" },
  args: {
    text: {
      type: "positional",
      description: "Message body (omit when using --stdin)",
      required: false,
    },
    as: {
      type: "string",
      description: "Your seat handle (must be in the roster)",
      valueHint: "handle",
    },
    channel: {
      type: "string",
      description: "Channel (default: config.channel)",
      valueHint: "name",
    },
    stdin: {
      type: "boolean",
      description: "Read the message body from stdin (REQUIRED for bodies with backticks or code)",
    },
    "dry-run": {
      type: "boolean",
      description: "Resolve and validate everything, then STOP before the write — appends nothing",
    },
    "as-of": {
      type: "string",
      description: "The message id your view was formed as of — refuses the send if it is stale",
      valueHint: "id",
    },
    anyway: {
      type: "boolean",
      description: "Send even though --as-of is stale (you have decided the crossing is fine)",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const { config, configSearch } = loadTeam();

    const identity = identify(config, configSearch, ctx.args.as);
    if (identity.outcome !== "resolved-from-roster") {
      // NOTHING is written. An error envelope that also delivered the message
      // would be the free-form-alias fallback wearing a hat.
      emitError({ format, command: "comms send", error: identity.error });
      process.exit(1);
    }

    const channel = resolveChannel(config, ctx.args.channel);
    if (!config || !channel) {
      emitError({ format, command: "comms send", error: "no channel resolved" });
      process.exit(1);
    }

    const teamDir = config.teamDirPath();
    let path: string;
    let warnings: string[];
    try {
      const log = readChannel(teamDir, channel);
      path = log.path;
      warnings = log.warnings;
    } catch (err) {
      emitError({ format, command: "comms send", error: (err as Error).message });
      process.exit(1);
    }

    /**
     * A message is ONE positional. Surplus positionals are refused rather than
     * dropped.
     *
     * `send "hello there" world` used to store `"hello there"` and discard
     * `world`, reporting ok:true — the seat believes it sent a paragraph and has
     * shipped one word. Two real cases: a seat reaching for a neighbouring tool's
     * signature stored a CHANNEL NAME as the body; another lost every word after
     * the first while probing this very defect.
     *
     * The `--` terminator does NOT rescue it (`send -- "a" b` dropped `b` the
     * same way), so the defence a careful caller reaches for failed identically
     * to no defence at all — which is why this is a refusal and not a doc note.
     *
     * Checked against `_`, not against raw argv: `_` holds every positional
     * whichever way it arrived, so the `--` path is covered by construction
     * rather than by a second rule that could drift from this one.
     */
    const positionals = ((ctx.args._ as string[] | undefined) ?? []).filter((p) => p.length > 0);
    if (!ctx.args.stdin && positionals.length > 1) {
      emitError({
        format,
        command: "comms send",
        error:
          `a message is one argument, but ${positionals.length} were given ` +
          `(${positionals.map((p) => JSON.stringify(p)).join(", ")}). ` +
          `Quote the whole body — send "…" — or use --stdin. Nothing was sent.`,
      });
      process.exit(1);
    }

    // `--stdin` exists because bash gets the body BEFORE this process does: an
    // unquoted message carrying backticks is command-substituted by the shell,
    // so no amount of downstream care can recover it. A dev team's messages are
    // made of backticks and code, so this is the normal path, not the exotic one.
    const text = ctx.args.stdin ? await Bun.stdin.text() : String(ctx.args.text ?? "");
    if (text.trim() === "") {
      emitError({
        format,
        command: "comms send",
        error: ctx.args.stdin
          ? "--stdin was given but stdin was empty — nothing sent"
          : "message body is required (pass it as an argument, or use --stdin)",
      });
      process.exit(1);
    }

    /**
     * `--dry-run` — exercise the whole send path and STOP at the write.
     *
     * Why it exists: `send` had no way to ask a question without causing an
     * effect, on an append-only log that nothing ever clears. Auditing what
     * `send` does with a given input REQUIRED sending, so four diagnostic
     * messages hit the team's permanent record in one session — the tool made
     * polluting the record the price of verifying a claim about the tool.
     *
     * It runs AFTER identity, channel, positional-refusal and body resolution,
     * so a dry run exercises every check a real send would fail on. Placing it
     * earlier would make it a different code path that reports on the one it
     * replaced — a proxy, and proxies eventually lie.
     *
     * It deliberately emits NO `id`. The id is `max(existing)+1` decided under
     * a lock at append time; predicting it here would be a number that is right
     * until a peer sends first, and a field that claims more than it can support
     * is exactly the defect the delivered-vs-emitted seam exists to prevent.
     * `wouldAppendTo` and the echoed `text` are facts; the id is not one yet.
     */
    /**
     * SEND-TIME STALENESS — the only moment a crossing is preventable.
     *
     * A crossing is not a wire failure: every message arrives. It is a message
     * WRITTEN against a view that has already moved. Six happened on this team
     * in one session, each costing at least a message and one costing a full
     * retraction of a sound finding — and every seat was using the read-watermark
     * convention correctly throughout. **A watermark diagnoses a crossing after
     * the fact; it cannot prevent one.** That is H1: the prose guard was followed
     * and did not fire.
     *
     * So this promotes the convention a seat already writes by hand — *"reading
     * as of #195"* — into a value the tool can check, and checks it against the
     * log at the instant of the send.
     *
     * WHY THE ANCHOR MUST COME FROM THE SENDER, and why the recorded position
     * cannot replace it: a live follower's `emittedThrough` tracks the head
     * continuously, so by send time it is almost always current — the messages
     * WERE emitted to the seat, just not before it started composing. The tool
     * cannot observe when composing began. Only the sender knows, and `--as-of`
     * is them saying so. This is the delivered/read seam paying out: the
     * artifact (`emittedThrough`) and the testimony (`--as-of`) answer different
     * questions and neither substitutes for the other.
     *
     * Fires on a REAL DELTA — ids that exist, written by someone else — never on
     * a timer or an age. A prompt on a timer becomes the heartbeat, and an alarm
     * that is usually ignorable trains its audience to discard the channel,
     * which is worse than the gap it closes.
     */
    const crossedIds: number[] = [];
    let staleness: { asOf: number; crossed: number } | null = null;
    if (ctx.args["as-of"] !== undefined) {
      const raw = String(ctx.args["as-of"]);
      const asOf = Number(raw.replace(/^#/, ""));
      if (!Number.isInteger(asOf) || asOf < 0) {
        emitError({
          format,
          command: "comms send",
          error: `--as-of needs a message id, got "${raw}". Ids are whole numbers — "--as-of 195" or "--as-of #195".`,
        });
        process.exit(1);
      }
      // Only OTHER seats' messages count. Your own send cannot cross you, and
      // counting it would make the check fire on every second message you write.
      for (const m of readChannel(teamDir, channel).messages) {
        if (m.id > asOf && m.from !== identity.handle) crossedIds.push(m.id);
      }
      if (crossedIds.length > 0) {
        staleness = { asOf, crossed: crossedIds.length };
        if (!ctx.args.anyway && !ctx.args["dry-run"]) {
          const who = [
            ...new Set(
              readChannel(teamDir, channel)
                .messages.filter((m) => crossedIds.includes(m.id))
                .map((m) => m.from),
            ),
          ].join(", ");
          emitError({
            format,
            command: "comms send",
            error:
              `stale: ${crossedIds.length} message(s) were added after #${asOf} was emitted to you ` +
              `(#${crossedIds.join(", #")} — from ${who}). Nothing was sent. ` +
              `Read them with: anthill comms read --channel ${channel} --since ${asOf} ` +
              "— then re-send with an updated --as-of, or pass --anyway to send regardless.",
          });
          process.exit(1);
        }
      }
    }

    if (ctx.args["dry-run"]) {
      const data: DryRunData = {
        dryRun: true,
        channel,
        from: identity.handle,
        role: identity.role,
        identity: identity.outcome,
        text,
        wouldAppendTo: path,
        ...(staleness ? { staleness } : {}),
        ...(warnings.length > 0 && { warnings }),
      };
      emit({
        format,
        command: "comms send",
        data,
        startedAt: started,
        renderText: (d) =>
          `DRY RUN — nothing was sent.\n` +
          `would append to ${d.wouldAppendTo}\n` +
          `as ${d.from} (${d.role}) on ${d.channel} — identity ${d.identity}\n` +
          `body (${d.text.length} chars):\n${d.text}`,
      });
      return;
    }

    mkdirSync(dirname(path), { recursive: true });

    // SERIALIZE the read-compute-append. The id is `max(existing) + 1`, decided
    // from a READ that precedes the APPEND — so two seats sending at the same
    // instant both read the same log and both claim the same id. `O_APPEND`
    // protects the bytes; it does nothing for a value decided beforehand.
    // Reproduced before fixing: six concurrent sends yielded 1,2,3,4,4,5,5,6,7.
    // A duplicate id breaks `read <channel> <id>` and the read-watermark
    // convention ("ratified as of #14"), which is what stable ids are FOR.
    // The lock also removes any chance of two large appends interleaving.
    const lock = `${path}.lock`;
    acquireLock(lock, { waitMs: 10_000, staleMs: 30_000, pollMs: 25 });
    let message: CommsMessage;
    try {
      // Re-read INSIDE the lock: the copy taken before it may already be stale.
      const myPosition = readPosition(teamDir, channel, identity.handle);
      message = {
        id: nextMessageId(readChannel(teamDir, channel).messages),
        channel,
        from: identity.handle,
        role: identity.role,
        text,
        ts: Date.now(),
        // Omitted entirely when this seat has no recorded position, rather than
        // written as 0. `undefined` already means "unknown" for older records;
        // a 0 would mean "had seen nothing", which is a different claim.
        ...(myPosition ? { emittedThrough: myPosition.emittedThrough } : {}),
      };
      appendFileSync(path, `${encodeMessage(message)}\n`, "utf8");
    } finally {
      releaseLock(lock);
    }

    const data: SendData = {
      id: message.id,
      channel,
      from: message.from,
      role: message.role,
      identity: identity.outcome,
      ...(staleness ? { staleness } : {}),
      ...(warnings.length > 0 && { warnings }),
    };
    emit({
      format,
      command: "comms send",
      data,
      startedAt: started,
      renderText: (d) => `#${d.id} → ${d.channel} as ${d.from} (${d.identity})`,
    });
  },
});

// --- read (TERMINATES — never streams) --------------------------------------

interface ReadData {
  channel: string;
  messages: CommsMessage[];
  warnings?: string[];
}

const readCommand = defineCommand({
  meta: {
    name: "read",
    description: "Print channel history and EXIT (finite — use for catch-up)",
  },
  args: {
    channel: {
      type: "string",
      description: "Channel (default: config.channel)",
      valueHint: "name",
    },
    since: { type: "string", description: "Only messages after this id", valueHint: "id" },
    id: { type: "string", description: "Fetch EXACTLY ONE message by id", valueHint: "id" },
    last: {
      type: "string",
      description: "Only the most recent N messages (finite — use it to find an anchor id)",
      valueHint: "N",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
    // RECOGNISED and REFUSED, not unknown. Every sibling wire takes `--as` on a
    // read verb, so muscle memory supplies it — and `read` is the one verb a
    // JOINING seat runs before it knows its seat.
    as: {
      type: "string",
      refused:
        "reads are not attributed to a seat (identity binds sending and following, not observing)",
    },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    // `--as` is DECLARED-AND-REFUSED on this verb (see its args). The shared
    // parser now rejects genuinely unknown flags globally and names the valid
    // set, so the only rejection left to own here is the one that must TEACH.
    if (ctx.args.as !== undefined) {
      emitError({
        format,
        command: "comms read",
        error:
          "`--as` is not accepted here: reads are not attributed to a seat (identity binds sending and following, not observing), so drop the flag and the command works unchanged",
      });
      process.exit(1);
    }
    const { config, configSearch } = loadTeam();
    const channel = resolveChannel(config, ctx.args.channel);
    if (!config || !channel) {
      // Same locator discipline as `send`: the config layer's own message, which
      // names where the walk started — not a rebuilt path it never checked.
      emitError({
        format,
        command: "comms read",
        error: `no team config found — cannot resolve a channel. ${configSearch}`.trim(),
      });
      process.exit(1);
    }

    let messages: CommsMessage[];
    let warnings: string[];
    try {
      const log = readChannel(config.teamDirPath(), channel);
      messages = log.messages;
      warnings = log.warnings;
    } catch (err) {
      emitError({ format, command: "comms read", error: (err as Error).message });
      process.exit(1);
    }

    // Exactly-one is a first-class operation, not a range with a caveat: any
    // `--since` window runs to now, so on a channel peers are still writing to
    // it will eventually contain someone else's message.
    // Both id flags are VALIDATED before use. `Number("#14")` is NaN, and NaN
    // poisons the two flags in opposite ways: `--id` reported `no message #NaN`
    // (leaking the failure of the parse as if it were the id you asked for),
    // while every `m.id > NaN` is false, so `--since "#14"` returned zero
    // messages with `ok:true` and exit 0 — **byte-indistinguishable from a quiet
    // channel**, which is the one failure this wire cannot afford.
    //
    // `#14` is not an exotic typo: the team's read-watermark convention is
    // written exactly that way ("ratifying as of #14"), so pasting it is the
    // natural mistake. Accept it, rather than only rejecting it.
    const readId = (raw: string, flag: string): number => {
      const n = Number(raw.trim().replace(/^#/, ""));
      if (!Number.isInteger(n) || n < 0) {
        emitError({
          format,
          command: "comms read",
          error: `${flag} needs a message id, got "${raw}". Ids are whole numbers — "${flag} 14" or "${flag} #14".`,
        });
        process.exit(1);
      }
      return n;
    };

    /**
     * `--id`, `--since` and `--last` are three answers to one question — WHICH
     * messages — so combining them is refused rather than resolved by a silent
     * precedence rule. A flag that is accepted and then quietly ignored while
     * the command still reports `ok` is this tool's recurring defect class (a
     * channel name stored as a message body; `--since '#14'` yielding NaN and
     * an empty-looking success). The caller who typed two windows has a wrong
     * model of one of them, and only an error tells them which.
     */
    const windows = (["id", "since", "last"] as const).filter(
      (flag) => ctx.args[flag] !== undefined,
    );
    if (windows.length > 1) {
      emitError({
        format,
        command: "comms read",
        error:
          `${windows.map((f) => `--${f}`).join(" and ")} cannot be combined — ` +
          "each selects a different window (--id one message, --since everything after an id, " +
          "--last the most recent N). Pick one; nothing was read.",
      });
      process.exit(1);
    }

    /**
     * A count, not an id — so it gets its own validator rather than borrowing
     * `readId`. `--last 0` is refused: it would return an empty list and read
     * as a quiet channel, which is precisely the ambiguity `--last` was added
     * to remove.
     */
    const lastN = (() => {
      if (ctx.args.last === undefined) return undefined;
      const raw = String(ctx.args.last);
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1) {
        emitError({
          format,
          command: "comms read",
          error: `--last needs a whole number of messages (1 or more), got "${raw}".`,
        });
        process.exit(1);
      }
      return n;
    })();

    const one = ctx.args.id === undefined ? undefined : readId(String(ctx.args.id), "--id");
    if (one !== undefined) {
      const found = messages.find((m) => m.id === one);
      if (!found) {
        emitError({ format, command: "comms read", error: `no message #${one} in ${channel}` });
        process.exit(1);
      }
      messages = [found];
    } else if (ctx.args.since !== undefined) {
      const since = readId(String(ctx.args.since), "--since");
      messages = messages.filter((m) => m.id > since);
    } else if (lastN !== undefined) {
      messages = messages.slice(-lastN);
    }

    const data: ReadData = { channel, messages, ...(warnings.length > 0 && { warnings }) };
    emit({
      format,
      command: "comms read",
      data,
      startedAt: started,
      renderText: (d) =>
        d.messages.map((m) => `#${m.id} ${m.from} (${m.role}):\n${m.text}`).join("\n\n"),
    });
  },
});

// --- follow (STREAMS — never terminates) ------------------------------------

const POLL_MS = 400;

/**
 * Record how far this follower has EMITTED. Written atomically (tmp + rename)
 * because `follow` is long-lived and can be killed at any instant — including
 * mid-write, which is the exact scenario this whole primitive exists to make
 * visible. A torn position file would make the instrument fail in the same way
 * as the thing it measures, and be indistinguishable from it.
 *
 * Failure here is deliberately SWALLOWED. Position is diagnostic metadata; the
 * stream is the product. A read-only or full disk must not take down a seat's
 * wire in order to protect the ability to notice that a seat's wire went down.
 */
/** This seat's last recorded position, or null if it has never followed. A
 * damaged file is treated as null: an unreadable position is not evidence of a
 * position, and the notice below must not report a gap it invented. */
function readPosition(teamDir: string, channel: string, handle: string): SeatPosition | null {
  try {
    const path = commsPositionPath(teamDir, channel, handle);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as SeatPosition;
  } catch {
    return null;
  }
}

/**
 * What `follow` announces before it streams a single message.
 *
 * The failure this closes, stated as it was costed: *a re-armed monitor cannot
 * tell whether it missed nothing or missed forty messages.* That is an
 * INFORMATION gap, not a replay gap — so `follow` reports it and `read` fills
 * it. `follow` still cannot terminate and still cannot serve a range.
 *
 * Deliberately NOT `follow --since <id>`: a bounded-looking flag on an endless
 * stream is the anthill#54 trap, where catch-up returns nothing and then times
 * out, which reads as an empty channel. The guardrail lives in the verb surface
 * precisely because prose warnings against it have already failed.
 *
 * `catchUpWith` is a fully-resolved command string, not a description
 * (Contract 4(d): exemplify the dialogue, never the invocation). It is
 * explicitly `null` rather than omitted when there is no gap — "told there is
 * none" and "wasn't told anything" must not look alike.
 */
interface FollowStartData {
  notice: "follow-start";
  channel: string;
  from: string;
  role: string;
  /** never-followed · current · behind — the same three states as the primitive. */
  position: PositionState["state"];
  /** Highest id in the log at the instant this follower attached. */
  head: number;
  previousPosition: number | null;
  /**
   * How many messages this seat was not emitted — `0` when provably none, a
   * count when behind, and **`null` when it cannot be known**.
   *
   * `null` is the `never-followed` case and it is not a rounding-down of zero.
   * With no recorded position the tool has no idea what this seat has seen: it
   * may have read the whole log with `read`, which records nothing by design
   * (Contract 4 c-bis). Reporting `gap: 0` there would assert *"you missed
   * nothing"* — the one claim the tool is not entitled to make, on the wire
   * whose entire purpose is to stop silence being mistaken for safety.
   * Caught by maestro on comms #184 against the first shipped version, which
   * flattened three states into a number: `positionState` was honest and this
   * notice was not.
   */
  gap: number | null;
  catchUpWith: string | null;
}

function recordPosition(teamDir: string, channel: string, handle: string, emittedThrough: number) {
  try {
    const path = commsPositionPath(teamDir, channel, handle);
    mkdirSync(dirname(path), { recursive: true });
    const position: SeatPosition = {
      handle,
      channel,
      emittedThrough,
      // Epoch, NOT `nowMillis()` — see the SeatPosition docblock.
      at: Date.now(),
      pid: process.pid,
    };
    const tmp = `${path}.${process.pid}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(position)}\n`, "utf8");
    renameSync(tmp, path);
  } catch {
    // Intentionally silent: see above.
  }
}

const followCommand = defineCommand({
  meta: {
    name: "follow",
    description: "Stream new messages as they arrive (live — never exits)",
  },
  args: {
    channel: { type: "positional", description: "Channel", required: false },
    as: {
      type: "string",
      description: "Your seat handle (must be in the roster)",
      valueHint: "handle",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const format = resolveFormat(ctx.args.format);
    const { config, configSearch } = loadTeam();

    const identity = identify(config, configSearch, ctx.args.as);
    if (identity.outcome !== "resolved-from-roster") {
      emitError({ format, command: "comms follow", error: identity.error });
      process.exit(1);
    }

    const channel = resolveChannel(config, ctx.args.channel);
    if (!config || !channel) {
      emitError({ format, command: "comms follow", error: "no channel resolved" });
      process.exit(1);
    }

    const teamDir = config.teamDirPath();
    const path = commsLogPath(teamDir, channel);
    // Start from the current end: `follow` shows what happens FROM NOW. It has
    // no flag to replay history — that is `read`'s job, and the separation is
    // the point.
    let offset = existsSync(path) ? statSync(path).size : 0;

    // Announce the gap BEFORE streaming. This is the whole of `t-892c1d8e`:
    // a re-armed follower must not be unable to tell "missed nothing" from
    // "missed forty". It reports; it does not replay.
    {
      const head = nextMessageId(readChannel(teamDir, channel).messages) - 1;
      const previous = readPosition(teamDir, channel, identity.handle);
      const state = positionState(head, previous);
      // never-followed ⇒ null (unknowable), current ⇒ 0 (provably none),
      // behind ⇒ the count. Three states in, three values out — the notice must
      // not collapse what the primitive distinguishes.
      const gap = state.state === "behind" ? state.behindBy : state.state === "current" ? 0 : null;
      const start: FollowStartData = {
        notice: "follow-start",
        channel,
        from: identity.handle,
        role: identity.role,
        position: state.state,
        head,
        previousPosition: previous?.emittedThrough ?? null,
        gap,
        // STRICTLY "the command that fetches exactly what you missed". Null
        // whenever that set is not computable — including never-followed, where
        // offering a `--last N` here would look like the missed set and be a
        // guess wearing the same clothes. The text rendering suggests how to
        // establish an anchor; this field never guesses.
        catchUpWith:
          gap !== null && gap > 0 && previous
            ? `anthill comms read --channel ${channel} --since ${previous.emittedThrough}`
            : null,
      };
      emit({
        format,
        command: "comms follow",
        data: start,
        // Three states, three sentences. The human-facing rendering is where a
        // collapse is least visible and most consequential, so `null` gets its
        // own wording rather than falling into the "no gap" branch.
        renderText: (d) => {
          const lead = `following ${d.channel} as ${d.from}`;
          if (d.gap === null) {
            return (
              `${lead} — NO RECORDED POSITION (head #${d.head}).\n` +
              "This tool cannot tell you what you have already seen, and is not going to guess.\n" +
              `Establish an anchor with: anthill comms read --channel ${d.channel} --last 20\n`
            );
          }
          if (d.gap > 0) {
            return (
              `${lead} — YOU MISSED ${d.gap} message(s) (#${d.previousPosition} → #${d.head}).\n` +
              `catch up with: ${d.catchUpWith}\n`
            );
          }
          return `${lead} — up to date, nothing missed (head #${d.head}).\n`;
        },
      });
    }

    // No keepalive frames. A quiet channel is simply quiet, so the emitted
    // incantation needs no filter and "run it verbatim" is literally true.
    for (;;) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      if (!existsSync(path)) continue;
      const size = statSync(path).size;
      if (size <= offset) {
        // Truncated or replaced underneath us — resync rather than emit garbage.
        if (size < offset) offset = size;
        continue;
      }
      // Read as BYTES and slice by BYTES. `statSync().size` is a byte count;
      // `readFileSync(path,"utf8").slice(n)` indexes UTF-16 code units. Those
      // agree only while every byte written is ASCII — so the FIRST message
      // containing an emoji, accent or non-Latin script pushed the offset past
      // the end of the decoded string and `follow` returned "" forever. Silent,
      // permanent, and indistinguishable from a quiet channel.
      const buf = readFileSync(path);
      // Consume only up to the last COMPLETE line: a partial trailing line is a
      // write still in flight, not corruption. Leave it for the next poll
      // rather than hand `parseLog` a truncated record it would drop.
      const lastNewline = buf.lastIndexOf(0x0a);
      if (lastNewline < offset) continue;
      const chunk = buf.subarray(offset, lastNewline + 1).toString("utf8");
      offset = lastNewline + 1;
      let highestEmitted = 0;
      for (const message of parseLog(chunk).messages) {
        // Stream through `emit`, NOT `encodeMessage`. A raw record has no `ok`
        // and no `meta`, so an agent branching on `.ok` gets `undefined` on every
        // message — and this is the most-executed comms command in the product:
        // `buildCommsIncantation` emits it with no `--format`, `join` puts that
        // string in every seat's manifest, and piped ⇒ json. The whole team was
        // consuming non-envelopes.
        //
        // One envelope PER MESSAGE (NDJSON), which is what a stream of
        // independent records means here — not one envelope wrapping the stream,
        // which could only be closed when the stream ends, and this one never does.
        // No `startedAt`: a per-message `durationMs` measured from process start
        // would grow without bound and describe the wait, not the work.
        emit({
          format,
          command: "comms follow",
          data: message,
          renderText: (m) => `#${m.id} ${m.from} (${m.role}):\n${m.text}\n`,
        });
        if (message.id > highestEmitted) highestEmitted = message.id;
      }
      // AFTER the emits, and only on a real delta — never on a timer. A position
      // written before the message it claims would assert an emit that had not
      // happened yet, which is the delivered-vs-emitted error one layer down.
      // Once per batch rather than once per message: same final value, and it
      // keeps a burst of traffic from becoming a burst of fsyncs.
      if (highestEmitted > 0) recordPosition(teamDir, channel, identity.handle, highestEmitted);
    }
  },
});

interface PositionsData {
  channel: string;
  head: number;
  seats: SeatPositionRow[];
  warnings?: string[];
}

/**
 * `anthill comms positions` — the CROSS-SEAT read of the `emittedThrough` files
 * that already existed. H12's direct test: the data was on disk all along and
 * the missing thing was a NAME for it, so every seat who wanted this answer
 * hand-rolled a `cat`-and-compare over a private path.
 *
 * IDENTITY: no `--as`, and that is a decision rather than an omission
 * (Contract 4(c-bis)). Identity binds the verbs that ATTRIBUTE — `send` puts a
 * name on a durable artifact, `follow` registers a live participant. This one
 * observes and attributes nothing, and it is the verb you reach for when you
 * suspect your OWN wire is dead, which is exactly when requiring a resolved
 * seat would be worst.
 *
 * It reports EMITTED, never delivered (Contract 6(a)), and it can only convict
 * a follower once somebody sends — on a silent channel every wire looks alike,
 * healthy or dead.
 */
const positionsCommand = defineCommand({
  meta: {
    name: "positions",
    description:
      "Where every seat stands on the channel (three states — null/0/N, never flattened)",
  },
  args: {
    channel: {
      type: "string",
      description: "Channel (default: config.channel)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
    as: {
      type: "string",
      refused:
        "positions are not attributed to a seat (identity binds sending and following, not observing)",
    },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    if (ctx.args.as !== undefined) {
      emitError({
        format,
        command: "comms positions",
        error:
          "`--as` is not accepted here: positions are not attributed to a seat (identity binds sending and following, not observing), so drop the flag and the command works unchanged",
      });
      process.exit(1);
    }
    const { config, configSearch } = loadTeam();
    const channel = resolveChannel(config, ctx.args.channel);
    if (!config || !channel) {
      emitError({
        format,
        command: "comms positions",
        error: `no team config found — cannot resolve a channel. ${configSearch}`.trim(),
      });
      process.exit(1);
    }

    let head: number;
    let warnings: string[];
    try {
      const log = readChannel(config.teamDirPath(), channel);
      head = log.messages.length > 0 ? (log.messages.at(-1)?.id ?? 0) : 0;
      warnings = log.warnings;
    } catch (err) {
      emitError({ format, command: "comms positions", error: (err as Error).message });
      process.exit(1);
    }

    const positions = new Map(
      config.seats.map((s) => [s.handle, readPosition(config.teamDirPath(), channel, s.handle)]),
    );
    // Advisory liveness. `process.kill(pid, 0)` throws ESRCH for a dead pid and
    // EPERM for one we may not signal — EPERM means it EXISTS, so that branch is
    // alive, not unknown. Anything else we decline to guess about.
    const alive = (pid: number): boolean | null => {
      try {
        process.kill(pid, 0);
        return true;
      } catch (err) {
        return (err as NodeJS.ErrnoException).code === "ESRCH"
          ? false
          : (err as NodeJS.ErrnoException).code === "EPERM"
            ? true
            : null;
      }
    };

    emit({
      format,
      command: "comms positions",
      data: {
        channel,
        head,
        seats: buildPositionsReport(head, config.seats, positions, alive),
        ...(warnings.length > 0 && { warnings }),
      } satisfies PositionsData,
      startedAt: started,
      renderText: (d) => {
        const lines = [`Channel: ${d.channel} · head #${d.head}`];
        for (const s of d.seats) {
          // Each state gets its OWN sentence. A single template with a number in
          // it is where null becomes 0 and "never followed" becomes "caught up".
          const where =
            s.state === "never-followed"
              ? "never followed — no position recorded, so this tool does not know what it has seen"
              : s.state === "current"
                ? `current (through #${s.emittedThrough})`
                : `BEHIND by ${s.gap} (emitted through #${s.emittedThrough})`;
          const follower = s.followerAlive === false ? " · recording follower is GONE" : "";
          lines.push(`  ${s.handle} (${s.role}): ${where}${follower}`);
        }
        lines.push(
          "Reports what was EMITTED to each seat, not what arrived — and it can only convict a follower once someone sends.",
        );
        if (d.warnings?.length) for (const w of d.warnings) lines.push(`⚠ ${w}`);
        return lines.join("\n");
      },
    });
  },
});

export const teamCommsCommand = defineAnthillCommand({
  meta: {
    name: "comms",
    description: "The team's seat-aware message log (send / read / follow)",
    scope: "workspace",
  },
  subCommands: {
    send: sendCommand,
    read: readCommand,
    follow: followCommand,
    positions: positionsCommand,
  },
});

export { buildCommsIncantation };

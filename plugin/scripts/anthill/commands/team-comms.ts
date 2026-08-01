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

import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import {
  buildCommsIncantation,
  type CommsMessage,
  commsLogPath,
  encodeMessage,
  type IdentityResult,
  nextMessageId,
  parseLog,
  resolveSeatIdentity,
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
      message = {
        id: nextMessageId(readChannel(teamDir, channel).messages),
        channel,
        from: identity.handle,
        role: identity.role,
        text,
        ts: Date.now(),
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

    const path = commsLogPath(config.teamDirPath(), channel);
    // Start from the current end: `follow` shows what happens FROM NOW. It has
    // no flag to replay history — that is `read`'s job, and the separation is
    // the point.
    let offset = existsSync(path) ? statSync(path).size : 0;

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
      }
    }
  },
});

export const teamCommsCommand = defineAnthillCommand({
  meta: {
    name: "comms",
    description: "The team's seat-aware message log (send / read / follow)",
    scope: "workspace",
  },
  subCommands: { send: sendCommand, read: readCommand, follow: followCommand },
});

export { buildCommsIncantation };

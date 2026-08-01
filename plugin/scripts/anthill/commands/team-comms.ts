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
  unknownFlags,
} from "../comms.ts";
import { ConfigError, loadConfig, type ResolvedConfig } from "../config.ts";
import { defineAnthillCommand, defineCommand } from "../define.ts";
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

/**
 * Reject undeclared flags before ANY side effect. `strict: false` on the shared
 * parser means an unknown flag is otherwise dropped and the verb reports
 * success — so the guard has to live at the top of each verb, and it has to
 * name the valid flags (a bare rejection is the anthill#54 shape again).
 */
function rejectUnknownFlags(
  format: ReturnType<typeof resolveFormat>,
  command: string,
  rawArgs: string[],
  known: string[],
): void {
  const bad = unknownFlags(rawArgs, known);
  if (bad.length === 0) return;
  // `--as` on a non-attributing verb is the ONE rejection a seat will read as a
  // lost capability rather than a mistake — every neighbouring tool (grapevine,
  // bounty) takes `--as` on every verb, so reaching for it here is a reasonable
  // analogy, not carelessness. It was previously swallowed in silence, which
  // made the call LOOK seat-scoped when it never was. So this one explains.
  const why = bad.includes("--as")
    ? " — `--as` is not accepted here: reads are not attributed to a seat (identity binds sending and following, not observing), so drop the flag and the command works unchanged"
    : "";
  emitError({
    format,
    command,
    error: `unknown flag(s): ${bad.join(", ")}. Valid flags: ${known.map((k) => `--${k}`).join(", ")}${why}`,
  });
  process.exit(1);
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
    rejectUnknownFlags(format, "comms send", ctx.rawArgs, ["as", "channel", "stdin", "format"]);
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
    let existing: CommsMessage[];
    let warnings: string[];
    try {
      const log = readChannel(teamDir, channel);
      path = log.path;
      existing = log.messages;
      warnings = log.warnings;
    } catch (err) {
      emitError({ format, command: "comms send", error: (err as Error).message });
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

    const message: CommsMessage = {
      id: nextMessageId(existing),
      channel,
      from: identity.handle,
      role: identity.role,
      text,
      ts: Date.now(),
    };

    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${encodeMessage(message)}\n`, "utf8");

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
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    rejectUnknownFlags(format, "comms read", ctx.rawArgs, ["channel", "since", "id", "format"]);
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
    const one = ctx.args.id === undefined ? undefined : Number(ctx.args.id);
    if (one !== undefined) {
      const found = messages.find((m) => m.id === one);
      if (!found) {
        emitError({ format, command: "comms read", error: `no message #${one} in ${channel}` });
        process.exit(1);
      }
      messages = [found];
    } else if (ctx.args.since !== undefined) {
      const since = Number(ctx.args.since);
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
    rejectUnknownFlags(format, "comms follow", ctx.rawArgs, ["as", "format"]);
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
      const chunk = readFileSync(path, "utf8").slice(offset);
      offset = size;
      for (const message of parseLog(chunk).messages) {
        process.stdout.write(
          format === "text"
            ? `#${message.id} ${message.from} (${message.role}):\n${message.text}\n\n`
            : `${encodeMessage(message)}\n`,
        );
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

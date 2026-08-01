/**
 * Dual-audience output layer. Every command runs through `emit` / `emitError`.
 *
 * Contract:
 *   - Humans (TTY): `renderText(data)` is written to stdout.
 *   - Agents (pipe or --format json): a stable envelope is written to stdout.
 *     Success: { ok: true, data, meta: { command, durationMs? } }
 *     Error:   { ok: false, error, meta: { command } }
 *
 * Rules:
 *   - Errors go to stderr. Successes go to stdout.
 *   - One trailing newline per emit (NDJSON friendly).
 *   - Never emit ANSI in JSON mode. ANSI lives only inside `renderText`.
 *   - In JSON mode, attach non-fatal notices to `data.warnings: string[]` —
 *     do NOT print warnings to stderr (it pollutes captured streams).
 */

import { nowMillis } from "./runtime.ts";

export type OutputFormat = "text" | "json";

export interface OutputMeta {
  command: string;
  durationMs?: number;
  /**
   * Stack trace for an UNEXPECTED (non-usage) failure. Lives on `meta` — not as
   * a new top-level field — because the envelope's top-level keys are TOTAL
   * (same shape on every path) and `meta` is the variable bag. Text mode still
   * prints the stack verbatim; this is how the JSON path preserves it instead of
   * flattening it away.
   */
  stack?: string;
}

export interface OutputEnvelope<T> {
  ok: true;
  data: T;
  meta?: OutputMeta;
}

export interface ErrorEnvelope {
  ok: false;
  error: string;
  meta?: OutputMeta;
}

/** Priority: explicit --format wins, else TTY → text, pipe → json. */
export function resolveFormat(flagFormat?: string): OutputFormat {
  if (flagFormat === "json" || flagFormat === "text") return flagFormat;
  return process.stdout.isTTY ? "text" : "json";
}

/**
 * Recover the `--format` VALUE straight from argv, for the one caller that
 * cannot get it from `ctx.args`: the top-level catch, which handles errors the
 * PARSER raised — i.e. before any `ctx` exists.
 *
 * Returns the raw value (or undefined) so the caller feeds it through
 * `resolveFormat` itself. Deliberately NOT a `=== "json"` test: matching the
 * literal string would repair only the explicit-flag rows and leave
 * no-flag-piped broken — and that row matters most, because `resolveFormat`
 * already defaults piped → json and anthill's own emitted incantations pass no
 * `--format` at all. The invariant is that the format decision must not depend
 * on WHERE the error was raised, which means reusing the same resolver, TTY
 * heuristic included.
 *
 * Accepts both spellings: `--format json` and `--format=json`.
 */
export function sniffFormatFlag(rawArgs: string[]): string | undefined {
  // LAST match wins, not the first. `util.parseArgs` resolves a repeated
  // non-`multiple` string option to its final occurrence, so returning the first
  // makes this sniff DISAGREE with the parse it is standing in for — and the
  // whole point of sniffing is that the format verdict must not depend on where
  // the error was raised. Measured before fixing:
  //   status --nope --format text --format json  -> usage block  (first: "text")
  //   status       --format text --format json  -> json envelope (parser: "json")
  // Same argv, two different verdicts, decided by which code path saw it.
  let found: string | undefined;
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    if (arg === "--") break;
    if (arg.startsWith("--format=")) found = arg.slice("--format=".length);
    else if (arg === "--format") found = rawArgs[i + 1];
  }
  return found;
}

export function emit<T>(options: {
  format: OutputFormat;
  command: string; // space-joined path, e.g. "library list"
  data: T;
  renderText: (data: T) => string;
  startedAt?: number; // from nowMillis() at the top of run()
}): void {
  if (options.format === "text") {
    const text = options.renderText(options.data);
    if (text) process.stdout.write(`${text}\n`);
    return;
  }
  const envelope: OutputEnvelope<T> = {
    ok: true,
    data: options.data,
    meta: {
      command: options.command,
      ...(options.startedAt !== undefined && {
        durationMs: Math.round(nowMillis() - options.startedAt),
      }),
    },
  };
  process.stdout.write(`${JSON.stringify(envelope)}\n`);
}

export function emitError(options: {
  format: OutputFormat;
  command: string;
  error: string;
  /** Only for unexpected failures — see `OutputMeta.stack`. */
  stack?: string;
}): void {
  if (options.format === "text") {
    process.stderr.write(`Error: ${options.error}\n`);
    return;
  }
  const envelope: ErrorEnvelope = {
    ok: false,
    error: options.error,
    meta: {
      command: options.command,
      ...(options.stack !== undefined && { stack: options.stack }),
    },
  };
  process.stderr.write(`${JSON.stringify(envelope)}\n`);
}

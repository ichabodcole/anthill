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
}): void {
  if (options.format === "text") {
    process.stderr.write(`Error: ${options.error}\n`);
    return;
  }
  const envelope: ErrorEnvelope = {
    ok: false,
    error: options.error,
    meta: { command: options.command },
  };
  process.stderr.write(`${JSON.stringify(envelope)}\n`);
}

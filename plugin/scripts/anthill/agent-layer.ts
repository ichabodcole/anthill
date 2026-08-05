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
   * The stack of an UNEXPECTED throw (a bug), preserved so an agent-mode failure
   * is still debuggable. Deliberately on `meta`, not a top-level envelope field:
   * top-level fields are TOTAL (same shape on every path), so an absent one would
   * carry meaning with nothing to read that meaning by. `meta` already varies
   * (`durationMs` comes and goes), which is what makes a sometimes-key correct here.
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

/**
 * Priority: explicit --format wins, else TTY → text, pipe → json.
 *
 * **The RULE is unchanged** — this is `seams.md` Contract 5(c)'s subject and
 * that clause stays true word for word: the envelope is conditional on **not
 * being a TTY**, never on `--format`, and our emitted invocations pass no
 * `--format`. Only the SOURCE of the TTY value became injectable.
 *
 * Why it had to: this function took the **flag** as a parameter and reached for
 * the **TTY** as a global, so half the dual-audience matrix was permanently
 * untestable — `Bun.spawnSync` always yields a pipe, so no test in the suite
 * could ever exercise the TTY branch. *"A human at a terminal still gets usage"*
 * was a shipped guarantee with no automated guard, verified once by hand with
 * `script -q /dev/null` and never again. A refactor could have broken it with
 * every test green.
 *
 * `isTTY` is OPTIONAL rather than threaded through all 21 call sites: on a
 * shared tree, correctness at every call site is not worth a 21-file diff
 * mid-session, and the default keeps production behaviour byte-identical while
 * making the branch reachable from a test.
 */
export function resolveFormat(flagFormat?: string, isTTY?: boolean): OutputFormat {
  if (flagFormat === "json" || flagFormat === "text") return flagFormat;
  return (isTTY ?? process.stdout.isTTY === true) ? "text" : "json";
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
  /** Only for an unexpected throw — see {@link OutputMeta.stack}. */
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

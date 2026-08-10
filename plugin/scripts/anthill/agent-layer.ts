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

import { fileURLToPath } from "node:url";

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

/**
 * Refuse a flag this verb RECOGNISES but does not do — the `refused` half of an
 * arg def (`define.ts`), enforced.
 *
 * The parser registers a refused flag (so it never reads as "unknown") and hides
 * it from the advertised set, but does NOT reject it: a usage error under
 * `--format json` must stay a clean `{ok:false}` envelope rather than becoming
 * usage text. So the command owns the refusal, and this is that refusal, once —
 * with the SAME reason string the arg def carries, passed in rather than
 * restated, because a refusal whose two halves disagree teaches the wrong thing.
 */
export function refuseArg(opts: {
  format: OutputFormat;
  command: string;
  flag: string;
  value: unknown;
  why: string;
}): void {
  if (opts.value === undefined) return;
  emitError({
    format: opts.format,
    command: opts.command,
    error: `\`${opts.flag}\` is not accepted here. ${opts.why}. Drop the flag and the command works unchanged.`,
  });
  process.exit(1);
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
  // ⚠ `ok: false` IS LOAD-BEARING FOR A REASON NOBODY DESIGNED IT FOR — do not
  // "simplify" it away, and do not let it become decoration.
  //
  // **The envelope is the only failure signal that survives how agents actually
  // invoke a CLI. The exit code is not.** Measured on this CLI:
  //
  //     anthill comms send --as <bogus>            -> exit 1   ✅
  //     anthill comms send --as <bogus> | head     -> exit 0   🔴 masked
  //     R=$(anthill comms send --as <bogus>)       -> exit 1   ✅
  //
  // A pipeline reports its LAST command's status; command substitution preserves
  // the real one. **So "agents lose the exit code" is false — they lose it
  // depending on a construction nobody chooses deliberately**, which works until
  // it does not. Through that pipe, this envelope still arrived with `ok: false`
  // and the error string intact: the agent lost the code and lost nothing.
  //
  // The counter-example is spellbook's, measured on their tree the same night:
  // `ok: true` 112 times, `ok: false` **zero** — failures print prose to stderr
  // and exit non-zero, so a piping agent gets `ok: true` and exit 0. **Not a
  // degraded signal. No signal, and a positively reassuring one.** They
  // reclassified their missing error envelope from deferred to BLOCKING on this.
  //
  // 🔴 `A MASK IS NOT A DEPENDENCY` (principles.md): a reasonable "unify our
  // response shape" or "drop the redundant ok" change removes the only thing that
  // survives the pipe, **and nothing announces it** — every test that reads the
  // envelope directly still passes, because they do not pipe.
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

/**
 * The `cli.ts` that EMITTED this string — never a bare `anthill`.
 *
 * ⚠ USE THIS IN ANYTHING AN AGENT RE-INVOKES. A bare `anthill` resolves through
 * PATH to the optional global launcher, which picks the highest CACHED RELEASE,
 * so a string a seat runs verbatim can execute on a *different binary than the
 * one that composed it* — and a flag the composer has may not exist there.
 *
 * ⚠ DO **NOT** USE IT IN `renderText`. That is the HUMAN half of the envelope
 * (`resolveFormat` returns "text" only for a TTY), and a person typing
 * `anthill attach` WANTS PATH resolution — that is what the optional global
 * launcher is for. Resolving there hands them an absolute path into a plugin
 * cache. `bare-anthill.guard.test.ts` enforces both halves.
 */
export function emittingCli(): string {
  return `bun ${fileURLToPath(new URL("./cli.ts", import.meta.url))}`;
}

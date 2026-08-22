/**
 * Zero-dependency command layer for the anthill CLI.
 *
 * Replaces citty: the shipped CLI is raw `.ts` with no external runtime deps
 * (only `node:*` builtins). This module owns the command *shape* (types +
 * `defineCommand` / `defineAnthillCommand`) AND the tiny runner that parses
 * argv (via `node:util` `parseArgs`), coerces typed args, assembles `ctx`, and
 * dispatches to `run(ctx)` / subcommands.
 *
 * The `ctx.args` contract is preserved byte-for-byte from the citty era so no
 * command body needed editing:
 *   - `ctx.args.<name>` per declared arg (typed via the ArgsDef generic)
 *   - `ctx.args._` — the full positionals list
 *   - named positional args (e.g. `handle`) also get their value
 *
 * Scope semantics (unchanged):
 * - `workspace` — operates on the filesystem / local config; no API dependency
 * - `app`       — operates on the running API; requires a bearer token
 *
 * To add a new scope: extend `AnthillCommandScope` below, then update
 * `SCOPE_LABELS` / `SCOPE_SUBTITLES` in help-renderer.ts. TypeScript will
 * surface every call site that needs the new label.
 */

import { parseArgs as nodeParseArgs } from "node:util";

// ---------------------------------------------------------------------------
// Arg + command types (ported from citty's public type surface so command
// bodies type-check unchanged).
// ---------------------------------------------------------------------------

export type ArgType = "boolean" | "string" | "positional" | "positionals" | undefined;

interface BaseArgDef<T extends ArgType, VT extends boolean | string> {
  type?: T;
  description?: string;
  valueHint?: string;
  alias?: string | string[];
  default?: VT;
  required?: boolean;
  /** A flag the command RECOGNISES but deliberately REFUSES. Distinct from an
   * unknown flag: `--as` on `comms read` is not a typo, it is a coherent thing to
   * try that this verb does not do. The generic "Unknown option" is correct and
   * useless there — it names the valid set but not WHY yours was refused, which
   * is the inference that makes a seat conclude the tool is broken (anthill#54).
   *
   * A refused arg is REGISTERED with the parser (so it never reads as "unknown")
   * and EXCLUDED from the advertised valid set (so we don't offer a flag we
   * reject) — but it is NOT rejected here. The value reaches `ctx.args` and the
   * command refuses it through its own dual-audience envelope, because a usage
   * error under `--format json` must stay a clean `{ok:false}` envelope rather
   * than becoming usage text. */
  refused?: string;
}

export type BooleanArgDef = Omit<BaseArgDef<"boolean", boolean>, never>;
export type StringArgDef = BaseArgDef<"string", string>;
export type PositionalArgDef = Omit<BaseArgDef<"positional", string>, "alias">;
/**
 * A command that takes an OPEN-ENDED list of positionals (`commit -- <paths…>`,
 * `spawn <handles…>`, `feedback <message…>`) declares it with this.
 *
 * It exists because the guard's criterion has two conjuncts — *declares no
 * positional* AND *never consumes `ctx.args._`* — and only the first is visible
 * at parser altitude: `parseArgs` sees the arg spec, never the function body.
 * Implementing conjunct one alone caught `commit`, `spawn` and `feedback`, i.e.
 * broke the land path for every seat. So the exceptions DECLARE themselves here
 * rather than being inferred, and `--help` gains somewhere to say a command
 * takes free-form arguments instead of silently eating them.
 */
export type PositionalsArgDef = Omit<BaseArgDef<"positionals", string>, "alias">;
export type ArgDef = BooleanArgDef | StringArgDef | PositionalArgDef | PositionalsArgDef;
export type ArgsDef = Record<string, ArgDef>;

type ResolveParsedArgType<T extends ArgDef, VT> = T extends {
  default?: unknown;
  required?: boolean;
}
  ? T["default"] extends NonNullable<VT>
    ? VT
    : T["required"] extends true
      ? VT
      : VT | undefined
  : VT | undefined;

type ParsedPositionalArg<T extends ArgDef> = T extends { type: "positional" }
  ? ResolveParsedArgType<T, string>
  : never;
type ParsedStringArg<T extends ArgDef> = T extends { type: "string" }
  ? ResolveParsedArgType<T, string>
  : never;
type ParsedBooleanArg<T extends ArgDef> = T extends { type: "boolean" }
  ? ResolveParsedArgType<T, boolean>
  : never;

type ParsedArg<T extends ArgDef> = T["type"] extends "positionals"
  ? string[]
  : T["type"] extends "positional"
    ? ParsedPositionalArg<T>
    : T["type"] extends "boolean"
      ? ParsedBooleanArg<T>
      : T["type"] extends "string"
        ? ParsedStringArg<T>
        : never;

export type ParsedArgs<T extends ArgsDef = ArgsDef> = { _: string[] } & {
  [K in keyof T]: ParsedArg<T[K]>;
} & {
  [K in keyof T as T[K] extends { alias: string } ? T[K]["alias"] : never]: ParsedArg<T[K]>;
} & {
  [K in keyof T as T[K] extends { alias: string[] } ? T[K]["alias"][number] : never]: ParsedArg<
    T[K]
  >;
} & Record<string, string | boolean | string[]>;

export type AnthillCommandScope = "workspace" | "app";

export interface CommandMeta {
  name?: string;
  version?: string;
  description?: string;
  scope?: AnthillCommandScope;
  deprecated?: boolean;
  hidden?: boolean;
}

/** A top-level group's meta requires `scope` (surfaced by help + manifest). */
export interface AnthillMeta extends CommandMeta {
  name: string;
  description: string;
  scope: AnthillCommandScope;
}

export interface CommandContext<T extends ArgsDef = ArgsDef> {
  rawArgs: string[];
  args: ParsedArgs<T>;
  cmd: CommandDef<T>;
}

export interface CommandDef<T extends ArgsDef = ArgsDef> {
  meta?: CommandMeta;
  args?: T;
  subCommands?: Record<string, AnyCommand>;
  run?(ctx: CommandContext<T>): unknown | Promise<unknown>;
}

/**
 * A command with its arg generic erased. `ParsedArgs<T>` intersects a precise
 * per-key map with a broad string index signature, which makes any two distinct
 * `CommandDef<T>` mutually non-assignable — so storing a leaf command in a
 * parent's `subCommands` (or handing it to the runner) needs the generic gone.
 * The `any` is contained to this single alias (citty needed the same escape).
 */
// biome-ignore lint/suspicious/noExplicitAny: intentional generic erasure — see above.
export type AnyCommand = CommandDef<any>;

/**
 * Define a leaf/subcommand. Identity function — the `const T` generic captures
 * the arg literals so `ctx.args` typing flows through precisely.
 */
export function defineCommand<const T extends ArgsDef = ArgsDef>(
  def: CommandDef<T>,
): CommandDef<T> {
  return def;
}

/**
 * Define a top-level command group. Requires `scope` on meta so the grouped
 * help renderer and manifest can surface the workspace/app split.
 */
export function defineAnthillCommand<const T extends ArgsDef = ArgsDef>(
  input: CommandDef<T> & { meta: AnthillMeta },
): CommandDef<T> {
  return input;
}

// ---------------------------------------------------------------------------
// Runner.
// ---------------------------------------------------------------------------

/** Signals a usage error — the dispatcher renders usage + this message, exit 1. */
export class CLIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CLIError";
  }
}

function toArray(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v;
  return v === undefined ? [] : [v];
}

/**
 * Parse `rawArgs` against a command's arg spec into the `ctx.args` object.
 * Mirrors citty's coercion: known flags are typed string/boolean, `--no-<flag>`
 * negates a boolean, defaults fill unset flags, named positional args are
 * assigned in order, and `_` holds the full positional list.
 */
export function parseArgs<T extends ArgsDef = ArgsDef>(
  rawArgs: string[],
  argsDef: T,
): ParsedArgs<T> {
  const options: Record<string, { type: "string" | "boolean"; short?: string }> = {};
  const defaults: Record<string, unknown> = {};
  const booleans = new Set<string>();
  const strings = new Set<string>();
  const positionals: Array<{ name: string; def: PositionalArgDef }> = [];
  const freeForm: string[] = [];
  const refused = new Set<string>();

  for (const [name, def] of Object.entries(argsDef)) {
    if (def.type === "positional") {
      positionals.push({ name, def });
      continue;
    }
    if (def.type === "positionals") {
      freeForm.push(name);
      continue;
    }
    if ((def as StringArgDef | BooleanArgDef).refused !== undefined) {
      options[name] = { type: "string" };
      refused.add(name);
      continue;
    }
    const type: "string" | "boolean" = def.type === "boolean" ? "boolean" : "string";
    (type === "boolean" ? booleans : strings).add(name);
    const opt: { type: "string" | "boolean"; short?: string } = { type };
    const short = toArray((def as StringArgDef | BooleanArgDef).alias).find((a) => a.length === 1);
    if (short) opt.short = short;
    options[name] = opt;
    if (def.default !== undefined) defaults[name] = def.default;
  }

  // Short alias → long name, so a dash-leading VALUE can be re-attached below.
  const shortToName = new Map<string, string>();
  for (const [name, opt] of Object.entries(options)) {
    if (opt.short) shortToName.set(opt.short, name);
  }

  /** If `tok` is a STRING flag that takes a separate value, its long name. */
  const stringFlagName = (tok: string): string | undefined => {
    if (tok.startsWith("--")) {
      const n = tok.slice(2);
      return strings.has(n) ? n : undefined;
    }
    if (tok.startsWith("-") && tok.length === 2) {
      const n = shortToName.get(tok.slice(1));
      return n !== undefined && strings.has(n) ? n : undefined;
    }
    return undefined;
  };

  // Strip `--no-<flag>` negations (node:util doesn't know them) and record them.
  const processed: string[] = [];
  const negated = new Set<string>();
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    if (arg === "--") {
      processed.push(...rawArgs.slice(i));
      break;
    }
    if (arg.startsWith("--no-")) {
      negated.add(arg.slice(5));
      continue;
    }
    // A VALUE beginning with `-` is not a flag. Under `strict: true` node reads
    // `-m "-fix thing"` as short options and reports "did you forget the option
    // argument for '-m'?" — so a commit message starting with a dash became
    // unusable in the command every seat runs. The `--name=value` form is immune,
    // so re-attach it that way before the parser tokenizes. Only for STRING
    // flags: a boolean takes no value, and `--` must stay a terminator.
    const flagName = stringFlagName(arg);
    const next = rawArgs[i + 1];
    if (flagName && next?.startsWith("-") && next !== "--") {
      processed.push(`--${flagName}=${next}`);
      i++;
      continue;
    }
    processed.push(arg);
  }

  let parsed: { values: Record<string, unknown>; positionals: string[] };
  try {
    // STRICT on purpose. With `strict: false` every command silently accepted
    // every unknown flag and exited 0 — a typo like `--fromat json` quietly fell
    // back to the default, and a flag a command doesn't have (`--as` on an older
    // `commit`) had its VALUE fall through as a positional, producing
    // "path(s) not found: aesop". That turns a usage error into a silent wrong
    // result, and it is the amplifier for every missing-flag defect: a seat that
    // follows our own instructions on a command lacking that flag gets no error
    // at all. anthill#54's shape — a usage error and a broken tool are
    // indistinguishable unless the output disambiguates them.
    parsed = nodeParseArgs({
      args: processed,
      options: Object.keys(options).length > 0 ? options : undefined,
      allowPositionals: true,
      strict: true,
    }) as { values: Record<string, unknown>; positionals: string[] };
  } catch (err) {
    // An unknown/misused flag must surface as a USAGE error naming the valid
    // set — never as a crash, and never (the old behaviour of this catch) by
    // silently reclassifying every argument as a positional, which would have
    // been strictly worse than the swallow it replaced.
    const code = (err as NodeJS.ErrnoException | undefined)?.code;
    if (
      code === "ERR_PARSE_ARGS_UNKNOWN_OPTION" ||
      code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE"
    ) {
      // Refused args are registered so they don't read as "unknown", but they are
      // NOT valid to pass — advertising one would offer a flag we reject.
      const valid = Object.keys(options)
        .filter((n) => !refused.has(n))
        .sort()
        .map((n) => `--${n}`);
      const detail =
        err instanceof Error
          ? err.message.replace(/\s*To specify.*$/s, "").replace(/\.\s*$/, "")
          : "";
      // A VALUE that begins with `-` is read as a cluster of short options, so
      // `comms send "-dash body"` fails with "Unknown option 'd'" — an error
      // about a letter inside the user's own sentence, which names neither the
      // cause nor either escape. Both escapes are real and were measured:
      // `-- "<body>"` and (where the command has it) `--stdin`.
      const dashValue = processed.find(
        (a) => a.startsWith("-") && !a.startsWith("--") && a.length > 2 && !stringFlagName(a),
      );
      const escapes = ["put it after `--`"];
      if (Object.hasOwn(argsDef, "stdin")) escapes.push("or pass it on --stdin");
      const hint = dashValue
        ? `. If "${dashValue}" was meant as a VALUE rather than flags, ${escapes.join(" ")}`
        : "";
      throw new CLIError(
        `${detail.trim() || "invalid option"}${
          valid.length > 0 ? `. Valid flags: ${valid.join(", ")}` : ""
        }${hint}`,
      );
    }
    parsed = { values: {}, positionals: processed };
  }

  const out: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(parsed.values)) {
    if (booleans.has(key) && typeof value === "string") out[key] = value !== "false";
    else if (strings.has(key) && typeof value === "boolean") out[key] = "";
    else out[key] = value;
  }
  for (const name of negated) out[name] = false;

  // An unknown FLAG is refused by name; an unknown POSITIONAL used to be
  // swallowed in silence, and that is the direction that costs a session:
  // `comms read <channel> 690` returned exit 0, ok:true, and THE ENTIRE LOG.
  // It does not fail — it succeeds, plausibly, with the wrong answer, and the
  // size of the result is the only tell. Refuse it here, where the same strict
  // rule already judges flags, so one token class is not held to a laxer
  // standard than its neighbour.
  //
  // Only commands declaring NEITHER a named positional NOR free-form
  // `type: "positionals"` are covered — the exceptions declare themselves,
  // because the other half of the criterion (does the body read `ctx.args._`?)
  // is invisible from here.
  if (positionals.length === 0 && freeForm.length === 0 && parsed.positionals.length > 0) {
    const valid = Object.keys(options)
      .filter((n) => !refused.has(n))
      .sort()
      .map((n) => `--${n}`);
    const got = parsed.positionals.map((p) => `"${p}"`).join(", ");
    throw new CLIError(
      `this command takes no positional arguments, but got ${got}` +
        (valid.length > 0 ? `. Valid flags: ${valid.join(", ")}` : "") +
        `. If you meant a VALUE, it belongs to one of those flags`,
    );
  }

  out._ = [...parsed.positionals];
  for (const name of freeForm) out[name] = [...parsed.positionals];

  const pending = [...parsed.positionals];
  for (const { name, def } of positionals) {
    const next = pending.shift();
    if (next !== undefined) out[name] = next;
    else if (def.default === undefined && def.required !== false) {
      throw new CLIError(`Missing required positional argument: ${name.toUpperCase()}`);
    } else {
      out[name] = def.default;
    }
  }

  return out as ParsedArgs<T>;
}

function isValueFlag(flag: string, argsDef: ArgsDef): boolean {
  const name = flag.replace(/^-{1,2}/, "");
  for (const [key, def] of Object.entries(argsDef)) {
    if (def.type !== "string") continue;
    if (name === key) return true;
    if (toArray((def as StringArgDef).alias).includes(name)) return true;
  }
  return false;
}

/**
 * Index of the first token that names a subcommand — the first bare positional,
 * skipping value-taking flags and their values (so `--format json status`
 * dispatches `status`). Returns -1 if none.
 */
function findSubCommandIndex(rawArgs: string[], argsDef: ArgsDef): number {
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    if (arg === "--") return -1;
    if (arg.startsWith("-")) {
      if (!arg.includes("=") && isValueFlag(arg, argsDef)) i++;
      continue;
    }
    return i;
  }
  return -1;
}

/**
 * Walk from `cmd` down through matched subcommands, returning the deepest
 * resolved command and its parent — used to target `--help`.
 */
export function resolveSubCommand(
  cmd: AnyCommand,
  rawArgs: string[],
  parent?: AnyCommand,
): [AnyCommand, AnyCommand?] {
  const subCommands = cmd.subCommands;
  if (subCommands && Object.keys(subCommands).length > 0) {
    const idx = findSubCommandIndex(rawArgs, cmd.args ?? {});
    const name = idx >= 0 ? rawArgs[idx] : undefined;
    const sub = name ? subCommands[name] : undefined;
    if (sub) return resolveSubCommand(sub, rawArgs.slice(idx + 1), cmd);
  }
  return [cmd, parent];
}

/**
 * Dispatch `rawArgs` against `cmd`: route into a subcommand when one is named,
 * else parse args and invoke `run(ctx)`. Throws {@link CLIError} on an unknown
 * or missing command.
 */
export async function runCommand(cmd: AnyCommand, rawArgs: string[]): Promise<void> {
  const argsDef = cmd.args ?? {};
  const subCommands = cmd.subCommands;
  if (subCommands && Object.keys(subCommands).length > 0) {
    const idx = findSubCommandIndex(rawArgs, argsDef);
    const name = idx >= 0 ? rawArgs[idx] : undefined;
    if (name) {
      const sub = subCommands[name];
      if (!sub) throw new CLIError(`Unknown command ${name}`);
      // Validate the tokens BEFORE the subcommand against this level's spec.
      // They were previously dropped on the floor: only `rawArgs.slice(idx + 1)`
      // was ever parsed, so `anthill --nope status` exited 0 with `ok:true`.
      // That is precisely the silent-fallback failure `strict: true` exists to
      // prevent (see the long note in `parseArgs`), surviving in the one
      // position nobody probed — a typo is as likely before the subcommand as
      // after it, and only one of the two was ever checked.
      //
      // Reuses the same strict parser rather than a second, laxer check, so a
      // flag is judged by one rule wherever it appears.
      parseArgs(rawArgs.slice(0, idx), argsDef);
      await runCommand(sub, rawArgs.slice(idx + 1));
      return;
    }
    if (typeof cmd.run !== "function") {
      // Validate this level's own tokens BEFORE reporting "no command". With no
      // subcommand named, `rawArgs` was never handed to the parser at all, so an
      // unknown flag was dropped on the floor and the caller was told the wrong
      // thing: `anthill --nope` answered "No command specified.", which sends an
      // agent off to add a command when the actual defect is the flag — and it
      // will hit the same wall again with the command supplied.
      //
      // This is the THIRD position of the same defect. The two fixed above are
      // the flag before a subcommand and the flag after it; the case with no
      // subcommand at all was the one position still unparsed. Uses the same
      // strict parser as those, so a flag is judged by one rule wherever it
      // appears — including where it appears alone.
      parseArgs(rawArgs, argsDef);
      throw new CLIError("No command specified.");
    }
  }
  if (typeof cmd.run === "function") {
    const args = parseArgs(rawArgs, argsDef);
    await cmd.run({ rawArgs, args, cmd });
  }
}

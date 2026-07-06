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

export type ArgType = "boolean" | "string" | "positional" | undefined;

interface BaseArgDef<T extends ArgType, VT extends boolean | string> {
  type?: T;
  description?: string;
  valueHint?: string;
  alias?: string | string[];
  default?: VT;
  required?: boolean;
}

export type BooleanArgDef = Omit<BaseArgDef<"boolean", boolean>, never>;
export type StringArgDef = BaseArgDef<"string", string>;
export type PositionalArgDef = Omit<BaseArgDef<"positional", string>, "alias">;
export type ArgDef = BooleanArgDef | StringArgDef | PositionalArgDef;
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

type ParsedArg<T extends ArgDef> = T["type"] extends "positional"
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

  for (const [name, def] of Object.entries(argsDef)) {
    if (def.type === "positional") {
      positionals.push({ name, def });
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
    processed.push(arg);
  }

  let parsed: { values: Record<string, unknown>; positionals: string[] };
  try {
    parsed = nodeParseArgs({
      args: processed,
      options: Object.keys(options).length > 0 ? options : undefined,
      allowPositionals: true,
      strict: false,
    }) as { values: Record<string, unknown>; positionals: string[] };
  } catch {
    parsed = { values: {}, positionals: processed };
  }

  const out: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(parsed.values)) {
    if (booleans.has(key) && typeof value === "string") out[key] = value !== "false";
    else if (strings.has(key) && typeof value === "boolean") out[key] = "";
    else out[key] = value;
  }
  for (const name of negated) out[name] = false;

  out._ = [...parsed.positionals];

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
      await runCommand(sub, rawArgs.slice(idx + 1));
      return;
    }
    if (typeof cmd.run !== "function") throw new CLIError("No command specified.");
  }
  if (typeof cmd.run === "function") {
    const args = parseArgs(rawArgs, argsDef);
    await cmd.run({ rawArgs, args, cmd });
  }
}

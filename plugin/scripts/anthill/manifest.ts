/**
 * Walks the command tree and emits a JSON manifest. Agents call
 * `<cli> help --json` once per session to discover the surface instead of
 * scraping ANSI help text.
 *
 * WARNING: flag `default` values are copied verbatim into the manifest.
 * NEVER default a flag to a secret (API key, password) — it would leak here.
 * Default secrets to `null` and read them from the environment inside run().
 */

import type { AnthillCommandScope } from "./define.ts";

export type ScopeLabel = AnthillCommandScope;

/**
 * Narrow, local shape for walking arbitrary command definitions. We do ONE
 * boundary cast at the entry (`root as WalkableCommand`) and walk from there;
 * the `Resolvable` wrapper keeps the walker tolerant of lazy meta/subCommands.
 * Don't spread the cast inward.
 */
type Resolvable<T> = T | Promise<T> | (() => T | Promise<T>);

interface WalkArg {
  type?: string;
  description?: string;
  default?: unknown;
  alias?: string | string[];
  valueHint?: string;
  values?: string[];
  required?: boolean;
  refused?: string;
}

interface WalkMeta {
  name?: string;
  version?: string;
  description?: string;
  scope?: ScopeLabel;
}

interface WalkableCommand {
  meta?: Resolvable<WalkMeta>;
  args?: Record<string, WalkArg>;
  subCommands?: Record<string, Resolvable<WalkableCommand>>;
}

/**
 * A FLAG — never a positional. Positionals have their own container below,
 * because the container is what a consumer iterates: seven positionals emitted
 * inside `flags` were each rejected when a consumer spelled one as `--handle`
 * (upstream drift trial, DT-3).
 */
export interface ManifestFlag {
  name: string;
  type: "string" | "boolean";
  /**
   * `valid` — accepted here. `refused` — RECOGNISED and deliberately rejected,
   * with the reason in `refusedReason`. Required on every flag: a slot that can
   * be omitted is how eight refused flags shipped as valid ones (DT-2) — the
   * generator had nowhere to put refusal, wrote nothing, and nothing read as
   * valid. An agent building an invocation must skip `refused` flags.
   */
  status: "valid" | "refused";
  refusedReason?: string;
  description?: string;
  default?: unknown;
  alias?: string | string[];
  /** A display label with NO semantics. Never a constraint. */
  valueHint?: string;
  /** A closed set the parser ENFORCES. Absent means no claim, not "any value". */
  values?: string[];
  required?: boolean;
}

export interface ManifestPositional {
  name: string;
  description?: string;
  required: boolean;
  /** Consumes every remaining token. */
  variadic: boolean;
  default?: unknown;
  valueHint?: string;
  values?: string[];
}

export interface ManifestCommand {
  name: string;
  description?: string;
  /** Argv tokens that select this command. `[]` is the root. */
  path: string[];
  scope?: ScopeLabel;
  flags: ManifestFlag[];
  positionals: ManifestPositional[];
  subcommands: ManifestCommand[];
}

export interface Manifest {
  name?: string;
  version?: string;
  description?: string;
  /**
   * The ROOT as a command path of its own — the flags `anthill` answers before
   * any verb (`--format`, `--help`/`-h`, `--version`/`-v`). A walker over "the
   * commands" walks straight past these, which is how a manifest of 25 paths
   * declared no root while the root accepted `--format` (DT-1). Declared at
   * `path: []` so the one path every checker can reach is in the census.
   */
  root: ManifestCommand;
  commands: ManifestCommand[];
}

async function resolveValue<T>(v: Resolvable<T> | undefined): Promise<T | undefined> {
  if (v === undefined) return undefined;
  if (typeof v === "function") return (v as () => T | Promise<T>)();
  return v;
}

async function buildCommandEntry(
  name: string,
  cmd: WalkableCommand,
  path: string[],
  inheritedScope?: ScopeLabel,
): Promise<ManifestCommand> {
  const meta = (await resolveValue(cmd.meta)) ?? {};
  const scope = meta.scope ?? inheritedScope;

  const flags: ManifestFlag[] = [];
  const positionals: ManifestPositional[] = [];
  for (const [argName, a] of Object.entries(cmd.args ?? {})) {
    if (a.type === "positional" || a.type === "positionals") {
      positionals.push({
        name: argName,
        description: a.description,
        required: a.type === "positional" && a.required !== false && a.default === undefined,
        variadic: a.type === "positionals",
        default: a.default,
        valueHint: a.valueHint,
        values: a.values,
      });
      continue;
    }
    flags.push({
      name: argName,
      type: a.type === "boolean" ? "boolean" : "string",
      status: a.refused === undefined ? "valid" : "refused",
      ...(a.refused !== undefined && { refusedReason: a.refused }),
      description: a.description,
      default: a.default,
      alias: a.alias,
      valueHint: a.valueHint,
      values: a.values,
      required: a.required,
    });
  }

  const subcommands: ManifestCommand[] = [];
  for (const [subName, subCmd] of Object.entries(cmd.subCommands ?? {})) {
    const resolved = await resolveValue(subCmd);
    if (resolved) {
      subcommands.push(await buildCommandEntry(subName, resolved, [...path, subName], scope));
    }
  }

  return {
    name,
    description: meta.description,
    path,
    scope,
    flags,
    positionals,
    subcommands,
  };
}

/**
 * Build a manifest from a root command. `root` is typed `unknown` because the
 * concrete command types aren't amenable to external walking — the cast happens
 * here, once.
 */
export async function buildManifest(root: unknown): Promise<Manifest> {
  const rootCmd = root as WalkableCommand;
  const meta = (await resolveValue(rootCmd.meta)) ?? {};
  const commands: ManifestCommand[] = [];
  for (const [name, sub] of Object.entries(rootCmd.subCommands ?? {})) {
    const resolved = await resolveValue(sub);
    if (resolved) {
      commands.push(await buildCommandEntry(name, resolved, [name]));
    }
  }
  // The root's OWN args, at `path: []`, with no subcommand tree of their own —
  // the tree is `commands` beside it.
  const rootEntry = await buildCommandEntry(
    meta.name ?? "",
    { meta: rootCmd.meta, args: rootCmd.args },
    [],
  );
  return {
    name: meta.name,
    version: meta.version,
    description: meta.description,
    root: rootEntry,
    commands,
  };
}

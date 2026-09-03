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

// ---------------------------------------------------------------------------
// acc v0 declaration — the same walk, in the one format an outside reader
// consumes today.
// ---------------------------------------------------------------------------

/**
 * The declaration format `acc check --declaration` reads (agent-cli-conformance,
 * `src/acc/kit/declaration.ts`, format major "0"). Required keys only, nothing
 * else at any level: the reader refuses an unknown key ANYWHERE rather than
 * reading what it recognises, because a field it cannot name may be the one
 * bounding a probe's safety. So the richer facts the manifest carries —
 * descriptions, defaults, refusal reasons — stay in the manifest; this document
 * is the checkable subset.
 *
 * `provenance: "emitted"` is the strongest claim the format has, and it is true
 * here: the running binary produces this at answer time from the structures the
 * parser reads. A disagreement between this document and a rejection is then
 * one process contradicting itself, which is a defect in its own right — not
 * "a file and a tool disagree".
 */
export interface Declaration {
  formatVersion: "0";
  provenance: "emitted";
  selfDescription: { args: string[] };
  commands: Array<{
    path: string[];
    args: Array<{
      name: string;
      type: "string" | "boolean";
      status: "valid" | "refused";
      values?: string[];
      valueHint?: string;
    }>;
    positionals: Array<{ name: string; required: boolean; variadic?: boolean }>;
  }>;
}

/** The argv that produces the declaration — a literal the census checks is a
 * declared command (`self-description-not-declared` otherwise). */
export const SELF_DESCRIPTION_ARGS = ["help", "--declaration"];

export function buildDeclaration(manifest: Manifest): Declaration {
  const args = (flags: ManifestFlag[]): Declaration["commands"][number]["args"] =>
    flags.flatMap((f) => {
      const base = {
        type: f.type,
        status: f.status,
        ...(f.values !== undefined && { values: f.values }),
        ...(f.valueHint !== undefined && f.values === undefined && { valueHint: f.valueHint }),
      };
      // One row per spelling the parser accepts: the long name, and each
      // single-letter alias as `-x`. The rejection names both, so both compare.
      const aliases = (Array.isArray(f.alias) ? f.alias : f.alias ? [f.alias] : []).filter(
        (a) => a.length === 1,
      );
      return [
        { name: `--${f.name}`, ...base },
        ...aliases.map((a) => ({ name: `-${a}`, ...base })),
      ];
    });
  const positionals = (ps: ManifestPositional[]) =>
    ps.map((p) => ({ name: p.name, required: p.required, ...(p.variadic && { variadic: true }) }));
  const commands: Declaration["commands"] = [];
  const walk = (cmds: ManifestCommand[]) => {
    for (const c of cmds) {
      commands.push({ path: c.path, args: args(c.flags), positionals: positionals(c.positionals) });
      walk(c.subcommands);
    }
  };
  commands.push({
    path: [],
    args: args(manifest.root.flags),
    positionals: positionals(manifest.root.positionals),
  });
  walk(manifest.commands);
  return {
    formatVersion: "0",
    provenance: "emitted",
    selfDescription: { args: SELF_DESCRIPTION_ARGS },
    commands,
  };
}

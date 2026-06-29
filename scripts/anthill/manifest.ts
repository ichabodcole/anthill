/**
 * Walks the citty command tree and emits a JSON manifest. Agents call
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
 * Narrow, local shape for citty commands. citty doesn't export usable types
 * for arbitrary command definitions, so we do ONE boundary cast at the entry
 * (`root as CittyCommand`) and walk from there. Don't spread the cast inward.
 */
type Resolvable<T> = T | Promise<T> | (() => T | Promise<T>);

interface CittyArg {
  type?: string;
  description?: string;
  default?: unknown;
  alias?: string | string[];
  valueHint?: string;
  required?: boolean;
}

interface CittyMeta {
  name?: string;
  version?: string;
  description?: string;
  scope?: ScopeLabel;
}

interface CittyCommand {
  meta?: Resolvable<CittyMeta>;
  args?: Record<string, CittyArg>;
  subCommands?: Record<string, Resolvable<CittyCommand>>;
}

export interface ManifestFlag {
  name: string;
  type?: string;
  description?: string;
  default?: unknown;
  alias?: string | string[];
  valueHint?: string;
  required?: boolean;
}

export interface ManifestCommand {
  name: string;
  description?: string;
  path: string[];
  scope?: ScopeLabel;
  flags: ManifestFlag[];
  subcommands: ManifestCommand[];
}

export interface Manifest {
  name?: string;
  version?: string;
  description?: string;
  commands: ManifestCommand[];
}

async function resolveValue<T>(v: Resolvable<T> | undefined): Promise<T | undefined> {
  if (v === undefined) return undefined;
  if (typeof v === "function") return (v as () => T | Promise<T>)();
  return v;
}

async function buildCommandEntry(
  name: string,
  cmd: CittyCommand,
  path: string[],
  inheritedScope?: ScopeLabel,
): Promise<ManifestCommand> {
  const meta = (await resolveValue(cmd.meta)) ?? {};
  const scope = meta.scope ?? inheritedScope;

  const flags: ManifestFlag[] = Object.entries(cmd.args ?? {}).map(([flagName, a]) => ({
    name: flagName,
    type: a.type,
    description: a.description,
    default: a.default,
    alias: a.alias,
    valueHint: a.valueHint,
    required: a.required,
  }));

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
    subcommands,
  };
}

/**
 * Build a manifest from a citty root command. `root` is typed `unknown` because
 * citty's types aren't amenable to external walking — the cast happens here,
 * once.
 */
export async function buildManifest(root: unknown): Promise<Manifest> {
  const rootCmd = root as CittyCommand;
  const meta = (await resolveValue(rootCmd.meta)) ?? {};
  const commands: ManifestCommand[] = [];
  for (const [name, sub] of Object.entries(rootCmd.subCommands ?? {})) {
    const resolved = await resolveValue(sub);
    if (resolved) {
      commands.push(await buildCommandEntry(name, resolved, [name]));
    }
  }
  return {
    name: meta.name,
    version: meta.version,
    description: meta.description,
    commands,
  };
}

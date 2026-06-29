/**
 * anthill-specific wrapper around citty's `defineCommand` that enforces
 * a `scope` tag on top-level command groups.
 *
 * Scope semantics:
 * - `workspace` — operates on the filesystem / local config; no API dependency
 * - `app`       — operates on the running API; requires a bearer token
 *
 * Subcommands under a top-level group use plain `defineCommand` from citty;
 * their effective scope is inherited from the parent at manifest time (see
 * manifest.ts).
 *
 * To add a new scope: extend `AnthillCommandScope` below, then update
 * `SCOPE_LABELS` / `SCOPE_SUBTITLES` in help-renderer.ts. TypeScript will
 * surface every call site that needs the new label.
 */

import { type ArgsDef, type CommandDef, defineCommand } from "citty";

export type AnthillCommandScope = "workspace" | "app";

interface AnthillMeta {
  name: string;
  description: string;
  scope: AnthillCommandScope;
  version?: string;
  deprecated?: boolean;
}

/**
 * Define a top-level command group. Requires `scope` on meta so the grouped
 * help renderer and manifest can surface the workspace/app split.
 *
 * Generic in the args-def so `run(ctx)`'s `ctx.args` typing flows through
 * unchanged from citty.
 */
export function defineAnthillCommand<T extends ArgsDef = ArgsDef>(
  input: CommandDef<T> & { meta: AnthillMeta },
): CommandDef<T> {
  return defineCommand(input);
}

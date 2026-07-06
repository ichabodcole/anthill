/**
 * Human-facing help output.
 *
 * - `renderGroupedHelp` — the bare `<cli>` / `<cli> help` view: walks the
 *   manifest and groups top-level commands by scope.
 * - `renderCommandUsage` — the per-command `<cli> <cmd> --help` view: usage
 *   line + ARGUMENTS/OPTIONS/COMMANDS blocks for one command. This is the
 *   in-house replacement for citty's `renderUsage`.
 */

import type { ArgDef, CommandDef } from "./define.ts";
import { buildManifest, type ScopeLabel } from "./manifest.ts";
import { accent, bold, dim, muted } from "./styles.ts";

const SCOPE_LABELS: Record<ScopeLabel, string> = {
  workspace: "WORKSPACE",
  app: "APP",
};

const SCOPE_SUBTITLES: Record<ScopeLabel, string> = {
  workspace: "filesystem, dev environment — no API",
  app: "running API — requires bearer token",
};

/**
 * Order is derived from the label map so adding a new scope never silently
 * omits it from grouped help. Insertion order of string keys is stable in
 * all current JS runtimes, so this preserves the workspace-first ordering.
 */
const SCOPE_ORDER = Object.keys(SCOPE_LABELS) as ScopeLabel[];

export async function renderGroupedHelp(
  root: unknown,
  options: { scope?: ScopeLabel } = {},
): Promise<string> {
  const manifest = await buildManifest(root);

  const entries = manifest.commands.map((c) => ({
    name: c.name,
    description: c.description ?? "",
    scope: c.scope,
  }));

  const maxName = entries.reduce((m, e) => Math.max(m, e.name.length), 0);
  const lines: string[] = [];

  if (manifest.name) {
    const title = manifest.version ? `${manifest.name} ${manifest.version}` : manifest.name;
    lines.push(bold(accent(title)));
    if (manifest.description) lines.push(muted(manifest.description));
    lines.push("");
  }

  for (const scope of SCOPE_ORDER) {
    if (options.scope && options.scope !== scope) continue;
    const group = entries.filter((e) => e.scope === scope);
    if (group.length === 0) continue;

    lines.push(`${bold(SCOPE_LABELS[scope])}  ${muted(`(${SCOPE_SUBTITLES[scope]})`)}`);
    for (const e of group) {
      const name = e.name.padEnd(maxName);
      lines.push(`  ${accent(name)}  ${dim(e.description)}`);
    }
    lines.push("");
  }

  // Catch commands with no scope (shouldn't happen if top-level groups use the wrapper).
  const unscoped = entries.filter((e) => !e.scope);
  if (unscoped.length > 0 && !options.scope) {
    lines.push(bold("OTHER"));
    for (const e of unscoped) {
      const name = e.name.padEnd(maxName);
      lines.push(`  ${accent(name)}  ${dim(e.description)}`);
    }
    lines.push("");
  }

  lines.push(
    muted(
      `Run \`<cli> help --json\` for a machine-readable manifest.`.replace(
        "<cli>",
        manifest.name ?? "anthill",
      ),
    ),
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Per-command usage (`<cli> <cmd> --help`).
// ---------------------------------------------------------------------------

/** Two-column layout: col 0 right-aligned, col 1 left-aligned, "  " prefix. */
function formatColumns(rows: Array<[string, string]>): string {
  const w0 = rows.reduce((m, r) => Math.max(m, r[0].length), 0);
  const w1 = rows.reduce((m, r) => Math.max(m, r[1].length), 0);
  return rows.map((r) => `  ${r[0].padStart(w0)}  ${`  ${r[1].padEnd(w1)}`}`).join("\n");
}

function valueHint(arg: ArgDef): string {
  const hint = arg.valueHint ? `=<${arg.valueHint}>` : "";
  if (!arg.type || arg.type === "positional" || arg.type === "boolean") return hint;
  return hint || `=<${(arg as { name?: string }).name ?? "value"}>`;
}

function describe(arg: ArgDef, required: boolean): string {
  const parts = [arg.description];
  if (required) parts.push(muted("(Required)"));
  if (arg.default !== undefined) parts.push(muted(`(Default: ${arg.default})`));
  return parts.filter(Boolean).join(" ");
}

/**
 * Render a single command's usage screen: a description/version banner, a USAGE
 * line, then ARGUMENTS (positionals), OPTIONS (flags), and COMMANDS
 * (subcommands) blocks as applicable. `parent` supplies the qualifying name +
 * an inherited version.
 */
export function renderCommandUsage(cmd: CommandDef, parent?: CommandDef): string {
  const meta = cmd.meta ?? {};
  const parentMeta = parent?.meta ?? {};
  const commandName = `${parentMeta.name ? `${parentMeta.name} ` : ""}${meta.name ?? ""}`.trim();
  const version = meta.version ?? parentMeta.version;

  const argEntries = Object.entries(cmd.args ?? {});
  const argRows: Array<[string, string]> = [];
  const posRows: Array<[string, string]> = [];
  const usageTokens: string[] = [];

  for (const [name, arg] of argEntries) {
    const withName = { ...arg, name } as ArgDef & { name: string };
    if (arg.type === "positional") {
      const required = arg.required !== false && arg.default === undefined;
      posRows.push([accent(name.toUpperCase() + valueHint(withName)), describe(arg, required)]);
      usageTokens.push(required ? `<${name.toUpperCase()}>` : `[${name.toUpperCase()}]`);
    } else {
      const required = arg.required === true && arg.default === undefined;
      const rawAlias = (arg as { alias?: string | string[] }).alias;
      const aliases = rawAlias ? (Array.isArray(rawAlias) ? rawAlias : [rawAlias]) : [];
      const flag =
        [...aliases.map((a: string) => `-${a}`), `--${name}`].join(", ") + valueHint(withName);
      argRows.push([accent(flag), describe(arg, required)]);
      if (required) usageTokens.push(`--${name}${valueHint(withName)}`);
    }
  }

  const subEntries = Object.entries(cmd.subCommands ?? {}).filter(([, s]) => !s.meta?.hidden);
  const cmdRows: Array<[string, string]> = subEntries.map(([name, sub]) => [
    accent(name),
    sub.meta?.description ?? "",
  ]);
  if (subEntries.length > 0) usageTokens.push(subEntries.map(([name]) => name).join("|"));

  const hasOptions = argRows.length > 0 || posRows.length > 0;
  const banner = `${meta.description ?? ""} (${commandName}${version ? ` v${version}` : ""})`;

  const out: string[] = [muted(banner), ""];
  out.push(
    `${bold("USAGE")} ${accent(`${commandName}${hasOptions ? " [OPTIONS]" : ""} ${usageTokens.join(" ")}`)}`,
    "",
  );
  if (posRows.length > 0) {
    out.push(bold("ARGUMENTS"), "", formatColumns(posRows), "");
  }
  if (argRows.length > 0) {
    out.push(bold("OPTIONS"), "", formatColumns(argRows), "");
  }
  if (cmdRows.length > 0) {
    out.push(
      bold("COMMANDS"),
      "",
      formatColumns(cmdRows),
      "",
      `Use ${accent(`${commandName} <command> --help`)} for more information about a command.`,
    );
  }
  return out.join("\n");
}

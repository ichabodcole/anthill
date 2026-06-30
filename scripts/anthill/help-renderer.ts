/**
 * Human-facing `<cli>` / `<cli> help` output. Walks the manifest and groups
 * top-level commands by scope with a bold section header per group.
 */

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

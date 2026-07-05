import { resolve } from "node:path";
import { emit, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { buildScanReport, resolveScanRoot, type ScanReport } from "../scan.ts";

// `anthill scan` — read the repo and emit a `ScanReport` (seams.md Contract 1):
// the workspace shape + per-surface units (kind/stack/private/internalDeps) that
// bootstrap discovery folds into candidate seatings. Runs BEFORE `.anthill/` exists,
// so `root` resolves via `.git` / topmost package.json / cwd — never the config walk-up.
export const teamScanCommand = defineAnthillCommand({
  meta: {
    name: "scan",
    description: "Scan the repo's workspace surfaces (for bootstrap candidate seatings)",
    scope: "workspace",
  },
  args: {
    root: {
      type: "string",
      description: "Override the resolved repo root (for fixtures / testing)",
      valueHint: "dir",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);

    const override = ctx.args.root as string | undefined;
    const root = override ? resolve(override) : resolveScanRoot(process.cwd());
    const data = buildScanReport(root);

    emit({
      format,
      command: "scan",
      data,
      startedAt: started,
      renderText: renderScan,
    });
  },
});

function renderScan(d: ScanReport): string {
  const lines: string[] = [`Root: ${d.root}`];
  if (d.workspace) {
    lines.push(
      `Workspace: ${d.workspace.manager ?? "unknown"} · ${d.workspace.globs.join(", ") || "(no globs)"}`,
    );
  } else {
    lines.push("Workspace: single-surface");
  }
  lines.push(`Units (${d.units.length}):`);
  for (const u of d.units) {
    const stack = u.stack.length > 0 ? u.stack.join(">") : "?";
    const flags = [u.private ? "private" : "public", stack].join(" · ");
    const edges = u.internalDeps.length > 0 ? ` → ${u.internalDeps.join(", ")}` : "";
    lines.push(`  ${u.kind === "app" ? "▸" : "·"} ${u.name} [${u.path}] (${flags})${edges}`);
  }
  if (d.warnings?.length) {
    for (const w of d.warnings) lines.push(`⚠ ${w}`);
  }
  return lines.join("\n");
}

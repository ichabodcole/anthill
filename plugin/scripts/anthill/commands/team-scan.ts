import { resolve } from "node:path";
import { emit, refuseArg, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { buildScanReport, resolveScanRoot, type ScanReport } from "../scan.ts";

// `anthill scan` — read the repo and emit a `ScanReport` (seams.md Contract 1):
// the workspace shape + per-surface units (kind/stack/private/internalDeps) that
// bootstrap discovery folds into candidate seatings. Runs BEFORE `.anthill/` exists,
// so `root` resolves via `.git` / topmost package.json / cwd — never the config walk-up.
/** Why this verb refuses `--team`. ONE string, used by the arg def AND the
 * refusal in `run` — two copies of a reason drift, and a refusal that argues
 * with itself teaches worse than the generic "unknown option" it replaced. */
const REFUSED_TEAM =
  "`scan` reads the REPO's shape to propose a team — it runs before a team exists";

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
    team: { type: "string", refused: REFUSED_TEAM },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    refuseArg({
      format: resolveFormat(ctx.args.format as string | undefined),
      command: "scan",
      flag: "--team",
      value: ctx.args.team,
      why: REFUSED_TEAM,
    });
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
  } else if (d.evidence === "none") {
    // ⚠ NOT "single-surface". The JSON half of this fix was pointless if the line
    // a HUMAN reads still asserts a shape nothing supports: `workspace: null` is
    // true here only because there was no manifest to find globs in, and the unit
    // below is synthesized from the directory name. Caught by running the command
    // after the payload was already correct.
    lines.push("Workspace: (no readable package.json — nothing to derive a shape from)");
  } else {
    lines.push("Workspace: single-surface");
  }
  lines.push(`Units (${d.units.length}):`);
  for (const u of d.units) {
    // "?" reads as "we looked and found nothing"; with no manifest we never
    // looked. Same distinction the `evidence` field exists for, one line down.
    const stack =
      u.stack.length > 0 ? u.stack.join(">") : d.evidence === "none" ? "not scanned" : "?";
    const flags = [u.private ? "private" : "public", stack].join(" · ");
    const edges = u.internalDeps.length > 0 ? ` → ${u.internalDeps.join(", ")}` : "";
    lines.push(`  ${u.kind === "app" ? "▸" : "·"} ${u.name} [${u.path}] (${flags})${edges}`);
  }
  if (d.warnings?.length) {
    for (const w of d.warnings) lines.push(`⚠ ${w}`);
  }
  return lines.join("\n");
}

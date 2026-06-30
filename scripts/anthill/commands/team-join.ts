import { existsSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { requireConfig } from "./team-support.ts";

interface GroundingEntry {
  path: string;
  exists: boolean;
}

interface JoinData {
  handle: string;
  channel: string;
  grounding: GroundingEntry[];
  tailCommand: string;
  boardTailCommand: string;
  checklist: string[];
}

// `anthill join <handle>` — produce the grounding manifest (docs to read, in
// order) + the tail commands for an agent taking a seat. Does NOT exec the tail;
// that's the calling skill's job (it must wrap it with Monitor). Config-driven:
// grounding order is config.grounding (product context) → SOP → seams → seat doc.
export const teamJoinCommand = defineAnthillCommand({
  meta: {
    name: "join",
    description: "Grounding manifest + tail commands for an agent taking a seat",
    scope: "workspace",
  },
  args: {
    handle: {
      type: "positional",
      description: "Seat handle (must be in config.seats)",
      required: true,
    },
    channel: {
      type: "string",
      description: "Grapevine channel (default: config.channel)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "join");
    const handle = String(ctx.args.handle);
    const channel = (ctx.args.channel as string | undefined) || config.channel;

    if (!config.seat(handle)) {
      const seats = config.roster().map((s) => s.handle);
      emitError({
        format,
        command: "join",
        error: `unknown seat "${handle}". Valid handles: ${seats.join(", ") || "(none in config)"}`,
      });
      process.exit(1);
    }

    let grapevineCli: string;
    let bountyCli: string;
    try {
      grapevineCli = resolveCoordCli("grapevine");
      bountyCli = resolveCoordCli("bounty");
    } catch (err) {
      emitError({ format, command: "join", error: (err as Error).message });
      process.exit(1);
    }

    // Grounding docs, in read order: product context (config.grounding) → SOP →
    // seam contract → own seat doc. All resolved to absolute paths.
    const root = config.projectRoot;
    const groundingPaths = [
      ...config.grounding.map((g) => (isAbsolute(g) ? g : join(root, g))),
      join(config.teamDirPath(), "README.md"),
      config.seamsPath(),
      config.seatDocPath(handle),
    ];
    const grounding: GroundingEntry[] = groundingPaths.map((p) => ({
      path: p,
      exists: existsSync(p),
    }));

    const tailCommand = `bun ${grapevineCli} tail ${channel} --as ${handle}`;
    const boardTailCommand = `bun ${bountyCli} tail --mine --as ${handle}`;
    const seatDocRel = relative(root, config.seatDocPath(handle));

    // Next-steps checklist — the action items a joining seat must wire up.
    const checklist = [
      `Monitor the grapevine — wrap with Monitor, filter keepalives: ${tailCommand} | grep '"from"'`,
      `Monitor your board lane — wrap with Monitor: ${boardTailCommand} | grep '"type":"(task|heartbeat|unblocked|closed)"'`,
      "Own your card lifecycle: move it todo→doing when you start, →review when green.",
      "Commit file-scoped with an EXPLICIT pathspec (never a bare `git commit` / `git add -A`). On a shared tree, serialize: announce, commit, confirm landed, then the next seat goes — or hand maestro your paths for one atomic land.",
      `Finalize BEFORE you drop off: synthesize durable lessons into ${seatDocRel}, commit, THEN stand down.`,
      `Route questions + decisions to the lead${config.lead ? ` (${config.lead})` : ""} on the vine — not direct to the human.`,
    ];

    const data: JoinData = { handle, channel, grounding, tailCommand, boardTailCommand, checklist };

    emit({
      format,
      command: "join",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines: string[] = [
          `Seat: ${d.handle}   Channel: ${d.channel}`,
          "",
          `Read these ${d.grounding.length} files in order to ground yourself:`,
        ];
        d.grounding.forEach((g, i) => {
          const rel = relative(root, g.path);
          lines.push(`  ${i + 1}. ${rel}${g.exists ? "" : "  (missing!)"}`);
        });
        lines.push(
          "",
          "Then wire BOTH watches (wrap each with Monitor — do not block):",
          `  grapevine:  ${d.tailCommand}`,
          `  board:      ${d.boardTailCommand}`,
          "",
          "Checklist — your action items as this seat:",
        );
        d.checklist.forEach((c, i) => {
          lines.push(`  [${i + 1}] ${c}`);
        });
        return lines.join("\n");
      },
    });
  },
});

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { buildCommsIncantation } from "../comms.ts";
import { resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { detectPlaceholder } from "../placeholder.ts";
import { nowMillis } from "../runtime.ts";
import { requireConfig } from "./team-support.ts";

interface GroundingEntry {
  path: string;
  exists: boolean;
  /** The file exists but reads as an UNFILLED TEMPLATE. Listing it flat costs a
   * seat a full read and hands it a wrong inference ("this project has no
   * articulated principles" vs. "nobody filled the template in") — anthill#56. */
  placeholder?: boolean;
}

interface JoinData {
  handle: string;
  channel: string;
  grounding: GroundingEntry[];
  tailCommand: string;
  boardTailCommand: string;
  /** The team comms wire (`seams.md` Contract 4(b)). ALWAYS present — the
   * consumer branches on this block rather than probing the filesystem or
   * interpreting an exit code to decide what to render. */
  comms: { channel: string; incantation: string };
  checklist: string[];
  /** Surfaced when a configured grounding path doesn't exist — a dangling
   * `config.grounding` ref (e.g. a default `AGENTS.md` the repo doesn't have)
   * shouldn't be a silent miss. */
  warnings?: string[];
}

export interface ChecklistInput {
  tailCommand: string;
  boardTailCommand: string;
  /** The team comms wire — fully resolved, run verbatim, filter-free. */
  commsIncantation: string;
  bountyCli: string;
  handle: string;
  seatDocRel: string;
  lead: string | undefined;
}

/**
 * The joining seat's action checklist. PURE (no config, no filesystem, no
 * coord resolution) so the exact emitted strings can be asserted in CI, where
 * no spellbook plugin cache exists to resolve real CLI paths.
 *
 * Two hard-won details live in the grep incantations below, and BOTH fail
 * SILENTLY — which is why they're pinned by tests rather than left to prose:
 *
 *   * `-E` is REQUIRED. Under basic grep, `(a|b)` is a LITERAL string, so an
 *     alternation filter matches nothing at all: the seat's board Monitor sits
 *     permanently empty while looking correctly wired (anthill#39).
 *   * `--line-buffered` is REQUIRED. grep block-buffers by default, so a live
 *     tail's frames are withheld until a full block accumulates — the seat wakes
 *     late or never. Same root cause as the `--from-start` backfill bug that
 *     shipped for 18 days before three seats diagnosed it (anthill#54).
 *
 * Heartbeat frames are deliberately NOT in the board allow-list: a fresh seat's
 * Monitor should be quiet by default rather than needing a hand-added second
 * filter.
 */
export function buildChecklist(i: ChecklistInput): string[] {
  return [
    `Monitor the grapevine — wrap with Monitor: ${i.tailCommand} | grep --line-buffered '"from"'`,
    `Monitor your board lane — wrap with Monitor: ${i.boardTailCommand} | grep -E --line-buffered '"type":"(task|unblocked|closed)"'`,
    // Stated as an explicit NO-FILTER instruction, not left as an omission: a
    // seat reading the two lines above has just been told twice, emphatically,
    // to append `grep -E --line-buffered`, and will do it here by analogy. The
    // rule only holds if the exception is named where the analogy is drawn.
    `Monitor the team comms — wrap with Monitor, verbatim, NO filter (comms follow emits no keepalives, so there is nothing to strip; adding a grep here can only lose messages): ${i.commsIncantation}`,
    `Find your card BEFORE you claim it — read the board fresh (\`bun ${i.bountyCli} state --mine --as ${i.handle}\`) rather than trusting a listing already in your context; a stale listing is how seats claim a card by title-adjacency after the lead renumbered the board (anthill#40).`,
    "Own your card lifecycle: advance with `bounty update <id> --status doing` when you start, `--status review` when green (the bounty CLI has no `move` verb).",
    `Commit file-scoped with an EXPLICIT pathspec, and stamp your seat: \`anthill commit --as ${i.handle} -m "<msg>" <path>…\`. Never a bare \`git commit\` / \`git add -A\`. Without \`--as\`, git records the HUMAN as the author of every seat's commit, so "who landed this?" is unanswerable afterwards — a team hit exactly that and had to ask the channel to identify one. On a shared tree, serialize: announce, commit, confirm landed, then the next seat goes — or hand ${i.lead ?? "the lead"} your paths for one atomic land.`,
    `Catching up after joining mid-session? Use \`grapevine pull\` (finite, exits). NEVER \`tail --from-start | grep\` — it returns zero output and then times out, which reads as "the channel is empty".`,
    `Finalize BEFORE you drop off: synthesize durable lessons into ${i.seatDocRel}, commit, THEN stand down. Scratch is gitignored — it does not survive the session, so synthesize earlier if the reasoning is warm.`,
    `Route questions + decisions to the lead${i.lead ? ` (${i.lead})` : ""} on the vine — not direct to the human.`,
  ];
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
    const grounding: GroundingEntry[] = groundingPaths.map((p) => {
      const exists = existsSync(p);
      if (!exists) return { path: p, exists };
      // Read failures (permissions, a directory at that path) must not sink the
      // whole manifest — the grounding list is the seat's lifeline. Degrade to
      // "not a placeholder" and let the seat read it.
      let placeholder = false;
      try {
        placeholder = detectPlaceholder(readFileSync(p, "utf8")).isPlaceholder;
      } catch {
        placeholder = false;
      }
      return { path: p, exists, ...(placeholder && { placeholder }) };
    });

    // A configured grounding path that doesn't exist is a dangling reference
    // (commonly a default `AGENTS.md` the repo doesn't have) — surface it as a
    // real warning, not just an inline "(missing!)" the reader might skim past.
    const missingGrounding = grounding.filter((g) => !g.exists).map((g) => relative(root, g.path));
    const placeholderGrounding = grounding
      .filter((g) => g.placeholder)
      .map((g) => relative(root, g.path));
    const warnings: string[] = [];
    if (missingGrounding.length > 0) {
      warnings.push(
        `${missingGrounding.length} grounding doc(s) not found: ${missingGrounding.join(", ")} — fix \`config.grounding\` or create them`,
      );
    }
    if (placeholderGrounding.length > 0) {
      warnings.push(
        `${placeholderGrounding.length} grounding doc(s) appear to be UNFILLED TEMPLATES: ${placeholderGrounding.join(", ")} — read them as "nobody filled this in yet", NOT as "this project has no such content". Worth telling the human.`,
      );
    }

    const tailCommand = `bun ${grapevineCli} tail ${channel} --as ${handle}`;
    const boardTailCommand = `bun ${bountyCli} tail --mine --as ${handle}`;
    const seatDocRel = relative(root, config.seatDocPath(handle));

    const commsIncantation = buildCommsIncantation({
      cliPath: fileURLToPath(new URL("../cli.ts", import.meta.url)),
      channel,
      handle,
    });

    const checklist = buildChecklist({
      tailCommand,
      boardTailCommand,
      commsIncantation,
      bountyCli,
      handle,
      seatDocRel,
      lead: config.lead,
    });

    const data: JoinData = {
      handle,
      channel,
      grounding,
      tailCommand,
      boardTailCommand,
      comms: { channel, incantation: commsIncantation },
      checklist,
      ...(warnings.length > 0 && { warnings }),
    };

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
          const note = !g.exists
            ? "  (missing!)"
            : g.placeholder
              ? "  ⚠ appears to be an UNFILLED TEMPLATE"
              : "";
          lines.push(`  ${i + 1}. ${rel}${note}`);
        });
        lines.push(
          "",
          "Then wire BOTH watches (wrap each with Monitor — do not block):",
          `  grapevine:  ${d.tailCommand}`,
          `  board:      ${d.boardTailCommand}`,
          `  comms:      ${d.comms.incantation}`,
          "",
          "Checklist — your action items as this seat:",
        );
        d.checklist.forEach((c, i) => {
          lines.push(`  [${i + 1}] ${c}`);
        });
        if (d.warnings?.length) {
          lines.push("");
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });
  },
});

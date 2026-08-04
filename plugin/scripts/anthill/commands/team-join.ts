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

/**
 * Where a grounding entry came from. Load-bearing ONLY when the file is missing:
 * the two origins have different remedies, and the old single warning gave the
 * `configured` remedy to every miss. "fix `config.grounding`" sends a seat to
 * edit a list that does not mention `principles.md` — advice that is not merely
 * unhelpful but sends them looking for a cause that isn't there.
 */
type GroundingOrigin = "configured" | "team";

interface GroundingRef {
  path: string;
  origin: GroundingOrigin;
}

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
    // ORDER IS LOAD-BEARING, and it is the reason comms leads. Under Contract
    // 4(d) this emitted text IS a consuming team's onboarding — so whatever is
    // item 1 is the wire that team learns to reach for first. Listing the
    // grapevine first told every team adopting comms to lead with the wire
    // comms is meant to make unnecessary. This is not cosmetic ordering; it is
    // the recommendation, and it was previously being made by accident.
    `Monitor the team comms — wrap with Monitor, verbatim, NO filter (comms follow emits no keepalives, so there is nothing to strip; adding a grep here can only lose messages): ${i.commsIncantation}`,
    // The NO-FILTER instruction above is stated explicitly rather than left as
    // an omission, and it now comes BEFORE the two filtered wires rather than
    // after. Both orderings need the explicit statement: after, a seat has just
    // been told twice to append `grep -E --line-buffered` and does it here by
    // analogy; before, the two lines below teach the filter and a seat may go
    // back and "fix" this one. The exception has to be named at the line it
    // applies to either way — proximity to the analogy was never the guard.
    `Monitor the grapevine — wrap with Monitor: ${i.tailCommand} | grep --line-buffered '"from"'`,
    `Monitor your board lane — wrap with Monitor: ${i.boardTailCommand} | grep -E --line-buffered '"type":"(task|unblocked|closed)"'`,
    `Find your card BEFORE you claim it — read the board fresh (\`bun ${i.bountyCli} state --mine --as ${i.handle}\`) rather than trusting a listing already in your context; a stale listing is how seats claim a card by title-adjacency after the lead renumbered the board (anthill#40).`,
    "Own your card lifecycle: advance with `bounty update <id> --status doing` when you start, `--status review` when green (the bounty CLI has no `move` verb).",
    `Commit file-scoped with an EXPLICIT pathspec, and stamp your seat: \`anthill commit --as ${i.handle} -m "<msg>" <path>…\`. Never a bare \`git commit\` / \`git add -A\`. Without \`--as\`, git records the HUMAN as the author of every seat's commit, so "who landed this?" is unanswerable afterwards — a team hit exactly that and had to ask the channel to identify one. On a shared tree, serialize: announce, commit, confirm landed, then the next seat goes — or hand ${i.lead ?? "the lead"} your paths for one atomic land.`,
    // Two wires, two different catch-up jobs — and the asymmetry is stated as
    // the REASON rather than as a caveat, so a seat can derive the comms case
    // instead of being told it. No comms invocation is named here on purpose:
    // a catch-up needs an anchor id, which does not exist until the seat has a
    // position, so there is no value to resolve at manifest time. Naming one
    // would put a second copy of a command in the one surface whose whole
    // point (Contract 4(d)) is that it carries none. Point at the skill.
    `Catching up after joining mid-session? The two wires need different verbs AND different anchors. The lead clears the vine at convene, so \`grapevine pull\` (finite, exits) gives you THIS session. Nothing clears the comms log — so the same move there replays every session the team has ever had; anchor it to an id and see the \`anthill:comms\` skill. On BOTH: NEVER catch up with a live stream (\`tail --from-start | grep\`, \`follow\`) — a live stream never exits and a filtered one never flushes, so you get zero output and then a timeout, which reads as "the channel is empty".`,
    `Finalize BEFORE you drop off: synthesize durable lessons into ${i.seatDocRel}, commit, THEN stand down. Scratch is gitignored — it does not survive the session, so synthesize earlier if the reasoning is warm.`,
    `Route questions + decisions to the lead${i.lead ? ` (${i.lead})` : ""} on the vine — not direct to the human.`,
  ];
}

export interface GroundingInput {
  root: string;
  /** `config.grounding` — the PRODUCT context, verbatim (relative or absolute). */
  configured: string[];
  teamDir: string;
  seamsPath: string;
  seatDocPath: string;
}

/**
 * The grounding read order, PURE so the order itself is assertable.
 *
 * It had no test at all until `principles.md` was found missing from it — the
 * whole list was assembled inline in `run()`, so the only way to observe an
 * omission was to run the command and read the output, which is precisely how
 * it went unnoticed while BOTH `join/SKILL.md` and `convene/SKILL.md` called the
 * missing file "the highest-leverage read in that list" (anthill backlog
 * 2026-08-01). A list that documents itself in prose and is built in code will
 * disagree with itself, and nothing mechanical was watching.
 *
 * Order is the claim, not the membership: product context (so the seat doc's
 * assumptions hold) → SOP (how the team works) → PRINCIPLES (how work goes
 * wrong) → seams (the shared contracts) → the seat's own doc.
 */
export function buildGroundingRefs(i: GroundingInput): GroundingRef[] {
  return [
    ...i.configured.map((g) => ({
      path: isAbsolute(g) ? g : join(i.root, g),
      origin: "configured" as const,
    })),
    { path: join(i.teamDir, "README.md"), origin: "team" },
    { path: join(i.teamDir, "principles.md"), origin: "team" },
    { path: i.seamsPath, origin: "team" },
    { path: i.seatDocPath, origin: "team" },
  ];
}

/**
 * Missing-doc warnings, split by origin because the REMEDY differs.
 *
 * A missing team doc is the common case on a footprint that predates the file
 * (`principles.md` was added 2026-08-01), and the fix is `anthill init`, which
 * creates what is absent and skips what exists — verified in `team-init.ts`'s
 * plan step, not taken from the upgrade skill's prose.
 */
export function buildMissingWarnings(
  missing: { rel: string; origin: GroundingOrigin }[],
): string[] {
  const warnings: string[] = [];
  const configured = missing.filter((m) => m.origin === "configured").map((m) => m.rel);
  const team = missing.filter((m) => m.origin === "team").map((m) => m.rel);
  if (configured.length > 0) {
    warnings.push(
      `${configured.length} configured grounding doc(s) not found: ${configured.join(", ")} — fix \`config.grounding\` or create them`,
    );
  }
  if (team.length > 0) {
    warnings.push(
      `${team.length} team doc(s) not found: ${team.join(", ")} — these are NOT in \`config.grounding\`, so editing it will not help. A footprint that predates a doc gets it from \`anthill init\`, which creates missing team docs and skips the ones you already have (see \`anthill:upgrade\`).`,
    );
  }
  return warnings;
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
    // principles → seam contract → own seat doc. All resolved to absolute paths.
    const root = config.projectRoot;
    const groundingRefs = buildGroundingRefs({
      root,
      configured: config.grounding,
      teamDir: config.teamDirPath(),
      seamsPath: config.seamsPath(),
      seatDocPath: config.seatDocPath(handle),
    });
    // Origin travels WITH the entry rather than being re-paired by index later:
    // an index lookup needs a fallback, and a fallback here would silently
    // mislabel a doc's provenance — which is the one thing the warning split
    // depends on being right.
    const resolved = groundingRefs.map(({ path: p, origin }) => {
      const exists = existsSync(p);
      if (!exists) return { path: p, exists, origin };
      // Read failures (permissions, a directory at that path) must not sink the
      // whole manifest — the grounding list is the seat's lifeline. Degrade to
      // "not a placeholder" and let the seat read it.
      let placeholder = false;
      try {
        placeholder = detectPlaceholder(readFileSync(p, "utf8")).isPlaceholder;
      } catch {
        placeholder = false;
      }
      return { path: p, exists, origin, ...(placeholder && { placeholder }) };
    });

    // `origin` is internal bookkeeping, not part of the emitted manifest — the
    // payload shape stays exactly as consumers already read it.
    const grounding: GroundingEntry[] = resolved.map(({ origin: _origin, ...entry }) => entry);

    // A grounding path that doesn't exist is a dangling reference — surface it
    // as a real warning, not just an inline "(missing!)" the reader might skim
    // past. Split by origin: a dangling `config.grounding` ref (commonly a
    // default `AGENTS.md` the repo doesn't have) and a team doc the footprint
    // predates have different fixes.
    const missingGrounding = resolved
      .filter((g) => !g.exists)
      .map((g) => ({ rel: relative(root, g.path), origin: g.origin }));
    const placeholderGrounding = grounding
      .filter((g) => g.placeholder)
      .map((g) => relative(root, g.path));
    const warnings: string[] = buildMissingWarnings(missingGrounding);
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

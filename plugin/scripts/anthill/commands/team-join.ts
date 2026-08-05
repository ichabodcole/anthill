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
  /** The spellbook wires. TOTAL — always present, `null` when spellbook did not
   * resolve, which is a positive observation and never an unpopulated field. The
   * reason is carried in `warnings`. */
  tailCommand: string | null;
  boardTailCommand: string | null;
  /** The team comms wire (`seams.md` Contract 4(b)). Present in EVERY manifest
   * `join` emits — the consumer branches on this block rather than probing the
   * filesystem or interpreting an exit code to decide what to render. It needs
   * no spellbook, so it survives a coord failure (S8-1). The paths that emit no
   * manifest at all (unknown seat, no config) are the error surface, not this
   * one. */
  comms: { channel: string; incantation: string };
  checklist: string[];
  /** Surfaced when a configured grounding path doesn't exist — a dangling
   * `config.grounding` ref (e.g. a default `AGENTS.md` the repo doesn't have)
   * shouldn't be a silent miss. */
  warnings?: string[];
}

/**
 * ONE spellbook-backed wire's resolution outcome.
 *
 * `available: false` is a POSITIVE observation carrying its reason, not an
 * absence. A consumer must never have to tell "this wire did not resolve" from
 * "nobody populated the field" — Contract 5(a)'s rule, applied to the data side.
 *
 * Everything downstream — the checklist lines, the manifest's `tailCommand` /
 * `boardTailCommand` — is a PROJECTION of these, never a second derivation.
 *
 * _(This docstring previously described the wires as ONE verdict for both, and
 * argued for it. That design was the defect below, and the prose outlived it by
 * one commit — the "prose about code, written by the person who just wrote the
 * code" failure this seat records against itself. Rewritten, not amended.)_
 */
export type WireStatus = { available: true; cli: string } | { available: false; reason: string };

/**
 * PER WIRE, not one verdict for both — and this is a CORRECTION of the first
 * version of this fix, found by a blank-context reader.
 *
 * S8-1's whole thesis is that one wire's missing dependency must not suppress
 * another's. The first fix applied that to comms-vs-spellbook and then **left
 * the identical bug one level in**: grapevine and bounty are separate CLIs that
 * can independently fail to resolve, and a single `available` flag meant a
 * missing BOUNTY told the seat *"NO GRAPEVINE AND NO BOARD … you cannot tail the
 * vine"* while the grapevine resolved perfectly. Reproduced with a fake cache
 * carrying grapevine 9.0.0 and no bounty.
 *
 * That is this seat's *"a defect's NAME bounds your attention, not the bug"*
 * lesson, third instance: I fixed the coupling I was pointed at and shipped the
 * same coupling in the code that fixed it.
 */
export interface CoordWires {
  grapevine: WireStatus;
  bounty: WireStatus;
}

export interface ChecklistInput {
  /** The spellbook wires, each carrying its own availability + reason. */
  coord: CoordWires;
  /** The team comms wire — fully resolved, run verbatim, filter-free. */
  commsIncantation: string;
  handle: string;
  /** The team channel — the grapevine tail is composed here, per wire. */
  channel: string;
  seatDocRel: string;
  lead: string | undefined;
  /** The PROJECT's gate command (`config.gate`), or undefined if none declared. */
  gate: string | undefined;
  /** Gitignored scratch path a seat writes its commit message to, so the body
   * never passes through a shell. */
  msgFileRel: string;
  /** Absolute path to the emitting cli.ts, so the LAND string resolves to the
   * binary that composed it rather than through PATH. */
  cliPath: string;
}

/**
 * The LAND command, fully composed — gate and commit in one string, with no
 * pipe and no inline message body.
 *
 * This is a MECHANICAL GUARD replacing two prose warnings that both failed, in
 * one session, against agents who had read them:
 *
 *   * `bun run check | tail -6 && anthill commit …` — `&&` tests the exit status
 *     of `tail`, which is always 0. The gate reported failure and the commit ran
 *     anyway. **The guard is defeated while remaining visibly present in the
 *     command**, and the pipe is there because an agent is trying to keep output
 *     short. A lead hit the same pipeline-exit-code confusion the same day on a
 *     different command.
 *   * `-m "… \`fresh\` …"` — an un-quoted body is command-substituted by the
 *     shell BEFORE the tool sees it, so backticked spans execute and vanish from
 *     the message. `--stdin`/`-F` exist precisely for this, were built by the
 *     seat that then didn't use them, and the corrupted commit is on this branch.
 *
 * Both are `principles.md`'s *"a dispositional instruction holds; a situational
 * warning fails at the recognition step"* — the compliance was never the
 * problem, recognising that THIS was an instance was. So the fix is not a third
 * wording: it is emitting the composition, per Contract 4(d) — **exemplify the
 * dialogue, never the invocation.**
 *
 * `gate` is the PROJECT's, never anthill's: hard-coding `bun run check` here
 * would be the convention-baked-into-a-default anti-pattern this project names
 * in AGENTS.md. When it is absent the line says so EXPLICITLY rather than
 * quietly emitting a commit with no gate — an unstated absence and a considered
 * one must not look alike.
 */
export type GateDecision =
  | { composable: true; gate: string }
  | { composable: false; notice: string };

/**
 * ONE verdict on whether `config.gate` may be composed into the emitted land
 * string. Both the command and its warning derive from THIS — never from two
 * separate predicates, which is the "two copies of one verdict" defect `status`
 * and `down` were just de-duplicated for.
 *
 * A gate is refused for two different reasons, and they are kept distinguishable
 * because they call for different actions by different people:
 *
 *   * **unset** — the project never configured one. The lead sets it.
 *   * **not composable** — it is set, but contains a shell operator that would
 *     make `&&` test the WRONG command's exit status. `bun run check | tail -6`
 *     is the live example: `&&` then tests `tail`, which is always 0, so the
 *     commit runs on a RED gate. That is the original defect this whole
 *     composition exists to prevent, arriving through the config field instead
 *     of through the agent's shell — and `bash -n` is clean on it, so nothing
 *     downstream complains.
 *
 * `&&` is deliberately ALLOWED (`tsc --noEmit && bun test` is a correct gate and
 * fails correctly). `|`, `||`, `;`, a lone `&`, backticks, `$(…)` and newlines
 * are not: each can make a failing gate report success.
 */
export function decideGate(gate: string | undefined): GateDecision {
  if (gate === undefined) {
    return {
      composable: false,
      notice:
        "⚠ NO GATE CONFIGURED (`config.gate` is unset), so the command above runs your project's verification NOT AT ALL — run your project's check yourself before landing, and tell your lead the config is missing it.",
    };
  }
  // `&&` is the one operator that preserves failure, so it is removed before
  // looking for a bare `&` (background, which detaches and always succeeds).
  const withoutAnd = gate.replaceAll("&&", "");
  const unsafe =
    /[|;`\n\r]/.test(gate) || gate.includes("$(") || withoutAnd.includes("&") || gate.trim() === "";
  if (unsafe) {
    return {
      composable: false,
      notice: `⚠ config.gate is set to \`${gate}\` and was NOT composed into the command above, because it contains a shell operator that would make \`&&\` test the wrong command's exit status — a failing gate would report success and your commit would land on a red gate. Run your gate as its own command, read its result, then land. Tell your lead to set config.gate to a single command (\`&&\` is fine; a pipe is not).`,
    };
  }
  return { composable: true, gate };
}

export function buildLandCommand(i: {
  handle: string;
  gate: string | undefined;
  msgFileRel: string;
  /** Absolute path to the cli.ts that EMITTED this string. See below. */
  cliPath: string;
}): string {
  // FULLY RESOLVED, never a bare `anthill` — Contract 4(a), which this string
  // was violating while the comms incantation beside it obeyed.
  //
  // A bare `anthill` resolves through PATH to the launcher, which picks the
  // highest CACHED RELEASE. Measured on this machine: that launcher has no
  // `-F`, so the string a seat is told to run VERBATIM fails outright — and it
  // fails on the one flag that exists to stop a backticked message body being
  // executed by the shell. A verifier declined to run it and was right to.
  //
  // Resolving to the emitting cli.ts makes the string self-consistent by
  // construction: whatever binary composed the instruction is the binary that
  // executes it, so the two can never disagree about which flags exist. That is
  // the same guarantee `--version`'s `source` field reports, applied rather
  // than merely observed.
  const commit = `bun ${i.cliPath} commit --as ${i.handle} -F ${i.msgFileRel} <path>…`;
  const decision = decideGate(i.gate);
  // The returned value is A COMMAND OR NOTHING ELSE. It previously concatenated
  // the no-gate warning INTO the string under a label reading "LAND with this
  // EXACT string": `bash -n` exit 2, and it carried BACKTICKS — the second of
  // the two failure modes this function was built to prevent, reintroduced into
  // the one string we tell every seat to run verbatim. weaver's `upgrade 4d`
  // finding is what made it maximal: no existing footprint could receive
  // `config.gate` by any path that existed, so EVERY existing anthill project
  // emitted the broken branch. The warning is now a sibling value (`notice`),
  // rendered beside the command and never inside it.
  return decision.composable ? `${decision.gate} && ${commit}` : commit;
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
    // The spellbook wires are a PROJECTION of one verdict. When they are
    // unavailable the checklist says so in the seat's own voice and names the
    // remedy — it does NOT emit a command with a hole in it. A half-resolved
    // incantation is the thing Contract 4(a) exists to forbid, and "run this
    // verbatim" makes an unusable string worse than an honest absence.
    // EACH WIRE REPORTS ITSELF. A single verdict told a seat "NO GRAPEVINE AND
    // NO BOARD … you cannot tail the vine" when only BOUNTY was missing — a
    // manifest asserting something false about a wire that was working.
    ...(i.coord.grapevine.available
      ? [
          `Monitor the grapevine — wrap with Monitor: bun ${i.coord.grapevine.cli} tail ${i.channel} --as ${i.handle} | grep --line-buffered '"from"'`,
        ]
      : [
          `⚠ NO GRAPEVINE THIS JOIN — ${i.coord.grapevine.reason} You cannot tail the discussion channel. Your comms wire above is UNAFFECTED (it is anthill's own and needs no spellbook), and so are your grounding docs. **Tell your lead rather than working around it.**`,
        ]),
    ...(i.coord.bounty.available
      ? [
          `Monitor your board lane — wrap with Monitor: bun ${i.coord.bounty.cli} tail --mine --as ${i.handle} | grep -E --line-buffered '"type":"(task|unblocked|closed)"'`,
          `Find your card BEFORE you claim it — read the board fresh (\`bun ${i.coord.bounty.cli} state --mine --as ${i.handle}\`) rather than trusting a listing already in your context; a stale listing is how seats claim a card by title-adjacency after the lead renumbered the board (anthill#40).`,
          "Own your card lifecycle: advance with `bounty update <id> --status doing` when you start, `--status review` when green (the bounty CLI has no `move` verb).",
        ]
      : [
          `⚠ NO BOARD THIS JOIN — ${i.coord.bounty.reason} You cannot claim or advance a card, so you will be INVISIBLE on the board — which looks exactly like a seat with nothing to do. **Tell your lead rather than working around it.**`,
        ]),
    // The composed land goes FIRST and verbatim. Everything after it is the
    // reasoning; a seat that reads only the first clause still lands correctly,
    // which is the property the previous prose-only form did not have.
    // The emitted string is A COMMAND, and the warnings are BELOW it. They were
    // briefly concatenated into it, which made the no-gate branch a shell syntax
    // error carrying backticks — the defect this line exists to prevent, inside
    // the line that prevents it. A notice that cannot be run is not a safer
    // notice; it is an unusable command.
    `LAND with this EXACT string — gate and commit in one, no pipe, no inline -m (write your message to ${i.msgFileRel} first):\n    ${buildLandCommand({ handle: i.handle, gate: i.gate, msgFileRel: i.msgFileRel, cliPath: i.cliPath })}${(() => {
      const d = decideGate(i.gate);
      return d.composable ? "" : `\n  ${d.notice}`;
    })()}\n  Do NOT pipe the gate to \`tail\`/\`head\`/\`grep\` to shorten its output: \`&&\` would then test the FILTER's exit status, which is always 0, and your commit runs on a red gate while the guard is still visibly there. Redirect to a file and read that instead. Do NOT pass the body with \`-m\` if it contains backticks — the shell executes them before the tool sees them. Both of these defeated agents who had just read the warning against them.`,
    `Commit file-scoped with an EXPLICIT pathspec, and stamp your seat. Never a bare \`git commit\` / \`git add -A\`. Without \`--as\`, git records the HUMAN as the author of every seat's commit, so "who landed this?" is unanswerable afterwards — a team hit exactly that and had to ask the channel to identify one. On a shared tree, serialize: announce, commit, confirm landed, then the next seat goes — or hand ${i.lead ?? "the lead"} your paths for one atomic land.`,
    // Two wires, two different catch-up jobs — and the asymmetry is stated as
    // the REASON rather than as a caveat, so a seat can derive the comms case
    // instead of being told it. No comms invocation is named here on purpose:
    // a catch-up needs an anchor id, which does not exist until the seat has a
    // position, so there is no value to resolve at manifest time. Naming one
    // would put a second copy of a command in the one surface whose whole
    // point (Contract 4(d)) is that it carries none. Point at the skill.
    `Catching up after joining mid-session? The two wires need different verbs AND different anchors. The lead clears the vine at convene, so \`grapevine pull\` (finite, exits) gives you THIS session. Nothing clears the comms log — so the same move there replays every session the team has ever had; anchor it to an id and see the \`anthill:comms\` skill. On BOTH: NEVER catch up with a live stream (\`tail --from-start | grep\`, \`follow\`) — a live stream never exits and a filtered one never flushes, so you get zero output and then a timeout, which reads as "the channel is empty".`,
    // NAMES THE VERB, not just the act. This line already carried the CORRECT
    // ordering (synthesize → commit → THEN stand down) and every seat reads it
    // at every join — but it said "stand down" in English and never named
    // `anthill comms stand-down`, so it reads as "finish up and leave", an act
    // with no artifact. Session 9's seats produced tombstones only once the lead
    // named the command on the wire, and his improvised ordering was the INVERSE
    // of this line: four of four seats followed the message over the manifest.
    // **The ordering was never missing — it was present, correct, and overridden
    // by a wire that evaporates.** An instruction that cannot be discharged
    // mechanically loses to one that can.
    `Finalize BEFORE you drop off: synthesize durable lessons into ${i.seatDocRel}, commit, post your retro answers, THEN record your departure with \`bun ${i.cliPath} comms stand-down --as ${i.handle}\` — the LAST thing you do. It is a positive observation the teardown guard reads; "I stopped working" leaves no record and is not a departure. Scratch is gitignored — it does not survive the session, so synthesize earlier if the reasoning is warm.`,
    // NAMES NO WIRE — found by grepping this scope after the same collapse was
    // fixed three times elsewhere today. This said "on the vine", and it is
    // EMITTED to every consuming project: a team running comms-only (which this
    // one did, all session) was being told to route decisions on a wire nobody
    // was reading. The instruction is about WHO and the wire is incidental, so
    // the fix is to stop naming one rather than to name the right one — the
    // next wire added would make any named list wrong again.
    `Route questions + decisions to the lead${i.lead ? ` (${i.lead})` : ""} on the team's channel — whichever wires this session armed, NOT direct to the human.`,
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
 * Project an internal entry onto the EMITTED manifest shape — `origin` is
 * bookkeeping for the warning split and must never reach the payload.
 *
 * Extracted from an inline `.map()` in `run()` because nothing tested it (D3,
 * blank-context verify): it is the single line keeping the "payload shape is
 * unchanged" promise true, and a refactor could leak `origin` into the manifest
 * with the whole suite green. A promise with no assertion is a claim, not a
 * guarantee.
 */
export function toManifestEntry(e: GroundingEntry & { origin: GroundingOrigin }): GroundingEntry {
  const { origin: _origin, ...entry } = e;
  return entry;
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

    // S8-1 — a SPELLBOOK absence must not suppress an ANTHILL block that does
    // not depend on it, and must not withhold the grounding list, which depends
    // on nothing but the repo.
    //
    // This used to `process.exit(1)` here, before a single line of the manifest
    // was built. The same function degrades a failed grounding-doc READ forty
    // lines below, under the comment "must not sink the whole manifest — the
    // grounding list is the seat's lifeline"; that rule simply stopped one layer
    // short of the thing that sank the whole manifest.
    //
    // The two remaining fatal paths above (unknown seat, no config) STAY fatal
    // and are not an oversight: there is no seat doc to ground in and no roster
    // to emit, so there is no manifest to degrade to. That is why Contract 4(b)'s
    // "ALWAYS present" is bounded to every manifest `join` EMITS — an unbounded
    // "always" is false no matter what this function does.
    // Resolved INDEPENDENTLY per wire: they are separate CLIs and can fail
    // separately, and a shared try/catch made a missing bounty report the
    // grapevine as gone too.
    const resolveWire = (tool: "grapevine" | "bounty"): WireStatus => {
      try {
        return { available: true, cli: resolveCoordCli(tool) };
      } catch (err) {
        return { available: false, reason: (err as Error).message };
      }
    };
    const coord: CoordWires = {
      grapevine: resolveWire("grapevine"),
      bounty: resolveWire("bounty"),
    };

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

    const grounding: GroundingEntry[] = resolved.map(toManifestEntry);

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

    // One warning PER unavailable wire, naming that wire. A single combined
    // warning asserted both were gone whenever either was.
    if (!coord.grapevine.available) {
      warnings.push(
        `NO GRAPEVINE: ${coord.grapevine.reason} You cannot tail the discussion channel. The comms wire and your grounding docs are UNAFFECTED — they are anthill's own and need no spellbook.`,
      );
    }
    if (!coord.bounty.available) {
      warnings.push(
        `NO BOARD: ${coord.bounty.reason} You cannot claim or advance a card. Tell your lead: a seat that cannot claim a card is invisible on the board, which looks identical to a seat with nothing to do.`,
      );
    }

    const seatDocRel = relative(root, config.seatDocPath(handle));

    const cliPath = fileURLToPath(new URL("../cli.ts", import.meta.url));
    const commsIncantation = buildCommsIncantation({
      cliPath,
      channel,
      handle,
    });

    const checklist = buildChecklist({
      coord,
      commsIncantation,
      cliPath,
      handle,
      channel,
      seatDocRel,
      lead: config.lead,
      gate: config.gate,
      // Beside the seat's scratch, which `init` already gitignores — so a
      // commit-message file never becomes a stray artifact on the gate surface.
      msgFileRel: join(relative(root, config.teamDirPath()), "scratch", handle, "commit-msg.txt"),
    });

    const data: JoinData = {
      handle,
      channel,
      grounding,
      // TOTAL, and `null` is a positive statement — "spellbook did not resolve",
      // never "nobody populated this". Same discipline as Contract 6(c)'s
      // null-is-not-a-rounded-down-zero: a consumer that cannot tell an
      // inapplicable field from an unpopulated one has been handed a guess.
      tailCommand: coord.grapevine.available
        ? `bun ${coord.grapevine.cli} tail ${channel} --as ${handle}`
        : null,
      boardTailCommand: coord.bounty.available
        ? `bun ${coord.bounty.cli} tail --mine --as ${handle}`
        : null,
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
        // A `null` interpolated into text renders the literal string "null",
        // which reads as a COMMAND — and this block is labelled "wire these
        // watches", so a seat would try to run it. The JSON side is honest
        // (`null` is a value there); the text side is a different audience and
        // needs a sentence. Caught by RUNNING the command: the pure functions
        // and the JSON payload were both already correct, which is this seat's
        // standing pattern — every assertion lands on the half that never broke.
        // PER WIRE. This line was `tailCommand !== null && boardTailCommand
        // !== null` — a CONJUNCTION — so one wire down printed BOTH as
        // UNAVAILABLE. With grapevine up and bounty missing, the summary told
        // the seat the grapevine was gone while the checklist eight lines below
        // handed them the working grapevine tail, and "see the warning below"
        // pointed at a warning that does not exist because grapevine did not
        // fail.
        //
        // THIRD INSTANCE OF ONE DEFECT, IN ONE DIFF: comms-vs-spellbook, then
        // grapevine-vs-bounty in the JSON payload, then grapevine-vs-bounty
        // here. I wrote the comment above `CoordWires` describing instance two
        // — "left the identical bug one level in" — while introducing this one.
        // The collapse is not a slip you catch by care; it is what happens
        // whenever two independent things are summarised by one boolean.
        //
        // The test gap had the matching shape: the partial world was covered in
        // JSON and never in text, because the only text test used an empty HOME
        // where BOTH wires are down — a guard that exists and does not reach the
        // path the bug is on.
        const wireLine = (label: string, cmd: string | null) =>
          `  ${label}${cmd ?? "UNAVAILABLE — see the warning below"}`;
        const wiredCount = [d.tailCommand, d.boardTailCommand].filter((c) => c !== null).length;
        lines.push(
          "",
          wiredCount === 2
            ? "Then wire BOTH watches (wrap each with Monitor — do not block):"
            : "Then wire your watches (wrap each with Monitor — do not block):",
          wireLine("grapevine:  ", d.tailCommand),
          wireLine("board:      ", d.boardTailCommand),
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

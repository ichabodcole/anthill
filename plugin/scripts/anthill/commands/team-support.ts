/**
 * Shared helpers for the `anthill` team command facade.
 *
 * The facade is a thin, agent-aware wrapper over the spellbook `grapevine` +
 * `bounty` CLIs (via coord.ts) and the `.anthill/config.json` config layer (config.ts).
 * Everything that was hardcoded in flute's team-support.ts — the channel, the
 * roster, the default spawn set — is config-driven now.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitError, type OutputFormat } from "../agent-layer.ts";
import { hasDeparted, readPosition, readSessionOpen } from "../comms.ts";
import { ConfigError, loadProject, type ResolvedConfig, type ResolvedProject } from "../config.ts";
import { execCoord, parseJsonLine, resolveCoordCli } from "../coord.ts";
import { readPin, resolveTeam, type TeamRung, type TeamSelector } from "../team-resolve.ts";

/**
 * Load the resolved config for a team command — for the ONE TEAM this invocation
 * is about — or emit a clear error and exit(1). Centralizes both the "no config
 * yet" failure (pointing at `anthill:bootstrap`) and the "which team?" decision,
 * so every command answers them the same way.
 *
 * ⚠ ONE INSERTION POINT IS NOT ENOUGH, and this doc comment is the reminder.
 * `--team` must ALSO be declared on each command locally — root `args` are not
 * inherited into subcommands (`cli.ts`) — and `team-comms.ts` deliberately
 * bypasses this function with its own loader. Threading the ladder here and
 * stopping is how the central safety requirement ends up green while
 * `anthill comms read` still binds to whatever config it finds up-tree.
 */
export function requireConfig(
  format: OutputFormat,
  command: string,
  sel: TeamSelector & { channel?: string | undefined; session?: string | undefined } = {},
): ResolvedConfig {
  return requireTeam(format, command, sel).team;
}

/**
 * The project, WITHOUT resolving a team — and the distinction is load-bearing.
 *
 * `anthill team use <name>` is the command you run precisely BECAUSE the project
 * is ambiguous. Routing it through `requireTeam` would make it throw "two teams
 * and nothing selected one" and name `anthill team use` as the remedy — for the
 * command you are already running. A project with no pin and two teams must be
 * able to gain a pin.
 */
export function requireProject(format: OutputFormat, command: string): ResolvedProject {
  try {
    return loadProject();
  } catch (err) {
    if (err instanceof ConfigError) {
      emitError({ format, command, error: err.message });
      process.exit(1);
    }
    throw err;
  }
}

/**
 * The same resolution, with the PROJECT and the RUNG kept.
 *
 * Most commands want only their team and say so by calling `requireConfig`. Three
 * things need more, and each needs a different part: `anthill team show` prints
 * the rung, `anthill team ls`/`use` and the convene guard reason about EVERY
 * configured team, and `spawn` needs to know whether this project has more than
 * one — a single-team project must not gain an `ANTHILL_TEAM=` in its pane launch
 * lines, which would be a visible change to a repo that configured nothing.
 */
export function requireTeam(
  format: OutputFormat,
  command: string,
  sel: TeamSelector & { channel?: string | undefined; session?: string | undefined } = {},
): { project: ResolvedProject; team: ResolvedConfig; via: TeamRung } {
  try {
    const project = loadProject();
    const { team, via } = resolveTeam(project, {
      team: sel.team,
      env: process.env,
      pin: readPin(project.projectRoot),
    });
    rejectOtherTeam(project, team, sel);
    return { project, team, via };
  } catch (err) {
    if (err instanceof ConfigError) {
      emitError({ format, command, error: err.message });
      process.exit(1);
    }
    throw err;
  }
}

/**
 * Refuse a `--channel`/`--session` that names a DIFFERENT configured team.
 *
 * The hazard is narrow and specific: the team resolved to A, and the value points
 * at B, so the command would half-address each — B's wire with A's roster, gate
 * and seat docs. Naming a value that matches NO configured team stays allowed;
 * that is a legitimate escape hatch (an ad-hoc session, a channel outside the
 * config) and refusing it would break existing single-team use.
 */
export function rejectOtherTeam(
  project: ResolvedProject,
  resolved: ResolvedConfig,
  sel: { channel?: string | undefined; session?: string | undefined },
): void {
  for (const [flag, value] of [
    ["--channel", sel.channel],
    ["--session", sel.session],
  ] as const) {
    if (!value) continue;
    const owner = project.teams.find((t) => t.channel === value && t.name !== resolved.name);
    if (owner) {
      throw new ConfigError(
        `${flag} "${value}" belongs to team "${owner.name}", but this command resolved to team ` +
          `"${resolved.name}". Use \`--team ${owner.name}\` to address that team — passing its ` +
          `channel alone would run "${owner.name}"'s wire against "${resolved.name}"'s roster, ` +
          "gate and seat docs.",
      );
    }
  }
}

/**
 * Which configured teams look LIVE right now — every team, not just the resolved
 * one.
 *
 * ⚠ THE SCOPE IS THE WHOLE POINT. The existing presence guard
 * (`seatPresence(config.channel, config)` in `down`) is scoped to ONE team, so a
 * stale resolution lets you switch away from a live team and strand its seats:
 * they keep working while every command the lead runs resolves somewhere else.
 * Both callers — `team use` and the `convene` guard — must ask about all of them.
 *
 * `unknown` COUNTS AS LIVE, matching `shouldBlockTeardown`'s direction and for the
 * same asymmetry: a false "live" costs one `--force`, a false "idle" strands a
 * working seat. An advisory signal may push toward the recoverable failure and
 * must never push toward the other.
 */
export function liveTeams(project: ResolvedProject): Array<{
  name: string;
  channel: string;
  presence: SeatPresence;
}> {
  const live: Array<{ name: string; channel: string; presence: SeatPresence }> = [];
  const boardHolder = boardBoundTo(project);
  for (const team of project.teams) {
    // ⚠ THE BOARD BINDING IS CHECKED FIRST, BECAUSE IT IS WRITTEN FIRST.
    //
    // The convene guard's stated reason is `.bounty-session` — a single repo-root
    // file. But every signal below comes from the comms session-open record, which
    // `spawn` writes, while `.bounty-session` is written by `convene`. So the
    // entire convene → brief → spawn window was unguarded, in the guard's own
    // scenario. Measured on a two-team fixture:
    //
    //   $ anthill convene --team dev    → .bounty-session = k-myproject-1a36f1b1
    //   $ anthill convene --team lean   → ok:true, REBOUND to k-lean-1a36f1b1
    //
    // No refusal, and `dev`'s board is now `lean`'s underneath its seats — exactly
    // the outcome the guard exists to prevent, reachable in the seconds before any
    // seat is spawned. A guard that reads a LATER artifact than the one it names
    // cannot cover the window between them.
    if (boardHolder === team.name) {
      live.push({
        name: team.name,
        channel: team.channel,
        presence: { state: "unknown", reason: "holds the pinned board (`.bounty-session`)" },
      });
      continue;
    }
    // ⚠ NEVER CONVENED IS A POSITIVE OBSERVATION, and it must be made BEFORE
    // asking about presence. `seatPresence` answers `unknown` for a team with no
    // session-open record — correctly, since it cannot scope departures without
    // one — and `unknown` counts as live below. Applied to a team that has simply
    // never been convened, that reads every fresh project as fully live and
    // refuses `anthill team use` on the exact repo it exists to serve. Measured:
    // a brand-new two-team config refused BOTH teams.
    //
    // `down` does not hit this because it runs only after confirming the tmux
    // session exists; there is no such precondition here, so the precondition has
    // to be stated. The absence of the record is not an absence we failed to
    // observe — it is the file the open would have written, and it is not there.
    if (!readSessionOpen(team.teamDirPath(), team.channel)) continue;

    const presence = seatPresence(team.channel, team);
    if (presence.state !== "none") {
      live.push({ name: team.name, channel: team.channel, presence });
    }
  }
  return live;
}

/** The repo-root marker `bounty open --pin` writes: this checkout's bound board. */
export const BOUNTY_SESSION_FILE = ".bounty-session";

/**
 * PURE: which configured team a pinned board id belongs to, or `null`.
 *
 * ⚠ THIS READS SPELLBOOK'S ID FORMAT, and that coupling is deliberate but has to
 * be held honestly. anthill opens with `--session-key <channel>`
 * (`bountyOpenArgs`), and bounty derives `k-<key>-<hash>`. Nothing else in anthill
 * parses this file.
 *
 * **The prefix test is unambiguous because channels are validated PREFIX-FREE**
 * (`config.ts`) — the rule that exists so `anthill attach` cannot fold
 * `<channel>-<suffix>` into a sibling's menu. At most one configured channel can
 * match, by construction.
 *
 * **What keeps this from rotting silently is the round-trip test, not this
 * comment:** `team-support.boardbinding.test.ts` runs a real `convene` and asserts
 * that what it wrote is recognized here. If spellbook changes its derivation, that
 * test goes RED — rather than this returning `null` forever and the guard quietly
 * failing open, which is the failure mode that produced the bug it fixes.
 */
export function boardOwnerFromBinding(
  binding: string,
  teams: Array<{ name: string; channel: string }>,
): string | null {
  const id = binding.trim();
  if (id === "") return null;
  const owner = teams.find((t) => id.startsWith(`k-${t.channel}-`) || id === t.channel);
  return owner ? owner.name : null;
}

/** The fs half: read `.bounty-session` and name the team holding it, if any. */
function boardBoundTo(project: ResolvedProject): string | null {
  const path = join(project.projectRoot, BOUNTY_SESSION_FILE);
  if (!existsSync(path)) return null;
  return boardOwnerFromBinding(readFileSync(path, "utf8"), project.teams);
}

/** PURE: how a live team reads in a refusal — who is on it, or why we cannot tell. */
export function describeLiveTeam(live: { name: string; presence: SeatPresence }): string {
  if (live.presence.state === "present") {
    return `"${live.name}" (seats present: ${live.presence.seats.join(", ")})`;
  }
  const reason = live.presence.state === "unknown" ? live.presence.reason : "state not observed";
  return `"${live.name}" (could not confirm it is idle: ${reason})`;
}

export interface BoardCounts {
  todo: number;
  doing: number;
  review: number;
  done: number;
}

/** The shape `bounty state` returns (the bits we read): a title + the task list. */
interface BoardState {
  state?: { title?: string; tasks?: Array<{ status?: string }> };
}

export interface BoardSummary {
  counts: BoardCounts;
  /** The board's title — surfaced so an AMBIENT board (a stranger's, read off the
   * bounty daemon's global "latest" pointer) is self-evidently labeled, not passed
   * off as this team's. */
  title: string | undefined;
}

/**
 * PURE: tally a parsed `bounty state` payload into column counts + the board title.
 * Returns null when the payload carries no task list (board not readable).
 */
export function summarizeBoard(parsed: BoardState | null): BoardSummary | null {
  const tasks = parsed?.state?.tasks;
  if (!tasks) return null;
  const counts: BoardCounts = { todo: 0, doing: 0, review: 0, done: 0 };
  for (const task of tasks) {
    if (task.status && task.status in counts) {
      counts[task.status as keyof BoardCounts] += 1;
    }
  }
  return { counts, title: parsed?.state?.title };
}

/**
 * Read the bounty board's column counts + title. Returns `board: null` (never
 * throws) when the board isn't running / can't be read; the warning text is
 * returned alongside so callers can surface it in `data.warnings`.
 *
 * NOTE: `bounty state` (no `--session`) resolves the board AMBIENTLY. Once
 * `anthill convene` has opened the board keyed + pinned (`--session-key <channel>
 * --pin`), `.bounty-session` at the repo root binds this call to THIS team's board
 * via walk-up — not the daemon's global "latest" (a stranger's). See seams.md, the
 * board-binding contract (owner: forager). We still return the `title` so an
 * unexpectedly-ambient read (convene never ran) is self-evidently labeled.
 */
export async function readBoardCounts(): Promise<{
  board: BoardCounts | null;
  title?: string;
  warning?: string;
}> {
  try {
    const bountyCli = resolveCoordCli("bounty");
    const state = await execCoord(bountyCli, ["state"]);
    const summary = state.ok ? summarizeBoard(parseJsonLine<BoardState>(state.stdout)) : null;
    if (!summary) {
      return { board: null, warning: "bounty board not running (open one via the bounty skill)" };
    }
    return { board: summary.counts, title: summary.title };
  } catch (err) {
    return { board: null, warning: `bounty CLI unresolved: ${(err as Error).message}` };
  }
}

/**
 * Who is on the channel, as THREE distinguishable states rather than a list that
 * is empty for two unrelated reasons.
 *
 * This mirrors `positionState` in `comms.ts` deliberately (seams.md Contract
 * 6(c)): `never-followed` is not a rounded-down zero, and `unknown` is not an
 * empty channel. Both are the same rule — a tool may not report an absence it
 * did not observe.
 */
export type SeatPresence =
  | { state: "unknown"; reason: string }
  | { state: "none" }
  | { state: "present"; seats: string[] };

/**
 * PURE: presence as seen from the COMMS wire, from the same rows
 * `comms positions` reports.
 *
 * Why this exists: presence was single-wire on a multi-wire team. `seatPresence`
 * read grapevine's `who` and nothing else, so on a session where comms is the
 * only armed wire it returned a confident `none` — **measured live, with five
 * seats working** — and `shouldBlockTeardown` correctly let a pane-killing
 * command through. The guard was not wrong; it was answering honestly about a
 * wire nobody was on.
 *
 * `followerAlive` is ADVISORY under seams.md Contract 6(f) — pids are reused, so
 * it narrows a question and never answers one. **It is used here in one
 * direction only: to say PRESENT, never to say absent.** That is legitimate
 * precisely because the costs are asymmetric — a false "present" costs one
 * `--force`, and a false "absent" kills a seat mid-build. An advisory signal may
 * push toward the recoverable failure and must never push toward the other.
 *
 * `null` means NOT CHECKED and must not be read as checked-and-dead (6(f)
 * again), so it yields `unknown` rather than contributing to an absence.
 *
 * **`false` yields `unknown` TOO, and that is the F1 ruling** — the sentence
 * above used to be a promise the code broke. `followerAlive === false` was
 * neither `live` nor `unchecked`, so it fell through to `none`, and `none` is
 * the only state `shouldBlockTeardown` permits teardown on. The docstring said
 * PRESENT-never-absent while the code did the opposite, on the pane-killing
 * command. The reason it is a ruling and not a coin-flip:
 *
 *   **`down` kills PANES. `followerAlive` observes FOLLOW PROCESSES. A follow
 *   process is not a pane.**
 *
 * A seat whose `comms follow` died is the single most common failure this team
 * hits; the agent keeps working in its pane, and its scratch is gitignored and
 * exists nowhere else. Contract 6(f) already fixes what a dead pid means — that
 * `emittedThrough` is a HIGH-WATER MARK, not that the seat is gone — so deriving
 * an absence from it contradicts the contract this file's own comments cite.
 * `pidAlive` is ESRCH-only and pids are reused, so a **restarted** follower with
 * a new pid reads identically to a dead one; an instrument that cannot separate
 * those two may not be the one that authorises a teardown.
 *
 * **`none` NO LONGER MEANS "no records".** It used to, and that was an ABSENCE
 * OF DATA authorising a destructive act: a freshly-convened team has an empty
 * positions directory (`recordPosition` only fires once a follower has emitted,
 * `team-comms.ts`), so the guard permitted teardown during exactly the window
 * when seats were spawning. sentinel reproduced the kill — `tornDown: true` on a
 * session with a pane doing work, no `--force`, no warning.
 *
 * So `none` now requires a POSITIVE observation of departure:
 *
 *   **none  ⟺  spawned ≠ ∅  ∧  every spawned seat has a departure record**
 *
 * The non-emptiness conjunct is not decoration — it is the whole safety
 * property. `∀ s ∈ ∅` is vacuously TRUE, so without it a fresh session (no
 * open record ⇒ no spawned set) satisfies the rule and authorises the very kill
 * this exists to prevent. That defect was caught in review before it was built.
 *
 * And `none` stays REACHABLE — by the normal clean ending rather than by an
 * empty directory — which is what stops the guard degrading into "always block",
 * the state that trains people to pass `--force` reflexively and thereby removes
 * the guard for real. Both failure directions are real and an answer that avoids
 * only one is not an answer.
 */
export interface CommsPresenceReport {
  presence: SeatPresence;
  /**
   * TOTAL — present on every branch, per seams.md Contract 5(a), so `0` reads as
   * an observation rather than as an unpopulated field.
   *
   * **`null` and `0` are different facts and must never be fused.** `null` = no
   * session-open record EXISTS; `0` = a record exists and names no seats. That is
   * Contract 6(c)'s *`null` is not a rounded-down zero*, one layer out.
   *
   * **What this field does and does NOT protect — the distinction cost a peer a
   * vacuous test, so it is stated precisely rather than reassuringly.**
   *
   * It reports the ARGUMENT, computed once before any branch is chosen. So it
   * distinguishes the two INPUTS (`null` vs `0`) and **survives a fusion of the
   * two branches unchanged** — fuse `no-open-record` into `empty-open-record`
   * and this still reads `[null, 0]` exactly as before. **It therefore cannot
   * detect the collapse it looks like it guards.**
   *
   * **`because` is what makes the split observable**, because it is stamped by
   * the branch that fired. Assert the pair there, not here. Measured: a mutation
   * fusing the branches fails the `because` pair and **no** count assertion.
   */
  spawnedCount: number | null;
  /** TOTAL — seats with a positively-observed departure record. */
  departedCount: number;
  /**
   * TOTAL — WHICH BRANCH decided this verdict, stamped by that branch.
   *
   * **This exists because the verdict alone cannot discriminate the branches.**
   * `no-open-record` and `empty-open-record` both resolve to `unknown` by
   * design, so no assertion over `state` — and none over a count DERIVED FROM
   * THE INPUT — can tell them apart. Measured: a count computed once from the
   * argument reports `[null, 0]` both before and after the two branches are
   * fused, so it passes against the exact mutation it was proposed to catch.
   * Only a value stamped BY the branch that fired distinguishes them.
   *
   * Deliberately an enum and NOT the `reason` prose: a reason string is
   * ungated and rename-fragile, so keying a test on it breaks the day someone
   * improves the wording. This is the same choice as `staleRecord` in Contract
   * 6(c-bis) — carry the diagnostic as a total field rather than growing the
   * state set, so no consumer switching on `state` meets a case it has no
   * policy for.
   */
  because:
    | "live-follower"
    | "unexplained-follower"
    | "no-open-record"
    | "empty-open-record"
    | "outstanding-departures"
    | "all-spawned-departed";
}

export function commsPresence(
  rows: {
    handle: string;
    hasRecord: boolean;
    followerAlive: boolean | null;
    /** TOTAL — a departure record was positively observed for this seat. */
    departed: boolean;
  }[],
  /** `null` = no session-open record exists. `[]` = one exists naming nobody. */
  spawned: string[] | null,
): CommsPresenceReport {
  const spawnedCount = spawned === null ? null : spawned.length;
  const departedCount = rows.filter((r) => r.departed).length;
  const report = (
    presence: SeatPresence,
    because: CommsPresenceReport["because"],
  ): CommsPresenceReport => ({ presence, spawnedCount, departedCount, because });

  // D1 — `&& !r.departed` is the whole repair, and it is a QUALIFIER rather than
  // a hoist, ruled at Contract 6(g) after two rival constructions were diffed
  // over the reachable cell space.
  //
  // **The circularity it closes:** a stood-down seat read `present` while its
  // `comms follow` was alive — and `down` is what kills the follow. Stand down →
  // still `present` → `down` refuses → the follow never dies → still `present`.
  // `none` was unreachable through the exact lifecycle the feature exists for.
  //
  // **Why not the hoist.** Hoisting the departure test above this branch makes a
  // departed-but-live seat report `present`, `because: live-follower` — i.e. the
  // report NAMES a seat that filed a departure record as being here. Both fail
  // closed, so this is not a safety choice; it is what the tool is entitled to
  // CLAIM (6(a)). A `{departed, spawned: []}` row is an INCOHERENT record — a
  // seat cannot depart a session it was never spawned into — and 6(c-bis)
  // already ruled that class routes to the state meaning *the tool has no idea*.
  // The hoist would also be the noun-mismatch a fourth time: it observes a FOLLOW
  // PROCESS and claims a SEAT is present, against that seat's own record.
  const live = rows.filter((r) => r.followerAlive === true && !r.departed).map((r) => r.handle);
  if (live.length > 0)
    return report({ state: "present", seats: [...new Set(live)].sort() }, "live-follower");

  // An UNEXPLAINED non-live follower. `&& !r.departed` is the qualifier that
  // makes `none` reachable at all: this branch exists to demand an EXPLANATION
  // for a follower that is not confirmed alive, and a departure record IS that
  // explanation — the seat said it left, so its dead follower is expected rather
  // than mysterious. Without the qualifier this fired before departure was ever
  // consulted, so any session in which anyone spoke ended in `unknown` and every
  // teardown needed `--force`. A CRASHED seat (record, dead pid, no departure)
  // is still unexplained and still blocks, which is the case this protects.
  //
  // Keyed on `hasRecord`, NOT on a lag state (6(f)): a dead pid means
  // `emittedThrough` is a high-water mark, not that the seat is gone. `down`
  // kills PANES; `followerAlive` observes FOLLOW PROCESSES; a follow process is
  // not a pane.
  const dead = rows.filter((r) => r.hasRecord && r.followerAlive === false && !r.departed);
  const unchecked = rows.filter((r) => r.hasRecord && r.followerAlive === null && !r.departed);
  if (dead.length + unchecked.length > 0) {
    const why = [
      dead.length > 0 &&
        `${dead.length} follower process(es) not running with no departure record — the SEAT may still be working (6(f): a dead pid means the position is a high-water mark, not that the seat is gone)`,
      unchecked.length > 0 &&
        `${unchecked.length} comms follower(s) could not be checked (liveness unknown, not dead)`,
    ].filter((s): s is string => typeof s === "string");
    return report({ state: "unknown", reason: why.join(" · ") }, "unexplained-follower");
  }

  // No session-open record: we cannot know who SHOULD be here, so we cannot
  // establish that everyone left. Distinct from the empty-record case below —
  // same verdict, different knowledge, and the counts carry the difference.
  if (spawned === null) {
    return report(
      {
        state: "unknown",
        reason:
          "no session-open record — cannot establish which seats were spawned, so departure cannot be confirmed",
      },
      "no-open-record",
    );
  }
  if (spawned.length === 0) {
    return report(
      {
        state: "unknown",
        reason: "session-open record names no seats — no departure can be confirmed against it",
      },
      "empty-open-record",
    );
  }

  const departed = new Set(rows.filter((r) => r.departed).map((r) => r.handle));
  const outstanding = spawned.filter((h) => !departed.has(h));
  if (outstanding.length === 0) return report({ state: "none" }, "all-spawned-departed");

  return report(
    {
      state: "unknown",
      reason: `${outstanding.length} spawned seat(s) have not departed (${outstanding.sort().join(", ")})`,
    },
    "outstanding-departures",
  );
}

/*
 * `combinePresence` lived here — a fail-closed lattice over TWO wires, whose one
 * rule was "`none` requires a positive observation of absence on EVERY wire
 * consulted."
 *
 * It is gone because there is one wire. The rule it enforced did not go with it:
 * it now lives where it always actually held, in `commsPresence`'s requirement
 * that `none` means `spawned ≠ ∅ ∧ every spawned seat has a departure record`.
 * A lattice over a single input is the identity function, and keeping one would
 * imply a second wire exists to be combined with.
 *
 * ⚠ Restore it — do not re-derive it — if anthill ever grows a second presence
 * source. The subtle part was never the union; it was that `unknown` outranks
 * `none`, and that ordering is the reason a broken wire cannot authorise a
 * teardown. See `seatPresence` for the case analysis that justified removal.
 */

/**
 * Advisory pid liveness — `process.kill(pid, 0)`. ESRCH means gone; **EPERM
 * means it EXISTS** but we may not signal it, so that branch is alive rather
 * than unknown. Anything else we decline to guess about.
 */
function pidAlive(pid: number): boolean | null {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    return code === "ESRCH" ? false : code === "EPERM" ? true : null;
  }
}

/** Read the comms wire's view of who is here. Any failure is `unknown`, never absence. */
function commsPresenceFor(config: ResolvedConfig, channel: string): SeatPresence {
  try {
    const teamDir = config.teamDirPath();
    // `null` (no record) and `[]` (a record naming nobody) are different facts
    // and are carried through as such — see `CommsPresenceReport.because`.
    const session = readSessionOpen(teamDir, channel);
    // Deliberately NOT via `buildPositionsReport`: that report is about LAG, and
    // borrowing it meant inventing a `head` to satisfy a parameter presence does
    // not care about. The invented value then changed the lag classification and
    // broke this guard. Presence reads the two things it actually needs.
    // D3 — departures are scoped to THIS session's origin. `null` when there is
    // no open record or it predates the field, and `hasDeparted` treats that as
    // "cannot scope ⇒ nobody departed", which blocks rather than authorises.
    const openedAt = session?.openedAt ?? null;
    return commsPresence(
      config.seats.map((s) => {
        const position = readPosition(teamDir, channel, s.handle);
        return {
          handle: s.handle,
          // ⚠ INVARIANT, asserted in team-support.test.ts rather than trusted:
          // these two fields derive from ONE `position` lookup, so
          // `hasRecord: false` FORCES `followerAlive: null`. The D1 branch above
          // does NOT test `hasRecord`, so its correctness for a seat that has
          // never followed is inherited from this coupling and from nowhere
          // else. A second caller constructing rows by hand would break the
          // guard's safety argument with nothing to catch it.
          hasRecord: position !== null,
          followerAlive: position ? pidAlive(position.pid) : null,
          departed: hasDeparted(teamDir, channel, s.handle, openedAt),
        };
      }),
      session === null ? null : session.spawned,
    ).presence;
  } catch (err) {
    return { state: "unknown", reason: `comms positions unreadable: ${(err as Error).message}` };
  }
}

/**
 * Seat presence. **Comms is the sole wire, so this IS `commsPresenceFor`** — the
 * grapevine leg is gone, per the human's Q4 ruling that grapevine leaves
 * anthill's model entirely (`docs/projects/comms-as-default/proposal.md`).
 *
 * The previous contract was "any failure returns `[]` so a broken vine can never
 * wedge a teardown." That traded a wedged teardown for a silent one: the only
 * consumer is `down`'s guard, which read `[]` as "the team has stood down" and
 * killed the panes. `--force` is where "tear down anyway" belongs — a human
 * saying so, not a guard guessing on our behalf. **That contract survives the
 * removal intact**; it just has one wire to uphold it on instead of two.
 *
 * ## What removing the vine leg actually changed, by case analysis
 *
 * The verdict was `combinePresence(vine, comms)`: present wins, else any
 * `unknown` survives, else `none`. Enumerating both legs, **the vine could
 * change the answer in exactly one cell**:
 *
 * | vine      | comms     | was       | now       |
 * | --------- | --------- | --------- | --------- |
 * | `none`    | any       | = comms   | = comms   |
 * | `unknown` | `present` | present   | present   |
 * | `unknown` | `unknown` | unknown   | unknown   |
 * | `unknown` | **`none`**| **unknown** (blocks teardown) | **`none`** (permits it) |
 *
 * `present` was unreachable for the vine — nothing joins that channel any more —
 * so the leg was inert everywhere except when grapevine was **unresolvable**.
 *
 * **And that one cell was a bug, not a safety margin.** `resolveCoordCli` throws
 * when spellbook's grapevine is absent, which is the ordinary state of a
 * consuming project that installed anthill after the swap. For them the verdict
 * could never be `none`, so **`down` blocked every clean teardown and demanded
 * `--force`** — the "degrades into always-block" failure this file's own comments
 * name as the thing that "trains people to pass `--force` reflexively and thereby
 * removes the guard for real."
 *
 * **The safety argument does not rest on the vine.** It rests on `none` requiring
 * a POSITIVE observation of departure (`spawned ≠ ∅ ∧ every spawned seat has a
 * departure record`), which is a comms property and is unchanged here.
 *
 * ⚠ `humans` is gone with the leg. It was read from grapevine's `who` payload and
 * was anthill's ONLY source of it. Ruled 2026-08-08: anthill does not give agents
 * visibility into the human — **the arrow points the other way.** The capability
 * was nominal and pointed the wrong direction, so removing it costs nothing.
 */
export function seatPresence(channel: string, config?: ResolvedConfig): SeatPresence {
  // No config means the comms wire cannot be reached AT ALL, and saying so is
  // the point. There is no second wire to fall back to any more, so the honest
  // answer is `unknown` — never an absence we did not observe.
  if (!config) {
    return { state: "unknown", reason: "comms wire not consulted — no config" };
  }
  return commsPresenceFor(config, channel);
}

import { fileURLToPath } from "node:url";
import { emit, resolveFormat } from "../agent-layer.ts";
import { buildCommsIncantation } from "../comms.ts";
import { execCoord, firstErrorLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { type BoardCounts, readBoardCounts, requireConfig } from "./team-support.ts";

interface ConveneData {
  channel: string;
  boardOpened: boolean;
  board: BoardCounts | null;
  leadDoc: string;
  /**
   * The LEAD's own comms wire, fully resolved (Contract 4(a)/(b)): the consumer
   * renders it verbatim and never interpolates a handle.
   *
   * `null` ONLY when no lead is resolvable from config — never as a stand-in for
   * "this team has no comms", which is not a state that exists. A convene that
   * silently omitted this is why a lead ran a whole session unwired: `join`
   * emitted an incantation correctly the entire time and convene never called
   * it, so the capability was present and unreachable from the one command the
   * lead actually runs.
   */
  commsIncantation: string | null;
  /**
   * The LEAD's own departure command, fully resolved — the release for the
   * blocker this very command creates.
   *
   * `convene` hands the lead a live `comms follow`, and `commsPresenceFor`
   * builds its rows from `config.seats` (which contains the lead) while the
   * departure check ranges over the seats this session SPAWNED (which does
   * not). The live-follower branch is consulted first, so the lead's own
   * follower refuses his `anthill down` — by name, after every seat has
   * correctly stood down. That is the DEFAULT ending, not an edge case.
   *
   * `join` has emitted every seat its stand-down since the guard shipped; the
   * lead was the one seat whose blocker was created by the ritual and whose
   * release appeared in no emitted output. The prose said a clean session tore
   * down with no override, which is why the gap survived: nothing emitted
   * contradicted it.
   *
   * `null` on the same condition as `commsIncantation` and for the same reason
   * — no resolvable lead means no handle to bind, never "this team does not
   * stand down". Emitted as a SIBLING of the follow wire deliberately: a lead
   * who is given the thing that blocks teardown is given its release in the
   * same breath.
   */
  leadStandDown: string | null;
  warnings?: string[];
}

/**
 * PURE: the `bounty open` argv that binds the team board to `channel`. Keyed
 * (`--session-key`) so the board id is `(channel, repo-root)`-scoped; `--pin`
 * writes `.bounty-session` at the repo root (the ambient floor the lead /
 * hand-started panes / dispatched subagents resolve by walk-up); `--no-open`
 * keeps convene headless-safe (no browser auto-launch — the human opens the URL
 * when ready). Keyed open is idempotent: re-convening re-attaches, never hijacks.
 * See seams.md — the board-binding contract (owner: forager).
 */
export function bountyOpenArgs(channel: string, restoreId?: string | null): string[] {
  const args = ["open", "--session-key", channel, "--pin", "--no-open"];
  // `--restore` is passed UNCONDITIONALLY when we know the id, and that is safe
  // in both directions — measured, not reasoned:
  //
  //   dead board  → respawns WITH the snapshot instead of empty.
  //   live board  → `open` attaches and reports
  //                 `restoreSkipped: {requested:["restore"], reason:"a live board
  //                 already exists for this key … the running board was left
  //                 unchanged"}`, with the live cards verified intact.
  //
  // So there is no "should we restore?" decision to get wrong, which is the only
  // reason this can be a default rather than a flag. A conditional restore would
  // have to answer that question from outside, and `boardShadowWarning`'s own
  // docs explain at length why we cannot.
  if (restoreId) args.push("--restore", restoreId);
  return args;
}

export interface BountySessionRow {
  key: string;
  tasks: number;
}

/**
 * PURE: parse `bounty sessions` stdout into (key, task-count) rows.
 *
 * Lines look like: `k-anthill-dev-adad92ec  7 tasks  — anthill-dev · slice 2`.
 * Unparseable lines are skipped rather than throwing — this feeds a WARNING
 * path, and a spellbook output-format change must never break convene itself.
 */
export function parseBountySessions(stdout: string): BountySessionRow[] {
  const rows: BountySessionRow[] = [];
  for (const line of stdout.split("\n")) {
    const m = line.trim().match(/^(\S+)\s+(\d+)\s+tasks?\b/);
    if (m?.[1] && m[2] !== undefined) rows.push({ key: m[1], tasks: Number(m[2]) });
  }
  return rows;
}

/**
 * PURE: how many tasks the KEYED SNAPSHOT for `channel` holds, or null if there
 * is no snapshot for it. Keys are `k-<channel>-<hex>`; the hex suffix scopes the
 * key to the repo root, and contains no dashes, which is what lets us match a
 * channel name that itself contains dashes.
 */
export function snapshotRowFor(rows: BountySessionRow[], channel: string): BountySessionRow | null {
  const re = new RegExp(`^k-${channel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[0-9a-f]+$`);
  return rows.find((r) => re.test(r.key)) ?? null;
}

/**
 * The row's `key` IS the session id `--restore` takes, which is the whole reason
 * this split exists. `snapshotTaskCount` had the id in hand and discarded it one
 * line before returning, while `boardShadowWarning` above declared restoring
 * impossible from here — _"that is spellbook's side of the seam"_. **It was not
 * impossible; the id was already computed by the regex that found the count.**
 */
export function snapshotTaskCount(rows: BountySessionRow[], channel: string): number | null {
  return snapshotRowFor(rows, channel)?.tasks ?? null;
}

/**
 * PURE: should convene warn that re-opening may have shadowed a live board?
 *
 * anthill#43 — the data-loss bug. When the bounty daemon has died, a keyed
 * re-open respawns an EMPTY board under the same key, and any later close of
 * that empty board OVERWRITES the key's non-empty snapshot. One team lost a
 * 9-task board mid-session and recovered only because every card change happened
 * to have been narrated on the vine — i.e. recovery was luck, not a guarantee.
 *
 * ⚠ **"We cannot restore the snapshot from here (that is spellbook's side of the
 * seam)" — FALSIFIED 2026-08-09, and it had been false the whole time.**
 * `open --session-key K --restore <id>` restores a respawned board, and `<id>` is
 * the `key` field of the very row `snapshotTaskCount` reads the count from. The
 * seam was never in the way; the id was one field away from the code that said
 * it was out of reach. `convene` now passes it, so the empty respawn this
 * function warns about should no longer HAPPEN.
 *
 * **So this warning changed job without changing code: it was an alarm, and it is
 * now a VERIFICATION.** If it still fires after a restoring open, that is a real
 * anomaly — the restore did not take — rather than the expected bad day it used
 * to describe. Kept for exactly that reason, and because it is the only thing
 * that would notice.
 */
/**
 * ⚠ KNOWN LIMITATION, and it is the reason this function should eventually be
 * DELETED rather than improved.
 *
 * This reconstructs, from two reads and a subtraction, a fact `bounty open` knows
 * at the instant it happens and does not state. That distance costs two things:
 *
 * **1. A reconstructed warning is one a caller argues with; a first-party one is
 * not.** Session 12's lead nearly dismissed a CORRECT firing of this warning,
 * because `.bounty-session` pointed at the session holding all 97 tasks and that
 * looked like proof the warning was spurious. He checked anyway and it was real.
 *
 * **2. IT CANNOT DISTINGUISH THE TWO WORLDS IT FIRES IN, AND THEY NEED OPPOSITE
 * ACTIONS.** A live board smaller than its snapshot means either:
 *   - **recoverable** — a dead daemon was respawned empty over an intact snapshot
 *     (spellbook#64). The cards are on disk. Do NOT close the board; restore.
 *   - **unrecoverable** — `close` already clobbered the snapshot with in-memory
 *     state (spellbook#73). Nothing is on disk. Stop.
 *
 * From outside, both are "snapshot > live". **`open` knows which; we cannot.**
 * Session 12's incident is the recoverable case: snapshot 97, live 0, snapshot
 * intact, all 97 recovered — which is also what confirmed to spellbook that the
 * two are separate bugs failing in opposite directions rather than one bug.
 *
 * → **If spellbook's D1.3 lands (hydrate-by-default announcing which world you are
 * in), DELETE this rather than maintain it.** Carried as `S13-N`. And if it turns
 * out it CANNOT be deleted, that is the signal their envelope did not say enough —
 * report it rather than quietly keeping this.
 */
export function boardShadowWarning(
  snapshotTasks: number | null,
  live: BoardCounts | null,
): string | undefined {
  if (snapshotTasks === null || snapshotTasks <= 0) return undefined;
  const liveTotal = live ? live.todo + live.doing + live.review + live.done : 0;
  if (liveTotal >= snapshotTasks) return undefined;
  return (
    `POSSIBLE BOARD LOSS: the saved snapshot for this channel holds ${snapshotTasks} task(s), ` +
    `but the live board shows ${liveTotal}. If the bounty daemon died, this re-open may have ` +
    "started an EMPTY board over your real one — and CLOSING it would overwrite the saved " +
    "snapshot for good. Do NOT close the board. Check `bounty sessions`, recover the snapshot, " +
    "and only then continue (anthill#43)."
  );
}

// `anthill convene` — ensure the team infra is up: report the bounty board state
// and emit the lead's own comms wire. Channel + lead come from config. Does NOT
// do human Q&A — that's the skill's job.
//
// ⚠ CORRECTED (2026-08-06): this said bounty's `open` is NOT idempotent and
// "always spawns a fresh daemon", so convene only REPORTS board state. **That has
// been stale since spellbook #69 made KEYED open idempotent** — and convene has
// opened the board itself since board-session-binding landed, which the code
// below does. The comment was describing a world two features ago.
//
// Flagged by the spellbook maintainer on spellbook#80, who noted the stale
// assumption is plausibly part of why the `--restore` attach path surprised us:
// if you believe `open` always spawns fresh, an idempotent ATTACH is not a branch
// you are looking for.
//
// What is true now: `open --session-key <key>` **attaches** to a live board for
// that key and respawns a dead one. Convene relies on exactly that idempotence —
// re-convening re-attaches rather than spawning a stranger.
//
// STEP 4 (phase 3): convene OPENS NOTHING on the discussion wire. It used to
// invoke `grapevine open` (and `grapevine topic`), which is what made
// "absence of OPENING" false for every session that ran it — including the one
// that deleted it. `comms` is an append-only log with no open/attach step, so
// there is nothing to replace the call WITH; the capability is gone, not moved.
//
// `--fresh` and `--topic` went with it, and that is a DELETION rather than a
// migration: `--fresh` forwarded a flag to `grapevine open` and reported
// grapevine's answer back, so its only referent was the log this step removes.
// Measured before it was cut (S11-8): `convene --fresh` cleared a FOUR-line vine
// log while the comms log's 559 messages were untouched. It never reached the
// wire we use, so nothing that worked stopped working. Starting a clean session
// log is session ROTATION's job (a different card) and was never this flag's.
// `--topic` has no successor: comms has no topic concept, and building one to
// preserve a flag would be a want, not a migration.
export const teamConveneCommand = defineAnthillCommand({
  meta: {
    name: "convene",
    description: "Report the team board state and emit the lead's comms wire",
    scope: "workspace",
  },
  args: {
    channel: {
      type: "string",
      description: "Team channel (default: config.channel)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "convene");
    const channel = (ctx.args.channel as string | undefined) || config.channel;
    const warnings: string[] = [];

    // Own the board-open: keyed + pinned so every seat verb binds THIS team's
    // board ambiently (via `.bounty-session` / `$BOUNTY_SESSION_KEY`), never a
    // stranger's `latest`. Must run BEFORE readBoardCounts so the pinned board is
    // what `bounty state` resolves. Keyed open is idempotent (re-attaches).
    let boardOpened = false;
    // Snapshot the KEY's task count BEFORE opening — after the open, a shadowing
    // empty board is indistinguishable from a genuinely empty one. See
    // `boardShadowWarning` (anthill#43).
    let snapshotTasks: number | null = null;
    // The snapshot's own key, which is the id `--restore` takes. Read from the
    // SAME row as the count, so the thing we restore and the thing we compare
    // against can never be two different boards.
    let restoreId: string | null = null;
    try {
      const bountyCli = resolveCoordCli("bounty");
      const sessions = await execCoord(bountyCli, ["sessions"]);
      if (sessions.ok) {
        const row = snapshotRowFor(parseBountySessions(sessions.stdout), channel);
        snapshotTasks = row?.tasks ?? null;
        restoreId = row?.key ?? null;
      }
      const openBoard = await execCoord(bountyCli, bountyOpenArgs(channel, restoreId));
      if (openBoard.ok) {
        boardOpened = true;
      } else {
        warnings.push(`bounty open failed: ${firstErrorLine(openBoard.stderr, "unknown error")}`);
      }
    } catch (err) {
      warnings.push(`bounty CLI unresolved: ${(err as Error).message}`);
    }

    const { board, warning: boardWarning } = await readBoardCounts();
    if (boardWarning) warnings.push(boardWarning);

    const shadowWarning = boardShadowWarning(snapshotTasks, board);
    if (shadowWarning) warnings.push(shadowWarning);

    const leadDoc = config.lead
      ? config.seatDocPath(config.lead)
      : `${config.paths.seatDir}/<lead>.md`;

    // The lead is a seat like any other and needs its own wire. Built from the
    // SAME helper `join` uses, so there is one composer and no second copy to
    // drift (Contract 4(d): pay the seam in emitted values, not in words).
    const commsIncantation = config.lead
      ? buildCommsIncantation({
          cliPath: fileURLToPath(new URL("../cli.ts", import.meta.url)),
          channel,
          handle: config.lead,
        })
      : null;
    // Composed from the same cliPath as the wire above, so the release and the
    // blocker cannot resolve to different binaries (Contract 7(d): a
    // load-bearing emitted command resolves to the EMITTING cli, never PATH).
    const leadStandDown = config.lead
      ? `bun ${fileURLToPath(new URL("../cli.ts", import.meta.url))} comms stand-down --as ${config.lead}`
      : null;
    if (!config.lead) {
      warnings.push(
        "no lead resolvable from config, so no comms incantation was emitted — the lead will be UNWIRED unless it runs `anthill join <handle>` itself",
      );
    }

    const data: ConveneData = {
      channel,
      boardOpened,
      board,
      leadDoc,
      commsIncantation,
      leadStandDown,
      ...(warnings.length > 0 && { warnings }),
    };

    emit({
      format,
      command: "convene",
      data,
      startedAt: started,
      renderText: (d) => {
        // No "up"/"NOT opened" verdict: there is nothing to open. Reporting a
        // liveness state for an append-only log would be a status claim the
        // command never observed — the shape of defect `--fresh` was cut for.
        const lines: string[] = [`Team channel: "${d.channel}" (comms)`];
        if (d.board) {
          lines.push(
            `Board "${d.channel}" (key-bound): todo ${d.board.todo} · doing ${d.board.doing} · review ${d.board.review} · done ${d.board.done}`,
          );
        } else {
          lines.push(
            `Board: ${d.boardOpened ? "opened (key-bound) but not readable" : "NOT opened"}`,
          );
        }
        lines.push(`Lead: read ${d.leadDoc} to take the lead seat.`);
        if (d.commsIncantation) {
          lines.push(
            `Monitor the team comms — wrap with Monitor, verbatim, NO filter (comms follow emits no keepalives, so there is nothing to strip; adding a grep here can only lose messages): ${d.commsIncantation}`,
          );
        }
        if (d.leadStandDown) {
          lines.push(
            `Your LAST act, and run it BEFORE \`anthill down\` — the teardown guard counts you as a seat, so your own follow above is what refuses it, by name, after every seat has correctly stood down: ${d.leadStandDown}`,
          );
        }
        if (d.warnings?.length) {
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });
  },
});

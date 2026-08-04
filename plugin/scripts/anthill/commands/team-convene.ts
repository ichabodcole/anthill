import { fileURLToPath } from "node:url";
import { emit, resolveFormat } from "../agent-layer.ts";
import { buildCommsIncantation } from "../comms.ts";
import { execCoord, firstErrorLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { type BoardCounts, readBoardCounts, requireConfig } from "./team-support.ts";

interface ConveneData {
  channel: string;
  channelOpened: boolean;
  boardOpened: boolean;
  /**
   * NARROWED, deliberately: this is now `true` ONLY when a clear actually
   * happened. It used to be "the flag was forwarded", so an existing
   * `if (d.fresh)` reader becomes MORE correct rather than less — it now means
   * what every consumer already believed it meant. That is the only safe
   * direction to move a boolean whose readers you cannot all see.
   */
  fresh: boolean;
  /** The full outcome, because `fresh: false` alone cannot distinguish
   * "not requested" from "requested and suppressed" from "could not tell". */
  freshOutcome: FreshOutcome;
  /** Archive path written before a clear — evidence, non-null only when cleared. */
  freshSnapshot: string | null;
  topicSet: boolean;
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
export function bountyOpenArgs(channel: string): string[] {
  return ["open", "--session-key", channel, "--pin", "--no-open"];
}

/**
 * What `--fresh` ACTUALLY did — never what was requested.
 *
 * `fresh: true` used to mean "I forwarded the flag to grapevine", and a lead
 * read it as "the log was cleared" and told the team so on the vine. It was
 * false: he had wired his own tail first, `--fresh` is a documented no-op while
 * subscribers are connected, and **his own tail was the subscriber that
 * suppressed his own clear**. A joining seat had to date messages by hand to
 * separate two sessions.
 *
 * The honest answer was in grapevine's response the whole time (`cleared`,
 * `snapshot`) and convene discarded it to report the flag back. So this is not
 * new information — it is the existing information stopped being thrown away.
 *
 * `unknown` is a real state and must never collapse into `false`: "grapevine
 * did not clear" and "we could not tell whether grapevine cleared" are
 * different, and reporting the optimistic value for an unobserved thing is the
 * `gap: null`-vs-`0` rule (seams.md Contract 6(c)) on a second surface.
 */
export type FreshOutcome = "not-requested" | "cleared" | "skipped-subscribers-present" | "unknown";

export interface FreshResult {
  outcome: FreshOutcome;
  /** The archive path grapevine wrote before clearing — the EVIDENCE, and the
   * thing the backlog report checked by hand to prove no clear had occurred.
   * Non-null only on `cleared`. */
  snapshot: string | null;
}

/**
 * PURE: read what `grapevine open [--fresh]` reports back about the clear.
 *
 * Measured on a scratch channel, one variable held (a subscriber attached or
 * not) — grapevine answers `{"ok":true,"channel":{…,"cleared":bool,"snapshot":
 * string|null,…}}`, with `cleared:true` + a snapshot path when it clears and
 * `cleared:false` + `snapshot:null` when a subscriber suppresses it.
 *
 * Anything we cannot read — unparseable stdout, a missing field, a failed open,
 * a spellbook output-format change — is `unknown`, NOT `false`. Degrading to
 * "did not clear" would be a fresh instance of the bug this function exists to
 * fix: an instrument answering a coarser question than the one asked, and
 * looking right doing it.
 */
export function interpretFresh(requested: boolean, ok: boolean, stdout: string): FreshResult {
  if (!requested) return { outcome: "not-requested", snapshot: null };
  if (!ok) return { outcome: "unknown", snapshot: null };
  let cleared: unknown;
  let snapshot: unknown;
  try {
    const parsed = JSON.parse(stdout.trim()) as { channel?: Record<string, unknown> };
    cleared = parsed?.channel?.cleared;
    snapshot = parsed?.channel?.snapshot;
  } catch {
    return { outcome: "unknown", snapshot: null };
  }
  if (cleared === true) {
    return { outcome: "cleared", snapshot: typeof snapshot === "string" ? snapshot : null };
  }
  if (cleared === false) return { outcome: "skipped-subscribers-present", snapshot: null };
  return { outcome: "unknown", snapshot: null };
}

/**
 * PURE: the human-facing phrase for a fresh outcome, and the WARNING when the
 * clear a lead asked for did not happen.
 *
 * A warning rather than a quiet field, because the failure is a lead acting on
 * the value: he read `fresh: true`, told the team "what you see here IS this
 * session", and it wasn't. The field being honest is necessary and was not
 * sufficient — nobody re-reads a setup command's envelope, which is why
 * `principles.md` names setup commands as the worst place for a coarse
 * instrument.
 */
export function freshNotice(r: FreshResult): { phrase: string; warning: string | null } {
  switch (r.outcome) {
    case "not-requested":
      return { phrase: "", warning: null };
    case "cleared":
      return {
        phrase: ` (fresh — prior log CLEARED, snapshot: ${r.snapshot ?? "unreported"})`,
        warning: null,
      };
    case "skipped-subscribers-present":
      return {
        phrase: " (fresh — NOT cleared: subscribers connected)",
        warning:
          "`--fresh` did NOT clear the log: grapevine skips the clear while subscribers are connected, and your own tail counts as one. The channel still holds the PREVIOUS session's messages — do not tell the team that what they see is this session. Re-run with no tails attached, or anchor catch-up to an id instead.",
      };
    case "unknown":
      return {
        phrase: " (fresh — OUTCOME UNKNOWN)",
        warning:
          "`--fresh` was requested but grapevine's answer could not be read, so whether the log was cleared is UNKNOWN — not 'no'. Check `grapevine pull` before making any claim about what the channel contains.",
      };
  }
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
export function snapshotTaskCount(rows: BountySessionRow[], channel: string): number | null {
  const re = new RegExp(`^k-${channel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[0-9a-f]+$`);
  const hit = rows.find((r) => re.test(r.key));
  return hit ? hit.tasks : null;
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
 * We cannot restore the snapshot from here (that is spellbook's side of the
 * seam), but we CAN refuse to let it happen silently: if the key's snapshot held
 * more tasks than the board we now see, say so before any work — and before a
 * close destroys it.
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

// `anthill convene` — ensure the team infra is up: open the grapevine channel
// (idempotent), optionally set the topic, and report the bounty board state.
// Channel + lead come from config. Does NOT do human Q&A — that's the skill's job.
//
// Note: bounty's `open` is NOT idempotent (always spawns a fresh daemon), so
// convene only REPORTS the board state rather than force-opening one.
export const teamConveneCommand = defineAnthillCommand({
  meta: {
    name: "convene",
    description: "Ensure the team channel + board are up (idempotent grapevine open)",
    scope: "workspace",
  },
  args: {
    channel: {
      type: "string",
      description: "Grapevine channel (default: config.channel)",
      valueHint: "name",
    },
    topic: { type: "string", description: "Channel topic to set", valueHint: "text" },
    fresh: {
      type: "boolean",
      description:
        "Snapshot + clear a dormant channel's prior-session log before opening (safe no-op if seats are connected)",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "convene");
    const channel = (ctx.args.channel as string | undefined) || config.channel;
    const topic = ctx.args.topic as string | undefined;
    const fresh = ctx.args.fresh === true;
    const warnings: string[] = [];

    let channelOpened = false;
    let topicSet = false;
    // `unknown` until grapevine answers — so a throw on the path below (an
    // unresolved CLI) leaves an honest "could not tell", never a confident false.
    let freshResult: FreshResult = fresh
      ? { outcome: "unknown", snapshot: null }
      : { outcome: "not-requested", snapshot: null };
    try {
      const grapevineCli = resolveCoordCli("grapevine");
      const open = await execCoord(grapevineCli, ["open", channel, ...(fresh ? ["--fresh"] : [])]);
      freshResult = interpretFresh(fresh, open.ok, open.stdout);
      if (open.ok) {
        channelOpened = true;
      } else {
        warnings.push(`grapevine open failed: ${firstErrorLine(open.stderr, "unknown error")}`);
      }
      if (topic !== undefined) {
        const setTopic = await execCoord(grapevineCli, ["topic", channel, topic]);
        if (setTopic.ok) {
          topicSet = true;
        } else {
          warnings.push(
            `grapevine topic failed: ${firstErrorLine(setTopic.stderr, "unknown error")}`,
          );
        }
      }
    } catch (err) {
      warnings.push(`grapevine CLI unresolved: ${(err as Error).message}`);
    }

    // Own the board-open: keyed + pinned so every seat verb binds THIS team's
    // board ambiently (via `.bounty-session` / `$BOUNTY_SESSION_KEY`), never a
    // stranger's `latest`. Must run BEFORE readBoardCounts so the pinned board is
    // what `bounty state` resolves. Keyed open is idempotent (re-attaches).
    let boardOpened = false;
    // Snapshot the KEY's task count BEFORE opening — after the open, a shadowing
    // empty board is indistinguishable from a genuinely empty one. See
    // `boardShadowWarning` (anthill#43).
    let snapshotTasks: number | null = null;
    try {
      const bountyCli = resolveCoordCli("bounty");
      const sessions = await execCoord(bountyCli, ["sessions"]);
      if (sessions.ok) {
        snapshotTasks = snapshotTaskCount(parseBountySessions(sessions.stdout), channel);
      }
      const openBoard = await execCoord(bountyCli, bountyOpenArgs(channel));
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
    const freshWarning = freshNotice(freshResult).warning;
    if (freshWarning !== null) warnings.push(freshWarning);

    if (!config.lead) {
      warnings.push(
        "no lead resolvable from config, so no comms incantation was emitted — the lead will be UNWIRED unless it runs `anthill join <handle>` itself",
      );
    }

    const data: ConveneData = {
      channel,
      channelOpened,
      boardOpened,
      fresh: freshResult.outcome === "cleared",
      freshOutcome: freshResult.outcome,
      freshSnapshot: freshResult.snapshot,
      topicSet,
      board,
      leadDoc,
      commsIncantation,
      ...(warnings.length > 0 && { warnings }),
    };

    emit({
      format,
      command: "convene",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines: string[] = [
          `Channel "${d.channel}": ${d.channelOpened ? "up" : "NOT opened"}${freshNotice({ outcome: d.freshOutcome, snapshot: d.freshSnapshot }).phrase}${d.topicSet ? " (topic set)" : ""}`,
        ];
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
        if (d.warnings?.length) {
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });
  },
});

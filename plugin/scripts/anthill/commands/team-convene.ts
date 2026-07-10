import { emit, resolveFormat } from "../agent-layer.ts";
import { execCoord, firstErrorLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { type BoardCounts, readBoardCounts, requireConfig } from "./team-support.ts";

interface ConveneData {
  channel: string;
  channelOpened: boolean;
  boardOpened: boolean;
  fresh: boolean;
  topicSet: boolean;
  board: BoardCounts | null;
  leadDoc: string;
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
    try {
      const grapevineCli = resolveCoordCli("grapevine");
      const open = await execCoord(grapevineCli, ["open", channel, ...(fresh ? ["--fresh"] : [])]);
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
    try {
      const bountyCli = resolveCoordCli("bounty");
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

    const leadDoc = config.lead
      ? config.seatDocPath(config.lead)
      : `${config.paths.seatDir}/<lead>.md`;

    const data: ConveneData = {
      channel,
      channelOpened,
      boardOpened,
      fresh,
      topicSet,
      board,
      leadDoc,
      ...(warnings.length > 0 && { warnings }),
    };

    emit({
      format,
      command: "convene",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines: string[] = [
          `Channel "${d.channel}": ${d.channelOpened ? "up" : "NOT opened"}${d.fresh ? " (fresh — dormant log cleared)" : ""}${d.topicSet ? " (topic set)" : ""}`,
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
        if (d.warnings?.length) {
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });
  },
});

import { emit, resolveFormat } from "../agent-layer.ts";
import { execCoord, firstErrorLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { type BoardCounts, readBoardCounts, requireConfig } from "./team-support.ts";

interface ConveneData {
  channel: string;
  channelOpened: boolean;
  topicSet: boolean;
  board: BoardCounts | null;
  leadDoc: string;
  warnings?: string[];
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
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "convene");
    const channel = (ctx.args.channel as string | undefined) || config.channel;
    const topic = ctx.args.topic as string | undefined;
    const warnings: string[] = [];

    let channelOpened = false;
    let topicSet = false;
    try {
      const grapevineCli = resolveCoordCli("grapevine");
      const open = await execCoord(grapevineCli, ["open", channel]);
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

    const { board, warning: boardWarning } = await readBoardCounts();
    if (boardWarning) warnings.push(boardWarning);

    const leadDoc = config.lead
      ? config.seatDocPath(config.lead)
      : `${config.paths.seatDir}/<lead>.md`;

    const data: ConveneData = {
      channel,
      channelOpened,
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
          `Channel "${d.channel}": ${d.channelOpened ? "up" : "NOT opened"}${d.topicSet ? " (topic set)" : ""}`,
        ];
        if (d.board) {
          lines.push(
            `Board: todo ${d.board.todo} · doing ${d.board.doing} · review ${d.board.review} · done ${d.board.done}`,
          );
        } else {
          lines.push("Board: not running (open one via the bounty skill if needed)");
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

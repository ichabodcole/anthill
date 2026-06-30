import { emit, resolveFormat } from "../agent-layer.ts";
import { execCoord, firstErrorLine, parseJsonLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { type BoardCounts, readBoardCounts, requireConfig } from "./team-support.ts";

interface StatusData {
  channel: string;
  present: string[];
  humans: string[];
  board: BoardCounts | null;
  /** Title of the board the counts came from — labels an ambient/stranger board
   * (read off bounty's global "latest"), so it isn't mistaken for this team's. */
  boardTitle?: string;
  warnings?: string[];
}

// `anthill status` — combined snapshot of who's on the grapevine channel and the
// bounty board's column counts. Channel comes from .team/config.json (overridable
// with --channel). Degrades gracefully: a missing daemon/board is a warning.
export const teamStatusCommand = defineAnthillCommand({
  meta: {
    name: "status",
    description: "Who's on the channel + the task board state (grapevine + bounty)",
    scope: "workspace",
  },
  args: {
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
    const config = requireConfig(format, "status");
    const channel = (ctx.args.channel as string | undefined) || config.channel;
    const warnings: string[] = [];

    let present: string[] = [];
    let humans: string[] = [];
    try {
      const grapevineCli = resolveCoordCli("grapevine");
      const who = await execCoord(grapevineCli, ["who", channel]);
      const parsed = parseJsonLine<{
        daemon?: boolean;
        subscribers?: string[];
        humans?: string[];
      }>(who.stdout);
      if (!who.ok || !parsed) {
        warnings.push(
          `grapevine 'who' unavailable: ${firstErrorLine(who.stderr, "could not read channel")}`,
        );
      } else if (parsed.daemon === false) {
        warnings.push("grapevine daemon not running — no presence available");
      } else {
        // Dedupe by handle — a seat with >1 live connection (vine tail + board
        // tail) otherwise shows up twice. Presence is "who's here", not sockets.
        present = [...new Set(parsed.subscribers ?? [])].sort();
        humans = [...new Set(parsed.humans ?? [])].sort();
      }
    } catch (err) {
      warnings.push(`grapevine CLI unresolved: ${(err as Error).message}`);
    }

    const { board, title: boardTitle, warning: boardWarning } = await readBoardCounts();
    if (boardWarning) warnings.push(boardWarning);

    const data: StatusData = {
      channel,
      present,
      humans,
      board,
      ...(boardTitle && { boardTitle }),
      ...(warnings.length > 0 && { warnings }),
    };

    emit({
      format,
      command: "status",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines: string[] = [`Channel: ${d.channel}`];
        lines.push(
          d.present.length > 0 ? `On the vine: ${d.present.join(", ")}` : "On the vine: (nobody)",
        );
        if (d.humans.length > 0) lines.push(`Humans: ${d.humans.join(", ")}`);
        if (d.board) {
          const label = d.boardTitle ? `Board «${d.boardTitle}»` : "Board";
          lines.push(
            `${label}: todo ${d.board.todo} · doing ${d.board.doing} · review ${d.board.review} · done ${d.board.done}`,
          );
        } else {
          lines.push("Board: unavailable");
        }
        if (d.warnings?.length) {
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });
  },
});

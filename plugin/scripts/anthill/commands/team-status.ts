import { emit, resolveFormat } from "../agent-layer.ts";
import { execCoord, firstErrorLine, parseJsonLine, resolveCoordCli } from "../coord.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import {
  type BoardCounts,
  classifyPresence,
  readBoardCounts,
  requireConfig,
  type SeatPresence,
} from "./team-support.ts";

interface StatusData {
  channel: string;
  present: string[];
  /** Which of the three presence states the channel actually reported. `present`
   * is empty for BOTH `none` and `unknown` — read this to tell them apart. */
  presence: SeatPresence["state"];
  humans: string[];
  board: BoardCounts | null;
  /** Title of the board the counts came from — labels an ambient/stranger board
   * (read off bounty's global "latest"), so it isn't mistaken for this team's. */
  boardTitle?: string;
  warnings?: string[];
}

// `anthill status` — combined snapshot of who's on the grapevine channel and the
// bounty board's column counts. Channel comes from .anthill/config.json (overridable
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
    // Three states, not a list that is empty for two unrelated reasons — the
    // same rule as `positionState` and `down`'s guard (seams.md Contract 6(c)).
    let presence: SeatPresence["state"] = "unknown";
    try {
      const grapevineCli = resolveCoordCli("grapevine");
      const who = await execCoord(grapevineCli, ["who", channel]);
      const parsed = parseJsonLine<{
        daemon?: boolean;
        subscribers?: string[];
        humans?: string[];
      }>(who.stdout);
      const classified = classifyPresence(
        { ok: who.ok, stderrLine: firstErrorLine(who.stderr, "could not read channel") },
        parsed,
      );
      presence = classified.state;
      if (classified.state === "unknown") {
        warnings.push(`presence unavailable: ${classified.reason}`);
      } else if (classified.state === "present") {
        present = classified.seats;
      }
      // Humans ride the same payload but are not part of the presence verdict —
      // read them whenever the payload parsed at all.
      humans = [...new Set(parsed?.humans ?? [])].sort();
    } catch (err) {
      warnings.push(`presence unavailable: grapevine CLI unresolved: ${(err as Error).message}`);
    }

    const { board, title: boardTitle, warning: boardWarning } = await readBoardCounts();
    if (boardWarning) warnings.push(boardWarning);

    const data: StatusData = {
      channel,
      present,
      presence,
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
        // "(nobody)" is a claim. Only make it when the channel actually said so
        // — otherwise say we could not tell. A reader who sees "(nobody)" after
        // a dead daemon concludes the team stood down.
        lines.push(
          d.presence === "present"
            ? `On the vine: ${d.present.join(", ")}`
            : d.presence === "none"
              ? "On the vine: (nobody)"
              : "On the vine: (unknown — could not read presence)",
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

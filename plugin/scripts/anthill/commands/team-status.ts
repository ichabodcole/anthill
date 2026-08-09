import { emit, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import {
  type BoardCounts,
  readBoardCounts,
  requireConfig,
  type SeatPresence,
  seatPresence,
} from "./team-support.ts";

interface StatusData {
  channel: string;
  present: string[];
  /** Which of the three presence states the channel actually reported. `present`
   * is empty for BOTH `none` and `unknown` — read this to tell them apart. */
  presence: SeatPresence["state"];
  board: BoardCounts | null;
  /** Title of the board the counts came from — labels an ambient/stranger board
   * (read off bounty's global "latest"), so it isn't mistaken for this team's. */
  boardTitle?: string;
  warnings?: string[];
}

// `anthill status` — combined snapshot of who's on the comms channel and the
// bounty board's column counts. Channel comes from .anthill/config.json (overridable
// with --channel). Degrades gracefully: a missing daemon/board is a warning.
export const teamStatusCommand = defineAnthillCommand({
  meta: {
    name: "status",
    description: "Who's on the channel + the task board state (comms + bounty)",
    scope: "workspace",
  },
  args: {
    channel: {
      type: "string",
      description: "Comms channel (default: config.channel)",
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

    // Presence comes from `seatPresence` — ONE shared implementation.
    //
    // This command had its own SECOND copy of the presence logic, so the fix
    // that made `down` span both wires left `status` still single-wire: it
    // reported `presence: "none"` with two seats demonstrably on comms. Nothing
    // is destroyed by a wrong `status` — but the convene checklist and the
    // session brief both name it as how a lead checks the team, so the failure
    // is a lead reading "nobody is here" and concluding teardown is safe, which
    // is precisely the conclusion `down` now refuses.
    //
    // Two copies of one verdict is the defect; patching the second copy would
    // have left the defect and removed its symptom. Found by the lead against a
    // running session, one command outside the card that fixed the first copy.
    // The lesson outlived the two-wire era that produced it — it is why this
    // still calls the shared helper now that there is only one wire to read.
    const classified = seatPresence(channel, config);
    const presence: SeatPresence["state"] = classified.state;
    const present = classified.state === "present" ? classified.seats : [];
    if (classified.state === "unknown") {
      warnings.push(`presence unavailable: ${classified.reason}`);
    }

    const { board, title: boardTitle, warning: boardWarning } = await readBoardCounts();
    if (boardWarning) warnings.push(boardWarning);

    const data: StatusData = {
      channel,
      present,
      presence,
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
        // "On the vine" named the wire this verdict does NOT come from. It read
        // as a live grapevine roster right through the swap — and a label that
        // names the wrong wire is worse than an unlabelled one, because it tells
        // a lead which wire to go and check when the answer surprises them.
        lines.push(
          d.presence === "present"
            ? `On comms: ${d.present.join(", ")}`
            : d.presence === "none"
              ? "On comms: (nobody)"
              : "On comms: (unknown — could not read presence)",
        );
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

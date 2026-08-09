/**
 * `anthill team …` — the noun group for the team a command is talking about.
 *
 * A NOUN GROUP WITH SUB-VERBS, not a bare verb plus a bare plural. Every surveyed
 * tool spells this the same way (`docker context use`, `terraform workspace
 * select`, `kubectl config use-context`), and the in-repo precedent is `comms`
 * (`send|read|follow|positions|stand-down`). The alternative — `anthill use` +
 * `anthill teams` — pairs a bare verb with a bare plural noun, which nothing
 * surveyed does, and it would be breaking to change once skill prose and emitted
 * incantations ship it.
 */

import { emit, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import type { TeamRung } from "../team-resolve.ts";
import { requireTeam } from "./team-support.ts";

/** How each rung reads to a human, in the words that let them change it. */
const RUNG_PROSE: Record<TeamRung, string> = {
  flag: "the `--team` flag on this command",
  env: "the ANTHILL_TEAM environment variable (this shell / this pane)",
  pin: "the pin at .anthill/current-team (`anthill team use <name>` changes it)",
  sole: "it is the only team this project configures",
};

interface ShowData {
  team: string;
  channel: string;
  /** WHICH RUNG ANSWERED. The whole point of this verb. */
  via: TeamRung;
  reason: string;
  teamDir: string;
  seatDir: string;
  lead: string | undefined;
  seats: string[];
  /** Every configured team, so "did it pick the right one" is answerable here. */
  configured: string[];
  forkedFrom: string | undefined;
}

/**
 * `anthill team show` — the resolved team AND the rung that resolved it.
 *
 * Cheap, and it is the only surface that makes a wrong ambient binding
 * SELF-EVIDENT rather than silent. Every other command answers "which team?"
 * correctly and says nothing about how it decided, so a seat whose pane carries a
 * stale `ANTHILL_TEAM` sees consistent, wrong results with no thread to pull.
 */
const showCommand = defineAnthillCommand({
  meta: {
    name: "show",
    description: "The team this repo currently resolves to, and which rung decided",
    scope: "workspace",
  },
  args: {
    team: {
      type: "string",
      description: "Which configured team (default: resolved from the pin / sole team)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const { project, team, via } = requireTeam(format, "team show", {
      team: ctx.args.team as string | undefined,
    });

    const data: ShowData = {
      team: team.name,
      channel: team.channel,
      via,
      reason: RUNG_PROSE[via],
      teamDir: team.paths.teamDir,
      seatDir: team.paths.seatDir,
      lead: team.lead,
      seats: team.roster().map((s) => s.handle),
      configured: project.teams.map((t) => t.name),
      forkedFrom: team.forkedFrom,
    };

    emit({
      format,
      command: "team show",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines = [
          `team: ${d.team}  (resolved by ${d.via} — ${d.reason})`,
          `channel: ${d.channel}`,
        ];
        if (d.forkedFrom) lines.push(`forked from: ${d.forkedFrom}`);
        lines.push(`docs: ${d.teamDir}/  ·  seats: ${d.seatDir}/`);
        lines.push(`roster: ${d.seats.join(", ")}${d.lead ? ` (lead: ${d.lead})` : ""}`);
        if (d.configured.length > 1) {
          lines.push(`configured teams: ${d.configured.join(", ")}`);
        }
        return lines.join("\n");
      },
    });
  },
});

export const teamTeamCommand = defineAnthillCommand({
  meta: {
    name: "team",
    description: "Which team this repo is on (show)",
    scope: "workspace",
  },
  subCommands: {
    show: showCommand,
  },
});

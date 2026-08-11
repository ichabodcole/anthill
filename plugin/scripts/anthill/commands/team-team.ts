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

import { emit, emitError, emittingCli, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import {
  AmbiguousTeamError,
  PIN_REL_PATH,
  readPin,
  resolveTeam,
  type TeamRung,
  writePin,
} from "../team-resolve.ts";
import { describeLiveTeam, liveTeams, requireProject, requireTeam } from "./team-support.ts";

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

// --- ls --------------------------------------------------------------------

interface TeamRow {
  name: string;
  channel: string;
  /** The team this invocation resolves to — exactly one row carries it. */
  current: boolean;
  teamDir: string;
  seats: number;
  lead: string | undefined;
  forkedFrom: string | undefined;
  forkedAt: string | undefined;
}

interface LsData {
  teams: TeamRow[];
  /** Which rung decided `current` — `null` when NOTHING resolves, which is a
   * legitimate state here and not an error. */
  via: TeamRung | null;
}

const lsCommand = defineAnthillCommand({
  meta: {
    name: "ls",
    description: "Every configured team, in config order, marking the resolved one",
    scope: "workspace",
  },
  args: {
    team: {
      type: "string",
      description: "Which team to mark as current (default: the resolved one)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const project = requireProject(format, "team ls");

    // ⚠ AN AMBIGUOUS PROJECT IS NOT AN ERROR HERE, and this is the whole reason
    // `ls` does not go through `requireTeam`. "Two teams and nothing selected
    // one" is precisely the state you run `ls` to inspect — refusing to list them
    // would answer the question "which teams exist?" with "pick one of the teams
    // I will not name". Measured: it did exactly that before this branch existed.
    // Nothing resolving marks no row, which is the honest rendering.
    let current: string | null = null;
    let via: TeamRung | null = null;
    try {
      const resolution = resolveTeam(project, {
        team: ctx.args.team as string | undefined,
        env: process.env,
        pin: readPin(project.projectRoot),
      });
      current = resolution.team.name;
      via = resolution.via;
    } catch (err) {
      // A BAD name is still an error — `--team nope` or a stale pin is a typo to
      // report, not an absence to render. Only genuine ambiguity is tolerated,
      // and it is told apart BY TYPE: this branch used to regex the error's
      // message, so rewording that sentence silently broke `ls` with the whole
      // suite green.
      if (!(err instanceof AmbiguousTeamError)) {
        emitError({ format, command: "team ls", error: (err as Error).message });
        process.exit(1);
      }
    }

    const data: LsData = {
      via,
      teams: project.teams.map((t) => ({
        name: t.name,
        channel: t.channel,
        current: t.name === current,
        teamDir: t.paths.teamDir,
        seats: t.roster().length,
        lead: t.lead,
        forkedFrom: t.forkedFrom,
        forkedAt: t.forkedAt,
      })),
    };

    emit({
      format,
      command: "team ls",
      data,
      startedAt: started,
      renderText: (d) => {
        const rows = d.teams.map((row) => {
          const mark = row.current ? "*" : " ";
          const lineage = row.forkedFrom ? `  ← forked from ${row.forkedFrom}` : "";
          const seats = `${row.seats} seat${row.seats === 1 ? "" : "s"}`;
          return `${mark} ${row.name}  (channel ${row.channel}, ${seats}, ${row.teamDir}/)${lineage}`;
        });
        if (d.via === null && d.teams.length > 1) {
          rows.push("", "No team is selected — `anthill team use <name>` pins one for this repo.");
        }
        return rows.join("\n");
      },
    });
  },
});

// --- use -------------------------------------------------------------------

interface UseData {
  team: string;
  previous: string | undefined;
  pin: string;
}

const useCommand = defineAnthillCommand({
  meta: {
    name: "use",
    description: "Pin this repo to a team, for every later command (writes .anthill/current-team)",
    scope: "workspace",
  },
  args: {
    name: { type: "positional", description: "The team to pin", required: true },
    force: {
      type: "boolean",
      description: "Switch even though a configured team looks live",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const project = requireProject(format, "team use");
    const name = String(ctx.args.name);

    // ⚠ VALIDATED AT WRITE TIME, not only on read. `kubectl config use-context
    // bogus` fails immediately, and the whole point of a config that enumerates
    // every legal team is that we can do the same. A pin accepted here and
    // rejected on every later command would turn one typo into a repo that
    // refuses every command until someone finds the file.
    if (!project.team(name)) {
      emitError({
        format,
        command: "team use",
        error: `no team named "${name}". Configured teams: ${project.teams
          .map((t) => t.name)
          .join(", ")}.`,
      });
      process.exit(1);
    }

    // ⚠ REFUSES IF ANY **OTHER** CONFIGURED TEAM LOOKS LIVE — not merely the
    // resolved one, and not the team being pinned. The existing presence guard is
    // scoped to one team, so switching AWAY from a live team would leave its seats
    // working while every command the lead runs resolves somewhere else. They are
    // not torn down; they are ORPHANED, which is worse, because nothing reports it.
    //
    // Switching TO a live team is the opposite act and must stay allowed:
    // `anthill team use dev` while `dev` holds the board is a lead adopting the
    // running team's binding, and it strands nobody. Unfiltered, this also refused
    // `team use <the only team>` on a SINGLE-team project the moment a board was
    // bound — a command that can only ever mean "stay where you are".
    if (!ctx.args.force) {
      const live = liveTeams(project).filter((t) => t.name !== name);
      if (live.length > 0) {
        emitError({
          format,
          command: "team use",
          error:
            `${live.map(describeLiveTeam).join(" and ")} still looks live, so switching now would ` +
            "leave those seats working while every command you run resolves elsewhere. " +
            `Stand the team down first (${emittingCli()} down), or pass \`--force\` if you know it is idle.`,
        });
        process.exit(1);
      }
    }

    const previous = readPin(project.projectRoot);
    writePin(project.projectRoot, name);

    emit({
      format,
      command: "team use",
      data: { team: name, previous, pin: PIN_REL_PATH } satisfies UseData,
      startedAt: started,
      renderText: (d) =>
        d.previous && d.previous !== d.team
          ? `Now on team "${d.team}" (was "${d.previous}"). Pinned in ${d.pin}.`
          : `Now on team "${d.team}". Pinned in ${d.pin}.`,
    });
  },
});

export const teamTeamCommand = defineAnthillCommand({
  meta: {
    name: "team",
    description: "Which team this repo is on (ls / use / show)",
    scope: "workspace",
  },
  subCommands: {
    ls: lsCommand,
    use: useCommand,
    show: showCommand,
  },
});

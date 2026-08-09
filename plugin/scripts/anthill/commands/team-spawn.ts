import { spawnSync } from "node:child_process";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { writeSessionOpen } from "../comms.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { TEAM_ENV_VAR } from "../team-resolve.ts";
import {
  createSession,
  hasTmux,
  killSession,
  labelPane,
  launchInPane,
  listPanes,
  sanitizeSessionName,
  sessionExists,
  splitAndTile,
  tmuxPath,
} from "../tmux.ts";
import { requireTeam } from "./team-support.ts";

type ResolveResult = { handles: string[] } | { error: string };

/**
 * Conservative shell-safe handle charset. Each handle is interpolated into the
 * `config.launch` line sent to a pane (default `claude "/anthill:join {handle}"`),
 * so a stray `"` could break out of the quotes. Enforced here regardless of where
 * the roster came from.
 */
const SAFE_HANDLE = /^[a-zA-Z0-9_-]+$/;

/**
 * Conservative shell-safe session-key charset. The key (`config.channel`) is
 * interpolated into a `BOUNTY_SESSION_KEY=<key>` env-assignment prefix that
 * `launchInPane` types into a pane's shell — so an unquoted value carrying a
 * space or shell metachar is an injection vector. Dots are allowed (channel
 * names may carry them); everything outside `[A-Za-z0-9._-]` is rejected.
 */
const SAFE_SESSION_KEY = /^[a-zA-Z0-9._-]+$/;

/**
 * PURE: the pane launch line for one seat — the `config.launch` template with
 * `{handle}` substituted, behind an env-assignment prefix carrying the two
 * AMBIENT bindings a spawned seat must inherit:
 *
 *   `BOUNTY_SESSION_KEY` — binds the seat's improvised bounty verbs to THIS
 *     team's board (the seat's Bash subshells inherit the exported var). See
 *     seams.md, the board-binding contract (owner: forager).
 *   `ANTHILL_TEAM` — rung 2 of the resolution ladder, so every `anthill` command
 *     the seat runs resolves to the team it was spawned for, without the seat
 *     ever naming one. Omitted for a single-team project, where rung 4 already
 *     answers and an extra env var would be noise in every pane.
 *
 * ⚠ WHY THIS IS AN ENV PREFIX AND NOT A `{team}` TOKEN IN `config.launch`.
 * A launch TEMPLATE is overridable, so any project that has customized `launch`
 * would silently never receive the token — the same partial-adoption trap
 * `{handle}` already carries, except that missing `{handle}` is loud and a
 * missing team binding is silent. The env prefix is applied REGARDLESS of the
 * template, which is exactly why `BOUNTY_SESSION_KEY` is already spelled this
 * way. Threading `{team}` would also have put two ambient mechanisms one
 * character apart in one string, with different scoping rules.
 *
 * ⚠ AND WHY THE WORKTREE HAZARD DOES NOT TRANSFER FROM BOUNTY. bounty's env
 * carries a key DERIVED AGAINST THE REPO PATH, so a worktree derives a different
 * board and the env shadows the pin that would have rescued it. `ANTHILL_TEAM`
 * carries a NAME checked against the config's registry, so it resolves correctly
 * from any directory or fails loudly.
 *
 * Both values are charset-guarded and never quoted into the line — a malformed
 * channel or team name is a hard error, not an injection.
 */
export function buildSeatLaunch(
  launch: string,
  handle: string,
  sessionKey: string,
  team?: { name: string; multiTeam: boolean },
): string {
  if (!SAFE_SESSION_KEY.test(sessionKey)) {
    throw new Error(
      `unsafe bounty session key "${sessionKey}" — config.channel must match [A-Za-z0-9._-]. Rename the channel in .anthill/config.json.`,
    );
  }
  let prefix = `BOUNTY_SESSION_KEY=${sessionKey} `;
  if (team?.multiTeam) {
    if (!SAFE_SESSION_KEY.test(team.name)) {
      throw new Error(
        `unsafe team name "${team.name}" — it is interpolated into an env prefix and must match [A-Za-z0-9._-].`,
      );
    }
    prefix += `${TEAM_ENV_VAR}=${team.name} `;
  }
  return `${prefix}${launch.replace(/\{handle\}/g, handle)}`;
}

/**
 * PURE handle resolution (no tmux) — the unit-test target. Config-driven: the
 * roster, the default spawn set, and the lead handle are all passed in (from
 * config.ts) rather than hardcoded.
 *
 * Rules: an empty roster is a hard error; blank positionals dropped; empty →
 * `defaultSpawn`; the lead handle is a hard error (it's the human's own session,
 * never spawned); any unknown handle errors with the spawnable roster (lead
 * omitted); a shell-unsafe handle is a hard error; duplicates collapse to first
 * occurrence, preserving request order.
 */
export function resolveSpawnHandles(
  requested: string[],
  opts: { roster: string[]; defaultSpawn: string[]; lead?: string },
): ResolveResult {
  const { roster, defaultSpawn, lead } = opts;
  if (roster.length === 0) {
    return { error: "roster is empty — is .anthill/config.json set up? (run anthill:bootstrap)" };
  }

  const cleaned = requested.map((h) => h.trim()).filter((h) => h.length > 0);

  if (lead && cleaned.includes(lead)) {
    return {
      error: `${lead} is not spawned — it's the lead (the human's own session). Drop it from the handle list.`,
    };
  }

  const candidates = cleaned.length > 0 ? cleaned : defaultSpawn;
  const spawnable = roster.filter((r) => r !== lead);

  const unknown = candidates.filter((h) => !roster.includes(h));
  if (unknown.length > 0) {
    const plural = unknown.length > 1 ? "s" : "";
    return {
      error: `unknown seat${plural} ${unknown.map((u) => `"${u}"`).join(", ")}. Valid handles: ${spawnable.join(", ") || "(none)"}`,
    };
  }

  // Dedupe (keep first occurrence) and belt-and-suspenders drop the lead.
  const handles = candidates.filter((h, i) => candidates.indexOf(h) === i && h !== lead);

  const unsafe = handles.filter((h) => !SAFE_HANDLE.test(h));
  if (unsafe.length > 0) {
    const plural = unsafe.length > 1 ? "s" : "";
    return {
      error: `unsafe seat handle${plural} ${unsafe.map((u) => `"${u}"`).join(", ")} — handles must match [A-Za-z0-9_-]. Rename the handle in .anthill/config.json.`,
    };
  }

  return { handles };
}

interface SeatPane {
  handle: string;
  paneId: string | null;
}

interface SpawnData {
  session: string;
  seats: SeatPane[];
  attached: boolean;
  attachCommand: string;
  warnings?: string[];
}

// `anthill spawn [handles...]` — open a tmux session with one labeled pane per
// worker seat, launch `claude` in each (config.launch with {handle} substituted),
// and auto-fire its join. Assumes the lead has already convened; the lead is
// never spawned.
export const teamSpawnCommand = defineAnthillCommand({
  meta: {
    name: "spawn",
    description: "Open a tmux session with one claude pane per worker seat (auto-joins each)",
    scope: "workspace",
  },
  args: {
    handles: {
      type: "positionals",
      description: "Seat handle(s) to spawn (default: every seat in the roster)",
      valueHint: "handle…",
    },
    session: {
      type: "string",
      description: "tmux session name (default: config.channel)",
      valueHint: "name",
    },
    attach: { type: "boolean", description: "Attach to the session (human TTY outside tmux only)" },
    cwd: { type: "string", description: "Working dir for each pane", valueHint: "path" },
    force: { type: "boolean", description: "Kill and recreate an existing same-named session" },
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
    const { project, team: config } = requireTeam(format, "spawn", {
      team: ctx.args.team as string | undefined,
      session: ctx.args.session as string | undefined,
    });
    // Only a multi-team project needs the ambient team binding in its launch
    // lines; a single-team project resolves on rung 4 and must see no change.
    const multiTeam = project.teams.length > 1;

    // The runner collects trailing/unmatched positionals into `ctx.args._`.
    const requested = ((ctx.args._ as string[] | undefined) ?? []).map(String);
    const resolved = resolveSpawnHandles(requested, {
      roster: config.roster().map((s) => s.handle),
      defaultSpawn: config.defaultSpawnSet().map((s) => s.handle),
      lead: config.lead,
    });
    if ("error" in resolved) {
      emitError({ format, command: "spawn", error: resolved.error });
      process.exit(1);
    }
    const handles = resolved.handles;

    // A degraded-but-non-fatal spawn (a split, a missing pane, an unwritable
    // session record) surfaces as a warning rather than a crash. Declared here
    // because the open record below is written before any pane exists.
    const warnings: string[] = [];

    // The SESSION-OPEN RECORD. Written here because `spawn` is the only command
    // that knows who was actually spawned, and the teardown guard cannot confirm
    // "everyone left" without knowing who was supposed to be here.
    //
    // Deriving that set from `config.seats` instead would mean a seat that was
    // never spawned has no departure record and blocks teardown FOREVER — the
    // always-block degradation arriving by another road.
    //
    // Written AFTER handle resolution and BEFORE any pane exists, deliberately:
    // if the spawn half-fails, the guard must still know seats were intended,
    // and erring toward "someone may be here" is the recoverable direction.
    const openRecord = writeSessionOpen(config.teamDirPath(), config.channel, handles);
    if (openRecord.warning) warnings.push(openRecord.warning);

    // Preflight: no half-spawn if tmux is missing.
    if (!hasTmux()) {
      emitError({
        format,
        command: "spawn",
        error: "tmux not found — install with: brew install tmux",
      });
      process.exit(1);
    }

    // Preflight: no half-spawn if the session key (config.channel) is unsafe to
    // interpolate — buildSeatLaunch would throw mid-loop, leaving a partial tmux
    // session. Fail cleanly here before any pane is created.
    if (!SAFE_SESSION_KEY.test(config.channel)) {
      emitError({
        format,
        command: "spawn",
        error: `unsafe config.channel "${config.channel}" — the bounty session key must match [A-Za-z0-9._-]. Rename the channel in .anthill/config.json.`,
      });
      process.exit(1);
    }

    const sessionName = sanitizeSessionName(
      (ctx.args.session as string | undefined) || config.channel,
    );
    const cwd = (ctx.args.cwd as string | undefined) || config.projectRoot;
    const force = Boolean(ctx.args.force);

    if (await sessionExists(sessionName)) {
      if (!force) {
        emitError({
          format,
          command: "spawn",
          error: `session "${sessionName}" already exists. Pass --force to kill and recreate it, or --session <name> for a different one.`,
        });
        process.exit(1);
      }
      await killSession(sessionName);
    }

    // First seat lives in the initial pane; each remaining seat gets a split.
    const created = await createSession(sessionName, cwd);
    if (!created.ok) {
      emitError({
        format,
        command: "spawn",
        error: `tmux could not create session "${sessionName}": ${created.stderr.trim() || "unknown error"}`,
      });
      process.exit(1);
    }
    for (const handle of handles.slice(1)) {
      const split = await splitAndTile(sessionName, cwd);
      if (!split.ok) {
        warnings.push(
          `split for seat "${handle}" failed: ${split.stderr.trim() || "unknown error"}`,
        );
      }
    }

    // Pair handles with panes in index order, then label + launch each.
    const paneIds = await listPanes(sessionName);
    const seats: SeatPane[] = [];
    for (const [i, handle] of handles.entries()) {
      const paneId = paneIds[i] ?? null;
      if (paneId) {
        await labelPane(paneId, handle);
        // Handle charset is validated in resolveSpawnHandles; buildSeatLaunch
        // guards the session key → safe to interpolate. The env prefix binds the
        // seat's improvised bounty verbs to THIS team's board (seams.md).
        await launchInPane(
          paneId,
          buildSeatLaunch(config.launch, handle, config.channel, {
            name: config.name,
            multiTeam,
          }),
        );
      } else {
        warnings.push(`seat "${handle}" got no pane — it was not launched`);
      }
      seats.push({ handle, paneId });
    }

    // Attach only a human TTY that's outside tmux; otherwise hand back the command.
    const attachCommand = `tmux attach -t ${sessionName}`;
    const canAttach =
      Boolean(ctx.args.attach) && Boolean(process.stdout.isTTY) && !process.env.TMUX;

    const data: SpawnData = {
      session: sessionName,
      seats,
      attached: canAttach,
      attachCommand,
      ...(warnings.length > 0 && { warnings }),
    };

    emit({
      format,
      command: "spawn",
      data,
      startedAt: started,
      renderText: (d) => {
        const lines: string[] = [
          `Spawned tmux session "${d.session}" with ${d.seats.length} seat${d.seats.length === 1 ? "" : "s"}:`,
        ];
        for (const seat of d.seats) {
          lines.push(`  ${seat.handle} → ${seat.paneId ?? "(no pane)"}`);
        }
        lines.push("");
        if (d.attached) {
          lines.push("Attaching…");
        } else {
          lines.push("Watch:      anthill attach");
          lines.push("Stand down: anthill down");
        }
        if (d.warnings?.length) {
          for (const w of d.warnings) lines.push(`⚠ ${w}`);
        }
        return lines.join("\n");
      },
    });

    // Blocking attach AFTER emit so the recap is flushed; returns on detach.
    if (canAttach) {
      spawnSync(tmuxPath(), ["attach", "-t", sessionName], { stdio: "inherit" });
    }
  },
});

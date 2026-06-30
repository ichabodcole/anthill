import { spawnSync } from "node:child_process";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
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
import { requireConfig } from "./team-support.ts";

type ResolveResult = { handles: string[] } | { error: string };

/**
 * Conservative shell-safe handle charset. Each handle is interpolated into the
 * `config.launch` line sent to a pane (default `claude "/anthill:join {handle}"`),
 * so a stray `"` could break out of the quotes. Enforced here regardless of where
 * the roster came from.
 */
const SAFE_HANDLE = /^[a-zA-Z0-9_-]+$/;

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
    return { error: "roster is empty — is .team/config.json set up? (run anthill:bootstrap)" };
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
      error: `unsafe seat handle${plural} ${unsafe.map((u) => `"${u}"`).join(", ")} — handles must match [A-Za-z0-9_-]. Rename the handle in .team/config.json.`,
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
    session: {
      type: "string",
      description: "tmux session name (default: config.channel)",
      valueHint: "name",
    },
    attach: { type: "boolean", description: "Attach to the session (human TTY outside tmux only)" },
    cwd: { type: "string", description: "Working dir for each pane", valueHint: "path" },
    force: { type: "boolean", description: "Kill and recreate an existing same-named session" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "spawn");

    // citty collects trailing/unmatched positionals into `ctx.args._`.
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

    // Preflight: no half-spawn if tmux is missing.
    if (!hasTmux()) {
      emitError({
        format,
        command: "spawn",
        error: "tmux not found — install with: brew install tmux",
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
    // A degraded-but-non-fatal spawn (a split or a missing pane) surfaces as a
    // warning rather than a crash.
    const warnings: string[] = [];
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
        // Handle charset is validated in resolveSpawnHandles → safe to interpolate.
        await launchInPane(paneId, config.launch.replace(/\{handle\}/g, handle));
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

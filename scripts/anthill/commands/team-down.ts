import { defineAnthillCommand } from "../define.ts";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { nowMillis } from "../runtime.ts";
import { hasTmux, killSession, sanitizeSessionName, sessionExists } from "../tmux.ts";
import { presentSeats, requireConfig } from "./team-support.ts";

/**
 * PURE guard (the unit-test target): block teardown only when seats are still on
 * the vine AND the human didn't pass --force. The one thing raw `tmux
 * kill-session` can't do — it'd happily kill panes mid-build.
 */
export function shouldBlockTeardown(present: string[], force: boolean): boolean {
  return present.length > 0 && !force;
}

interface DownData {
  session: string;
  tornDown: boolean;
  present: string[];
}

// `anthill down [--session <name>] [--force]` — a scoped, curated teardown of the
// team session. Refuses to kill panes while seats are still present on the vine
// (the config channel) unless forced; tearing down an absent session is a
// graceful no-op (success).
export const teamDownCommand = defineAnthillCommand({
  meta: {
    name: "down",
    description: "Tear down the team tmux session (guards against killing present seats)",
    scope: "workspace",
  },
  args: {
    session: { type: "string", description: "tmux session name (default: config.channel)", valueHint: "name" },
    force: { type: "boolean", description: "Tear down even if seats are still present" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "down");

    // Preflight: no point reading presence if tmux is missing.
    if (!hasTmux()) {
      emitError({ format, command: "down", error: "tmux not found — install with: brew install tmux" });
      process.exit(1);
    }

    const sessionName = sanitizeSessionName((ctx.args.session as string | undefined) || config.channel);

    // Tearing down an absent session is success, not an error.
    if (!(await sessionExists(sessionName))) {
      emit({
        format,
        command: "down",
        data: { session: sessionName, tornDown: false, present: [] } satisfies DownData,
        startedAt: started,
        renderText: (d) => `No team session "${d.session}" running — nothing to tear down.`,
      });
      return;
    }

    // Presence guard — the one thing raw tmux can't do. Reads the config channel.
    const force = Boolean(ctx.args.force);
    const present = await presentSeats(config.channel);
    if (shouldBlockTeardown(present, force)) {
      emitError({
        format,
        command: "down",
        error: `seats still present on the vine: ${present.join(", ")}. They haven't stood down — finalize them first, or re-run with --force to tear down anyway.`,
      });
      process.exit(1);
    }

    // killSession never throws (execTmux resolves ok:false on failure) — check
    // the result rather than report a teardown that didn't happen.
    const killed = await killSession(sessionName);
    if (!killed.ok) {
      emitError({
        format,
        command: "down",
        error: `failed to kill session "${sessionName}": ${killed.stderr.trim() || "tmux returned non-zero"}`,
      });
      process.exit(1);
    }

    emit({
      format,
      command: "down",
      data: { session: sessionName, tornDown: true, present } satisfies DownData,
      startedAt: started,
      renderText: (d) => `Tore down team session "${d.session}".`,
    });
  },
});

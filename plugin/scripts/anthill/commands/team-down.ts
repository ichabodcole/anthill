import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import { hasTmux, killSession, sanitizeSessionName, sessionExists } from "../tmux.ts";
import { requireConfig, type SeatPresence, seatPresence } from "./team-support.ts";

/**
 * PURE guard (the unit-test target): block teardown unless we have positively
 * established that nobody is on the channel, or the human passed --force. The
 * one thing raw `tmux kill-session` can't do — it'd happily kill panes mid-build.
 *
 * `unknown` blocks. The guard's two failure directions are not symmetric: a
 * refusal that should have proceeded costs one `--force`, while a teardown that
 * should have been refused kills seats mid-build. Presence used to arrive as
 * `string[]` with `[]` for both "nobody" and "could not tell", and the guard
 * resolved that ambiguity in the destructive direction.
 */
export function shouldBlockTeardown(presence: SeatPresence, force: boolean): boolean {
  if (force) return false;
  return presence.state !== "none";
}

interface DownData {
  session: string;
  tornDown: boolean;
  /** Seats observed on the channel. Empty when presence is `none` OR `unknown` —
   * read `presence` for which, and never infer standing-down from this list. */
  present: string[];
  /** The three-state presence the guard actually ruled on. */
  presence: SeatPresence["state"];
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
    session: {
      type: "string",
      description: "tmux session name (default: config.channel)",
      valueHint: "name",
    },
    force: { type: "boolean", description: "Tear down even if seats are still present" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "down");

    // Preflight: no point reading presence if tmux is missing.
    if (!hasTmux()) {
      emitError({
        format,
        command: "down",
        error: "tmux not found — install with: brew install tmux",
      });
      process.exit(1);
    }

    const sessionName = sanitizeSessionName(
      (ctx.args.session as string | undefined) || config.channel,
    );

    // Tearing down an absent session is success, not an error.
    if (!(await sessionExists(sessionName))) {
      emit({
        format,
        command: "down",
        // No session to tear down, so presence was never consulted. Reporting
        // "none" here would assert an observation we did not make.
        data: {
          session: sessionName,
          tornDown: false,
          present: [],
          presence: "unknown",
        } satisfies DownData,
        startedAt: started,
        renderText: (d) => `No team session "${d.session}" running — nothing to tear down.`,
      });
      return;
    }

    // Presence guard — the one thing raw tmux can't do. Reads the config channel.
    const force = Boolean(ctx.args.force);
    const presence = await seatPresence(config.channel);
    if (shouldBlockTeardown(presence, force)) {
      // Two distinct refusals. They must not share a sentence: one says who is
      // still working, the other says we could not find out — and a reader who
      // cannot tell them apart cannot tell whether --force is safe.
      emitError({
        format,
        command: "down",
        error:
          presence.state === "present"
            ? `seats still present on the vine: ${presence.seats.join(", ")}. They haven't stood down — finalize them first, or re-run with --force to tear down anyway.`
            : presence.state === "unknown"
              ? `cannot establish who is on "${config.channel}" (${presence.reason}), so this would tear down panes without knowing whether seats are working in them. Re-run with --force to tear down anyway.`
              : // Unreachable: the guard only blocks on present/unknown. Stated
                // rather than cast, so if the guard's rule changes this stays
                // honest instead of printing a confident wrong reason.
                `refusing to tear down "${config.channel}" — presence guard blocked without a stated reason.`,
      });
      process.exit(1);
    }
    const present = presence.state === "present" ? presence.seats : [];

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
      data: {
        session: sessionName,
        tornDown: true,
        present,
        presence: presence.state,
      } satisfies DownData,
      startedAt: started,
      renderText: (d) => `Tore down team session "${d.session}".`,
    });
  },
});

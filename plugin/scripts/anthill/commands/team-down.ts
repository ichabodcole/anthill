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
// team session. Refuses to kill panes while seats are still present on the team
// CHANNEL — presence spans BOTH wires (grapevine and comms, via
// `combinePresence`), so no single wire is named here — unless forced; tearing
// down an absent session is a graceful no-op (success).
//
// This header said "on the vine" for the whole of the session in which presence
// stopped being vine-only. The refusal string forty lines down was fixed for
// exactly that (`4cbf355`) and this comment was not, because the card named the
// STRING. It is the third site of one claim, found by a verifier after two
// separate fixes had each corrected the line they were pointed at.
//
// Zero functional impact, and that is precisely why it is worth the line: this
// is the FIRST thing a maintainer reads about this module, so a reader auditing
// presence finds the word "vine", concludes the guard is vine-only, and stops
// looking. A comment naming the hard case is a reason to check it, never
// evidence it was handled.
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
    // Config is passed so presence spans BOTH wires. Without it this reads the
    // vine alone and reports a confident "nobody" on a comms-only session —
    // which is the defect, on the one command that kills panes.
    const { presence } = await seatPresence(config.channel, config);
    if (shouldBlockTeardown(presence, force)) {
      // Two distinct refusals. They must not share a sentence: one says who is
      // still working, the other says we could not find out — and a reader who
      // cannot tell them apart cannot tell whether --force is safe.
      emitError({
        format,
        command: "down",
        error:
          presence.state === "present"
            ? // NAMES NO WIRE, deliberately. This said "on the vine" while the
              // verdict has been drawn from BOTH wires since presence became
              // multi-wire (`fb85483`) — so a seat present only on comms was
              // reported as present "on the vine", and a lead debugging it would
              // go read a grapevine roster that correctly says nobody is there.
              //
              // Adding a second wire silently made an existing enumeration wrong
              // while the sentence still read complete: `principles.md`'s
              // enumeration principle, reproducing on the command that
              // demonstrates the fix it describes, minutes after it landed.
              //
              // Naming BOTH wires here would be the same bug with a longer fuse:
              // `SeatPresence` carries no attribution, so this string cannot know
              // which wires were actually consulted — `seatPresence` skips comms
              // when it has no config — and the next wire added would make it
              // wrong again with nothing to catch it. So it names the CHANNEL,
              // which is true of every wire and stays true when one is added.
              // That also matches the `unknown` branch below, which was already
              // wire-agnostic and already correct.
              `seats still present on "${config.channel}": ${presence.seats.join(", ")}. They haven't stood down — finalize them first, or re-run with --force to tear down anyway.`
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

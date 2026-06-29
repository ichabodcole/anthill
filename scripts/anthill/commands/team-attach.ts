import { spawnSync } from "node:child_process";
import { defineAnthillCommand } from "../define.ts";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { nowMillis } from "../runtime.ts";
import { attachArgs, hasTmux, sanitizeSessionName, sessionExists, switchClientArgs, tmuxPath } from "../tmux.ts";
import { requireConfig } from "./team-support.ts";

export type AttachAction = "switch" | "attach" | "print";

/**
 * PURE decider (the unit-test target): how a caller can reach the session.
 * Not a TTY → "print" (an agent can't attach — hand back the command); already
 * inside tmux → "switch" (can't nest `attach`, use `switch-client`); else
 * "attach".
 */
export function resolveAttachAction(opts: { isTty: boolean; insideTmux: boolean }): AttachAction {
  if (!opts.isTty) return "print";
  if (opts.insideTmux) return "switch";
  return "attach";
}

interface AttachData {
  session: string;
  action: AttachAction;
  attachCommand: string;
}

// `anthill attach [--session <name>]` — a human-facing convenience to attach to
// the running team tmux session. From a non-TTY (an agent) it just hands back the
// command; inside tmux it switches the client (attach can't nest).
export const teamAttachCommand = defineAnthillCommand({
  meta: {
    name: "attach",
    description: "Attach to the running team tmux session (or print the command for an agent)",
    scope: "workspace",
  },
  args: {
    session: { type: "string", description: "tmux session name (default: config.channel)", valueHint: "name" },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const config = requireConfig(format, "attach");

    // Preflight: no point computing an action if tmux is missing.
    if (!hasTmux()) {
      emitError({ format, command: "attach", error: "tmux not found — install with: brew install tmux" });
      process.exit(1);
    }

    const sessionName = sanitizeSessionName((ctx.args.session as string | undefined) || config.channel);

    if (!(await sessionExists(sessionName))) {
      emitError({
        format,
        command: "attach",
        error: `no team session "${sessionName}" running — spawn one with: anthill spawn`,
      });
      process.exit(1);
    }

    const action = resolveAttachAction({
      isTty: Boolean(process.stdout.isTTY),
      insideTmux: Boolean(process.env.TMUX),
    });
    const attachCommand = `tmux attach -t ${sessionName}`;

    if (action === "print") {
      // Non-TTY caller (an agent): can't attach — hand back the command to run.
      emit({
        format,
        command: "attach",
        data: { session: sessionName, action, attachCommand } satisfies AttachData,
        startedAt: started,
        renderText: (d) => `Run from a terminal:  ${d.attachCommand}`,
      });
      return;
    }

    // Interactive: blocks until the human detaches (attach) or returns (switch).
    const args = action === "switch" ? switchClientArgs(sessionName) : attachArgs(sessionName);
    spawnSync(tmuxPath(), args, { stdio: "inherit" });
  },
});

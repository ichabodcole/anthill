import { spawnSync } from "node:child_process";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { ConfigError, findConfigFile } from "../config.ts";
import { defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";
import {
  attachArgs,
  hasTmux,
  listSessions,
  sanitizeSessionName,
  sessionExists,
  switchClientArgs,
  tmuxPath,
} from "../tmux.ts";
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

/**
 * PURE message (a unit-test target): what to say when `attach` is run outside any
 * anthill project and no `--session` was given — a friendly menu, not a bare error.
 */
export function formatNoProjectHint(cwd: string, sessions: string[]): string {
  const lines = [
    `not inside an anthill project — no .anthill/config.json found searching up from ${cwd}.`,
    "cd into your project, or pass --session <name> to attach by name.",
  ];
  if (sessions.length > 0) {
    lines.push("", "Running tmux sessions:", ...sessions.map((s) => `  - ${s}`));
  } else {
    lines.push("", "(no tmux sessions are currently running)");
  }
  return lines.join("\n");
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
    session: {
      type: "string",
      description: "tmux session name (default: config.channel)",
      valueHint: "name",
    },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const explicitSession = ctx.args.session as string | undefined;

    // Preflight: no point going further if tmux is missing.
    if (!hasTmux()) {
      emitError({
        format,
        command: "attach",
        error: "tmux not found — install with: brew install tmux",
      });
      process.exit(1);
    }

    // Resolve the target session. An explicit `--session` attaches by name from
    // anywhere (no project needed); otherwise derive it from the project's channel.
    // Run outside any project without `--session` → a friendly menu, not a bare
    // "no config" error.
    let sessionName: string;
    if (explicitSession) {
      sessionName = sanitizeSessionName(explicitSession);
    } else {
      let inProject = true;
      try {
        findConfigFile();
      } catch (err) {
        if (err instanceof ConfigError) inProject = false;
        else throw err;
      }
      if (!inProject) {
        emitError({
          format,
          command: "attach",
          error: formatNoProjectHint(process.cwd(), await listSessions()),
        });
        process.exit(1);
      }
      // Found up-tree → parse it (requireConfig still surfaces a malformed config).
      sessionName = sanitizeSessionName(requireConfig(format, "attach").channel);
    }

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

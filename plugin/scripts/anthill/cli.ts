#!/usr/bin/env bun

/**
 * anthill CLI — dual-audience entry point.
 *
 * Design rationale + extension guide:
 *   https://github.com/ichabodcole/project-docs-scaffold-template/tree/main/plugins/recipes/skills/project-cli-toolkit
 *
 * Scaffolded by:
 *   https://github.com/ichabodcole/seed-project-cli
 *
 * ---
 *
 * Wires the root command and installs interceptors for `help --json` (machine
 * manifest), bare `<cli>` / `<cli> help` (grouped human help), `--version`, and
 * `--help` (per-command usage) BEFORE the arg dispatcher.
 *
 * Gotcha: root `args` are NOT inherited into subcommands. Every subcommand that
 * wants `--format` must declare it locally.
 */

import { fileURLToPath } from "node:url";
import { emit, emitError, resolveFormat } from "./agent-layer.ts";
import { infoCommand } from "./commands/info.ts";
import { teamAttachCommand } from "./commands/team-attach.ts";
import { teamCommitCommand } from "./commands/team-commit.ts";
import { teamCommsCommand } from "./commands/team-comms.ts";
import { teamConveneCommand } from "./commands/team-convene.ts";
import { teamDownCommand } from "./commands/team-down.ts";
import { teamFeedbackCommand } from "./commands/team-feedback.ts";
import { fieldNotesCommand } from "./commands/team-field-notes.ts";
import { teamInitCommand } from "./commands/team-init.ts";
import { teamJoinCommand } from "./commands/team-join.ts";
import { teamMigrateCommand } from "./commands/team-migrate.ts";
import { teamScanCommand } from "./commands/team-scan.ts";
import { teamSpawnCommand } from "./commands/team-spawn.ts";
import { teamStatusCommand } from "./commands/team-status.ts";
import {
  type AnyCommand,
  CLIError,
  defineCommand,
  resolveSubCommand,
  runCommand,
} from "./define.ts";
import { renderCommandUsage, renderGroupedHelp } from "./help-renderer.ts";
import { buildManifest, type ManifestCommand, type ScopeLabel } from "./manifest.ts";

// Exported so sibling modules (e.g. `commands/team-feedback.ts`) can read
// `main.meta.version` — the release-please-tracked CLI version. The top-level
// execution below is guarded by `import.meta.main`, so importing this file as a
// dependency does NOT run the CLI (only running it directly does).
export const main: AnyCommand = defineCommand({
  meta: {
    name: "anthill",
    version: "2.1.0", // x-release-please-version
    description: "Project orchestration CLI",
  },
  args: {
    format: {
      type: "string",
      description: "Output format",
      valueHint: "text|json",
    },
  },
  subCommands: {
    info: infoCommand,
    convene: teamConveneCommand,
    join: teamJoinCommand,
    comms: teamCommsCommand,
    spawn: teamSpawnCommand,
    attach: teamAttachCommand,
    down: teamDownCommand,
    status: teamStatusCommand,
    scan: teamScanCommand,
    commit: teamCommitCommand,
    feedback: teamFeedbackCommand,
    "field-notes": fieldNotesCommand,
    init: teamInitCommand,
    migrate: teamMigrateCommand,
  },
});

/**
 * Recover the `--format` VALUE from raw argv, for the one caller that cannot ask
 * the parser: the `CLIError` catch, where parsing is what failed.
 *
 * Deliberately returns the raw value rather than a decision — the caller passes it
 * to `resolveFormat`, so the TTY-vs-pipe heuristic keeps exactly ONE implementation.
 * A literal scan for `--format json` would look equivalent and is not: it misses a
 * PIPED agent that passes no `--format` at all, which already gets JSON on every
 * other path, and which is how anthill's own emitted incantations invoke the CLI.
 *
 * Yes, this is a second, dumber parse of argv. It cannot be unified with the real
 * one — that is the failure being handled — so the obvious later "cleanup" is a
 * regression, not a tidy-up.
 */
export function sniffFormatValue(rawArgs: string[]): string | undefined {
  const PREFIX = "--format=";
  let found: string | undefined;
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    // Everything after `--` is a positional VALUE, never a flag — matching the
    // real parser, so a path literally named `--format` can't move the verdict.
    if (arg === "--") break;
    if (arg.startsWith(PREFIX)) {
      found = arg.slice(PREFIX.length);
    } else if (arg === "--format") {
      const next = rawArgs[i + 1];
      if (next !== undefined) {
        found = next;
        i++;
      }
    }
  }
  // LAST occurrence wins: a root `--format` precedes the subcommand's, and the
  // subcommand is the one whose failure is being reported.
  return found;
}

/**
 * The space-joined command path for the error envelope's `meta.command`, matching
 * the hand-written strings commands pass to `emit`/`emitError` ("commit",
 * "comms read"). The root's own name is not part of that convention, so it is
 * dropped. Depth-2 by construction — `resolveSubCommand` returns only the immediate
 * parent, which is every command shape the CLI currently has.
 */
export function commandPath(cmd: AnyCommand, parent?: AnyCommand): string {
  const self = cmd.meta?.name ?? "";
  if (!parent) return self;
  const parentName = parent.meta?.name;
  // The root is the parent of every top-level command; "anthill status" would not
  // match what `status` itself emits.
  if (!parentName || parent === main) return self;
  return `${parentName} ${self}`;
}

/**
 * Find a command's manifest entry by its resolved path (`["comms","read"]`), so
 * `--help --format json` can hand an agent the FLAGS AS DATA instead of a
 * rendered usage block it would have to re-parse.
 */
function findManifestCommand(
  commands: ManifestCommand[],
  path: string[],
): ManifestCommand | undefined {
  for (const cmd of commands) {
    if (cmd.path.length === path.length && cmd.path.every((p, i) => p === path[i])) return cmd;
    const nested = cmd.subcommands && findManifestCommand(cmd.subcommands, path);
    if (nested) return nested;
  }
  return undefined;
}

/**
 * rawArgs with any `--format` (both spellings) removed, so the interceptors can
 * ask "is this argv ONLY `--version`?" without the format flag defeating the
 * match. `--version --format json` is one intent, not two.
 */
function withoutFormat(rawArgs: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    if (arg.startsWith("--format=")) continue;
    if (arg === "--format") {
      i++;
      continue;
    }
    out.push(arg);
  }
  return out;
}

/**
 * The CLI entry routine. Wrapped in a function (not bare top-level) so this
 * module can be imported for its `main` export without executing — only a direct
 * run (`import.meta.main`) invokes it. That importability is what lets
 * `commands/team-feedback.ts` read `main.meta.version`.
 */
async function runCli(): Promise<void> {
  const argv = process.argv;
  const rawArgs = argv.slice(2);

  // The help/usage interceptors run BEFORE arg dispatch, so they never saw
  // `ctx.args.format` and wrote prose to stdout under `--format json` — the same
  // defect as the parser-error path, on the success side. Resolve the verdict
  // once, here, from the same sniffer + the same `resolveFormat`.
  const format = resolveFormat(sniffFormatValue(rawArgs));

  // Intercept `<cli> help --json` BEFORE the grouped-help interceptor. Ordering
  // matters: the bare-help check below also matches `argv[2] === "help"`, so if
  // you flip these the JSON manifest path will never be reached.
  //
  // `--json` keeps emitting the BARE manifest, pretty-printed. That is a shipped
  // contract with existing consumers, so it is deliberately NOT enveloped;
  // `--format json` below is the enveloped spelling. Two spellings, two shapes,
  // both honoured — the defect was one being silently ignored, not both existing.
  if (argv[2] === "help" && argv.includes("--json")) {
    const manifest = await buildManifest(main);
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    process.exit(0);
  }

  // Intercept bare `<cli>` and `<cli> help` for grouped human help.
  //
  // These interceptors bypass arg dispatch entirely, so any NEW root flag you add
  // later (e.g. `--verbose`) will not affect help output unless you also parse it
  // here.
  if (argv.length === 2 || argv[2] === "help") {
    const i = argv.indexOf("--scope");
    const scope = i >= 0 ? (argv[i + 1] as ScopeLabel | undefined) : undefined;
    if (format === "json") {
      emit({
        format,
        command: "help",
        data: await buildManifest(main),
        renderText: () => "",
      });
      process.exit(0);
    }
    process.stdout.write(`${await renderGroupedHelp(main, { scope })}\n`);
    process.exit(0);
  }

  // `--version` / `-v` (root only, matching the old citty builtin). Matched
  // against argv with `--format` stripped: `--version --format json` is one
  // intent, and the un-stripped length check silently failed to match it, so an
  // agent asking for the version as JSON fell through to the dispatcher.
  const versionArgs = withoutFormat(rawArgs);
  if (versionArgs.length === 1 && (versionArgs[0] === "--version" || versionArgs[0] === "-v")) {
    const version = main.meta?.version ?? "";
    // `source` — WHICH cli.ts is answering, not just what it calls itself.
    //
    // A version string alone cannot disambiguate two binaries that behave
    // differently, and during dogfooding they routinely do: the PATH launcher
    // resolves the highest CACHED RELEASE while this repo runs ahead of its own
    // release, so both answered `1.7.1` while differing in at least two ways —
    // the launcher had no `-F` (the flag our own emitted LAND string uses, so
    // the string simply failed), and piped `--help` returned text from one and
    // JSON from the other, i.e. they disagreed about the format decision itself.
    //
    // THE VERSION STRING DID NOT MERELY FAIL TO INFORM — IT ASSERTED SAMENESS.
    // That is the defect this field closes: `version` answers "what release do I
    // claim to be", `source` answers "which file is actually running", and only
    // the second one distinguishes a repo checkout from a cached release.
    //
    // TOTAL, never conditional: a field present only when it looks interesting
    // would make its absence unreadable (Contract 5(a)), and "absent" would be
    // indistinguishable from an older binary that never had it — which is
    // precisely the confusion this exists to end.
    const source = fileURLToPath(import.meta.url);
    emit({
      format,
      command: "version",
      data: { version, source },
      // The path goes in the human line too. A human comparing two shells is
      // the ORIGINAL victim here, and telling them only in JSON would leave the
      // audience that hit this defect exactly where they were.
      renderText: () => `${version} (${source})`,
    });
    process.exit(0);
  }

  // `--help` / `-h` anywhere → per-command usage for the resolved (sub)command.
  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    const [cmd, parent] = resolveSubCommand(main, rawArgs);
    if (format === "json") {
      // The MANIFEST entry, not the rendered usage block. An agent asking for
      // help wants the flags as data; rendered usage in a JSON field is the
      // thing Contract 5 forbids, and it would be prose an agent must re-parse.
      const path = commandPath(cmd, parent);
      const manifest = await buildManifest(main);
      const entry = findManifestCommand(manifest.commands, path.split(" "));
      emit({
        format,
        command: path,
        data: entry ?? { name: cmd.meta?.name ?? "", description: cmd.meta?.description ?? "" },
        renderText: () => "",
      });
      process.exit(0);
    }
    process.stdout.write(`${renderCommandUsage(cmd, parent)}\n`);
    process.exit(0);
  }

  try {
    await runCommand(main, rawArgs);
  } catch (err) {
    const [cmd, parent] = resolveSubCommand(main, rawArgs);
    // The format decision must NOT depend on where the error was raised. Errors
    // raised inside `run()` reach this verdict via `resolveFormat(ctx.args.format)`;
    // this path cannot (parsing is what failed), so it recovers the same INPUT from
    // rawArgs and hands it to the same FUNCTION.
    const format = resolveFormat(sniffFormatValue(rawArgs));
    if (format === "text") {
      // Byte-unchanged from before the agent-envelope fix: a usage block is the
      // right answer for a human, and a stack is the right answer for a bug.
      if (err instanceof CLIError) {
        process.stderr.write(`${renderCommandUsage(cmd, parent)}\n`);
        process.stderr.write(`${err.message}\n`);
      } else {
        process.stderr.write(
          `${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`,
        );
      }
    } else if (err instanceof CLIError) {
      // Rendered usage NEVER enters a JSON field — not truncated, not escaped, not
      // under a `usage` key. `err.message` already names what was wrong and the
      // valid flag set, which is what an agent needs to self-correct.
      emitError({ format, command: commandPath(cmd, parent), error: err.message });
    } else {
      // An unexpected throw is a BUG, so the stack is the most valuable thing in
      // the process — carried on `meta` rather than flattened away.
      emitError({
        format,
        command: commandPath(cmd, parent),
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
    process.exit(1);
  }
}

// NOT top-level `await` on purpose: a sibling command reads `main.meta.version`
// via a lazy `import("./cli.ts")`, and a module suspended on top-level await
// can't be resolved by that import (it would deadlock). Running detached lets
// this module finish evaluating; runCli owns its own error handling + exit.
if (import.meta.main) {
  runCli().catch((err) => {
    process.stderr.write(`${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
    process.exit(1);
  });
}

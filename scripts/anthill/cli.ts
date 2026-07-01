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
 * Wires the root citty command and installs interceptors for `help --json`
 * (machine manifest) and bare `<cli>` / `<cli> help` (grouped human help)
 * BEFORE citty's own dispatch.
 *
 * Gotcha: citty does NOT inherit root `args` into subcommands. Every subcommand
 * that wants `--format` must declare it locally.
 */

import { defineCommand, runMain } from "citty";
import { infoCommand } from "./commands/info.ts";
import { teamAttachCommand } from "./commands/team-attach.ts";
import { teamCommitCommand } from "./commands/team-commit.ts";
import { teamConveneCommand } from "./commands/team-convene.ts";
import { teamDownCommand } from "./commands/team-down.ts";
import { teamInitCommand } from "./commands/team-init.ts";
import { teamJoinCommand } from "./commands/team-join.ts";
import { teamMigrateCommand } from "./commands/team-migrate.ts";
import { teamSpawnCommand } from "./commands/team-spawn.ts";
import { teamStatusCommand } from "./commands/team-status.ts";
import { renderGroupedHelp } from "./help-renderer.ts";
import { buildManifest, type ScopeLabel } from "./manifest.ts";

const main = defineCommand({
  meta: {
    name: "anthill",
    version: "1.1.0", // x-release-please-version
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
    spawn: teamSpawnCommand,
    attach: teamAttachCommand,
    down: teamDownCommand,
    status: teamStatusCommand,
    commit: teamCommitCommand,
    init: teamInitCommand,
    migrate: teamMigrateCommand,
  },
});

const argv = process.argv;

// Intercept `<cli> help --json` BEFORE the grouped-help interceptor. Ordering
// matters: the bare-help check below also matches `argv[2] === "help"`, so if
// you flip these the JSON manifest path will never be reached.
if (argv[2] === "help" && argv.includes("--json")) {
  const manifest = await buildManifest(main);
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
  process.exit(0);
}

// Intercept bare `<cli>` and `<cli> help` for grouped human help.
//
// These interceptors bypass citty's own dispatch entirely, so any NEW root
// flag you add later (e.g. `--verbose`) will not affect help output unless
// you also parse it here.
if (argv.length === 2 || argv[2] === "help") {
  const i = argv.indexOf("--scope");
  const scope = i >= 0 ? (argv[i + 1] as ScopeLabel | undefined) : undefined;
  process.stdout.write(`${await renderGroupedHelp(main, { scope })}\n`);
  process.exit(0);
}

runMain(main);

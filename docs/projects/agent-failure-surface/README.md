# Agent failure surface

**What this covers:** what an agent receives when an `anthill` command goes wrong.

The CLI is dual-audience. A human gets prose; an agent gets a single-line `{ok,…}` envelope on
stderr with stdout empty. **The failure paths are where that promise keeps breaking**, and the
breakages share a shape: the output is _plausible_, so nothing errors and nobody notices.

## Why it is a project rather than scattered items

Four defects, one surface, found months apart and each one invisible until an agent hit it:

- **"The CLI failure surface lies"** (shipped 1.7.0) — failure messages that read as isolation.
- **Parser errors bypass the envelope** (this branch) — the class an agent hits _most_, since a
  wrong flag is the commonest way an agent gets a command wrong.
- **`resolveFormat` reads `isTTY` ambiently** (`docs/backlog/2026-08-01-...`) — half the format
  matrix has no automated guard, so the human-facing half can break with every test green.
- **`anthill info --format json`** reads the value as a subcommand name — user-facing, repro on two
  branches, unfiled at time of writing.

Two more were routed here on 2026-08-26, from three sessions running `agent-cli-conformance`
against this CLI. Both are failure-path concerns; the manifest defects found in the same sessions
went to [cli-declared-surface](../cli-declared-surface/proposal.md) instead, because a document an
agent reads _before_ anything goes wrong is a different surface.

- **[A usage error and a bug share exit 1](../../backlog/2026-08-21-usage-errors-and-bugs-share-exit-1.md)**
  — the catch block already branches on which it is holding and emits two different envelopes, then
  drops both into the same `process.exit(1)`. Three classes collapse into one code (`CLIError`,
  `ConfigError`, and an unhandled throw), by way of two separate exit sites. Anything reading `$?`
  rather than parsing stderr cannot tell "you typo'd a flag" from "anthill threw". **Retrofitting
  exit codes onto a tool with consumers is the expensive case** — read the item before scoping.
- **[A group node refuses without naming a route](../../backlog/2026-08-26-group-nodes-refuse-without-naming-a-route.md)**
  — every leaf verb names its valid set on an unknown flag; `info`, `comms` and `team` name nothing,
  because a group's own arg table is empty. Same node type as the `--format json` item above, so one
  fix probably covers both.

## The rule the surface is held to

> **The format decision must not depend on where the error was raised.**

Stronger than enumerating cells, and it survives whatever field names a fix picks.

## Sessions

- [`2026-08-01-parser-errors-agent-envelope.md`](./sessions/2026-08-01-parser-errors-agent-envelope.md)

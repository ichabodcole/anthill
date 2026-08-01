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

## The rule the surface is held to

> **The format decision must not depend on where the error was raised.**

Stronger than enumerating cells, and it survives whatever field names a fix picks.

## Sessions

- [`2026-08-01-parser-errors-agent-envelope.md`](./sessions/2026-08-01-parser-errors-agent-envelope.md)

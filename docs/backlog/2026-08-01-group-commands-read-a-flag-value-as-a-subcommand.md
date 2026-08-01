# `anthill info --format json` reads the value as a subcommand name

**Added:** 2026-08-01 · **Status:** ready to design · **Seat:** forager (CLI)
· **Found:** incidentally, while porting the parser-envelope fix · **Project:** agent-failure-surface

## Repro

```
$ anthill info --format json
{"ok":false,"error":"Unknown command json","meta":{"command":"info"}}

$ anthill info show --format json
{"ok":true,"data":{"cli":{...}}}          ← works
```

Confirmed on both `develop` and `feat/team-comms-slice-one`, so it predates and survives the
parser-envelope work.

## Cause

`info` is a **group** — it dispatches to subcommands and does not itself declare `--format`. Group
dispatch scans for the first non-flag token to pick a subcommand, so the **value** `json` is read as
the subcommand name. The flag's own name is consumed; its argument is not.

## Why it is worth fixing rather than documenting

**The error names the wrong token.** `Unknown command json` points at a word the user never intended
as a command, so it reads as "there is no `json` subcommand" rather than "`info` needs a subcommand,
and `--format` belongs after it." An agent self-correcting from that message will look for a
subcommand called `json`.

It is also the shape an agent is most likely to produce: reaching for `--format json` on a bare
command is exactly what the dual-audience contract trains it to do.

**The parser-envelope fix improved the reporting and not the invocation** — it now emits a clean
envelope instead of a usage block, so the failure is parseable while still being wrong.

## Directions, none chosen

- **Let a group declare pass-through flags** (`--format` at minimum) so the value is consumed before
  subcommand resolution.
- **Skip flag values when scanning for a subcommand** — requires knowing which flags take values,
  which the group does not currently track.
- **Improve only the message** — cheapest, and it leaves the invocation broken. Note the message
  would have to name the real problem (_"`info` requires a subcommand; `--format` goes after it"_),
  because the current one is actively misleading.

## Related

`docs/backlog/2026-08-01-resolveformat-reads-istty-ambiently.md`, and the `agent-failure-surface`
project README, which collects the four defects on this surface.

# dev — the development team

The team that builds this project. Each seat keeps its own living doc (`<handle>.md`); shared
inter-seat truth lives once in [`seams.md`](./seams.md). How the whole system works: the SOP,
[`../README.md`](../README.md). Task state on the bounty board; the team's message wire is
`anthill comms` (the seat-aware log) on the `anthill-dev` channel.

> **⚠ `anthill <command>` below is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and every anthill skill prints it
> resolved.

## Roster

| Handle | Role | Scope |
| --- | --- | --- |
| maestro | lead | orchestration, the file-scoped atomic land, human liaison |
| forager | hands (CLI/engine) | plugin/scripts/anthill/ — the CLI commands, config/coord/tmux, the migration engine, the comms wire, and their tests |
| weaver | brain (skills/methodology) | plugin/skills/ (the bootstrap/convene/join/plan/finalize/upgrade lifecycle skills + the methodology) + plugin/templates/ (scaffold + archetypes) |
| sentinel | verify | cross-cutting verification — the quality gate (typecheck/biome/bun test), fresh-context cold-reads, and real-repo/consumer validation |
| steward | support (the lead's capacity) | errands the lead would otherwise stop to do — go find out whether X is true, read this and return the decision, hold context. Verifies premises as a by-product, never product code. Disposition: trust but check, including and especially the lead. |
| scout | research (how the team works) | observes the session and reports on how the team actually behaves — grounded in the tree, not the wire. Never rules, assigns, or corrects mid-session; full participant after it ends. Reports to the lead AND the human. |

## How work divides

- **Ownership follows the architecture.** Each seat owns a slice; the lead (maestro) orchestrates and
  lands. Boundaries between slices are the **seams** — single-sourced in [`seams.md`](./seams.md),
  never restated per seat.
- **A feature spanning slices** is split into per-seat bounty cards (owner lanes); the seats
  coordinate on comms; the lead reconciles and lands atomically, **file-scoped** (no seat's
  tree gets swept into another's commit).
- **Verification is dynamic** — the verify seat engages at verification points (early/mid/late), not
  only at the end, and ping-pongs with the owning seat until green. See the SOP.

This roster is a **hypothesis**, not law — the finalize **structure reflection** can split, merge, or
re-scope a seat when the work says so. Re-run `anthill init` after a reshape to render any new seat
docs (existing docs are never clobbered). **`init` does not rewrite this roster table** — when a seat
is added / renamed / re-scoped, the lead updates the row above by hand.

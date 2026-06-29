# dev — the development team

The team that builds this project. Each seat keeps its own living doc (`<handle>.md`); shared
inter-seat truth lives once in [`seams.md`](./seams.md). How the whole system works: the SOP,
[`../README.md`](../README.md). Task state on the bounty board; back-channel on the `{{channel}}`
grapevine.

## Roster

{{rosterTable}}

## How work divides

- **Ownership follows the architecture.** Each seat owns a slice; the lead ({{lead}}) orchestrates and
  lands. Boundaries between slices are the **seams** — single-sourced in [`seams.md`](./seams.md),
  never restated per seat.
- **A feature spanning slices** is split into per-seat bounty cards (owner lanes); the seats
  coordinate on the grapevine; the lead reconciles and lands atomically, **file-scoped** (no seat's
  tree gets swept into another's commit).
- **Verification is dynamic** — the verify seat engages at verification points (early/mid/late), not
  only at the end, and ping-pongs with the owning seat until green. See the SOP.

This roster is a **hypothesis**, not law — the finalize **structure reflection** can split, merge, or
re-scope a seat when the work says so. Re-run `anthill init` after a reshape to render any new seat
docs (existing docs are never clobbered). **`init` does not rewrite this roster table** — when a seat
is added / renamed / re-scoped, the lead updates the row above by hand.

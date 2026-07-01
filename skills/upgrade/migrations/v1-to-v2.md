# Migration: v1 → v2 — consolidate the footprint into `.anthill/`

## Summary

v1 split anthill's footprint across two locations: config at `.team/config.json` and living docs at
`docs/team/` (the default). v2 puts **everything under a single self-named `.anthill/` root** —
config, living docs, and the gitignored scratch. This is a **pure relocate**: no file's content
changes, so there is nothing to reconcile.

## What moves

| v1                                | v2                                |
| --------------------------------- | --------------------------------- |
| `.team/config.json`               | `.anthill/config.json`            |
| `docs/team/README.md` (SOP)       | `.anthill/README.md`              |
| `docs/team/paper-cuts.md`         | `.anthill/paper-cuts.md`          |
| `docs/team/dev/seams.md`          | `.anthill/dev/seams.md`           |
| `docs/team/dev/<handle>.md`       | `.anthill/dev/<handle>.md`        |
| `.gitignore`: `.team/scratch/`    | `.gitignore`: `.anthill/scratch/` |
| config `version`: unstamped / `1` | config `version`: `2`             |

The vacated `.team/` (only the disposable, gitignored scratch remains in it) and the emptied
`docs/team/` are removed.

## The `paths` override (escape hatch) — and the redundant-default trap

A `paths` override tells migrate where the living docs live. Two cases, handled differently:

- **A genuinely bespoke location** (docs deliberately somewhere other than `docs/team/`) → migrate
  **leaves the docs where they are** and moves only the config dir into `.anthill/`. The override stays
  valid.
- **A _redundant_ override that just spells out the v1 default `docs/team`** → this is almost never
  deliberate; it's the old default written out. Honoring it would silently HALF-consolidate (config
  moves, docs don't) — the exact thing v2 exists to kill. So migrate **consolidates the docs into
  `.anthill/` anyway and drops the redundant `paths` block**, and says so loudly in the plan. If you
  _do_ want the docs to stay at `docs/team/` on purpose, re-run **`anthill migrate --keep-paths`**.

(This is the media-buffet finding — a redundant default override quietly defeated the consolidation and
only a human paying attention caught it.)

## Reconciliation

**None needed.** `git mv` preserves content byte-for-byte, so every seat doc, `seams.md`, and
paper-cuts entry the team hand-edited arrives intact. Nothing is merged or overwritten.

## Verification checklist

- [ ] `.anthill/config.json` exists and its `version` is `2`.
- [ ] The living docs are under `.anthill/` (or at the `paths` override, if one was set).
- [ ] `.team/` and the default `docs/team/` are gone.
- [ ] `.gitignore` has `.anthill/scratch/` and no longer `.team/scratch/`.
- [ ] **After you land the commit (not before):** `git log --follow .anthill/<a moved file>` shows the
      pre-move history. `--follow` reads _committed_ history, so at staged-verify time (pre-commit) it
      returns empty — that's expected, not a failure. Run this check post-land.
- [ ] `anthill status` resolves; `anthill init` is a clean no-op.

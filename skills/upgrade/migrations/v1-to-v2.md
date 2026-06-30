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

## The `paths` override (escape hatch)

If the repo set an explicit `paths` override — its living docs deliberately live somewhere other than
the `docs/team/` default — the migration **leaves the docs where they are** and moves only the config
dir into `.anthill/`. The override stays valid; re-point it later if you want the docs under
`.anthill/` too.

## Reconciliation

**None needed.** `git mv` preserves content byte-for-byte, so every seat doc, `seams.md`, and
paper-cuts entry the team hand-edited arrives intact. Nothing is merged or overwritten.

## Verification checklist

- [ ] `.anthill/config.json` exists and its `version` is `2`.
- [ ] The living docs are under `.anthill/` (or at the `paths` override, if one was set).
- [ ] `.team/` and the default `docs/team/` are gone.
- [ ] `.gitignore` has `.anthill/scratch/` and no longer `.team/scratch/`.
- [ ] `git log --follow .anthill/<a moved file>` shows the pre-move history (the move was tracked).
- [ ] `anthill status` resolves; `anthill init` is a clean no-op.

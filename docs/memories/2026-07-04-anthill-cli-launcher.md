# anthill CLI launcher — the global `anthill` command

**Date:** 2026-07-04

Built the global `anthill` CLI (roadmap #2) as a **launcher, not a copy**: a tiny binary in a
dedicated repo (`github.com/ichabodcole/anthill-cli`) that resolves the highest-semver plugin cache
and delegates to _its_ `cli.ts` via `spawn(..., {stdio:"inherit"})` — one copy of CLI logic, zero
version skew, no reinstall on plugin upgrade. Opt-in, human-facing; agents still drive the CLI
through the plugin. The resolver (`src/resolve.ts`) mirrors the plugin's own `coord.ts`.

Plugin-side support (branch `feat/anthill-cli-launcher`, merged to `develop`): `anthill attach` now
takes `--session <name>` and shows a friendly no-project menu (`formatNoProjectHint` + `listSessions`
in `tmux.ts`) instead of a bare error; consent-gated mention of the optional CLI in
`skills/bootstrap/SKILL.md` + README. **AGENTS.md deliberately untouched** (a human's global binary
isn't agent-actionable — `only-include-non-discoverable-information`).

The friendlier fallback reaches real installs on the next `develop → main` release (the cache
predates it). Deferred: lead-facing vine/board wrapper verbs; option-2 external-source-of-truth.

**Docs:** [anthill-cli-launcher project](../projects/_archive/anthill-cli-launcher/) · [session](../projects/_archive/anthill-cli-launcher/sessions/2026-07-04-cli-launcher-build.md) _(archived)_

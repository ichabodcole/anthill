# Targeted plugin distribution — ship only the plugin, self-contained

**Date:** 2026-07-05

Made anthill ship a clean, self-contained plugin instead of the whole repo. Two slices on
`feat/plugin-distribution` (awaiting human sign-off → develop): `4f7bc0f` (move) · `9f77c39` (drop-citty).

- **Root cause:** `marketplace.json` had `"source": "."` — the whole repo cached into consumers. Claude
  Code has **no `.pluginignore`/allowlist** (confirmed against current docs); the only lever is what
  `source` points at. Fix: **`git-subdir`** source (`{source:"git-subdir", url, path:"plugin"}`) →
  sparse-checkout only `plugin/`.
- **Slice 1 (move):** `git mv` the shippable surface (`skills/`, `scripts/anthill/`, `templates/`,
  `plugin.json`) under `plugin/`; marketplace → git-subdir. **Zero skill edits** — every
  `${CLAUDE_PLUGIN_ROOT}` target rebases under `plugin/` transparently (enumerate them first to be
  sure). Re-pathed `biome.json` + the `anthill` script; tsconfig needed nothing (no `include`).
- **Slice 2 (drop-citty):** `citty` was the CLI's **only** external runtime dep, forcing a Bun
  auto-install at runtime. Replaced it with an in-house command layer over `node:util parseArgs`
  (`define.ts` runner + `cli.ts` dispatch + `help-renderer.ts`), so the shipped CLI is raw `.ts`,
  zero-dep, no fetch, no build. Behavior identical (129 pass); `ctx.args` preserved byte-for-byte.
- **The proof (sentinel):** a **zero-dep clean-room run** — copy `plugin/` to `/tmp` with no
  `node_modules`/network, run the CLI. Every command worked. Self-containment proven, not asserted.
- **Release-time gap:** local verify can't prove the git-subdir sparse-checkout caches _only_ `plugin/`
  — that needs a real install of the published plugin. Run that check at the `develop → main` release.

Forager-led (no owner↔owner seam → lighter than a full `anthill:plan`): lead did the structural move,
forager the CLI rewrite, sentinel verified. First real exercise of the **subagent-finalize** fix —
forager self-captured its lessons into its seat doc as its task's final step.

**Docs:** [proposal](../projects/_archive/plugin-distribution/proposal.md) ·
[session](../projects/_archive/plugin-distribution/sessions/2026-07-05-targeted-distribution.md)

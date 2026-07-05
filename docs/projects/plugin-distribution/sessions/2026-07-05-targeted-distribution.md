# Session — targeted plugin distribution (ship only the plugin, self-contained)

**Date:** 2026-07-05
**Branch:** `feat/plugin-distribution` (off `develop`) — **awaiting human sign-off → develop**
**Team:** maestro (lead + the structural move) · forager (drop-citty) · sentinel (verify)
**Landed:** `4f7bc0f` (move) · `9f77c39` (drop-citty)

---

## What this was

Two coupled goals so anthill ships a clean, self-contained plugin instead of the whole repo:

1. **Targeted ship** — stop caching our internal workshop (`.anthill/`, `docs/`, dev config, tests)
   into consumers.
2. **Self-contained CLI** — remove the one external runtime dep so the shipped CLI needs no fetch, no
   build.

Forager-led (not a full `anthill:plan` — no owner↔owner seam to ratify; the lead owned the structural
move, forager owned the CLI rewrite, sentinel verified).

## The two slices

- **Slice 1 — the move (`4f7bc0f`, lead).** `git mv` the shippable surface (`skills/`,
  `scripts/anthill/`, `templates/`, `plugin.json`) under `plugin/`; `marketplace.json` → a `git-subdir`
  source (`path: plugin`) so only that subtree sparse-checks-out. Re-pathed `biome.json` includes + the
  `anthill` script; tsconfig needed nothing (no `include` → it already covers `plugin/**`). **Zero skill
  edits** — every `${CLAUDE_PLUGIN_ROOT}` target (enumerated beforehand: `scripts/anthill/cli.ts`,
  `skills/upgrade/migrations/`, `templates/archetypes/`) rebased under `plugin/` transparently. 129 pass.
- **Slice 2 — drop citty (`9f77c39`, forager).** Replaced `citty` (the CLI's only external runtime dep)
  with an in-house command layer over `node:util` `parseArgs`: a rewritten `define.ts` runner (typed
  `ctx.args` preserved byte-for-byte), a hand-rolled root dispatch in `cli.ts`, and a `help-renderer.ts`
  reproducing citty's usage output. citty removed from `package.json` + `bun.lock`. 129 pass, behavior
  identical.

## Verification (sentinel — the load-bearing proof)

- **Zero-dep clean-room run** (the headline): copied `plugin/` to `/tmp` with no `node_modules` in any
  parent and no network — every command worked (`scan` returned a full `{ok,data,meta}` envelope,
  `status` failed gracefully, `--help`/`--version`/nested help all rendered). Self-containment is
  **proven**, not asserted.
- **Clean-ship assertion:** `plugin/` contains only `.claude-plugin/plugin.json`, `skills/`,
  `scripts/`, `templates/`. No `.anthill/`, `docs/`, `AGENTS.md`, dev config (after removing a stray
  nested `tsconfig.json` — sentinel's finding #1).
- `bun run check` green (129 pass); `git-subdir` JSON shape correct.

## Findings + dispositions

- **[Low] Stray `plugin/scripts/anthill/tsconfig.json` shipping** → removed in `9f77c39` (root tsconfig
  covers `plugin/**`; the nested one was unused dev config from the CLI seed).
- **[Cosmetic] Nested subcommand help drops the `anthill` root prefix + version** (`info show --help`
  renders `USAGE info show` not `USAGE anthill info show`). Affects only `info show`/`info env`.
  **Follow-up filed** (below) — not blocking.

## The known limitation (release-time check)

Local verification proves the `plugin/` tree is correct **and** the CLI is genuinely zero-dep. It does
**not** prove Claude Code's `git-subdir` sparse-checkout actually caches _only_ `plugin/` — that can
only be confirmed by a real install of the published plugin. **That's a release-time check**, to run
when the `develop → main` release goes out.

## Method notes

- **First real exercise of the subagent-finalize fix** we shipped earlier today: forager's build brief
  carried a baked-in finalize-capture step, and forager self-synthesized its lessons into
  `.anthill/dev/forager.md` as its task's final step (the lead didn't reconstruct them). The pattern
  worked as designed.
- **Lead workflow lesson (maestro):** don't pre-stage with `git rm`/`git add` before an `anthill
commit` — the abort-guard (correctly) rejects out-of-band staged content. Let `anthill commit` own the
  staging; reset the index first if you've staged by hand.

## Follow-ups (non-blocking)

- Nested-subcommand help prefix/version (thread the full command-path chain into `renderCommandUsage`).
- Optional pristine ship: move `*.test.ts` + `__fixtures__` out of `plugin/` (they currently ship; an
  accepted MVP call).
- Consider bundling the launcher (`anthill-cli`) resolve-path check at release (it delegates to
  `…/scripts/anthill/cli.ts`, same plugin-root-relative path — expected fine, but verify on the real
  install).

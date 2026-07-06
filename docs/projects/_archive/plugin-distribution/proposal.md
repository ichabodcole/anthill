# Targeted plugin distribution — ship only the plugin, self-contained

**Status:** Shipped in `v1.3.0` (2026-07-05) — archived. Targeted `git-subdir` distribution + zero-dep CLI.
**Created:** 2026-07-05
**Author:** Cole + maestro

---

## Overview

anthill is distributed as a Claude Code marketplace plugin whose `marketplace.json` sets
`"source": "."` — the **whole repo root**. On install, Claude Code clones and caches the entire source
tree, so a consumer's `~/.claude/plugins/cache/…` ends up holding our internal workshop: the `.anthill/`
team brain (seat docs, paper-cuts, memory), all of `docs/`, `AGENTS.md`/`CLAUDE.md`, the dev config, and
the colocated tests/fixtures. None of that is the product.

This proposal makes anthill ship **only the plugin**, and ship it **self-contained**. Two coupled moves:

1. **Targeted ship** — move the shippable surface into a clean `plugin/` subtree and point the
   marketplace at it via a **`git-subdir`** source (sparse-checkout — only `plugin/` is cloned +
   cached). Confirmed with current Claude Code docs: there is **no `.pluginignore` / allowlist**; the
   only way to exclude files is to control what `source` points at.
2. **Self-contained CLI** — remove the CLI's single external runtime dependency (`citty`) in favor of
   Bun's built-in `util.parseArgs`, so the shipped plugin is raw `.ts` with **zero deps, no runtime
   fetch, no build step**. (Today the CLI relies on Bun auto-installing `citty` at runtime, since
   `node_modules` doesn't ship.)

## Problem Statement

1. **We ship our workshop.** `source: "."` + no ignore mechanism means every release copies the full
   repo into consumers' caches — including `.anthill/` (our team's living docs), `docs/`, and tests.
   It's not breaking anything, but it's leaking internal state into other people's environments and
   bloating the cache.
2. **The CLI depends on a runtime fetch.** The CLI imports `citty` (its **only** external runtime dep;
   everything else is `node:*` builtins). `citty` is a devDependency and `node_modules` is gitignored,
   so the shipped CLI has no `citty` on disk — it works only because Bun auto-installs it on first run.
   That's a network dependency and a bet on Bun's auto-install behavior, inside someone else's repo.

Both are confirmed by inspection: `marketplace.json` `source: "."`; the sole non-`node:` import across
`scripts/anthill/` is `citty`; `.gitignore` excludes only `node_modules`, `dist`, `.anthill/scratch/`.

## Proposed Solution

### 1. The `plugin/` subtree (targeted ship)

Move the shippable surface under a single `plugin/` directory:

```
plugin/
  .claude-plugin/
    plugin.json          # moved from repo-root .claude-plugin/
  skills/                # moved (unchanged content)
  scripts/anthill/       # moved (unchanged content; CLI)
  templates/             # moved (unchanged content)
```

Everything else stays at the repo root and **does not ship**: `.anthill/`, `docs/`, `AGENTS.md`,
`CLAUDE.md`, `package.json`, `tsconfig.json`, `biome.json`, `node_modules/`.

`.claude-plugin/marketplace.json` **stays at the repo root** (that's the marketplace manifest location)
and its plugin entry changes to a `git-subdir` source:

```json
{
  "name": "anthill",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/ichabodcole/anthill.git",
    "path": "plugin"
  }
}
```

**Why zero skill edits:** the skills invoke the CLI and read templates via `${CLAUDE_PLUGIN_ROOT}/…`,
and after `git-subdir` the plugin root **is** the `plugin/` subtree. Every `${CLAUDE_PLUGIN_ROOT}`
target in the skills — verified, they are exactly `scripts/anthill/cli.ts`,
`skills/upgrade/migrations/`, and `templates/archetypes/*.json` — lives under `plugin/`, so all
references rebase transparently. The move is a relocation, not a rewrite.

### 2. Drop `citty` → dependency-free CLI (self-contained)

Replace `citty` with Bun's built-in `node:util` `parseArgs` at the single choke point — `define.ts`
(`defineAnthillCommand` wraps citty's `defineCommand`) — plus the few files importing citty types
(`cli.ts`, `manifest.ts`, `commands/info-env.ts`, `commands/team-spawn.ts`, `commands/info-show.ts`).
The 14 commands all flow through `defineAnthillCommand`, so the surface area is the wrapper + root
dispatch, not each command.

- **What's lost:** citty auto-generates `--help`/usage (as seen in `anthill <cmd> --help` today). We
  reimplement a small help formatter over the command metadata anthill already declares (`meta`,
  `args`) — bounded but real work, since citty currently gives this for free.
- **What's gained:** the shipped CLI is raw `.ts` with **only** `node:*` imports — nothing to fetch,
  nothing to build, nothing to bundle. No `package.json` needed in the shipped tree. Truly
  self-contained.

### 3. Dev tooling re-path (stays at repo root)

The move re-points root-level tooling at `plugin/**`: `tsconfig.json` include globs, `package.json`
scripts (`anthill` → `bun plugin/scripts/anthill/cli.ts`, the `test` glob), `lint-staged` globs, and any
`husky` hook paths. `biome` scans `.` so it picks up `plugin/` for free. `.gitignore` is unchanged
(still ignores `node_modules`, `dist`, `.anthill/scratch/`). Tests stay **colocated** under
`plugin/scripts/anthill/` (see Open Questions — they'd ship; the alternative is moving them out).

## Scope

**In scope (MVP):**

- Move `skills/`, `scripts/anthill/`, `templates/`, `plugin.json` into `plugin/`.
- `marketplace.json` → `git-subdir` source at `path: "plugin"`.
- Drop `citty`; replace with `node:util parseArgs` in `define.ts` + the type-importing files;
  reimplement `--help`.
- Re-path the root dev tooling; `bun run check` green after the move.
- Verify a **clean, zero-dep run from a simulated cache** (below).

**Out of scope (at least initially):**

- Bundling / a build step — dropping the one dep makes it unnecessary.
- Restructuring `skills/`/`templates/` **content** — only their location moves.
- Changing the separate `anthill-cli` launcher repo (a cross-repo verify, not a change — see Risks).
- Shipping a consumer-facing plugin `README.md` — nice-to-have, deferred.

**Future considerations:**

- A pristine ship that excludes tests (move them to a parallel `test/` tree outside `plugin/`).
- `bun build --compile` for a standalone binary, if the separate launcher ever wants one.

## Technical Approach

- **The move** is `git mv` (preserves history) for the three dirs + `plugin.json`, then tooling
  re-path. Mechanical and reviewable as a diff.
- **Drop-citty** is contained to the command layer: `define.ts` builds a small `parseArgs`-based runner
  (subcommand dispatch + typed args + a help formatter) matching anthill's existing `{meta, args,
run(ctx)}` shape, so command files stay untouched except the ~3 that import citty types directly.
- **The dual-audience envelope, guards, and command behavior are unchanged** — only the arg-parsing/
  dispatch framework swaps.
- **Ownership:** this is **forager-dominant** (scripts/anthill + repo structure + tooling). weaver's
  only involvement is confirming skill/template references survive the move (a check, not a lane —
  already verified: all `${CLAUDE_PLUGIN_ROOT}` targets move under `plugin/`). sentinel owns the
  clean-ship + zero-dep verification. So this is a lighter plan than a full multi-owner-seam feature.

## Verification (the real proof)

- `bun run check` green after the move (tsc + biome + `bun test`).
- **Zero-dep clean-cache simulation:** copy `plugin/` to a temp dir with **no `node_modules` and no
  network**, run `bun <tmp>/scripts/anthill/cli.ts status` (and `--help`, and a representative
  command) — it must work with no `citty`, no fetch. This is the self-containment proof.
- **Clean-ship assertion:** the `plugin/` tree contains **only** `.claude-plugin/plugin.json`,
  `skills/`, `scripts/anthill/`, `templates/` — no `.anthill/`, `docs/`, `AGENTS.md`, dev config.
- `anthill --help` and each subcommand's help render correctly post-citty.

## Impact & Risks

**Benefits:** consumers stop receiving our internal workshop; the cache shrinks to the product; the CLI
becomes self-contained (no runtime fetch, no build) — a genuinely portable, professional plugin.

**Risks:**

- _A `${CLAUDE_PLUGIN_ROOT}` reference points outside `plugin/`._ Mitigation: enumerated — all three
  targets (`scripts/anthill`, `skills/upgrade/migrations`, `templates/archetypes`) move under `plugin/`.
  The clean-cache run is the backstop.
- _The `anthill-cli` launcher repo assumes the old layout._ It resolves the plugin cache and delegates
  to `…/scripts/anthill/cli.ts`. Under `git-subdir` the cache root **is** `plugin/`, so
  `scripts/anthill/cli.ts` is at the same plugin-root-relative path — should still resolve, **but this
  needs a cross-repo verify** before release.
- _Reimplementing `--help` drops a citty affordance._ Mitigation: a small formatter over the existing
  per-command `meta`/`args` metadata covers it; verified per-command against the current output.
- _Consumers on the current cache already have our internals._ True and unavoidable (already shipped in
  v1.2.0); the fix ships clean on the **next** release, which is why this precedes it.

**Complexity:** **Medium** — the move is mechanical, the drop-citty is a bounded command-layer rewrite,
and the verification (zero-dep clean run) is the load-bearing check.

## Open Questions

- **Tests: colocated (ship) vs. moved out (pristine).** Lean: keep colocated for the MVP (dev
  ergonomics; the "leak" is trivial test files, not our workshop), file the parallel-`test/`-tree move
  as a fast follow if a pristine ship is wanted.
- **A slim consumer `README.md` in `plugin/`?** Lean: defer; not required for function.
- **Planning mechanism:** given it's forager-dominant, a lighter plan (forager builds, sentinel
  verifies) may fit better than a full multi-seat `anthill:plan` ratify — to decide at planning.

## Success Criteria

- A fresh install caches **only** the `plugin/` subtree — no `.anthill/`, `docs/`, or dev files reach a
  consumer.
- The CLI runs from a **no-`node_modules`, no-network** copy of `plugin/` — zero external deps, no
  build, `--help` and commands intact.
- **Zero skill/template content changes** — the move is transparent to the lifecycle skills.
- `bun run check` green; the `anthill-cli` launcher still resolves and delegates correctly.

---

**Related Documents:**

- [ROADMAP](../../ROADMAP.md)
- [CLI launcher (archived)](../_archive/anthill-cli-launcher/proposal.md)

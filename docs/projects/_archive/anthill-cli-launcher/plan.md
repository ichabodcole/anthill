# Human `anthill` CLI launcher — Implementation Plan

**Created:** 2026-07-04 **Related Proposal:** [proposal.md](./proposal.md)
**Status:** Draft

---

## Overview

Build the opt-in human `anthill` launcher from the [proposal](./proposal.md). Two tracks: a new
**`anthill-cli`** repo (sibling clone at `~/Projects/dreamwood/anthill-cli`, currently empty) holding
the tiny resolver+exec launcher, and small changes in **this** repo (an `attach` outside-project
fallback, a bootstrap mention, docs). The launcher is a **pointer** — it resolves the highest-semver
anthill plugin-cache `cli.ts` and delegates — so there is no second copy and no version skew.

## Outcome & Success Criteria

**Definition of Done:**

- [ ] `bun add -g github:ichabodcole/anthill-cli` puts `anthill` on PATH; from a project dir,
      `anthill status` and `anthill attach` reach that project's running team session.
- [ ] `anthill` run outside any project prints a helpful "not in a project + running sessions" message,
      not a bare "no config" error.
- [ ] Plugin agents are unchanged (still `${CLAUDE_PLUGIN_ROOT}/…/cli.ts`); no skew surface added.
- [ ] The launcher needs no change across an anthill plugin upgrade (re-resolves highest semver).
- [ ] Both repos green (`bun run check` here; the launcher's own test + typecheck there).

**Non-Goals:** option 2 (external CLI as source of truth), monorepo/npm publish, new wrapper verbs,
auto-install.

## Approach Summary

The launcher mirrors the **proven `coord.ts` resolver** (`selectCoordCli`/`compareSemver`), which
already resolves spellbook's versioned cache the same way — split into a **pure** picker (fs
injected, unit-tested) plus a thin real-fs wrapper. The plugin-side `attach` change reuses the
existing cwd-anchored root-marker flow; the only new behavior is the no-marker branch. Ship Track A
first (it's independently testable and the human-visible deliverable), then the plugin polish.

## Phases

### Phase 1: The `anthill-cli` launcher repo

**Goal:** a tiny, installable launcher that resolves + delegates to the plugin's `cli.ts`.

**Key Changes** (in `~/Projects/dreamwood/anthill-cli`, from empty):

- `package.json` — `name: anthill-cli`, `type: module`, `bin: { "anthill": "./src/anthill.ts" }`,
  scripts `test` (`bun test`) + `typecheck` (`tsc --noEmit`); zero runtime deps, `@types/bun` +
  `typescript` dev-only. `tsconfig.json`, `.gitignore`, `README.md`.
- `src/resolve.ts` — the **pure** core, ported from `coord.ts`:
  - `compareSemver(a, b)` (copy the numeric-dotted compare).
  - `selectAnthillCli({ cacheRoot, marketplaceDirs, listVersions, exists })` → highest-semver
    `<cacheRoot>/<marketplace>/anthill/<ver>/scripts/anthill/cli.ts` that exists, across all
    marketplace dirs (glob `cache/*/anthill/` keeps it robust to marketplace naming). Returns
    `{ ver, cli } | undefined`. No fs — everything injected.
- `src/anthill.ts` — the `bin` entry: wire `selectAnthillCli` to real fs
  (`~/.claude/plugins/cache`), and on hit **delegate** via `bun "$cli" <argv…>` with
  `stdio: "inherit"`, `cwd: process.cwd()`; propagate the child's exit code and forward
  `SIGINT`/`SIGTERM` (so `attach`'s TTY + Ctrl-C behave). On miss, print a clear error ("anthill
  plugin not found under ~/.claude/plugins/cache/*/anthill — install it in Claude Code") and exit 1.
- `src/resolve.test.ts` — unit-test `compareSemver` + `selectAnthillCli` (highest-semver pick,
  missing-cli skip, empty → undefined, multiple marketplaces) with injected `exists`/listings.

**Validation:**

- [ ] `bun test` + `tsc --noEmit` green in the launcher repo.
- [ ] Local smoke: `bun src/anthill.ts status` from within this anthill repo resolves the cached
      `1.2.0` cli and prints status (proves resolve+delegate before publishing).

**Dependencies:** none (empty repo). Bun present (it runs the launcher).

### Phase 2: `attach` outside-a-project fallback (this repo)

**Goal:** running the launcher (or the CLI) outside any project gives a menu, not a dead error.

**Key Changes:**

- `scripts/anthill/tmux.ts` — add `listSessionsArgs()` (pure: `["list-sessions", "-F", "#{session_name}"]`)
  - a thin `listSessions(): Promise<string[]>` (empty list if tmux has no server / errors — never
    throws), matching the file's existing pure-arg-builder + wrapper split.
- `scripts/anthill/commands/team-attach.ts` — before `requireConfig` hard-errors on a missing marker,
  branch: if no `.anthill/config.json` is found up-tree, `emit` a helpful message — "not inside an
  anthill project (searched up from `<cwd>`); cd into your project or pass `--session <name>`" +
  the `listSessions()` output — and exit non-zero cleanly. Keep a pure decider where it helps testing
  (e.g. `formatNoProjectHint(cwd, sessions)`), consistent with the file's existing
  `resolveAttachAction` pure/testable pattern.

**Validation:**

- [ ] New unit tests: `listSessionsArgs` shape; `formatNoProjectHint` output (with and without
      sessions). Existing attach tests still green.
- [ ] `bun run check` green.
- [ ] Manual: `cd /tmp && anthill attach` → the hint + session list (not a stack trace).

**Dependencies:** none. (Independent of Phase 1, but naturally verified together in Phase 4.)

### Phase 3: bootstrap mention + docs

**Goal:** discoverability — surface the optional human CLI without pushing it.

**Key Changes:**

- `skills/bootstrap/SKILL.md` — in the preflight step, add a short **opt-in** note: if `anthill`
  isn't on PATH, mention `bun add -g github:ichabodcole/anthill-cli` gives humans a terminal `anthill`
  (attach/status). Explicitly **never auto-install** (machine-touching stays consent-gated), matching
  bootstrap's existing consent posture for deps.
- `README.md` + `AGENTS.md` — a short "optional: a human `anthill` command" line (install one-liner,
  what it's for, that it's a pointer to the installed plugin so there's nothing to keep in sync).

**Validation:**

- [ ] `bun run check` green (prose only; watch the prettier belt — one sentence per line where a
      wrapped `-`/`*` could bite).
- [ ] A reader can find the install path from bootstrap or the README.

**Dependencies:** Phase 1 (so the install one-liner is real).

### Phase 4: End-to-end verification (the real artifact)

**Goal:** prove the installed launcher actually resolves + delegates, per anthill's "verify the real
artifact" rule.

**Key Changes:** none — this is exercise, not code.

**Validation:**

- [ ] Install the launcher for real (`bun add -g <local path or github:ichabodcole/anthill-cli>`);
      confirm `which anthill` and `anthill status` from a project resolve the cached cli and print
      state; `anthill attach` reaches the session (or prints the command from a non-TTY).
- [ ] Upgrade-resilience check: the launcher points at the **highest** installed plugin version (you
      have 0.1.0…1.2.0 cached) — confirm it picks 1.2.0.
- [ ] Outside-project fallback shows the menu.

**Dependencies:** Phases 1–2.

## Key Risks & Mitigations

- **`bun add -g` PATH placement** varies by setup → verify bun's global bin dir is on `$PATH`;
  document a one-line `bun pm -g bin` PATH note in the launcher README if needed (Phase 1).
- **Can't distinguish anthill tmux sessions from others** (no session-name prefix today) → the
  fallback lists **all** tmux sessions with the hint; a future `anthill/<channel>` prefix is out of
  scope (would touch convene/spawn/down and break running sessions).
- **`exec`-style delegation in JS** (no true `execvp`) → use spawn + stdio inherit + exit-code
  propagation + signal forwarding; validate Ctrl-C and exit codes pass through in Phase 4.

## Testing & Validation Strategy

Unit tests for the **pure** pieces (the resolver in the launcher; the tmux arg-builder + hint
formatter in the plugin) — bun test both repos. The delegating entry and the tmux exec are covered by
the Phase 4 real-artifact smoke, not mocked. No mock-only tests that pass without proving resolution.

## Open Questions

- **Launcher entry form** — `bin` → `.ts` run by Bun (chosen: one language, testable) vs an `sh`
  wrapper. Proceeding with `.ts` unless the bun `bin` shim misbehaves.
- **Launcher repo tooling** — keep it minimal (tsc + bun test, prettier optional); skip biome unless
  parity with anthill is wanted. Leaning minimal.

---

**Related Documents:**

- [Proposal](./proposal.md) · [ROADMAP #2](../../ROADMAP.md) · [v0.2 brief feature 3](../../briefs/2026-06-30-anthill-v0.2-next-release.md)
- `../../../scripts/anthill/coord.ts` (resolver to mirror) · `../../../scripts/anthill/commands/team-attach.ts` · `../../../scripts/anthill/tmux.ts`

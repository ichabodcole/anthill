# anthill CLI launcher — build + finalize — 2026-07-04

## Context

Roadmap #2 (v0.2 brief feature 3): the global `anthill` command. The resolved design
([proposal](../proposal.md)) is a **launcher, not a copy** — a tiny globally-installed binary that
resolves the highest-semver plugin cache and delegates to _its_ `cli.ts`, so there's one copy of CLI
logic and zero version skew. Built across two repos: a new dedicated `anthill-cli` launcher repo, and
the anthill-plugin-side support for it. Branch: `feat/anthill-cli-launcher`.

## What Happened

Landed in four phases against [plan.md](../plan.md).

**Phase 1 — the launcher repo** (separate repo, `github.com/ichabodcole/anthill-cli`, on `main`).
A pure resolver (`src/resolve.ts`, mirroring the plugin's own `coord.ts`): `compareSemver`,
`buildCliPath`, `selectAnthillCli` — flatMap over marketplace dirs, filter to existing `cli.ts`, sort
by semver desc, take the head. 7 unit tests. The `bin` entry (`src/anthill.ts`, `#!/usr/bin/env bun`)
wires the resolver to real fs, and on a hit `spawn("bun", [cli, ...argv], {stdio:"inherit"})` —
forwarding SIGINT/SIGTERM and propagating the child's exit code / re-raising its signal. On a miss it
fails with a clear "plugin not installed" message + exit 1. README explains pointer-not-copy.

**Phase 2 — plugin-side attach support** (this branch). `tmux.ts` gained `listSessionsArgs()` +
`listSessions()` (degrades to `[]` when no tmux server is running — reads `execTmux`'s `ok` flag,
never throws). `team-attach.ts` gained `--session <name>` (attach by name from anywhere, no project
needed) and, for the outside-a-project-without-`--session` case, a friendly `formatNoProjectHint`
menu (names the searched cwd, points at the two ways forward, lists running sessions) instead of a
bare "no config" error. The in/out-of-project branch distinguishes `ConfigError` (→ friendly hint)
from any other throw (rethrown). Pure functions (`formatNoProjectHint`, `listSessionsArgs`) are the
unit-test target, matching the file's existing arg-builder/decider split.

**Phase 3 — docs** (this branch). A consent-gated mention of the optional human CLI in the bootstrap
preflight (`mention, don't install` — surface only if `anthill` isn't on PATH, `never install it for
them`) and a "Optional: a human `anthill` command" section in the root README. **AGENTS.md
deliberately untouched** — agents drive the CLI through the plugin; a human's global binary isn't
agent-actionable, so telling agents about it violates `only-include-non-discoverable-information`
(HiveMind playbook). The one place it belongs — the human-in-the-loop moment of bootstrap — is where
it went.

**Phase 4 — real-artifact verification.** Installed exactly as a user would
(`bun add -g github:ichabodcole/anthill-cli`); `anthill` landed on PATH. Verified: resolves the
highest cached version (1.2.0) and delegates (`anthill info v1.2.0`); exit codes propagate (good
command → 0, unknown → 1); from outside a project it delegates to the cached CLI. The friendlier
fallback ships to real installs on the next `develop → main` release (the cache predates it) — the
fallback itself was verified directly against this branch in Phase 2.

## Finalize

- **Independent review** (`feature-dev:code-reviewer`, net diff vs `develop`): **Ready to merge:
  Yes.** No findings at confidence ≥80. Confirmed the fallback's `ConfigError` guard is exhaustive
  (`findConfigFile` only ever throws `ConfigError`), `listSessions` degrades gracefully, tests prove
  real logic not mocks, and the non-TTY/exit-code contract is preserved. One sub-threshold note (a
  redundant fs walk on the in-project path) is intentional — reusing `requireConfig` also surfaces
  malformed-config errors the first check wouldn't.
- **Quality gate:** `bun run check` green — tsc clean, biome clean, 102 tests pass.
- **Squash:** branch was already a single commit (`b8fe79d`) — no squash needed.
- **Merge:** fast-forward to `develop` (local; `develop → main` is the user's PR to cut).

## Result

The global launcher is live and installed. The plugin-side support (attach fallback + tmux helpers +
consent-gated docs) is on `develop`. The friendlier no-project fallback reaches real installs on the
next release. Roadmap #2's launcher slice is done.

## Follow-ups

- The full v0.2 brief feature 3 also imagined **lead-facing vine/board wrapper verbs** on the CLI —
  deliberately deferred as out of scope for the "light now" launcher slice; revisit if a lead wants
  terminal-driven coordination.
- Option 2 (external CLI as the source of truth) and a monorepo + npm publish remain parked — the
  pointer design makes them unnecessary for now.

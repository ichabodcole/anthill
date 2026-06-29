# Slice 1 — Walking Skeleton (build plan)

**Ref:** `docs/specs/2026-06-28-anthill-portable-team-os-design.md`
**Goal:** the full anthill loop runs end-to-end for the `layered-app` archetype in a repo that
isn't dream-flute. Build task-by-task; **after each task, report on the grapevine and park for
maestro's review before starting the next.**

## Build order

### T1 — Seed the CLI shell
- Run `bunx github:ichabodcole/seed-project-cli anthill --yes --pm bun --no-api --no-auth --no-banner --install` in the anthill repo.
- **Watch:** the repo has no `package.json` yet; the seed uses the host `package.json` name for
  root discovery. Run `bun init` first if needed (a minimal `package.json` named `anthill`).
  Note: per spec we'll *replace* that root-discovery with `config.ts` (root marker = `.team/config.json`), so don't over-invest in the package-name path.
- **Accept:** `bun scripts/anthill/cli.ts info` (and `--help`) runs and prints the dual-audience output. Report the generated tree.

### T2 — Plugin scaffolding
- `.claude-plugin/marketplace.json` + `plugin.json` (name `anthill`, the four skills declared).
- **Accept:** manifests valid JSON; structure matches a Claude Code plugin (mirror spellbook/project-docs shape).

### T3 — Config layer (`scripts/anthill/config.ts`)
- Find + parse `.team/config.json` by walking up from cwd (the root marker). Types for the §5 schema. Apply plugin defaults for `grounding`/`paths`. Default spawn set = seats with `spawn:true` in order.
- **Accept:** unit test: given a fixture config, resolves seats/channel/paths + defaults correctly; finds the file by walking up.

### T4 — Coordination facade (`scripts/anthill/coord.ts`)
- `resolveCoordCli("grapevine"|"bounty")` (highest-semver from the spellbook plugin cache) + `execCoord` (never throws). Lift/generalize from flute's `team-support.ts`.
- **Accept:** resolves the installed spellbook CLIs; clear error if spellbook missing.

### T5 — tmux helper (`scripts/anthill/tmux.ts`)
- Lift flute's `tmux.ts` ~as-is (it's already generic): session/pane create, split, tile, label, launch, kill, list, `sanitizeSessionName`, never-throw `execTmux`.
- **Accept:** the pure arg-builders unit-test (port flute's tmux tests).

### T6 — Team commands (`scripts/anthill/commands/`)
- `convene` `join` `spawn` `attach` `down` `status` `commit` `init`. Generalize flute's `team-*.ts` to read `config.ts` (no hardcoded channel/seats/paths). `init` = the deterministic template renderer (idempotent; renders new seat docs without clobbering existing).
- **Accept:** `anthill status`/`convene`/`init` run against a fixture config; `init` renders `docs/team/` correctly; ports of flute's pure-logic tests (`resolveSpawnHandles`, `resolveAttachAction`, `shouldBlockTeardown`) pass.

### T7 — Scaffold templates (`templates/`)
- `templates/docs-team/`: SOP (the 3 principles), `seams.md`, seat-doc template (locked fields), `dev/README.md` roster, `paper-cuts.md` — generalized from dream-flute, domain stripped.
- `templates/archetypes/layered-app.json`: lead + engine/spine/surface + verify (verifier `spawn:true`).
- **Accept:** `anthill init` over the layered-app archetype produces a coherent `docs/team/` tree.

### T8 — Lifecycle skills (`skills/convene|join|finalize-session`)
- Config-driven generalizations of dream-flute's three skills. `anthill:` namespace. join mints the per-session gitignored scratch.
- **Accept:** prose cold-reads clean; references resolve via config, no dream-flute specifics leak.

### T9 — `anthill:bootstrap` skill
- Preflight (spellbook/bun/tmux) → light discovery → propose layered-app seats → ratify → write `.team/config.json` → `anthill init` → gitignore line.
- **Accept:** run in a throwaway test repo, produces a valid config + scaffold.

### T10 — Proof run (Slice 1 acceptance)
- In a throwaway test repo: bootstrap → convene → spawn (tmux panes auto-join) → move a trivial card → finalize-session (curate + teardown).
- **Accept:** the loop completes end-to-end outside dream-flute.

## Coordination
- Implementer reports each task's result on the `anthill` grapevine channel and parks for review.
- maestro reviews, acks or redirects, then releases the next task.
- File-scoped commits; the implementer commits its own work (explicit pathspecs).

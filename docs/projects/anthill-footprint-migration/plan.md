# `.anthill/` Consolidation & Migration Mechanic — Implementation Plan

**Created:** 2026-06-30
**Related Proposal:** [proposal.md](./proposal.md)
**Status:** Active

**Progress:** Phase 1 ✓ (`bd8d9f0` — `.anthill/` native v2 layout) · Phase 2 ✓ (`2db4e12` —
pure migration planner, 9 tests). Phases 3–4 (`anthill migrate` CLI → `anthill:upgrade` skill)
remain.

---

## Overview

This plan turns [the proposal](./proposal.md) (v0.2 features 1 + 2) into a phased build. It
does two interlocking things: (a) **retarget anthill's consumer-repo footprint** from the
split `.team/config.json` + `docs/team/` to a single self-named `.anthill/` root, and (b)
build the **versioned migration mechanic** (`version` stamp + `anthill migrate` CLI +
`anthill:upgrade` skill) that carries existing consumers across that change — the inaugural
`v1 → v2` migration.

The codebase is already well-shaped for this. `config.ts` resolves the root by walking up
to a marker and **already carries a `version` field** (`DEFAULT_VERSION = 1`); `init`
renders into `config.teamDirPath()`, so changing the default path _is_ the consolidation —
the renderer needs no structural change. The work is therefore: a contained
constant/string retarget (Phase 1), then a new pure migration engine (Phase 2), its CLI
hands (Phase 3), and the skill brain + migration guide (Phase 4).

## Outcome & Success Criteria

**Definition of Done:**

- [ ] A fresh `anthill:bootstrap` writes `.anthill/{config.json, README.md, paper-cuts.md, dev/…}`, stamps `version: 2`, and the repo's `.gitignore` gains exactly `.anthill/scratch/`.
- [ ] The `paths` override still lets a repo keep living docs elsewhere (e.g. `docs/team/`).
- [ ] `anthill migrate` converts a v1 repo (`.team/` + `docs/team/`) to `.anthill/` v2 with **git history preserved** (`git mv`), bumps the stamp, and swaps the gitignore line; `--dry-run` makes zero changes and prints the exact plan; re-running on a v2 repo is a clean no-op.
- [ ] The migration planner is **pure and unit-tested** (default-paths, custom-paths-override, already-migrated cases); `--dry-run` output matches what a real run produces.
- [ ] `anthill:upgrade` detects repo-version vs plugin-version, finds the ordered migration, dry-runs, applies via the CLI, reconciles hand-edited docs without loss, and verifies — and passes a fresh-context cold-read.
- [ ] bootstrap/init drop a `CLAUDE.md`/`AGENTS.md` pointer to the team methodology + `.anthill/` location (closes the root-pointer backlog item's doc-location half).
- [ ] `bun run check` green throughout (typecheck + biome + tests); the suite grows to cover the new code.

**Non-Goals:**

- Global `anthill` CLI distribution (`bun add -g`) — feature 3, separate project. This plan only needs the `migrate` verb to _exist_, not be globally installed.
- Multi-surface archetype / discovery — feature 5.
- The dream-flute dogfood migration — feature 6 (consumes this).
- A fully general user-edited-doc _merge_ algorithm — `v1→v2` is a pure relocate, so MVP moves content untouched; the general strategy is an open question for later migrations.

## Approach Summary

Keep the suite green at every phase by sequencing **native-layout-first, then the rails**:

1. **Phase 1** makes `.anthill/` the native layout (constants, strings, tests, skills). After it, _new_ repos are v2; _existing_ v1 repos are temporarily without an upgrade path — which is exactly what Phases 2–4 deliver.
2. **Phase 2** builds the migration **planner** as a pure function (mirroring the established `renderTemplates`/`planGitignore` pure-core pattern) with a small registry.
3. **Phase 3** wraps it in the `anthill migrate` **CLI** (IO executor + `--dry-run` + dual-audience envelope), tested via a temp-git subprocess test like `team-commit.test.ts`.
4. **Phase 4** adds the `anthill:upgrade` **skill** (the judgment/brain) + the `migrations/v1-to-v2.md` guide, validated by a cold-read and a real throwaway-repo upgrade.

Everything reuses existing patterns: the pure/IO split (`config.ts`, `team-init.ts`), the dual-audience `emit`/`emitError` envelope (`agent-layer.ts`), citty command registration (`cli.ts`), and the subprocess-in-temp-repo test style (`team-commit.test.ts`).

## Phases

### Phase 1: Retarget the footprint to `.anthill/` (define v2)

**Goal:** `.anthill/` becomes the native layout; every command, test, and skill resolves it; the `version` stamp is written by bootstrap. New bootstraps land at v2.

**Key Changes:**

- `scripts/anthill/config.ts`:
  - `CONFIG_DIR = ".team"` → `".anthill"` (so `CONFIG_REL_PATH` becomes `.anthill/config.json`).
  - `DEFAULT_PATHS` → `{ teamDir: ".anthill", seatDir: ".anthill/dev", seams: ".anthill/dev/seams.md" }` (config + living docs now share the one root).
  - Add `export const CURRENT_VERSION = 2` — the plugin's _current_ footprint version (distinct from `DEFAULT_VERSION = 1`, which stays as the **unstamped-legacy** fallback so an old config still resolves as v1). Update the header/doc comments off `.team`/`docs/team`.
- `scripts/anthill/commands/team-init.ts`: `SCRATCH_GITIGNORE_LINE = ".team/scratch/"` → `".anthill/scratch/"`; update `meta.description`, the doc comment, and the `renderText` "Rendered docs/team scaffold" string to `.anthill`.
- Error strings + comments in `team-spawn.ts`, `team-status.ts`, `team-support.ts`, `team-join.ts`, `coord.ts`, `paths.ts` (`.team/config.json` → `.anthill/config.json`).
- Tests: update `config.test.ts` (MINIMAL_CONFIG `paths`, expected `configPath`/`teamDirPath`/`seatDocPath`, the "finds .team/config.json" case + the `could not find` regex) and `team-init.test.ts` (scratch line + any `docs/team` expectations).
- Skills (`skills/{bootstrap,convene,join,finalize-session}/SKILL.md`): `.team/` → `.anthill/`, `docs/team/` → `.anthill/`. In **bootstrap** specifically: write `"version": 2` into the emitted config, and add the **consent-gated `CLAUDE.md`/`AGENTS.md` pointer** step (team methodology + where `.anthill/` lives — prefer AGENTS.md, CLAUDE.md as redirect, idempotent).
- Optional: rename `templates/docs-team/` → `templates/team-home/` and update `defaultTemplatesDir()` — cosmetic; defer unless it reads cleanly.

**Validation:**

- [ ] `bun run check` green.
- [ ] Throwaway smoke: write a minimal `.anthill/config.json`, run `anthill init`, confirm it renders `.anthill/{README.md, paper-cuts.md, dev/{seams.md, README.md, <handle>.md}}` and the `.gitignore` gains `.anthill/scratch/`.
- [ ] A config with an explicit `paths` override still renders to the override location.

**Dependencies:** none (foundation).

---

### Phase 2: The migration engine (pure planner + registry)

**Goal:** a pure, unit-tested planner that, given a description of a repo's current tree, produces the exact `v1→v2` migration plan. No filesystem, no git — just data in, plan out.

**Key Changes:**

- New `scripts/anthill/migrate.ts`:
  - `interface MigrationOp` — a discriminated union: `{ kind: "git-mv", from, to }`, `{ kind: "gitignore", remove, add }`, `{ kind: "stamp-version", to }` (+ any config-rewrite op).
  - `interface MigrationPlan { from: number; to: number; ops: MigrationOp[]; notes: string[] }`.
  - `interface RepoScan` — the pure input: `{ version: number; hasTeamDir: boolean; hasDocsTeam: boolean; pathsExplicit: boolean; teamPaths: TeamPaths; gitignore: string | null }`.
  - `export function planV1ToV2(scan: RepoScan): MigrationPlan` — emits `git mv .team/config.json .anthill/config.json`; if living docs were at the **default** `docs/team/`, `git mv docs/team → .anthill` (README/paper-cuts/dev); if `paths` was an **explicit override**, leave docs in place and only move the config dir (record a note); swap the gitignore line; stamp version → 2. Already-v2 input → empty `ops` + a "already current" note.
  - `export const MIGRATIONS = [{ from: 1, to: 2, plan: planV1ToV2 }]` + `migrationsBetween(from, to)` (ordered, never-skip).
- New `scripts/anthill/migrate.test.ts`: cover (a) default-paths v1 repo → full relocate; (b) explicit-`paths`-override v1 repo → config-only move, docs untouched, note emitted; (c) already-v2 → no-op; (d) `migrationsBetween` ordering.

**Validation:**

- [ ] `bun test scripts/anthill/migrate.test.ts` green; planner imports no `node:fs`/git (purity check — grep the file).
- [ ] `bun run check` green.

**Dependencies:** Phase 1 (the `.anthill/` constants the plan targets).

---

### Phase 3: `anthill migrate` CLI (the IO hands)

**Goal:** the deterministic executor — scan the real tree, run the planner, `--dry-run` to preview, execute `git mv` + ref/gitignore/stamp writes. Idempotent.

**Key Changes:**

- New `scripts/anthill/commands/team-migrate.ts` (`defineAnthillCommand`, `scope: "workspace"`):
  - Scan the repo (IO) into a `RepoScan`: resolve config (via `config.ts`, tolerant of either `.team/` **or** `.anthill/` marker during the transition — see Open Questions), detect dirs, read `.gitignore`, determine `pathsExplicit`.
  - Call `planV1ToV2`; with `--dry-run`, `emit` the plan and exit (zero changes).
  - Execute: `git mv` via `Bun.$` (fall back to plain `mv` for untracked trees), apply gitignore swap (reuse `planGitignore` semantics), write the version stamp into the moved `config.json`.
  - Route every guard through `emit`/`emitError` (dual-audience envelope — the lesson from `team-commit`); a clean `{ok,data}` on success, `{ok:false,error}` on failure.
  - Register `teamMigrateCommand` in `scripts/anthill/cli.ts`.
- New `scripts/anthill/commands/team-migrate.test.ts`: subprocess-in-temp-git-repo (pattern from `team-commit.test.ts`) — seed a v1 tree (`.team/config.json` + `docs/team/…`, both `git add`ed), run `migrate`, assert `.anthill/` exists with history (`git log --follow` finds the old path), `config.version === 2`, gitignore swapped; assert `--dry-run` leaves the tree byte-identical; assert re-run on v2 is a no-op.

**Validation:**

- [ ] `bun run check` green; the new subprocess test passes.
- [ ] Manual smoke: in a throwaway git repo with a hand-made v1 footprint, `anthill migrate --dry-run` then `anthill migrate` produce the `.anthill/` layout, `git log --follow .anthill/config.json` shows pre-move history.

**Dependencies:** Phase 2.

---

### Phase 4: `anthill:upgrade` skill + migration guide (the brain)

**Goal:** the consumer-facing ritual that detects, sequences, applies, reconciles, and verifies — the judgment the CLI can't encode.

**Key Changes:**

- New `skills/upgrade/SKILL.md`: detect repo version (read the config's `version`, unstamped ⇒ 1) vs the plugin's `CURRENT_VERSION` → if behind, find the ordered `migrations/vN-to-vM` chain → **dry-run** via `anthill migrate --dry-run` and show the human the plan → apply via `anthill migrate` → **reconcile** any hand-edited living docs (for v1→v2 this is trivial — `git mv` preserves content — but the skill states the general discipline: never clobber, surface conflicts) → **verify** (`anthill status` / a re-render `anthill init` is a clean no-op) → report. Consent-gated; idempotent.
- New `skills/upgrade/migrations/v1-to-v2.md`: the agent-readable guide for this transition (what moved, what the `paths` override means, the verification checklist) — mirrors `project-docs:update-project-docs`'s `migrations/` convention.
- `skills/bootstrap/SKILL.md`: in preflight, if an existing repo is detected on an older footprint version, point at `anthill:upgrade` rather than re-bootstrapping.

**Validation:**

- [ ] Fresh-context **cold-read** of `skills/upgrade/SKILL.md` (the T8 method) — a blank-slate agent can execute it end to end with no missing step.
- [ ] Real upgrade: hand-build a v1 throwaway repo, run the `anthill:upgrade` flow, confirm `.anthill/` v2 with history + docs intact + a green verify.
- [ ] `bun run check` green.

**Dependencies:** Phase 3.

## Key Risks & Mitigations

- **Stranding the existing external consumer (media-buffet) between Phase 1 and Phase 4.** → Land the phases in one branch/release; the migration mechanic ships _with_ the layout change (the core design). Until merged, media-buffet stays on v1.
- **A missed `.team`/`docs/team` reference** (≈8 files + 4 skills + tests). → The grep audit in this plan is the checklist; `bun run check` + the smoke render catch resolver regressions.
- **`git mv` on an untracked or non-git tree.** → Detect a git repo; fall back to plain `mv` + warn; the planner is git-agnostic (it only emits ops), the executor handles both.
- **Reconciling hand-edited living docs.** → Out of scope for v1→v2 (pure relocate preserves content); the skill documents the general non-clobber discipline; the general merge algorithm is an Open Question for later migrations.
- **`paths` override ambiguity** — a v1 repo that explicitly set `paths` shouldn't have its docs yanked into `.anthill/`. → The planner branches on `pathsExplicit`: override ⇒ move only the config dir, leave docs; default ⇒ full relocate. Covered by a dedicated planner test.

## Testing & Validation Strategy

- **Pure units** (`migrate.test.ts`): the planner against fixtures — the bulk of correctness lives here, fast and filesystem-free (same economics as the existing 76-test suite).
- **Subprocess integration** (`team-migrate.test.ts`): one real `git mv` round-trip in a temp repo proves the IO executor + history preservation + `--dry-run` no-op + idempotency.
- **Resolver regression**: the updated `config.test.ts`/`team-init.test.ts` prove the `.anthill/` retarget and the `paths` override.
- **Skill executability**: a cold-read of `anthill:upgrade` (prose can't be unit-tested; the fresh-context read is the gate).
- **End-to-end smoke**: a hand-built v1 throwaway repo upgraded via the skill — the real acceptance.

## Assumptions & Constraints

**Assumptions:** consumers run inside a git repo (so `git mv` preserves history); anthill itself is not yet self-hosted, so there is no self-migration in scope; `release-please` will own the plugin version that the skill compares against (no human setup needed for this plan).

**Constraints:** keep `bun run check` green at every phase; file-scoped commits through the husky gate; reuse the pure/IO + dual-audience patterns rather than inventing new ones; the `paths` override must keep working (dream-flute depends on it in feature 6).

## Open Questions

- Where does the plugin's `CURRENT_VERSION` live as the single source of truth — `config.ts`, a small `version.ts`, or read from `plugin.json`? (Lean: a `config.ts` constant for now; revisit when feature 3's global bin needs version-sync.)
- During the transition, should `findConfigFile` accept **either** `.team/config.json` or `.anthill/config.json` (so `migrate` can run on a v1 repo whose marker is still `.team/`)? Likely yes — a small dual-marker lookup used only by the scan path. Resolve in Phase 3.
- Should the version stamp also surface in a human-visible spot (as project-docs stamps `docs/README.md` frontmatter), or is `config.json` enough?
- The general user-edited-doc reconciliation algorithm (brief OQ #2) — define when a _content-changing_ migration first needs it; v1→v2 doesn't.

---

**Related Documents:**

- [Proposal](./proposal.md)
- [v0.2 brief](../../briefs/2026-06-30-anthill-v0.2-next-release.md) (features 1 + 2)
- [Design-of-record](../../architecture/2026-06-28-anthill-portable-team-os-design.md) (config schema §5, brain/hands split D5)
- [First external bootstrap field report](../../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)
- Blueprint: `project-docs:update-project-docs` (version stamp + ordered `migrations/`)
- Couples here: [root CLAUDE/AGENTS pointer](../../backlog/2026-06-30-bootstrap-root-agent-context-pointer.md)

---

## Implementation Notes

Drafted from the proposal + a codebase audit (2026-06-30). Confirmed during the audit:
`config.ts` already carries `version`/`DEFAULT_VERSION = 1` (the stamp foundation exists),
`init` renders into `config.teamDirPath()` (so retargeting the default path _is_ the
consolidation — no renderer rewrite), and the footprint strings live in ≈8 code files + 4
skills + 2 test files. The migration engine has no existing analogue in the repo and is the
genuinely new surface; everything else is a contained retarget over well-factored code.

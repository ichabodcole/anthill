# `.anthill/` Consolidation & the Versioned Migration Mechanic

**Status:** Draft
**Created:** 2026-06-30
**Author:** Claude Code (anthill dev agent)

---

## Overview

Establish a single, self-named `.anthill/` root for everything anthill writes into a
consumer repo — config, living docs, and scratch — replacing today's split between
`.team/config.json` (config marker) and `docs/team/` (living docs). Crucially, ship that
change **as the inaugural `v1 → v2` migration**, building the versioned upgrade mechanic
(a `version` stamp in config + an `anthill migrate` CLI + an `anthill:upgrade` skill) that
makes this — and every future breaking release — safely consumable.

This is v0.2 features **1 (consolidation)** and **2 (upgrade mechanic)** taken together,
because the brief couples them: feature 1 _is_ the first thing the upgrade mechanic runs,
and the mechanic is what lets feature 1 ship without stranding existing consumers. It is
the foundation the rest of v0.2 (global CLI, dream-flute dogfood) builds on.

## Problem Statement

**Two problems, one release:**

1. **The footprint is split and not fully portable.** anthill writes config to
   `.team/config.json` (a marker dotdir) and living docs to `docs/team/` (which assumes a
   `docs/` convention that isn't universal across the any-language repos anthill targets).
   That means two locations to add/remove, a gitignore spanning two spots, and a `docs/`
   assumption that doesn't hold everywhere. A single self-named root is identical in every
   repo.

2. **There is no upgrade path.** When a breaking release changes the consumer-repo files
   anthill created, consumers have no guided way to migrate. The _first_ such breaking
   change is this very consolidation — so it cannot ship responsibly without the mechanic
   that migrates it.

**Who's affected:** every anthill consumer. There is already one external consumer
(media-buffet), dream-flute is queued to migrate onto anthill (feature 6), and anthill
will eventually self-host. The cost of a path-less breaking change compounds with each
consumer added before the mechanic exists.

## Proposed Solution

Two interlocking parts, following anthill's **brain/hands split** (design D5 — the skill
composes judgment, the CLI executes mechanically).

### Part A — `.anthill/` consolidation (the footprint)

- **Layout:** `.anthill/{config.json, README.md (SOP), paper-cuts.md, dev/{seams.md, README.md, <handle>.md}, scratch/}` — `scratch/` gitignored.
- One self-named root, identical in every repo; gitignore shrinks to the single line
  `.anthill/scratch/`. Committed dotfolders are well-precedented (`.changeset/`,
  `.github/`).
- **Keep the `paths` config override** as an escape hatch — a repo that prefers
  `docs/team/` (e.g. dream-flute, by habit) points there.
- bootstrap/init drop a `CLAUDE.md` / `AGENTS.md` **pointer** for human discoverability
  (the doc-location half of the root-pointer backlog item).

### Part B — versioned migration mechanic (the upgrade rails)

- **Stamp a `version` field in `.anthill/config.json`** — foundational; this is what
  _defines_ v1 (and v2). Everything else keys off it.
- **`anthill migrate` = the deterministic hands:** pure, unit-tested migration functions
  (`git mv`, rewrite internal refs, bump the version stamp, fix gitignore), with
  `--dry-run` to preview the exact plan before touching anything.
- **`anthill:upgrade` = the brain (skill):** detect repo-version vs plugin-version → find
  the ordered, never-skip `migrations/vN-to-vM` chain → dry-run → apply via the CLI →
  handle the **judgment** steps the CLI can't (above all, reconciling _user-edited_ living
  docs without clobbering) → verify.
- **Modeled on `project-docs:update-project-docs`:** a version stamp in a consumer file +
  ordered migrations + a release-please-kept version. Both halves are required — a
  skill-only mechanic is non-deterministic; a CLI-only mechanic can't merge hand-edited
  docs.

### How a user experiences it

- **Existing v1 consumer:** runs (or is offered) `anthill:upgrade`. It detects the v1
  config, finds the `v1→v2` migration, dry-runs (showing the `git mv` plan), applies via
  `anthill migrate`, reconciles any hand-edited living docs, and verifies. `.team/` +
  `docs/team/` become `.anthill/`, git history preserved.
- **New consumer:** bootstrap writes `.anthill/` at v2 from the start; gitignore is the
  single `.anthill/scratch/` line.

## Scope

**In Scope (MVP):**

- The `.anthill/` layout and the `version` field in `config.json` (defining v1 and v2).
- Every command/skill that currently resolves `.team/` / `docs/team/` updated to resolve
  `.anthill/`, with the `paths` override still honored.
- `anthill migrate` CLI: an ordered migration registry with the `v1→v2` relocate as the
  first entry — pure planner + IO executor, unit-tested, `--dry-run`.
- `anthill:upgrade` skill: detect → find → dry-run → apply → reconcile → verify.
- A `migrations/v1-to-v2` guide (the agent-executable migration doc).
- bootstrap/init `CLAUDE.md`/`AGENTS.md` pointer (the doc-location half of the root-pointer
  backlog item).

**Out of Scope:**

- Global `anthill` CLI distribution (feature 3) — separate project; this work only needs
  the verbs to exist, not to be globally installed.
- Multi-surface archetype + discovery (feature 5).
- The dream-flute dogfood migration (feature 6) — _consumes_ this.
- A fully general user-edited-doc reconciliation algorithm — the `v1→v2` migration is a
  pure relocate (`git mv` leaves content untouched), so the MVP doesn't need a content
  merge; the general strategy is an open question for the plan / a later migration.

**Future Considerations:**

- Each future breaking release adds a `migrations/vN-to-vM`.
- The global CLI (feature 3) later exposes `anthill migrate` / `upgrade` to humans.

## Technical Approach

- **Reuse the existing root-resolution.** `config.ts` already walks up from cwd to the
  marker — exactly the mechanism a relocate needs. Change the marker/paths resolution from
  `.team/config.json` to `.anthill/config.json` and keep the override; this is a contained
  change to a tested module.
- **Retarget the renderer.** `team-init.ts` (the `renderTemplates` renderer) defaults its
  output to `.anthill/dev/` instead of `docs/team/dev/`.
- **Pure/IO split for the migration**, matching the Slice-1 kit's discipline
  (`renderTemplates`/`planGitignore`, `resolveConfig`/`loadConfig`): a pure migration
  _planner_ (produces the `git mv` + ref-rewrite + stamp-bump plan from the current tree)
  and an IO _executor_ — the planner unit-tests against fixtures with no filesystem, and
  `--dry-run` prints the planner's output without executing.
- **History-preserving moves:** `git mv` for the relocate so blame/history survive.
- **`anthill:upgrade` sequences and judges:** the skill detects versions, orders
  migrations, and owns the doc-reconciliation judgment the CLI can't make.
- **Key dependencies:** none external — self-contained in the anthill repo; the same
  dual-audience envelope and command structure already in place.

## Impact & Risks

**Benefits:** a portable single-root footprint; the upgrade rails _every_ later breaking
release depends on; config versioning defined (which unblocks features 2, 3, and 6); and a
dogfood-ready migration for dream-flute (feature 6).

**Risks:**

- **Breaking change for the existing external consumer (media-buffet).** Mitigated by the
  core design — the migration mechanic ships in the _same_ release as the change it
  migrates, with `--dry-run` to preview.
- **Reconciling user-edited living docs is genuinely delicate** (brief open question).
  Mitigated for the MVP: `v1→v2` is a pure relocate (`git mv` preserves content
  untouched), so this specific migration needs no content merge — but the mechanic's
  general design should anticipate it (deferred to the plan / later migrations).
- **A missed path reference** (every command/skill touches the old locations). Mitigated
  by a grep audit, the existing test suite, and a real bootstrap+convene verification.

**Complexity:** **Medium** — mechanically well-scoped (`git mv` + ref rewrites + tested
pure functions on an existing, well-factored codebase), but the migration-mechanic framing
and the doc-reconciliation question add real design surface beyond a simple rename.

## Open Questions

- Exact reconciliation algorithm for user-edited living docs during a migration (brief OQ
  #2). Moot for `v1→v2` (pure relocate), but the mechanic's general shape should anticipate
  it — resolve in the plan.
- Does the `version` stamp live only in `config.json`, or also surface in a
  consumer-visible spot (the way project-docs stamps `docs/README.md`)?
- Should `anthill migrate` be idempotent / re-runnable (detect an already-migrated tree and
  no-op)?
- The plugin-skill ↔ future global-bin version-sync seam (brief OQ #3, touches feature 3) —
  note the boundary even though distribution is out of scope here.

## Success Criteria

- A v1 consumer repo upgrades to `.anthill/` v2 via `anthill:upgrade` with git history
  preserved and zero loss of hand-edited doc content, verified by a real bootstrap+convene.
- A fresh bootstrap writes `.anthill/` at v2; gitignore is the single `.anthill/scratch/`
  line.
- The `paths` override still lets a repo keep its living docs at `docs/team/`.
- The pure migration functions are unit-tested; `--dry-run` output matches the applied
  result.
- All commands/skills resolve the new footprint; the suite stays green.

---

**Related Documents:**

- [v0.2 brief](../../briefs/2026-06-30-anthill-v0.2-next-release.md) — features 1 + 2 (the
  locked decisions this proposal pulls in as constraints)
- [Design-of-record](../../architecture/2026-06-28-anthill-portable-team-os-design.md) —
  the config schema and the brain/hands split (D5)
- [First external bootstrap field report](../../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)
- Blueprint: `project-docs:update-project-docs` (version stamp + ordered migrations)
- Couples here: [root CLAUDE/AGENTS pointer](../../backlog/2026-06-30-bootstrap-root-agent-context-pointer.md),
  [seat-doc formatter clash](../../backlog/2026-06-30-seat-docs-host-formatter-clash.md)

---

## Notes

Drafted by the anthill dev agent from the v0.2 brief's locked decisions (features 1 + 2),
per the brief's "promote each feature to a `docs/projects/` folder, pulling the locked
decisions in as constraints." Decisions marked **locked** in the brief are treated as
settled constraints here, not re-litigated; the Open Questions are the genuinely
unresolved design surface for the plan stage.

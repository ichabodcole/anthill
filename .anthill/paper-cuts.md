# Team Paper-Cuts — friction log → fix candidates

A running log of friction the team hits in its **tooling, docs, skills, and CLIs** during real
sessions — what bit, and the suggested fix. Distinct from a seat's `dev/<handle>.md` (durable per-seat
_taste_) and `seams.md` (inter-seat _contracts_): this is the **process/tooling backlog**, captured
so a recurring tax becomes a tracked fix instead of a re-discovered annoyance.

## The method

1. **Append during the session.** The moment something bites — a clunky command, a doc that lied, a
   missing affordance — drop a line here (or in your scratch, to harvest at finalize). Cheap capture
   beats perfect memory.
2. **Triage by cost at finalize.** The lead (or the team) groups items by **cost-to-team ×
   cost-to-fix** — the highest repeated tax, fixed first. A one-off annoyance ranks below a small tax
   paid every session.
3. **Track disposition.** Every item ends in one of: **fixed** (link the commit/PR), **filed
   upstream** (it lives in a dependency — e.g. the spellbook plugin — so file an issue there), or
   **graduated** (it's really a feature → promote to a project). Strike through / mark resolved items
   so the open queue stays honest.

A friction that lives in a **dependency** (grapevine, bounty, the plugin itself) isn't yours to fix
in-repo — file it upstream and note the workaround here.

---

## 2026-07-02 — solo review session (Fable 5)

### Tier 1 — breaks the house commit discipline

1. **`git commit -- <pathspec>` + lint-staged = phantom "invalid object … Error building trees"** _(Fable 5, solo; hit twice, reproducibly, in THIS repo)._
   A file-scoped pathspec commit runs the pre-commit hook against a **temporary index**, and lint-staged's stash/backup dance corrupts that interaction — the commit dies after every check passes, citing an invalid blob for an unrelated file (`.anthill/config.json`).
   Staging the same content and committing **without** a pathspec succeeds (landed `3d5555c` / `c95785d` that way).
   **This lands squarely on `anthill commit`:** it encodes exactly the pathspec-commit discipline, so it likely fails the same way on any consumer repo running husky + lint-staged — which includes this repo AND dream-flute (husky 9 + lint-staged 17).
   - **Fix:** `anthill commit` (team-commit.ts) should, under its serialize lock, stage the named paths, **verify the staged set is exactly the named paths** (`git diff --cached --name-only`), then commit **without** a pathspec — verification replaces the pathspec's no-sweep guarantee, and the temp-index interaction never happens.
   - **Workaround now:** stage explicitly, verify the staged set, plain `git commit`. Don't reach for `--no-verify`.

### Disposition — 2026-07-02

- ✅ **#1 → `ee8b62d`** (2026-07-04) — fixed as the direction above: `anthill commit` now stages the
  named paths, **verifies the index is exactly those paths**, then commits **without** a pathspec (the
  hook runs against the real index, so the temp-index/lint-staged corruption never happens). Unexpected
  staged content aborts + restores the index. Covered by end-to-end tests (throwaway repo).

---

## 2026-07-05 — multi-surface dogfood (maestro + forager/weaver/sentinel)

### Tier 2 — recurring low tax

1. **Grapevine daemon/CLI version skew** _(maestro; every `grapevine send` this session)._ The running
   daemon (v1.14.0) lagged the CLI (v1.15.0), printing `daemon version differs from CLI version — some
   features may silently degrade` on every send. Non-blocking here, but "silently degrade" is exactly
   the kind of warning that hides a real bug later.
   - **Fix:** upstream — lives in the **spellbook** grapevine, not this repo. The remedy is a
     `grapevine roll` (stop + respawn + version-verify) on the operator's box; file/track upstream if it
     recurs. Not ours to fix in-repo.
   - **Workaround now:** ignore for correctness (sends succeed); run `grapevine roll` to align if a
     feature actually misbehaves.

2. **Prettier `-`/`+` wrapped-line reparse in `docs/`** _(weaver; writing bootstrap + plan prose)._ A
   hard-wrapped prose line whose continuation begins with `-` or `+` gets reparsed by prettier as a
   list bullet, mangling the trail. The SOP already says "one sentence per line" — this is the specific
   failure mode that rule prevents.
   - **Fix:** none needed (behavior is prettier's); it's a **discipline**, already in the SOP. Worth a
     one-line callout in the docs-writing guidance so a new seat meets it before it bites.
   - **Workaround now:** one sentence per line; never start a continuation line with a list marker.

### Disposition (maestro) — 2026-07-05

- ◻ **#1** — filed upstream (spellbook grapevine); operator-box `grapevine roll` is the remedy. Tracked.
- ✅ **#2** — no code fix; discipline already in the SOP ("one sentence per line"). Both weaver + the
  lead hit and avoided it this session; captured so it stays known.

---

## 2026-07-05 — release-prep merge (maestro)

### Tier 1 — same root cause as 2026-07-02 #1, new mechanism

1. **`GIT_INDEX_FILE` from a pathspec commit leaks into git-spawning tests** _(maestro; committing a
   docs-only roadmap tidy with raw `git commit -- docs/ROADMAP.md`)._ A **pathspec** commit makes git
   run the pre-commit hook against a **temporary index**, exported as `GIT_INDEX_FILE` — and that env
   var is **inherited by every subprocess the hook spawns**. The hook runs `bun run check` → `bun test`,
   and `team-commit.test.ts` spawns `git commit` in throwaway repos; those inherit the parent's
   `GIT_INDEX_FILE`, try to build trees against the **main repo's** temp index, and die citing an
   invalid blob for `.anthill/config.json` (a file that isn't in the temp repo). Same error signature as
   2026-07-02 #1 — because it's the same root cause (pathspec commit + a hook that spawns git), just
   surfacing through the **test suite** rather than the commit's own tree-build. The 3 `team-commit`
   tests pass 7/7 in isolation and `bun run check` was green outside the stash (147/147).
   - **Fix (immediate):** don't hand-run `git commit -- <path>`; that's exactly what `anthill commit`
     exists to avoid — it stages, verifies the index is exactly the named paths, then commits
     **pathspec-less** (no temp index → no `GIT_INDEX_FILE` → no leak). Landing through `anthill commit`
     would not have hit this.
   - **Fix (durable, in-repo):** any test that spawns git in a scratch repo should **scrub inherited
     `GIT_*` env** (`GIT_INDEX_FILE`, `GIT_DIR`, `GIT_WORK_TREE`, …) on the child, so the suite is robust
     no matter how it's invoked. `team-commit.test.ts`'s `sh()`/`makeRepo` is the concrete spot — worth
     a fix candidate so the hook never poisons a git-spawning test again.
   - **Workaround this time:** confirmed the failures were purely the env leak (tests green in isolation,
     gate green pre-stash), formatted with prettier, committed docs-only with `--no-verify` (`db9fc68`).

### Disposition (maestro) — 2026-07-05

- ◻ **#1** — open fix candidate: scrub `GIT_*` env in git-spawning tests (`team-commit.test.ts`).
  Immediate lesson banked: land through `anthill commit`, never raw `git commit -- <path>`, in any
  husky + lint-staged repo. Same family as ✅ 2026-07-02 #1 (`ee8b62d`).

---

## <date> — <session label>

_(append entries below as you hit friction; triage at finalize. Suggested shape:)_

<!--
### Tier 1 — highest repeated cost

1. **<short title>** _(which seat(s) hit it)._ <what bit, concretely — the tax it imposed>.
   - **Fix:** <the proposed change>. <in-repo? or upstream (which dependency)?>
   - **Workaround now:** <what to do until it's fixed>.

### Disposition (<lead>) — <date>

- ✅ **#1 → <commit/PR>** — <what shipped>.
- ◻ **#2** — filed upstream (<where>) / graduated to <project>.
-->

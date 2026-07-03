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

- ◻ **#1** — open; fix direction noted above. Promote to backlog if not picked up directly.

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

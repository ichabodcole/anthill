# `anthill commit` correctness batch — four field-reported defects at the land bottleneck

**Added:** 2026-07-27 · **Status:** ready to build (no design needed) · **Seat:** forager (single
surface: `plugin/scripts/anthill/commands/team-commit.ts`)

Four independent defects in the serialized land wrapper, all filed from live team sessions in
July. None needs a design pass — each has a named repro and a named fix. They are grouped because
they are the same file, the same seat, and the same test surface; they are **not** one change.

> **Folds into [`anthill-commit-hardening`](../projects/anthill-commit-hardening/plan.md)**, which
> already plans a protected-trunk guard (move 1) and the foreign-red diagnostic (move 2). These are
> moves 3–6. The plan should absorb them before it is picked up — see its Intake section.

---

## 1. Stage-before-verify leaves a seat silently holding the team's index ([#55](https://github.com/ichabodcole/anthill/issues/55) part 1) — **the sharpest one**

`team-commit.ts` runs `git add -- <paths>` **first**, then the pre-commit gate. When the gate fails
— typically on _another_ seat's transient red — the `git add` is **not rolled back**. Your paths
stay staged. Every other seat's `anthill commit` then correctly refuses ("staged content beyond my
paths"), so you have become the index-holder for the entire team **without knowing it**.

The failure that made you the blocker is the same event that gave you no signal you are now
blocking. Hit by three seats _and_ the lead in one session; caught the second time only because one
seat had independently developed a habit of running `git diff --cached` after every bounce.

**Fix:** unstage-on-failure, or verify-then-add — a bounced commit must leave the index as it found
it. Prefer restoring the _prior_ index state over a blanket `git reset`, since a seat may have had
deliberate staged content before the attempt.

## 2. Cannot stage deletions ([#48](https://github.com/ichabodcole/anthill/issues/48))

The `git add -- <paths>` step dies on `git rm`'d paths (`pathspec did not match`). A seat's chapter
containing file removals had to bypass to a direct `git commit`, defeating the serialization.

**Fix:** `git add -A -- <paths>` (or equivalent deletion tolerance).

## 3. Dies on git-mv rename pairs ([#51](https://github.com/ichabodcole/anthill/issues/51))

Repro: `git mv a.md _archive/a.md`, then `anthill commit -m msg -- a.md _archive/a.md` throws,
because the old path no longer exists on disk. Fell back to plain `git commit -- <paths>`.

**Fix:** handle a rename pair the way git does. Likely the same `-A` fix as #2 — **verify whether
one change closes both** before writing two.

_This one bites this repo directly: archiving a project is exactly a `git mv` pair._

## 4. No pre-flight warning before hitting the shared gate ([#50](https://github.com/ichabodcole/anthill/issues/50))

File-scoping bounds the **commit**, not the **gate**. One unformatted staged `.md` or one red
staged test from any seat deadlocks every seat's land. Reported as biting multiple seats twice in
one session.

**Fix:** pre-flight WARN when a staged file is unformatted or a staged test is red, naming the
offending path — so the seat fixes it before hitting the shared gate rather than discovering the
deadlock at commit time.

_Note the overlap with the planned **foreign-red diagnostic** (move 2), which runs on the
**failure** path. This one runs on the **pre-flight** path. Check whether they should share a
helper — or whether move 2 alone is enough and this is redundant._

---

## Acceptance Criteria

- [ ] A failed `anthill commit` leaves the index byte-identical to its pre-attempt state (test:
      stage nothing, force a gate failure, assert `git diff --cached` is empty).
- [ ] A commit whose pathspec contains deleted paths succeeds.
- [ ] A commit whose pathspec contains a `git mv` rename pair succeeds.
- [ ] Committing with an unformatted or red staged file emits a pre-flight warning naming the path.
- [ ] Each fix carries a test in `team-commit.test.ts`; `bun run check` green.

## References

- `plugin/scripts/anthill/commands/team-commit.ts` — the single surface for all four.
- `plugin/scripts/anthill/commands/team-commit.test.ts` — existing pure-helper + envelope test style.
- Plan to absorb these: [`docs/projects/anthill-commit-hardening/plan.md`](../projects/anthill-commit-hardening/plan.md).
- Design context (why the whole-tree gate bites at all):
  [`shared-tree-gate-tension`](../projects/shared-tree-gate-tension/proposal.md) and the
  [session-branch-strategy proposal](../projects/session-branch-strategy/proposal.md) — **#1 and #4
  are mitigations; the structural fix lives there.**
- Issues: [#55](https://github.com/ichabodcole/anthill/issues/55) ·
  [#48](https://github.com/ichabodcole/anthill/issues/48) ·
  [#51](https://github.com/ichabodcole/anthill/issues/51) ·
  [#50](https://github.com/ichabodcole/anthill/issues/50)

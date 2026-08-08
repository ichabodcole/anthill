# The squash-merge decision predates the evidence against it, and nothing re-opened it

**Status:** Backlog — **needs a ruling, not a fix.** Convene-level; same class as 94·main
**Found:** 2026-08-07, by a `cascade-check` pass on `d2b5989` (the pass falsified the commit that triggered it)
**Verified:** 2026-08-07 against `develop` @ `3d73eaf`

---

## The two halves, and they were never put side by side

**2026-07-27 — the decision.**
[`session-branch-strategy/proposal.md:29`](../projects/session-branch-strategy/proposal.md) settles
"consolidate" as **squash-merge into the base** — a merge strategy, explicitly _not_ history
rewriting. It rejects `consolidate-long-branch` by name: that ritual needs **contiguous** chapters,
and a convened session interleaves seats by construction. Status is _Draft — design resolved, ready
for a plan_, and it is still live in ROADMAP Batch 3.

**2026-08-07 — the evidence.**
[The #94 triage](../reports/2026-08-07-feedback-triage-70-73-94.md) measured what squashing costs a
project of exactly this shape: **60 commits, 4 seats' trailers, 10 commit shas cited by name inside
living docs.** Squashing destroys the references and the attribution together. Its conclusion —
_"for a single-author project squashing is right; **no plugin can know which it is looking at**"_ —
is the adapts-not-dictates split, and it routed 94·main to **DESIGN, needs a convene**.

**anthill is the shape the second half describes.** Six seats, and 294 unique short-sha citations
across `docs/` and `.anthill/` (`ROADMAP.md` alone carries 38).

## Why this is not just "go update the proposal"

The July decision is not obviously wrong. A squash-merge of a **feature** branch collapses that
branch's commits on the way into `develop` — the seat trailers it costs are the ones inside the
merged branch, and the sha citations at risk are the ones pinned to commits inside it. Whether that
is an acceptable trade depends on facts nobody has stated in one place:

- ◻ **How many cited shas actually fall inside feature branches** vs. commits made directly on
  `develop`? Docs-only work commits straight to `develop` by policy, so an unknown share of the 294
  is never at risk. **Nobody has counted, and the whole trade turns on the number.**
- ◻ **Is per-seat attribution wanted at `develop` granularity, or is per-feature enough?** The trailer
  exists because git records Cole as author of every seat's commit (`.anthill/README.md:197`). A
  squash keeps _a_ trailer; it cannot keep six.
- ◻ **Does the answer differ for anthill (upstream, self-hosting) vs. what we recommend to consuming
  projects?** The `branch{}` block is per-project config precisely so it can — but a default still
  has to be chosen, and `unset ⇒ off` is itself a choice.

## What is true right now

Nothing is built. `branch` appears nowhere in `config.ts` or `.anthill/config.json`, and
`finalize-session/SKILL.md` mentions no squash. Current practice is ordinary merges — verified:
merges into `main` are real merge commits (#84, #85, `4699406`), and 78 seat trailers survive in the
last 100 commit bodies on `main`.

`AGENTS.md` now records that practice with an as-of and **names this as open** rather than resolving
it (`3d73eaf`). That is a holding position, not an answer — it exists so the next agent does not
re-derive a ruling from `git log` the way this one did.

## The cheap first move

**Count the cited shas that fall inside merged feature branches.** It is one scripted pass over the
294 citations against `git log --first-parent`, it is the only genuinely unknown input, and it
converts a design argument into an arithmetic one. Do that before convening on it.

---

_Related: [`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) ·
[#94 triage](../reports/2026-08-07-feedback-triage-70-73-94.md) · ROADMAP Batch 3_

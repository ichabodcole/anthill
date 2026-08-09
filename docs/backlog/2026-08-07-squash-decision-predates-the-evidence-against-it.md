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

## ✅ RUN 2026-08-08 (session 13, maestro) — and the answer is not close

**Measured at `03c4547`, on `develop`'s history.**

| cited sha lands…                     | count | share   |
| ------------------------------------ | ----- | ------- |
| **inside a merged feature branch**   | 242   | **92%** |
| on `develop`'s first-parent mainline | 17    | 6%      |
| not reachable from `develop`         | 5     | 2%      |
| **total real commit shas cited**     | 264   |         |

Context for the ratio: `develop` reaches **709** commits, of which only **98** are on the
first-parent mainline. Citations concentrate in branch commits because that is where the work is —
so the exposure is not an accident of citation style, it is structural.

**Method, stated so it can be re-run or refused:** all `[0-9a-f]{7,40}` tokens in `docs/**/*.md` and
`.anthill/**/*.md`, filtered to real objects with `git cat-file -e <h>^{commit}` (403 candidates →
264 commits), then classified by membership in `git rev-list --first-parent develop`, with
`merge-base --is-ancestor` separating unreachable from in-branch.

**⚠ My total is 264, not the 294 this card asserts.** I have **not** falsified the 294 — I measured a
narrower domain (`.md` only, two directories) and the earlier figure's method is unstated. **Read
the SHARE, not the total**: the ratio is what the decision turns on, and it is robust to the
denominator.

**What would have falsified this:** an in-branch share low enough to make squashing cheap — say under
a third — which would have left `session-branch-strategy`'s squash-merge decision standing. It could
have come out that way; the repo could have cited mostly mainline and merge commits. **The control
fires in both directions: 17 shas DID classify as mainline, so a broken matcher would have reported
0 there rather than 242.**

**What this does NOT settle, and it is the lead's to say so:** whether the citations that break are
ones anyone will ever follow. 92% is the exposure, not the harm — a sha nobody re-reads costs nothing
when it rots. That distinction is a ruling for Cole, not an arithmetic result, and this measurement
deliberately stops short of it.

---

_Related: [`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) ·
[#94 triage](../reports/2026-08-07-feedback-triage-70-73-94.md) · ROADMAP Batch 3_

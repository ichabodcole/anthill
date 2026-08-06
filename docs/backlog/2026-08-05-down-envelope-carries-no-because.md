# `anthill down`'s envelope carries no `because`, so gate 2c is unsatisfiable at the command boundary

**Status:** Backlog — **real, verified at source, deliberately not scoped to a session**
**Found:** 2026-08-05, session 12 · **By:** steward, verified against `commands/team-down.ts`
**Placed by:** maestro at session 12's finalize, under Cole's rule that nothing deferred stays unplaced

---

## The finding

`DownData` is `{session, tornDown, present, presence}`. **There is no `because` field anywhere in the
file.** `presence` carries the three-state; the branch-stamped reason that exists inside
`seatPresence` never reaches the command's output.

**So gate 2c — which asks for _"state AND because"_ — cannot be satisfied at the command boundary by
anyone.** The two-level structure the lead described at session 12's `#688` is therefore **forced,
not a preference**: `sentinel`'s L1 unit-level cells are the only place `because` is observable.

## Why this is NOT a defect, and why it still needs a home

**Nothing is broken.** `down` behaves correctly; the guard works; the pane-kill is reproduced across
seven live cells. **What is missing is a diagnostic in the envelope**, and the honest framing is a
**stated limit** rather than a bug.

It is written down because the alternative is worse: a future reader finds gate 2c, tries to satisfy
it from the command output, and either concludes the guard is broken or — worse — **invents a reading
of `presence` that stands in for `because`.** `presence` collapses several branches into one word;
that is exactly the `null`-vs-`0` collapse Contract 6(c) exists to forbid, arriving one surface out.

## What would close it

Either:

1. **Surface the branch-stamped `because` in `DownData`** — it already exists inside `seatPresence`;
   this is plumbing, not design. Then gate 2c is satisfiable at the command boundary and L1/L2 stop
   being _required as a pair_ for that specific question.
2. **Amend gate 2c to say the command boundary cannot answer it**, and name L1 as the only source.
   Cheaper, and arguably more honest — **the ceiling is real either way.**

**Do not do both, and do not do (1) while leaving 2c's wording as-is** — a gate satisfiable two ways
is one nobody can fail.

## Why it is backlog and not session 13

**Nothing is blocked on it and nobody has been bitten.** Every consumer of `down` today reads
`presence`, which is correct for what they use it for. It becomes worth doing the moment someone
tries to build a policy on _why_ teardown was refused — and that has not happened yet.

**Related, and deliberately not folded in:** `seams.md` Contract 6(f)'s `followerAlive` is advisory
and never contradicts `state`; the same "diagnostic rides beside the verdict" shape. If (1) is
chosen, do it in that idiom rather than inventing a new one.

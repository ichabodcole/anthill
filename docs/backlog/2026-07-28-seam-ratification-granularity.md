# `anthill:plan`: a ratification must say **where it ends**

**Added:** 2026-07-28 · **Status:** ready to build · **Seat:** weaver
(`plugin/skills/plan/SKILL.md` + `methodology.md`)

From operator-mono's finalize, reported by their CLI seat and endorsed by the lead:

> **A seam is ratified at a specific granularity, and building past it silently manufactures a new
> one.** We ratified the response _envelope_; the seat built at the _field_ level and got shapes
> wrong — the ratification **felt** like a contract, so nobody noticed the boundary had been crossed.
> **Say where a ratification ends.**

## Why this is worth a change rather than a note

The ratify gate is anthill's strongest mechanism — in that same session it **falsified five of seven
seams**, including a privilege-escalation hole that would have turned a read-only CLI key into a full
session credential on every `requireAuth` route, **with no test failing**. The gate works.

This failure is the gate's own success turning into a hazard: **a ratified seam confers confidence
over a boundary nobody stated.** The seat wasn't careless — it had a ratified contract and built
against it. The contract was simply narrower than it appeared, and nothing in the artifact said so.
The corroborating evidence from the same session: _"the seams that were negotiated fit at
integration; the one shape a seat built past a contract was wrong in three places."_

So the failure mode is specific: **not an unratified seam, but a ratified one relied on past its
extent.** More ratification does not fix it; stating scope does.

## Shape

Small, and it lives in the artifact rather than in prose discipline:

- When a seam is marked `RATIFIED`, it also records **what was ratified** — the level (envelope /
  field / call signature / wire format), and by implication what was _not_.
- The ratify acknowledgement asks for it: not just _"ratified"_ but _"ratified **at** \<level\>"_.
- A consumer that needs a level finer than the ratified one has hit a **new seam** and should say so
  — that's a falsification, which the gate already handles well.

Keep it proportionate. This must not become a taxonomy exercise: one clause per contract, in the
seat's own words, is enough to make the boundary visible.

## Acceptance Criteria

- [ ] A `RATIFIED` marker in `seams.md` carries the granularity it was ratified at.
- [ ] The plan skill's ratify step asks owners to state where the ratification ends.
- [ ] The skill names the failure explicitly: **relying on a ratified seam past its stated extent is
      a new seam**, and reaching one is a falsification, not a nuisance.
- [ ] `methodology.md` (the portable half) mirrors it.
- [ ] The `seams.md` scaffold template shows the granularity clause in its example.

## References

- `plugin/skills/plan/SKILL.md` — the ratify gate · `plugin/skills/plan/methodology.md` — portable half.
- `plugin/templates/docs-team/dev/seams.md` — the scaffold whose example sets the convention.
- Source: operator-mono finalize, grapevine `anthill-research` msg #6 (2026-07-28).
- Context: [shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md),
  observation 12.
- Sibling: [ratify runtime claims with a measured repro](2026-07-27-ratify-runtime-claims-need-repro.md)
  — both sharpen _what counts as_ a ratification; consider landing them together.

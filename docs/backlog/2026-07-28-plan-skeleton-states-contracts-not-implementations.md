# `anthill:plan`: the skeleton must state the **contract**, not the implementation

**Added:** 2026-07-28 · **Status:** ready to build · **Seat:** weaver
(`plugin/skills/plan/methodology.md` + `SKILL.md`)

**The highest-leverage single line in the current feedback set.** From operator-mono's structure
reflection — reached by their coordinate seat from outside, then confirmed by the engine seat from
_inside_ its own falsification:

> **The five falsified seams specified a SOLUTION. The two that survived specified a CONTRACT or a
> QUESTION.**

The lead's own example of the failing shape:

> My S1 said _"add these two columns to this row, reuse `keyHash`, discriminate by `kind`."_ That is
> an implementation. It forced the owner either to accept a design they hadn't made or to do the
> archaeology to overturn it — **five owners did the archaeology.**

And the diagnosis of why the method didn't prevent it:

> The method already says the skeleton is a hypothesis to falsify. **It doesn't say what a hypothesis
> should look like.** "State the contract, not the implementation" is a one-line addition that would
> have saved most of a session.

## Why this is the important one

The ratify gate is working — spectacularly. In that same session it falsified **five of seven seams**,
including a privilege-escalation hole no test caught. But look at the cost distribution: the gate
caught the errors, and **five owners spent the session doing archaeology to overturn designs they
hadn't made.** The gate was doing expensive rework that a better-shaped skeleton would have made
unnecessary.

So this is not a fix to the gate. It is a fix to **what the gate is handed**. A skeleton written as a
contract gets _"ratified"_ or a cheap sharp correction from the owner; a skeleton written as an
implementation gets an archaeology project, because the owner must first reconstruct the reasoning
behind a decision they were not part of before they can disagree with it.

The teams' own evidence for the good shape: _"the seams that held stated what must be true across the
boundary, or posed the choice as a question, and got cheaper sharper answers from the seats that
owned them."_

## Shape

One clause in `methodology.md` (the portable half), mirrored in the skill, with the worked contrast:

- **A seam claim states what must be TRUE ACROSS the boundary** — the invariant, the guarantee, the
  shape the other side can rely on. Or it **poses the choice as a question** the owner is best placed
  to answer.
- **It does not state HOW the owner should satisfy it.** Naming columns, fields, reuse of an existing
  helper, or a discriminator is an implementation — it is the owner's call, and pre-empting it
  converts ratification into archaeology.
- **Test for it before posting the skeleton:** _could the owner satisfy this claim three different
  ways?_ If not, it is probably a solution wearing a contract's clothes.

Pair with [seam ratification granularity](2026-07-28-seam-ratification-granularity.md) — that one says
where a ratification _ends_; this one says what a ratification is _about_. Land them together.

## Acceptance Criteria

- [ ] `methodology.md` states the contract-not-implementation rule with the worked contrast above
      (a failing S1 vs. the same seam stated as an invariant).
- [ ] The skill's skeleton step carries the "could the owner satisfy this three ways?" check.
- [ ] The distinction is framed as **what a falsifiable hypothesis looks like** — the method already
      says the skeleton is a hypothesis; this says what shape one takes.
- [ ] The `seams.md` scaffold example models a contract-shaped claim, not an implementation-shaped one.

## References

- `plugin/skills/plan/methodology.md` — the portable method; the primary home for this.
- `plugin/skills/plan/SKILL.md` — the skeleton-authoring step.
- `plugin/templates/docs-team/dev/seams.md` — the example that sets the convention downstream.
- Source: operator-mono structure reflection, grapevine `anthill-research` msg #7 (2026-07-28).
- Context: [shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md),
  observation 13.
- Siblings — all three sharpen the ratify gate and should be considered as one pass:
  [ratification granularity](2026-07-28-seam-ratification-granularity.md) ·
  [runtime claims need a repro](2026-07-27-ratify-runtime-claims-need-repro.md).

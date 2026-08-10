# Methodology externalization — is it a precondition for variants, and by how much?

**Status:** 🟡 **Draft — the experiment is specified, the build it may commission is not.**
**Created:** 2026-08-10 · **Author:** Cole + Claude Code (unconvened session — no seat)
**Instrument:** [multi-team-support](../_archive/multi-team-support/proposal.md) — **shipped 2026-08-10**, and
this project is its first real use.
**Inherits:** MVP item 9 of that proposal (the acceptance experiment) and its Open Questions 2, 3
and 4, all carried verbatim below.

---

## Overview

anthill can now hold several teams in one project and switch between them safely. **Nothing yet shows
that two team shapes actually differ in a way the shipped skills respect** — and there is a specific,
already-argued reason to expect they do not.

**This project starts with an experiment, not a build.** Its first deliverable is a number. What that
number is decides whether the rest of the project exists, and how large it is.

## The question, and why it is already half-answered against us

Carried from `multi-team-support`'s **scope correction, restated after it was attacked** — the
strongest claim that project made about its own limits, which it deliberately did not settle:

> v1 argued that externalized methodology is a precondition for **kinds** but not for **variants**,
> because variants differ through `seats[]` alone. **The gap analysis attacked this and largely won.**
>
> Its counterexample: `manager / implementer / reviewer` — one of Cole's three named variants — **has
> no per-scope seam owners**, yet `plan/methodology.md`'s ratify protocol prescribes per-owner seam
> ratification and the SOP restates it. **Run the shipped skills against that config and the variant
> is coerced back into the ownership model it exists to test.** That is skill prose overriding
> `seats[]`, which is exactly what v1 claimed could not happen.
>
> **The corrected claim, weaker and defensible:** the variant **mechanism** is buildable
> independently of externalization. **Whether variants differ substantively is not asserted — it is
> the first experiment the instrument should run.**

**So the null hypothesis is not "variants work".** It is: _the shipped skills coerce every variant
back into the shape they were written for, and `seats[]` is decoration._ The experiment exists to
falsify that, and it may not.

## The experiment (inherited MVP item 9, unchanged)

**Hand-write a 3-seat `manager / implementer / reviewer` config, convene it, and count the skill
instructions the seats cannot execute as written.**

- **Non-zero** → externalization is a precondition for variants too, and **the next phase is named by
  the count**: the instructions that failed are the externalization backlog, in priority order.
- **Zero** → the corrected claim holds, variants are real through `seats[]` alone, and this project
  closes having bought a genuine answer cheaply.

**⚠ The measurement discipline this repo has already paid for, and it applies sharply here:**

- **Count instructions that CANNOT BE EXECUTED, not instructions that feel wrong.** An artifact
  claim ("`seams.md` has a per-owner ratification line") is checkable by running something; a
  judgement ("coordination felt awkward") is testimony. Record both, label which is which, and only
  the first goes in the count.
- **Do not prime the seats.** [Observer effect in agent probes] — asking a seat _"which instructions
  could you not follow?"_ mid-session manufactures the finding. **Blind retrospective, neutral
  phrasing**, collected after the work.
- **The count is the deliverable even if it is inconvenient.** A zero that we argue away, or a
  non-zero we inflate, destroys the only instrument this whole line of work was building.

## Open questions carried in from `multi-team-support`

These travel here because the experiment informs all three, and none of them blocked that merge.

**2. Do teams share `principles.md` / `paper-cuts.md`?** A **project-level** set that applies down and
a **team-level** set that does not propagate up. Current reading: `retro.md` must be team-local (else
attribution dies); `principles.md` wants both; `paper-cuts.md` is mostly project-global since the
friction is in shared tooling. **A team-level entry that merely repeats a project-level one is a
defer-to-one-source violation; one that overrides must say so and why** — and that disagreement is
exactly the signal an A/B exists to produce. _Needs its own design pass; the experiment will say
whether it is urgent._

**3. Can two variants be compared honestly at all?** Different work, different times, different
accumulated context. **This is the one `multi-team-support` explicitly could not close** — its
attribution work (the `Anthill-Team` trailer, the retro shape fingerprint) makes a session
**labelled, not comparable**, and says so in three places on purpose. _If the answer is "no", the
instrument's value is bounded and that bound should be written down rather than discovered later._

**4. Is a team the same object as a seat TIER?** [non-dev-seats](../non-dev-seats/proposal.md) gives
the research tier its own directory and declares it **cross-project** — which a `teamDir` that
swallows tier dirs would break. Item 0's derivation defused the blocker; **the cross-project claim
still needs reconciling.**

## Scope

**In scope (phase 1 — and phase 1 is the whole committed scope right now):**

1. The acceptance experiment above, run once, with the count published.
2. A written verdict on whether externalization is a precondition for variants, with the failing
   instructions enumerated if the count is non-zero.

**Deliberately NOT committed yet:** the externalization build itself. **Its size is the experiment's
output, not an input** — committing to it now would be scoping work whose shape we are about to
measure. If the count lands non-zero, this proposal gets a v2 with a real plan.

**Out of scope:** fork inheritance policy (does a fork inherit the parent's living docs, contaminating
the comparison, or start clean, discarding what made the parent good? **Neither answer is obviously
right** — inherited from the parent project's out-of-scope list); simultaneous convened teams;
non-dev archetypes.

## Success criteria

1. **A number exists, and it was produced without priming the seats.**
2. **Every counted instruction is named**, with the file and line, and with what the seat could not do.
3. **The verdict is stated even when it is the inconvenient one** — including "zero, the concern was
   overstated", which closes this project.
4. **If non-zero, the next phase is scoped BY the count** rather than by appetite.

## Related documents

- [multi-team-support](../_archive/multi-team-support/proposal.md) — the instrument, and the scope amendment
  that moved this work here
- [methodology-survey](../_archive/multi-team-support/methodology-survey.md) — the 82-instruction COORDINATION
  bucket, defined as content that _"varies by team shape… what an A/B varies"_
- [non-dev-seats](../non-dev-seats/proposal.md) — Open Question 4's other half

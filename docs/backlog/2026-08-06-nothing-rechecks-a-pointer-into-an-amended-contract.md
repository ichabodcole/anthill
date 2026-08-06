# "Don't restate, point" is stated four times; exactly one beat verifies it, for one session's worth of change

**Status:** Backlog — **verified; the gap is real but uninstrumented rather than absolute**
**Found:** upstream, [anthill#91](https://github.com/ichabodcole/anthill/issues/91) — the `cassandra` seat, Spellbook team, 2026-08-06, against 2.0.0
**Verified:** 2026-08-06 against `develop` @ `932596e`

---

## The finding

`finalize-session` step 3.5 exists because the ritual's own ordering guarantees a violation: a seat
writes a lesson in full at step 2 (correct — no contract existed to point at yet), step 3 promotes it
into a contract, and the seat doc is now restating shared truth. **The beat catches that and explains
itself well.**

**The inverse has no beat: a restatement or pointer that OUTLIVES an amended contract.** A seat doc
that pointed correctly at a contract in session 3 is never re-examined in session 7 when that
contract is amended.

**3.5's scope is bounded to the current session by its own text, in three independent places**
(`SKILL.md:164-165`, and the rationale at `:167-171`):

- the trigger — _"any contract that **CHANGED in step 3**"_ — step 3 is this session's seams pass
- the timing — _"after the seams pass, before the lead lands"_
- the rationale, which is entirely about within-session ordering

`:182-183` gets close — _"a contract that changes **late** still needs this beat"_ — but "late" there
means late in _this_ session. So the skill already knows that contract change is what creates the
exposure, and has only ever instrumented the same-session case.

## Where the report is imprecise, and it matters

The reporter says step 2.5's wording is _"about verifying claims against CODE, not about re-checking
pointers against CONTRACTS"_. Half right, and the half that's wrong shrinks the gap:

- **Against them:** 2.5's object explicitly includes contracts — _"go back through each **contract**
  and doc you own"_ (`:136-140`). It is not code-only in scope.
- **For them:** 2.5's _verification target_ is unambiguously code — _"verify every claim against **the
  current code**"_ — and every concrete example is code drift (a pinned test moved or deleted, a
  `lives in X()` that became `Y()`). The stated failure mode is prose-vs-tree, never doc-vs-doc.

**The decisive word is OWN**, capitalised in 2.5's header and load-bearing throughout. A seat doc
pointing at a contract that _another_ seat owns fails 2.5's predicate twice over: the contract isn't
yours, and the discrepancy isn't a code claim.

**And 2.5 has caught this incidentally** — its own evidence bullet (`:150-151`) reports finding _"two
seat docs that had restated shared truth."_ So the gap is **uninstrumented, not absolute**: nothing in
the wording directs the check, but a diligent seat re-reading its own doc can stumble into it. The
reporter's own measurement says the same thing from the other side — the seat in question reported
that under a plain "re-read and update" framing she would have skimmed and passed. **It was the
lead's "assume it has drifted" instruction that made the pass work, not the beat's wording.**

## The shape of this argument has already been made once, and answered differently

`SKILL.md:194-198`, introducing step 3.75:

> _"**Step 2.5 already asks every seat to re-read the docs it OWNS. This beat exists because the docs
> that go stale are the ones NOBODY owns.**… The predicate was right and its domain was seats."_

So the project has already found "2.5's domain is too narrow", and resolved it by **adding a beat for
unowned docs rather than broadening 2.5.** That is the precedent for how to close this one — and 3.75
does _not_ close it, because its scope is docs nobody owns and its verification target is still the
tree.

**Note for the reporters:** 3.75 postdates 2.0.0. A reader on the installed plugin may not have seen
it, and it is the beat most likely to be mistaken for a fix for this.

## The count that makes the case

**"Don't restate, point" is stated in at least four places** — `join/SKILL.md:32`,
`finalize-session/SKILL.md:162` and `:165`, `plan/methodology.md:227` — and **exactly one beat
verifies it**, for one session's worth of change. Contracts live in `.anthill/dev/seams.md` (minted at
`plan/SKILL.md:109`), with `.anthill/principles.md` as a second store. **No beat anywhere
re-validates a pointer into either.** Swept `convene`, `join`, `plan`, and `methodology.md` for
drift/stale/re-check language: four hits, none relevant — seat scope drift and stale comms context.

## What would close it

The reporter's suggestion is small and correct in direction: extend 3.5 (or add a line to 2.5) to say
**re-read your doc against every contract you POINT AT, not only the ones that changed today.**

Two things to decide when picking it up:

1. **Which beat owns it.** 2.5 is per-seat and already has the reading discipline; 3.5 is where
   contract-awareness lives but is scoped to this session's changes. Following the 3.75 precedent
   argues for **widening 3.5's trigger** rather than adding a fifth beat — the ritual is already long
   and each added step competes for the same attention.
2. **Whether the check can be cheap.** "Re-read every contract you point at" is unbounded as a seat
   accumulates pointers. A bounded form — _pointers into contracts amended since your doc's last
   substantive edit_ — is checkable against git and is the version that survives session 20.

**Related and deliberately not merged:**
[`2026-08-01-finalize-drift-pass-improvements.md`](2026-08-01-finalize-drift-pass-improvements.md)
holds two other open 2.5 gaps (stale open _candidates_; the roster's scope paths having no owner).
Same beat, different failure; worth fixing in one pass if someone picks up either.

## Acceptance Criteria

- [ ] A seat doc pointing at a contract amended in an **earlier** session is caught by some beat.
- [ ] The check is bounded — not "re-read every contract you have ever pointed at".
- [ ] The ritual does not gain a fifth restatement of "don't restate, point" without a check attached.

## References

- `plugin/skills/finalize-session/SKILL.md:136-140` (2.5), `:150-151`, `:160-162` (3), `:164-188` (3.5), `:194-198` (3.75's rationale)
- `plugin/skills/join/SKILL.md:31-32` · `plugin/skills/plan/SKILL.md:109` · `plugin/skills/plan/methodology.md:227`
- `.anthill/dev/seams.md` · `.anthill/principles.md`
- Upstream: [anthill#91](https://github.com/ichabodcole/anthill/issues/91)

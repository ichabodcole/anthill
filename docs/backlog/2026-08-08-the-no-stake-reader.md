# The no-stake reader — the cheapest intervention either team found, with the brief that makes it work

**Added:** 2026-08-08 · **Status:** proposal, unbuilt. **Adoptable unilaterally, needs no coordination**
**Source:** `grapevine anthill-spellbook-r2` msgs `#6`–`#8`. **The brief in §2 is the Spellbook team's,
volunteered** — we did not ask for it, per the standing rule against soliciting their behavioural
signal.

---

## The number that motivates it

Three independent samples of _claims written by competent authors who had just read the thing they
were wrong about_:

| sample                                                       | rate                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| our 2026-08-07 triage of #70/#73/#94                         | **3 of 6** reports weaker than filed |
| our 2026-08-08 triage of #96–#102                            | **5 of 7**                           |
| the Spellbook team's own ratify round, before any code moved | **6 of 6** scaffold claims falsified |

**None of the three was caught by its author re-reading.** Every one was caught by a reader with no
stake — twice on their side (our verification pass, and a fresh agent handed a branch and told nothing
else), twice on ours.

**So re-reading is not the intervention. Not having a stake is.** That is a cheap, unilateral change
with a suspiciously high hit rate, and it is the one thing on that wire either team could adopt
tomorrow.

**It has already caught its author on this wire twice inside a day:** the `bounty info` sampling that
would have [faked the `#64` green](2026-08-08-spellbook-64-idle-death-measurement-protocol.md), and a
⚠ in [the BUILD index](2026-08-08-triage-build-batch.md) warning about a tradeoff that does not exist.

## The brief, which is the whole mechanism

Verbatim shape from the team that ran it:

1. **Give it the refs and nothing else.** No session log, no summary, no statement of what was
   interesting. **It reconstructs from the tree, which is what a future reader does.**
2. **Tell it to assume at least one contradiction exists and go find it.** _Not_ "check for issues."
   **The presupposition does the work** — a reader asked to _verify_ finds nothing; a reader asked to
   locate the contradiction that is definitely there keeps going.
3. **Return findings on a channel SEPARATE from the prose**, in four named buckets:
   - what it **could not determine**
   - **contradictions** — quote both sides, give paths
   - whether the **existing artifact was sufficient on its own**
   - a **mechanical check** it could run without judgment

   **Separating them is what stops the findings being softened to fit the deliverable.**

4. **Tell it not to fix anything.** Finding and fixing in one pass produces a reader who **resolves
   ambiguity silently instead of reporting it.**

**The bucket that paid best was _"could not determine."_** It surfaced things nobody would have filed
as a defect — including a project README still describing a shipped sprint as _"scaffolded, awaiting
ratify."_ **A reader with a stake resolves that from memory and never notices it was unresolvable.**

## ⚠ Expect it to be wrong too

Theirs reported an inconsistency that was really eight hours of drift between two true statements.
**The no-stake reader is a FINDER, not a judge** — its output needs the same running-not-reading
treatment we are already applying to each other's reports. Do not wire it to anything that acts
automatically.

## What we already do, and the two things we do not

Our four triage passes are most of this: parallel, independent, adversarially prompted, told to hunt
for overstatement, and told to run rather than read. **Two elements are genuinely missing:**

- **The presupposition.** We say _"report where the report overstates"_ — which still permits "it
  doesn't." **"At least one contradiction exists; find it"** is a different instruction and their
  evidence says it is the stronger one.
- **The _"could not determine"_ bucket.** We have no home for _this claim is unresolvable from the
  tree_ — it currently gets rounded to verified or refuted, which is exactly the softening the
  separate channel exists to prevent.

## ⛔ Do not make it a cross-team process

Both sides independently reached this and it is worth writing down: **it works because the reader has
no stake, and a standing cross-team review beat gives them one.** Each side running its own no-stake
reader preserves the property that makes it work. Cross-team review is a _bonus_ when it happens, not
the mechanism.

## Acceptance Criteria

- [ ] The verification-pass prompt carries the **presupposition**, not a request to verify.
- [ ] There is a **"could not determine"** bucket, and it is reported rather than resolved.
- [ ] The reader is told **not to fix**.
- [ ] Nothing acts on a no-stake reader's finding without a second pass. **It is a finder.**
- [ ] The beat stays **per-team**. It is not a shared review process.

## References

- `grapevine anthill-spellbook-r2` msgs `#6`–`#8`
- [`reports/2026-08-08-feedback-triage-96-102.md`](../reports/2026-08-08-feedback-triage-96-102.md)
  — the 5-of-7, and the four prompts as they were actually written
- [`reports/2026-08-07-feedback-triage-70-73-94.md`](../reports/2026-08-07-feedback-triage-70-73-94.md)
  — the 3-of-6
- `.anthill/principles.md:320-325` — the class this sits in

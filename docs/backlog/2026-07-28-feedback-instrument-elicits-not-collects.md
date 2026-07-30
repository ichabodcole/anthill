# The feedback instrument collects; it needs to **elicit**

**Added:** 2026-07-28 · **Status:** ready to build (items 1–3); item 4 needs a judgment call ·
**Seat:** weaver (`plugin/skills/finalize-session/SKILL.md`) + forager (the category set)

## The evidence

The [shared-tree investigation](../investigations/2026-07-27-shared-tree-failure-modes.md) separated
eleven failure mechanisms. Five of them (**M7–M11**) had never reached anthill through the feedback
path in any form — and one, M9, has only a partial cousin filed (
[#58](https://github.com/ichabodcole/anthill/issues/58) reports the _lead-idle_ side; the
seat-waiting side was never filed).

**The decisive fact: not one of the five arrived spontaneously.** Every one required somebody asking
a question — either the interview or a specifically-requested finalize report. Meanwhile the
mechanism with **six** filed issues is the one teams survive by adapting to.

> The tracker ranked the mechanisms almost **inversely to their severity.**

That is not a reporting-discipline problem. Four teams filed twenty-nine thoughtful, specific,
well-written issues. The instrument asked for complaints and got excellent complaints.

## Diagnosis: four classes the current shape cannot represent

`FEEDBACK_CATEGORIES = ["bug", "friction", "idea", "docs"]` — and the code comment says it plainly:
_"Kept corrective-heavy by design."_ Finalize step 5 then instructs the lead to _"read the **same
intake** you already swept"_. So the pipeline **harvests what seats already chose to record**. It
never asks about:

| Class                | Why it is never filed                                                             | What we lost                                                 |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Absence**          | Nothing malfunctioned. It is not a bug, friction, idea, or docs — it is a _gap_.  | M9 (invisible waiting), M11 (invisible scope)                |
| **Invention**        | A workaround reads as a success. You don't file your own competence as a problem. | the provenance-first convention; a seat's auto-retry watcher |
| **Corrected belief** | It got fixed, so it stops feeling like a defect.                                  | the false-RED verdict (dream-flute `prism.md`)               |
| **Self-implicating** | The lead aggregates the feedback, and the lead is the bottleneck.                 | M8 (lead ruling latency)                                     |

The invention class is the most costly, because those are the highest-value signals we get: a team
that **invents a convention** has located a gap precisely enough to route around it. One team grew a
universal provenance-first messaging habit that exists in no document; another seat built itself a
watcher on the git index. Both are louder signals than any bug report, and the instrument has no
field for either.

## Item 1 — Finalize must ASK, not just sweep

Step 5 currently reads existing intake. Give it four questions, put to the seats, targeting exactly
the classes above:

- **"What did you or the team _invent_ this session that isn't written down anywhere?"** — a habit, a
  convention, a script, a checking reflex.
- **"What did you need to know where _nothing could tell you_?"** — the absence catcher.
- **"What did you believe that turned out to be false — and what corrected it?"** — separates
  observation errors from inference errors, and catches wrong verdicts that got quietly fixed.
- **"What did you work around instead of reporting?"** — names the routing-around directly, so it
  stops reading as an admission.

**Why finalize and not the command:** all five missing mechanisms surfaced during finalize or the
structure reflection, never during the work. The ritual is already the right moment; it just isn't
asking.

## Item 2 — Route the structure reflection upstream (the cheapest fix here)

**M11 was found by the structure reflection.** The ritual worked. Then the finding died locally,
because the reflection's output is defined as flowing to _"seat docs, `seams.md`, and occasionally
the roster/config"_ — never to the feedback path. It reads as being about _this team's shape_ when it
is often about **anthill's model of teams**.

Add one question to the reflection, and one line to step 5:

> Of what the reflection surfaced, **which findings are about anthill's model rather than this team's
> shape?** Those are upstream feedback, not local adjustments.

M11's own framing is the test case: _"an uninstrumented failure mode in the board model, not a
personal lapse."_ The team already understood it as a model problem and it still didn't travel.

## Item 3 — Stop laundering agreement into confidence

Step 5 says: _"**Dedupe** them (N seats hitting one bug is one issue, not N)."_ Correct for bugs.
Wrong as a general epistemic move, and it contradicts the finding from the same session:

> Agreement about a shared artifact is weaker than agreement about an external invariant.

Four seats agreed within ten minutes on a claim **none of them had tested** — they had each read
their own roster line. Dedupe treats that identically to four seats independently hitting one
crash.

**Fix:** when deduping, record _why_ the seats agreed — did each verify against something outside
itself, or did they converge on a shared document? Convergence is evidence only in the first case.
One clause; it changes what the aggregate means.

## Item 4 — One new category: `absence` _(needs a call)_

`bug | friction | idea | docs` has no shape for "something that should exist and doesn't." An
absence didn't malfunction, didn't rub, isn't a proposal, isn't a doc gap.

**The argument for:** the category set is the affordance. A seat that sees no category for what it
noticed concludes the thing isn't fileable.

**The argument against:** every added field suppresses filing. The current set is small and gets
used, which is worth protecting.

**Lean:** add `absence` only, and leave inventions to the finalize prompt in item 1 — the prompt is
the better instrument for those, since a seat won't classify its own habit as feedback but will
answer a direct question about it. Revisit if item 1 produces inventions that then have nowhere to
go.

## The limit worth stating

**No improvement here makes reading the consuming projects unnecessary.** Today's strongest findings
came from seat docs and a live interview, not from the tracker — and the deepest reason is not
fixable by better questions: **a team that has fully absorbed a workaround no longer experiences it
as friction.** It isn't withholding; the friction is genuinely gone, paid for once and amortised.

There is also a priming risk in item 1: asking "what did you invent?" will generate answers, some of
them manufactured. That is an acceptable trade against the current miss rate, but the prompts should
say a null answer is a real answer — the same guard the
[research probes](../projects/research-probes/proposal.md) proposal already argues for.

## Acceptance Criteria

- [ ] Finalize step 5 poses the four elicitation questions to the seats, and states that "nothing"
      is a valid answer.
- [ ] The structure reflection asks which of its findings are about **anthill's model** vs. this
      team's shape, and step 5 collects those.
- [ ] Deduping records whether a converged finding was externally verified or agreement-only.
- [ ] Decide item 4; if adopted, `absence` is added to `FEEDBACK_CATEGORIES` with a one-line gloss.
- [ ] The guidance lives in the **ritual and the command prompts**, not in `paper-cuts.md` — two of
      four studied projects leave that file scaffold-only, so anything depending on it will not run.

## References

- `plugin/skills/finalize-session/SKILL.md` — step 4 (structure reflection), step 5 (the harvest).
- `plugin/scripts/anthill/feedback.ts` — `FEEDBACK_CATEGORIES` and the "corrective-heavy by design"
  comment.
- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md) —
  observations 8 (invisible adaptations) and 15 (convergence), and the M7–M11 rows.
- [Research probes](../projects/research-probes/proposal.md) — the targeted-question instrument this
  overlaps with; **check whether these four prompts should simply BE probes** rather than a
  permanent addition to finalize.
- Field evidence: `operator-mono` (all five missing mechanisms), `dream-flute` `.anthill/dev/prism.md`
  (the corrected-belief class), `media-buffet` `.anthill/paper-cuts.md` (the one project that fills it).

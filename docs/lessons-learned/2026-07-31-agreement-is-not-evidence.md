# Agreement is not evidence — and the frame only breaks on execution

**Date:** 2026-07-31
**Tags:** `#multi-agent` `#epistemics` `#skill-authoring` `#anti-pattern` `#hivemind-candidate`
**Type:** Pattern

---

## The Lesson

**When agents agree, they tend to treat the agreement as the evidence.** Convergence feels like
confirmation, so the check that would have tested the claim never runs — and the group iterates _within_
a frame instead of testing whether the frame is right.

**The reliable break is execution, not deliberation.** In every observed instance, what dissolved a bad
frame came from an agent who _ran something_ — a command, a scan, a grep — not from an agent who
reasoned harder or from another round of discussion.

So the operational rule is two lines:

> **Agreement about a shared artifact is weaker than agreement about an external invariant.**
> If several agents agree and no one has executed anything since the claim was made, **that is the
> signal to go execute** — not to deliberate further, and not to ratify.

## Context

Observed across two independent teams in one week, and in three distinct forms.

**1. Iterating within the frame (StoryLoom, 2026-07-31).** Their lead diagnosed four of his own errors
from one session as the same move:

- `pull` → `--since` → a tighter `--since` — three fixes inside one frame, for a problem whose solution
  was `read <channel> <id>`, which **is not a range at all**. He and a peer each already used that
  command constantly; neither left the range-expression space.
- Chose a weaker schema option with a summary phrase, then **defended the phrase** rather than
  re-opening the option set.
- Built an argument from a `grep` count and **refined the argument** when challenged, instead of reading
  the two rows the count summarised.
- Claimed a change "narrows"; when pushed back on, **checked his wording before checking the claim**.

> _"Every one is the same move: **iterate within the frame, don't test the frame.** Range → tighter
> range. Phrase → better phrase. Count → better argument from the count."_

**And the tell was uniform** — in all four, the thing that broke the frame came from someone
**executing** rather than reasoning: one agent running the command and noticing what he'd actually read,
one running the scan and diffing file counts, one running a whole-tree grep across the space between
scopes.

**2. A workaround terminates diagnosis.** A seat mis-called a command once, saw a non-zero exit, and
concluded the tool was broken. `pull --since | head -c` worked, so **he never returned to the failure** —
and reported the tool as defective to its maintainer, twice, while a correct usage string sat unread in
his scrollback. Success downstream removes the pressure that would have tested the upstream claim.

**3. The human's own hypothesis, falsified by asking.** The observation was "these agents are getting too
many messages" — reasonable from watching three or four land in a terminal at once. Asking the agents for
**behaviour** (how many did you pull in full; did a batch ever cost you your place) falsified it:
notifications arrive _between_ tool calls, never during one, so there is no interruption cost. Real
problems existed; that was not one of them. **The check was cheap and nothing but running it would have
found that out.**

## The pattern

**Wrong** — convergence treated as verification:

- Several seats state the same conclusion → it is recorded as settled.
- A ratification round where every participant is reading the same document.
- "We all agree" with no execution between the first claim and the last agreement.
- Pushing back on a claim and getting a **better-worded version of the same claim** back.

**Right** — convergence treated as a prompt:

- Name the **external invariant** the agreement is about: a command's actual output, a test result, a
  file's actual contents. If no one can name one, the agreement is about prose.
- **Ask who executed what, and when.** If the answer is "nobody, since the claim," go execute.
- When challenged, **re-open the option set** rather than improving the current option's phrasing. The
  signal you are in the trap is that your revision changed wording and not substance.
- Treat "someone found a workaround" as a **reason to keep diagnosing**, not a resolution.

## Why this works

Agents are strongly disposed to agree — with each other, and with whatever framing an instruction
supplies. The same round produced hard evidence of the second half: **three of five seats followed a
named command over their own well-practised habit**, one of them having used the better command thirteen
times that session. Their lead's generalisation:

> **"Where a skill names a command, it is choosing the shape of every fix that follows."**

So the frame usually arrives from outside — a skill, a lead's phrasing, a proposal's vocabulary — and
agreement inside it is close to free. Execution is the only cheap operation that touches something the
frame does not control.

## Implication for instruction authoring

This is the reason **reflection points must ask for behaviour, not opinion.** "What would you want?"
collects preferences generated inside the frame. "How many did you pull in full? What did you skip? What
did you run?" collects observations that can contradict it. Both of this week's frame-breaks on the
anthill side came from behavioural questions; none came from a design conversation.

The corollary for skills: **name a command only when you mean to determine every downstream fix**, and
where judgment is wanted, say what the seat is deciding rather than what to type.

## References

- [StoryLoom comms round](../reports/2026-07-31-story-loom-comms-round.md) — §1, and the lead's
  four-instance self-diagnosis.
- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md) — convergence
  epistemics, where the invariant/artifact distinction was first stated.
- [Practice transmission between teams](../investigations/2026-07-28-practice-transmission-between-teams.md)
  — judgment rules transmit on scar, mechanical rules on mechanism.

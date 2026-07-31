# StoryLoom round three — intake when they first do dev work

**Added:** 2026-07-31 · **Status:** waiting on them · **Trigger:** the team starts implementing the plan
they spent today building · **Seat:** maestro + forager

Rounds one and two caught StoryLoom during **team creation and a single deep planning session**. They
have written no code together yet. The shift to implementation changes the load in ways our current
findings cannot speak to, and it is the first chance to see whether they **contradict** rather than
extend.

## Why this round is different, not just more

Everything we have from them is **planning-phase behaviour**: reading, falsifying, ratifying, arguing
about contracts. Dev work adds the things that dominate every mature-team finding we have from
elsewhere — a shared working tree with actual edits in it, a gate that goes red, commits that collide,
work that blocks on other work.

Specifically, these mechanisms **could not have fired yet** and should be watched for:

- **M7 (livelock) and M8 (lead latency)** — both are volume-under-load findings from mature teams. A
  planning session has neither.
- **The shared-tree mechanisms.** `anthill commit` carrying a peer's uncommitted edits inside a shared
  file was found by _inspection_ on this team, in `seams.md`. Under real implementation it becomes a
  routine event across many files.
- **calvino's resource-claiming gap.** He built a filesystem mutex during _planning_, for one file. If
  that gap is real, dev work makes it constant — and it is the item he rated above addressing.

## The four predictions to test

State them now so the round can falsify rather than confirm. Each is a genuine claim we would have to
withdraw:

1. **Crossing gets worse and stays the top cost.** All four seats named it; it is not a volume problem,
   so implementation should not fix it and may sharpen it (a stale gate report is worse than a stale
   opinion).
2. **The ~200-character preview stays the unit of decision** — but the headline conventions seats
   invented for verdicts may not survive contact with status traffic ("gate red", "pushed", "blocked
   on X"), which has a different shape.
3. **Truncation-depth misses become material.** In planning, a missed message cost a near-miss. In
   implementation, it should cost rework. If it doesn't, our reading of §2 is too strong.
4. **The self-imposed message budget loosens or tightens.** Two seats rationed themselves against a
   limit no tool imposes. Under implementation, status messages are cheaper to justify — so does the
   budget relax, and does that _help_?

**Also re-ask the one thing we got a clean falsification on**: the batching/interruption cost. If it
reappears under dev load, the current conclusion is scoped to planning and must be labelled that way.

## The instrument (fixed from three failures)

The blind condition leaked all three times it was attempted. The method that worked:

- **Give one exact command that fetches exactly one message** — `grapevine read <channel> <id> --text`.
  Never a range plus a caveat. Any window ending at "now" contains the newest peer answer.
- **Whichever command we name is the one that gets run** — see
  [only execution dislodges an installed frame](../lessons-learned/2026-07-31-only-execution-dislodges-an-installed-frame.md). The
  instruction determines the behaviour more than the tool's affordances do, so the instrument is a
  design surface, not a wrapper.
- **Ask for behaviour, not opinion.** "How many did you pull in full" produced the round's best
  material; anything resembling "what would you want" produced the weakest.
- **Say "nothing" is a valid answer**, and say there is no message budget.

## The second thing this round is for

**What makes an instruction good.** Today established that our instruction text beats a seat's own
practised habit — which makes instruction quality anthill's highest-leverage variable and one we have
almost no theory of. Open questions worth putting to a team that has just followed a lot of them:

- Where did a skill's **specificity** help, and where did naming a command foreclose a better path the
  seat already knew?
- Where did a skill leave a decision **open** and the seat wanted it closed — or closed one the seat
  wanted open?
- Which guidance was **followed literally and load-bearing**? (One seat used `--stdin` with a quoted
  heredoc for every single message because the join checklist warned about backtick substitution. That
  is a worked example of a warning that paid for itself; we should collect more and learn their shape.)
- Which guidance was **skimmed**? (`aesop` skimmed the join checklist — _"it looked like a summary of
  things I already intended to do."_ A fix that lands in a skimmed surface is a fix at risk.)

**These findings are HiveMind-bound**, not anthill-bound — principles about writing instructions for
agents generalise past this plugin. See the lesson above; expect more.

## The third thing: what would count as flocking evidence

**A standing observation without an instance yet.** Agents appear to coalesce — treating the fact of
agreement as the evidence, rather than checking what the agreement is grounded in. It has been seen in
projects; **this week's data is not an example of it**, and we nearly captured it as one. What the
StoryLoom round actually shows is _frame persistence_ (an instruction installs an assumption, repairs
search inside it) — adjacent, and not the same claim. Recording the distinction so we can recognise a
real instance instead of reaching for the nearest story.

**What would count.** All three, ideally in one incident:

1. **Two or more seats independently assert the same claim** — not one asserting and others assenting.
2. **Nobody executed anything between the first assertion and the agreement.** This is the load-bearing
   part; agreement following a check is just a check.
3. **Execution later contradicts it.** Without this, we have consensus that happened to be right, which
   is indistinguishable from competence.

**Where to look during dev work.** The **ratify gate** is the obvious candidate and could not fire
usefully during planning: a ratified contract that the implementation then falsifies is exactly the
shape. Also: a green gate everyone believes in that nobody re-ran; a shared assumption about an
interface that no seat has called.

**How to ask, given the round-two lesson.** Do not ask "do you think you agree too readily" — that is
an opinion question, it will produce agreement about agreeing, and it primes the answer. Ask for the
incident: _what did the team ratify that turned out to be wrong, and who had run what before it was
ratified?_

## Acceptance Criteria

- [ ] Round three run at the start of, or shortly after, their first implementation session.
- [ ] Each of the four predictions explicitly confirmed or withdrawn — **withdrawals written down**.
- [ ] Every conclusion currently drawn from planning-phase data is either re-confirmed under dev load or
      **labelled as planning-scoped**.
- [ ] At least one instruction-quality finding captured in a form that would transfer to a project that
      is not anthill.

## References

- [Comms round](../reports/2026-07-31-story-loom-comms-round.md) — the findings this round tests.
- [First-contact intake](../reports/2026-07-31-story-loom-first-contact-intake.md).
- [Agreement is not evidence](../lessons-learned/2026-07-31-agreement-is-not-evidence.md).
- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md) — M1–M11, the
  mature-team mechanisms that a planning session cannot exercise.
- [Team comms spike](../projects/team-comms-spike/proposal.md).

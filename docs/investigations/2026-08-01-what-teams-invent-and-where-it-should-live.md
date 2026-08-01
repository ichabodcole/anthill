# What teams invent, and where it should live

**Date:** 2026-08-01 · **Status:** open — shape sketched, decision blocked on evidence we are about to
collect · **Seat:** maestro

Every anthill team so far has **invented rules of the road** that exist in no anthill document: a
filesystem mutex for claiming a shared file, a `## sender → recipient:` header convention, a grep
filter for triaging traffic, a provenance prefix, announcing post-land edits within the minute. Some
were written into the team's `seams.md`; most were never written down at all.

The question this investigation opens: **when a team invents a practice, what should happen to it?**

## The triage — three outcomes, and they are genuinely different

For each invented practice, exactly one of these is right, and guessing wrong is expensive in both
directions:

**1. Tooling should absorb it — the team shouldn't have to invent it at all.**
_Signal:_ the practice is **mechanical**, has no judgment in it, and every team would need the same
one. calvino's filesystem mutex (`git status --short -- seams.md` plus "TAKING"/"RELEASED") is the
clearest candidate: he built it because **there is no way to claim a resource, only to say you're
claiming it.** That is a missing primitive wearing a convention's clothes.

**2. It generalises as guidance — ship it, don't build it.**
_Signal:_ it encodes **judgment**, so a tool implementing it would have to guess. The read-watermark
(`ratified as of #14`) is this: four words, no mechanism, and it caught five crossings in flight.
Building it into a tool would mean deciding _when_ a watermark is required, which is exactly the part
a human-or-agent should hold.

**3. It is genuinely team-local, and should stay theirs.**
_Signal:_ it encodes **this project's** vocabulary or shape. A convention naming their specific
contracts, surfaces, or domain terms is not a finding about anthill and should not be exported.
**Mistaking (3) for (2) is how a methodology bloats** — the plugin's whole discipline is that anthill
adapts to a project, never dictates to it.

**The triage question to ask a team, and it should be asked as an incident, not an opinion:** _"you
built X — what would have had to be true for you not to need it?"_ A tool answer, a guidance answer,
and "nothing, it's just how we talk" are all real answers.

## The idea: an anthill-specific knowledge layer ("pro tips")

HiveMind accumulates cross-project **engineering** knowledge. Nothing accumulates cross-team **anthill
practice**. Proposal in outline: a place where teams' working practices collect, readable by every
anthill team, and readable by **us** as a corpus.

Two payoffs, and the second is the one that is hard to get any other way:

- **Teams share what works.** A new team inherits five teams' worth of practice instead of
  re-inventing a mutex.
- **We get a corpus to run the triage against.** _"Four teams independently built a resource claim"_
  is a tooling requirement with evidence behind it. **One team doing it is an anecdote; the same
  invention appearing across teams is a specification.** That pattern is invisible today because
  nothing collects it.

## ⚠ The constraint that should decide the shape — we already have the evidence

**A living doc is written once, at bootstrap, and no later release ever updates it.** Confirmed this
week by StoryLoom, who ran `upgrade` only because they were asked and found guidance they had been
missing for weeks. Their lead:

> _"A team can run indefinitely on bootstrap-era guidance with **every tool reporting healthy**."_

**So a pro-tips store distributed the way anthill currently distributes guidance would reach new teams
only** — which is the failure mode the store exists to fix, reproduced in its own delivery. That is a
strong argument for a shape where teams **consult a live source** rather than **receive a copy**:

- a **channel** (the user's instinct) or a queryable store that a seat reads _at the moment of need_,
- rather than a template hunk that lands once at bootstrap and then rots in place.

**A store you consult and a template you received have completely different staleness properties**,
and this project has now been bitten twice by the second one.

## The loop, stated once

Collection, synthesis and delivery are one cycle, and **the delivery half is what makes the collection
half worth doing.** A store nobody reads back is the write-only leak anthill's own SOP forbids.

> **collect** (channel + field study) → **synthesize** (triage: tool / guidance / local) → **deliver**
> (a touch point that fires on its own) → teams act → **collect**

### Collection — two instruments, and they catch different things

**a. A pro-tips grapevine channel — the substrate for now, and the reason is pragmatic.** A channel is
trivial to stand up, several teams can post to one, and it works as a **posting board** rather than
only as real-time messaging. It is not the eventual shape, but it costs nothing and it starts
accumulating today. **Its known limits are already documented from the field:** append-only, and **no
content search** — a gap that _hides itself_ behind a citation convention, so nobody notices wanting
it. Practice needs to be **found**, not replayed.

**b. A field-study skill — this is the piece that doesn't exist and should.** Formalize what we are
doing with StoryLoom right now: **read a team's artifacts, then interview, in that order.** The
ordering is the method, not a preference — reading first is what let us check a lead's account against
what the team actually wrote, and the two differed.

Its strongest property: **it does not need the team to be live.** `seams.md`, seat docs,
`paper-cuts.md`, scratch and commit history are durable artifacts. A study can run cold, months later,
on a team that has since disbanded — which is precisely the case the settled-team problem makes most
valuable, since **a team that has absorbed a workaround stops experiencing it as friction** and can no
longer report it, while the artifact still shows it.

_Constraint, stated honestly:_ it assumes the studied project is **on this machine.** True for now,
and it bounds the skill to the maintainers rather than making it shippable. Internal, like
`cascade-check`.

### Delivery — the touch point is the whole game

Guidance that ships via templates **reaches new teams only** (see the constraint above). So the
delivery has to be a **touch point that fires on its own**, and StoryLoom's lead already argued where:

> **convene** — once per session rather than once per seat, the human is present to consent, and it
> fires **before the seats are briefed**, which is the moment stale guidance starts costing something.
> `join` would ask N seats one shared question and surface it to agents with no standing to act.

**Chain the two checks at that one touch point:** _are you on the current version?_ **and** _have you
seen the current practice?_ They have the same trigger, the same audience, and the same remedy
(reconcile), and neither fires today. The version half is already specified in
[the staleness backlog item](../backlog/2026-07-31-nothing-tells-a-team-its-guidance-is-stale.md);
this adds the practice half to the same hook rather than inventing a second one.

Later, the highest-value practice graduates further down the chain — into the templates and the
bootstrap seed — so a **new** team starts with what five teams learned. **The touch point serves
existing teams; the seed serves future ones. Both are needed and they are not substitutes.**

### The eventual shape — online, not local

Everything above is single-machine. The end state is a **shared store anthill teams can reach**,
where practice accumulates across projects that never share a filesystem, is synthesized, and is
**read back into how anthill is delivered.** Not urgent, and worth naming so the local version is
built as a step toward it rather than a thing to throw away — the pro-tips channel and the field-study
skill both produce content that would migrate cleanly.

## Open questions — deliberately unanswered

1. **Does anyone read it?** The failure mode of every knowledge store is write-only. anthill's own SOP
   already names the rule — _no store without a named re-read moment_ — so this needs a **trigger**:
   convene? join? the shape check? Without one, this becomes the thing it was built to prevent.
2. **Who curates?** Five teams' raw practice is noise. HiveMind has a digest step for exactly this;
   an anthill equivalent needs one or it accumulates contradictions.
3. ~~**Is a grapevine channel the right substrate?**~~ **Answered for now: yes, provisionally.** Cheap
   to stand up, multi-team, works as a posting board. Its append-only/no-search limits are real and
   documented; revisit when finding a practice costs more than posting one. **Do not build a store to
   fix a gap the channel has not yet caused.**
4. **Does it overlap HiveMind enough to just be a HiveMind folder?** Cheaper if yes. The argument for
   separate: HiveMind is engineering knowledge for humans-and-agents building software; this is
   coordination practice for agent teams, and the audience is every anthill team automatically.
5. **What stops (3) leaking in?** A team-local convention promoted to shared practice is worse than
   no store, because it ships one project's vocabulary to every other project.

## What the StoryLoom check-in should collect to decide this

Their first dev cycle is the first real corpus. Ask for the **inventions**, and for each one, the
triage:

- **What rules of the road did you write into `seams.md` that anthill never told you to?** (And read
  their `seams.md` directly — last time the artifacts and the account differed.)
- **What did you invent and NOT write down?** Historically the richest vein and always needs asking.
- **For each: what would have had to be true for you not to need it?** — the tooling/guidance/local
  discriminator.
- **Which of your practices do you think another anthill team should inherit — and which are yours
  alone?** Their read on the (2)-vs-(3) line is data even when it's wrong.

## References

- [Practice transmission between teams](2026-07-28-practice-transmission-between-teams.md) — judgment
  rules transmit on scar, mechanical rules on mechanism. **That is the same (1)/(2) split as the
  triage above**, arrived at from the transmission side rather than the ownership side.
- [Nothing tells a team its guidance is stale](../backlog/2026-07-31-nothing-tells-a-team-its-guidance-is-stale.md)
  — the constraint that should decide the shape.
- [StoryLoom comms round](../reports/2026-07-31-story-loom-comms-round.md) — the inventions catalogued
  so far, all from one team.
- [Feedback instrument: collects vs elicits](../backlog/2026-07-28-feedback-instrument-elicits-not-collects.md)
  — of five coordination mechanisms found in a week, **none arrived spontaneously.** Whatever shape
  this takes, it will not fill itself.

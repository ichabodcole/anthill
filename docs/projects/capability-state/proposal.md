# Slice three — the wire knows who is listening

**Status:** Draft, for the seats to ratify · **Created:** 2026-08-03 · **Author:** maestro
**Origin:** the human, after session 7's measurements
**Follows:** [slice-two-proposal.md](../_archive/team-comms-spike/slice-two-proposal.md) · [session 6 measurements](../../reports/2026-08-03-session-6-measurements.md) · [session 7 measurements](../../reports/2026-08-03-session-7-measurements.md)

---

## Overview

**One primitive, and it replaces a binary that was never rich enough.**

Today a handle is either **on the roster** or **not**. That single bit has to stand in for every
question the wire actually gets asked: may this participant send? may it receive? is it listening
right now? Three separate features have already been blocked on it —

| wanted                                               | what it needs                     | filed as                                                                                                |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| an observer that cannot contaminate                  | position + receive, **no send**   | R10 (guest identity)                                                                                    |
| the human on the wire                                | send, **no seat**                 | R12 (unresolved)                                                                                        |
| a seat that stays convened but stops burning         | send, **suppressed receive**      | this proposal                                                                                           |
| **the substrate telling a seat its read went stale** | **send, and not an agent at all** | [backlog, 2026-08-04](../../backlog/2026-08-04-the-substrate-cannot-tell-a-seat-its-read-went-stale.md) |

**The fourth row changes how this primitive should be designed, and it arrived after the first
draft.** A substrate notification has **no author** — not a muted seat, not a guest, not the human,
but the working tree itself. `resolveSeatIdentity` today admits rostered handles and nothing else, so
a non-agent sender is either **a fifth special case bolted on later, or the thing the model is built
to accommodate from the start.** Design for a sender that is not a participant.

**And it strengthens the justification.** Four features are now blocked on one binary — which is a
better argument for this work than the cost saving that prompted it. _(The substrate signal is the
oldest of the four: [agent-signal-hunger](../../investigations/2026-07-08-agent-signal-hunger.md) named
it on 2026-07-08 and its validation step has never run.)_

> **The primitive: per-seat CAPABILITY STATE on the wire — send, receive, and listening — replacing
> rostered-or-not.**

steward's observation in R12 is the reason these are one piece of work and not three flags: guest and
human-on-wire are _"the same missing thing inverted."_ **Mute is its third face.** Building them
separately means three passes over `resolveSeatIdentity` and three chances to reopen the free-form
alias hole Contract 4(c) closes.

## Problem Statement

**A broadcast message does not cost one message. It costs N context re-reads.**

> ### ⚠ FIGURES CORRECTED 2026-08-04 — three layers, and the ARGUMENT SURVIVES ALL THREE
>
> **This paragraph quoted `563.8M / ~$388`. Session 6's own report superseded those figures and
> explicitly named its downstream** — _"Everything downstream that quotes $388 or 563.8M"_ — **and this
> document was that downstream and was not updated for a day.** The correction landing in the report
> and not in the doc citing it is the _partial fix reads as complete_ pattern, with the fix naming its
> own blast radius and still missing.
>
> 1. **Superseded:** the real session-6 figures are **~$166 / 251.7M**, not $388 / 563.8M.
> 2. **Notional:** every dollar figure in these reports is arithmetic on an assumed rate card against a
>    subscription. **No per-token money changes hands.** Tokens are the unit.
> 3. **The headline measures RE-READS, not consumption** (found by the human, 2026-08-04): ~98% of any
>    cumulative total is `cache_read` — the same context re-sent per request. Session 8 measured
>    **median context 313,397 · max 623,634 (under the 1M limit, which is why no compaction fires) ·
>    output 2,224,836 = 0.29% of total.**
>
> **Why the argument is unaffected — and is in fact SHARPENED by (3).** Mute's whole claim is that a
> broadcast costs N context re-reads. **`cache_read` is precisely the quantity mute reduces**, so the
> one metric that is misleading as a cost headline is the _correct_ metric here. **State it as
> cache-read tokens, never as dollars or as "spend".**

`artifact:` Session 6: **251.7M tokens**, of which **~98% was cache read** — six agents re-reading a
large context every turn. The wire's own text was **~92K tokens, well under 0.1% of the total.**
`artifact:` Session 7, staged, was smaller on the same ratio.

**So the wire is free and waking up is expensive.** Session 6 carried 106 messages to 5 other seats
each — on the order of **530 wake-induced turns** at ~241K tokens apiece. _(Derived, not measured:
seats batch, so treat it as a magnitude, not a figure.)_

`artifact:` Session 7 confirmed the mechanism directly: **cost/min $4.66 → $1.74 (ratio 0.373)
against live contexts 7 → 2 (ratio 0.33).** **Burn rate tracks concurrent context count almost
exactly.**

**Session 7 bought that saving by removing the seats, and paid ~50% more wall clock for it**
(83 → 124 min). That is the wrong lever pulled in the right direction. What we actually want to
reduce is **turns**, not **seats** — and the two are only accidentally the same thing.

**What removing the seats also costs, per session 7's own report:** a peer with standing to overrule
the lead, and a durable seat whose context accumulates across the session. scout's conclusion is that
staging's quality benefit came from the **cold reads**, not from the staging — so the staging is a
cost optimisation that happens to discard the team.

## Proposed Solution

**Convene the full team once. Activate selectively.**

The lead mutes non-active seats during implementation and un-mutes them for the moments that need
them: planning, their own lane, peer review, retro, or genuine parallel work. A muted seat holds its
context, stays on the roster, and takes **no turns** — so it costs nothing until it is needed.

### Most of the hard half already exists

Slice two's primitive turns out to be the mute/unmute substrate:

- **`follow` emits a `follow-start` notice with a gap** — `never-followed → null`, `current → 0`,
  `behind → N` — plus the catch-up command (`team-comms.ts:711-723`). **That is the un-mute path,
  already built and already honest about the difference between "you missed nothing" and "nobody can
  tell you."**
- **`comms positions`** reports three states plus `followerAlive` and `staleRecord`.

**What is missing is small by comparison:** the mute switch, suppression inside `follow`, and one new
state.

### The MAP — and it is what makes "don't backfill" honest, not a separate nicety

**The flood is the reason muting is wanted, and un-muting recreates it.** A seat activated after sixty
messages either reads them all (paying the cost muting just saved, at the worst moment) or skips them
blind.

`artifact:` **Measured on the live channel: 40 messages are 157,463 chars of body (~39K tokens) and
4,000 chars of headlines (~1K). A 39.4× reduction, at 100% convention adherence** — every message
already opens `## sender → recipient: HEADLINE`.

`artifact:` **The technique is already proven in use, not just in principle.** All 106 of session 6's
messages were classified into the eight buckets in that session's Tier C **from headline extraction
alone** — the shape of an entire session, at ~1/40th of reading it.

**So the reconnect convention becomes honest rather than merely cheap:** _here is the shape of what
you missed; fetch by id if something matters._ `comms read --id <n>` already exists and is the only
verb that fetches exactly one message — **it is the natural partner to a map and it is already built.**

Without a map, "do not backfill" means "be blind to it." With one, it means "know the shape, pay only
for what you need." **The map is the precondition for the convention, not a complement to it.**

### The activation handoff — three parts, and only one is new

When the lead un-mutes, the seat needs: **where the team is**, **where it left off**, and **what it is
being activated to do.**

| part                                                                                         | status                                                  |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| the gap — where you were, where the head is, the catch-up command                            | **built** (`follow-start`, `team-comms.ts:711-723`)     |
| the map — headlines over the gap                                                             | **small** (first-line extraction)                       |
| the lead's context payload — "you are on; here is where we are; you are taking over from #N" | **new**, and the only part that is irreducibly judgment |

**Do not automate the third.** A summary of the session is a routing decision made by whoever
understands the work, and the lead is the one participant who has been present throughout. A
generated summary would be the tool asserting something no instrument measured — the exact class
this spike keeps ruling against.

### ⚠ The load-bearing requirement: `muted` is its OWN state, never `behind`

**Mute manufactures silence deliberately, on a wire whose defining failure is that silence and
failure are indistinguishable.**

Observed live while drafting this, on the current channel:

```
weaver   state: behind   gap: 7   followerAlive: false
```

**A muted seat would be byte-identical to that.** One is a seat the lead switched off; the other is a
follower that died. A lead who cannot tell them apart has lost a seat and does not know it.

This repo has already won this exact argument twice — `never-followed` is not _"behind by
everything"_, and `gap: null` is not `gap: 0` (Contract 6(c)). **Same rule, third instance:** muted
is not behind.

**And the mute must be recorded where a PEER can read it**, not only in the lead's head. Otherwise
"who is listening?" becomes a question only the lead can answer, and the lead is already a single
point of failure three separate ways.

## The interesting half — this may be a QUALITY feature wearing a cost feature's clothes

**Our single most replicated finding is that blank-context review beats contextual review.**

`artifact:` Session 6 — two blank-context auditors found **six defects in weaver's own files that
weaver's own review found zero of**, one of which instructed an agent to commit the human's repo.
`artifact:` Session 7 — **every** stranger find was a guard that could not fail; **every** owner find
was duplication, staleness, or ordering. weaver stated it against itself: _"I verified that the
warning EXISTS, never that the string RUNS."_

**A muted-then-activated reviewer is closer to blank-context than a seat that watched the build
happen.** So muting may _improve_ review quality rather than trading it away — the opposite of the
intuition that a muted seat is a degraded one.

**Stated as a falsifiable prediction:** a seat muted through an implementation and activated to
review it finds more _"my check cannot fail"_ defects than a seat that watched the implementation
live. **Falsifier:** it finds the same class of defects the owners find (duplication, staleness,
ordering), in which case muting bought cost and nothing else.

### The WARM READ — and it is a different axis, not a middle point

The obvious framing is a Goldilocks amount of context: cold ← warm → saturated on one line. **The
evidence says it is not a line.**

- **Strangers** found _every_ guard-that-cannot-fail.
- **Owners** found _only_ duplication, staleness, ordering.

A seat that helped plan and was then muted through implementation is **not 50% contextual. It is
fully warm on INTENT and fully cold on EXECUTION** — which is exactly the split a reviewer wants: you
must know what it was supposed to do, and you must not be anchored on how it was done.

**That reframes the hypothesis into something stronger and more surprising: the value of a cold read
comes from being cold on EXECUTION, not from being cold on intent** — in which case a warm reader
should **beat** a cold one, because the cold reader must reconstruct intent and will sometimes
reconstruct it wrong.

`artifact:` A hint already exists in session 7: the verifier briefed to **find, not design** filed
three findings, all correct — against a prior round this team measured where **four of four**
reviewer-proposed remedies were wrong. The difference was how much the reviewer was asked to infer.

**Runnable as a third arm, cheaply:** same diff, three reviewers — cold (no context), warm (planning
context only, muted through the build), saturated (present throughout) — and compare defect **class**,
not count. **Falsifier for the whole reframe:** warm and cold produce the same class, in which case
warmth is irrelevant and only distance from the execution matters.

## Scope

**In:**

- **Capability state per seat** — send / receive / listening — one change to identity resolution,
  covering mute, guest (R10), and the human (R12).
- **`muted` as a distinct position state**, readable by any seat via `positions`, never collapsed
  into `behind`.
- **Suppression in `follow`** — a muted follower emits nothing, and its `emittedThrough` does not
  advance, so the existing `follow-start` gap notice does the catch-up work unmodified.
- **Lead verbs** to mute/unmute, and **the mute recorded on the wire** so it is not lead-private.

**Out:**

- **Automatic muting / heuristics.** The lead decides. An automatic mute is a routing decision made
  by a tool that cannot see the work.
- **Per-message addressing** (`--to <handle>`). Related and already filed
  ([addressed delivery](../../backlog/2026-08-01-comms-has-no-addressed-delivery.md)) but a different
  primitive — that one suppresses **one message to everyone else**; this suppresses **everything to
  one seat**. Do not merge them without deciding which is the general case.
- **Muting the lead.** Nothing in the model forbids it; nothing has asked for it.

## Impact & Risks

- **⚠ Risk: muted reads as dead.** The whole reason for the distinct state above. If this is got
  wrong the feature actively degrades the wire's only presence instrument.
- **⚠ Risk: the un-mute flood, and it eats an unknown share of the saving.** A seat activated after
  60 messages pays a large catch-up read at exactly the moment it starts work. **Unmeasured. Measure
  it rather than assuming it is free** — if catch-up costs more than the turns it avoided, the
  feature is theatre.
- **Risk: the lead becomes the router.** Mute makes the lead the arbiter of who knows what, and a
  forgotten un-mute silently removes a seat from the session. Mitigation: `positions` shows muted
  seats to everyone, so any peer can notice.
- **Risk: it makes the team look cheaper than it is** by moving cost from the session into the
  catch-up. See the measurement below.

## Open Questions

1. **Does a muted seat's `emittedThrough` freeze, or advance silently?** Freezing gives an honest gap
   and a real catch-up; advancing makes un-mute cheap and **lies about what the seat has seen.**
   Recommend freezing, but this is the ratify.
2. **Is "muted" a property of the seat or of the follower?** A seat with two followers, one muted, is
   incoherent — decide where the state lives before building.
3. **What happens to a `send` from a muted seat?** Muting is about receiving. A muted seat that
   speaks is probably fine and possibly the point.
4. **Does the human's presence on the wire (R12) block this?** They share a change; they need not
   ship together.

## Success Criteria

> **Written to weaver's session-7 epitaph, deliberately:** _"a check aimed at the thing you can SEE,
> rather than at the thing that would FAIL, is worse than no check — it retires the question."_ The
> visible thing here is **muted seats take fewer turns**, which will obviously be true and proves
> nothing. Each criterion below is therefore aimed at the way this feature would fail while looking
> like it worked.

- **⚠ TOTAL session cost falls — not just per-turn or per-minute cost.** The failure mode is that the
  un-mute catch-up eats the saving and the session ends up costing the same with more ceremony.
  **Per-minute cost is the thing I can see; total is the thing that would fail.** Publish both, and
  if total does not move, **the feature is theatre no matter how good the rate looks.**
- **The un-mute catch-up cost is measured as its own line item**, per activation. Not folded into the
  session total, where it cannot be told from the saving it is cancelling.
- **A muted seat is distinguishable from a dead one by any seat, in one command** — not by the lead,
  not by inference. **The control:** kill a follower and mute a follower in the same session, and
  show the command telling them apart. _(sentinel's epitaph: a result must come from a run that also
  demonstrated it can produce the other answer.)_
- **Cost per minute tracks the UNMUTED context count, not the roster.** If it tracks the roster, mute
  is saving nothing and something else is waking the seats.
- **At least one thing here turns out unnecessary** — slice one's framing check, which has held twice.

### The criterion that answers the question none of the others do

**Count the findings whose provenance requires two or more seats.**

Every measurement this project has taken so far — tokens, turns, commits, defect class — can be
matched by isolated subagents. **This is the one currency they cannot pay in**, because a subagent
returns to the lead and never to another subagent.

`artifact:` Two exist and are identifiable in the record:

- _"The shared tree was doing integration testing for free"_ — scout's observation, forager's
  mechanism. **Neither seat had it alone.**
- **`followerAlive`** — steward's declined-to-contract observation, built into the tool by forager,
  specified by nobody.

**If this count is zero across several sessions, the intersections are producing nothing and the
durable team is decoration.** If it is consistently non-zero, that is the answer to _"what does this
give us that isolated agents would not"_ in the only form that is not a feeling.

**⚠ And it needs a control, or a zero is uninterpretable** — sentinel's rule, applied to a metric
rather than a command. A zero could mean _no cross-pollination happened_ or _my counting method
cannot see it_, **and those are indistinguishable without a positive control.** So: before trusting a
zero, run the counting method over session 6 and confirm it finds the two above. **A metric that has
never been shown to produce a non-zero is not evidence of absence.**

## What the SEATS' own epitaphs say about this proposal

Checked against the living docs before handing this over, because three of them land on it directly.

- **weaver (new, session 7) — _"you will measure the wrong property and call it verified."_** Applied
  above: the success criteria were rewritten to aim at total cost rather than at the visible rate.
  **The original draft of this file failed weaver's test**, and the epitaph caught it before a seat
  had to.
- **sentinel — _"a control, in the same command, every time."_** Applied twice: to the muted-vs-dead
  criterion, and to the cross-seat count, which without a positive control cannot distinguish
  _nothing happened_ from _I cannot see it_.
- **forager — _"an instruction will sometimes be wrong in a way only you can see, and complying with
  it will look like cooperation."_ This proposal specifies mechanism inside forager's surface and
  forager should expect it to be wrong.** One specific hazard, named so it is falsifiable rather than
  discovered: **if mute is implemented by stopping the follower process, `followerAlive` goes false
  and a muted seat becomes byte-identical to a dead one — defeating this proposal's single
  load-bearing requirement.** The mute must suppress _emission_ while the follower lives. **If that
  is not achievable, say so before building; the requirement, not the implementation, is what
  matters.**

## References

- [Session 6 measurements](../../reports/2026-08-03-session-6-measurements.md) — the cost model, and
  the correction that made it right.
- [Session 7 measurements](../../reports/2026-08-03-session-7-measurements.md) — burn rate vs context
  count; the owner-vs-stranger defect split; scout's conclusion that the cold reads did the work.
- [R10](../_archive/team-comms-spike/slice-two-proposal.md) guest identity · [R12](../_archive/team-comms-spike/slice-two-proposal.md) the human cannot send.
- [Addressed delivery](../../backlog/2026-08-01-comms-has-no-addressed-delivery.md) — the adjacent
  primitive this proposal deliberately does not absorb.

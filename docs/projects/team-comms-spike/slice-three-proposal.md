# Slice three — the wire knows who is listening

**Status:** Draft, for the seats to ratify · **Created:** 2026-08-03 · **Author:** maestro
**Origin:** the human, after session 7's measurements
**Follows:** [slice-two-proposal.md](./slice-two-proposal.md) · [session 6 measurements](../../reports/2026-08-03-session-6-measurements.md) · [session 7 measurements](../../reports/2026-08-03-session-7-measurements.md)

---

## Overview

**One primitive, and it replaces a binary that was never rich enough.**

Today a handle is either **on the roster** or **not**. That single bit has to stand in for every
question the wire actually gets asked: may this participant send? may it receive? is it listening
right now? Three separate features have already been blocked on it —

| wanted                                       | what it needs                   | filed as             |
| -------------------------------------------- | ------------------------------- | -------------------- |
| an observer that cannot contaminate          | position + receive, **no send** | R10 (guest identity) |
| the human on the wire                        | send, **no seat**               | R12 (unresolved)     |
| a seat that stays convened but stops burning | send, **suppressed receive**    | this proposal        |

> **The primitive: per-seat CAPABILITY STATE on the wire — send, receive, and listening — replacing
> rostered-or-not.**

steward's observation in R12 is the reason these are one piece of work and not three flags: guest and
human-on-wire are _"the same missing thing inverted."_ **Mute is its third face.** Building them
separately means three passes over `resolveSeatIdentity` and three chances to reopen the free-form
alias hole Contract 4(c) closes.

## Problem Statement

**A broadcast message does not cost one message. It costs N context re-reads.**

`artifact:` Session 6 spent **563.8M tokens / ~$388**, of which **98.1% was cache read** — six agents
re-reading a large context every turn. The wire's own text was **~92K tokens, 0.017% of spend.**
`artifact:` Session 7, staged, spent **~$215** at **0.013%** on the wire.

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

- **Cost per minute tracks the UNMUTED context count, not the roster size.** Directly falsifiable —
  if it tracks the roster, mute is saving nothing and something else is waking the seats.
- **A muted seat is distinguishable from a dead one** by any seat, not just the lead, in one command.
- **The un-mute catch-up cost is measured and published**, not assumed.
- **At least one thing here turns out unnecessary** — slice one's framing check, which has held twice.

## References

- [Session 6 measurements](../../reports/2026-08-03-session-6-measurements.md) — the cost model, and
  the correction that made it right.
- [Session 7 measurements](../../reports/2026-08-03-session-7-measurements.md) — burn rate vs context
  count; the owner-vs-stranger defect split; scout's conclusion that the cold reads did the work.
- [R10](./slice-two-proposal.md) guest identity · [R12](./slice-two-proposal.md) the human cannot send.
- [Addressed delivery](../../backlog/2026-08-01-comms-has-no-addressed-delivery.md) — the adjacent
  primitive this proposal deliberately does not absorb.

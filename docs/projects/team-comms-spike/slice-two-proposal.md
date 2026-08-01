# Slice two — comms knows where each seat is in the log

**Status:** Draft, for the seats to ratify · **Created:** 2026-08-01 · **Author:** maestro
**Follows:** [session-2-friction.md](./session-2-friction.md) · [`.anthill/retro.md`](../../../.anthill/retro.md)

---

## Overview

**One primitive, and five things fall out of it.** Slice one gave comms an id and a body. Every
convention both this team and StoryLoam's invented since is **compensating for metadata the tool
does not carry** — so the work is not "add features," it is **promote what the conventions are
already carrying by hand.**

> **The primitive: comms records, per seat, how far through the log that seat has been delivered.**

## Problem Statement

Slice one's known gaps stopped being predictions and got costed.

**A1 — a lead reading quietly and a lead who is gone are byte-identical.** `artifact:` one 9.85h
window, three cards parked, one untracked file, and the escalation path that worked was **a human
noticing.** comms has no presence, and `anthill status` reports the _grapevine_ roster, so the only
instrument lives on the other wire and nothing prompts anyone to re-run it.

**A follower that dies takes its own recovery with it.** `follow` starts from the current end, so a
re-armed monitor cannot tell whether it missed nothing or missed forty messages. Demonstrated when
one `pkill` killed all four seats' monitors at once.

**Crossing is frequent and only diagnosable after the fact.** Both teams independently invented
read-watermarks — _"as of #N"_ — because **there is no way to know whether a message was read before
someone acted.** StoryLoom logged at least three real incidents: a migration applied while a STOP was
in flight; a ruling written after a correction it did not see; a hold placed on paths already
committed. **None was carelessness. All three were correct actions on a stale read.**

## Proposed Solution

Persist a per-seat position, then:

| falls out                       | what it does                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Presence**                    | a seat whose position has not moved is idle or gone — comms can finally say something about who is on it                                               |
| **Resumable `follow`**          | `--since <position>`, so a re-armed monitor **backfills** instead of silently starting from now                                                        |
| **Crossing detection**          | compare a sender's position against the log head: _"#16 was written without having seen #13–#15"_                                                      |
| **Send-time staleness warning** | _"3 messages have arrived since you last read. Send anyway?"_ — **watermarks diagnose crossing; this catches it at the only moment it is preventable** |
| **Guest identity**              | a participant with a position and no send rights                                                                                                       |

**The send-time warning is the highest-value item** and it is not ours — it is StoryLoom's, and it is
built on the same primitive as everything else.

## ⚠ The seam — delivered is not read

**This is the contract, and getting it wrong makes the feature dishonest.**

- **The tool can only know what was DELIVERED.** A byte was emitted to a process. That is an
  **artifact**.
- **The convention asserts what was READ** — an agent stating what it had taken in before forming a
  view. That is **testimony**.

**They must not share a field.** An agent can be delivered `#14` and not have processed it; a tool
stamping `readAs: 14` would make an assertion the agent never made, and be **less honest than the
hand-written line it replaces.**

> **Two fields, two meanings.** `deliveredThrough` — stamped by the tool, always, labelled as
> delivery. The **hand-written watermark stays available** for the case it was invented for: _"I am
> telling you my verdict predates your evidence."_

**Crossing detection runs off the measurement; the human-facing convention keeps carrying intent.**

**Owner:** forager owns what the field contains. **Pointed at from:** weaver, who owns what the prose
promises about it. _Ratify at:_ which tier each value lives in and what each one claims — **not** the
field names, the storage format, or the poll interval.

## Scope

**In:**

- Per-seat position, persisted (`follow` records as it emits; `read` records on exit).
- `follow --since <position>`; presence derived from position freshness.
- Send-time staleness check, with the `deliveredThrough` stamp.
- **`send --dry-run`** — four diagnostics hit the permanent log in one session, one per participant.
  Independent of the primitive; cheap; stops the record being polluted by people auditing it.
- **`read --last N`** — the anchor gap. `read` has no way to get a recent id, so catching up means
  reaching past the CLI to `tail` the NDJSON.

**Out:**

- **Guest identity.** Needed to ship comms to another project, **not** needed to create `scout` —
  a rostered observer is just a seat. Demoted below the items above.
- **Threading, reply-to, channel clearing.** Nobody has reached for them.
- **The heartbeat fix** — that is bounty, not comms. Filed separately.

## Impact & Risks

- **Risk: the staleness warning becomes the heartbeat.** A prompt that fires constantly and is
  usually ignorable **trains its audience to discard the channel**, which is worse than the gap it
  closes. **The guard: it must fire on a real delta, not on a timer**, and the threshold has to be
  answerable to _"would a genuinely stale send look different from this at a glance?"_
- **Risk: `deliveredThrough` gets read as "read."** Mitigated by the seam above, and it is the thing
  most likely to erode — a later refactor "simplifying" two fields into one would undo it silently.

## Open Questions

1. **Where does the position live** — beside the log, in the log, or in the footprint? Storage is the
   owner's call; the ratify is about what the value _means_.
2. **Does presence need a heartbeat, or is position-freshness enough?** Freshness is free and
   requires no new signal.
3. **What is the staleness threshold**, and is it a count or a time?

## Rulings — 2026-08-01, session 5 (this section is the durable record; the wire is not)

**Why this section exists.** These decisions were made on `comms`, and **`.anthill/comms/` is gitignored** (`.gitignore:44`, _"per-session conversational state, like scratch"_).
The wire that carried them evaporates exactly like the grapevine does.
Landed here mid-session rather than at finalize, because a decision that outlives the session must be in an artifact before finalize or it is gone when the panes close.

**The proposal above is left as written.** It is the record of what was proposed; the rulings below are the record of what survived contact with the owners. Where they conflict, these win.

### R1 — the artifact-tier field is `emittedThrough`, not `deliveredThrough`, and `follow` stamps it

**The tool cannot observe delivery at all.** Between `follow`'s `emit()` and the agent sit a pipe buffer, the Monitor harness and 200ms batching. A field stamped at emit time but named for delivery **reports a seat as current at the exact instant its wire dies** — H8 reproduced inside the fix for H8, shipping as green.

Neither writer nor follower observes delivery. Follower-side, named for what it can support.

### R2 — `read` records nothing; position lives on `follow` alone

A per-seat position needs a seat identity, and `read` **declares `--as` and explicitly refuses it** — recognised-and-refused, by decision, so the catch-up verb stays reachable for a half-joined agent (Contract 4(c-bis)). Accepting `--as` there would undo that protection; recording ambiently is forbidden by Contract 4(c).

**The honest loss, not a gap to paper over: a seat that only ever `read`s has no position and is invisible to presence.**

### R3 — crossing detection is licensed in one direction only

The tool may report **what did not reach a follower**. It may never report **what a seat had taken in**.

_"Your correction had not been emitted to her follower when she sent"_ is supported. _"She had seen your correction and sent anyway"_ is an **accusation the artifact cannot license** — and it is the sentence a writer reaches for first.

### R4 — presence is head-lag, not wall-clock freshness, and it has three values

The table above (_"a seat whose position has not moved is idle or gone"_) omits the common third reading: **nobody sent anything.** On a silent channel no position moves, so freshness reports every live follower as stale — during precisely the quiet stretch where a real drop is least noticeable. Last session's `pkill` window was quiet.

**Measure `head - emittedThrough`.** Zero for every live follower regardless of traffic; grows only for one that has stopped consuming.

Three distinct values, **never a nullable field**: `never followed` (no record) · `current` (lag 0) · `behind by N`. Collapsing the first two re-introduces the ambiguity removed from `--since`.

**Its honest limit:** head-lag convicts a dead follower only **once someone sends**. The complement is R5.

### R5 — self-observed delivery is a third tier, and it is the only liveness check that works on a silent channel

A seat's own `send` returns to it through its own `follow` — past the pipe buffer, the harness and the batching. That is a genuine end-to-end delivery observation, **about oneself only**, needing no field, no storage and no contract change. Three seats did it accidentally at join.

Recorded **specifically so R1's honest narrowing does not later read as "delivery is unknowable."** It is knowable — just not by the tool, and only about oneself.

**Open, not ruled:** an active self-probe needs a real emission, which pollutes the permanent log — the concern `send --dry-run` exists to address, and a dry-run cannot serve as the probe because it never traverses the follow loop. Owner's call.

### R6 — OQ2 does not close as "freshness is enough"

Superseded by R4 as the measure. Whether a heartbeat is additionally required is open. If it is, keep weaver's separation: **a liveness beat nobody reads is a different animal from a send-time prompt everyone must dismiss.**

### R7 — the warning string is where the honesty is spent, and no rename reaches it

`"3 messages have arrived since you last read. Send anyway?"` (line 45) says **read**. It is the highest-traffic string the primitive will emit and **it survives every field rename.** `emittedThrough` is correct and never appears in the user's field of view.

Honest form: `"3 messages have been added since #140 was emitted to you. Send anyway?"` — the number is a measurement, the verb is one the tool can support.

_(The claim that this string also appears inside the risk paragraph was **withdrawn**: it occurs once, at line 45. Naming a risk and leaking it are not the same act. The finding stands at n=1; the self-referential framing does not.)_

### R8 — one exclusivity semantic for `read --since` and `follow --since`, stated once

`--since` is **exclusive** (`--since 139` returns `[140,…]`). This already cost the team one off-by-one, in the lead's own joining instructions. **Open: the owner states the rule for both verbs before the second is built.**

### R9 — the verdict on Success Criterion 1, and the refinement that changes what to build next

**Success Criterion 1 — _"a seat can tell whether its own wire is alive, without an external notification"_ — is NOT MET.**

We built **peer**-observability. The evidence is the session's own record: forager's follower ran pre-primitive for ~40 minutes, streaming correctly and recording nothing. He could not tell — not from `ps` (the process was alive), not from his stream (messages arrived), not from the position file (its absence is also what a dead follower produces). **A peer told him**, which is the external notification the criterion forbids.

**Recorded as a failure rather than a nuance because the drift was available and cheap:** the criterion would have survived being restated as _"a team can tell whether a seat's wire is alive"_ — true, useful, shipped, and not what was written down. A scorecard drifts by restatement, not by lying.

**THE REFINEMENT (sentinel, measured — it qualifies the verdict without softening it):**

| property                      | verdict                                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **passively** self-observable | **NO.** Silence and death are identical from the inside; no stored position changes that.                                                                                                                 |
| **actively** self-probeable   | **YES.** Measured: a seat's own `send` returns through its own follow — alive → echo, killed → no echo, **with both sends confirmed present in the log** so the probe measures the wire and not the send. |

**So _"a seat cannot know"_ is false; _"a seat is never told"_ is true.** The gap is not knowledge — **nothing prompts the question.** Same shape as this team's standing scar that correct waiting produces no signal.

**That makes the follow-up a TRIGGER, not an instrument** — materially different from "build more observability", and the reason this refinement is worth more than the verdict it qualifies.

**THE SHARPER VERDICT (scout, timestamped) — and it is the one to carry:**

    steward demonstrates echo-as-liveness   comms #144   ts 1785621340.981
    8d4569d (the primitive) committed                    ts 1785621853
    the technique predates the primitive by             ~8.5 minutes

**The echo round-trip needed no part of slice two.** It existed in slice one, was demonstrated on the wire at join, and **three seats independently confirmed their own wires with it before the primitive existed.**

So the honest three-part verdict:

1. **The primitive does not meet SC1.** Unchanged.
2. **SC1 was already satisfiable at session start**, by a capability the team held and never recognised as the answer. **We spent a session building toward a criterion a technique already in our hands satisfied.**
3. **The gap was never capability. It was that nobody named what they already had, and nothing prompts the question.**

**What today actually added is sentinel's control** — both sends present in the log while only the live follower echoed — which converts a habit into an instrument. **The technique existed; the proof that it measures the wire rather than the send did not.**

**Also measured: `send --dry-run` provably cannot serve as the probe.** Fresh live follower — dry run → no echo; real send seconds later on the same follower → echo. The dry run genuinely never traverses the follow loop. **Price of a real probe: one permanent line in a log nothing ever clears.** No cheaper instrument exists in the current surface.

**H8 survives and should be kept.** The probe does not falsify it — the wire still reports nothing on its own; something _outside_ the wire can interrogate it, which is a different and arguably more useful claim.

**Falsifier for the refinement:** _a seat that runs the echo probe after any suspicious quiet period detects a dead wire in one round-trip, every time._ If that fails, the probe is unreliable and the verdict stands unqualified.

### Team rule adopted this session (not comms-specific)

**Whoever certifies a convergence names the shared input both parties read first.** Producer/consumer convergence is this team's ratify signal; an unqualified convergence claim is the "agreement is not truth" failure wearing a ratify badge. Adopted after a convergence was certified by timestamp without naming that both parties had read the same proposal — and then re-committed by the lead one message later.

## Success Criteria

- **A seat can tell whether its own wire is alive** without an external notification. Directly
  falsifiable against H8.
- **A re-armed follower backfills.** No silent gap.
- **A crossing is visible at send time**, not only reconstructed afterwards.
- **At least one item here turns out unnecessary.** Slice one's framing check, and it held once.

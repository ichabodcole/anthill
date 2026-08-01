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

## Success Criteria

- **A seat can tell whether its own wire is alive** without an external notification. Directly
  falsifiable against H8.
- **A re-armed follower backfills.** No silent gap.
- **A crossing is visible at send time**, not only reconstructed afterwards.
- **At least one item here turns out unnecessary.** Slice one's framing check, and it held once.

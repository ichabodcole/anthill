# Read-watermarks are a convention two teams invented independently — make them tooling

**Added:** 2026-08-01 · **Status:** ready to design · **Seat:** forager (comms)
**Evidence class:** the strongest we have — **two teams, no contact, identical invention**

## The gap, in the reporting lead's words

> **"Whether a message had been read before a seat acted on the thing it concerned. This is the big
> one, and it caused every message-crossing incident we had."**

StoryLoom logged at least three real incidents from it: a migration applied while a hold was in
flight; a ruling written before a correction arrived; a hold placed on paths already committed.

## Why this outranks a normal feature request

**Both teams invented the same convention, independently, with no contact.** Seats began stamping
_"as of #N"_ — the highest message id read before writing — and nobody specified it on either side.
Their lead's read, and it is the right one:

> _"Two teams independently inventing read-watermarks is the strongest evidence either of us has that
> the gap is in the tool and not in our taste."_

**What the convention does:** it does **not** prevent crossing. It makes crossing **diagnosable after
the fact** — and both teams found that was enough. That is a low bar for tooling to clear.

**Its cost today:** every seat writes it by hand, every message, and it is self-reported.

## Where the tool already is

`comms follow` computes a byte offset as it streams — **but it is process-local and dies with the
process.** Nothing is persisted, so nothing else can read it. There is no per-seat read position
anywhere in comms.

## Three tiers, ascending

1. **Persist a per-seat position.** `follow` records the highest id it has emitted to a seat; `read`
   updates it on exit. Somewhere like `.anthill/comms/.read/<handle>`.
2. **Stamp it on `send`** automatically, so the seat does not hand-write it and cannot mis-state it.
3. **Detect the crossing on delivery — the actual win.** If `#16` was sent at position 12 and
   `#13`–`#15` exist, the reader can be told: _"#16 was written without having seen #13, #14, #15."_
   **That converts a manual after-the-fact diagnosis into an automatic one at the moment it matters.**

## ⚠ The design trap — delivered is not read

**This is the part to get right, and getting it wrong would be a regression.**

- **The tool can only know what was DELIVERED.** That is an artifact: a byte was emitted to a process.
- **The convention asserts what was READ.** That is testimony: an agent stating what it had taken in
  before it formed a view.

**They are different claims and must not share a field.** An agent can be delivered `#14` and not
have processed it; a tool stamping `readAs: 14` would be making an assertion the agent never made,
and would be _less_ honest than the hand-written version it replaces.

**So: two fields, two meanings.**

- `deliveredThrough: <id>` — stamped by the tool, always, and labelled as delivery.
- the **hand-written watermark stays available** for the case it was invented for: _"I am telling you
  my verdict predates your evidence."_ An assertion, deliberately made.

**Crossing detection should run off `deliveredThrough`** (the measurement), while the human-facing
convention keeps carrying intent. Same distinction as artifact-vs-testimony, applied to a field.

## It is the same primitive as three other open items

A persisted per-seat position is **exactly what a resumable `follow` needs** (`follow --since
<position>`, so a re-armed monitor backfills instead of silently starting from now). And **presence
can be derived from its freshness** — a seat whose position has not moved is either idle or gone,
which is more than comms can say today.

**Presence, resumable follow, liveness detection, and crossing detection all reduce to "comms knows
where each seat is in the log."** That is one feature, and it is slice two.

## Provenance

Surfaced in a blind cross-team check-in. Recorded here because it existed only as a **convention** —
in the SOP, three skills, `seams.md`, several seat docs, and both spike friction logs — and **as a
tooling item nowhere.**

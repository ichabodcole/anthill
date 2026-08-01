# `comms` has no addressed delivery, so independent collection is impossible by construction

**Added:** 2026-08-01 · **Status:** needs a design pass before it is buildable (the requirement is measured; the shape is not decided)
· **Seat:** forager (the comms wire) · **Found:** by two seats, disclosed against themselves, during a finalize that had been deliberately re-ordered to buy independence

`comms` broadcasts. Every seat holds a live `comms follow`, so **every message is pushed to every
participant as it lands.** The `## sender → recipient:` header is a **salience hint, not routing** —
by design, and correctly so for discussion.

**There is no way to send one seat a message the others do not receive.** That is the gap.

## The measured failure

Session 5's finalize inverted the shipped ritual at the curator's request: **retro answers collected
BEFORE seat-doc synthesis**, so the answers would be independent. The lead granted it.

**The wire voided it silently.**

- **weaver** disclosed that the curator's answers arrived in his Monitor **while he was composing his
  own**, and that he had received the headline.
- **sentinel** disclosed the same, unprompted, for two answer-messages.
- **Contamination therefore decreased monotonically with answer order — and the curator answered
  first.** The one seat holding the pen was the one seat with none.

**That is worse than not ordering at all**, and nobody could have complied: a live follower cannot
decline delivery.

## What it is not

**Not a bug.** Broadcast is the right default for a discussion channel and nothing misbehaved. The
gap is that **the ritual now has a step whose precondition the tool cannot supply.**

**Not solved by discipline.** "Don't read it" fails at the notification, before any agent decides
anything — the same reason a prose guard loses to a mechanical one (H1, confirmed against the lead
this session).

## The requirement, stated so a design can be judged against it

A curator must be able to collect N answers where **no answer is delivered to any other answerer
until collection closes.** Minimum viable shape is a **per-seat return to one recipient**, not a
message to the channel.

Open, and genuinely undecided:

- Is this a new verb, or a `--to <handle>` on `send` that suppresses delivery to others?
- Does the log still record it (durability) while `follow` withholds it (delivery)? **Those are
  separable**, and the answer decides whether this touches `CommsMessage` — a durable-format change —
  or only the follow loop.
- **Careful with the identity interaction:** `--as` is a namespace check, not authentication, so a
  "private" channel here is private by convention only. **Do not let the prose promise
  confidentiality the wire cannot enforce** (Contract 4(c), Contract 5(b)).

## Why it is worth building rather than dropping the ritual step

The independence the ordering was meant to buy is the one defence a retro has against **agreement
being mistaken for truth** — the failure this repo already has a scar for, where a retro was wrong
in ways that flattered everyone and only a reader with no context caught it. **A single-model team
converges cheaply; separately-formed answers are the only in-band counterweight.**

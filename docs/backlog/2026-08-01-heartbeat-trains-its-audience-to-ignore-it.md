# The card heartbeat is correct, meaningless, and trains leads to discard the channel

**Added:** 2026-08-01 · **Status:** ready to design (the fix is a unit question, not a threshold one)
· **Reported by:** shahrazad, StoryLoom lead, unprompted · **Severity:** worse than the gap it covers

## What happened, in the reporter's words

A card sat in `doing` for an entire ~14h session. The board heartbeat fired on it repeatedly:

```json
{
  "type": "heartbeat",
  "taskId": "t-544c1a0f",
  "owner": "hurston",
  "overdueByMs": 48923813,
  "expectedMinutes": 20
}
```

**~13.6 hours overdue against a 20-minute estimate.** It fired **at least five times** that the lead
personally received — a lead who had **deliberately wired the board tail this session** precisely
because she'd only tailed the vine last time and let cards go stale.

**She received every one and acted on none.**

**Nobody was stuck.** The seat was working productively throughout; the card was a multi-hour lane
estimated at 20 minutes. At session end the seat deliberately kept it open:

> _"my card stays `doing` DELIBERATELY — T3-T5 is not finished and I will not close it to tidy the
> board."_

**Which was the right call, and made the alert permanent.**

## Why this outranks the gap it was built for

> _"A signal that fires constantly and is correct-but-meaningless trains its audience to ignore the
> channel it arrives on. By the end I was pattern-matching `"type":"heartbeat"` and discarding
> without reading — which means **if a heartbeat had fired for a genuinely stuck seat, I would have
> discarded that too.**"_

> _"Your instrument worked, told the truth, and I learned to ignore it inside one session."_

The blocked-seat problem is a **coverage gap** — no signal exists. This is worse: **the coverage
exists and its audience was trained out of using it**, by the instrument being reasonable and the
team being reasonable. Nobody did anything wrong.

## The diagnosis is the fix, and it is hers

> **The heartbeat assumes a card is a unit of _work in progress_. Theirs are frequently units of
> _ownership over a lane_. Those have completely different time constants and share one column.**

So this is **not** a threshold-tuning problem. Raising the timeout produces an alert that is late for
short cards and still permanent for long ones. **The unit is wrong, not the number.**

Directions, none chosen:

- **Let a card declare its kind** — a lane card and a task card get different clocks, or a lane card
  gets none.
- **Alert on the derivative, not the absolute** — a card that is overdue _and whose owner has gone
  quiet_ is a signal; overdue alone is not. Note this composes with the reporter's own heuristic:
  **~10 messages of silence while holding `doing` → look at the pane.**
- **Let the owner acknowledge once** and suppress until something changes. Her seat _told the team_
  the card was deliberately open; the board had no way to record that.
- **Escalate, don't repeat.** A signal that repeats identically is discardable by construction.

## Guard on any fix

**A fix that makes the heartbeat quieter without making it more meaningful is worse than nothing** —
it preserves the training-to-ignore while reducing the chance of catching a real stall. Whatever
lands should be testable against the reporter's own question: _would a genuinely stuck seat be
distinguishable from this card, on this channel, at a glance?_

## Provenance

Volunteered in a blind cross-team check-in — the reporter was not told what we were looking for, and
this was not an answer to any question asked. **She offered no proposal**, deliberately: _"you asked
what happened."_ n=1, one team of five on a shared tree; she said so herself and said to weight it
accordingly.

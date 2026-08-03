# `convene` wires every seat and never the lead

**Added:** 2026-08-01 · **Status:** ready to build (small; the pattern already exists)
· **Seat:** forager (CLI) · **Found:** by the human, after the lead went unmonitored for a session

> **⚠ MERGE BLOCKER (B2) as of 2026-08-03.** This is no longer only a lead-ergonomics fix. The human
> set the bar for merging `feat/team-comms-slice-one`: comms must be able to run as the **sole** wire,
> with grapevine as a re-armed backup. **An unwired lead is survivable with grapevine armed and fatal
> without it.** See R11 in
> [slice-two-proposal.md](../projects/team-comms-spike/slice-two-proposal.md).

## The asymmetry, from one session's output

```
anthill join <handle>  → tailCommand, boardTailCommand, comms { channel, incantation }
anthill convene        → channelOpened, boardOpened, topicSet, board, leadDoc, warnings
```

**`join` hands a seat three fully-resolved wires. `convene` hands the lead none.** The lead is the
only participant the CLI has never wired, and it is the participant whose disappearance stalls
everyone.

## What it cost

The lead ran a session with **no Monitor on either wire**, polling the log by hand between actions.
Consequences, all measured:

- **No grapevine presence.** Presence registers _via the tail_, so an unwired lead is absent from the
  one instrument that could show it. `anthill status` was correct to omit him.
- **Rulings crossed three in-flight messages, twice** — traffic was only seen when he chose to look.
- **When the session was interrupted, nothing could tell the team.** The recovery path was **a human
  noticing and saying so** — not a mechanism.

**Then it happened again, minutes after being diagnosed:** a fresh channel was opened for a
cross-team check-in and the opener's own tail was, again, not wired. Same shape, same session,
after the lesson.

## Why the CLI cannot just do it

**`Monitor` is a harness tool only the agent can invoke.** A Bash command cannot reach into the
agent's tool use. So the CLI's only lever is the one `join` already pulls: **emit a fully-resolved
incantation the agent runs verbatim.** Contract 4(a) already governs the shape. **This is not new
machinery — it is an existing, proven pattern applied to the one participant it was never applied to.**

## Idempotence — presence is the check

The risk is a lead re-running `convene` mid-session and wiring a **second** monitor on one channel,
giving itself duplicate notifications. **Grapevine presence already answers this**, because presence
_is_ a side effect of tailing: if the lead appears in `present`, they are tailed.

So `convene` can report _"you are / are not currently on this vine"_ as a **measured fact** and emit
the incantation accordingly. No guessing, no clobbering.

**Note what this does not cover: `comms` has no presence**, so the same check is impossible there —
which is another instance of presence being load-bearing for something that looks unrelated.

## ⚠ Does this contradict "situational warnings fail"?

**No, and the distinction should be stated in the fix**, or someone will read the principle and
conclude an emitted reminder cannot work.

- A **situational warning** requires you to recognise that _this moment_ is an instance of the
  warned-about class. That recognition is where it fails.
- **An instruction delivered at the moment of the action, inside output you are already reading, has
  no recognition step.**

That is why `join`'s emitted manifest has worked in every session while prose guards went 0-for-4.

## Related

Same family as the ordering fix already made to `convene`'s grounding step, and to
`2026-08-01-read-watermarks-should-be-tooling-not-convention.md` — a lead who is wired is also a lead
whose read position is known.

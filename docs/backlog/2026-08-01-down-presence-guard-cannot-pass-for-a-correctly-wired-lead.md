# `anthill down`'s presence guard can never pass, because the lead must be present

**Added:** 2026-08-01 · **Status:** ready to build (the guard needs to exclude the lead, or count something other than presence)
· **Seat:** forager (CLI) · **Found:** by the lead running the last step of `finalize-session`, on a fully finalized six-seat session

> **⚠ MERGE BLOCKER (part of B1) as of 2026-08-03, and the failure INVERTS.** Presence is a side
> effect of holding a tail. If comms becomes the sole wire (the human's merge bar — R11 in
> [slice-two-proposal.md](../projects/_archive/team-comms-spike/slice-two-proposal.md)), seats stop holding
> vine tails, `grapevine who` goes empty, and this guard flips from **never passing** to **always
> passing** — tearing down a live team in silence. **The flip reads as a fix, because it stops
> nagging.** So repointing the guard at comms presence is not optional cleanup; it must land in the
> same change that gives comms presence, or the sole-wire session runs with no teardown guard at all.

`anthill down` refuses while seats are present:

```
{"ok":false,"error":"seats still present on the vine: forager, maestro, scout, steward, weaver.
 They haven't stood down — finalize them first, or re-run with --force to tear down anyway."}
```

**`maestro` is in that list. The lead is always in that list.**

## Why it cannot pass

Presence is a **side effect of holding a tail**. The lead is explicitly required to hold one — an
unwired lead is an unmonitorable lead, which is a scar already recorded in `dev/maestro.md`: a lead
who never wired his own tails was invisible to `anthill status` for a 10-hour window and nobody could
detect it.

So the lead is **required to be present** and `down` **refuses while anyone is present**. A lead doing
the job correctly can only ever tear down with `--force`, which makes the guard advisory in every real
session and trains the operator to reach past it by default.

## What the guard is actually for, and why it still matters

Its purpose is a backstop against **yanking a seat out mid-ritual** — a torn-down pane cannot
synthesize, and knowledge capture is the whole point of finalize. That is a good guard. The session
that found this had six of six seats confirmed with verified shas and a clean tree, so the condition
the guard protects was satisfied while the guard still refused.

**A guard that fires on every correct run is indistinguishable from one that is broken**, and the
operator learns to pass `--force` without reading it — at which point it protects nothing on the run
where it would have mattered.

## Options, none of them ruled

- **Exclude the lead from the count.** Smallest change. But it silently assumes the lead's own
  finalize is done, which nothing checks.
- **Count something other than raw presence** — seats that have not confirmed stand-down, if
  confirmations become machine-readable rather than prose on the wire.
- **Say what it is really asking.** If the honest guard is _"the lead should eyeball this"_, then the
  message should not name the lead as a blocker among the seats it is warning about.

**Related:** the same class as
[`convene --fresh` reporting success when it no-ops](./2026-08-01-convene-fresh-reports-success-when-it-no-ops.md)
— a check whose output does not distinguish the case it exists to catch from the case that always
happens.

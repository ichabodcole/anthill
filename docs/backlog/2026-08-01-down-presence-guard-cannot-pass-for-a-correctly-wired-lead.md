# The lead blocks its own `anthill down`, and no shipped surface tells it to stand itself down

_(Filed 2026-08-01 as **"the presence guard can never pass"** — that title is corrected below and kept
for searchability.)_

**Added:** 2026-08-01 · **Amended:** 2026-08-08
**Status:** 🔴 **NOT ready to build as written — the premise is falsified and the proposed fix is
forbidden by field evidence.** Re-scoped: the defect is a **documentation and emission** gap, not a
predicate change.
· **Seat:** forager (CLI) · **Found:** by the lead running the last step of `finalize-session`, on a
fully finalized six-seat session

> ## 🔴 AMENDED 2026-08-08 — READ THIS BEFORE BUILDING ANYTHING FROM THIS CARD
>
> Two things this card says are now wrong, and **a fresh agent building from it would ship the fix a
> consuming team has explicitly warned against.** That is the worst shape a backlog item can take: it
> converts diligence into a defect.
>
> **1. "Can never pass" is FALSIFIED.** `comms stand-down` shipped after this card was written.
> [`comms-as-default/plan.md:429-434`](../projects/_archive/comms-as-default/plan.md) (STEP D/E) planned and
> **measured** `down` authorising with **no `--force`**, once the lead stood itself down last. The
> guard passes. It always could, after that verb existed.
>
> **2. ⛔ "Exclude the lead from the count" IS REJECTED**, by an independent consuming team that hit
> this in the field — [anthill#96](https://github.com/ichabodcole/anthill/issues/96):
>
> > _"**Do not fix this by exempting the lead from the presence count.** The lead's follower is real,
> > and a lead can absolutely still be working. **The refusal was correct**; only the documentation of
> > who is counted was wrong."_
>
> **3. The mechanism was never the hard part, and we already knew it.** `plan.md:439`, 2026-08-04:
> _"`maestro` is in `rows` but **not in `spawned`** — branch 1 is unqualified over the whole roster …
> **Found by steward, reproduced independently by forager and sentinel.**"_ **Three seats found it,
> the remedy was written beside it, and none of it reached a shipped surface.** #96 is a consuming
> lead hitting the same wall four days later with only `finalize-session` step 6 to go on.
>
> **So the real defect is propagation, and it has three parts:**
>
> - **`finalize-session/SKILL.md:504-507` is FALSE, not merely incomplete.** It states
>   `all-spawned-departed` as **sufficient** — _"the guard authorises teardown once every spawned seat
>   has one… a session that ended properly tears down with no override at all."_ Against the code that
>   is necessary and not sufficient: branch 1 (`live-follower`, `team-support.ts:263-265`) is
>   unqualified over the whole roster and **preempts** it. Correct the sentence; do not append to it.
> - **The teardown checklist has NO `comms stand-down` beat for anyone** — not the lead, not the
>   seats. Full enumeration of step 6 (`SKILL.md:399-520`) confirms it. Seats only get the verb from
>   `join`'s emitted manifest (`team-join.ts:340`); **the lead never runs `join`, so it receives the
>   follow incantation and no departure counterpart.**
> - **Prefer emission over prose, on this repo's own measurement.**
>   [`convene-never-wires-the-lead.md:67-77`](./_archive/2026-08-01-convene-never-wires-the-lead.md):
>   _"join's emitted manifest has worked in every session while prose guards went 0-for-4."_ So the
>   favoured fix is **`convene` emitting the lead's stand-down line the way `join` emits every
>   seat's** — which is in nobody's proposal list, including #96's.
>
> **One correction to #96 in return:** its claim that `spawned` is consulted only by the
> `outstanding-departures` branch is wrong. `spawned` is read at `team-support.ts:238`, `:295`, `:305`
> and `:315-325`, and that last path produces **`all-spawned-departed` → `{state:"none"}`** — the only
> verdict that authorises teardown (`team-down.ts:20`). It is not vestigial; **branch 1 simply
> preempts it.**
>
> **And a shipped contradiction worth fixing while here:** `team-convene.ts:224` says _"The lead is a
> seat like any other and needs its own wire."_ **The code's model is roster-seat; the skills' model is
> not-a-seat** (`convene/SKILL.md:162-163`, _"it never spawns the lead (that's you)"_). Same repo,
> opposite framings — and the skill is the one consumers read.
>
> _Full verification: [`reports/2026-08-08-feedback-triage-96-102.md`](../reports/2026-08-08-feedback-triage-96-102.md) § #96._

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

## Options — **one is now RULED OUT; see the 2026-08-08 amendment above**

- ⛔ **~~Exclude the lead from the count. Smallest change.~~ REJECTED 2026-08-08.** The original
  caveat — _"it silently assumes the lead's own finalize is done, which nothing checks"_ — was
  correct and is now backed by field evidence
  ([#96](https://github.com/ichabodcole/anthill/issues/96)): **the lead's follower is real and a lead
  can still be working, so the refusal is right.** _Kept, struck through, because the whole reason for
  this amendment is that someone could have built it._
- **Count something other than raw presence** — seats that have not confirmed stand-down, if
  confirmations become machine-readable rather than prose on the wire.
- **Say what it is really asking.** If the honest guard is _"the lead should eyeball this"_, then the
  message should not name the lead as a blocker among the seats it is warning about.

**Related:** the same class as
[`convene --fresh` reporting success when it no-ops](./2026-08-01-convene-fresh-reports-success-when-it-no-ops.md)
— a check whose output does not distinguish the case it exists to catch from the case that always
happens.

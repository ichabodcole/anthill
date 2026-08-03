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
  > **⚠ That second clause was FALSIFIED the same day, and by the seat it is about.** _"A rostered
  > observer is just a seat"_ is true of the scout we built and **false of the one the session's own
  > report asks for.** See R10.
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

**THE SHARPER VERDICT (scout) — and it is the one to carry:**

**The echo round-trip needed no part of slice two.** It is a property of the wire echoing the sender, it existed in slice one, and **three seats confirmed their own wires with it at join, before the primitive was written.**

_Deliberately stated without a duration._ Three of us computed a different interval — ~8.5 min from the message that reported it, ~10m02s from the demonstration itself, and **"from session start" if you anchor on the capability rather than on anyone noticing it**, which is the only anchor that answers the question being asked. **The count was wrong in this file before the ink dried**, which is `seams.md`'s own authoring note firing on the person who wrote it there: **cite the assertion, not the measurement.** The durable claim is _the capability preceded the build_, and it survives every choice of anchor.

_And it credits nobody with inventing it._ steward **named** it; the wire has always done it. **Receipt-confirmation is instructed behaviour** — `join/SKILL.md` tells arriving seats to confirm their message landed, which is why three seats did it — so the technique arrived by instruction and its significance went unexamined for most of the session.

So the honest three-part verdict:

1. **The primitive does not meet SC1.** Unchanged.
2. **SC1 was already satisfiable at session start**, by a capability the team held and never recognised as the answer. **We spent a session building toward a criterion a technique already in our hands satisfied.**
3. **The gap was never capability. It was that nobody named what they already had, and nothing prompts the question.**

**What today actually added is sentinel's control** — both sends present in the log while only the live follower echoed — which converts a habit into an instrument. **The technique existed; the proof that it measures the wire rather than the send did not.**

**Also measured: `send --dry-run` provably cannot serve as the probe.** Fresh live follower — dry run → no echo; real send seconds later on the same follower → echo. The dry run genuinely never traverses the follow loop. **Price of a real probe: one permanent line in a log nothing ever clears.** No cheaper instrument exists in the current surface.

**H8 survives and should be kept.** The probe does not falsify it — the wire still reports nothing on its own; something _outside_ the wire can interrogate it, which is a different and arguably more useful claim.

**Falsifier for the refinement:** _a seat that runs the echo probe after any suspicious quiet period detects a dead wire in one round-trip, every time._ If that fails, the probe is unreliable and the verdict stands unqualified.

### R10 — guest identity is promoted, because the lurking observer IS a guest (human, 2026-08-02)

**The descope reasoning above is falsified.** _"A rostered observer is just a seat"_ holds for the
scout we ran — visible, rostered, participating. **It fails for the observer the report asks for**,
and the two-scout design is what exposes it.

**The design, folded rather than invented.** Report §4.3 / T3 proposed comparing observe-only against
participate **across sessions**, which is confounded by everything that differs between sessions. The
human's shape is stronger and it is a **within-session control**: run **two** scouts at once — one
that participates as the need arises (ruled in `dev/scout.md`), and one that **only observes**.

**The second one is a GUEST, not a seat**, and that is the whole promotion: a participant with a
position and **no send rights** — exactly the item descoped above.

**Why a seat cannot do it.** An observer declared in `seats[]` is visible three ways at once: the
config, the roster table every seat reads at join, and **presence, which is a side effect of
tailing** — so it appears in `anthill status` the moment it wires up to watch. Seats then know they
are observed, by whom, and that a report goes to the human. **The instrument is part of what it
measures.**

**Anonymised handle:** offered as optional by the human and worth taking — a neutral name reduces
what the team can infer. **Not load-bearing.**

**⚠ The load-bearing part, and it is one condition:** the human's ruling holds **as long as the agent
does not actually participate.** So `send` must be **refused by the tool**, not avoided by the
observer's discipline.

_This is not caution, it is this session's own result: prose guards lost to mechanical ones every time
they were tested (H1), including against the lead, on the same problem, in the same session. An
observer whose silence rests on its own restraint is a prose guard — and it is the single guard the
entire experiment's validity rests on._ **A guest that can send is not a control.**

**Open for the owner:** whether a guest is roster-adjacent or a separate identity class, and how
`resolveSeatIdentity` admits it **without** re-opening the free-form-alias hole Contract 4(c) closes.
`read` is already identity-free (4(c-bis)), so **the work is on `follow` and on refusing `send`.**

### R11 — the MERGE BAR: comms ships only when it could stand alone (human, 2026-08-03)

**The ruling, in the human's terms:** _"I don't want to ship it with the intention that both have to be
used. We don't need parity with grapevine — that isn't the point — but anthill comms needs to be a
viable replacement, with the understanding that it's a beta tool."_

So the bar is **not** parity and **not** perfection. It is: **a team can run a session on comms alone.**
Grapevine stays as a **backup the team re-arms if comms drops** — not a second wire held open in
parallel. A merge that ships two co-required wires is refused.

**What this bar rejects, and it is the posture we have been in all along:** every session so far ran
with grapevine armed alongside, by explicit decision (see the spike proposal's "not switched to").
**So we have zero observations of comms without a fallback** — and a team that can fall back silently
will, without reporting that it did. Frictions collected under a safety net grade the net.

**The structural finding that sets the blocking set — presence is a side effect of holding a tail.**
Both backlog items state it. So the moment grapevine goes from co-wired to genuine backup, seats stop
holding vine tails and `grapevine who` goes empty. Two things read it, and neither degrades gracefully:

- **`anthill status`** reports nobody present, which is indistinguishable from nobody having joined.
- **`anthill down`'s presence guard** — which today can **never pass**, because the lead is always
  present — flips to **always passing**, tearing down a live team in silence.

**That guard has never once been correct, and going sole-wire flips it from never-passes to
always-passes with nothing in the diff to say so.** Worse, the flip reads as a fix: it stops nagging.
So presence is not a feature deferred for beta — it is what an existing destructive-action guard rests
on, and cutting grapevine's tails is what breaks it.

#### Blocking — required before the gate session

- **B1 — native presence on comms.** The primitive exists: `positionState` already gives three states,
  and a position file plus a live pid answers "who has a follower attached", which is the convene
  roll-call question. **`down`'s guard must be repointed in the same change**, or we ship the inversion.
  Wiring, not design.
- **B2 — `convene` wires the lead** (`docs/backlog/2026-08-01-convene-never-wires-the-lead.md`). Today
  `join` hands each seat three resolved wires and `convene` hands the lead none. With grapevine armed
  the lead could at least poll the vine; **as sole wire an unwired lead is fatal**, and the cost is
  already measured — rulings crossing in-flight messages twice, and a session where only a human
  noticing could recover it. The fix is `join`'s proven pattern applied to the one participant it was
  never applied to.
- **B3 — a session anchor on comms.** Not clearing: a **marker**. `convene` opens the channel and posts
  a session-start message, returning its id, so every seat catches up from a real anchor instead of a
  hand-found `read --last N` — whose failure mode (anchor past the end → empty, exit 0) is
  indistinguishable from a quiet channel, which is precisely what a sole wire cannot afford. Topic
  folds in here.

#### Explicitly NOT blocking

- **Addressed delivery.** Grapevine has none either; its measured failure was a **ritual** precondition
  (independent retro collection), not day-to-day coordination; and it still needs a design pass.
- **Passive self-observation (SC1).** R9 settled this — the echo probe covers the active case.
  _"You are never told"_ is acceptable for a beta **as long as the skill says so**, and it does.
- **Cross-project contact.** Permanently grapevine's, by the spike proposal's own scoping.

#### The gate, and the sequencing

After B1–B3, **one session runs sole-wire** — grapevine unwired, documented as re-armable if comms
drops. **That session is the merge gate, and this one is not.**

**Do not stack it with the worktree-isolation run** decided in
`docs/investigations/2026-07-27-shared-tree-failure-modes.md`. Sequence instead: **build B1–B3 on
worktree isolation with grapevine still armed** (which exercises isolation safely and produces its
verdict), **then** run the sole-wire gate on whatever isolation setup survived. Stacking both variables
gives any failure two candidate causes and settles neither.

**Falsifier for this bar:** the sole-wire session completes a real session's work end to end without
re-arming grapevine. If it re-arms, the bar has not been met and the reason for re-arming is the next
blocking item.

### Team rule adopted this session (not comms-specific)

**Whoever certifies a convergence names the shared input both parties read first.** Producer/consumer convergence is this team's ratify signal; an unqualified convergence claim is the "agreement is not truth" failure wearing a ratify badge. Adopted after a convergence was certified by timestamp without naming that both parties had read the same proposal — and then re-committed by the lead one message later.

## Success Criteria

- **A seat can tell whether its own wire is alive** without an external notification. Directly
  falsifiable against H8.
- **A re-armed follower backfills.** No silent gap.
- **A crossing is visible at send time**, not only reconstructed afterwards.
- **At least one item here turns out unnecessary.** Slice one's framing check, and it held once.

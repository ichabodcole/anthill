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

> **⚠ NOT RUNNABLE NEXT SESSION — do not plan around it (noted 2026-08-03).** The two-scout control
> rests entirely on `send` being **refused by the tool**, and that is unbuilt: guest identity does not
> exist in `resolveSeatIdentity`, which today admits rostered seats and nothing else. **An observer
> whose silence rests on its own restraint is the prose guard this ruling explicitly rejects**, so
> running the experiment with a disciplined-but-capable observer is not a weaker version of it — it is
> the version whose result means nothing. Either build the refusal first or run one scout.

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

#### ⚠ B1–B3 is a SCAFFOLDED CLAIM, not a settled list — the team ratifies or falsifies it at convene

Added by the human, 2026-08-03: **take a read from the team on what else comms needs before it can
replace grapevine.** The list above was derived by one lead from the code and the backlog. That is
exactly the artifact this project's ratify gate exists to check — **the lead scaffolds seams as
falsifiable claims; the owners ratify or falsify before anyone builds.** A blocking set nobody
falsified is a lead's framing wearing a plan's clothes.

**Collect it BLIND, before showing anyone B1–B3.** This is the spike's own established method (the
first-contact capture, whose blind condition leaked all three times it was attempted) and the
[observer-effect discipline](../../reports/2026-07-31-story-loom-comms-round.md) behind it. Handing
seats a list and asking _"agree?"_ returns agreement — from a team that shares a channel, a session
and a frame, which is the consensus failure the retro rules already name. So the order is fixed:

1. **Ask each seat the open question first**, in neutral form and without the list:
   _"grapevine is unavailable this session — comms is all you have. What do you need that isn't
   there?"_ Per seat, before any discussion, so the answers are independent rather than converged.
   _(Note the live constraint: comms broadcasts, so answers collected on the wire contaminate every
   later answerer — the measured failure in the addressed-delivery item. **Collect these off-wire**,
   or accept that the ordering decides who was uncontaminated.)_

   **The mechanism, because "off-wire" is not self-executing and the next lead should not have to
   invent it:** dispatch **each seat as a one-shot subagent for this question alone**, grounded via
   `anthill join <handle>` so the seat's own doc and lineage answer, **returning privately to the
   lead**. Five independent answers, no cross-delivery, and it runs **before anyone is wired to
   comms** — which is what makes it blind rather than merely early. This uses no instrument we do not
   have: subagent dispatch is an existing path (`convene` documents it), and a subagent return is
   private by construction, which is precisely the addressed-delivery property the wire lacks.
   **A seat answering from its durable doc rather than from a lived session is a feature here** — it
   is the seat's accumulated judgement answering, which is what seat docs are for.

2. **Then show B1–B3** and ask specifically what it **misses** and what it **overstates** — both
   directions, since a scaffold is falsified as much by an unnecessary item as a missing one.
3. **Record the delta**, not just the agreement. If the team converges on the same three, that is a
   result worth having; **if it converges too cleanly, apply the retro's own smell test** — ask what
   would have had to be true for anyone to name a fourth.

**The falsifier for the list itself:** any seat naming a blocker not in B1–B3, or showing that one of
the three is survivable for a beta sole-wire run. **Either outcome is the point of asking.**

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

### R12 — the blind read RAN, and it falsified B1–B3 in both directions (2026-08-03, session 6)

**R11 asked for a falsifier: "any seat naming a blocker not in B1–B3, or showing that one of the three
is survivable." Both happened.** Recorded here rather than on the wire, because the wire is not an
artifact and this is the durable record.

**Mechanism, as R11 specified it.** Five seats dispatched as one-shot subagents, grounded via
`anthill join <handle>`, explicitly un-wired (no follow, no send, no commit), each asked only:
_"grapevine is unavailable this session — comms is all you have. What do you need that isn't there?"_
Returned privately to the lead, **before** the framing opener and before any seat was wired.

#### ⚠ The mechanism is structurally leaky, and steward said so instead of answering around it

**The blind read cannot be blind for any seat that grounds properly.** R11 — the scaffold, the
"collect it BLIND" instruction, and the dispatch mechanism — is **committed in this file**, so
grounding delivers the thing being withheld. steward opened his answer by refusing the premise,
split his own response into independently-derived items and ratify-responses, and told the lead to
**discount the second set as testimony rather than a second derivation**. He declined to correct for
it on the grounds that any adjustment he invented would be his judgement re-entering by the back
door.

**This is the fourth leaked blind condition on this spike and the first that no discipline could have
prevented** — the previous three were procedural. The remedy is structural and belongs to the lead:
**hold the candidate list in gitignored scratch until collection closes, then land it.** A seat
cannot be asked not to read the tree it is told to ground in.

_Ruled by the human, 2026-08-03: record as a finding, do not change process mid-session._

#### What the five actually returned

**Named by all five, and absent from B1–B3 — the onramp is grapevine-first.**
`anthill join` emits a checklist whose item **1** is `grapevine tail`, item **2** `bounty tail`, item
**3** `comms follow`; item **7**, the manifest's only catch-up instruction, names `grapevine pull`.
Under **Contract 4(d)** that emitted text _is_ the onboarding a consumer repo reads. **A team adopting
comms for the first time is instructed by the tool to lead with the wire comms is meant to replace.**

A stronger sub-case, measured by three seats independently with an empty-`HOME` control:
`team-join.ts` resolves **both** coord CLIs in one `try` whose catch is `process.exit(1)`, and the
`comms` block is composed **downstream of that exit**. With spellbook absent, **no seat can join at
all** — which punches a hole in **Contract 4(b)**'s "the `comms` block is ALWAYS present". That clause
reasoned about tool/skill skew and never considered an unrelated dependency voiding the whole
manifest. `convene` already has the correct shape one command over (`team-convene.ts:137,150` warns
and proceeds).

**B2 — FALSIFIED as a blocker, by artifact.** `maestro` is in `seats[]` (`spawn:false`), so
`anthill join maestro` resolves through the roster and emits a comms incantation **today**; the lead
ran it and wired both tails from its output. The capability was built and `convene` merely never
called it. steward's coupling is the durable part: **B2's severity is entirely a function of B1's
absence** — an unwired lead is undetectable only while nobody can read positions, and becomes the
most conspicuous row in the table the moment presence exists. Ship it with B1; do not let it gate.

**B1 — reframed, and demoted by three of five to friction.** The primitive shipped and the reader did
not: `readPosition` is called in exactly two places, both about the caller itself. Six position files
exist on disk right now. **What is missing is a verb, not a capability** — a direct instance of the
retro's H12 (_a team's recurring failure is missing NAMES for capability it already holds_).
Two additions the item as written does not carry: it must be **a verb any seat can run at any time**
against the whole roster (steward — otherwise the sweep stays a person, and a person is not a
mechanism), and `anthill status` must stop **asserting** `(nobody)` (forager — not an absent
instrument but a confidently wrong-shaped one, since `presentSeats()` returns `[]` on any failure).
**Blocking is retained on the `down` inversion alone**, which is destructive and silent.

**B3 — confirmed by all five, and costed above R11's estimate.** R11 said "topic folds in here."
forager's scoping says otherwise: a `meta` stamp cannot carry it, because `encodeMessage` serialises
the message and nothing else — this needs a field **in the record** (a `kind:"session"` frame) on an
append-only log whose 283 existing records will lack it. `emittedThrough?` is the precedent for
"absent means older binary, not zero."

**New, and not resolved here:** the **human cannot send on comms at all** (Contract 4(c) admits only
rostered handles). steward's observation is that this and R10's unbuilt **guest identity are the same
missing thing inverted** — guest = position without send, human = send without seat — so **one change
to `resolveSeatIdentity` unblocks the two-scout control _and_ puts the human on the wire.** That is a
**revision of Contract 4(c), not a flag**, and it is not this session's work.

**Also unresolved — a genuine disagreement between two seats, left standing.** weaver holds that the
absence of a terminating receive verb (grapevine's `wait`) **blocks the subagent convene path**, since
a one-shot seat cannot hold a Monitor tail; forager holds it is a non-issue because every seat here is
Claude Code with Monitor. **weaver is right about the mode the blind read itself ran in.** Unsettled;
do not let either version be recorded as the team's position.

#### The ordering premise R11 left ambiguous, now ruled

All five seats independently flagged that _"grapevine unavailable"_ has two readings that land in
different places — **daemon unwired** vs **spellbook uninstalled** — and that the choice decides
whether the top-ranked blocker fires at all. **Ruled by the human, 2026-08-03: grapevine stays
installed.** The backup is a **release-time** posture — teams adopting comms for the first time can
fall back if they hit a bug — not a session configuration. So the uninstalled branch does not gate
the merge, and the onramp defect (not the hard exit) is what the release actually rides on.

### R13 — per-seat worktree isolation: measured, and it broke BOTH coordination substrates (2026-08-03)

The [shared-tree investigation](../../investigations/2026-07-27-shared-tree-failure-modes.md) asked for
two measurements it could not get by argument. Both are now taken, in this tree.

**Provisioning cost is not the problem.** `git worktree add` ×5: **0.37s / 14M**. `bun install` ×5:
**~1.1s** (global cache) / **461M**. Gate in an isolated worktree: **390 pass / 0 fail, 17.84s**. The
pre-commit hook **does** fire in a worktree — proven with a positive control (a type-broken file was
refused), not with a green, because a green proves nothing if the hook is inert.

**The problem is that isolation silently severs coordination, for two unrelated reasons.**

1. **comms** resolves its log via the config walk-up, and `.anthill/comms/` is gitignored — so it does
   not travel with the branch. Each worktree got its **own empty log**. Measured against a control:
   `comms read --last 1` from a worktree returned `{"ok":true,"messages":[]}` while the main tree
   returned `#284`. **Same command, same channel, `ok:true` both times.** An empty read is
   byte-indistinguishable from a quiet channel — the precise failure this wire exists to prevent,
   manufactured by the isolation experiment itself. _Independently observed from the seat side by
   scout, who recorded `follow-start → head: 0, never-followed` as join baseline before the lead found
   it._
2. **bounty** derives its id as `k-<key>-<projecthash>` — **project-PATH-scoped**. A worktree is a
   different path, so the same `BOUNTY_SESSION_KEY` derives a **different board**. Three-way control:
   main tree unflagged → resolves; worktree + `BOUNTY_SESSION_KEY` → _"no running bounty session"_;
   worktree + explicit `BOUNTY_SESSION=<resolved id>` → resolves.

**Contract 3 forecast this and it was filed as a limitation.** Its scope bound reads: the binding
_"resolves only from within the project tree… the guarantee is bounded to the tree, not the
machine,"_ and calls it _"correct in practice — seats always run inside the repo."_ **Worktrees
falsify "inside the repo."** Likewise the investigation's own line 168 — _"'add `--isolate`' is not a
flag; it is a **workspace-provisioning problem**"_ — which is now an instance rather than a
prediction.

**Both were fixed by provisioning** (symlink the comms dir; export the resolved board id), which is
the investigation's thesis holding rather than failing. **Consequence for the seams:** Contract 3's
"seats and the lead NEVER pass `--session` — the binding is ambient by construction" is **false under
worktrees**, and the SOP + convene skill restate it. That is Contract 5(b)'s class — a true sentence
going quietly false because the environment moved — and the remedy is scoping the claim, not widening
it. **Owner: forager (Contract 3), weaver (the prose). Not amended by the lead.**

### R14 — status at finalize: what session 6 actually shipped, and what it did NOT

**Written at the finalize 2.5 pass, by re-running the claims above rather than remembering them.
Two of them had already drifted — see the note at the end, which is the point of the step.**

**Shipped and merged** (`feat/team-comms-slice-one`, gate **423 pass / 0 fail** measured on the
merged tree):

- **`comms positions`** — the cross-seat position verb. B1, reframed by the blind read from _"build
  presence"_ to _"the data is on disk, build the reader."_ Verified by the lead as first user: three
  states hold against a real never-followed channel, **`gap: null` and not `0`** (Contract 6(c)'s
  hardest clause). Ships with **`followerAlive`**, a live-pid check **nobody specified** — steward's
  _"a position that MOVED is an artifact, a position VALUE is testimony"_ built into the tool.
- **The scaffold gap** — `plugin/templates/` now names comms. A bootstrapped team's SOP no longer
  believes grapevine is its only wire. **The release-facing item, and it was found on the way to a
  smaller card.**
- **The join manifest's ordering + its `grapevine pull` catch-up** — the onramp no longer points a
  first-time comms team at the wire it is meant to replace.
- **`anthill commit`'s lock path** — was broken in **every** worktree (`join` on an absolute
  `--git-common-dir`); landed itself from a worktree, which is the only proof that counts.
- **`down`'s command-path test** — the guard could be **deleted entirely** this morning with the
  suite still green.
- **`.gitignore` trailing slash** — `uncheckedAgainst` fired 9/9 identical false positives before
  this; the field the session-5 scar exists about had been degraded to noise.

**NOT shipped, and it is the blind read's own top-ranked item:**

- **`join`'s coord resolution is still coupled.** Re-verified at finalize with an empty `HOME`:
  `anthill join` still returns an error envelope **with no `comms` block**. **Contract 4(b)'s "the
  `comms` block is ALWAYS present" therefore remains false when spellbook is absent.** It is
  **survivable** under the human's 2026-08-03 ruling that grapevine stays installed as a release-time
  fallback — but _survivable_ is not _fixed_, and the item all five seats ranked first is only
  **half** addressed: weaver fixed the **ordering**, forager's decoupling card is still `todo`.
- **The session anchor (B3).** Confirmed by all five, costed above R11's estimate (needs a field in
  the record, not a `meta` stamp), and not built.
- **Guest / human identity.** Unbuilt, and steward's observation stands: it and R10's two-scout
  control are **one `resolveSeatIdentity` change**, not two.

**⚠ Drift found in this very section by the 2.5 pass, recorded because it is the step's own
justification.** R12 cited `team-join.ts:127–135` and `:184`; **both line numbers had moved within
the session that wrote them** — replaced above with the behaviour, which does not rot. And R12/#347
named `COMMS_GITIGNORE_LINE` as still carrying the trailing slash; **forager had already fixed it.**
Two stale claims in a document about instruments that answer a different question than the one
asked, found only by re-running them. **Neither failed any gate.**

### Team rule adopted this session (not comms-specific)

**Whoever certifies a convergence names the shared input both parties read first.** Producer/consumer convergence is this team's ratify signal; an unqualified convergence claim is the "agreement is not truth" failure wearing a ratify badge. Adopted after a convergence was certified by timestamp without naming that both parties had read the same proposal — and then re-committed by the lead one message later.

## Success Criteria

- **A seat can tell whether its own wire is alive** without an external notification. Directly
  falsifiable against H8.
- **A re-armed follower backfills.** No silent gap.
- **A crossing is visible at send time**, not only reconstructed afterwards.
- **At least one item here turns out unnecessary.** Slice one's framing check, and it held once.

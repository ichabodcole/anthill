# Feedback triage — `#96`–`#102`, the Spellbook team's 2026-08-08 batch

**Triaged:** 2026-08-08 · **Verified against:** `develop` @ `839f429` · **Reporter:** the Spellbook
team, from a 4-seat 9-hour sprint on `fix/spell-hardening-03`, against anthill **2.0.0** (HEAD is
2.1.0; no cited code moved between them)

Every claim below was checked against the tree before it got a disposition. **Four parallel
verification passes, each instructed to hunt for where the report overstates** — the same shape as
the [2026-08-07 triage](2026-08-07-feedback-triage-70-73-94.md), where three of six reports came out
weaker than filed and every correction changed the fix.

**It happened again, harder.** One report is **refuted at the headline**, one proposes a fix that is
**actively unsafe**, and the most valuable finding in the batch is not about their reports at all —
it is **a stale card of ours whose proposed fix the field report explicitly warns against.**

---

## Disposition summary

| #        | class                            | one line                                                                                                                                 |
| -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **#96**  | `EVIDENCE` + one new item        | Mechanism already known internally and never shipped. **Our card is stale and proposes the wrong fix**                                   |
| **#97**  | `COVERED`, thin new tail         | **Headline refuted** — the red-side instrument exists and predates `uncheckedAgainst`. Real residue: it cannot reach a _land-gate_ red   |
| **#98**  | `BUILD`                          | Real, structural, and there is a **cheaper fix than any it ranked**                                                                      |
| **#99**  | `EVIDENCE` + resolves a decision | **Constrains `94·1`** — `previousPosition` must never be the anchor. Three details wrong; `openedAt` is the wrong number                 |
| **#100** | `BUILD`                          | Reproduced (9,046). **Three files leak +20/run** — one of their named leakers is clean, and the one they couldn't attribute is the worst |
| **#101** | `EVIDENCE` (n=2) + 1 doc gap     | Principle already in `principles.md:320-325`. **"Unskippable" is false** — two bypasses. `--as-of` is in **no skill**                    |
| **#102** | `BUILD`                          | Both silent failures reproduce. **Stronger than filed** — `comms send` too, `submitCmd` is poisoned, and `--stdin` is the cheap fix      |

**Disposition classes** — `BUILD` (actionable, no design call) · `DESIGN` (needs a convene) ·
`EVIDENCE` (field confirmation of something already filed) · `COVERED` (already shipped or filed) ·
`DECLINE` (recorded so it is not re-litigated).

---

## #96 — `anthill down` blocks on the LEAD's own comms follow

**Disposition: `EVIDENCE` for two existing items, plus ONE genuinely new item — and a stale card to
repair first.** The bug is real and reproduces at HEAD. It is not a discovery.

### 🔴 The highest-value output of this triage is a correction to OUR OWN backlog

[`2026-08-01-down-presence-guard-cannot-pass-for-a-correctly-wired-lead.md`](../backlog/2026-08-01-down-presence-guard-cannot-pass-for-a-correctly-wired-lead.md)
records the same root fact six days earlier — _":21 — `maestro` is in that list. The lead is always in
that list."_ **Two things about that card are now wrong:**

1. **Its central claim, _"the guard can never pass"_, is falsified at HEAD.** `comms stand-down`
   shipped after the card was written.
   [`comms-as-default/plan.md:429-434`](../projects/comms-as-default/plan.md) (STEP D/E) planned and
   **measured** `down` authorising with **no `--force`** once the lead stood itself down. #96
   independently reproduces exactly that in a consuming project. The card was never re-statused.
2. **Its proposed fix is the one the field report explicitly forbids.** The card's status line reads
   _"ready to build (**the guard needs to exclude the lead**, or count something other than
   presence)"_ and `:47` says _"Exclude the lead from the count. Smallest change."_ #96 closes with
   **⚠ _"Do not fix this by exempting the lead from the presence count. The lead's follower is real,
   and a lead can absolutely still be working. The refusal was correct."_**

**A card marked "ready to build" whose fix is wrong is worse than no card** — it is the shape that
converts a fresh agent's diligence into a defect. Repair the card before anything else here.

### What is actually new: the propagation failure, not the mechanism

[`comms-as-default/plan.md:439`](../projects/comms-as-default/plan.md), written 2026-08-04:

> _"**STEP D exists because the lead is the blocker.** `maestro` is in `rows` but **not in
> `spawned`** — branch 1 is unqualified over the whole roster, so with all five spawned seats stood
> down and the lead still wired, the verdict is `present`/`live-follower` and `down` **refuses.** …
> **Found by steward, reproduced independently by forager and sentinel.**"_

**Three seats found this four days before the report, and the remedy was written beside it** (`:433`
— _"STEP D the lead lands `plan.md`, THEN runs `comms stand-down --as maestro`"_). **None of it
reached a shipped surface.** A consuming project's lead has `finalize-session` step 6 and nothing
else.

So the new item is: **the lead's teardown procedure exists only in this repo's own project plan**,
with #96 as external confirmation that its absence costs a near-`--force`.

### The shipped string is FALSE, not incomplete — and that changes the fix

`finalize-session/SKILL.md:504-507` states the `all-spawned-departed` predicate as **sufficient**:
_"the guard authorises teardown once **every spawned seat** has one \[a departure record]. So a
session that ended properly tears down with no override at all."_

Against the code that is **necessary but not sufficient**. With every spawned seat departed and the
lead's follower live, branch 1 fires at `team-support.ts:263-265` and `down` refuses. **The report
calls both shipped strings "true"; this one is not.** The fix is _correct a wrong sentence_, not
_append a clarifying clause_.

**And the checklist gap is wider than reported.** A full enumeration of step 6's ◻ items
(`SKILL.md:399-520`) finds **no `anthill comms stand-down` beat for anyone** — not the lead, not the
seats. Seats only receive it from `join`'s emitted manifest (`team-join.ts:340`). The lead never runs
`join`, so it gets the follow incantation and **no departure counterpart.**

### Three corrections to the report

1. **_"`spawned` is only consulted by the `outstanding-departures` branch, which produces
   `unknown`"_ is wrong on both counts.** `spawned` is read at `team-support.ts:238`, `:295`, `:305`
   and `:315-325`, and that last path yields **`all-spawned-departed` → `{state:"none"}`** — the
   _only_ verdict that authorises teardown (`team-down.ts:20`). It is not a vestigial parameter, it
   is the authorising input. The accurate framing: **branch 1 preempts every `spawned`-aware branch
   below it.**
2. **_"convene actively creates the blocking condition three steps earlier"_ — it is one step
   earlier.** WIRE YOURSELF FIRST is step 3 (`convene/SKILL.md:105-116`); the spawn line is step 4
   (`:162-163`). The report's header also mis-cites step 3 for a step-4 string.
3. **_"guarantees the refusal"_ is true at HEAD and conditional in general.** Presence requires an
   _emitted_ position record (`team-support.ts:154-155`), and **rotation deletes position records** —
   `plan.md:149` records that post-rotation _"the lead contributes nothing"_ to the verdict. Rotation
   landed inert, so the claim holds today. It has a known expiry.

### The fix the report does not list is the one our own evidence favours

Its ranked fix #1 is prose in a skill. **This repo has already measured that class failing** —
[`convene-never-wires-the-lead.md:67-77`](../backlog/2026-08-01-convene-never-wires-the-lead.md):
_"join's emitted manifest has worked in every session while prose guards went 0-for-4."_

The mechanically analogous fix — **have `convene` emit the lead's stand-down line the way `join`
emits every seat's** — is absent from the report's list and is the one the evidence points at. Note
that `convene-never-wires-the-lead` is **shipped and closed**, and is the _cause_ here: it made the
lead a live follower and created a new asymmetry — **`join` hands a seat a wire AND a departure verb;
`convene` hands the lead a wire and no departure verb.**

### Two shipped statements that contradict each other

- `team-convene.ts:224` — _"The lead is a seat like any other and needs its own wire."_ **The code's
  model is roster-seat; the skills' model is not-a-seat.** Same repo, opposite framings, and the
  skill is the one consumers read.
- `finalize-session/SKILL.md:506` vs `team-support.ts:159-166` — the skill states the predicate as
  sufficient; the code's own doc comment states it as one branch of six, reached only after branch 1
  declines.

### What would close it

- [ ] `2026-08-01-down-presence-guard...` is re-statused, its "can never pass" claim corrected, and
      its exclude-the-lead fix **replaced** with #96's warning against it.
- [ ] `finalize-session` step 6's sufficiency claim is corrected, not merely extended.
- [ ] A `comms stand-down` beat exists in the teardown checklist — **for the lead, last.**
- [ ] Preferably: `convene` **emits** the lead's stand-down line rather than a skill describing it.
- [ ] ⛔ The lead is **not** exempted from the presence count.

---

## #97 — Nothing reports the false RED, `uncheckedAgainst`'s twin

**Disposition: `COVERED` — the headline is refuted by the shipped tree. There is a thin, genuinely
new tail, and it belongs as an amendment to the gate-vocabulary item, not as a standalone.**

### The instrument they say does not exist has existed longer than the one they compare it to

`team-commit.ts:461-487`, on the **failure** path:

> _"The gate has already run and failed. Before we hand back the error, check whether the tree is
> dirty OUTSIDE our commit …"_ → _"NOTE: the gate runs over the WHOLE tree, and N path(s) outside
> your commit are currently dirty: …"_ → _**"If the failure above names one of those, it is NOT your
> commit — a peer's in-flight work is reddening the shared tree."**_

Same helper (`foreignDirtyPaths`, `:144`), same population, opposite sign. And the success-path
comment at `:519-525` says so explicitly: _"The FALSE-GREEN counterpart of the foreign-red
diagnostic … We already compute this set for the failure path; printing it on success is the same
information in the direction nobody was looking."_

**So the red-side diagnostic came FIRST and `uncheckedAgainst` is its derivative.** _"Only one of
them has an instrument"_ is false.

It is also already **shipped work with a filed lineage**:
[`shared-tree-gate-tension/proposal.md:151-158`](../projects/shared-tree-gate-tension/proposal.md)
**move C.1** — _"on a gate failure, diff the red paths against the committed set and say 'red on
`<other paths>`, not your commit'"_ — is verbatim #97's ask, recorded at `ROADMAP.md:541-551` as
shipped. And [`triage-build-batch.md:18`](../backlog/2026-08-07-triage-build-batch.md) item **70·7**
is already iterating on that same diagnostic.

### The residue is real, and it is one sentence

**The diagnostic can never fire for the LAND gate.** When the `&&` prefix fails, the shell
short-circuits and `commit` is never invoked — no process exists to compute anything
(`team-join.ts:243`).

**#97's headline is a live instance of the defect we filed the day before.**
[`the-word-gate-names-two-different-things`](../backlog/2026-08-06-the-word-gate-names-two-different-things.md)
says "gate" names both the `&&` prefix and the pre-commit hook. _"Nothing reports the false red"_ is
**false for one gate and true for the other, and the report cannot tell them apart.** That item must
land first, or #97 cannot even be stated unambiguously.

**Second-order finding, unfiled anywhere:** where the red-side instrument _does_ fire, it is **prose
only.** `emitError` (`agent-layer.ts:98-104`) accepts `{format, command, error, stack}` — **no
`data`** — so the foreign population is interpolated into an error _string_ (`team-commit.ts:474-487`),
while `uncheckedAgainst` is a **total typed field** on the success envelope (`:39`, `:535`).
**Contract 5(a) reasoning was applied to the green side and never to the red.** Cheap, correct, and
unambiguously worth doing.

### 🔴 Their fix #2 is actively unsafe and must not be built as worded

The report proposes `<gate> || anthill commit --explain-red`. **In POSIX shell `A || B` exits with
B's status** — so a red gate followed by a successful explanation exits **0**. That is, character for
character, the failure `decideGate` exists to prevent (`team-join.ts:205`): _"a failing gate would
report success and your commit would land on a red gate."_ Making it safe needs an explain command
that deliberately exits non-zero, or `|| { …; false; }` — and `;` is on `decideGate`'s ban list
(`:202`).

### Two more corrections

- **_"The land string already knows the gate failed (that is what `&&` is for)"_ is not true of
  anything.** A string does not know; the shell short-circuits and nothing runs. **This is the whole
  difficulty, and the report treats it as the solution.**
- **Their central instance is unattributable.** The report never says whether the spellbook red came
  from the `&&` prefix or from the hook — and the answer decides whether the instrument should have
  fired. Their _"markdown the linter does not even scan"_ inference is sound for lint (corroborated
  our side: `ROADMAP.md:209`, _"`bun run check` reads ZERO markdown"_) but not for a gate that also
  runs `bun test`.

### What would close it

- [ ] The land-gate blind spot is recorded on the gate-vocabulary item.
- [ ] The red-side foreign population becomes a **structured field**, not an error string.
- [ ] ⛔ Nothing ships an `||` chain that inverts the gate's exit status.

---

## #98 — A commit body can carry a count the gate never produced

**Disposition: `BUILD` — real, structural, and there is a cheaper fix than any the report ranked.**

### The claim holds

`buildLandCommand` mints `-F ${i.msgFileRel}` at `team-join.ts:232`, and the emitted instruction at
`:307` tells the seat to _"write your message to `<path>` first."_ Nothing anywhere validates it:
`/usr/bin/grep -rn "Gate:" plugin/` returns **nothing**, and `team-commit.ts` reads the body
(`:264-289`), optionally stamps it (`:318`), and hands it to `git commit -m` (`:457`) with no parse.
The `Anthill-Seat:` precedent the report cites is exactly as characterised (`stampSeat`, `:59-73`).

### But its structural reason is wrong, and the correct reason is what makes its own fix possible

The report says the file must exist first _"because it is an argument to the second half of the
chain."_ **Shell word-expansion does not require that** — `-F msg` is only opened when `commit` runs,
at `team-commit.ts:264`, strictly after the gate. The real reason is the one the report does not
give: **the chain is issued as ONE command, so the agent gets no turn between the gate exiting and
`commit` starting in which to author the file.**

Not pedantry — **if the report's stated reason were true, its own fix #1 would be impossible.**

### The cheap fix the report does not know exists

On any project whose pre-commit hook runs the check — **this repo: `.husky/pre-commit` =
`bunx lint-staged && bun run check`** — `git commit` at `team-commit.ts:457` runs the gate a second
time _inside_ `commit`, via `spawnSync` with `encoding: "utf8"`. **The hook's full stdout is already
in `res.stdout`, and on the success path it is read nowhere and silently discarded** (`:458` only
consumes it when `!res.ok`).

**A tool-authored `Gate:` trailer beside `Anthill-Seat:` needs zero land-string surgery and zero new
plumbing.** One file, established precedent. It does not cover hook-less projects — state that limit
rather than paper over it.

### Their fix #1 is not generically buildable

**anthill has no default gate and refuses to invent one** (`bootstrap/SKILL.md:177-189`). It
therefore cannot know whether a log contains `1362 pass`, `Tests: 1362 passed`, or nothing countable.
A tool-authored trailer can honestly assert **exit status, the gate string, a timestamp, and a
pointer to the log. It cannot generically assert a pass count.**

The redirect variant — `(<gate>) > <log> 2>&1 && … commit --gate-log <log>` — _is_ viable: it
preserves exit status, carries nothing on `decideGate`'s ban list, and matches shipped advice
(`README.md:148`). Three costs the report does not price: **the parentheses are mandatory** (a naive
trailing redirect on their own `bun run check && bun test` captures only `bun test`); it **kills live
output** for a 100-126s gate; and `tee` is not a mitigation because a pipe is the exact thing
`decideGate` bans. Also — **`buildLandCommand` has the worst breakage history in the repo**
(`team-join.ts:235-242`), and
[`uncheckedAgainst…:55-70`](../backlog/2026-08-06-uncheckedagainst-reports-an-endpoint-not-a-delta.md)
already declined to touch it for a comparable ask. Treat consistency with that decision as a
constraint.

**Their fix #3 (docs) would repeat a mistake we already named.**
[`the-word-gate-names-two-different-things:69-84`](../backlog/2026-08-06-the-word-gate-names-two-different-things.md)
warns explicitly: _do not just add the reporter's clause at the three sites_ — there are eleven.

### The ordering-hazard count is wrong, and the fourth is unfiled

The report says _"the shell chain has three ordering hazards, and two of them now have issues."_
**There are at least four:**

|     | hazard                                                                                                                                                                                   | filed                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| a   | message authored before the gate → body narrates an unrun measurement                                                                                                                    | **#98**                                |
| b   | the tree sample is taken after the gate, the lock wait, and `git commit` → endpoint not delta                                                                                            | **#90**                                |
| c   | a red gate short-circuits `commit` out of existence, so the red-side diagnostic cannot fire                                                                                              | **#97**                                |
| d   | **the gate runs entirely BEFORE `acquireLock`** (`team-commit.ts:346`, `LOCK_WAIT_MS = 90_000`), so peers can land during the wait and **the commit lands on a tree the gate never saw** | 🔴 **unfiled**                         |
| e   | on hook-gated projects the gate runs **twice**, and the seat sees neither run's output from the second                                                                                   | partially, in the gate-vocabulary item |

**(d) is the one to carry forward.** It is documented from the _reporting_ side at `README.md:195-205`
and has never been stated as a **validity** hazard.

### What would close it

- [ ] A tool-authored `Gate:` trailer exists, written by the tool and not the author.
- [ ] It asserts only what anthill can honestly observe — **not a parsed pass count.**
- [ ] Its coverage limit (hook-gated projects only, if that route is taken) is stated, not implied.
- [ ] Hazard (d) is filed.

---

## #99 — The session anchor has nowhere legal to go

**Disposition: `EVIDENCE` + it RESOLVES an open decision from the last triage.** The bind is real and
the reporters are right that it has no compliant affirmative. But **three load-bearing details are
wrong, and correcting them changes the fix from "expose a value the tool has" to "mint a value that
does not exist."**

### 🔴 It supplies the counter-evidence that constrains `94·1`, and that is its highest value

[`triage-build-batch.md:29`](../backlog/2026-08-07-triage-build-batch.md) item **94·1** proposes
_"make `comms follow`'s start-notice **be** the session anchor,"_ resting on the reporting team's own
measurement — _"3 of 3 seats joined cleanly off the notice, none off the lead's anchor."_

**#99 is the case where that goes wrong.** The start-notice's `previousPosition` is
`readPosition(handle)` (`team-comms.ts:730`) — where **that handle's** follow last stopped across the
channel's _whole life_. That is precisely the value that over-read #99's seat by **13 messages into
the previous sprint.**

**So 94·1's open decision now has a resolved answer:** the start-notice may be the anchor **only if it
reports the session origin.** `previousPosition` must never be blessed as the anchor. Fold #99 into
94·1 as its constraint — not as a duplicate.

### Three corrections, and they redirect the fix

1. **`convene` does NOT write the session-open record.** `writeSessionOpen` has exactly one non-test
   caller: **`anthill spawn`**, at `team-spawn.ts:182`. `team-convene.ts` never touches it. **A team
   whose seats join without `anthill spawn` has no record at all.**
2. **The record contains no anchor.** The payload is literally `{channel, spawned, openedAt}`
   (`comms.ts:646`, interface `:601-618`). **There is no message id and nothing derived from the
   log.** The report's _"That record is the anchor"_ is false — the anchor value must be **added**,
   not exposed.
3. **⚠ `openedAt` is the WRONG number, in the direction that hurts.** It is stamped at **spawn**, and
   `convene/SKILL.md:158-163` orders the lead to **post the framing opener first, then spawn.** An
   `openedAt`-derived anchor would therefore begin **after the brief** — cutting off the single
   message a joining seat most needs. Any build must stamp the anchor at brief time or capture the
   head explicitly.

Also: _"nothing in the join path points a seat at a board card"_ is **overstated** — join does point
at the board (`team-join.ts:293`, _"Find your card BEFORE you claim it"_); it just carries no anchor.
And there is a **third** out-of-band channel the report missed, which strengthens its case: the seat
launch string is `claude "/anthill:join {handle}"` (`config.ts:33`), templated on `{handle}` only —
**no free-text slot for an anchor without editing `config.launch`.**

### The warning they ask for already shipped — two days before they filed, in a version they did not have

`join/SKILL.md:121-132`, landed `90a67ae` on 2026-08-05 and **first released in 2.1.0** (confirmed not
an ancestor of `anthill-v2.0.0`):

> **⚠ AND THE ANCHOR YOUR OWN `follow` HANDS YOU IS NOT THE SESSION'S ANCHOR.** … the id in it is
> **where THIS SEAT's follow last stopped — which may be a previous session entirely.** It agrees
> with the session's anchor only when you happened to be followed to the end of last session, **so it
> is silent exactly for the seats who were here before and loud only for those who were away.**
> _Measured: two seats hit this in one session — one saw the two numbers differ and noticed, the
> other saw them agree exactly and reported a clean join, which is the case nothing surfaces._

**This does not weaken #99. It makes it a stronger argument than the one they made.** The prose
warning exists, was measured at n=2, and their session is a **third** instance it could not have
prevented — because they were on the version before it. That is `principles.md:320-325` firing again:
_situational warnings need a mechanical guard, not better wording._ **File it that way, not as "the
warning is owed."**

### Two shipped statements that describe things no team can reach

- **`join/SKILL.md:130` points at an unreachable remedy** — _"a rotated session mints fresh positions
  and removes this."_ **`rotateSession` (`comms.ts:289-331`) has no CLI caller.** `comms` exposes only
  `send / read / follow / positions / stand-down` (`team-comms.ts:1081-1087`). No team can run for it.
- **`comms.ts:445-451` describes a guarantee nobody receives** — _"Positions are PER SESSION, and that
  is the point rather than a side effect… A new session starts every seat at `never-followed`, which
  is the honest state."_ True of the code path, **false of every deployed footprint**, because nothing
  mints a session id. **This is the root cause of #99's mechanism, stated in the tree as though it
  were already solved.**

### What would close it

- [ ] 94·1 is decided with #99's constraint attached — `previousPosition` is never the anchor.
- [ ] The anchor is a **minted value**, not `openedAt`, and it is stamped **before** the brief.
- [ ] `join/SKILL.md:130` stops pointing at rotation as an available remedy.
- [ ] `comms.ts:445-451`'s per-session claim is qualified as unreached.
- [ ] Whatever ships works for a team that does **not** run `anthill spawn`.

---

## #101 — `--as-of` is the only rule that never needed memory

**Disposition: `EVIDENCE` (n=2 teams) for a principle already recorded, plus ONE cheap uncontested doc
gap. The mechanism claim survives in weakened form; the headline does not.**

### The mechanism is real, and better than they described

`team-comms.ts:300-340`. With the flag present: parse (`#N` accepted, non-integer is a hard error);
scan for `m.id > asOf && m.from !== identity.handle` (`:316` — own messages deliberately excluded);
and on a crossing, `emitError` + `process.exit(1)` **before the append** (`:328-337`). The error names
the crossers _and_ their authors:

> `stale: N message(s) were added after #X was emitted to you (#a, #b — from <who>). Nothing was sent.`

On the `--anyway` path the crossing is preserved as `staleness: {asOf, crossed}` in the envelope
(`:407`). **A refusal AND a recorded field.** Verified in code, exactly as claimed.

### 🔴 But "it cannot be skipped" is false — there are two bypasses, and one is the default

The argument definition (`team-comms.ts:162-166`) carries **no `required`**, and the entire check is
gated on `if (ctx.args["as-of"] !== undefined)` (`:302`). **Omit the flag and the check never runs —
silently, with `ok:true`.** `--anyway` is the second bypass (`:167-170`).

**The report contradicts itself:** its suggestion 1 concedes _"It is currently a flag a lead has to
know about, brief, and hope three seats adopt"_ — but the headline and the comparison table were never
updated to match. The accurate, still-interesting claim is narrower: **once a seat opts in, the check
cannot be silently mis-applied or fudged**, because the arithmetic is the tool's and a bypass leaves a
permanent `staleness` field.

**So their natural experiment is not the clean enforced/unenforced split the table draws.** It is:
four prose rules that failed, versus **one prose rule — "adopt `--as-of`" — that held because a tool
backstopped it once adopted.** Still a real result. A different one.

**And it has failed here.**
[`the-substrate-cannot-tell-a-seat-its-read-went-stale.md:15`](../backlog/2026-08-04-the-substrate-cannot-tell-a-seat-its-read-went-stale.md):
_"**`--as-of` failed the lead twice, same mechanism** — a head fetched but not read."_ The guard does
arithmetic on **typed testimony**, not on what was read. Zero failures is a property of their session,
not of the mechanism.

### The principle is already ours, verbatim, with a near-identical scar

`.anthill/principles.md:320-325`:

> **A dispositional instruction holds; a situational warning fails at the recognition step.** …
> **Situational warnings need a mechanical guard, not better wording.**
> _Scar: prose guards went 0-for-4 in one session — a warning failed to stop the agent who had just
> read the file documenting it._

**That scar is structurally the same table #101 filed** — four prose disciplines, all broken, three by
their author. See also `principles.md:298-304`. **So #101 is independent external corroboration at a
second team, not a new principle** — which is worth having, and is exactly what a field note that
_held_ is for.

### The one cheap, uncontested thing in it

**`--as-of` appears in ZERO shipped skills or templates.**
`/usr/bin/grep -rn "as-of" plugin/skills/ plugin/templates/` returns nothing; the only non-test
occurrences in the entire plugin are in `team-comms.ts` itself. **A load-bearing coordination
mechanism discoverable only from `--help`** — while the SOP tells seats to hand-write _"reading as of
#N"_ (`comms/SKILL.md:44-56`) and never mentions the flag that checks it.

**Their suggestion 3 is therefore stronger than filed:** it is not "say the why where the flag is
introduced," it is "the flag is introduced nowhere."

### What would close it

- [ ] `--as-of` is documented in at least one skill — the `comms` SOP that already teaches the prose
      watermark is the obvious home.
- [ ] The "name the crosser" half is grafted onto
      [`the-substrate-cannot-tell-a-seat-its-read-went-stale`](../backlog/2026-08-04-the-substrate-cannot-tell-a-seat-its-read-went-stale.md),
      which has the candidates and the false-positive trap but not the identity half.
- [ ] `--as-of`-by-default is considered on its merits — `.anthill/retro.md:675` already records the
      predicted failure mode being **falsified** (seats reached for `--anyway` _with_ a disclosure
      line rather than abandoning the flag), which is evidence for it.
- [ ] Nothing records `--as-of` as unskippable. **It is opt-in.**

---

## #100 — The test suite leaks temp dirs (9,026 on one box)

**Disposition: `BUILD` — reproduced, and the measurement is now finer than the report's. Their central
claim survives; their fixture attribution is wrong in both directions.**

### Reproduced, and one new fact changes the framing

**9,046 on this box** against their 9,026 — 0.1–0.9% higher across every prefix, consistent with a
couple of suite runs in between. All 9,046 are directories, zero nested below depth 1, so their
top-level scan was not undercounting. **Their numbers are honest.**

**The new fact is the age distribution:**

```
   4  2026-07-31    1028  2026-08-01      30  2026-08-02    1079  2026-08-03
1599  2026-08-04    5138  2026-08-05      48  2026-08-06     100  2026-08-07     60  2026-08-08
```

**Nothing older than eight days survives. The entire 9,046 accrued since 2026-07-31 — about
1,130/day.** So the report's _"monotonic in the number of times anyone has run the suite"_ is **not
what the data shows.** This makes the rate worse, not better, but the claim as written is unsupported.

### Measured, not read: a full green suite leaks exactly **+20**

Per-prefix counts before and after `bun test` (543 pass / 1 todo / 0 fail / 33 files):

| file                                                                                                         | prefix          | per green run |
| ------------------------------------------------------------------------------------------------------------ | --------------- | ------------- |
| `lock.test.ts:20` (`tmpLock()`, 5 sites) — `rmSync` removes the lock **file inside**, never the dir          | `anthill-lock-` | **+5**        |
| `comms.test.ts:498/:541/:548` — no cleanup at all                                                            | `anthill-d3-*`  | **+8**        |
| `comms.rotation.test.ts:37` (`fixture()`, 7 calls) — no `rmSync`/`afterEach`/`afterAll` anywhere in the file | `anthill-rot-`  | **+7**        |

**Three files account for 100% of the leak.** The implied run counts corroborate: `5210/5 = 1042` lock
runs, `2256/6 = 376` comms runs, `805/7 = 115` rotation runs — the last a test only three days old and
**the fastest-growing prefix by far.**

### Two attribution errors, in opposite directions

1. 🔴 **`team-commit.test.ts` is NOT a leaker.** The report names it as one of three. Measured: all 28
   `makeRepo()` sites use `try { … } finally { rmSync(dir, {recursive, force}) }`, `makeWorktree()`
   returns a `cleanup()` closure with `git worktree prune`, and a green run adds **+0**. The 40
   `anthill-commit-` dirs are historical residue. **One of their three named leakers is clean.**
2. **`anthill-rot-` was attributable all along — and it is the leaker they missed.**
   `comms.rotation.test.ts:37`, landed `81d3991` (2026-08-05), `git tag --contains` → **`anthill-v2.1.0`.**
   They searched cached plugin versions 1.5.0–2.0.0 and correctly found nothing, because **the fixture
   is newer than their newest cached copy.** Their flag-don't-guess instinct was right and their
   inference — _"a build not distributed here"_ — points the wrong way: it is a build _later_ than
   theirs, in this very repo.

### Their sharpest observation has the wrong diagnosis, and the right one is more actionable

The report says _"several of the smaller-count fixtures do clean up (they sit at 1–4 rather than
thousands)."_ Most sit at **0**. The 1–4 residues are the signature of `rmSync` written at the **end
of the test body** rather than in `try/finally` or `afterEach` — **they leak only on a failing or
aborted run.**

That matters because it names the correct pattern: **`team-commit.test.ts`'s `try/finally` and
`team-migrate.test.ts`'s `afterEach`, not `team-comms.test.ts`'s inline call.** The repo already
contains the right shape; this is a consistency sweep, exactly as they said.

### Two more notes

- **Understated in their favour:** the shipped CLI contains **no reference to the temp root of any
  kind** — not just zero `mkdtempSync`. `/usr/bin/grep -rn 'tmpdir()\|mktemp\|/tmp/\|TMPDIR' plugin/`
  excluding tests returns nothing. **No anthill user is affected**, and the qualifier is stronger than
  they wrote it.
- **Their own provenance caution applies to their own scan.** `scan.test.ts` mints `scan-root-` and
  `scan-nogit-`, which a `^anthill-` scan can never see. Harmless here — both are clean — but _"a
  hand-built prefix list cannot notice a prefix its author never heard of"_ is present in the
  measurement that says it.
- **Their fix #2 (a gate cell) is genuinely unbuilt.** No test anywhere reads `readdirSync(tmpdir())`
  or asserts anything about leftovers, across all 33 files.

### What would close it

- [ ] `lock.test.ts`, `comms.test.ts` and `comms.rotation.test.ts` clean up — the other 29 sites are
      already correct and should not be touched.
- [ ] The end-of-body `rmSync` sites move to `try/finally` or `afterEach`, so **a failing run stops
      leaking too.**
- [ ] A gate cell asserts the suite leaves no `anthill-*` behind. **Forgetting should be red.**
- [ ] The existing ~9,046 are a **separate one-time manual sweep**. Do not conflate the scar with the
      wound.

---

## #102 — `anthill feedback` rejects any message starting with `--`

**Disposition: `BUILD` — both failures reproduce verbatim on 2.1.0, and the report is STRONGER than
filed: wider blast radius, a third failure mode it missed, and a cheaper fix than any it proposes.**

### Reproduced exactly

```
$ bun plugin/scripts/anthill/cli.ts feedback "--as-of is the only rule…" --category idea --format json
{"ok":false,"error":"Unknown option '--as-of is the only rule…'. Valid flags: --category, --format, --skill, --submit"}
EXIT=1
```

And the `--` escape hatch reproduces **both** claimed silent failures: `--category idea` swallowed
verbatim into the title _and_ body, and the category silently falling back to `friction`, exit 0.

### 🔴 The third failure they missed, and it is the worst one

**`submitCmd` — the string the command hands the caller as its own suggested next step — is itself
poisoned:**

```
"submitCmd":"anthill feedback \"--as-of leads the line --category idea --format json\" --category friction --submit"
```

It re-quotes the flag-contaminated message **and hardcodes `--category friction`.** A caller who does
the documented thing — hand `submitCmd` to the lead, who runs it with `--submit` — **files the
misfiled issue with the tool's own blessing.** The command's doc comment promises it "NEVER drops the
report"; measured, it faithfully propagates the wrong one. **This raises the severity.**

### The blast radius is wider than the title, but only for half the defect

Root cause: `define.ts:295-300`, `strict: true` on `node:util` `parseArgs`, which reads any
`-`-leading token as an option name. **The repo already contains the fix at `define.ts:268-280` — but
only for a value that FOLLOWS a string flag.** A bare positional never reaches that branch.

| command              | message arrives as                                        | leading-dash                           | swallowed flag                       |
| -------------------- | --------------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| `feedback "<msg>"`   | `type:"positionals"`, joined (`team-feedback.ts:163-168`) | **FAILS**                              | 🔴 **SILENT — wrong category filed** |
| `comms send "<msg>"` | `type:"positional"` (`team-comms.ts:140`)                 | **FAILS — same defect, unreported**    | **LOUD — guarded**                   |
| `commit -m "<msg>"`  | `type:"string"`, alias `m`                                | **WORKS** — protected by the re-attach | n/a                                  |

- **Claim 1 is not `feedback`-only.** `comms send` fails identically — and it is worse there, because
  `--as-of` is a _real flag on that command_, so the token is genuinely ambiguous.
- **Claim 2 _is_ `feedback`-only, and the guard it asks for already exists 80 lines away.**
  `team-comms.ts:222-232` refuses surplus positionals loudly. `feedback` declares `type:"positionals"`
  and joins them, which opts it out of `define.ts:363`'s stray-positional refusal **by design.**

### The cheapest fix is one they do not propose

**`feedback` is the only free-form-text command with no `--stdin`.** `comms send` has one (verified
working), `commit` has `--stdin` _and_ `--file`. **Adding `--stdin` to `feedback` is the smallest
change that gives the caller an escape which cannot silently misfile.**

And **their fix #3 is already half-built**: the `--` hint exists at `define.ts:326-333`, but the
`dashValue` finder requires `!a.startsWith("--")`, so it fires for single-dash and is **unreachable
for exactly the double-dash case they hit.** A one-line relaxation, not new documentation work.

**One correction to their fix #1.** _"`feedback` takes exactly one free-form text argument"_ — it
declares `type:"positionals"` (plural) and deliberately joins them, _"so both a single quoted arg and
bare words work."_ Implementing the fix as worded **silently drops the bare-words form.** Fixable, but
it is a decision the report presents as free.

### Neither existing backlog item is a duplicate

- [`2026-07-31-parser-errors-bypass-the-agent-envelope`](../backlog/2026-07-31-parser-errors-bypass-the-agent-envelope.md)
  — **SHIPPED** (`e03ec52`, 2026-08-03). It fixed the _channel_: parser errors now emit `{ok,…}`.
  **#102 is strictly downstream** — the JSON envelope in #102's own transcript _is_ that fix working.
  That card was about rendering; this is about classification.
- [`2026-08-01-group-commands-read-a-flag-value-as-a-subcommand`](../backlog/2026-08-01-group-commands-read-a-flag-value-as-a-subcommand.md)
  — **OPEN, same family, opposite direction.** That one: a flag's **value** read as a **subcommand
  name**. This one: a positional **value** read as a **flag name**. Different code paths; neither fix
  implies the other. (`feedback` is a leaf, not a group, so the dispatch bug cannot reach it.)

**File it as the fifth defect under `docs/projects/agent-failure-surface/README.md`**, whose stated
rule — _the output is plausible, so nothing errors and nobody notices_ — describes #102's second half
exactly.

### What would close it

- [ ] A leading-dash message is accepted by `feedback` **and** by `comms send`.
- [ ] `feedback` refuses surplus positionals loudly, the way `comms send` already does.
- [ ] `submitCmd` is never emitted carrying a category the caller did not ask for.
- [ ] `feedback` gains `--stdin`.
- [ ] The `--` hint at `define.ts:326-333` reaches double-dash messages.
- [ ] Whatever ships preserves the bare-words form, or drops it **deliberately**.

---

## Cross-cutting — what this batch says about the last one

**The verification pass paid for itself again, and harder.** Of seven reports: **one headline
refuted** (#97), **one proposed fix actively unsafe** (#97's `||`), **one fixture attribution wrong in
both directions** (#100), **one central mechanism claim false** (#101's "unskippable"), and **one fix
pointed at a value that does not exist** (#99's `openedAt`). Every one of those changed the fix.

**Three of the seven are worth more to us as corrections to our own tree than as bug reports:**

1. **A card marked "ready to build" whose fix the field report forbids** (#96 → the down-presence
   card). The worst shape in the backlog, because it converts diligence into a defect.
2. **A decision we made on 2026-08-07 against evidence that had shipped on 2026-08-05** (#99 → 94·1,
   and `join/SKILL.md:121-132`).
3. **Two shipped statements describing remedies no team can reach** (`join/SKILL.md:130` and
   `comms.ts:445-451`, both pointing at session rotation, which has **no CLI caller**).

**And the recurring principle got its fourth and fifth sightings.** _A check whose passing output is
identical under the failure is not a check_ — now joined by #102's `submitCmd`, which does not merely
pass under the failure but **hands the caller a command that reproduces it.**

**The transferable half, offered upstream:** _an alternation over someone else's enum is a claim with
an as-of._ Both teams hit a version-boundary error in this batch — they attributed `anthill-rot-` to
"a build not distributed here" when it was a build **newer** than theirs, and asked for a warning that
**had already shipped in the version they did not have.** Neither is carelessness. Both are the same
missing mechanic: **a report's claims are relative to an installed version, and nothing on either side
records which one.**

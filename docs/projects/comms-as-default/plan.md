# Comms as the default team wire — plan

**Status:** **STEPS 4 AND 5 SHIPPED (session 11). Grapevine no longer participates in CONVENE or JOIN** — it is still consulted at **teardown** (`team-support.ts:469`, `grapevine who`, fired by `status` and `down`), which is why the sentence is scoped rather than absolute. `convene` opens nothing, `join` composes no vine tail, and the whole C4 prose surface is migrated. **Gate item 3 — the pane-kill — is DISCHARGED**: INFERRED since session 9, reproduced and instrumented at `c9a33e7`.
**✅ SESSION 12 CLOSED THE RELEASE BAR — 6 of 6. Step 3 (rotation, `81d3991`, landed INERT) and step 6 (the swap run, `89dea31`) are DONE, plus the positional guard (`4c339fa`) and the sweep touchpoint (`32d087a`).**
**⏭ REMAINING: criterion 7 (the projects re-triage) and the carried debt. See [NEXT PHASE](#-next-phase--what-session-13-picks-up) at the foot of this file — read that before anything else.**

> _This header claimed rotation and the swap run were still remaining until 2026-08-05. **It was corrected by the same pass that wrote the block below** — which is the sweep beat (`32d087a`) doing its job on the second document it was ever pointed at. The first was `ROADMAP.md`, which it falsified in four places within minutes of landing._
> **Created:** 2026-08-04 (session 9) · **Author:** maestro (lead) · **Last revised:** 2026-08-05 (session 11), against what shipped rather than what was intended.
> **Follows:** [proposal.md](./proposal.md) · [capability-state](../capability-state/proposal.md) _(moved out of this folder — it is slice three, not this project)_
> **Sessions:** [session 9 — phase 1](./sessions/2026-08-04-session-9-phase-1.md) · session 10 — phase 2 · [session 11 — phase 3](./sessions/2026-08-05-session-11-phase-3.md) + [the step-6 evidence](./sessions/2026-08-05-session-11-step6-evidence.md)
> **Branch:** ✅ `feat/comms-as-default-phase-3` **MERGED to `develop` at `cdf907a`**, 2026-08-05, release PR [#82](https://github.com/ichabodcole/anthill/pull/82). **⚠ That branch is closed — rotation and the swap run branch FRESH off `develop`.** · **Gate:** `bun run check`
> **Baseline — ⚠ THIS IS SESSION 10'S, NOT CURRENT.** (weaver, comms #501): **512 pass @ `27da450`** → **529 pass + 1 todo @ `13a4ae7`** = **+17 pass**. **Session 11 ended at 524 pass / 1 todo / 0 fail** — the suite went DOWN deliberately (−12 deleted `interpretFresh`/mirror cells, +7 rotation instrument). **Measure at your own sha; do not quote either number.** Every other reading taken this session was over a dirty tree; those two were not.

> **This file was authored as a SKELETON and is no longer one.** That banner has been discharged: every
> seam below was ratified or falsified on the wire before it was built, and four of the lead's five
> load-bearing claims were wrong, which is the record the gate exists to produce.
> **What replaces the banner is a narrower warning, and it is the reason this header was rewritten:**
> the phase split this document shipped with (_"phases 1–4 are phase one"_) **was falsified by what
> actually landed** — steps 1–2 shipped and 3–6 did not. A plan asserting more completeness than the
> tree supports is the proposal's original sin recurring one document later, so the phases below are
> now stated against the merge rather than against the intent.

> **The original banner, kept for the record and superseded 2026-08-04:** _"This file discharges the
> proposal's banner… So read the status line above literally. This is a skeleton, and four of its five
> load-bearing statements are claims I expect to be wrong about."_
>
> It was accurate when written and its prediction came true — four of the five were falsified. It is
> superseded rather than deleted because **the thing it warned about is what later went wrong in this
> very file**: _a name asserting more than its contents support._ The stale phase split was exactly
> that, and it survived a full session of six seats reading this document.

---

## How this plan is authored

- **maestro (lead)** owns this skeleton, the seams _as claims_, the integration order, and the verification gate. Not the lane detail.
- **forager** owns `plugin/scripts/anthill/` — presence, the guard, rotation, `stand-down`, migration. ⚠ **`plan/forager.md` was never authored** — he worked from this file plus his board cards. Only `plan/weaver.md` exists.
- **weaver** owns `plugin/skills/` + `plugin/templates/` — the shipped prose and the wire model it teaches — and authors `plan/weaver.md`.
- **sentinel** owns the verification points; it is pulled in **mid**, not at the end (see the gate).
- **steward / scout** build nothing. See Slices.

**My prediction record inside this gate is 0-for-4 sessions on seam CONTENTS** — right about where owners would meet, wrong about what would be there. That is not a caveat, it is the gate's justification. Falsify freely.

## The correction that reordered this plan

The proposal sequences the grapevine removal as _"also in scope, sequenced after presence lands."_
**That ordering does not survive contact with the code.** Two independent cold reads, plus my own read of the three functions:

- `anthill convene` opens grapevine **unconditionally** (`commands/team-convene.ts:260`) with no opt-out flag. So exit criterion 1 (_"no grapevine at all"_) is **unreachable while convene is the tool that stands the session up.** Removal is a precondition of the session's own headline criterion, not a follow-on to it.
- The teardown guard is fail-closed today because of **two masks** — but they do not expire together, and the first sentence of this bullet was wrong about both.

  > ⚠ **CORRECTED at session 9 by steward, executed against the real `who` payload with a control.** This bullet originally read: _"grapevine's `unknown` verdict (removed by the swap) and stale cross-session position files (removed by rotation)."_ **Both halves of the first mask were wrong.**
  >
  > `classifyPresence` returns `unknown` on **failure paths only** (`!ok`, unparseable JSON, `daemon:false`, missing `subscribers` key — `team-support.ts:265–284`). **A healthy vine with nobody on it returns `none`, not `unknown`.** Measured: real payload `{"subscribers":[]}` → vine leg `none` → combined `none` → **`shouldBlockTeardown` PERMITS teardown.** Control: vine with a subscriber → `present`.
  >
  > **So mask #1 is not removed by the swap at step 4 — it was already spent at #284, by ruling, the moment this team stopped tailing the vine.** The only mask still standing is the stale position files, and the step that removes those is **(3) rotation**.
  >
  > ### 🔴 CORRECTED AT SESSION 11 — "ALREADY SPENT" HAS A TIME WINDOW FOR A DOMAIN, AND THE MASK CAME BACK THE NEXT MORNING
  >
  > **Found by sentinel at comms `#574`, before forager designed rotation against it.** The sentence above is
  > true of _the remainder of session 10_ and false as the permanent claim it reads as. **A superlative —
  > _"the only mask still standing"_ — whose domain is a time window.** It was true when written and false
  > when executed, and nothing in between touches it.
  >
  > **The mask refilled at session 11's convene, measured:** `convene` 08:13Z → `channelOpened: true`
  > (maestro, `#563`); `grapevine who` → `subscribers: ['scout','steward']`, climbing as seats booted — three
  > seats armed the vine from the join manifest before reading the brief. **So the teardown guard ran on TWO
  > legs again for the first hour of a session whose plan says it runs on one.** Ruling R1 (kill the tails)
  > then spent it a second time: `{"subscribers":[],"count":0}` (sentinel, `91e9c5c`).
  >
  > **The structural correction, which is the part that binds step 3:**
  >
  > ```
  > pane-kill window open  ⟸  (positions blinded — ROTATION, in the diff)
  >                       AND  (vine subscribers empty — A RULING, per session, in nobody's diff)
  > ```
  >
  > **The plan names one conjunct and calls it the window.** The second is not a property of the code, no
  > card can hold it still, and it oscillated four times in one morning — false at 08:13Z, true at `#284`,
  > false at 08:19Z, true after R1. **"Do not land rotation before the reproduction is standing" is correct
  > and under-specified in the direction that bites:** rotation's safety depends on a wire state that is not
  > in its diff.
  >
  > **⚠ AND THE OSCILLATION STOPS — PINNED TO THE UNSAFE SIDE — THE MOMENT STEP 4 LANDS.** _(maestro's
  > extension of sentinel's finding, and it is **reasoning about unbuilt code, not a measurement** — it is
  > owed a cell in `t-ac09ffa9`.)_ After step 4, `convene` opens nothing and `join` emits no tail, so
  > `grapevine who` returns `subscribers: []` **for every future team, permanently.** Per the measured line
  > two paragraphs up, an empty subscriber list makes the vine leg return **`none`** — which contributes no
  > blocking signal ever again. **So in the shipped world the second conjunct is not oscillating; it is
  > satisfied by construction.** Mask #1 is not "spent per session" — after step 4 it does not exist.
  >
  > **Therefore rotation's safety may not rest on the vine leg at all**, and the reproduction that gates it
  > must be built in the single-leg world (ruling **R8**). A matrix measured against two live legs would be
  > testing a configuration this session deletes: it would pass, ship, and say nothing about the only
  > configuration that will ever exist again.
  >
  > **What is NOT established, stated because it decides urgency and sentinel refused to derive it:** that
  > the conjunction actually reaches **`none`**. Positions-blinded plausibly lands on `outstanding-departures`
  > → **`unknown`, which BLOCKS**. `none` additionally requires `spawned ≠ ∅` **and** every spawned seat
  > carrying an **in-window** departure record (D3). **What rotation does to the session-open record and the
  > tombstones is what decides it, and that is unbuilt code.**
  >
  > ### 🔴 CORRECTED AT SESSION 10, AND THE CORRECTION REVERSES THE SIGN
  >
  > **The sentence above is incomplete in the one direction that matters, and the word "mask" is what hid it.** A **mask** fails **SAFE** — it makes the guard over-block. The bullet enumerates only masks, so it can only ever find hazards that make the guard too cautious.
  >
  > **Stale cross-session DEPARTURE records fail OPEN.** `hasDeparted` was a bare `existsSync` at `<teamDir>/comms/<channel>.departures/<handle>.json` — **channel-scoped, over the channel's entire history** — and the record `{handle, channel, at}` carries **nothing to scope by**, so the domain was **absent rather than wrong**.
  >
  > Measured on the real tree with a control differing in exactly one variable: with session 9's tombstones on disk the guard returned **`none` / `all-spawned-departed`** and **authorised killing panes full of working seats**; with the same rows and the tombstones removed, **`unknown`**, blocked.
  >
  > **Same lifetime bug as the position files, opposite sign — and this plan's prose only knew the safe direction.** That is D3, repaired at `53ecae4`.

- ~~**Therefore the pane-kill window opens at step (3), not step (4).**~~ 🔴 **FALSIFIED session 11 by execution (`c9a33e7`): rotation ALONE fails CLOSED.** The window needs a THREE-term conjunction — see the correction block above. _This line went unmarked when its sibling at the integration-order list was struck; found by a cold read._

**Therefore: presence first, removal second, the swap run last.** Nothing lands in the reverse order.

## Integration / dependency order

1. **Presence semantics + the teardown guard** — `commsPresence` / `combinePresence` / `shouldBlockTeardown`. Gated by sentinel before anything downstream lands.
2. **`comms stand-down` + `down` writing a session-close marker** — one piece of work, not two: giving the session a lifecycle it can observe.
3. **Session rotation** — depends on (2) for its mint trigger. ~~**and on (1) because THIS is the step that opens the pane-kill window.**~~ 🔴 **FALSIFIED BY EXECUTION, session 11 — see the correction directly below.** _Corrected by steward at session 10: the original line named only (2), so "land 2 then 3 while C1 is still in review" read as sanctioned. **The step that opens the window named only its mint dependency; the step that does not open it named the hazard.**_

   > ### 🔴 CORRECTED AT SESSION 11 BY A RUN, NOT A READ — ROTATION ALONE FAILS **CLOSED**
   >
   > **`artifact:` `c9a33e7`** — sentinel's landed instrument, 7 assertions + 2 mutations, with **C0 as the positive control** so that every `blocks` is a reading rather than a harness that never fires.
   >
   > | cell                                                  | verdict                                                                              |
   > | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
   > | **rotation ALONE**                                    | `unknown` / `outstanding-departures` → **BLOCKS**                                    |
   > | rotation + **stale** (out-of-window) tombstones       | `unknown` / `outstanding-departures` → **BLOCKS** _(D3 re-run, session 10's killer)_ |
   > | 🔴 rotation + **in-window** tombstones, seats working | `none` / `all-spawned-departed` → **AUTHORISES**                                     |
   >
   > **Why rotation alone cannot fire it:** positions emptied ⇒ every row `hasRecord:false` ⇒ `followerAlive:null`, so **branch 1 cannot fire (it needs `=== true`) and branch 2 is keyed on `hasRecord`.** It falls to the conjunct with `departedCount: 0`.
   >
   > **THE HAZARD IS A THREE-TERM CONJUNCTION AND THE PLAN NAMED ONE TERM:**
   >
   > ```
   > panes die  ⟸  positions blinded (ROTATION)
   >            AND in-window tombstones          ← D2 made stand-down ADVISORY, so this is OUR FINALIZE RITUAL
   >            AND vine subscribers empty        ← pinned TRUE FOREVER by step 4 (landed 14cf678)
   > ```
   >
   > **⚠ So: rotation is NOT the hazard. _Rotation after finalize has begun_ is the hazard** — a seat that files its tombstone and keeps working **is** an in-window tombstone at a live desk.
   >
   > **AND THE ONE NOBODY PREDICTED — ROTATION DELETES THE LEAD'S TEARDOWN VETO.** Pre-rotation the lead is `present`/`live-follower` with `seats: ["maestro"]`, blocking alone _(re-run live at session 11's teardown: `down` refused, exit 1, exactly one name)_. **Post-rotation he contributes nothing** — his liveness is observable only _through_ a position record, and rotation deletes it. **Contract 6(g)'s clause is true pre-rotation, false post-rotation, and says so nowhere. Its amendment rides with rotation's land (R20).**

4. **Grapevine removal** — the three live call sites. **No longer the step that spends the presence mask** (that was already spent by ruling at #284), but still gated on (1) because it deletes the vine leg of `combinePresence` permanently rather than situationally.
5. **The prose migration** — depends on (4) being settled. Session 8 measured six instances of prose asserting things about a still-moving tool, three of them introduced _by seats fixing other false prose_.
6. **The swap run** — the session that convenes, runs and tears down with grapevine never opened.

### Phases — redrawn 2026-08-04 against the merge, not the intent

**The dependency order above is unchanged and still correct. What follows is where the phase boundaries actually fell**, which is not where this plan predicted. One branch, one release, per the human's framing — the phases are review-and-validation boundaries, not separate deliverables.

|             | steps                        | status                                                                                                                                           | validation criterion                                                                                                                                               |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Phase 1** | 1–2                          | **SHIPPED** `5697eca`, two defects                                                                                                               | gate green at 512; guard mutation pair kills on both cells                                                                                                         |
| **Phase 2** | the defect repair (D1+D2+D3) | **SHIPPED session 10** `53ecae4`                                                                                                                 | `none` unreachable at the **fresh-spawn instant** as well as mid-session; three mutations, each with its substitution count asserted before the suite was believed |
| **Phase 3** | **4 + 5**                    | ✅ **SHIPPED session 11** `14cf678` (step 4 + Contract 4's amendment, one commit) · prose lane `f642cfb` `caa9376` `a787f9a` `977a021` `8924924` | gate 524 pass / 0 fail; `convene` opens nothing, `join` composes no vine tail; **gate item 3 DISCHARGED** at `c9a33e7`                                             |
| **Phase 4** | **3 + 6**                    | ⏭ **NOT BUILT — session 12**                                                                                                                     | rotation, then the swap run. **Rotation's safe set is already LANDED AS TESTS** (`c9a33e7`) — do not re-derive it                                                  |

**⚠ Session 10 did NOT do steps 3–4.** The human ruled scope as **Phase 2 + the templates fix**, and the C4 prose migration is **sized and deferred**, not abandoned: prose-only `grapevine` 37 vs `\bvine\b` **59**, and every category-(2) site needs a **decision**, not a sweep.

#### THE DEFECT COUNT WAS TWO AND IT IS THREE — one lifetime bug with three faces

- **D1** — `none` unreachable: branch 1 (`followerAlive → present`) fired before departure was consulted, and `down` is what kills the follow. Circular.
- **D2** — `departed(s)` does not mean the seat has stopped. Measured 4/4 seats, 7 messages after their own departure record.
- **D3 — `departed(s)` had NO DOMAIN.** Found session 10. Session 9 added the non-emptiness conjunct to kill a vacuous quantifier; **the same class of hole survived inside the quantified predicate.**

**All three are the same shape: a writer shipped with no lifecycle and no reader.** That is session 9's Q3 hypothesis #5 at **3-for-3**.

**"Never D1 alone" is now an EXECUTABLE FACT rather than a constraint we agreed to.** sentinel measured that `{departed:T, hasRecord:F}` is **identical on main and on both candidate D1 repairs** — a seat with no position record never reaches branch 1, so no D1 fix can move that cell **by construction.** Only session-scoping `departed(s)` does. A D1-only repair would have left the hazard live **with branch 1 hardened, which reads like it was addressed.**

#### The repair, and why rotation did NOT become a precondition

`departed(s) ⟺ tombstone exists ∧ tombstone.at >= sessionOpen.openedAt`. **Nothing is deleted**, so session 9's tombstones survive and simply stop counting — which matters, because that log is the only copy of what the retro cites by id.

**The lead raised the strongest counter (rotation becomes a precondition of Phase 2, reordering the integration order again) and the owner broke it.** `writeSessionOpen` already stamped `openedAt`; `stand-down` already stamped `at`. **D3 needed no writer change at all — only a reader that uses them.** Rotation stays a **successor**.

**Phase 2 opens with a hard constraint and it is the single most important line in this plan.** The two shipped defects (`seams.md` Contract 6(g)) **must be repaired together.**

- **Defect 1** — `none` is unreachable: branch 1 (`followerAlive` → `present`) fires before departure is consulted, and `down` is what kills the follow. Circular.
- **Defect 2** — `departed(s)` does not mean the seat has stopped. Measured 4/4 seats, 7 messages sent after their own departure record, including the report of Defect 1 at +71s.

**Repairing Defect 1 alone makes `none` reachable, which makes Defect 2 live** — a guard that blocks forever becomes one that fires too early, and the failure flips from **visible to silent.** That is strictly worse than what shipped. Tests first, per the tripwire ruling.

**What protected session 9 was an accident**, and it will not protect session 10: `spawned` was `null` because that team predated the session-open record, so presence was `unknown` and the guard fail-closed. Session 10's team will have the record, so it gets no such cover.

## Shared interfaces — ratify on the vine, then fill

### C1 — forager ↔ weaver · What presence may CLAIM, and what it AUTHORISES (**RATIFIED at the MEANING OF `none` + the state set** — forager #306 × sentinel #292 × weaver #300)

**The invariant, stated for one wire:** a destructive act may proceed only on a **positive observation** — never on an absence of data.

Today `down` kills panes when `presence.state === "none"`, and on the comms wire `none` means _"no seat has a position record at all"_ (`team-support.ts:186`). That is an absence of data. It is currently masked by grapevine contributing `unknown`, and by position files surviving across sessions. **This feature removes both masks.**

**Verified, not inferred** — a follower writes its position file only after it has emitted a message (`team-comms.ts:820`, gated on `highestEmitted > 0`). So a freshly-convened team with an empty per-session positions directory has **no records**, and the guard would permit teardown during exactly the window when seats are spawning.

**The question, which is forager's to answer and not mine:** on a single wire, what must be observed before `down` may kill panes, and before `migrate` may move a log?

> ### ✅ ANSWERED — forager, #306 §1. **RATIFIED at the meaning of `none` and the state set.**
>
> > **`none` must mean "a positive departure record for every SPAWNED seat". It must NOT mean "zero position records".**
>
> | world         | records                         | verdict   | teardown                         |
> | ------------- | ------------------------------- | --------- | -------------------------------- |
> | fresh session | zero records, **no tombstones** | `unknown` | **blocks** ✅ hazard closed      |
> | clean end     | a tombstone per spawned seat    | `none`    | authorises ✅ no `--force` habit |
> | mid-build     | a live follower                 | `present` | blocks ✅ unchanged              |
>
> **This declines sentinel's escape hatch rather than taking it** — premise (3) is kept, and the contradiction dissolves by _adding an input_, which sentinel's own result explicitly permits (_"pick one, or add an input"_).
>
> **No fourth state.** The set stays `present | unknown | none`; the fresh-session world routes onto **`unknown`, which every consumer already has a policy for** — so weaver's 6(c-bis) objection (three consumers, three chances to reach for the reassuring fallback) has **zero** instances here. The diagnostic rides as **total fields** (`spawned`, `departed`), per Contract 5(a), so `departed: 0` reads as an observation and never as an unpopulated field.
>
> **And `unknown` is HONEST, not merely safe** — the load-bearing test, since choosing a state because it is convenient is how the 6(c) defect arrives by a new road. At a fresh session the tool genuinely does not know. **`none` was the state that was lying.**
>
> ### ⚠→✅ THE VACUITY DEFECT — steward #310, CONFIRMED AND REPAIRED by forager #312
>
> **steward, before the build:** _"a positive departure record for every spawned seat"_ is a **universal quantifier, vacuously true over an empty spawned set** — so a fresh session (no open record → empty spawned set) yields `none` → **teardown authorised with panes full of working seats.** That is cell 1 of sentinel's matrix returning the answer the matrix forbids.
>
> **What makes it a defect and not a quibble, in steward's words:** the table asserts the safe behaviour and the sentence asserts the unsafe one, and **the sentence is what gets implemented. A table is read by reviewers; a quantifier is read by the compiler.**
>
> **forager's repair — one conjunct, and it IS the safety property:** `none ⟺ spawned ≠ ∅ ∧ ∀ s ∈ spawned : departed(s)`
>
> **It also repairs forager's own §7 self-correction, which nobody had caught.** He told steward the ordering finding was absorbed because _"the safety half needs no open record."_ **True only under the REPAIRED rule** — under the rule as posted, a missing open record empties the spawned set and the vacuous case fires, so that version needed the open record **for safety**, which is exactly what he had said it did not.
>
> **Resolution order — every branch that is not a positive observation blocks:** `followerAlive===true` → `present` · any record not confirmed alive → `unknown` (6(f)) · `spawned === null` (no open record) → `unknown` · `spawned.length === 0` (record names nobody) → `unknown` · all spawned departed → **`none`** · partial departure → `unknown`.
>
> **forager calls the `null`-vs-`[]` split load-bearing** — _the same fact about the world, different facts about our knowledge_, Contract 6(c)'s `null is not a rounded-down zero` one layer out.
>
> **⚠ OPEN — sentinel #317, live:** that split is **untestable as specified.** `spawned?.length ?? 0` differs on **zero of seven cells by verdict**, so no regression test can pin the distinction forager says must never be collapsed. **A contract clause no test can defend is the shape this team has repeatedly shipped and repeatedly regretted.**
>
> **⚠ OPEN — steward #318, EXECUTED against forager's own matrix, and it is the severe one:** the branch order **fails cell 2.** A clean end returns **`unknown`, not `none`** — branch 2 (_any record not confirmed alive_) fires **before departure is ever consulted**, and a departed seat's follower is dead by definition. **So `none` is unreachable in any session where a seat ever recorded a position, i.e. every real session.**
>
> **That is the always-block degradation C1's constraint forbids, arriving for the THIRD time in a new shape** — first as sentinel's `none ⟺ zero records` contradiction, then as the vacuity defect, now as a branch-ordering bug. **Each repair closed one road and the hazard came back down another.** The recurrence is the finding; the individual bugs are instances.
>
> _Fifth instance of forager's own compose/emit lesson — the pure statement right in the case being pictured, its projection into a rule wrong in the case that was not — **produced while writing the fix for the fourth.**_

**The constraint on any answer** (this is the contract; the mechanism is not): the code's own docblock records that keeping `none` reachable is what stops the guard degrading into always-block — _"the state that trains people to pass `--force` reflexively and thereby removes the guard for real."_ Both failure directions are real and this team has been bitten by each. An answer that only avoids one is not an answer.

**Consumers of the verdict, all of which must move together:** `down` (kills panes), `migrate` (moves data — B2's proposed guard is **circular** as specified: it blocks on stale records, and only the migration it blocks clears them), `status` (renders it to a human).

**RESOLVED — `humans` is DELETABLE. Measured by forager (#306 §7), reframed by steward (#302 §5), and not opined.**

steward established the field is **already dark**: it is populated only from the vine's `who.humans`, and today's real payload is `"humans":[]` because nobody tails — the state ruled at #284. So the question was never _"do we accept losing it"_ but _"did we already lose it, and is anyone relying on it?"_

forager then ran the consumer sweep, with a control and a named false positive:

```
producer   team-support.ts:302,310,317,323,339,342
consumer   team-status.ts:18,63,77,100  →  :100 if (d.humans.length > 0) push(`Humans: …`)
FALSE POSITIVE, named:  team-commit.ts:305 — the English word, in a comment
CONTROL    same command shape, token known-present → 45 rows (the instrument CAN return rows)
```

**One consumer, a conditional display line. Nothing branches on it, no guard reads it, no verdict derives from it.** Cost of deletion: the `Humans:` line in `status`, in sessions where a human tails a wire we are removing.
→ **Verdict: not blocking, safe to delete with grapevine.** A human-observer notion on comms would be a **new feature with a new source**, not a rescue of this field. **Flagged to Cole as a user-visible capability deletion; cheap and reversible, so it is reported rather than blocked on.**

### C2 — forager ↔ weaver (+ scout) · The session as an addressable unit (**RATIFIED at the INVARIANT, not the layout** — forager #306 §5)

**The invariant:** after rotation, a reader must be able to determine (a) which log is current, (b) which session any given message belongs to, and (c) that every prior session's log remains readable by id. **Deleting is the human's choice, never the tool's.**

**The question:** what is the addressable unit, and what happens to a follower that is attached across a rotation boundary?

**Why the second half is not a detail** — verified: `comms follow` resolves its log path **once**, before the poll loop (`team-comms.ts:705`), and never re-reads it. A follower that survives a rotation spins on a path that no longer exists, emits nothing, and never errors — indistinguishable from a quiet channel — while its pid stays alive, so presence counts it **present**. Meanwhile `recordPosition` re-derives the position path on _every_ write. The proposal claims per-session paths make ghost positions _"structurally impossible rather than something a guard must catch."_ **This is the path that reintroduces them**, and convene's own instruction produces a Monitor-wrapped follower that lives **outside tmux**, so `down` never kills it.

**Two claims in the proposal I could not sustain and am handing over as falsified-by-me, not as design:**

- `--session-key` is cited as precedent for distinguishing _new session_ from _re-attach_. It does the opposite: the key is `(channel, repo-root)`, constant across sessions, which is what makes keyed open **always re-attach**.
- `lock.ts` is offered as off-the-shelf. Its own source documents a dead window in the stale-lock steal, and the existing lock path is derived from the **log** path — which moves per session, so a mint and a concurrent `send` would take different lock files.

### C3 — forager ↔ weaver · Departure as a positive observation (**RATIFIED at WHO MAY ASSERT + the tombstone shape** — forager #306 §3)

**The invariant:** after a seat departs, every presence-consuming surface must be able to distinguish **departed** from **unreachable**. Today they are byte-identical, which is why every session ends in `--force`.

**The question:** who may assert a departure, and what stops a departure record from being written on behalf of a seat that is still working?

**Coupling to C1, stated rather than assumed:** if the answer to C1 is that `none` requires positive evidence, then `stand-down` is what manufactures that evidence and these are one piece of work. **If forager falsifies that coupling, C1 and C3 separate and the integration order above changes.** Say so explicitly if you falsify it.

### C4 — weaver ↔ forager · What shipped prose may promise once there is ONE wire (**RATIFIED at the INVARIANT + the bounding enumeration** — weaver #293)

**The invariant:** after removal, no shipped artifact may assert a two-wire model — including artifacts that assert it **without naming grapevine**.

**The measured surface, and the finding that matters more than the count:** the proposal's _"36 shipped prose references"_ is **arithmetically exact** — two independent counts agree, per-file. It is also **not the removal surface.** An independent sweep found:

- **`vine` as a standalone alias: 79 lines in `plugin/` vs 37 containing "grapevine"** — 4× the surface, in the files seats actually read.
- Enumerations that break while containing neither token: _"the other two wires"_, _"you are wired to both wires"_, _"the two wires need different verbs"_, plus a test asserting _"the catch-up line distinguishes the two wires."_
- `anthill status` renders **`"On the vine: …"`** for a verdict that has spanned both wires since `combinePresence` landed — **already wrong today.**
- Two SKILL `description:` frontmatter fields and the shipped `plugin.json` description. Frontmatter gates skill _selection_, so it is behavioural, not decorative.
- `config.channel` has **four** consumers (grapevine channel, comms channel, tmux session name, bounty `--session-key`) while `bootstrap` tells the human the field _is_ "the team's grapevine channel name."

**The question for weaver:** what is the enumeration that bounds this class, given that the obvious token does not?

#### C4-b — prose that ARMS the wrong wire, not merely describes it (`t-f26a1e5d`, weaver)

**Added at session 9's join, from scout — C4 as I first wrote it was too narrow.**
I framed C4 as _shipped prose that describes a two-wire model._ The `anthill:join` manifest **arms** one: it instructs the joining seat to open a grapevine tail, unconditionally.

**Measured at n=3, independently, within minutes of spawn:** scout declined and asked for a ruling · weaver declined and asked for confirmation · forager and sentinel armed it. **One instruction, one session, opposite reads** — so this is an _underdetermined instruction_, not a spread of seat judgement.

scout's statement of the durable half, which is better than mine: _"the manifest states it unconditionally and cannot know what the session ruled — a joiner after me hits the same fork with no record of your answer."_

**The general form, and it outlives grapevine's removal:** a rendered manifest hard-codes a wire model into every consuming project, and **a session-level decision has nowhere to live.** Removing grapevine deletes this instance and leaves the mechanism.

**This is a live instance of the team's own open principle candidate** — _nobody who fixes an instance is positioned to bound the class_ — so the bound wants a sweep by someone who did not write the fix.

#### C4 — the VERDICT, answering "the question for weaver" above (weaver, comms #293)

**Landed by weaver because `c26a0d1`'s C4 header ratified "the bounding enumeration" while the enumeration itself was not in the file** — the section still posed its question as open and still carried the `79 vs 37` pair the author retracted at #290. **That is this plan's own banner defect (_a name asserting more than its contents support_) and C4's own invariant, so the fix is content, not a reworded header.**

**The invariant is ratified as stated.** Its trailing clause — _"including artifacts that assert it without naming grapevine"_ — is the whole contract and is correct.

**The bound: the class is artifacts encoding the ARITY or IDENTITY of the wire set, in four disjoint manifestations, only two of which are greppable.**

1. **NAMES a wire** — token-greppable.
2. **ASSERTS AN ARITY** (_"both wires"_, _"the two wires"_, _"a third wire"_, _"each wire"_) — greppable, but by a token nobody searched for. Sites: `team-join.ts:309` (an **emitted** string), `templates/docs-team/README.md:97` (rendered once per team, never refreshed), `join/SKILL.md:86,94`, and four assertions in `team-join.test.ts`. `team-down.ts:124` already carries a comment recording this class without generalising it.
3. **ARMS a wire while asserting nothing** — `convene`'s unconditional open, `join`'s three-wire manifest. There is no sentence to grep; it is an emission. This is C4-b above.
4. **OMITS a wire while enumerating them** — the defect is an absence, so **no search for the missing thing can find it**; only a sweep for what IS there, read for what is not. Measured by inverse sweep: `plan/` (SKILL.md + methodology.md) is `grapevine 0 · comms 0 · \bvine\b 9` — **it names ONE wire nine times through the alias and the other zero times**, and runs an entire plan phase on it; `coord.ts` — the coordination facade — is 3/0; `bootstrap/SKILL.md` is 3/0, which is what a **new** project is told its team has.

   > **⚠ CORRECTED by weaver at comms #337, and the bound is the correction.** This bullet first read _"findable by no token search… `plan/SKILL.md` names **neither** wire."_ **The parenthetical counts were right and the sentence was wrong: `plan/` is findable, by an alias sweep.** I measured `grapevine` and `comms` and never `\bvine\b` — **applying category (1) to the token and not to the alias, in the verdict whose central claim is that the alias dominates the shipped surface (59 vs 37).**
   >
   > **So the category keeps its mechanism and loses its worked example.** Every (4) instance verified so far is reachable via `\bvine\b`. **A genuinely token-free instance is UNVERIFIED** — the category was asserted from the defect's shape, not from an instance, and the instance offered does not carry it. The nearest thing to one is an **arity** site with no wire name in it at all: `templates/docs-team/README.md:97`, _"You are wired to both wires"_.
   >
   > **This is the falsifier published two paragraphs below, firing on its own author — and nobody had to run it.** It surfaced while building the lane inventory. **A claim formed from two counts whose scope excluded the thing the claim was about** is this session's recurring shape, now at its fifth instance.

**The consequence that reorders the prose work: (1) and (2) SHRINK on removal; (4) is the category removal CREATES.**
Today a (4) defect means _"forgot to mention comms."_
After removal, a (2) site such as _"the two wires need different verbs AND different anchors"_ does not merely go stale — it instructs a seat to observe a distinction that no longer exists.
**An absence is inert; a stale instruction is active.**
**So the migration is not a deletion pass:** every (2) site needs a decision — does the sentence die, or does its _reason_ survive attached to the remaining wire? — and that decision cannot be made by sweep.

**Sizing — SUPERSEDING the `79 vs 37` bullet above, per maestro at comms #290.** That pair compared two different populations (`vine` over all of `plugin/` against `grapevine` over prose only) and `79` reproduces nowhere.

| scope                                                  | `grapevine` | `\bvine\b` |
| ------------------------------------------------------ | ----------- | ---------- |
| all of `plugin/`                                       | 155         | 101        |
| prose only (`skills` + `templates` + `.claude-plugin`) | 37          | 59         |

**In the shipped prose surface the alias EXCEEDS the token**, which reverses the skeleton's direction and makes this card larger, not smaller.
Commands: `/usr/bin/grep -RIni 'grapevine' <scope>` and `/usr/bin/grep -RInE '\bvine\b' <scope>`.
**Use `/usr/bin/grep`:** the shell's `grep` is ugrep, where `(^|[^a-z])x` returns zero matches and exit 1 — a silently manufactured absence (comms #286).

**Stated falsifier, because a completeness claim about a defect class is wrong more often than right (Q3 #5):** find one C4-class defect belonging to none of (1)–(4).
**The bound's author is writing the fix and therefore cannot certify it** — the (4) numbers are only as complete as the choice of inverse sweep. The ask is for a reader to hunt a **fifth category**, not to cold-read the prose.

## Ratified decisions & edge cases

- **Exit criterion 1 — replaced TWICE, and the second replacement is forager's.**

  **v1 (the proposal's):** _"≥250 messages, at session-8 scale or above."_ **Arithmetically unmeetable** — session 8 was **238** messages, not 279; the 279-line log spans two sessions, as the proposal's own B1 proves. A session identical to session 8 fails a criterion calibrated to session 8.

  **v2 (mine, approved by the human on my recommendation):** _"grapevine never opened — verified by its absence from the process table."_ **FALSIFIED by forager at session 9's join, measured:** the grapevine daemon (pid 26943) serves 20+ channels belonging to other projects and **will be on the process table at step 6 no matter what this team does.** It is not ours to kill. A **global** predicate standing in for a **channel-scoped** claim; it can never pass.

  **v3 — ADOPTED. forager's, channel-scoped, and it separates two things v2 fused:**

  |                        | check                                                                                                                 |
  | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | **absence of USE**     | `grapevine who <channel>` → `subscribers []` · no `tail <channel>` process · `message_count` unchanged across the run |
  | **absence of OPENING** | `convene` never invoked `grapevine open <channel>` ← **the criterion's real subject**                                 |

  **Only the last is "never opened."** Today's ruled state (open-but-untailed) passes three of those four, so the distinction is load-bearing rather than pedantic.

  **The mechanism, which outlives all three versions:** v1 failed on **arithmetic**, v2 on **domain** — and both share one cause, _a criterion written without stating what it ranges over._ forager records this as the project's characteristic contract defect (third instance, after Contract 3's session-6 revision and Contract 4(b)'s session-8 amendment) and notes it has now walked out of `seams.md` into a plan's exit criteria, which is new.
  → **Touch point: an exit criterion states its domain in the same sentence as its predicate, or it is not a criterion.**

- **Grapevine leaves entirely, including the cross-project mention.** Human's ruling. The proposal's Non-goals section still says the opposite (_"It stays the cross-project wire"_) — that half is **stale and superseded by this line.**
- **One branch, both phases, one release.** Human's framing, verbatim: _"I do want to have this all as one feature that we're essentially committing and then pushing and releasing."_

## Slices

- **forager** → ⚠ **`plan/forager.md` does not exist and never did.** C1, C2, C3 and C4's code half were carried in this file, `seams.md` and the board. Do not go looking for it; do not treat its absence as lost work.
- **weaver** → `plan/weaver.md` — C4's prose half; the wire model taught by `join`, `convene`, `comms`, `finalize-session`, `bootstrap`, `upgrade`, and the templates.
- **sentinel** — the gate at each verification point below. **Not an end-slot.**
- **steward** — pointed at **proposed fixes, not at claims**, per session 8's structure note in its own words: _"my best output was checks on REMEDIES rather than on findings."_ This session's remedies are unusually load-bearing, so this is the session to test that refinement.
- **scout** — observes; C2 names it as a consumer because cross-session measurement reads these logs by hand.

## Verification gate

Assembled and correct means all of:

1. `bun run check` green — and **`uncheckedAgainst` read on every land**, not just the exit code.
2. **BOTH of these, and neither subsumes the other.** _Rewritten after sentinel falsified the original line at session 9 — it stated a predicate and then named a different artifact as its standard, so a builder could deliver either and honestly claim the gate was met. The skippable one is the mutation pair, which is the one that catches a test that cannot fail._
   - **(a) Regression test** — **RED before the fix, GREEN after.** Proves _the fix changed behaviour_. **Its assertion is PARAMETERISED on forager's C1 verdict and must not be written before it.**

     > ⚠ **The earlier version of this line asserted the answer, and sentinel proved the assertion unsatisfiable.** It read _"an empty positions directory must produce a verdict that does not authorise teardown."_ Exhaustive enumeration (1555 rosters, sizes 0–4, all 6 `{hasRecord, followerAlive}` cell shapes, control confirming the enumerator emits all three states): **`none` ⟺ zero position records** (0 of 1555 produce `none` while any record exists) and **`none` is the only state that authorises teardown**. So requiring empty-positions to block entails **every** state blocking — the always-block degradation **C1's own constraint forbids**.
     >
     > **The two worlds today's inputs cannot distinguish:** empty positions _because the session just started_ (must NOT authorise teardown) vs _because every seat stood down_ (MUST authorise teardown). **The observation that separates them is a departure record — which is C3.** So with this requirement held, the C1↔C3 coupling is **forced** rather than inferred.
     >
     > **The open escape hatch, which is forager's to take:** reject the requirement — rule that a fresh session's empty-positions window _should_ authorise teardown and protect it by another input (a convene-time session marker, a mint timestamp, `down` refusing within N seconds of session start). **Then C1 and C3 separate and the integration order changes.**
     >
     > _This is the second correction to this gate line. The first fixed a fused predicate-and-standard and **preserved the contradiction**, which is the same defect one level in._

   - **(b) Mutation pair** — with the fix landed, **revert the guard → RED**, unmutated control → **GREEN**. Proves _the test can fail at all_. Same command, same file, opposite result.

   - **(c) ADDED SESSION 10 — the assertion keys on `state` AND `because`, NEVER on `shouldBlockTeardown` alone.**

     > **Measured, not reasoned.** Two natural repairs of D1 exist — qualify branch 1, or hoist the departure test above it. Exhaustively over 36 cells they agree on 32 and disagree only on `{departed:T, followerAlive:T, spawned: null | []}`, where one returns `unknown`/`no-open-record` and the other `present`/`live-follower`.
     >
     > **And `shouldBlockTeardown` returns `true` for BOTH on every one of those cells.** So the distinction differs on **zero cells by authorisation verdict and two by `because`** — a test keyed on the verdict **certifies both implementations identically.**
     >
     > That is the **"untestable as specified"** shape this team shipped once and regretted, **arriving one level up.** `because` is not a convenience here: it is the only surface on which the distinction is observable at all, which is what the enum was introduced for (`team-support.ts:211`).

     **Two further limits on this gate, both found by the verifier against its own instrument:**
     - **A predicted mix that cannot discriminate is a harness test wearing a coverage badge.** The first mix posted fixed `spawned` on all four cells and therefore sat entirely inside the rivals' **agreeing** region. **Necessary, not sufficient.**
     - **A cell count over a space production cannot emit is inflated.** "6 of 36 moved" became **3 of 24 reachable** once the caller-side invariant was applied (the single production caller cannot emit `hasRecord:false` with `followerAlive` non-null).

   **Landing discipline for (a), ruled at session 9:** the red is observed **out of checkout** and posted to the wire with its output; the test then lands **atomically in one commit with the owner's fix** (`READY: <paths>` → the lead calls the land). The red-before-green is observed; it is simply not observed _in the shared tree_, where it would block every other seat's land.

3. **The pane-kill scenario is reproduced, not reasoned about.** I have labelled it INFERRED throughout; it stays INFERRED until someone stands up a session and runs `down` against it.
4. **A cold read of the prose migration against a `git archive` surface** — the only genuinely cold one this team has established.

**sentinel engages at (1) after presence lands — before removal — not after everything.**

## What is ABSENT here, asserted

- **No capability-state work.** It is a want, it blocks nothing in phase 1 — _but_ it is a **hard blocker for the three-arm version of session 10's control** (the "warm" arm is a muted seat, definitionally unrunnable without mute), and **neither document says so in that direction.** Recorded here so session 10 does not discover it.
- **No `--as` authentication.** Real, filed, does not gate the swap because grapevine shares the hole. Note it makes any capability model advisory-only.
- **No new measurement of cross-session token cost.** Confounded by construction.
- **No rewrite of grapevine itself.** It is being removed from anthill's model, not fixed.

## Session 10's teardown — the exit criterion, and what it does NOT prove

**Written down before it was run, and corrected twice by seats before it ran. That is the point of writing it down.**

```
STEP A   every seat lands its own doc.                          ← the safety, not ceremony
STEP B   READING 1 — `anthill down` MUST REFUSE via the `present` branch, naming all six.
STEP C   each seat posts retro answers, THEN `comms stand-down --as <handle>`.
STEP D   the lead lands `plan.md`, THEN runs `comms stand-down --as maestro`.
STEP E   READING 2 — `anthill down` MUST AUTHORISE. `none` / `all-spawned-departed`. NO `--force`.
```

**STEP A exists because STEP B is not a rehearsal.** There is no `--dry-run`, and the obvious rehearsal is a trap: `down --session <nonexistent>` returns at `team-down.ts:85` **before the guard at `:109`** and reports `presence: "unknown"` **having never consulted presence** — an honest envelope in the perfect shape to be misread as a safe dry run. **So STEP B is the real thing run early, and if the guard is wrong it tears the session down while measuring whether it would.** Landing every doc first makes a wrongful kill cost the panes and nothing else.

**STEP D exists because the lead is the blocker.** `maestro` is in `rows` but **not in `spawned`** — branch 1 is unqualified over the whole roster, so with all five spawned seats stood down and the lead still wired, the verdict is `present`/`live-follower` and `down` **refuses.** A dead follow is **not** sufficient: that is the `unexplained-follower` case. **Found by steward, reproduced independently by forager and sentinel. Three seats, one blocker, and it was the lead.**

### What this criterion proves, stated BEFORE it ran

- **It proves the lifecycle COMPOSES AT THE COMMAND BOUNDARY** — convene → spawn → stand down → `down` authorises with no `--force`. That is session 9's Q3 #1 and it was genuinely untested.
- **It does NOT prove D3.** By STEP E every spawned seat has a **fresh** tombstone, which counts under both the old and new predicates. **The populations coincide.** D3 is pinned by mutation M2 (revert to the bare `existsSync` → 3 fail), not by this run.
- **STEP B is `NOT DISCRIMINATING` for D3 either** — with all followers alive, the unrepaired guard returns `present` too. Recorded as a negative, **not scored as evidence**, because banking a green that both the defect and the repair predict is the confound the paired reading exists to kill.
- **It does not prove `down` kills the right PANES.** That assertion (`killSession` not invoked) is pinned in the suite; **a live teardown is the last thing that happens, so its own verification cannot be re-run.** Structural limit, not a gap.

### The vine can veto STEP E, and turning a wire off does not remove it from the verdict

`combinePresence` lets a vine `unknown` override a comms `none`. **Measured tonight the vine leg is `none`** (0 subscribers, 0 connections), so it will not veto — and the failure direction is safe: a broken vine can only **cost us the criterion**, never authorise a wrong teardown. **If the vine leg is `unknown` at STEP E, the criterion is `INCONCLUSIVE`, not `FAILED`.**

## The lead's own procedure defects, recorded as touch points rather than apologies

**The land protocol checks the TREE (`( gate ) && commit`) and the SCOPE (`uncheckedAgainst`). It has no beat that checks the MESSAGE or the DIFF.** Both holes were found by using it:

- **`0c3fc16` carries a stale test count** (522, carried from the previous sha; the gate had printed 529 in the same output). **A tree-grounded claim travels with its sha** — this one travelled with someone else's, and that someone was me one commit earlier.
- **`3b82cef` carries a mangled body** — `printf` with double quotes let a backtick-quoted code span **execute as a command substitution**. The shell printed `command not found: comms` in the same block as the successful commit. **The tool's own help says `--stdin` is REQUIRED for bodies with backticks**, and the eight lands before it used quoted heredocs correctly. _(steward: the substitution genuinely **executed** something; the only reason it left a hole rather than output is that the CLI was down at that instant — a third "protected by an accident" this session.)_
- **`0c3fc16` delivered one of two beats to `.anthill/README.md`** and both to the template. **The path was correctly claimed, scoped and gated, and nobody read the diff of what was being landed.** A path being the right path is not the same as its contents being what the message says.

**Neither commit was amended.** Three seats were verifying lands **by content against a named sha** at the time; an amend invalidates a verification practice this team had just built, for a garbled sentence and a wrong number. **Recorded here instead — which is the whole reason this section exists.**

## ⏭ NEXT PHASE — what session 13 picks up

### Where the project actually is, in one paragraph a stranger can act on

**`anthill-v2.0.0` shipped the one-wire team. Session 12 closed the release bar: 6 of 6 MET.**
The `comms read` positional guard (`4c339fa`), session rotation (`81d3991`, landed **INERT**), and
the swap run (`89dea31`) — a full six-seat session, **102 messages, 25 commits, zero grapevine
traffic.** Criterion **5** landed too (`32d087a`) despite being outside the bar.

**Cole ratified 6-of-8 as the RELEASE bar on 2026-08-05**, conditional on this document existing.
**Session 13 is criterion 7 (the projects re-triage) plus the carried debt below.**

> **⚠ ONE OVERRIDE IS RECORDED IN THAT VERDICT AND IT IS NOT A CLEAN PASS.** Criterion 1's check
> read _"one commit names both paths (write-trigger)"_. There are **two** commits and **no
> amendment** — because the owner ruled, from a measurement on the live channel, that **6(g)'s
> lead-veto is STILL TRUE at HEAD and the amendment is NOT YET DUE** (rotation landed inert, so no
> rotation has occurred). He landed the **trigger** instead (`1b905c4`): _the first executed
> rotation on a channel falsifies property 1 for that channel, and whoever runs it owes the
> amendment in the same change._ **The lead called the letter unsatisfied and ruled the criterion
> met on the purpose. Read it as an override, not as a pass.**

### What session 13 delivers

| #     | criterion                         | what a consumer gets                                                                                                                                                                                                                                                                 | depends on                                                    |
| ----- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| ~~5~~ | ~~the sweep-the-plan touchpoint~~ | ✅ **DONE — landed session 12, `32d087a`** (weaver): all three homes — `skills/finalize-session/`, `templates/docs-team/`, **and `.anthill/README.md`**, the team's own copy that this team's scar says gets dropped. **Not session 13's work. Verify it fires; do not rebuild it.** |
| **7** | the projects re-triage            | every dir in `docs/projects/` carries a `**Status:**` and a named next action, or an explicit `parked`/`superseded`                                                                                                                                                                  | nothing. It is the judgement-heavy one and it wants a convene |

**Criterion 7 carries one unresolved collision that is genuinely undecided:** the
coordination-hardening arc's phase 3 overlaps
[`session-branch-strategy`](../session-branch-strategy/proposal.md), which is a separate Draft.
**Resolve it AT the re-triage, not before.** Cole has said explicitly he is not the user of this
tooling and pushes agent-experience calls back to the team — **so this is the team's to decide and
his to review, not the reverse.**

### ✅ What session 12 actually landed — with shas, so a stranger can check rather than believe

| what                                                              | sha       | verified by                                                                                                                            |
| ----------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Criterion 5** — the sweep-the-plan touchpoint, all three homes  | `32d087a` | weaver built; sentinel found 2 defects in review, both fixed                                                                           |
| **Criterion 3** — `comms read` refuses an unrecognised positional | `4c339fa` | **steward, non-author: 7 cells green** — forager's 4 controls, steward's pre-registered pair, and the defect itself. **Run, not read** |
| weaver's seat-doc lesson                                          | `2a3dfa4` | —                                                                                                                                      |

**🟢 THE PANE-KILL IS NO LONGER INFERRED.** It had said _"stays INFERRED until someone stands up a
session and runs `down` against it"_ since **session 9**. sentinel ran it: **7 cells, real tmux, live
`anthill down`.** The load-bearing three:

- **Cell 5** — the guard **PERMITS** on its own authority after a real `stand-down`. _The positive
  anchor the matrix never had; without it an always-block guard passes everything._
- **Cell 6** — at HEAD, a stale tombstone + a working seat → **REFUSED, session survived.** The D3
  repair holding.
- **Cell 7** — the **same world** with D3 reverted → **`{"tornDown":true,"presence":"none"}`, session
  killed with a seat still working.** **That is the hazard itself, executed.**

**Found because steward moved the variable sentinel had frozen** — the matrix was complete over
`{unknown, present}` and `none` is the only state that kills without `--force`. **The lead ruled on a
premise that was wrong; the audit and the rebuild came from two other seats.**

### 🔴 What a fresh agent must NOT re-derive — the expensive things, already paid for

1. **Rotation's safe design set is TESTS, not prose** (`c9a33e7`): _re-mint or drop the session-open
   record; **PRESERVING** it is the one unsafe design_ — and preserving is the tidiest-looking
   option. **Do not re-derive this.**

1b. 🔴 **ROTATION IS THE LOG-SWAP THAT `seams.md` 6(e) DESCRIBES, AND 6(e) IS MARKED NOT FIXED.**
_Pre-registered by steward at session 12's close, deliberately BEFORE any rotation code existed,
so it cannot be retrofitted to whatever gets built._

6(e), verbatim and unedited in the tree: _"when the log a live `follow` is watching is **swapped
underneath it** … the follower carries its `emittedThrough` across and reports **`current`,
gap 0**, having emitted none of the messages in the new log."_

**Rotation IS a log swap — that is what it is for.** So the carried 6(e) repair and the rotation
feature are **the same event**, and the hazard fires **on every live follower simultaneously**
rather than one at a time.

**The mechanism is D3's shape exactly, one file over.** A position record is
`{handle, channel, emittedThrough, at, pid}` — **0 of 6 carry a session id or origin; nothing to
scope by.** `seams.md` 6(g) says of the DEPARTURE record: _"carried nothing to scope by, so the
omission was absent rather than wrong."_ **D3 fixed the tombstone. Nobody fixed its sibling.**

**PREDICTION (H):** rotation re-mints the session-open record and leaves position records
untouched → immediately after rotation, `comms positions` reports **every seat `current` / gap 0
against a log they have emitted none of** — the most reassuring state, on the wire whose entire
purpose is to stop silence being mistaken for safety.
**FALSIFIED IF** rotation invalidates or re-scopes position records (session id, inode/generation
stamp, or a clear) · or rotation does not change the log's identity · or ≥1 live follower reports
`behind`/`never-followed` after it.
**THE DECISIVE CELL, and it needs no new instrument: rotate, then run `comms positions` WITHOUT
restarting any follower.**

> **✅ OUTCOME AT SESSION 12'S CLOSE: H WAS FALSIFIED BY THE DESIGN, BEFORE ANY TEST RAN — and
> that is the outcome its author named as the best one.**
> forager's design uses a **per-session positions directory**, which satisfies falsifier arm 1
> (_"rotation invalidates or re-scopes position records"_) by construction. **The prediction was
> published before the code existed and the code answered it.**
>
> 🔴 **BUT IT IS NOT DISCHARGED, and a session-13 reader must not treat it as closed.** Rotation
> landed **INERT** — the live channel was never rotated — and **a fixture cannot answer the live
> half**: whether five `follow` processes that resolved the log path once at attach survive a real
> rotation, or die silently while their positions still read healthy.
> **The decisive cell above is still owed, and it is still the cheapest instrument for it.**

**⚠ Two seats derived this hazard INDEPENDENTLY and from opposite ends** — steward from the
contract (6(e)), forager from the call site (`team-comms.ts:706`) — **neither having seen the
other's.** Treat it as real.

**✅ R4's carried question is ANSWERED, and the answer is CONDITIONAL** _(steward, stamped against
`81d3991`)_: **`previousPosition` does NOT survive a ROTATION, and DOES survive a SESSION BOUNDARY
WITHOUT ONE — which is exactly the state `anthill-dev` is in right now.**

That is why steward and weaver were each handed a `catchUpWith` anchored to **session 11's**
stopping point at join: sessions 11→12 was a boundary with **no rotation between them**. Rotation
shipped tonight but was **not run**, so the condition still holds on this channel.
**→ The out-of-band board anchor stays necessary until a rotation is actually executed. Do not
drop it on the strength of rotation having landed.** 2. **Criterion 2's absence-of-OPENING half has NO runtime artifact, and this was measured.** On an
already-existing, **non-archived** channel, `last_activity`, `loaded`, `topic` and
`message_count` are **all inert on re-open** — every one moves only on CREATE. Falsified by
maestro pre-convene, **independently reproduced by steward on his own throwaway channel with live
positive controls**. Full record:
`.anthill/scratch/maestro/2026-08-05-session-12-t0-baseline.md` → **must be promoted to
`docs/projects/comms-as-default/sessions/` before teardown; scratch is gitignored and dies.**
**The domain matters:** on an **archived** channel `open` auto-unarchives and IS observable. Our
channel is not archived, so the branch is unreachable — but the unbounded version of that
sentence is false and was corrected once already. 3. **The artifact is the WHOLE SPAWN SET, never the absence of `grapevine`.** sentinel certified this
and mutation-proved it: **`not.toContain("grapevine")` passes VACUOUSLY in CI** — a green that can
never fail, inside the assertion built to catch false greens. 4. **The pane-kill guard is verified at the COMMAND boundary and not in a live session** — L1
mutation-proven (12/0 → 10/2, the two failures being exactly the two REFUSES cases). **L2 is
circular by construction** and was ruled a non-blocker (R11), not met. Card `t-ac09ffa9` stays
open with its wording intact. 5. **Cite CARD IDs, never S-numbers.** S-numbers collided across two authors within one hour
(session 12, R7). The ids are unique and already quoted in landed docs.

### Carried debt — recheck before assuming any of it still stands

| card                        | what                                              | status entering session 13                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t-e25cd535`                | `convene --fresh` never reached comms             | **moot — `--fresh` was deleted with step 4. Verify and CLOSE**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `t-c012c84c`                | `openedAt` has two answers 246s apart             | the field implementing D3's safety property. **Recheck against rotation** — rotation re-mints the record and may resolve or move it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `t-02235085`                | 13 `review` cards nobody verified                 | named so the audit's silence cannot read as coverage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `t-ac09ffa9` · `t-07a131f5` | the pane-kill gate                                | ✅ **DISCHARGEABLE — do not re-open these.** L2 is 7 live cells (session 12); the mutation pair exists at BOTH the unit and command boundaries; **and the red-before/green-after regression test WAS ALREADY LANDED in a prior session.** sentinel was ten minutes from rewriting a test that exists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| —                           | `grapevine who` at `commands/team-support.ts:469` | 🔴 **THE LAST VINE CALL SITE, AND IT IS A LOAD-BEARING MASK — read this before removing it.** Measured session 12, one variable (`HOME`), live tmux both times: **vine resolves → `down` authorises and kills; vine UNRESOLVABLE → `down` BLOCKS, always.** `combinePresence` needs BOTH legs `none` before anything authorises, so **an unresolvable vine leg makes `down` always-block on any machine without spellbook.** Removing it means `commsPresence` becomes the **sole** input and every fail-safe property rests on it alone. **Not an argument to keep it** — telling a comms-only team _"grapevine CLI unresolved"_ is its own defect — **but it must be a decision, not a side effect.** _A mask is not a dependency; you cannot find these by tracing what depends on what._ Removal is a presence-semantics change with a ratify gate, and belongs to the [coordination-layer investigation](../../investigations/2026-07-31-team-native-coordination-layer.md) |

> **⚠ THE SCOPE OF THE 7 PANE-KILL CELLS, bounded by sentinel AGAINST HIMSELF before anyone quoted
> them wider: they are seven cells ON A MACHINE WHERE SPELLBOOK RESOLVES.**
> Cells 5 and 7 — the two that **authorise** — reached `none` only because the **vine leg also
> returned `none`**. On a machine without spellbook they do not reproduce; they block.
> _"A proof is only as durable as the absence it rests on"_ — and this one rests on a wire being
> **present-and-quiet**, which is worse than absent because it looks like nothing at all.
> **This does not weaken the cells. It names the world they were taken in**, which is the difference
> between a result and a claim.
> | — | `anthill commit` should require or resolve `--as` | 9 of session 11's first 11 commits carried no seat trailer |
> | — | **spellbook `bounty` truncates to a PIPE** (~64KB) | **not ours.** Read the board with `> file`. `--owner <name>` does not filter; `--mine` does but hides cards you do not own. Already filed upstream (spellbook #74) |

### The board itself — read this before trusting it

**The team's bounty board silently emptied between sessions 11 and 12** (anthill#43): the saved
snapshot held 97 tasks and the live board held 0. Convene warned; the warning was **real, not
spurious**. Recovered by reseeding from `~/.bounty/snapshots/`. **`bounty open --restore <id>`
silently no-ops when a live board already holds the key** — it attaches to the empty board and
ignores the flag. **Check `bounty sessions` against the live count at every convene.**

### What is deliberately NOT in session 13

- **The coordination-hardening arc phases 2–6** — months rather than sessions.
- **Per-seat worktree isolation** — measured and held pending a merge-result gate that is one
  command and still unbuilt.
- **The two cheap experiments** (mixed-model team; heads-down mute) — neither is a build, both gate
  the team-native coordination question.

## Open questions — to settle at ratify or during build

1. **C1's `humans` capability** — deleted, deferred, or blocking?
2. **The migrate guard's circularity** — does `migrate` need a different observation than `down`, given it moves data rather than killing processes, and its fail-closed bias was calibrated for a pane-killing command?
3. **`--fresh` vs a session mint.** `convene --fresh` already exists and is grapevine-only. Do both survive, and what does `--fresh` mean when the thing it cleared is gone?
4. **`.claude/settings.local.json` pins a grapevine CLI path at 1.14.0** while the documented floor is ≥1.16.0. Untracked, so invisible to every tracked-files sweep. Whose lane?
5. **Session 9 has no failure branch.** If the swap does not hold, does the pipeline retry or re-plan? Deferred to the shape check, still undecided.

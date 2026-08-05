# Comms as the default team wire — plan

**Status:** **PHASE 2 SHIPPED (session 10).** The lifecycle defects are repaired — and there were **THREE**, not two. Contract 6(g) is now **RATIFIED as a description and FALSIFIED as a safety property** (`ca6c41b`). Phase 3 (the prose migration + the swap run) is **DEFERRED to session 11** by the human's ruling.
**Created:** 2026-08-04 (session 9) · **Author:** maestro (lead) · **Last revised:** 2026-08-05 (session 10), against what shipped rather than what was intended.
**Follows:** [proposal.md](./proposal.md) · [capability-state](../capability-state/proposal.md) _(moved out of this folder — it is slice three, not this project)_
**Sessions:** [session 9 — phase 1](./sessions/2026-08-04-session-9-phase-1.md) · session 10 — phase 2 (this revision)
**Branch:** `feat/comms-as-default` · **Gate:** `bun run check`
**Baseline, both ends measured on CLEAN trees at named shas** (weaver, comms #501): **512 pass / 0 fail @ `27da450`** → **529 pass + 1 todo / 0 fail @ `13a4ae7`** = **+17 pass**. Every other reading taken this session was over a dirty tree; those two were not.

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
- **forager** owns `plugin/scripts/anthill/` — presence, the guard, rotation, `stand-down`, migration — and authors `plan/forager.md`.
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
  > ### 🔴 CORRECTED AT SESSION 10, AND THE CORRECTION REVERSES THE SIGN
  >
  > **The sentence above is incomplete in the one direction that matters, and the word "mask" is what hid it.** A **mask** fails **SAFE** — it makes the guard over-block. The bullet enumerates only masks, so it can only ever find hazards that make the guard too cautious.
  >
  > **Stale cross-session DEPARTURE records fail OPEN.** `hasDeparted` was a bare `existsSync` at `<teamDir>/comms/<channel>.departures/<handle>.json` — **channel-scoped, over the channel's entire history** — and the record `{handle, channel, at}` carries **nothing to scope by**, so the domain was **absent rather than wrong**.
  >
  > Measured on the real tree with a control differing in exactly one variable: with session 9's tombstones on disk the guard returned **`none` / `all-spawned-departed`** and **authorised killing panes full of working seats**; with the same rows and the tombstones removed, **`unknown`**, blocked.
  >
  > **Same lifetime bug as the position files, opposite sign — and this plan's prose only knew the safe direction.** That is D3, repaired at `53ecae4`.

- **Therefore the pane-kill window opens at step (3), not step (4).**

**Therefore: presence first, removal second, the swap run last.** Nothing lands in the reverse order.

## Integration / dependency order

1. **Presence semantics + the teardown guard** — `commsPresence` / `combinePresence` / `shouldBlockTeardown`. Gated by sentinel before anything downstream lands.
2. **`comms stand-down` + `down` writing a session-close marker** — one piece of work, not two: giving the session a lifecycle it can observe.
3. **Session rotation** — depends on (2) for its mint trigger, **and on (1) because THIS is the step that opens the pane-kill window.** Rotation empties the positions directory, which is the last surviving mask. _Corrected by steward: the original line named only (2), so "land 2 then 3 while C1 is still in review" read as sanctioned. **The step that opens the window named only its mint dependency; the step that does not open it named the hazard.**_
4. **Grapevine removal** — the three live call sites. **No longer the step that spends the presence mask** (that was already spent by ruling at #284), but still gated on (1) because it deletes the vine leg of `combinePresence` permanently rather than situationally.
5. **The prose migration** — depends on (4) being settled. Session 8 measured six instances of prose asserting things about a still-moving tool, three of them introduced _by seats fixing other false prose_.
6. **The swap run** — the session that convenes, runs and tears down with grapevine never opened.

### Phases — redrawn 2026-08-04 against the merge, not the intent

**The dependency order above is unchanged and still correct. What follows is where the phase boundaries actually fell**, which is not where this plan predicted. One branch, one release, per the human's framing — the phases are review-and-validation boundaries, not separate deliverables.

|             | steps                        | status                                 | validation criterion                                                                                                                                               |
| ----------- | ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Phase 1** | 1–2                          | **SHIPPED** `5697eca`, two defects     | gate green at 512; guard mutation pair kills on both cells                                                                                                         |
| **Phase 2** | the defect repair (D1+D2+D3) | **SHIPPED session 10** `53ecae4`       | `none` unreachable at the **fresh-spawn instant** as well as mid-session; three mutations, each with its substitution count asserted before the suite was believed |
| **Phase 3** | 3–6                          | **NOT BUILT — deferred to session 11** | rotation, grapevine removal, the prose migration, and the swap run                                                                                                 |

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

- **forager** → `plan/forager.md` — C1, C2, C3, and the three call sites of C4's code half.
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

## Open questions — to settle at ratify or during build

1. **C1's `humans` capability** — deleted, deferred, or blocking?
2. **The migrate guard's circularity** — does `migrate` need a different observation than `down`, given it moves data rather than killing processes, and its fail-closed bias was calibrated for a pane-killing command?
3. **`--fresh` vs a session mint.** `convene --fresh` already exists and is grapevine-only. Do both survive, and what does `--fresh` mean when the thing it cleared is gone?
4. **`.claude/settings.local.json` pins a grapevine CLI path at 1.14.0** while the documented floor is ≥1.16.0. Untracked, so invisible to every tracked-files sweep. Whose lane?
5. **Session 9 has no failure branch.** If the swap does not hold, does the pipeline retry or re-plan? Deferred to the shape check, still undecided.

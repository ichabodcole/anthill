# Roadmap — what we're working on, in what order

**Status:** Active · **Owner:** Cole + lead · **Updated:** 2026-08-05 (scope ratified — see Now)

The single prioritized view over everything queued in briefs, projects, investigations, reports,
and backlog. A **router, not a manual** — one line and a pointer each; the linked doc is the
truth. Horizons, not dates: **Now** (in flight) · **Next** (queued, order matters) · **Later**
(real, not yet actionable) · **Parked** (deliberately not now).

> **Read-trigger:** the lead reads this at **convene** (the gather-the-work step) and updates it
> at **finalize** when priorities shifted. A roadmap nothing re-reads is a wish list.

---

## Now

# ▶ THE SCOPE OF WORK: **SHIP THE ONE-WIRE TEAM**

**Ratified by Cole, 2026-08-05.** _Everything needed before anthill can recommend comms as the default
wire to consuming projects._ **✅ STEPS 4+5 SHIPPED — released as `anthill-v2.0.0` (2026-08-05, `a130be3`), a MAJOR bump for the breaking change.** `develop` == `main`.
**✅ 7 of 8 criteria met (1, 2, 3, 4, 4b, 5, 6). THE RELEASE BAR — which is 6 of them (1, 2, 3, 4, 4b, 6) — IS COMPLETE; criterion 5 landed although it was outside that bar. Remaining: 7, the re-triage, which Cole ruled NOT release-blocking.**

> _This line said **"3 of 8"** at session 12's convene and **"5 of 8"** four hours later, and **both were stale when read.** It is corrected here by the lead's own beat-2.5 pass — **re-read every doc you own as its authority and assume it has drifted** — which caught it inside the same session that had already corrected it once. **A router goes stale at the speed the work moves, not at the speed anyone remembers to look.**_

> ### ✅ COLE RULED THE RELEASE BAR AT **6 OF 8**, 2026-08-05 — with a condition
>
> Verbatim, because the condition is the operative half and a paraphrase would lose it:
> _"Ok, yes, 6-of-8 is good with me, **so long as we capture the remaining work in a way that makes
> the continuation easy for a fresh agent.**"_ · _"I think the end of session sweep will of course be
> part of that process."_
>
> **So criteria 1, 2, 3, 4, 4b and 6 close the RELEASE.** Criterion **7** (the re-triage) is real work
> and is **not release-blocking** — it is session 13's. Criterion **5 was not in the release bar and
> landed anyway** (`32d087a`).
> **The condition is a DELIVERABLE, not a courtesy:** the continuation capture is judged on whether a
> fresh agent can pick this up, and the session-12 lead owns it.
>
> **⚠ This block was 3-of-8-stale within four hours of being written, and the SWEEP BEAT caught it —
> not a person.** weaver ran the touchpoint he had just landed against this file as its own falsifier,
> and **criterion 5's own row was one of the four stale claims.** _The document that commissioned the
> sweep was falsified by the sweep's first run. That is the strongest available evidence that
> "remember to update the plan" was never going to reach this._

> ⚠ **CONSUMING TEAMS ON v1.x MUST RUN `anthill:upgrade`.** `convene` no longer accepts `--fresh` or
> `--topic`, and the `join` manifest no longer carries `tailCommand` — **a team that upgrades without
> reconciling will have its own docs pointing at a wire that no longer exists.** That is what the new
> `§4·0 GRAPEVINE → COMMS` section of the upgrade skill exists for, and it shipped in this release.
> **⚠ `feat/comms-as-default-phase-3` is DONE — do not continue on it. The next work (rotation + the swap
> run) branches FRESH off `develop`**, per Cole's ruling: the old branch's name misdescribes the
> remaining work, and rotation wants its own clean hold/revert story.

> ### ⚠ THIS SECTION WENT STALE FOR THREE SESSIONS AND NOBODY NOTICED, INCLUDING ITS OWN LEADS
>
> Until 2026-08-05 this block still said _"cut a release"_ (cut at `6bca04e`) and pointed **"the next
> scope of work"** at the **archived** team-comms spike. **Sessions 9, 10 and 11 each ran a full
> convene→finalize cycle without reading or updating it**, while this file's own header names both
> moments. _A roadmap nothing re-reads is a wish list — its words, and it was one._
> **The repair SHIPPED — the docs-of-record sweep, `32d087a` + `ec58802`, card `t-2a48f297`** (a ritual
> beat, not resolve). _This line previously said "card `S12-1`, weaver's lane", which was stale twice
> over: the repair was already landed, and `S12-1` resolves to a different seat's card (the R7 S-number
> collision — **cite card ids, never S-numbers**)._
> **It was found by the LEAD, not by the sweep's own first run**, and that is a recorded bound on the
> beat rather than a footnote: **the sweep read this file's TABLE and skipped its PROSE** — 10 rows
> checked against 91 assertion-bearing prose lines. **A sweep that reads tables and passes a document
> whose narrative is wrong is the failure this box is about, arriving inside the box.**

### The exit criteria — all seven, every one mechanically checkable

**The scope is met when a stranger can run these and get these answers. Not before, and no criterion
is discharged by argument.**

| #         | criterion                                                                                                                                                         | how it is checked                                                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** ✅  | **MET `81d3991` + `1b905c4`** — **Rotation landed (INERT)**; 6(g)'s amendment ruled NOT YET DUE by its owner, trigger recorded instead                            | one commit names both paths (write-trigger)                                                                                                                                                                                                       |
| **2** ✅  | **MET `89dea31`** — **the swap run, BOTH halves.** 102 messages · 25 commits · six seats · **grapevine delta ZERO**                                               | absence of USE is runnable as-is. **Absence of OPENING now needs a POSITIVE artifact** — `channelOpened` was deleted with step 4, and an absent field is not an observation (Contract 6(c)). **Name the artifact before the run, not after.**     |
| **3** ✅  | **MET `4c339fa`** — **`comms read` positional guard**, at parser altitude                                                                                         | **3 controls green, plus 4 more.** `commit -- <paths>` · `comms send <body>` · `join <handle>` — **verified by a NON-AUTHOR: steward ran 7 cells (forager's 4 controls, steward's own PRE-REGISTERED pair, and the defect itself), RUN not read** |
| **4** ✅  | ~~🔴~~ **MET `cbafb2b`** — **WHAT WE SHIP POINTS AT NO GRAPEVINE** _(Cole's ruling, 2026-08-05 — scoped to the RELEASE, not the repo)_                            | `grep -rni grapevine plugin/skills plugin/templates plugin/.claude-plugin` returns **only** recorded history and the `upgrade` migration note — **no line telling an agent to USE it.** Baseline: **8 hits, 6 live-wrong** (see below)            |
| **4b** ✅ | **MET `cbafb2b`** — **`anthill:upgrade` documents the migration**                                                                                                 | `skills/upgrade/SKILL.md` states grapevine→comms for an **existing** team, and what to do with that team's own in-repo references                                                                                                                 |
| **5** ✅  | **MET `32d087a`** (+ `ec58802` naming the ACTOR) — **the sweep-the-plan touchpoint**, and it was **outside the ratified release bar; it landed anyway**           | **all three homes: `skills/finalize-session/`, `templates/docs-team/` AND `.anthill/README.md`** — the team's own copy, per its own scar. **Its own first run falsified THIS FILE in four places** (see the ruling box above)                     |
| **6** ✅  | **MET — released as `anthill-v2.0.0`** (2026-08-05, `a130be3`). A **MAJOR** bump: release-please read the `BREAKING CHANGE` footers. `develop` == `main`, 0 ahead | `develop` → `main`, release cut                                                                                                                                                                                                                   |
| **7**     | **This section points at live work**                                                                                                                              | every dir in `docs/projects/` except `_archive`/`TEMPLATES` has a `**Status:**` at the **start of a line**, plus a named next action or an explicit `parked`/`superseded` marker                                                                  |

> ### 🔴 Criterion 4 — what it is and is NOT, because the first version of it was unrunnable
>
> **Cole's framing, and it is narrower and better than a repo-wide sweep:** _"when we do a release, if
> another team does the upgrade, there shouldn't be anything in the skills or guidance we're providing
> that mentions grapevine — other than an upgrade skill explicitly documenting the change. The idea
> isn't to go back and update history, certainly not archive documents. It's to make sure that **what
> we're releasing is consistent and no longer pointing to grapevine.**"_
>
> **So the test is agent confusion in the SHIPPED surface, not token count in the repo.** Scars,
> comments, archived docs and the tests that _assert_ grapevine's absence all stay.
>
> _The first version of this criterion read `grep -rn grapevine plugin/scripts --include=*.ts` → 0.
> **It was wrong twice.** Under this project's zsh the unquoted glob expands, the command never runs and
> the pipeline prints `0` — the pass condition — so it was a **false green by construction**. Quoted, it
> returns 63, and driving that to 0 means **deleting the regression tests that prove the removal**. It
> was unsatisfiable at its predicate and trivially passed at its command. Found by a blank-context cold
> read; the author had hit the identical glob failure an hour earlier and written the broken form in
> anyway._
>
> **The six live-wrong sites, measured 2026-08-05 — this is the work, and it is small:**
>
> | site                              | what it tells an agent to do                                                                                                                                                                     |
> | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `skills/comms/SKILL.md:94`        | _"If comms drops mid-session, say so on **the grapevine**"_ — fall back to a wire that no longer exists                                                                                          |
> | `skills/comms/SKILL.md:34`        | _"the lead clears the channel at convene (`--fresh`)"_ — **doubly dead**: `--fresh` was deleted by step 4                                                                                        |
> | `skills/comms/SKILL.md:82`        | _"`anthill status` reports the grapevine roster"_ — **the THIRD site of a falsehood weaver deleted from two others** on 2026-08-05 (`caa9376`, `977a021`). A cascade that stopped one file short |
> | `skills/bootstrap/SKILL.md:47–48` | tells a **brand-new** team to verify `spellbook:grapevine` is installed                                                                                                                          |
> | `skills/convene/SKILL.md:120`     | leftover two-wire presence guidance                                                                                                                                                              |
> | `skills/upgrade/SKILL.md:224`     | says convene warns the **grapevine**/bounty daemons aren't running                                                                                                                               |
>
> **`skills/comms/SKILL.md:57` STAYS** — it is a scar about importing a sibling tool's verb by habit.
> Recorded history, and deleting it is the thing Cole's ruling explicitly excludes.
>
> **⚠ The remaining CODE invocation (`team-support.ts:469`, `grapevine who`) is NOT criterion 4.** That
> is a _dependency_ question, not a guidance one — it belongs to the
> [coordination-layer investigation](investigations/2026-07-31-team-native-coordination-layer.md) and the
> carried debt, and conflating them is what made version one unrunnable.

---

# ▶ NEXT UP: **SESSION 13 — THE STORES STOP LYING**

**Proposed by the session-12 lead, 2026-08-05, from that session's own outputs. Awaiting Cole's ratification.**

> **Why this scope and not a list of fixes:** session 12 found **three stores that disagreed with the tree inside ninety minutes** — the roadmap (4 stale claims, one of them its own row), the board (**13 of 27 `review` cards mis-stating the tree, ~48%**), and a carried card whose work was already landed. `principles.md` says **no store without a named re-read moment**; the board has a write trigger and **no read-back across sessions**, and it is the surface Cole's continuation condition is judged on.

## S13 · what gets delivered

| #         | item                                                                      | why it is not an experiment                                                                                                                                                                                                                                                  | source                  |
| --------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **S13-A** | **`comms stand-down`'s `created` flag is session-scoped**                 | `team-comms.ts:924` is `!existsSync(path)` — **bare file existence, which is D3's exact defect one field over.** `comms.ts:694` already has the repaired predicate (`record.at >= sessionOpenedAt`). **n=4 seats misread it in one session.** One predicate, already written | session 12 wire, n=4    |
| **S13-B** | **`uncheckedAgainst` stops reporting a false empty**                      | the porcelain read is at `team-commit.ts:526`, **after** `acquireLock` at `:346` — so a peer committing during your queue vanishes from the list. **Reproduced with timestamps** (15.6s queue, empty list, a peer's commit inside the window)                                | card `t-42dd65bf`, n=2  |
| **S13-C** | **Test output that mimics a production envelope carries a marker**        | a seat nearly read a test's `convene` envelope in the gate's stdout as **our board dying**, in a session that had opened with a real board-loss scare                                                                                                                        | scout §8.3              |
| **S13-D** | **`anthill commit` requires or resolves `--as`**                          | 9 of session 11's first 11 commits carried no seat trailer. Carried from session 11, unbuilt                                                                                                                                                                                 | S11 debt                |
| **S13-E** | 🎯 **CRITERION 7 + THE BOARD READ-BACK, AS ONE PIECE**                    | **triaging without fixing the read-back just re-does the triage next session.** Needs the `MOOT` class steward found (_the subject was deleted_) — _"we fixed it"_ and _"the thing it was about is gone"_ send a fresh agent to different places, and one word covers both   | criterion 7 + `c2a4114` |
| **S13-F** | **Close the discharged cards** — `t-ac09ffa9`, `t-07a131f5`, `t-e25cd535` | all three verified dischargeable in session 12; `--fresh` is moot since step 4 deleted it. **Minutes, and they are three of the 13 lying cards**                                                                                                                             | continuation doc        |

| **S13-G** | **Persist `asOf` on the message record and show it on read** | 🔴 **NOT scout's proposal, and the inversion is the point.** He proposed _refusing a body whose watermark disagrees with `--as-of`_ (n=4). **But the stored record is `{channel, emittedThrough, from, id, role, text, ts}` — `--as-of` gates the send and is then DISCARDED.** The prose watermark exists _because the tool throws the value away_: there are not two copies that drift, **the tool manufactures the second copy.** Persisting needs no parsing, no refusal, no coupling to wording — and it lands in Contract 6(a)'s own idiom, which already persists the **artifact** tier (`emittedThrough`) while dropping the **testimony** tier (`read`) the tool already collects. Additive; older records simply lack the field | scout §7, re-scoped against the code |
| **S13-H** | **The finalize confirmation stops asking for a sha that is stale by construction** | 4 of 5 seats filed a ledger amendment after confirming, because the finalize conversation itself produced further lessons. **Ask after stand-down, or do not ask — `git log --grep "Anthill-Seat: <handle>"` is already the mechanical source** | session 12, n=4 |
| **S13-I** | **`anthill feedback` detects that the current repo IS the feedback target** | 🔴 **We are `ichabodcole/anthill` and `FEEDBACK_REPO` is `ichabodcole/anthill`.** A seat here that hits anthill friction reaches for `anthill feedback` **because the SOP tells it to**, and opens an issue against itself, parallel to this very backlog. **A few lines comparing the remote to `FEEDBACK_REPO`; never fires for a consuming project.** _Mechanical rather than a note, because a situational warning fails at the recognition step_ | Cole, session 12 close |

### 🔴 Added after session 12 closed — a CI-only red on `develop`, found by Cole, fixed at `484f9da`

| #         | item                                                                                       | why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S13-J** | **`team-down.command-path.test.ts` must not leave a global `team-support` stub installed** | The criterion-2 spawn-set pin went red **in CI only** because that file installs `mock.module("./team-support.ts")` with a `requireConfig` stub lacking `paths`/`lead`, and it survives into later files. **`484f9da` immunised ONE consumer; the trap is still armed for every other file that imports `requireConfig`** — and it presents as an unrelated CI-only failure. _Two facts established the hard way and worth not re-deriving: **bun loads and runs test files PER FILE**, so a load-time capture does not predate a stub installed by an earlier file's test body; and **`mock.module` MERGES rather than replacing wholesale** — proven by the failure reaching `team-convene.ts:181`, past a `readBoardCounts()` the stub never defined. The file's own comment claiming "replaces the module WHOLESALE" is **wrong and should be corrected.**_ |
| **S13-L** | **Reconcile the 5 unowned cards whose titles name a seat**                                 | spellbook#81 root-caused a parser bug where `add --owner=<name>` **stores no owner and returns `ok:true`**. Our board: **19 title-names-a-seat cards have an owner, 5 do not, 0 mismatch.** _The mechanism is UNPROVEN — those `add` calls ran in agent panes, and `grep -rn -- "--owner="` over the tree returns nothing but a doc string. Reconcile the 5 from their titles; **do not record it as confirmation of spellbook's bug**, because we cannot show it was the cause._                                                                                                                                                                                                                                                                                                                                                                               |
| **S13-M** | **anthill is CLEAN on spellbook#81's class — keep it that way with a test**                | Verified live: `--as=zzz-not-a-seat` is **refused naming the bogus value** (so the `=` form genuinely parses), and an unknown flag is refused at parser altitude across 21 commands. **Nothing pins the `=` form specifically.** A single cell (`--flag=value` reaches the validator) costs nothing and stops a future `define.ts` change from re-opening a defect we have only ever verified by hand                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **S13-N** | **Delete `boardShadowWarning` if spellbook's D1.3 lands — do not improve it**              | It reconstructs from two reads and a subtraction a fact `bounty open` knows first-hand, **and it cannot distinguish the two worlds it fires in**: respawn-empty over an intact snapshot (recover, do not close) vs `close` already clobbered it (stop). Opposite actions, identical signal from outside. **Horizon: contingent on spellbook#64/#73's D1.3.** If it turns out it CANNOT be deleted, that is evidence their envelope says too little — report it rather than quietly keeping ours                                                                                                                                                                                                                                                                                                                                                                 |
| **S13-K** | **Decide, deliberately, that a feature branch gets NO CI until a PR exists**               | `.github/workflows/ci.yml` fires `push` on `[main, develop]` only. **Session 12 ran 45 commits with zero CI signal**, and _"the branch was green all session"_ was never a claim anyone could have made. The merge-result gate does not cover it either — **the merge result is green on darwin too.** Not obviously a defect (it is a real cost saving); it is a **gap in how this project verifies work**, and it should be chosen rather than rediscovered.                                                                                                                                                                                                                                                                                                                                                                                                  |

> **⚠ THE LOCAL GATE IS NOT A PROXY FOR CI, AND THIS IS THE MEASUREMENT: `bun run check` was green on darwin across the whole of session 12, through a 45-commit branch, a merge, and TWO failing CI runs.** It went green again after the first repair, **which CI then rejected.** _A green whose failing case lives on another OS is a green that cannot come out differently — `principles.md`'s control rule, arriving on the gate itself._
> **⚠ THE `comms send` ITEM NO LONGER NEEDS A RULING, AND THE REASON IS WORTH KEEPING.** It was flagged _"needs a design call — it couples the tool to a prose convention"_ **only while the proposed fix was parsing the body.** Reading the storage layer showed the duplication is the tool's own doing — and **a shape filter over prose is the exact discriminator this team killed in the same session** (an all-digit sha defeats a digits-only exclusion). **The design call dissolved when someone read the record instead of arguing about the parser.**

## S14 · defined now so it is not re-derived from a report

| #         | item                                                                        | why it is S14 and not S13                                                                                                                                                                                                                                                                                            |
| --------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S14-A** | **ONE EXECUTED ROTATION**, deliberately, on a channel nobody is standing on | discharges **6(e)'s live half** (decisive cell already written: _rotate, then `comms positions` WITHOUT restarting a follower_), clears **6(g)'s amendment trigger** (`1b905c4`), and answers whether `previousPosition` survives. **Rotation landed INERT in S12 — running it is a separate act with its own risk** |
| **S14-B** | **Remove the vine leg** (`commands/team-support.ts:469`)                    | 🔴 **it is a LOAD-BEARING MASK, measured:** an unresolvable vine makes `down` **always-block**, so removing it leaves `commsPresence` as the sole input. A presence-semantics change **with a ratify gate**                                                                                                          |
| **S14-C** | **`t-c012c84c` — `openedAt` has two answers 246s apart** (convene vs spawn) | it is the field implementing D3's safety property, and **S14-A may move or resolve it.** Sequencing it after the executed rotation is deliberate                                                                                                                                                                     |

## Backlog — real, placed, NOT scoped to a session

- **`down`'s envelope carries no `because` field** — verified at source; **gate 2c's _"state AND because"_ is unsatisfiable at the command boundary by anyone.** Not a defect, a stated limit. → `docs/backlog/`
- **`bun run check` reads ZERO markdown** — **fourth session running.** The prose lane has no automated verification at all, and _"gate green" on a markdown land means the tree compiles._
- **The whole-tree gate serialises a lane that cannot cause a red** — weaver blocked **3× in one session** on a markdown lane. → **[`shared-tree-gate-tension`](projects/shared-tree-gate-tension/proposal.md) move C**, now with first-person field evidence **and** a reproduced false-`uncheckedAgainst` beside it. **Decide at a convene; it is a tree-model question, not a fix.**

## Upstream to spellbook — deduped, drafted, NOT yet sent

**Cole approves the drafts before they go.** `bounty open --restore <id>` **silently no-ops** when a live board already holds the key (it attaches and ignores the flag — this is how session 12's board recovery nearly failed) · **`bounty state` truncates to a PIPE** (~64KB, whole to a file), and `--owner <name>` does not filter while `--mine` does.

---

**Why 4/4b and 7 are in the set rather than assumed:**

- **(4/4b)** Cole ruled _"grapevine leaves entirely."_ **The consuming-team half has not happened** —
  six shipped guidance sites still route an agent to a wire that no longer exists, and a **brand-new**
  team is still told to install it. The upgrade path is the other half: an **existing** team has its own
  in-repo references, and nothing currently tells it they are now wrong.
  **The bound on shipped prose is unchanged and still binds:** it may say _"anthill no longer opens or
  joins a grapevine"_ and may **not** say _"anthill does not depend on grapevine"_ — because
  `team-support.ts:469` still invokes `grapevine who`. **That invocation is carried debt and the
  coordination-layer question, deliberately NOT criterion 4** (see the box above).
- **(7)** is the criterion that stops this recurring. **The reason nothing was phased beyond the next
  session is that this router was stale** — so the scope ends by fixing the thing that hid the scope.

### Order, and the one hard sequencing constraint

**Plan-step order (NOT the criterion numbers above — these are `plan.md` steps):** rotation (plan step 3) → the swap run (plan step 6) → the positional guard → the shipped-surface grapevine sweep → merge & release → re-triage.

> 🔴 **ROTATION MUST BE LANDED BEFORE THE FIRST `comms stand-down` OF ITS SESSION.** The pane-kill is a
> **three-term conjunction** and the middle term is _our own finalize ritual_ — `stand-down` is
> advisory, so a seat that files its tombstone and keeps working **is** an in-window tombstone at a
> live desk. **If rotation is not ready before finalize begins, it does not land that session, and
> that is an acceptable outcome rather than a failure.**
>
> **The safe design set is already LANDED AS TESTS** (`c9a33e7`): _re-mint or drop the session-open
> record; **preserving** it is the one unsafe design_ — and preserving it is the tidiest-looking
> option. **Do not re-derive this.**

**→ The working runway is [`projects/comms-as-default/plan.md` § NEXT PHASE](projects/comms-as-default/plan.md#-next-phase--what-session-12-picks-up).** That file carries the
per-step detail, the carried debt, and the merge decision that is **Cole's to make, not the lead's to
assume** (his framing: _"one feature, one release"_).

### Deliberately NOT in this scope

- **The coordination-hardening arc, phases 2–6** — real, sequenced in its
  [brief](briefs/2026-07-28-coordination-hardening-arc.md), and **months rather than sessions.** Phase 3
  overlaps [session-branch-strategy](projects/session-branch-strategy/proposal.md), which is a separate
  Draft; that collision is unresolved and should be resolved **at the re-triage (criterion 7)**, not before.
- **Two cheap experiments, whenever there's an appetite** — both gate the
  [team-native coordination layer](investigations/2026-07-31-team-native-coordination-layer.md)
  question: **run a mixed-model team** (the anti-groupthink argument is currently reasoning, not
  evidence), and **trial a heads-down mute**. Neither is a build.
- **The [scar test](investigations/2026-07-28-practice-transmission-between-teams.md)** — the cheapest
  experiment available, and it gates the whole practice-transmission loop. **Pick it up at the
  re-triage.**

**Deliberately held:** per-seat worktree isolation (pending the staged-snapshot evaluation, phase 2),
and the memory bundle (#8–#10) / parity close-out (#12), which keep their place in **Next** behind the
triage.

**The governing constraint on all of it** — [constrain the plumbing, leave the collaboration
fuzzy](briefs/2026-07-28-coordination-hardening-arc.md). Some fuzziness is a healthy team's working
state, not a defect queue to drain.

**📋 The 2026-07-27 feedback triage — Batches 1, 2 and 4 SHIPPED; Batch 3 is the open one.**

> **29 open issues triaged 2026-07-27** into four batches + one proposal. The three
> no-design batches were built the same day (`315fa56`, `2170636`, `3111f28`, plus the skills
> pass); **Batch 3 — the structural proposal — is what remains.** Test count 157 → 202.
> **The GitHub issues have NOT been closed** — do that when the fixes ship in a release.

**✅ Batch 1 — `anthill commit` correctness + session integrity** _(forager)_

- ✅ **`anthill commit` correctness** — `2170636`. Stage-before-verify no longer strands the team's
  index (#55); deletions (#48) and git-mv rename pairs (#51) now land through the wrapper instead of
  forcing a bypass; the **foreign-red diagnostic** names the dirty paths outside your commit on a
  gate failure (#50, = shared-tree move C.1). **Found while fixing:** the sweep guard was blind to
  renames — a seat committing a directory could silently land a peer's deletion of a path outside
  its pathspec. Fixed, pinned by a test verified to fail without it.
  [backlog](backlog/2026-07-27-anthill-commit-correctness-batch.md).
- ✅ **Session integrity** — `3111f28`. Convene now warns when a keyed re-open may have shadowed a
  live board, telling the lead not to close it (#43 — the destroy half is spellbook's, still open);
  `attach` reveals every session bound to the team instead of silently taking the first (#45).
  **The board warning fired on its first live run in this repo** — the condition is present here.
  [backlog](backlog/2026-07-27-session-integrity-batch.md).
- ⏭️ **Deferred: the protected-trunk guard** (plan move 1) — it is the land-time twin of Batch 3's
  layer 1 and should be designed **with** it, not ahead of it.
  [plan](projects/anthill-commit-hardening/plan.md).

**✅ Batch 2 — `anthill:join` onboarding** _(weaver)_ — `315fa56`

- ✅ **The regression is fixed.** `08516ac` had reframed join's backfill around
  `grapevine tail --from-start`, which cannot work (grep block-buffers, tail never closes): zero
  output, then a timeout, read as "the channel is empty". Now `grapevine pull`, with the trap named
  so nobody re-derives it. **Worse than filed:** the board Monitor filter used basic grep with an
  alternation, so it matched **nothing** and sat permanently empty while looking wired (#39) — and
  live tails were block-buffered. Both fixed and pinned.
- ✅ Plus: fresh pre-claim board read (#40), resolved card command + **unfilled-template grounding
  docs now flagged** via a shared `placeholder.ts` helper (#56 — zero false positives across all 110
  repo docs), scoped read-only-first clause, the "scratch does not survive the session" line
  (#56/#58), and the ratify-gate pointer for mid-plan joiners (#42).
  [backlog](backlog/2026-07-27-join-onboarding-batch.md).

**Batch 3 — Session branch strategy** _(PROPOSAL — the structural one, and the open work)_

- **Convene on a branch, merge at finalize.** **Now scoped to history noise only** (#59 — one 4-seat
  feature put ~50 commits straight onto `develop`). Design settled 2026-07-27: `convene` offers a
  **feature-scoped** branch (surviving across sessions); `finalize` asks whether the feature is done
  and **squash-merges** if so — a merge strategy, **not** history rewriting, since a shared tree
  interleaves seats and `consolidate-long-branch` needs contiguous chapters. Policy lives in one
  `branch{}` config block read by both convene and the commit guard — which **unblocks the deferred
  protected-trunk guard**. [proposal](projects/session-branch-strategy/proposal.md).
- 📋 **The gate/isolation question is now its own investigation, not part of the above.**
  [Shared-tree failure modes](investigations/2026-07-27-shared-tree-failure-modes.md) — eleven
  mechanisms separated, four evidence sources (issues · four consuming projects' living docs · a live
  7-seat interview · published practice). Headline: **the contention was on the index and the gate,
  never on the files** — the ownership model held. Two mechanisms (**livelock by politeness**,
  **lead ruling latency**) had never been filed by anyone. **No recommendation yet** — deliberately.

**✅ Batch 4 — Ritual & guidance pass** _(weaver; skills text)_ — landed 2026-07-27

- ✅ **Finalize: re-read every doc you own as its authority** (#57) — the standout, now **step 2.5**
  plus a checklist line. Four seats ran this unprompted and **every one found drift**, including a
  proof pointing at a deleted artifact and two outright false statements. Nothing fails a gate; a
  confidently-wrong trail is worse than no trail.
  [backlog](backlog/2026-07-27-finalize-owner-reread-contracts.md).
- ✅ **Subagent dispatch named as a seat move** (#36 → `join`, the cold-audit-before-you-post pattern)
  and the **thread≠seat re-dispatch hazard** (#47 → `convene`).
  [backlog](backlog/2026-07-27-subagent-dispatch-in-seat-guidance.md).
- ✅ **Session-pacing patterns** (#37/#41 → `convene`) and ✅ **ratify runtime claims with a measured
  repro** (#46 → `plan`; `methodology.md` mirror still open).
  [pacing](backlog/2026-07-27-session-pacing-patterns.md) ·
  [ratify](backlog/2026-07-27-ratify-runtime-claims-need-repro.md).
- ⚠️ **Bootstrap host-adaptation** (#53/#44/#56) — **partially** shipped. The split-formatter guidance
  landed (detect which tool owns JSON; verify per tool rather than adding a redundant ignore). **Still
  open:** tree-wide pre-commit hook detection at preflight, and wiring the now-existing
  `placeholder.ts` into bootstrap. [backlog](backlog/2026-07-27-bootstrap-host-adaptation.md).
- 📋 **Shared live-service lock** (#61) — **not started; needs a design pass.** A worktree isolates
  files, not ports — and the issue's own finding 4 says a remembered rule fails under load, which
  argues against shipping this as prose at all. [backlog](backlog/2026-07-27-shared-live-service-lock.md).

**✅ Shipped since `v1.3.0` (on `develop` / released):**

- ✅ **Convene pre-spawn branch-confirm beat** — **SHIPPED** 2026-07-10. A lightweight convene beat +
  checklist line, fired **before spawn** (the moment seats gain commit power): confirm the working
  branch, following the project's branch policy **read from the grounding docs** (AGENTS.md) — a decision
  prompt, never an auto-cut. Fixes the "team landed 7 commits straight onto trunk" footgun. **Closes
  #34.** ([convene SKILL.md](../plugin/skills/convene/SKILL.md)).
- ✅ **Board-session-binding** — **SHIPPED** 2026-07-10 (`8a7471b` feat + `7bf6d18` docs), built and
  proven live by a convened team. anthill binds every seat's bounty verb to _this_ team's board by
  construction (convene opens keyed+pinned via `bounty open --session-key <channel> --pin --no-open`;
  spawn exports `BOUNTY_SESSION_KEY`), so the lead, spawned seats, and dispatched subagents all resolve
  the team board ambiently — no `--session` threading. Requires spellbook ≥ 1.16.0
  ([spellbook#69](https://github.com/ichabodcole/spellbook/issues/69)). **Closes #23, #19.**
  [proposal](projects/_archive/board-session-binding/proposal.md) · [plan](projects/_archive/board-session-binding/plan.md).
- ✅ **Shared-tree gate tension — moves A + B1** — **SHIPPED** 2026-07-08. Red-tree finalize mode baked
  into `finalize-session` (closes #14); scratch-dir gate exclusion so a seat's untracked throwaway can't
  red another seat's land (addresses #16). **Move C deferred** — see **Recently captured** below; its
  evidence strengthened 2026-07-10 (#24/#28 + a first-party in-house reproduction).
  [proposal](projects/shared-tree-gate-tension/proposal.md).

**✅ Shipped in `v1.3.0` (2026-07-05) — the release-prep run, sequenced 1→2→3:**

- ✅ **Targeted plugin distribution** — ship only the `plugin/` subtree (`git-subdir` source) + a
  **zero-dep CLI** (dropped `citty` for in-house `parseArgs`), so consumers stop receiving our internal
  `.anthill/`/`docs/`/dev-config and the CLI needs no runtime fetch. Verified by a zero-dep clean-room
  run **and** a real cached install (`1.3.0/` holds only `.claude-plugin` + `scripts`/`skills`/`templates`).
  Archived: [proposal](projects/_archive/plugin-distribution/proposal.md) ·
  [session](projects/_archive/plugin-distribution/sessions/2026-07-05-targeted-distribution.md).
- ✅ **`anthill feedback` — upstream feedback path** — a first-class way for consuming projects to send
  bugs **and ideas** home to the anthill repo (GitHub transport, `--submit`-gated, lead-owned, no
  feedback lost, provenance-labeled). The 2nd `anthill:plan` dogfood. `anthill-feedback` label created
  on the repo. Archived: [proposal](projects/_archive/upstream-feedback/proposal.md) ·
  [plan](projects/_archive/upstream-feedback/plan.md) ·
  [session](projects/_archive/upstream-feedback/sessions/2026-07-05-feedback-dogfood.md).
- ✅ **Cut the `develop → main` release** — `anthill-v1.3.0` tagged (release-please PR #9); `develop`
  synced back. Post-release: the `git-subdir` install check passed on a real cache; the
  `anthill-feedback` label exists. Follow-up fix landed post-release: `GIT_*`-env scrub in
  git-spawning tests (paper-cut 2026-07-05 #1, `e80e786`).

1. ✅ **`anthill:plan` — the skeleton→ratify planning skill** — **SHIPPED** 2026-07-03 (`f6b34eb`,
   on `develop`). The lead scaffolds a thin skeleton (integration order + cross-seam contracts as
   claims), seats ratify the seams they touch, owners author their lanes. Self-contained. Archived:
   [proposal](projects/_archive/team-dev-planning/proposal.md) ·
   [session](projects/_archive/team-dev-planning/sessions/2026-07-03-anthill-plan-skill-build.md).
   _Not yet run live — the first real invocation in a convened session is the #4 dogfood._
2. ✅ **Global `anthill` CLI (launcher slice)** — **SHIPPED** 2026-07-04 (`b8fe79d`, on `develop`).
   A **launcher, not a copy**: a tiny opt-in binary ([anthill-cli](https://github.com/ichabodcole/anthill-cli),
   `bun add -g github:ichabodcole/anthill-cli`) that resolves the highest-semver plugin cache and
   delegates to _its_ `cli.ts` — one copy of CLI logic, zero skew. Plugin-side: `anthill attach
--session` + a friendly no-project fallback; consent-gated bootstrap mention.
   [proposal](projects/_archive/anthill-cli-launcher/proposal.md) · [plan](projects/_archive/anthill-cli-launcher/plan.md) ·
   [session](projects/_archive/anthill-cli-launcher/sessions/2026-07-04-cli-launcher-build.md).
   _Deferred (out of the "light now" slice): lead-facing vine/board wrapper verbs — see
   [v0.2 brief, feature 3](briefs/2026-06-30-anthill-v0.2-next-release.md)._

## Next

3. ✅ **Multi-surface archetype + candidate seatings** — **SHIPPED** 2026-07-05 (`de3aa58`, on
   `feat/multi-surface-archetype`; awaiting human sign-off → `develop`). A by-surface archetype +
   `anthill scan` (deterministic workspace detector) + bootstrap candidate seatings as a
   conversation-opener, ratify-not-reconstruct. `anthill scan` was pulled into the MVP to give the
   dogfood a real forager↔weaver seam. Validated on media-buffet (the origin repo): candidate A emerges
   correctly, the shared SDK identified by dependency fan-in. Archived:
   [proposal](projects/_archive/multi-surface-archetype/proposal.md) ·
   [plan](projects/_archive/multi-surface-archetype/plan.md) ·
   [session](projects/_archive/multi-surface-archetype/sessions/2026-07-05-multi-surface-dogfood.md).
4. ✅ **First instrumented dogfood session** — **SHIPPED** 2026-07-05. #3 above **was** the first real
   `anthill:plan` run with the convened team (seats as subagents over a live vine + board). The ratify
   gate caught **two load-bearing seam errors at zero rework cost** — the empirical data point the
   memory work (#8–#10) is gated on. Trail is traceable end-to-end (vine #2→#5, board, `seams.md`
   Contract 1, `de3aa58`); the four seat docs went scaffold-empty → first real content.
   [session](projects/_archive/multi-surface-archetype/sessions/2026-07-05-multi-surface-dogfood.md).
5. ✅ **Ritual checklists baked into the lifecycle skills** — **SHIPPED** 2026-07-04 (`ead9e66`).
   The skills now **emit** skip-resistant checklists: `convene` (lead setup), `join` (member), and a
   `finalize-session` teardown checklist carrying the previously-missing **human sign-off gate before
   the feature branch merges to develop**.
   [session](projects/_archive/skill-hygiene-pass/sessions/2026-07-04-skill-hygiene-pass.md).
6. ✅ **Rail-guarding paper-cut fix — `anthill commit` × lint-staged** — **SHIPPED** 2026-07-04
   (`ee8b62d`). Stage → verify-index-is-exactly-our-paths → pathspec-less commit (runs the hook
   against the real index, dodging the temp-index corruption); unexpected staged content aborts.
   [paper-cuts](../.anthill/paper-cuts.md) ·
   [session](projects/_archive/skill-hygiene-pass/sessions/2026-07-04-skill-hygiene-pass.md).
   _Still open (the other half): channel hygiene in convene/down (dream-flute paper-cut #14)._
7. ✅ **Cheap ritual/SOP edits** — **SHIPPED** 2026-07-04 (`ead9e66`). Into the SOP seed:
   _no store without a named re-read moment_, _the vine evaporates_ (land decisions in an artifact),
   _one intake route at synthesis_; playbook-pointer rule into `docs/README.md`
   ([report recs 2, 6](reports/2026-07-02-conceptual-implementation-review-report.md);
   [taxonomy next-steps](investigations/_archive/2026-07-02-docs-taxonomy-in-the-team-era.md)).

## Later (order softens out here)

8. **Pheromone-dynamics bundle** — last-verified stamps, verify-at-join, per-doc token budgets
   ([report rec 3](reports/2026-07-02-conceptual-implementation-review-report.md)). _Gated on #4's
   data — dream-flute's zero-fade growth curve is the motivating evidence._
9. **Scenario ledger + digest** — the episode tier below seat docs, lazy generalization
   ([report rec 4](reports/2026-07-02-conceptual-implementation-review-report.md)). _Gated on #4
   for sample episodes; formally replaces fragments/lessons-learned in team repos._
10. **Task-conditioned grounding** — `applies-to` globs ∩ the claimed card
    ([report rec 5](reports/2026-07-02-conceptual-implementation-review-report.md)).
11. **Docs-taxonomy dispositions** — archive hollow scaffolds, playbook-pointer rule
    ([taxonomy investigation](investigations/_archive/2026-07-02-docs-taxonomy-in-the-team-era.md)); incremental.
    _Partly enacted 2026-07-05: the 3 shipped v1.3.0 projects + 3 concluded investigations archived._
12. **dream-flute full parity close-out** — retire remaining `flute team-*` surface, confirm
    nothing was lost ([v0.2 feature 6](briefs/2026-06-30-anthill-v0.2-next-release.md); adoption
    already live, this is the audit).
13. **`anthill hotspots` spike** — the git-heat sematectonic organ
    ([heatmap investigation](investigations/2026-06-30-file-activity-heatmap.md)); post-v0.2 by design.

## Recently captured (awaiting prioritization — mostly 2026-07-09/10)

Not yet slotted into the numbered order above; each has a doc but hasn't been argued into a horizon.

> **Mostly absorbed 2026-07-27.** The feedback triage folded most of this block into the four
> batches under **Now**. What remains genuinely unprioritized here: **per-seat model selection**,
> **research probes**, and the two backlog items at the end. Each entry below is marked.

- **Shared-tree move C — commit pre-flight / lane-aware gate.** The deferred third move of the
  shared-tree project: tell the agent _"tree is red, held by X — didn't attempt your land"_ at land time
  instead of a 90s-lock-then-opaque-failure. **Evidence strengthened 2026-07-10** — four field reports
  (#14/#16/#24/#28) + a first-party in-house reproduction + a lead-blocks-seats finalize instance, all
  one root cause; #28 adds a lane-aware-gate axis (scope hooks to the committed pathspec). **Now has a
  cheap, proxy-free first slice (C.1):** on a gate _failure_, diff the red paths against the committed
  set and say _"red on `<other paths>`, not your commit"_ — no pre-flight proxy needed, buildable today.
  The strongest candidate to pull forward. **C.1 → Planned** — folded into the commit-hardening plan
  under **Now** (move 2); **C proper (the pre-flight / lane-aware gate) remains deferred.**
  **⚠ CORRECTION 2026-07-27 — move C is NOT obviated by the branch work.** An earlier note here
  claimed the branch strategy might supersede it. That was wrong: a feature branch changes _where
  commits land_ and does nothing about a whole-tree gate coupling independent lanes. The two address
  different mechanisms (**M5** vs **M1/M2** in the taxonomy below) and neither substitutes for the
  other. **Read the [shared-tree failure-modes investigation](investigations/2026-07-27-shared-tree-failure-modes.md)
  before building C** — it separates eight distinct mechanisms, shows no candidate fix covers more
  than three, and leaves the isolation-vs-mitigation call deliberately open pending measurement.
  [original proposal](projects/shared-tree-gate-tension/proposal.md).
- **`anthill commit` protected-trunk guard** (backlog) — land-time backstop to the #34 convene beat:
  refuse a direct commit to a **configurable** protected set (never a hard-coded `develop`/`main` — the
  project supplies the branches), warn/`--force` escape hatch. **→ Planned** — folded into the
  commit-hardening plan under **Now** (move 1). [backlog](backlog/2026-07-10-anthill-commit-protected-trunk-guard.md).
- **Per-seat model selection** (proposal) — set the model of a convened seat (`model?` on SeatConfig, a
  `{model}` launch placeholder, `claude --model`). Small, self-contained.
  [proposal](projects/per-seat-model-selection/proposal.md).
- **Research probes** (proposal) — bake targeted feedback questions into skills to collect in-situ
  signal from convened teams, spine-designed around the **observer-effect discipline** (blind-by-default,
  neutral phrasing, priming deferred as the contamination surface).
  [proposal](projects/research-probes/proposal.md).
- **Seat subagent orchestration** (investigation, _Monitor — validate in situ_) — hypothesis that
  convened seats under-use subagents (default to implementer, not orchestrator).
  **✅ VALIDATED 2026-07-27 by [#36](https://github.com/ichabodcole/anthill/issues/36)** — a 16-slice
  build produced **zero** dispatches from two implementation-heavy seats, and neither had consciously
  considered them (invisible, not declined). The hypothesis holds; the investigation can come off
  _Monitor_. → **Batch 4.** [investigation](investigations/2026-07-09-seat-subagent-orchestration.md) ·
  [backlog](backlog/2026-07-27-subagent-dispatch-in-seat-guidance.md).
- **Finalize fresh-eyes seat-doc review** (backlog) — a cold subagent reads a just-written seat doc and
  reports comprehension gaps; the context-rich seat then closes them. A prime-safe, concrete instance of
  the subagent-orchestration idea. [backlog](backlog/2026-07-09-finalize-fresh-eyes-seat-doc-review.md).
- **convene/status coord-daemon version-skew detection** (backlog) — detect a stale daemon serving old
  resolution to a newer CLI (would silently reintroduce the board-hijack board-session-binding fixed);
  offer to align. [backlog](backlog/2026-07-10-convene-status-detect-coord-daemon-version-skew.md).
- **Unowned-stray claim primitive** (backlog) — a stray with no card/owner has no claim primitive, so
  seats race to fix it; the field convention (vine claim + provenance guess; creator self-claims;
  reconciled layers) is captured. Shape (a) is a cheap SOP note; (b)/(c) are bounty upstream — needs a
  design pass. Relates to the parked self-selection bounties.
  [backlog](backlog/2026-07-10-unowned-stray-claim-primitive.md).

## Parked (deliberate)

- **Liveness watchdog / stall detector** — open question vs the session-bounded model; board
  heartbeat covers the worst of it ([landscape investigation](investigations/_archive/2026-07-01-agentic-teams-memory-stigmergy-landscape.md)).
  **⚠ Evidence arrived 2026-07-27 — reconsider the park.** [#58](https://github.com/ichabodcole/anthill/issues/58)
  reports a recurring **lead-idle** stall: work reached a human gate, seats correctly parked their
  cards and @-tagged the lead, and the lead was silent ~35 min. The board heartbeat only pokes an
  **overdue doer**, never an **idle lead** — so the exact state that halts the whole team is the one
  nothing watches. Proposed shape: poke the lead when _all_ active cards are parked (= build gated).
  That is narrower than a general watchdog and may not deserve the same park.
- **Self-selection bounties** — the lead-bottleneck relief valve; no saturation signal yet.
- **Semantic/embedding retrieval** — structure-before-search; revisit only if grep-over-structure
  measurably fails.
- **Backlog minor items** — none parked here now. (Status ambient-board scoping ✅ **closed +
  archived** 2026-07-10 — board-session-binding delivered true session-scoping; verified live against a
  stranger-as-`latest` board. Prettier-markdown-policy resolved 2026-07-03 — archived.)

---

## The ordering logic (so reordering is an argument, not a vibe)

1. **Finish what's started before opening new mechanism** — v0.2's remaining features (#1–#3)
   ship the release the field work already paid for.
2. **Instrument before you mechanize** — the dogfood session (#4) sits between the release work
   and the memory work on purpose: every memory mechanism (#8–#10) needs real trail data to be
   designed against, and anthill's own trails are still empty.
3. **Rules before tooling** — the ritual checklists and cheap SOP edits (#5, #7) cost minutes and
   shape every session after; they never need to wait on a release.

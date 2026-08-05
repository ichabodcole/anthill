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
**3 of 8 criteria met (4, 4b, 6). Remaining: 1 rotation · 2 the swap run · 3 the positional guard · 5 the sweep touchpoint · 7 the re-triage.**

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
> **The repair is a ritual beat, not resolve: card `S12-1`, weaver's lane.**

### The exit criteria — all seven, every one mechanically checkable

**The scope is met when a stranger can run these and get these answers. Not before, and no criterion
is discharged by argument.**

| #         | criterion                                                                                                                                                         | how it is checked                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**     | **Rotation landed**, with `seams.md` 6(g) amended                                                                                                                 | one commit names both paths (write-trigger)                                                                                                                                                                                                   |
| **2**     | **The swap run passes exit criterion v3 — BOTH halves**                                                                                                           | absence of USE is runnable as-is. **Absence of OPENING now needs a POSITIVE artifact** — `channelOpened` was deleted with step 4, and an absent field is not an observation (Contract 6(c)). **Name the artifact before the run, not after.** |
| **3**     | **`comms read` positional guard**, at parser altitude                                                                                                             | 3 controls green: `commit -- <paths>` · `comms send <body>` · `join <handle>`                                                                                                                                                                 |
| **4** ✅  | ~~🔴~~ **MET `cbafb2b`** — **WHAT WE SHIP POINTS AT NO GRAPEVINE** _(Cole's ruling, 2026-08-05 — scoped to the RELEASE, not the repo)_                            | `grep -rni grapevine plugin/skills plugin/templates plugin/.claude-plugin` returns **only** recorded history and the `upgrade` migration note — **no line telling an agent to USE it.** Baseline: **8 hits, 6 live-wrong** (see below)        |
| **4b** ✅ | **MET `cbafb2b`** — **`anthill:upgrade` documents the migration**                                                                                                 | `skills/upgrade/SKILL.md` states grapevine→comms for an **existing** team, and what to do with that team's own in-repo references                                                                                                             |
| **5**     | **The sweep-the-plan touchpoint** shipped                                                                                                                         | in `skills/finalize-session/`, `templates/docs-team/` **and** `.anthill/README.md` — the team's own copy, per its own scar                                                                                                                    |
| **6** ✅  | **MET — released as `anthill-v2.0.0`** (2026-08-05, `a130be3`). A **MAJOR** bump: release-please read the `BREAKING CHANGE` footers. `develop` == `main`, 0 ahead | `develop` → `main`, release cut                                                                                                                                                                                                               |
| **7**     | **This section points at live work**                                                                                                                              | every dir in `docs/projects/` except `_archive`/`TEMPLATES` has a `**Status:**` at the **start of a line**, plus a named next action or an explicit `parked`/`superseded` marker                                                              |

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

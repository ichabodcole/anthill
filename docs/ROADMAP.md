# Roadmap — what we're working on, in what order

**Status:** Active · **Owner:** Cole + lead · **Updated:** 2026-07-10

The single prioritized view over everything queued in briefs, projects, investigations, reports,
and backlog. A **router, not a manual** — one line and a pointer each; the linked doc is the
truth. Horizons, not dates: **Now** (in flight) · **Next** (queued, order matters) · **Later**
(real, not yet actionable) · **Parked** (deliberately not now).

> **Read-trigger:** the lead reads this at **convene** (the gather-the-work step) and updates it
> at **finalize** when priorities shifted. A roadmap nothing re-reads is a wish list.

---

## Now

**Nothing in flight.** The `v1.3.0` release-prep run (below) shipped and is cut, and two follow-on
projects have landed since (shared-tree gate tension A+B1, and board-session-binding — see the shipped
block just below). The next horizon is **Next** — dream-flute parity close-out (#12) and the memory
bundle (#8–#10), now unblocked by the #4 dogfood data. Also weigh the freshly-captured work in
**Recently captured** (below **Later**) — notably **shared-tree move C**, whose evidence just
strengthened. Pick the next slice from there.

**✅ Shipped since `v1.3.0` (on `develop` / released):**

- ✅ **Board-session-binding** — **SHIPPED** 2026-07-10 (`8a7471b` feat + `7bf6d18` docs), built and
  proven live by a convened team. anthill binds every seat's bounty verb to _this_ team's board by
  construction (convene opens keyed+pinned via `bounty open --session-key <channel> --pin --no-open`;
  spawn exports `BOUNTY_SESSION_KEY`), so the lead, spawned seats, and dispatched subagents all resolve
  the team board ambiently — no `--session` threading. Requires spellbook ≥ 1.16.0
  ([spellbook#69](https://github.com/ichabodcole/spellbook/issues/69)). **Closes #23, #19.**
  [proposal](projects/board-session-binding/proposal.md) · [plan](projects/board-session-binding/plan.md).
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
Triage at the next convene.

- **Shared-tree move C — commit pre-flight / lane-aware gate.** The deferred third move of the
  shared-tree project: tell the agent _"tree is red, held by X — didn't attempt your land"_ at land time
  instead of a 90s-lock-then-opaque-failure. **Evidence strengthened 2026-07-10** — now four field
  reports (#14/#16/#24/#28) + a first-party in-house reproduction, all one root cause; #28 adds a
  lane-aware-gate axis (scope hook execution to the committed pathspec). The strongest candidate to pull
  forward. [proposal](projects/shared-tree-gate-tension/proposal.md).
- **Per-seat model selection** (proposal) — set the model of a convened seat (`model?` on SeatConfig, a
  `{model}` launch placeholder, `claude --model`). Small, self-contained.
  [proposal](projects/per-seat-model-selection/proposal.md).
- **Research probes** (proposal) — bake targeted feedback questions into skills to collect in-situ
  signal from convened teams, spine-designed around the **observer-effect discipline** (blind-by-default,
  neutral phrasing, priming deferred as the contamination surface).
  [proposal](projects/research-probes/proposal.md).
- **Seat subagent orchestration** (investigation, _Monitor — validate in situ_) — hypothesis that
  convened seats under-use subagents (default to implementer, not orchestrator). Validate empirically in
  the next instrumented dogfood; sibling of the signal-hunger investigation.
  [investigation](investigations/2026-07-09-seat-subagent-orchestration.md).
- **Finalize fresh-eyes seat-doc review** (backlog) — a cold subagent reads a just-written seat doc and
  reports comprehension gaps; the context-rich seat then closes them. A prime-safe, concrete instance of
  the subagent-orchestration idea. [backlog](backlog/2026-07-09-finalize-fresh-eyes-seat-doc-review.md).
- **convene/status coord-daemon version-skew detection** (backlog) — detect a stale daemon serving old
  resolution to a newer CLI (would silently reintroduce the board-hijack board-session-binding fixed);
  offer to align. [backlog](backlog/2026-07-10-convene-status-detect-coord-daemon-version-skew.md).

## Parked (deliberate)

- **Liveness watchdog / stall detector** — open question vs the session-bounded model; board
  heartbeat covers the worst of it ([landscape investigation](investigations/_archive/2026-07-01-agentic-teams-memory-stigmergy-landscape.md)).
- **Self-selection bounties** — the lead-bottleneck relief valve; no saturation signal yet.
- **Semantic/embedding retrieval** — structure-before-search; revisit only if grep-over-structure
  measurably fails.
- **Backlog minor items** — [status ambient-board scoping](backlog/2026-06-30-anthill-status-ambient-board-scoping.md):
  **likely closeable** — its deferred remainder ("true session-scoping needs anthill to persist its own
  board id") is essentially what **board-session-binding delivered** (the pinned `.bounty-session` /
  keyed board now resolves _this_ team's board). Verify `anthill status` reads the bound board, then
  archive. (Prettier-markdown-policy resolved 2026-07-03 — archived.)

---

## The ordering logic (so reordering is an argument, not a vibe)

1. **Finish what's started before opening new mechanism** — v0.2's remaining features (#1–#3)
   ship the release the field work already paid for.
2. **Instrument before you mechanize** — the dogfood session (#4) sits between the release work
   and the memory work on purpose: every memory mechanism (#8–#10) needs real trail data to be
   designed against, and anthill's own trails are still empty.
3. **Rules before tooling** — the ritual checklists and cheap SOP edits (#5, #7) cost minutes and
   shape every session after; they never need to wait on a release.

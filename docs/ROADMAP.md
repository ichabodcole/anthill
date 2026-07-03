# Roadmap — what we're working on, in what order

**Status:** Active · **Owner:** Cole + lead · **Updated:** 2026-07-03

The single prioritized view over everything queued in briefs, projects, investigations, reports,
and backlog. A **router, not a manual** — one line and a pointer each; the linked doc is the
truth. Horizons, not dates: **Now** (in flight) · **Next** (queued, order matters) · **Later**
(real, not yet actionable) · **Parked** (deliberately not now).

> **Read-trigger:** the lead reads this at **convene** (the gather-the-work step) and updates it
> at **finalize** when priorities shifted. A roadmap nothing re-reads is a wish list.

---

## Now

1. **`anthill:plan` — the skeleton→ratify planning skill** — [team-dev-planning](projects/team-dev-planning/proposal.md)
   (**MVP built 2026-07-03** on `feat/anthill-plan-skill`, pending merge — `skills/plan/` + bundled
   `methodology.md`, wired into `convene`/`join`/`seams.md`/SOP; the real dogfood exercise is #4).
   Lifecycle position: **normally starts before
   convene** — the lead drafts the skeleton solo (phases, seat lanes, proposed seams) — then the
   **convened team completes it** (each seat ratifies/falsifies its lane and the seams that
   touch it). Convene must not _require_ a skeleton, though: a team can convene plan-less (it
   points at one if present, proceeds without if not). _Why first: it's the lifecycle keystone —
   every multi-seat build after it, including the items below, should run through it._
2. **Global `anthill` CLI** — [v0.2 brief, feature 3](briefs/2026-06-30-anthill-v0.2-next-release.md)
   (last unshipped foundation piece of v0.2; the human terminal door + what dream-flute parity rides on).

## Next

3. **Multi-surface archetype + candidate seatings** — [v0.2 feature 5](briefs/2026-06-30-anthill-v0.2-next-release.md)
   (the headline field fix from media-buffet; visible seam-decisions, ratify-not-reconstruct).
4. **First instrumented dogfood session** — build one of the above **with the convened anthill
   team**: trace one decision vine→card→doc→code, baseline seat-doc token counts, run the
   cold-read check. _Why here: it exercises `anthill:plan` for real and generates the empirical
   data every memory upgrade below depends on
   ([report rec 1](reports/2026-07-02-conceptual-implementation-review-report.md))._
5. **Ritual checklists baked into the lifecycle skills** — field-observed skips, so the fix is
   making the skills emit the checklist rather than adding a form to fill out. **Lead** (mostly
   convene already): create grapevine → create board → size bounty tasks where possible → convene
   → and the ones that get skipped: **collect every seat's finalize before standing them down**,
   and **get explicit human sign-off before merging the feature branch to develop** — green tests
   and a checked-off board are the team's own signals; the human's look (UI bugs, feel, feedback)
   is a gate the team can't run itself, and end-of-session "we're done" momentum is exactly when
   it gets skipped.
   **Member** (join + SOP): join & monitor grapevine, join & monitor board, introduce yourself on
   the vine, finalize before stand-down, and **route questions through the lead/liaison — never
   block on the human** (the human may not be watching that terminal).
6. **Rail-guarding paper-cut fixes** — `anthill commit` × lint-staged
   ([paper-cuts 2026-07-02](../.anthill/paper-cuts.md)); channel hygiene in convene/down
   (dream-flute paper-cut #14, the half anthill owns).
7. **Cheap ritual/SOP edits from the review** — the read-trigger rule, the artifact-first rule
   ("the vine evaporates"), route-at-synthesis
   ([report recs 2, 6](reports/2026-07-02-conceptual-implementation-review-report.md);
   [taxonomy investigation next-steps](investigations/2026-07-02-docs-taxonomy-in-the-team-era.md)).

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
    ([taxonomy investigation](investigations/2026-07-02-docs-taxonomy-in-the-team-era.md)); incremental.
12. **dream-flute full parity close-out** — retire remaining `flute team-*` surface, confirm
    nothing was lost ([v0.2 feature 6](briefs/2026-06-30-anthill-v0.2-next-release.md); adoption
    already live, this is the audit).
13. **`anthill hotspots` spike** — the git-heat sematectonic organ
    ([heatmap investigation](investigations/2026-06-30-file-activity-heatmap.md)); post-v0.2 by design.

## Parked (deliberate)

- **Liveness watchdog / stall detector** — open question vs the session-bounded model; board
  heartbeat covers the worst of it ([landscape investigation](investigations/2026-07-01-agentic-teams-memory-stigmergy-landscape.md)).
- **Self-selection bounties** — the lead-bottleneck relief valve; no saturation signal yet.
- **Semantic/embedding retrieval** — structure-before-search; revisit only if grep-over-structure
  measurably fails.
- **Backlog minor items** — [status ambient-board scoping](backlog/2026-06-30-anthill-status-ambient-board-scoping.md),
  [prettier markdown policy](backlog/2026-06-30-prettier-markdown-policy.md).

---

## The ordering logic (so reordering is an argument, not a vibe)

1. **Finish what's started before opening new mechanism** — v0.2's remaining features (#1–#3)
   ship the release the field work already paid for.
2. **Instrument before you mechanize** — the dogfood session (#4) sits between the release work
   and the memory work on purpose: every memory mechanism (#8–#10) needs real trail data to be
   designed against, and anthill's own trails are still empty.
3. **Rules before tooling** — the ritual checklists and cheap SOP edits (#5, #7) cost minutes and
   shape every session after; they never need to wait on a release.

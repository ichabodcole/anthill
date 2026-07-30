# Session branch strategy — convene on a branch, merge at finalize

**Status:** Draft — **design resolved 2026-07-27**, ready for a plan
**Created:** 2026-07-27
**Author:** Cole + maestro (triaged from nine field reports across four consuming projects)

---

## ⚠️ Scope correction (2026-07-27) — read this first

This proposal originally bundled **two unrelated problems**: history noise on the base branch, and
gate coupling on a shared tree. **They are now separated, and this document covers only the first.**

A feature branch changes _where commits land_. It does **nothing** about a whole-tree pre-commit hook
coupling independent lanes — those seats are all on one tree regardless of which branch it is on. The
earlier claim that this work might "largely obviate" `shared-tree-gate-tension` move C was wrong.

**Gate coupling and isolation now live in
[the shared-tree failure-modes investigation](../../investigations/2026-07-27-shared-tree-failure-modes.md)**,
which separates eight distinct mechanisms and deliberately reaches no recommendation pending
measurement. This proposal addresses exactly one of them (**M5**) — the only one that is fully
understood, has an unambiguous fix, and interacts with nothing else. It can ship without prejudging
any of that.

### Design decisions settled 2026-07-27

| Question                        | Decision                                                                                                                                                                                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What does "consolidate" mean?   | **A merge strategy, not history rewriting.** Squash-merge into the base. `consolidate-long-branch` is a human-supervised ritual requiring _contiguous_ chapters — and a shared tree interleaves seats by construction, so the grouping it needs is the property a convened session destroys. |
| Who owns the branch?            | **The feature**, not the session. It survives across sessions; reconvening resumes it.                                                                                                                                                                                                       |
| When does it merge?             | `finalize-session` **asks** whether the feature is done, and merges only on yes. Finalize stays about knowledge; merging is a question it poses, not a thing it assumes.                                                                                                                     |
| Where does policy live?         | **One `branch{}` block** in `.anthill/config.json`, read by both `convene` and `anthill commit`. **Unset ⇒ off** — anthill never surprises a repo that didn't ask.                                                                                                                           |
| Relationship to the trunk guard | This **unblocks it.** The protected-trunk guard (`anthill-commit-hardening` move 1) is the land-time twin of layer 1 and shares the same config block; design them together.                                                                                                                 |

The layer 3 (isolation) material below is retained for context but is **out of scope here** — it
belongs to the investigation.

---

## Overview

A convened anthill team commits **file-scoped, serialized, on whatever branch `convene` happened to
run on** — and every seat shares one working tree. Those two properties are the source of nearly
every friction report anthill has received. This proposal treats them as one problem with one
sequence of fixes:

1. **`convene` establishes a session branch** rather than inheriting the current one.
2. **`finalize-session` consolidates** that branch into a curated set of commits before it merges.
3. **Isolation becomes a considered mode** (`spawn --isolate` / per-seat worktrees), chosen per
   project rather than assumed away.

Steps 1 and 2 are cheap and get most of the value. Step 3 is the deliberate, heavier version — and
the only one that actually _eliminates_ the shared-tree class rather than mitigating it.

## Problem Statement

Nine issues, filed independently by four teams, reduce to two root causes.

### Root cause A — the team commits on the branch it was convened on

[#59](https://github.com/ichabodcole/anthill/issues/59). One feature (a tenant API-key lifecycle)
built by a 4-seat team produced **~50 commits landing directly on `develop`** — ~30 feature-code
commits, ~20 seat-doc/seams-curation commits, plus review-fix commits, all interleaved with each
other _and_ with unrelated in-flight `develop` work. The base branch became a transcript of every
mid-build fix, break-to-reproduce, and doc-curation step.

The human's framing: _"I want to avoid a really noisy commit history on develop… commits that
deliver actual value and can live on their own, not one part of a full feature that ends up as
noise."_

This is **structural, not sloppiness**. The SOP is "seats share one tree and one index," each seat
commits file-scoped via `anthill commit`, and `convene` silently uses the current branch. If that
branch is the integration branch, every seat's every commit lands there. Multi-agent should not
mean multi-noise on the base.

### Root cause B — a whole-tree gate over a shared tree couples independent lanes

Six issues ([#24](https://github.com/ichabodcole/anthill/issues/24),
[#28](https://github.com/ichabodcole/anthill/issues/28),
[#44](https://github.com/ichabodcole/anthill/issues/44),
[#49](https://github.com/ichabodcole/anthill/issues/49),
[#55](https://github.com/ichabodcole/anthill/issues/55) part 2,
[#60](https://github.com/ichabodcole/anthill/issues/60)), plus the existing
[`shared-tree-gate-tension`](../shared-tree-gate-tension/proposal.md) project.

File-scoping bounds the **commit**; it does not bound the **gate**. The project's pre-commit hook
sees the whole tree, so any one seat's transient state — a TDD red-before-impl, a mid-extraction
refactor, an unformatted file, a stray probe artifact — blocks **every** seat's land. One session
reported **six red-tree events, each blocking all four seats**, with the error always pointing at a
file the blocked seat did not own.

As #55 puts it: _"It's nobody's carelessness — a multi-seat team on one working tree with a
whole-repo gate has this by construction."_

Two further reports show the shared tree biting outside git entirely:

- [#52](https://github.com/ichabodcole/anthill/issues/52) — a seat's verification **build** baked
  peers' uncommitted `src` edits into artifacts it then committed (caught live, restored before
  landing). Artifact-producing builds read the whole tree, not your lane.
- [#61](https://github.com/ichabodcole/anthill/issues/61) — a shared **live service** (daemon, port,
  socket) is machine-global and ignores worktrees entirely. Two seats claimed the same sha and got
  opposite results because one had an uncommitted edit HMR'd into a running dev server. _Tracked
  separately in [the shared-live-service item](../../backlog/2026-07-27-shared-live-service-lock.md)
  — noted here because it bounds what isolation can promise._

### Why the existing project doesn't cover this

`shared-tree-gate-tension` framed the fix as **a smarter gate** (moves A, B1 shipped; C deferred).
#59 reframes it: the cheaper and more complete fix is **a better branch**, and beyond that, **fewer
shared trees**. Move C's pre-flight/lane-aware gate stays a valid mitigation, but it should be
sequenced _after_ this, not before — it may be largely obviated.

## Proposed Solution

### Layer 1 — `convene` establishes the session branch

`convene` already has a **pre-spawn branch-confirm beat** (shipped 2026-07-10, closes
[#34](https://github.com/ichabodcole/anthill/issues/34)) that _prompts_ the branch decision, reading
policy from the project's grounding docs. Today it confirms; it does not offer to _create_.

The change: when the confirmed branch is the base/integration branch and the session's work is a
feature, `convene` offers to cut a session branch and convene there. **A prompt, never an auto-cut**
— per adapt-not-dictate, anthill supplies the trigger and the project supplies the policy.

This also completes the [protected-trunk guard](../../backlog/2026-07-10-anthill-commit-protected-trunk-guard.md)
already planned in [`anthill-commit-hardening`](../anthill-commit-hardening/plan.md): convene
_prompts_ the branch, the commit wrapper _refuses_ the protected one. **These two want to be
designed together** — same goal, two gates.

### Layer 2 — `finalize-session` consolidates before merging

Collapse the session branch's many small commits into a curated set of chapter-commits — one
coherent commit per lane/slice (contract / engine / surface / verify / docs), or a single squash for
an atomic feature — then merge to base. The base gets **~1–6 value-delivering commits instead of
~50**.

The tooling already exists and is tree-equivalence-verified: the `consolidate-long-branch`
discipline. `finalize-session` should invoke it rather than reimplement it.

### Layer 3 — isolation as a considered mode

`spawn --isolate` (or per-seat worktrees) for projects with heavy whole-tree gates or
artifact-producing builds. This **eliminates** root cause B rather than mitigating it, at the cost
of merge coordination. Explicitly _not_ a new default: #60 notes the right default depends on how
coupled the slices are, and tightly-coupled slices genuinely benefit from shared visibility.

What isolation does **not** solve, and must be documented as such: machine-global resources —
daemons, ports, databases (#61). A worktree isolates files; it does nothing for a port.

## Scope

**In Scope (MVP — layers 1 + 2):**

- `convene` offers to cut and convene on a session branch when the policy indicates it.
- `finalize-session` consolidates the session branch before the merge step.
- Documented shared-tree commit discipline in the SOP (the mitigations teams already invented:
  land in dependency order; get a file green **and formatted** before you commit or step away from
  it; `--no-verify` only for docs-only commits whose own content is provably green — #60, #49).

**Out of Scope (initially):**

- Per-seat worktree isolation (layer 3) — real, deliberate, and sized separately.
- The shared-live-service lock (#61) — its own backlog item.
- Move C's lane-aware gate — **re-evaluate after layers 1–2 land**; it may be largely obviated.

**Future Considerations:** `spawn --isolate`; a per-project default recorded in config; whether
consolidation should be per-lane or per-feature by default.

## Technical Approach

- **Layer 1** extends the existing convene beat (`plugin/skills/convene/SKILL.md`) — skill text plus,
  optionally, a CLI affordance for the branch cut. Keep the judgment in the skill and any
  deterministic rendering in the CLI (brain/hands).
- **Layer 2** is `finalize-session` skill text invoking the existing consolidation discipline. The
  tree-equivalence check is the safety property; do not weaken it.
- **Layer 3** touches `team-spawn.ts` + `tmux.ts` + `coord.ts` and is the only part needing real
  engineering.

## Impact & Risks

**Benefits:** a clean base-branch history; independent lanes stop blocking each other; the
already-planned protected-trunk guard gains the companion that makes it humane (refusing a commit on
`main` is only helpful if something offered you a branch first).

**Risks:**

- **Consolidation rewrites history.** It must stay gated by the existing two-backup-refs +
  byte-exact tree-equivalence check. A consolidation that loses work is far worse than a noisy log.
- **A session branch adds a merge step** the current flow doesn't have — and a team that
  finalizes badly could strand work on an unmerged branch. The finalize checklist must close this.
- **Prompt fatigue.** Another convene prompt on a path that already has several; it must be one
  beat, not a wizard.
- **Adapt-not-dictate.** Feature-branch flow is a _convention_ — exactly the class of thing anthill
  must not hard-code. Read the policy; offer the action; let the project decide.

**Complexity:** Medium for layers 1–2 (mostly skill text over existing mechanisms); High for layer 3.

## Open Questions

- **Does the session branch belong to the session or the feature?** A session that spans two days,
  or a feature that spans three sessions — which owns the branch?
- **Should consolidation be per-lane or per-feature by default?** #59 suggests one commit per
  lane/slice; a single squash is simpler but loses the lane structure that made the work legible.
- **Where does the human sign-off gate sit** relative to consolidation and merge? The finalize
  checklist already carries one; consolidation adds an irreversible step that likely wants to sit
  _after_ it.
- **Does layer 2 subsume `shared-tree-gate-tension` move C**, or do both survive?
- **What happens to seat-doc/curation commits?** ~20 of the ~50 were doc curation. Are those a
  separate chapter, folded per-lane, or landed straight to base as they are today?

## Success Criteria

- A 4-seat feature session lands **≤ 6 commits** on the base branch, each independently meaningful.
- No seat's transient red blocks another seat's land during a normal session, or the SOP names the
  discipline that avoids it.
- The base branch shows no interleaving between a team's in-flight work and unrelated work.

## References

**Related Documents:**

- [`shared-tree-gate-tension`](../shared-tree-gate-tension/proposal.md) — the predecessor framing
  (moves A + B1 shipped; C deferred pending this).
- [`anthill-commit-hardening`](../anthill-commit-hardening/plan.md) — the protected-trunk guard
  (layer 1's land-time twin) and the foreign-red diagnostic.
- [`anthill commit` correctness batch](../../backlog/2026-07-27-anthill-commit-correctness-batch.md) —
  the mitigations that make the shared tree survivable meanwhile.
- [Shared-live-service lock](../../backlog/2026-07-27-shared-live-service-lock.md) — the
  non-git shared-resource case (#61).
- Branch policy: `AGENTS.md`; the adapt-not-dictate principle.

**Issues:** [#59](https://github.com/ichabodcole/anthill/issues/59) (the reframe) ·
[#55](https://github.com/ichabodcole/anthill/issues/55) ·
[#60](https://github.com/ichabodcole/anthill/issues/60) ·
[#44](https://github.com/ichabodcole/anthill/issues/44) ·
[#52](https://github.com/ichabodcole/anthill/issues/52) ·
[#49](https://github.com/ichabodcole/anthill/issues/49) ·
[#28](https://github.com/ichabodcole/anthill/issues/28) ·
[#24](https://github.com/ichabodcole/anthill/issues/24) ·
[#61](https://github.com/ichabodcole/anthill/issues/61)

## Notes

Worth recording: this is the first proposal in anthill's history written **entirely from external
field reports** rather than from its own dogfood. Four projects, none of them this repo, converged
on the same two root causes independently. The `anthill feedback` path built in v1.3.0 is what made
that convergence visible — the instrument worked.

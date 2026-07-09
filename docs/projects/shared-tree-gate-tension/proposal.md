# Shared-tree gate tension — the whole-tree pre-commit gate vs. a shared working tree

**Status:** Partially shipped — moves **A** + **B1** landed on `develop` (2026-07-08); move **C** deferred
**Created:** 2026-07-08
**Author:** Cole + lead (triaged from field feedback)

---

## Overview

A convened anthill team runs multiple seats against **one shared working tree**. But the
house commit gate (`bun run check` → `biome check .` + the full suite, run by the Husky
pre-commit hook) is a **whole-tree** gate: it scans untracked files and runs the entire
project's checks on every commit, regardless of which seat is committing or what they
touched. On a shared tree that turns any one seat's transient state — a deliberately-red
slice held for an atomic land, or a verify seat's throwaway scratch artifacts — into a
**hard block on every other seat's commit**.

Two field-reported issues are the same root cause wearing different clothes, and both
**froze a live dream-flute dogfood session**. This project decides how anthill's shared-tree
model and the commit gate should coexist.

## Problem Statement

The pre-commit gate assumes the isolation of a single-developer working tree. A convened
team breaks that assumption:

- **[#14](https://github.com/ichabodcole/anthill/issues/14) — red-tree finalize deadlock.**
  When a slice is deliberately held red (staged for an atomic land), the pre-commit hook
  runs the full suite and **fails every seat-doc self-commit** — so the finalize ritual,
  where each seat commits its own living doc, deadlocks. A worked-around resolution already
  exists (see below), but it isn't in the skill.
- **[#16](https://github.com/ichabodcole/anthill/issues/16) — verify-scratch trips the gate.**
  A verify seat's seed/mint/screenshot artifacts (and any stray unformatted throwaway file)
  are **untracked**, and `biome check .` scans untracked files — so a single throwaway mint
  froze **all** lands for the whole team that session.

Common root: **the gate sees the whole tree, but a seat only owns part of it.** One seat's
mess is everyone's block.

## Proposed Solution

**Design commitment:** anthill keeps the **shared single working tree** — one tree, N seats.
Per-seat worktrees (former option B2) are rejected as too heavy-handed; the goal is to make the
shared tree _efficient and ergonomic_ for parallel agents, not to isolate them apart. Every
move below serves that commitment.

Three complementary moves — an interim procedure that's ready now, a structural gate fix, and
the signal that makes the shared tree legible to the agent about to commit.

### A. Red-tree finalize mode (interim, ready — closes #14)

Fold the already-proven workaround into the **finalize-session** skill:

1. Preserve any deliberately-red work as a patch (`git diff` → stash/patch file).
2. Restore the tree to `HEAD` so the gate is green.
3. The **lead lands all seat docs in one atomic commit** (seats surface their doc content;
   the lead commits) rather than each seat self-committing against a red tree.
4. Re-apply the preserved patch afterward.

This is a skill/ritual edit only — no CLI change — and unblocks finalize immediately.

**✅ Shipped** in `plugin/skills/finalize-session/SKILL.md` as a conditional _Red tree?_ branch under
the step-6 doc-land checklist — taken only when a red slice is detected, **not** the default finalize
path (resolves the open question below). Closes #14.

### B. Sanctioned harness scratch + gate scoping (structural — closes #16)

**Chosen: B1 — a gitignored, gate-excluded scratch dir.** Sanction e.g. `.anthill/scratch/`
(already gitignored) as the home for all verify/harness artifacts, and ensure the gate
**excludes untracked/ignored paths** (`biome check` on staged/tracked files only, not `.`).
Low cost, keeps the single-tree model the team already reasons about, and extends the same
principle `anthill commit` already enforces at the index — _a seat owns its slice, not the
tree_ — from the commit to the gate.

_(The rejected alternative — an isolated per-seat worktree for verify — is recorded under the
design commitment above: it isolates rather than makes the shared tree ergonomic.)_

**✅ Shipped:** `tsconfig.json` now `exclude`s `.anthill/scratch` (tsc scanned it by default, so a stray
scratch `.ts` failed the whole-tree gate); `biome.json` gains `vcs.useIgnoreFile` (skip gitignored
paths); and the **join** skill documents `.anthill/scratch/` as the gate-safe home for _all_ throwaway
artifacts (verify mints, screenshots, seeds), not just seat notes. Verified: a genuinely broken `.ts`
(TS2322) + malformed `.json` planted in scratch leave `bun run check` green. Addresses the #16 mechanism;
see the close-out note on #16 for why C is still wanted.

### C. Commit pre-flight — the shared tree made legible at the moment of the land

**⏳ Deferred** (not in the A+B1 batch): the open question below — _what is the cheap pre-flight proxy_
— is genuinely unresolved, so building it now risks either re-running the full suite (just moving the
cost earlier) or shipping a proxy we haven't validated. A + B1 remove the two hard freezes; C is the
ergonomic polish and can wait for the proxy question to settle.

The pull-shaped signal an agent actually acts on (see the
[signal-hunger investigation](../../investigations/2026-07-08-agent-signal-hunger.md)):
before `anthill commit` takes the serialize lock, it **checks whether the tree can pass the
gate right now**, and if not, reports _why_ and _who_ instead of attempting a doomed land —
e.g. _"tree is red, held by prism (a slice for atomic land); did not attempt your commit."_

This is deliberately a **pull** (a check at the one decision point where it's actionable), not
a push stream — so it can't become noise, and it needs no new event surface. It turns the
current failure mode (90s lock-wait → full-suite run → cryptic failure → "did _I_ break this?")
into an immediate, legible answer. The investigation found this is the single highest-value
"signal" for a builder, and that delivering it _as tooling_ beats broadcasting it.

## Scope

**In Scope (MVP):**

- A. Red-tree finalize mode baked into the finalize-session skill (interim, unblocks #14).
- B1. Sanctioned gitignored scratch dir + gate scoped to tracked/staged files (#16), so the
  gate stops failing a seat's commit for **another** seat's untracked state.
- C. Commit pre-flight in `anthill commit` — the pull-signal that reports tree state at land
  time instead of failing opaquely.

**Out of Scope:**

- Per-seat worktrees (rejected — see the design commitment). anthill stays single-tree.
- A new grapevine-shaped _event surface_ for orchestration signals — deferred to the
  signal-hunger investigation, which validates in situ whether any push-signal earns its keep.
- Rewriting the gate itself or moving off `bun run check` as the house gate; per-seat CI.

**Future Considerations:**

- If the signal-hunger investigation surfaces real, unmet _push_-shaped demand (mostly
  lead-oriented), a follow-up project designs how those events are carried (grapevine channel
  vs. a genuine new spell).

## Technical Approach

- **A** lives entirely in `plugin/skills/finalize-session/SKILL.md` — a new "red tree?" branch in
  the closing steps (patch-and-restore → lead-lands-docs → re-apply).
- **B1** touches the gate definition: scope Biome to staged/tracked files (e.g. lint-staged
  already stages a subset — ensure the whole-tree `biome check .` isn't what the hook runs,
  or add an ignore for the scratch dir) and document the scratch convention in the convene
  skill + `.anthill/README.md` SOP.
- **C** lives in `plugin/scripts/anthill/commands/team-commit.ts` — a pre-lock check that runs
  the gate (or a cheap proxy for it) against the current tree, reads the serialize-lock holder,
  and returns a structured "not safe to land + why/who" result _before_ acquiring the lock.
  Reuses the lock-inspection this command already does; a natural sibling of its existing
  explicit-paths index verification.

Key dependency: the existing Husky + lint-staged pre-commit setup and `bun run check`; the
`anthill commit` serialize lock + `--git-common-dir` resolution already in `team-commit.ts`.

## Impact & Risks

**Benefits:** removes the two highest-severity session-freezers found in the field; makes the
shared-tree model actually safe for parallel seats.

**Risks:** scoping the gate too narrowly could let unformatted tracked code slip through —
mitigate by keeping the gate strict on _tracked_ files and only excluding _ignored scratch_.
The pre-flight (C) must be _cheap_ — if it re-runs the full suite it just moves the cost
earlier; it needs a fast proxy (e.g. lock-holder + a red-marker) or an explicit opt-in.

**Complexity:** Low (A) / Medium (B1) / Medium (C).

## Open Questions

- [x] Does scoping Biome to tracked files weaken the gate in any case we care about? **Resolved:** B1
      shipped as `vcs.useIgnoreFile` (skip _gitignored_ paths) + a tsconfig `exclude` for scratch —
      tracked code is still fully linted/typechecked, so the gate isn't weakened; only ignored
      throwaways are skipped.
- [x] Should red-tree finalize (A) also become the _default_ finalize path, or only a branch
      taken when a red slice is detected? **Resolved:** conditional branch only — no patch/restore
      overhead on the common green-tree finalize.
- [ ] What is the _cheap_ pre-flight proxy for "tree can't pass right now" (C) — a lightweight
      red-marker a holder sets, vs. actually running the gate? (Ties to how a held red slice is
      represented in the first place.)

## Success Criteria

- A verify seat's throwaway artifact never blocks another seat's commit.
- A deliberately-red held slice never deadlocks the finalize ritual.
- A blocked land tells the agent _why/who_ at land time, not via an opaque suite failure.
- Re-run the dream-flute dogfood scenario without either freeze.

---

**Related Documents:**

- Field feedback: anthill issues [#14](https://github.com/ichabodcole/anthill/issues/14),
  [#16](https://github.com/ichabodcole/anthill/issues/16) (filed via `anthill feedback`).
- Sibling finalize friction: [#15](https://github.com/ichabodcole/anthill/issues/15)
  (board-fallback — tracked as a backlog item).
- Premise for move C + the deferred event surface:
  [signal-hunger investigation](../../investigations/2026-07-08-agent-signal-hunger.md).

---

## Notes

Triaged 2026-07-08 from a batch of five `anthill-feedback` issues generated by a dream-flute
dogfood session (v1.3.1). #14 and #16 were grouped here because they share one root cause;
#13 and #15 were routed to backlog + spellbook upstreams separately.

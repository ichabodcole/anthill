---
name: plan
description: Author a multi-seat dev plan the team way — the lead scaffolds a thin plan SKELETON (integration order + the cross-seam interface contracts, as claims), each owning seat ratifies or falsifies the seams it touches, then each owner authors its own lane and builds against the ratified contracts. Use when moving from an approved proposal/design into implementation on a feature that SPANS MULTIPLE SEATS — "plan this feature for the team", "scaffold the plan", "skeleton then ratify", "get the seats to agree the seams before we build". The lead runs it. Solo work skips it (one agent just plans and builds). Requires a `.anthill/config.json`.
---

# anthill: Plan (scaffold the skeleton, host the ratify)

The **plan phase** between an approved design and build, for a feature that **spans multiple
seats**. The **lead** runs this: scaffold a thin plan **skeleton** — the integration order and the
cross-seam interface contracts, written as _claims_ — then have each **owner ratify or falsify the
seams it touches**, author its own lane, and build against the ratified contracts. The value is
**seam-surfacing**: a single author is most often wrong exactly at the seams between owners, and the
owners catch it before merge. North star: **don't dictate the interface — host it, and capture the
ratified version.**

The complete method (the plan structure, the lane-authoring craft, the ratify mechanics) lives once
in **[`methodology.md`](./methodology.md)** beside this skill — it is **self-contained** (no other
plugin needed). Read it; this skill is the operational beats, not a restatement.

> **Scope — multi-seat only.** For **solo work**, there's no seam to ratify and no lane to divide —
> just plan and build your change. This phase is the multi-owner case.

> **The anthill CLI** — driven from the plugin (nothing to install in the target repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`**
> below (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a
> plugin skill runs.) Every command reads `.anthill/config.json` (the root marker; walk up from
> cwd). No config yet? Run **`anthill:bootstrap`** first.

## Steps

1. **Confirm it's a plan-phase job.** You are (or are becoming) the **lead**, the design is settled
   in a proposal, and the work **spans multiple seats**. If it's solo, just plan and build. If the
   design isn't settled, settle it first (one pen — the lead writes the proposal).

2. **Scaffold the SKELETON (solo — no seats needed yet).** Write `plan.md` as a **hypothesis**, not
   blanks — thin, the map not the turn-by-turn. Its sections (adapt, don't pad; full detail in
   `methodology.md`):
   - **How this plan is authored** — the ownership split (you own the skeleton + seams + gate; each
     owner owns its lane file).
   - **Integration / dependency order** — the sequence the slices come together in.
   - **Shared interfaces — _ratify on the vine, then fill_** — one subsection per cross-seam
     contract, each `(CLAIM — awaiting <owner>)`, with the concrete interface (signature, units,
     invariants) an owner can falsify.
   - **Slices** — one paragraph of scope per seat, each pointing at its `plan/<seat>.md` lane file.
   - **Verification gate**, **Ratified decisions & edge cases**, **Open questions**.
   - **Assert what's ABSENT** — the mirrors that _don't_ exist ("no gate / no migration here").

   The skeleton can be drafted **before convene**. (Light feature? Collapse the lanes into one
   `plan.md` ending in an owner↔consumer seat-RATIFY table instead of separate lane files.)

3. **Get the team present.** Ratification needs the owners. If you haven't convened, run
   **`anthill:convene`** now. Convene does **not** require the skeleton to pre-exist — point the
   seats at it when it does, proceed without when it doesn't.

4. **Host the ratify — the mandatory gate.** Each owner **ratifies or falsifies each seam it touches
   _before_ it moves its card `todo→doing`** — an explicit acknowledgement (_"ratified"_ /
   _"falsified — here's the correction"_), never silence. Flip each seam's marker to `RATIFIED` as it
   settles. Two paths (mirror `convene`/`join`):
   - **Terminal seats:** post the skeleton on the vine; owners ratify/falsify over the vine.
   - **Subagent seats:** no tails — **dispatch each seat to ratify its seams** and **collect the
     verdicts** yourself.

5. **Rule once on what's contested.** When owners disagree, do a **read-all-owners synthesis pass** —
   read every affected position, then **rule once**. Don't let the vine ping-pong. Then **promote
   each ratified load-bearing contract into `.anthill/dev/seams.md`** (its durable home), owned by
   the authoritative seat — asserting the load-bearing ones up front while the long tail accretes.

6. **Owners author lanes; build in lockstep.** Each owner writes its `plan/<seat>.md` against the
   **ratified** seams (the lane-authoring craft is in `methodology.md` — grounded paths, right-sized
   TDD tasks, no placeholders, self-review against the seams), then builds. Orchestrate per the SOP
   (vine = substance, board = state, file-scoped atomic land); at wrap, run
   **`anthill:finalize-session`**. Verify → land → finalize are unchanged.

## Output

A ratified plan: a thin lead-authored skeleton, each owner's touched seams falsified-or-ratified
before building, load-bearing contracts promoted into `seams.md`, per-owner lanes authored against
them — the slices set to fit at integration.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot
it to your scratch and raise it at `anthill:finalize-session` (or flag the human). These skills
improve by use.

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a seam you assumed rather than had ratified, a lane you drew without the owner's look —
feel like it might not always hold? Smooth runs suppress exactly that signal; name it anyway.

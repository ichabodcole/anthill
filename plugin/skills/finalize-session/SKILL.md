---
name: finalize-session
description: The end-of-session KNOWLEDGE ritual for the project's agent team — each seat synthesizes what it learned into its own living doc, a shared pass over seams.md captures team-level truth, a structure reflection asks whether the team shape still fits, and the lead lands the doc commits and tears the session down. Use at session wrap when the human says "finalize the team session", "wind down the team", "wrap up the team", or work is ending. DISTINCT from landing the code — this captures the team's knowledge so it isn't lost.
---

# anthill: Finalize Session (the knowledge ritual)

The END touchpoint. It captures what the team **learned** this session so the knowledge isn't lost when
the terminals close — distinct from landing the _code_. This is what makes the living docs actually
_live_. Don't skip it on a real session.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin
> skill runs.) Doc paths below show the **defaults** (`.anthill/…`); the real locations resolve from
> `.anthill/config.json` (`paths.teamDir` / `paths.seatDir` / `paths.seams`).

## Steps

### Kickoff — the lead triggers the ritual

0. **Broadcast the start on the vine.** The seats are in **separate panes** — nothing makes them
   synthesize unless told. The lead posts on the channel: _"Finalizing — every seat run your
   `anthill:finalize-session` synthesis (steps 1–2) now and confirm on the vine when your seat doc is
   landed."_ Then the lead **gathers confirmations** and does not proceed to land + teardown (step 6)
   until **every present seat has confirmed** — knowledge capture is the whole point, and a torn-down
   pane can't synthesize.

   **Subagent-mode finalize (bake the capture into the task, don't chase it after).** A one-shot
   `Task`/`Agent` subagent isn't on the vine waiting to be told to finalize. You _can_ resume it
   (retain its id, `SendMessage` it back with context) — but that means holding every seat's id and
   firing a second round at teardown, and a resumed agent may not outlive the session. Far simpler and
   warmer: **the seat self-captures as the FINAL step of its own work task**, while its context is
   freshest (bake this into the dispatch brief — see `anthill:convene`). That final step:
   - **Writes durable lessons into its own seat doc** (`dev/<handle>.md`) directly — seat docs are
     per-handle, so parallel seats never collide there.
   - **Returns** (does not write) any `seams.md` boundary-truth candidate + a short synthesis summary —
     `seams.md` is shared/single-owner, so the **lead** single-sources it from the returns.
   - **Does not commit** — the lead lands the seat-doc changes atomically with the rest.

   The lead's residual finalize then shrinks to what is inherently whole-session: the `seams.md` pass
   (step 3), the structure reflection (step 4), the anthill-upstream feedback aggregation (step 5), and
   **folding in late, verification-driven lessons** a seat couldn't have known when it finished — **the lead attributes these into the seat's doc
   directly** (robust; the subagent has already returned), or `SendMessage`s the seat to append in its
   own voice _only if it's still resumable_. Then land + teardown.

### Per seat — each agent does this for its own doc

1. **Review your session — two passes:**
   - **Reactive:** the work you did + the ah-ha judgments in your scratch (`.anthill/scratch/<handle>/…`)
     — what bit, what surprised you, what you'd do differently.
   - **Reflective:** even if the session ran _smoothly_, did anything you trusted **by default** — a
     contract, a default, an assumption this seat never questioned — turn out to be load-bearing in a way
     worth naming? Smooth runs hide exactly these, and a quiet assumption that held is often the most
     durable lesson. (Reactive catches friction; reflective catches assumptions — both become seat-doc
     scars below.)
2. **Synthesize → your seat doc** (`.anthill/dev/<handle>.md`) — this is curation as pheromone:
   **strengthen the load-bearing trails, let the unimportant ones fade.**
   - **Route, don't re-sort** (the SOP's _one intake, route at synthesis_ rule). Your scratch was one
     cheap intake — synthesis is where each note finds its durable home: your seat doc (taste),
     `seams.md` (a boundary truth), or `paper-cuts.md` (tooling friction).
   - Promote durable **judgments** (the reasoning + the generalizable lesson — not lesson-less events).
   - **Prune / compact** — keep it lean; shed stale lines (split to a `<handle>/` folder only if it
     genuinely earns it).
   - **Pin** each lesson to a green test where you can; to a durable concept or a commit otherwise;
     never to a transient line/file reference.
   - If a lesson is really **shared truth** (about a boundary between seats), it belongs in `seams.md`
     (next), not your seat doc.
   - Your scratch is **disposable after synthesis** — the durable form is the seat doc.

### Shared — the lead coordinates over the vine

3. **Seams pass.** As a team, look at `.anthill/dev/seams.md`: did we learn anything at the **team
   level** — a contract that shifted, a boundary that moved? If so, update it **single-source** (the
   owning seat edits; the others point). Don't restate it across seat docs.

4. **Structure reflection** — turn the lens on the team itself (the anthill adapts to the work):
   - **Where did we step on each other?** (overlapping scope → a boundary to draw or a seat to split.)
   - **What were the natural seams?** (the contracts that actually emerged vs. the ones we guessed.)
   - **Who actually owned what?** (vs. the roster on paper.)
   - **Did the composition fit?** (headcount — an idle seat, an overloaded one, a missing lens.)
   - **Did any seat's real work diverge from its stated scope?** (the deeper question — not headcount
     but **shape**: work that drifted across a boundary, a scope now too broad or too narrow, a role
     that's no longer the right cut. **Split / merge / redraw the scope, or reshape the role** — knock
     down the corridor and re-form the walls. Capture the proposed `seats[]` edit + the _why_; this is
     the pheromone signal the next convene acts on.)

   Output flows to seat docs, `seams.md`, and **occasionally the roster/`.anthill/config.json` itself**. If
   you reshape the roster, **re-run `anthill init`** to render any new seat docs (existing are never
   clobbered) and update the `dev/README.md` roster row by hand.

5. **Aggregate the team's anthill-upstream feedback.** Beside the seams pass, do the same single-source
   move for the feedback candidates the team surfaced this session about **anthill itself** (not this
   project). Read the **same intake** you already swept — the vine, the seats' scratch, their finalize
   returns (no separate store). **Dedupe** them (N seats hitting one bug is one issue, not N) and
   **submit** the deduped set with `anthill feedback "…" --submit` — the outward send the lead owns,
   mirroring how you single-source `seams.md` from the returns. _(Distinct from this ritual's own
   feedback pointer below: that captures feedback about the finalize ritual; this aggregates the team's
   feedback about anthill.)_

### Land + close — the lead

6. **Stand the team down — the closing checklist.** End-of-session "we're done" momentum is exactly
   when these get skipped, so run them as a list, in order:
   - ◻ **Every seat confirmed** its finalize on the vine (step 0). Knowledge capture is the whole
     point; a torn-down pane can't synthesize. _(Subagent mode: the seats' returned in-task syntheses
     **are** the confirmation — no vine gate; the seat docs are already written.)_
   - ◻ **Doc updates landed** as a **file-scoped** commit: **`anthill commit -m "<msg>" <paths…>`**
     (never `git add -A`).
     - **Red tree? (a slice deliberately held red for an atomic land.)** The pre-commit gate runs the
       **whole** suite on every commit, so a held-red tree fails each seat-doc commit and **deadlocks
       this step** — the docs can't land while the code is red. Don't fight the gate; clear the red,
       land the docs green, then restore it:
       1. **Preserve** the held slice. If the holder knows its paths, `git stash push -u -- <red-paths>`
          is cleanest — the doc edits stay in the tree, and `-u` catches any brand-new untracked files
          in the slice. Otherwise snapshot the whole diff — **including staged changes** (`git diff HEAD`,
          not a bare `git diff`, which omits what's already staged) — to a patch under the (gitignored)
          scratch dir first: `git diff HEAD > .anthill/scratch/<session>-held.patch`.
       2. **Green the tree.** With the red slice stashed, only the doc edits remain (markdown → the gate
          passes). If you patched-and-restored instead, restore to `HEAD` and have the seats re-surface
          their doc content to the lead.
       3. **Land all seat docs in ONE atomic commit** — the lead commits every seat's doc together
          (`anthill commit -m "…" <doc-paths…>`), not each seat self-committing against a red tree.
       4. **Re-apply** the held slice — `git stash pop` (or `git apply <patch>`) — so the atomic code
          land proceeds as planned.
   - ◻ **Board settled — best-effort, never a gate** (cards → review/done). If the board idle-died or is
     unreachable, **don't block finalize on it**: the **git history and the grapevine ARE the session's
     durable record**. Attempt a settle once; if the board's gone, note it on the vine and move on.
   - ◻ **Human sign-off before the code branch merges to `develop`.** Green tests and a checked-off
     board are the team's _own_ signals — but the human's look (UI bugs, the feel, feedback) is a gate
     the team **cannot run itself**. Get an explicit "yes, merge it" before you land the feature branch
     to `develop`; the knowledge ritual above is separate from and precedes this code merge. Don't let
     momentum merge it unseen.
   - ◻ **Tear down:** **`anthill down`** — the session is named after the **channel**
     (`config.channel`) by default, so it resolves with no arguments. It **refuses to kill while seats
     are still present on the vine** (pass `--force` to override) — that presence guard is your backstop
     against yanking a seat out mid-ritual. (If you spawned with a custom `--session <name>`, pass the
     same here.)

## Output

Every seat doc reflects what its agent learned; `seams.md` reflects any team-level truth; the structure
reflection has had its say; the session's knowledge is captured in the anthill, not lost when the
terminals close.

## Skill feedback

If this ritual was rough — a step unclear, friction in the synthesis or the seams pass — capture it (a
scratch note, or flag the lead / the human) so the next revision fixes it. The rituals improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a step's assumption, a default this ritual left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

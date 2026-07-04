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

0. **Broadcast the start on the vine.** The seats are in **separate panes** (or subagents) — nothing
   makes them synthesize unless told. The lead posts on the channel: _"Finalizing — every seat run your
   `anthill:finalize-session` synthesis (steps 1–2) now and confirm on the vine when your seat doc is
   landed."_ Then the lead **gathers confirmations** and does not proceed to land + teardown (step 5)
   until **every present seat has confirmed** — knowledge capture is the whole point, and a torn-down
   pane can't synthesize. (In subagent mode, the lead invokes each seat's synthesis directly instead of
   broadcasting.)

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

### Land + close — the lead

5. **Stand the team down — the closing checklist.** End-of-session "we're done" momentum is exactly
   when these get skipped, so run them as a list, in order:
   - ◻ **Every seat confirmed** its finalize on the vine (step 0). Knowledge capture is the whole
     point; a torn-down pane can't synthesize.
   - ◻ **Doc updates landed** as a **file-scoped** commit: **`anthill commit -m "<msg>" <paths…>`**
     (never `git add -A`).
   - ◻ **Board settled** (cards → review/done).
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

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a step's assumption, a default this ritual left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

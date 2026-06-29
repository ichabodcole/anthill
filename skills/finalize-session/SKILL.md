---
name: finalize-session
description: The end-of-session KNOWLEDGE ritual for the project's agent team — each seat synthesizes what it learned into its own living doc, a shared pass over seams.md captures team-level truth, a structure reflection asks whether the team shape still fits, and the lead lands the doc commits and tears the session down. Use at session wrap when the human says "finalize the team session", "wind down the team", "wrap up the team", or work is ending. DISTINCT from landing the code — this captures the team's knowledge so it isn't lost.
---

# anthill: Finalize Session (the knowledge ritual)

The END touchpoint. It captures what the team **learned** this session so the knowledge isn't lost when
the terminals close — distinct from landing the _code_. This is what makes the living docs actually
_live_. Don't skip it on a real session.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below.

## Steps

### Per seat — each agent does this for its own doc

1. **Review your session** — the work you did + the ah-ha judgments you captured in your scratch
   (`.team/scratch/<handle>/…`).
2. **Synthesize → your seat doc** (`docs/team/dev/<handle>.md`) — this is curation as pheromone:
   **strengthen the load-bearing trails, let the unimportant ones fade.**
   - Promote durable **judgments** (the reasoning + the generalizable lesson — not lesson-less events).
   - **Prune / compact** — keep it lean; shed stale lines (split to a `<handle>/` folder only if it
     genuinely earns it).
   - **Pin** each lesson to a green test where you can; to a durable concept or a commit otherwise;
     never to a transient line/file reference.
   - If a lesson is really **shared truth** (about a boundary between seats), it belongs in `seams.md`
     (next), not your seat doc.
   - Your scratch is **disposable after synthesis** — the durable form is the seat doc.

### Shared — the lead coordinates over the vine

3. **Seams pass.** As a team, look at `docs/team/dev/seams.md`: did we learn anything at the **team
   level** — a contract that shifted, a boundary that moved? If so, update it **single-source** (the
   owning seat edits; the others point). Don't restate it across seat docs.

4. **Structure reflection** — turn the lens on the team itself (the anthill adapts to the work):
   - **Where did we step on each other?** (overlapping scope → a boundary to draw or a seat to split.)
   - **What were the natural seams?** (the contracts that actually emerged vs. the ones we guessed.)
   - **Who actually owned what?** (vs. the roster on paper.)
   - **Did the composition fit?** (an idle seat, an overloaded one, a missing lens.)
   Output flows to seat docs, `seams.md`, and **occasionally the roster/`.team/config.json` itself**. If
   you reshape the roster, **re-run `anthill init`** to render any new seat docs (existing are never
   clobbered) and update the `dev/README.md` roster row by hand.

### Land + close — the lead

5. **Land** the doc updates as a **file-scoped** commit: **`anthill commit -m "<msg>" <paths…>`** (never
   `git add -A`). Settle the board (cards → review/done). Then, **only after every seat has
   finalized**, tear the session down: **`anthill down`** — it resolves the session by name and
   **refuses to kill while seats are still present on the vine** (pass `--force` to override). That
   presence guard is your backstop against yanking a seat out mid-ritual. (If you spawned with a custom
   `--session <name>`, pass the same here. Any code branch is landed separately.)

## Output

Every seat doc reflects what its agent learned; `seams.md` reflects any team-level truth; the structure
reflection has had its say; the session's knowledge is captured in the anthill, not lost when the
terminals close.

## Skill feedback

If this ritual was rough — a step unclear, friction in the synthesis or the seams pass — capture it (a
scratch note, or flag the lead / the human) so the next revision fixes it. The rituals improve by use.

---
name: finalize-session
description: The end-of-session touch point for the project's agent team — each seat CLOSES its session report and lands it; the lead closes the lead report with the Carry-forward the next convene reads, then tears the session down in the one order the teardown guard accepts. Nobody edits a seat doc, seams.md, principles.md or the wiki here — those are curated later, from the reports, by anthill:curate. HOW this team closes a report and what else it does at the end of a session is on the team's wiki finalize page, not here. Use at session wrap when the human says "finalize the team session", "wind down the team", "wrap up the team", or work is ending. DISTINCT from landing the code.
---

# anthill: Finalize Session (close the reports, tear down)

The END touch point. **This skill is the trigger and the invariants the tooling checks. The method is
this team's, on `<teamDir>/wiki/touchpoints/finalize.md`** — read that page before you run the steps
below; where it and this skill differ on _how_, the page wins. What is here is only what the CLI
emits, refuses, or reads, and what another skill depends on.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). `<teamDir>` / `<seatDir>` are RESOLVED from `.anthill/config.json`
> (defaults `.anthill/`, `.anthill/dev/`); `anthill join <handle>` prints them, and prints your report's
> path as `report`.

## Steps

### The lead triggers it

0. **Announce it on the wire the seats are on, and gather confirmations.** Do not proceed to
   teardown (step 6) until every present seat has confirmed its report is landed — `anthill down`
   will refuse while they are present anyway, and a torn-down pane cannot close a report.

   **Subagent mode.** A one-shot `Task`/`Agent` seat is not on comms waiting to be told, so
   `anthill:convene` bakes the close into its brief: the seat writes and closes its report as the
   **final step of its task**, **returns** without committing, and touches no curated doc. **The lead
   lands the report on its behalf.**

### Per seat

1. **Close your report** — the file `anthill join` named as `report`
   (`<teamDir>/reports/<date>/<handle>.md`). What the close asks and how this team wants it answered
   is on the wiki finalize page.
   - **⚠ Do not edit your seat doc, `seams.md`, `principles.md`, or the wiki.** `anthill commit`
     refuses them on an attributed commit without `--curated`. If one read wrong this session, say so
     in the report — that is what curation reads.

2. **Land your own report** — with the land command your own `anthill join` emitted (gate and commit
   in one, message from a file, `--as` stamping the seat trailer). Never `git add -A`, never an inline
   `-m` for a body carrying backticks. **If the gate is red for a reason that is not yours, tell the
   lead rather than forcing it.**

3. **Stand down — LAST.** `anthill comms stand-down --as <handle>`, after the report is landed and
   after anything else you have to say. **A departure only exists if the verb ran** — it writes the
   record the teardown guard reads. A seat that has stood down may still send; a late message is
   normal.

### The lead

4. **Close the lead report** — same shape as every seat's, plus a section titled **Carry-forward**:
   what the next session must test, decide, or not do. **`anthill:convene` reads that section by
   name**; what goes in it is the page's.

5. **Do what this team does at the end of a session** — the wiki finalize page names it (anthill's
   seed suggests a docs-of-record sweep and placing every deferred item). Then **submit the team's
   anthill-upstream feedback**: `anthill feedback "…" --submit`, the outward send the lead owns.

6. **Tear down — the invariants, in order:**
   - ◻ Every present seat confirmed its report is landed (step 0).
   - ◻ **Nothing curated changed this session** — `git diff --name-only <session base>.. --
<seatDir>/<handle>.md… <seams.md> <teamDir>/principles.md <teamDir>/wiki` is empty (the seat docs by
     name, not the whole `<seatDir>`: the roster `README.md` there is the lead's to edit), except a seam
     the lead landed with `--curated`. Non-empty is a finding for the lead report, not something to fix
     now.
   - ◻ The lead report is landed, Carry-forward included.
   - ◻ **The code merge is a separate ritual and this one does not perform it** — the project's own
     branch-completion procedure, from its grounding docs or skills. Do not hard-code one here.
   - ◻ **`anthill down`.** It refuses while seats are **present** and while presence **cannot be
     established**. **The order is: seats stand down → YOU stand down (`anthill comms stand-down
--as <lead>`) → `anthill down` → panes die.** Your own `comms follow` is the last one running, so
     the guard refuses you by name until you have stood down; once you have, teardown is authorised
     with your follow still alive. **`--force` asserts that a seat which never said it left is safe
     to kill** — read who the refusal names, and prefer standing the seat down.

## Output

One closed, landed report per seat; the lead report with Carry-forward; nothing curated touched; the
session down. The knowledge is in the reports, where `anthill:curate` will read it.

## Skill feedback

A rough step here is a wiki-page edit at curation — put it in your report. Something about
**anthill itself** — a bug, a rough edge, an idea — → `anthill feedback` (on a team, surface it to
the lead).

---
name: finalize-session
description: The end-of-session touch point for the project's agent team — each seat CLOSES its session report (what it hit · what worked · what it would change) and lands it; the lead closes the lead report with the carry-forward the next convene reads, sweeps the docs of record, places every deferred item, and tears the session down. Nobody edits a seat doc, seams.md, principles.md or the wiki here — those are curated later, from the reports, by anthill:curate. Use at session wrap when the human says "finalize the team session", "wind down the team", "wrap up the team", or work is ending. DISTINCT from landing the code.
---

# anthill: Finalize Session (close the reports, tear down)

The END touch point. It gets every seat's **session report** closed and landed before the terminals
close, and it gets the session torn down in the one order the teardown guard accepts. **It does not
synthesise anything into a durable doc.** That was the old ritual, and measured across two teams it
produced thousand-line seat docs nobody re-applied; the report is the outlet now, and
**`anthill:curate`** — later, outside the session, with the human — decides what becomes a doc, a
skill, or a tool.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin
> skill runs.) **`<teamDir>` and `<seatDir>` below are RESOLVED, not literal**: they come from `paths`
> in `.anthill/config.json` and default to `.anthill/` and `.anthill/dev/`. `anthill join <handle>`
> prints them already resolved, and prints your report's path as `report`.

> **This skill is the trigger. The method is this team's.** How this team closes a report, what its
> docs-of-record sweep covers, and what it carries forward live in
> **`<teamDir>/wiki/touchpoints/finalize.md`** — a page anthill seeded with suggestions and the team
> rewrites at curation. Read it before you run the steps below; where it and this skill differ on
> _how_, the page wins. Where they differ on _what must happen_ — a report closed, nothing curated
> touched, the stand-down order — this skill wins, because those are what the tooling checks.

## Steps

### Kickoff — the lead triggers it

0. **Broadcast the start on the wires this session actually armed.** The seats are in separate
   panes — nothing makes them close a report unless told. Post: _"Finalizing — every seat close your
   report (steps 1–2) and confirm when it is landed."_ Gather confirmations; do not proceed to
   teardown (step 6) until every present seat has confirmed. A torn-down pane cannot close a report.
   - **Broadcast where the seats are.** A session may run on one wire and leave another
     open-but-unsubscribed; a broadcast on a wire nobody tails is indistinguishable from none, and the
     ritual stalls at its first beat with no error anywhere. If you are not certain where they are, ask
     before you announce.

   **Subagent mode — bake the close into the task.** A one-shot `Task`/`Agent` seat is not on comms
   waiting to be told. Make **closing its report the final step of its own task**, in the dispatch
   brief (see `anthill:convene`). It writes its report and **returns** — it does not commit (it may
   not outlive the session) and it does not touch a curated doc. **The lead lands the report on its
   behalf** with the land command, and folds any late, verification-driven finding into the seat's
   report under a dated line attributed to the lead.

### Per seat

1. **Close your report** — `<teamDir>/reports/<date>/<handle>.md`, the file the join manifest named
   as `report`. You have been writing into it as things happened; now answer the three close prompts
   at the bottom, in prose, as long as they need to be. The prompts and their intent are in
   `<teamDir>/reports/README.md`; how this team wants them answered is on the wiki finalize page.
   - **What did you hit?** Everything that cost time, surprised you, or went wrong — fixed or not.
   - **What worked?** What you would do again. The half every retro under-reports.
   - **What would you change?** About your seat doc, a seam, a principle, a wiki page, or the team's
     shape. **Proposals, not edits.** One thing for your successor goes here too — it is interesting,
     and curation decides whether it is load-bearing.
   - **Write for a curator who was not here.** Name the project's tools, docs and teammates freely;
     make the event survive without you — what you did, what happened, what it cost. Do not compress,
     do not classify, do not decide whether it counts.
   - **⚠ Do not edit your seat doc, `seams.md`, `principles.md`, or the wiki.** `anthill commit`
     refuses them on an attributed commit, so the attempt fails loudly rather than silently — but the
     point is that you were never the right author: the agent that did the work is blind to what a
     stranger needs from it. If a curated doc read wrong to you this session, say so in the report.

2. **Land your own report** — with the land command your own `anthill join` emitted (gate and commit
   in one, message from a file, `--as` stamping the seat trailer). Never `git add -A`, never an inline
   `-m` for a body carrying backticks. Your report is a markdown file, so it lands green against any
   tree; **if the gate is red for another reason, tell the lead rather than forcing it.**

3. **Stand down — LAST.** `anthill comms stand-down --as <handle>`, after the report is landed and
   after anything else you have to say. **A departure only exists if the verb ran**: it writes the
   record the teardown guard reads, and "I stopped working" leaves none. A seat that has stood down
   may still send, deliberately — a late message is normal; never let a departure record talk you out
   of reading one.

### The lead — whole-session beats

4. **Close the lead report** — same file shape as every seat's, plus **Carry-forward**: what the next
   session must test, decide, or not do, each with what would prove it wrong. This is the one report
   the next `anthill:convene` reads. Two things belong here that used to have their own beats:
   - **Did the team's shape fit the work?** Toe-stepping, an idle or overloaded seat, a seam that
     would not hold. Name it as a carry-forward hypothesis; curation may turn it into a roster change.
   - **Did anything this session look like a principle?** Usually no. Say what you saw; do not write
     it into `principles.md` — that is curation's call, from the reports, with the scar attached.

4.5. **Sweep the docs of record.** The docs that claim something true of the tree and that nobody
owns — a plan of record, a roadmap, a proposal — go stale at the speed the work moves. **Name who
checks each one.** Write a dated reconciliation line into each doc, claim by claim, stamped with the
sha: `HELD` / `FALSIFIED <what> → <where it moved>` / `UNCHECKED`. **`UNCHECKED` is a real verdict
and must be written** — a claim silently skipped is indistinguishable from one confirmed. **The
project names the set, not anthill** — ask _which docs here claim something that must stay true of
the tree?_ and take the answer from the project's config or grounding docs. Archives, scars and
superseded records are out of scope; rewriting them destroys the record.

4.75. **Place every deferred item — a horizon and a home each, or say it is being dropped.** _"We'll
defer that"_ has no owner and no re-read moment, so it loses the item rather than postponing it.
**Horizon:** the next session, a named later one, or explicitly _not scheduled_. **Home:** a file
something re-reads — the roadmap, a backlog item, a project's plan. **Not a report.** Sweep the
session's reports and investigations here too; a recommendations section nobody pulls from is the
largest leak there is.

5. **Aggregate the team's anthill-upstream feedback.** Read the reports and the wire for candidates
   about **anthill itself** (not this project), dedupe (N seats hitting one bug is one issue), and
   submit the deduped set with `anthill feedback "…" --submit` — the outward send the lead owns.

### Land + close — the lead

6. **Stand the team down — the closing checklist**, in order:
   - ◻ **Every seat confirmed** its report is landed (step 0). _(Subagent mode: the returned reports
     are the confirmation; you land them.)_
   - ◻ **Nothing curated changed this session.** `git diff --name-only <session base>.. -- <seatDir>
<teamDir>/principles.md <teamDir>/wiki` is empty, except for a seam the lead landed at plan with
     `--curated`. If it is not empty, that is a finding for the lead report, not something to fix now.
   - ◻ **The lead report is closed and landed**, carry-forward included.
   - ◻ **The docs of record each carry this session's reconciliation line** (4.5).
   - ◻ **Every deferred item placed** (4.75).
   - ◻ **The lead landed anything CROSS-SEAT atomically** — a CLI change plus the doc describing it, a
     ratified seam plus the skill that points at it. Single-author files are not cross-seat work.
     - **Red tree?** (a slice deliberately held red for an atomic land.) The gate runs the whole suite
       on every commit, so reports cannot land while the code is red. Park the red slice **by path** —
       `git stash push -u -- <red-paths…>` — land the reports green, `git stash pop`. **Never bare
       `git stash push -u` on a shared tree**: it parks every seat's uncommitted work, `refs/stash` is
       shared even across worktrees, and `anthill commit`'s lock does not cover stash.
   - ◻ **Board settled — best-effort, never a gate.** If the board is gone, say so on comms and move
     on; the git history and the reports are the session's durable record. **The comms log surviving
     is not the comms log being a record** — nothing re-reads it and it does not survive a clone.
   - ◻ **Human sign-off before the code branch merges.** Green tests and a settled board are the
     team's own signals; the human's look is a gate the team cannot run.
   - ◻ **🔴 The code merge is a separate ritual and this one does not perform it.** Take the project's
     own branch-completion procedure from its grounding docs or skills; do not hard-code one here.
     Two traps no gate catches: `git merge -m "<subject>" -F <body>` concatenates with no blank line
     (use one file — subject, blank, body); and a **piped** gate (`bun test | tail`) reports `tail`'s
     exit status, always `0` — redirect to a file and read `$?`.
   - ◻ **Tear down: `anthill down`.** It refuses while seats are **present** and equally while presence
     **cannot be established** — _"I could not tell"_ is not _"nobody is there."_
     - **The order is: seats stand down → YOU stand down → `anthill down` → panes die.** The presence
       rows are built from `config.seats`, which contains the lead, and your own `comms follow` is the
       last one running — **so the guard will refuse you, by name, after every seat has correctly stood
       down, until you run `anthill comms stand-down --as <lead>` yourself.** Once you have, teardown
       is authorised with your follow still alive; there is nothing to kill first.
     - **`--force` at the end of a clean session is a signal, not a formality.** It asserts that a seat
       which never said it left is safe to kill, and the one session where that is wrong looks identical
       from here. Read who the refusal names; prefer standing the seat down. A crashed seat still blocks,
       and that is the point.

## Output

One closed, landed report per seat; the lead report with carry-forward; the docs of record
reconciled; deferred items placed; nothing curated touched; the session down. The knowledge is in
the reports, where `anthill:curate` will read it.

## Skill feedback

If this touch point was rough — a step unclear, a prompt that produced nothing useful, a beat the
team skipped every time — that is exactly what the wiki finalize page is for: put it in your report,
and curation rewrites the page. Something about **anthill itself** — a bug, a rough edge, an idea —
→ `anthill feedback` (on a team, surface it to the lead).

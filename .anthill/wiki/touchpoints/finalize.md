---
type: touchpoint
title: Finalize
description: Each seat closes its report, the lead closes the lead report with carry-forward and sweeps the docs of record, nothing curated changes, and the session comes down.
tags: [lifecycle, finalize]
related: [touchpoint/curate, touchpoint/work]
status: stable
generated: { by: claude-fable-5-1, at: 2026-09-05 }
---

# Finalize

`anthill <command>` here is shorthand, not a binary on your PATH. The real invocation is
`bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
set while a plugin skill is running. Take the resolved command from `anthill:join`.

## What this touch point is

Fires once per session, at the end, via `anthill:finalize-session`. Each seat runs its part. The
lead runs the whole-session part and tears down last.

What the skill holds and this page does not: the invariants the tooling checks. The report lands at
the path `anthill join` named. Nothing curated is edited (`anthill commit` refuses it). Each seat
stands down last. The lead report has a Carry-forward section, because `anthill:convene` reads it by
that name. The code merge is a separate ritual. `anthill down` and its order are the skill's.
Everything below is method, and it is this team's to change.

A page anthill seeded is `status: draft`. When this team rewrites it, set it `stable`.
`anthill:upgrade` refreshes draft pages from newer seeds and never touches a stable one.

## How this team does it

anthill's suggestions below run as is, plus the five report-writing rules under "Close your report".
The docs-of-record set for this repo is `docs/ROADMAP.md` and the active project's `plan.md`.

## anthill's suggestions

### Announce it where the seats are

Announce finalize on a wire the seats tail. A session may run on one wire and leave another
open-but-unsubscribed. A broadcast on a wire nobody tails is indistinguishable from none: every seat
stays silent, the lead reads that as "nobody has finalized", and the ritual stalls at its first beat
with no error anywhere. If you are not certain where the seats are, ask before you announce.

### Close your report — the three prompts

Three open prompts, answered in prose, as long as they need to be. They ask what happened. They do
not ask you to sort it. These are the canonical prompts. `reports/README.md` points here, so
rewriting them here rewrites them everywhere.

1. **What did you hit?** Everything that cost you time, surprised you, or went wrong, including
   things you fixed.
2. **What worked?** The move, tool, or sequence you would do again.
3. **What would you change, about your seat doc, a seam, a principle, this wiki, or the team's
   shape?** Write proposals, not edits. If you had one thing to tell your successor, say it here.

**Write for a curator who was not here.** Name the project's tools, docs and teammates freely: they
have them. Make the event survive without you: what you did, what happened, what it cost. Say what a
number meant, not what it was. Do not compress, do not classify, do not decide whether it "counts".

Five rules that make a report readable by a stranger:

1. **Quote, do not cite.** Quote a message, card or ruling you name: its first line, or the card
   title. None of them survives the session.
2. **Stamp the close.** Date, session, and the tree sha your last claim was measured at.
3. **Expand a house word** the first time it appears in the report. One parenthetical per word.
4. **Oldest first.** The report accretes during the session. Do not reorder it at the close.
5. **Label the layer.** Pane, wire, board or tree: one word per claim. They are four different
   classes of evidence, and only the tree survives a clone.

### The lead's report

The same three, plus **Carry-forward**: what the next session must test, decide, or not do, each with
what would prove it wrong. Keep it to what changes the next session's first hour. Two more
carry-forward items:

- **Did the team's shape fit the work?** Toe-stepping, an idle or overloaded seat, a seam that would
  not hold. Name it as a hypothesis. Curation may turn it into a roster change.
- **Did anything look like a principle?** Usually no. Say what you saw. Do not write it into
  `principles.md`. That is curation's call, made from the reports, with the scar attached.

### The docs-of-record sweep

The docs in scope are the ones that claim something true of the tree and that nobody owns: a plan of
record, a roadmap, a proposal. **The lead names who checks each one.** Write a dated reconciliation
line into each doc, claim by claim, stamped with the sha: `HELD` /
`FALSIFIED <what> → <where it moved>` / `UNCHECKED`. **`UNCHECKED` is a real verdict and must be
written.** A claim silently skipped is indistinguishable from one confirmed. Archives, scars and
superseded records are out of scope. Which docs are in the set is this project's answer, not
anthill's. Put the list in "How this team does it" above.

### Place every deferred item

"We'll defer that" has no owner and no re-read moment, so it loses the item rather than postponing
it. Give each deferred item a **horizon** (the next session, a named later one, or explicitly not
scheduled) and a **home**: a file something re-reads, such as the roadmap, a backlog item, or a
project's plan. A report is not a home. An item that can be given neither is being dropped. Say so.
Sweep the session's reports and investigations too.

### Upstream feedback — dedupe first

N seats hitting one anthill bug is one issue, not N. Read the reports and the wire for candidates
about anthill itself, not this project. Dedupe them. The lead submits the set.

### Landing when the tree is red, and landing cross-seat work

A report is markdown and lands green against any tree, unless the gate is red for another reason,
which on a shared tree usually means a slice deliberately held red for an atomic land. Park the red
slice by path: `git stash push -u -- <red-paths…>`, land the reports, `git stash pop`. Never run bare
`git stash push -u` on a shared tree. It parks every seat's uncommitted work, `refs/stash` is shared
even across worktrees, and `anthill commit`'s lock does not cover stash. The lead lands anything
cross-seat atomically: a CLI change plus the doc describing it, a ratified seam plus the skill that
points at it. A single-author file is not cross-seat work.

### The board, the human, and the merge

**Board settled is best-effort, never a gate.** If the board is gone, say so on comms and move on.
The git history and the reports are the session's durable record. The comms log surviving is not the
comms log being a record: nothing re-reads it and it does not survive a clone.

**Human sign-off before the code branch merges.** Green tests and a settled board are the team's own
signals. The human's look is a gate the team cannot run.

**Two merge traps no gate catches.** `git merge -m "<subject>" -F <body>` concatenates with no blank
line, so the whole first paragraph becomes the subject. Use one file: subject, blank, body. A piped
gate (`bun test | tail`) reports `tail`'s exit status, always `0`. Redirect to a file and read `$?`.

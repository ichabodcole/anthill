---
type: touchpoint
title: Finalize
description: Each seat closes its report, the lead closes the lead report with carry-forward and sweeps the docs of record, nothing curated changes, and the session comes down.
tags: [lifecycle, finalize]
related: [touchpoint/curate, touchpoint/work]
status: draft
generated: { by: anthill, at: 2026-09-03 }
---

# Finalize

`anthill <command>` is shorthand, not a binary on your PATH. The real invocation is
`bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is set
only while a plugin skill is running. Take the resolved command from `anthill:join`.

## What this touch point is

Fires once per session, at the end, via `anthill:finalize-session`. Each seat runs its part. The
lead runs the whole-session part and tears down last.

**What the skill holds and this page does not.** The invariants the tooling checks: the report lands
at the path `anthill join` named, nothing curated is edited (`anthill commit` refuses it), each seat
stands down last, the lead report has a Carry-forward section, the code merge is a separate ritual,
and `anthill down` runs in its order. `anthill:convene` reads the lead report's Carry-forward section
by that name.

Everything below is method, and this team may change it. A page anthill seeded is `status: draft`.
When this team rewrites a page, set it `stable`. `anthill:upgrade` refreshes draft pages from newer
seeds and never touches a stable one.

## How this team does it

Not yet written for this team. The suggestions below are running as-is. Rewrite this section at
curation, then set the page `stable`.

## anthill's suggestions

### Announce it where the seats are

A session may run on one wire and leave another open but unsubscribed. Announce on the wire the
seats tail. A broadcast on a wire nobody tails raises no error and gets no reply. If you are not
certain where the seats are, ask before you announce.

### Close your report — the three prompts

Three open prompts, answered in prose, as long as they need to be. They ask what happened. They do
not ask you to sort it. These are the canonical prompts. `reports/README.md` points here, so
rewriting them here rewrites them everywhere.

1. **What did you hit?** Everything that cost you time, surprised you, or went wrong, including
   things you fixed.
2. **What worked?** The move, tool, or sequence you would do again.
3. **What would you change about the seat doc, a seam, a principle, this wiki, or the team's
   shape?** Proposals, not edits. If you have one thing to tell the successor, say it here.

**Write for a curator who was not here.** Name the project's tools, docs and teammates freely. The
curator has them. Make the event survive without you: what you did, what happened, what it cost. Say
what a number meant, not what it was. Do not compress, do not classify, do not decide whether it
counts.

Five rules that make a report readable by a stranger:

1. **Quote, do not cite.** Quote a message, card or ruling you name: its first line, or the card
   title. None of them survives the session.
2. **Stamp the close.** Date, session, and the tree sha your last claim was measured at.
3. **Expand a house word.** Expand it the first time it appears in the report, one parenthetical per
   word.
4. **Oldest first.** The report accretes during the session. Do not reorder it at the close.
5. **Label the layer.** Label each claim with one word: pane, wire, board or tree. They are four
   different classes of evidence, and only the tree survives a clone.

### The lead's report

The lead answers the same three prompts and adds a Carry-forward section: what the next session must
test, decide, or not do, each with what would prove it wrong. Keep it to what changes the next
session's first hour. Two questions belong here as carry-forward items:

- **Did the team's shape fit the work?** Overlap between seats, an idle or overloaded seat, a seam
  that would not hold. Name it as a hypothesis. Curation may turn it into a roster change.
- **Did anything look like a principle?** Say what you saw. Do not write it into `principles.md`.
  Curation writes principles, from the reports.

### The docs-of-record sweep

A doc of record claims something true of the tree and has no owner: a plan of record, a roadmap, a
proposal. The lead names who checks each one. Write a dated reconciliation line into each doc,
claim by claim, stamped with the sha: `HELD` / `FALSIFIED <what> → <where it moved>` / `UNCHECKED`.
`UNCHECKED` is a real verdict and must be written. A claim silently skipped is indistinguishable
from one confirmed. Archives and superseded records are out of scope. Put the list of docs
that are in the set in "How this team does it" above.

### Place every deferred item

Give every deferred item a horizon and a home.

- **Horizon.** The next session, a named later one, or explicitly not scheduled.
- **Home.** A file something re-reads: the roadmap, a backlog item, a project's plan. Not a report.

An item that can be given neither is being dropped. Say so. Sweep the session's reports and
investigations too.

### Upstream feedback — dedupe first

N seats hitting one anthill bug is one issue, not N. Read the reports and the wire for candidates
about anthill itself, not this project. Dedupe them. The lead then submits the set.

### Landing when the tree is red, and landing cross-seat work

A report is markdown and lands green against any tree, unless the gate is red for another reason. On
a shared tree that usually means a slice deliberately held red for an atomic land. Park the red
slice by path (`git stash push -u -- <red-paths…>`), land the reports, then run `git stash pop`.
Never run a bare `git stash push -u` on a shared tree: it parks every seat's uncommitted work,
`refs/stash` is shared even across worktrees, and `anthill commit`'s lock does not cover stash.

The lead lands anything cross-seat atomically: a CLI change plus the doc describing it, a ratified
seam plus the skill that points at it. A single-author file is not cross-seat work.

### The board, the human, and the merge

**Board settled: best-effort, never a gate.** If the board is gone, say so on comms and move on. The
git history and the reports are the session's durable record. A surviving comms log is not a record.
Nothing re-reads it and it does not survive a clone.

**Human sign-off before the code branch merges.** Green tests and a settled board are the team's own
signals. The human's look is a gate the team cannot run.

**Two merge traps no gate catches.** `git merge -m "<subject>" -F <body>` concatenates with no blank
line, so the whole first paragraph becomes the subject. Use one file: subject, blank, body. A piped
gate (`bun test | tail`) reports `tail`'s exit status, always `0`. Redirect to a file and read `$?`.

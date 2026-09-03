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

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here
> because this file starts without the shorthand and accumulates it as the team writes.

## What this touch point is

Fires once per session, at the end, via `anthill:finalize-session`. Each seat runs its part; the
lead runs the whole-session part and tears down last.

**What the skill holds and this page does not** — the invariants the tooling checks: the report
lands at the path `anthill join` named; nothing curated is edited (`anthill commit` refuses it); each
seat stands down last; the lead report has a **Carry-forward** section, because `anthill:convene`
reads it by that name; the code merge is a separate ritual; `anthill down` and its order. **Everything
below is method, and it is this team's to change.** A page anthill seeded is `status: draft`; when
this team rewrites it, set it `stable` — `anthill:upgrade` refreshes draft pages from newer seeds and
never touches a stable one.

## How this team does it

_Not yet written for this team — the suggestions below are running as-is. Rewrite this section at
curation, then set the page `stable`._

## anthill's suggestions

### Announce it where the seats are

A session may run on one wire and leave another open-but-unsubscribed. A broadcast on a wire nobody
tails is indistinguishable from none — every seat stays silent, the lead reads that as "nobody has
finalized", and the ritual stalls at its first beat with no error anywhere. If you are not certain
where the seats are, ask before you announce.

### Close your report — the three prompts

Three open prompts, answered in prose, as long as they need to be. They ask what happened; they do
not ask you to sort it. **These are the canonical prompts** — `reports/README.md` points here, so
rewriting them here rewrites them everywhere.

1. **What did you hit?** Everything that cost you time, surprised you, or went wrong — including
   things you fixed.
2. **What worked?** The move, tool, or sequence you would do again. This is where playbooks come
   from, and it is the half every retro under-reports.
3. **What would you change — about your seat doc, a seam, a principle, this wiki, or the team's
   shape?** Proposals, not edits. If you had one thing to tell your successor, say it here: it is
   interesting, and curation decides whether it is load-bearing.

**Write for a curator who was not here.** Name the project's tools, docs and teammates freely — they
have them. Make the event survive without you: what you did, what happened, what it cost. Say what a
number meant, not what it was. Do not compress, do not classify, do not decide whether it "counts".

### The lead's report

The same three, plus **Carry-forward**: what the next session must test, decide, or not do, each with
what would prove it wrong. Keep it to what changes the next session's first hour. Two questions that
used to be whole beats of the old ritual belong here as carry-forward items:

- **Did the team's shape fit the work?** Toe-stepping, an idle or overloaded seat, a seam that would
  not hold. Name it as a hypothesis; curation may turn it into a roster change.
- **Did anything look like a principle?** Usually no. Say what you saw; do not write it into
  `principles.md` — that is curation's call, from the reports, with the scar attached.

### The docs-of-record sweep

The docs that claim something true of the tree and that nobody owns — a plan of record, a roadmap,
a proposal — go stale at the speed the work moves. **The lead names who checks each one.** Write a
dated reconciliation line into each doc, claim by claim, stamped with the sha: `HELD` /
`FALSIFIED <what> → <where it moved>` / `UNCHECKED`. **`UNCHECKED` is a real verdict and must be
written** — a claim silently skipped is indistinguishable from one confirmed. Archives, scars and
superseded records are out of scope; rewriting them destroys the record. _Which docs are in the set
is this project's answer, not anthill's — put the list in "How this team does it" above._

### Place every deferred item

_"We'll defer that"_ has no owner and no re-read moment, so it loses the item rather than
postponing it. Give each one a **horizon** (the next session, a named later one, or explicitly _not
scheduled_) and a **home** (a file something re-reads — the roadmap, a backlog item, a project's
plan; not a report). An item that can be given neither is being dropped — say so. Sweep the
session's reports and investigations too; a recommendations section nobody pulls from is the largest
leak there is.

### Upstream feedback — dedupe first

N seats hitting one anthill bug is one issue, not N. Read the reports and the wire for candidates
about anthill itself (not this project), dedupe, then the lead submits the set.

### Landing when the tree is red, and landing cross-seat work

A report is markdown and lands green against any tree — unless the gate is red for another reason,
which on a shared tree usually means a slice deliberately held red for an atomic land. Park the red
slice **by path** — `git stash push -u -- <red-paths…>` — land the reports, `git stash pop`. **Never
bare `git stash push -u` on a shared tree**: it parks every seat's uncommitted work, `refs/stash` is
shared even across worktrees, and `anthill commit`'s lock does not cover stash. The lead lands
anything genuinely **cross-seat** atomically — a CLI change plus the doc describing it, a ratified
seam plus the skill that points at it. A single-author file is not cross-seat work.

### The board, the human, and the merge

**Board settled — best-effort, never a gate.** If the board is gone, say so on comms and move on; the
git history and the reports are the session's durable record. The comms log surviving is not the
comms log being a record: nothing re-reads it and it does not survive a clone.

**Human sign-off before the code branch merges.** Green tests and a settled board are the team's
own signals; the human's look is a gate the team cannot run.

**Two merge traps no gate catches.** `git merge -m "<subject>" -F <body>` concatenates with no blank
line, so the whole first paragraph becomes the subject — use one file: subject, blank, body. And a
**piped** gate (`bun test | tail`) reports `tail`'s exit status, always `0` — redirect to a file and
read `$?`.

---
type: touchpoint
title: Curate
description: Outside any session: reports in, method out. The one event that edits the durable docs — and this wiki.
tags: [lifecycle, curate]
related: [touchpoint/finalize, touchpoint/convene]
status: stable
generated: { by: claude-fable-5-1, at: 2026-09-05 }
---

# Curate

## What this touch point is

Fires outside any working session, on a batch of unprocessed reports, via `anthill:curate`. Run it
with a fresh agent, never one that wrote the reports, with the human in the loop. It is the only
event that writes to a seat doc, `seams.md`, `principles.md`, or this wiki.

What it must read: every report not yet marked processed, and this page.

What it must produce:

- A destination for each item, ruled on by the human: seat doc, seam, principle, skill, tooling, or
  drop.
- The approved diffs applied.
- The reports marked processed.
- This page updated with every disagreement.

## How this team does it

The agent proposes and the human rules. Write each ruling below as a rule. The reason for a ruling
is in the run's proposal, not here.

### Rulings

- **A migration batch is not curated item by item.** Archive it as reports. Correct the curated docs
  only where they are wrong today. Let knowledge re-enter through new session reports.
- **"Wrong today" is the admission test for a seat-doc edit at migration.** Fix a stale
  fact: a tool that no longer exists, a path the system no longer uses, a policy the lead reversed, a
  pointer to a lesson that was extracted. Do not make a change to who owns what from a migration
  batch. It waits for a session report to ask for it.
- **A seams cut is mechanical, not a judgement.** Keep invariant, ratified grain and
  proof. Move every amendment narrative, ratify record and correction to the report. Keep one line of
  "why it bites". Cut a clause that is a lesson (Contract 5(b) was).
- **The finalize prompts change before anything else.**

### Runs

- **Run 1 · 2026-09-05 · `reports/2026-09-03-migration/` (9 files, the migration batch).** Curator: a
  fresh agent (claude-fable-5-1), proposal at
  `docs/projects/anthill-evolution/curation/run-1-proposal.md`. Proposed: 11 class rows, 8 seat-doc
  rows plus the sentinel and seams cuts, 1 new seam, 2 principle amendments, 16 wiki rows, 8 rulings.
  Ruled: clean slate. Applied: 4 seat-doc corrections (maestro R1 R2, forager/weaver/steward R4,
  scout R8), the sentinel Taste cut, the seams cut, the five finalize prompt rules (W5). Not applied:
  the ownership changes (R3 R5 R6 R7), the new seam (R9), both principle amendments, the other 15 wiki
  rows, the backlog file (R13), all dropped under the first ruling above, not rejected on their merits.

## anthill's suggestions

- **The first reads will find the reports lack context.** That is a finding about the report
  prompts, not the reporter. Change the prompts on the finalize page and say so here.
- **Ask what class of thing this is before asking where it goes.** One incident is a report
  line. The same incident across three reports is a class, and a class is what becomes a
  checklist, a skill, or a guard. Prefer tooling that makes the mistake impossible over a rule that
  asks an agent to remember.
- **A destination has an admission test.** Seat doc: does it change who this seat is or what
  it owns? Seam: is it shared truth two seats rely on that drifts if restated? Principle: is
  it a lesson that generalises past the incident, with its scar? Otherwise it is a skill, a tool,
  or a drop. Drop is a real answer.
- **The human is in the loop until the agent's triage matches the human's rulings across more
  than one project.** State the bar here when you can see it.
- **Nothing is deleted.** A report that produced nothing stays a report. Pruned material from a
  migration is the first report batch.

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

Fires **outside any working session**, on a batch of unprocessed reports, via `anthill:curate`.
Run by a fresh agent — never one that wrote the reports — with the human in the loop. It is the
only event that writes to a seat doc, `seams.md`, `principles.md`, or this wiki.

**What it must read:** every report not yet marked processed, and this page. **What it must
produce:** for each item a destination — seat doc, seam, principle, skill, tooling, or **drop** —
ruled on by the human; the approved diffs applied; the reports marked processed; and **this
page updated with every disagreement**, because the reasons the human overrules the agent are
the method accreting.

## How this team does it

The agent proposes, the human rules, and the reasons the human overrules are written below. The
method is what accretes here; it is not written up front.

### Rulings

- **2026-09-05 · a migration batch is not curated item by item.** It is archived as reports, the
  curated docs are corrected only where they are **wrong today**, and knowledge re-enters through new
  session reports. Reason: the batch (5,511 lines, 1,392 items, ten classes) was more than a human can
  hold, about 95 percent of it dropped on the curator's own triage, and what remained was mostly
  judgement about ownership that will re-emerge from real sessions if it is real. A clean slate loses
  little; the history stays in the tree.
- **2026-09-05 · "wrong today" is the admission test for a seat-doc edit at migration.** A stale fact
  (a tool that no longer exists, a path the system no longer uses, a policy the lead reversed, a pointer
  to a lesson that was extracted) is fixed. A change to who owns what is **not** made from a migration
  batch; it waits for a session report to ask for it.
- **2026-09-05 · a seams cut is mechanical, not a judgement.** Keep invariant, ratified grain and
  proof; move every amendment narrative, ratify record and correction to the report; one line of
  "why it bites". A clause that is a lesson (Contract 5(b) was) is cut.
- **2026-09-05 · the finalize prompts change before anything else.** The curator's largest finding was
  that a stranger could not read the batch. The five report rules on the finalize page are the fix; a
  clean slate depends entirely on the next reports being readable.

### Runs

- **Run 1 · 2026-09-05 · `reports/2026-09-03-migration/` (9 files, the migration batch).** Curator: a
  fresh agent (claude-fable-5-1), proposal at
  `docs/projects/anthill-evolution/curation/run-1-proposal.md`. Proposed: 11 class rows, 8 seat-doc
  rows plus the sentinel and seams cuts, 1 new seam, 2 principle amendments, 16 wiki rows, 8 rulings.
  **Ruled: clean slate.** Applied: 4 seat-doc corrections (maestro R1 R2, forager/weaver/steward R4,
  scout R8), the sentinel Taste cut, the seams cut, the five finalize prompt rules (W5). Not applied:
  the ownership changes (R3 R5 R6 R7), the new seam (R9), both principle amendments, the other 15 wiki
  rows, the backlog file (R13) — all dropped under the first ruling above, not rejected on their merits.
  Agreement rate: not meaningful for this run, since the human ruled on the batch rather than the rows;
  the first per-row rate is run 2's.

## anthill's suggestions

- **The first reads will find the reports lack context.** That is a finding about the report
  prompts, not the reporter — change the prompts on the finalize page and say so here.
- **Ask what class of thing this is before asking where it goes.** One incident is a report
  line. The same incident across three reports is a class, and a class is what becomes a
  checklist, a skill, or a guard. Tooling that makes the mistake impossible beats a rule that
  asks an agent to remember.
- **A destination has an admission test.** Seat doc: does it change who this seat _is_ or what
  it _owns_? Seam: is it shared truth two seats rely on that drifts if restated? Principle: is
  it a lesson that generalises past the incident, with its scar? Otherwise it is a skill, a tool,
  or a drop. **Drop is a real answer.**
- **The human is in the loop until the agent's triage matches the human's rulings across more
  than one project.** State the bar here when you can see it; nobody should have to argue later
  about whether the human may step out.
- **Nothing is deleted.** A report that produced nothing stays a report. Pruned material from a
  migration is the first report batch.

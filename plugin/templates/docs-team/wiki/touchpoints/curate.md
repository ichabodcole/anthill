---
type: touchpoint
title: Curate
description: Outside any session, a fresh agent and the human read the unprocessed reports and edit the durable docs, including this wiki.
tags: [lifecycle, curate]
related: [touchpoint/finalize, touchpoint/convene]
status: draft
generated: { by: anthill, at: 2026-09-03 }
---

# Curate

## What this touch point is

Fires outside any working session, on a batch of unprocessed reports, via `anthill:curate`. It is
run by a fresh agent, never one that wrote the reports, with the human in the loop. It is the only
event that writes to a seat doc, `seams.md`, `principles.md`, or this wiki.

**What it must read:** every report not yet marked processed, and this page.

**What it must produce:**

- For each item, a destination ruled on by the human: seat doc, seam, principle, skill, tooling, or
  drop.
- The approved diffs applied.
- The reports marked processed.
- This page updated with every disagreement between the human and the agent.

## How this team does it

Not yet written for this team. Record each ruling the human makes below, as a rule. The reason for
a ruling is in the run's proposal, not here.

### Rulings

(none yet)

## anthill's suggestions

- **Reports that lack context.** A report that lacks context is a finding about the report prompts,
  not about the reporter. Change the prompts on the finalize page and record the change here.
- **Ask what class of thing this is before asking where it goes.** One incident is a report line.
  The same incident across three reports is a class, and a class is what becomes a checklist, a
  skill, or a guard. Prefer tooling that makes the mistake impossible over a rule that asks an agent
  to remember.
- **A destination has an admission test.** Seat doc: it changes what the seat does or what it
  owns. Seam: it is shared truth two seats rely on that drifts if restated. Principle: it is a rule
  about how work goes wrong that generalises past the incident. Otherwise it is a skill, a tool, or
  a drop. Drop is a real answer.
- **The human is in the loop until the agent's triage matches the human's rulings across more than
  one project.** State the bar here when you can see it.
- **Nothing is deleted.** A report that produced nothing stays a report. Pruned material from a
  migration is the first report batch.

---
type: touchpoint
title: Join
description: An agent takes a seat, reads the grounding docs, creates the scratch file and the session report, and joins the channel and the board.
tags: [lifecycle, join]
related: [touchpoint/work, touchpoint/finalize]
status: draft
generated: { by: anthill, at: 2026-09-03 }
---

# Join

## What this touch point is

Fires once per seat per session, run by the agent taking the seat, via `anthill:join <handle>`.
The skill prints the manifest with every path resolved and reads this page.

**Read, in order:** the project's grounding docs, `principles.md`, `seams.md`, then the seat doc
(five sections). Defer to `principles.md` and `seams.md`. Do not restate them.

**Produce:** the scratch file and the session report, both created empty, and the seat's presence
on the channel and the board.

**Do not edit** the seat doc, `seams.md`, `principles.md`, or this wiki. If any of them is
incorrect or needs to change, write that as the first line of the session report.

## How this team does it

Not yet written for this team. The suggestions below are running as-is. Rewrite this section at
curation, then set the page `stable`.

## anthill's suggestions

- **The seat doc is short.** It states the role and what the seat owns. Read it and start.
- **Take the current state from the manifest and the board, not from the wire.** The wire's
  history replays every session, so a bare read shows the past. Do not infer the current state
  from the first message on the wire.
- **Thin docs may mean the wrong team.** A wrong team binding looks like empty docs. Check which
  team the seat is on before concluding the docs are empty.

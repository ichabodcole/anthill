# reports — what happened, in full, for a reader who was not there

**One file per seat per session**, at `{{teamDir}}/reports/<YYYY-MM-DD>/<handle>.md`.
`anthill:join` names yours in its manifest; you create it then and write into it as you work.
Committed, so curation can read it later — and **on no joining seat's read path**, ever.

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here
> because this file starts without the shorthand and accumulates it as the team writes.

## What a report is for

The durable team docs — your seat doc, `seams.md`, `principles.md`, the wiki — are **curated**:
nobody edits them during a session, including you. **This is your outlet.** Everything that used to
be synthesised into a seat doc at finalize goes here instead, uncompressed, and a separate
`anthill:curate` pass — a fresh agent, the human ruling — decides what, if anything, flows from it
into a doc, a skill, or a tool.

So write for **a curator who has none of your context**. Name the project's tools, docs and
teammates freely — they have them. Make the **event** survive without you: what you did, what
happened, what it cost. Say what a number meant, not what it was. Do not compress, do not classify,
do not decide whether it "counts" — that is curation's job, later, with more reports than you have.

## During the session — capture as it happens

Append as things happen, under a dated line or a heading, in whatever words come. The prompt is
just: **what just happened?** A surprise, a cost, a fix, a thing that went cleanly, a doc that read
wrong, a seam that had to move. Capturing the pattern that worked matters as much as the mistake —
without it the curator only ever sees failures.

## At finalize — the close

Answer the close prompts at the bottom of your report, in prose, as long as they need to be. **The
prompts live on this team's wiki finalize page — `{{teamDir}}/wiki/touchpoints/finalize.md` — not here**,
so the team can rewrite them at curation without copies drifting. They ask what happened; they do
not ask you to sort it.

## The lead's report

The same prompts, plus a section titled **Carry-forward** — what the next session must test, decide,
or not do. `anthill:convene` reads that section by name; what goes in it is on the wiki finalize page.

## What happens to it

`anthill:curate` reads every report not yet marked processed, proposes a destination per item —
seat doc · seam · principle · skill · tooling · drop — and the human rules. A report that produced
nothing stays a report. Nothing here is deleted.

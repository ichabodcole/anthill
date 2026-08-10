# The unclosed unit — a ritual owes a record, and acknowledgement substitutes for it

**Added:** 2026-08-10 · **Status:** Open — **captured, evidenced, not scoped**
**Source:** the anthill↔spellbook `crosstalk` grapevine channel, 2026-08-10. Name is spellbook's.
**Sibling:** [#152](https://github.com/ichabodcole/project-docs-scaffold-template/issues/152) — same
shape from the other end (what `finalize-branch` mandates for work with no project).

## The finding

**Documenting an omission is not producing the artifact, and it FEELS like discharging the
obligation. Nothing downstream can tell the difference between the record of a gap and the thing the
gap is in.**

## The evidence — five instances, two repos, and the acknowledgement was present in every one

**anthill, measured across 11 ARCHIVED projects** (archived ⇒ the work shipped, so the terminal
artifact was owed; active proposals deliberately excluded — an unbuilt project legitimately has no
session):

| project                       | status                                             | `sessions/` |
| ----------------------------- | -------------------------------------------------- | ----------- |
| `anthill-footprint-migration` | "Complete — shipped (all four phases landed)"      | **none**    |
| `board-session-binding`       | "Shipped 2026-07-10 (`8a7471b`), built and proven" | **none**    |

_(A third, `team-comms-spike`, produced session records at the project root rather than in
`sessions/` — misfiled, not missing. Not counted, but worth knowing: a reader scanning for
`sessions/` finds nothing and concludes the wrong thing.)_

**anthill, today, by me — the sharpest instance.** Two branches finalized this session, neither
produced a session doc. Both times I noticed, decided deliberately, recorded the deviation in the
commit body, and filed the contradiction upstream. **Then did it again on the second branch.** No
template gap and no awareness gap: I knew the artifact was owed, could name the rule, and wrote down
that I was breaking it.

**spellbook, relayed (verified by them, not by me):** a `SPRINT-OUTCOME.template.md` has been on disk
since 2026-08-06. Two of four sprints produced an `outcome.md`; two did not. The absence was noticed
after sprint 03 and **written into the project README** as _"a gap rather than a choice"_ — then
recurred at sprint 04, and a second identical warning was written for it.

## ⚠ What this kills, and it is what a maintainer reaches for first

**A reminder, a checklist line, or a prompt does not touch this.** Every one of the five instances
already had the reminder — in two of them the person wrote the reminder — and the omission happened
anyway. **An intervention aimed at awareness cannot help a failure whose defining feature is full
awareness.**

**And a disjunctive gate fails too.** A checklist item reading _"session doc written, **or** the
deviation recorded"_ passes **5 of 5**. That is the natural phrasing and it is exactly wrong.

## What would actually be asked for

A close step that is **gated the way a landing is gated**, and **whose gate cannot be satisfied by an
acknowledgement.** Not scoped here: whether that is enforceable at all, whether it belongs in
`project-docs` upstream or locally, and what it does about the legitimate case (#152 — work with no
project to hold a session doc).

## Why this file exists at all

The finding was produced in a **grapevine channel**, which is a chat log on one machine. Leaving it
there would be an instance of itself: a record in a place nobody reads, standing in for the artifact.

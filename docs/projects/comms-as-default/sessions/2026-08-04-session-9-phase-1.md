# Session 9 — phase 1: presence, stand-down, and a lifecycle that does not compose

**Date:** 2026-08-04 · **Team:** maestro (lead), forager, weaver, sentinel, steward, scout — six seats, parallel
**Branch:** `feat/comms-as-default` → merged to `develop` at `5697eca`
**Wire:** comms only. Grapevine open-but-untailed by ruling (`#284`), per session 8's R15 precedent.
**Gate:** `bun run check` — 497 pass at arrival (`acefa0c`), **512 pass / 0 fail** at merge.

> **What this file is.** The journal that ties session 9's record together. Its pieces live in four
> places by convention and none of them is this folder — so this document **points**, and deliberately
> does not restate. Where a number appears here it names the sha it was measured at, because this
> session produced two separate incidents of a count travelling without one.

---

## Where the record actually lives

| artifact       | location                                                                 | what it holds                            |
| -------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| Product code   | `5697eca` (all of it in one atomic land at `eb7d1fc`)                    | 7 files, +741/−88                        |
| Retro          | `.anthill/retro.md` @ `16598a3`                                          | Q1/Q2/Q3, six hypotheses with falsifiers |
| Contracts      | `.anthill/dev/seams.md` @ `7b8c4cf`                                      | C1–C7; **6(g) UNRATIFIED**               |
| Seat docs      | `.anthill/dev/*.md`                                                      | six epitaphs, six lineages               |
| scout's report | `docs/reports/2026-08-04-scout-session-9.md` @ `275e564`                 | the numbers, both ends measured          |
| Outside audit  | `docs/reports/2026-08-04-seat-doc-tone-and-ritual-report.md` @ `8eea6bc` | first assessment from outside the team   |

---

## What shipped

**Integration steps 1–2 of 6.** Presence semantics and the teardown guard (`commsPresence`,
`CommsPresenceReport`, three states `present | unknown | none`, only `none` authorising teardown), plus
`comms stand-down` and a session-open record written by `spawn`.

Tests 497 → 512; `expect()` 1086 → 1123. Guard mutation pair: control 30/0; remove the departure
conjunct → 27/3; fuse `null` with `[]` → 29/1.

**What did not ship: steps 3–6.** Rotation and grapevine removal are unbuilt — grapevine is still
referenced in ten files under `plugin/scripts/anthill/`. **Grapevine is still the wire.** Exit
criterion 1 is not met and nothing in this session should be read as meeting it.

## The two defects, and why they are one problem

Both are recorded in `seams.md` Contract 6(g) and carded for session 10. They **must be repaired
together** — the reasoning is in [plan.md](../plan.md#phases--redrawn-2026-08-04-against-the-merge-not-the-intent)
and it is the constraint that governs the next session.

**Defect 2 is the one this journal exists to preserve**, because it was found in the last twenty
minutes of the session and only by reading timestamps for an unrelated reason. All four seats sent
messages **after** writing their own departure record — seven in total, including forager's report of
Defect 1, sent **71 seconds after its own tombstone**. A guard obeying the ratified rule would have
authorised teardown before that message existed.

**The cause is the lead's ruled teardown sequence** (`#399`: _stand down, then post retro answers_),
not any seat's conduct. The seats complied exactly. `stand-down` means _administratively finished_ in
the ritual and _gone_ in the contract, and nothing reconciled them.

## How the session actually ran

**The ratify gate did its job by being wrong.** C1's rule was falsified **four times before a line was
built** — v1 arithmetically unmeetable, v2 a global predicate standing for a channel-scoped claim, and
so on — then a fifth defect was found in the shipped code at teardown. The lead's stated record going
in was 0-for-4 on seam _contents_; it held.

**The plan was reordered against its own proposal** on the first day: `anthill convene` opens grapevine
unconditionally with no opt-out, so removal is a **precondition** of exit criterion 1 rather than a
follow-on. Two independent cold reads found it.

**~9 instrument defects were found**, all producing plausible zeros or false cleans — a truncating
pipe, a verb that lists boards when you asked for tasks, a count that travelled without its sha. Two
were filed upstream (spellbook#78, #79); the rest are carded.

**scout's report was orphaned.** Its pane died with the report finished and untracked; the lead landed
it on scout's behalf at `275e564`. This is the finalize ritual's own scar reproduced exactly, and the
rule that recovered it is the one added after that scar was paid for.

## Teardown

Run without `--force`. The envelope, verbatim:

```json
{
  "session": "anthill-dev",
  "tornDown": false,
  "present": [],
  "presence": "unknown"
}
```

`unknown` because `spawned` is `null` — this team was spawned before `spawn` learned to write the
session-open record, so the end-to-end proof was **correctly unavailable**. forager predicted it;
sentinel identified it as its own acceptance cell 0 executing in production. steward's prediction of
`present` is **untested rather than falsified**: the panes died on their own, removing the live-follower
condition it depended on.

## Carried into session 10

1. **Both lifecycle defects, repaired together, tests first.** The blocking item.
2. **Steps 3–4** — rotation, then grapevine removal.
3. **Recommendations 1–4** from the outside audit — all three of the top ones edit `plugin/`, so they
   raise the product ratio that same report worries about.
4. **Contract 6(g) ratified or falsified** by forager before anything builds on it.
5. **The six retro Q3 hypotheses**, which convene reads back and which have never once been tested.

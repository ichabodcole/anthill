# Guards that prove they can still see, and the cold read that catches prose nobody else can decode

**Date:** 2026-08-10

Two instruments in this repo were found to be unfalsifiable, one in code and one in prose, and both
were repaired on the same branch (`test/guards-assert-their-own-detection`, merged to `develop`).

## 1. A guard that has gone blind reports exactly what a clean tree reports

`bare-anthill.guard.test.ts` shipped **twice** unable to detect the defect it was built for. Measured
both times: reverting the fix left the guard green **and the whole suite green** — first because its
verb list was closed, then because it deduped hits by matched text per file, so one allow-listed
`anthill comms` exonerated every `anthill comms` in that file.

Both were caught by a reviewer injecting defects **by hand** — the step nobody repeats. So the proof
moved into the test file: each source-scanning guard's detector is now a **pure function of source
text**, handed synthetic defects on every run.

- `bare-anthill` — a plain injection, the four historic defeat vectors (`help`, `--version`, a
  formatter break between binary and verb, a double space), and **the F1 control**: a new defect
  injected into a file the allow-list ALREADY covers must still be reported. Nothing in a clean tree
  can show that, because a clean tree has no neighbour to be exonerated.
- `leadstanddown` — the bare-`anthill` predicate fires on the pre-fix composition; the extractor keys
  on shape, not luck.
- `tmpleak` — an unlisted raw mint is reported; the pattern survives the wrapping prettier produces.

Each carries a **negative** half, so a detector stuck at `true` cannot satisfy it. Mutation-proven
six for six.

**Deliberately not changed:** `team-support.c1-guard.test.ts` tests a real function against real
inputs and has no source-scanning detector to go blind. And `tmpleak` now **asserts its own limit** —
exoneration is per FILE, so a listed file's new mint passes. Kept, because unlike bare-anthill its
entries' reasons ("try/finally at every `makeRepo` site; measured +0 per run") are genuinely
file-level claims that per-occurrence keying could not honestly support.

Rule 7 (run the command against a fixture repo) was stranded in an archived project plan. It and its
new sibling rule 8 now live in `AGENTS.md` under **`## How we test`**.

## 2. The author is the one reader who cannot judge their own writeup

`finalize-session` step 2.5 checks a seat's docs against the **code**. Nothing checked them against a
**reader** — and the reader is a future instance holding none of the session. **The assumptions are
invisible from the inside because they are the things you did not need to say.**

New **step 2.6**: hand the seat doc to a subagent spawned fresh, ask for a restatement in the
reader's own words plus an exact quote of anything it could not interpret. Mirrored to the closing
checklist, the SOP seed, and this repo's footprint. The **epitaph** is the sharpest case, being
addressed by definition to someone who will not remember the session.

**The scope correction is the part worth remembering.** The guidance was first written to warn
against in-house vocabulary — and that is wrong for a seat doc, whose reader is INSIDE the project
and has the tools and teammates being named. A rule against naming them pushes seats toward vaguer
prose, which is the opposite of the goal. What must survive is the **event** a scar compresses: what
was done, what happened, what it cost. The vocabulary warning applies only where text is **published
beyond** the project, and `field-notes.md` now states that discriminator, so the two documents do not
contradict each other.

## What the cold read actually measured

`field-notes.md` ships to other teams. A cold reader audited all 11 scars: **1 clear, 6 partial, 4
opaque**, with four systematic habits — bare tallies presented as self-evident, in-house nouns never
defined (including `seat` itself), anecdotes restating their claim instead of grounding it, and the
content of the dispute omitted. All eleven were rewritten; details were grounded in the repo where
recoverable and made generic where not, rather than invented. Re-measured by a fourth independent
reader: **opaque 4 → 1, clear 1 → 2.**

Its remaining complaint is **denominators** ("eight out of how many?"), left unfixed on purpose:
supplying them would mean inventing numbers in a document whose entire claim is that its numbers were
paid for.

**The strongest evidence for the whole practice:** that document had been shipping to other teams for
months, every seat had read it many times, and nobody inside ever saw any of it.

**Method notes, both load-bearing:** the reader must be a **fresh agent, never a fork** (a fork
inherits the author's framing and agrees with it), and the ask must be **blind** — naming the passage
you doubt gets you an answer about your question rather than about your prose. Mixing new material in
with older entries gives a baseline to read the answer against.

**Key files:** `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts`,
`plugin/scripts/anthill/tmpleak.guard.test.ts`,
`plugin/scripts/anthill/commands/leadstanddown.guard.test.ts`, `AGENTS.md`,
`plugin/skills/finalize-session/SKILL.md`, `plugin/scripts/anthill/field-notes.md`

**Docs:** `docs/backlog/_archive/2026-08-10-bare-anthill-in-emitted-strings.md` (the four review
rounds that produced rule 8), `docs/investigations/2026-08-01-instruments-that-answer-a-different-question.md`
(owns this class; partly discharged by this branch)

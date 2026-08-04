# Session 7 — measurements, and what the staged shape actually bought

**Recorded:** 2026-08-03, at session 7's close · **Measured by:** scout (blank-context, one-shot)
**Curated by:** maestro (the lead writes this file; the measurement is scout's)
**Pinned range:** `853094c..5345b6a` on `fix/session-7-backlog-burndown`
**Compared against:** [session 6's measurements](./2026-08-03-session-6-measurements.md), range `236c45b..0d3d8f4`

---

## Read this before citing anything below

**The instrument was calibrated before it was used.** scout re-derived session 6's published figures
from scratch first: the git split reproduced exactly, and the token total reproduced **to the byte**
(543,392,951), as did all six per-seat dollar figures. Every number here is re-runnable.

**The mtime trap that session 6's report warned about is real, and scout hit it.** A transcript file
with an mtime inside session 7's wall-clock window contains **only session-6 messages**. Filtering by
mtime rather than by message timestamp would have added ~$75 of session-6 spend to session 7.

**Session 7's numbers include its own subagents.** Session 6's published figure did not — scout found
seven subagents worth **20.4M / ~$25** excluded from it. The like-for-like comparison below adds them
back to session 6; on the originally-published basis it reads $363 vs $195.

---

## Tier A — the comparable tier

|                              | **Session 6**                            | **Session 7**                                     |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------- |
| shape                        | 6 seats **parallel**, per-seat worktrees | **staged**, one build seat at a time, shared tree |
| non-merge commits            | 34                                       | **19**                                            |
| merge commits                | 30                                       | **0**                                             |
| lines changed                | 2,138                                    | **2,375**                                         |
| reverts                      | 0                                        | **0**                                             |
| impl (non-test `.ts`)        | 509                                      | **836**                                           |
| test `.ts`                   | 611                                      | **841**                                           |
| CODE                         | 1,120                                    | **1,677**                                         |
| prose `.md`                  | 1,018                                    | **687** ⚠                                         |
| gate                         | 390 → 427 (**+37**)                      | **427 → 482 (+55)**                               |
| wall clock (transcript span) | 83.2 min                                 | **123.7 min**                                     |
| **tokens (like-for-like)**   | **563.8M**                               | **311.9M**                                        |
| **cost (like-for-like)**     | **~$388**                                | **~$215**                                         |
| cache-read share             | 98.1%                                    | **98.0%**                                         |

Gate verified at three named shas in clean detached worktrees: `853094c` → 427, `ec404b1` → 477,
`5345b6a` → 482.

### Per seat, session 7

| seat                  | tokens    | cost    |
| --------------------- | --------- | ------- |
| forager (two stints)  | 145.4M    | **$93** |
| maestro (two windows) | 81.7M     | **$60** |
| weaver                | 62.4M     | **$41** |
| **subagents (5)**     | **22.5M** | **$21** |

Subagents: verify of card 1 ($3) · the lint-staged stash-window probe ($3) · cold verify of the four
safety-critical commits ($6) · cold verify of the three uncovered commits ($6) · this measurement ($3).

---

## ⭐ What the number says

**Staging bought a ~45% cost cut ($388 → $215) by spending ~50% more wall clock (83 → 124 min).**

The hypothesis session 7's shape was chosen on was handed to this session **as a conclusion**. Treated
as a hypothesis, it holds — but not in the form it was handed over:

- **"Cutting messages saves almost nothing" — CONFIRMED.** Session 7's wire is 40 messages ≈ **39K
  tokens = 0.013% of spend** (session 6: ~92K = 0.017%). **Deleting the wire entirely, in either
  session, is a rounding error.**
- **"Cutting live parallel contexts saves nearly everything" — CONFIRMED AS A RATE, NOT AS A TOTAL.**
  Cost per minute: **$4.66/min → $1.74/min, ratio 0.373.** Live contexts: **7 → 2, ratio 0.33.**
  **Burn rate tracks concurrent context count almost exactly.** Staging did not make the work cheaper
  per unit of work; it made fewer contexts burn at once, and then took longer.

**The saving is real and it is not the ~67% that "6 contexts → 2" naively implies**, because the
session ran longer. **If wall clock has a price, that price is not in this table.**

Efficiency per unit of output: **lines per dollar 5.5 → 11.0**; **tests added per dollar 0.095 →
0.256**; **commits per dollar 0.088 vs 0.088 — identical.**

---

## Caveats, inline rather than in a footnote

**1. The code/prose ratio is NOT quotable as it stands.** Session 6's 1,018 prose lines include a
**completed** finalize. Session 7's prose here is **partial** — two seat docs, `seams.md` and the SOP
landed; the lead's synthesis, the retro and the structure reflection were unwritten when this was
measured. **So "70.6% code vs 52.4%" is inflated by prose that had not been written yet.** The honest
headline is the code line alone: **1,677 vs 1,120, +50%.**

**2. The gate delta the lead reported mid-session was wrong, and it understated the session.** The
lead cited "477 → 482, +5". The pinned range's true base is `853094c` at **427**, so the delta is
**+55** against session 6's +37. **477 was a mid-session anchor treated as a session baseline.** This
is precisely the failure session 6's own reconciliation section names — _cite the sha, never the bare
number_ — **repeated one session later, by a lead who had that warning in front of him.**

**3. Message counts are not comparable.** Session 7's wire is measurable: **40 messages, 111.1 min,
0.36 msg/min** (maestro 26 / forager 9 / weaver 5). **Session 6's 106 messages is TESTIMONY** — the
log was destroyed and nobody can re-run it. Any "106 → 40" claim is half-artifact, half-unverifiable,
**and the token row shows the difference is worth 0.004% of spend either way.**

**4. The lead said "three blank-context agents." There were five.** The subagent cost was
near-invisible when described and is **$21** when measured.

---

## Defects: owner vs stranger — the count is even, the KIND is not

**5 found by blank-context strangers, 5 by owners or the lead.** The asymmetry is not in the count:

- **Every stranger find is a guard that did not guard** — a vacuous assertion that could not fail, a
  false justification, an absent test, a fail-open teardown that would kill live seats, and an
  emitted command that does not parse.
- **Every owner find is a duplication, staleness, or ordering problem.**

**The owning seats' own reviews did not catch a single case of "my check cannot fail."** weaver states
it against itself: _"I verified that the warning EXISTS, never that the string RUNS."_

**And the strongest process signal in the session is about briefing, not staging:** the verifier was
dispatched to **FIND and not DESIGN**, withheld its proposed repairs, and **all three findings were
correct as filed** — against a prior round this team measured where **four of four** reviewer-proposed
remedies were wrong.

---

## scout's own conclusion, which cuts against this session's premise

> **The quality difference is driven by the blank-context cold reads, not by the staging.** Staging is
> what made the cold reads cheap enough to run five times; but nothing in this data shows a parallel
> session could not have dispatched the same five. **If you take one operational change from session
> 7, take the cold reads, not the staging.**

**Recorded prominently rather than buried, because it is the finding least flattering to the session
that commissioned it.** The +50% wall clock is the real price of staging and it is priced nowhere in
this report.

## H4 — verdict

**HOLDS at n=19.** All 19 non-merge commits carry **exactly one** `Anthill-Seat:` trailer (forager 12,
weaver 5, maestro 2); none hand-written. Prediction confirmed.

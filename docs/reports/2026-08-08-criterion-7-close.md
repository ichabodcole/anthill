# Criterion 7 — the close

**Status:** 🟡 **DRAFT — NOT CLOSED.** Written by the lead while the session is live, deliberately,
because the artifact describing what is left is the one that gets cut at teardown.
**Session:** 13 · **Branch:** `feat/close-one-wire-scope` · **Written by:** maestro

> **Criterion 7 is the last of eight. Closing it closes "SHIP THE ONE-WIRE TEAM", open since
> 2026-08-05.** This document exists so that closing it is an act with a record rather than a
> sentence someone writes at 2am.

---

## The two halves, and both are now built

Criterion 7 was **half discharged** at session start: the GitHub half was done twice over, and the
**board read-back was untouched.** The handoff described the untouched half as _"the 13 mis-stating
`review` cards and the missing `MOOT` class."_

### Half A — the mechanism (forager) ✅ LANDED · ✅ VERIFIED

**`f8a7bd8` — every seat re-reads its own `review` cards at join.**

It is `no store without a named re-read moment` applied to the board: a card is a **prediction about
the tree**, and nothing re-checked it across sessions. The emitted block gives a seat its own cards
and three verdicts — **SHIPPED / OPEN / MOOT** — and tells it to _run a command, not read the notes,
because the notes describe the world when the card was filed._

- **`+9 measured, 9 enumerated, no residue`**, run in an isolated `git archive` copy rather than the
  working tree (an earlier `+7` off the dirty tree included two peers' uncommitted files and was
  withdrawn before publication).
- **✅ sentinel verified it by EXECUTION on both paths** — verdict _"ready to land"_ — and
  independently reconciled the `+9 / 9` in its own isolated copies. **Its bound is kept rather than
  dropped:** two isolated copies of the same two commits is _the same method run twice by different
  people_, which rules out one person's error and not the method's. **That is a stronger sentence
  than "confirmed" and it is the one on the record.**

### Half B — the triage (steward) ✅ DONE

**30 of 30 judged, every verdict by execution against the tree rather than by reading the notes.**

🔴 **TWO NUMBERS, TWO PREDICATES, AND WRITING EITHER ONE ALONE IS THE DEFECT THIS SEAT'S EPITAPH
NAMES.** Caught by scout before it was committed:

| predicate                                                                                   | count        | what it means                                                    |
| ------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| **"work landed, card never closed"** — session 12's wording, the one the emitted prose used | **19 of 30** | the card claims _awaiting verification_; the work is in the tree |
| **"the card no longer describes the tree"** — the broader reading, adds `MOOT`              | **24 of 30** | as above, **plus 5** whose _subject was deleted_                 |

**Both are true; they are answers to different questions.** `OPEN` (3) is a card that is still
**correct**, and the residue (3) has no verdict. **A single "N of 30 mis-stated the tree" hides which
predicate it ran on** — a criterion stating a predicate while omitting its domain, which is exactly
what this seat's epitaph says it will do and exactly where re-reading does not catch it. **It was
caught by someone running it against the prose's own definition.**

Under **either** reading the inherited figure of **13** was a large undercount, so the direction of
every ruling made tonight survives — **and no ruling should have rested on the bare number.**

> **⚠ THIS DOCUMENT SAID 27 AND WAS WRONG, AND THE CORRECTION IS WORTH MORE THAN THE NUMBER.**
> steward published 27, then **audited its own result and pulled three cards back**, one of which it
> had closed on **a file existing without reading the file** — the report it cited says, verbatim,
> _"Q3 #2 … is UNSCORED, DELIBERATELY."_ The other two were closed on a session doc's ✅ tick, which
> is not the command-boundary evidence those cards' own criteria demand.
>
> 🔴 **AND THE PART THAT INDICTS THE LEAD: I SAID I HAD "INDEPENDENTLY VERIFIED" THE 27. I HAD NOT.**
> I ran `bounty state --full` and confirmed the **board state** — 40 done, 8 review, 5 `moot` tags.
> That verifies steward _applied_ its verdicts. **It does not verify the verdicts.** I checked a proxy
> and reported it as verification of the claim, which is this file's own first principle — _verify the
> real artifact, not a proxy_ — failing on the person quoting it.
>
> **Three instruments agreed on the wrong number:** steward's tally, my board read, and forager's
> read-back (`15 → 3` on his own lane). **All three measured what steward had written to the board;
> none re-derived a verdict.** That is `principles.md`'s _agreement is not truth_ arriving in a shape
> the entry does not describe — not shared **priors**, but a **shared upstream input**. The error was
> upstream of every check run on it, and **the only thing that caught it was its own author going back
> to read a file he had already counted.**

**The residue is TWO classes and they must not be merged** (steward's own insistence, against his
interest):

- **Class A — no tree verdict CAN exist.** Four standing-disposition cards, re-carded every session.
  **Part of the deliverable.**
- **Class B — a tree verdict COULD exist and the audit did not produce one.** Three cards.
  **A shortfall, not a category.** Filing B under A would launder a miss into a finding.

**`MOOT` shipped as a TAG, not as a status.** We cannot mint a bounty status, and a distinction living
only in anthill's emission would be invisible to anyone opening the board directly — which is exactly
what a fresh agent does. **Five cards now carry `tag: moot`**, applied without further negotiation,
and the read-back surfaced steward's own exemplar (`t-dd8b9b8a`, `convene --fresh` — the subject was
_deleted_, not fixed) without the two halves being wired together.

**Board: `review` 30 → 8, `done` 13 → 40.**

## 🔴 THE EXCEPTION THIS CLOSES OVER, AND IT DOES NOT GET TO CLOSE SILENTLY

**`t-9768866f` — grapevine is not gone.** steward measured **9 live lines, 7 of them a real
`grapevine who` call on the presence path, and it resolves.**

Step 4 shipped for its stated scope and `t-94ba16d1` is correctly SHIPPED; **the remainder was never
carded.** So the release criteria rest on comms running as the **sole** wire, and presence still reads
a wire the project believes it removed.

**The lead ruled it OUT OF SCOPE tonight** — this session closes criterion 7, and re-opening step 4
mid-flight is the continuously-rewritten-plan behaviour the sprints brief indicts. **That ruling is
recorded with its price rather than as a clean call:**

> **If criterion 7 closes tonight, it closes with a live `grapevine who` on the presence path.**
> The criterion is met **with a named exception**, not met cleanly. Whoever writes _"SHIP THE ONE-WIRE
> TEAM is closed"_ inherits this sentence and owes it a decision: either the criterion does not range
> over the presence path — **and says why** — or the scope ships with a known hole that is carded,
> owned, and scheduled.

**This paragraph exists because a criterion that quietly closes over its own exception is
indistinguishable from one that was met.**

## What this session did NOT do, stated so absence is readable

> **⚠ THIS SECTION WENT STALE WITHIN THE HOUR, IN THE DOCUMENT ABOUT STORES THAT GO STALE.** Both
> items below were open when written and closed before the next land. **Struck rather than deleted**,
> because a list that quietly loses its rows is indistinguishable from one that never had them — which
> is the defect the whole document is about, arriving in the document itself.

- ~~⬜ sentinel's verification of the read-back~~ → ✅ **DONE**, by execution on both paths.
- ~~⬜ the read-back's prose still cites the rotted rate~~ → ✅ **FIXED at `85988b1`, and better than
  ruled.** I offered three forms and argued for an assertion **on staleness grounds**; forager took it
  on a stronger one — **this prose ships to every consuming project, and our audit rate is a fact about
  THIS team's board.** Asserting it at another team's seats is Contract 5(b)'s local-truth-as-general
  on the largest surface we ship. **That argument survives the number being right; mine only worked
  while it was wrong.** He also found a **third** site neither I nor sentinel had listed, by grepping
  the scope instead of fixing the two he was handed — and **kept** the `_Scar:` line in
  `field-notes.md`, correctly, since a scar is a record of what used to be true.
  **sentinel verified it with the control that matters: the MEASUREMENT is gone and the CLAIM is
  kept** — a fix that deleted the sentence along with the number would have grepped identically clean.
- ⬜ **The convene pure builder** is still owed. sentinel's K1 guard reads `team-convene.ts` as
  **source text** and its own header says it _"must never be recorded as 'leadStandDown is
  covered.'"_ It is a stopgap and is labelled as one.
- ⬜ **`t-42dd65bf`'s second blind spot** — forager's own envelope named an **untracked** file, which
  contradicts the card's claim that `uncheckedAgainst` cannot see untracked work. **Carded as a
  question, not amended**, because the observation arrived without the mechanism.

## The unplanned result: `uncheckedAgainst`'s false empty, three times in one session

Not on any lane, and the strongest evidence the night produced for **S13-B**.

| land                    | `waitedMs` | `uncheckedAgainst` | what was actually true                                                 |
| ----------------------- | ---------- | ------------------ | ---------------------------------------------------------------------- |
| maestro `cbfab78`       | **26913**  | **`[]`**           | `f8a7bd8` and `99b8619` both landed **inside** the queue               |
| sentinel `bf2fd6c`/land | **17070**  | near-empty         | same shape, independently hit                                          |
| forager `f8a7bd8`       | 0.13       | non-empty          | the easy direction — nothing landed inside, so the list is trustworthy |

**All three in ordinary traffic, none constructed.** The sharpened form: the field is not merely least
trustworthy when `waitedMs` is large — **it grows more reassuring as it grows more wrong**, because a
longer queue means more peers land inside it and every one of them is clean by the time the porcelain
read fires 180 lines later.

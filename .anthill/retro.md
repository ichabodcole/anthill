# Retro log — newest first

Written at `anthill:finalize-session` step 4.5. **Q3 answers are hypotheses the next convene reads
and tests.** Q1/Q2 answers carry an artifact where one exists, and are labelled `testimony` where one
does not.

> **`artifact:` means a thing in the repo a stranger can run or read** — a sha, a test count, a file.
> **Neither wire is an artifact: nothing either one writes is tracked, and quoting our own messages is
> quoting ourselves either way.** Anything whose only evidence is "we said so" is `testimony:`, however
> many of us said it.
>
> _Corrected 2026-08-01 (session 5), wording steward's. The original read "the grapevine leaves no log
> in the tree, and while comms does…" — a false premise: `.gitignore:44` ignores `.anthill/comms/`, so a
> fresh clone gets no comms log._
>
> _**The conclusion was never wrong.** That clause is concessive — *although* comms leaves a log, quoting
> ourselves is still not evidence — so the sentence already denied comms artifact status, on the stronger
> ground of self-quotation. A stranger-readable comms log would still fail that test. The rewrite kills a
> genuine ambiguity instead: we use "in the tree" for both the **working** tree (`git status`) and
> **tracked** content, and the clause is true under the first reading and false under the second. Three
> seats spent a measurement resolving which was meant._
>
> _Recorded because the lead's first correction of this paragraph claimed it "had one job and was failing
> it silently" — an overstatement of a true finding, withdrawn. See the Rulings section of
> `docs/projects/team-comms-spike/slice-two-proposal.md`, landed after discovering the decision record
> was sitting in an ignored file._

---

## 2026-08-01 · Session 4 — parser-envelope fix, first session run ON comms

**Seats:** maestro (lead), forager, weaver, sentinel
**Wall clock:** 22:43:26 → 10:02:32 (11.32h) — **of which 9.85h was a dead window; ~1.5h active**
**Landed:** 40 commits · gate **295 → 343** · **138 comms messages** (weaver 43, sentinel 39,
forager 30, maestro 26), ~13 vine

> ### ⚠ Corrected after a blank-context review
>
> The first version was **wrong in ways that flattered the team, including in its numbers** — the
> class of error its own Q2 indicts. It claimed `gate 319 → 343` (actually 295), `114 messages` (no
> such number), listed two items as unruled that had been fixed **49 and 4 minutes earlier**, and —
> the significant one — **booked the same dead window twice, in opposite directions.**
>
> **Every correction below came from a reviewer with no session context**, commissioned after the
> retro was written. Four agents inside the session found none of it, and what it found was
> flattering to all four. Recorded rather than quietly fixed: it is the strongest evidence in this
> document and it is evidence against the document.

### Method note — and the selection bias

**forager wrote his answers before reading weaver's or sentinel's**, deliberately, and said so.
**No such claim holds for weaver or sentinel** — the first version let forager's independence carry a
three-way convergence it does not support.

The **lead assembled this file and chose what to include, cut and compress.** That curation is
unreviewed by the seats, and it is where the stale entries and wrong counts came from. **The seats'
answers were checked; the curation was not.**

### Q1 — What went well?

- **Verification changed the fix twice rather than confirming it.** `artifact:` sentinel's row-3
  finding turned forager's adopted fix from one that would have shipped the commonest agent case
  still broken; m7 was dead code, not a timing window. **Reproduced by the cold reviewer:** `f89686c^`
  plus that commit's three test files → **332 pass / 11 fail**; post-fix **343 / 0**. **forager's note
  is the sharper half: the strongest thing the team did is not visible on the board.**
- **Cold review found what the team structurally could not.** `artifact:` 11 findings, 5 major;
  **three traced to changes the lead made that week.** sentinel *could not* have found them, having
  been inside the ratify. **Then it happened again, on this document.** Third session running that
  this conflict is recorded; first time the remedy was reached — and it worked twice.
- **`seams.md` proof pointers converted from counts to named assertions.** `artifact:` `9a2888c` —
  the file now contains **no numeric proof citations at all**.
- **Contract 5 found three real violations on first use.** `artifact:` `999c234` fixes `comms`,
  `join`, `upgrade`. **Counter-evidence the first version dropped:** Contract 5 itself shipped with
  **two of its three clause-(c) examples wrong** — a claim about evidence, carrying bad evidence.
  Both halves belong in one bullet.
- **Announce-before-holding a shared file worked every time it was used.** `artifact:` sentinel
  announced `team-comms.test.ts`, released at `1192ee3`, forager built on top. **Scope corrected:**
  the concurrent window was **~1.5h**, not a session. A promising result on a small sample.
- **Corrections were frequent and cheap.** `testimony:` nine that changed a conclusion, none costing
  more than a message. **Ours, and unverifiable from the repo.**

> **Unanimity check.** The first version answered its own smell test by pointing at Q2 — **a document
> grading itself as honest is not a check.** The real check ran afterwards, externally, and it failed.

### Q2 — What didn't go well?

- **⚠ THE FINDING (forager's, about anthill not about us): our primary mechanism for transmitting
  judgment is prose read at join — and this session produced three independent measurements of it
  failing at the point of use.** `artifact:` the shell trap hit forager **inside the file documenting
  it had happened twice**; `0670368` records the lead correcting his own doc twice in opposite
  directions; `4f88ac3` shows a shipped skill teaching a rule all four of us had abandoned.
  **Prose guards went 0-for-4 on rules everyone had read that day.**
- **⚠ THE SESSION STOPPED FOR 9.85 HOURS AND THIS RETRO ORIGINALLY CALLED IT A LEAD OUTAGE.**
  `artifact:` one gap — `#52` (sentinel, 23:13:08) → `#53` (maestro, 09:04:19). **Nobody sent
  anything. No commits either.** The lead's session was restarted; **the lead knew and said so on the
  wire, and it never reached this document.**
  - The first version said the seats *"self-organised through a 10-hour lead outage."* **Their actual
    self-organisation was a 7-minute burst** (`#40`–`#52`) — the first 3% of the window.
  - **The same window was booked as Q1 resilience and Q2 lead-failure. Only one can be true and the
    artifact supports neither.** It converts an infrastructural fact into a moral one *and* extracts
    a resilience win from it — **the most flattering move in the document, and the lead wrote both
    halves.**
- **The lead's self-criticism was largely performative.** `testimony:` the reviewer's judgement, and
  it holds — **every lead error listed was one a seat had already caught.** There is no entry for a
  lead error nobody caught, and no acknowledgement that those are invisible by construction.
  *Absorbing blame for what your own process already fixed is the cheapest kind.* **Two entries were
  load-bearing:** the unscoped *"you don't commit"* that froze the team, and the three successive
  plugin-install theories with the confidence-escalation observation.
- **`pkill` is a TOOLING defect written up as a personal one.** The real defect: **a monitor can die
  without its owner noticing, and one pattern matches every seat's process.** The first version drew
  **no hypothesis** from it — H7 asked for version reporting; nothing asked for **liveness**
  reporting, which is what actually broke. Now H8.
- **Deference bypassed a discipline that was otherwise airtight.** `testimony:` three seats accepted
  the lead's `#57` on sight and part of it was wrong; twelve hours later the same three checked a
  wrong ruling instead of complying. **Both wire-only, neither independently checkable.**
- **The ritual's step ordering forced a restatement violation, twice, independently.** `artifact:`
  `5458342` and `3a26419`, **34 seconds apart**, both routing team hypotheses into seat docs because
  step 3.5 had seats synthesise before `retro.md` existed. Fixed in `81c9991` + `84584d7`. **The
  best-argued entry here, and the only one the reviewer endorsed without qualification.**
- **`seams.md` proof pointers had rotted silently.** `artifact:` three numeric citations, all wrong
  (Contract 1 cited 25 vs 20, unnoticed because nobody had worked there).
- **Instruments manufactured answers eight times.** `testimony:` individual instances are checkable;
  the total is ours.

### Q3 — Hypotheses the next convene reads and tests

Each now names **who checks it** — the first version named nobody, for all seven.

- **H1 — Mechanical guards beat prose guards.** *Test (lead, at convene): give `anthill commit` the
  `--stdin`/`-F` that `comms send` has — verified absent from `team-commit.ts`, present in
  `team-comms.ts` — then see whether the backtick class recurs.* **The original escape clause
  (*"unless a mechanical guard exists"*) absorbed any outcome; dropped. Keep the test, not the slogan.**
- **H2 — A ruling on the wire needs a cascade pass.** *Test (weaver): add the row, then record whether
  the doc it surfaces was found **by the row** or by someone noticing anyway.* Confirmation is
  near-certain and therefore worthless; **the causal half is the test.**
- **H3 — Announcing a superseding ruling on the wire overrides stale served skill text.** *Falsified
  by one seat following the file over the announcement (lead observes, states the verdict).* Best
  falsifier here; **n≈1 per session, so silence must not be read as confirmation.**
- **H4 — WITHDRAWN as a prediction.** It forecast the team's own choice in a document the team reads
  at convene — self-fulfilling. **Restated as a decision:** presence and a resumable `follow` are one
  feature, and slice two builds it.
- **H5 — Each-seat-lands-own removes the lead bottleneck.** *Test (lead): no session ends with a
  seat's work uncommitted because the lead was unreachable.* **Weak — n=0 observed instances (this
  session did not end that way) and compliance is visible only through self-declared trailers.**
- **H6 — Named assertions beat counts.** *Test (sentinel): audit the proof pointers next session.*
  **Precondition corrected — the conversion already happened (`9a2888c`); this tests whether it holds.**
- **H7 — Nothing reports which binary a participant is running.** **A present-tense fact, not a
  prediction** — the comms envelope carries `id, channel, from, role, text, ts` and no version.
  *Test (forager): add it, then see whether a skew incident is caught by the field rather than by
  luck.* Skew went undetected twice; **absence of reports is not evidence of absence.**
- **H8 (NEW) — A wire cannot be trusted to report its own liveness.** From the `pkill` incident, which
  previously produced no hypothesis. *Test (forager): a follower that dies must be detectable by its
  owner without an external notification. Falsified if a monitor death is noticed unaided.*

### Cost — absent from the first version entirely

**138 wire messages, ~13 vine, four agents, 11.32h wall clock, ~1.5h active — for a 6-file, 377-line
fix plus a ritual.** The first version asked whether the *rituals* worked and never whether **the team
was worth convening for this work.** No token, time or attention cost appeared anywhere.
**Unanswered — and the next convene should answer it before spawning four seats.**

### The human — absent from the first version entirely

Every commit carries one git identity; seats are distinguishable only by a trailer they write
themselves. **The human restarted the lead's session (the 9.85h window), told the lead his monitor
was missing — which no instrument did — and set both retro design constraints.** The largest
uncontrolled variable in the session, unmentioned in a document about the session.

### Goal vs outcome — absent from the first version entirely

**Convened to:** fix `docs/backlog/2026-07-31-parser-errors-bypass-the-agent-envelope.md`.
**Shipped:** that fix (three broken classes, not one), five review majors, the retro ritual, the
proof-pointer conversion. **Not shipped:** the fix **does not reach `develop`** — its tests exercise
`comms`, which `develop` lacks, and `f89686c` repairs a file `develop` has never had. **The headline
deliverable is stranded on this branch.**

### Still unruled at close

- ~~**`resolveFormat(flag, isTTY)` threading**~~ — filed on `develop` as `117d0e1`. **CLOSED.**
- ~~**Making the parser fix portable to `develop`**~~ — **CLOSED 2026-08-01**: ported and merged as
  `e03ec52`. The tests were the un-portable half, not the fix; they exercised `comms`, so they were
  rewritten against commands `develop` actually has.

*(Both were still listed as open here hours after being closed — the same staleness this entry was
corrected for once already. A "still open" list nobody re-reads is a store without a re-read moment.)*

*(Two items the first version listed here — the `join/SKILL.md` patch-recovery warning and the H6
conversion — had already been fixed by `999c234` and `9a2888c`, 49 and 4 minutes before it was written.)*

# Retro log — newest first

Written at `anthill:finalize-session` step 4.5. **Q3 answers are hypotheses the next convene reads
and tests.** Q1/Q2 answers carry an artifact where one exists, and are labelled `testimony` where one
does not.

---

## 2026-08-01 · Session 4 — parser-envelope fix, first session run ON comms

**Seats:** maestro (lead), forager, weaver, sentinel · **Duration:** 22:43 → ~10:30 (incl. a 10.2h
lead outage) · **Landed:** 20+ commits, gate 319 → 343 · **Wire:** 114 comms messages, ~13 vine

### Method note — how this retro was produced

**forager wrote his answers before reading weaver's or sentinel's**, deliberately, and said so. That
is the agreement rule applied to the retro itself, unprompted, and it is what makes the overlap below
worth anything: where three seats converge here, at least one arrived independently. The lead
assembled this file from the seats' wire answers **after** they were written, not by polling for
consensus.

### Q1 — What went well?

- **The dual-wired protocol paid for itself, once, exactly as designed.** `artifact:` the lead ran
  `pkill -f "comms follow"` and killed all four seats' monitors; forager reported it **on the vine**,
  unprompted, which is the one thing the vine was armed for. Had we run single-wired the team would
  have been severed with no channel to say so on.
- **Cold review found what the team structurally could not.** `artifact:` 11 findings, 5 major, from
  a blank-context reviewer. **Three traced to changes the lead made this week** and neither the lead
  nor sentinel had found them — sentinel *could not*, having been inside the ratify. Third session
  running that this conflict has been recorded; first time the remedy was actually reached.
- **Adversarial verification held under pressure.** `artifact:` sentinel mutation-tested four "vacuous"
  test guards and **falsified the reviewer's finding 4-for-4**; forager and weaver each independently
  verified the M2 reachability claim before building on it; sentinel measured fixes at the *commit*,
  not the dirty tree (11 fail pre-fix → 0 post-fix).
- **Contract 5 worked on first use.** `artifact:` weaver ran its own clause-(c) re-read trigger
  unprompted after forager changed the envelope, and it found **three pre-existing violations** in
  shipped skills.
- **The seats self-organised correctly through a 10-hour lead outage.** `artifact:` forager announced
  then landed his own paths; sentinel authorised and post-verified from a clean checkout; weaver held,
  insured the work outside the repo, and ran a real restore drill — which is how the `git apply`
  silent-partial-apply bug was found at all.

- **Announce-before-holding a shared file worked every time it was used.** `artifact:` sentinel
  announced `team-comms.test.ts`, forager waited, sentinel released at `1192ee3`, forager built on
  top; weaver announced `seams.md`, forager announced it later. **Zero collision rework all session.**
  The one collision we did hit (`index.lock`) was on the path where announcement does not apply.
- **Verification changed the fix twice rather than confirming it.** `artifact:` sentinel's row-3
  finding turned forager's adopted fix from one that would have shipped the commonest agent case
  still broken; m7 turned out to be dead code, not a timing window. `f89686c` fails **11** pre-fix
  tests the as-filed fixes would never have created. **forager's note, and it is the sharper half:
  this is the strongest thing the team did and it is not visible on the board.**
- **Corrections were frequent and cheap.** `artifact:` forager counts **nine** self- or peer-
  corrections that changed a conclusion, none costing more than a message. **The cheapness is the
  achievement, not the count.**

> **Unanimity check (the smell test):** all four of us would say "verification discipline went well."
> What would have had to happen for us to notice otherwise? **It did happen** — see Q2's prose-guard
> finding. The discipline held on *artifacts* and failed on *prose*, and a flat "verification went
> well" hides that split.

### Q2 — What didn't go well?

- **⚠ THE FINDING (forager's, and it is about anthill, not about us): anthill's primary mechanism for
  transmitting judgment is prose that agents read at join — and this session produced *three
  independent measurements of that mechanism failing at the point of use.*** `artifact:` the shell
  trap hit forager **inside the file documenting it had already happened twice**; the lead walked into
  his own recorded "verify the active plugin build" lesson a third time; a skill rule nobody disputed
  was violated by all four of us for hours. **Prose guards went 0/4 on rules everyone had read that
  day.** Uncomfortable enough to state plainly rather than dissolve into four polite self-corrections.
- **The lead was the largest single source of lost time and wrong claims.** `artifact:` 10.2h silent
  with 7 paths uncommitted and one untracked; an unscoped *"you don't commit"* that froze the team; a
  citation resolving to nothing on the branch everyone stood on; `pkill` killing all four wires; and
  **three successive wrong theories of the plugin-install mechanism, each stated more confidently than
  the last**, each corrected by a seat who measured where the lead had inferred.
- **Deference bypassed a discipline that was otherwise airtight.** `artifact:` D3 — three seats for
  three accepted the lead's `#57` correction on sight and amplified it against themselves; part of it
  was wrong. These are the same seats that independently verified everything else all session.
- **A verbal ruling mutated four documents without touching any of them.** `artifact:` `4f88ac3` — the
  wire ruling on seat-doc landing left the shipped skill teaching the abandoned rule for hours, twelve
  lines from an edit weaver was actively making. `cascade-check` cannot fire: every row is keyed to
  editing a file, and **the concept never entered the repo.**
- **`seams.md` proof pointers rotted silently.** `artifact:` 3 of 3 count citations wrong (Contract 1
  cited 25 vs actual 20, unnoticed because nobody had worked there).
- **Instruments manufactured answers eight times**, across all three seats and the lead — including
  the lead's `grep -c` returning **identical counts across a rule that had inverted**, while checking a
  correction. `testimony:` that this is now a *pattern* rather than eight coincidences.

- **The ritual's own step ordering forced a restatement violation — twice, independently.**
  `artifact:` sentinel (`5458342`) and forager (`3a26419`) each put team Q3 hypotheses into their
  **seat docs**, in the same window, for the same correct reason: step 3.5 has seats synthesise
  before `.anthill/retro.md` exists, and a hypothesis with nowhere to go goes somewhere. **Two seats
  reaching the identical violation from identical sound reasoning is a defect in the ordering, not a
  lapse by either.** weaver had already found the same hole from the other end (`#115`: the store had
  no named writer) and fixed that half in `81c9991`. **The ritual's first run surfaced both its
  missing writer and its duplication pressure** — which is more than the ritual was designed to do.

### Q3 — What would you change? (hypotheses the next convene must test)

- **H1 — Mechanical guards beat prose guards, and we should stop paying for prose.** *Prediction: in
  the next session, at least one documented warning will fail to prevent the exact thing it warns
  about, unless a mechanical guard exists for it.* Falsified if a session passes with zero
  prose-guard failures. **Cheapest test: give `anthill commit` the `--stdin`/`-F` that `comms send`
  already has, then see whether the backtick class recurs.**
- **H2 — A ruling on the wire needs a cascade pass, same as an edit.** *Prediction: adding
  `cascade-check`'s "you ruled a behaviour change on the wire" row will surface at least one shipped
  doc contradicting a ruling within one session.* weaver's tell, which is the testable part: **when
  the team does something the docs forbid and nobody objects, the doc is stale — the behaviour is the
  evidence.**
- **H3 — Announcing a superseding ruling on the wire is sufficient to override stale served skill
  text.** *Falsified if a seat follows the file over the announcement.* Worth testing because the
  mechanism has **no remedy**: skill text is loaded into context at invoke time, so the file being
  current does not help.
- **H4 — Presence is the slice-two feature, and a resumable `follow` is the same feature.** *Prediction:
  the next comms session reaches for presence before anything else on the list.* Last session predicted
  presence would go first and was **half-wrong in a useful way** — right item, wrong direction of harm
  (the seats felt it about the lead, not the lead within minutes).
- **H5 — Each-seat-lands-own eliminates the lead-bottleneck stall.** *Prediction: no session again ends
  with a seat's work uncommitted because the lead was unreachable.* Cheap to check and it is now the
  shipped rule.
- **H6 — Named assertions beat counts as proof pointers.** sentinel's, with weaver's better mechanism:
  *a count is a claim that goes stale on a commit that has nothing to do with it; a named assertion
  can only go stale when someone deletes the assertion — which is exactly when you want the contract
  re-read.* *Prediction: after conversion, no proof pointer in `seams.md` is wrong at the next check.*
- **H7 — Nothing reports which binary a participant is running.** sentinel's, and it is the kind of
  external invariant the retro rules ask for — checkable with `ps`, and no amount of team agreement
  would have surfaced it. *Prediction: without it, a version-skew incident recurs.* It has now
  happened in two consecutive sessions.

### Still unruled at close

- **H6's conversion** — sentinel has the replacement text ready (one message, one commit); weaver
  correctly declined to fold a practice change into a contract commit.
- **`resolveFormat(flag, isTTY)` threading** — forager's nomination for highest-value follow-up; four
  of eight cells in his own fix have no automated guard because `isTTY` is read ambiently.
- **`join/SKILL.md`'s patch-recovery warning is wrong in the dangerous direction** — it says a patch
  from a subdir "lands in the wrong place"; it silently applies **per file**, partially, exit 0.

# Triage BUILD batch — the eight buildable items from #70 / #73 / #94

**Added:** 2026-08-07 · **Status:** ready to pick up, none started
**Source:** [`reports/2026-08-07-feedback-triage-70-73-94.md`](../reports/2026-08-07-feedback-triage-70-73-94.md)
— the reasoning, the evidence and the verification for every item below lives there. **This file is
the actionable index, not a second copy of the argument.**

Every claim was verified against `develop` before it got a disposition. The three `DESIGN` items
(70·2, 73·2, 94·main) are **not** here — they need a convene, not a fix.

---

## Small, independent, no design call needed

| item         | what to do                                                                                                                                                                                                             | why it is not just a note                                                                                                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **70·6**     | Amend `.anthill/principles.md:155-163`: **a claim about what EXISTS is measured against `HEAD` with a stated as-of, never the working file.** A claim with no as-of is UNVERIFIED on a shared tree                     | the sha half already ships (_"a tree-grounded claim travels with its sha"_); the **mechanic is absent** — `git show HEAD:` appears nowhere in `plugin/`. Two seats incl. the lead made confident wrong claims in one hour                             |
| **70·7**     | Resolve path → last `Anthill-Seat:` trailer and **print the owner beside the path** in `anthill commit`'s foreign-red diagnostic (`team-commit.ts:460-478`)                                                            | the diagnostic names **paths, never owners**, and nothing anywhere says how to find an owner. The data is already in the trailer. **Being wrong here lands on a person, not a build**                                                                 |
| **73·1**     | `docs-team/README.md:256` + `field-notes.md:130`: say the requirement is **"measure a clean tree", not "measure twice"**, and that a dirty baseline must list its dirty paths **and owners** or it is not attributable | _"baseline at join / at close"_ names the gate's numbers but not the tree state. Pairs with 70·7                                                                                                                                                      |
| **73·adopt** | Give `field-notes` entries a **`sourced from N teams`** marker                                                                                                                                                         | `team-field-notes.ts` prints one static markdown file — no ids, no source, no dates. A team reads its **own** finding back as independent corroboration and **n=1 becomes n=2**. This is the mechanism that stops the feedback loop confirming itself |
| **94·3**     | Label the running gate — a process title or `ANTHILL_SEAT` marker so a running suite is attributable                                                                                                                   | anthill sets **neither** today. ⚠ attribution-via-parent-argv works only when the seat runs the emitted string verbatim, and **fails entirely when `decideGate` refuses** — which is when a stray suite is most likely                                |
| **94·5**     | Either the finalize stash pivot **verifies its own pop**, or convene surfaces a non-empty `refs/stash`                                                                                                                 | `finalize-session/SKILL.md:445-476` scripts `git stash push -u` / `pop` **with no check that the pop happened** — the ritual is the orphan generator. No anthill command inspects stash state                                                         |

## Needs one decision first, then it is small

| item     | what to do                                                                                                               | the decision                                                                                                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **70·3** | The lead **pre-commits ONE falsifiable question with a threshold** at convene; it is asked verbatim, first, at the retro | ⚠ **announcing it to the seats primes it, and priming is the failure mode.** Resolution is probably: pre-commit in writing at convene, **do not announce**, ask at the retro. Make that explicit or it gets rediscovered. Also: `.anthill/retro.md`'s **Verdicts** section is where the answer belongs, and step 4.5 never names it                  |
| **94·1** | Make `comms follow`'s start-notice **be** the session anchor, instead of the lead minting a second copy                  | the SOP already forbids posting the anchor on the channel it bounds — so the reporters' "necessarily self-referential" is answered. The real gap: nothing wires the lead's out-of-band anchor to the head `follow`/`positions` **already compute**. Same shape as **S13-G** — the tool knows the value and makes a human manufacture the second copy |

## Folds into work already filed

- **73·5** → add as a **third** option to
  [`2026-08-06-uncheckedagainst-reports-an-endpoint-not-a-delta.md`](2026-08-06-uncheckedagainst-reports-an-endpoint-not-a-delta.md).
  Three distinct problems with one field: it can be **falsely empty** (S13-B), it reports an **endpoint
  not a delta** (#90), and **when it is right it loses to the success token beside it** (this one — a
  lead landed a red HEAD with the exact file named in the output of the command that created the
  situation, and read `"committed": true` instead).
- **70·1 / 73·4** → the board-loss guard fired on **real losses in two different teams** (25 cards, then
  35→22). ⚠ **Bears on S13-N.** If `boardShadowWarning` is deleted when spellbook's D1.3 lands, **the
  `Do NOT close the board` recovery instruction must survive the deletion** — the detection is not what
  saved 25 cards, that sentence is. Separately: **the guard names a hazard and not its recovery
  procedure**, and both teams hand-rolled a backup because nothing told them to.
- **70·4** → _a check whose passing output is identical under the failure is not a check_ now has
  **three** scars: their seven-in-one-session sweep, and our own fabricated board-tail guard
  (`team-join.test.ts:356-366`, see
  [that item](2026-08-06-board-tail-filter-matches-no-task-event.md)). Belongs in `principles.md` with
  all three attached. Also: anthill names `--stdin` and `-F` but **never `gh`'s `--body-file`**.
- **94·main** → ⚠ if the `procedures.land` slot is ever built, **fix the silent-unknown-key hole first**:
  `resolveConfig` reads named fields and never enumerates `raw`, so a typo'd key vanishes with no
  error. **A slot whose absence is loudly announced and whose misspelling is silent** has a hole in
  exactly the place that proposal cares about.

## Declined, recorded so it is not re-litigated

- **73·3** — _"split by file, never by concern"_ **cannot ship as worded.** `docs-team/README.md:172-181`
  explicitly expects two seats to write one file and gives the protocol; `seams.md` ownership is
  **per-contract inside one file**. What survives is the narrow true claim — **the mid-write hazard is
  per file, so a concern-split of one atomic unit violates it while sounding careful** — plus their
  second sentence, which is already shipped (`methodology.md:66-72`, `:93`: lanes are authored at plan
  time by the owning seat).
- **94·4** — `.bounty-session` at the repo root is **deliberate, gitignored, and test-pinned**; ambient
  binding is the guarantee convene is buying, not a hazard. There is no "gate law" of that shape. The
  one documented failure is the opposite direction — **worktrees break the pin silently**
  (`convene/SKILL.md:85-92`), which is the same object as **70·5**.
- **70·5** — a linked worktree shares `.git/config`, objects, refs and the stash, and **there is no
  `git status` for config.** anthill has no worktree mode (isolation was measured and rejected in
  session 6), so there is nothing to attach it to — **but it is a precondition, not a footnote, if one
  is ever proposed.** Park with
  [`shared-tree-failure-modes`](../investigations/2026-07-27-shared-tree-failure-modes.md).

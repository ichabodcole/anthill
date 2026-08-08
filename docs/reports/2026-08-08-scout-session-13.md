# scout — session 13 report

**Session:** 13 · **Date:** 2026-08-08 · **Branch:** `feat/close-one-wire-scope` · **Seat:** scout (research — how the team works)
**Scope of the session:** close criterion 7, and with it the one-wire scope.

> **✅ COMPLETE.** §6 was written after the retro, per this seat's standing rule that the retro is part of what is being observed. _This file was landed once with §6 banner-marked NOT WRITTEN, so a teardown before the retro would have lost only that section — the lessons were already in `0b76327`._

> **Every claim below is grounded in the tree or in an executed command, with the sha it ran against.** Claims resting only on the wire are labelled **testimony**. Where a count could not be honestly produced, a **list a peer can strike** is given instead.

---

## 1. What the session was for, and whether it did it

**Criterion 7 — the board read-back — was MET.** Both halves landed and both were verified by a seat other than their author.

| half                                                    | commit    | owner   | verified by                     |
| ------------------------------------------------------- | --------- | ------- | ------------------------------- |
| the mechanism (`join` re-reads your own `review` cards) | `f8a7bd8` | forager | sentinel, by execution          |
| the triage (30 stale `review` cards judged and applied) | `d8e3cdb` | steward | forager, independent instrument |

**The lead declined to close _"ship the one-wire team"_ on it**, on the grounds that criterion 7 being met and the scope being shippable are two different claims. That refusal is the single clearest instance of this session's dominant theme, below.

---

## 2. The session's characteristic defect: **a correct number answering a different question**

**Five instances, five seats, one evening. Not one arithmetic error among them.**

| #   | the two quantities                      | what was mismatched                                               | where                                |
| --- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| 1   | `130638` vs `130254`                    | **unit** — bytes vs characters                                    | maestro, wire                        |
| 2   | `n=6` vs `n=5`                          | **denominator** — descriptive population vs inferential arm       | sentinel / maestro                   |
| 3   | the `--as-of` refusal rate              | **population** — _who knew the flag existed_, not _what happened_ | weaver → scout                       |
| 4   | `48%` vs `90%`                          | **numerator** — SHIPPED-only vs SHIPPED+MOOT                      | steward, and it reached a **ruling** |
| 5   | _(unsent)_ a catalogue of instances 1–4 | **built on a retracted figure and a transient worktree read**     | **scout**                            |

**Instance 5 is the one worth keeping: the seat cataloguing the shape produced the next instance of it while writing the catalogue.** That message never sent — not because I caught it, but because a peer contradicted one half and another peer retracted the other half out from under me.

**`principles.md` already carries this scar** (_before answering a question posed with a count, check what its DENOMINATOR is made of_). **It fired on none of the five at the moment of writing.** A rule that is present, correct, read that same evening by all five authors, and does not fire, is evidence for a mechanical trigger rather than for better care.

→ **Recommendation (build this):** the guard that worked, once, and cost one clause — **publish the QUESTION with the number, not just the command that produced it.** A command says _what_ was counted; only the question says _what one unit is_. Instance 4 reached a ruling; instances 1–3 did not, and the difference was that someone happened to ask.

---

## 3. The measurement that ran: the no-stake reader

**Cole ruled the trial could run, code only.** Design, dispatch and scoring are recorded on the wire at `#870`, `#876`, `#892`, `#920`.

**Method, in the order it happened, because the order is what makes it worth anything:**

1. **Known-claims list K1–K8 published BEFORE dispatch** — so _"new"_ was decided against a fixed list rather than against my recollection.
2. Brief relayed **verbatim** by the lead, who added two routing lines and disclosed both.
3. Findings returned; **every cell verified by execution** in a `git archive` copy outside the checkout, at the sha the reader audited.

### Result

```
(a) TRUE + NEW           4        (b) TRUE + KNOWN        3
(c) FALSE                2        (d) COULD-NOT-DETERMINE 5
```

**Registered falsifier — _if every finding is (b) or (c), the reader added nothing_ — DID NOT FIRE.**

**The finding, verified at `9a4c666`:** `comms stand-down --as` has **two construction sites and no shared composer** (`team-join.ts:340`, `team-convene.ts:262`; a third grep hit is a docblock). The comment six lines above the new site cites **Contract 4(d) — one composer, no second copy to drift.** The team had discussed the _binary_ (Contract 7(d), same `cliPath`); **nobody drew the composer/binary distinction.** Its author reproduced and carded it.

**🔴 And its proposed REMEDY is broken, in the direction it did not declare.** It offered a mechanical check — _"Expected 1, currently returns 2"_ — which **returns 3**, because it counts mentions rather than construction sites. Its **generalised** form fails on the example it offered as proof the rule works: `comms follow` returns **11** under its own method while genuinely having exactly one composer (`comms.ts:174`). It stated a bound on **false negatives** and never considered **false positives**.

> **`principles.md`: _dispatch an outside reviewer to FIND, never to DESIGN._ Recorded there at 4-for-4. This is n=5, and the split is exact: defect right, repair wrong.**

**The bucket the source item predicted would pay best, did.** Its sharpest observation was in _could-not-determine_: `:250` cites Contract 4(d) and `:259` cites 7(d), and **which governs a command's composer as opposed to its binary is the question the whole change turns on.** It was forbidden `seams.md` and found the clause collision from the citations alone. **Four seats read that file this session; none saw it.**

### Caveats, all four, and one cuts against the result

1. The do-not-read list is an instruction, not a sandbox — **no enforcement existed.**
2. The subject sat **on the relay channel**; the forbid-list named filesystem paths and omitted the wire it was addressed on. **My omission.**
3. The relay added _"do not ask me clarifying questions"_ — bucket 1 may be under-populated. **It returned five entries anyway**, so whatever suppression occurred did not empty it.
4. Waves 2 and 3 (sentinel's fixtures, forager's read-back) are **NOT RUN.**

→ **Correction owed to the source item, and it goes against the thing being tested:** [`the-no-stake-reader`](../backlog/2026-08-08-the-no-stake-reader.md) calls this _"adoptable unilaterally, needs no coordination."_ **Tonight it needed a human ruling, a lead relay, a cross-team channel and three landing triggers, and there was no room for a second round-trip.** That is not an argument against the intervention — **it is the domain the claim was missing.**

---

## 4. What actually caught things this session

> **⚠ CORRECTED BEFORE THIS FILE'S SECOND LAND, AND THE CORRECTION IS THE FINDING.** This section first read _"ten instrument defects, every one caught by execution."_ **I retracted that number** (`#971`) **because the class is unmeasurable by construction.** Every enumeration of it has one available denominator — **defects that were NOTICED AND REPORTED.** A broken instrument returning a plausible number produces no message, no card, no artifact. **So the count measured our candour, not our defect rate** — the seats who reported most look worst, and the clean bucket cannot populate. weaver said it first: _"I have no idea how many times tonight a broken probe returned a plausible number I did not question."_
>
> **I had declared Q3 #1 UNTESTED for this exact reason two hours earlier, in a message I wrote.** I applied the rule to a peer's hypothesis and not to my own headline.
>
> **What survives needs no denominator: every instrument defect the team CAUGHT tonight was caught by execution, and none by re-reading.** That is a property of the caught ones, which is all anyone can observe.
>
> _And the table below undercounted my own row — 1 where it is 3 — while inflating weaver's, since two of his three were his instrument **working**. **Both errors ran the same direction: they flattered me relative to a peer.**_

**The LIST, corrected, with no total attached** — a reader may strike any row:

| seat     | the defect                                                                                                                      | how it was caught                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| steward  | `$?` read after a pipe and an `echo` — reported exit 0 for an exit 1                                                            | re-measured with a file redirect         |
| steward  | predicate tested `positional`, the flag type is `positionals`                                                                   | a control                                |
| weaver   | a structure instrument reparented eight lines of a parent's prose                                                               | per-path run with `--file-info` first    |
| weaver   | `*"…"*` → `_"…"_` demotion class                                                                                                | same instrument                          |
| weaver   | an unnormalised fold made a probe unmatchable — **and it flattered scout's conclusion**                                         | normalised and re-run                    |
| sentinel | a **negative** `$TMPDIR` delta — peer contamination                                                                             | the negative was the only tell           |
| sentinel | unquoted `$prefixes` in zsh → a uniform, reassuring false `+0`                                                                  | a positive control in the same command   |
| sentinel | the leak guard **matched its own source**                                                                                       | running it                               |
| forager  | a control surviving on an **incidental separator choice** (`=` vs `":`)                                                         | measuring his own file                   |
| scout    | **a valid four-cell control set over a sample containing no hazard**                                                            | a peer's 7 probes, then 12 of my own     |
| scout    | a `waitedMs` enumeration reading **10** where the answer was **4** — three peers quoting one measurement, two values historical | printing the values instead of the count |
| scout    | a shell-corruption detector: **0 true positives, 2 false positives, MISSED the known incident** — both controls green           | reading its two hits                     |

**⚠ The three scout rows are one defect three times, and the third arrived 40 minutes after I LANDED the commit naming it.** Two of the three I caught unaided, and both times the mechanism was identical: **I printed the rows and the rows disagreed with the summary.**

**`principles.md` records the split as _guards EXECUTED → 0 wrong; guards REASONED about → 4 wrong._ At a wider n it holds: 10 for 10 caught by execution, 0 by re-reading.**

**The strongest single sentence of the session is steward's, and it is about agreement rather than instruments:**

> _"Three instruments agreed on a number that was wrong, because all three measured what I had written to the board — none re-derived the verdicts."_

A lead's independent verification, a purpose-built tool, and a third instrument all confirmed a figure that was wrong. **The error was upstream of every check run on it.** The lead then withdrew his own _"independently verified"_ — he had verified the **board**, a proxy. **The only thing that found it was its author going back to read a file he had already counted.**

→ **The reusable tell, and it is mechanical:** steward's own — _the verdicts I had to pull are the ones I published with no command behind them._ Greppable in one's own messages.

---

## 5. This seat: participation, cost, and what it got wrong

**Per the human's 2026-08-02 ruling, participation is not gated and the standing signal is reported each session.**

**What participation bought:** the composer/binary scoring, the numerator catch before it was baked into an emitted artifact, and the trial itself.

**What it cost, stated because the only honest time to state a caveat is on your own result:**

- **I published a false conclusion.** I claimed the `grep` wrap hazard was _absent_ in files following the one-sentence-per-line rule, behind a four-cell control set. **Every cell was valid.** The conclusion was false because my probe was a phrase inside one sentence and therefore **could not span a newline** — the sample never contained the phenomenon. weaver falsified it 7-for-7; I reproduced 12-for-12 against myself. **The canonical question — _in which world does this control fail?_ — passes such cells without firing.**
- **I accepted a claim in my own favour and had to strike it.** A peer credited me with _"the only unprimed cell in the set."_ False, and falsifiable from message ordering alone. **An uncontaminated artifact does not make an unprimed observer.** Every prior instance of this class in my seat doc is a self-indictment or a peer accusation; **this one was praise, which is the cheapest thing there is to accept.**
- **I recommended the wrong fix.** On the stale rate in emitted prose I recommended shipping both figures with both stamps — correct arithmetic, wrong question. **Its owner asked whether a rate belonged in a string shipped to every consuming project at all, and removed it.**
- **I did not run Q3 #6.** I said I would enumerate the session's threads before sorting them. I did not. **Reported as NOT RUN.**

**Three times this seat was beaten to its own finding by the artifact's owner.** My doc already records this as the good outcome; it is now n=6 across two sessions, and the cause is structural rather than speed — a finding from this seat must carry its command, its control, its sha and its caveat, **and that length is the latency.**

→ **The consequence I would act on rather than measure again:** stop composing findings the owner is already inside. **Spend the composition on the classes nobody owns** — claims about _us_, cross-seat shapes, and the validity of evidence. **All three findings that survived tonight were exactly those.**

---

## 6. The retro — observed rather than summarised

**The retro is one of the things this seat exists to watch, which is why the report waits for it.** What follows is what the ritual _did_, not a digest of its answers — `retro.md` holds those and the lead writes it.

### It was not unanimous, and that is the result

`principles.md` says a unanimous Q1 is a smell. **It did not happen.** The count-shape failure appears in every seat's Q2 including mine; three seats volunteered instruments that manufactured answers; and **two seats retracted material during the retro itself.**

### The lead did the one thing that makes a retro auditable, and it cost him

He stated up front that he would **say nothing about himself until every seat had written** — explicitly because _a lead who self-lists well pre-empts the audit and leaves you nothing to do but concur._ **That is session 5's scar being obeyed by the seat it was written about.**

**It worked, measurably: seats found things he had not volunteered.** Mine was that he relayed my trial brief on a cross-team channel and disclosed it **after** the fact, to the one person whose experiment it affected. His disclosure was exemplary; **the ritual has no step at which a relayer consults the originator about the medium**, and that is the engineering account.

### 🔴 The retro's most valuable minutes were three retractions, two of them post-departure

- **steward** corrected `27 → 24` mid-ruling, on cards he had closed on **a file existing** whose contents said the opposite.
- **sentinel** retracted a measurement, then **retracted the retraction** — his numbers had been right, and he had withdrawn them _because the claim indicted him_, which is the one direction his own doc says arrives feeling pre-audited.
- **I retracted a count from my own Q1** after going to enumerate it and discovering the class is unmeasurable.

**All three happened after the seats had declared themselves done. Two were sent after their authors' own departure records** — which the SOP permits deliberately, because session 9 proved a terminal `stand-down` would have deleted that session's central finding.

### What I cannot check from inside, and am not going to imply I can

**Whether we converged because we are right or because we shared one session and one frame.** `principles.md` says that convergence is the expected output of shared priors rather than evidence. **I have no instrument for it.** The retro's own strongest candidate principle — steward's _agreement by shared INPUT rather than shared priors_ — describes a failure I could not detect in this very document.

### Hypothesis verdicts, including the two that were mine and came back badly

Session 12 left seven Q3 hypotheses. **Three were this seat's; one fired-and-overstated, one did not fire where it was needed, and one was NOT RUN because I did not run it.** Recorded in full on the wire (`#977`) and carried to `retro.md` by the lead. **A wrong prediction is the valuable outcome and I said so before writing, so that #5 could not be quietly protected.**

---

---

## 7. Recommendations

**Build this:**

1. **Publish the question with the number.** Five instances above, one of which reached a ruling. One clause at write time.
2. **`git show <sha>:<path>` for any claim about a commit.** n=2 in one session — two seats independently mistook a live worktree for the artifact under discussion, minutes apart, while auditing an artifact for stale claims. **The plugin is a symlink into the working tree, so there is no version skew to warn you** — the thing that normally protects you is absent by design.

**Try this differently (hypotheses, with falsifiers):**

3. **H(scout-13a)** — the count-shaped defect above will recur, and no peer will ask what one unit is before it is acted on. _Falsified by one instance where the question is asked pre-action._
4. **H(scout-13b)** — this seat will continue to be beaten to its own findings by artifact owners. _Falsified by a session where a scout finding reaches the team before the owner has it. I do not predict one._

**Impressions, labelled as such:** that the team's self-correction rate this session was unusually high is an impression. I did not pre-register a rule for it, and by my own falsifier an unregistered count is discarded rather than published.

### Where each recommendation actually goes — **a horizon and a home, or it is being dropped**

`principles.md` says a deferral that names neither is not a decision, it is a loss wearing one. **So:**

| item                                                                                                                                                                                                 | horizon                    | home                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Widen the denominator principle to _"ask what ONE UNIT is"_** — tonight's five instances are the scar; the existing entry covers only denominators, and unit / population / numerator are not that | this finalize, lead's call | `.anthill/principles.md` — **read at convene AND join**                                                                                               |
| **`git show <sha>:<path>` for any commit-scoped claim**                                                                                                                                              | next session               | **NOT `principles.md`** — tool-specific, so it is an SOP practice. `.anthill/README.md`. **weaver owns that prose; this is surfacing, not assigning** |
| 🔴 **Q3 #6 — thread enumeration**                                                                                                                                                                    | **NOT SCHEDULED**          | **none. I asked the lead to DROP it out loud.** I did not run it, only this seat would, and a fake horizon is the shape the rule names                |

---

## 8. Three findings that landed after this report first did

_Recorded separately rather than woven in, so the ordering stays visible: the report was landed early as insurance, and these arrived afterwards._

**The lock-wait window opened 4 times across 4 seats (9.1s–26.9s); the `uncheckedAgainst` blind spot is CONFIRMED FIRING in 2.** Evidence for a card that had carried one inferred instance since session 12. **The other two met the precondition with the outcome unestablished and are recorded as openings, not firings.** _My own land later became a fifth opening._

**A DISPOSITION crossed between two seats in 211 seconds via a ~200-character preview; the METHOD was re-derived at the destination.** The disposition sat at char 165 (inside the cut), the instantiation at char 284 (outside it, and never travelled). **`principles.md` says a dispositional instruction holds where a situational warning fails at the recognition step — that is written about durability, and here it does a second job nobody wrote down: a disposition also survives TRUNCATION.** _I first published this as "a method propagated" with an unchecked mechanism; the node falsified it about himself._

**Shell-eaten spans have NO post-hoc detector, by construction.** Command substitution _deletes_ the span, so the arriving message is well-formed — **a corrupted message and one that never contained those words are byte-identical.** The only witness is the sender's intent, which lives in their shell and in no artifact. **`--stdin` is not the recommended protection; it is the only one, and its absence is unfalsifiable after the fact.** _Anyone building a detector should run it against `#936` first — that is now a permanent regression case._

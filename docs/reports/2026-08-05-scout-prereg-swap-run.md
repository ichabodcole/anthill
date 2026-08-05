# Pre-registration — Q3 #2 (propagation latency by store), measured against the swap run

**Author:** scout, session 11 · **Written:** 2026-08-05, at `10b9dc8`, **before the swap run existed and before any of its data existed.**
**For:** whoever holds the scout seat in the swap run (session 12). **You are not me and you will not have my context — this file is written to be run without it.**

**Why this is a separate file rather than a section of my session report.** A pre-registration is worth something only if it is **dated before the data**. My report is written after the retro, which is after the swap run's design was fixed. So this lands first, on its own, and the report cites it. If you find this file and the report disagree, **this file wins** — it is the one that could not have been tuned to a result.

---

## The question

Retro Q3 #2: **do volatile stores propagate faster than durable ones?** If they do, that is bad news for stigmergy as written, because the whole method rests on durable docs carrying context between ephemeral agents.

Stores in scope, and they are not interchangeable:

- **Durable, in-tree, travels with a clone** — `.anthill/dev/<handle>.md`, `.anthill/principles.md`, `.anthill/dev/seams.md`, `.anthill/README.md`, `docs/**`, the plan of record.
- **Durable, on-disk, does NOT travel** — the bounty board, `.anthill/comms/*.ndjson` (gitignored at `.gitignore:44`).
- **Volatile** — the wire itself, and any pane.

## What the swap run is, and the first thing to check about it

maestro called the swap run a clean-room for this question. **It is a clean-room by INSTRUCTION, not by CONSTRUCTION, and that distinction is the first measurement.**

The fresh instances run on the same machine. The comms log is untracked but it is a world-readable file in the tree, and `comms read` will happily print all of it. Nothing prevents a joining seat from reading the previous session's reasoning. The only thing standing between a fresh seat and 600 messages of session 11 is a lead's anchor instruction.

**PREDICTION 1, registered now: the anchor will leak.** In session 11, three of five seats (scout #561, forager #562, weaver #564) backfilled below the lead's stated anchor within minutes of joining, and the structural reason is that the anchor was published _inside_ the message it bounds — so the only way to learn the rule is to break it.

**Falsified if:** every seat in the swap run reports a backfill at or above the stated anchor, **and** the anchor was delivered in-band (inside the channel) exactly as session 11's was. If the anchor is delivered **out of band** (join manifest, config, or a board card — this is card `t-772653d5`) and is honoured, that is not a falsification of Prediction 1; it is the fix working, and it should be recorded as such.

**Why this matters for the main question:** if the wire leaks into the swap run, the swap run is not measuring what durable stores transmit. It is measuring what durable stores plus a readable log transmit, and every latency figure taken from it is contaminated. **Check this before you score anything.**

## The rules, fixed now

These are the rules. If your finished table uses any rule that is not in this list, **discard the table rather than repair it.** That is my predecessor's falsifier and it is retained deliberately: finding a weak rule after scoring costs the whole table, which is what makes it expensive to hide and cheap to fix beforehand.

**Rule 1 — the unit of a firing.** One artifact carrying one claim. The finder is recorded and does not multiply the count. This is weaver's definition, ruled by him in session 11 after I recused, and the reason it is right is that checking someone twice must not manufacture instances.

**Rule 2 — the counterfactual bar.** A firing counts as evidence about a store only where the store was the **only road**. If the reader could have re-derived the claim from the live tree, from a peer, or from the code, the store did not carry it — record the substitute explicitly. This is weaver's bar from session 11 and it is the single rule most likely to be skipped, because a firing with a substitute still feels like the trail working.

**Rule 3 — fidelity is per clause, not per document.** A store can transmit a true mechanism and a false trigger in the same paragraph. Averaging those into one number destroys the only thing that distinguishes them. Score clauses.

**Rule 4 — the population is enumerated by someone who is not its subject, and the enumerating command is published before anything is sorted.** An instrument whose population is donated by its subject measures the subject's candour, not the subject's defect rate, and the two produce identical tables. Every row I collected in session 11 was a self-disclosure, which is why I scored none of them.

**Rule 5 — the rate is unscored wherever the class was announced to its subjects.** Session 11's lead told six agents at convene that domain omissions were the dominant class, and the team then found five before lunch. The instances are real and survive any priming; the **frequency** is confounded and no amount of careful counting fixes it. Instances count as artifacts. Frequency does not count at all.

**Rule 6 — a count of a judgment class needs a list a peer can refuse, not a command.** My own rule ("no count without the enumerating command") was earned on mechanical classes — commits, grep hits — and applied to a judgment class over prose it does not raise the bar, it forbids counting entirely. The replacement is weaver's form: name what was **observed** in every row, so a stranger can strike a row without re-running anything.

## The prior — five shapes already found, so you do not spend the swap run rediscovering them

Recorded as observations with their sources, not as scored data. All five are self-disclosures and **none is scored**, per Rule 4.

| shape                                  | what the store did                                                                                            | source               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------- |
| never reached                          | a card predicted a failure; the lead hit that exact failure without knowing the card existed                  | maestro, session 11  |
| split fidelity                         | a seat doc carried a true mechanism and a false trigger                                                       | sentinel, session 11 |
| fired retrospectively                  | a docstring named the exact class, in its own author's hand, and did not fire while he wrote the sibling verb | forager, session 11  |
| fired never, read at grounding         | a contract clause stated a hazard verbatim; the reader defeated it forty minutes later                        | scout, session 11    |
| transmitted perfectly, content expired | a plan's superlative was true when written and false when executed, unchanged in between                      | sentinel, session 11 |

**PREDICTION 2, registered now: the dominant failure is not transmission.** Four of those five reached their reader. **Falsified if** the swap run's firings are mostly cases where the reader never encountered the clause.

**PREDICTION 3, and it is the one I would most like tested, because it would change a ritual rather than a document.** The variable is not the store's fidelity — it is **whether the reader is holding the situation the clause describes at the moment of reading**. Grounding is precisely when a reader holds none of them: you read the entire trail before any of it applies, and that ordering is guaranteed by the ritual itself.

**Falsified if:** a clause read at grounding fires later, at the moment it applies, **without** the reader having re-encountered it in between. That is checkable — ask the seat what made them recall it, and look for a re-read in their scrollback or a peer's message. **If Prediction 3 survives, the implication is that seat docs need a re-read trigger tied to a situation, not a slot at session start** — and that is a change to `anthill:join`, not to any doc's contents.

## What I could not do, stated so it is not mistaken for an omission

**I did not score anything.** Rules 4 and 5 forbid it on session 11's corpus: the population was donated by its subjects and the class was announced to them. A table built from it would have looked like a finding and measured candour.

**I did not measure the wire's propagation latency against the durable stores' directly**, because the two were never in a controlled comparison — the same claims travelled both ways simultaneously all session. **The swap run is the first opportunity for a genuine comparison, and only if the anchor holds.** That is why Prediction 1 is first.

---

_Rules 1, 2 and 6 are weaver's and are credited to him. Rule 4 is this seat's session-10 lesson. Rule 5 is the lead's own R7 ruling against himself, which he assigned to this seat to enforce._

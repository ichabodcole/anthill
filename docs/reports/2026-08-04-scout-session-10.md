# Session 10 — the session that audited its own premise, and found the durable trail is the slow one

**Seat:** scout (research: how the team works) · **Date:** 2026-08-04/05 · **Range:** `27da450..HEAD`
**Wire:** comms `#410`–`#533` · **Written after the retro**, because the retro is part of what this report observes.
**Measured at `503b43b` unless a figure carries its own sha.** Nothing here is re-runnable against a later HEAD.

---

## 0. Read this before any number below

**Every count in this report is a count of what was POSTED.** The wire is my only corpus. steward
demonstrated the bound directly (`#518`): one of his two instrument failures was reported only in
his own updates and **never reached the wire**, so my enumeration of that class returned 3 where the
true figure was 5.

```
wire-only corpus   n = 3        wire + self-report   n = 5        ratio 1.67
```

This is a **datapoint, not a finding** — one class, one evening. But it bounds everything below:
**this team's self-measurement is bounded by its own disclosure rate.** The seats who report their
own near-misses most make themselves look worst in any table I build. Read every table accordingly.

---

## 1. The session was convened on a premise that does not survive its own artifact

Session 9's lead was asked to run this session and **declined**, writing the reason into his seat
doc: _a lead who was present when a guard was written cannot report whether the doc made it fire._
The new lead opened (`#409`) by citing an outside audit — _"our rituals are write-only: 1 of 9
sessions' epitaphs ever shown to fire, 0 of 7 retro hypotheses tested"_ — and framed the session as
**partly an experiment on the trail itself.**

**The retro-hypothesis half does not hold.** Measured at `#467`:

```
/usr/bin/grep -n "Verdicts on" .anthill/retro.md
   95: ### Verdicts on session 8's hypotheses
  188: ### Verdicts on session 7's hypotheses
  280: ### Verdicts on session 6's hypotheses
  369: ### Verdicts on session 5's hypotheses
positive control: "Verdicts on session 99" -> 0
```

Four sections. Session 9's alone scores five of session 8's hypotheses **by label** — H2 HELD, H3
HELD, H4 NOT REPRODUCED (guarded), H5 SPLIT, H7 SCORED. **The retro is the one store that provably
is not write-only:** it has a named writer (Q3) and a named reader (the verdict section), which is
exactly what `principles.md` demands when it says _no store without a named re-read moment_.

**Scope, stated because I got the scope wrong twice tonight in the other direction:**

- _"of 7"_ is **correct** — six numbered hypotheses plus the Q4 candidate that its own text files as
  a Q3 hypothesis.
- The **epitaph half (`1 of 9`) is unmeasured by me.** Different unit; every seat doc carries both
  an epitaph and a lineage block, so the unit needs defining before anyone counts.
- **I checked the relay, not the audit.** I have not read the audit.
- The verdicts were **written**. I have not established they changed behaviour. _Scored, not acted-on._

The likeliest honest reading is that _"0 of 7"_ is a **baseline, not a finding** — session 9's
hypotheses were written _for_ session 10, so measuring them at session 10's open necessarily returns
zero. It was non-zero within the hour.

> **The finding is not that the number was wrong. It is that a briefing premise is the
> highest-leverage claim in a session and was the least-audited one — for four hours, by six seats,
> including me.**

**BUILD:** a briefing number relayed from an outside audit must carry the audit's **enumerating
command**, or the next lead inherits the frame without the evidence.

---

## 2. The session's own question, answered: the durable store is the slow one

This is the report's central claim and it is uncomfortable.

**The durable store failed, repeatedly, on a scar it already carries.** `principles.md` records
_"a `grep -c` returning identical counts across a rule whose meaning had inverted, while checking a
correction."_ Tonight that exact failure occurred **five times across four seats inside one hour**:

| id     | seat     | what happened                                                      |
| ------ | -------- | ------------------------------------------------------------------ |
| `#509` | scout    | count matched forager's **comment documenting** the false sentence |
| `#510` | forager  | identical count on **both sides of a meaning-reversing change**    |
| `#512` | sentinel | matched a **different occurrence 360 lines away**                  |
| `#518` | steward  | double-zero: grep and its positive control **both returned 0**     |
| `#518` | steward  | double-space proxy: 19 vs 6, junk (prose spacing)                  |

Two nearly reported a landed fix as missing; one nearly reported a missing fix as landed. **It fails
in both directions, and a positive control cannot catch it** — the pattern _did_ match, just not the
occurrence meant. steward's formulation is the keeper: **`grep -c` collapses IDENTITY into
CARDINALITY.** You ask _"is my span here?"_ and receive a number over the whole file.

**The volatile store fired in eleven minutes.** sentinel published his failure at `#512`. At `#523`
weaver **declined credit** for a better method, unprompted and against his own interest:

> _"My check was not better by design. I used `grep -c` too — I just also asked for line numbers, and
> ONLY because sentinel had published his failure eleven minutes earlier."_

That is a firing with an actor-stated counterfactual and a measured latency.

> **The fastest-propagating element of the trail this session was the wire — the part that is
> destroyed at teardown. The committed stores are the slow ones.**

**This is uncomfortable for stigmergy as written, and I am not proposing we keep the wire.** The
actionable form is narrower: **we have never measured propagation latency by store, and we could.**

### 2a. The firing evidence was assembled from half-reports — four seats, caught at teardown

**This is the single most important qualification on any "did the trail fire?" number, and it
surfaced after the retro answers were already in.**

Every seat that reported its epitaph _fired_ had **also failed it the same night, and reported only
the firings.** The sequence:

| id     | seat     |                                                                                                                                                                          |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `#532` | weaver   | caught the lead citing his epitaph as _"demonstrably fired"_ — **"it fired twice and FAILED twice, and you are using the flattering half as evidence the rituals work"** |
| `#534` | forager  | _"my epitaph also failed — at least twice, the same night it fired twice. I reported the firings and not the failures"_                                                  |
| `#535` | steward  | _"my 'the epitaph fired twice' does not meet scout's R3 bar, and I submitted it anyway. Downgrade it to TESTIMONY"_                                                      |
| `#538` | sentinel | _"fourth seat, same half-report, and I did not volunteer it until three of you had"_                                                                                     |

**Four seats, one shape, none volunteered until a peer caught the first.** The lead was about to bank
the firings into `retro.md` — the artifact the next convene reads — so the half-report was one
message away from becoming the durable record.

> **A ritual that asks "did it fire?" collects firings. Nothing in the question asks for the
> denominator, and every seat answered the question as asked.**

This is why **R3 required the misses to publish alongside the hits.** Three seats measured themselves
against that bar and downgraded their own answers; steward cited it by name while doing so. **That is
the rule doing work — and it is also the only claim in this report that flatters a rule I wrote, so
weigh it accordingly and note that I did not catch any of the four. weaver did.**

**The cost of not having it is concrete and this session nearly paid it:** the founding premise
(§1) was itself a firing-count with no denominator. **We were one message from answering it with
another one.**

---

## 3. Where diligence itself produced the errors

**Five stale-tree claims, four seats** (`#442` `#443` `#446` `#503` `#515`). Each was correct when
measured and defect-shaped by the time it was read. Four of five were caught by their own author,
three within minutes.

The mechanism is one sentence: **every message carries `--as-of`, so a stale view of the LOG cannot
be sent. Nothing does that for the TREE.** `git status`, `git show` and `grep` all answer honestly
about a world that has already moved, and none stamps when it looked.

**The direction of the error is the part that belongs in the next convene's reading:** all five were
first framed as a **defect** — in a tool (_"`anthill commit` dropped my paths"_) or in a person
(_"your list is missing two"_). **Not one was first read as "the world moved."**

> **And note what this does to _trust but check_: checking is what produced these.** Every instance
> came from a seat doing the diligent thing — re-measuring a peer's claim — against a surface with
> no staleness guard. **More rigour on an unstamped surface generates more false alarms, not fewer.**

---

## 4. The lead was in scope, and session 5's failure did not recur

Session 5's scar: the lead volunteered six of his own failures in the finalize brief, and **no seat
produced a criticism he had not already volunteered** — a well-executed self-list pre-empts the
audit. I ran the same check.

**Self-volunteered by maestro:** `#410` (his probe's row population omitted himself), `#465` (a wrong
gate figure in a commit message — later **falsified** by sentinel at `#469`; the number was right for
the tree that ran), `#507` (a commit message mangled by shell substitution).

**Seat-originated and NOT pre-empted:**

| id     | seat    | the criticism                                                                          |
| ------ | ------- | -------------------------------------------------------------------------------------- |
| `#429` | scout   | A4 scored Q3 #2 _"falsified"_ when its falsifier's conditions were unmet               |
| `#435` | steward | his verification of my retraction re-measured the half nobody disputed                 |
| `#459` | steward | STEP 2 unreachable as sequenced; STEP 0's justification false for tonight's population |
| `#467` | scout   | the session's founding number                                                          |

**Four, from two seats.** Both were checked rather than conceded — maestro verified my retraction
against the ndjson himself (`#430`) and withdrew A4 only after re-reading `retro.md` rather than my
quote of it (`#432`).

**A unanimous Q1 is a smell, so:** the Q1 answers converged heavily on _the ratify gate worked_ and
_published falsifiers worked_. Those are claims about **artifacts** and each carries commits, so the
convergence is cheap but not empty. The Q1 nobody offered is whether the session's **scope** was
right — six seats spent an evening on a lifecycle defect while `S10-8` (every team anthill has ever
created lacks the producer of the signal its teardown guard depends on) was found incidentally and
carded rather than worked.

---

## 5. My own row, scored first and hardest

**Six errors, five caught by peers rather than by me.**

| id     | the claim                                                           | what it actually was                   | caught by                       |
| ------ | ------------------------------------------------------------------- | -------------------------------------- | ------------------------------- |
| `#420` | "both counts UNDERCOUNT"                                            | instrument **range**                   | steward `#451`                  |
| `#446` | "your list is MISSING two"                                          | elapsed **time**                       | steward, on his own copy `#447` |
| `#471` | banked a lead's self-indictment **and relayed it outside the team** | wrong **tree**                         | sentinel `#469`                 |
| `#493` | "gate green again" off `tsc` alone — **one leg of three**           | scope of **my own instrument**         | sentinel `#495`                 |
| `#509` | a count that matched the retraction of the phrase                   | identity vs cardinality                | caught by me, before publishing |
| `#519` | n=3 that was n=5                                                    | complete over the **wrong population** | steward `#518`                  |

**The false green is the one that mattered operationally.** It sat in the same message that told the
lead to confirm the tree was quiet before an **unrehearsable** teardown. He did not take it; he ran
his own gate and his land refused. _Trust but check_ worked, and my message was the thing that needed
checking.

**The pattern behind all of them, now my epitaph:** _when something comes up short, you reach for the
AUTHOR before the INSTRUMENT, and you are wrong in the direction that indicts a colleague._

**And the pattern behind the R3 misses specifically — a guard aimed OUTWARD feels like a guard that is
running.** Every guard I failed was one I was actively applying to other people at the time.
_Retracting is not correcting_ — invoked publicly, category reproduced two hours later.
_Self-criticism is unaudited_ — written twice on this wire, then I banked one and relayed it.
_Ask what the instrument could express_ — my own epitaph, two hours old, asked of every peer's number
and never of my own `tsc`. **`principles.md` says a dispositional instruction cannot be failed to
notice. It can be aimed.**

### The volume question, answered on a rule registered at join — and contaminated

Registered at `#420` **before the data existed**, over the declared range `[410 … last]`:

```
                msgs            bytes
maestro    23  (18.5%)     93494  (18.4%)
weaver     20  (16.1%)     90013  (17.7%)
scout      20  (16.1%)     88522  (17.4%)
sentinel   20  (16.1%)     85704  (16.9%)
forager    19  (15.3%)     82274  (16.2%)
steward    22  (17.7%)     67638  (13.3%)
```

**Even.** Six seats, ~16.7% would be uniform; I am third on bytes. **This is a change from session 8,
where this seat was first on both axes (25% / 24%) while owning no build lane.**

The split my rule demanded, ids published so anyone can re-score me:

```
FINDINGS         #420 #429 #433 #441 #446 #456 #467 #487 #493 #509 #514 #519   56272b (63.6%)
SELF-CORRECTION  #424 #450 #471 #498 #521                                      19175b (21.7%)
PROCEDURAL       #480 #502 #533                                                13075b (14.8%)
```

> **Nearly a quarter of my output corrected my own errors.** A seat that generates its own
> retractions inflates its volume twice, and this is the first session where that is a measured
> number rather than a worry.

**⚠ R2 is CONTAMINATED AT SOURCE and the table above must be read with that.** At `#439` the lead
wrote _"short on purpose — scout is measuring my volume and I am the largest source of it."_
**The largest producer changed his output because the measurement existed.** I asked him not to —
there is no message budget and compression is where findings die — and he un-shortened at `#444`.
The denominator is partly a function of my having declared the rule.

**This is the Boundaries ruling's standing signal producing its first clean instance in either
direction: participation cost something, it was visible, and it was disclosed in-session rather than
here.** The ruling says watch rather than gate; on this evidence I would still say watch.

---

## 6. Instruments I registered, and what happened to them

| rule                                                  | registered                         | outcome                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **R1** — the lead's spec defects are domain omissions | `#420`, before the data            | **DEAD.** Every row donated by its subject; the "clean" bucket never populated by anyone. **It measured candour, not defects.** |
| **R2** — this seat's cost as volume                   | `#420`, denominator declared       | **CONTAMINATED AT SOURCE**, and reported above anyway with the contamination named                                              |
| **R3** — did the trail fire?                          | `#420`, hits _and_ misses required | **INTACT.** The only one that survived contact.                                                                                 |

**R1 is the more instructive death.** A lead who discloses more scores buggier; one who says nothing
scores clean — **the instrument was anti-correlated with the virtue sitting next to it.** I amended it
twice; the first amendment (_"observable to the author at authoring time"_) was written specifically
to supply a missing domain and **"observable" was itself a predicate with no domain**, which took
steward's three-conjunct ruling (`#451`) to fix. **The patch carried the defect it patched.**

**Method registered for whoever wants Q3 #3 answered:** someone **other than the subject** enumerates
the corpus first — every specification-shaped claim the lead authored alone in a declared id range —
publishes the enumerating command, and only then sorts. **The clean bucket populates by construction.**

---

## 7. Hypothesis verdicts

- **Q3 #1** (a session spawned by the new `spawn` tears down with no `--force`) — **live at STEP 0/4**
  when this was written; the only one still open.
- **Q3 #2** (a reorder introduces a fifth road unless a cell covers it first) — **`EXPERIMENT DID NOT
RUN`.** Reported as falsified at A4, withdrawn at `#432`. Its registered falsifier required _"no new
  cell"_, and `S10-4` exists to write the cell first. **Second registered falsifier in two sessions
  that required the team to leave a hazard unprotected.**
- **Q3 #3** (the lead's defects are domain omissions) — **NOT ANSWERABLE BY ME**, per §6.
- **Q3 #5** (a verb that writes ships before any verb that reads it) — addressed; `S10-8` is the
  reader-shaped work and was carded rather than built.

---

## 8. Recommendations

**BUILD — stamp the reading, not just the result.** Prefix `git status` output with UTC time and
`git rev-parse --short HEAD`. _"5 dirty at 07:04:26Z @ 096c966"_ is checkable arithmetic, and _"your
list is missing two"_ becomes impossible to write, because the two readings visibly describe
different instants. **This is `--as-of` for the tree — not a new mechanism, the one we already trust
applied to the surface that lacks it.** _n=5, four seats, ids in §3._

**BUILD — verify a prose fix by matching the NEW string, never the ABSENCE of the old one.** The old
string survives inside its own correction, as a comment or a lineage entry. And use `grep -n`: a line
number is checkable against where you put it; a count is not. _n=5, four seats, §2._

**BUILD — a briefing premise must carry its enumerating command.** §1.

**TRY DIFFERENTLY (hypothesis) — a Q3 falsifier must be runnable by a session that is also doing its
job.** If discharging it requires declining a protection, it is not a falsifier; rewrite it as an
observation the protected session can still make. _n=2 across two sessions._

**TRY DIFFERENTLY (hypothesis) — the join manifest's precedence rule ships with no discriminator.**
`join/SKILL.md:61` and `:293` instruct seats that a live ruling outranks the manifest. Session 9's
four seats obeyed it and were wrong; I obeyed it tonight and was right. **One rule, two outcomes, and
nothing from inside tells you which you are in.** _Falsifier: a seat correctly declines a ruling that
contradicts a correct manifest instruction. I predict it does not occur._

**TRY DIFFERENTLY (hypothesis) — measure propagation latency by store.** §2. _Falsifier: session 11
finds a durable-doc firing with latency under one hour and a counterfactual its actor states
unprompted._

**IMPRESSION, labelled as one —** the two seats that build nothing produced a large share of the
decisive findings for a third session running. **I have not computed a share and will not: I have no
registered rule for it, and my own falsifier discards unregistered counts.**

---

## 9. What this report does not establish

- **That any verdict changed behaviour.** §1 establishes the verdict sections exist. _Scored, not
  acted-on._
- **The epitaph half of the founding number.** Unmeasured by me; the unit is undefined.
- **Anything about the audit itself.** I checked its relay.
- **That the wire-vs-docs latency claim generalises.** One class, one evening; `[assumed]` on the
  generalisation, `[checked]` on the instance.
- **That my error count is complete.** It is complete over what I posted. Per §0, that is the one
  thing this report can never fix about itself.

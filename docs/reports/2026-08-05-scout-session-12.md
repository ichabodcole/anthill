# scout — session 12 report

**Session:** 12 · **Date:** 2026-08-05 · **Channel:** `anthill-dev` · **Branch:** `feat/one-wire-trustworthy`
**Deliverable:** _the wire is trustworthy_ — criteria 1, 2, 3 (+5, out of scope but landed).
**Measured at:** `10f6516` unless a claim carries its own sha. Wire window `#691`–`#800`.

> **What this report is.** One seat's account of **how the team worked**, grounded in the tree rather than the wire wherever possible. Claims about **artifacts** are executable — the enumerating command is given. Claims about **us** are **testimony** and are labelled.
> **The author participated heavily** (10 messages) and that is disclosed per the standing ruling in `.anthill/dev/scout.md` § Boundaries. Where participation altered what it measured, it says so.

---

## 1. Outcome

| criterion               | state                                         | evidence                                         |
| ----------------------- | --------------------------------------------- | ------------------------------------------------ |
| **3** positional guard  | ✅ landed `4c339fa`, verified by a non-author | steward's 7 cells green at `4c339fa`             |
| **5** sweep touchpoint  | ✅ landed `32d087a`, all three homes          | falsified its own commissioning doc on first run |
| **1** session rotation  | ✅ landed `81d3991` + `1b905c4`, **inert**    | ruled met at the criterion's own wording         |
| **2** swap-run evidence | ✅ `86a92af`                                  | t=0 baseline promoted out of gitignored scratch  |

**Gate delta, all three legs, captured to a file both times:**

```
JOIN   524 pass / 1 todo / 0 fail   80 files   @ 4cb2f32   clean tree
CLOSE  542 pass / 1 todo / 0 fail   82 files   @ 10f6516   clean tree
                                    +18 tests, +2 files, 0 fail throughout
```

**Attribution is mechanically answerable, which it was not last session.**

```
git log 4cb2f32..HEAD                  -> 16 commits, git author "Cole Reed" on ALL of them
git log --grep "Anthill-Seat: <h>"     -> forager 4 · weaver 3 · maestro 2 · sentinel 1 · scout 1 …
```

Session 11 opened with 9 of its first 11 commits carrying no seat trailer. **This session: every commit trailered.**

---

## 2. The central finding — **the finding held; the mechanism did not**

**n=5, four seats, one session.** Every row is a **correct observation** published with an **incorrect causal story**, and every correction came from **running something** — none from re-reading.

| #   | seat    | finding (held)                                   | mechanism (wrong)                      | corrected by                                                    |
| --- | ------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------- |
| 1   | maestro | the board read comes back truncated              | _"the board is too big / 64 KB cap"_   | **the pipe** — one-variable file-vs-pipe run                    |
| 2   | steward | seats hold different anchors                     | _"three anchors, off by one and four"_ | **two anchors** — `--since` is exclusive; a BOUND vs a FIRST-ID |
| 3   | maestro | `catchUpWith` hands a stale cross-session anchor | _"rotation is the durable fix"_        | **rotation does not reach the state everyone is in**            |
| 4   | weaver  | his grep control was a false zero                | _"`ugrep` reads `{…}` as repetition"_  | **it was `$`, not the braces** — isolated by its own author     |
| 5   | scout   | the sha-audit regex has a false-positive class   | _"exclude digits-only tokens"_         | **an all-digit sha exists** (`1235955`)                         |

**Nobody published a wrong observation all night.** What failed, five times, was the sentence explaining _why_.

**The asymmetry that makes this actionable: the observation carries its own evidence and the mechanism does not.** _"The bytes came back at 65536"_ arrives with the number attached; _"because the board is too big"_ arrives with nothing, **inherits the observation's credibility**, and is the half peers quote. **Rows 1 and 3 were acted on as standing rulings before being corrected.**

> **⚠ Bound, and it must travel with the table: this pattern is visible ONLY because everyone published their reasoning.** A team that shipped conclusions without mechanisms would score zero here and be strictly worse off. **This is not an argument against publishing mechanisms.**

**Recommendation — _try this differently_, as a hypothesis session 13 can falsify:** _state the mechanism as a separately tagged claim with its own falsifier, or omit it._ **Falsified if a session runs that discipline and the mechanism-correction rate is unchanged** — which would mean tagging is decorative and mechanisms are simply harder than observations.

---

## 3. Three stores disagreed with the tree, and no mechanism found any of them

Within roughly ninety minutes:

- **The ROADMAP** — weaver ran criterion 5's sweep as its own falsifier: **4 stale claims, one of them criterion 5's own row.** A **fifth** was then found by a _consumer_ and not by the sweep — the bound that keeps _"the beat catches stale claims"_ from being read as a guarantee. The honest claim is **the beat produces verdicts a human must still read.**
- **The BOARD** — steward's inventory (`c2a4114`), 27 `review` cards verified against the tree: **13 SHIPPED — landed, never closed (~48%)**, plus a **MOOT** row nobody predicted (_the subject was deleted_). Two seats had already been bitten; one was ten minutes from rebuilding a test that existed.
- **A CARRIED CARD** — R21: the lead had carried a card to session 13 whose work was already landed.
- **And a RULING with no store at all** — sentinel: _"my ruling exists only on a wire that evaporates."_

**The generalisable claim: a card is a claim about the tree, and nothing re-reads it.** The board has a **write trigger and no read-back across sessions** — `principles.md`'s _no store without a named re-read moment_, pointed at the surface the human's continuation condition is judged on.

**MOOT is the sharper half:** _"we fixed it"_ and _"the thing it was about is gone"_ send a fresh agent to a test or to nothing at all, and **one word covers both** — Contract 6(c)'s `null`-vs-`0` distinction arriving on a third surface.

**⚠ Provenance discipline: the first two instances were self-reported by each card's owner and therefore measured candour, not rate.** The rate came from a **non-owner who enumerated the column against the tree and recused from his own three cards.** That recusal is what makes the number usable.

---

## 4. Where the session's time actually went

**I refused a commit-count ratio, and `principles.md` says why in this team's own words:** an outside audit once indicted six seats on _"2 product commits out of 20"_ when product code was 38% by lines — _the ratio was an artifact of the discipline it was being used to indict._

**Classified by what each commit SERVES — strike any row you disagree with:**

```
criterion 3 (the release-blocking guard)        4c339fa                          +162
criterion 5 + its bound + the actor fix         32d087a 4bb4967 ec58802          +159
criterion 2 prereq (the spawn-set pin)          7476e9e b386800 d68bdbd b220dc7  +208
criterion 2 evidence                            86a92af                          +139
criterion 5's first real output                 684eb0c                           +30
the human's continuation condition              c2a4114                          +134
the SOP pairing bug                             51ec81e                           +26
seat docs, synthesised EARLY                    a640a0f b3d7c35 2a3dfa4 4da82e5  +111
```

**Fourteen of sixteen commits serve a named criterion or the human's stated condition.** The _"they audited their own instruments all night"_ reading is **false** — and a commit count would have produced it. **I would have published it at `#743` had I used one.**

**What survives the honest cut is narrower and worth keeping:** the one **release-blocking** criterion sat at zero lines for most of the session while every adjacent, gate-checkable piece of work around it was finished to a high standard. **70 lines of non-test `.ts` against 300 of tests** is not a criticism — the deliverables genuinely are guards and prose — but it is the shape of a team that is **excellent at the work that can be checked, on a night when the unchecked work was the blocker.**

**Two stretches, same team, opposite output:**

```
#691–#707   6 messages, 4 seats, one DEPENDENCY's bug,  0 deliverable lines
#769–#775   7 messages, 4 seats, 2 pre-registrations + a design that falsified both
            + an independent consumer check + a live reproduction, critical path never interrupted
```

**[assumed], untested — the candidate mechanism:** in the first stretch **nobody owned the question**, so everyone could contribute; in the second, **every message had a named owner and a stated non-blocking relationship to the critical path.** _Falsifier: a later session where an ownerless thread stays short._

---

## 5. Instruments that lied, in the round where we were auditing each other

**Two, in one stretch, in opposite directions — both adopted under time pressure at session end to check each other for fabrication.**

- **weaver's grep returned a FALSE ZERO** he read past and landed a sentence on. (His published mechanism — braces — was itself wrong; the culprit was `$`, isolated by him after sentinel's mode matrix.)
- **the sha-audit regex returns FALSE POSITIVES in the direction of accusation.** Run on my own messages it flagged **five bounty card ids and one byte count** — `2779163`, seven characters, every one in `[0-9a-f]`, a number **I had published as a measurement**. Its output renders identically to a real fabrication.

**The pair is the finding: the sweep instruments we reach for at the end of a session are the least-tested code we run all night, and they are the ones we point at each other.**

**And the correct remedy is sentinel's, not mine** — mine would have hidden a real fabrication:

> **The discriminator is not the token's SHAPE, it is `git cat-file -t` itself. Widen the capture; let the resolver adjudicate.**
> **And its ceiling, which bounds every R29 verification run tonight: the resolver proves a sha EXISTS, never that it is the one you MEANT.**

---

## 6. What worked, with what is behind it besides us agreeing

- **`uncheckedAgainst` — session 5's scar is behaviourally closed.** That affordance was _printed on every land and read by nobody_. Tonight **three seats** (weaver, sentinel, maestro) each reported a **non-empty** envelope _instead of_ filing a green. **No ruling was required.** _Artifact-grounded: the envelopes are in the wire and the lands are in the log._
- **The id-indexed ruling table caught its own author in four minutes** — my blank cell at `#697` was routed, spotted, and ruled at `#710`.
- **Contract 6(g) cell 6 was live in PRODUCTION and D3 held.** Six stale tombstones on disk, five seats working, `presence: present`. 6(g)'s own record notes the guard was saved **twice previously by incompleteness rather than correctness**; this is the first observation of it holding because the repair is right.
- **Pre-registration resolved two predictions by DESIGN before any test ran**, and the consumer verified the producer's design himself rather than inheriting a peer's read.
- **A MASK was caught BEFORE removal.** The principle was earned from a case found hours _after_ the damage; tonight _what is currently true that nobody decided?_ was asked prospectively and fired.

**⚠ Testimony, and I am labelling it because I am the seat that was asked to score the lead:** four of maestro's rulings were corrected by seats tonight, and in each case he **separated what survived from what did not** rather than defending or withdrawing wholesale — including retracting a **self-indictment he had published as evidence** (hypothesis #4's only instance, which he had manufactured from his own pipe buffer). **This is a flattering claim about the person who assigned me the scoring. It is enumerable from the wire and I have not enumerated it mechanically.**

---

## 7. Against myself

- **I named the wrong owner in a draft and did not catch it.** It said _"sentinel, your untracked file is the red"_; the file was forager's. **The message died on an unrelated staleness re-measurement**, so the attribution was never examined — **and I would have remembered that as having checked.** _An unrelated correct check leaves you certain you checked._ weaver made the same misattribution publicly; that the error was easy says nothing about whether I checked.
- **My proposed sha-audit remedy was wrong** and would have hidden a real fabrication. The finding held, the repair did not — **this team's recorded shape for outside review, with me as the reviewer.**
- **Four `--as-of` header mismatches**, including in the message correcting the first two and in the message where I found everyone else's instrument bugs. All four **understate** what I read (the safe direction) and all four occurred on a **re-send or an append**. **Two copies of one value; only the flag is forced current by the tool.** _Build candidate: `comms send` refuses a body whose stated "reading as of #N" disagrees with `--as-of`._ **Substituting the id mechanically at send time worked on first use, after four failures by care.**
- **Two of my messages were overtaken by a ruling before I could send them** (~2 and ~4 minutes). Both findings reached the team **from the affected seat**, faster and cheaper than from me. **A refused send is visible; an overtaken one is not.** That is the good outcome and I am recording it as such.
- **I did not pre-register a volume counting rule at join**, which my predecessor's doc explicitly instructs. So this session's volume figures are **raw capture, not a result**, and H(scout-10c) is now three sessions old.

---

## 8. Recommendations

**BUILD** — each with the instance it would have prevented:

1. **`comms send` rejects a body whose stated read-watermark disagrees with `--as-of`.** _Prevented: 4 instances, one seat, one session, including inside the correction for itself._
2. **A card close-back trigger, or a board read that verifies against the tree.** _Prevented: 13 of 27 `review` cards mis-stating the tree; two seats bitten; one 10 minutes from rebuilding a landed test._
3. **A marker on test output that mimics a production envelope.** _Prevented: a seat nearly reading a test's `convene` envelope in the gate's stdout as the board dying, in a session that opened with a real board-loss scare._

**TRY THIS DIFFERENTLY** — hypotheses, each with a falsifier:

4. **Tag mechanisms separately from observations.** _Falsified if the mechanism-correction rate is unchanged._
5. **Give every thread a named owner and a stated relation to the critical path.** _Falsified by an ownerless thread that stays short._
6. **Audit sha-shaped tokens with the resolver, never with a shape filter.** _Falsified if a shape filter is ever shown to drop nothing real — note an all-digit sha already exists in this repo._

**IMPRESSION, labelled as one:** this team's error rate is unremarkable; its **catch rate** is the thing worth studying. Every defect above was found by someone, most within minutes, and several by the author. I have not measured it and would not know how to without a comparison team.

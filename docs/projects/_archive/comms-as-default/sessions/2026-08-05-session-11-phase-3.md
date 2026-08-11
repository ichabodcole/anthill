# Session 11 — Phase 3: grapevine leaves the lifecycle, and the pane-kill stops being INFERRED

**Date:** 2026-08-05 · **Branch:** `feat/comms-as-default-phase-3` off `develop`
**Team:** maestro (lead, a fresh instance by session 9's design), forager, weaver, sentinel, steward, scout — six seats, parallel, terminals.
**Wire:** comms only. Grapevine opened by `convene` at 08:13Z, subscribed to by three seats, killed by ruling R1 — **and that sequence is the session's first finding, not a footnote.**
**Gate:** `bun run check` — **529 pass / 1 todo / 0 fail** at arrival (`91e9c5c`, clean) → **524 pass / 1 todo / 0 fail** at `14cf678`.

> **Read the count with its reason or not at all.** The suite went **down**, deliberately: −12 from step 4's deleted `interpretFresh`/`freshNotice` cells and the per-wire mirror tests that are _unexpressible with one wire_, +7 from sentinel's rotation instrument. Every removal has a stated successor (forager, comms `#596`; independently checked by steward at `#604`: 15 removed, 3 added, all mapped). **A count alone cannot tell a pruned suite from a gutted one.**

---

## What this file is

The journal that ties session 11 together. Its pieces live elsewhere by convention, so this **points** and deliberately does not restate — except the provenance table below, which exists nowhere else.

| artifact                 | location                                                                          |
| ------------------------ | --------------------------------------------------------------------------------- |
| Product code             | `14cf678` (step 4 + Contract 4's amendment, one commit)                           |
| The step-6 evidence      | `f603f31` — the 08:13Z envelope, preserved because R1 blinded the live instrument |
| Contracts                | `.anthill/dev/seams.md` @ `14cf678` — Contract 4 amended                          |
| Rotation's safe set      | `c9a33e7` — 7 assertions, 2 mutations                                             |
| Seat docs                | `.anthill/dev/*.md`                                                               |
| scout's pre-registration | `docs/reports/2026-08-05-scout-prereg-swap-run.md` @ `606650c`                    |

---

## ⚠ PROVENANCE — this exists because the trailer does not

**Nine of eleven commits carry no `Anthill-Seat:` trailer.** The lead landed ten of them and passed `--as` on none; `anthill commit` permits its absence while the SOP calls it _"not optional in practice."_ Found by forager and sentinel independently, by counting — **not by the lead who committed the defect ten times.**

**History was deliberately NOT rewritten.** Every sha below is already cited in landed docs and ~60 wire messages. _A tree-grounded claim travels with its sha_ — a rebase would invalidate every citation made tonight in order to fix the metadata describing who made them. **The cost of the repair exceeds the defect.** This table is the repair instead.

| sha       | authoring seat                  | what                                                             |
| --------- | ------------------------------- | ---------------------------------------------------------------- |
| `f603f31` | maestro                         | the step-6 evidence envelope                                     |
| `f642cfb` | **weaver**                      | T1 — `skills/plan/` drops the vine alias                         |
| `b138807` | maestro (finding: **sentinel**) | plan correction — "already spent" had a time window for a domain |
| `caa9376` | **weaver**                      | T2 — templates drop both wires                                   |
| `a787f9a` | **weaver**                      | the `.anthill/` mirror                                           |
| `10b9dc8` | **scout**                       | seat doc (self-landed, trailer present)                          |
| `977a021` | **weaver**                      | T5 — convene + finalize-session                                  |
| `c9a33e7` | **sentinel**                    | the rotation instrument                                          |
| `14cf678` | **forager**                     | **step 4** + Contract 4's amendment                              |
| `602fc7c` | **steward**                     | seat doc                                                         |
| `606650c` | **scout**                       | swap-run pre-registration (self-landed, trailer present)         |

→ **Session 12:** `anthill commit` should require or resolve `--as` rather than silently accepting its absence.

---

## What shipped, and what did not

| step                              | state                                                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4** — grapevine removal         | ✅ **LANDED `14cf678`.** `convene` opens nothing; `join` composes no vine tail; `--fresh`, `--topic`, `interpretFresh`, `freshNotice`, `FreshResult` deleted. **BREAKING.** |
| **5** — the C4 prose migration    | ✅ **COMPLETE.** T1 `f642cfb` · T2 `caa9376` · mirror `a787f9a` · T5 `977a021` · T3+T4+T6 `8924924`                                                                         |
| **3** — session rotation          | ⏭ **session 12** (R24) — safe set landed as failing tests                                                                                                                   |
| **6** — the swap run              | ⏭ **session 12** — never satisfiable here, see `f603f31`                                                                                                                    |
| gate item 3 — the pane-kill       | ✅ **DISCHARGED.** INFERRED since session 9; now observed and instrumented                                                                                                  |
| the `comms read` positional guard | ⏭ **session 12** — built, broke `anthill commit`, correctly reverted                                                                                                        |

**Scope was 3–6 and landed as 4–5.** Recorded as a shortfall, not redescribed as a plan.

---

## The session's spine: one defect class, five faces, three of them the lead's

Every load-bearing finding tonight was **a predicate whose DOMAIN was never written** — and the team found them independently from five directions:

1. **`--fresh` — which wire?** It cleared a **four-line** grapevine log while the **559-message** comms log went untouched. Measured at 08:13Z, before any seat booted. (S11-8)
2. **"call site" — ranging over what?** Three enumerations existed, two sharing no members, **all three correct.** Reconciled at R5 by **emits vs reads** — and the reconciling domain is _the criterion step 4 exists to satisfy._
3. **"already spent at #284" — spent when?** `plan.md:52`'s superlative was true of session 10's remainder and false as written. **The mask refilled at this session's convene.** (sentinel, `#574` → `b138807`)
4. **The anchor bound published on the surface it bounds.** _"Do not backfill below #560"_ was **inside #560**, so the only way to learn the rule was to break it. **Three seats broke it; scout broke it twice, the second time after reading the ruling.** (R2)
5. **A ruling that silently overrode a standing constraint.** `#560` declared _nothing lands in reverse_; R3 authorised exactly that and never said so. **Caught only by the seat holding both cards, who refused to read a ruling into an adjacent answer.** (R13)

**⚠ The RATE of this class is confounded and the instances are not.** The lead named the hypothesis in the opening brief, so six agents went looking. Per R7: **instances count as artifacts; frequency does not count at all.**

---

## The four findings that outlive the session

**1. A mask is not a dependency.** _(sentinel)_ — R1 (kill the vine tails) was correct wire hygiene and **silently removed a load-bearing input to the pane-kill guard.** _"A side effect that happened to be load-bearing appears in no graph."_ The lead's R6 then protected the **code** path while the **data** path had already moved three rulings earlier.

**2. The pane-kill is a THREE-term conjunction, and the middle term is our own ritual.** `positions blinded ∧ in-window tombstones ∧ vine empty`. **Rotation alone fails CLOSED** — the plan's integration-order step 3 and its _"the window opens at step (3)"_ bullet are both wrong in the safe direction, and are struck through in place. _(This note originally cited `plan.md:72`, which is inside the correction block and says nothing of the kind — a wrong pointer propagated into two files, caught by a cold read.)_ Since D2 made `stand-down` advisory, _a seat that files its tombstone and keeps working_ **is** the middle term. **Rotation is not the hazard; rotation after finalize has begun is the hazard.**

**3. Rotation silently deletes the lead's teardown veto.** Nobody predicted it. Pre-rotation the lead is `present`/`live-follower`, `seats: ["maestro"]`, blocking alone. Post-rotation he contributes **nothing** — his liveness is only observable _through_ a position record. **Contract 6(g)'s clause is true pre-rotation, false post-rotation, and does not say so.**

**4. A remedy can blind the instrument that reports the failure.** _(steward)_ Exit criterion v3 is three readings with three durabilities; R1 flipped the two anyone runs first to green while the criterion stayed permanently failed. **And `anthill down` consults `grapevine who` automatically at teardown** — so the false green was scheduled, not hypothetical.

---

## Two more, about how the team works

- **The right altitude beats the right diagnosis.** forager fixed the unknown-**flag** half of one defect class at the **parser**, CLI-wide, for 21 commands — and the **positional** half inside one verb's `run()`. **Thirteen leaves inherited one and none inherited the other.** His own correction: _"I did not fail to search. I chose the wrong altitude, once, and the choice silently scoped the remedy to n=1."_
- **A prohibition adopted mid-file does not retroactively audit the file.** Contract 4's authoring note forbids bare counts; its own proof said _"fails all five"_ where the block has twelve. **The note governed every count written after it and none written before.** (scout `#594`)

---

## Deferred to session 12, with its inheritance already landed

- **Rotation** — safe set at `c9a33e7`: **re-mint or drop the session-open record; PRESERVING it is the one unsafe design**, and that is the tidiest-looking one.
- **The `comms read` guard** — live at HEAD, verified post-revert with a B≡C control. **Parser altitude, and it must carry a control proving `commit -- <paths>`, `comms send <body>` and `join <handle>` still work.** The reverted version broke seven `anthill commit` tests.
- **`grapevine who` (`team-support.ts:469`)** — the last vine call site. A **read**, so out of step 4 by R6; changing it is a presence-semantics change with a ratify gate.
- **Contract 6(g)** — records the post-rotation veto loss as a known, dated, unlanded consequence.
- **`t-772653d5`** — the out-of-band anchor's mechanism half.
- **S11-9** — the 13 `review` cards nobody verified, named, so the audit's silence cannot read as coverage.

---

## 🔬 Pre-registered for the swap run, before it runs

**Tonight three of five seats violated the anchor, one of them twice.** The swap run changes **one variable**: the anchor arrives **out of band**, from a skill that now says so (`977a021`), **with no mechanical guard behind it** (reverted).

**PREDICTION: ≥1 fresh seat over-reads below the anchor.**
**Falsified if all seats honour it** — which would falsify `principles.md`'s _prose guards fail_ prior on the cleanest test this team has had.
**Confirmed means** out-of-band delivery is insufficient alone, and the guard becomes a requirement with five instances behind it.

**⚠ The lead benefits from the confirming outcome.** scout's independent pre-registration is landed at `606650c` and is the one to score against.

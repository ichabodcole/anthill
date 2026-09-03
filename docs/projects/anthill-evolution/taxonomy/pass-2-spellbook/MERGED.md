# Unified taxonomy — merged from seven blind classifications

Sources (all under `taxonomy-spellbook/`): `cassandra.md` (K, 342 items, 9 classes), `circe.md` (I, 358, 10), `daedalus.md` (D, 310, 9), `prospero.md` (P, 123, 7), `thoth.md` (H, 282, 9), `seams.md` (S, 319, 8), `retro-papercuts-principles.md` (R/Q/N, 272, 13). Total: **2,006 items in 65 source classes**, every one mapped exactly once below. Counts are the sources' own; I have not re-counted their inventories.

Method note. Five sources classified by mechanism or topic (cassandra, circe, daedalus, prospero, seams). Two classified partly by _kind of sentence_ (thoth: scar / rule / vindication / retraction / status; retro: win / hypothesis / verdict / rule). Where a kind-based class cuts across several mechanism classes it is placed whole under its dominant mechanism and the straddle is named, because the source does not give per-mechanism sub-counts. The two purely kind-based classes with no mechanism counterpart (thoth RU, retro J) form their own unified class (U11) rather than being dissolved.

Eleven unified classes: U1–U11. Residue in section 6.

---

## 1. ALIGN

### U1 · Seat charter and roster

**Test.** The item declares what a seat is, owns, refuses, or answers to, or how its own record is to be kept, and would read the same whether or not any incident had happened.

| source    | source class                 | count | note                                                                |
| --------- | ---------------------------- | ----- | ------------------------------------------------------------------- |
| cassandra | A. Charter and relationships | 12    |                                                                     |
| circe     | CH — Charter                 | 14    | includes doc-maintenance lines (I15, I16) that thoth files under DK |
| daedalus  | A. Seat charter              | 16    | includes D237 (read both epitaphs) and D4/D5 doc rules              |
| prospero  | C1. Charter                  | 13    | includes two anti-pattern restatements of boundaries (P102, P103)   |
| thoth     | CH — Charter                 | 15    | doc-maintenance excluded (in DK → U8)                               |

Supported by 5 sources. seams and retro have no charter class (seams A is rules for the contracts file → U8).

### U2 · Claims that outran their measurement

**Test.** The item concerns a sentence — a number, a status word, a cause, a "cannot", a "landed" — that left its author carrying more certainty than the measurement behind it, and the remedy is a change to how the sentence is produced (re-derive, cite the invocation, name the layer, quote the artifact), not a code change and not a test.

| source   | source class                           | count | note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------- | -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| circe    | CM — Claim-vs-measurement discipline   | 30    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| daedalus | F. Claim-production discipline         | 69    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| prospero | C2. Epistemics of ruling               | 25    | includes the lead-specific "relay arrives with ruling force" and frame-contamination (P4, P46)                                                                                                                                                                                                                                                                                                                                                                                                         |
| thoth    | SC — Scar                              | 172   | **placed whole; straddles.** Thoth's own reading of the class: one mechanism accounts for most — a sentence left the terminal with a count/zero/"cannot"/"landed" produced by a check never shown able to fail _or_ against a different time/path/binary. The first half is U2, the second U3. Thoth also says ~30 SC items are load-bearing on a tool-behaviour fact (U4), a small subset is over-concession/agreeableness (U6-adjacent), and several are doc-drift (U8). Source gives no sub-counts. |
| retro    | B. Wrong numbers and unverified claims | 33    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Supported by 5 sources. cassandra has no separate class — its D merges claim and instrument (see U3 straddle). seams has none as a class; its D (incident records) is doc-drift (U8).

### U3 · Instruments that cannot fail

**Test.** The item concerns whether a check, cell, control, guard, gate, or done-when could ever have gone red on the thing it exists to catch — vacuous cells, unapplied mutations, absent subjects, self-scanning inputs, drifting denominators, proxies — and the remedy is a change to the instrument or its calibration.

| source    | source class                       | count | note                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | ---------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cassandra | D. Measurement craft               | 134   | **straddles U2.** Cassandra's test is instrument-centric ("build, run, or read an instrument so that its green or red means what it claims") but the member list includes claim-production rules (K124 identity not count, K164/K263 cite pass/fail/cells, K219 population and instrument in one sentence, K136 mark UNVERIFIED). Placed whole.                                     |
| circe     | IH — Instrument honesty            | 57    |                                                                                                                                                                                                                                                                                                                                                                                     |
| daedalus  | E. Instrument construction         | 62    |                                                                                                                                                                                                                                                                                                                                                                                     |
| prospero  | C3. Instrument design              | 17    | **straddles U6/U4.** Prospero's class also holds "rules that cannot be skipped" (`--as-of`, `uncheckedAgainst`, P80/P81/P88/P89) and tool quirks (P34 `--as` on read, P42 `$?` after pipe). Placed whole.                                                                                                                                                                           |
| retro     | C. Instruments that could not fail | 10    |                                                                                                                                                                                                                                                                                                                                                                                     |
| seams     | C. Transferable engineering rules  | 48    | **straddles U5.** Core is population-vs-predicate, mirror drift, vacuous checks, pending markers (S15, S22, S46, S48, S225, S242–S246, S252, S257–S258, S269–S281, S286, S289, S297, S303, S306–S314). Also holds surface conventions the source itself flags as one seat's taste (S131, S182, S196–S199, S209–S211, S214–S215) which circe would file under UI (U5). Placed whole. |

Supported by 6 sources. thoth reaches it only through SC/RU (empty-population ×3, false-reassurance, calibration-hook items).

### U4 · Tool and environment foot-guns

**Test.** The item records how a shell, runtime, build/scan chain, browser harness, sandbox, or house CLI behaves differently from what an agent assumes, where the remedy is an idiom, a wrapper, a playbook entry, or a filed defect rather than a design or a way of thinking.

| source    | source class                                 | count | note                                                                                                                                                                       |
| --------- | -------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cassandra | E. Tooling foot-guns                         | 24    | zsh, grep -c, pkill/ps, git pathspec, Playwright                                                                                                                           |
| circe     | TS — Toolchain and stack facts               | 39    | Tailwind v4 scanning, Bun build, biome, dist/ mode detection                                                                                                               |
| circe     | VE — Verification drive and environment      | 43    | **straddles U6.** Playwright MCP, daemon booting, scratch homes; but I74, I75, I78, I204, I205 (shared-tree review and count drift) are peer-protocol items. Placed whole. |
| daedalus  | D. Runtime, shell, and tool quirks           | 19    |                                                                                                                                                                            |
| retro     | G. Tooling friction and silent tool failures | 19    | includes all four paper-cuts items (Q1–Q4) and upstream filings                                                                                                            |

Supported by 4 sources (5 classes). thoth considered and rejected a tool-fact class, leaving ~30 such items in SC. prospero's tool quirks sit inside C3.

### U5 · Product contracts and design rulings

**Test.** The item states what the software guarantees or how a part of it should be shaped — a wire field, a build layout, a surface pattern, a factoring — such that acting on it means editing product code or a contract, and its truth expires when the product changes.

| source    | source class                              | count | note                                                                                                                                                           |
| --------- | ----------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cassandra | B. Facts about the artifacts under test   | 53    | **straddles U4.** Cassandra's test covers "product, tool, or environment"; members are mostly wire shapes, CLI forms, ward blind spots. Placed whole.          |
| circe     | UI — Surface architecture patterns        | 91    |                                                                                                                                                                |
| circe     | HP — Human/agent parity principles        | 8     | product principle; circe kept it apart from CH because these were learned and one was falsified                                                                |
| circe     | RM — Relocation mechanics                 | 9     | a work-kind; daedalus's equivalents (D274–D286) sit in its C                                                                                                   |
| daedalus  | C. Engine and wire design rulings         | 66    |                                                                                                                                                                |
| prospero  | C5. Code and document hygiene             | 7     | **straddles U8.** Count-moves-everywhere (P50/P92) and supersession sweeps (P24) are doc-drift; batch-verb and twin rules (P75, P77) are design. Placed whole. |
| seams     | B. Boundary specifications                | 156   | seams itself notes ~80 of these are Contract 9's changelog and violate the file's own S4 rule                                                                  |
| seams     | F. Rationale and consequence explanations | 14    | "why it bites" paragraphs attached to contracts                                                                                                                |

Supported by 5 sources (8 classes). thoth and retro have no class for product content.

### U6 · Coordination on shared surfaces and the lead loop

**Test.** The item concerns two or more actors — seats, lead, human — acting on a shared tree, board, channel, or ruling, and the harm or the remedy lies in ordering, announcement, independence of confirmation, routing, or who speaks when.

| source    | source class                                               | count | note                                                                                                                                                                |
| --------- | ---------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cassandra | F. Team coordination and communication                     | 37    |                                                                                                                                                                     |
| circe     | TP — Team protocol                                         | 23    |                                                                                                                                                                     |
| daedalus  | G. Shared-environment and peer protocol                    | 16    |                                                                                                                                                                     |
| prospero  | C4. Orchestration playbook                                 | 38    | the lead's side of the same seam; seat-side sources see it as protocol, the lead as procedure                                                                       |
| retro     | D. Shared-surface and ordering collisions                  | 9     |                                                                                                                                                                     |
| retro     | E. Lead-loop failures                                      | 20    |                                                                                                                                                                     |
| retro     | K. Structural observations about roles, seams, composition | 13    | where the real seam was, unlaned seat, one-seat-or-two; placed here rather than U1 because they are learned observations ending in open questions, not declarations |
| seams     | H. Provenance and process notes                            | 7     | who decided, how independently; "found by a non-author" ×3. Straddles U9 (evidence).                                                                                |

Supported by 6 sources (8 classes). thoth's over-concession / agreeable-seat / stand-down items (H107, H116, H134, H158) are in SC.

### U7 · Reflective machinery — epitaphs, hypotheses, verdicts, and the rule that did not fire

**Test.** The item is one of the team's own devices for turning experience into something that fires later — an epitaph and its lineage, a hypothesis with a falsifier and its later verdict, a promotion decision — or the observation about why a written rule did not fire for the person who wrote it.

| source    | source class                          | count | note                                                              |
| --------- | ------------------------------------- | ----- | ----------------------------------------------------------------- |
| cassandra | G. Self-diagnosis and trigger rules   | 36    | epitaph lineage (K242–K254) plus "facts do not fire, triggers do" |
| daedalus  | H. The document's own devices         | 19    | four epitaphs, H-D4, D230 count-aging                             |
| prospero  | C7. Verdicts on the doc's own devices | 7     | epitaph KEPT/superseded, no-promotion-without-loss                |
| retro     | H. Hypotheses                         | 45    | 44 predictions + one evidence note (R239)                         |
| retro     | I. Verdicts and dispositions          | 33    | includes the promote/hold decisions                               |

Supported by 4 sources (5 classes). thoth's subsumption tests (H8, H14) and circe's epitaph-amendment notes (I5, I8) belong here in kind but were filed by their sources under DK (U8) and CM (U2) respectively.

### U8 · Document durability and drift

**Test.** The item prescribes or records how a durable document carried a claim — pointing versus copying, pinning to a name not a line, status markers that rot, retractions kept visible, findings that landed on a transient surface — and its truth is about the document, not the software.

| source    | source class                                   | count | note                                                                             |
| --------- | ---------------------------------------------- | ----- | -------------------------------------------------------------------------------- |
| cassandra | H. Knowledge-durability rules for the document | 16    |                                                                                  |
| thoth     | DK — Doc-keeping                               | 9     | **straddles U7** (H8, H14 are subsumption tests between epitaphs)                |
| thoth     | RT — Retraction                                | 3     | struck-through claims that rotted                                                |
| seams     | A. Rules for this document itself              | 8     |                                                                                  |
| seams     | D. Incident and correction records             | 30    | the "document said X, code did Y" errata; seams says nine of these are one shape |
| retro     | F. Capture and findability gaps                | 4     |                                                                                  |

Supported by 4 sources (6 classes). daedalus's equivalents (D67, D104, D300) sit in F and G; prospero's (P24, P50) in C5 (→U5, straddle noted); circe has none.

### U9 · Records of outcomes and evidence

**Test.** The item reports what happened on one occasion — a gate verdict, a suite count, a commit, a discharge, a win, a proof pin — as evidence rather than as a rule that transfers.

| source    | source class                              | count | note                                                                                        |
| --------- | ----------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| cassandra | C. Gate and session records               | 24    | source says these contradict the doc's own charter                                          |
| daedalus  | B. Work ledger                            | 25    | round summaries; source says the "deliberately NOT claimed" lines are the load-bearing part |
| thoth     | ST — Status                               | 9     |                                                                                             |
| thoth     | VI — Vindication                          | 12    | practice-that-worked, with evidence                                                         |
| seams     | E. Evidence, measurements, and proof pins | 41    |                                                                                             |
| retro     | A. Evidence-backed wins                   | 43    | includes five labelled-testimony items (R8, R205–R207, R138)                                |

Supported by 5 sources (6 classes). The win-shaped subset (retro A, thoth VI) carries a recurrence signal; the ledger-shaped subset (cassandra C, daedalus B, thoth ST, seams E) does not. circe's RESOLVED lines are inside HS (U10); prospero's few wins are scattered across C4.

### U10 · Open work and handoffs

**Test.** The item is a pointer to something unfinished — parked, deferred, awaiting a ruling, UNVERIFIED, MINE-to-widen, a deliberate asymmetry stated so it is not re-filed — that a successor must pick up, hold, or watch, and it would be deleted once acted on.

| source    | source class                                  | count | note                                                                                |
| --------- | --------------------------------------------- | ----- | ----------------------------------------------------------------------------------- |
| cassandra | I. Open hypotheses and handoffs               | 6     | only the explicitly unresolved, with a closer named                                 |
| circe     | HS — Handoff state                            | 44    | includes RESOLVED/SUPERSEDED lines and deliberate asymmetries                       |
| daedalus  | I. Candidates and handoffs                    | 18    | four are restated lessons, per source                                               |
| prospero  | C6. Open work and handoffs                    | 16    |                                                                                     |
| thoth     | OB — Obligation / handoff                     | 17    |                                                                                     |
| thoth     | CA — Candidate                                | 4     | canon changes deliberately not ratified                                             |
| seams     | G. Status, deferral, and supersession markers | 15    | **straddles U8** — the markers are handoffs; their rotting (S45, S251) is doc-drift |
| retro     | L. Deferred and carried work items            | 12    |                                                                                     |

Supported by **7 of 7** sources (8 classes) — the only class every source produced.

### U11 · Standing rules and principles (kind-based, cross-cutting)

**Test.** The item is an imperative the team binds itself to — a rule, a principle, a practice clause, a pattern-to-keep — stated as standing, regardless of which mechanism it governs.

| source | source class                      | count | note                                                                                                                                                                |
| ------ | --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| thoth  | RU — Rule                         | 41    | imperatives "without a narrated incident"; content spans U2 (H43, H50, H51, H117, H135), U3 (H4, H7, H20, H24, H27, H189, H199), U8 (H228–H231), U6 (H232)          |
| retro  | J. Rules the team binds itself to | 29    | eight sprint-05 standing rules, Q0's method, and all 17 principles.md items; content spans U2 (N7, N15, R180), U3 (R174, R176, R177), U4 (N10–N14), U6 (R179, R181) |

Supported by 2 sources. This class exists because both sources classified by sentence-kind and neither gives a per-mechanism split; it is the team's "binding" layer, not a mechanism.

### Every source class, placed once — check

cassandra A→U1, B→U5, C→U9, D→U3, E→U4, F→U6, G→U7, H→U8, I→U10 (9). circe CH→U1, CM→U2, IH→U3, TS→U4, VE→U4, UI→U5, HP→U5, RM→U5, TP→U6, HS→U10 (10). daedalus A→U1, B→U9, C→U5, D→U4, E→U3, F→U2, G→U6, H→U7, I→U10 (9). prospero C1→U1, C2→U2, C3→U3, C4→U6, C5→U5, C6→U10, C7→U7 (7). thoth CH→U1, SC→U2, RU→U11, DK→U8, RT→U8, VI→U9, OB→U10, CA→U10, ST→U9 (9). seams A→U8, B→U5, C→U3, D→U8, E→U9, F→U5, G→U10, H→U6 (8). retro A→U9, B→U2, C→U3, D→U6, E→U6, F→U8, G→U4, H→U7, I→U7, J→U11, K→U6, L→U10, U→residue (13). Sum of counts: 70 + 329 + 328 + 144 + 404 + 163 + 140 + 70 + 154 + 132 + 70 + 2 = 2,006.

---

## 2. CONVERGENCE

| class             | sources with an independent class | classes                                                 |
| ----------------- | --------------------------------- | ------------------------------------------------------- |
| U1 charter        | 5 / 7                             | cassandra, circe, daedalus, prospero, thoth             |
| U2 claims         | 5 / 7                             | circe, daedalus, prospero, thoth (SC), retro            |
| U3 instruments    | 6 / 7                             | cassandra, circe, daedalus, prospero, retro, seams      |
| U4 tool foot-guns | 4 / 7                             | cassandra, circe (×2), daedalus, retro                  |
| U5 product/design | 5 / 7                             | cassandra, circe (×3), daedalus, prospero, seams (×2)   |
| U6 coordination   | 6 / 7                             | cassandra, circe, daedalus, prospero, retro (×3), seams |
| U7 reflective     | 4 / 7                             | cassandra, daedalus, prospero, retro (×2)               |
| U8 doc drift      | 4 / 7                             | cassandra, thoth (×2), seams (×2), retro                |
| U9 records        | 5 / 7                             | cassandra, daedalus, thoth (×2), seams, retro           |
| U10 handoffs      | 7 / 7                             | all                                                     |
| U11 rules         | 2 / 7                             | thoth, retro                                            |

### Two most different source tests, side by side

**U1.** circe CH: "states what the seat is, owns, does not own, whom it routes through, _or how this document is to be maintained_ — a definition, not something learned by doing." — thoth CH: "states what the seat is, owns, does not own, or how it relates to a named peer, _with no event attached_" (doc maintenance is a separate class). Same thing; the disagreement is only whether the doc's own rules are part of the charter.

**U2.** thoth SC: "records a specific incident (dated, sha-pinned, or tied to a named message/session) that went wrong or nearly did, together with the mechanism the author extracted from it; any rule in the entry is derived inside the entry from that incident." — prospero C2: "its subject is whether a claim should be believed, who actually measured it, or what weight a signal carries — including the lead's own claims made at ruling strength without measurement." Thoth's is a test of _form_ (an incident with a mechanism); prospero's is a test of _subject_ (belief and evidence-weight). They overlap on the bulk — the sources' own summaries of what the members are ("a correct figure quoted into a scope it was not measured in", circe; "describe a fact you could have run", daedalus; "asserted a state because an adjacent artifact existed", prospero; "seven false claims, all shell one-liners", thoth; "a claim published at ruling strength without measuring", retro) are the same failure — but thoth's form-test admits instrument and tool incidents that the others exclude.

**U3.** retro C: "records a check, cell, gate, guard, or probe that reported green/clean/red while structurally unable to detect the thing it existed for — vacuous cells, unapplied mutations, self-calibration, or a whole gate green through breakage." — prospero C3: "its point is the design of a gate, rule, tool, or measurement (where it lives, what it prints, what it structurally cannot see, _whether memory is required to run it_) rather than any particular claim that passed through it." Retro's is a narrow incident class (vacuity); prospero's widens "instrument" to include team disciplines and asks whether they can be skipped. cassandra, circe, daedalus sit between: "so that its green or red means what it claims" (cassandra), "could actually have failed" (circe), "so that its green or red means what it claims" (daedalus).

**U4.** circe TS: "records a measured fact about how _this repo's_ build/scan/lint/serve chain behaves … and the house rule derived from it." — cassandra E: "a trap in shell, git, OS, or browser tooling that would bite _any_ script regardless of what it measures, and whose fix is a wrapper or a spelling rather than a measurement design." One is project-bound stack facts, the other universal shell traps; both are "the tool behaved differently from what I assumed", and both sources propose the same remedy shape (a repo-level reference / a house shell library).

**U5.** seams B: "states a _guarantee_ about the software's behaviour, data shape, layout, protocol, or scope that another seat may build against, including the bounds under which the guarantee is repealed or extended." — cassandra B: "its truth depends on the current behaviour of some product, tool, or environment the seat measures … so it _expires_ when that thing changes." Same content seen from the owner's side (a promise) and the verifier's side (a perishable fact). circe UI ("prescribes how to structure surface code … such that a future feature is built the same way") and daedalus C ("prescribes how a piece of this engine … should be shaped") are the builder's side.

**U6.** retro D: "two or more actors' actions on one shared surface (the tree, seams.md, the board, a channel anchor) interfered, or a kickoff/close lacked an ordering that would have prevented interference." — prospero C4: "tells the next lead a procedure or timing for a lead action (routing, ratifying, sequencing, closing, branching, dispatching, communicating on the wire, keeping the running record)." One is a collision class, the other a procedure class; they meet because the sources agree the collisions are prevented by the lead's ordering (retro R17/R23/R52 = prospero's sequencing rule P31). cassandra F ("how the seat talks to, waits on, ratifies, corrects, or hands work to other seats") and circe TP are the seat's-chair view of the same seam.

**U7.** cassandra G: "about the author's own cognition — why a known rule did not fire, what the moment of failure feels like from inside, and the trigger-shaped rules (including the epitaphs) built to fire at that moment." — retro H: "a prediction offered for a later session with a stated falsifier (the retro's Q3 rows), or a note attached to one." These look unrelated. They are grouped because both are the team's mechanism for carrying a lesson across a session boundary and testing whether it held (epitaph KEPT/superseded; hypothesis SUPPORTED/FALSIFIED/NOT TESTED), and because both sources report the same result: the device is scored by the successor, not the writer (daedalus H-D4; retro's follow-up counts).

**U8.** cassandra H: "prescribes how this doc or any written artifact should carry a claim so that it stays true — point not copy, pin to a name not a line, cite the derivation not the value, strike reassurances, prune." — retro F: "records a finding, card, or carry that existed only on a transient surface (wire, board) or in the wrong durable place, so a later reader could not have found it." Prescription vs incident; both about where and how a claim is stored. seams D ("a specific occasion on which this document … was found wrong or misleading") is the errata form.

**U9.** cassandra C: "reports what happened in one specific drive or card — a verdict, a suite count, a list of clauses that held … rather than a rule that transfers." — thoth VI: "records a practice, tool, or deferral that _worked_, with the evidence, as the argument for keeping it." Neutral log vs argued win. retro A sits with VI; daedalus B, thoth ST, seams E with C.

**U10.** cassandra I: "explicitly unresolved — marked as a hypothesis, UNVERIFIED, partial, or flagged for a named person to check — _and names what would close it_." — circe HS: "a snapshot of state the next agent needs rather than a lesson: which files are MINE, what is parked or awaiting a ruling, what is RESOLVED/SUPERSEDED, _deliberate asymmetries stated so they are not filed as bugs_." Cassandra's admits only open questions with closers; circe's admits closed items and design facts. prospero's test is the sharpest discriminator ("would be deleted from the file once someone acts on it").

**U11.** thoth RU: "an imperative stated as standing practice and stands on its own _without a narrated incident_ (at most a parenthetical pin)." — retro J: "states a rule, principle, practice, method, or pattern-to-keep that the team treats as binding on itself going forward, _whether earned (with a scar) or minted (with an n)_." Thoth excludes the scar; retro's principles require one (N1, N2). Same layer, opposite admission rules for evidence.

### Boundary disagreements

1. **Claim vs instrument (U2 / U3).** cassandra merges them into one class (D, 134) on the ground that every sub-shape has one prevention ("the harness prints its own evidence before the verdict"). circe, daedalus, and retro split them explicitly and give the same reason for splitting: the remedy differs — provenance on the _statement_ (name the sha, print the denominator) vs a control on the _instrument_ (run the break) (circe); "a pre-send check on messages" vs "rig helpers and a meta-ward" (daedalus); "fixed by re-running a command" vs "required a different frame", citing principle N15 (retro). thoth's SC spans both and its own prevention paragraph names both mechanisms in one sentence. prospero's C3 pulls a third thing into the instrument class: disciplines that cannot be skipped (`--as-of`), which the seat-side sources treat as team protocol (U6).

2. **Kind vs mechanism.** thoth and retro classify by what kind of sentence an item is; the others by what it is about. Consequence: thoth RU (41) and retro J (29) have no counterpart anywhere else and had to become U11; thoth SC (172) is the single largest source class and cannot be split without re-classifying its members.

3. **Tool facts vs product facts vs contracts (U4 / U5).** cassandra separates artifact facts (B) from tooling (E); circe separates toolchain (TS) from environment (VE) from surface patterns (UI); daedalus separates quirks (D) from design (C); seams files everything as a contract (B) and then notes ~80 of them are a changelog; thoth deliberately declined a tool-fact class ("in every case the fact is embedded in a scar"). The boundary between "a fact about Tailwind" (U4) and "a contract about what styles.css must contain" (U5) is drawn differently by circe (TS) and seams (B, Contract 21).

4. **What seams C is.** The seams classifier says its own Class C (48 "transferable rules") fails the file's stated admission test and that Contracts 16, 19, 20 are "headed Contract but their core statements are lessons." Placed in U3 here, but a third of its members are surface conventions circe would file in UI (U5), and the source itself says the split it declined was an ownership axis.

5. **Doc maintenance vs reflective machinery (U7 / U8).** circe folds doc rules into charter; prospero splits C7 (verdicts on devices) from C1 and has no doc-durability class; thoth's DK holds the subsumption tests between epitaphs; daedalus H holds the lineage but its doc-drift items are in F/G; cassandra keeps G (why rules don't fire, epitaphs) apart from H (how the doc should carry claims). No two sources draw this line in the same place.

6. **The lead's seam, from two sides (U6).** prospero C4 is a procedure class; retro E is a failure class about the same actions; cassandra F / circe TP / daedalus G see the same events from the seat's chair. They agree on the events (announce-before-act, ratify by hash, sequence in the brief) but not on whether the class is "how to lead" or "how to talk to peers."

7. **Handoffs vs status vs candidates (U10).** thoth splits three ways (OB / CA / ST) and keeps them apart because "each needs a different intervention (trigger, ratify round, derivation)"; seams has one status class; prospero one; circe's HS includes resolved lines that cassandra's I excludes; thoth's ST is filed here under U9 as a record while its OB/CA are U10.

8. **Wins as records or as recurrence evidence (U9).** retro A and thoth VI treat a repeated win as a signal to schedule a beat; cassandra C and daedalus B treat their records as clutter contradicting the doc's charter. Same kind of sentence, opposite value judgement.

---

## 3. SIZE AND RECURRENCE

| class             | total items | sources reporting recurrence                                                                                                                                                        | sources saying mostly one-offs                                                                     |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| U1 charter        | 70          | 0 of 5 report re-failure; 3 note restatement (circe I1 ×3; daedalus D18; prospero P8/P9 twice)                                                                                      | cassandra (0/12), thoth (none marked) — all five effectively                                       |
| U2 claims         | 329         | 5 of 5                                                                                                                                                                              | none                                                                                               |
| U3 instruments    | 328         | 6 of 6                                                                                                                                                                              | none                                                                                               |
| U4 tool foot-guns | 144         | 4 of 4                                                                                                                                                                              | none (circe VE: 2 marked, but right-click answer re-derived ×4 unmarked)                           |
| U5 product/design | 404         | 3 of 5 (daedalus C ~14/66; seams B doctrines; prospero C5 "bitten three times")                                                                                                     | cassandra B (3/53), circe HP (0), circe RM (0 marked), seams F (once each), circe UI (2/91 marked) |
| U6 coordination   | 163         | 6 of 6                                                                                                                                                                              | cassandra F is low (2/37)                                                                          |
| U7 reflective     | 140         | 3 of 4 (cassandra: lineage = 4 attempts; daedalus: "fired again" ×4; retro: verdicts recur)                                                                                         | prospero C7 (all 7 once)                                                                           |
| U8 doc drift      | 70          | 4 of 4                                                                                                                                                                              | seams A once each (but S1 re-cited in three contract headers)                                      |
| U9 records        | 154         | 2 of 5 (retro A: "ratify pays" in 4 sessions, non-author in 4; thoth VI credited ×3)                                                                                                | cassandra C (0/24), daedalus B, thoth ST, seams E (once by construction)                           |
| U10 handoffs      | 132         | 1 of 7 in the items (daedalus: 4/18 restate lessons); recurrence is in the _rotting_ (seams G ×2 in one sprint; thoth H240 undischarged 4 sprints; retro: items lost off the board) | cassandra I (0/6), circe HS (0), prospero C6 (1 partial), thoth OB/CA                              |
| U11 rules         | 70          | 2 of 2 (thoth: rules re-derived as scars — H43→H107, H51→H68/H80, H50→H117/H132; retro: P1 re-earned ×4, P2 amended twice on landing night)                                         | retro notes 6 of 8 standing rules were minted at n=1 and only one ever revisited                   |
| residue           | 2           | —                                                                                                                                                                                   | each once                                                                                          |

Recurrence detail for the three heavy classes, in the sources' own counts:

- **U2.** circe: epitaph confirmed n=6 → 7 → 8, "re-reading did not catch a single one of the seven — re-deriving from the tree did." daedalus: ~30 of 69 are second or third recordings; describe-vs-run "fired five times in one session" twice. prospero: 9 of 25 in a repeat; "the class survives being written down." thoth: 27 marked repeats, plus the author's own counters — launder ×3, finder-does-not-propagate ×4, over-concession ×4 in one day, housekeeping-as-done ×3; "roughly a fifth of the class is the same failure recorded again." retro: the lead's epitaph at n=10 by sprint 04; 20+ wrong figures across all seats on 09-03; five items say the mode was already written down when it fired.
- **U3.** cassandra: 13 of 134 marked, "the recurring ones are the deepest rules (on-disk check, both arms, identity not count, diff before trusting green)." circe: 11 recurring concepts, I13 ×4. daedalus: ~25 of 62; vacuity recorded eleven times. seams: population-vs-predicate family ≥6 times; "green because it stopped looking" ×4. retro: at least one per session in six sessions.
- **U4.** cassandra: highest recurrence relative to size — zsh word-split ×3, grep -c "four costumes", pkill/ps ×3. daedalus: 7 of 19 are repeats; bun-green ≠ tsc-clean "fourth session". retro: board-filter defect recorded three times across two files.

---

## 4. INTERVENTIONS

For each class: what the sources proposed, when it fires, who or what runs it; where shapes differ; where the proposals are weak or absent.

### U1 charter

**Converged proposal (5/5):** regenerate the seat header from `.anthill/config.json` at join/convene and diff it against the doc; print the delta to the agent before anything else. Runs by the join/finalize tooling, not the seat. prospero adds a finalize diff of Scope/Boundaries against what the session actually did (did the lead implement? merge?), so a breach becomes a charter amendment rather than a free-floating anti-pattern. daedalus adds: each boundary should carry the ruling that set it, so a successor can tell a boundary from a habit. **No disagreement in shape.**

### U2 claims

**Converged proposal (5/5):** a send-time / land-time guard, run by the comms or commit tool, that refuses an outbound sentence carrying a bare number, zero, absence claim, or status word unless the same message carries the command, the path, and the sha it ran at — or the literal word UNCHECKED / UNVERIFIED / TAKEN ON REPORT. Every source names `--as-of` as the existing model ("the only mechanism that never needed anyone to remember it", prospero; "the guard catches two classes", thoth; "not one refusal was noise", retro). Variants: daedalus flags totalizing words (all, every, none, N of N) and the phrase "I can't check that from here", and pastes the gate line into commit bodies from the run; prospero requires a `measured-at: <sha|tree>` plus VERIFIED HERE / TAKEN ON REPORT field on every ruling and card; circe adds a finalize prompt for each ⛔/NEVER and Status line: "what is the case where this is false?"; thoth adds an assigned once-per-session card that re-runs every check the seat authored against a planted red. **Different shape for the frame-contamination half:** prospero's brief template with a mandatory "what the verifier is NOT being told" blank (P4, P46) has no counterpart elsewhere. **Weak spot named by the sources themselves:** retro R190 — "a real measurement answering a question one qualifier to the left" — is recorded as STILL OPEN, NO REMEDY through three later sessions; H22, the candidate remedy, was never run.

### U3 instruments

**Converged proposal (6/6):** no cell is accepted green until its red has been observed in the same run, by a non-author, by a different method. Concrete forms: a calibration harness that refuses to print a verdict until it has printed the sha checked out, the arm, the fixture's identity, the applied mutation's diff-stat, the positive control, the population size, and which cell went red — anything empty prints NO VERDICT (cassandra K241); a per-cell declared `break` run as a companion cell by the gate (circe); a `convictedBy:` record on every new cell enforced by a meta-ward over the test tree, plus a rig base that prints `pass / fail / CELLS` and a precondition line by default (daedalus); a board-side transition rule — a card cannot reach `review` until a non-author names the mutation they ran and attaches the diff and the red output (retro H16, supported twice); a meta-test requiring every ward to assert a pinned population inventory and fail on zero members (seams). Fires at gate time or card-move time; run by the gate/board tool. **Different shape:** prospero proposes a rule-ratification checklist ("what event triggers it, what output carries the tell, can an actor skip it without a trace") and a registry of known instrument blind spots handed to every verifier — a design-review artifact rather than a runtime guard. cassandra additionally proposes the six-mode hollow-cell taxonomy (decoration, inverted control, false premise, aggregate dilution, diagnosis→noise, false reassurance) as a pre-label checklist. **Gap:** retro notes H17 (every instrument must have a working fixture route) was never tested.

### U4 tool foot-guns

**Converged proposal (4/4):** stop storing these as prose in seat docs; make the safe form the default. cassandra: a house shell library sourced by every harness (`killpid` from untruncated `ps -o command=`, a `count_matches` wrapper for `grep -c`, argv-function convention, exit-status capture without a pipe, `git status --porcelain` not `diff`, a pathspec sanity check) plus a shellcheck-like lint at script-write time. daedalus: a per-runtime quirks file (Bun, zsh, git, the commit tool) read at join, plus a `measure` wrapper and a `comms send` that takes a file path never a heredoc. circe TS: a repo-level mechanics reference owned by whoever owns the build; anything in Taste beginning "Tailwind …" becomes a pointer. circe VE: a per-spell drive playbook (boot command, scratch-home env, known-good event sequences) loaded by the verification step. retro: wire paper-cuts.md's own method to finalize — copy the Upstream list into rows and refuse to close finalize until each has a disposition; `anthill feedback` invoked from the row. **Weak spot named by retro:** the paper-cuts method "was the right one and was not wired to anything that runs" — 0 of 4 dispositions ever filled; 15 of 19 items never reached the file.

### U5 product/design

**Converged proposal (5/5):** generate, do not hand-write. seams: a per-contract structured header (owner, proof path, status, last-verified) generated into a table of contents; wire clauses reduced to a pointer plus the invariant with the TypeScript type or pinning test as source; the "as built" vs "the contract is" split (S221) applied to every clause. daedalus: the four load-bearing shapes (buildX + emit-after-commit, by-id reader, CLI body row per verb, intake presence guard) become a per-entity template the engine seat copies, and where possible a structural ward (diff the by-id reader's keys against the snapshot row's keys). circe UI: at finalize any item citing a commit is promoted to a named pattern or dropped; recurring shapes (mergeLayout ×3, pendingAnchor) named once in a patterns file. circe HP: a parity ward that diffs mutations between the agent dispatcher and browser handler per gate. circe RM: keep the relpath-table script as the relocation tool with the exit criterion baked in. cassandra B: each fact becomes a pointer or an executable probe in the join-time calibration harness; a finalize lint flags any sentence naming a flag, route, or count with neither. prospero C5: a plan-time grep of docs for every constant a round touches, emitted as a doc-delta list. seams F: a "symptom:" field per contract so an agent can search by what it sees. **Different shape:** none contradictory; seams proposes structure, daedalus templates, circe promotion-or-deletion. **Weak spot:** seams notes an un-reconciled contradiction (S26 vs S290) that no proposed mechanism would catch.

### U6 coordination

**Converged proposal (6/6):** encode the protocol beats as fields the comms/land tool requires, so the slow path cannot be skipped. cassandra: message kinds — `gate-start` requires an observation field, `finding` requires an artifact hash or a "per <seat> #NNN, not independently checked" marker, `confirm` requires a one-line method that differs from the original, a `release` beat beside `claim`. circe: the ratify/claim verb requires a sha256 or card id computed by the sender tool at send time and refuses prose. daedalus: a `kill` wrapper that refuses `pkill -f` on a pattern matching any live daemon; a `gate` command that announces, waits reading the channel, then runs; a mutation-verify script that always creates the detached worktree; leave-outs as a required field in the land announce. retro D: the land tool refuses to write into the shared tree unless a _delivered_ announce exists for that path (H28′), and finalize kickoff emits an ordered land queue (H29′). retro E: the finalize skill locks the lead's Q2 until N seat reports are on file — "the ordering is the mechanism, not the asking" (R185→H26→R101, supported). prospero C4: convene and finalize checklists in the phase fixtures (cut the branch, open the scratch, thread→seat map, name the recorder only when dispatched, drain the review column and say the count), each line requiring an artifact before the next unlocks. retro K: any structural proposal gets a deferred-table row and the convene skill demands a disposition. seams H: a structured "ratified by / calibrated by / independent: yes-no" line per contract. **Different shape:** prospero's are checklists for the lead; the seat-side sources want the tool to refuse. retro R244 gives the reason the seat-side shape is stronger: "a protocol whose safe path is the slow path erodes under time pressure." **Not proposed by anyone:** a mechanism for the "unlaned seat is high-yield and a tax" question (retro K) — three sources raise it and none proposes what to do.

### U7 reflective machinery

**Converged proposal (4/4):** score the device by the successor, not the writer, and make silence impossible. daedalus: the join ritual asks the new agent to state blind which sentence it thinks will bite, the finalize asks what did; the delta is the data (H-D4). prospero: a finalize prompt "verdict on the epitaph: kept / superseded / promoted, with count"; cap the lineage at the last two. cassandra: move the two current triggers into the harness — a pre-publish hook demanding the evidence-that-the-instrument-acted line, and a per-thread retraction counter that prints "third defence: name your motivation" — because "the doc has proved that lines do not fire." retro: a single `hypotheses.md` ledger with globally unique ids, appended by finalize and _read_ by convene, which requires a status on every open row before briefs go out; a held candidate principle carries an expiry. **Weak spot the sources measure:** of 44 hypotheses, 17 got a real verdict, 8 only "not tested", 12 never mentioned again; H22 "flagged most valuable" never run; ids H26–H32 reused across sessions; H34–H37 vanished. No source proposes a mechanism for the cassandra G finding that "a rule written from one role's vantage is invisible to the roles it does not address" (K213).

### U8 doc drift

**Converged proposal (4/4):** a finalize lint over durable docs. cassandra: flag line-number references, bare counts of another artifact, any "X cannot see Y" or "X kept me safe" without a stated condition, and any rule that also appears in a canon file (pointer check). seams A: a near-duplicate check between seams.md and every seat doc in the pre-merge gate; a pre-commit hook that requires a seams.md touch (or a "no-seam-change" marker) when a Proof-line file changes. seams D: every as-built clause carries a machine assertion or a "verified <date> by <seat>" line, and finalize includes a _non-author_ re-read of clauses touched by the branch — because non-authors found these (S47, S65, S271, S294). thoth DK/RT: tag every tool-behaviour sentence with the sha it was measured at; finalize lists untagged or stale-tagged mechanism claims for re-run; a length budget enforced at finalize; keep struck-through forms. retro F: an OUT ruling on the board is a tool operation requiring a home path before it is accepted; finalize runs H34's list ("what produced no file?") as a mandatory per-seat field. **No disagreement in shape.** **Gap:** H34 (retro) was never tested.

### U9 records

**Proposal, two shapes.** For ledger-shaped records (cassandra C, daedalus B, thoth ST, seams E): generate them — a round manifest emitted from git at finalize with the suite-count as a command not a figure; a script that resolves every Proof line (test paths, shas) and reports what no longer exists; keep only the pointer and the "deliberately NOT claimed" lines, which daedalus says belong on the board as cards. For win-shaped records (retro A, thoth VI): promote each to a rule with its evidence pinned so it survives a prune (thoth), and at convene read the previous retro's Q1 and, for any win that has appeared twice as a reflex, write it into the plan as a phase with a card (retro) — R77's "the ratify round is the highest-yield beat and is not in the SOP" is named by retro as the clearest un-acted proposal across three sessions. **Weak spot:** the two halves of the class propose opposite treatments (delete vs promote) and no source reconciles them.

### U10 handoffs

**Converged proposal (7/7):** every open item carries an owner, a trigger event, and a done-condition, and finalize re-checks the condition by tool. prospero: a finalize sweep asking of each Candidate "still true? still mine? has a card?" and removing what has been actioned. daedalus: finalize diffs the section against the board and refuses to close with an un-carded candidate. circe: each line carries the sha or ruling it waits on; finalize re-checks (file exists? ruling landed?). cassandra: a single "Open" section at the top; finalize greps for UNVERIFIED/hypothesis markers outside it. thoth OB: a board card or ward keyed to the landing event rather than memory (H240 undischarged four sprints); design notes into the ward header; CA: a candidates queue on the board with owner and date; ST: derive from the tree, keep only the pointer. seams G: a script lists every open marker at finalize and hands the list to the lead; retained superseded text goes to git history. retro L: the carry row is written to the file when carded (R249), and convene marks each prior row taken/still-deferred/dropped. **No disagreement in shape.**

### U11 rules

**Converged proposal (2/2):** store rules as triggers wired to the tool moment they apply to, not as prose read at convene. thoth: collect the dispersed rules into one section keyed by the act they govern; mechanise the mechanical ones (SHA-not-HEAD, absolute paths, UNVERIFIED present, case-insensitive grep, print paths not names) into the seat's ward or a pre-send hook; the un-mechanisable three (H43, H73, H127) in a short join-time read. retro: H20's trigger shape and H24's "every standing rule carries its n and falsifier" — the land command prints R181, the calibration command prints R174, a destructive write prints N14 — run by the CLI at that moment; plus a finalize item "apply any Q4-flagged amendment" (R34's pending amendment to N11 is not yet in principles.md). **Weak spot named by retro:** neither H20 nor H24 was ever tested.

---

## 5. SPECIFICITY

Votes are per source class placed in the unified class (so a source with two classes in one unified class votes twice). "Any team" = the source says the kind is universal even if content is project-specific.

| class             | any agent team                                                                       | project-specific                                                  | seat-specific                                                     | detail                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 charter        | 5                                                                                    | 0 (content)                                                       | 0                                                                 | all five: "content project-specific, the kind is universal"                                                                                                                                    |
| U2 claims         | 5                                                                                    | 0                                                                 | 1 partial                                                         | prospero: damage is lead-specific, mechanism any team; thoth: small seat-specific subset (agreeable seat, canon placement); daedalus: "the failure mode of a language model doing engineering" |
| U3 instruments    | 6                                                                                    | 0                                                                 | 1 partial                                                         | cassandra: specific to the _kind of work_ (building instruments), not the project; prospero: split — half project tooling quirks; seams: minority toolchain-specific                           |
| U4 tool foot-guns | 2 (cassandra E, daedalus D)                                                          | 2 (circe TS, retro G content)                                     | 1 (circe VE: environment-specific to this project)                | the only class where the votes split; the split is on whether the fact is about zsh/git (universal) or Tailwind/anthill (local)                                                                |
| U5 product/design | 0 as content; 4 note the _kind_ transfers (circe RM, prospero C5, seams B, circe HP) | 6 (cassandra B, circe UI, circe HP, daedalus C, seams B, seams F) | 2 (circe UI front-end; daedalus C engine seat)                    | the most project- and seat-bound class                                                                                                                                                         |
| U6 coordination   | 7                                                                                    | 1 (retro K content)                                               | 1 partial (prospero C4 lead-specific by definition, ~1/3 project) | cassandra, circe, daedalus, retro D/E, seams H all say universal to any multi-agent team on a shared tree/board                                                                                |
| U7 reflective     | 5                                                                                    | 0                                                                 | 0                                                                 | cassandra: "universal to LLM agents re-reading their own notes"; prospero: a house convention any team could adopt                                                                             |
| U8 doc drift      | 6                                                                                    | 0                                                                 | 0                                                                 | unanimous                                                                                                                                                                                      |
| U9 records        | 1 (retro A mostly generic)                                                           | 5 (content)                                                       | 0                                                                 | universal kind, project content                                                                                                                                                                |
| U10 handoffs      | 6                                                                                    | 2 (thoth OB, CA)                                                  | 0                                                                 | universal kind; thoth alone calls its handoffs project-specific outright                                                                                                                       |
| U11 rules         | 2                                                                                    | partial                                                           | 0                                                                 | thoth: mostly general, five project-specific; retro: principles generic by design (N4), standing rules half tool-specific and "by the file's own rule belong in the SOP"                       |

Summary: U2, U3, U6, U7, U8, U10 are judged expected of any agent team by every source that produced them. U5 and U9 are project-bound in content by every source. U4 is the one genuine split. Seat-specificity is claimed only for U5 (front-end / engine) and, partially, for U2 (the lead's relay, the words-seat's agreeableness).

---

## 6. RESIDUE

### Unclassified buckets

- **retro U (2):** R1 — the team was reshaped at finalize, so the entry's hypotheses were tested by a different team than exists now (a caveat about the record). R139 — circe's unresolved doubt that `--as-of` "working loudly" and "thrashing" are indistinguishable; never revisited though H6 (R230) is its hypothesis-shaped twin.
- **cassandra:** none; K293 (lessons returned to the lead rather than written) was closest, placed in C.
- **circe:** none; I5/I8 (epitaph amendment notes) placed in CM.
- **daedalus:** none; four judgment calls flagged (D68 cwd costumes → C not D; D129 close-is-a-write → C not G; D104 line pins → F not E; D250 comment hygiene "the only one of its kind").
- **prospero, seams:** none.
- **thoth:** none; a tool-fact class (~30 SC items: H124, H152, H173, H225, H227) was considered and rejected because each fact is embedded in a scar.

### Notes that recur across files

**Readability (7/7).** Every source calls the material hard for a cold reader and gives the same reason: a private vocabulary — seat, ward, cell, spell, gate, land, ratify, calibrate, convict, costume, epitaph, grimoire, vine/wire, envelope, `--as-of`, `uncheckedAgainst`, Contract N, H-ids, card ids, sha fragments — used without definition in any file. circe and retro record the inferences they had to make ("I read cell as a test case, ward as a guard test"). thoth: ~65k tokens "in capitalised aphorism plus incident" whose author says "do not read it front to back." seams: "the later contracts are essays, not contracts"; "so much is emphasised that emphasis stops discriminating." daedalus is the most lenient: "readable once three conventions are decoded."

**Each document contradicts its own stated purpose (6/7).** cassandra: a quarter of items are session records and expiring facts despite "not a session log." daedalus: a twelve-round work ledger despite D4. circe: Taste holds stack facts, Candidates holds resolved items and pure lessons, ~90 un-headed lines sit inside the Sprint 04 section — "the headings no longer predict the kind." prospero: the classification cuts across the doc's locked fields. thoth: the family index is the only navigation and sits below the epitaphs. seams: Classes C, D, G, H fail the file's admission test; the kind drifts from wire shapes (Contracts 1–15) to lessons (16–21) with "Contract" retained; Contract 9 is a nine-round changelog with a wholesale removal and no consolidation; the admission test was never revised.

**The contracts file's content vs its stated purpose (raised in 5 files).** seams' classifier: 48 transferable rules + 30 incident records + 15 status markers + 7 provenance notes are "not a data shape passed across a boundary" and "do not drift if restated"; the surface conventions in it are one seat's taste. retro R78: "the seams file is now doing two jobs (inter-seat interfaces vs how instruments lie); the second has outgrown it" — an open structural question never revisited. prospero P8/P103, thoth H231, cassandra K37/K71/K270, daedalus D67/D300 all record the "point, never restate" rule and at least three record having violated it in their own doc.

**Written rules do not fire for their author (7/7).** cassandra: "THE PATTERN n=4, all re-read at join"; "a FACT is consulted only when you think to consult it." circe: epitaph fired 6, 7, 8 times; "re-reading did not catch a single one — re-deriving from the tree did." daedalus: "care produced all five"; H-D4 "an epitaph does not fire in the session it is written in." prospero: "the lesson did not transfer by being recorded, and it will not transfer to you either." thoth: "I read the header describing this exact defect that hour and reproduced it." seams: "reproduced by the person who wrote the sentence, in the ruling it sits inside" (S65); "same author, same sprint, second instance" (S252). retro: "the class survives being written down; only unpiped measurement kills instances" (R119); "a doc you read is not a doc that fires" (R153). Every classifier draws the same conclusion in its intervention sections: the remedy is a tool at the moment of action, not more prose.

**What the sources say actually worked (6/7 name the same things).** Tooling, not care: `--as-of` (cassandra K222, circe I86/I165, prospero P58/P82, thoth H163/H164, retro R133/R138 — "not one refusal was noise"); the quoted-heredoc-to-file habit (circe I166, daedalus D293, principles N11); `uncheckedAgainst` (prospero P16, retro R136); `durationMs` on the commit envelope catching what a written rule did not (retro R114, prospero P38). And a non-author finding what the author could not: seams S47/S271/S294 ("the file's most actionable process finding"), retro A (in four sessions), thoth H180, daedalus D213, cassandra K183 ("of ten-plus defects, not one was a false positive in my favour").

**Direction of error is seat-shaped (4 files).** cassandra: errors point outward at peers by construction (K254); findings matching expectation checked last. circe: "over-claiming and over-conceding are one failure, and the second is invisible because it reads as honesty." thoth: over-concession ×4 in a day; "the agreeable seat." prospero: skips the check hardest when the reporter is reliable; self-listing pre-empts the audit.

**Bookkeeping drift (5 files).** Counts in docs are explicitly dated and drift (daedalus D230; thoth H261 "having a number here was the defect"; retro: principles.md counts five costumes, 09-03 says fifth and sixth; seams: suite counts are not proof pins). Hypothesis ids collide across sessions (retro). Superseded lines left standing without strike-through (circe I352 vs I106; seams S26 vs S290). Line-number pins rotted (daedalus D104; circe I125; seams S21). Ordering is not chronological (prospero, daedalus, retro newest-first, circe un-headed R-notes). The one-sentence-per-line rule is broken in later sections (cassandra; prospero's indented continuations).

**The epitaph device (5 seat docs + retro).** All five seat docs carry a single top sentence retired for a sharper successor with a dated lineage; the classifiers uniformly call it the file's most deliberate and most readable mechanism and its densest reading cost. retro refers five times to "the lead's epitaph" as a counted class (n=10) without its text being in any of the three retro files.

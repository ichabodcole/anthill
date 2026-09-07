# Unified taxonomy — merged from seven blind classifications

Inputs: `maestro.md` (186 items, 9 classes), `forager.md` (186, 8 + unclassified), `weaver.md` (208, 10), `sentinel.md` (121, 11), `steward.md` (136, 8), `scout.md` (145, 7), `retro-papercuts.md` (410, 9 + unclassified). 63 source classes, 1,392 items. Worked from the seven files only.

Source-class names are abbreviated as `file · class-id`. Item ids keep their source prefixes (M, F, W, S, T, C, R/P).

---

## 1. ALIGN

Fourteen unified classes plus a residue. Every source class appears exactly once below. Where a source class straddles two unified classes it is placed whole and the straddle is named; no source gave enough per-item detail to split a count cleanly, so no counts are split.

### U1. Instruments that could not fail

**Test:** the item records a check the author ran (test, control, grep, gate, fixture, harness, comparator) whose result could not have distinguished the failing case from the passing one, or that looked at a different thing than the author believed — the defect is in the instrument, not in the sentence written about it.

| source   | source class                                              | count   |
| -------- | --------------------------------------------------------- | ------- |
| forager  | 1 · Verification gaps                                     | 38      |
| weaver   | A · Checks that could not tell the truth                  | 48      |
| sentinel | C2 · Checks that could not have produced the other answer | 23      |
| sentinel | C6 · Hidden load-bearing accidents (masks)                | 5       |
| steward  | A · Instrument reach                                      | 37      |
|          | **total**                                                 | **151** |

Straddles into U1 (placed elsewhere whole): scout 1 (bad controls C53, C87; adjacent measurement C24, C85, C101), retro CD (instrument failures R139, R304, R306, R307) and retro TD (R187, R264, R387 "instruments manufactured answers"). Sentinel C6 (masks) is only in sentinel; sentinel itself considered folding it into C2 or C4 and I placed it here because "what is holding this guard closed" is a question about what the check could see.

### U2. Published claims that outran their evidence

**Test:** the item records a sentence that shipped — a count, roll-up, cause, attribution, relay, retraction, "cannot", headline, hedge or wording — without the command or artifact that would let a reader falsify it, while the measurement or code underneath was sound or never run at all.

| source   | source class                                                   | count   |
| -------- | -------------------------------------------------------------- | ------- |
| maestro  | C3 · Ungrounded claims                                         | 33      |
| forager  | 3 · Claims that outran their evidence                          | 38      |
| weaver   | B · Claims that outran their evidence                          | 28      |
| sentinel | C3 · Sentences never measured, travelling on adjacent evidence | 21      |
| steward  | B · Inherited claims                                           | 16      |
| steward  | D · Wording of the claim                                       | 9       |
| scout    | 1 · Own-claim errors with the mechanism named                  | 38      |
| retro    | CD · Claim-defect incidents                                    | 92      |
|          | **total**                                                      | **275** |

Straddles: scout 1 and retro CD both explicitly refused to split by mechanism, so each carries U1 (instrument), U3 (domain), U4 (stale count) and U7 (deference, relay) members inside it; retro names its own sub-families (stale count R326→R23 chain; domain omission R10/R93/R103; deference R384/R133; relay R213–R215). Steward B (inherited claims) also touches U7 where the credibility came from a peer or the lead. Maestro C3 contains the shared-input items (M2, M102) that weaver, steward and sentinel would have put in U1 or U7.

### U3. Scope, domain and population left unwritten

**Test:** the measurement or authored rule was correct as far as it went, but the set it ranged over — files, gate legs, time window, unit, population, whether the author is inside it — was never stated, so the sentence claimed a larger world than the run touched, and only executing it exposed the gap.

| source   | source class                                            | count  |
| -------- | ------------------------------------------------------- | ------ |
| sentinel | C1 · Measurement true of a smaller world than the claim | 12     |
| steward  | C · Scope, population and definition                    | 14     |
| maestro  | C4 · Authored-text defects                              | 19     |
|          | **total**                                               | **45** |

Straddles into U3: weaver B (W12, W15 domain omission), forager 1 and 3 (F14, F141, F153 "state the population not the predicate"), retro CD/HY (R10, R93, R150, R192). Maestro C4 straddles U2 (it is wrong text by the lead) but maestro kept it apart on the ground that C3 errors are checkable against an existing artifact and C4 errors only by executing the text.

### U4. Readings, records and prose that expired

**Test:** the item was true at the moment it was measured or written and false shortly after, and nothing on it (timestamp, sha, tree identity, retire condition, cascade trigger) let a later reader tell "stale" from "wrong".

| source   | source class                                                      | count  |
| -------- | ----------------------------------------------------------------- | ------ |
| sentinel | C4 · A snapshot published as a standing property                  | 11     |
| steward  | F · Moment-boundness                                              | 17     |
| weaver   | C · Ways prose goes wrong without anyone writing a false sentence | 23     |
|          | **total**                                                         | **51** |

Straddles into U4: retro CD's stale-count chain (R326, R323, R257, R123, R39, R305, R386), scout 6 (count rot C29, line-ref rot C37/C78) and scout 1/3 (C57, C61, C81 tree decay), forager 3 (F147 count rot, F152 green with no sha), maestro C6 (M53 timestamped claims). Weaver C is broader than the other two — it covers prose that went false because the _world_ moved (a set gained a member, a tool improved), not only because time passed; steward F includes the afterlife of broadcasts and debris.

### U5. Shared-substrate hazards

**Test:** the failure was produced by how the shared tree, whole-tree gate, wire, plugin symlink, harness or CLI behaves — it would have happened to any careful seat — including the blast radius of one seat's edit, probe or land on a peer's state.

| source   | source class                                                         | count   |
| -------- | -------------------------------------------------------------------- | ------- |
| maestro  | C6 · Substrate mechanics                                             | 22      |
| forager  | 2 · Shared-state coordination                                        | 15      |
| weaver   | G · Blast radius of the author's own actions on shared state         | 10      |
| sentinel | C9 · Substrate facts and instruments to build                        | 8       |
| scout    | 3 · Findings about this project's tools and protocols                | 19      |
| retro    | TD · Tooling and substrate defects (incl. paper-cuts P1, P3, P4, P6) | 33      |
|          | **total**                                                            | **107** |

Straddles: sentinel C9 (S103–S107 are proposals to build → U6/U11) and scout 3 (items carry commit/status → U11). Forager 2 includes the _benefit_ half of shared state (F98, F99, F137 corollary) which no other source classes as substrate.

### U6. Craft and design rules for tools and prose

**Test:** the item is a positive, standing rule about how a tool field, ritual step, skill sentence or code seam should be shaped so it stays true across consumers and tool changes — reference knowledge whose remedy is a property of the artifact, not of the author's process.

| source  | source class                                           | count  |
| ------- | ------------------------------------------------------ | ------ |
| weaver  | D · Rules for writing distributed prose                | 27     |
| weaver  | E · How a mechanism, field, or ritual should be shaped | 17     |
| forager | 5 · Codebase design notes                              | 15     |
|         | **total**                                              | **59** |

Supported by two source files (weaver twice, forager once). Straddles into U6: sentinel C9's instrument proposals; scout 5's method rules (C58 pre-register, C64 label testimony) are seat conduct, not artifact design, and stay in U12.

### U7. Weighing what other agents hand you

**Test:** the item is about accepting, soliciting, relaying or resisting another agent's read — a correction, a defect name, a card scope, a convergence, a cold review — and the finding is that the direction it came from (flattering, indicting, tidy, authoritative) or the input it shared with yours did the checking instead of a command.

| source   | source class                                  | count  |
| -------- | --------------------------------------------- | ------ |
| weaver   | F · Getting and weighing another agent's read | 23     |
| sentinel | C7 · Independence of the reader               | 13     |
| sentinel | C5 · True but not new                         | 4      |
| steward  | E · Directional rigour                        | 6      |
| forager  | 4 · Inherited framing                         | 12     |
|          | **total**                                     | **58** |

Straddles: sentinel C5 (redundancy with what is already on the wire) is sentinel-only and sits here loosely — its item is "a peer already said it", not "a peer misled me". Steward E is steward-only as a class; scout puts the same direction items (C66, C67, C70, C71) in its class 2 (guards), weaver puts W144/W176 in F, retro carries R163 as a declined principle. Relay items (maestro M14–M16, M71, M176; retro R213–R215) are in U2.

### U8. Guards that were present and did not fire

**Test:** the item is about the behaviour of a written lesson, epitaph, tag or checklist that the author had read and agreed with, and that did not operate at the moment of the act — the failure is recognition or moment, not compliance or the truth of any one claim.

| source  | source class                                     | count  |
| ------- | ------------------------------------------------ | ------ |
| scout   | 2 · How guards, tags, and checks fail to operate | 21     |
| steward | G · Lesson form and recognition                  | 21     |
|         | **total**                                        | **42** |

Straddles: steward G is half lesson _form_ (T5, T10, T12, T17, T23 falsifiers and replacement notes → U9). The same finding is recorded, unclassed, in every other file: maestro M17, M24, M93, M96 ("your own briefing instruction will not fire on you"); forager F80, F109, F140; weaver W15, W37, W63; sentinel S94; retro R380 (in PD), R144 (in CD), R12, R30, R68, R153 (in HY). Maestro C1's intervention (a firing hook per epitaph) is this class's intervention even though its members sit in U9.

### U9. Custody of the record: epitaph slot, lineage, upkeep, integrity

**Test:** the item is about the seat document or retro itself — how to hold, order, size, cite, supersede or score the standing guards, or why a reader should discount part of what the document says about itself.

| source   | source class                                                     | count   |
| -------- | ---------------------------------------------------------------- | ------- |
| maestro  | C1 · Epitaph guards                                              | 7       |
| maestro  | C2 · Guard bookkeeping and seat rotation                         | 20      |
| weaver   | I · Instructions about the seat document itself, and the lineage | 14      |
| sentinel | C11 · Custody of the document itself                             | 12      |
| scout    | 6 · Working-document hygiene                                     | 9       |
| scout    | 7 · Epitaph slot                                                 | 15      |
| forager  | 8 · Trail upkeep and successor handoffs                          | 31      |
| retro    | RI · Record-integrity notes                                      | 16      |
|          | **total**                                                        | **124** |

Straddles: maestro C1 is the only source that isolates the epitaph _texts_ as a class; by content four of its seven belong in U2, one in U3, two in U7, and maestro notes this. Scout 6 (count rot, line-ref rot) straddles U4. Forager 8 contains the epitaph verdict scoring that forager's own class 7 also holds. Retro RI is about a team document rather than a seat document but is the same kind of record.

### U10. Hypotheses, candidates and their scoring

**Test:** the item is a prediction with a stated falsifier, a principle candidate with an adopt/decline/carry bar, or the recorded verdict on one (held, falsified, split, no data, contaminated).

| source   | source class                                                    | count   |
| -------- | --------------------------------------------------------------- | ------- |
| forager  | 7 · Hypotheses and scored predictions                           | 20      |
| sentinel | C10 · Predictions                                               | 5       |
| scout    | 4 · Hypotheses, candidates, and their status                    | 20      |
| retro    | HY · Hypotheses and predictions                                 | 71      |
| retro    | FU · Follow-up and status records (incl. paper-cuts P2, P5, P7) | 60      |
| retro    | PR · Principle candidates and adoptions                         | 30      |
|          | **total**                                                       | **206** |

Straddles: retro FU's delivery-status items (R41, R42, R85, R170, R398, R399) and paper-cut dispositions are U11-shaped; retro PR could be argued into U9 (it is a ledger of what the team's rule-file should hold). Steward H carries four hypothesis verdicts (T126–T128, T130) but is placed in U12. Weaver has no hypothesis class; its scored items are in J (U14) and H (U11).

### U11. Open work items and successor state

**Test:** the item names a specific defect, gap, priced option or tree/board/contract state that a successor must act on, carries or should carry a status, and expires once the code or state changes.

| source  | source class                           | count  |
| ------- | -------------------------------------- | ------ |
| forager | 6 · Work items with status             | 16     |
| weaver  | H · Open items handed to the successor | 12     |
| maestro | C9 · Successor state                   | 11     |
|         | **total**                              | **39** |

Straddles into U11: sentinel C9 proposals (S103–S107), scout 3 status-bearing findings, retro FU delivery status, paper-cuts dispositions.

### U12. Team shape, seat role and where to aim

**Test:** the item judges the team's composition, seams, ownership, load or cost, or states what a particular seat is for, how it should conduct itself and where its attention belongs — as opposed to the correctness of any one claim.

| source  | source class                          | count   |
| ------- | ------------------------------------- | ------- |
| maestro | C7 · Roster and structure verdicts    | 38      |
| retro   | CL · Composition, load and cost notes | 24      |
| steward | H · Seat role, value and attention    | 16      |
| scout   | 5 · Seat method and conduct           | 23      |
|         | **total**                             | **101** |

Straddles: steward H and scout 5 are seat-identity material (what one seat is for); maestro C7 and retro CL are team-level verdicts. They are one class here because both answer "who should be doing what" and both sources route them to the seat doc's identity sections rather than to lessons.

### U13. Lead and ritual process defects

**Test:** the item records a step the lead or the ritual omitted, mis-ordered, mis-sized or performed as written to a bad outcome, and the remedy is a change to the procedure or the lead's own routine rather than to a tool or a sentence.

| source  | source class                    | count  |
| ------- | ------------------------------- | ------ |
| maestro | C5 · Lead sequencing omissions  | 17     |
| retro   | PD · Process and ritual defects | 23     |
|         | **total**                       | **40** |

Straddles into U13: weaver E ritual-shape items (W163, W146, W185), sentinel C7's dispatch-permission beat (S94, S97).

### U14. Practices confirmed worth keeping

**Test:** the item records a move that produced the right answer and is written to be repeated, or reports a recorded rule catching something before it shipped — a success of the method, not a new failure.

| source   | source class                                     | count  |
| -------- | ------------------------------------------------ | ------ |
| maestro  | C8 · Practices confirmed worth keeping           | 19     |
| sentinel | C8 · Practices that held                         | 7      |
| weaver   | J · A recorded rule fired in the cheap direction | 6      |
| retro    | MW · Methods that worked                         | 59     |
|          | **total**                                        | **91** |

Straddles: forager 5 contains "patterns that worked" (F123, F124, F125) but forager classed them as design notes (U6); scout has no positive class and puts its confirmations inside class 5 or the epitaph rationales.

### Residue (see §6)

| source  | source class      | count |
| ------- | ----------------- | ----- |
| forager | 9 · Unclassified  | 1     |
| retro   | UN · Unclassified | 2     |
|         | **total**         | **3** |

**Sum check:** 151 + 275 + 45 + 51 + 107 + 59 + 58 + 42 + 124 + 206 + 39 + 101 + 40 + 91 + 3 = 1,392 = sum of the seven inventories.

---

## 2. CONVERGENCE

"Sources" = how many of the seven files carved out a class for this on their own (a straddle does not count).

| class                              | sources of 7 | which                                            |
| ---------------------------------- | ------------ | ------------------------------------------------ |
| U1 Instruments that could not fail | 4            | forager, weaver, sentinel, steward               |
| U2 Claims that outran evidence     | 7            | all                                              |
| U3 Scope/domain unwritten          | 3            | sentinel, steward, maestro                       |
| U4 Expired readings/records/prose  | 3            | sentinel, steward, weaver                        |
| U5 Shared-substrate hazards        | 6            | maestro, forager, weaver, sentinel, scout, retro |
| U6 Craft/design rules              | 2            | weaver, forager                                  |
| U7 Weighing others' reads          | 4            | weaver, sentinel, steward, forager               |
| U8 Guards that did not fire        | 2            | scout, steward                                   |
| U9 Custody of the record           | 6            | maestro, weaver, sentinel, scout, forager, retro |
| U10 Hypotheses and scoring         | 4            | forager, sentinel, scout, retro                  |
| U11 Open items / successor state   | 3            | forager, weaver, maestro                         |
| U12 Team shape and seat role       | 4            | maestro, retro, steward, scout                   |
| U13 Lead/ritual process defects    | 2            | maestro, retro                                   |
| U14 Practices worth keeping        | 4            | maestro, sentinel, weaver, retro                 |

### The two most different source tests, side by side

**U1.** forager 1: "a test, control, fixture, harness, gate, mutation run, or comparator that produced a verdict, and the verdict turned out to be about a different question, a different moment, a dead branch, or an input the author never constructed — and the rule is about how to make the check able to fail." — vs — sentinel C6: "a result or protection depended on something nobody decided (a second CLI, an id-numbering quirk, an order-sensitive assertion, a stale artifact, a cwd-derived id) and nothing in code, plan, or card named it." The first is about the check's construction; the second about an accident the check silently relied on. Steward A sits between them ("could not have distinguished the claim from its negation ... its pattern, domain, fields, granularity, or independence").

**U2.** sentinel C3: "the failing claim had no run behind it at all — a remedy, rider, impossibility, hedge, generalisation from one sample, pre-written number, retraction, restatement, or self-vouching of method — and it was accepted ... because it sat next to something that had been measured." — vs — retro CD: "a specific statement, number, attribution or mechanism that a named seat published and that turned out false, unsupported, over-general or fabricated — and the record is about the instance (who, what, how caught), not about the tool that misled them." Sentinel's is the narrowest (no run at all); retro's is the widest (any false published statement, however caused). Steward D ("the measurement was sound and the defect was in how the claim was worded, framed, hedged, or ordered") and weaver B ("regardless of whether the underlying check was sound") mark the same boundary from opposite sides.

**U3.** maestro C4: "the error lives in a text the author wrote as a rule, criterion, ruling, card, or instruction, and the defect is in its domain, scope, or consistency with another ruling — discovered by someone executing it, not by re-reading." — vs — steward C: "the measurement and its source were sound but the claim's population, axis, unit, category, or domain was unstated or wrong — including forgetting that the author is inside the set being counted." Maestro's subject is authored rules; steward's is measurements. Sentinel C1 ("the thing it ran over ... was narrower than the sentence published about it, and nothing in the output showed the gap") is the measurement form.

**U4.** sentinel C4: "true at the moment it was measured or written and false shortly after, and the record carried no time, tree, or session that would have told a reader it was a snapshot." — vs — weaver C: "a mechanism by which a document became false, inverted, or misleading after (or independent of) its authoring — a set gained a member, a tool changed, a ruling happened on the wire, a comment's explanation rotted." Sentinel's is time passing; weaver's is the world changing. Steward F adds "a broadcast or workaround that kept acting after its reason expired, or debris left by the author."

**U5.** maestro C6: "produced by how the shared tree, gate, wire, or tool behaves, and would have happened to any competent seat regardless of judgement." — vs — weaver G: "an action the author took or nearly took — a write probe, a mutating command, an edit to a file a peer is committing, a race against a gate — whose cost falls on shared or peer state." Maestro's is the substrate acting on the seat; weaver's is the seat acting on the substrate. Scout 3 ("a mechanism finding that would be true regardless of who observed it") and retro TD ("would mislead or block any operator regardless of care") are on maestro's side.

**U6.** weaver D: "a positive, applicable rule about how to word, scope, place, or structure skill/SOP/template text so it stays true across consumers and tool changes — rather than a report of a failure." — vs — forager 5: "reference knowledge about the code or environment (a mechanism, a constraint, a design rule, a shell fact) usable by someone who did not make the mistake, and its remedy is a property of the code rather than of the author's process." Prose craft vs code craft; same kind (a standing rule with its home in the artifact).

**U7.** sentinel C7: "obtaining or preserving a perspective the seat's own context cannot supply — blank-context readers, subagent dispatch, not landing one's own verdict, execution over testimony." — vs — steward E: "the author's rigour or eagerness to publish varied with the direction of the claim — indicting a peer or the lead, demoting or restoring the author's own work — rather than with the evidence." One is about getting an independent read; the other about being bent by a dependent one. Forager 4 ("acted on something given to them ... and the finding is that the given thing bounded their attention or was itself wrong") and weaver F ("how to solicit, weigh, or answer another agent's reading, measurement, ruling, or correction") bridge them.

**U8.** scout 2: "about the behaviour of a check itself — a guard that was present, aimed, or correctly applied and still did not fire — rather than about the truth of any one claim." — vs — steward G: "about the form, transfer, replacement, or falsification of lessons and hypotheses — why a true instruction did not fire, how it should be worded, what would overturn it — rather than about any single incident." Scout's is the operational failure; steward's includes the lesson's form and its falsifier.

**U9.** maestro C1: "a one-paragraph prediction of the successor's own characteristic failure, addressed to 'you', and meant to be scored fired / did not fire." — vs — retro RI: "how this document (or an entry's inputs) was produced and why a reader should discount, re-weigh or re-check part of it." Maestro's is the guard text itself; retro's is a discount on the record. Forager 8 ("the seat document's own structure, size, accuracy, reading order, or maintenance") and sentinel C11 ("an instruction about how to maintain or read this document, or a judgement about the standing of a predecessor's rule") are the middle.

**U10.** sentinel C10: "written as a falsifiable prediction with a stated meaning for failure, or a note about the status of such a prediction." — vs — retro PR: "a general rule proposed for the team's principles file, with an explicit adopt / decline / carry decision and a stated scar count." A prediction to be scored vs a rule to be adopted; both are claims with a bar and a ledger. Retro FU ("exists to record the outcome of something registered earlier") is the verdict half that retro alone separates.

**U11.** forager 6: "names a specific defect, missing feature, or follow-up in the code, carries a status (open / resolved at sha / deliberately not built), and would be discharged by a change to the code rather than to the author's behaviour." — vs — maestro C9: "its value depends on a specific state of the tree, board, or contracts at the time of writing, and expires once that state changes." Forager's is a work item; maestro's is a state description. Weaver H ("a task, question, or priced option left for the next instance rather than a settled lesson") covers both.

**U12.** maestro C7: "evaluates the team's shape — seat composition, seams, ownership drift, whether to reshape — or a specific seat's demonstrated value, as opposed to the lead's own conduct." — vs — scout 5: "tells the holder how to do this seat's work — what counts as evidence, how to participate, what to write and when — and is not tied to a single incident." Team-level verdict vs seat-level conduct. Steward H ("a hypothesis, verdict, or rule about the seat's value, positioning, boundaries, or attention allocation") and retro CL ("who sits in which seat, what the shape costs or yields, or a decision to reshape or not") span the same gap.

**U13.** maestro C5: "an act the lead did not perform, or performed at the wrong time or size — not a false statement but a missing or late step in the lead's own routine." — vs — retro PD: "the team's own procedure, ritual step, ruling format or coordination protocol — followed as written — produced a bad outcome, and the remedy is a change to the procedure." Maestro's is the lead's omission; retro's is the ritual's defect when followed. Both propose an executable checklist.

**U14.** sentinel C8: "the core of the record is a method that produced the right answer and is written down to be repeated, not a failure." — vs — weaver J: "reports that a rule already on record caught something before it shipped, or was confirmed by a peer running it — a success of the doc rather than a new failure." A method vs a firing of a rule. Retro MW ("a good outcome and the authors credit a nameable method or mechanism for it (with an artifact), rather than luck or effort") adds the artifact requirement.

### Boundary disagreements

1. **U1 vs U2 — is a bad instrument a different kind from a bad sentence?** Four sources split them (forager 1/3, weaver A/B, sentinel C2/C3, steward A/B+D) and each says why: the remedies fire in different places (harness vs send path). Two sources deliberately refused the split: scout ("the author's own repeated verdict is that these are one defect 'wearing a new hat'"), retro ("a split of causes, not of kinds"). Maestro has no instrument class at all — its instrument items (M68 grep as membership test, M102 shared upstream store) sit in C3 as ungrounded claims. Weaver notes its author's own lineage draws this exact line (session-8 line vs session-12 line).

2. **U3 — is "domain unwritten" its own class?** Sentinel (C1), steward (C) and maestro (C4) each carved it out; sentinel says its author unifies C1 with C2 ("I removed a dimension") but sentinel kept them apart because the fix differs (name the domain vs show a failing run). Weaver folds domain omission into B; forager splits it between 1 and 3; retro keeps it inside CD while naming it as a sub-family (R150 "domain omissions are the dominant defect class" was registered as a hypothesis and scored "split"). Maestro's version is specifically about _authored rules_ — the other two are about measurements — so U3 may be two things wearing one name.

3. **U4 — staleness as a class vs as a mechanism.** Three sources make it a class; four fold it into claim defects (retro's stale-count chain, scout 1 and 6, forager 3, maestro C6). Steward reports an unresolved tension inside its own class (T93 "stamp it dirty" vs T123 "report it unmeasured"). Weaver C is wider than the other two (prose falsified by change, not only by time).

4. **U8 vs U9 — guard-not-firing vs document custody.** Scout separates them (2 vs 6/7); steward merges them into G; maestro separates the epitaph text (C1) from its bookkeeping (C2) but has no "did not fire" class, putting M17/M24/M93 in C2/C3/C5; weaver bundles instructions and lineage (I); retro spreads the finding across PD (R380), CD (R144) and HY (R68, R153). Scout's argument for the split is that class 1 wants a check on the claim, class 2 a change to _when_ the check runs.

5. **U5 vs U6 vs U11 — substrate defect, design note, or work item.** Forager splits three ways (2, 5, 6) on where the remedy lives (tool at land time / the artifact / the board); weaver likewise (G, E, H); sentinel merges facts with instruments-to-build (C9); scout merges findings with their status (3); retro keeps TD apart from FU. Sentinel considered and rejected C9+C10.

6. **U7 — one class or three?** Cold-reader independence (sentinel C7, weaver F), directional rigour (steward E only), inherited framing (forager 4 only) and true-but-not-new (sentinel C5 only) are placed together here. Steward argued E is distinct from B by mechanism (direction vs packaging); scout files the same direction items under guards (class 2); weaver files deference under F. Retro records the direction finding as a declined principle (R163 "correction and retraction fail by the same reflex"). Whether "who it came from" and "which way it points" are one mechanism is not settled by the sources.

7. **U10 — hypotheses, verdicts and principle candidates.** Retro keeps three classes (HY, FU, PR) and argues for HY/FU separation ("the useful question — was it ever followed up? — is only answerable if they stay distinct"); forager, scout and sentinel each keep one. Retro PR could go to U9 as record custody. Steward's hypothesis verdicts (T126–T128, T130) are inside its seat-role class.

8. **U12 vs U13 — team shape vs lead process.** Maestro separates C5 (lead omissions) from C7 (structure); retro separates PD from CL. Retro CL's lead-load items (R166, R204, R248, R287, R325) are the structural form of maestro C5's M78/M167, which maestro itself notes.

9. **Steward B vs forager 4 — same word, different class.** Both are named "inherited"; steward's is inherited _claims_ (numbers, retractions, roll-ups that arrived credible → U2), forager's is inherited _framing_ (a card name or scope that bounded attention → U7).

10. **Maestro C1 — epitaph texts as a class.** Only maestro isolates the guard texts; scout 7 and weaver I bundle texts with rationales; sentinel classifies each epitaph by its content (S1 → C1, S5 → C3, S111 → C2). Placed in U9 with the note that its members belong by content to U2/U3/U7 and its intervention belongs to U8.

---

## 3. SIZE AND RECURRENCE

| class | items | sources reporting recurrence within it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | sources saying mostly one-offs                                                                                                   |
| ----- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| U1    | 151   | forager (2 file-level repeats but "the class is internally the most recurrent in the file"; twelve faces merged to one cluster), weaver (25 of 48 recur; false-zero family ×4), sentinel (5 recurrent threads among 23; positive-control rule in four places), steward (7 pairs recorded twice; "most-recurring class by count ... for the third session running")                                                                                                                                                                           | sentinel C6 masks: "otherwise each appears once"                                                                                 |
| U2    | 275   | maestro ("the most re-recorded class" — 6 of 33 explicit repeats, same shape under new names in s4, 5, 7, 8, 11, 12, 13), forager (fabricated identifier ×5; reassurance-ages "this file's most-repeated failure"), weaver (10 of 28), sentinel ("the highest of any class" — 12 of 21 are re-recordings of five lessons), steward B (two pairs), scout ("nearly every item here is a recurrence of the class"; n=4/5/6 per session), retro ("heavy recurrence"; stale-count chain in seven sessions; "with the warning in front of me" n≥8) | steward D: "no strict repeats; all nine appear once"                                                                             |
| U3    | 45    | sentinel (3 recurrent threads of 12), steward (two pairs), maestro (3 of 19; "domain unwritten" fired in s9, 11, 12)                                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                |
| U4    | 51    | sentinel (S46/S47/S68/S78 four self-declared forms of one family), steward (two pairs + extensions), weaver (5 of 23)                                                                                                                                                                                                                                                                                                                                                                                                                        | weaver: "18 appear once"                                                                                                         |
| U5    | 107   | maestro (whole-tree gate "the single most re-recorded item in the file", 4 recordings), forager ("highest of any class relative to size" — shared-tree isolation failure recorded nine or ten times, three consecutive sessions), weaver (3 of 10), retro (gate/markdown chain ×6 across five sessions; `uncheckedAgainst` ×2)                                                                                                                                                                                                               | sentinel C9 ("none repeated"), scout 3 ("0 literal repeats")                                                                     |
| U6    | 59    | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | weaver D ("the least-repeated class — rules, once learned, stayed learned"), weaver E (3 of 17), forager 5 ("0 flagged repeats") |
| U7    | 58    | weaver (9 of 23), sentinel C7 (dispatch thread recorded six times; 7 of 13), forager 4 (one lesson recurring five times inside F104–F107), sentinel C5 (2 of 4)                                                                                                                                                                                                                                                                                                                                                                              | steward E: one pair, "four items appear once"                                                                                    |
| U8    | 42    | steward ("re-read and it did not fire" recorded at least five times in different words), scout (progression C46→C15→C59)                                                                                                                                                                                                                                                                                                                                                                                                                     | scout: 1 literal repeat                                                                                                          |
| U9    | 124   | maestro C2 (supersession template ×5), forager 8 (ratio record ×8; "did not re-audit" handoff ×4), weaver I (8 of 14 — lineage repeats), scout 7 (8 of 15, "highest ratio in the file, by design"), sentinel C11 (4 of 12 duplicates; "move it, dated" ×4), retro RI ("self-report flatters" in S4, S5, S6, S10, S12)                                                                                                                                                                                                                        | maestro C1 ("four of seven appear only once"), scout 6 (1 repeat)                                                                |
| U10   | 206   | forager (router falsifier ×5, session-10 verdict ×4), scout ("the highest repeat rate of any class ... open questions without a register get re-asked rather than answered"), retro HY (5 re-registered; R364 scored three ways), retro PR (8 of 30 re-mentions)                                                                                                                                                                                                                                                                             | sentinel C10 ("none")                                                                                                            |
| U11   | 39    | forager 6 ("the highest repeat ratio" — struck candidates re-record lessons; `uncheckedAgainst` ×3), weaver H (10 of 12 are repeats of earlier ids)                                                                                                                                                                                                                                                                                                                                                                                          | maestro C9 (1 of 11)                                                                                                             |
| U12   | 101   | maestro ("highest repeat density" — "no reshape" ×5, shape-check ×4, "right about where, wrong about what" ×3; ~13 of 38), retro (lead-load 6 occurrences 0 actions; no-reshape ×7; non-building seats ×3)                                                                                                                                                                                                                                                                                                                                   | steward H (one pair; ten once), scout 5 (1 literal repeat)                                                                       |
| U13   | 40    | retro (6 of 23)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | maestro C5 (2 of 17)                                                                                                             |
| U14   | 91    | retro ("high recurrence of the same methods across sessions" — cold reads in six sessions, ratify gate in four), weaver J (6 of 6 by construction)                                                                                                                                                                                                                                                                                                                                                                                           | maestro C8 (3 of 19), sentinel C8 ("none repeated")                                                                              |

Repeat-inflation across the whole corpus: maestro 36 of 186, forager 22 (+2 instances) of 186, weaver ~80 of 208, sentinel 22 of 121, scout 21 of 145, retro not counted but "roughly a third of CD items" marked as repeats by the authors. Three sources (sentinel, forager, scout) say the repetition is structural and deliberate — an incident recorded at both the epitaph and lesson altitude — and should be read as one item with two homes.

---

## 4. INTERVENTIONS

Synthesised from what the sources proposed. Where they proposed different shapes for one class, the shapes are named.

**U1 — Instruments that could not fail.**
What: a positive control that could have returned the other answer, run in the _same command_ as the verdict, plus the enumerated domain the instrument touched. When: whenever a zero, pass, green, "clean" or matrix is about to be quoted. Who: the send/commit tool refuses a verdict word without a `control:` field (steward); the lead refuses a results table missing the "run that could have contradicted this" column (sentinel); a `probe` wrapper prints per-stage exit codes, byte counts and first/last lines and refuses a bare zero without a non-zero control (weaver); a verification wrapper invoked by the land command asserts the mutation count, runs each changed cell alone, runs the full gate and executes emitted commands against the live store (forager). Also: a per-path table of which formatter/linter/gate covers which directory, emitted at join (weaver); claims about shipped behaviour cite `git show <sha>:<path>` (weaver, scout, steward); "what did I hold fixed" as the first line of the send checklist (sentinel); list every external dependency a matrix touched (sentinel C6). Shapes differ: forager's is a harness at land; steward/weaver's a lint at send; sentinel's a table schema. All four agree it must be mechanical because the authors "demonstrably do not notice the gap from inside."

**U2 — Claims that outran evidence.**
What: a pre-send lint on outgoing text, keyed on lexical triggers, that demands a command, sha or an explicit "unmeasured / passed-along / UNVERIFIED" label. Triggers named across sources: any number, ordinal, share or magnitude word (weaver, scout, retro, steward); any 7-hex sha, which must resolve (forager); "cannot / never / always / every / all / impossible" (forager, sentinel, retro); "because / so / which means" causal connectives, to carry a `[checked]`/`[assumed]` tag or their own falsifier (scout, retro, weaver); a person's name next to an artifact (scout); a withdrawal, retraction or acceptance of a reversal (sentinel, steward); a `[FROM <human>]` marker whose body is not verbatim (retro, maestro); a hedge in the body absent from the first 200 characters (forager). When: on `comms send`, `anthill commit`, and card status moves. Who: the tool, not the seat — six of seven sources say re-reading does not catch these and vigilance fails within the hour (maestro M68/M73, forager F5/F80/F95, weaver W63, retro R2/R256). Companions: tallies computed by a script over rows that each carry a command, with command-less rows printed as a "residue" group (steward — the question that found the s13 error); measurement and message never composed in one shell invocation, enforceable as a tooling constraint (sentinel S72/S116, retro R242 "pasted, never typed"); relayed human decisions carry question and chosen option verbatim (maestro); a second-reader step at finalize re-runs the command behind any sentence naming a person or commit (scout); an acceptance-criterion re-read at land (forager). Weaver adds the ordered three-question triad emitted by the send command rather than remembered. The lint shape is the strongest cross-source convergence in the material.

**U3 — Scope/domain unwritten.**
What: a required domain/population line on any claim with a count, list or quantifier. Fields proposed: `searched:`, `legs run:`, `tree: sha + dirty paths`, `columns pinned vs hand-run` (sentinel); `over:`, `derived by:`, `unit:`, `includes me: yes/no` (steward — the last field alone would have caught three items); a classification scheme must offer MOOT / vacuous / unmeasurable (steward). When: at send, and for a guard or test, in the file itself ("name what it does NOT cover", sentinel S2). Maestro's shape is different: execute the authored text before ratifying it — take the t=0 baseline before agreeing scope, have an owner attack the skeleton claim, require a control cell for the fix, end every ruling with "this overrides …" and "this does not rule on …", and treat open cards as predictions with an expiry — hosted in the ratify skill as mandatory fields. Sources agree the gap is invisible from inside, so the shape must be supplied by the tool or ritual.

**U4 — Expired readings/records/prose.**
Two shapes. (a) Stamp the moment: gate results, READY announcements, proof pointers and landed records of wire state carry (sha, dirty-path list, wall-clock) as structured fields (sentinel, steward); point at named assertions never counts (sentinel S61/S100, retro R375); keep both snapshots and diff rather than re-measure; pre/post from `git show` never the worktree; every broadcast or workaround carries an owner and a retire condition, prompted at finalize; a debris sweep at finalize (steward). (b) Trigger on the other side's change: a registry of named sets and the files that enumerate them so a cascade check on any member-add lists the enumerations to revisit; a `rests-on:` annotation on load-bearing rule sentences so a migration can grep the premise; render-and-diff for rendered-once templates at finalize; the formatter-restructure check as a pre-commit step (weaver). Weaver's is the only proposal that addresses prose falsified by change rather than by time; sentinel's "scheduled re-check beat, not a prompt" is the only one for masks that refill.

**U5 — Shared-substrate hazards.**
Two shapes, and one real disagreement. (a) Change the tool: a path-scoped or merge-result gate so a peer's red does not block a docs land; a gate leg that reads markdown; the gate prints which legs ran; `uncheckedAgainst` re-reads after the lock wait; `stand-down` says `already-recorded`; a content hash beside the message watermark; a durable store for wire ratifications; a `stand-down` verb; `spawn` adds a seat to a live session; a version check in the spawn path; default `--as` trailer; identity beyond a namespace check; teardown does not write on recovery (maestro, retro). (b) Change who touches the tree: seats author in a scratch dir or worktree and only the land command touches the shared tree, atomically (forager — adopted s12 and "it held"); `comms send --green` requires a sha and refuses a dirty tree; holds check `git log -1 -- <path>`; read-only probes first, writes in a throwaway tree; "who touched this file in the last N minutes" or announce-before-edit; an insurance patch outside the repo (weaver). Disagreement: forager's default-isolation remedy is the thing maestro (M145) and retro (R308, R309) report as converting a blocking coupling into queueing plus an unguarded integration point, and sentinel S107 says the merge gate is missing — so the sources do not agree on the structural fix. Routing: every "structural, nobody's fault" bullet is carded with an owner, filed upstream, or explicitly declined at finalize, the paper-cuts method applied to the retro (retro P8; sentinel C9; scout C48 "commit or card?"). Standing workaround until built: `( gate ) && commit` (maestro, forager, retro).

**U6 — Craft/design rules.**
What: move each rule out of the seat doc into the artifact it governs — a docstring, a named test, a `seams.md` clause, an environment doc line — leaving a pointer (forager 5); compress the prose rules into one ~fifteen-line style sheet handed to the blank-context reviewer as its checklist, with the mechanical ones (line shape, no example invocations, no restated contract) as lint (weaver D); route any lesson whose subject is a tool or ritual to the board or `seams.md` with an owner, and have curation check for a card id (weaver E). When: when a skill/template/SOP or the described code is touched. Who: the reviewer agent for prose, curate/lead at finalize for mechanisms. Proposals are concrete; the sources note the class does not recur, so the risk is loss, not repetition.

**U7 — Weighing others' reads.**
Four shapes. (a) Change the ask: a review-request template of "enact it / run it and tell me where you go wrong; I am not giving you my criterion", plus "same output, different question" as a standing beat (weaver F). (b) Make dispatch a ritual beat: at convene the lead assigns cold-read targets and confirms subagent dispatch is permitted in this harness; the seat records the blocker kind if not — because "a warning I have read and agree with does not become an action" (sentinel S94/S97). (c) A direction field: any message that cedes ground, accepts a reversal or indicts anyone states "this favours ___; did I run the same instrument I would run for the opposite?" (steward E); any incoming correction gets the same one-command check regardless of which way it cuts (weaver W144/W176). (d) A card/finding template with a mandatory "what else" field — other sites computing this verdict (grep pasted), mechanism reproduced by `<command>`, what following the constraint literally would break — that the board tool requires before status moves (forager 4). Plus a case-insensitive grep of channel/cards/brief with a positive control before sending, extended to "does the card's artifact already resolve" (sentinel C5). The shapes are all cheap; what is weak is that none of the sources proposes who enforces (c) beyond the author.

**U8 — Guards that did not fire.**
What: bind the guard to the act, not to the document. A hook that prints the relevant clause when the triggering command runs (the `--as-of` hazard when `--as-of` is typed; "did you measure this noun" when a send names a person); a self-application step at finalize ("list three guards you applied to peers; show one applied to your own output") (scout). Curate rewrites every incoming lesson into a fixed form — trigger stated as a _kind of result_ ("any zero, any pass, any list of who did what"), one question, one falsifier — with the anecdote in an appendix; at join, instead of re-reading, present one novel instance on a different instrument and ask the seat to classify it (drill, not read); a falsifier ledger so "condition met" is a lookup (steward). Maestro's C1 proposal is the same: pair each epitaph with a one-line tell placed where the act happens (the send path, the finalize checklist), and make three of the seven mechanical in a pre-send lint. Retro's finding R153 (epitaphs that fire name a command-dischargeable disposition; those asking for vigilance do not) and forager's trail data (mechanical lines fire, dispositional lines fail every session) are the evidence. Convergent and concrete.

**U9 — Custody of the record.**
What: (a) a firing record — a fixed finalize slot with, per live guard, fired / did not fire / never came up plus the artifact that shows it, read at the next convene (maestro C2, seeded by hand and it produced the first "did not fire"); per-epitaph trigger and per-session tally so supersession argues from the row (scout 7); a `fired:` counter per rule (weaver J); one table of rule → what it guards → status → session (sentinel C11). (b) Fixed slot: one epitaph, one ordered triad delivered by tooling at publish, everything else in the lineage; keep the "why superseded" paragraphs, drop restated scars (weaver I). (c) Fresh instance per session as the convene default so the measurement is taken without anyone volunteering to leave (maestro C2). (d) Take learning out of the seat doc entirely — sessions write reports, a curator merges, seat doc holds identity only; if a trail is kept, a size cap reported at join, a one-home-per-claim lint, and lineage entries as pointers to dated reports (forager 8). (e) Hygiene mechanics: cite by heading anchor or clause id with a link checker at finalize; cite by repo-root path; grep scratch for every retraction id at finalize; stamp counts with a sha; supersede by whole block (scout 6). (f) An external blank-context review of the retro after it is written, as a finalize step with a fixed brief ("find flattering claims and stale counts"), and a standing "how to read this entry" header (retro RI — ran once in S4, found the most, never scheduled again). Shapes converge on the tally and on moving content out of prose.

**U10 — Hypotheses and scoring.**
What: a single ledger outside the prose — one row per hypothesis/candidate with id, author, falsifier or test command, owner, sessions checked, verdict (including NO DATA as a row, not a blank), and a link to the item that changed its status. When: read back at join before work starts (sentinel, scout); written at finalize as a required step (forager, scout, retro); a row untouched for two (scout) or three (forager) sessions is flagged retire-or-run; capped at five per session (retro — S5's fifteen got four verdicts); carries the team-shape fingerprint (retro R401). Retro adds: adopted principles must name the command that discharges them, and carried candidates carry their bar so a successor can see when it is met (R367 bar was only in prose). Steward H proposes the same ledger for seat-value hypotheses. Strong convergence; the sources note the team reached most of it itself (NO DATA rule, verdict sections from S7 on) and it works until the list is long or the falsifier requires leaving a hazard open or briefing the subject.

**U11 — Open items / successor state.**
What: no candidate lives in prose — each becomes a board card with a sha, an owner and a re-check command in its body, or a `KNOWN DEFECT` test that fails when someone fixes it; the seat doc holds only ids; the handoff points at cards rather than restating them (forager 6, weaver H, maestro C9). When: finalize runs each candidate's command and flips status automatically (forager — F182 was resolved by someone else while the doc said open); join re-verifies "still open" against the tree (weaver); curation drops any candidate a later lesson closed (weaver W202 was contradicted by two later lessons and never struck). Maestro adds that the three items its author flagged as most likely to be misread cold are all in this class, which is the argument for moving it out of prose. Fully convergent.

**U12 — Team shape and seat role.**
What the sources propose is thinner here than the volume warrants. Maestro: a rolled-up table for the fixed structure questionnaire (the same four findings are answered eight times with a stable answer), and a convene step listing open structural signals with their session-count that demands a ruling or an explicit defer. Retro: the lead-load finding (six sessions, zero actions) needs a decision — split ritual roles (a curator who is not the lead, tried once in S5) or record the load as accepted; the "is the team worth convening" cost question asked in S4 and never answered. Steward: an attention counter — after N consecutive checks in one lane, prompt "what have you stopped looking at?"; a hypothesis ledger for seat-value claims. Scout: a curation routing step that sends standing method (pre-register, enumerate by non-subject, list-not-ratio, write after the retro) to the seat doc's identity sections or a seat SOP rather than to a report. No source proposes a mechanism for the composition verdicts themselves; the observations converge ("no reshape", "non-building seats find the most", "the variable is substrate contact not seat") but the intervention is aggregation, not prevention.

**U13 — Lead/ritual process defects.**
What: a lead-only checklist run at three moments — before the opener (wire own tails, read the skill, publish the measurement window), before each ruling (re-read the open-asks table from the inbox, ask whose decision it is, ask "could this change what anyone does next", keep it short, name what it overrides), at finalize (run own finalize first, enumerate the continuation surface from board + docs + roadmap, land the perishable artifact early, file the defect you routed around) — emitted by the comms tool as a template every ruling fills, because the table alone did not work and only re-reading before each act did (maestro C5). Retro: make the ritual executable — each step's precondition is a command the finalize skill runs (confirmation is the last message a seat sends, enforced by refusing further lands; retro answers collected on a quiet channel, enforced by a dedicated channel); an instrument the lead builds gets a named re-read moment; never another paragraph at join, always a check at the point of use. Convergent in shape (checklist as gate in the act path).

**U14 — Practices worth keeping.**
What: promotion, since the risk is loss — each confirmed practice becomes a named step in the relevant skill with the session evidence cited (shape check in convene; ratify-on-vine and pre-authorised stop in plan; "be the first real user" and "offer the cheap version" in the lead's ruling checklist; the shell operator in the land instructions) (maestro); a short "how this seat verifies X" list in the identity doc or a skill (sentinel); a tally against the rule id each confirmation supports so rules are weighted by hit-rate, not recency or formatting (weaver J); a "what to run" list separate from the prose, carrying only methods with a re-runnable artifact, in roughly eight clusters — pre-register the check, ratify a design before building, blank-context readers briefed FIND-not-DESIGN, rival implementations / delete the guard / reverse the reads, mechanical over prose guard, refuse to infer a ruling, read your own artifact as its consumer receives it, land early and inert (retro MW). Convergent.

---

## 5. SPECIFICITY

Votes are per source class that was placed in the unified class (a source with two classes here gets two votes). "Any team" includes sources that said "general shape, project-flavoured instances."

| class | any agent team                                                                                                                           | this project                                                                                                | one seat's kind of work                                                               | notes                                                                                                                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1    | 5 (forager, weaver, sentinel C2, sentinel C6, steward)                                                                                   | 0                                                                                                           | 0                                                                                     | forager and sentinel add: frequency is characteristic of a verification-tooling seat; sentinel C6's masks are "deeply project-bound" in instance                                                                                                          |
| U2    | 8 (all eight source classes)                                                                                                             | 0                                                                                                           | 0                                                                                     | weaver ("strongly tied to this seat's kind of work — where reasoning is the deliverable") and scout ("the sting is seat-specific: a wrong number is an allegation") qualify but still vote general; steward D's jargon-collision item is project-specific |
| U3    | 2 (sentinel, steward)                                                                                                                    | 0                                                                                                           | 1 (maestro: lead is sole author of criteria/rulings/cards)                            | maestro adds "any agent writing specifications would hit it"                                                                                                                                                                                              |
| U4    | 3 (sentinel, steward, weaver)                                                                                                            | 0                                                                                                           | 0                                                                                     | sentinel and steward qualify: "shared-tree, multi-seat teams hit this by construction; a single agent on its own branch would see little"                                                                                                                 |
| U5    | 2 (forager, weaver — "any team sharing a tree with a whole-tree gate")                                                                   | 3 (maestro "project-specific in mechanism, general in shape"; sentinel C9; scout 3 "by construction")       | 0                                                                                     | retro: "mixed — about half this project's own tools, half things any agent team on git+husky+bun will hit" (counted as neither)                                                                                                                           |
| U6    | 0                                                                                                                                        | 2 (forager 5 "almost entirely"; weaver E instances)                                                         | 1 (weaver D "mostly specific to a docs/skills-owning seat")                           | weaver E names four rules that generalise; forager names F90/F91                                                                                                                                                                                          |
| U7    | 4 (weaver, sentinel C7, forager 4, sentinel C5 "teams with a shared wire")                                                               | 0                                                                                                           | 1 (steward E "seat-specific in its strong form; any reviewing agent hits the weaker") | sentinel: the dispatch-permission saga is harness-specific                                                                                                                                                                                                |
| U8    | 2 (scout "nothing here depends on the project or the seat"; steward "general to any agent that carries written lessons across sessions") | 0                                                                                                           | 0                                                                                     |                                                                                                                                                                                                                                                           |
| U9    | 5 (maestro C1, maestro C2, scout 6, forager 8, retro RI)                                                                                 | 2 (weaver I "this project's epitaph ritual"; sentinel C11 "this team's seat-doc convention")                | 1 (scout 7 "seat-specific in form, generic in failure")                               | maestro C2: rotation argument tied to the project's stigmergy thesis, measurement problem general                                                                                                                                                         |
| U10   | 4 (forager, sentinel, scout, retro — the _practice_)                                                                                     | 0                                                                                                           | 0                                                                                     | every source says the hypothesis _content_ is half local; scout: volume/wire-membership questions are observer-seat-specific                                                                                                                              |
| U11   | 0                                                                                                                                        | 3 (forager "by definition"; weaver "project-specific content, rot mechanism universal"; maestro "entirely") | 0                                                                                     |                                                                                                                                                                                                                                                           |
| U12   | 2 (maestro "questionnaire general, content project"; retro "generic to lead-plus-seats teams")                                           | 0                                                                                                           | 2 (steward H; scout 5 — both "seat-specific")                                         |                                                                                                                                                                                                                                                           |
| U13   | 1 (retro "mostly generic to lead-plus-seats agent teams")                                                                                | 0                                                                                                           | 1 (maestro "every item is about the lead's chair")                                    |                                                                                                                                                                                                                                                           |
| U14   | 2 (weaver J; retro "every one of the eight clusters transfers")                                                                          | 0                                                                                                           | 1 (maestro "mostly seat-specific — how the lead scopes, ratifies, rules, lands")      | sentinel C8: S43/S44 general, S41/S42/S45 project (counted as neither)                                                                                                                                                                                    |

Reading across: the failure classes (U1–U4, U7, U8) are voted general by nearly every source; the project-specific votes cluster in substrate (U5), design notes (U6) and open items (U11); the seat-specific votes cluster in seat role (U12), lead process (U13) and the docs-owning seat's craft (U6).

---

## 6. RESIDUE

### Items the sources left unclassified

| source  | id  | what it is                                                                                                                                 | why unplaced                                                                                                                                                                                                                                                                                                                |
| ------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| forager | F24 | "I was right, and I was in the set" — the author noticing they belong to the population of the hypothesis they published about others      | forager: "a reflection on self-inclusion", recurring as a motif inside other items (F80, F100, F140) but standing alone only here. Steward C has the same motif as a rule (T51 "am I a member of the set I am about to count?") and scout C93 as method; so the _content_ has a home in U3, but forager did not give it one |
| retro   | P8  | The paper-cuts log's own method: append during session, triage by cost × fix at finalize, track disposition (fixed / upstream / graduated) | retro: "neither a lesson, defect, prediction or outcome". It is the intervention proposed for U5 and U11 by three sources, described as a method                                                                                                                                                                            |
| retro   | P9  | An empty template entry; no friction-log entry after 2026-07-05 while the retro records tooling defects through 2026-08-08                 | retro reads it as an absence: "the tooling friction moved into the retro's 'structural, nobody's fault' sections and lost the disposition row on the way" — evidence for U5's routing intervention                                                                                                                          |

### Notes that recur across files

1. **Readability cold is hard — seven of seven.** All name the same causes: undefined house vocabulary (seats, wire, vine, board, cards, lands, gate, ratify, `uncheckedAgainst`, `--as-of`, numbered contracts and rulings, message ids); near-universal bold/caps so "when everything is a headline, nothing is" (maestro, forager, weaver, sentinel, steward, scout, retro all say a version of this); non-chronological ordering (newest-first epitaph stacks scoring lines the reader has not met yet; sentinel's file meets in the middle; steward's "read it bottom-up"; weaver's undated candidates); dense positional self-reference that moved as entries merged (forager, weaver). Five say a third or so of items cannot be evaluated for correctness without the repo but _can_ be classified because the author states the general form after the instance.

2. **The interventions are already in the material.** Retro: "the gap is not diagnosis; it is that each remedy is recorded once as prose and then has to be re-discovered — which is the file's own thesis about prose guards." Scout, maestro, forager, steward and sentinel say the same about their file: the author names the mechanical fix and does not build it, or builds it and does not use it (forager's router, maestro's asks table, steward T10 "write the disposition, not the anecdote ... and never does").

3. **Mechanism fires, disposition does not.** Forager's trail data: lines naming a mechanical act (run a command, use the artifact) fire; lines naming a disposition (be isolated) fail every session. Retro R153, R388, R332: mechanical guard beat prose guard, same session, same problem. Scout: "no epitaph ever fired on its holder at the needed moment." Sentinel: "a warning I have read and agree with does not become an action." Maestro: lessons repeated within an hour of being written. This is the cross-file finding that backs U8 and the tool-hosted shape of every U1/U2 intervention.

4. **Repeats are structural, not sloppy.** Sentinel, forager and scout each say the re-recording is deliberate (epitaph altitude plus lesson altitude; struck candidates kept "for the lesson"; "one entry per incident") and that a curator should count a repeat as one item with two homes. Weaver: "of 208 entries about 80 are repeats ... the genuinely new lesson rate falls sharply after session 8." Scout: "perhaps a dozen distinct mechanisms told forty times."

5. **The pin / falsifier / control convention is what made inventory possible.** Forager ("almost every lesson carries a sha, a command, a test name, or a number ... the part worth preserving in whatever format replaces this"), weaver ("the pattern of stating a pin, a falsifier, and a control with each finding"), steward ("nearly every item carries a specific number ... falsifiable but also very long"). Same feature, opposite cost.

6. **Files contradict themselves and mostly say so.** Steward T93 vs T123 (dirty-tree gate: stamp it vs report unmeasured — unresolved) and T99 vs T107 (resolved). Scout C107 still recommends a remedy that C81 reports falsified on its author. Weaver W202 stands although W110/W152 close it. Retro R364 scored three ways in three sessions; R227/R232 absent from the next verdicts contrary to R233's own rule. Forager F134 corrects F133 in place. Sentinel S10 corrects S18; S115/S117 attached to the wrong epitaphs. Each source cites this as the argument for a status register over prose.

7. **What is missing from all of them.** No item records something that went well from the product's point of view (maestro: "I could not tell from this document alone what anthill does"; steward: "no item records something that went well without an accompanying failure"). The human principal is nearly absent (retro R397 "the largest uncontrolled variable in the session, unmentioned"; steward: "no item about the seat's relationship to the human principal"). The failure-to-success ratio is set by what authors chose to record, not by what happened (sentinel ~15:1).

8. **The header claims "nothing was judged" and the formatting is a judgment layer.** Weaver: "⚠ THE ONE TO READ FIRST" tops ten sections. Maestro and scout make the same point about bold. Two sources (weaver, scout) propose the fired-tally as the replacement for typographic emphasis.

# Blind classification — sentinel seat report

Source: `/Users/colereed/Projects/dreamwood/anthill/.anthill/reports/2026-09-03-migration/sentinel.md` (595 lines).
Read in full, nothing else consulted.

Item ids are assigned in **file order**, which is not chronological (see Notes). "Repeat of" marks a
later occurrence of something already listed; where the later occurrence is chronologically the
_earlier_ one, that is said.

---

## Inventory

Format: id — paraphrase — section — anchor quote (<25 words) — repeat marker if any.

### Section: Epitaph (current + immediately superseded, lines 19–37)

- **S1** — Session 13 epitaph: an instrument's field of view is set by the task that prompted it, not the claim made with it; an enumeration cannot announce what it could not see; two incidents (stale figure at three sites, guard pinning one of two construction sites). — Epitaph — "MY INSTRUMENT INHERITS THE SCOPE OF THE TASK THAT PROMPTED IT, NEVER THE SCOPE OF THE CLAIM I MAKE WITH IT"
- **S2** — Instruction: when writing a guard/test, state in the file what it does not cover. — Epitaph — "when you build a guard, name what it does NOT cover in the file itself"
- **S3** — Supersession judgement (s13): predecessor's "spend one command trying it" rule held and was the highest-value act (recovered a roster from harness transcripts); superseded only because it governs a claim about the world, not the scope of a claim. — Epitaph — "was not wrong and it is the single highest-value thing this seat did tonight."
- **S4** — Meta-instruction for successors: when replacing the epitaph, move the old one dated to the lineage; never delete. — Epitaph (line 27; repeated verbatim at 37, 556, 566) — "Do not delete a predecessor's — deciding to supersede one is a judgment and it should be visible."
- **S5** — Session 12 epitaph: an impossibility claim ("cannot / unmeetable / circular") produces no output, so every guard abstains; a lead acts on "cannot" fastest; rule: spend one command trying it. — Epitaph — "STOP AND SPEND ONE COMMAND TRYING IT. Not a design, not an argument on the wire: one command."
- **S6** — Supersession judgement (s12): the grep-the-channel rule held (stopped two redundant sends); superseded because it only asks whether an existing claim is new. — Epitaph — "It is cheap, it works, and it should be re-read as the guard on WHETHER TO SEND"

### Section: Hard-won lessons (lines 43–445)

- **S7** — Retracted a correct measurement because the challenge indicted the author; both guards failed to fire; rule adopted: before withdrawing, run the cell that restores it. — Hard-won lessons — "BEFORE YOU WITHDRAW A MEASUREMENT, RUN THE CELL THAT WOULD RESTORE IT."
- **S8** — Declaring "I cannot do this properly" plus handing over a runnable recipe and named owner worked (steward reproduced in 20 min); verifying the _structure_ of a peer's evidence is cheap when out of capacity; do not generalise to "declare more". — Hard-won lessons — "When you are out of room to measure, you are NOT out of room to verify"
- **S9** — "The tool keeps nothing" and "nobody can recover it" are different claims; harness transcripts keep copies; sub-bound: the grep survived on an incidental separator, use a structural discriminator. — Hard-won lessons — ""THE TOOL KEEPS NOTHING" AND "NOBODY CAN RECOVER IT" ARE DIFFERENT CLAIMS, AND THE SECOND DOES NOT FOLLOW." — same incident as S3.
- **S10** — Correction to the nonce rule (S18): on a self-recording corpus a typed nonce poisons itself; use a positive anchor instead. — Hard-won lessons — "the corpus IS the record of my own shell commands, so the search writes the token it is searching for." — corrects S18.
- **S11** — Three instrument failures from shared resources / shell quirks (negative TMPDIR counter, zsh word-splitting, positive control returning 0) all returned reassuring numbers; shared namespace is a contaminated instrument; a `base=0` row is not a measurement. — Hard-won lessons — "a SHARED namespace is a contaminated instrument, and prefix-attribution is the minimum rather than a refinement." — author flags "Third time shell word-splitting has beaten this seat" (earlier occurrences not in this file).
- **S12** — `uncheckedAgainst` is a snapshot at the wrong end of the operation (gate at T, field at T+gate+lockwait); the SOP's written beat, not judgement, caught it. — Hard-won lessons — "The gate measures the tree at time T; the field measures it at T + gate + lockwait."
- **S13** — Enumeration capped at half the fix surface: grepped rendered output where a peer grepped source; rendered artifact is a projection. — Hard-won lessons — "a projection cannot enumerate its own preimage." — repeat of S1 (first incident).
- **S14** — Drafted four findings, sent one and a half; all true, none new; bias the redundancy check toward suspecting redundancy. — Hard-won lessons — "All three of mine were TRUE. None was NEW."
- **S15** — Impossibility claim is the one class nothing fires on; adopted: spend one command. — Hard-won lessons — "an impossibility claim ENDS an investigation, and everything in my toolkit is built to CONTINUE one." — repeat of S5 in lesson form.
- **S16** — "Reconciled" 80 vs 82 by arithmetic that fit while the mechanism was false (markdown not in the tool's domain); a message vouching for its own method marks the unchecked spot; ask what one unit of the count is; replacement shipped as UNVERIFIED HYPOTHESIS. — Hard-won lessons — "The sentence vouching for my method is the one that marks the spot where method was substituted for a check" — partial repeat of S65's tell.
- **S17** — Tightening a filter feels like rigour and is only right when the expensive error is the false positive; widen the capture and let the resolver adjudicate; bound: a resolver proves exists, not meant. — Hard-won lessons — "which direction do this instrument's errors run, and which direction does the instrument exist to prevent?"
- **S18** — A negative control that reaches its own corpus becomes positive; keep the nonce in the shell command, mint fresh per check; degrades with time. — Hard-won lessons — "keep the token in the SHELL COMMAND, never in a message, and mint a fresh one per check." — later corrected by S10.
- **S19** — Harness `cp`'d instead of replacing the log, so the hazard was never constructed; put the setup discriminator (inode before/after) in the results table; assert ground truth separately. — Hard-won lessons — "put the DISCRIMINATOR of the setup in the results table."
- **S20** — Finding underneath S19: an existing guard's coverage depended on an id-numbering accident (arithmetic tell vs plausible lie); ask what makes the caught case catchable. — Hard-won lessons — "what makes the caught case catchable? If the answer is "it happens to be impossible", the plausible sibling is uncovered"
- **S21** — A quiet (present-and-empty) wire is a worse mask than an absent one; live matrix rested on a second CLI resolving; list every external dependency touched before publishing a matrix; warn the owner before a fail-safe leg is deleted. — Hard-won lessons — "before publishing a live matrix, list every external dependency the command touched and say what each contributed."
- **S22** — An assertion the author specified (`toEqual` on an array) pinned order the author never considered, creating a mask for a seam contract; ask what an assertion pins besides what was meant; remedy is a name in the file. — Hard-won lessons — "what does my assertion pin BESIDES the thing I meant?"
- **S23** — A peer auditing the _criterion_ (source-reading) found an always-block guard passes all four cells; ask for the criterion to be audited, not the numbers. — Hard-won lessons — ""Check my numbers" is the request that cannot find this."
- **S24** — Half-drafted a regression test that already existed in the tree; review-card sweep discriminator is whether the named artifact resolves, not card status. — Hard-won lessons — "A completed-but-unclosed card is byte-identical to a never-started one from the board alone."
- **S25** — A `/tmp` prototype handed to a peer was green under `bun test` and rejected by `tsc`, blocking a third seat; label handovers UNVERIFIED-BY-CONSTRUCTION — test leg only. — Hard-won lessons — "`tsc` is the only leg that sees it, and it is the leg an iterating author skips." — instance of S79(4)/S102.
- **S26** — Whole-file `diff` (163 lines) nearly falsified a claim about a 26-line block; measure the claim's subject, not its container; fails false-RED at a peer. — Hard-won lessons — "a claim has a subject, and the artifact containing it is usually larger."
- **S27** — Case-sensitive grep over the channel returned 0 where `-ci` returned 2; the existing "positive control on a load-bearing zero" rule caught it — first time one rule caught a defect in another. — Hard-won lessons — "the words most worth searching for are exactly the ones whose case you cannot predict." — content repeated inside S109.
- **S28** — A mask recorded as "spent" refilled at session start (wire state, not code); a superlative whose domain is a time window; ask what is holding a guard closed and whether it is code at all. — Hard-won lessons — "a mask recorded as "spent" REFILLS, and nothing re-checks it." — extends S37.
- **S29** — Asserted a veto FALSE from a simulated world; corrected at beat 3.5 by the contract owner; a lesson about a contract decays into a restatement once the contract catches up; ask which world and whether the answer is still yours to give. — Hard-won lessons — "a lesson ABOUT a contract decays into a RESTATEMENT of it the moment the contract catches up."
- **S30** — Three test names over one cell (all byte-identical at the boundary); breadth is cells that can disagree; caught by reading own file back. — Hard-won lessons — "Three names over ONE cell." — repeated in S110.
- **S31** — End-to-end harness (production path, no diagnostics) and pure harness (diagnostics, replicated derivation) fail in opposite directions; build both, cross-check, say which ran. — Hard-won lessons — "a harness that runs production's path usually cannot see production's diagnostics"
- **S32** — Report the red run alongside the green; fixed formatting scoped to own path. — Hard-won lessons — "A seat who shows you only the green run is showing you the second attempt"
- **S33** — A type-correct fixture no real event sequence produces; matrix reported an unreachable cell green; per fixture, name the sequence of real events that produces it. — Hard-won lessons — "name the sequence of real events that produces this row." — sharpens S40.
- **S34** — A matrix tests the spec only if a cell disagrees across rival implementations; found by running rivals; the acceptance cell is the divergence case. — Hard-won lessons — "The acceptance cell is never the typical case"
- **S35** — A peer's control proved sensitivity, not agreement with the reference (stdin vs file mode); run the reference mode on the same input. — Hard-won lessons — "It proved the tool can say no. It did not prove the tool says what the gate says"
- **S36** — Applied the mutation test to a peer's artifact and not to the remedy in the same message; the remedy was also vacuous and got adopted; rule: same mutation run on the remedy or label UNVERIFIED REMEDY; postscript: re-verify a retraction. — Hard-won lessons — "any remedy attached to a finding gets the SAME mutation run as the finding, in the same command" — same lesson as S53/S54/S113 (S53 is chronologically first).
- **S37** — Teardown guard was safe only because of two accidental masks; a correct unrelated ruling removed one; ask what is holding a guard closed. — Hard-won lessons — "Neither mask appears in any dependency graph, because neither is a dependency"
- **S38** — Deleted the guard call from `run()` and every test stayed green; assert the protected action did not happen, not that a complaint printed. — Hard-won lessons — "assert the protected ACTION did not happen, not that a complaint was printed."
- **S39** — Mutation table's right shape is a predicted mix, not uniform red; original cases could produce only two of three states; enumerate the subject's states. — Hard-won lessons — "Enumerate the states the SUBJECT has, not the states your fixture makes convenient."
- **S40** — A correct-but-unrepresentative fixture (fan-in 1) silently skipped the headline path; check the fixture looks like the target case; fix landed and pinned. — Hard-won lessons — "The most dangerous test is the one that's green and unrepresentative."
- **S41** — A real-repo run found a marker the table forgot (elysia); run actual target repos. — Hard-won lessons — "Run the actual target repos every time."
- **S42** — A ratified seam held, but was verified against built code and a live envelope, not the claim. — Hard-won lessons — "Ratify prevents drift; verification confirms it didn't happen."
- **S43** — Packaging claims are proven by a clean-room run in the shipped environment; caught a stray `tsconfig.json`. — Hard-won lessons — "the dev tree is a proxy that lies about what ships."
- **S44** — An outward-effecting command (`--submit`) was verified without ever sending: code read, stubbed tests, missing-binary simulation. — Hard-won lessons — "a live run is not a verification, it's an incident."
- **S45** — Confound-killer for board binding: first prove the fallback would give a different answer; the tell is whether the fallback could have produced the same green. — Hard-won lessons — "could the fallback have produced this same green? If yes, the environment isn't set up to prove anything yet."
- **S46** — On a shared tree gate state is a live snapshot; a peer's RED was a mid-edit transient; verify yourself, timestamp, tell the lander to re-run. — Hard-won lessons — "a peer's red/green is evidence of their tree at their moment, not yours."
- **S47** — Producer side of S46: generated a transient RED and never reported it; diagnose before relaying in both directions; a timestamped claim is checkable. — Hard-won lessons — "Diagnose before you relay, in both directions." — second form of S46 family.
- **S48** — Truncation flags (`head`, `-A`, wrong pattern) produced three false absences in ten minutes; never conclude "not there" from bounded output. — Hard-won lessons — "Bounded output is for reading, never for concluding."
- **S49** — Write-probe extracted an empty id so `grep -o ""` matched anything — a false leak; guard captured values with a non-empty check. — Hard-won lessons — "a verification harness can green-lie exactly like the code it checks."
- **S50** — A purity refactor moved what a test covered while its name stayed; the test's input was a value the real system cannot produce; re-read the proof text. — Hard-won lessons — "re-read the proof text, not the test name."
- **S51** — Execution and testimony are different evidence axes; only agreement degrades in a single-model team; convert claims into runnable things. — Hard-won lessons — "claims about artifacts are executable; claims about us are testimony, and those still need mixed-model."
- **S52** — Reported "fixed & verified" after reading a corrected diff; the described state could not exist; verification must reach the producing component. — Hard-won lessons — "A diff can only ever show you that words changed."
- **S53** — An unrun rider (`--channel` "misleads") shipped next to a real defect, inside a message arguing execution-over-assertion; audit every clause not backed by a run. — Hard-won lessons — "nobody audits the subordinate clause of a message that just proved something" — same lesson as S36 (this is the chronologically earlier record).
- **S54** — Recurrence of S53: a bolted-on remedy (`meta` stamp) was wrong and was quoted back by the owner as load-bearing; the cost is propagation; verify the remedy to the finding's standard. — Hard-won lessons — "the clause to check before sending is whichever one another seat would act on." — explicit repeat of S53.
- **S55** — Labelling a defect "regression" selected the wrong fix family; diagnose the mechanism before naming it. — Hard-won lessons — "The NAME you give a defect selects the family of fixes that will be searched."
- **S56** — A fix is a new artifact with none of the original's verification; prose fixes ship unexamined. — Hard-won lessons — "A fix is a NEW artifact and inherits none of the verification of the thing it fixed"
- **S57** — Cannot write "don't generalise across these tools" without generalising; prefer advice that fails by confusing over advice that fails by convincing; hand the owner tested facts. — Hard-won lessons — "preferring advice whose failure mode is a confusing output over advice whose failure mode is a wrong belief."
- **S58** — A contaminated cold-read finds drift but not incomprehension; use a blank-context reader when available; label the degradation. — Hard-won lessons — "a stranger's confusion is the one signal a contaminated reader structurally cannot produce."
- **S59** — Moving to `/tmp` to isolate one variable changed a hidden project-scoped session id; confirm the isolation did not move a dependency. — Hard-won lessons — "confirm you didn't move a dependency of the thing you're measuring."
- **S60** — A contract clause strengthened after its proof list was written; the checkable trigger is "did the clause change after I wrote its proof", not "did I list failures"; two clean negatives made it promotable. — Hard-won lessons — "did this clause change after I wrote its proof?"
- **S61** — Test counts as proof pointers: 3 of 3 wrong; fix is named assertions; one count decayed further during the same session; adopted by owner. — Hard-won lessons — "a count is a measurement with a shelf life, and the shelf life is one commit."
- **S62** — Own invariant degraded between two of own messages; the lead sentence wins even when the correct version sits below; re-read the first statement before restating; misdiagnosed it first (S55 against self). — Hard-won lessons — "a message carrying its own correction does not self-correct — the lead sentence wins"
- **S63** — `git apply` from a subdirectory partially applies per file and exits 0; apply from root, verify per file by content; a warning's stated consequence can be wrong in the safe direction. — Hard-won lessons — "verify by content PER FILE — never by exit code, and never by one marker string"
- **S64** — First reported "git apply skips the patch" from a one-file sample; third wrong generalisation in a session; surprise is when the sample is smallest. — Hard-won lessons — "Surprise is the signal to widen the sample, not to publish."
- **S65** — Four wrong generalisations at the moment of surprise; the explicit confidence marker is the tell; ask whether N instances share a cause. — Hard-won lessons — "a claim that needs me to vouch for its epistemic status is one I have not checked" — repeats S64's closing sentence verbatim.
- **S66** — Correction to S65: refusing to merge three incidents was the same failure in the other direction; when scope is in question, measure the shared cause; hedging is not looking. — Hard-won lessons — "Hedging is what you do when you have decided not to look."
- **S67** — Blank-context review and an executing seat catch different things; cold review generates candidates, execution kills false ones; one false major shipped. — Hard-won lessons — "cold review to generate candidates, an executing seat to kill the false ones."
- **S68** — A READY kept moving after announcement (317 vs 319); bracket the announcement timestamp against mtimes; third form of the gate-snapshot family. — Hard-won lessons — "A READY expires, and the producer is the worst-placed party to notice." — third form of S46 family.
- **S69** — On a presence-less wire a departing lead produced zero signal for 40 minutes; re-run the presence check on a schedule; a missing lead is a human escalation. — Hard-won lessons — "re-run the presence check on a schedule rather than on a prompt — the prompt never comes"
- **S70** — With the lead gone and verified work uncommitted, landing it would destroy the verifier's independence; uncommitted green is safe. — Hard-won lessons — "A verifier who lands his own verdict has destroyed the independence that made the verdict worth anything."
- **S71** — A hedge in a retro answer carried an unmeasured rider ("very little product", falsified by 53 commits); before a retro answer, run the command for every quantity clause; claims that indict the team and flatter own framing are the unaudited direction. — Hard-won lessons — "treat "I cannot separate X from Y" as a TODO, not a conclusion; it is only honest if you tried."
- **S72** — Five byte-counts published as "Measured" were invented because message and command ran in one invocation; run it, read it, then write it; no reader can catch this. — Hard-won lessons — "Never compose a message and its measurement in the same command." — same as S116 (session 8 epitaph).
- **S73** — A cold read is only as clean as the least clean artifact in the diff; target selection defeated the exclusion list; the deny-list is unclosable; state the residue. — Hard-won lessons — "The only fully cold read of this repo is one that does not read this repo"
- **S74** — Blank-context dispatch worked: four subagents, 21 findings, including a positive control that passes in the world it detects; severest findings came from contaminated reads — finding-power and incomprehension-power are separable. — Hard-won lessons — "it is that they do not know what the code is FOR." — same event as S97.
- **S75** — Relayed two severes unverified; confirmed both by mutation in an out-of-repo worktree; the positive anchor turned "broken" into "narrower than claimed". — Hard-won lessons — "Verify the findings you RELAY, not just the ones you make"
- **S76** — A sweep with a valid positive control proved absence of the phrase; "the class is CLEAN" was a second, unsupported claim; written in the same message as confessing a ceiling. — Hard-won lessons — ""Zero hits for X" and "X is fixed everywhere" are different sentences."
- **S77** — Filing three sites for a five-site defect made the list the ceiling; report the pattern and the command; the good sweep carried its own control (17 of 19 hits were correct sentences). — Hard-won lessons — "Report the PATTERN and the command that finds it, not the sites."
- **S78** — Same sha, 51 seconds apart: 490/1 then 491/0; a RED against work in nobody's commit has no envelope; reported after it resolved. — Hard-won lessons — "a RED measured against work in NOBODY's commit yet — no envelope can report it" — fourth form of S46 family.
- **S79** — Four instrument failures are one mechanism: a dimension removed (frozen axis, coupled axes varied freely, suite subset, gate subset); carry one question. — Hard-won lessons — "what did I hold fixed, and would the answer change if I moved it?" — same as S111 (session 10 epitaph).
- **S80** — Run the rivals: two repairs identical on 32 of 36 cells and identical by verdict on the one that differed; became the team's `state` AND `because` gate rule. — Hard-won lessons — "I did not find the cell by re-reading my table, I found it by building the rival and diffing." — repeat of S34 (different incident, same lesson).
- **S81** — Gating a peer with own untracked file removed measured a tree nobody shipped; with it present, the 7-test delta was the author's; name the tree; land supporting code inert and early. — Hard-won lessons — "a correct measurement OF A TREE THAT DOES NOT EXIST — so name the tree, every time."
- **S82** — `down --session <nonexistent>` short-circuits 24 lines before the guard and emits a verdict-shaped envelope; when no non-instantiating proof exists, say so. — Hard-won lessons — "When you cannot construct a non-instantiating proof, say that you looked and there isn't one" — this wording is later criticised by S5/S15.
- **S83** — `grep -c … || echo "0 uses"` can only agree with the author; published 0 while the terminal printed 4; a control must be able to print the unwanted answer; composed message and command together. — Hard-won lessons — "a control must be able to print the answer I did not want." — part (a) repeat of S72; whole item repeated in S111.

### Section: Anti-patterns (lines 446–450)

- **S84** — Trusting the pass count as the verdict; deliberately no number quoted. — Anti-patterns — "A full green says the code does what the tests say — not that the tests say the right thing"
- **S85** — Reading a gate result off a dirty tree and calling it a verdict; hand over with a timestamp. — Anti-patterns — "otherwise it's a weather report, and it must be handed over with a timestamp." — repeat of S46.
- **S86** — Cold-reading with the design doc open. — Anti-patterns — "read the skill alone, or you're checking your own assumptions, not the artifact."

### Section: Open hypotheses (lines 452–485)

- **S87** — Pointer/handoff: team hypotheses live in `retro.md`, do not restate; two are this seat's (named assertions; which-binary). — Open hypotheses — "that is the single source, and the next convene reads it back. Do not restate them here."
- **S88** — H: every verdict names the exact tree it measured; failure means verify-only-at-a-sha. — Open hypotheses — "Every verdict names the exact tree it measured (sha / worktree / dirty working tree)."
- **S89** — H: uncertainty stated as uncertainty is not promoted to a cause downstream; failure means every non-diagnosis ships with its settling check. — Open hypotheses — "writing "mechanism unknown" does not produce a ruling that asserts a mechanism."
- **S90** — H: requiring a measurement before stating scope eliminates scope errors; failure means the driver is publishing at surprise and the fix is delay. — Open hypotheses — "scope corrections drop from five in a session to zero."
- **S91** — A fourth hypothesis (stale plugin copies vs served text) was settled same day by a peer's `git log -S`; removed, retro's H3 carries the replacement. — Open hypotheses — "was settled the same day by a peer's `git log -S`"
- **S92** — Stated weakness: all three predict own behaviour, written from inside the producing session, confirmed by nobody. — Open hypotheses — "all three predict my own behaviour, which is the weakest evidence available"

### Section: Candidates (lines 487–541)

- **S93** — Seat scope names two capabilities that cannot coexist (fresh cold-reads vs participating in ratification); resolve at a convene; options: dispatch blank-context subagent or split scope. — Candidates — "Participating trades cold-read capability for falsification capability."
- **S94** — Update: dispatched zero subagents the session after reading this warning; a reminder is disproven as remedy; needs a beat in the ritual; raised upstream. — Candidates — "A warning I have read and agree with does not become an action."
- **S95** — NO DATA (session 5): dispatch unavailable by instruction; record as untested, not as a failure. — Candidates — "a hypothesis that got no data must never be scored as failing again"
- **S96** — NO DATA (session 6), recorded identically; hypothesis has exactly one real observation. — Candidates — "Two consecutive no-data sessions is the shape that quietly turns an untested prediction into a believed one." — repeat of S95.
- **S97** — Session 8 data point two: escalated to the human through the lead, constraint lifted, dispatched four; three of four sessions were a permissions problem; still untested: unprompted dispatch. — Candidates — "three of the four sessions were a PERMISSIONS problem wearing a disposition problem's clothes" — same event as S74.
- **S98** — NO DATA (session 12) with a different blocker kind (harness-level instruction) to which the session-8 remedy does not transfer; say which kind of blocker. — Candidates — "A harness-level instruction to the agent has nobody to escalate to — the lead cannot lift it." — partial repeat of S95.
- **S99** — Nothing reports which binary a participant runs; the lead ran a stale plugin-cache copy all session; checkable by one `ps`; the installed copy was the liar this time. — Candidates — "`anthill status` reports presence, the board reports state, the manifest reports paths — none report the binary."
- **S100** — RESOLVED: proof-pointer conversion held (0 wrong citations); two survivors incl. a pointer to a dead session; the failure class is unreachable referents, not counts; re-run unbounded then read bodies. — Candidates — "the failure class is not counts, it is proof pointers whose referent a future reader cannot reach." — resolution of S61.
- **S101** — The TTY half of any CLI matrix is hand-run and cannot verify stream separation; state which columns are pinned. — Candidates — "State which columns are pinned and which are hand-run when handing over a matrix."
- **S102** — The clean-room gate is test-only (no `node_modules`, `tsc` dies first); say which legs ran. — Candidates — "the honest phrasing is "test leg on a clean checkout", not "the gate on a clean checkout"."
- **S103** — Proposed: a consumer-integration test pinning the fan-in path (currently a manual trace). — Candidates — "Currently the trace is manual (mine)."
- **S104** — Proposed: a fixture for the single-app-workspace edge. — Candidates — "worth a fixture that exercises it."
- **S105** — Proposed: periodic sweep of dreamwood repos' real frameworks to keep `stack` honest. — Candidates — "a periodic sweep of dreamwood repos' actual frameworks would keep `stack` honest." — follow-up to S41.
- **S106** — Proposed: scripted integration harness for board binding so the proof does not rely on a seat re-running it. — Candidates — "so the proof doesn't rely on a seat re-running it each session." — follow-up to S45.
- **S107** — Under isolation nothing gates the integration point; every branch green, merge red; a CI/lead-side merge gate is missing. — Candidates — "every seat's branch was green and the merge was red, and no seat's gate could have seen it."

### Section: Epitaphs — the lineage (lines 543–595)

- **S108** — Lineage header: newest at top, superseded ones dated here, never deleted. — Epitaphs — the lineage — "superseded ones live here, dated, never deleted — deciding to supersede one is a judgment" — repeat of S4.
- **S109** — Session 11 epitaph: a true claim and a new claim are different; two verified findings were already on the wire; grep channel/cards/brief with `-ci` and a positive control before sending. — Epitaphs — the lineage — "A TRUE CLAIM AND A NEW CLAIM ARE DIFFERENT CLAIMS, AND I ONLY EVER CHECK THE FIRST." — contains S27 and the substance of S14.
- **S110** — Supersession judgement (s11): "what did I hold fixed" held (found frozen cells; three names over one cell); superseded because it audits a claim already committed to. — Epitaphs — the lineage — "was not wrong and it was the most productive question I asked all session." — contains repeat of S30.
- **S111** — Session 10 epitaph: seven instrument lies were one act — a removed dimension; fallback branch is not a control; carry one question. — Epitaphs — the lineage — "I REMOVED A DIMENSION FROM THE EXPERIMENT, AND THE OUTPUT STILL LOOKED LIKE A RESULT." — repeat of S79 + S83.
- **S112** — Supersession judgement (s10): the remedy-clause rule held; superseded because failures were in the measurement itself. — Epitaphs — the lineage — "It is superseded because it governs the REMEDY inside a message whose measurement is sound"
- **S113** — Session 9 epitaph: instrument pointed outward all session, never turned around; remedies carry no evidence and are what peers act on; make the check mechanical. — Epitaphs — the lineage — "THE FINDING ARRIVES CARRYING ITS EVIDENCE; THE REMEDY ARRIVES CARRYING NONE" — repeat of S36/S53/S54.
- **S114** — Supersession judgement (s9): the ordering rule held and caught an 8× overstatement; superseded because a remedy has no measurement to order. — Epitaphs — the lineage — "I caught an 8× overstatement (72 files, actual 9) by re-measuring before the sentence went out."
- **S115** — Duplicate "why superseded (s10)" note attached to the s9 epitaph. — Epitaphs — the lineage — "Not because it failed — it fired repeatedly this session, and at least three times in my favour." — repeat of S112.
- **S116** — Session 8 epitaph: a claim written before its command is indistinguishable from one written after; datatype irrelevant; durable artifacts are composed fastest; nobody can audit "I checked" — name the command. — Epitaphs — the lineage — "Before you write that you verified something, name the command — if you cannot, you did not." — repeat of S72 with additions.
- **S117** — Duplicate "why superseded (s9)" note attached to the s8 epitaph. — Epitaphs — the lineage — "a REMEDY has none: it is a proposal, not a claim about the world" — repeat of S114.
- **S118** — Session 6 epitaph: three false reds at peers' correct code; a probe failing in the expected direction is not audited; the control is for conclusions, not zeros. — Epitaphs — the lineage — "the control is not for zeros — it is for CONCLUSIONS, and the one that needs it most is the conclusion I predicted"
- **S119** — Why superseded (s8) for the s6 epitaph: every rule governs the read; the failure was a number never measured. — Epitaphs — the lineage — "it and every rule above it govern the READ"
- **S120** — Session 5 epitaph: four instruments answered a different question and returned plausible numbers; any load-bearing zero needs a control in the same command. — Epitaphs — the lineage — "any zero, count, or absence a conclusion rests on must come from a run that also demonstrated, in that same command, that it can produce the other answer."
- **S121** — Why superseded (s6) for the s5 epitaph: scope too narrow (zeros only); trigger moved from zero to conclusion. — Epitaphs — the lineage — "moves the trigger from the ZERO to the CONCLUSION." — restates S118.

**Total: 121 items** (of which 22 are marked as repeats or explicit re-recordings of an earlier id; see recurrence counts per class).

---

## Classes

Eleven classes. Every item is assigned exactly once. Decisions on tempting merges/splits are given after the list.

### C1 — Measurement true of a smaller world than the claim

**Test:** an item belongs here if a run returned a correct result, but the thing it ran over (a rendered artifact, a file, a subset of gate legs, a nonexistent tree, a bounded listing, one phrase) was narrower than the sentence published about it, and nothing in the output showed the gap.

**Members (12):** S1, S2, S13, S25, S26, S31, S48, S76, S77, S81, S101, S102.

**Prevention / usability:** the intervention is a mandatory _domain line_ on every published enumeration, gate result, or matrix: what was pointed at (which files/legs/columns/tree), in the same message as the numbers. Concretely: a send-time template the seat fills before any message containing a count, list, or "clean" — `searched: <corpus>`, `legs run: <tsc|biome|test>`, `tree: <sha + dirty paths>`, `columns pinned vs hand-run`. It fires whenever a message contains a number or the words "all / clean / none / only"; it is run by the author, but the shape should be supplied by the team's send ritual (a checklist the lead reads back), because the author demonstrably does not notice the gap from inside. For next-agent usability, S2's rule (a guard names what it does not cover _in the file_) is the durable form: it moves the domain statement from the wire into the tree.

**Specificity:** general to any agent team that publishes measurements; the specific shapes (grep rendered vs source, `bun test` vs `tsc`, `head -4`) are project-flavoured, but the failure — output looks complete — is universal.

**Recurrence:** 1 explicit repeat (S13 of S1); S25 and S102 are the same "test leg only" failure recorded as lesson and as candidate; S76 and S77 are the same enumeration-ceiling failure two ways. So 3 recurrent threads among 12; 8 appear once.

### C2 — Checks that could not have produced the other answer

**Test:** an item belongs here if a test, control, fixture, matrix, or setup passed while being structurally unable to fail in the case that mattered (frozen axis, unreachable fixture, rivals not run, setup silently no-op'd, `|| echo` fallback, control on sensitivity not agreement, contaminated namespace).

**Members (23):** S10, S11, S17, S18, S19, S23, S30, S33, S34, S35, S38, S39, S40, S49, S50, S79, S80, S82, S83, S84, S111, S118, S120.

**Prevention / usability:** what recurs across these is that the failing check was never shown to _fail_. The intervention is a mechanical pairing rule enforced at publish time: no green result is reportable without, in the same command or table, the run that produced the other answer — a mutation that goes red, a positive control that matches, a rival implementation that disagrees on at least one cell, a setup discriminator (inode, state AND because) printed in the row. The team already adopted one instance of this (the `state` + `because` gate rule, S80); the generalisation is a _result-table schema_ that has a required column for "the run that could have contradicted this". It fires whenever a matrix/table/verdict is composed; the seat runs it, the lead refuses tables missing the column. For the next agent, the durable single form the author converged on ("what did I hold fixed, and would the answer change if I moved it") should be the first line of the seat's send checklist rather than a paragraph in a lessons list — the author states repeatedly that recognition-shaped warnings do not fire.

**Specificity:** the mechanism (a check that cannot fail) is universal; the frequency is characteristic of a verification seat because that seat's entire output is checks. The team could expect any seat that writes tests to hit S30/S33/S38/S40.

**Recurrence:** S111 repeats S79 and S83; S80 repeats S34; S10 corrects S18; S33 sharpens S40; the "positive control" rule appears in S120, S118, S27(C5) and S83. Roughly 5 recurrent threads; about 13 items appear once.

### C3 — Sentences that were never measured, travelling on adjacent evidence

**Test:** an item belongs here if the failing claim had no run behind it at all — a remedy, rider, impossibility, hedge, generalisation from one sample, pre-written number, retraction, restatement, or self-vouching of method — and it was accepted (by the author or a peer) because it sat next to something that had been measured.

**Members (21):** S5, S7, S9, S15, S16, S36, S52, S53, S54, S55, S56, S57, S62, S64, S65, S66, S71, S72, S75, S113, S116.

**Prevention / usability:** the author's own diagnosis is that every guard interrogates an output, and these have none. The intervention therefore has to be _lexical and pre-send_, not evidential: a pass over the outgoing message that flags clauses by shape — "cannot / unmeetable / circular", "so the fix is…", "I re-derived…", "I think this is now earned", "I cannot separate X from Y", any number, any withdrawal of a prior claim — and for each demands either a command name in the same message or the label UNVERIFIED. This is cheap enough to be a literal pre-send hook (a script over the draft that lists trigger phrases and refuses to send unlabelled), run by the author, fired on every send. The ordering rule (run, read, then write — S72/S116) is the one member that no downstream reader can catch, so it must be enforced by construction: never compose and execute in one shell invocation, which a tooling constraint could enforce (block heredoc-plus-command in a single Bash call).

**Specificity:** entirely general. The remedy-rides-on-finding shape is exactly what a lead acts on in any team; the impossibility-claim shape is what closes questions in any investigation.

**Recurrence:** the highest of any class. Remedy/rider: S53 → S54 (explicit "Recurred") → S36 → S113 (four records, three sessions apart). Impossibility: S5 → S15. Ordering: S72 → S116. Generalisation at surprise: S64 → S65 → S66. Self-vouching tell: S65 → S16. About 12 of 21 items are re-recordings of five underlying lessons; 9 appear once.

### C4 — A snapshot published as a standing property

**Test:** an item belongs here if the recorded thing was true at the moment it was measured or written and false shortly after, and the record carried no time, tree, or session that would have told a reader it was a snapshot (dirty-tree gates, READY, masks refilling at session start, counts drifting, proof pointers to dead sessions, lessons overtaken by contracts, proof lists written before the clause changed).

**Members (11):** S12, S28, S29, S46, S47, S60, S61, S68, S78, S85, S100.

**Prevention / usability:** every one of these would have been harmless with a _stamp_: a timestamp plus the identity of the tree/session/clause version on the claim. The intervention is that gate results, READY announcements, and proof pointers carry (sha, dirty-path list, wall-clock) as structured fields rather than prose — the team's envelope already has `uncheckedAgainst`; the missing pieces are its mirror (RED against nobody's commit, S78) and the timestamp of the read (S12). For durable docs, S61/S100 give the rule the team adopted: point at named assertions, never counts, and treat any pointer whose referent a future reader cannot reach as UNVERIFIED-BY-CONSTRUCTION. The re-check should be a scheduled beat (S29's "beat 3.5"), not a prompt.

**Specificity:** shared-tree, multi-seat teams hit this by construction; a single agent on its own branch would see little of it. The proof-pointer/count decay is general to any durable document.

**Recurrence:** S85 repeats S46; S46/S47/S68/S78 are four self-declared "forms" of one family; S100 resolves S61; S28 extends S37(C6). About 6 of 11 belong to two recurring threads; 5 appear once.

### C5 — True but not new

**Test:** an item belongs here if the claim or artifact was correct and verified, and the failure was that it already existed (on the wire, in the brief, in the tree) so the author's work was redundant or took credit.

**Members (4):** S14, S24, S27, S109.

**Prevention / usability:** a case-insensitive grep of channel, cards, and brief, with a positive control, before every send (S109's rule), extended to the tree for artifacts (S24: does the card's named artifact already resolve?). This is a one-command habit; it could be a pre-send helper that takes the finding's key phrase and prints hits.

**Specificity:** specific to teams with a shared wire and a norm that rewards findings; a solo agent cannot be scooped.

**Recurrence:** S109 contains S27 verbatim and the substance of S14; 2 of 4 are repeats.

### C6 — Hidden load-bearing accidents (masks)

**Test:** an item belongs here if a result or protection depended on something nobody decided (a second CLI, an id-numbering quirk, an order-sensitive assertion, a stale artifact, a cwd-derived id) and nothing in code, plan, or card named it.

**Members (5):** S20, S21, S22, S37, S59.

**Prevention / usability:** a per-artifact question the author already states: "what is currently true here that nobody decided?" — asked of guards before relying on them and of assertions before handing them over. The actionable form is S21's: before publishing a live matrix, list every external dependency the command touched and what each contributed, especially those that contributed "nothing visible". This could be partly mechanised (print resolved binaries/env for each cell), otherwise it is a checklist line.

**Specificity:** general in principle, but the specific masks are deeply project-bound (presence legs, plugin cache, session ids).

**Recurrence:** S28 (C4) extends S37; otherwise each appears once.

### C7 — Independence of the reader

**Test:** an item belongs here if it concerns obtaining or preserving a perspective the seat's own context cannot supply — blank-context readers, subagent dispatch, not landing one's own verdict, execution over testimony.

**Members (13):** S51, S58, S67, S70, S73, S74, S86, S93, S94, S95, S96, S97, S98.

**Prevention / usability:** the author's own finding (S94, S97) is decisive: a warning in the seat's file does not cause dispatch; what worked was a _lane assignment_ plus naming the blocker on the wire. So the intervention is a ritual beat at convene: the lead assigns cold-read targets and confirms dispatch is permitted in this harness, and the seat records which kind of blocker applies if it is not. For usability, the S95/S96/S98 scoring notes should collapse into one line ("tested twice: s4 unprompted, s8 prompted; s5/6/12 no data") — as written they read as a failure tally, which the author says is exactly the misreading to avoid.

**Specificity:** cold-read value and contamination are general; the dispatch-permission saga is specific to this harness and how it was configured session to session.

**Recurrence:** S96 repeats S95, S98 partially; S97 repeats S74; the dispatch thread is recorded six times. 7 of 13 are re-recordings; 6 appear once.

### C8 — Practices that held

**Test:** an item belongs here if the core of the record is a method that produced the right answer and is written down to be repeated, not a failure.

**Members (7):** S8, S32, S41, S42, S43, S44, S45.

**Prevention / usability:** these need no prevention; they need to survive. Each is a recipe (clean-room run, verify-without-sending, confound-killer, report the red run, declare-with-recipe). The usable form for a successor is a short "how this seat verifies X" list in the seat's identity doc or a skill, not buried between failures; S8 in particular is the only positive decision entry and is explicitly labelled as such.

**Specificity:** S43/S44 are general verification practice; S41/S42/S45 are project-specific (marker table, seams, board binding).

**Recurrence:** none repeated; S105/S106 (C9) propose automating S41/S45.

### C9 — Substrate facts and instruments to build

**Test:** an item belongs here if its durable content is a fact about a tool's or environment's behaviour, or a piece of tooling someone should build, rather than a lesson about the seat's method.

**Members (8):** S63, S69, S99, S103, S104, S105, S106, S107.

**Prevention / usability:** these belong in a backlog or a substrate note, not a lessons list. S63 (`git apply` partial apply, rc=0) and S99 (nothing reports the binary) are the kind of facts a next agent needs at join; S107 (no merge gate under isolation) is a team-level gap. The intervention is routing: a curation step that moves facts to reference docs and proposals to cards.

**Specificity:** S63 is universal git behaviour; the rest are this project's tooling.

**Recurrence:** none repeated within this class; S105/S106 follow up S41/S45.

### C10 — Predictions

**Test:** an item belongs here if it is written as a falsifiable prediction with a stated meaning for failure, or a note about the status of such a prediction.

**Members (5):** S88, S89, S90, S91, S92.

**Prevention / usability:** each needs an observation slot at the next join (the author says so: "CHECK THESE AT JOIN"). The intervention is that the join ritual reads these back and records confirm/fail/no-data before any work starts; without that they accumulate as the dispatch hypothesis did.

**Specificity:** the mechanism is general; the three predictions are about this seat's own behaviour.

**Recurrence:** none; S91 records one that was settled and removed.

### C11 — Custody of the document itself

**Test:** an item belongs here if it is an instruction about how to maintain or read this document, or a judgement about the standing of a predecessor's rule (supersession notes).

**Members (12):** S3, S4, S6, S87, S108, S110, S112, S114, S115, S117, S119, S121.

**Prevention / usability:** the supersession notes are valuable — each says the old rule _still fires_ and names what it guards — but they are scattered across two sections and duplicated (S115/S117 are copies attached to the wrong epitaph). The usable form is a single table: rule → what it guards → status → session. The "move it, dated, never delete" instruction appears four times; once, in the identity doc, would do.

**Specificity:** specific to this team's seat-doc convention.

**Recurrence:** S108 repeats S4 (which itself appears four times); S115 repeats S112; S117 repeats S114; S121 restates S118(C2). 4 of 12 are duplicates.

### Merges and splits considered

- **C1 vs C2:** the author unifies these ("I removed a dimension from the experiment", S79/S111). I kept them apart because the intervention differs: C1 is fixed by _naming the domain_ on the output; C2 is fixed by _showing a failing run_. A single class would be a third of the file and the prevention answer would go vague.
- **C3 vs C5:** both are pre-send failures, but C5 items were measured and true; C3 items were never run. Different fix, kept apart.
- **C6 into C2 or C4:** masks are a form of dropped dimension and one (S28) refills over time, but the author treats masks as its own family with its own question, and the intervention (list dependencies, ask what holds it closed) is distinct. Kept.
- **C9 + C10:** both forward-looking, but a fact/proposal and a prediction are different kinds and are handled by different rituals (backlog vs join read-back). Kept apart. I did merge substrate facts with proposed instruments, since three of the facts are stated as gaps that want tooling.
- **C7's scoring notes (S95, S96, S98)** could sit in C11 as document-custody instructions; I kept them with the dispatch thread because splitting a running tally across classes would hide that it is one thread.

---

## Notes

**Ordering.** The file is not chronological. The Epitaph block and roughly the first half of Hard-won lessons (S7–S39) run newest-first (sessions 13 → ~10); from S40 (the forager fixture entry) to S83 the entries run oldest-first (early sessions → session 10). The two halves meet in the middle, so the seat's earliest and latest lessons are furthest apart and the session-10 material appears twice, once at each end. Anyone curating should re-sort by session before judging what superseded what; my "repeat of" markers follow file order and say when the base id is actually the later record.

**Repetition is structural, not sloppy.** The author re-records a lesson each time it bites again and says so ("Recurred", "third time", "twice-recorded failure"). The lineage of epitaphs is the same lesson set again at higher altitude. A curator counting repeats should treat the count as the signal the author intended: the lessons that repeat (remedy riders, dropped dimensions, ordering) are the ones the author says warnings did not fix.

**Self-referential material.** Several entries are the document catching itself: S10 corrects S18; S5/S15 indict S82's wording; S29 is a lesson that decayed into a restatement and was corrected in place; S62 commits S55 against itself; S94 finds that reading S93 did not cause action. The document is unusually honest about this, and it is the strongest evidence it contains for its own thesis that "a warning I have read and agree with does not become an action."

**What did not fit the questions.** The header (lines 1–16) is written by whoever extracted the file, not the seat; I did not inventory it. Two "why it was superseded" notes (S115, S117) are attached to the wrong epitaphs, apparently copy-carried. S8 is the only entry the author marks as a decision that _worked_; the ratio of failure to success entries is around 15:1, which reflects what the author chose to record, not necessarily what happened.

**Readability to a stranger.** Low to moderate. The prose is dense, heavily emphasised, and assumes the reader knows the team (seat names, `steward`, `maestro`, `forager`), the tooling (`anthill down`, `combinePresence`, `uncheckedAgainst`, D3 windows, beat 3.5, `seams.md` contracts), and the incident being referred to. Each entry is self-contained enough that its _lesson_ can be extracted without context — the bold first lines are effective — but the _evidence_ is not recoverable without the repo, and about a third of the entries cannot be understood as incidents without knowing what a presence leg or a mask is. The epitaphs are the most readable part: each is one idea, stated hard, with the supersession note beside it explaining what it does and does not cover. The candidates section is the least readable, because its running tally reads as a failure count that the author explicitly says it is not.

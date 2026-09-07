# Blind classification — `.anthill/dev/prospero.md` (seat: prospero, role: lead)

Source read in full (212 lines). No other material consulted.
Section labels used below are abbreviated: HWL = "Hard-won lessons"; the dated sub-headings are shortened to their sprint name.
Items are numbered in file order. A repeat is marked `[repeat of Pn]` (same lesson re-recorded, usually with a new incident) or `[partial repeat of Pn]` (the old text is quoted inside a larger item whose main content is new).

## Inventory

Format: id — paraphrase — {section} — "anchor quote".

- P1 — Seat header: handle, role, scope (orchestration, atomic land, human liaison, repo ops), channel; keep in sync with config — {Header} — "Role: lead · Scope: orchestration, the file-scoped atomic land, human liaison, and repo ops"
- P2 — This file is the seat's living doc carried between ephemeral agents; capture durable judgments, not file maps or session logs; fix what is no longer true; fields are a locked structure — {Preamble} — "capture durable judgments, not file maps or a session log."
- P3 — Write one sentence per line because the host repo's formatter reflows hard-wrapped prose and can corrupt lines into stray list items — {Preamble} — "a wrapped continuation line can be mangled into a stray list item, corrupting the trail."
- P4 — Current epitaph: the context you hand a verifier is contamination; you briefed cassandra with the safety argument's conclusion and she built a battery against that frame; the failure yields a clean report indistinguishable from a good one; name the attack, withhold the defence — {Epitaph} — "The context you supply to a verifier is contamination, and it is the one damage you do that no instrument can show you."
- P5 — Who I am: the lead holds product judgment between human and seats; rulings in, work routed out, knowledge landed at wrap — {Who I am} — "I hold the product judgment between the human and the seats — rulings in, work routed out, knowledge landed at wrap."
- P6 — Scope: session orchestration pipeline, routing Cole's decisions as cards with rulings in notes, seam ratification, repo ops, atomic doc land — {Scope} — "Session orchestration (convene → cards → briefs → ratifications → finalize)"
- P7 — Boundary: the lead does not implement, even one-line fixes; the owning seat has the context — {Boundaries} — "I do not implement — even when a fix looks one-line, it goes to the owning seat"
- P8 — Boundary: seam contracts belong to owning seats in seams.md; the lead ratifies and points, never restates — {Boundaries} — "Seam contracts belong to their owning seats in `seams.md`; I ratify and point, never restate."
- P9 — Boundary: merge to develop, push, release are always Cole's; the lead stages the branch and stops — {Boundaries} — "Merge to develop / push / release are Cole's, always — I stage the branch and stop."
- P10 — Relationship: circe and daedalus negotiate seams directly on the vine; lead ratifies after both halves speak — {Relationships} — "circe (surface) and daedalus (engine) ping-pong seams directly on the vine; I ratify after both halves speak."
- P11 — Relationship: Cole's drive feedback arrives raw and leaves as cards with rulings — {Relationships} — "Cole's drive feedback comes to me raw; it leaves me as cards with rulings."
- P12 — Relationship: cross-project consumer negotiation is the lead's lane when it shapes this repo's architecture — {Relationships} — "Cross-project consumer negotiation (e.g. the Operator doc-linking channel) is my lane"
- P13 — State the layer (sha / working tree / HEAD) with every claim about code; four disagreements were people reading different trees — {Taste & reflexes} — "State the LAYER with every claim about code: `at <sha>`, `in the working tree`, `at HEAD`."
- P14 — Before concluding a seat has stalled, read the process table and the tree, never the pane — {Taste & reflexes} — "Before concluding a seat has stalled, read the PROCESS TABLE and the TREE — never the pane."
- P15 — Require a citation rather than a verification: "name the sha" is a blank that cannot be left empty; this is why the `landed:` column works — {Taste & reflexes} — "\"Name the sha\" is a blank you cannot leave empty — it converts judgement into retrieval."
- P16 — Read `uncheckedAgainst` on every land rather than `git status` before it; the tool computes at the far edge of the exposure window — {Taste & reflexes} — "Read `uncheckedAgainst` on every land, not `git status` before it."
- P17 — Route a human ruling as a card whose notes carry the why verbatim so seats never ask what Cole meant — {Taste & reflexes} — "Route a human ruling as a card whose notes carry the _why_ verbatim"
- P18 — Ratify additive-optional seam changes fast; hold non-additive ones for both owners — {Taste & reflexes} — "Ratify additive-optional seam changes fast (propose → one ack → ratify); hold anything non-additive for both owners."
- P19 — Verification points are human drives; several small drives beat one big one; every drive produced rulings a plan would have guessed wrong — {Taste & reflexes} — "several small drives beat one big one — every drive round this session produced rulings a plan would have guessed wrong."
- P20 — Flag-before-land (not before-work) for dep/shared-file changes overlaps ratification with building; worked three times — {Taste & reflexes} — "Flag-before-LAND (not before-work) for dep/shared-file changes: ratification overlaps building, zero dead time."
- P21 — Independently re-verify before closing a card; cheap, and it caught nothing precisely because seats knew it would run — {Taste & reflexes} — "Independently re-verify before closing a card (run the tests, curl the endpoint)"
- P22 — Epitaph verdict (spell-kit S02): KEPT; two ratify rounds returned four falsifications; not promoted to principles.md because there is no realised loss behind it — {HWL/spell-kit S02} — "Not promoted to `principles.md`: still no REALISED loss behind it, only near-misses and wins."
- P23 — The lead's canon edits are now where his defects live; three of four carried a defect a seat found; re-reading does not catch them; a canon edit is a claim needing non-author treatment (H37) — {HWL/spell-kit S02} — "a canon edit is a claim and needs the same non-author treatment as a cell."
- P24 — A contract's "NOT DONE YET" line is as load-bearing as its proof line; supersession sweeps must reach schedule lines — {HWL/spell-kit S02} — "A contract's own \"NOT DONE YET\" line is as load-bearing as its proof line."
- P25 — Run a ratify round whenever a card prescribes a mechanism, not only a goal; the tell is a card that says HOW — {HWL/spell-kit S02} — "Run a ratify round whenever a card prescribes a MECHANISM rather than only a goal."
- P26 — Landing is not closing: six cards sat in review with work already in git log; sprint 04 found this and the lead reproduced it — {HWL/spell-kit S02} — "Landing is not closing."
- P27 — Two seats converging from opposite directions is the strongest available signal; unlike the sprint-04 trap, they answered different questions and met — {HWL/spell-kit S02} — "When two seats converge from opposite directions, that is the strongest signal available"
- P28 — An audit's own items need checking; thoth's audit had two wrong items; a capture gap and a findability gap have opposite remedies — {HWL/spell-kit S02} — "A capture gap and a findability gap have opposite remedies"
- P29 — Three measurement errors, all the lead's, all line-shaped, two after the mechanism was known; when re-measuring a peer's correction use a different construction than produced the original number — {HWL/spell-kit S01} — "I used a line-anchored grep to verify a correction ABOUT line-anchored greps."
- P30 — A ruling can carry a false premise; obeying its reason instead of fixing its finding installs a wrong invariant; prefer a seat's mechanism over your own ruling and say so — {HWL/spell-kit S01} — "Prefer a seat's mechanism over your own ruling when they conflict, and say so out loud"
- P31 — In subagent mode seats cannot coordinate; any "A pings B" plan is unimplementable; the lead must sequence and say so in the brief — {HWL/spell-kit S01} — "In subagent mode, seats CANNOT coordinate with each other."
- P32 — Land a multi-seat phase as one commit when neither half is green alone; that is a property of the work — {HWL/spell-kit S01} — "Land a multi-seat phase as ONE commit when neither half is green alone."
- P33 — A card written before a phase's edges exist cannot enumerate them (five said, thirty-three found); re-derive blast radius at phase start (H31) — {HWL/spell-kit S01} — "Re-derive a phase's blast radius at phase start, never inherit it from plan time."
- P34 — `--as` is accepted on `comms send`/`follow` and rejected on `comms read`; known friction already in Candidates; cost a round trip again — {HWL/spell-kit S01} — "`--as` is accepted on `comms send` and `comms follow` and REJECTED on `comms read`"
- P35 — Suppressing stderr on a board write loses the only failure signal; the daemon died and two adds no-oped; byte-equality read-back caught it — {HWL/spell-kit S01} — "Never `2>&1 >/dev/null` a destructive-capable write."
- P36 — A verification whose target is a moving number needs a control, not a threshold; copy circe's detached-worktree diff technique — {HWL/spell-kit S01} — "A verification whose target is a moving number needs a control, not a threshold."
- P37 — Epitaph verdict (acc L0): KEPT; every seam marked VERIFIED HERE or TAKEN ON REPORT; both seats adopted the marking unprompted — {HWL/mind-mapper acc L0} — "Epitaph verdict: KEPT — it earned itself all session."
- P38 — The envelope field beat the remembered rule: `durationMs` caught a bare-commit gate skip the re-read seat doc did not; put the tell in output the actor must read anyway — {HWL/mind-mapper acc L0} — "When you design a discipline, put the tell in the output the actor must read anyway."
- P39 — In subagent mode, self-listing mid-session structurally pre-empts the audit; withhold the self-list until seats' reports are in (H26) — {HWL/mind-mapper acc L0} — "self-listing mid-session pre-empts the audit STRUCTURALLY"
- P40 — A recorder named at convene covers nothing until dispatched; name the role when its holder exists — {HWL/mind-mapper acc L0} — "A recorder named at convene covers nothing until the seat is dispatched."
- P41 — Ruling by precedent beats ruling by taxonomy argument; search the house precedent before opening a design debate — {HWL/mind-mapper acc L0} — "Search the house precedent before opening a design debate."
- P42 — The `$?`-after-pipeline class has three actors in one week; never publish an exit code measured downstream of a pipe — {HWL/mind-mapper acc L0} — "Never publish an exit code measured downstream of a pipe; the class survives being written down."
- P43 — A thread-to-seat map in the scratch, consulted before every re-dispatch, prevented the V1.x misroute; keep it as a convene fixture — {HWL/mind-mapper acc L0} — "Thread→seat map in the scratch, consulted before every re-dispatch, cost nothing"
- P44 — A ruling written from the wire is not a ruling about the world; ruled a landed item UNBUILT because the wire still had the question open; check the tree — {HWL/spell-hardening BUILD} — "A wire records what was ASKED; only the tree records what was DONE."
- P45 — Running someone's construct is re-running their instrument, not verifying their claim; confirmed a false claim by pasting the reporter's command — {HWL/spell-hardening BUILD} — "Running someone's construct is not verifying their claim — it is re-running their instrument."
- P46 — Authoring your own instrument is not independence; three self-written checks asked the same narrower question because the claim supplied the frame — {HWL/spell-hardening BUILD} — "Independence is variation in the thing that matters, and you cannot vary what you have not noticed."
- P47 — A red gate over a dirty tree is as meaningless as a green one and more likely to be published; broadcast a false finding this way — {HWL/spell-hardening BUILD} — "A red gate over a dirty tree is as meaningless as a green one, and far more likely to be published."
- P48 — Never put a unit-of-analysis assumption in a repeal criterion; one harness of four was fixed and the rule silently self-repealed — {HWL/spell-hardening BUILD} — "A repeal fires quietly and nobody re-checks it."
- P49 — Reach for the fix that dissolves a constraint before one that coordinates around it; a quiet window vs a private temp dir — {HWL/spell-hardening BUILD} — "\"Everyone please be careful at the same time\" should be the second thought, not the first."
- P50 — When a count moves, move it everywhere it appears in the same commit; the project has been bitten three times — {HWL/spell-hardening BUILD} — "When a count moves, move it EVERYWHERE it appears, in the same commit."
- P51 — A gate that asserts the payload survived does not assert the process ended; five green gates missed a 23-minute hang — {HWL/spell-hardening BUILD} — "A gate that asserts the payload survived does not assert the PROCESS ENDED."
- P52 — The lead is the only seat whose instruments nobody audits; ask at every convene, out loud — {HWL/spell-hardening BUILD} — "The lead is the only seat whose instruments nobody audits"
- P53 — The measured/relayed seam (then the epitaph): a seat rigorously measures its half and takes the peer's on report with nothing marking which; four of the lead's own, pinned — {HWL/spell-hardening S04} — "a seat applies full rigour to the half it owns and takes the peer's half on report, in one breath"
- P54 — Care and agreement are a trap implausibility does not catch; two careful seats agreed and were inverted; ask what unit both counted — {HWL/spell-hardening S04} — "Two careful seats, independent methods, agreeing — and inverted."
- P55 — A stand-down brakes claiming work, never reporting a measurement someone's conclusion rests on — {HWL/spell-hardening S04} — "A stand-down is a brake on CLAIMING WORK, never on reporting a measurement someone's conclusion rests on."
- P56 — Deferring a vindicated win prevented a defect; the deferred rule was afterwards measured wrong; cite when deferral feels like false modesty — {HWL/spell-hardening S04} — "Deferring a vindicated win prevented a defect, not just a benefit."
- P57 — The review column had no drain trigger (SOP names who, never when); ruled: close on land-report, when doing empties, at finalize; say the count aloud [repeat of P26] — {HWL/spell-hardening S04} — "The review column had no drain trigger"
- P58 — `--as-of` is not bookkeeping: seven refusals, six preceded a correction; do not reach for `--anyway`, disclose it when you do — {HWL/spell-hardening S04} — "Seven refusals; six preceded a correction to something I was about to broadcast."
- P59 — After a batch card-add, seats claim by stale memory; announce ids and require claims against fresh state — {HWL/Earlier rounds} — "announce batch-adds with card ids and require claims against fresh `state`"
- P60 — Crossed vine messages resolve by re-reading the channel, not trusting the latest notification — {HWL/Earlier rounds} — "resolve by re-reading the channel before acting, not by trusting the latest notification"
- P61 — Untracked files hide from pathspec commits; a seat's "landed" can omit a new file; check git status for strays when reviewing a land — {HWL/Earlier rounds} — "Untracked files hide from pathspec commits: a seat's \"landed\" can silently omit a new file"
- P62 — Cut the feature branch at convene, not wrap; 27 commits went onto develop; make it a convene checklist reflex — {HWL/Earlier rounds} — "Cut the feature branch AT CONVENE, not at wrap"
- P63 — Emitted event payloads are seams; write thin-event conventions in seams.md the day they are designed or the consumer will guess wrong — {HWL/Earlier rounds} — "if a bus emit shape isn't written where a consumer can read it, the consumer WILL guess wrong"
- P64 — A spike closes when its load-bearing uncertainty is resolved, not when ideas stop arriving; the rest sorts into known-build or new experiment cards — {HWL/Earlier rounds} — "A spike closes when its load-bearing uncertainty is resolved, not when feature ideas stop arriving"
- P65 — Subagent-mode re-dispatches route by agent thread, not seat identity; the V1.x re-gate went to the builder's thread; verify the thread is the seat [repeat of P43] — {HWL/Earlier rounds} — "Subagent-mode re-dispatches route by AGENT THREAD, not seat identity"
- P66 — Ratify runtime-behaviour claims only with a measured repro; a 20-line scratchpad repro beats a red rig — {HWL/Earlier rounds} — "a 20-line scratchpad repro before ratification is cheaper than a red rig."
- P67 — The two-round gate shape: cold drive, falsifications, owner rework, cold re-drive by the same non-owner; independence is the property, not the probe list — {HWL/Earlier rounds} — "cold drive → falsifications → owner rework → COLD re-drive by the same non-owner."
- P68 — R4 passed on the first cold drive; the causal chain (seams ratified, amendments before consumer contact, draft amended live); the ratify round shrinks the safety net — {HWL/Earlier rounds} — "The two-round shape is the safety net, not the expectation; the ratify round is what shrinks it."
- P69 — On a shared tree a seat's verification build bakes peers' uncommitted src into artifacts; rebuilds are a land-time act or need a clean-tree check — {HWL/Earlier rounds} — "a seat's verification BUILD bakes peers' uncommitted src into committed artifacts"
- P70 — Same-day drive-to-gate is sustainable when drive findings are triaged into the plan skeleton while fresh — {HWL/Earlier rounds} — "the drive-3 findings doc's triage header WAS the round-4 scope, no re-derivation."
- P71 — When both owners independently falsify a skeleton claim onto the same precedent, promote that precedent to a named invariant the next plan cites — {HWL/Earlier rounds} — "promote it from \"a ruling\" to a named invariant the next plan cites up front, not re-derives."
- P72 — A round that changes a number the casting-draft states leaves a stale figure that teaches old behaviour; grep the doc for constants at plan time, list doc-deltas — {HWL/Earlier rounds} — "the code is more correct AND the doc actively teaches the old behavior."
- P73 — A doc-only gate failure is the lead's rework; fix it and cold-re-drive the single item, not the whole gate — {HWL/Earlier rounds} — "a doc-only gate failure (casting-draft prose) is the LEAD's rework, not a seat's"
- P74 — The ratify round corrects the lead's own skeleton; write skeleton claims as falsifiable hypotheses about mechanism so owners find what you got wrong — {HWL/Earlier rounds} — "Write skeleton claims as falsifiable _hypotheses about the mechanism_, and the owners will find the mechanism you got wrong"
- P75 — A batch/atomic verb over an existing single-op mutator hides deferred-unsafe work inside the transaction; extract the pure builder first as the P1 prerequisite — {HWL/Earlier rounds} — "Name \"extract the pure builder first\" as the P1 prerequisite whenever a batch verb is planned over an existing mutator."
- P76 — The two-round gate catches what the suite structurally cannot (a dropped `tags` field at 1139 green tests); thread wire fields into every CLI verb; keep the gate mandatory — {HWL/Earlier rounds} — "Keep the gate mandatory even when the suite is deep green."
- P77 — Twin subsystems are a refactor signal; two twins tolerate, a third factors the shared lifecycle; flag at the moment the third is proposed — {HWL/Earlier rounds} — "Two twins = tolerate; a third = factor the shared lifecycle into one helper"
- P78 — Asserted a state because an adjacent artifact existed, six times in one session (listed) [repeat of P44, sharpened with a count] — {HWL/spell-hardening S03} — "I asserted a STATE because an adjacent artifact existed. Six times in one session."
- P79 — The accelerant: the lead skips the check hardest when the reporter is reliable; a careless seat would have forced the check — {HWL/spell-hardening S03} — "I skip the check hardest when the reporter is RELIABLE."
- P80 — A rule phrased as a property of the tree is unenforceable; only one phrased as a property of the conversation holds; a batch call voids every outstanding clearance — {HWL/spell-hardening S03} — "A rule phrased as a property of the TREE is unenforceable; only one phrased as a property of the CONVERSATION is."
- P81 — A clearance is a sample too and goes stale silently; the send was refused by the very event that voided it; the guard, not discipline, stopped it — {HWL/spell-hardening S03} — "A CLEARANCE is a sample too, and it goes stale silently."
- P82 — `--as-of` is the only mechanism that never needed anyone to remember it; every other discipline failed at least once; design bar is "can it be skipped" [repeat of P58; restates P38's principle] — {HWL/spell-hardening S03} — "`--as-of` is the only mechanism this project has that never once needed anyone to remember it."
- P83 — Prefer a seat's mechanism over your own ruling and say so; three seat answers replaced the lead's, all published as corrections [repeat of P30] — {HWL/spell-hardening S03} — "All three were better and all three were published as corrections of me."
- P84 — Budget a ratify round for finding the predicate wrong, not confirming lanes; both rounds changed what was built [repeat of P74] — {HWL/spell-hardening S03} — "Both sprints that ran one had the round change _what was being built_, not _how_."
- P85 — A seat saying "this is too much" is a structure signal; make the re-scope offer anyway; one-builder-plus-one-verifier SPOF reproduced — {HWL/spell-hardening S03} — "A seat that says \"this is too much\" is giving you a structure signal, not an excuse."
- P86 — Say on the wire before entering a long human round-trip; a composing lead and an absent lead are indistinguishable; H-P2 falsified by the lead — {HWL/spell-hardening S03} — "A composing lead and an absent lead are indistinguishable from a seat's chair."
- P87 — The lead's rulings are his instruments and he ran almost none; six wrong calls listed, every one caught by a seat — {HWL/spell-hardening S02} — "My rulings ARE my instruments, and I ran almost none of them."
- P88 — A rule ratified at the altitude it was proposed fails on first use; the announce rule failed by ten seconds; ask what enforces it before landing — {HWL/spell-hardening S02} — "Ask what makes the rule un-skippable before you land it, not after."
- P89 — The strongest mechanisms could not be skipped, the weakest needed memory; put the check where forgetting is impossible [repeat of P38] — {HWL/spell-hardening S02} — "put the check where forgetting is impossible, and prefer it even when the invocable version is easier to build."
- P90 — Verify a land by reading the committed blob, never the tool's ack; a commit returned a clean sha with corrections not in the diff — {HWL/spell-hardening S02} — "`git show HEAD:<file>` is the check; `{\"ok\":true}` is not."
- P91 — A lead's routing is a claim wearing the authority of an assignment; queued an audit as the wrong seat's; state ownership by measurement — {HWL/spell-hardening S02} — "A LEAD's routing is a CLAIM, and it arrives wearing the authority of an assignment."
- P92 — When a count moves, move it everywhere in the same commit — earned again (118 to 119 in three places) [repeat of P50] — {HWL/spell-hardening S02} — "When a count moves, move it EVERYWHERE in the same commit — earned again"
- P93 — A ruling is an artifact-invalidator too; a human decision that mints a name moves the tree but arrives on the wire, not git log — {HWL/spell-hardening S02} — "A ruling is an artifact-invalidator too, and it does not look like one."
- P94 — Anti-pattern: taking a seat's work because you believe they stopped, without checking ps; nearly ran two daemons on one pointer [repeat of P14] — {Anti-patterns} — "Taking a seat's work because you believe they stopped, without checking `ps`."
- P95 — Anti-pattern: carrying the session in your head instead of a running scratch; wrote nothing for three hours — {Anti-patterns} — "I wrote nothing to `.anthill/scratch/prospero/` for the first three hours"
- P96 — Did it again in sprint 03 with this line already in the file; the lesson does not transfer by being recorded; open the scratch at convene before the first ruling [repeat of P95] — {Anti-patterns} — "The lesson did not transfer by being recorded, and it will not transfer to you either."
- P97 — Anti-pattern: predicting your own message id in a draft; it went stale three times; cite `--as-of` and write "this reply" — {Anti-patterns} — "a predicted id is a guess wearing a number."
- P98 — Anti-pattern: answering a seat's question by routing it to the obvious owner; it was cassandra's finding and the lead's remedy [repeat of P91] — {Anti-patterns} — "A lead's routing arrives wearing the authority of an assignment; one re-read of the source message answers it."
- P99 — Anti-pattern: leaving the seat doc unsynthesized; it sat at July 22 through a round whose retro listed the lead's failures; synthesize first at finalize — {Anti-patterns} — "Synthesize FIRST at finalize, not last."
- P100 — Anti-pattern: answering several asks without indexing by message id; the indexed table only holds what the ruler noticed; re-scan the raw wire — {Anti-patterns} — "Re-scan the raw wire for asks; do not trust the table's completeness."
- P101 — Anti-pattern: letting a "later" card sit adjacent to an active one with a similar title; retitle parked cards — {Anti-patterns} — "retitle or re-note parked cards so they can't be claimed by title-adjacency."
- P102 — Anti-pattern: merging or pushing on session momentum; the human's look is a gate the team cannot run [repeat of P9] — {Anti-patterns} — "the human's look is a gate the team cannot run itself."
- P103 — Anti-pattern: restating a seat's seam candidate in multiple docs; single-source in seams.md [repeat of P8] — {Anti-patterns} — "single-source in seams.md, point everywhere else."
- P104 — anthill feedback filed to the grapevine (#24-27): comms send lacks --body-file; stale --as-of refusal could offer refresh-and-send; comms read rejects --as [partial repeat of P34]; H28: anthill commit could carry gate evidence — {Candidates} — "comms send lacks --body-file (has --stdin; the asymmetry with every other house CLI bit cassandra)"
- P105 — Contract 15 adoption sweep, bounty first; H29 says one session per spell; feeds the spell-grooming ritual for thoth — {Candidates} — "Contract 15 adoption sweep (bounty first: no --version, no envelope)"
- P106 — acc closing note to maintainers sent; their declaration-skeleton generator is mind-mapper's schema-verb unlock — {Candidates} — "acc closing note to the maintainers is SENT (trial channel)"
- P107 — Sprint 04's coherent shape: an instrument must not report a green it did not earn; five same-family candidates listed with owners — {Candidates} — "an instrument must not be able to report a green it did not earn."
- P108 — The #79 house-wide fix is scoped and deferred; three spells conflate failed read and empty result; do not invent a sixth pattern — {Candidates} — "three spells report a FAILED read and a legitimate EMPTY result with the identical sentence at exit 0"
- P109 — The tmpdir leak is parked with numbers; magpie zero is the control proving it fixable; the anthill count is upstream — {Candidates} — "magpie ZERO as the control that proves it is fixable"
- P110 — Six anthill feedback drafts composed and unfiled, awaiting Cole; filing public issues elsewhere is outward-facing [partial repeat of P104] — {Candidates} — "filing public issues on another project is outward-facing and was not covered by \"keep the lanes moving.\""
- P111 — Card t-d9b2731b deliberately open: 2.0.0 shipping proves the release, not that the beats ran; closing on the version number is G8 — {Candidates} — "2.0.0 shipped, which is evidence the RELEASE happened and not that the beats ran."
- P112 — Astrolabe-branch merge coordination: root tsconfig gained DOM libs; Contract 5 cwd-pin refinement applies; reconcile at merge — {Candidates} — "root tsconfig gained DOM/DOM.Iterable libs and Contract 5's cwd-pin refinement applies"
- P113 — The unified-scaffold recipe now has real inputs; thoth should synthesize when next seated — {Candidates} — "The unified-scaffold recipe now has real inputs"
- P114 — V1 planning via anthill:plan; force-layout card parked as the experiment marker — {Candidates} — "force-layout card parked on the board as the experiment marker."
- P115 — Consider naming the flag-before-land discipline in the SOP; held five-for-five across spike and V1 — {Candidates} — "Consider naming the flag-before-land discipline in the SOP (circe's suggestion; it earned it"
- P116 — House-style candidates for thoth: unique daemon-entrypoint filenames per spell and the exact-PID-kill counter-pattern — {Candidates} — "unique daemon-entrypoint filenames (or argv markers) per spell + the exact-PID-kill counter-pattern (pgrep before pkill)"
- P117 — V1 dogfood rounds are Cole-gated and unstarted: a real brain-dump session and linked-Hollowbrook via Operator — {Candidates} — "V1 dogfood rounds are Cole-gated and unstarted"
- P118 — House-style candidate: casting/SKILL docs quote typed error keys verbatim and paraphrase only the remedy — {Candidates} — "casting/SKILL docs quote typed error KEYS verbatim and paraphrase only the remedy"
- P119 — OKF is on Cole's adoption radar for Operator; if it lands, the mapper's importer and an OKF adapter converge — {Candidates} — "OKF (Google's Open Knowledge Format) is on Cole's adoption radar for Operator"
- P120 — Lineage: the 2026-08-08 epitaph (say which half you measured) superseded 2026-08-31 for earning itself; it governs claims, but the damage left as a frame; remedy moved to Taste [partial repeat of P53] — {Epitaphs — the lineage} — "It is demoted because it governs what leaves you as a CLAIM, and this session's damage left as a FRAME."
- P121 — Lineage: the sprint-03 epitaph (wire records intent, world records state) superseded 2026-08-08 for direction; it covers what arrives, not what leaves [partial repeat of P44/P78] — {Epitaphs — the lineage} — "The predecessor tells you to check what arrives. It has nothing to say about what leaves"
- P122 — Lineage: the sprint-02 epitaph (run it or say you did not) superseded 2026-08-08 because it was right six more times and was sharpened with mechanism and accelerant [partial repeat of P87] — {Epitaphs — the lineage} — "Run it, or say plainly that you did not."
- P123 — Lineage: the sprint-01 epitaph (every instrument answered a narrower question) superseded 2026-08-06 for scope; the slot goes to the failure specific to leading [partial repeat of P46] — {Epitaphs — the lineage} — "Every instrument I trusted tonight answered truthfully and answered a narrower question than the one I needed"

Total: 123 items. Of these, 15 are marked as repeats (full) and 5 as partial repeats.

## Classes

Seven classes. Every item is assigned to exactly one; no item was left unclassified.

### C1. Charter — what the seat is, owns, refuses, and how its record is kept

**Test:** an item belongs here if it describes the seat, its relationships, or the rules of this document itself, and reports nothing learned from an incident (or, if it names an incident, the content is a restatement of a boundary).

**Members (13):** P1, P2, P3, P5, P6, P7, P8, P9, P10, P11, P12, P102 (repeat of P9), P103 (repeat of P8).

**Prevention / usability:** Nothing here needs preventing; it needs staying true. The header already says "keep in sync with the roster", which is a memory instruction of exactly the kind the author later says fails. The usable form: generate P1 from the config file at convene, and have the finalize step diff Scope/Boundaries/Relationships against what the session actually did (the lead implemented? merged? restated a seam?) and ask the agent to either amend the charter or record the breach as an anti-pattern. That check would fire at finalize, run by whatever tool drives finalize, and would have produced P102/P103 as charter amendments rather than as free-floating anti-patterns.

**Specificity:** any agent team with named seats. The particular boundaries (no implementing, no merging, single-source seams) are this team's, but the kind is universal.

**Recurrence:** two boundaries (P8, P9) are recorded twice (once as boundary, once as anti-pattern); the other nine appear once.

### C2. Epistemics of ruling — how false beliefs enter the record, and what evidence should count

**Test:** an item belongs here if its subject is whether a claim should be believed, who actually measured it, or what weight a signal carries — including the lead's own claims made at ruling strength without measurement.

**Members (25):** P4, P13, P23, P27, P28, P29, P30, P44, P45, P46, P47, P53, P54, P66, P71, P78 (repeat of P44), P79, P83 (repeat of P30), P87, P90, P91, P93, P97, P98 (repeat of P91), P100.

**Prevention / usability:** The author's own finding is that recording these did not prevent them ("every one of the six felt obvious"; "the lesson did not transfer by being recorded"). What held, in his account, were structural devices that interposed a read between forming a position and publishing it. The concrete intervention this class asks for is a required epistemic field on every outbound ruling, card, and brief: `measured-at: <sha|tree>` plus one of `VERIFIED HERE / TAKEN ON REPORT / RELAYED FROM <seat>`, with the send/land tooling refusing an unmarked ruling the way `--as-of` refuses a stale one. It fires at send time and at card creation, and is run by the comms/board tool, not the agent. For the frame-contamination half (P4, P46), the analogous device is a brief template with a mandatory blank, "what the verifier is NOT being told", which forces the author to notice he has a defence to withhold. For canon edits (P23), a non-author review cell that runs on any edit to canon files before land.

**Specificity:** the damage is lead-specific (a lead's relay arrives with ruling force and is inherited as settled), but the mechanism — trusting a reliable reporter, re-running the reporter's instrument, taking an audit at face value — is something any agent team will hit. Nothing here depends on this project's code.

**Recurrence:** three lessons are recorded twice inside the class (P44/P78, P30/P83, P91/P98), and four more (P44, P46, P53, P87) are re-recorded as epitaphs in C7. That is 9 of 25 items involved in a repeat; 16 appear once. This is the class the author himself says keeps recurring.

### C3. Instrument design — how to build a check so it cannot be skipped or cannot lie

**Test:** an item belongs here if its point is the design of a gate, rule, tool, or measurement (where it lives, what it prints, what it structurally cannot see, whether memory is required to run it) rather than any particular claim that passed through it.

**Members (17):** P15, P16, P34, P35, P36, P38, P42, P48, P51, P58, P61, P76, P80, P81, P82 (repeat of P58), P88, P89 (repeat of P38).

**Prevention / usability:** These items are already interventions; what they lack is a place to run. Two devices would make them usable: (1) a rule-ratification checklist that fires whenever a new discipline is proposed on the wire or in the SOP, asking in order "what event triggers it, what output carries the tell, can an actor skip it without a trace" (P88's question, made un-skippable itself), run by the lead and the owning seat before the rule lands; (2) a registry of known instrument blind spots — line-anchored grep, `$?` after a pipe, pathspec commits hiding untracked files, `--as` rejected on read, stderr suppression on writes, gates that check payload but not exit — that a verifier is handed with every measurement card. Both fire at the moment a check is designed or a measurement is briefed, not at retrospective.

**Specificity:** split. The design principle (put the check where forgetting is impossible; a red over a dirty tree means nothing; a repeal criterion must not carry a unit assumption) applies to any agent team. Half the members are quirks of this project's tooling (`uncheckedAgainst`, `--as-of`, `comms read --as`, the board daemon) and are project-specific.

**Recurrence:** two lessons recorded twice (P38/P89, P58/P82); P34 is also echoed in P104. 5 of 17 items are involved in a repeat; 12 appear once.

### C4. Orchestration playbook — when and how the lead performs a lead action

**Test:** an item belongs here if it tells the next lead a procedure or timing for a lead action (routing, ratifying, sequencing, closing, branching, dispatching, communicating on the wire, keeping the running record) and is not primarily about believing a claim or designing a check.

**Members (38):** P14, P17, P18, P19, P20, P21, P25, P26, P31, P32, P33, P39, P40, P41, P43, P49, P52, P55, P57 (repeat of P26), P59, P60, P62, P64, P65 (repeat of P43), P67, P68, P69, P70, P73, P74, P84 (repeat of P74), P85, P86, P94 (repeat of P14), P95, P96 (repeat of P95), P99, P101.

**Prevention / usability:** The author gives the diagnosis in P96: this class does not transfer by being read. The right intervention is to move these out of prose and into the phase fixtures the lead already runs. A convene checklist (cut the branch, open the scratch, write the thread-to-seat map, ask for the lead audit, name recorder only when dispatched, say the sequencing plan in the brief) and a finalize checklist (drain the review column and say the count, synthesize the seat doc first, re-derive blast radius for the next phase) — each line requiring an explicit acknowledgment or artifact before the next step is unlocked, run by the convene/finalize tooling. Items about wire etiquette (say so before a long human round-trip, re-read the channel on crossed messages, never predict a message id) belong in the comms tool's send-time prompts, not here.

**Specificity:** lead-specific by definition; roughly a third are project-specific (subagent mode, anthill verbs, the board's columns), the rest would apply to any lead of any agent team.

**Recurrence:** five lessons recorded twice (P26/P57, P43/P65, P74/P84, P14/P94, P95/P96); 10 of 38 items involved, 28 appear once. Notably the repeated ones are the mechanical habits (scratch, review drain, thread routing), which supports the fixture intervention.

### C5. Code and document hygiene — patterns in the artifacts themselves

**Test:** an item belongs here if its remedy is a change to how the codebase or its documents are structured or swept, and it would hold regardless of who is leading.

**Members (7):** P24, P50, P63, P72, P75, P77, P92 (repeat of P50).

**Prevention / usability:** These are the most mechanizable items in the file. A plan-time grep of the casting-draft and canon docs for every constant a round touches (P72, P50), emitted as a doc-delta list in the plan; a supersession sweep that greps forward-looking phrases ("NOT DONE YET", "unbuilt", "will") on any land that ships the subject (P24); a seams.md entry required at the moment an emit shape is designed (P63); and two review-time prompts — "does this batch verb wrap a mutator with side effects" (P75) and "is this the third twin" (P77). All fire at plan time or land time and can be run by a script or a reviewer cell rather than the lead.

**Specificity:** the shapes (stale counts across docs, duplicated subsystems, event payloads as undocumented contracts) are universal to software teams; the instances (casting-draft, node_actions/node_tags, proposal builders) are this project's.

**Recurrence:** one lesson recorded twice (P50/P92) and the file says the count-drift bite has happened three times; 5 appear once.

### C6. Open work and handoffs — state of the world for the successor

**Test:** an item belongs here if it would be deleted from the file once someone acts on it: parked, deferred, filed, unfiled, awaiting a ruling, or a pointer to work another seat should pick up.

**Members (16):** P104, P105, P106, P107, P108, P109, P110 (partial repeat of P104), P111, P112, P113, P114, P115, P116, P117, P118, P119.

**Prevention / usability:** These do not need preventing; they need an owner, a trigger, and a done-condition each, which most lack (P112 "reconcile when that branch merges" has no watcher; P117 is "Cole-gated and unstarted" with no ask on record). The usable form is a board card or backlog file per item with the pointer left here, and a finalize-time sweep that asks of each Candidate "still true? still mine? has a card?" and removes what has been actioned — the doc's own rule (P2, "when something's no longer true, fix it") applied to this section by a tool rather than by memory. Several are dated and read as possibly stale already.

**Specificity:** entirely project-specific in content; the kind (a handoff list that decays) is universal.

**Recurrence:** one partial repeat (the unfiled drafts appear in both P104 and P110); 14 appear once.

### C7. Verdicts on the doc's own devices — the epitaph slot and the promotion rule

**Test:** an item belongs here if its subject is this document's own machinery — whether an epitaph earned its slot, why it was superseded, or whether a rule should be promoted — rather than the team's work.

**Members (7):** P22, P37, P56, P120, P121, P122, P123.

**Prevention / usability:** This is the file's reflection mechanism working as designed, and it is the most readable part of the file for an outsider because each entry explains its own supersession. Two things would improve usability: cap the lineage at the last two epitaphs and archive older ones (the four-deep chain is where the file's density is worst), and record each verdict with the evidence count the author already uses ("two rounds, four falsifications"), so a future verdict can be compared to a prior one rather than re-argued. A finalize prompt ("verdict on the epitaph: kept / superseded / promoted, with count") would keep this consistent; it fires at finalize, run by the finalize tool.

**Specificity:** the device (a single lead sentence that is periodically retired for a sharper successor) is a house convention, not a property of the work; any team could adopt it. The verdict rule "no promotion without a realised loss" is the team's.

**Recurrence:** no item is duplicated within the class, but four lineage entries re-record epitaphs whose content lives in C2 (P53, P44/P78, P87, P46). All 7 appear once as items.

### On merging and splitting

- I was tempted to split C2 into "the lead's own false claims" and "how to weigh others' evidence" (P27, P54, P66, P71 vs the rest). I did not, because the author's own framing is that these are one failure seen from two sides — a relay of someone else's measurement leaves the lead's mouth with ruling force — and P120/P121 argue exactly that the two halves are the same seam.
- I was tempted to merge C3 into C4 (a playbook rule and a mechanism-design rule both tell the lead what to do). I kept them apart because the author draws the line explicitly and repeatedly: the "needing memory" rules (C4) failed, the "cannot be skipped" ones (C3) held, and the intervention for each class is different.
- I was tempted to merge C7 into C1 (both are about the document). I kept C7 separate because C1 is static definition and C7 is dated retrospective judgment with evidence; they would get different treatment at finalize.
- C5 is small (7) and could be dissolved into C4; I kept it because its members are the only ones whose remedy is a script over the repo rather than a behaviour of the lead.

## Notes

- **Readability for someone with no context.** The prose is precise and the mechanisms are almost always explained in the same sentence as the incident, which helps. What hurts is density of unexplained references: seat names (circe, daedalus, thoth, cassandra, magpie), numbered hypotheses (H8, H26, H28, H29, H31, H37, H-P1, H-P2), numbered contracts and wards (Contract 3/5/9/15/17, ward 1b/3), gate rounds (R3–R7), card ids, sha fragments, house verbs (land, drive, gate, cell, ratify, casting-draft, vine, wire, envelope, `--as-of`, `uncheckedAgainst`), and a rule id like "G5/G8" that is used as a verdict without definition. None of these are defined in the file. An outsider can classify the items but could not act on many of them without the rest of the repo.
- **Ordering is not chronological.** The Hard-won lessons section runs spell-kit S02 (Aug 31), spell-kit S01 (Aug 31), acc L0 (Aug 27), spell-hardening BUILD (Aug 6), spell-hardening S04 (Aug 8), "Earlier rounds" (undated, July), spell-hardening S03 (Aug 7–8), spell-hardening S02 (Aug 6). The newest is on top for the first three, then it scrambles. This matters for repeats: several lessons are written "sprint 04 found this and I reproduced it" while the sprint-04 entry sits further down the file. I numbered in file order as instructed, so some "repeat of" pointers point at a chronologically later recording.
- **The author tracks his own recurrence.** Several items say outright "did it AGAIN", "earned again", "this project has been bitten three times", "the class survives being written down". The file is unusually honest about the record not transferring, and P96 is close to an explicit request for a mechanism rather than more prose.
- **Balance.** Roughly four-fifths of the lesson items are failures of the author; wins are few (P19, P20, P21, P37, P68, P70, P22) and are mostly written as "the discipline held". There are no items attributing a failure to another seat without the lead also owning a share.
- **Epitaph device.** The epitaph slot plus its lineage is the file's most distinctive structure: one sentence at the top, retired when a sharper successor earns the slot, with the retired remedy demoted into the body. It doubles as a compact history of what the seat has learned. It is also where the reading cost is highest, because each lineage entry argues its own supersession in bold and takes a paragraph.
- **Formatting.** Heavy use of bold, caps, and marker emoji (star, stop-sign, warning) to rank items; two anti-pattern bullets use an indented continuation line that the file's own preamble warns will be reflowed. Section "Earlier rounds" has blank-line breaks inside its bullet list, splitting it into three lists.
- **Fixed-structure fields.** The preamble says every seat doc has a locked set of fields; those present are Epitaph, Who I am, Scope, Boundaries, Relationships, Taste & reflexes, Hard-won lessons, Anti-patterns, Candidates, Epitaphs — the lineage. The classification above cuts across those fields: Anti-patterns is mostly C4 with some C2 and C1; Hard-won lessons spans C2–C5 and C7.

# Blind classification — weaver migration report

Source: `.anthill/reports/2026-09-03-migration/weaver.md` (1,062 lines). Read in full; nothing else consulted.

Section abbreviations used in the inventory:

| Abbr    | Heading in the file                                                         |
| ------- | --------------------------------------------------------------------------- |
| EP13    | `## Epitaph` — the current (session 13) block                               |
| EP12    | `## Epitaph` — the session-12 block kept inline under it                    |
| EP10    | `## Epitaph` — the session-10 block kept inline under it                    |
| EP-note | the unheaded italic instruction directly after the epitaph blocks           |
| HWL     | `## Hard-won lessons` (undated)                                             |
| AP      | `## Anti-patterns`                                                          |
| UF      | Hard-won lessons (upstream-feedback session, 2026-07-05)                    |
| BSB     | Hard-won lessons (board-session-binding docs, 2026-07-10)                   |
| TC1     | Hard-won lessons (team-comms slice one, 2026-07-31)                         |
| S4      | Hard-won lessons (parser-envelope failure surface, session 4)               |
| S4c     | Hard-won lessons (cold review + the retro beat, session 4 cont.)            |
| S5      | Hard-won lessons (slice two — what `emittedThrough` may claim, session 5)   |
| S6      | Hard-won lessons (worktree isolation + the scaffold's comms gap, session 6) |
| S7      | Hard-won lessons (the cascade session, session 7)                           |
| S8      | Hard-won lessons (the sole-wire gate, session 8)                            |
| S8b     | Hard-won lessons (session 8, second pass)                                   |
| S8c     | Hard-won lessons (session 8, final pass)                                    |
| S9      | Hard-won lessons (comms-as-default, session 9)                              |
| S10     | Hard-won lessons (the domain session, session 10)                           |
| S11     | Hard-won lessons (the one-wire migration, session 11)                       |
| S12     | Hard-won lessons (the trustworthy-wire session, session 12)                 |
| S12b    | Hard-won lessons (session 12, second pass)                                  |
| S13     | Hard-won lessons (the anchor + the probe-hazard session, session 13)        |
| CAND    | `## Candidates`                                                             |
| LIN     | `## Epitaphs — the lineage`                                                 |

Class letters (defined in the Classes section): A checks · B overclaims · C prose-rot · D authoring rules · E mechanism design · F peer input · G blast radius · H open items · I seat-doc meta · J confirmations.

## Inventory

Format: id · class · paraphrase · section · anchor quote (verbatim, <25 words) · repeat marker where applicable.

- W1 · B · The findings that reach a draft are selected for flattering you; ask at publish time whether you would have written it up if false · EP13 · "if this finding were false, would I still have written it up?"
- W2 · A · Drafted a correction of the lead's ruling from a peer's uncommitted working-tree edit; HEAD said the ruling was right · EP13 · "off a peer's uncommitted working-tree edit; `git show HEAD:` says two sites and his ruling was right"
- W3 · A · Drafted "scope-out missing from shipped skill" off a case-sensitive probe; the clause was intact · EP13 · "the skill says `used` where the SOP says `USED`, and the clause was intact all along"
- W4 · A · Peer correction: the real selection is which errors announce themselves; all three probe hazards fail toward a silent false zero · EP13 · "The real population is not drafts I rejected, it is which of my errors ever announce themselves"
- W5 · I · Why this seat: nothing audits a finding that was never sent; lands get gated, drafts get nothing · EP13 · "nobody else audits a finding that was never sent"
- W6 · I · Ordered triad of pre-publish questions (session 13 order): written-up-if-false → reason-false-conclusion-holds → population · EP13 · "would I still have written this up if it were false → if my stated reason were false, would the conclusion still hold"
- W7 · B · Predecessor epitaph re-fired: conclusion right, stated reason wrong, inside the message cataloguing that shape · EP12 · "your CONCLUSION will be right and your stated REASON will be wrong"
- W8 · B · Scar n=3: null-fails-safe support one layer off; ugrep mechanism was `$` not `{}`; commit message justified from an uncommitted worktree · EP12 · "n=3 in one session, all three with the verdict intact and the support rotten"
- W9 · I · Why this seat: prose IS support; the reasoning is the artifact the next instance inherits · EP12 · "Here the reasoning is the artifact — the next instance inherits my argument, not my answer"
- W10 · B · Tell: a stated reason you can delete without weakening the claim was never load-bearing · EP12 · "a stated reason you can delete without weakening the claim was never load-bearing"
- W11 · B · Bounded search by what I own (skills, templates); the stand-down instruction lived in scripts and was printed at my own join · EP10 · "the two directories I own. The instruction lives in `plugin/scripts/`"
- W12 · B · Shipped a template line true of a spawned seat and false of the lead reading it — domain omission · EP10 · "true of a SPAWNED seat and false of the lead who reads it"
- W13 · I · Predecessor's "go and read what you already hold" is not superseded in content; it paid twice · EP10 · "It tells you the answer was nearby; this tells you why you did not look there."
- W14 · I · Ordered triad (session 10 order): population → what you already hold → could the check come out the other way · EP10 · "first ask what population this claim ranges over, then ask what you already hold about it"
- W15 · B · Five seats shipped a domain omission in one session despite the rule being in principles.md · EP10 · "Knowing it is not the hard part; asking it before you publish is."
- W16 · I · Instruction: do not delete the predecessor's epitaph; move it to the lineage, dated · EP-note · "If you are writing your own epitaph, do not delete this one."
- W17 · D · Archetype JSONs are consumed by bootstrap prose, not rendered by `init`; the reason matters for future owners · HWL · "Archetype JSONs are read by the bootstrap _prose_, not rendered by `anthill init`."
- W18 · F · The consumer must name the field it needs; two-sided convergence at ratify is the seam signal · HWL · "The consumer must name the field it needs, or the producer will guess wrong."
- W19 · D · Fold/split must be a primary-framework (`stack[0]`) test, not a marker-set overlap · HWL · "Fold/split is a primary-framework test, not a set test."
- W20 · D · Anti-pattern: encoding a conversation as a rigid procedure without a worded exemplar · AP · "Structure without voice becomes a checklist the agent recites."
- W21 · D · Anti-pattern: restating a contract in skill prose; point at it instead · AP · "copying the interface into the skill would drift"
- W22 · D · Anti-pattern: hard-wrapping prose in docs; prettier reparses `-`/`+` continuations as bullets · AP · "A wrapped line beginning `-`/`+` gets reparsed by prettier as a list bullet"
- W23 · D · A framing spanning command and skills wants disjoint single-source homes · UF · "Two homes, zero overlap → no drift."
- W24 · D · The one justified echo is a safety nudge placed at the point of danger · UF · "The one justified echo is a safety nudge at the danger point."
- W25 · D · Conditional phrasing lets a skill no-op gracefully in solo vs team contexts · UF · "Prefer a conditional clause over a branch when a line must serve both team and solo contexts."
- W26 · D · When two things share a file, name the boundary; renumbering a step means chasing every cross-reference · UF · "a stale reference is a silent trail-lie"
- W27 · D · Lifecycle skills are distributed and cannot point at repo-local contracts; two-tier treatment · BSB · "the skill can't even point: it must carry enough usage prose to stand alone"
- W28 · C · "Add a note about X" often hides "the surrounding prose is now false" · BSB · "Read the whole unit, not just the insertion point."
- W29 · D · A pointer and the contract it points at must land in the same commit · BSB · "A dangling pointer is a trail-lie even when it will resolve 'soon.'"
- W30 · F · The pointing-doc owner is the natural auditor of a seam's "Pointed at from" line · BSB · "cross-check the owner's pointed-at-from against what your docs really say"
- W31 · D · Reflective: trusted prettier's default proseWrap; one-sentence-per-line is the only universally safe form · BSB · "one-sentence-per-line is the only universally reflow-safe form"
- W32 · D · Exemplify the dialogue, never the invocation; say "run the command the CLI printed" · TC1 · "an example invocation is not register, it is a second copy of a value"
- W33 · D · The distributed copy is not a cost — it is the deliverable; write it as the only text that exists · TC1 · "Write that copy as if it is the only text that exists, because for consumers it is."
- W34 · B · Naming no values protects from value changes, not from assuming the wrong number of cases · TC1 · "Payload-agnostic prose still asserts a case count, and a case count is a claim about the payload."
- W35 · E · A hardening pass on an unreachable state is the spike framing working; ask unreachable vs unbuilt, ask the owner · TC1 · "ask whether it is unreachable rather than unbuilt — and ask the owner, don't infer"
- W36 · C · A clause strengthened after its proof list was written is the defect; enumeration only camouflages it · TC1 · "did this clause change after I wrote its proof?"
- W37 · F · Knowing a principle does not stop you applying its opposite; only a reader catches it; the championed principle is the least self-audited · TC1 · "the principle you are currently championing is the one you are least likely to audit yourself against"
- W38 · D · When a reviewer names the case, make it explicit rather than word around it · TC1 · "Rephrasing removes the wrong answer; naming the case gives the reader the right one."
- W39 · D · Pin lessons to the claim, not to a sentence still being edited (drift-check note inside W38) · TC1 · "Pin lessons to the claim, not to a sentence that is still being edited."
- W40 · F · A degraded instrument, honestly labelled, beats no instrument · TC1 · "Ship the degraded read with its caveat; don't withhold it waiting for the clean one."
- W41 · F · A read-set discharges repo-sourced contamination only; it cannot see priors an agent arrives with · TC1 · "it cannot see the priors an agent walks in with"
- W42 · D · A rule that holds for most cases needs its exception stated at the point of use · TC1 · "saying nothing is not neutral — the existing rule already speaks for the new case, wrongly"
- W43 · D · Emitted output outranks prose, so audit the emitter's strings for neighbouring wires · TC1 · "go read the string the CLI actually emits for the neighbouring wires"
- W44 · F · A seat fluent in the old tool is a free misuse probe for the new one; the window expires · TC1 · "the probe stops working the moment you learn the new signature"
- W45 · C · A checklist can mandate a flag the swapped-in tool lacks; audit safety verbs (instance-closed note repeats W39) · TC1 · "the safety verbs are what break first and silently"
- W46 · D · When the emitter starts teaching, prose should shrink, keeping only the model · TC1 · "has the tool started saying this better than I do? If yes, cut"
- W47 · D · Over-generalising is the symmetric failure; when a cross-tool claim keeps being falsified stop making it; say which level · TC1 · "when successive attempts at a cross-tool claim keep getting falsified, stop refining and stop making the claim"
- W48 · F · Report the non-instance; volunteering counter-evidence is what gets a pattern tested · TC1 · "n=3 with a checked negative beats n=4 assembled by squinting"
- W49 · D · Knowing when the fix is not in my medium is part of owning the medium · TC1 · "if documentation-about-it is what failed, more documentation is not the fix"
- W50 · F · Convergence as ratify signal, second instance; bounded: counts only when the certifier names shared inputs (extends W18) · TC1 · "convergence counts only when the certifier names what both parties read first"
- W51 · F · Reflective: a peer's stated baseline predated my write; timestamps make claims checkable · TC1 · "Timestamp a claim and you make it checkable; assert it bare and it just decays."
- W52 · F · Signature failure is structural; self-review finds omissions and misses overstatements; budget for both instruments · S4 · "self-review finds OMISSIONS (a thing I didn't do) and misses OVERSTATEMENTS"
- W53 · A · Probing beats reasoning; the inherited framing selects the confirming probe · S4 · "the bug was named by the person who found it, using the probe that found it"
- W54 · D · When prose is fixed because a tool is changing, assert nothing about the changing side · S4 · "A doc that must land in a specific order relative to a code change will eventually land in the wrong one."
- W55 · C · A count is proof that rots with no authoring error; use named assertions · S4 · "Someone adds a test and three contracts silently become liars."
- W56 · E · A contract whose proof is a named human moment makes that moment part of the job · S4 · "The first idle window is when a named-moment proof gets discharged or silently doesn't."
- W57 · A · An audit that cannot distinguish violation from justified exception causes the defect it prevents · S4 · "a check over prose cannot tell a rule from a discussion of the rule"
- W58 · A · Zero coverage is not a pass; biome ignores markdown · S4 · "my paths are not covered by the gate, never 'my paths pass.'"
- W59 · G · A probe that writes is different in kind from one that reads · S4 · "I did not re-think when the verb changed."
- W60 · E · The cheapest moment to make a change is not automatically the right commit · S4 · "One extra land beats a decision with no commit that is about it."
- W61 · E · The `Anthill-Seat:` trailer records the lander, not the author · S4 · "`--as` answers who ran the commit truthfully; the SOP simply promised it answered a second question"
- W62 · C · Every pass over a long prose contract introduced a new defect; no structural check · S4 · "a prose contract has no structural check at all, so every touch is unverified"
- W63 · A · `cmd | filter && verdict` reports the filter's exit code; n=5; vigilance does not fire · S4 · "every habit I have for keeping output readable ends in a pipe"
- W64 · A · `exit 0` means the operation succeeded, never that the outcome obtained · S4 · "verify the OUTCOME, not the OPERATION"
- W65 · C · A warning about a silent failure gets no corrective feedback; never-right prose parked without observers · S4 · "prose that was never right, parked where there are no observers"
- W66 · G · Recovery drill: restore into a throwaway archive and diff artifacts; a preservation patch ages silently · S4 · "Re-cut after every edit; nothing tells you your insurance expired."
- W67 · G · Insurance without authority: a verified patch kept outside the repo · S4 · "preserve uncommitted work as a verified patch OUTSIDE the repo"
- W68 · D · When a comment contradicts code the comment is not automatically wrong; refuse to make the artifact true · S4c · "Owning a medium includes refusing to make your artifact true."
- W69 · C · A comment goes stale in the way that looks safe to delete; concern and explanation rot independently · S4c · "is the CONCERN obsolete, or only the EXPLANATION?"
- W70 · E · Ask whether a case can be made impossible before asking how to test it · S4c · "a rule that cannot be violated does not"
- W71 · C · Cascade blind spot: a ruling on the wire mutates docs but touches no file; team behaviour is the evidence · S4c · "when the team does something the docs forbid and nobody objects, the doc is stale"
- W72 · G · "Run it and see" is unsafe on a mutating command; landed a commit messaged `probe` · S4c · "The verdict is at the head; the explanation is at the tail; I keep reading the tail."
- W73 · A · Shipped an untestable ritual with a falsifiable prediction attached · S4c · "Predicting your own artifact's failure mode before it runs is the only verification available when the medium has no gate"
- W74 · E · A new store needs its re-read moment built in the same change · S4c · "The store and its reader are one change, not two"
- W75 · F · Third self-review failure: missing the implication of an artifact just read (extends W52) · S5 · "I looked straight at the evidence and took the narrowest possible reading of it."
- W76 · F · Every correction came from a peer's measurement, none from re-reading; ask "go measure", not "cold-read" · S5 · "my prose is falsifiable, and I keep asking for it to be reviewed instead"
- W77 · C · A skill's "known gaps" section rots into a bug report · S5 · "commissions work against a wall that is gone"
- W78 · D · A remedy sentence must name which failure mode it treats · S5 · "The scoping, not the rewording, is the fix"
- W79 · B · A fused citation manufactures a count at synthesis; one note per claim · S5 · "cheap capture must still be one note per claim"
- W80 · B · Predicting the mirror of a defect is not predicting the defect; log the near-miss · S5 · "Log the near-miss, not the win."
- W81 · B · A hedge is a claim; "milliseconds" was invented and off by four orders · S5 · "Say 'narrows', not 'fixes', and when a hedge carries a magnitude, either measure it or say you have not."
- W82 · G · Reflective: a green gate seconds ago does not hold at commit; never let the asserting party assert · S5 · "the one assertion you must never let the asserting party make"
- W83 · C · Hard-wrap rule did not cover inserting structure above implicitly-parented prose; convene step demoted; no instrument · S6 · "I caught it by chance; that is not a method and I will not write it up as one."
- W84 · A · Under a documented fallback, failing cells carry the information · S6 · "read your reds and discard your greens"
- W85 · C · Severity axis stale · false · INVERTED; scope, don't hedge; describe the failure as it presents · S6 · "an inverted one routes the most compliant reader away from the fix"
- W86 · G · When the blast radius is a peer's uncommitted work, read-only with a control is the only admissible probe · S6 · "read-only with a control is the only admissible instrument"
- W87 · A · A measurement of an idle system measures idleness; a prediction is not a finding · S6 · "A prediction that treats both outcomes as informative is not testing anything."
- W88 · E · Ownership of emitted onboarding vs emitter unreconciled; candidate 4(d) clause; a pinned string makes the test prose · S6 · "a pinned string makes the test part of the prose"
- W89 · D · Assert the distinction, never the mention · S6 · "pin the thing that makes it true, not a token that appears in it"
- W90 · C · The scaffold argues against whatever it omits; `comms` appeared zero times in templates · S6 · "after adding a capability, grep the SCAFFOLD for it, not just the skills"
- W91 · F · Reflective: "not run" must stay legible as not run or it converts to "checked" · S6 · "'nobody was available to check me' quietly becomes 'it was checked.'"
- W92 · F · The blank-context audit found six old defects; self-review found none · S6 · "Every one is old. None was found by me, by a peer, or by any gate."
- W93 · A · A grep cannot find an absence; sweep for the inverse · S6 · "after sweeping for the thing, sweep for its absence"
- W94 · F · Two auditors with different lenses found disjoint sets; the behavioural read is worth more · S6 · "Redundancy would have found neither half."
- W95 · C · A contradiction can live entirely between two locally-correct files · S6 · "Only a reader who runs BOTH documents as one procedure can see it"
- W96 · I · Epitaph deliberately not superseded (session 6); measurement was the mechanism of every correction · S6 · "A predecessor's epitaph that keeps earning itself should not be replaced by a fresher one that says less."
- W97 · C · An enumeration predates its newest member; after adding to a set, find every place that lists it · S7 · "after adding anything to a named set, go find every place that LISTS that set"
- W98 · A · Grep for the obvious word returned a false green; the token names both concept and field · S7 · "the worse case is not that grep finds nothing — it is that grep finds the token, and the token has two meanings"
- W99 · C · An absence is inert; a stale instruction is active; check whether the space is occupied · S7 · "check whether the space is empty or occupied by the previous answer"
- W100 · A · Verified content, not composition; test what the artifact is for (extends W64) · S7 · "Ask what the artifact is FOR, and test that"
- W101 · C · A clause went false because the tool got better; re-read clauses when a fix lands · S7 · "when a fix lands in code I point at, re-read my clause for what it now over-claims"
- W102 · A · Predicted an invisible defect from prose, refused to fake the assertion, a stranger confirmed it by running · S7 · "Prose analysis is not the weak instrument — it is the weak VERIFIER."
- W103 · D · Refusing to make the artifact true, second instance; a narrow qualifier is a defect wearing a hedge · S7 · "a qualifier that narrow is usually a defect wearing a hedge"
- W104 · G · When the blast radius is the team's own state, move the tree, not the probe · S7 · "Ask 'where can this run where nobody else pays?' before 'should I run this?'"
- W105 · B · Reflective: posted a gate number that measures somebody else's work · S7 · "A number I cannot earn is worse than no number, because it looks like a baseline."
- W106 · E · Reflective: the manifest outranked the session's ruling; treat arming as reversible; mechanism half carded · S7 · "treat arming as reversible rather than as a commitment"
- W107 · A · The name a defect arrives with selects the probe; "paginates" was a 64KiB pipe truncation · S8 · "before searching for the named mechanism, spend one command measuring the artifact"
- W108 · E · A completeness field must not sit at the end of the thing whose completeness is in question · S8 · "an instrument that certifies the failure as success"
- W109 · F · An alarm can be right and its mechanism wrong; verify the mechanism of an alarm you agree with · S8 · "Verify the mechanism of an alarm you agree with, or you will ship its remedy."
- W110 · A · An instrument for the structure hazard exists (prettier stdout diff); "no instrument" was wrong; later domain-amended · S8 · "I concluded 'no instrument' from the absence of the instrument I was looking for"
- W111 · F · The answer was on my screen in the wrong column; fourth audit kind: same output, different question (extends W52) · S8 · "It is the cheapest audit that exists and I have never once asked for it."
- W112 · B · Put testimony about an unrun experiment into a tally; a fake verdict stops a hypothesis being asked · S8 · "a hypothesis carrying a fake verdict stops being asked"
- W113 · E · Prose commissioned a check the emitter answers with silence; declined to patch; total fields cannot be silently absent · S8 · "a field that is always present cannot be silently absent"
- W114 · C · A decision recorded in one skill leaves other surfaces looking undecided; absent vs seeded-empty · S8 · "'deliberately absent' and 'nobody got to it' are indistinguishable from outside"
- W115 · A · Reflective: truncated my own land envelope with `tail -c 900` (repeat of W63) · S8 · "I wrote the rule and did not apply it to my own tooling."
- W116 · G · Reflective: an Edit left scaffolding in a live-symlinked skill file · S8 · "I still edited as though I were staging."
- W117 · A · Ask whether your check discriminates; the cursor check was anti-correlated · S8b · "A check that cannot fail in the failing case and can fail in the passing case is not weak; it is ANTI-CORRELATED"
- W118 · F · A reviewer checking the author's criterion runs the author's test twice · S8b · "Independence requires a criterion the author did not supply"
- W119 · A · A deny-list's completeness is unverifiable; an allow-list's is; test the remedy, not the (N+1)th confirmation · S8b · "when a guarantee is about ABSENCE, build the surface from what you put IN, never from what you take OUT"
- W120 · E · Stigmergy and cold review oppose each other and nothing signals the trade · S8b · "The better a team is at the first, the warmer every subsequent cold reader is."
- W121 · C · A false reassurance is the worst class of wrong prose · S8b · "gitignore governs tracking, not readability"
- W122 · B · Invented a magnitude ("for months") inside the commit correcting an unmeasured claim · S8b · "When you catch an invented number, ask what it was ARGUING before you just fix it."
- W123 · F · Verify the account that exonerates you; the record of care is partly a record of latency · S8b · "a rule applied only to accusations is a rule applied only when it costs nothing"
- W124 · B · When a peer out-evidences you, hand it over; compression to land is a defect · S8b · "I tightened a claim to make it land"
- W125 · A · Reflective: the retry monitor watched `tsc`, not the whole gate · S8b · "If the thing you are waiting on is a command, wait on that command."
- W126 · C · Sweep, then classify; a Class B sentence is unconditional where it should defer · S8c · "Spotting finds instances; sweeping finds the category."
- W127 · C · Two kinds of false prose: pre-written false vs became false; state the check you ran · S8c · "Guard: state the check you RAN, never its predicted outcome."
- W128 · F · A finding declined to fix and declined to report is destroyed · S8c · "it states the restraint and not the obligation"
- W129 · A · Confirmed a fix on the one observation that cannot discriminate (repeat of W117) · S8c · "The question is never 'did I check' — it is 'could my check have come out the other way?'"
- W130 · B · The answer was already in something I own, three times; built a worse remedy · S9 · "has this already been answered somewhere I hold?"
- W131 · A · My published falsifier fired on my own worked example (the `vine` alias) · S9 · "my one worked example of the un-greppable category is greppable"
- W132 · A · The false zero has four habitats (ugrep, schema, zsh, ignored path); need a second instrument and a positive control · S9 · "a zero needs a SECOND INSTRUMENT and a POSITIVE CONTROL proving the instrument can return non-zero"
- W133 · A · A second observation counts only if it could have disagreed · S9 · "do my two checks share an input?"
- W134 · G · `git status` reports an instant; my work got swept into the lead's commit · S9 · "does anyone else have a reason to touch this file in the next ten minutes?"
- W135 · B · A local truth stated as general ("no check available to you"); the signal decayed in 18s · S9 · "No wire-based guard can close that window"
- W136 · A · The structure hazard does not apply to my seat doc; `.anthill/` has no formatter and no linter · S9 · "`.anthill/**/*.md` has NO formatter and NO linter"
- W137 · B · Put an unrealised prediction into a tally · S9 · "A prediction that a failure will happen is not an occurrence of it."
- W138 · A · A token search stood in for the claim, twice; the re-read trigger caught a shipped inversion · S9 · "The claim was about a SURFACE and I searched for a VOCABULARY."
- W139 · B · A hold condition can be over-broad; check its dependency per item · S9 · "Keep the discipline and check its dependency per item"
- W140 · G · Reflective: ran a write probe on a shared file the lead was committing (repeat of W59) · S9 · "I reached for the write first."
- W141 · B · Reflective: composed the message before running the final check, again (repeat of W127) · S9 · "'is now' and 'will be' are different tenses and prose cannot tell them apart afterwards"
- W142 · B · Bounded the search by ownership; 4 of 4 seats followed the wire; ask delivered at join must fire at finalize (repeat of W11) · S10 · "The domain of my check was drawn along OWNERSHIP lines."
- W143 · A · The structure instrument had an unstated domain; validated on the only class it covers · S10 · "a check that cannot fail in the failing case, which is my own epitaph's refinement"
- W144 · F · Accepted the one claim that indicted me on sight; corrections and retractions fail by the same reflex · S10 · "a CORRECTION and a RETRACTION fail by the SAME reflex in opposite directions"
- W145 · J · Epitaph fired in the cheap direction; the `upgrade` gap does not exist; the negative result was the deliverable · S10 · "An assigned artifact is not evidence the artifact is owed"
- W146 · E · A ruling's non-rulings are enumerated from the author's agenda; index rulings by message ids · S10 · "index a ruling by the MESSAGE IDS it answers"
- W147 · C · A rendered-once omission is a standing claim, second instance (repeat of W90) · S10 · "Publishing a caveat feels more rigorous than closing it and is not."
- W148 · A · Verify the artifact you ship, in the form it ships; render probe with a positive control · S10 · "a zero-token result is also what a renderer that did nothing produces"
- W149 · B · Reflective: a hold ruling did not cover my whole lane (repeat of W139) · S10 · "the second session running that the same over-broad-hold instinct fired first"
- W150 · C · A migrated sentence carries an unwritten reason that can invert · S11 · "A reason resting on a property the new world lacks does not go stale — it INVERTS."
- W151 · B · Hold over-broad again; describe measured behaviour instead of promising (repeat of W139) · S11 · "A hold I set is a claim I stop auditing."
- W152 · J · The structure instrument fired on the sixth file after five clean runs · S11 · "Five clean runs is exactly the evidence that makes you stop running it."
- W153 · B · The domain epitaph paid twice and I still shipped one; skills are mutated by the hook and verified by nothing · S11 · "`plugin/skills/**/*.md` is MUTATED by the hook and VERIFIED by nothing"
- W154 · A · The instrument must be chosen per path; the gate is never evidence on a markdown lane (repeat of W143) · S11 · "on a markdown lane the gate is a precondition for landing, never evidence about the work"
- W155 · A · A peer's in-flight red makes your green unmeasurable and nothing says so · S11 · "you cannot measure right now, and it is not your fault"
- W156 · E · Prose can discharge a mechanism card; an anchor on the channel it bounds is not an anchor · S11 · "an anchor published on the channel it bounds is not an anchor"
- W157 · C · History is not guidance; a migration has three exit states per site · S11 · "a migration has three exit states per site — migrate, keep-as-history, keep-because-still-true"
- W158 · A · Reflective: zsh word-split, `wc` status mislabelled, read below the anchor (repeats W132, W63) · S11 · "the label was false and I published the label"
- W159 · B · `--as-of` taxes the longest messages; I reported the finding as an aside · S11 · "He built the hypothesis; I reported it as an aside. That is the scar"
- W160 · E · A mechanism that ships half is not a mechanism · S11 · "'the template half landed' is not 'shipped.'"
- W161 · J · Announce before editing a file someone else will commit; the scar fired correctly (positive of W134) · S11 · "hold my land, I am taking the file"
- W162 · I · Epitaph not superseded (session 11); migration lesson not promoted because it is a content rule (repeats W14) · S11 · "the epitaph slot is for the disposition that fires before you know what task you are in"
- W163 · E · When a ritual's guard keeps missing, check its domain before strengthening wording; step 2.5 covered only seat-owned docs · S12 · "The beat was not too quiet. It quantified over the wrong set"
- W164 · A · Agreement between two sources is not a check when one was never consulted · S12 · "ask whether you actually READ the second one, or whether it merely exists"
- W165 · A · Restated an inherited number as a bound; the 64KB truncation was the pipe (repeat of W107) · S12 · "A wrong rule from the lead propagates at the speed of the brief"
- W166 · J · Instrument-per-path fired in the cheap direction; `--file-info` first (positive of W143) · S12 · "a check whose domain excludes your artifact does not fail — it passes, silently"
- W167 · A · A peer's in-flight red, second session; the remedy is attribution (repeat of W155) · S12 · "The remedy is attribution, and it is cheap"
- W168 · B · A non-empty `uncheckedAgainst` on a markdown lane needs a narrowing; report the bound in the commit · S12 · "no leg of the gate ever touched a file in this commit"
- W169 · A · Volunteer the falsifier for your own mechanism and name the subject · S12 · "If a beat cannot catch a stale claim in the document that commissioned it, it does not work"
- W170 · A · Reflective: zsh word-splitting again (repeat of W132) · S12 · "the same construct that fails loudly in a direct call is the one that returns a clean, empty, wrong table"
- W171 · B · Conclusion survived, reason did not, three times; the reason is the deliverable (repeat of W8) · S12b · "NOTHING checks the support"
- W172 · A · A control that disagrees with your sentence must be reconciled; literal text through `grep -F` always · S12b · "literal text goes through `grep -F`, always"
- W173 · J · Epitaph used as a design brief on someone else's guard (repeat of W163) · S12b · "check the guard's DOMAIN before you strengthen its wording"
- W174 · A · The falsifier run found four stale claims plus a fifth the sweep missed; tables vs prose (extends W169) · S12b · "a sweep that reads tables will pass a document whose narrative is wrong"
- W175 · A · Pre-register a debt with both branches; verify the exonerating claim as hard · S12b · "A prediction with only the alarming branch stated leaves you hunting for prose to write."
- W176 · F · Adopted a peer's tidier mechanism over my own measurement; deference is not directional (repeat of W144) · S12b · "a peer's tidy answer buys the same unearned pass"
- W177 · A · A claim about a shipped artifact must be read at a SHA; the plugin is a symlink into a live tree (repeat of W2) · S13 · "`git show <sha>:<path>` is the entire fix and it costs nothing."
- W178 · A · The probe hazard is three-dimensional (wrap, movement, case); "safe file" is the dangerous frame · S13 · "fold newlines, fold case, read at a SHA — and keep a control that can return non-zero"
- W179 · E · Reachability is not findability; a rule cheaper to violate than observe does not survive a tired agent · S13 · "a rule whose violation is cheaper than its observance does not survive contact with a tired agent"
- W180 · J · The cascade check paid on the first row; landed template and SOP in one change (positive of W90/W71) · S13 · "an omission there is a standing claim, not a gap"
- W181 · A · A green announcement outlives the tree; attribute before concluding (repeat of W155/W167) · S13 · "if none are yours you are BLOCKED, not broken"
- W182 · A · Read both envelope fields together; an empty list is weakest when `waitedMs` is large · S13 · "weakest exactly when `waitedMs` is LARGE"
- W183 · A · Instrument per path and verify the rendered artifact (repeat of W154/W148) · S13 · "confirmed my new sentence was present in the RENDERED SOP, not merely in the file I edited"
- W184 · F · An outside reader found a defect in my code six lines under the comment that forbade it; three chairs saw three halves · S13 · "Three chairs saw three different halves and none of us saw the whole"
- W185 · E · Two seats carded one defect; the dedupe rule does not cover the board; tag MOOT not DONE · S13 · "Tidying up after a defect is a way to commit it."
- W186 · A · `--tag X --tag Y` keeps only the last; `valuesIgnored` returned null · S13 · "the natural invocation loses data and the field built to report that (`valuesIgnored`) returned `null`"
- W187 · A · Print the artifact, not the verdict; the only method that reached the quiet tail · S13 · "It is reachable only by refusing to read verdicts."
- W188 · D · Write the sentence so the world can move under it; phrase over sources, not counts · S13 · "phrase it over SOURCES rather than over a count"
- W189 · B · Verify which way a finding falls before publishing; the alarming reading was reachable first · S13 · "Same evidence, two available conclusions, and the alarming one was reachable first."
- W190 · A · Reflective: schema-guess false zero; print the container (repeat of W132) · S13 · "Print the container, not the count."
- W191 · H · S10-9: the SOP owes a sentence on an empty `uncheckedAgainst` (repeat of W113) · CAND · "the SOP owes a sentence on an EMPTY `uncheckedAgainst`"
- W192 · H · C-R1b: the seat-facing stand-down beat in finalize is deferred (relates to W142) · CAND · "this half is deferred, not done"
- W193 · H · Ask for the same-output-different-question read; sentinel's measurement caught my prose (repeat of W111) · CAND · "Reading on topic rather than on address is what caught it"
- W194 · H · Try the same-output-different-question audit deliberately (repeat of W111/W193) · CAND · "hand a peer output I have already read and ask a different question of it"
- W195 · H · Does the `uncheckedAgainst` totality fix land? if not, card the sentence (repeat of W113) · CAND · "If declined, the SOP + template sentence is owed and should be carded, not folded."
- W196 · H · Themed naming: generating a theme from the repo domain is an open nicety · CAND · "generating a theme from the repo's domain is an open nicety"
- W197 · H · The single-app-workspace guard; watch for other layout-vs-team shapes · CAND · "watch whether other 'workspace layout ≠ multi-surface team' shapes need the same"
- W198 · H · Audit which lifecycle skills encode a conversation without a worded exemplar (repeat of W20) · CAND · "which other lifecycle skills encode a _conversation_ as steps without a worded exemplar?"
- W199 · H · Do tool-scoped warnings generalise? the fix may not be prose (repeat of W49) · CAND · "the real fix may not be prose at all"
- W200 · H · The mechanism half of manifest-outranks-ruling, priced: do not build it because it is tidy (repeat of W106) · CAND · "Do not build it because it is tidy."
- W201 · H · I have never dispatched the blank-context audit myself; resolve explicitly (repeat of W92) · CAND · "the only instrument with a 2-for-2 record against this seat"
- W202 · H · The structure-insertion hazard still has no instrument (stale; contradicted by W110/W152; repeat of W83) · CAND · "It worked and it is not a method — it is me remembering."
- W203 · I · Lineage: session-12 epitaph, conclusion right / reason wrong, and why it was superseded (repeat of W7/W8) · LIN · "Your CONCLUSION will be right and your stated REASON will be wrong — and the reason is the half that travels."
- W204 · I · Lineage: session-10 epitaph, bounded by what you own (repeat of W11) · LIN · "you almost certainly bounded it by what you OWN"
- W205 · I · Lineage: session-9 epitaph, read what you already hold (repeat of W130) · LIN · "go and read what you already hold"
- W206 · I · Lineage: session-8 epitaph, could the check come out the other way; refinement on shared inputs (repeat of W117/W133) · LIN · "ask what it would look like if you were wrong"
- W207 · I · Lineage: session-7 epitaph, measuring the wrong property (repeat of W100) · LIN · "You will measure the wrong property and call it verified."
- W208 · I · Lineage: session-5 epitaph, ask for a measurement not a reading (repeat of W76) · LIN · "ask for a measurement, not a reading"

Total distinct entries: 208 (including marked repeats).

## Classes

Ten classes. Every item is assigned to exactly one. No item was left unclassified, so there is no "unclassified" class; the two closest calls are noted under each class.

### A. Checks that could not tell the truth

Test: an item belongs here if it is about whether a check the author ran (or a method for running one) could distinguish the failing case from the passing case — a false zero, a false green, an exit code from the wrong stage, a search whose domain excluded the target, or a method for making a check discriminate (positive controls, read at a SHA, print the artifact).

Members (48): W2, W3, W4, W53, W57, W58, W63, W64, W73, W84, W87, W93, W98, W100, W102, W107, W110, W115, W117, W119, W125, W129, W131, W132, W133, W136, W138, W143, W148, W154, W155, W158, W164, W165, W167, W169, W170, W172, W174, W175, W177, W178, W181, W182, W183, W186, W187, W190.

Prevention / usability: Almost every item here has the same shape — the author read a verdict (exit 0, zero hits, empty diff, green gate, populated field) instead of the thing the verdict summarised. The intervention is to make the raw artifact and a control mandatory in the same command block as any verdict that will be quoted. Concretely: a small `probe` wrapper the team ships (a shell function or `anthill probe`) that runs the command with no pipe, prints per-stage exit codes, prints byte count and first/last lines of output, and refuses to return a bare zero unless a positive-control invocation in the same call returned non-zero. It fires whenever a seat is about to write a measured number or a "clean"/"verified" into a wire message, commit message, or lesson — the send/commit path is the natural hook point, not join. Complementing it: a per-path instrument table (which formatter/linter/gate actually processes which directory) emitted by the tool at join, so "does this check even cover my path" is answered before the check is run rather than after (W58, W136, W143, W154, W166). For the live-symlink hazard (W2, W177): a rule that any claim about shipped behaviour cites `git show <sha>:<path>`, enforced by the reviewer asking for the sha.

Specificity: the shape is general — any agent team that verifies with shell pipelines, greps and gates will hit exit-code laundering, false zeros and domain-excluded checks. The instances are project-specific (prettier/biome coverage, `uncheckedAgainst`, ugrep, zsh, the symlinked plugin). The "my medium has no gate" framing is specific to a prose-owning seat.

Recurrence: 25 of 48 recur (14 are marked repeats of an earlier id; 11 are origins that recur later — W2, W3, W63, W64, W107, W117, W132, W143, W148, W155, W169). 23 appear once. The false-zero family alone (W132 → W158, W170, W190) is recorded four times.

### B. Claims that outran their evidence

Test: an item belongs here if the failure was in what the author asserted — scope wider than the check, a reason that was not the reason, an invented magnitude, a count built from testimony or forecast, a finding whose direction was chosen before the evidence — regardless of whether the underlying check was sound.

Members (28): W1, W7, W8, W10, W11, W12, W15, W34, W79, W80, W81, W105, W112, W122, W124, W130, W135, W137, W139, W141, W142, W149, W151, W153, W159, W168, W171, W189.

Prevention / usability: the author already knows vigilance does not fire (W63, W15), so the intervention has to be mechanical and land at publish time. A pre-send lint over the draft (wire message, commit message, lesson entry) that flags every number, magnitude word, quantifier ("every", "none", "anywhere", "months", "ms", "n=") and every "because"/"so" clause, and demands one of: a command that produced it, a sha, or the literal word "unmeasured". The tool that sends/commits runs it; the author resolves the flags. The three-question triad (W6/W14) belongs in the same place — emitted by the send command as a prompt, not held in the seat doc to be remembered at join. For the search-domain subfamily (W11, W130, W142): a rule that any "X does not exist" claim names the directories searched and is answered by a repo-wide search run by a different seat, since the author's ownership lines are exactly what bound it.

Specificity: strongly tied to this seat's kind of work — where reasoning is the deliverable, unsupported support is the defect (W9). The shapes (invented hedge, testimony in a tally, ownership-bounded search) would appear on any agent team that reports findings to peers; the domain instances are project-specific.

Recurrence: 10 of 28 recur (W7/W8 → W171/W203; W11 → W142/W204; W139 → W149/W151; W130 → W205; W141 repeats W127). 18 appear once.

### C. Ways prose goes wrong without anyone writing a false sentence

Test: an item belongs here if it describes a mechanism by which a document became false, inverted, or misleading after (or independent of) its authoring — a set gained a member, a tool changed, a ruling happened on the wire, a comment's explanation rotted, a hook restructured the file, a rendered-once template froze an omission — or names where such rot hides from observers.

Members (23): W28, W36, W45, W55, W62, W65, W69, W71, W77, W83, W85, W90, W95, W97, W99, W101, W114, W121, W126, W127, W147, W150, W157.

Prevention / usability: these need triggers that fire on the _other_ side's change, since the prose author is not present when the rot happens. Three concrete pieces: (1) a registry of named sets and the files that enumerate them (schema fields, wires, skills, "three homes"), so a cascade-check on any commit that adds a member lists the enumerations to revisit (W97, W90, W147, W180); (2) a "rests-on" annotation convention for load-bearing rule sentences in skills and templates (`<!-- rests-on: panes evaporate -->`), so a migration can grep for the premise rather than the subject (W150, W101, W85); (3) a render-and-diff step for rendered-once templates at finalize — render into a throwaway tree and diff against the team's own rendered SOP — because nothing else refreshes them (W90, W147, W114). The wire-ruling blind spot (W71) wants the ruling index the author proposed (W146) cross-linked to the docs it changes. The formatter-restructure hazard (W83) already has its instrument (W110/W152); make it a pre-commit step rather than a remembered one.

Specificity: general for any team whose prose describes a moving tool; the enumeration/cascade shape is universal. Rendered-once scaffolds and the prettier-hook reparenting are specific to this project's template and lint setup.

Recurrence: 5 of 23 recur (W83 → W202; W90 → W147/W180; W127 → W141; W45's note repeats W39). 18 appear once.

### D. Rules for writing distributed prose

Test: an item belongs here if its content is a positive, applicable rule about how to word, scope, place, or structure skill/SOP/template text so it stays true across consumers and tool changes — rather than a report of a failure.

Members (27): W17, W19, W20, W21, W22, W23, W24, W25, W26, W27, W29, W31, W32, W33, W38, W39, W42, W43, W46, W47, W49, W54, W68, W78, W89, W103, W188.

Prevention / usability: these are already usable; the problem is that they are scattered across dated sections and mixed with scars. The intervention is compression into one short style sheet for skill prose (roughly fifteen rules: point, don't restate; exemplify dialogue not invocation; one sentence per line; state the exception at the point of use; name the failure mode a remedy treats; shrink when the emitter teaches; pin to the claim; phrase over sources not counts; refuse to make the artifact true) that the seat doc points at, and that the blank-context reviewer is handed as its checklist. The mechanical ones (line shape, no example invocations, no restated contract shape) can become lint rules or a review-prompt clause. It fires when a skill/template/SOP file is touched; the reviewer agent runs it, not the author.

Specificity: mostly specific to a docs/skills-owning seat. A few are general to any team that keeps prose beside code (point don't restate; land pointer and target together; don't assert about a changing side).

Recurrence: 3 of 27 recur (W20 → W198; W39 → W45 note; W49 → W199). 24 appear once. This is the least-repeated class — rules, once learned, stayed learned.

### E. How a mechanism, field, or ritual should be shaped

Test: an item belongs here if its subject is the design of a tool field, guard, ritual step, or store — a property the team's process should have — rather than the author's own prose or checks.

Members (17): W35, W56, W60, W61, W70, W74, W88, W106, W108, W113, W120, W146, W156, W160, W163, W179, W185.

Prevention / usability: these do not belong in a seat doc at all; they are contract clauses, cards, or issues with an owner. The intervention is a finalize step that routes any lesson whose subject is a tool or ritual to the board (or `seams.md`) with an owner, leaving only a pointer in the seat report — several already were (W88, W106, W113 were carded). Curation should check that each has a card id; the ones without (W108, W120, W179) are the ones most likely to be lost. The lead or curate runs it at finalize.

Specificity: instances are project-specific (comms envelope fields, board dedupe, ruling index, stand-down beat). Four generalise to any team: a completeness field must not be the first casualty of incompleteness (W108); a total field cannot be silently absent (W113); stigmergy and cold review trade against each other (W120); a rule cheaper to violate than to observe will be violated (W179).

Recurrence: 3 of 17 recur (W106 → W200; W113 → W191/W195; W163 → W173). 14 appear once.

### F. Getting and weighing another agent's read

Test: an item belongs here if it is about how to solicit, weigh, or answer another agent's reading, measurement, ruling, or correction — including which kind of outside instrument to ask for and the limits of self-review.

Members (23): W18, W30, W37, W40, W41, W44, W48, W50, W51, W52, W75, W76, W91, W92, W94, W109, W111, W118, W123, W128, W144, W176, W184.

Prevention / usability: the author's own conclusion is the right one and is not yet operational: change the default ask. A review-request template for this seat that says "here is the artifact; enact it / run it and tell me where you go wrong; I am not giving you my criterion" (W76, W94, W118), plus "same output, different question" as a standing beat (W111). The blocking issue the author names is that they cannot dispatch the blank-context audit themselves (W201); the intervention is to make it a scheduled finalize beat run by the lead or a subagent, not a favour. For deference (W144, W176): any incoming correction or retraction gets the same one-command check regardless of whether it saves or costs the author work — a rule that could be enforced by the reply template asking "what did you measure before adopting this". It fires on receipt of a correction and on request of a review; the author runs the first, the ritual the second.

Specificity: general — every multi-agent team will hit shared-input convergence, warm cold-readers, and directional deference. The "prose is falsifiable, ask for a measurement" framing is seat-specific.

Recurrence: 9 of 23 recur (W18 → W50; W52 → W75/W111; W144 → W176; W92 → W201; W76 → W208; W111 → W193/W194). 14 appear once.

### G. Blast radius of the author's own actions on shared state

Test: an item belongs here if it is about an action the author took or nearly took — a write probe, a mutating command, an edit to a file a peer is committing, a race against a gate — whose cost falls on shared or peer state, and how to relocate or avoid it.

Members (10): W59, W66, W67, W72, W82, W86, W104, W116, W134, W140.

Prevention / usability: a read-only-first default with a mechanical relocation rule: probes on shared state use read-only equivalents (`git show`, `git diff --cached`, `rev-parse`, porcelain), and anything that must write runs in a throwaway tree (`git archive` export or a scratch worktree) — this is already the author's practice by session 7 (W104) and just needs to be the skill's instruction. For the edit race (W134, W161): a cheap tool query, "who touched this file in the last N minutes", or the announce-before-edit line the author adopted, placed in the join checklist. The pre-land insurance patch (W66, W67) is a two-line recipe that belongs in the skill, not the seat doc.

Specificity: general to any team sharing a working tree (symlinked plugin, worktrees, shared refs). The specifics are anthill's.

Recurrence: 3 of 10 recur (W59 → W140; W134 → W161 in class J). 7 appear once.

### H. Open items handed to the successor

Test: an item belongs here if it is a task, question, or priced option left for the next instance rather than a settled lesson.

Members (12): W191, W192, W193, W194, W195, W196, W197, W198, W199, W200, W201, W202.

Prevention / usability: they need an owner and an expiry. Ten of the twelve duplicate a lesson elsewhere in the file, and one (W202) is contradicted by two later lessons (W110, W152) but was never struck — the candidates list has no date and no "still open?" check. The intervention: candidates live on the board as cards with the seat doc holding only ids; each join re-verifies "still open" against the tree (a step in the join checklist), and curation drops any candidate that a later lesson closed. Run by curate at migration and by the seat at join.

Specificity: project-specific content; the rot mechanism (undated to-do list that outlives its resolution) is universal.

Recurrence: 10 of 12 are repeats of earlier ids. Only W196 and W197 appear once.

### I. Instructions about the seat document itself, and the lineage

Test: an item belongs here if it is about how to hold, order, or supersede the standing epitaph, why this seat's failure shape is what it is, or a re-recording of a past epitaph in the lineage.

Members (14): W5, W6, W9, W13, W14, W16, W96, W162, W203, W204, W205, W206, W207, W208.

Prevention / usability: the lineage is itself a working mechanism (the author repeatedly refuses to supersede an epitaph that is still firing, and explains why). What would make it usable by a successor is a fixed slot: one epitaph, one ordered question triad, everything else in the lineage — and the triad delivered by tooling at publish time (see class B) rather than held in prose to be remembered. The six lineage entries are valuable precisely as a record of _why_ each line was replaced; curation should keep the "why superseded" paragraphs and can drop the restated scars, which are all in the inventory elsewhere.

Specificity: specific to this project's epitaph ritual; the underlying idea (a single top-of-file disposition that fires before you know the task) would transfer to any agent seat with a persistent doc.

Recurrence: 8 of 14 recur (the six lineage entries repeat W7/W8, W11, W130, W117/W133, W100, W76; W162 repeats W14/W96; W13 references W130). 6 appear once (W5, W6, W9, W14, W16, W96).

### J. A recorded rule fired in the cheap direction

Test: an item belongs here if it reports that a rule already on record caught something before it shipped, or was confirmed by a peer running it — a success of the doc rather than a new failure.

Members (6): W145, W152, W161, W166, W173, W180.

Prevention / usability: nothing to prevent; these are the evidence that a rule earns its slot. To make them usable, record them as a tally against the rule id they confirm (W145 → W130; W152 → W110; W161 → W134; W166 → W143; W173 → W163; W180 → W71/W90), so curation can weight rules by hit-rate rather than by recency or by how loudly they are formatted. The author does this informally ("2-for-2 record", "second session running"); a `fired:` counter on each rule would make it mechanical. The author records the confirmation at finalize.

Specificity: general.

Recurrence: 6 of 6 are by construction re-occurrences of an earlier item.

### Splits and merges considered

- A vs B: tempted to merge as "verification failures". Kept apart because the author's own lineage draws exactly this line (session-8 line governs a check you are running; session-12 governs the support under a claim whose check was fine) and the interventions differ — a probe wrapper for A, a publish-time lint for B.
- J into the content classes: tempted, since each confirmation is about a rule that lives elsewhere. Kept because "what would prevent this" does not apply to a confirmation, which is the sign it is a different kind of thing.
- H and I into one "successor-facing" class: tempted, both are addressed to the next instance. Kept apart because a to-do and an instruction on how to hold the doc want different curation (expiry vs preservation).
- A separate "Reflective (trusted by default)" class: the file has a recurring sub-genre of thirteen entries with that label (W31, W51, W82, W91, W105, W106, W115, W116, W125, W140, W141, W149, W158, W170, W190). Considered and rejected — the label marks the _form_ of the entry (a trusted assumption that failed), not its kind; by content they scatter across A, B, F, G, and E, and classifying by form would have split identical lessons (W132 vs W170) into different classes.
- E vs D: the border is "is the subject a tool/ritual or a sentence"; W156 (prose discharged a mechanism card) and W103 (refuse to document a defect as a feature) were the two closest calls and went to E and D respectively.

## Notes

- Readability, as someone with no context: hard. The file is dense, almost entirely bold and capitals in later sections, and leans on house vocabulary that is never defined — seats, wires, the vine, comms, cards, lands, ratify, Contracts 4(d)/5(b)/6(c-bis)/7(d), `uncheckedAgainst`, `waitedMs`, `--as`, S10-6, R17, t-38cab143. Perhaps a third of the items cannot be evaluated for correctness without the repo; they can be classified because the author almost always states the general shape after the instance.
- The header claims nothing was judged; that is true of content but the author's own formatting is a judgment layer: "⚠ THE ONE TO READ FIRST" appears at the top of roughly ten sections, which by session 13 means nothing is first. Curation should ignore the emphasis and use the fired-tally idea (class J) instead.
- Volume vs novelty: of 208 entries about 80 are repeats, extensions, confirmations, or lineage restatements of an earlier entry. The genuinely new lesson rate falls sharply after session 8; sessions 9–13 are mostly the same six or seven mechanisms (false zero, ownership-bounded search, instrument domain, hold over-broad, deference on sight, in-flight red, rendered-once omission) recurring with better instances.
- Temporal ordering is broken in two places: the Candidates section is undated and contains an item (W202) that later sessions closed; and the current epitaph block contains the two predecessor epitaphs inline _and_ they are repeated in the lineage, so the same text appears twice.
- The early material (July: HWL, AP, UF, BSB) is a different genre from the later material — short craft rules, no scars, no self-reference. From TC1 onward almost every entry is a failure report with the author as subject. Class D is nearly all July; classes A and B are nearly all August.
- The author's most usable single output is not any lesson but the pattern of stating a pin ("the claim, not the line"), a falsifier, and a control with each finding — that convention is what made the inventory possible.
- No items were unclassifiable. The closest was W120 (stigmergy vs cold review), which is a repo-level design observation the author explicitly says is "not seat-level"; it sits in E.

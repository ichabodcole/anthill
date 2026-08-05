# Retro log — newest first

Written at `anthill:finalize-session` step 4.5. **Q3 answers are hypotheses the next convene reads
and tests.** Q1/Q2 answers carry an artifact where one exists, and are labelled `testimony` where one
does not.

> **`artifact:` means a thing in the repo a stranger can run or read** — a sha, a test count, a file.
> **Neither wire is an artifact: nothing either one writes is tracked, and quoting our own messages is
> quoting ourselves either way.** Anything whose only evidence is "we said so" is `testimony:`, however
> many of us said it.
>
> _Corrected 2026-08-01 (session 5), wording steward's. The original read "the grapevine leaves no log
> in the tree, and while comms does…" — a false premise: `.gitignore:44` ignores `.anthill/comms/`, so a
> fresh clone gets no comms log._
>
> _**The conclusion was never wrong.** That clause is concessive — *although* comms leaves a log, quoting
> ourselves is still not evidence — so the sentence already denied comms artifact status, on the stronger
> ground of self-quotation. A stranger-readable comms log would still fail that test. The rewrite kills a
> genuine ambiguity instead: we use "in the tree" for both the **working** tree (`git status`) and
> **tracked** content, and the clause is true under the first reading and false under the second. Three
> seats spent a measurement resolving which was meant._
>
> _Recorded because the lead's first correction of this paragraph claimed it "had one job and was failing
> it silently" — an overstatement of a true finding, withdrawn. See the Rulings section of
> `docs/projects/_archive/team-comms-spike/slice-two-proposal.md`, landed after discovering the decision record
> was sitting in an ignored file._

---

## 2026-08-05 · Session 10 — the defect count was two and it was three; and the session's founding number did not survive its own artifact

**Seats:** all six in terminals — maestro (lead, a FRESH instance by session 9's design), forager, weaver, sentinel, steward, scout. Parallel, comms sole wire (vine open-but-untailed, ruling carried from `#284`).
**Landed:** gate **512 pass / 0 fail @ `27da450` (clean)** → **529 pass + 1 todo / 0 fail @ `503b43b` (clean)** = **+17 pass**. **18 commits @ `596f989`, 0 reverts.** **Both ends measured on clean trees at named shas by two seats independently** — every other reading this session was taken over a dirty tree.

> _The commit count above was **16** when this paragraph was drafted and **18** when it was checked, two lands later — the sixth stale-count instance of the session, in the file recording that class. And the revert figure nearly shipped as **1**: `git log --grep=revert -i` matched `53ecae4`, whose message describes **reverting a mutation**. `--grep='^Revert'` returns **0**. **That is Q4's corollary — `grep -c` collapses identity into cardinality — firing on the lead inside the retro that ratifies it.**_
**Curated by:** maestro, from the seats' answers on comms, posted **before** anyone stood down.

> ### ⚠ THE BRIEFING PREMISE WAS FALSE, AND IT WAS THE LEAST-AUDITED CLAIM OF THE SESSION
>
> `artifact:` Session 10 was briefed on the handoff's *"0 of 7 retro hypotheses tested — our rituals are write-only."* **`grep -n "Verdicts on" .anthill/retro.md` returns FOUR sections** — sessions 5, 6, 7, 8 — each scoring the prior session's hypotheses by label. Positive control returns 0. **The retro is the one store that provably is NOT write-only.**
>
> **The lead relayed that number at `#409` without checking it.** It is the premise session 9's maestro used to decline this seat. The audit's own cell reads `0 of 7 (scout, s8)` — **a narrower population than the general claim it became.** That is `principles.md`'s denominator rule, **written into the handoff as its own item 3**, failing on the person relaying the handoff.
>
> _Scoped, in scout's words: he checked the RELAY, not the audit. "of 7" is correct. The epitaph half is unmeasured._
> **A briefing premise is the highest-leverage claim in a session and it went unaudited for four hours by six seats.**

> ### ⚠ AND THE ANSWER TO "DO THE RITUALS FIRE?" IS NOT THE FLATTERING ONE
>
> The lead wrote at `#527` that four seats' epitaphs *"demonstrably fired."* **weaver caught it: they fired AND failed, and the lead had cited only the firings.** forager, steward and sentinel then each volunteered the same about their own — **after weaver went first, not before.**
>
> **`testimony:` Four seats independently reported only the firings. That is not four honest corrections; it is ONE uniform bias, corrected late in three cases and never in the fourth until a peer moved.** Nobody has the ratio. **`retro.md` carries the paired counts or nothing, and tonight it is nothing.**

### Q1 — what went well

- **The ratify-before-build gate changed what got BUILT, and it has commits behind it.** `artifact:` 6(g) was ratified as a description and **falsified as a safety property**, finding that `departed(s)` had no domain — before a line was written. A D1-only repair would have shipped a guard authorising teardown at the fresh-spawn instant **with branch 1 hardened, i.e. looking fixed.** _forager's note on why he picked this one: the alternative Q1 answers are all about how well we talked to each other, and agents sharing one frame will converge on those._
- **Building the RIVAL implementations found what reading could not.** `artifact:` sentinel built both natural D1 repairs in out-of-repo worktrees and diffed 36 cells: identical on 32, disagreeing only on `{dep:T, live:T, spawned: null|[]}` — **and `shouldBlockTeardown` returned `true` for BOTH there.** A verdict-keyed test would have certified either implementation. **That became a gate requirement**, which is the strongest form a verify finding takes: not a caveat on someone's work, a constraint on what the test is allowed to be.
- **A published falsifier worked AGAINST its author, inside the hour.** `artifact:` weaver posted C-R1/C-R2 with an explicit falsifier; **forager satisfied it with one grep** (`plugin/scripts/`, which weaver's sweep had not ranged over). **The falsifier converted weaver's error from something a peer had to CATCH into something a peer could CHECK.**
- **Refusing an unverified remedy from the LEAD worked, and the refusal was cheap.** `artifact:` maestro proposed `departedCount > spawnedCount` as sentinel's cell. sentinel labelled it `UNVERIFIED REMEDY` **on disposition, before running it**, then ran it: **FALSE on D1's own signature (`2 > 2`).** forager killed it independently from a different cell (`5/5`). **The lead upheld the refusal.**
- **Seats produced criticisms of the lead that the lead had NOT pre-empted.** `artifact:` session 5's scar was that no seat produced a criticism the lead had not already volunteered. scout ran the same check: **four seat-originated, un-pre-empted, from two seats** — `#429` (A4 scored a hypothesis whose falsifier's conditions were unmet), `#435`, `#459` (STEP 2 unreachable as sequenced), `#467` (the founding number). **Session 5's failure did not recur.**
- **`( gate ) && commit` as ONE invocation refused a land on a red tree.** `artifact:` `#492` — the gate failed at `team-join.ts`, the `&&` short-circuited, **nothing committed.** The affordance did the work; **no seat had to be careful.**
- **A published failure changed a peer's method in ELEVEN MINUTES.** `artifact:` sentinel published his grep failure at `#512`; weaver's check at `#523` added `-n` — and **weaver declined the credit unprompted, stating the counterfactual against his own interest.**

### Q2 — what did not

**The lead's, and per the ritual he wrote none of this before the seats had answered.**

- **The `#410` RETRACTION THREW AWAY A CORRECT CONCLUSION, AND FOUR SEATS NODDED.** `artifact:` the lead claimed a boot-window hazard at `#409`, found his probe's row population had omitted `maestro`, and withdrew the whole claim. **The conclusion was right; only the mechanism was wrong.** forager recovered it by re-deriving the space. **`#410` was read in full by four seats and nobody re-ran the withdrawn cell** — sentinel's own account: *"I spent my scepticism on your cell suggestion and none on your retraction. Two claims in one message, and I audited only the flattering-to-check one."*
- **Q3 #3 is NOT CONFIRMED AS STATED, and steward's independent dataset is why.** `artifact:` over 21 lead messages — **(a) domain omission ×3 · (b) predicate error ×2 · (c) clean ≥3.** The hypothesis says domain omissions *"not predicate errors"*; **both occur in comparable numbers, so the exclusive clause FAILS.** The weaker claim survives. _steward's recut, which outlives the score: both (b) rows are the same shape — **a claim about what an artifact CONTAINS, refuted by reading the artifact.** The real split is **POPULATIONS** (checked by constructing one) vs **CONTENTS** (checked by reading the file), and the lead is exposed on both by one habit — his own phrase: **enumerating what he had SEEN rather than what EXISTED.**_
- **Two commit-message defects, both visible in the terminal at the moment of the run.** `artifact:` `0c3fc16` carries a **stale count** (522; the gate had printed 529 in the same output). `3b82cef` carries a **mangled body** — `printf` with double quotes let a backtick code span **execute as a command substitution**, and the shell printed `command not found: comms`. _steward: it genuinely executed; the only reason it left a hole rather than output is that the CLI was down at that instant — **a third "protected by an accident" this session.**_ **The land protocol checks the TREE and the SCOPE and has no beat that checks the MESSAGE or the DIFF.**
- **A land whose contents did not match its message.** `artifact:` `0c3fc16` delivered one of two beats to `.anthill/README.md` and both to the template. Correctly claimed, scoped and gated — **and nobody read the diff.**
- **`#442`'s dirty-path enumeration created work for four seats** for a protection the file-scoped pathspec already provides. Superseded by the lead at `#449`; **the cost was already spent.** _weaver named this one and noted the lead had not: "a retro where the lead comes out clean is a retro that did not run."_
- **The lead CONTAMINATED a measurement by announcing he was responding to it.** `artifact:` `#439` — *"short on purpose, scout is measuring my volume."* **R2 is `CONTAMINATED AT SOURCE` and will not be repaired.** Un-shortened at `#444`.

**The seats' own, unsoftened:**

- **sentinel: seven instrument failures, all mine, one mechanism — and the SEVENTH happened while verifying the epitaph about the first six.** `artifact:` frozen axis · two coupled axes varied freely · suite subset · gate-leg subset · missing argument · a `|| echo` fallback that could only ever agree with him · a grep matching a different occurrence of his own phrase. **One published a fabricated number (`0 occurrences`; the terminal printed `4`).** _His own worst case: **the property was TRUE and the evidence was INVENTED** — every reader who checks the conclusion finds it holds and stops. **There is no reader-side defence against that.**_
- **forager: two wrong claims, both pointing the fault OUTWARD, both one command from being checked** — *"neither `team-join` path landed"* (both had) and *"the land dropped my epitaph"* (he edited after it). **The second sent weaver building controls against a defect in `anthill commit` that does not exist.** And he **broke the shared tree with a one-line comment fix, taking down every anthill verb including `comms send`** — the wire the team was using to coordinate around the breakage.
- **weaver: shipped a false instruction into a rendered-once template, and a second one into nothing at all.** `artifact:` he **fixed the scaffold for strangers and left his own team without it**, on the night that team runs the ritual. _His mechanism, and it is the session's best find about him: he had run the `diff` that showed the gap and **recorded it as evidence the reconcile mechanism works.** The same output said "your team is missing this." **He took the half that confirmed his check and not the half that assigned him work.**_
- **steward: everything he got wrong was PROSE carrying a correct number.** `artifact:` **0 wrong measurements to 3 shipped wrong sentences.** *"Your dirty list is short by one"* framed elapsed time as the lead's omission (withdrawn 18.5s later). *"Stops emitting"* used in its plain sense where `emittedThrough` is a field name — **and the lead relayed it verbatim into an operational instruction**, describing a far larger and more alarming population than the real one.
- **scout: six errors, five caught by peers not by him** — including **banking the lead's self-indictment and relaying it OUTSIDE the team** (the only one the wire could not correct), and **publishing a false green off `tsc` alone, one leg of three, in the message telling the lead to confirm the tree before an unrehearsable teardown.** **Two of his three registered instruments died: R1 (population donated by its subject) and R2 (contaminated at source).**

**Structural, nobody's fault:**

- **A WRITTEN SCAR FAILED 5×, ACROSS 4 SEATS, IN ONE HOUR.** `artifact:` `principles.md` already carries *"a `grep -c` returning identical counts across a rule whose meaning had inverted, while checking a correction."* Instances: scout `#509` · forager `#510` · sentinel `#512` · steward ×2 (one **never posted to the wire**). **Two nearly reported a landed fix as missing; one nearly reported a missing fix as landed. It fails in BOTH directions, and a positive control cannot catch it** — the pattern *did* match, just not the occurrence meant.
- **FIVE STALE-TREE CLAIMS, FOUR SEATS, ONE SESSION** — every seat who touched the tree, the lead included. **Each was correct when measured and defect-shaped by the time it was read.** `--as-of` makes a stale LOG view unsendable; **nothing does that for the TREE**, and we ran five writers on one.
- **`bun test` and `tsc` are each ONE LEG of a three-leg gate and the harness never says so.** `artifact:` n=2, two seats, one night.
- **The living docs still have ZERO automated protection.** `artifact:` `Checked 79 files` on the biome leg — **which is why the +17 delta says nothing about the 10 markdown files landed tonight.**

### Q3 — hypotheses the next convene reads and tests

1. **A seat's MEASUREMENTS will be right and its SENTENCES wrong, and the sentence is what propagates.** _(steward)_ **Falsifier, one command, no protection declined:** at session 11's finalize classify every self-correction as *wrong measurement* vs *wrong sentence about a right measurement*. **Falsified if wrong measurements outnumber wrong sentences.** _Tonight: 0 to 3 for steward alone, and the three that shipped are the three other seats repeated._
2. **The VOLATILE store propagates faster than the DURABLE one.** _(scout)_ Durable: a `principles.md` scar failed 5×/4 seats. Volatile: a wire message changed a peer's method in **11 minutes**, counterfactual stated by the actor. **Falsified if** session 11 finds a durable-doc firing with latency under an hour and an unprompted counterfactual. **Do not read this as "keep the wire" — read it as: we have never measured propagation latency by store, and we could.**
3. **DOMAIN OMISSIONS are this team's dominant defect class, not this session's theme.** _(weaver)_ n=5, five authors, while `principles.md` has carried the rule throughout. **Falsified if** session 11 closes with zero, **or if a seat shows the class was an artifact of the subject matter** — a presence guard is unusually population-shaped, and that is the strongest counter. **weaver wants it tested, not assumed.**
4. **The team's VERIFICATION DISCIPLINE itself generated a failure class.** _(sentinel)_ Five wrong-referent claims, and **every one came from a seat checking MORE than last session, not less.** **Falsified if** session 11 verifies as hard and the class does not appear — then tonight was a novice effect that self-corrects. _"The one I would most like to be wrong about, which is exactly why I am not the one to score it."_
5. **`READY:` on a LIVING DOC is a claim with a shelf life of minutes, and the producer cannot notice it expired.** _(forager, n=3 on himself)_ **Falsified if zero seats** amend a seat doc after it lands next session. **The SOP says synthesize while warm and the land is asynchronous — the instruction and the protocol pull opposite ways.**
6. **The epitaphs that FIRE name a disposition dischargeable by a COMMAND; the ones that become decoration ask for vigilance.** _(forager)_ Both of his discharges cost ~30 seconds and no willpower. **Falsifier: an epitaph that fires while asking only for attention.**
7. **Prose shipped to the TEMPLATE does not reach the team that wrote it.** _(weaver)_ Structural: `init` renders once, the author works in the template, nothing links them. **Falsified if** session 11 lands a template change and the author mirrors it **unprompted**. _The cheap guard weaver would rather build than predict: assert every `### ` heading in `templates/docs-team/README.md` exists in `.anthill/README.md`._

### Verdicts on session 9's hypotheses

- **#1 (a session spawned by the NEW `spawn` tears down with no `--force`)** — ✅ **HELD. RUN, BOTH READINGS, NO `--force`.**

  ```
  STEP B  07:14:59Z  before any stand-down   → ok:false  exit 1  "seats still present: all six"
  STEP E  07:22:26Z  after all six stood down → ok:true   exit 0  tornDown:true  presence:"none"
  ```

  **STEP B matched sentinel's pre-registered prediction exactly** — `present` branch, all six named. **The live path and the pure path agree**, which is the one thing STEP B could discover that the harness had not already given us.
  **⚠ STEP B is labelled `NOT DISCRIMINATING` for D3** — with all followers alive the unrepaired guard returns `present` too. Recorded as a negative, **not scored as evidence about the repair.**
  **⚠ And the lead nearly published the wrong exit code:** the first STEP B run piped to `head`, so `$?` was **head's** status (`0`). The CLI's true exit is `1`. **This team's own named instrument defect, firing on the lead, inside the exit criterion.**
  **The vine did not veto:** `presence: "none"`, 0 subscribers, checked immediately before STEP E per steward's `#483`.
  **What it proves:** the lifecycle **composes at the command boundary**. **What it does not:** D3 — by STEP E every spawned seat has a *fresh* tombstone, which counts under both the old and new predicates. **D3 is pinned by mutation M2, and separately by forager exercising it live against his own session-9 tombstone with two controls.**
  _First clean teardown in this team's record. Every prior session ended in `--force`._
- **#2 (a reorder introduces a fifth always-block road unless a cell covers it first)** — **`EXPERIMENT DID NOT RUN`.** `artifact:` its falsifier required *"lands correct with no new cell"* and `S10-4` is verbatim *the cell BEFORE the reorder*. **The protective act and the measurement were the same act, and protection had to win.** _The lead first scored this "falsified"; scout caught that the conditions were unmet and named the mechanism: **"#409 opens with 0 of 7 tested; a falsification recorded today makes it 1 of 7. The honest desire to record a falsification is what makes a near-falsification look like one."** Withdrawn._ **Second registered falsifier in two sessions requiring the team to leave a hazard unprotected — a pattern in our retro practice, not in either hypothesis.**
- **#3 (the lead's defects are DOMAIN omissions, not predicate errors)** — **NOT CONFIRMED AS STATED.** See Q2. **The exclusive clause fails; the weaker claim survives.**
- **#4 (a count is stale before it is sent more often than wrong when measured)** — **HELD, and it is the session's most reproducible finding.** `artifact:` five stale-tree claims, four seats.
- **#5 (a verb that WRITES ships before any verb that READS it)** — **HELD, 3-for-3** on D1/D2/D3, **plus a fourth**: the join manifest named the ACT in English and never the VERB, with a control showing the emitter names two other comms verbs.
- **#6 (the pane beats asking "are you stuck?")** — **ONE DATAPOINT, NO DISAGREEMENT, and it is not scored.** The lead pane-checked scout mid-compose rather than asking. **scout was never asked to confirm, so the comparison the hypothesis needs was not made.**

### Q4 — did this session produce a PRINCIPLE?

**Yes — steward's, and it has a scar with five instances across four seats.**

> **A verification that reaches for the same instrument as the claim is not an independent check — it certifies the claim's blind spot along with its content.**

**Scar:** a seat retracted on *"nobody could see me, I had not posted."* The lead **refused to take it on trust** and read the message-log timestamps himself. **Both instruments were the message log, and nobody disputed the log** — the disputed proposition was **observability**, and the log is structurally blind to a seat that is armed and silent. Two instruments that could see one (`grapevine who`, `comms positions`) existed, were runnable, needed no permission, **and neither was run.**

**Corollary, earned the same night, n=5 across 4 seats:** **`grep -c` collapses IDENTITY into CARDINALITY.** A positive control proves your pattern CAN match; it cannot prove it matched the occurrence you meant. **Ask git what a COMMIT changed, not the file what it contains.**

**A second candidate, NOT ruled in** — weaver's: *a CORRECTION and a RETRACTION fail by the SAME reflex in opposite directions, and `principles.md` names only one direction.* Tonight: a lead's retraction went unchecked by four seats until forager found it was **wrong to retract**; a seat's correction was adopted on sight by the lead **and silently by weaver.** **It has a scar and two instances; it is here rather than in `principles.md` because the direction it adds has not been tested by anyone who did not live it.**

### Structure note

**No reshape.** All six live, parallel, every seat landed its own doc and its own epitaph, and the atomic cross-seat land was exercised **16 times** with `uncheckedAgainst` read aloud on every one.

**The two seats that build nothing produced the session's decisive findings for a THIRD session running.** steward: the STEP 2 blocker (the lead is in `rows`, not `spawned`), STEP 0's false justification, the vine veto, the `grep -c` corollary, and the independent Q3 #3 dataset. scout: the founding number, the R2 contamination, the false-green catch, and three registered rules fixed before the data existed.

**The lead's load, flagged for a FIFTH session** — sole ratifier, sole router, sole author of `plan.md`, largest single source of wire volume. **New this session:** he is also **the sole runner of the land**, and both message defects live there. _weaver published the volume numbers and **explicitly refused the inference**, on the grounds that this team's own scar is a ratio that turned out to be an artifact of the discipline it was used to indict. The numbers are in the wire; the reading is not supplied._

**A handoff note, per session 9's precedent: the seat is not this instance's to keep either.** Session 9's maestro declined to run session 10 so a cold instance could test whether the trail transmits. **The result is mixed and is written above rather than summarised here — the constraints did transmit (the defect-pair rule was picked up from `seams.md` and the handoff, unprompted), and the founding number transmitted too, unchecked, and was false.**

---

## 2026-08-04 · Session 9 — the comms-as-default plan phase: four seams ratified, phase 1 landed, and the lifecycle it enables does not compose

**Seats:** all six live in terminals — maestro (lead), forager, weaver, sentinel, steward, scout. Parallel, comms sole wire (vine open-but-untailed by ruling at #284).
**Landed:** gate **497 → 512 / 0 fail**, 20 commits over `acefa0c..HEAD`, 0 reverts. Product code: 6 files, 728 insertions, 83 deletions, in **one atomic commit** (`eb7d1fc`).
**Curated by:** maestro, from the seats' answers on **comms**. Seats answered before standing down; the ordering was ruled explicitly because a tombstone is written before the retro and a wire is not a store.

> ### ⚠ PHASE 1 IS NOT DONE, AND THE DEFECT WAS FOUND BY TRYING TO USE THE THING
>
> `artifact:` **A seat that has run `comms stand-down` still reads `present`, because its `comms follow` is alive — and `anthill down` is what kills the follow.** Branch 1 (`followerAlive === true`) fires before departure is consulted (`team-support.ts:245`). Stand down → still `present` → `down` refuses → the follow never dies. **`none` is unreachable through the exact lifecycle the feature was built for.**
>
> **Found at teardown by forager (on himself) and steward (on the live tree), independently, messages crossing.** Watermarks prove the independence rather than the seats asserting it — both composed "as of #396". **Counted once.**
>
> **The guard half WORKS and is proven** (sentinel's 8 cells, mutation pair with restored control). **The flow half does not.** We shipped the writers on both halves and the readers on neither: `stand-down` writes a tombstone **no read verb exposes** (weaver, at teardown — only `ls` can confirm it), and `spawn`'s session-open record has no reader either.
>
> **Nothing reached a consuming team:** `eb7d1fc` lives on `feat/comms-as-default` and has never merged to `develop`.

> ### ⚠ THE END-TO-END TEARDOWN PROOF WAS CORRECTLY UNAVAILABLE, AND WAS PREDICTED BEFORE THE ATTEMPT
>
> This team was spawned **hours before `spawn` learned to write a session-open record**, so `spawned` is `null` → `unknown` → `down` refuses regardless of tombstones. **forager predicted this before the attempt; sentinel identified it as its own acceptance cell 0 executing in production.**
>
> **So tonight's `--force` is a confirmed prediction, not an unexplained override** — and the distinction from the reflex the ritual warns about is that *the branch that fired was named in advance.* **forager's first naming of the branch was WRONG** (he said "no session-open record"); **steward corrected it to branch 1 / `present`**, and forager independently reached the same correction.
>
> **Session 10's first exit criterion, needing no new work: convene → spawn → stand down → `anthill down` authorises WITHOUT `--force`.** If it does not, the writers and readers do not compose in the real world.

### Q1 — what went well

- **The ratify gate caught four defects in one rule before a line of it was built.** `artifact:` sentinel's exhaustive enumeration (1555 rosters, control emitting all three states) proving `none ⟺ zero records`; steward's vacuity catch (a universal quantifier is vacuously true over an empty spawned set); steward's cell-2 branch order; sentinel's "no cell reaches `none` under realistic rows". **Three of the four were caught by seats other than the rule's author, and two by the seat that builds nothing.**
- **The owner came to FALSIFY the lead's coupling claim and caught his own error first.** `artifact:` forager's #306 — he had drafted the falsification, and it was true with a conclusion that did not follow (*the absence of a departure record is itself the evidence*). He caught it because sentinel's enumeration arrived **before** his verdict rather than after, and scored it against himself as *"the sentence you will not check is the one that hands you work you find interesting"* — falsifying the coupling would have made C1 his lane alone.
- **Recording the ratify GRAIN bought a caught interface mismatch.** `artifact:` C1 was ratified at *the meaning of `none` + the state set*; the lead noted in the same message that sentinel's matrix and forager's shape were **finer than that grain, and therefore a new seam by construction.** At assembly, sentinel's test asserted a flat shape while forager shipped `CommsPresenceReport`. **Two greens over two shapes are not one green** — only the assembly could see it, and it surfaced before the tree rather than after.
- **The atomic land held under real concurrency.** `artifact:` `waitedMs` 13577 (scout) and 30472 (sentinel) — the serialize lock did real work, measured rather than estimated. Six paths, two seats, one commit, `uncheckedAgainst: []`.
- **A blank-context dispatch opened the session and reordered the plan.** `artifact:` four cold readers, briefed FIND-not-DESIGN, all withheld remedies. They falsified the proposal's integration order, its exit criterion, its `--session-key` precedent, and its `lock.ts` claim — **before any seat was spawned.**

### Q2 — what did not

**The lead's. He wrote none of this before the seats had answered, deliberately, per the ritual's own warning that a well-executed self-list pre-empts the audit.**

- **The lead's specifications were falsified FIVE times, and a sixth was found in his own landing procedure.** Exit criterion 1 twice (v1 arithmetically unmeetable — session 8 was **238** messages, not 279; v2 a **global** predicate standing for a **channel-scoped** claim, approved by the human on the lead's recommendation before forager measured it). Gate item 2 twice — **the repair preserved the contradiction**, with sentinel's *"the same trap catches the fix"* in the very message being answered. The tripwire once — **it counts to five and never defines what one is**, and steward found the same history admits 2, 3 or 4 defensible counts. **The lead chose the count as the discriminator precisely because he could not otherwise resolve the question.**
- **The lead's published land procedure had a hole he found by running it.** `artifact:` step 2 was *"one gate run over the assembled whole"*; forager then correctly fixed a docblock finding, and the commit followed. **The tree gated was not the tree committed.** Both read 512/0 and the committed state was verified after the fact — **but the pre-land gate was not a verification of what landed.** `uncheckedAgainst` is structurally blind here: it reports dirty paths **outside** the commit, and the edit was **inside** one of the six. The fix is the shell operator (`( gate ) && commit`) that weaver built in session 5 and the lead used on four docs commits and dropped on the one land that mattered.
- **The lead swept a peer's uncommitted work into his own commit.** `artifact:` `877b0d9` carried weaver's 40-line C4 block. `git status` showed one modified file; it was both of theirs, and **no tool can distinguish whose edits are in a file.** `plan.md` became a shared artifact the moment the ratifications went into it and **neither noticed the transition.**
- **The lead published a retro candidate that was already carded**, then reported it at `n=3` when it was `n=1`, and the team drove it to **`n=0`.** `artifact:` `t-23d2c106`, opened hours earlier from a different direction. **He kept the mechanisms separate in the prose and merged them in the number** — his own session-8 lesson is *do not fold mechanisms that share a symptom*, quoted while the fold happened in the arithmetic.
- **The lead escalated a decision that was not the human's.** Cole declined it: *"I'm not the intended user. The intended user is the agent team."* **Escalating felt like diligence and was the cheaper move** — it spent the human's attention instead of the lead's standing.

**The seats' own, unsoftened:**

- **forager: `--force` prose he owns taught the reflex his own docblock forbids** — and the first naming of the teardown branch was wrong, corrected by steward.
- **weaver: broadcast a formatter workaround inferior to one his OWN skill already prescribes by name** (`prettier --file-info`, in `bootstrap/SKILL.md`), and retracted an `n=4` after finding his card was a **prediction**, not an instance.
- **sentinel: its own `spawnedCount` remedy was vacuous and forager had adopted it**; its cell-2 fixture was unrepresentative; and *"the instrument pointed outward all session and never once inward"* is its own epitaph line.
- **steward: retracted a claim about its own card count** (`--mine` returns unowned cards) and found step 2.5 drift **in its own file, its own, not inherited**.
- **scout: published a 24-minute gap that was 14.2**, with the wrong number sitting **inside its own `[checked]` list**; conceded a "recognition failure" framing that steward falsified with one fact only steward held (*I never opened it*).

**Structural, nobody's fault:**

- **~9 distinct instrument defects, each manufacturing a plausible zero or a false clean.** ugrep's `(^|…)` alternation returning 0 matches / exit 1 · `bounty list` listing boards not tasks · a 65,536-byte pipe truncation with **exit 0** · `bounty state --mine` returning every unowned card · `add --as` not setting an owner · an unquoted zsh glob · a formatter invocation that **rewrites `⚠` to `!`** · prettier being **void inside `.anthill/`** — which is where the SOP tells seats to draft.
- **The living docs have ZERO automated protection.** `artifact:` `.prettierignore:19` excludes `.anthill/` (deliberately, for byte-stability); `biome.json` includes only `plugin/**` and root `*.ts|json`. **A mangled seat doc lands with a green gate.** The pheromone trail is the one artifact class nothing checks. Pre-finalize baseline: **156 files, zero mojibake** — recorded so a post-ritual check has a prior.
- **A freeze call on a wire has no enforcement.** weaver landed 29.6s after the land freeze, having not read it, and disclosed it with timestamps. **`--as-of` protects a SEND from crossing; nothing protects a LAND from crossing a ruling.**

### Q3 — hypotheses the next convene reads and tests

1. **A session spawned by the NEW `spawn` tears down with no `--force`.** _(the whole team)_ **Falsified if** it still refuses — which would mean C1's writers and readers do not compose outside the unit tests. **This is session 10's first exit criterion and needs no new work.**
2. **A branch reorder in `commsPresence` will introduce a fifth road for always-block unless a mutation cell covers the case first.** _(maestro, from four instances)_ **Falsified if** session 10's reorder lands correct without a new cell.
3. **The lead's specification defects are DOMAIN omissions, not predicate errors, and will recur in any artifact he authors alone.** _(maestro)_ **Test:** count next session's lead-authored criteria/gates/dependencies that state what they range over. **Falsified if** the next failure is a wrong predicate rather than a missing domain.
4. **A count published by this team is stale before it is sent, more often than it is wrong when measured.** _(maestro, n=4 today — `plan.md` untracked, steward's `⚠ OPEN` accurate by 12s, `n=3`, scout's 24-vs-14.2 minutes)_ **Falsified if** next session's wrong counts are wrong at measurement time rather than at send time.
5. **A verb that WRITES state ships before any verb that READS it, whenever the writer is the interesting half.** _(weaver + forager, n=2 tonight: `stand-down`'s tombstone, `spawn`'s open record)_ **Falsified if** session 10 ships a reader-first pair.
6. **Asking a seat "are you stuck?" is answerable only by the seat, and the pane is the only instrument that beats it.** _(maestro)_ The pane check discharged a 10-message silence in one command. **Falsified if** a pane check ever disagrees with the seat's own report.

### Verdicts on session 8's hypotheses

- **H2 (a ruling that names no artifact does not become work) — HELD, and tested against the lead.** He shipped one ruling naming a card without its id, corrected it in the next message rather than at the retro. Every other ruling carried a card id in the same message.
- **H3 (a relay + a per-seat ruling loses the ruling) — HELD.** The human's framing principle was relayed as its own message with no ruling attached, explicitly on these grounds. **No ruling was lost this session.**
- **H4 (the mutation harness fails silently) — NOT REPRODUCED, because it was guarded.** `artifact:` forager asserted substitution counts (SUBS=2, SUBS=1) **before reading the suite**, and required a **predicted mix** rather than uniform red. The hypothesis's own remedy was applied, so it scores as guarded rather than falsified.
- **H5 (a completeness claim about a defect class is wrong more often than right) — SPLIT, and the split is the finding.** The proposal's *36 prose references* was **arithmetically exact**, confirmed by two independent counts. **And the claim built on it was still wrong**, because the class had a second token (`vine`, 4× the surface) — plus the lead compared *all of `plugin/`* against *prose only* and published it as one measurement. **The count was right; the scope was the defect.**
- **H7 (dispatch scores NO DATA when blocked) — SCORED, and it ran.** Four blank-context readers dispatched at session open. **They reordered the plan before any seat was spawned.**

### Q4 — did this session produce a PRINCIPLE?

**Candidate, NOT ruled in, and the reason is that its own evidence collapsed under checking — which is itself the argument for it.**

> **A count is a claim about one population, and listing the mechanisms separately does not unmerge them.** Prose can disclaim a fold that the arithmetic performs.

**Scar:** the lead published `n=3` over three distinct mechanisms while explicitly writing *"stated separately rather than merged"*. steward reduced it to `n=1` (two instances were his, and he had **never opened** either original — an index cannot help a message that never arrived). scout then reduced it to **`n=0`**: the surviving instance was a recall **success**. weaver retracted his own `n=4` because his card was a **prediction**. **Three seats, each cutting against their own lane's interest.**

**It has a scar and it is one instance, so it is a Q3 hypothesis rather than a principle** — recorded here because next session can test it, and because the rule this team already has (*do not fold mechanisms that share a symptom*) did not fire when the fold happened in a number.

### Structure note

**No reshape, and the composition question has a sharper answer than last session's.** All six live, parallel, every seat landed its own doc and its own epitaph, and **the one atomic cross-seat land was genuinely cross-seat** (two seats' files, one commit) — against session 8, where none was needed at all.

**The two seats that build nothing produced the session's decisive findings for the second session running.** steward: the vacuity catch, the cell-2 branch order, the mask correction that moved the hazard from step 4 to step 3, and the `n=3`→`n=1` reduction. scout: the `uncheckedAgainst` second use, the `n=1`→`n=0` reduction, and an instrument it discarded rather than published. **Session 8's proposed scope refinement — point the support seat at PROPOSED FIXES rather than claims — was applied this session and is the direct cause of at least three of those.**

**The lead's load, flagged for a FOURTH session:** sole ratifier, sole router, sole author of this file, largest single source of wire volume, and **the seat whose own specifications were falsified more often than anyone's code.** Unlike sessions 6–8, this one has a concrete instrument attached: **five falsifications, all caught by seats, none by the lead on re-read.**

---

## 2026-08-04 · Session 8 — the sole-wire gate, run PARALLEL, with the first real cold-read dispatch

**Seats:** all six live in terminals — maestro (lead), forager, weaver, sentinel, steward, scout. **Parallel, not staged**, deliberately, to test session 7's H3.
**Landed:** gate **482 → 496 / 0 fail**, 31 non-merge commits over `ebfc3ab..2585ca0`, 0 reverts.
**Curated by:** maestro. Seats answered on **comms** — the ritual's step 0 says the vine, and the vine was the one wire nobody was allowed to touch (see Q2).

> ### ⚠ THE GATE PASSED, AND THE RESULT NEARLY PASSED ON HALF ITS FALSIFIER
>
> `artifact:` `grapevine pull` → **1 message** (the topic string). `grapevine who` → **subscribers 0, connections 0**. **Zero seat fallbacks, convene to teardown.**
>
> **But read scout's Q1 before crediting anyone.** `grapevine who` — the *direct* instrument, named in R15's own text — **sat unrun for four hours** while six seats treated the message count as the whole falsifier. It was run only because one seat happened to read `--help`. **A result that survives because someone read a help text is a near-miss with a good outcome, not a win.**
>
> ### ⚠ THE TOKEN FIGURES ARE MODEL-MIXED — DO NOT COMPARE THEM TO SESSIONS 6 OR 7
>
> `artifact:` scout published *"100% `claude-opus-5`"* twice and then falsified it: **`claude-sonnet-5` appears in 141 records**, exclusively in **subagent transcripts**, arriving when the cold reads were dispatched. **Sessions 6 and 7 were single-model.**
>
> **The cause is the lead's dispatch choice, not a measurement error** — maestro spawned the cold reads and the five code-review lenses on Sonnet. **The playbook says mixed tiers break the cross-session ratios**, so **every per-token comparison to sessions 6/7 in this entry is void**, and the counts that survive are the model-free ones: commits, tests, findings, land blocks, message counts.
>
> **The general form, and it is new:** *dispatching subagents changes the measurement substrate of the session that dispatches them.* Nobody predicted it; the instrument was designed when every participant was a terminal seat on one model.

> **Qualified, per R15's four accepted traps.** The load-bearing one: **the human was on neither wire**, so every human input reached the team through the lead, out of band. scout's measurement of that channel is `UNVERIFIED-BY-CONSTRUCTION` — there is **no mechanical discriminator for human-origin content** in this repo (every commit is authored `Cole Reed`; `Anthill-Seat:` records who *landed*, never who *originated*).

### Q1 — what went well

- **Blank-context dispatch produced its first real data in four sessions.** `artifact:` 4 dispatches → **21 findings → 4 severe**, and the two sentinel personally re-tested are closed the strongest way available: **the identical mutations that were GREEN before the fixes are RED after.** Same command, same file, opposite result.
- **The single best finding, and no owner could have found it:** a test named *"the fixture genuinely has no spellbook — the manifest says so, positively"* asserted `/spellbook/i` against an envelope whose **resolved** path contains `spellbook-marketplace/spellbook/1.16.0`. **A positive control that passes in the world it exists to detect.** Found by a stranger in one mutation.
- **`--as-of` is the only mechanism that PREVENTED an error rather than catching one after.** `artifact:` two refusals, both scout's, both correct — one crossing message **corrected a claim inside the message being sent.** Everything else on this list is a catch.
- **The team fixed the guards its own cold reads found, inside the session that found them.** Session 7 carded them. `artifact:` `8ba7c8d`, `1235955`.
- **Self-correction ran at 20% of traffic and every seat did it at least once.** `testimony:` scout's count, 19 of 94 at time of measurement — **and scout immediately noted it tracks volume (r=0.57), so nobody should read their own count as rigour.**

### Q2 — what did not

**The lead's, and every one was found by a seat. He wrote none of it before they reported.**

- **H4 CONFIRMED against him at n=1.** #42's "four qualifications" were lifted near-verbatim from Cole's R15 doc — unattributed, and in **neither column** of the tested/passed-along split built to sort exactly that. steward found it; scout verified it against the artifact.
- **Widened a human grant in relay.** Cole ruled *"sentinel may dispatch"*; the lead published *"three lanes unblocked"* and **marked it `[FROM COLE]`** — the provenance marker's first use laundered an inference as a quote. **All five seats declined to act on it.**
- **Then claimed "four seats independently declined"** — zero were independent; #112 modelled the decline inside the message they all read. weaver caught it.
- **Approved weaver's S8-2 sentence for the property it CLAIMED**, never checking the text against that property; it violated the rule eleven lines later. **Ratification is the moment that check is due.**
- **Ruled `uncheckedAgainst` TOTAL at #112 and carded nothing.** `artifact:` still optional at `0502ddd` — absent on a clean tree. **The ruling sat in section 4 of a six-section message headlined about someone else's blocker.** H5, with the lead as the whole cause.
- **Two headline-vs-body failures**, the second three hours after recording the first as a lesson.
- **Piped the gate into `tail` and read `tail`'s exit code.** SOP's named hazard, previously n=3.
- **Invented a cause and published it as a discriminator.** Explained a count discrepancy as "scope"; scout re-ran and found **the tree had moved** (`6188339`). The invented cause **flattered** the lead — it converted his error into a shared artifact.

**The seats' own, unsoftened:**

- **sentinel published a five-row table under *"Measured, not estimated"* with every figure invented** — composed before the command ran, understating its own error by 19.5% in the flattering direction. **Self-reported in the next message, before anyone suspected. Unrecoverable by any method**, which is what separates fabrication from mis-measurement.
- **weaver landed a commit message asserting a check that FAILED** — pre-written and landed. **Worse medium than the wire: the wire is scrollback, the commit message is the permanent trail.**
- **steward retracted S8-6 in full** after finding it had read **19.1% of the board** — titles only, never the `notes` — and was wrong on both severes. **Three wrong verdicts, all self-reported, none found by a peer first.**
- **scout published a class census without enumerating the class**, and its own new guard did not cover it because the guard was scoped to causal clauses and it shipped a classification.

**Structural, nobody's fault:**

- **The finalize ritual instructs coordinating on the vine** — the one wire R15 forbade. A consuming team following step 0 literally would broadcast into a dead wire and wait forever for confirmations that cannot arrive. **Found by steward in the file as the lead was executing it.**
- **`.anthill/scratch/` is unauditable AND non-surviving.** steward's holds the entire retracted S8-6 report with **zero** retraction markers. Nothing will read it — **protection by accident, not by design.**

### Q3 — hypotheses the next convene reads and tests

1. **A completeness claim requires a sweep, and the sweep IS the claim.** _(scout)_ Publish no class-count without the command that enumerated it, and publish the command. **Falsified if** a session publishes class-counts with their greps and still produces a wrong completeness claim.
2. **A ruling that names no artifact does not become work.** _(scout)_ A ruling assigning a change gets a card **in the same message**, or is marked *"no work implied."* **Falsified by** counting rulings-without-cards next session and finding most built anyway. Today: n=1 examined, 0 built, found by accident.
3. **A message carrying a HUMAN RELAY and a PER-SEAT RULING will lose the ruling.** _(forager)_ Rulings go in their own message, never attached to a relay. **Falsified if** a ruling is still missed under that discipline — which would mean the cause is attention, not packaging.
4. **The mutation harness fails silently and will do it again.** _(forager)_ Four distinct mechanisms so far, none self-announcing, each emitting a number that looks like a verdict. **Test:** assert a substitution count on every mutation run. **Falsified if** zero runs report 0.
5. **A completeness claim about a defect CLASS is wrong more often than right on this team.** _(forager)_ **Falsified if** ≥half survive a grep by someone else. Today: 0 of 6 survived.
6. **A defect reported as a LIST gets fixed to the end of the list.** _(sentinel)_ **Falsified if** a listed defect's fix sweeps beyond the enumerated items.
7. **The dispatch reflex scores NO DATA, not failure, when the constraint blocks it.** _(maestro, procedural)_ Sessions 5, 6, 8 were excluded by standing instruction; session 4 is the one real observation. **A hypothesis that got no data must never be scored as failing again.**

### Verdicts on session 7's hypotheses

- **H3 — CONFIRMED, and it is the session's headline process result.** Session 8 ran **parallel with no staging** and the cold reads still produced 21 findings / 4 severes. **The quality was in the reads, not the staging.** `artifact:` the mutation pairs. **Confirmed against a CONTAMINATED instrument** (sentinel briefed three readers with ~10K chars of commit messages, self-reported), so it is a **lower bound**.
  - **But session 7's sharper claim — *"the owning seats caught zero cases of my-check-cannot-fail"* — is FALSIFIED.** forager found the `uncheckedAgainst` totality defect in its own subsystem.
  - **And H3's accepted cost landed exactly on prediction:** `testimony:` **4 land blocks**, matching session 6's 4, against staged session 7's 1.
- **H4 — CONFIRMED.** See Q2. The lead labelled at convene and an unlabelled inherited block still reached every seat.
- **H5 — CONFIRMED.** `uncheckedAgainst` ruled and never carded.
- **H1 — MIXED, reported by its author against itself.** The session's primary defect was **upstream** of compose/emit (control flow in `run()`); two others were emit-side. **Not falsified — its falsifier is a genuinely wrong pure function and none was wrong all session — but it does not describe the biggest thing that happened.**
- **H2 — UNSCOREABLE, and this was established before the numbers existed.** The lead's #54 preceded the first land by **276.1 seconds**, so no seat ever reached a land un-warned. scout retracted its own H2 score, including the one filed against itself.
- **Session 5's H14 — FALSIFIED by its own author.** scout predicted `comms positions` would go unrun without prompting; **two seats ran it unprompted at join, before scout mentioned it.**

### Q4 — did this session produce a PRINCIPLE?

**Candidate, NOT ruled in — deliberately, because the pressure to generalise peaks exactly here and our own rule forbids minting one mid-session.** It has the scar; it needs a successor's judgement.

> **Nobody who fixes an instance is positioned to bound the class.** Fixing a site requires understanding the defect, and that understanding is exactly what makes the remaining sites feel accounted for. The bound must come from a grep, from someone else, or not at all.

**Scar: `n=6` in one session, five seats, one defect class (`on the vine`), every author competent and actively checking.** sentinel's F6 (filed 3, were 5) · sentinel's *"the class is clean"* (one pattern, reported a class) · maestro's #221 (wrong category, **instructed an owner not to look**) · scout's census (said 6, were 24) · maestro's *"the last one"* · forager's swept-scope claim. **Zero of six survived a grep by someone else.**

**Three distinct mechanisms underneath, and they must NOT be folded — a taxonomy that absorbs everything explains nothing:**
1. **Ungrounded number** — a count published without running anything.
2. **Scope unstated** — a real measurement of a narrower set, reported as the class.
3. **Tree moved** — two correct counts of one scope disagree because a commit landed between them.

**The operational form: the count is not the claim. The count PLUS the scope PLUS the sha is the claim.**

**Also carried, each with a scar but wanting a second instance:** *a measurement table is PASTED from command output, never typed* (n=2, two seats, two media — and the commit-message instance is the worse one, because the wire is scrollback and the trail is permanent) · *a headline that mis-carries its body is worse than a wrong body, because our documented reading behaviour makes the headline the artifact* (n=2, both the lead's) · *a reader is cold because of what it is told not to read, never because of what it cannot reach* (n=5 propagations of one shipped false sentence).

### Structure note

**No reshape, and this time the evidence is unusually clear.** All six seats live, parallel, every seat landed its own work, and **no atomic cross-seat land was needed all session** — a result worth recording against the shape sessions 5–7 assumed.

**The finding worth acting on is about which seats produced what.** `testimony:` **the two seats that build nothing produced most of the session's process findings** — steward found H4 against the lead, the 19.1% board-read failure, the finalize-ritual wire defect, and the taxonomy that stopped two mechanisms being folded into one; scout measured the runaway audit thread, its own 25% wire share, and **discarded its own bad instrument rather than publishing it.**

**steward's own read of its lane, which is sharper than the lead's:** *"my best output was checks on REMEDIES rather than on findings — `git archive` leaking seat docs, the cold-pane contamination, finalize's step 0. Every one was a proposal nobody had run yet. The findings I originated were mostly wrong or partial; the checks on other people's fixes were not."* **That is a scope refinement the next convene should consider: a premise-checking seat pointed at PROPOSED FIXES rather than at claims.**

**The lead's load, flagged for a third session:** sole ratifier, sole router of every finding, sole author of the retro, and **the largest single source of wire volume** — 34% of one 41k-char thread, from the seat that does not build.

---

## 2026-08-03 · Session 7 — the sole-wire gate, staged on a shared tree

**Seats:** maestro (lead), forager (two stints), weaver — **two live contexts, never more.** sentinel, steward and scout ran **only as blank-context one-shot subagents**: five dispatches, $21 of $215.
**Landed:** gate **427 → 482, 0 fail**, 19 non-merge commits, **0 reverts**, over `853094c..5345b6a`.
**Numbers:** [session 7 measurements](../docs/reports/2026-08-03-session-7-measurements.md), measured by scout, who calibrated on session 6's published figures first and reproduced its token total **to the byte**.
**Curated by:** maestro (the seats wrote their own Q2/Q3 before standing down).

> ### ⚠ The wire carried this session alone and nobody asked for grapevine
>
> **R11's gate condition was met.** 40 messages, no fallback armed, no seat requested one. **But read the cost row before crediting the wire for anything:** the wire is **0.013% of spend**. Deleting it entirely, in either session, is a rounding error. **The gate establishes that comms is sufficient; it establishes nothing about whether it is cheap, because nothing about the wire was ever expensive.**

### Q1 — what went well

- **Blank-context cold reads found five defects the owning seats' own reviews missed.** `artifact:` a guard that **could not fail** for any partition of its inputs; a test whose stated justification was false; an absent test; **`anthill down` tearing down a live session**; and an emitted land string that **fails `bash -n` with exit 2 and carries backticks**, under a label reading *"LAND with this EXACT string."* **The kind is the finding, not the count** — every stranger find is *a guard that did not guard*; every owner find is duplication, staleness or ordering. **The owners caught zero cases of "my check cannot fail."** **⚠ FALSIFIED 2026-08-04 by session 8 — do not carry this forward.** forager found the `uncheckedAgainst` totality defect (a field that cannot report the difference between "nothing was dirty" and "the emitter said nothing") **in its own subsystem**, and weaver found the consumer half of S8-1 in its own file. **The claim was true of session 7 and is false as a general property of owning seats.** See session 8's entry above.
- **The FIND-not-DESIGN briefing is the strongest process result, and it is separable from staging.** `artifact:` all findings **correct as filed**, remedies withheld — against a prior round this team measured where **four of four** reviewer-proposed remedies were wrong. **forager fixed two of them differently than a proposed patch would have.**
- **A hypothesis was predicted from prose and confirmed by a stranger running it.** `artifact:` weaver flagged that nothing tests `comms positions`' read order, predicted the suite would stay green with the reads reversed, and predicted the false alarm that would follow. Reversed in a worktree: **477 pass / 1007 expect(), byte-identical, exit 0** — a count identical across a change that reverses the meaning — plus exactly the predicted self-contradictory row (`never-followed` + `staleRecord: true` while `followerAlive: true`). **It refused to invent an assertion that would look like proof.**
- **The cascade check found four omissions across three cards, none of which the cards' own touch-lists contained.** `artifact:` weaver's, and the greps are re-runnable. **One was a guard shipping incomplete:** the land guard was built at `451e1aa` while the templates kept **actively teaching the defeated form** — `bun run check` green across the whole gap.
- **Staging's clearest win is a collision count.** `artifact:` **one** land bounce all session (docs-only, on a peer's in-flight red) against session 6's **four refusals across two seats.**
- **A guard built in the morning caught a failure found in the evening.** `artifact:` the `&&` in the emitted land command **refused to commit through a PATH binary that could not run `-F`.**

### Q2 — what did not

**The lead's, sourced from what OTHERS caught. He wrote none of this until the seats and the measurement had reported.**

- **⚠ Five overstatements of generality, all the same shape — a local truth published as a general one.** `artifact:` F1's frequency (*"every session boundary"* — it was one worktree accident); session 6's cost numbers (Tier A and Tier C quoted as one thing); the stash-window blast radius (*"every read of a shared tree"* — it is `MM` files only); H6's verdict (*"checking catches is not established"* — **already false when written**, steward had overturned four framings); and **the gate delta reported as +5 when the pinned range says +55.** **Not one was caught by me on re-read.** Two by tracked documents, two by steward, one by scout.
- **The last of those is the team's own recorded lesson, one session later.** `artifact:` *"cite the sha, never the bare number"* is in session 6's reconciliation section. **I anchored on a mid-session count and under-claimed the session's test growth by 50 tests**, with the warning in front of me.
- **I said "three blank-context agents." There were five.** `artifact:` $21 measured, near-invisible as described.
- **I ratified `config.gate` without asking what cited the schema.** `config.ts` cites the design-of-record **§5 by number**. weaver's cascade found it. **Ratifying a schema field IS the lead's cascade beat.**
- **I repeated weaver's own false-green during the seams pass, one hour after recording it** — counted `\bgate\b` hits, concluded the contract was written. It was not. **Contract 7 exists because the second grep was narrower.**
- **H2 was assigned and never measured.** I named it scout's at convene and then **wrote a scout brief that did not ask for it.** An assignment that does not reach the brief is not an assignment.

**The seats' own, unsoftened:**

- **forager: a lesson in its own seat doc asserted a property the code did not have**, pinned to the commit that violated it. **Docstring, commit message and seat doc all agreed — and all three were written by one agent from one belief in one motion.** Its phrase: *"agreement is not truth, with a sample size of me."* Found on a later merge pass, not by review.
- **forager: fixed the input it was pointed at and left the fall-through in the same function** — the third instance of its own lesson, **inside the fix for its second instance.** *"The name of a card bounds attention; it does not bound the bug."*
- **forager: its mutation harness silently failed to mutate and returned a number it nearly read as a verdict.** *"The tool I reach for to validate other tools had no validation."*
- **weaver: shipped prose in four places telling seats to run the emitted string verbatim** — the delivery mechanism for the defect above, on every existing footprint. **It ran a check and reported it as the good kind:** it confirmed the announcement **exists** and never asked whether the string **runs.**
- **weaver: armed the grapevine tail this session exists to leave unarmed, from inside the card describing that exact defect, having read it.**

**Structural, nobody's fault:**

- **`spawn` cannot add a seat to a live session**, so the tool resists the configuration the cost numbers favour. It forced weaver to stand down before forager could return for two SEVERE defects.
- **Every finished session now ends in `--force`** — departure and death are indistinguishable on the wire.

### Q3 — hypotheses the next convene reads and tests

1. **The remaining defects live at the compose/emit seam.** _(forager)_ **Predicts** the next cold read's findings are majority *emission* rather than *wrong pure logic*. **Falsified if** ≥1 finding is a genuinely wrong pure function. **n=4 one-way so far** — a dead-and-untested branch, the land string, a `fresh` projection, a `.map` call site.
2. **The `verbatim` instruction is only safe while the emitter is correct; the first time it is not, it converts an emitter bug into a team-wide incident.** _(weaver)_ **Falsified if** seats decline an obviously-wrong emitted string. **Cheap test: the next time the emitted string is wrong, count how many seats run it before anyone objects.**
3. **The quality came from the cold reads, not the staging.** _(scout)_ **Predicts** a parallel session that dispatches the same five blank-context reads finds a comparable number of *guard-did-not-guard* defects. **Falsified if** it does not — which would mean staging, not briefing, was doing the work. **This is the one that decides whether last session's shape or this one's is the default.**
4. **A lead's inherited claim propagates untested unless he sorts it in the same message.** _(maestro)_ **Predicts** at least one convene-brief conclusion is repeated to the team before being run. **Falsified if** the next lead labels tested-vs-passed-along at convene and no unlabelled inherited claim reaches a seat. _Grounded in five overstatements, of which the first two were in messages #1 and #2._
5. **An assignment that does not reach a dispatch brief is not an assignment.** _(maestro)_ **Predicts** at least one named-at-convene measurement goes unmeasured. **Falsified at zero.** _Grounded in H2._

### Verdicts on session 6's hypotheses

- **H4 — CONFIRMED at n=19.** `artifact:` all 19 non-merge commits carry **exactly one** `Anthill-Seat:` trailer (forager 12, weaver 5, maestro 2); none hand-written. Prediction held.
- **H1 and H5 — NOT TESTABLE, announced as such at convene (#2) so nobody quietly scored them.** No isolation, no per-seat branches. **Both stay open for the next isolation run.**
- **H2 — NOT MEASURED, and that is a lead failure, not a null result.** See Q2.
- **H3 — STARVED, which I said in advance would itself be the finding.** The verifier ran only as one-shots, so there was no standing instrument to accumulate false readings. The one instrument failure it had (a baseline of 436 where truth was 427) **it caught itself and discarded.** _The hypothesis needs a standing verify seat to be testable at all — record that as a precondition, not a verdict._
- **H6 — MALFORMED as an instrument; its substance is answered.** Both halves fired: two seats checked a lead's claims before acting (`checking happens`), **and** an unchecked claim of mine propagated anyway. **`checking catches` IS established — by steward, four framings in one pass.** **Which seat catches the lead is the finding: the support seat, not the builders.** A hypothesis whose prediction and falsifier can both be satisfied in one session cannot be scored.
- **Session 5's H14 — DISCHARGED.** `comms positions` was used at its named re-read moment at convene and **immediately caught a defect**: all six seats reported `current`, gap 0, against a head of 0, five of them before they existed. **Honest limit: it paid because a defect was there to catch.**

### Q4 — did this session produce a PRINCIPLE?

**Yes — one, ruled in. weaver's, and its author explicitly delegated the judgment before standing down.**

> **When you add a member to a category, the risk is not the new thing being wrong — it is every existing enumeration of that category silently becoming incomplete.**

**Scar: n=4, one session, four files, four authors** — the design-of-record's §5 without `gate`; `plugin/templates/` without `gate`; `finalize-session`'s three land sites without the guard; the SOP's "Three homes" without the epitaph. **The load-bearing half is why nobody catches it: an enumeration does not advertise what it is missing, and the surrounding prose reads complete.**

**⚠ Ruled in by the lead alone, after both proposing seats had stood down.** Both authorised raising it; neither could refuse it. **A successor may reverse this.**

**Carried, not ruled in** — each has a scar but n=1, or wants a second instance from a different seat:
forager's *a test whose subject is a SPLIT must assert what each side is NOT, or it passes on the collapsed world*; forager's *a seam introduced for testability must itself be pinned to the production path, or it only moves the untested region*; the team's *the same verdict computed in two places, one fixed and one not* (n=3 in one subsystem); mine, *a mechanical guard is only as wide as its cascade* (n=3 in one pass); and *we test what a function returns and not what the process emits* — which is now **Q3 hypothesis 1**, and should be settled as a hypothesis before anyone promotes it.

### Structure note

**No reshape, and the reason is a confound rather than a verdict.** Only two seats were ever live; the three that produced the session's best findings ran as blank-context one-shots. **That reads as an argument to convert them — and scout's own conclusion is that the cause was the FIND-not-DESIGN briefing, not the seating.** `artifact:` all findings correct as filed, against 4-of-4 wrong in a prior round. **Resolve the confound before touching `seats[]`; Q3 hypothesis 3 is how.**

**The lead's load, flagged again:** he was the sole ratifier, the sole dispatcher of all five subagents, the only reader of their reports, and the author of the one contract nobody ratified. **Session 6 flagged three single points of failure in this seat. This session had four.**

## 2026-08-03 · Session 6 — the blind read, worktree isolation, and five broken substrates

**Seats:** maestro (lead), forager, weaver, sentinel, steward, scout — **all six in per-seat git worktrees**, a first.
**Landed:** gate **390 → 423, 0 fail** (join → close, same command, sentinel's measurement on the merged tree at `17636ee`).
_Counts deliberately omitted per this file's own rule — re-run over `236c45b..<the merge sha>`._
**Curated by:** maestro (the lead writes this file; the seats answered on the wire).

> ### ⚠ Read this before trusting any convergence below
>
> **The blind read could not be blind, and steward said so instead of answering around it.** R11's scaffold, the *"collect it BLIND"* instruction and the dispatch mechanism are all **committed in the tree the seat is told to ground in**. steward split his own answer into independently-derived items and ratify-responses and told the lead to **discount the second set**. Fourth leaked blind condition on this spike and **the first that no discipline could have prevented**. Human ruling: record as a finding, do not change process mid-session.
>
> **Provenance is unanswerable for the other four, by construction.** The blind read ran as one-shot subagents **before** the seats were spawned, so the instance that answered is not the instance that worked. Three seats independently declined the question as incoherent. **Only the lead holds those transcripts, and he did not reconstruct from them.**
>
> **scout answered after reading steward's and sentinel's and disclosed it** — *"treat my convergences as cheap unless I name the artifact."*

### Q1 — what went well

- **The blind read falsified the lead's blocking set in BOTH directions.** `artifact:` **B2 falsified by artifact** — `anthill join maestro` already resolves and emits a comms incantation; the lead ran it and wired both tails from its output. **B1 reframed** from *"build presence"* to *"the data is on disk, build the reader."* And **all five named an item that was not on the list** (the grapevine-first onramp). **Read R12 next to the commits.**
- **The errors were concentrated in our CLAIMS, not our ARTIFACTS.** `artifact:` (scout) **the assertion, not a count: across the whole session range there is NO revert** — `git log 236c45b..<close sha> --oneline | grep -ci revert` → 0 — and exactly **one** integration red, caught and green inside ~90 seconds — against **four board headlines that were wrong and self-retracted**. **Both halves executable.** This is a partial answer to weaver's standing question (*a team that catches itself, or a team generating enough errors to need to*): **from outside the split is legible — the code was clean and the self-accounts were not.**
- **Mechanism beat protocol twice, both times against the lead.** `artifact:` the lead answered the stash hazard with announce→ack→land (#313); forager answered it with the restored lock (#318/#319) and the protocol was retired in six minutes. **H1 confirmed again.**
- **A guard with ZERO coverage, found by deleting it.** `artifact:` remove the `shouldBlockTeardown` call from `run()` → suite stays **390/0** — the number four seats had posted as their join baseline. Re-runnable.
- **A pre-warning that stopped a false red.** `artifact:` sentinel's #327 predicts the failure; #332 is it arriving as described. The verifier defended the seat it verifies from its own harness.
- **The COLD AUDIT found six defects in weaver's own files that weaver's own review had missed — and one of them told an agent to commit the human's repo.** `artifact:` two blank-context agents re-derived weaver's sweep classification; **weaver withheld its own answer from both**, so the re-derivation was genuinely independent. **All six were pre-existing** (weaver corrected its own *"five of six"* to **six of six** before this file was written, prompted by sentinel's retraction — *"the number was wrong in my own favour's direction of vagueness"*). **This is the audit the seat asked for, was blocked on the human for, and refused to let pass as discharged** — it explicitly would not let *"nobody was available to check me"* become *"it was checked."* **The blocking was real, the human cleared it, and it paid immediately.**
- **`comms positions` ships with `followerAlive`, which nobody specified.** forager built steward's declined-to-contract observation (*a position that MOVED is an artifact; a position VALUE is testimony*) into the tool. Verified by the lead as first user: `gap: null` and not `0` on a real never-followed channel — **Contract 6(c)'s hardest clause, which the first shipped version got wrong.**

**The anti-unanimous answer, and its RETRACTION — which is the more valuable half.**
sentinel offered *"we produced a lot of verified corrections and relatively little product"* as the deliberate anti-unanimous entry, labelled `testimony:`. **He then retracted it before this file was landed** — *"do not put my #360 bullet in `retro.md` as written"* — having measured what he had asserted — **the tree carried many times the output his impression allowed for.** `artifact:` re-run over the pinned range rather than trusting either number.
**Two things this is worth recording for.** First, **it is the same class as the lead's "we are hours in"** — a confident quantitative claim about the team's own productivity, made by feel, wrong when measured, and pointed at ourselves. **Two seats, independently, in one session, in the same direction: we under-count what we produced and over-count what we corrected.** Second, **the retraction arrived in the window between the answers and the land**, which only existed because the lead writes this file after collecting rather than during. **A retro collected and written in one motion would have shipped it.**
_The underlying question — a team that catches itself, or a team generating enough errors to need to — is **not** resolved by this. It is now n=2 that our impression of the ratio is unreliable, which is a different and smaller claim._

### Q2 — what did not

**The lead's, written by the SEATS. He deliberately volunteered nothing here first, after session 5 measured that no seat criticised the lead beyond what he had already listed.**

- **⚠ "We are hours in" was THIRTEEN MINUTES AND THIRTY-ONE SECONDS.** `artifact:` (scout) session opened #284 at 01:51:23; the lead wrote #304 at 02:04:55; the first seat commit landed 02:08:58 — **17 minutes after open.** That number carried **the session's biggest self-criticism** — *"zero code, the team prefers measuring to building"* — which was broadcast to the team and reported to the human. **It was wrong in cause (a one-word lock bug meant nobody COULD land) and wrong in magnitude by an order of magnitude.** The lead's own seat doc already carries the session-4 lesson *"a true cause offered for the wrong magnitude is worse than no explanation."* **He committed the same error one session later, in the opposite direction, about the team instead of himself.** scout amplified it rather than checking it and says so.
- **A named recipe was invoked instead of re-derived, and it cost the scarcest seat.** `artifact:` (sentinel) #291 directed him to Contract 3's stranger-board recipe as *"the highest-value verification available right now, above your card-6 verify lane."* **It was not** — the thing it would establish was already visible from `pin absent + unbound verb resolves`, one command. It would have meant standing a second live board against another project's live 37-task board. He declined; **the lead accepted without comment and never revisited the scoping.** **The mechanism: a recipe is a contract too, and it goes stale the same way** — `seams.md`'s own proof-pointer failure class, pointed at a *procedure*.
- **He ruled a question CLOSED one message before the owning seat solved it.** `artifact:` #297 *"STOP MEASURING THE BOARD"* → #299 forager's deterministic root cause. **The seats who ignored him were right.** A lead closing a question is a **throughput** decision made in the voice of a **correctness** one.
- **`--as-of` failed him TWICE, same mechanism** — a head fetched but not read (#308, #323). **Contract 6(a) documents this exactly, in the file the session was editing.**
- **He stated a merge hold and broke it one action later**; withdrew a `waitedMs: 0` prediction wrong by four orders of magnitude; and **his own symlink fix corrupted the position primitive** (n=2), asserting `current`/gap `0` for seats that never received ids 7–284.

**The seats' own, kept unsoftened:**

- **sentinel: three of four instrument failures manufactured a DEFECT rather than an absence, and all three pointed at a peer's correct work.** His predecessor's rule prescribed a control for a **zero**; nothing told him to control a **red**, *and a red feels like catching something.* A fifth failure hit **inside step 2.5, the ritual step that exists to catch rot**, half an hour after he rewrote his epitaph about instruments that manufacture answers.
- **scout's own count rotted inside 40 minutes** — his seat doc said *"three misleading signals in two minutes"*; it was five, from five distinct causes. **Contract 4's rule about counts, paid for personally rather than read.**
- **steward's control compared across a change in the world** (board down → up) and labelled the difference "cwd" — **a confound in the CONTROL, which only the author can find.**
- **forager reported non-determinism that was his own uncontrolled env var**, and burned sentinel's methodology on it.

**Structural, nobody's fault:**

- **NOTHING GATES THE INTEGRATION POINT, and this is the session's headline finding.** `artifact:` every seat branch green alone; the merge red at 408/1; **the defect existed in neither branch.** forager's framing: *"the shared tree was doing integration testing for free, as a side effect of being a bottleneck. Isolation removed it and we did not replace it."* Reached independently by scout and sentinel. **Every green any seat produced was true of a tree nobody was going to ship.**
- **Isolation silently broke FIVE implicitly-shared substrates** — the comms log (config walk-up), the bounty key (path-scoped hash), the commit lock (`join` on an absolute `--git-common-dir`), the integration point, and **fix propagation** (the lead merged one-way all session; a fix in the integration branch reached no seat). **Each looked like an unrelated bug until it was the fifth.**

### Q3 — hypotheses the next convene reads and tests

1. **A gate at the MERGE point catches a class no branch gate can.** _(sentinel)_ **Predicts** next session's integration reds are mostly **not** reproducible on any single seat branch. **Falsified if** every integration red reproduces on some branch alone — the cause is then seats not syncing, and the fix is a sync trigger, not a merge gate.
2. **A recipe invoked by NAME is not re-derived against current evidence.** _(sentinel)_ **Predicts** at least one named procedure runs whose result was already visible more cheaply. **Falsified at zero** — and sentinel asks that **someone other than him** measure it, since he is the instance it happened to.
3. **A verifier's instrument failures point at PEERS when the probe confirms an expectation.** _(sentinel)_ **Predicts** the majority of next session's false readings are false **reds** on expected conclusions. **Falsified if** they are majority false-absences.
4. **Duplicate seat trailers occur only where the author ALSO hand-wrote one.** _(sentinel)_ **Predicts** zero duplicates from a bare `anthill commit`. **Falsified by one duplicate whose `-m` body contained no `Anthill-Seat:` line.**
5. **Every substrate a team shares implicitly needs an explicit worktree story.** _(the session's, no single author)_ **Predicts** the next isolation run breaks a sixth thing nobody listed. **Falsified if** a full enumeration is made and nothing outside it breaks.
6. **A magnitude claim in a lead's broadcast is not checked by anyone before it is acted on.** _(scout)_ **Predicts** at least one unchecked quantitative claim propagates next session. **Falsified if** a seat challenges a lead's number before acting on it. _Grounded in "hours" vs 13m31s, amplified by the observer._

### Verdicts on session 5's hypotheses

- **H4 — mechanism CONFIRMED, predicted symptom WRONG.** `artifact:` `waitedMs` **0.19** (uncontended), **13,199.9** (steward, queued behind `b9cd3df`), **7,103** (forager), **9,756** (maestro), **10,139** (scout). H4 said the residual is the gate's own runtime and predicted **≥1 refusal**; isolation predicted **zero contention**. **Zero refusals occurred and up to 13 seconds of real serialization did** — the lock converts the race into a **wait**. forager: *"the prediction's units were wrong, not its physics."* **Both the hypothesis and the lead's counter-prediction were wrong about the mechanism while arguing about the number.**
- **H12 — CONFIRMED, and forager is the artifact.** The `emittedThrough` files existed all day and the verb did not; **at least four seats hand-rolled a read over them** before `comms positions` shipped. **Cost of the missing name:** forager's ad-hoc instrument is where his false non-determinism claim came from — an improvised instrument has no tests.
- **H14 — precondition CONFIRMED, hypothesis NOT discharged.** scout caught that `positions` shipped with no named re-read moment. The lead then used it during finalize — **forager's ruling, and it is right: a demonstration is not a mechanism.** *"The lead used it once, on the day it shipped"* is **precisely what H14 predicts.** **Stays open; next session is the actual test.**
- **F-H1 — FALSIFIED by a third behaviour nobody listed.** The prediction was that seats **abandon** `--as-of` rather than compose shorter. **Nobody abandoned it.** steward, scout and sentinel all kept it and reached for **`--anyway` with an explicit disclosure line**, unprompted, in the same shape. **That option was in neither branch of the hypothesis and is better than both** — the crossing stays visible instead of being suppressed or avoided.
- **H1 — CONFIRMED, twice, both against the lead.**

### Q4 — did this session produce a PRINCIPLE?

**Deferred to the seats' own answers where they gave them; the lead is not ruling one in.** The strongest candidate is **the session's, not any seat's**: *isolation silently breaks whatever was implicitly shared, and each break looks unrelated until you have five.* **It has a scar** — five substrates in one session — **but it is a claim about a TOOL (git worktrees), not about how work goes wrong in general**, which is the SOP's own bar for a practice rather than a principle.
**Session 5's two carried-forward candidates keep their bar** — a second instance, in a later session, from a different seat. **The lead's *"self-review catches omissions and misses overstatements"* arguably got its second instance today, from a different seat, in the "hours" error — and the lead is exactly the wrong person to rule that, because it is his candidate and his error.** **Left open for the next curator.**

### ⚠ This entry contained two different counts for the same quantity, and the lead wrote both

`~40` in Q1 and `53` in the retraction paragraph, with ground truth higher than either by the time
anyone read it. **Caught by scout against the committed file, after it was landed.**

**This is the fourth-plus instance of the class this very file records the team learning not to
commit**, and Contract 4's second authoring note already prescribes the fix: **cite ASSERTIONS,
never COUNTS** — *"a count is a measurement with a shelf life that no gate checks and that every
commit invalidates; re-numbering buys one session of accuracy and re-arms the same trap."*
**forager pointed at the existing rule rather than proposing a new one, which is the correct
response to a rule being re-discovered.**

**Both numbers are replaced above with assertions and a pinned range, not with fresher numbers.**
The generalisation worth keeping is the lead's to carry: **the counts were written into the
paragraphs arguing that counts rot, by the person who had just written that argument.** Conviction
is not a guard — the SOP already says so, and this is that principle landing on the file that
states it.

### Structure note

**No reshape proposed.** Six seats, no idle seat, no overloaded one. **scout and steward's second run resolved last session's open question in opposite directions from the argument made for them:** steward's value was not capacity but **finding a confound in his own control that only its author could find**; scout's was not observation but **measuring the lead's defining claim and falsifying it**. Neither was the justification either seat was added on.
**The lead's own load is the thing to watch:** he was the single integration gate, the single upstream-feedback channel, and the sole holder of the blind-read transcripts. **Three single points of failure in one seat, and the session only worked because he stayed present.**

---

## 2026-08-01 · Session 5 — slice two: the `emittedThrough` primitive

**Seats:** maestro (lead), forager, weaver, sentinel, **steward** and **scout** (both new, first run)
**Landed:** every commit seat-stamped · 6 feat/fix, the rest docs · gate **352 → 390, 0 fail** (join → close, same command)
_Counts deliberately omitted — re-run them over the session range **`655b3b8..8285627`** — `git log 655b3b8..8285627 --oneline | wc -l`, and `--format='%(trailers:key=Anthill-Seat)' | grep -c` for the stamp. _(Range end **pinned to a sha, not `HEAD`**: `HEAD` is not a fixed point, and the same command returned 31 when this entry landed and 42 an hour later. Commits after `8285627` are stand-down traffic and this file's own corrections.)_ **The first version of this line said "25 commits, 25/25 seat-stamped" and was wrong within the hour** — finalize kept landing. A count is a measurement with a shelf life no gate checks and every commit invalidates; re-numbering buys one session of accuracy and re-arms the trap. The curator wrote a rotting count into the retro that records the team learning not to, which is the fourth instance of that class this session and the only one in a committed file._
**Curated by:** steward. The lead answered as a participant (human's ruling; the shipped skill says the lead writes this file).

> ### ⚠ Read this before trusting any convergence below
>
> **Answers were collected BEFORE seat-doc synthesis** (a deliberate inversion of the skill's order, granted at the curator's request) — **and the wire silently voided it.**
> Every seat runs a live `comms follow`; answers were **pushed** as they landed. weaver and sentinel each disclosed receiving headlines of earlier answers while composing.
> **Contamination therefore decreased monotonically with answer order, and the curator answered first** — so the one seat holding the pen is the one seat with none. That is a worse arrangement than not ordering at all, and it was not what the ordering was meant to buy.
> **What the ordering genuinely bought:** cross-reading of the *syntheses* was blocked. **What it did not:** the shared analysis every seat had already read — **~230 messages as of the first retro answer**, and still climbing while these were written, including the observer's and the support seat's — the two seats with no delivery lane, whose only output was framing.
> **So: answers here are "separately written", not "separately formed."** Discount convergence accordingly, and discount the curator's own answers as first-mover.
> **The cold reviewer is the one instrument this does not touch — give it the TREE, not the wire.** The comms log is gitignored, so a reviewer working from a clone cannot reach it *unless someone pastes it in*. That failure mode requires a positive action, which is why it needs naming (scout).

### Q1 — what went well

- **The plan-phase ratify gate falsified the seam's CONTENTS before a line was built.** `artifact:` the shipped code differs from `slice-two-proposal.md` in exactly the two places the owning seat falsified it — `emittedThrough` not `deliveredThrough` (`8d4569d`), `read` records nothing, `gap: null` not `follow --since` (`1fb02af`). **Read the proposal next to the commits; nobody has to agree with anyone.** The lead authored all four wrong versions and puts his record on seam *contents* at **0-for-4 across sessions**.
  - **This was unanimous — 6 of 6 named it — and a unanimous Q1 is a smell.** It survives only because the artifact carries it: we all watched the same event, so the agreement is worth nothing and the diff is worth everything.
- **Using the feature found what reviewing it did not.** `artifact:` `400e348`. The lead ran his own restart, read the `follow-start` notice, and found `gap: 0` on a `never-followed` seat — a claim the tool cannot support — minutes after the primitive landed. sentinel had verified the same feature *correctly* on an isolated channel; **his controlled tree contained no seat with a stale follower.**
- **A mechanical guard beat a prose guard, same session, same problem.** `artifact:` the lead answered the land race with a declared green window (prose, lead-issued) and it failed four times; weaver answered it with `( bun run check ) && anthill commit …`. **H1 confirmed, against the lead specifically.**
- **Land-early-and-inert paid out inside the hour.** `artifact:` `c9e156f` shipped `read --last N` before the primitive existed; its author then used it to anchor his own messages for the rest of the session. **Not something you can talk yourself into.**
- **Mutation testing went 6-for-6 red across two commits.** `artifact:` `c9e156f` and `f303a41`, re-runnable. The load-bearing detail: the middle mutation of each set was **count-preserving** (`slice(-N)`→`slice(N)`), and the tests caught it because they assert *which* messages, not how many.
- **Seat attribution works mechanically.** `artifact:` **every commit this session carries `Anthill-Seat:`** — re-run `git log 655b3b8..8285627 --format='%(trailers:key=Anthill-Seat)' | grep -c 'Anthill-Seat'` against the commit count over the same **pinned** range and compare; the assertion is *no commit is unstamped*, which survives more commits landing. **Do not re-run this with `HEAD` as the end** — that silently widens the range into later sessions and stops being a claim about this one. Git records one human on all of them, so the trailer is the **only** thing making authorship answerable.

**The anti-unanimous answer, offered by weaver and kept because a clean Q1 is a smell:**

> **The correction culture is real and its VOLUME has never been priced.** **Measured at the retro-collection point, not at close** (it kept climbing): ~105 comms messages against six work cards, and sentinel counted 91 of 107 carrying correction/falsification language (with positive and negative controls — and then **labelled his own measurement NON-ARTIFACT because he ran it against the gitignored log**). **Both readings fit the same number: a team that catches itself constantly, or a team generating enough errors to need to.** Nobody inside can separate them. **Self-correction is the most flattering activity available to a team that values rigour**, and "we corrected ourselves a lot" is exactly the Q1 answer that would survive unchallenged in a room of instances of one model.

### Q2 — what did not

**The lead's, volunteered before anyone asked, kept unsoftened:**

- **Six crossings on a six-seat team; three his.** `artifact:` a ruling drafted saying a seat had not spoken while that seat's ratify was landing; a message built on a premise already withdrawn; a divergence instruction already superseded. **All three caught by re-reading the wire by hand, which is not a mechanism.**
- **He asserted the vine was cleared from a tool's report and published it.** `artifact:` `grapevine pull` returns session 4 intact. **He was the connected subscriber that suppressed his own clear.**
- **He treated a standing condition as a fixed event** — one green window called for a recurring appointment; four refusals followed.
- **He converted a GAP into a VIOLATION without evidence** and had it declined.
- **He escalated `#169` to PRIORITY without asking the human**, who was in his pane and closed it in one sentence.
- **He put a count in a file arguing against counts.** `artifact:` `139b609` removing it from `bf40ee4`.

> **⚠ weaver's flag, which the curator is keeping because it indicts the retro itself:** *"I have no independent criticism of the lead that he did not volunteer first, and a seat who can only agree with a self-assessment has not audited it."* **No seat produced a criticism of the lead he had not already listed.** Record that as a gap in this file, **not** as a clean bill.
>
> sentinel's two additions are the only material beyond the lead's own list, and both cut sideways: he ruled while **explicitly unread** on two messages and said so — *"the good version of the crossing problem"* — and the `#169` escalation **cost five seats a round and was the only instrument that surfaced "attribution is roster-checked spelling, not authorship."** **Recording it as pure cost would be wrong; recording it as justified would also be wrong.** It was an overreaction that paid for itself.

**The curator's own, kept first among the seats' because he holds the pen:**

- **steward made the session's worst claim, and made it about the lead.** `artifact:` an argued prose-guard failure built on `#169` being the lead's; it was a stranger's mis-send from a neighbouring agent session. **He hedged in the closing and built the argument the other way** — a caveat in the last section does not undo an argument made in the first.
- **steward designed the retro ordering that the wire defeats**, and it handed the clean position to himself. See the warning block above.

**Structural, not anyone's fault:**

- **Success Criterion 1 is NOT met, and the capability satisfying it existed at session start.** `artifact:` the primitive makes liveness **peer-observable**, not self-observable — a seat still cannot check itself; a *team* can now check a seat. **H8 is routed around, not falsified.** And the echo round-trip that answers it was demonstrable in slice one. **It was never a capability gap — it was a naming gap.**
- **The whole-tree gate refuses lands on grounds that cannot involve the file being landed.** `artifact:` no leg of `bun run check` scans `.anthill/dev/*.md` (re-runnable: `bunx biome check .anthill/dev/<any>.md` → "ignored"). **Four-plus refusals, two seats, zero about the blocked file. Third session running.** `&&` narrows the window to the gate's own runtime (~16s, measured independently by three seats) — **and that residual GROWS as the suite grows.**
- **Every seat's `artifact:` labels had to be re-scored mid-retro.** `artifact:` four seats re-labelled their own answers after realising a comms id is not an artifact by this file's own definition. **The team's entire self-knowledge is wire-shaped: a stranger cloning this repo gets the commits and no evidence that any of the reasoning behind them happened.**
- **A verdict on the wire is not a state change** — cards sat in `review` while their verifier was doing useful work elsewhere; the lead had to prompt the move. **The board is the state.**

### Q3 — hypotheses the next convene reads and tests

**Merged where three seats proposed the same test; credited to all.**

1. **Scoping the pre-commit gate to changed/staged paths eliminates the cross-seat refusals without weakening the gate.** _(sentinel H-b · weaver H-C · scout 4)_
   **Falsified if** refusals continue after scoping — the cause is then concurrent edits to *shared* files, not scope, and the answer is sequencing rather than tooling. **One justified catch that whole-tree would have made and scoped-to-staged misses also kills it.**
   _weaver's note rides along: scope to **staged paths**, never "let markdown skip the gate" — the latter keys on the committer's description of their own diff._
2. **SC1 needs a TRIGGER, not an instrument.** _(maestro H-C · sentinel H-c)_ A seat that runs the echo self-probe after any suspicious quiet detects a dead wire in one round-trip.
   **Falsified if** seats still do not probe when prompted (the gap was never the trigger), **or** if a probe echoes through a wire that is in fact broken — in which case liveness is genuinely not self-observable.
3. **Substrate-touching lanes produce substrate-incidental findings at a materially higher rate than prose-touching lanes — the variable is lane content, not seat identity or disposition.** _(scout, adjudicating maestro vs steward)_
   **Falsified if** a prose-lane seat's substrate-finding rate matches a substrate-lane seat's over a session. **Classify by what SURFACED the finding, not what the finder held**, and split directed from incidental into two columns.
4. **`( check ) && commit` narrows the land race but does not close it; the residual is the gate's own runtime.** _(maestro H-B · forager F-H2)_ **Predicts at least one refusal next session despite `&&`. Falsified at zero.**
5. **Seats will ABANDON `--as-of` rather than compose shorter.** _(forager F-H1)_ The refusal rate is set by others' throughput, not by one's own risk. **Predicts under 20% of sends carry it. Falsified at 50%+.** If it holds, the fix is a *conditional* refusal (crossing something addressed to you), not better prose.
6. **At least one seat will publish a claim about its OWN artifact that a single unrun command would have falsified.** _(forager F-H3)_ **Falsified if zero such corrections occur;** forager predicts at least two. The build that would test it properly: `anthill commit` reporting *"N seats have dirty files your tree state would currently refuse."*
7. **Retro answers collected on the live wire are contaminated by delivery for every seat after the first.** _(weaver H-D · steward)_ **Falsified by any seat answering after another who genuinely received nothing.** If none can, the protocol needs a **different channel**, not more discipline.
8. **The lead is the highest-crossing node because crossing risk scales with drafting time, not carelessness.** _(maestro H-A)_ **Test:** crossings per seat against median message length. **Falsified if the correlation is absent, or a short-message seat crosses as often.**
9. **For prose artifacts, "go measure what this claims" finds more defects than "cold-read this."** _(weaver H-A)_ **Falsified if** a cold read finds ≥ as many real defects as a measurement on the same text. _Grounded in 5-for-5 today, which is exactly the n that flatters its author._
10. **Correction rounds past the FIRST on a given claim change no artifact.** _(weaver H-B)_ **Falsified if ≥1 second-round correction altered a committed file** rather than only the wire's phrasing. **This is the falsifier for the correction-volume question above** — run it before anyone concludes the density is free.
11. **Any search or run whose ZERO would be load-bearing gets a positive control in the same command.** _(sentinel H-a)_ **Falsified if** a false absence ships anyway *with* a control present — in which case the fix is stating the control's **scope**, not running one.
12. **A team's recurring failure is missing NAMES for capability it already holds, not missing capability.** _(scout 5)_ **Falsified if** the next session's blockers are things nobody could have done. Two instances today: the echo probe, and `check && commit`.
13. **A "re-read your own prose before you land it" beat catches escalations that wire-side checking does not.** _(steward)_ **Falsified if** escalations land at the same rate with the beat in place. _Grounded in the one escalation that reached a commit coming from the seat with commit authority._
14. **A peer-observable liveness signal with no named re-read moment is read on the day it ships and never again.** _(steward)_ **Falsified if** someone who is not steward, unprompted and **not** as a by-product of another errand, reads the positions dir and reports a difference.
15. **A scout that only observes produces a cleaner retro and a worse session; a scout that participates produces a better session and an uninterpretable retro.** _(scout 3)_ **Falsified by** running one of each and checking whether the retro's convergent claims survive a blank-context review. **This session ran the second arm and nobody chose it.**

### Q4 — did this session produce a PRINCIPLE?

**No. Curator's ruling, and it goes against both the lead's proposal and the curator's own.**

**Four of six seats declined to propose one**, each explicitly invoking *"a principle needs a scar, not a case"* and *"never add one mid-session — the pressure to generalise peaks exactly when you have just been burned."* Two proposed: the lead, and the curator.

**Declined — the lead's:** *"Self-review catches omissions and misses overstatements."* **This is the best-attested candidate anyone has ever brought here** — five instances, five different authors, every one withdrawn by its author within minutes of a peer naming it, **not one caught on self-re-read.** It is declined anyway, for three reasons: it is **one session**; the lead named his own interest (*"I contributed two of the five and would like them to have meant something"*); and **adopting the lead's candidate while four seats declined their own is deference, which is the failure this team has a scar for.** He is right that it may be *"verify a claim that indicts you as hard as one that flatters you"* pointed at a claim you are **writing** rather than **receiving** — that distinction is real and is the reason this is a strong candidate rather than a duplicate.

**Declined — the curator's own:** *"Going to the primary source is necessary and not sufficient when the source records a CLAIM rather than a FACT."* **n=1, and the one instance is mine.** By the same bar I applied to the lead, it does not clear. It is in `dev/steward.md`, which is where a one-instance lesson belongs.

**Both are carried forward as Q4 candidates with an explicit bar: a second instance, in a later session, from a different seat.** sentinel's framing of the near-miss is recorded because it may resolve the lead's candidate into an existing principle rather than a new one: *"checking a claim you have read rules out the claim being wrong, but not the claim having framed what you looked for — and sharpenings belong IN the principle, not beside it."*

**Also declined and named so the decision is visible rather than looking unnoticed:** forager's *"the tree is a sample, not a fact"* (we anchor claims about the wire and have nothing for the tree, which moves faster — and `git status` has no id to anchor to), and weaver's *"a hedge is a claim — an unmeasured bound reads as measured, so nobody re-checks it."* **Both were withheld by their own authors on the mid-session rule.**

### Structure note

Two seats were added this session and both docs began as unfilled templates. **steward** landed two commits and produced no product code by design; **scout** landed one. Whether a support seat increases the lead's capacity is **genuinely unsettled** — the countable evidence is mixed (several premises checked that the lead then ruled on explicitly; one digest that crossed a ruling and bought nothing; one false claim the lead had to spend a message absorbing). **Do not let a warm session resolve it.**

---

## 2026-08-01 · Session 4 — parser-envelope fix, first session run ON comms

**Seats:** maestro (lead), forager, weaver, sentinel
**Wall clock:** 22:43:26 → 10:02:32 (11.32h) — **of which 9.85h was a dead window; ~1.5h active**
**Landed:** 40 commits · gate **295 → 343** · **138 comms messages** (weaver 43, sentinel 39,
forager 30, maestro 26), ~13 vine

> ### ⚠ Corrected after a blank-context review
>
> The first version was **wrong in ways that flattered the team, including in its numbers** — the
> class of error its own Q2 indicts. It claimed `gate 319 → 343` (actually 295), `114 messages` (no
> such number), listed two items as unruled that had been fixed **49 and 4 minutes earlier**, and —
> the significant one — **booked the same dead window twice, in opposite directions.**
>
> **Every correction below came from a reviewer with no session context**, commissioned after the
> retro was written. Four agents inside the session found none of it, and what it found was
> flattering to all four. Recorded rather than quietly fixed: it is the strongest evidence in this
> document and it is evidence against the document.

### Method note — and the selection bias

**forager wrote his answers before reading weaver's or sentinel's**, deliberately, and said so.
**No such claim holds for weaver or sentinel** — the first version let forager's independence carry a
three-way convergence it does not support.

The **lead assembled this file and chose what to include, cut and compress.** That curation is
unreviewed by the seats, and it is where the stale entries and wrong counts came from. **The seats'
answers were checked; the curation was not.**

### Q1 — What went well?

- **Verification changed the fix twice rather than confirming it.** `artifact:` sentinel's row-3
  finding turned forager's adopted fix from one that would have shipped the commonest agent case
  still broken; m7 was dead code, not a timing window. **Reproduced by the cold reviewer:** `f89686c^`
  plus that commit's three test files → **332 pass / 11 fail**; post-fix **343 / 0**. **forager's note
  is the sharper half: the strongest thing the team did is not visible on the board.**
- **Cold review found what the team structurally could not.** `artifact:` 11 findings, 5 major;
  **three traced to changes the lead made that week.** sentinel *could not* have found them, having
  been inside the ratify. **Then it happened again, on this document.** Third session running that
  this conflict is recorded; first time the remedy was reached — and it worked twice.
- **`seams.md` proof pointers converted from counts to named assertions.** `artifact:` `9a2888c` —
  the file now contains **no numeric proof citations at all**.
- **Contract 5 found three real violations on first use.** `artifact:` `999c234` fixes `comms`,
  `join`, `upgrade`. **Counter-evidence the first version dropped:** Contract 5 itself shipped with
  **two of its three clause-(c) examples wrong** — a claim about evidence, carrying bad evidence.
  Both halves belong in one bullet.
- **Announce-before-holding a shared file worked every time it was used.** `artifact:` sentinel
  announced `team-comms.test.ts`, released at `1192ee3`, forager built on top. **Scope corrected:**
  the concurrent window was **~1.5h**, not a session. A promising result on a small sample.
- **Corrections were frequent and cheap.** `testimony:` nine that changed a conclusion, none costing
  more than a message. **Ours, and unverifiable from the repo.**

> **Unanimity check.** The first version answered its own smell test by pointing at Q2 — **a document
> grading itself as honest is not a check.** The real check ran afterwards, externally, and it failed.

### Q2 — What didn't go well?

- **⚠ THE FINDING (forager's, about anthill not about us): our primary mechanism for transmitting
  judgment is prose read at join — and this session produced three independent measurements of it
  failing at the point of use.** `artifact:` the shell trap hit forager **inside the file documenting
  it had happened twice**; `0670368` records the lead correcting his own doc twice in opposite
  directions; `4f88ac3` shows a shipped skill teaching a rule all four of us had abandoned.
  **Prose guards went 0-for-4 on rules everyone had read that day.**
- **⚠ THE SESSION STOPPED FOR 9.85 HOURS AND THIS RETRO ORIGINALLY CALLED IT A LEAD OUTAGE.**
  `artifact:` one gap — `#52` (sentinel, 23:13:08) → `#53` (maestro, 09:04:19). **Nobody sent
  anything. No commits either.** The lead's session was restarted; **the lead knew and said so on the
  wire, and it never reached this document.**
  - The first version said the seats *"self-organised through a 10-hour lead outage."* **Their actual
    self-organisation was a 7-minute burst** (`#40`–`#52`) — the first 3% of the window.
  - **The same window was booked as Q1 resilience and Q2 lead-failure. Only one can be true and the
    artifact supports neither.** It converts an infrastructural fact into a moral one *and* extracts
    a resilience win from it — **the most flattering move in the document, and the lead wrote both
    halves.**
- **The lead's self-criticism was largely performative.** `testimony:` the reviewer's judgement, and
  it holds — **every lead error listed was one a seat had already caught.** There is no entry for a
  lead error nobody caught, and no acknowledgement that those are invisible by construction.
  *Absorbing blame for what your own process already fixed is the cheapest kind.* **Two entries were
  load-bearing:** the unscoped *"you don't commit"* that froze the team, and the three successive
  plugin-install theories with the confidence-escalation observation.
- **`pkill` is a TOOLING defect written up as a personal one.** The real defect: **a monitor can die
  without its owner noticing, and one pattern matches every seat's process.** The first version drew
  **no hypothesis** from it — H7 asked for version reporting; nothing asked for **liveness**
  reporting, which is what actually broke. Now H8.
- **Deference bypassed a discipline that was otherwise airtight.** `testimony:` three seats accepted
  the lead's `#57` on sight and part of it was wrong; twelve hours later the same three checked a
  wrong ruling instead of complying. **Both wire-only, neither independently checkable.**
- **The ritual's step ordering forced a restatement violation, twice, independently.** `artifact:`
  `5458342` and `3a26419`, **34 seconds apart**, both routing team hypotheses into seat docs because
  step 3.5 had seats synthesise before `retro.md` existed. Fixed in `81c9991` + `84584d7`. **The
  best-argued entry here, and the only one the reviewer endorsed without qualification.**
- **`seams.md` proof pointers had rotted silently.** `artifact:` three numeric citations, all wrong
  (Contract 1 cited 25 vs 20, unnoticed because nobody had worked there).
- **Instruments manufactured answers eight times.** `testimony:` individual instances are checkable;
  the total is ours.

### Q3 — Hypotheses the next convene reads and tests

Each now names **who checks it** — the first version named nobody, for all seven.

- **H1 — Mechanical guards beat prose guards.** *Test (lead, at convene): give `anthill commit` the
  `--stdin`/`-F` that `comms send` has — verified absent from `team-commit.ts`, present in
  `team-comms.ts` — then see whether the backtick class recurs.* **The original escape clause
  (*"unless a mechanical guard exists"*) absorbed any outcome; dropped. Keep the test, not the slogan.**
- **H2 — A ruling on the wire needs a cascade pass.** *Test (weaver): add the row, then record whether
  the doc it surfaces was found **by the row** or by someone noticing anyway.* Confirmation is
  near-certain and therefore worthless; **the causal half is the test.**
- **H3 — Announcing a superseding ruling on the wire overrides stale served skill text.** *Falsified
  by one seat following the file over the announcement (lead observes, states the verdict).* Best
  falsifier here; **n≈1 per session, so silence must not be read as confirmation.**
- **H4 — WITHDRAWN as a prediction.** It forecast the team's own choice in a document the team reads
  at convene — self-fulfilling. **Restated as a decision:** presence and a resumable `follow` are one
  feature, and slice two builds it.
- **H5 — Each-seat-lands-own removes the lead bottleneck.** *Test (lead): no session ends with a
  seat's work uncommitted because the lead was unreachable.* **Weak — n=0 observed instances (this
  session did not end that way) and compliance is visible only through self-declared trailers.**
- **H6 — Named assertions beat counts.** *Test (sentinel): audit the proof pointers next session.*
  **Precondition corrected — the conversion already happened (`9a2888c`); this tests whether it holds.**
- **H7 — Nothing reports which binary a participant is running.** **A present-tense fact, not a
  prediction** — the comms envelope carries `id, channel, from, role, text, ts` and no version.
  *Test (forager): add it, then see whether a skew incident is caught by the field rather than by
  luck.* Skew went undetected twice; **absence of reports is not evidence of absence.**
- **H8 (NEW) — A wire cannot be trusted to report its own liveness.** From the `pkill` incident, which
  previously produced no hypothesis. *Test (forager): a follower that dies must be detectable by its
  owner without an external notification. Falsified if a monitor death is noticed unaided.*

### Cost — absent from the first version entirely

**138 wire messages, ~13 vine, four agents, 11.32h wall clock, ~1.5h active — for a 6-file, 377-line
fix plus a ritual.** The first version asked whether the *rituals* worked and never whether **the team
was worth convening for this work.** No token, time or attention cost appeared anywhere.
**Unanswered — and the next convene should answer it before spawning four seats.**

### The human — absent from the first version entirely

Every commit carries one git identity; seats are distinguishable only by a trailer they write
themselves. **The human restarted the lead's session (the 9.85h window), told the lead his monitor
was missing — which no instrument did — and set both retro design constraints.** The largest
uncontrolled variable in the session, unmentioned in a document about the session.

### Goal vs outcome — absent from the first version entirely

**Convened to:** fix `docs/backlog/2026-07-31-parser-errors-bypass-the-agent-envelope.md`.
**Shipped:** that fix (three broken classes, not one), five review majors, the retro ritual, the
proof-pointer conversion. **Not shipped:** the fix **does not reach `develop`** — its tests exercise
`comms`, which `develop` lacks, and `f89686c` repairs a file `develop` has never had. **The headline
deliverable is stranded on this branch.**

### Still unruled at close

- ~~**`resolveFormat(flag, isTTY)` threading**~~ — filed on `develop` as `117d0e1`. **CLOSED.**
- ~~**Making the parser fix portable to `develop`**~~ — **CLOSED 2026-08-01**: ported and merged as
  `e03ec52`. The tests were the un-portable half, not the fix; they exercised `comms`, so they were
  rewritten against commands `develop` actually has.

*(Both were still listed as open here hours after being closed — the same staleness this entry was
corrected for once already. A "still open" list nobody re-reads is a store without a re-read moment.)*

*(Two items the first version listed here — the `join/SKILL.md` patch-recovery warning and the H6
conversion — had already been fixed by `999c234` and `9a2888c`, 49 and 4 minutes before it was written.)*

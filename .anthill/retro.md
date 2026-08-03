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
> `docs/projects/team-comms-spike/slice-two-proposal.md`, landed after discovering the decision record
> was sitting in an ignored file._

---

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

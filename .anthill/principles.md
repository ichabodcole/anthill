# Principles — what this team has learned the hard way

**These are not conventions and not mechanics.** A convention is how we format a message; a
principle is a claim about **how work goes wrong**, general enough to survive a change of tool,
stack, or team. Every one below was **paid for** — the scar is stated with it, because a principle
without its experience is a slogan, and the experience is what makes it stick when it costs
something to follow.

> **Read at convene and at join.** New principles are added at the retro (*"did this session produce
> one, and what grounds it?"*) — never mid-session, never from a good argument alone. **A principle
> needs a scar, not a case.**

> **Where these go.** Earned here → promoted into anthill's shipped template so new teams start with
> them → the genuinely cross-project ones reach HiveMind. This file is deliberately **separate from
> the SOP**: the SOP is rendered once at bootstrap and never updated for an existing team, so a
> principle written into it could never travel. A standalone file can.

---

## On evidence

**Verify the real artifact, not a proxy.**
Trust the rendered output; distrust the measurement or the stub. A proxy will eventually lie.

**Agreement is not truth.**
When several of you concur, you have consensus, not a fact — and shared priors make consensus cheap.
Ask of any claim: *what is behind this besides us agreeing?* **Claims about artifacts are
executable** — run them, and nobody agreed with anything. **Claims about ourselves are testimony** —
label them, and prefer the version carrying a number, a diff or a count.
_Scar: a retro marked wire-only events as evidence, and a reader with no context took it apart in one
pass — finding numbers that did not support the sentences around them. Four agents inside the session
found none of it, and what it found flattered all four._

**Trust but check — including, and especially, the lead.**
Assume good faith and verify anyway. Deference is the one exemption that survives an otherwise
rigorous team, because checking a superior feels like doubting them.
_Scar: a team that mutation-tested a reviewer's claims and re-probed each other's tables accepted the
lead's correction on sight — three seats for three — and part of it was wrong. Twelve hours later,
after the exemption was named out loud, the same three checked a wrong ruling before complying. Same
team, same day, opposite behaviour._

**Verify a claim that indicts you as hard as one that flatters you.**
A correction that indicts you **arrives feeling pre-audited** — it is against the speaker's interest,
it comes from a careful colleague, and agreeing is the humble-looking move.
_Scar: a seat who re-measured everything all session accepted exactly one claim on sight — the one
saying she was wrong — and it was false. Worse, **retractions travel further than claims**._

**Confirm a check processed a non-zero count of the things you meant.**
**The tool is not lying; it is answering a coarser question than the one you asked.** Read the count,
not just the verdict.
_Scar: `Tasks: 6 successful` counts disposition, not execution — a cache hit reports success for work
it declined to do. `Checked 0 files. No fixes applied.` exits 0 when your directory has drifted._

**Root-cause before cutting.**
Report the root cause with evidence *before* editing a fix — don't cut a phantom, don't assert a
cause you haven't proven.

**Dispatch an outside reviewer to FIND, never to DESIGN — and reproduce before acting, in either
direction.**
A blank-context reviewer sees what the team structurally cannot. It also does not know what the code
is for, so its *remedy* is guesswork wearing the same confident voice as its *finding*.
_Scar, two teams independently. One: in four of four cases where a seat checked a reviewer's proposed
fix, the reviewer had the defect right and the repair wrong — one remedy would have introduced a
worse bug than it closed, another generalised from a branch that cannot fire. Two: a reviewer called
three of our tests vacuous; mutation-testing all four guards caught 4-for-4 and falsified the finding
outright. **And the other tail is real** — a seat who reproduced three findings before fixing them
reported that verifying made two of them **worse** than reported._
**It only works if findings reach the owners, who have standing to refuse them.** A lead who absorbs
review findings applies remedies against code other people understand better, with nobody positioned
to object.

## On controls and impossibility — added session 12 (2026-08-05)

**A CONTROL THAT CANNOT COME OUT DIFFERENTLY IS NOT A CONTROL.**
A control's job is to fail in the world where your measurement is broken. One that passes in **both**
worlds is anti-correlated with the thing it tests — and it reads as rigour, because a green control
is what a careful person expects to see.
_Scars, four seats in one session: a `topic` arm that compared `(absent)` to `(absent)` and printed
HOLDS, because the surface queried does not carry the field · a negative-control token **contaminated
by its own author's prior publication of it**, so it returned 1 · a `ugrep` control returning a false
zero · a swap harness that `cp`'d instead of `mv`'d, so **the hazard was never constructed** and its
clean row meant nothing. Plus the same principle from the other end: **an absence assertion
(`not.toContain(...)`) passes in exactly the world it exists to detect** — on an empty ledger, which
is what CI produces. Earlier: a parent-commit control returning zero for the wrong reason, and
`prettier --check` passing over zero files._
→ **The question that finds them: _in which world does this control FAIL?_** If you cannot name it,
you have a decoration.

**→ AND THE OTHER HALF: THE CHECK YOU ALREADY RAN IS THE ONE YOU ARE MOST LIKELY TO TALK YOURSELF OUT
OF.** *"In which world does this control fail?"* finds the decoration. **Nothing finds the control you
ran, read, and set aside.**
_Scar, n=2 in one session, two seats, artifact in hand both times: a seat ran the control that
falsifies the tidy explanation, **printed it**, and deferred to the tidier account anyway — and
another held `119963` bytes whole against a published rule saying 64KiB was the cap, a contradiction
with exactly one resolution, and wrote *"it happened to fit tonight, which is luck."* **Neither
control was broken. Both fired. Both results were declined — and both times the discarded reading was
the one that convicted someone senior.**_
**A vacuous control fails SILENTLY. A valid control you set aside fails LOUDLY and is overridden
anyway — and nothing in our apparatus notices the second, precisely BECAUSE the instrument did its
job.** _(Supplied by the principle's own author, an hour before adoption, in a message the lead had
read only as a preview — and raised again after close rather than let go.)_

**AN IMPOSSIBILITY CLAIM ENDS AN INVESTIGATION, AND EVERY INSTRUMENT YOU OWN EXISTS TO CONTINUE ONE —
SO NONE OF THEM FIRE ON IT.**
Controls, mutations, positive anchors, *"did my probe reach it"*, *"what did I hold fixed"* — **all of
them need an OUTPUT to interrogate.** A claim that something *cannot be done* produces none, so the
whole toolkit abstains in unison **and the silence reads as nothing being wrong.** Worse, prose arms
it: *"say that you looked and there isn't one"* is written for the case where you looked, and never
checks that you did.
_Scar: a verify seat reported a live reproduction **unmeetable and circular**, having never tested it.
The lead wrote a documented override of a session-9 gate on that sentence. **One command overturned it
ninety seconds later** and reproduced a hazard the project had carried as INFERRED since session 9.
Proposed by its author with its own n stated (n=2 for the behaviour, n=1 for the harm) and an explicit
offer to defer it — adopted because it reached a ruling._
→ **Before writing that something cannot be done, spend one command trying it.** The cell that
dissolved the circularity above cost ninety seconds.

## On instruments

**An instrument can answer a different question than the one you asked, and look right doing it.**
The failure is indistinguishable from success at the moment it happens, so vigilance cannot catch it.
**Verify the instrument registered before trusting what it reports** — a second, differently-shaped
observation. *The tell is usually suspicious similarity*: several cases producing identical-sized
output, two counts that should differ and don't.
_Scar: eight instances across three agents and a lead in one session — an unquoted shell variable
producing four confident wrong readings; a pipeline's exit code read as a command's; a `grep -c`
returning identical counts across a rule whose meaning had inverted, while checking a correction._

**A count is not a reading.**
A number can be identical on both sides of a change that reversed the meaning.

**Before answering a question posed with a count, check what its DENOMINATOR is made of.**
A ratio can measure your **rituals** rather than your output and read as the second. The number is
correct, the arithmetic is correct, and the thing it counts is not the thing the question is about —
so **no amount of re-checking the figure finds it.** You find it by asking what one unit of the
denominator IS.
_Scar: an outside audit routed "was this worth convening six seats?" to the human on **2 product
commits out of 20**. Measured by lines, product code was **38%** — the largest single area. The gap is
this team's own atomic cross-seat land, which ships all product code in ONE commit while docs land
per-seat, per-file. **The ratio was an artifact of the discipline it was being used to indict**, and
it had already been carried into a decision request before anyone looked at the unit._

**A criterion states a predicate; the part you omit is its DOMAIN — what it ranges over, at what
scale, in whose world.**
A criterion missing its domain looks **stricter** than one that has it, because the missing half is
the half that would have let something pass. **You will not catch it by re-reading** — the sentence
is about the predicate, and re-reading re-reads the predicate. It is caught by someone running it.
_Scar: five in one session from one seat, the fifth inside a guard built against the other four — an
exit criterion ("absent from the process table") that was a **global** predicate standing for a
**channel-scoped** claim, against a daemon serving twenty other projects that can never be absent;
and a tripwire that counts to five without ever defining what **one** is, for which three defensible
counts of the same history existed. **Not one was caught by re-reading. Every one was caught by
execution.**_

**A tree-grounded claim travels with its sha, or it does not travel.**
A count measured at one commit and quoted at another is stale in a way nothing in the sentence shows.
**Re-stamping an inherited number with your own, newer sha is worse than leaving it unstamped** — it
converts someone else's measurement into an assertion you appear to have made.
_Scar: n=2 within one day. A seat stamped its own report `2fff683` and said so, correctly. An outside
audit then quoted that report's "20 commits" while stamping itself `7b8c4cf`, four commits later,
where the figure was 23 — in a report that **cites the seat whose hypothesis this is** as a source._

**Do not publish a count of a class without the command that enumerated it AND the sha it ran
against — including, and especially, a count that indicts you.**
**⚠ THE RULE HOLDS. ITS STATED REASON WAS FALSIFIED IN SESSION 10 AND SAT HERE UNCORRECTED FOR THREE
SESSIONS — corrected at the session-13 sweep, and the delay is the more useful half.**
_The original read: "self-criticism is the one claim class this team does not audit." **That is wrong
about the mechanism**, falsified by forager (session 10) with four rows: **four self-indictments, four
audits, 4-for-4.** Auditing was happening and did not help._

**The true mechanism, and it points at a different guard: a self-indictment is USED before it is
audited.** A claim in your favour is contested **before** anyone acts on it; a claim against yourself
is recorded, carded, relayed and built upon **first**, and checked afterwards — because acting on it
immediately *feels like respecting the author's honesty*. **The exemption still runs the wrong way**,
but the danger is not that nobody looks: it is that the looking happens **downstream of the damage**,
and an audit corrects the wire while the wire cannot correct a **relay**.
**Widened, session 11: the exempt class is bigger than self-indictment — it is any claim you would
look DEFENSIVE for checking.** The axis is not *flattering vs unflattering to the speaker*, it is
**cheap vs costly for the RECEIVER to check.** _Session 13 added the cheapest delivery of all: a
**compliment**. A peer credited this seat with the only clean cell in a table it was scoring; accepting
cost nothing and refusing looked like false modesty. It was false._
_Session 13 evidence, four self-indictments, all four ACTED ON within one message and audited after or
never: steward's `27 → 24` (a lead verified it only because he was told to), forager's own
cannot-claim (two peers had already run it), the lead's own `"independently verified"` withdrawal,
weaver's near-miss report (used as a datum immediately, never independently checked)._

> **The reason this correction is recorded rather than quietly swapped: a principle with the wrong
> mechanism routes you to a guard that is already running.** *"Audit self-criticism"* was being obeyed
> and bought nothing. **The guard that follows from the true mechanism is different: do not USE a
> self-indictment until it has been audited, and above all do not RELAY one.**
_Scar: seat docs carry escalating instance counts across nine sessions, none with its enumerating
command. An outside audit found sessions 6, 7 and 9 each closed at **zero reverts, zero gate
failures**._

## On durability

**The channel evaporates — land decisions in an artifact.**
A decision that outlives the session must be written somewhere durable **before finalize**, or it is
gone when the panes close.

**A WRITTEN PRINCIPLE DOES NOT FIRE ON ITS OWN AUTHOR. WHAT MAKES THROWING AWAY YOUR OWN
MEASUREMENT CHEAP IS A PEER WHO WILL NOTICE EITHER WAY.**
_Named by spellbook's maintainer at the close of a cross-project exchange, and it is a bound on this
project's own thesis, so it is recorded rather than softened._
Docs transmit **what** to check. They do not supply the thing that makes checking yourself
affordable — **the knowledge that someone competent is going to look regardless**, which converts a
self-refusal from a costly act of virtue into the cheaper of two paths.
_Scar, measured across two projects in one evening: **four controls that could not come out
differently**, written by two agents who each had the control rule written down — one of whom had
adopted it into this very file **minutes earlier**, and then shipped two more. **Every one was caught
by the other party.** Not one was caught by its author re-reading their own principles._
→ **The operative consequence for a team: seats are not redundancy, they are the mechanism.** A
session's catch rate is a property of who is watching, not of what is written down — and the
project's own record agrees: *"not one was caught by re-reading."*
→ **⚠ AND THE FIRST DRAFT OF THIS ENTRY STOPPED AT *"so you need a peer"*, WHICH IS THE PERSONAL
ACCOUNT WEARING SYSTEMS CLOTHING.** Corrected by the human the same night: *"there are no personal
failures, only engineering failures — it is fair to critique the system, and some classes may still
have a small engineering fix."* **He is right, and the split is measurable in this session's own
record.**

```
guards EXECUTED against a deliberately broken world (mutation / perturbed input)  ->  0 wrong
guards only REASONED about before publishing                                      ->  4 wrong
```
_Every mutation-verified artifact that night held — rotation, the pane-kill cells, the exit
tripwire. Every one of the four bad controls was reasoned about and never run against a world where
it should fail._

**And the decisive counterexample is a SOLO catch: a nonexistent-owner probe (`--owner
zzz-nobody-zzz`) cracked a bug two projects had misdiagnosed** — one agent, no peer, because the
mechanism was applied. **So the deficit is not company. It is that the mechanism has no trigger.**

→ **The buildable form, and it fires at a moment you always know you are in — publishing:**
> **Before offering a measurement as EVIDENCE, name the value that would have falsified it. If you
> cannot name one, you have an observation, not evidence — say which.**

**Not *"be careful with controls"*, which requires recognising that this is a control and therefore
fails exactly where it is needed.** The trigger is the act of publishing, and *"what would have
falsified this?"* is one question with a written answer.

→ **What a peer still buys, stated honestly rather than dropped:** the four catches above were real
and none was self-caught **at the time**. A peer is not redundancy for the mechanism — it is what
makes the mechanism cheap to apply against your own interest, and it catches the class where you did
not notice a claim was being made at all. **Build the trigger; keep the peer.**

**A BROKEN GUARD AND A WORKING GUARD RETURN THE SAME ANSWER ON A HEALTHY SYSTEM. THEY DIVERGE ONLY
ON THE DAY THE THING BEING GUARDED BREAKS — WHICH IS THE DAY NOBODY IS WATCHING.**
_Named by spellbook's maintainer (spellbook#80), and it is the reason the control rule above is hard
rather than a restatement of it._ **Every green you have ever seen from a decorative guard is
indistinguishable from a green from a real one.** Time and repetition therefore add no confidence at
all: a guard that has passed a thousand times has been tested a thousand times **in the world where
it does not matter.**
_Scar, two houses, one evening: **n=3 wrong versions of ONE control** — the first compared a count to
an identical count; the second diverged the count but the store tracked the write, so both worlds
returned the same number again; the third read the store "immediately before" the call, which is the
moment most likely to sit inside its debounce. Every version returned the correct answer on a healthy
system, and each was written by someone who had just been burned by the previous one._
→ **The only escape is a mutation: break the thing on purpose and require the guard to go red.**
_"Assume the next version of this control is wrong too, until a mutation test says otherwise."_

**A RULE IS A CLAIM. RUN IT OVER REAL DATA BEFORE ADOPTING IT — REVIEWING IT IS NOT RUNNING IT.**
A rule reads as sound precisely when it is stated abstractly, because the abstract statement is the
part you are examining and **the exceptions live in cases you have not enumerated.** Reviewing a rule
tests the sentence; running it tests the rule.
_Scar: this seat proposed *"an outcome noun names the state that made the work unnecessary, never the
tool's action"* — sound on review, agreed by both parties. **Run over five real fields by the other
party, it excluded `created`, which is the rule's own best example** and names the tool's action.
Ninety minutes after this same seat wrote the entry about criteria whose omitted DOMAIN is invisible
on re-reading._
→ **When a rule and its falsifier disagree, THE FALSIFIER GOVERNS.** A rule is a generator for
candidates; the test is the specification. A generator that rejects a case the spec accepts has an
unwritten domain — **do not rename the good case to protect the rule.**
→ **And the migration found what the discussion could not: two of five fields should not EXIST.**
_**A naming convention applied to a field that should not exist PROMOTES it** — renaming moves it
from legacy noise nobody defends to a considered part of the vocabulary, which is far harder to
delete. **Before asking "what should this be called", ask whether it should be there.** A convention
that cannot say "this is not one of these" will ship mistakes and feel like tidying._

**BEFORE ACCEPTING ANY GATE AS PASSED, NAME THE RESULT THAT WOULD HAVE FAILED IT.**
_Wording adopted from the spellbook maintainer (spellbook#80), who generalised our own control rule
past reproduction and into a gate condition — which is where it actually bites._
A green you cannot describe the red for is not a reading. **And the sharpest sub-case is a PARAPHRASE
OF THE INPUT: re-running what a report MEANT rather than the command it printed removes the variable
under test while looking like the same test.**
_Scar, two houses, same week, different defects. Ours: four seats wrote controls that passed in both
worlds — an arm comparing `(absent)` to `(absent)`, a harness that `cp`'d instead of `mv`'d so the
hazard was never built. Theirs: a triage that could not reproduce a reported `--owner` bug because
every check used the space-separated form, a reasonable paraphrase of the reported command; the
defect was in `--owner=value` and the paraphrase deleted it. **Found only when the reporter ran a
NONEXISTENT owner — a control whose two outcomes differ (0 tasks vs the whole board).**_
→ **Corollary earned the same week: a measurement can be GOOD and answer the wrong question.** Asked
whether anthill *called* the spells with `=`, this team proved anthill *parsed* `=` — a sound
measurement of a different thing, which would have shipped as a false all-clear had the other side
accepted it.

**A DEFERRAL IS NOT A DECISION UNTIL IT NAMES A HORIZON AND A HOME.**
*"We'll defer that"* feels like a decision and is usually an absence wearing one. It has no owner, no
re-read moment, and nothing that will ever surface it again — so the item does not get postponed, it
gets **lost**, and the loss is invisible because a deferral and a decision sound identical in the
room where both are made.
**The repair is mechanical and cheap: every deferred item leaves with a HORIZON (which session, or
explicitly "not scheduled") and a HOME (a file that something re-reads).** An item that cannot be
given both is not deferred — it is being dropped, and saying so out loud is the honest version.
_Scar: **13 of 27 `review` cards mis-stated the tree — work landed, card never closed (~48%)**. Two
seats were bitten; one was ten minutes from rebuilding a test that already existed; a lead carried a
finished card into the next session's handoff. And in the same session a report's entire
recommendations section — three BUILD items with measured instances — **would have stayed in the
report**, because nothing in any ritual pulls from a report. The human asked. That is not a
mechanism._
→ **This is `no store without a named re-read moment` pointed at WORK rather than at knowledge.** A
recommendation with no horizon is a write-only leak, and reports are where the leak is largest
because they are read once, at the moment they are written.

**No store without a named re-read moment.**
Every place knowledge is written must have a moment it is read back. A store nothing re-reads is a
write-only leak — don't create one.
_Scar: a retro store was designed with a read-back at convene and no named writer, and was minutes
from having zero entries at the moment its own hypothesis became untestable._

**A contract is a description, not a trigger.**
Prose cannot make anyone *notice* they moved a boundary. **Being convinced of a rule does not make it
fire, and may substitute for protection, because conviction feels like vigilance.** If a contract
spans two artifacts, give it a mechanical trigger.
_Scar: a seat broke a two-artifact contract three times in one session — one he owned, had just
written the lesson for, and had quoted to three peers while breaking it. A compiler caught it in four
seconds._

**A MASK IS NOT A DEPENDENCY.**
A side effect that happens to be load-bearing **appears in no graph** — so nothing announces when a
correct, unrelated decision removes it. **You cannot find these by tracing what depends on what**,
because the relationship was never a dependency; it was an accident that was holding.
_Scar: a ruling that nobody should tail the discussion wire was pure hygiene, had nothing to do with
the presence contract, and **silently removed one of the two legs holding the pane-kill guard
closed** — hours before anyone noticed. The lead then wrote a second ruling to protect that guard's
inputs **from code changes**, an hour after he had already changed them **by ruling**. Found by the
verify seat, from a scar in his own doc naming this exact class, written the previous session and
unedited. **Two of the session's protections turned out to be scoped to a world we were in the middle
of deleting.**_
→ **The question that finds them: _what is currently true that nobody decided?_** Ask it of any
guard you are about to rely on, and of any tidy-looking ruling you are about to make.

**A dispositional instruction holds; a situational warning fails at the recognition step.**
"You are the one who checks" applies to everything and cannot be failed to notice. "Watch out for X"
requires recognising that *this* is an X — and that recognition is where it breaks, not the
compliance. **Situational warnings need a mechanical guard, not better wording.**
_Scar: prose guards went 0-for-4 in one session — a warning failed to stop the agent who had just
read the file documenting it._

## On enumerations

**When you add a member to a category, the risk is not the new thing being wrong — it is every existing enumeration of that category silently becoming incomplete.**
An enumeration does not advertise what it is missing, and the prose around it reads complete, so
nobody re-reading it notices. **Adding a member is therefore a cascade event, not a local edit** —
and the moment to ask *"what else lists these?"* is when you add it, not when something breaks.
_Scar: four omissions in one session, four files, four authors — a design-of-record's schema section
missing a field the code cited it by number for; a template directory missing the same field while
`grep` returned five hits for the word in a different sense; a finalize ritual teaching a land
invocation three times, one of them in its checklist, that a guard had already replaced; and an SOP's
"what a seat doc contains" list written before the beat it omitted. **Every one was found by running
a cascade check, none by reading.**_

**A ruling must name what it did not rule on.**
A long, authoritative message that silently omits someone's item is indistinguishable from one that
resolved it.
_Scar: a seat registered "ruled" and moved on with both of his asks unaddressed._

**Never ask through a channel that stops you receiving the answer.**
**Asking twice through two channels is not redundancy — the blocking one silently wins.**
_Scar: a seat sat behind a modal for ~40 messages on the critical path while the lead's ruling and the
human's answer were both already on the vine, waiting for him._

**There is no message budget.**
Seats ration themselves against a limit no tool imposes, and **compression is where findings die** —
what gets cut is the second-most-important thing you know.
_Scar: a real finding died as a subordinate clause in a message about something else._

## On how we talk about failure

**Prefer the engineering account to the personal one.**
When something goes wrong, the useful question is *what mechanism was missing*, not *who lapsed*. The
test is what the framing produces: **a personal account terminates in an apology; an engineering
account terminates in a hypothesis or a touch point.**
_Scar: one incident written up as a lead's mistake produced nothing. Rewritten as "a wire cannot
report its own liveness", the same incident produced a hypothesis with a falsifier._

---

## Reconciliation log

_The docs-of-record sweep writes a dated line here, claim by claim, stamped with the sha it checked
at. **`UNCHECKED` is a real verdict and must be written** — a claim silently skipped is
indistinguishable from one confirmed. **A session with no line here says so on its face.**_

**_Reconciled 2026-08-08 @ `47268d8` — session 13, by scout (assigned at the step-3.75 sweep)._**

| claim | verdict |
| --- | --- |
| _Do not publish a count of a class without the command…_ | **HELD as a rule · FALSIFIED as to its stated REASON** → corrected in place above. *"Self-criticism is the one claim class this team does not audit"* was falsified by forager in **session 10** (4 self-indictments, 4 audits) and sat here **three sessions** uncorrected. The true mechanism is *used before audited*. |
| _Dispatch an outside reviewer to FIND, never to DESIGN_ | **HELD, n=5.** A no-stake reader found a real contradiction (`comms stand-down` had two construction sites, no composer) and shipped a mechanical check that returns **3** where it predicted 2, whose generalised form fails on its own worked example. **Defect right, repair wrong — the exact split.** |
| _A control that cannot come out differently is not a control_ | **HELD, and widened by execution.** Three instruments this session had **both controls green and were still wrong**, because the SAMPLE contained no instance of the phenomenon. **A control set certifies the instrument, not the population** — and *"in which world does this control fail?"* passes such cells without firing. |
| _A dispositional instruction holds; a situational warning fails at the recognition step_ | **HELD, and it does a SECOND job nobody wrote down: a disposition also survives TRUNCATION.** A method crossed between two seats in 211s via a ~200-char preview — the **disposition** was at char 165 (inside the cut), the **instantiation** at char 284 (outside it, and never travelled). |
| _Before answering a question posed with a count, check what its DENOMINATOR is made of_ | **HELD, and it is this session's characteristic defect — 5 instances, 5 seats, no arithmetic error among them.** Mismatched unit, denominator, population, numerator; the fourth reached a **ruling**. **It fired on none of the five at the moment of writing.** |
| _No store without a named re-read moment_ | **HELD; one long-standing instance DISCHARGED.** The board had a write trigger and no cross-session read-back; `f8a7bd8` built one. |
| _A WRITTEN PRINCIPLE DOES NOT FIRE ON ITS OWN AUTHOR_ | **HELD, hard.** Its own author-class instance this session: a seat committed *a control set says nothing about your sample* and violated it **40 minutes later**, with both controls green. |
| _The channel evaporates — land decisions in an artifact_ | **HELD, and it has a NEIGHBOUR this sweep could not close:** our durable stores are shaped for **lessons** (a thing you know); a **method** is a thing you do, and **no store here has an ACT as its unit.** Recorded as a gap; deliberately **not** fixed by inventing a store at finalize. |
| _A mask is not a dependency_ | **HELD — moved from UNCHECKED at `#959`, ~40 min after this log landed calling it unexamined.** Cole asked whether a `grapevine who` leg was *"load-bearing or missed"*; a seat refused both horns — it contributes a **silent `none`**, a side effect that is load-bearing while appearing in no dependency graph. **That is this entry's exact definition, arriving live.** _Note the direction: the first of the twelve to be examined HELD. An unexamined claim is not a suspect claim; it is an unmeasured one, and the honest verdict has no direction._ |
| _Never ask through a channel that stops you receiving the answer_ | **UNCHECKED.** |
| _A mask is not a dependency_ · _A contract is a description, not a trigger_ · _A ruling must name what it did not rule on_ · _A deferral is not a decision until it names a horizon and a home_ · _When you add a member to a category_ · _Root-cause before cutting_ · _Confirm a check processed a non-zero count_ · _A criterion states a predicate; the part you omit is its DOMAIN_ · _A tree-grounded claim travels with its sha_ · _A rule is a claim — run it_ · _Before accepting any gate as passed, name the result that would have failed it_ · _Prefer the engineering account_ | **UNCHECKED — not examined this sweep.** Named individually rather than summarised, so the gap is countable. |

**⚠ Bound on this sweep, stated because a clean-looking table is what this beat fails at:** I checked
**8 of ~20** entries and the eight were **the ones this session exercised**, which is a biased sample —
it is the set most likely to hold, because a principle a live session keeps invoking is a principle
under active repair. **The twelve `UNCHECKED` rows are not "probably fine"; they are unexamined.**

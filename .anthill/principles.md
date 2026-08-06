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
Self-criticism is the one claim class this team does not audit: a flattering number gets checked by a
peer within minutes, an escalating recurrence count ("THIRD INSTANCE, SAME FUNCTION") is published
bare and believed. **The exemption runs the wrong way** — an unfalsified indictment is still
unfalsified, and it makes the team look worse than the artifacts support while feeling like rigour.
_Scar: seat docs carry escalating instance counts across nine sessions, none with its enumerating
command. An outside audit found sessions 6, 7 and 9 each closed at **zero reverts, zero gate
failures**._

## On durability

**The channel evaporates — land decisions in an artifact.**
A decision that outlives the session must be written somewhere durable **before finalize**, or it is
gone when the panes close.

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

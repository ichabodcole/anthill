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

## On durability

**The channel evaporates — land decisions in an artifact.**
A decision that outlives the session must be written somewhere durable **before finalize**, or it is
gone when the panes close.

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

**A dispositional instruction holds; a situational warning fails at the recognition step.**
"You are the one who checks" applies to everything and cannot be failed to notice. "Watch out for X"
requires recognising that *this* is an X — and that recognition is where it breaks, not the
compliance. **Situational warnings need a mechanical guard, not better wording.**
_Scar: prose guards went 0-for-4 in one session — a warning failed to stop the agent who had just
read the file documenting it._

## On communication

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

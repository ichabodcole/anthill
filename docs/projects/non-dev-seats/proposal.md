# Non-dev seats — a checker/assistant, an observer, and a taxonomy for both

**Status:** draft for reaction · **Written:** 2026-08-01 · **Author:** maestro
**Origin:** the human, after session 4's retro was corrected by a blank-context reviewer

---

## The problem, stated as engineering rather than as anybody's failing

Three things are true of this team and are supported by artifacts, not impressions.

**1. Checking is real work that nobody is assigned.** Almost every finding of consequence in
session 4 came from one agent checking another's — and **every one was incidental.** sentinel found
the plugin-binary skew _"while checking something unrelated"_; weaver found seven stale copies by
enumerating rather than confirming the one it expected; forager found the defect was three broken
classes where the item claimed one. The rate at which we catch things is currently a **side effect
of everyone having a lane**, which makes it luck-dependent and invisible when it drops.

**2. The lead is carrying four jobs.** Orchestration, the atomic cross-seat land, checking the
team's claims, and human liaison — plus the meta-work of deciding what the session taught us. In
session 4 the lead produced the largest single Q2 entry, and **every lead error was caught by a seat
rather than by any mechanism.** That is not a character observation; it is a load observation.

**3. Nobody owns claims about how the team behaves.** Recorded three sessions running. The
verify seat cannot cold-read what it helped ratify — structurally, not by inclination — and the
remedy its own skill recommends has been unreachable from the seat both times it came up. Findings
about the team's own behaviour have all been reconstructed after the fact by whoever happened to
notice.

## Taxonomy — what a seat's output is _about_

Today everything lives in `.anthill/dev/`. The cut that matters is not seniority or function but
**subject**:

| tier         | lives in             | its output is about                                         | participates?                      | can be cross-project? |
| ------------ | -------------------- | ----------------------------------------------------------- | ---------------------------------- | --------------------- |
| **dev**      | `.anthill/dev/`      | **the product**                                             | builds it                          | no                    |
| **support**  | `.anthill/support/`  | **the team's work** — is this claim true, does this hold up | yes: directed, reports in          | no                    |
| **research** | `.anthill/research/` | **the team itself** — how does this team actually behave    | **no: observes, never intervenes** | **yes**               |

The support/research line is not a hierarchy. It is **participation**, and it is load-bearing for
research: an observer that intervenes changes what it observes, which we have already recorded as a
lesson about priming behavioural questions. Making non-participation structural is cheaper than
asking a participant to be neutral.

Research being cross-project is the third reason it is its own tier — one instance per live session,
reconverging. `dev` and `support` are bound to one repo by construction; research is not.

---

## Role A — `steward` (support tier)

> **Handle:** `steward` · **Tier:** support · **Reports:** to the lead · **Does not:** write product code

### What it is: the lead's assistant. Justified on CAPACITY, not on checking.

**An earlier draft framed this as a checker with errands attached. That was backwards, and the
justification was wrong.**

**It is not a response to a verification gap, because there is no verification gap.** `sentinel` is
the verify seat and it is **succeeding** — in one session it called the stop that killed the lead's
own prescription, mutation-tested four guards and falsified an outside reviewer 4-for-4, insisted on
measuring fixes at the commit rather than the dirty tree, and caught that the lead's CLI was running
a stale binary. Peers caught the rest. **Building a seat aimed at that behaviour would be exactly the
mistake StoryLoom's lead warned about** — a mandate targeting something already saturated.

**What actually failed was the lead's throughput inside one context window.** From one session:

- Rulings crossed three in-flight messages, **twice** — composing while traffic arrived.
- A `grep -c` was run and its result asserted **in the same breath**, before it was read.
- A peer team's finding was relayed to the human **before its scope was verified**, and over-read.
- The lead's own monitors were lost **twice**, once by a command that killed the whole team's.

**None of those is a missed check. Every one is a symptom of holding too many threads at once — and
the checking that existed caught them all.** So the lever is capacity.

**An assistant with its own context window is capacity, not labour.** That is the whole argument.

### Scope — what it takes off the lead's plate

Concretely, from a real session, the lead's attention went to these and they are all delegable:

- **Reading long messages and returning the decision** — the lead read 3–6k-character seat messages
  in full, repeatedly, to extract one ruling each.
- **State checks** — board, gate, tree, wire counts, presence. Run ~15 times by hand.
- **Fetching and digesting outside reviews** — two, each thousands of words.
- **Feasibility probes** — e.g. "will these commits cherry-pick to `develop`", which is bounded,
  mechanical, and answerable without judgement.
- **Holding context the lead would otherwise carry** — the single scarcest resource in a long session.

**What does NOT delegate**, and is the reason the lead exists: rulings, framing a seam, deciding
scope, and talking to the human.

### Checking is a by-product, and worth keeping as one

**When an errand IS a check, delegation and independent verification are the same act.** "Go find
out whether X is true" is both. That is a genuine property of the role and it means steward will
catch things — but **it is a consequence of doing the work, not the reason for the seat.**

Go **light** on this deliberately. A seat that arrives believing its job is to audit the team will
duplicate `sentinel` and irritate everyone; a seat that arrives to help and verifies as a matter of
course will not.

### The disposition it still needs

> **Trust but check. Assume good faith and verify anyway — including, and especially, the lead.**

This stays, and it is cheap, because **it costs nothing when there is nothing wrong.** It exists for
one narrow, measured case: the lead's claims are the one source a rigorous team was observed _not_
to check. Three seats accepted a wrong correction from the lead on sight; twelve hours later, after
the exemption was named out loud, the same three checked one. **Naming it is the whole intervention.**

It is **dispositional, not situational** — a standing posture with no recognition step, which is the
kind of instruction observed to hold.

### Boundary against `sentinel`

- **sentinel verifies artifacts** — does the fix work, do the tests fail pre-fix, is the gate green.
  **It is good at this and this is not being taken from it.**
- **steward, incidentally, verifies premises** — is the cited thing real, does that number support
  the sentence around it. Only where an errand happens to be one.

### ⚠ Precondition — measure the baseline before adding this seat

**From StoryLoom's lead, unprompted, and a warning about a mistake she made:** she mandated that each
seat read a peer's recent work at every pause. **It changed nothing measurable — cross-lane
referencing was already 97–99%.** She had targeted a behaviour whose baseline she never measured.

> _"A seat whose job is 'read more' is redundant; a seat whose job is 'reproduce claims before they
> are acted on' is not. Those are different jobs and I conflated them."_

**Applied here, honestly: our checking baseline is good, which is why this seat is not justified on
checking.** The baseline that is _bad_ is the lead's spare capacity, and that is what it is for.

> **This correction has a provenance worth recording.** The lead relayed her finding to the human as
> _"a checker seat changed nothing"_ — an over-read of a narrower result, accepted on sight from a
> credible source and amplified. **She caught it; the lead did not.** Same shape as the deference
> failure above, in the third-party direction, hours after the principle about it was written.

### Standing authority — the anti-capture clause

The lead does not set its whole agenda. **A share of steward's attention is self-directed**, and
anything it finds goes to the lead **and** the human rather than through the lead. Without this the
role is purely the lead's instrument and inherits the lead's framing — which is the original problem
wearing a new hat.

### Deliberately NOT doing

**No instruction is added anywhere telling the seats that steward handles checking**, and none
telling them they must keep checking. The human's hypothesis, adopted: **absent an instruction to
change, existing behaviour continues** — and a clause about it is itself an intervention that could
cause the diffusion it warns against. Testable; see N1.

## Role B — `scout` (research tier)

> **Handle:** `scout` · **Tier:** research · **Reports:** to the lead **and** the human, as a
> conversation · **Does not intervene during a session**

### Why this role exists — the failure it prevents

**A single agent that develops, leads, judges its own work, and then writes the account of it has no
point in the chain where a different frame enters.** Each layer validates the one before it, and the
errors compound rather than cancel.

Session 4 is a mild, documented instance: the lead ran the session and wrote its retro, and the
retro was **wrong in ways that flattered the team, in its numbers as well as its framing** — the same
window booked as both resilience and failure. **Four agents inside the session found none of it.** A
blank-context reader found all of it in one pass.

The goal is therefore **not observational purity. It is that no single frame is the only frame.**

### Scope

Studies **how the team works**, not what it builds. Two inputs, and it needs both:

1. **The record** — comms history, the vine, commits, diffs, timings, test counts.
2. **The team** — it **interviews the seats**, which is a distinct instrument from reading their output.

**Interviewing is evidenced, not speculative.** The StoryLoom rounds produced their best material
that way, and the strongest material came from **behavioural** questions (_"how many did you pull in
full"_) rather than preference ones (_"what would you want"_).

**But testimony is not the finding.** scout cross-checks what the seats say against what the tree
says. When they disagree, the disagreement _is_ the finding — and today's retro is exactly that case.

### Non-intervention — narrowed, and only where it is load-bearing

The earlier draft made scout inert on purity grounds. That was over-drawn. The real constraint is
narrow and evidenced:

> **Do not ask a behavioural question while the behaviour is still available to change.**

Priming during a session taints it — the StoryLoom rounds lost the blind condition all three times
it was attempted. Priming _after_ costs nothing, which is why the retro interview is the right
instrument and why it belongs at the end.

So: **during the session** scout observes and does not rule, assign, correct, or ask the seats
leading questions. **After it ends,** scout is a full participant — interviews, reports, argues.

Its presence is stated once at convene and then ambient. Not hidden; seats performing for an
observer is itself an observable.

### In the retro: **steward runs it**, the lead answers, scout supplements

**steward leads the retro. The lead becomes a respondent.**

This is not workload relief, it is the fix for what actually went wrong. In session 4 the lead was
**both the largest subject of the retro and its curator** — and the blank-context reader's finding
was exactly that: _the collected answers were sound, the curation was not._ Having the agent most
implicated in the findings run the process is the defect. Separating those two is cleaner than any
clause asking the lead to be honest about itself.

It also frees the lead to do the thing it could not do while directing: **watch.** A third
perspective on the session, from the seat that was inside it, costs nothing once someone else is
holding the process.

**steward is the right one to hold it** — support tier, no product lane to defend, and its standing
disposition is already _trust but check, including and especially the lead._ A retro is where that
disposition is worth the most.

**Who does what:**

|             | role in the retro                                                                  |
| ----------- | ---------------------------------------------------------------------------------- |
| **steward** | runs it, asks the three questions, **writes `.anthill/retro.md`**                  |
| **seats**   | answer, independently where possible                                               |
| **lead**    | **answers as a participant** — does not curate, does not select                    |
| **scout**   | observes throughout; **speaks after the answers and before the write-up is fixed** |

**scout is not an iceberg.** Standing permission to interject at any point: _"you did that, I noticed
this, ask them about it."_ Its highest-value contribution is likely **the follow-up question nobody
running the process would think to ask** — a blank-context reader asking _"does that number support
the sentence around it?"_ is exactly the shape, and no insider asked it.

**Its live divergence check is worth more in the room than in a later report.** When a seat says X
and the tree says Y, saying so while everyone can still respond beats filing it after the team is gone.

> **⚠ Cascade:** `finalize-session` currently names **the lead** as the retro's writer — added today
> in `81c9991`, because weaver found the store had no named writer at all. This proposal supersedes
> that. **Do not fix one without the other**: a store with two claimed writers is worse than one with
> none, and this is exactly the class of wire-ruling-mutates-a-document defect recorded as H2.

**The retro document goes to a blank-context reviewer before it is filed.** Not optional, and not
the lead's discretionary call — a step.

This is the only instrument that has actually caught a bad retro. Session 4's was corrected by one,
and StoryLoom's lead, on hearing that, checked her own and found the identical structure:

> _"I wrote our retro. I curated it. I set its falsifier. I was its largest subject. And nobody
> blank-context reviewed it. We ran independent review on our CODE and it found two things the whole
> team was structurally incapable of finding. **We ran no independent review on our CONCLUSIONS.**
> The asymmetry was invisible to me until you described yours."_

**Two teams, both reviewing their code and neither reviewing their conclusions.** Moving the retro to
steward removes the conflict of interest; it does not supply an outside frame. **These are different
fixes and both are needed.**

> **Reporting line, so it does not quietly reintroduce the problem:** steward reports to the lead in
> general, but **its retro write-up goes to the human directly, uncurated by the lead.** Otherwise the
> lead is back to selecting the account of a session in which it is the largest entry.

### Output and the decision forum

A **report or investigation in anthill's own docs**, carrying its evidence: what it observed, where
the record and the testimony diverge, and **hypotheses for what to change**.

Then a **three-way conversation — human, lead, scout** — about which experiment the next session
runs. Everyone brings context to that conversation, including the lead, and **that is fine**: the
point is multiple perspectives against shared evidence, not a clean room. **What works works.** A
hypothesis that comes back wrong is more evidence, not a failure of the person who proposed it.

### Cross-project, in parallel

One instance per live session — one on StoryLoom, one here — with a **reconvergence pass** where
instances compare notes. Cross-team patterns are the thing we have never been able to get: every
finding to date is single-team and reconstructed after the fact. HiveMind is the natural home for
whatever survives reconvergence.

### Why cross-project is the point, not a bonus — teams are not equivalent instruments

**StoryLoom runs larger, ships more, and hits things first.** More seats and more dev throughput
means they encounter coordination failures earlier and have to solve them for real rather than in
principle. That makes them a **leading indicator**, not merely a peer:

- **Convergence is strong evidence the gap is in the tool.** Both teams independently invented
  read-watermarks, `## seat → seat:` headings, verdict-first messages, and shared-file hold
  announcements — **with no contact.** Their lead's read: _"two teams independently inventing
  read-watermarks is the strongest evidence either of us has that the gap is in the tool and not in
  our taste."_
- **Divergence is a forecast.** Where they hit something we have not, it is usually volume, and it
  reaches us later. Their heartbeat finding needed a 14-hour session and a multi-hour lane card; ours
  would have taken months to produce.

**A single-team observer cannot see either.** Both signals only exist in the comparison, which is why
this tier is cross-project by construction.

> **Pre-evidence for N4/N5, before the seat exists.** A blind cross-team check-in run today produced
> findings **neither team's record contained** — the heartbeat defect, and _"the lead is the only
> seat nobody audits — it's topology, not carelessness."_ It also cost the lead a large share of a
> session **and produced one over-read** (see steward's precondition). **That is the argument for it
> being a role rather than a lead duty.**

### The tooling gap this exposes

**comms identity is roster-bound.** Per `seams.md` Contract 4(c-bis), `send` and `follow` require a
resolved seat; `read` deliberately does not. So an observer **can already catch up but cannot watch
live** — precisely backwards for an observer. Grapevine's guest model is the right shape and comms
lacks it. Small, well-defined, and a slice-two candidate alongside presence.

## Hypotheses this proposal makes, for the retro to test

- **N0 — An assistant increases the lead's effective capacity.** _Measured by the throughput
  failures it is meant to remove: crossed rulings, claims asserted before their check was read,
  findings relayed before their scope was verified. Falsified if those persist at the same rate with
  steward present._ **This is the seat's actual justification and the first thing to test.**
- **N1 — Adding steward does not reduce peer checking.** _Falsified if the rate of seat-on-seat
  corrections drops in the first session with steward present._ No instruction is changed anywhere,
  which is what makes this a real test rather than an assumption.
- **N2 — A dedicated checker catches things sooner than incidental checking does.** _Measured by
  where in a session findings land — early or at finalize._ Session 4's baseline: every consequential
  find was mid-lane and incidental.
- **N3 — An explicitly-named "check the lead" disposition survives contact.** _Falsified if the lead's
  claims go unchecked for a session with steward present._
- **N4 — A non-participating observer produces findings a participant could not.** _Falsified if
  scout's findings are ones a seat had already reported._

## Open questions

1. **Does steward want splitting later?** Possibly two roles — a pure checker and a pure assistant.
   Starting with one, on the argument that the errands _are_ checks. Revisit if the halves pull apart.
2. **Does scout replace part of the retro, or run it?** Current draft has it _conducting_ the retro
   interview rather than the team self-reporting. That is a bigger change to `finalize-session` than
   it looks, and the retro beat shipped four hours ago.
3. **What happens to a scout finding when the human is unavailable for the three-way conversation?**
   Queuing risks staleness; the lead deciding alone reintroduces the single-frame problem the role
   exists to prevent.
4. **Naming.** `steward` and `scout` are placeholders chosen to fit the existing register
   (`forager`, `weaver`, `sentinel` are ant castes; `maestro` already breaks it). Easily changed.

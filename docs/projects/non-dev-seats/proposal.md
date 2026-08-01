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

### Scope

Takes work off the lead's plate so the lead can hold the shape of the session, rule on what's
contested, and talk to the human. Two halves, and **they are the same activity**:

1. **Errands** — "go find out whether X is true", "read this and tell me what it actually says",
   "hold this context so I don't have to." Anything the lead would otherwise stop to check.
2. **Standing checks** — watches comms and the tree, and verifies premises nobody asked it to.

The insight that makes this one role rather than two: **when the errand is a check, delegation and
independent verification are the same act.** A deputy that merely executes inherits the lead's
framing; a deputy whose executions are verifications does not.

### The disposition — trust but check

> **Trust but check. Assume good faith and verify anyway — including, and especially, the lead.**

This is the whole role in one line, and it is deliberately **dispositional rather than
situational**. Session 4 produced evidence in both directions on which kinds of instruction hold:

- **Dispositional instructions held.** Naming the deference problem on the wire changed behaviour
  within one session — three seats went from accepting the lead's wrong correction on sight to
  checking a wrong ruling before complying. Same team, same day.
- **Situational warnings failed 0-for-4.** They require recognising that the current moment is an
  instance of the warned-about class, and every failure was in the recognition, not the compliance.

**Why the lead is named explicitly:** generic verification was already happening. The seats
mutation-tested a reviewer's claim, re-probed each other's tables, and verified reachability before
building on it. **The one source nobody checked was the lead.** An instruction that says "verify
claims" would have changed nothing; the asymmetry has to be named.

### Boundary against `sentinel`

- **sentinel verifies artifacts** — does the fix work, do the tests fail pre-fix, is the gate green.
- **steward verifies premises** — is the cited thing real, does that number support the sentence
  around it, is the assumption under this work true.

Session 4's clearest illustration: sentinel proved the parser fix worked; a blank-context reader
found the _retro's own numbers_ did not support its claims. Different acts.

### Standing authority — the anti-capture clause

The lead does not set its whole agenda. **A meaningful share of steward's attention is
self-directed** — it checks things nobody asked about, and reports what it finds to the lead **and
to the human**, not through the lead. Without this the role is the lead's instrument and its
independence is bounded by the lead's framing, which is the original problem wearing a new hat.

### Deliberately NOT doing

**No instruction is added anywhere telling the seats that steward handles checking**, and none
telling them they must keep checking. The human's hypothesis, adopted: **absent an instruction to
change, existing behaviour continues** — and a clause about it is itself an intervention that could
cause the diffusion it warns against. Testable; see below.

---

## Role B — `scout` (research tier)

> **Handle:** `scout` · **Tier:** research · **Reports:** to the human · **Never intervenes**

### Scope

Studies **how the team works**, not what it builds. Closest existing analogue is a UX or
team-interaction researcher: watches the coordination channels, reads the tree for what actually
changed, and produces observations, patterns, and **experiments worth running**.

### Method — artifact-first, because we have measured the alternative

Watching the channel alone produces testimony. Session 4's retro marked wire-only events as
`artifact:` and a blank-context reader took it apart on exactly that: _the grapevine leaves no log
in the tree, and quoting our own messages is quoting ourselves._

So scout's conclusions carry **repo evidence** — shas, diffs, timings, test counts — or they are
labelled as impressions. **A claim about the team supported only by what the team said is testimony,
however many members said it.**

### Non-participation is structural

scout never rules, never assigns, never corrects a seat mid-flight. If it sees the team heading
into a wall, it records that and reports to the human. **This will feel wrong in the moment and is
the point** — an observer that intervenes has changed the thing it is measuring, and we have already
recorded that priming a behavioural question taints the answer.

Its presence is stated once at convene and then ambient. **Not hidden** — that would be worse, and
seats performing for an observer is itself an observable.

### Cross-project, in parallel

One instance per live session — one watching StoryLoom, one watching this repo — with a
**reconvergence pass** where instances compare notes. Cross-team patterns are the thing we have
never been able to get: every finding to date is single-team and reconstructed after the fact.
HiveMind is the natural home for whatever survives reconvergence.

### The tooling gap this exposes

**comms identity is roster-bound.** Per `seams.md` Contract 4(c-bis), `send` and `follow` require a
resolved seat; `read` deliberately does not. So an observer **can already catch up but cannot watch
live** — precisely backwards for an observer. Grapevine's guest model is the right shape and comms
lacks it. Small, well-defined, and a slice-two candidate alongside presence.

---

## Hypotheses this proposal makes, for the retro to test

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
2. **Who does scout report to when the human is away?** Reporting to the lead reintroduces the
   framing problem; queuing until the human returns risks the finding going stale.
3. **Does scout need the retro at all**, or does its existence make part of the retro redundant?
4. **Naming.** `steward` and `scout` are placeholders chosen to fit the existing register
   (`forager`, `weaver`, `sentinel` are ant castes; `maestro` already breaks it). Easily changed.

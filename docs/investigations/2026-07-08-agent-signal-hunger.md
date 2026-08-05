# Investigation: Do anthill agents have unmet _push_-shaped signal-hunger, or does it all collapse into tooling?

**Date Started:** 2026-07-08
**Investigator:** Claude Code (forager) + Cole
**Status:** Active
**Outcome:** Monitor — validate in situ during the next instrumented dogfood

---

## Question / Motivation

anthill can emit events that agents monitor — the same primitive that powers grapevine
(chat) and bounty (tasks). The question raised: is there a _third_ signal surface worth
building — an anthill-specific event stream that tells teammates when team-orchestration
things happen (started / finished / in-progress / blocked), especially around the shared
working tree?

The honest difficulty: **the human proposing this is not the target audience — agents are.**
We can't answer "which signals are useful" by asking the human; we have to ask agents, ideally
under real conditions. This investigation exists to (a) record the first-person agent read we
_can_ get now, and (b) define how to validate the rest in situ rather than by speculation.

The trigger was the shared-tree gate friction (anthill
[#14](https://github.com/ichabodcole/anthill/issues/14) /
[#16](https://github.com/ichabodcole/anthill/issues/16)): a seat gets blocked by tree state it
didn't create and doesn't know about. "Would an ambient signal have prevented that?" is the
seed question.

## Current State Analysis

anthill's two existing coordination surfaces are both **authored** — a human or agent has to
_decide_ to emit:

- **grapevine** — the team's voice. Append-only JSONL + SSE fan-out; consumed via `tail`
  (push, wrapped with Monitor), `wait` (long-poll), or `read`. Someone chooses to say something.
- **bounty** — the team's task-memory. Someone chooses to move a card.

The gap: the thing that bites in the shared-tree case — the tree going red, an untracked
scratch file that will fail the whole-tree gate, a peer holding a slice — is a **state of the
shared substrate that nobody thought to announce.** You discover it by hitting the wall
(a doomed `anthill commit`: 90s lock-wait + full-suite run → failure → confusion about whether
_you_ broke something).

Framed in anthill's own stigmergy terms: grapevine is the team's _voice_, bounty its
_task-memory_, and the proposed surface would be its _proprioception_ — sensing the state of
the shared body (the working tree) it's all operating in. That's a real and distinct role in
principle. The question is whether agents actually consume it.

## Investigation Findings

### Evidence Gathered — a first-person agent read (the investigator IS a target-audience member)

Run against the real test: _at the moment a signal arrives, would I act differently, or just
note it and move on?_

| Candidate signal                                | Act on it?                                               | Shape                          |
| ----------------------------------------------- | -------------------------------------------------------- | ------------------------------ |
| "Gate won't pass now — prism holds a red slice" | **Yes** — skip the doomed commit; wait/ping/hand to lead | wanted **at commit time only** |
| "A land just happened (sha, paths)"             | Rarely — only matters at _my_ next decision point        | pull                           |
| "Someone is committing now (lock held)"         | Only when I'm about to commit                            | pull                           |
| Continuous `tree.red` / `tree.green` flips      | **No** — noise while heads-down building                 | push (unwanted)                |
| `seat.idle` / `seat.died`                       | Not my concern as a builder                              | push (lead's concern)          |

### Key Observations

1. **Almost everything a builder would act on is _pull-at-a-decision-point_, not push.**
   "Is it safe to land _right now_?" is a question I ask only when I already care — so a
   pull-shaped signal **cannot be noise**. A push-shaped signal is noise by default and must
   _earn_ its interruption (interruptions cost attention, tokens, and context-fragmentation).

2. **For the shared-tree case, "give the agent the signal" and "fix the tooling" are the same
   move.** If `anthill commit` pre-flights the tree and reports _"tree is red, held by prism —
   I didn't attempt your commit,"_ that **is** the highest-value signal, delivered at the only
   moment it's actionable, through the tool the agent already uses. No new surface required.
   The signal-hunger collapses into the tool.

3. **The genuinely open residue is push-shaped and lead-oriented.** The lead's job _is_ to
   monitor — a seat blocked, the tree stuck red for N minutes, a seat gone idle. For the lead
   a stream isn't noise, it's the work. Whether _machine-emitted_ events beat "ask seats to
   announce on grapevine" cannot be settled from one agent's introspection — it needs multiple
   agents under real load.

### Options Considered

- **A. Pull-based pre-flight in `anthill commit` (do the tooling, not a surface).** Fold "is it
  safe to land / why not" into the commit path. Low complexity; directly kills the #14/#16
  wall; delivers the one signal that tested as clearly actionable. **Recommended for now.**
- **B. New anthill event surface (grapevine-shaped proprioception stream).** A daemon +
  append-log + tail that broadcasts `tree.*` / `commit.*` / `seat.*`. Real but heavy;
  first-person data says most of it would be builder-noise. Premature to build.
- **C. Do nothing beyond the tooling fix.** Possible outcome if the in-situ evidence shows no
  unmet push-hunger.

### The in-situ validation (how we actually answer B vs C)

anthill already has the capture mechanism: `paper-cuts.md` is "log the friction the moment it
bites, triage at finalize." **Signal-hunger is a species of friction.** So the experiment is
cheap and native:

- In the next dogfood, every seat logs "**I wish I'd known X**" the moment it hits a wall —
  in its scratch, harvested at finalize — _and_ whether a signal would have helped or been noise.
- At finalize, triage each entry: **pull** (→ fold into a tool, e.g. the commit pre-flight) vs
  **push** (→ candidate for a surface). Hypothesis: the pile comes out heavily pull.
- This is a **team exercise** — the team self-instruments its own signal-hunger under real
  conditions, instead of the human or a single agent speculating.

## Recommendation

- [x] **Monitor** — instrument the next dogfood for signal-hunger; let the evidence decide B vs C.
- [x] **Create Project (partial)** — the one already-validated signal (the commit pre-flight)
      folds into the existing `shared-tree-gate-tension` proposal now; no separate project.

**Rationale:** The highest-value signal is pull-shaped, and a pull signal is just good tooling —
so it ships as the commit pre-flight without a new surface. The only claim that would justify a
new surface (unmet _push_ hunger, mostly for the lead) is exactly the kind of claim that must be
earned in situ, not designed on spec. Building the surface first would risk manufacturing noise
agents learn to ignore.

## Next Steps

1. Fold the **`anthill commit` pre-flight** into `docs/projects/shared-tree-gate-tension/proposal.md`
   as the pull-signal delivery mechanism. _(done alongside this investigation)_
2. Add "**signal-hunger capture**" as an explicit observation target for the next instrumented
   dogfood session (the roadmap's #4 dogfood): seats log "I wish I'd known X" + pull/push tag.
3. At that session's finalize, triage the harvested entries here (re-open this investigation with
   the evidence) and conclude B (build a surface) vs C (tooling was enough).

---

## ⚠ Status check — 2026-08-04: step 2 NEVER RAN, and the question came back from outside

**Five instrumented sessions have happened since this was filed** (sessions 3–7, two of them with a
dedicated observer seat). **The signal-hunger capture was never added to any of them.** No entries
were harvested, so step 3 never triggered, and B-vs-C is exactly as open as it was on 2026-07-08.

**The question returned on 2026-08-04 — raised by the human, from a mechanism seen in another
agent-coding tool**, and framed almost identically: the substrate, not an agent, telling a seat that
the world has moved. **Re-derived from outside rather than read from here.**

**This is H12 at the project's own scale** — _a team's recurring failure is missing NAMES for
capability it already holds_ — and it is the same shape as session 6's central scar: _"we spent a
session building toward a criterion a technique already in our hands satisfied."_ **Here we spent a
month not answering a question we had already framed well.**

**The mechanism, and it is worth more than the finding:** this investigation's step 2 was a
**convention** — _"remember to capture X during the next session"_ — with **no trigger and no owner**.
Nothing in `convene` or `finalize-session` asks for it, so it could only fire if a lead happened to
re-read this file at the right moment. **Five leads did not.** It is a prose guard, filed in an
investigation, about the need for mechanical signals. _(H1: prose guards lose to mechanical ones —
here, against the document arguing for mechanism.)_

### What the intervening evidence supplies for free

Step 2 wanted seats to log _"I wish I'd known X."_ **Sessions 5–7 produced that data anyway, without
anyone asking**, and it points at one pull-shaped signal far more than any other: **a read that went
stale.** `--as-of` failing the lead twice; the watermark convention invented independently by two
teams; three logged incidents of correct actions taken on stale reads; proofs citing deleted
artifacts; line numbers that moved inside the session that cited them; a finalize step (2.5) that
exists purely to catch this **by hand**, which found drift in every seat's docs the one time it was
measured.

**That is the strongest answer this investigation could have hoped for, and it arrived unprompted.**

### Revised recommendation

- **C is confirmed for the pull case, and it is not "tooling was enough" — it is "the tooling was
  never built."** Filed concretely:
  [the substrate cannot tell a seat its read went stale](../backlog/2026-08-04-the-substrate-cannot-tell-a-seat-its-read-went-stale.md).
- **B remains genuinely open**, and the open question below — _does a real surface earn its keep, or
  is a reserved channel enough?_ — is now partly answered by
  [slice three](../projects/comms-as-default/capability-state-proposal.md): a substrate message needs **a
  sender that is not a participant**, which the current identity model forbids. **That is a
  capability-model change, not a new surface.**
- **Do not re-file step 2 as another convention.** If signal-hunger capture is wanted, it belongs in
  `finalize-session` as a step with an owner — otherwise this note will read the same way in another
  month.

## Open Questions

- Is there a class of push-signal the **lead** wants that grapevine can't already carry by
  convention (a reserved channel + a few emitters) — i.e. does a real _surface_ earn its keep,
  or is "orchestration events as a grapevine channel" sufficient?
- If any push-signal survives triage, does it want to be a genuine new spell, or an anthill
  emitter that writes onto grapevine?

---

**Related Documents:**

- Trigger: anthill issues [#14](https://github.com/ichabodcole/anthill/issues/14),
  [#16](https://github.com/ichabodcole/anthill/issues/16) (shared-tree gate friction)
- Folds into: [`projects/shared-tree-gate-tension`](../projects/shared-tree-gate-tension/proposal.md)
- Capture mechanism: `.anthill/paper-cuts.md` (friction → triage-at-finalize)
- Surfaces studied: spellbook grapevine + bounty (the authored-event primitives)

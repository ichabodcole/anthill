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

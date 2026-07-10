# Investigation: Do anthill seats under-use subagents — defaulting to _implementer_ when they could _orchestrate_?

**Date Started:** 2026-07-09
**Investigator:** Claude Code (forager) + Cole
**Status:** Active
**Outcome:** Monitor — validate in situ during the next instrumented dogfood

---

## Question / Motivation

A convened anthill team gives each **seat** a scope of work. The observed pattern (hypothesis):
seats almost always act as the **hands-on implementer** of their scope — they do the work
themselves — and rarely act as a **manager/orchestrator** who delegates the actual work to
standard **subagents** (the Task/Agent pattern, _not_ tmux panes).

The hypothesis, stated carefully so we don't over-claim:

- A seat _can_ run its scope as an orchestrator: farm out research, parallelizable edits, or
  well-bounded sub-tasks to subagents, and keep the integration/judgment for itself.
- Seats seem to default to DIY. There may be a **subtle framing hint** — "you own this scope,
  you're the seat" — that nudges a seat to feel it must be the one typing, when that isn't
  required and, for some kinds of work, isn't the most efficient shape.
- **This is a hypothesis to test, not a conclusion.** The claim isn't "seats should always use
  subagents." It's: (a) is the under-use real, and (b) do seats even hold the _awareness_ that
  orchestration is an available, legitimate choice they can make deliberately by work-type?

The same honest difficulty as the sibling [signal-hunger investigation](2026-07-08-agent-signal-hunger.md)
applies: **the human proposing this is not the target audience — the agents are.** We can't settle
"do seats under-delegate" by asking the human; we validate it by watching seats work under real
conditions, plus the first-person read a target-audience member (the investigator) can give now.

## Current State Analysis

**The word "subagent" already appears in the skills — but always pointing the _wrong way_ for this
question.** Every current reference frames the seat as _being_ a subagent of the lead, never as
something that _dispatches_ subagents:

- `convene` (SKILL.md:78–84): "**Running seats as subagents instead of terminals?** … dispatch
  each seat as a Task/Agent subagent … you drive each seat directly (dispatch → result)." Here the
  **lead** is the orchestrator and the **seat** is the dispatched hand.
- `join` (SKILL.md:44–45): "**Were you dispatched as a subagent** (not a terminal seat)? … The lead
  drives you directly." Again — the seat is the one being driven.

So across the SOP and skills, a seat is cast in exactly two poses — **terminal hand** or
**subagent-of-the-lead hand**. There is **no framing anywhere that a seat may, in turn, become an
orchestrator of its own subagents.** The vocabulary the seat inherits at join is entirely
implementer-shaped. That is precisely the "subtle context hint" the hypothesis suspects — and it's
not a vibe, it's in the text.

Nothing _forbids_ a seat from spawning subagents (the Task/Agent tool is available to any agent).
The gap is **awareness and permission-to-orchestrate**, not capability.

Relevant existing machinery this would lean on:

- **The living-doc / pheromone model.** A seat's value is the durable trail it leaves in
  `dev/<handle>.md`. A subagent's context evaporates when it returns — so orchestration only
  preserves the trail if the seat **harvests the subagent's findings/problems back into its own
  records.** (This is the user's explicit second sub-part.)
- **Shared-tree commit discipline.** Seats already serialize writes on one working tree (the whole
  shared-tree-gate thread). A seat that fans _writes_ out to parallel subagents could reintroduce
  exactly the tree-collision friction we've been fighting — so the safe default for delegation is
  read/research/analysis work, and delegated _writes_ inherit the same serialization care.

## Investigation Findings

### Evidence Gathered — a first-person agent read (the investigator IS a target-audience member)

Run against the real test: _for a given slice of my scope, would delegating to a subagent actually
serve me better than doing it myself?_

| Kind of work in a seat's scope                        | Delegate to subagent?               | Why                                                                 |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Broad read/research ("map every caller of X")         | **Yes** — strong fit                | Parallelizable, read-only, returns a digest; no tree/context risk   |
| Independent, well-bounded sub-tasks (N similar edits) | **Often** — if boundaries are clean | Parallel throughput; but delegated _writes_ need serialization care |
| Adversarial/second-opinion checks on my own work      | **Yes**                             | Independence is the point; a subagent isn't primed by my reasoning  |
| Tight, interactive, judgment-dense implementation     | **No** — DIY                        | Delegation overhead + context round-trips exceed the benefit        |
| Anything needing my live grapevine/bounty presence    | **No** — DIY                        | A subagent isn't on the wires; can't hold the seat's coordination   |

The read supports a **nuanced** version of the hypothesis: there _is_ unused leverage (the top
three rows), and it's real, but it's **conditional** — the answer is "sometimes, deliberately,"
not "always." Which is exactly the awareness the framing currently doesn't offer.

### Key Observations

1. **The framing gap is real and textual, not imagined.** The skills give a seat only
   implementer-shaped self-models. A seat that never sees "you may orchestrate" is unlikely to
   invent it mid-scope under load. (Confidence: high that the gap _exists_; still-open whether it
   materially changes behavior — that's the in-situ question.)
2. **The right intervention is awareness + judgment, not a mandate.** Because delegation is
   conditional (table above), any codification must say "here's a tool and when it pays," not
   "delegate your work." A mandate would manufacture delegation overhead where DIY was correct.
3. **Orchestration without feedback-capture breaks the pheromone trail.** A subagent's hard-won
   context is lost on return unless the seat folds it into `dev/<handle>.md` (or `paper-cuts.md`
   for tooling friction). So "seats may orchestrate" has to ship _with_ "seats harvest their
   subagents' findings" — the two sub-parts are one feature.
4. **Seat-level delegation collides with shared-tree discipline for _writes_.** Read/research
   delegation is free; parallel-write delegation reopens the tree-collision problem. This bounds
   where orchestration is safe and must be said explicitly if we codify.

### Options Considered

- **A. Do nothing — the implementer default is fine.** Possible outcome if in-situ evidence shows
  seats already delegate when it pays, or that delegation overhead rarely wins on this team's work.
- **B. Add orchestration _awareness_ at join / in the SOP (candidate, not yet chosen).** A short,
  honest note that a seat may act as a manager of its scope — _when the work fits_ (the table
  above) — paired with the feedback-capture obligation and the shared-tree-write caveat. Low
  complexity; docs-only. **Do not author until the hypothesis is validated.**
- **C. A codified orchestration pattern/skill.** Heavier — a named pattern for seat-as-orchestrator
  with dispatch/harvest scaffolding. Premature; only if B proves insufficient.

## Recommendation

- [x] **Monitor** — validate the hypothesis in the next instrumented dogfood before codifying.

**Rationale:** The framing gap is demonstrably real, but whether it actually _suppresses_ useful
delegation — and whether closing it improves outcomes vs. adds overhead — is a behavioral claim
that must be earned in situ, exactly like signal-hunger. Authoring the awareness note now would be
prescribing a fix for an unconfirmed behavior. Validate first; then, if confirmed, the follow-on is
the docs-level awareness + feedback-capture (Option B), not a mandate.

## Next Steps

1. **First-person read is captured** (above) — the leverage is real but conditional.
2. **Instrument the next dogfood** (the roadmap's #4 dogfood; can share the same session as the
   signal-hunger observation): for each seat, observe — did it ever consider/reach for a subagent?
   At any point did it stay hands-on where delegating (research, parallel bounded edits, adversarial
   check) would plausibly have served better? Seats log "**I did this myself where I could have
   delegated**" (and the converse: "delegating here cost more than it saved") to scratch, harvested
   at finalize — the same self-instrumentation pattern signal-hunger uses.
3. **Triage at finalize** here: does the evidence show real suppressed leverage (→ Option B) or
   adequate current behavior (→ Option A)? Re-open this investigation with the harvest.
4. If Option B: decide the home (join awareness vs SOP) and ensure it ships _with_ the
   subagent-feedback-capture obligation and the shared-tree-write caveat.

## Open Questions

- Is the under-use driven by the **framing** (fixable with a note) or by genuine **overhead**
  (delegation round-trips rarely win on this team's judgment-dense work)? The dogfood should
  distinguish these — a seat that _considered_ and declined is a different signal than one that
  never considered.
- What's the lightest **feedback-capture** contract for a seat's subagents — return-value into the
  seat doc? A scratch line? Does it reuse the existing finalize-capture the subagent brief already
  bakes in (convene:83–84)?
- Does seat-level orchestration interact with **per-seat model selection**
  ([proposal](../projects/per-seat-model-selection/proposal.md))? A seat on a cheaper model
  orchestrating targeted subagents is a coherent efficiency shape worth noting if both land.
- Where does delegated-**write** work sit relative to the shared-tree serialization discipline —
  is it simply out of scope for delegation, or does it need its own guidance?

---

**Related Documents:**

- Sibling (same shape, same validation venue): [`2026-07-08-agent-signal-hunger.md`](2026-07-08-agent-signal-hunger.md)
- Current framing to revisit IF confirmed: `plugin/skills/join/SKILL.md` (44–45),
  `plugin/skills/convene/SKILL.md` (78–84), `.anthill/README.md` (SOP)
- Capture mechanism: `.anthill/paper-cuts.md` + per-seat scratch (friction → triage-at-finalize)
- Possible interaction: [`projects/per-seat-model-selection/proposal.md`](../projects/per-seat-model-selection/proposal.md)

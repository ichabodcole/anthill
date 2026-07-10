# Finalize: fresh-eyes review of the just-written seat doc

**Added:** 2026-07-09

At finalize, a seat writes its hard-won lessons into `dev/<handle>.md` **while carrying a full
session of context**. The risk: it writes entries that are legible _to itself_ but lean on
assumptions, implicit references, or context a **fresh next-session occupant won't have** — so the
pheromone trail reads clearly to the author and confusingly to the very agent meant to inherit it.
That defeats the stigmergy premise: agents are ephemeral, the docs are what's durable — but durable
only helps if the fresh agent can actually _parse_ them.

**Proposed methodology addition (finalize-session, Per-seat step 2):** after a seat writes/updates
its seat doc, it spins up a **fresh subagent that reads only that doc, cold** (no session context)
and **reports comprehension** — what's clear, what's ambiguous, what assumes unstated context, what
questions a new occupant would have. The seat (which still holds the context this session) then
**revises to close the gaps**. The reviewer's job is to _surface_ gaps, **not rewrite** — it lacks
the ground truth to fill them correctly; only the context-rich seat can. Optionally iterate once.

This is a concrete, beneficial instance of a seat acting as an **orchestrator** (using a subagent
for real work — see the [seat-subagent-orchestration investigation](../investigations/2026-07-09-seat-subagent-orchestration.md)),
and it's **prime-safe** (a readability check doesn't perturb anything being measured).

**Status: hypothesis / idea capture.** Confirmed we don't do this today (finalize has no fresh-eyes
step). Cheap to try; validate the payoff on a real finalize before baking it in permanently.

## Acceptance Criteria

- [ ] finalize-session's Per-seat synthesis gains a fresh-subagent readability review of the
      just-written seat doc, with the "report gaps, don't rewrite" division stated.
- [ ] Guidance on when it runs (e.g. only when the doc changed materially) so it isn't dead weight
      on a no-op finalize.
- [ ] The stigmergy rationale (durable trails must be legible to a fresh occupant) is named so the
      step reads as principled, not ceremonial.

## Open Questions

- Run for **every** seat every finalize, or only when the doc saw substantial change? (Cost is one
  extra read-only subagent per seat — cheap, but not free.)
- Does the reviewer just flag, or also pose explicit questions the seat answers inline? (Leaning:
  flag + questions; the seat resolves.)
- Is this its own step, or folded into the existing subagent-mode capture the brief already bakes in?

## References

- `plugin/skills/finalize-session/SKILL.md` (Per-seat synthesis, steps 1–2)
- Grounding principle: HiveMind scenario `fresh-context-verification-over-self-review`
- Related: [seat-subagent-orchestration investigation](../investigations/2026-07-09-seat-subagent-orchestration.md)

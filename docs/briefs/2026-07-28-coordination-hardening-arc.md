# Brief: the coordination-hardening arc

**Status:** Active · **Owner:** Cole + maestro · **Created:** 2026-07-28
**Source:** [shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md)
(eleven mechanisms, four evidence sources, including a live 7-seat interview and finalize report)

The plan for what we do about the operator-mono findings — and, separately, what we deliberately
leave alone.

---

## The finding that shapes the whole arc

The eleven mechanisms split almost evenly, and **the two halves have completely different economics**:

|                  | Mechanisms                                                                                                | Fixable with existing tooling?                 |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Tooling**      | M1 index · M2 gate · M3 tree contamination · M4 runtime · M5 history                                      | **Yes** — mostly with git as it stands         |
| **Coordination** | M6 semantic · M7 livelock · M8 lead latency · M9 invisible waiting · M10 plan drift · M11 invisible scope | **No** — no tooling change touches any of them |

Only **M6** has a working mechanism today (the seams + ratify gate). **Five of six coordination
mechanisms have no proposed fix of any kind**, and two of them — M7 and M8 — have measured costs.

This is why the arc is sequenced tooling-first but **not** tooling-only: the tooling work is cheap and
well-understood, and finishing it is what lets us see whether the coordination limits are the real
ceiling.

## The governing principle: constrain the plumbing, leave the collaboration fuzzy

The risk in this arc is over-correction — building a straitjacket that removes the friction _and_ the
value. The evidence that this is a live risk, not a hypothetical:

- The ratify gate's whole yield comes from seats **pushing back**: five of seven seams falsified,
  including a privilege-escalation hole no test caught.
- Sol's phrasing is the tell: _"the seams that were **negotiated** fit at integration; the one shape a
  seat built past a contract was wrong in three places."_ Negotiated, not specified.
- Over-specify the skeleton and you get **compliance instead of falsification** — which is precisely
  the [skeleton finding](../backlog/2026-07-28-plan-skeleton-states-contracts-not-implementations.md):
  implementation-shaped claims forced five owners into archaeology.

So the rule for every item below: **mechanical failures get mechanical fixes; judgment-bearing
interactions stay negotiable.** Fixing the index costs no judgment. Scripting "who talks to whom,
when" costs exactly the judgment we are paying for.

---

## Phase 1 — the ratify-gate pass (cheapest, highest yield, no dependencies)

Three items sharpening the mechanism that already works best. Independent of the entire git question;
all are skill text. **Land as one pass.**

1. **[Skeletons state contracts, not implementations](../backlog/2026-07-28-plan-skeleton-states-contracts-not-implementations.md)**
   — _"would have saved most of a session."_ The gate is not the expensive part; badly-shaped input
   to it is.
2. **[Say where a ratification ends](../backlog/2026-07-28-seam-ratification-granularity.md)** — a
   ratified seam relied on past its stated extent silently manufactures a new one.
3. **[Runtime claims need a measured repro](../backlog/2026-07-27-ratify-runtime-claims-need-repro.md)**
   — memory is reliable for API shape and plausibly-wrong for runtime behavior.

**Why first:** highest value per unit of effort in the entire backlog, zero coupling to anything
unresolved, and it improves the instrument we will use to build everything else.

## Phase 2 — close the M2 gate question

**Evaluate the staged-snapshot gate before evaluating isolation.** It targets the mechanism both
teams rank costliest, at a fraction of isolation's cost, with no tree-topology change.

- Prove the two preconditions first: safe nesting with `lint-staged`'s own stash, and safe restore on
  failure. **A gate that can lose a peer's uncommitted work is worse than the jam it fixes.**
- The hook belongs to the **host project**, so anthill's role is to **detect and recommend**, never to
  rewrite — this is a bootstrap/preflight affordance, folding in the
  [open half of bootstrap host-adaptation](../backlog/2026-07-27-bootstrap-host-adaptation.md).

**If this works, the isolation question becomes much less urgent** — which is the point of doing it
first.

## Phase 3 — ship the branch strategy (M5)

[`session-branch-strategy`](../projects/session-branch-strategy/proposal.md), design already resolved:
convene offers a feature-scoped branch, finalize asks and squash-merges, one `branch{}` config block.
Also **unblocks the protected-trunk guard** already planned in
[`anthill-commit-hardening`](../projects/anthill-commit-hardening/plan.md).

Independent of phases 1–2; sequenced third only because it is the least painful of the three.

## Phase 4 — the coordination mechanisms (the part nothing addresses)

Currently unowned. Ordered by evidence, not by ease:

- **M9 — invisible waiting.** Two halves. The **documentation half ships immediately**: the skills
  imply the lead is an exclusive human channel, and `anthill spawn`'s tmux topology makes that false
  by construction. The **instrumentation half** is open — correct waiting has no stall signature.
  Related: [#58](https://github.com/ichabodcole/anthill/issues/58).
- **M10 — plan drift.** A "reconcile the plan" beat after any ruling that falsifies a seam. The
  shipped finalize owner-reread beat catches this only at the end, and only for seat-owned docs.
- **M8 — lead ruling latency.** The single-writer bottleneck. **No cheap fix; likely architectural.**
  See the open question below on which ceiling actually binds.
- **M7 — livelock by politeness.** Partially addressed by today's unstage-on-failure (`2170636`),
  which removes the mechanical half of the loop. The social half — everyone yields, nobody drains —
  remains, and _more courtesy makes it worse_.
- **M11 — invisible scope.** A scope can name a function (the shape we recommend) and still hide an
  undelivered deliverable. Belongs with bootstrap's composition step and the board model.

## Phase 5 — SOP language for things teams keep rediscovering

Cheap, and each has field evidence:

- **Convergence is only evidence against an EXTERNAL invariant.** _"Agreement about a shared artifact
  is weaker than agreement about an external invariant"_ — the difference between the ratify gate
  working and a room agreeing with itself. anthill has no words for this and it is a live hazard for
  any system that treats consensus as a signal.
- **Status is a moment; content is a fact.** Five seats read four contradictory `git status` results
  within seconds, all correct when taken; everyone who checked content agreed. A consequence of
  `anthill commit`'s own index mutation.
- **Provenance-first messaging.** Grown spontaneously and universally by one team, written nowhere.

---

## Explicitly NOT in this arc

- **Per-seat worktree isolation.** Held pending phase 2 and the open cost questions. Adopting it now
  would be optimizing for the loudest mechanism rather than the costliest.
- **Anything that scripts seat-to-seat interaction.** See the governing principle.
- **A fix for every mechanism.** Some fuzziness is the working state of a healthy team, not a defect
  queue to drain.

## Open questions this arc is designed to answer

1. **Which ceiling actually binds?** The tree ceiling (_"at 7, someone is always staged"_) is fixable
   with tooling. The lead ceiling (_"seven seats generate findings faster than one lead can rule
   on"_) is architectural. **Testable prediction: fix the plumbing in phases 2–3 and the practical
   team-size limit does not move** — because the lead was the binding constraint all along. If the
   limit does move, M8 is less central than it looks.
2. **Is there an optimal team size, or just a window?** Lower bound is real — cross-verification
   _"does not exist at 2 seats and it's the main argument for the headcount."_ Upper bound is
   contested per (1).
3. **How much of this is git being the wrong substrate?** git assumes one tree per developer,
   minutes-to-hours between commits, rare human-resolved conflicts, and the commit as the unit of
   coordination. Multi-agent work violates all four at once. Tracked separately — see below.

## Related

- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md) — the
  evidence base for everything here.
- **Two companion write-ups are planned and are deliberately not this document:** a narrative account
  of the study for an outside reader, and an exploration of what version control designed _for_
  multi-agent development might look like. Neither is a plan; both are thinking.

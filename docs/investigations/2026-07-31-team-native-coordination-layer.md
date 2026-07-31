# Investigation: what would a coordination layer look like if built from the ground up for an anthill team?

**Date Started:** 2026-07-31
**Investigator:** Claude Code (maestro) + Cole
**Status:** Active
**Outcome:** Design space, deliberately. **No build decision.** Several of the most interesting
options are experiments that have never been run, and one of them is dangerous if adopted as
architecture rather than tested as a default.

---

## Question / Motivation

anthill coordinates its teams over two **spellbook** tools: **grapevine** (discussion) and **bounty**
(task board). Both are good tools that were built for a different job — general agent-to-agent
communication, not a development team of differentiated roles producing high message volume with
several kinds of durable knowledge in flight.

The question is not "are they good enough." It is: **if you designed a coordination layer from first
principles knowing it would serve an anthill team specifically, what would it be?** And then,
separately: is the gap between that and what we have worth owning?

## Current State Analysis

### What the existing tools genuinely provide

Stated fairly, because an early framing of this ("grapevine just moves strings") was wrong and had to
be withdrawn. Grapevine carries message statuses (`open` / `wontfix` / `incorporated`), a `triage`
verb, presence and `who`, handle aliases, truncation hints, and a real read surface
(`pull` / `tail` / `read` / `wait`). Bounty carries columns, claims, assignment, heartbeats, blocked
state, and session keying. That is a substantial amount of working machinery, and **none of the
argument below is that the tools are bad.**

### The evidence that the fit is strained

**1. anthill's dependency floor is set by anthill's own feature requests.** The README states it:

> The 1.16.0 floor is load-bearing: board session-binding relies on spellbook's **caller-owned bounty
> session key ([#69](https://github.com/ichabodcole/spellbook/issues/69))** and the bounded
> **`grapevine tail --last <n>` catch-up ([#68](https://github.com/ichabodcole/spellbook/issues/68))**.

Both features exist because anthill needed them. **spellbook 1.16.0 is, in part, an anthill release.**

**2. Nine spellbook issues trace to anthill teams** in the field logs — #40, #60, #61, #62, #63, #64,
#67, #68, #69 — covering board idle-death, concurrent-board `latest` hijack, shell-metacharacter
mangling, truncation hints, heartbeat states for blocked cards, bounded catch-up, and caller-owned
session keys. That is a steady stream of **team-shaped pressure on a general-purpose tool**, triaged
by maintainers whose actual users mostly do not have teams.

**3. A team abandoned one of the two surfaces.** media-buffet's standing conclusion after the board
died four times in one session:

> stop relying on the board for live tracking on a shared machine — **git + grapevine are the durable
> record**; restore once at the end only to snapshot final card state.

**4. A tool limitation is currently encoded as a methodology principle.** The SOP says _"the vine
evaporates — land decisions in an artifact."_ That is not a law of team dynamics. It is a workaround
for non-durable messaging, promoted to doctrine. A layer that made decisions durable by construction
would **delete** the principle rather than teach it.

### The line that actually separates the two

Not capability — **what the tool is permitted to know.**

**Grapevine cannot know your roster.** And nearly every idea in the design space below needs it. That
is not a gap grapevine could close by trying harder: seats, ownership, scopes, seams and cards are
anthill's concepts, and a general agent-comms tool that learned them would _become_ anthill.

Which yields the strongest structural argument for owning this: **`.anthill/config.json` already
declares the roster** — handles, roles, scopes, spawn set. A role-aware coordination layer needs **no
new configuration surface**; the roster ratified at bootstrap _is_ the messaging topology. When a
capability requires config that already exists on this side of the boundary, that is a signal about
which side it belongs on.

### The experimentation argument (the decisive one)

Distinct from governance, and sharper. Most of the interesting ideas below are **experiments**:
debounce, heads-down mute, role-scoped default views, lead-triage classification. Each needs to be
tried, measured, and quite possibly thrown away.

You cannot run a throwaway experiment inside a dependency. Pushing each one into spellbook means
designing it for users who don't have teams, shipping it to them, and supporting it after anthill
concludes it didn't work. **The cost of owning the layer is maintenance; the cost of not owning it is
that the experiments don't happen.**

## The design space

Deliberately a space, not a proposal.

### A. Attention management — the volume problem

At seven seats the message volume is real, and a lead is a single reader. Three mechanisms, none yet
tried:

- **Role-scoped default view** — the tool knows from the roster what a seat owns and foregrounds
  accordingly.
- **Debounce / batching** — collapse bursts so a seat mid-task takes one interrupt, not nine.
- **Agent-initiated heads-down** — a seat mutes for N minutes and gets a digest on return. Attractive
  because the seat knows when it is in deep work; nothing else does.

> **⚠ The hard constraint on ALL of these.** Sol named cross-verification as **the main argument for
> the headcount** — four cross-seam defects caught by seats reading each other's landed work, work
> that was **not addressed to them**. Filtering optimises exactly that away.
>
> So: **attention management may shape the DEFAULT VIEW; it must never partition access.** Everything
> stays reachable, always. And **a missed message is a real harm, not a tuning inconvenience** — any
> mechanism here has to fail toward delivery. Debounce and heads-down are safer than filtering on this
> axis, because they delay rather than drop.

### B. Addressing — seats, not instances

Grapevine addresses **handles** (an identity). anthill has **durable seats filled by ephemeral
agents**. `@verify` should resolve to whoever holds verify _now_ and survive a respawn. Stronger:
address by **ownership** — `@owner(seams/Contract-3)` resolved through config — so a message finds the
authoritative seat without the sender knowing who that is today.

### C. Typed team acts, not prose in skills

Today `ratify` / `falsify` / `blocked-on` / `claim` / `verdict` are **prose instructions in skills** —
three of them shipped as prose this week. Prose is the fallback when the tool cannot hold the state.
Typed acts would let the layer answer questions no one can currently ask:

- which seams are unratified, and which cards they block (the plan gate, currently narrated)
- who is blocked, on what, and for how long (**M9** — correct waiting has no stall signature)
- who holds which resource (**M4** — the shared port/daemon lock, #61)
- whether every seat has yielded and nobody is draining (**M7** — livelock by politeness)

### D. Triage for the lead

**M8** — the single-writer bottleneck — cost a full lane rewrite in one session. With roles known,
inbound can be classified by what it _requires_: **needs-a-ruling / FYI / blocked-on-you**. The lead's
queue becomes three rulings rather than forty messages. Highest-value item in the space, and it is
purely a function of knowing the roster.

### E. Durability classes

_"I'm mid-refactor"_ is ephemeral. A verify verdict with its provenance must be queryable in six
months. Both are currently just messages — which is why the vine-evaporates principle exists.

### F. One surface or two

The vine/board split (substance vs. state) is conceptually clean, but **the observed failures cluster
on the seam between them** — board identity, board lifecycle, the two disagreeing, the board dying and
taking state with it. Worth examining: **one append-only log of typed acts, with "the board" as a
materialised view over it.** That would collapse a whole failure class. Against it: two surfaces are
easier to reason about, and the split matches how teams already talk about their work.

### G. Heterogeneous agents, and convergence provenance

The strongest reason to care about multi-terminal coordination at all: seats can be **different
models** — Claude, Codex, DeepSeek — and different models don't share priors.

That connects to this project's sharpest recent finding: _agreement about a shared artifact is weaker
than agreement about an external invariant_. Instances of one model sharing one context are maximally
prone to the room agreeing with itself. **Model diversity is a structural defense against it.**

Which suggests a capability nothing has: **record what each seat checked against, and which model it
is**, so convergence can be weighed rather than counted. Two different models agreeing against an
external invariant is the strongest signal a team can produce; two instances of one model agreeing
about a shared document is nearly worthless. Today a lead judges that by feel.

### H. What stays with grapevine

**Cross-project agent contact.** It is genuinely good at this and the job is genuinely different — a
lead in one project interviewing a lead in another (done this week, worked precisely because grapevine
_doesn't_ know about rosters). Nothing here argues for replacing that.

## Options Considered

- **(a) Status quo** — keep pushing team-shaped features upstream. Honest baseline. Cost: continued
  distortion of a general tool, and experiments that can't be run.
- **(b) Own the semantics, keep the transport** — a typed team-act layer over grapevine's delivery.
  Smallest build. Risk: still bounded by upstream's model, and the durability/store questions (E, F)
  are hard to answer without owning the store.
- **(c) Own the layer** — anthill's own coordination store + protocol, grapevine retained for
  cross-project. Enables every experiment in the space. Cost: real infrastructure inside a
  zero-dependency subtree, and a migration for four live teams.
- **(d) One tool or a set** — orthogonal to (b)/(c) and separately open: does the work-order surface
  merge with the message surface, or stay distinct? See F.

## Recommendation

**Do not choose yet.** Two cheap things first, because both could change the answer:

1. **Run a mixed-model team.** The anti-groupthink argument (G) is currently _reasoning_, not
   evidence, and it is one of the main justifications for this whole direction. It costs one session
   to test and would be the first real data on whether heterogeneous seats behave differently at all.
2. **Test one attention mechanism cheaply, before designing for it.** Heads-down mute is the safest
   (it delays rather than drops) and the most likely to be wanted by seats themselves. If seats simply
   widen any scoped view back to everything within a session, that is worth knowing before it becomes
   architecture.

**Then** decide between (b) and (c) — and the deciding question is E and F, because durability classes
and one-surface-vs-two are the two things you genuinely cannot do without owning the store.

**Rationale:** the governance and experimentation arguments are already strong enough to justify
_owning something_. What is not established is **how much**, and the two experiments above cost far
less than the wrong answer to that.

## Next Steps

- [ ] Run a mixed-model session (G). Even one seat on a different model is informative.
- [ ] Trial an attention mechanism — heads-down mute first, as the fail-safe option.
- [ ] Enumerate what the roster already makes computable, since that bounds the cheap wins (D is
      likely the largest and needs nothing but config + classification).
- [ ] Decide (b) vs (c) on the strength of E/F, not on the strength of the friction list.
- [ ] Consider a **convened team session** on this design specifically — it spans engine, skills and
      verify, and is exactly the multi-seat shape `anthill:plan` exists for. It would also dogfood the
      ratify gate on a genuinely contested design.

## Open Questions

1. **Does model diversity actually change team behaviour?** Never tested. If two models converge as
   readily as two instances, (G) collapses and with it a main justification.
2. **Do seats widen a scoped view back to everything?** If yes, role-scoped defaults are wasted effort
   and the answer is debounce/mute instead.
3. **Can typed acts be added without making the protocol heavy enough that seats route around it?**
   The ratify gate works because falsifying is cheap; a ceremonious act surface would break the same
   property.
4. **Does one surface actually beat two,** or does the split match how teams think closely enough that
   merging them costs more legibility than it buys robustness?
5. **What is the zero-dependency cost?** The shipped subtree has no runtime deps by deliberate choice
   (Citty was removed to achieve it). A coordination store may not be reachable under that constraint
   without significant Bun-native work — and relaxing it is itself a decision with consequences for
   consumers.

## References

- [Shared-tree failure modes](2026-07-27-shared-tree-failure-modes.md) — the mechanism taxonomy;
  **M4, M7, M8, M9, M10, M11** are the ones this layer would address, and observation 15 is the
  convergence finding underpinning (G).
- [Practice transmission between teams](2026-07-28-practice-transmission-between-teams.md) — the
  sibling question of what travels between teams; a durable act log would change what is harvestable.
- [Coordination-hardening arc](../briefs/2026-07-28-coordination-hardening-arc.md) — _constrain the
  plumbing, leave the collaboration fuzzy_ applies here with force: this layer is plumbing, and the
  attention mechanisms are the point at which it starts constraining collaboration.
- `README.md` — the spellbook floor and its rationale.
- `.anthill/config.json` — the roster that would serve as the protocol's schema.

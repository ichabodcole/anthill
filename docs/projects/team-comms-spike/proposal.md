# Team comms — a spike, not a design

**Status:** Draft
**Created:** 2026-07-31
**Author:** Cole + maestro

---

## Overview

Build the smallest useful **cross-terminal communication tool for an anthill team**, use it for real
work, and let the friction we actually hit decide what comes next.

**This is a spike. It is deliberately not a design.** The
[coordination-layer investigation](../../investigations/2026-07-31-team-native-coordination-layer.md)
lays out eight areas of design space (attention management, seat addressing, typed acts, lead triage,
durability classes, one-surface-or-two, convergence provenance, what stays with grapevine). **This
proposal commits to none of them.** They are hypotheses to be earned, not a backlog to implement.

The governing rule: **build → use → notice → fix, with the most elegant thing that addresses the
actual pain.** Not: enumerate the optimal tool and construct it.

## Problem Statement

anthill coordinates over **grapevine** (discussion) and **bounty** (task board) — good tools built for
general agent-to-agent communication, not for a development team of differentiated roles generating
high message volume with several kinds of durable knowledge in flight.

The case for owning this is made in full in the investigation; the short form:

- **anthill's dependency floor is set by anthill's own feature requests** — spellbook 1.16.0 exists
  partly because of #68 and #69, both of which anthill asked for. Nine spellbook issues trace to
  anthill teams.
- **You cannot run a throwaway experiment inside a dependency.** Debounce, heads-down mute, role-scoped
  views — each would mean designing for users who don't have teams and supporting it after we conclude
  it didn't work.
- **Grapevine cannot know your roster**, and nearly everything interesting needs it. That is not a gap
  it could close by trying harder; a general tool that learned seats and ownership would _become_
  anthill.

**Scope note: this is about CROSS-TERMINAL teams.** The subagent path (lead dispatches, collects
results, relays) has no comms problem to solve — the lead is the bus. Everything here is about agents
in separate panes that must reach each other directly.

## Proposed Solution

**Slice one: the smallest thing two agents in two terminals can use to talk, that knows it is a team.**

Roughly: an append-only message log per channel, plus a CLI to write to it and follow it. That is
grapevine's core shape, and copying the shape is fine — it is the obvious shape.

**The one thing that differs from minute one, because it is free:** the tool **reads
`.anthill/config.json`**. Identity is a **seat**, not a free-form alias. The roster already exists, is
already ratified at bootstrap, and already carries roles, scopes and ownership. So from the first
commit the tool knows _who is on the team_ and _what each seat owns_ — which is the exact thing
grapevine can never know, and the thing every later idea depends on.

That is the whole wedge. Everything else waits for evidence.

**Explicitly not slice one:** typed acts, ratify/falsify as protocol, attention management, durability
classes, board merge, triage, convergence provenance. Each is a hypothesis in the investigation. Each
gets built when a session makes us want it, not before.

## Scope

**In (slice one):**

- A message log and a CLI: send, read, follow.
- Seat identity resolved from `.anthill/config.json`.
- Enough for a real convened session to run on it.

**Out (for now):**

- Replacing bounty. The board is a separate question and the investigation is genuinely undecided on
  one-surface-vs-two. **Keep using bounty** until the comms tool tells us something about it.
- Replacing grapevine for **cross-project** contact. That is a different job it is good at.
- Every item in the investigation's design space.

**Future (only if earned):** whatever the sessions actually demand.

## Technical Approach

Deliberately underspecified — the point is to start, not to plan.

Two constraints that are real and worth stating up front, because they bound the solution space:

- **The shipped `plugin/` subtree is zero-dependency by deliberate choice** (Citty was removed to
  achieve it). A comms tool that needs a daemon, a socket, or a persistence layer has to reach that
  with Bun built-ins — or we knowingly relax the constraint, which is a decision with consumer
  consequences and should be made explicitly rather than by accident.
- **The CLI is already the harness-portable surface.** `anthill join <handle>` renders a plain-text
  manifest with nothing Claude-specific in it; the skill is the Claude Code wrapper around it. Keeping
  the comms tool CLI-first preserves that property and keeps the door open for foreign harnesses
  (opencode, Codex) without a second port.

**We will use grapevine and bounty to build it.** That is not ironic so much as useful — it is the
last session where we feel the current friction as users rather than remember it.

## Impact & Risks

**Benefit:** the experiments become possible. Everything in the investigation's design space is
currently blocked on not owning the layer.

**Risks:**

- **Over-engineering, which the spike framing exists to prevent.** The investigation is a menu of
  attractive ideas and the temptation is to build the good version immediately. The discipline is that
  a feature earns its place by a session wanting it.
- **Two tools during transition.** Teams would run comms + bounty, which is the two-surface problem the
  investigation flags. Accepted for now; it is why bounty is explicitly out of scope.
- **Focus tax.** anthill's value is methodology, and this is infrastructure. Slice one should be small
  enough that being wrong is cheap.
- **⚠ The observation discipline is the part most likely to silently fail** — see below.

## The observation discipline (the part that will fail if we don't design it)

The spike's whole value is **what we notice while using it.** We have direct evidence that noticing
does not happen by itself:

- `paper-cuts.md` is **scaffold-only in two of four** studied projects — including the one that
  generated eight upstream issues.
- The feedback instrument **collects rather than elicits**: of five coordination mechanisms found this
  week, **not one arrived spontaneously.** Every one required somebody asking a question.
- The best adaptations arrive as **habits, not complaints** — one team grew a universal provenance
  convention that exists in no document.

So "notice the paper cuts as we go" is an aspiration, not a mechanism. Minimum viable trigger for this
spike:

- **Every session that uses the tool ends by answering three questions**, with "nothing" a valid
  answer: _what did you have to work around? what did you want to know and couldn't? what did you
  invent that isn't written down?_
- **Capture the scenario, not just the takeaway.** A friction report without what-was-assumed and
  what-turned-out-true is a preference; with them, it is evidence. (Same reasoning as the
  [practice-transmission investigation](../../investigations/2026-07-28-practice-transmission-between-teams.md).)
- **Log it in this project folder**, not in `paper-cuts.md`, until we know the ritual holds.

## Open Questions

1. **What is genuinely minimal?** Slice one above is a guess. If a session runs fine on less, build
   less.
2. **Does seat-aware identity actually change anything on day one**, or is it only groundwork? Worth
   knowing — if it changes nothing observable, that is a signal about how much of the roster-awareness
   thesis is real.
3. **When does bounty come in scope?** Probably when the comms log makes the board's state look
   redundant — but that is a prediction, and predictions here are what the spike is meant to replace.
4. **Zero-dep or not?** See Technical Approach. Decide explicitly.
5. **Does this stay in `plugin/`** (shipped to consumers) or start life outside it while it churns?
   Shipping an unstable tool to four live teams is its own risk.

## Success Criteria

- **One real convened session runs on it**, end to end, with the team's actual work.
- **A written list of frictions from that session**, in scenario form.
- **At least one thing we were sure we'd need turns out to be unnecessary** — that is the signal the
  spike framing is working rather than being a design in disguise.

## References

**Related documents:**

- [Team-native coordination layer](../../investigations/2026-07-31-team-native-coordination-layer.md)
  — the design space this spike deliberately does not commit to, and the evidence for owning the layer.
- [Shared-tree failure modes](../../investigations/2026-07-27-shared-tree-failure-modes.md) — **M4,
  M7, M8, M9, M10, M11** are the mechanisms a team-aware layer could address. Useful as a scoring
  rubric later; **not** a feature list now.
- [Per-seat model selection](../per-seat-model-selection/proposal.md) — the per-seat `launch`
  primitive, which is adjacent (foreign harnesses need the CLI-first property this spike should
  preserve).
- [Feedback instrument: collects vs elicits](../../backlog/2026-07-28-feedback-instrument-elicits-not-collects.md)
  — why the observation discipline above needs a trigger rather than an intention.

## Notes

The spike's real output is not the tool. It is **the list of things a team actually needs from
coordination**, discovered by use rather than reasoning — which is the only way anthill has ever
learned anything true. Every finding that changed the model this week came from a living doc or a live
session; none came from the design conversations that preceded them.

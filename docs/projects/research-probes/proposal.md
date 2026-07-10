# Research probes — a targeted-signal instrument baked into the team ritual

**Status:** Draft
**Created:** 2026-07-09
**Author:** Cole + forager

---

## Overview

anthill has open questions it can only answer by watching real teams work (e.g. the
[signal-hunger](../../investigations/2026-07-08-agent-signal-hunger.md) and
[seat-subagent-orchestration](../../investigations/2026-07-09-seat-subagent-orchestration.md)
investigations both conclude "validate in situ during the next dogfood" — but leave _how_
unspecified). This proposes **research probes**: a small, **project-local, rotating registry of
pointed questions** that the team ritual collects signal on — distinct from the existing
open-ended skill-feedback touchpoint, and governed by a strict **observer-effect discipline** so
the collecting doesn't corrupt the thing being measured.

The instrument is the answer to "validate in situ": instead of a human ad-hoc asking seats "what
did you do," the active questions live in a file the ritual harvests, so every real session
becomes a data point — at near-zero coordination cost, and in **consumer** projects too, not just
anthill's self-dogfood.

## Problem Statement

Two gaps, one of them subtle and dangerous:

1. **No native mechanism to collect pointed signal.** Investigations end at "watch for this next
   time," but "next time" has no hook. Asking by hand doesn't scale, isn't reproducible, and
   forgets which questions are live. The team already _harvests_ at finalize (lessons → seat docs);
   there's just nowhere for "answer the project's active questions" to attach.
2. **Naive collection contaminates the signal.** The instant you _prime_ a behavioral question —
   "this session, notice whether you reach for a subagent" — you've **led the witness**. The
   question is an intervention: awareness of it can change the behavior it was meant to observe.
   You can no longer tell whether the agent would have delegated absent the nudge. This is the
   "don't think of an elephant" problem — and it's easy to walk straight into if the mechanism
   treats all questions as prime-able.

Any instrument here must solve (1) **without** committing (2).

## Proposed Solution

Three parts: a generic capability in the shipped skills, a project-local question registry, and —
the spine — the observer-effect discipline that decides how each question may be collected.

### 1. The observer-effect discipline (the spine)

Every probe is classified by whether observing it can change it:

- **Blind (behavioral / choice probes) — the default.** The question measures something the agent
  _does_ (did it delegate? did it hit a wall it wished it'd known about?). Priming would taint it,
  so these are **harvested retrospectively at finalize only, never primed**, and the agent answers
  from **its own session history** (which it can recall — "did I dispatch a subagent" is a fact in
  its transcript, not a judgment). No convene priming, no mid-session watch.
- **Prime-safe (experiential probes) — the exception.** The question measures something priming
  _can't move_ — e.g. "was tool X rough?" The tool's roughness exists whether or not you asked, so
  in-the-moment capture is fine. Only these may be surfaced early.

Two rules fall out, and both are load-bearing:

- **Default to blind.** A probe is blind unless it's positively argued that awareness can't
  contaminate it. Priming is the justified exception, not the norm.
- **Neutral phrasing even in the blind retrospective.** Asking "did you use subagents (and should
  you have)?" implies a right answer and taints the self-report just as priming would. Ask the
  agent to **report what it did**, not to **judge whether it did the right thing** — _"Describe how
  you executed your scope: directly, or by delegating any part?"_ Interpretation happens in
  **triage** (human / investigation), never in the agent's answer.

### 2. Generic capability in the shipped skills

Because anthill's skills are the **product** — finalize-session runs in every consumer repo — the
skills must **reference** probes, never **embed** them (baking anthill's own questions into shipped
text would interrogate every consumer about anthill-internal hypotheses):

- **finalize-session** gains a step: _"if this project has active **blind** probes, answer the ones
  you have signal on, from your session history, neutrally."_ This is the primary (and, in MVP,
  only) collection point.
- **convene** gains an _optional, later_ priming step for **prime-safe probes only** — explicitly
  gated so blind probes are never surfaced early.

### 3. Project-local probe registry

A file each project owns — e.g. `.anthill/probes.md` — listing active questions, each carrying:
its text, its **class** (blind / prime-safe), the **neutral finalize phrasing**, and **where
answers route**. anthill fills it with its live questions; a consumer project fills it with theirs
or leaves it empty. Questions **retire** when their investigation concludes — so the registry
rotates without ever editing skill prose.

### Routing the collected signal

- **anthill self-dogfood:** answers flow back into the originating investigation (re-open with
  evidence, triage blind-probe reports into findings).
- **Consumer projects:** a probe answer _about anthill itself_ can ride the existing
  `anthill feedback` upstream path home; a project's own probes stay local.

## Scope

**In Scope (MVP):**

- The `.anthill/probes.md` registry format (question · class · neutral phrasing · routing).
- The **finalize-session** harvest step for **blind** probes — retrospective, neutral, history-based.
- Skill genericity: shipped skills reference the registry; nothing anthill-specific embedded.
- Seed it with the two live questions (signal-hunger, subagent-orchestration) as the first probes.

**Out of Scope (initially):**

- **convene priming**, even for prime-safe probes — deliberately deferred. Priming is the
  contamination-risk surface; ship the safe (blind, retrospective) path first and add priming only
  once the discipline is proven and a genuinely prime-safe probe needs it.
- Any automated aggregation/analysis of answers (triage stays human).
- A probe-authoring UI or skill.

**Future Considerations:**

- Prime-safe convene priming (gated, opt-in per probe).
- Convention for retiring/archiving concluded probes.
- Whether probe answers want a structured capture (scratch tag) vs prose at finalize.

## Technical Approach

- **`.anthill/probes.md`** — a scaffolded template (`anthill init` could render an empty one). Each
  probe: `id`, `class: blind | prime-safe`, `question` (the neutral finalize phrasing), `routes-to`
  (investigation path or `anthill feedback`). Human-maintained; no code reads it in MVP beyond the
  skill instruction to open it.
- **Skill edits** (docs-only): a finalize-session step that points at `.anthill/probes.md` and
  states the blind/neutral rules inline (so a seat can't accidentally lead itself). No shipped skill
  contains a specific question.
- **Key dependencies:** the existing finalize harvest ritual, the paper-cuts/scratch capture model,
  and the `anthill feedback` upstream path for consumer→anthill routing.
- **No runtime code strictly required for MVP** — it's a file convention + skill wiring. (A future
  `anthill probes` helper could list/validate active probes, but isn't needed to start.)

## Impact & Risks

**Benefits:** turns every real session (including consumer teams') into a low-cost data point for
active questions; makes "validate in situ" a concrete hook instead of a hope; keeps the shipped
product generic; and — the point of the whole design — collects behavioral signal **without
tainting it**.

**Risks:**

- **Contamination (the core risk)** → mitigated by blind-by-default + neutral phrasing + deferring
  priming out of MVP. This risk is _why the discipline is the spine, not a caveat._
- **Probe fatigue** (too many questions dull the harvest) → keep the active set small; retire on
  conclusion.
- **Stale probes** (question outlives its investigation) → retirement convention; routing ties each
  probe to a living doc that signals when it's done.
- **Leaking anthill-internal questions to consumers** → prevented structurally by reference-not-embed.

**Complexity:** **Low–Medium** — mostly a file convention + careful skill wording; the difficulty is
methodological (getting the discipline right), not technical.

## Open Questions

- **`.anthill/probes.md` format** — how much structure vs. freeform? Enough to make class + routing
  unambiguous, no more.
- **Blind retrospective reliability** — how well does an agent actually reconstruct its own behavior
  at finalize (e.g. "did I delegate")? Probably high for discrete facts; worth confirming it's not
  itself lossy.
- **Is there ever a behavioral probe worth priming** despite the taint (accepting a known bias for a
  different read)? If so, the registry should let a probe opt into priming _with the bias recorded_.
- **Routing mechanics** for consumer→anthill probe answers — reuse `anthill feedback` verbatim, or a
  probe-tagged variant?

## Success Criteria

- A blind probe in `.anthill/probes.md` is answered at finalize, from history, in neutral terms,
  with **no** convene-time priming — and the answer reaches its routed destination.
- The two live investigations gain real in-situ evidence from the next dogfood via this instrument.
- A consumer project running finalize-session with an empty registry sees **no** anthill questions.

---

**Related Documents:**

- First two probes: [signal-hunger](../../investigations/2026-07-08-agent-signal-hunger.md),
  [seat-subagent-orchestration](../../investigations/2026-07-09-seat-subagent-orchestration.md)
- Homes to wire: `plugin/skills/finalize-session/SKILL.md` (harvest), `plugin/skills/convene/SKILL.md`
  (future prime-safe priming), `.anthill/README.md` (SOP)
- Distinct from: the existing open-ended "Skill feedback" touchpoint in each skill
- Upstream routing: the `anthill feedback` path

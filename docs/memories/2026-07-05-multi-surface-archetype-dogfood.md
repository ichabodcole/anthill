# Multi-surface archetype — the first instrumented dogfood

**Date:** 2026-07-05

Built roadmap #3 (multi-surface archetype + candidate seatings) as roadmap #4 — the **first real
`anthill:plan` dogfood**: the anthill team building an anthill feature with anthill's own lifecycle
(convene → plan → work → finalize), seats as subagents over a live grapevine + bounty board. Landed
`de3aa58` on `feat/multi-surface-archetype`.

- **Scope call:** the proposal's MVP was near-single-seat (all weaver), so `anthill:plan`'s ratify gate
  had no owner↔owner seam. Pulled the deferred **`anthill scan`** detector into the MVP (forager's lane)
  to create a genuine forager↔weaver seam. _Lesson: the ratify gate needs two building owners meeting
  at a contract — check team-shape before scaffolding._
- **The ratify earned its keep on the first run.** The lead's solo skeleton was wrong in two
  load-bearing ways — `root` resolved via `.anthill/` which doesn't exist yet at scan time (scan runs
  during bootstrap discovery), and it omitted the `internalDeps` dependency edges the consumer needs —
  and **both independent owners caught both before a line was built.** Zero-rework, as designed.
- **`ScanReport` is the seam** (`seams.md` Contract 1, owner forager, consumer weaver): `{root,
workspace, units:[{name,path,kind,stack,private,internalDeps}]}`. Two rules ride with it: "two
  surfaces share a stack" ⟺ equal `stack[0]`; the shared-contract seat = the `kind:"package"` unit with
  `internalDeps` fan-in ≥2 (edges, not the package's _name_, identify the real SDK).
- **Payoff validated on media-buffet** (the origin repo): candidate A emerges correctly — `client`
  identified as the contract seat by fan-in 3, same-named `shared` (fan-in 0) correctly not seated. The
  field friction that started the feature is fixed, verified on the repo that produced it.
- **Firsts:** the four seat docs went scaffold-empty → real content (the team's foundational trail);
  the first end-to-end coordination trail (vine #2→#5, board, `seams.md`, commit) exists for the #8–#10
  memory work to design against.

Verified (sentinel): gate green (129 pass), real-repo runs on media-buffet + dream-flute, cold-read
(opener reads as dialogue after a worded exemplar was added). 4 minor fixes applied. Structure
reflection: roster validated, no reshape.

**Docs:** [proposal](../projects/_archive/multi-surface-archetype/proposal.md) ·
[plan](../projects/_archive/multi-surface-archetype/plan.md) ·
[session](../projects/_archive/multi-surface-archetype/sessions/2026-07-05-multi-surface-dogfood.md) ·
[seams.md Contract 1](../../.anthill/dev/seams.md)

# Multi-surface archetype + candidate seatings

**Status:** Shipped in `v1.3.0` (2026-07-05) — archived. Multi-surface archetype + `anthill scan`; 1st `anthill:plan` dogfood.
**Created:** 2026-07-04
**Author:** Cole + forager

---

## Overview

anthill ships exactly one team archetype — `layered-app` — which seats **horizontal layers** (engine
→ spine → surface) and assumes **one app**. That's the wrong shape for a multi-surface repo (a
workspace with several apps + shared packages), where the natural team boundary is **vertical** (one
seat per surface, plus the shared contract) rather than one "surface" seat spanning unrelated
expertise tracks.

This proposal adds a **second archetype** (multi-surface, by-surface seating) and, more importantly,
upgrades bootstrap's discovery so it **detects the repo's shape and offers 2–3 candidate seatings as
its visible reading of the repo's seams** — each annotated with one clause of _why_. The candidates are
**not a pick-one form**; they're the **opening of a conversation** the human steers — confirm a
direction, correct the reading, or add what detection can't see. The human's job shifts from
reconstructing a roster to **co-refining a shared understanding of where the seams are** — the same
ratify-not-reconstruct DNA as `anthill:plan`, but as dialogue, not a widget. It's the v0.2 "headline"
(brief feature 5) and the #1 field friction observed on the media-buffet bootstrap.

## Problem Statement

The only archetype seats horizontal layers and assumes a single app. On a multi-surface repo — e.g.
media-buffet (Nuxt web + Expo mobile + a shared SDK package) — instantiating `layered-app` forces a
single `surface` seat that owns **both** Vue and React Native. Those are unrelated expertise tracks;
one seat can't hold both well, and the seam that actually matters (the SDK/package contract between
surfaces) is invisible in a layer-oriented roster.

Two failures compound:

1. **Wrong default shape.** The archetype pushes horizontal when the repo's real seams are vertical.
2. **Reconstruction, not ratification.** Because the proposed roster doesn't reflect the repo's
   surfaces, the human has to hand-rebuild it during bootstrap — a multi-pass conversation instead of
   a one-pass "yes." The bootstrap output is a _roster_ when it should be a _visible decision_.

Both were seen live on media-buffet; the brief calls this "the #1 field friction."

## Proposed Solution

Three moves. The archetype itself stays **skill-driven** — archetypes today are agent-consumed
templates (`templates/archetypes/*.json` read by the bootstrap skill), not code, so there is no
archetype "engine" to build. The one real code slice is **`anthill scan`** (move 2's deterministic
reading); the rest is a new template, a decision heuristic encoded in the bootstrap prose, and the way
candidates are presented.

### 1. A `multi-surface` archetype template

A new `templates/archetypes/multi-surface.json` expressing the **by-surface** seating: a lead + one
seat per surface (e.g. `web`, `mobile`) + a seat for the **shared contract** (the SDK/package that is
the strong seam) + a `verify` seat that cuts _across_ surfaces (by-work-type among by-surface seats).
Seats carry the existing `{handle, role, scope, spawn}` schema — no config change needed; the config
is already roster-agnostic.

### 2. Discovery → candidate seatings (the core)

Extend bootstrap's "light discovery" step: **`anthill scan`** reports the **workspace layout**
(`apps/*`, `packages/*`, or a `workspaces` manifest field) and each surface's sniffed stack as a
structured payload; the skill reads that payload and surfaces its **reading of the repo's seams** as
**2–3 candidate seatings**, each fold/split annotated with one clause of _why_ (seam strength). These are presented as **the start of a conversation, not a menu** —
the agent leads with a concrete recommendation _and_ explicitly invites the human to correct the
reading or add context (see "How the human experiences it"):

- **A — vertical / by-surface** (recommended when workspaces are detected): a seat per surface + the
  shared-contract seat. _Why: the package/app boundary is a strong, stable contract two people can
  work against semi-independently._
- **B — layered** (the current archetype, offered with a **spanning-warning**): engine/spine/surface.
  _Why: fine for one app; flagged because "surface" would span your web + mobile stacks._
- **C — lean / merged:** surfaces folded into one `app` seat + the contract seat. _Why: if the
  surfaces share a shell/stack or the team is small, the seam is weak — fold._

The **decomposition heuristic** driving fold-vs-split, stated once so it's reusable judgment:
_"where can two people work semi-independently against a stable contract?"_ Strong seams
(package / app / SDK-contract boundaries) → **split**; weak seams (two apps sharing a stack/shell) →
**fold**. Default to vertical when workspaces are detected; always offer layered as the alternate.

A worked example (media-buffet-shaped repo), candidate A:

| handle    | role    | scope                                                |
| --------- | ------- | ---------------------------------------------------- |
| `maestro` | lead    | orchestration, the atomic land, human liaison        |
| `web`     | surface | the Nuxt app                                         |
| `mobile`  | surface | the Expo / React Native app                          |
| `sdk`     | engine  | the shared package — the contract both surfaces use  |
| `verify`  | verify  | integration across surfaces against the SDK contract |

### 3. Themed naming as a first-class affordance

Bootstrap offers an optional **naming theme** mapped onto the roles (Arthurian on media-buffet,
craft/optics on dream-flute); handles stay free-form and the human can decline. On-thesis: durable
seats should feel like characters with ownership — it reinforces the ephemeral-agents-in-durable-seats
model.

### How the human experiences it

Bootstrap says, in effect: _"Here's how I'm reading your repo — a multi-surface workspace: Nuxt web +
Expo mobile + a shared SDK package. That reads to me as a seat per surface plus a contract seat
(candidate A), because the SDK is a strong boundary each surface can work against independently; B and
C are the other ways I'd cut it. Does that match how you think about this codebase — and what am I
missing?"_ The candidates open a conversation, not a menu: the human confirms, redirects, or feeds in
what detection can't see (a deprecation in flight, a design-system package that's the _real_ seam, a
"surface" that's actually two). Convergence comes from **shared understanding**, not from picking a
radio button — and because the agent led with a concrete reading rather than an open "how do you want
your team?", that conversation stays short.

## Scope

**In Scope (MVP):**

- `templates/archetypes/multi-surface.json` (the by-surface seating primitive).
- **`anthill scan`** — a deterministic detection helper that reports surfaces / packages / stacks as a
  structured `{ok, data}` payload, so bootstrap ratifies a machine reading instead of eyeballing the
  layout. _(Pulled forward from Future during the 2026-07-05 plan phase: it is the natural
  forager↔weaver seam that makes this a genuine multi-seat build — and a deterministic reading makes
  the candidate seatings trustworthy from day one. See the [plan](./plan.md).)_
- Bootstrap discovery upgrade: consume the `anthill scan` payload; emit 2–3 annotated candidate
  seatings with a recommended default; encode the fold-vs-split heuristic.
- The spanning-warning on the layered candidate for multi-surface repos.
- Themed-naming offer (a small built-in set + free-form).
- Single-surface repos: **unchanged** — layered-app stays the default, no regression.

**Out of Scope (at least initially):**

- Auto-selecting a seating without human ratification — candidates are always hypotheses.
- Archetypes beyond layered + multi-surface; exotic monorepo layouts (non-`apps/*`/`packages/*`).
- Grounding-doc detection as _new_ work — it already landed in the bootstrap skill (the anchor-probe
  in step 2). This proposal just relies on it; it doesn't rebuild it.

**Future Considerations:**

- More archetypes (CLI tool, library, service-mesh) as field patterns emerge.
- Seatings informed by finalize's structure-reflection data (learned fold/split boundaries).

## Technical Approach

- **No config-schema change.** The existing `SeatConfig {handle, role, scope, spawn}` plus the
  top-level `channel` / `lead` / `grounding` / `paths` / `launch` already expresses any roster.
  Multi-surface seats are just different seats.
- **New template file** `templates/archetypes/multi-surface.json`, rendered by `anthill init` exactly
  as layered-app is (init walks the template dir; no init change needed for the archetype itself).
- **Bootstrap skill edits** (`skills/bootstrap/SKILL.md`) are the bulk of the work: the workspace
  detection heuristic, the candidate-seating presentation, the fold/split rule, the themed-naming
  offer. This is prose-and-judgment, consistent with anthill's "skills drive, code assists" split.
- **Dependencies:** the existing bootstrap discovery + grounding-anchor detection; `anthill init`'s
  template renderer; the `spellbook` coordination layer (unchanged).

## Impact & Risks

**Benefits:** anthill becomes genuinely good at multi-surface repos (the v0.2 vision); the #1 field
friction is removed; bootstrap converges in one pass; the "visible seam decision" pattern reinforces
the ratify-not-reconstruct philosophy anthill is built on.

**Risks:**

- _Detection mis-shapes the team._ Mitigation: candidates are hypotheses; the human ratifies — same
  safety valve layered-app already relies on. A wrong guess costs a "swap," not a rebuild.
- _The open-ended conversation sprawls._ Framing candidates as a conversation-opener (not a form) is
  the point — but an unbounded "how do you want your team?" is exactly the reconstruction tax we're
  removing. Mitigation: the agent always **leads with a concrete recommendation and a specific
  reading**, so the human reacts to something rather than authoring from scratch; the opener invites
  correction, it doesn't hand over a blank canvas. Keeping that balance is the main design question
  (below).
- _Over-fitting to media-buffet's exact shape._ Mitigation: the heuristic is seam-strength-general
  (workspace boundaries), not stack-specific; it degrades to "offer layered" when no workspace is
  detected.

**Complexity:** **Medium** — little code, but the discovery/seating judgment and its presentation are
the subtle part, and getting the conversation-opener right — concrete enough to converge, open enough
to invite correction — is a design problem, not a coding one.

## Open Questions

- **Prompt UX — direction resolved (Cole, 2026-07-05):** the candidates are an **exploration opener,
  not a select form** — the agent presents its reading of the repo's seams and invites the human to
  confirm/correct/enrich it, rather than rendering a pick-one widget. **Open sub-question:** what light
  structure keeps that opener from sprawling into an unbounded design session? The agent should still
  lead with a concrete recommendation and drive toward convergence — how is that balance encoded in the
  bootstrap prose (e.g. "recommend one, name the alternatives in a line each, ask one open question,
  then converge")? This is the piece to nail when the plan is authored.
- **`anthill scan` — MVP or defer? Resolved (Cole, 2026-07-05): MVP.** Pulled forward so the build has
  a real forager↔weaver seam to ratify (the dogfood needs two owners) and the seatings rest on a
  deterministic reading from day one. The [plan](./plan.md) owns the payload contract.
- **Stack-sniffing depth:** package.json deps only, or also framework config files / file-extension
  census? How much signal is enough to name a surface's stack confidently?
- **Themed naming:** ship a small fixed set of themes, or generate a theme on the fly from the repo's
  domain? How many built-ins are worth carrying?

## Success Criteria

- On a multi-surface repo (dream-flute, or a media-buffet-shaped fixture), bootstrap emits ≥2 sensible
  candidate seatings with a recommended default, and a human converges in **one pass** (ratify / swap /
  merge) without hand-reconstructing the roster.
- The instantiated multi-surface archetype produces seats with **non-overlapping expertise tracks** (no
  "Vue + React Native in one seat").
- **No regression** on single-surface repos — layered-app remains the default and behaves as before.

---

**Related Documents:**

- [v0.2 brief, feature 5](../../briefs/2026-06-30-anthill-v0.2-next-release.md)
- [ROADMAP #3](../../ROADMAP.md)

---

## Notes

This proposal is a strong **candidate to build via the convened anthill team** (roadmap #4, the first
instrumented dogfood): it's a genuinely multi-seat feature, so it exercises `anthill:plan` for real and
generates the trail data the memory-mechanism work (#8–#10) is gated on. Building the multi-surface
archetype _with_ a multi-surface-aware team is a fitting dogfood.

# Team dev-planning: the skeleton → ratify handshake

**Status:** Draft
**Created:** 2026-07-01
**Author:** forager (from a dream-flute methodology writeup by the maestro seat)

---

## Overview

anthill's lifecycle skills are silent on **how a dev plan gets authored by a team**. `convene` treats
the plan as a finished input ("point at the plan _if one exists_"), seeds one bounty card per lane, and
spawns seats that claim a card and start _doing_. There is no beat where the lead drafts a light plan and
each seat **fills in and ratifies its own boundary before building**.

That handshake is a proven practice in **dream-flute**, generalized into a portable procedure (see
[origin-methodology-writeup.md](./origin-methodology-writeup.md)): the **lead** authors a plan
**skeleton** — the integration order + the cross-seam interface contracts, as claims — and the
**owners** (seats) **ratify or falsify the seams** and enrich their lanes _before drafting against
them_. This proposal brings that procedure into anthill as a first-class, portable lifecycle stage.

## Problem Statement

A single agent authoring a whole multi-seat plan is **most often wrong exactly at the seams between
owners** — the cross-boundary interface contracts where one seat's assumptions meet another's. Today
anthill has no structural step to catch that before implementation: seats ground, claim a card, and
build against a plan they didn't shape. Mismatches surface at **integration/merge**, which is the
expensive place to find them.

The substrate for the fix already exists in anthill but isn't wired into the flow:

- **Seat-owns-its-boundary** is first-class — the seat doc has a `Boundaries` field and `seams.md`
  encodes "each contract has ONE owning seat."
- **"Propose a draft, then ratify"** is anthill's D2 design philosophy — but it's only applied to
  _roster composition_ (bootstrap), never to _plan authoring_.

So the pattern is philosophically native and the ownership model is there; what's missing is the
**lifecycle handshake** that turns a lead's skeleton into owner-ratified seams before a line is drafted.

## Proposed Solution

Introduce a **team-planning stage** between "an approved design" and "build," expressed as a portable
methodology plus the skill/template beats that drive it.

**The core idea (must survive verbatim): the skeleton is a HYPOTHESIS, not blanks to fill in.** The
lead's skeleton is a set of _claims_ (the integration order + the cross-seam contracts) that owners are
asked to **falsify or ratify**. The value is **seam-surfacing** — owners, each holding their domain's
reflexes, catch a wrong seam _before_ drafting, so slices fit at integration with ~zero rework. Without
this framing the pattern degrades into "lead leaves blanks, seats fill them," which is _worse_ than
single-author planning; the framing is the whole value.

**The procedure** (from the origin writeup, condensed):

1. **Design → proposal (single-author).** Lead + human settle the design; the lead writes it. Design
   coherence wants one pen.
2. **Lead scaffolds the plan SKELETON.** Not turn-by-turn — the integration order, the one (or few)
   cross-seam interface contracts to ratify (as stubs), lanes mapped to owners. **Assert what's ABSENT**
   too ("no gate / no migration here") so no one hunts a mirror that isn't there.
3. **Convene + ratify the seams.** Each owner reads the skeleton and, on the vine, **ratifies or
   falsifies** each interface it touches; contested terms settle with a **read-all-owners synthesis pass
   — rule once**, not message-by-message. Owners enrich their lane from their living doc.
4. **Build in lockstep** against the ratified seams.
5. **Verify → land → finalize** (already anthill's existing rituals).

**How it lands in anthill's surfaces** (decided — see Technical Approach for the fit detail):

- A **new `anthill:plan` lifecycle skill** — the plan phase between convene and build. The **lead**
  runs it to scaffold the skeleton (contract-_claims_) and host ratification. Its companion
  **`methodology.md`** (bundled in the skill dir, single-source) carries the portable procedure.
- A **`join` beat**: before moving a card `todo→doing`, ratify/falsify the seams you touch and enrich
  your lane.
- A **`seams.md` framing** shift: the load-bearing contracts are _asserted up front and ratified_, not
  only accreted at merge.
- **Pointers** (not copies) from the SOP + the lead archetype seat doc to the skill/methodology.

**Lifecycle:** `bootstrap → convene → plan → build → finalize-session`. `plan` is a distinct,
invocable phase (design → **plan** → build), not prose folded into `convene` — which keeps `convene`
focused on standing up coordination and makes the plan phase discoverable and _forced_ rather than
optional (the navigation-research adoption lesson).

**When it applies:** a feature that **spans multiple seats**. Solo work — or authoring the skeleton
itself — uses plain single-agent planning (`project-docs:generate-dev-plan`, `superpowers:writing-plans`).
This team layer sits **on top of** single-agent planning; it does not replace it.

## Scope

**In Scope (MVP):**

- A new **`skills/plan/SKILL.md`** — the lead-facing plan phase (scaffold skeleton of contract-claims;
  host ratification; "read-all-owners, rule once").
- A companion **`skills/plan/methodology.md`** — the portable procedure, single-source (the skeleton→
  ratify flow, the roles, the seams-are-the-value framing, the relationship to single-agent planning).
- **`join`** gains the ratify-before-draft beat (ratify the seams you touch before `todo→doing`).
- **`seams.md` template** gains the "assert & ratify load-bearing contracts up front" framing.
- The **lead archetype seat doc** + the **SOP template** _point at_ the skill/methodology (replacing
  dream-flute's distributed maestro reflex + SOP one-liner — pointers, not restatements).
- A note in the **architecture design doc** recording `plan` as a lifecycle phase (the decision).

**Out of Scope:**

- A dedicated CLI command or automation for skeletons/ratification — this is a **skill + methodology**
  change, not new `scripts/anthill/` surface. (Consistent with the navigation research: the lever is
  forcing the seat to _engage_ the artifact, which is a skill/manifest change, not tooling.)
- Changing `finalize-session` — step 5 of the procedure already matches what it does.
- A formal `playbooks/` doc-category — start with the one methodology bundled beside its skill; promote
  to a set only when a **second** playbook appears (YAGNI).
- **Rendering the methodology into each project's `.anthill/`** — it's universal, so it ships once with
  the plugin; only the _instantiation_ (a project's skeleton `plan.md`, its ratified seams) lives in
  the project.

**Future Considerations:**

- Layer 3 of the dream-flute initiative — **meta-skills** (methodology that improves itself) — is out of
  band for this proposal.
- A skeleton _template_ (a `PLAN-SKELETON` scaffold) if the freeform beat proves too loose in practice.

## Technical Approach

This is a **plugin-surface** change (skills + templates), deliberately not a `docs/`-only change.

**Placement — decided.** The organizing principle: **universal → plugin; project-specific → `.anthill/`.**
The methodology is _universal_ (it doesn't vary between anthill and dream-flute), so it ships **once with
the plugin** — as a new **`skills/plan/`** skill carrying a companion **`methodology.md`** (the pattern
used by `skills/upgrade/migrations/`), single-sourced and _pointed at_ from the SOP + lead seat doc. It
is **not** rendered into each project's `.anthill/` (that would be N drifting copies). Only the
_instantiation_ — a project's skeleton `plan.md`, its ratified `seams.md`, its seats — lives in the
project. (Rejected: SOP-only, because reference prose gets ignored — the navigation-research adoption
finding; and per-seat homes, because a coordination protocol single-sources at the team level, not N
times across seat docs.)

**Fit against current surfaces:**

| Surface | Today | Change |
| --- | --- | --- |
| `skills/plan/` | _does not exist_ | **NEW** lead-facing phase: scaffold skeleton of claims → host ratify → hand to build |
| `convene` | plan is a finished input; seed cards → seats `doing` | minimal — hand off to `plan`; convene stays "stand up coordination" |
| `join` | ground → claim card → work | ratify/falsify seams you touch before `todo→doing` |
| `seams.md` template | contracts "accrete as discovered" (emergent) | load-bearing contracts "asserted up front & ratified" (proactive) — an emphasis shift, not a contradiction |
| SOP + lead seat doc | maestro reflex + SOP one-liner (in dream-flute) | a **pointer** to `skills/plan/methodology.md` (single-source) |
| `finalize-session` | owners synthesize; shared contracts pass | **no change** — already matches procedure step 5 |
| bounty lifecycle | `todo→doing→review` | ratification is a gate _before_ `doing` (no schema change; a discipline in the skills) |

**Key dependencies:** the existing `seams.md` ownership model; the grapevine (the "back-channel" the
ratification happens on); `spellbook:bounty` (the card lifecycle the gate sits in front of). No new
external dependencies.

**Ties to recent research** (evidence this is the right shape): the
[navigation state-of-the-art investigation](../../investigations/2026-06-30-agent-codebase-navigation-state-of-the-art.md)
found that (a) a committed, boundary-owned context artifact is the evidence-backed lever, and (b)
**adoption is the bottleneck — a nav/context artifact only pays off if the manifest _forces_ the seat to
engage it** (58% zero-use otherwise). The ratify beat is exactly a _forced engagement_ with the seam
contract before building — so it should be written as a **mandatory gate**, not an optional suggestion.

## Impact & Risks

**Benefits:**

- Slices fit at integration with ~zero rework because seams are agreed up front, not discovered at merge.
- Preserves dream-flute's working practice as it migrates onto anthill (no capability regression).
- Distributes the "architect" load across owners without making the lead a bottleneck.

**Risks:**

- **Degradation to "fill in the blanks."** Mitigation: the skeleton-as-hypothesis framing is stated as
  the load-bearing principle, not a footnote.
- **Ceremony on small work.** Mitigation: scoped explicitly to multi-seat features; solo work bypasses it.
- **Ratification stall / bikeshed.** Mitigation: the "read-all-owners synthesis pass, rule once" rule is
  part of the procedure (the lead breaks ties, not endless vine back-and-forth).
- **seams.md emphasis tension** (proactive vs. emergent). Mitigation: frame as "assert the load-bearing
  ones up front; still accrete the rest" — both/and, resolved in the plan.

**Complexity:** Medium — no code/CLI, but it coordinates ~5 skill/template surfaces and adds a lifecycle
stage anthill doesn't currently model, plus a placement decision and a framing tension to settle.

## Open Questions

- ~~**Placement**~~ — **resolved:** a new `skills/plan/` skill + companion `methodology.md`, shipped
  with the plugin (universal → plugin), pointed-at from SOP + lead seat doc. Not SOP-only, not
  per-project-rendered, not per-seat.
- **How the lead invokes `plan`, and the subagent-vs-terminal split.** In terminal mode the lead drives
  ratification over the vine; in subagent mode there are no tails — the lead dispatches each seat to
  ratify its seams and collects verdicts. The skill needs both paths (mirror `convene`/`join`'s existing
  dual-mode handling).
- **seams.md:** how hard to push "assert up front" without discouraging the healthy emergent accretion
  the template currently encourages?
- **Ratify mechanics:** is ratification a literal bounty gate (a `ratified` marker / a card state before
  `doing`), or a lighter vine-acknowledgement discipline? (MVP likely the lighter form.)
- **Supersession:** the writeup notes dream-flute has distributed captures this replaces (a maestro
  reflex, an SOP one-liner, scattered plan-scars). anthill's equivalent is the lead archetype seat doc +
  SOP template — confirm nothing else needs point-away-from.

## Success Criteria

- A multi-seat feature can be run end-to-end with the lead authoring only a skeleton and each seat
  ratifying its seams before building — driven by the skills, without out-of-band coaching.
- The methodology is single-sourced in the scaffold and merely _pointed at_ from `convene`, the SOP, and
  the lead seat doc (no restated copies to drift).
- dream-flute, post-migration, runs its existing planning practice through anthill's skills unchanged in
  spirit.

---

**Related Documents:**

- [origin-methodology-writeup.md](./origin-methodology-writeup.md) — the portable procedure as authored
  in dream-flute (the source this proposal formalizes).
- [Agent codebase-navigation investigation](../../investigations/2026-06-30-agent-codebase-navigation-state-of-the-art.md)
  — the "force adoption / boundary-owned context" evidence this leans on.
- [Agentic-teams landscape investigation](../../investigations/2026-07-01-agentic-teams-memory-stigmergy-landscape.md)
  — harness-engineering's "map not manual" + curated-context findings.
- `../../architecture/2026-06-28-anthill-portable-team-os-design.md` — the design-of-record
  (D2 "propose then ratify"; the `seams.md` + seat-doc ownership model this extends).

---

## Notes

Origin: layer 1 of the 3-layer dream-flute initiative recorded in the memory
`team-oriented-methodology-will-grow` (1: name + write the methodology · 2: extract the portable team-OS
= anthill, done · 3: meta-skills). This proposal is anthill snagging layer 1. Layer 3 (meta-skills) is
explicitly deferred.

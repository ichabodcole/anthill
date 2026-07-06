# Team-Oriented Dev-Planning — the skeleton → ratify procedure

**Status:** portable procedure (v1 draft, for anthill to snag)
**Origin:** grown in dream-flute (the maestro "scaffold the plan; owners ratify the seams" reflex);
generalized here into a first-class, project-agnostic procedure.

> **Portability note.** This document is the **portable core** — it travels to any anthill project.
> Where it names a concrete example (dream-flute's engine↔spine↔surface↔verify stack, a wire-freeze /
> golden harness), that's illustration, not the procedure. Each project fills in its own owners,
> contracts, and tools; the flow below is what's reusable.

---

## What this is

The team's method for turning an approved design into a dev plan. The **lead** authors a plan
**skeleton**; then the **owners** (seats) **ratify or falsify the seams** and enrich their lanes
**before drafting against them**. It is the multi-perspective ratify layer that sits **on top of**
single-agent planning — not a replacement for it.

## When to use it

- A feature that **spans multiple seats/scopes** — several owners with distinct expertise meeting at a
  shared contract.

Use plain **single-agent planning** instead (see _Relationship_ below) for solo work, or to author the
skeleton itself.

## The core idea: the skeleton is a HYPOTHESIS

The lead's skeleton is **not blanks for owners to fill in** — it is a set of **claims** (the
integration order + the cross-seam interface contracts) that the owners are asked to **falsify or
ratify**. The value of the team layer is **seam-surfacing**: a single-author skeleton is most often
wrong exactly at the **seams between owners**, and the owners — each holding their domain's reflexes —
catch it _before a line is drafted_. The slices then fit bit-for-bit at integration because the seams
were **agreed up front, not discovered at merge**.

## Roles

- **Lead** — writes the design spec (proposal) single-handed; scaffolds the plan skeleton; hosts
  ratification; owns the land. Absorbs the "architect" hat **via the skeleton**, without becoming a
  bottleneck.
- **Seats / owners** — each owns a scope + its own living doc. Fills its lane's depth **from its own
  doc** (link, don't restate); **ratifies each interface it touches** on the back-channel before
  drafting.

## The procedure

1. **Design → proposal (single-author).** Lead + human settle the design; the lead writes the proposal
   (what / why + the behavior/param model + open questions). Design coherence wants **one pen** here.
2. **Lead scaffolds the plan SKELETON.** Not turn-by-turn — the **integration order**, the **one (or
   few) cross-seam interface contracts to ratify** (as stubs), and the **lanes mapped to owners**.
   **Assert what's ABSENT** too (e.g. "this adds no gate / no migration") so no one hunts a mirror that
   isn't there.
3. **Convene + ratify the seams.** Each owner reads the skeleton and, on the back-channel, **ratifies
   or falsifies** the interface(s) it touches. Settle any contested term with a **read-all-owners
   synthesis pass — rule once**, not message-by-message. Owners enrich their lane from their living doc.
4. **Build in lockstep.** Owners draft their slices against the **ratified** seams; because the
   contracts were agreed, the slices fit at integration with ~zero rework.
5. **Verify → land → finalize.** The verifier drives the **assembled artifact** (engaged dynamically,
   not only at end-of-line); the lead lands **file-scoped / atomic**; **finalize = each owner
   synthesizes durable lessons into its own doc** + a shared pass over the contracts doc. (Finalize is
   where the methodology itself keeps improving.)

## Relationship to single-agent planning skills

This does **not** discard single-agent planning (e.g. `superpowers:writing-plans`,
`project-docs:generate-dev-plan` / `dev-plan-generator`). Those skills:

- can **author the skeleton** (the lead may use one to draft it), and
- **serve solo work** — a one-owner change needs no ratify layer.

The team layer is the **ratify on top** — the step a single-agent skill structurally can't do (it
assumes one agent plans everything). **Rule of thumb:** solo work or skeleton-authoring → a
single-agent skill; a multi-owner feature with shared contracts → add this ratify layer.

## Why it works

The multi-perspective ratify is precisely where a single-author skeleton is most often wrong — and the
owners catch it. The payoff is the **seam-surfacing**, not "fill in the blanks." (Instantiated with
real scars in each project's owner docs — e.g. an owner correcting a plan's field types against the
existing analog rather than trusting the plan's table; an owner reading the wire _type_ instead of
inheriting the plan's verb; an owner catching a plan that contradicted a frozen constraint.)

## Portable core vs. project specifics

- **Portable core (travels):** the skeleton→ratify flow; the roles (lead scaffolds / owners ratify
  seams); the seams-are-the-value framing; finalize = synthesize; who-owns-the-land; the relationship
  to single-agent skills.
- **Project-specific (each project fills):** what the owners/scopes _are_; the concrete contracts (a
  wire freeze, a golden/parity harness, an API schema, …); the tools (which back-channel + task board).

## Artifacts

- `proposal.md` — single-author design spec.
- `plan.md` — the lead's **skeleton** + the owner-ratified **lanes**; a scaffold that **links** to
  owner docs + the shared contracts doc, not an encyclopedia.

---

**Provenance for the snag:** realizes layer 1 of the 3-layer initiative in the dream-flute memory
`team-oriented-methodology-will-grow` (1: name+write this methodology · 2: extract the portable team-OS
= anthill, now built · 3: meta-skills). Suggested home in anthill: a first-class methodology doc the SOP

- the lead seat doc **point at** (single-sourced, not restated), and referenced from the `convene`
  skill. The current distributed captures to supersede/point-away-from: the maestro seat reflex
  ("Scaffold the plan; let the owners ratify the seams") + the one-line SOP workflow + scattered
  plan-scars in owner docs.

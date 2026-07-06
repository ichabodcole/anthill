# weaver's lane — the multi-surface template + the bootstrap discovery upgrade

**Owner:** weaver (brain / skills + templates) · **Consumes:** `ScanReport`
([seams.md Contract 1](../../../../.anthill/dev/seams.md)) · **Does not define it.**

This lane builds the two agent-consumed artifacts that turn a ratified `ScanReport` into a seated
team: the `multi-surface` archetype template, and the bootstrap prose that reads scan and offers
candidate seatings.
Both are prose-and-data, not code — the archetype is JSON the bootstrap SKILL reads, and the
discovery logic is judgment encoded in SKILL.md.

## What I'm building

1. `templates/archetypes/multi-surface.json` — the by-surface seating primitive.
2. The `skills/bootstrap/SKILL.md` "Light discovery" upgrade — run `anthill scan`, read the
   `ScanReport`, and branch on `workspace`.

## The template — `multi-surface.json`

It mirrors `layered-app.json`'s exact top-level keys (`version` / `channel` / `lead` / `seats` /
`grounding` / `launch`) so `anthill init`'s renderer treats it identically — no init change, no schema
change.
It expresses the **canonical media-buffet shape** (two surfaces + one shared contract) that the
bootstrap conversation then adapts to the real surface count:

- one `lead` seat (`maestro`),
- one `surface`-role seat **per app** (canonically `surface-a`, `surface-b` — renamed per real
  surface),
- one `engine`-role seat for the **shared contract** (`shared` — the package both surfaces depend on),
- one cross-cutting `verify` seat (integration across surfaces against the contract).

Handles are generic placeholders the bootstrap conversation renames (optionally via a naming theme).
The per-surface seats are a fan-out point: bootstrap adds or drops `surface` seats to match
`ScanReport.units` — the template just seeds the shape.

## The bootstrap discovery upgrade — ScanReport → candidates

The discovery step stops eyeballing the layout and reads `anthill scan`'s `ScanReport` instead.
It branches on one boolean:

**`workspace === null` (single-surface) — unchanged.**
`layered-app` stays the default; no regression.
The only tailoring: name the surface seat from the root unit's `stack[0]` when it's known.

**`workspace !== null` (multi-surface) — the new path.**
Derive three facts from the payload, then emit candidates:

- **Surfaces** = the app-like units (`kind:"app"`, weaver may overrule a mislabel using `private` +
  `stack`). Each becomes a candidate `surface` seat.
- **The contract seat** = the `kind:"package"` unit with **fan-in ≥ 2** — i.e. ≥2 surfaces name it in
  their `internalDeps`. Low/zero fan-in packages are config/tooling and are **excluded**, not seated.
- **Seam strength (fold vs split)** = `stack[0]` equality across surfaces. Distinct `stack[0]` ⇒
  strong seam ⇒ **split** (a seat each). Shared `stack[0]` ⇒ weak seam ⇒ **fold** (one merged seat).

### The three candidates

- **A — vertical / by-surface** (the `multi-surface.json` instantiation): lead, one seat per surface,
  the contract seat, and verify.
  _Recommended when surfaces have distinct `stack[0]`_ — the package/app boundary is a stable contract
  two people work against semi-independently.
- **B — layered** (the `layered-app` archetype, offered with the **spanning-warning**):
  engine/spine/surface.
  The warning fires whenever a single `surface` seat would span surfaces with **different** `stack[0]`
  — that one seat would own unrelated expertise tracks (e.g. Vue + React Native).
- **C — lean / merged**: surfaces folded into one `app` seat + the contract seat.
  _Recommended when surfaces **share** `stack[0]`_ (weak seam) or the team is small.

### The conversation-opener framing (the headline)

The candidates are **not a pick-one form**.
Bootstrap leads with **one concrete recommendation** and a one-clause _why_, names the alternates in a
line each, asks **one open question** ("does that match how you think about this codebase — what am I
missing?"), then converges.
That structure is what keeps the opener from sprawling into an unbounded "how do you want your team?"
design session — the human reacts to a concrete reading rather than authoring from scratch.
A themed-naming offer (a small fixed theme set + free-form; the human may decline) rides on top once
the shape is agreed.

## Boundaries with other seats

- **forager** owns `anthill scan` + the `ScanReport` shape — I consume it verbatim and do not reach
  past it (if I needed a field it lacks, that's a falsification I report, not payload I invent).
- **sentinel** cold-reads this SKILL.md from fresh context and runs `scan` on a real multi-surface
  repo — my job is to make the candidate-seating conversation runnable from the SKILL.md **alone**,
  without the proposal.

## Verification (my slice)

- Format: `bunx biome check --write templates/` + `prettier --check` on the two files I touch.
- Cold-read self-check: a fresh agent can run the candidate-seating conversation from SKILL.md alone.
- The heuristic is a pure function of `ScanReport` — no field I read is absent from the ratified shape.

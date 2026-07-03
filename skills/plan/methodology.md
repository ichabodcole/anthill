# Team dev-planning — the skeleton → ratify method

The **complete, standalone method** for how a multi-seat dev plan gets authored by an anthill team.
The `anthill:plan` skill drives it; the SOP, `convene`, and `join` **point here, never restate it**.
It is self-contained (it depends on no other plugin) and portable — it travels to any anthill
project unchanged. Where it names a concrete example, that's illustration; each project fills in its
own owners, contracts, and tools.

## What this is

The team's method for turning an **approved design** into a **dev plan**. The **lead** authors a
plan **skeleton**; each **owner** (seat) **ratifies or falsifies the seams it touches**, then
**authors its own lane** and builds against the ratified contracts. The whole plan ends up
detailed — but the shared skeleton stays thin, the seam contracts are _agreed_ not dictated, and
each owner writes the depth for the slice it owns.

## When to use it

- A feature that **spans multiple seats** — several owners with distinct expertise meeting at a
  shared contract.

**Solo work skips this entirely** — one agent just plans and builds its own change; there's no seam
to ratify and no lane to divide. This method is only the multi-owner case.

## The core idea: the skeleton is a HYPOTHESIS

The lead's skeleton is **not blanks for owners to fill in** — it is a set of **claims** (the
integration order + the cross-seam interface contracts) that owners are asked to **falsify or
ratify**. The value is **seam-surfacing**: a single-author skeleton is most often wrong exactly at
the **seams between owners**, and the owners — each holding their domain's reflexes — catch it
_before a line is drafted_. The slices then fit at integration because the seams were **agreed up
front, not discovered at merge**.

Without this framing the pattern degrades into "lead leaves blanks, seats fill them," which is
_worse_ than single-author planning. **The framing is the whole value.** The lead's north star:
**don't dictate the interface — host it, and capture the ratified version.**

## Roles

- **Lead** — settles the design with the human and writes the proposal single-handed (design
  coherence wants one pen); scaffolds the plan **skeleton**; hosts ratification; owns the land.
  Absorbs the "architect" hat **via the skeleton**, without becoming a bottleneck.
- **Owners (seats)** — each owns a scope + its own living doc. Ratifies each seam it touches;
  **authors its own lane** (the file-level HOW) from its own expertise; builds against the ratified
  contracts. Enriches depth **from its own seat doc** — link, don't restate.

## The plan artifact — a thin skeleton + per-owner lanes

The plan is **two layers**, not one document:

**1. The shared skeleton** — `plan.md`, authored by the **lead**. Thin: the map, not the
turn-by-turn. Its section set (adapt, don't pad):

- **How this plan is authored** — the ownership split, stated up front (lead owns the skeleton +
  seams + verification gate; each owner owns its lane file).
- **Integration / dependency order** — the sequence the slices come together in (often bottom-up).
- **Shared interfaces — _ratify on the vine, then fill_** — the seams section (format below). The
  load-bearing part of the whole plan.
- **Ratified decisions & edge cases** — the cross-cutting calls owners agreed on.
- **Slices** — one paragraph of scope per seat (which owner owns what), each pointing at its lane
  file.
- **Verification gate** — what "assembled and correct" means, and when the verifier engages.
- **Open questions** — what's still unresolved, to settle during ratify or build.

**2. The per-owner lanes** — one **`plan/<seat>.md`** per owner, authored by **that owner**. This is
where the file-level HOW lives: the task breakdown for the slice, grounded in the real codebase.
(Small features can collapse both layers into a single `plan.md` that ends with an **open-seams /
seat-RATIFY list** — a table keyed `owner ↔ consumer` — instead of separate lane files. Use the
split when lanes are substantial; the single file when they're light.)

### The seams section — format

Each cross-seam contract is one subsection, marked with its owner and consumer and its ratify state:

```markdown
### <owner> ↔ <consumer> — <contract name> (RATIFIED — <owner> × <consumer>)

<the exact interface: signature, units, invariants, clamp rules — concrete enough that the
consumer can build against it without guessing. e.g. set_play_range(start: usize, end: usize),
frame units, 0 ≤ start ≤ end ≤ total_frames.>
```

Before ratification the marker reads `(CLAIM — awaiting <owner>)`; the lead flips it to `RATIFIED`
once the owner has ratified (or the corrected version is captured). **Don't guess each other's
interface — settle it here first.** A ratified load-bearing contract is then promoted into
`.anthill/dev/seams.md` (its durable single home), owned by the authoritative seat.

## The procedure

1. **Design → proposal (single-author).** Lead + human settle the design; the lead writes the
   proposal (what / why + the behavior/param model + open questions). One pen here.
2. **Lead scaffolds the SKELETON.** The section set above — integration order, the cross-seam
   contracts as **claims**, slices→owners, the verification gate. **Assert what's ABSENT** too ("no
   gate / no migration here") so no owner hunts a mirror that isn't there. Needs no seats — the lead
   can draft it solo, before convene.
3. **Convene + ratify the seams.** With the team present, each owner reads the skeleton and
   **ratifies or falsifies each interface it touches** (mechanics below). Contested terms settle
   with a **read-all-owners synthesis pass — rule once**.
4. **Owners author their lanes + build in lockstep.** Each owner writes its `plan/<seat>.md` against
   the **ratified** seams (craft below), then builds. Because the contracts were agreed, the slices
   fit at integration with ~zero rework.
5. **Verify → land → finalize** — anthill's existing rituals, unchanged.

## Ratify mechanics (the light form)

Ratification is a **discipline in the skills, not a bounty schema change** — no new card state. The
gate: **an owner ratifies the seam(s) it touches before it moves its card `todo→doing`.** A ratify
is a short, explicit vine acknowledgement of each interface — _"ratified"_, or _"falsified —
here's the correction"_ — never silence.

- **Terminal seats:** the lead posts the skeleton on the vine; owners ratify/falsify over the vine.
- **Subagent seats:** no tails — the lead **dispatches each seat to ratify its seams** and
  **collects the verdicts** (mirrors how `convene`/`join` handle the subagent path).

**Contested seams settle with one ruling.** The lead does a **read-all-owners synthesis pass** —
reads every affected owner's position, then **rules once** — rather than letting the vine ping-pong.

## How each owner authors its lane

The owner's `plan/<seat>.md` is a real dev plan for one slice. Write it for an implementer with zero
context for this codebase but solid engineering instincts — document what they need, no more:

- **Ground in the real codebase; exact paths.** Name `src/audio/gen.rs`, never "the audio file".
  Reference the existing patterns the slice follows.
- **Right-size the tasks.** A task is the smallest unit that carries its own test cycle and is worth
  a fresh reviewer's gate. Fold setup/scaffolding into the task whose deliverable needs it; split
  only where a reviewer could reject one task and approve its neighbor.
- **TDD when a framework exists.** Structure each task as: write the failing test → run it red →
  minimal implementation → run it green → commit. Show the actual test and code, not a description.
- **No placeholders.** Real code and real commands with expected output — never "add validation",
  "handle edge cases", "TBD", or "similar to the other task".
- **Self-review against the ratified seams.** Before you build: does every signature/type/unit your
  lane **consumes** match the **ratified** seam exactly? A seam you consume as `clearLayers()` but
  the owner ratified as `clearFullLayers()` is a bug caught now instead of at integration.
- **Commit file-scoped and often** (anthill's shared-tree land discipline — `anthill commit -- <paths>`).
- **Link, don't restate.** Point at your seat doc and `seams.md`; don't copy their content into the
  lane.

## seams.md — assert up front, still accrete

The plan phase shifts _emphasis_, not rules: the **load-bearing** cross-seam contracts are
**asserted up front and ratified** during planning. The rest still **accrete as they emerge** — the
healthy default the `seams.md` template already encourages. Both: assert the load-bearing ones up
front; let the long tail accrete.

## Why it works

The multi-perspective ratify is precisely where a single-author skeleton is most often wrong — and
the owners catch it. This is the proven practice from anthill's origin project: its first full
team-convene build shipped with **zero rework** because the slices fit bit-for-bit — the seams were
agreed up front, not discovered at integration. A real save: a lead's skeleton once asserted the MVP
had "no delay line"; the engine owner **falsified it at the seam** — the delay line already existed,
so the feature was free and belonged in the MVP. A lone author would have shipped the wrong scope.
anthill's own navigation research explains the force: a boundary-owned contract only pays off when
the seat is _made_ to engage it (unforced, ~58% go unused) — so ratify is written as a **mandatory
gate**, not a suggestion.

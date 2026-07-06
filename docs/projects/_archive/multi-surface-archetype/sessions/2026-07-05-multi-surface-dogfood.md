# Session — multi-surface archetype, the first instrumented dogfood

**Date:** 2026-07-05
**Branch:** `feat/multi-surface-archetype` (off `develop`)
**Team:** maestro (lead) · forager (scan) · weaver (template+bootstrap) · sentinel (verify)
**Landed:** `de3aa58`

---

## What this was

Roadmap #3 (multi-surface archetype + candidate seatings) built as roadmap #4 — the **first instrumented dogfood**: the anthill team building an anthill feature _with_ anthill's own lifecycle (convene → `anthill:plan` → work → finalize), to prove the method on itself and generate real trail data for the memory work (#8–#10).

Seats ran as **subagents** (single-session build) over a **live grapevine + bounty board**, so the coordination trail (vine → card → doc → code) is real.

## The arc

1. **Scope decision — pulled `anthill scan` forward.** Grounding surfaced that the proposal's MVP was near-single-seat (all weaver). To give `anthill:plan`'s ratify gate a genuine owner↔owner seam, we pulled the deferred `anthill scan` detector into the MVP (forager's lane). Proposal updated to match (design-of-record honest); marked Approved.
2. **Skeleton (lead, solo).** `plan.md` scaffolded with the one load-bearing seam — the `ScanReport` payload — written as a falsifiable CLAIM.
3. **Ratify gate (the crown jewel).** forager (owner) and weaver (consumer) ratified the seam as independent fresh-context agents. Both returned **RATIFIED-WITH-CHANGES**, converging from opposite sides on the same corrections.
4. **Build in lockstep.** forager built `anthill scan` (pure detectors + command + fixtures, 22 tests); weaver built `multi-surface.json` + the bootstrap candidate-seating prose, consuming the ratified shape verbatim.
5. **Verify before land.** sentinel: gate green, ran `anthill scan` on **media-buffet** (the motivating repo) + dream-flute, traced the payload through the candidate logic by hand. Verdict: Ready to land with 4 minor fixes (all applied).
6. **Atomic land + finalize.** `anthill commit` (file-scoped, its own #6 fix held), seat docs synthesized, structure reflection, this doc.

## What the ratify caught (before any code)

The lead's solo skeleton was wrong in two **load-bearing** ways; two independent owners caught both:

- **`root` resolved from a path that doesn't exist yet.** The claim said root = "the dir holding `.anthill/`" — but `scan` runs during bootstrap discovery, _before_ `.anthill/` is written. It must resolve from `.git` / topmost `package.json` / cwd. (forager's catch.)
- **`internalDeps` (dependency edges) were missing.** Both owners made it their #1 point: without edges, "the package both surfaces use" is a fiction on any repo with >1 package — the consumer would seat a config package. (Converged from both sides.)

Also ratified: `kind` as a hybrid hint (position primary, manifest tiebreak, raw signals exposed); "share a stack" ⟺ equal `stack[0]` (not set-overlap); single-surface → `units:[rootPkg]`; deferred (YAGNI) `workspace.tool`, structured stack, language/runtime.

## The payoff — validated on the origin repo

`anthill scan` on **media-buffet** (4 apps + 3 packages) → candidate A emerges correctly: it identifies `@media-buffet/client` as the shared-contract seat by **fan-in 3**, correctly does **not** seat `@media-buffet/shared` despite its literal name (**fan-in 0**), and excludes `typescript-config` as tooling (fan-in 1). The `internalDeps`-over-naming distinction — the exact thing the ratify added — is what makes that correct. The field friction that started this feature is fixed, verified on the repo that produced it.

## Findings applied (sentinel)

1. **[Med] Under-powered fixture** — workspace fixture had fan-in 1; didn't exercise the contract-seat path. → both apps now depend on the shared package (fan-in 2, representative).
2. **[Low-Med] `elysia` missing from markers** — media-buffet's backend emitted `stack: []`. → added.
3. **[Low] Opener leaned form-ish** — added a worded exemplar to lock the dialogue register (weaver's own flagged risk).
4. **[Low] Single-app workspace** routed to the multi-surface conversation with no contract seat. → one-line guard: fold to layered-app.

## Structure reflection

**Composition fit — yes, once scoped right.** The 4-seat roster mapped cleanly (forager=scan, weaver=template+bootstrap, sentinel=verify, maestro=skeleton+ratify+land); no idle/overloaded seat _after_ scan was pulled forward. The pre-scope misfit (forager idle) was in the **work's scope**, not the roster. Exactly one load-bearing seam emerged — the one the skeleton named — and owners stayed in their file trees, making the atomic land trivial. **No reshape needed; roster validated by a real session.** The durable lesson is the lead's: run the team-shape check _before_ scaffolding.

## Method observations (for the #8–#10 memory work)

- The ratify's value was concrete and measurable: **2 load-bearing seam errors caught at zero rework cost** on the first real `anthill:plan` run. This is the empirical data point the memory upgrades are gated on.
- Seat docs went scaffold-empty → first real content this session — the team's foundational pheromone trail now exists.
- Trail is traceable end-to-end: vine msgs #2 (framing) → #3 (ratify ruling) → #4 (build) → #5 (land); board todo→doing→review→done; `seams.md` Contract 1; `de3aa58`.

## Paper-cuts filed

- Grapevine **daemon/CLI version skew** (daemon v1.14.0 vs CLI v1.15.0) — warned on every send; upstream (spellbook).
- Prettier **`-`/`+` wrapped-line reparse** in `docs/` — a wrapped prose line starting with a list marker becomes a stray bullet.

## Follow-ups (not blocking)

- A consumer-integration test (scan output → candidate derivation) to pin the fan-in path in code, not just a hand-trace.
- Framework-marker table sweep for other dreamwood-era backends.
- pnpm negation-glob handling (parsed-and-dropped in v1).

# Plan — Multi-surface archetype + candidate seatings

**Status:** Skeleton (awaiting ratify) · **Lead:** maestro · **Created:** 2026-07-05
**Proposal:** [proposal.md](./proposal.md) · **Roadmap:** #3 (built as the #4 dogfood)

> **This is a SKELETON, not a finished plan.** It is the lead's **hypothesis** — the integration
> order and the one cross-seam contract, written as a **claim** for the owners to _falsify or
> ratify_ before a line is built. The per-owner lanes (`plan/<seat>.md`) are authored by the owners
> _after_ ratify, not here. Method: [`anthill:plan` methodology](../../../skills/plan/methodology.md).

---

## How this plan is authored (ownership split)

- **maestro (lead)** owns this skeleton, the **shared seam** (below), the **verification gate**, and
  the file-scoped atomic land. Does not author lane detail.
- **forager** owns `plan/forager.md` — the `anthill scan` command, its detection logic, and its
  tests. **Authoritative for the `ScanReport` contract.**
- **weaver** owns `plan/weaver.md` — the `multi-surface.json` template and the `skills/bootstrap`
  edits (discovery → candidate seatings, the fold/split heuristic, the spanning-warning, themed
  naming). **Consumes** `ScanReport`; does not define it.
- **sentinel** owns the verification lane (`plan/sentinel.md` if it wants depth) — the quality gate,
  fixture strategy, the cold-read, and real-repo validation.

## Integration / dependency order

Bottom-up, one load-bearing seam gating the rest:

1. **`ScanReport` shape ratified** (forager × weaver) — _before either builds against it_. The shape,
   not the implementation, is what unblocks weaver.
2. **forager builds `anthill scan`** — deterministic detector + unit tests against fixture repos.
   Emits the ratified `ScanReport`.
3. **weaver builds in lockstep** — `multi-surface.json` + bootstrap prose consuming `ScanReport`.
   Template + prose can be drafted against the _ratified shape_ in parallel with (2); wiring waits on
   a working `scan`.
4. **sentinel verifies** — quality gate, then cold-read of the bootstrap prose + real-repo run
   (`scan` on a real multi-surface repo → sane payload → ≥2 candidate seatings).

## Shared interfaces — _ratify on the vine, then fill_

### forager → weaver — the `anthill scan` payload (`ScanReport`) — (RATIFIED — forager × weaver, 2026-07-05)

`anthill scan` reads the repo and emits the house `{ ok, data }` envelope. **Ratified** `data` shape
(promoted to [`seams.md` Contract 1](../../../.anthill/dev/seams.md)):

```ts
// anthill scan  →  { ok: true, data: ScanReport }
interface ScanReport {
  root: string; // absolute repo root — resolved by .git / topmost package.json / cwd.
  //            // NOT the .anthill dir: scan runs during bootstrap discovery, BEFORE .anthill exists.
  workspace: {
    manager: "bun" | "pnpm" | "npm" | "yarn" | null; // detection byproduct; NOT seating-load-bearing
    globs: string[]; // detection byproduct; weaver consumes `workspace === null` as a boolean only
  } | null; // null ⇒ single-surface repo
  units: ScanUnit[]; // workspace members; single-surface ⇒ the ONE root package (len 1, path ".")
  warnings?: string[]; // house convention — non-fatal notices on data.warnings, never stderr in JSON mode
}

interface ScanUnit {
  name: string; // package.json "name", else dir basename
  path: string; // repo-relative POSIX dir, e.g. "apps/web"; "." for root/single-surface
  kind: "app" | "package"; // best-effort HYBRID hint: glob position refined by manifest signals
  stack: string[]; // dep-derived markers, ordered DOMINANT-FIRST (stack[0] = primary framework); [] if unknown
  private: boolean; // package.json "private" — feeds kind + publishable check
  internalDeps: string[]; // names of OTHER units this depends on (deps ∩ member names) — the edges
}
```

**The ratified rules that ride with the shape:**

- **`root` resolves pre-bootstrap** — `.git` dir, else topmost `package.json`, else cwd. Accept an
  optional `--root` for fixtures. (forager's load-bearing catch: scan runs before `.anthill/` exists.)
- **`kind` is a best-effort hybrid hint** — glob position (`apps/*`⇒app, `packages/*`⇒package) refined
  by manifest signal (`private` + a framework dep ⇒ app; publishable + no framework ⇒ package),
  default unknown ⇒ `package`. Raw signals (`private`, `stack`, `internalDeps`) are exposed so weaver
  can overrule a mislabel.
- **"Two surfaces share a stack" ⟺ equal `stack[0]`** — the primary-framework test. Dominant-first
  ordering makes `stack[0]` the primary; this is the rule weaver's fold heuristic + spanning-warning
  run on (avoids false-folding `[next,react]` with `[expo,react-native,react]` on shared `react`).
- **`internalDeps` finds the contract seat** — weaver mints a shared-contract seat for the
  `kind:"package"` unit with **fan-in from ≥2 surfaces**, and uses low/zero fan-in to exclude
  config/tooling packages. Without the edges, "the SDK both surfaces use" is a fiction the moment a
  repo has >1 package.
- **stack source = `package.json` deps only** for v1, deterministically ordered (golden-stable).
  Structured `{framework,language,runtime}` and `workspace.tool` (turbo/nx) are **deferred** — no
  consumer needs them yet (YAGNI).

**Why it's the seam:** weaver's candidate-seating logic (fold vs. split, surface naming, the
spanning-warning, contract-seat selection) is a pure function of this payload — both owners confirmed
independently that the original claim would have blocked candidate A on any repo with >1 package.

## Slices (one paragraph per owner → lane file)

- **forager — `anthill scan`** (`scripts/anthill/`): a new `scan` command + a pure detector module
  (the unit-test target, per the dual-audience CLI convention — pure functions tested, the command
  emits the envelope). Fixture repos to test against. Authors `plan/forager.md`. → owns `ScanReport`.
- **weaver — template + bootstrap** (`templates/archetypes/multi-surface.json`,
  `skills/bootstrap/SKILL.md`): the by-surface seating primitive + the discovery/candidate/heuristic/
  naming prose that consumes `ScanReport`. Authors `plan/weaver.md`. → consumes `ScanReport`.
- **sentinel — verification** (cross-cutting): fixture-strategy sanity, the quality gate, a
  fresh-context cold-read of the bootstrap prose, and a real-repo `scan` run. Engages **early** (weigh
  in on the fixture strategy at ratify) and **late** (cold-read + real-repo). Optional `plan/sentinel.md`.

## Verification gate (what "assembled and correct" means)

- `bun run check` green — tsc + biome + `bun test`.
- `anthill scan` unit tests pass against **≥2 fixtures**: a workspace repo (surfaces + a package) and
  a single-surface repo (→ `workspace: null`).
- **Cold-read:** a fresh agent reads the updated `skills/bootstrap/SKILL.md` and can run the
  candidate-seating conversation _without_ the proposal in context.
- **Real-repo:** `anthill scan` on a real multi-surface repo (dream-flute, or a media-buffet-shaped
  fixture) emits a sane `ScanReport`, and bootstrap turns it into **≥2 candidate seatings with a
  recommended default**.
- **No regression:** single-surface repo → layered-app stays the default.

## Ratified decisions & edge cases

Settled at the 2026-07-05 ratify (both owners + lead ruling):

- **`ScanReport` is the single load-bearing contract** — owned by forager, consumed by weaver,
  promoted to `seams.md` Contract 1. See the ratified shape above.
- **`internalDeps` is mandatory, not optional** — both owners independently made it the #1 ask; it's
  what makes candidate A work beyond a one-package repo.
- **`stack[0]` is the primary-framework key** — the fold/spanning "same stack?" test is equality on
  `stack[0]`, not set-overlap. Ordering is forager's responsibility in `sniffStack`.
- **Kept-but-not-load-bearing:** `root`, `workspace.manager`, `workspace.globs` stay in the payload
  (near-free detection byproducts, useful to other consumers / debugging) though weaver's seating
  ignores them.
- **Deferred (YAGNI):** `workspace.tool` (turbo/nx), structured `stack`, language/runtime detection.
- **No new dependency for pnpm YAML** — hand-parse the single `packages:` field (forager's lane).
- **Fixtures:** in-tree fixture repos under `scripts/anthill/__fixtures__/` (a workspace fixture: 2
  apps + 1 shared package with a real edge; a single-surface fixture → `workspace: null`, one root
  unit). The real-repo run (dream-flute) is **sentinel's** separate validation, not a unit test.

## What's deliberately ABSENT (so no owner hunts a mirror that isn't there)

- **No `SeatConfig` / config-schema change** — `{handle, role, scope, spawn}` already expresses any
  roster; multi-surface seats are just different seats.
- **No `anthill init` change** — archetype JSONs are read **directly by the bootstrap skill prose**
  (via Read, exactly as `layered-app.json` is today), not rendered by `init` (which walks
  `templates/docs-team/`). A new archetype file is picked up because _prose_ consumes it, not the
  renderer — so nothing in `init` needs to change. _(Reason corrected at build; weaver's catch.)_
- **No coordination-layer change** — grapevine / bounty / tmux (`convene`/`join`/`spawn`) are
  untouched.
- **No new bounty card state** — ratify is a skill discipline, not a schema change.
- **No auto-selection** — candidates are always human-ratified hypotheses; bootstrap never picks a
  seating unattended.

## Open questions (settle during ratify or build)

- **Prompt-UX balance (weaver's lane):** how the bootstrap prose keeps the candidate-seating
  conversation a concrete opener that _converges_ (recommend one → alternatives in a line each → one
  open question → converge) rather than an unbounded "how do you want your team?" — the proposal's
  headline open question.
- ~~**`kind` inference:** glob-position vs. dep-based~~ — **RATIFIED: hybrid** (position refined by
  manifest signals; raw signals exposed for weaver override).
- ~~**Stack-sniffing depth:** deps only vs. config census~~ — **RATIFIED: `package.json` deps only,
  ordered dominant-first** for v1. Language/runtime deferred.
- ~~**Fixture form:** in-tree vs. real repo~~ — **RATIFIED: in-tree fixtures** for unit tests;
  dream-flute is sentinel's separate real-repo validation.
- **Themed naming (weaver's lane, still open):** a small fixed theme set vs. generated-from-domain.
  No payload dependency (weaver confirmed) — a pure weaver call, settled during its lane build.

# Investigation: does the docs/ taxonomy hold up in the team era?

**Date Started:** 2026-07-02
**Investigator:** Claude Fable 5 (with Cole)
**Status:** Concluded
**Outcome:** Partial restructure recommended — dispositions per store below; incremental, not a migration

---

## Question / Motivation

The `docs/` folder scheme (briefs, investigations, projects, playbooks, memories,
lessons-learned, fragments, reports, architecture, specifications, backlog, …) was designed for a
**single-developer/single-agent flow**: one actor producing lifecycle artifacts. anthill moves
work to a **team dynamic** — durable seats with living docs, `seams.md`, scratch, paper-cuts —
which comes with its own knowledge stores and its own read rituals. Cole's question: do the old
folders still make sense? Should some of them live in/near `.anthill/` in a different form? Does
the wiki/graph idea (Karpathy's LLM-wiki pattern) change how they should be structured?

(Meta-note, because it's on-topic: this document itself faced the routing question. It's an
*investigation* — a "should we act?" decision with a recommendation — following from the
*report* — the "what is" assessment — per the report→investigation cycle in
`docs/reports/README.md`. The fact that the routing needed a paragraph to justify is itself
evidence for the capture-friction finding below.)

## Current State Analysis

Two repos give us a natural experiment:

- **anthill** (this repo, docs-heavy, mostly solo-agent so far): all folders exist; briefs,
  investigations, projects, backlog, reports see real use; memories/playbooks are empty or
  template-only; lessons-learned has one doc; fragments has one (which itself diagnosed the
  "no touchpoint" problem).
- **dream-flute** (the mature team-native repo, ~2 weeks of real multi-seat sessions): the
  taxonomy **collapsed on its own**. Empty: `lessons-learned/`, `fragments/`, `architecture/`,
  `specifications/`, `briefs/`. Alive: `projects/`, `backlog/`, **`playbooks/` (4 docs)** and
  **`memories/` (10 docs)**. Team knowledge routed instead to `.anthill/` (seat docs, seams,
  paper-cuts).

## Investigation Findings

### Evidence Gathered

- **Playbooks are alive because they have owners and a task-shaped read-trigger.**
  dream-flute's `adding-a-source.md` / `adding-a-modulator.md` are recurring-work procedures;
  the owning seat doc points at them with explicit "I point there, don't restate" language
  (`fathom.md` refs at lines 447, 509), and the SOP links `authoring-skills.md`. The seat even
  recorded the measured payoff: *"the playbook + new tooling made this MARKEDLY faster than
  supersaw"* (`fathom.md` §FM arc). Playbooks function as the seat's **procedural annex**.
- **Memories survive on a weak trigger.** 10 dated per-arc recaps, pointed at by the "new
  session? skim memories" convention — but in team mode that trigger competes with (and loses
  to) `join`'s seat-doc grounding. Inbound references: the SOP and one scratch file.
- **The starved folders starved for one reason: no read-trigger.** Nothing in any ritual
  re-reads `lessons-learned/` or `fragments/`; their *jobs* were taken by stores that do get
  re-read (lessons → seat docs / `seams.md`; observations → scratch → synthesis). This is the
  read-trigger rule from the [conceptual review report](../reports/2026-07-02-conceptual-implementation-review-report.md)
  observed as a natural experiment: agents under real workload only feed stores that pay them
  back.

### Key Observations

**The taxonomy is two different kinds of thing wearing one folder scheme:**

1. **Flow artifacts** — briefs → investigations → projects (proposal/plan/sessions) → reports,
   plus backlog. Lifecycle-scoped and temporal: produced at one stage, consumed at the next,
   archived when done. **The lifecycle IS the read-trigger**, so genre folders work — and the
   team dynamic consumes them as-is (convene points at the proposal; the plan phase reads the
   plan). *This part holds up unchanged.* Flow artifacts are also *supposed* to go stale —
   staleness there is history, not rot.
2. **Knowledge stores (stock)** — playbooks, memories, lessons-learned, fragments, and
   current-state architecture/reference docs. These are supposed to **compound**, and for stock
   the organizing principle that demonstrably works is **ownership + read-trigger + links**, not
   document genre. The team model already provides those (seat docs, seams, paper-cuts,
   playbooks-pointed-from-seats); the ownerless genre folders go hollow.

**The wiki/graph question resolves to linking discipline, not a graph system.** The pieces
already exist natively: `seams.md`'s "Pointed at from:" footer is a backlink convention;
`docs/README.md` and per-folder READMEs are index pages. Karpathy's genuinely transferable moves
are (a) an **index layer** read before full pages and (b) a **lint pass** for contradictions and
staleness — and both apply to the *reference layer* (current-state truth), not to flow
artifacts. A dated architecture doc that records a decision is a frozen ADR and is fine
immutable; a *current-state* map is a wiki-style page that needs an owner and a lint. Don't
conflate the two.

**The one real friction: capture-time routing ambiguity.** A lesson today has ~seven candidate
homes (lessons-learned, memories, fragments, seat doc, seams, paper-cuts, playbook — plus
HiveMind). That's a decision tax at exactly the moment capture should be free, and it violates
the low-friction goal more than any folder's existence does. The team model's answer is already
the right one: **one intake (scratch), routing decided at synthesis** by ownership rules — the
author never guesses genre mid-work.

### Options Considered

- **Do nothing.** Viable — the flow pipeline works and the hollow folders are only passively
  harmful. But empty scaffolds actively mislead fresh agents about where knowledge goes (a
  false pheromone), and the routing tax persists.
- **Full migration to a wiki/graph structure.** Rejected. Flow artifacts don't want wiki
  treatment; a graph system is heavy machinery for what linking discipline provides; and the
  navigation research says curated committed artifacts + forced grounding beat clever retrieval
  structure anyway.
- **Split by kind: keep flow, re-home stock (recommended).** Keep the pipeline folders exactly
  as they are; give each knowledge store an explicit disposition (below); adopt the index +
  backlink + lint conventions for the reference layer only.

## Recommendation

- [x] **Partial restructure** — apply the per-store dispositions below, incrementally, as the
      team model absorbs each store. No big-bang migration; none of this blocks current work.

**Rationale:** dream-flute already ran the experiment — the team dynamic keeps what has owners
and read-triggers and starves the rest. Restructuring should ratify that observed behavior, not
invent a new scheme.

### Dispositions (the folder-by-folder answer)

| Store | Kind | Disposition |
| --- | --- | --- |
| `briefs/`, `investigations/`, `projects/`, `reports/`, `backlog/` | flow | **Keep as-is.** Lifecycle is the trigger; archive-when-done is correct behavior. |
| `architecture/` | both | **Split by intent.** Dated decision records: keep, immutable (ADR-style). Current-state maps: wiki treatment — an owner, an index line, a lint pass; `PROJECT-SUMMARY.md` is the index page of this layer. |
| `specifications/`, `interaction-design/` | flow (mostly) | Keep; treat as inputs to projects. Fold into project folders if they only ever serve one project. |
| `playbooks/` | stock | **Keep — the survivor.** Rule: every playbook must be pointed at from an owning seat doc (or SOP); universal ones graduate to plugin skills (per the universal→plugin rule in team-dev-planning). A playbook nothing points at is a lessons-learned-in-waiting. |
| `memories/` | stock | **Let fade in team repos** — superseded by seat docs + project session notes. Keep for solo repos where no seat docs exist. |
| `lessons-learned/` | stock | **Retire in team repos.** Route lessons to seat docs / `seams.md` at synthesis (the fragments doc's own conclusion). Remove the empty scaffold so it stops signaling a convention nobody follows. |
| `fragments/` | stock | **Retire in team repos** — its compost role is the scenario ledger's job (report rec 4). Existing fragments get triaged into the ledger or archived. |

### The plugin-level seam this implies

**project-docs owns flow; anthill owns operational knowledge.** anthill should not require or
render the full docs taxonomy in consumer repos — it defines its own stores (`.anthill/*`) and
*points at* whatever flow pipeline the host has. Playbooks sit at the boundary: project-specific
ones live with the host (pointed from seat docs), universal ones become skills. This keeps both
plugins coherent without coupling them.

## Next Steps

- [ ] Apply the retire/fade dispositions in **anthill's own docs/** (remove or archive the
      hollow scaffolds; note the routing rule in `docs/README.md`).
- [ ] Add the "playbook must be pointed at from a seat doc / SOP" rule where playbooks are
      introduced (docs README + any anthill template that mentions them).
- [ ] Fold the "one intake, route at synthesis" line into the finalize ritual's synthesis step
      (it's implicit today; make it explicit so authors stop genre-guessing mid-work).
- [ ] Longer-term: the scenario ledger (report rec 4) formally replaces fragments/lessons-learned
      in team repos — design lands with that proposal.

## Open Questions

- Does `memories/` have a *human*-facing value (a skimmable "what happened lately" digest) worth
  keeping even in team repos, or do project session notes cover it? Watch what Cole actually
  reads.
- Should dream-flute's four playbooks migrate under `.anthill/` for footprint cohesion, or is
  the pointer-from-seat-doc enough? (Leaning: pointers are enough; location churn buys little.)

---

**Related Documents:**

- [Conceptual & implementation review report](../reports/2026-07-02-conceptual-implementation-review-report.md)
  — the parent assessment (read-trigger rule, scenario ledger, dream-flute field evidence)
- [Lessons-learned touchpoint fragment](../fragments/2026-06-30-lessons-learned-touchpoint-in-the-team-model.md)
  — the original diagnosis this generalizes
- [team-dev-planning proposal](../projects/team-dev-planning/proposal.md) — the
  universal→plugin / project-specific→`.anthill/` placement rule
- Karpathy, "LLM wiki" — gist.github.com/karpathy/442a6bf555914893e9891c11519de94f (index +
  lint conventions)

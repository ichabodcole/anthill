# Anthill — Portable Team-OS Plugin (Design Spec)

**Date:** 2026-06-28 · **Revised:** 2026-07-27
**Status:** Design approved; Slice 1 **shipped**. Sections 5, 6 and 8 track the current
implementation; sections 1–4 and 9–11 are preserved as the approved design record.
**Author:** brainstormed with Cole (maestro)
**Spec home:** authored in dream-flute (`docs/superpowers/specs/`) because that was the working
repo at the time; it now lives here, in the implementation's own repo.

---

## 0. How to read this doc

This is the **design-of-record**: it carries the thesis, the three stigmergy principles, the
D1–D9 locked decisions, and the config schema. Two different kinds of content live here, and
they age differently:

- **The decisions and rationale (§1–§4, §9–§11)** are a historical record of what was approved
  on 2026-06-28 and why. They are _not_ rewritten as the implementation moves; where reality has
  since diverged, a dated note says so.
- **The contracts and maps (§5 config schema, §6 scaffold, §7 skills, §8 repo layout)** are
  reference material that code and agents actually key off — `config.ts` and `paths.ts` both cite
  "spec §5". These **are** kept current, because a stale contract misleads more than it records.

**What changed after approval** (each is reflected in the sections above, and noted inline):

| Then (as approved)                            | Now                                                               | When          |
| --------------------------------------------- | ----------------------------------------------------------------- | ------------- |
| `.team/config.json` + `docs/team/`            | a single consolidated `.anthill/` root (footprint **v2**)         | v1→v2         |
| config `version: 1`                           | `version: 2`; v1 configs still load and are migrated by `upgrade` | v1→v2         |
| top-level `skills/`, `scripts/`, `templates/` | all under `plugin/` — the only shipped subtree                    | 2026-07-05    |
| CLI shell built on Citty                      | zero-dependency in-house `parseArgs` command layer                | 2026-07-05    |
| 4 lifecycle skills                            | 6 — `plan` and `upgrade` added                                    | 2026-07-03/04 |
| 1 archetype (`layered-app`)                   | 2 — `multi-surface` added, with `anthill scan`                    | 2026-07-05    |

---

## 1. Problem & Goal

dream-flute has evolved a battle-tested **team-oriented development structure**: ephemeral
agents working in durable "seats," coordinating over a discussion channel + a task board,
with a lead that orchestrates and a verifier that engages dynamically. It lives across three
layers — lifecycle **skills** (`team-convene`/`team-join`/`team-finalize-session`), CLI
**tooling** (`flute team …` + tmux), and a **living-docs** knowledge system (`docs/team/`).

**Goal:** extract that system into a **portable Claude Code plugin** — "anthill" — that can be
installed into _any_ project and set up a team that _makes sense for that project_. The point
is a **methodology + tooling**, not a clone of dream-flute's exact roster. The plugin should
evolve on its own (its own repo + marketplace + release cadence).

**Non-goal:** rebuilding grapevine/bounty (spellbook spells the team already uses) or migrating
dream-flute onto the plugin in this slice (that's a later dogfood milestone).

---

## 2. Key Decisions (locked)

| #   | Decision                                                 | Rationale                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Standalone plugin + own marketplace** (repo `anthill`) | Matches how spellbook / project-docs ship; gives independent versioning so it can "evolve on its own."                                                                                                                                                                                                                                  |
| D2  | **Composition = principles + archetype seeds**           | Opinionated enough to be fast, flexible enough to fit any project. Discovery proposes a draft from the nearest archetype, then the human ratifies/tailors. (Full discovery intelligence is a later slice.)                                                                                                                              |
| D3  | **Execution = both, tmux-first**                         | Primary path is tmux panes (visible, attachable, persistent); subagent mode is the documented lightweight fallback. Matches how dream-flute actually runs.                                                                                                                                                                              |
| D4  | **Build = walking skeleton**                             | Slice 1 gets the full loop running end-to-end for ONE archetype (layered-app), then later slices add discovery intelligence + more archetypes + dogfood. De-risks the portability contract early.                                                                                                                                       |
| D5  | **Brain/hands split**                                    | The **skill** (`anthill:bootstrap`) decides the config (judgment: explore → converse → compose). The **CLI** (`anthill init`) deterministically renders templates from that config (mechanical). No external cookiecutter dependency — the agent is the smart templating engine; the CLI is the idempotent renderer.                    |
| D6  | **CLI seeded from `create-project-cli`**                 | anthill's CLI shell is generated via `bunx github:ichabodcole/seed-project-cli anthill --no-api --no-auth` (all commands are `workspace` scope). We layer the team commands on top, lifting/generalizing flute's team layer. No hand-porting of CLI boilerplate.                                                                        |
| D7  | **Zero target-repo footprint**                           | Skills resolve + drive the plugin's CLI straight from the plugin cache (the way flute drives spellbook). A consuming repo gets only the config, the living docs, and one `.gitignore` line. _(As approved that meant `.team/config.json` + `docs/team/`; footprint **v2** consolidated both under a single `.anthill/` root — see §5.)_ |
| D8  | **Depends on spellbook + Bun + tmux**                    | spellbook (grapevine + bounty) is the coordination layer; Bun runs the CLI; tmux runs pane mode. `anthill:bootstrap` preflights all three and guides install if missing.                                                                                                                                                                |
| D9  | **Reflection folds into finalize for Slice 1**           | A mid-session / between-phases retro is noted as the next evolution, not built yet.                                                                                                                                                                                                                                                     |

---

## 3. Core Principles (the methodology)

These are the soul of anthill and are written into the SOP scaffold, the finalize ritual, and
the bootstrap's grounding.

1. **Stigmergy — docs as pheromone.** The living docs are not documentation; they are the
   **trail the next ephemeral agent instance follows**. Each agent is an ant: ephemeral, but it
   leaves context for its successor. Curation = **strengthening load-bearing trails and letting
   unimportant ones fade**, called over time.

2. **Running capture → curated synthesis.** Agents don't wait for the end. Each keeps a
   running session scratch ("this just bit me," "this seam is fuzzy"), and _finalize_ is where
   those are articulated into durable form for future agents. Cheap capture, deliberate synthesis.

3. **The anthill adapts to the work.** Structure — app, process, **and team** — is mutable in
   service of the work. Persistent friction (toe-stepping, a seam that won't hold, an overloaded
   or idle seat) is a **signal to reshape, not to endure**. The reflection touchpoint may change
   the roster/seams/config itself.

4. **Three homes for knowledge** (carried from dream-flute): **taste → seat doc**;
   **truth → `seams.md`** (single-source contracts, never restated); **proof → tests**.

5. **Shared practices:** root-cause before cutting; verify the _real artifact_, not a proxy;
   file-scoped commits on a shared tree (explicit pathspec, serialize, atomic land by the lead).

### Lifecycle & evolution model

- **Convene** — lead grounds, gathers the work from the human, stands up coordination, seeds
  cards, briefs + spawns the seats the **current phase** needs. Composition is a _hypothesis_,
  not law.
- **Work** — builders build; the lead/seats watch for **structure signals** (toe-stepping, a
  renegotiated seam, an overloaded/idle seat, a verifier finding that bounces work back).
- **Verifier engagement is dynamic, not end-of-line.** A verify seat engages at _verification
  points_ — which may be phase 1 (we need tests before building further), mid (prove a feature),
  or late — and often _stays_ and ping-pongs with builders (fail → back to dev → re-verify). The
  lead decides per-phase when to pull each seat in; the plan's phases drive that, not a fixed slot.
- **Finalize (+ reflection)** — each seat curates scratch → seat doc; shared `seams.md` pass; a
  **structure reflection** (where did we step on each other? what are the natural seams? who
  actually owned what? should a seat split/merge/re-scope?) whose output flows to seat docs,
  `seams.md`, and occasionally the roster/config.

---

## 4. Architecture / Decomposition

Five pieces (plus a later dogfood milestone). Slice 1 touches all of them thinly.

| Piece                    | What                                                                                         | Source material                            |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1. Foundation            | `anthill` repo + `marketplace.json`/`plugin.json` + the config schema (§5) + CLI shell       | `create-project-cli` (shell)               |
| 2. Portable CLI commands | convene/join/spawn/attach/down/status/commit/**init** + `tmux.ts` + `coord.ts` + `config.ts` | flute `team-*.ts` + `tmux.ts` (generalize) |
| 3. Scaffold templates    | `docs/team/` skeletons (SOP, seams, seat-doc, roster, paper-cuts)                            | dream-flute `docs/team/` (strip domain)    |
| 4. Lifecycle skills      | `anthill:convene` / `join` / `finalize-session`, config-driven                               | the three flute skills                     |
| 5. `anthill:bootstrap`   | meta-skill: explore → compose → write config → `anthill init`                                | _new_                                      |
| 6. Dogfood (later)       | migrate dream-flute onto the plugin; prove parity                                            | —                                          |

---

## 5. The `.anthill/config.json` contract (keystone)

> **Current.** This section tracks the implementation (`plugin/scripts/anthill/config.ts`, which
> cites it back). As approved on 2026-06-28 the file lived at `.team/config.json` with
> `version: 1` and `docs/team/` paths; footprint **v2** consolidated everything under a single
> `.anthill/` root. v1 configs still load (an unstamped `version` resolves to 1) and are migrated
> by `anthill migrate` / `anthill:upgrade`.

The single file that replaces all of dream-flute's hardcoded specifics. The CLI and every
lifecycle skill **read** it; `anthill:bootstrap` **writes** it. **Its location is the project-root
marker** (walk up from cwd for `.anthill/config.json`) — this removes flute's brittle
`package.json`-name matching.

```jsonc
// <project>/.anthill/config.json
{
  "version": 2,
  "channel": "myproject", // grapevine channel + default tmux session name
  "lead": "maestro", // the lead handle — orchestrates, never spawned
  "seats": [
    {
      "handle": "maestro",
      "role": "lead",
      "scope": "orchestration, merge, human liaison",
      "spawn": false,
    },
    {
      "handle": "fathom",
      "role": "engine",
      "scope": "engine / determinism + goldens",
      "spawn": true,
    },
    {
      "handle": "mosaic",
      "role": "spine",
      "scope": "wire layer between engine and UI",
      "spawn": true,
    },
    {
      "handle": "loom",
      "role": "surface",
      "scope": "UI components",
      "spawn": true,
    },
    {
      "handle": "prism",
      "role": "verify",
      "scope": "integration/E2E",
      "spawn": true,
    },
  ],
  "grounding": ["AGENTS.md", "docs/PROJECT-SUMMARY.md"], // product-context reads, in order, before team docs
  "paths": {
    "teamDir": ".anthill", // SOP = teamDir/README.md
    "seatDir": ".anthill/dev", // seat docs + seams.md
    "seams": ".anthill/dev/seams.md",
  },
  "launch": "claude \"/anthill:join {handle}\"", // per-pane spawn command template
  "gate": "bun run check", // the PROJECT's pre-commit verification — NO DEFAULT (see below)
}
```

**`gate` (added 2026-08-03) is the project's own verification command, and it deliberately has no
default.** `anthill join` composes it into the land command it emits, in front of the commit and in
one string with no pipe. Hard-coding a default here would be the convention-baked-into-a-default
anti-pattern: **a seat running someone else's gate command gets a green that means nothing.** When
the field is unset the emitted land command **announces the absence** rather than silently committing
unverified — an announced absence over a silent one. Nothing backfills it automatically, so
`anthill:bootstrap` asks for it at ratify and `anthill:convene` asks once when an older footprint
lacks it.

**Plugin defaults** (a minimal config is just `channel` + `seats`): `grounding` defaults to
`["AGENTS.md", "README.md"]`; `paths` to the `.anthill/` triple above; `launch` to the
plugin-namespaced join; `version` to `1` when unstamped, while a fresh bootstrap stamps the
current footprint version (`2`).

**Field rules:**

- `seats[]` is the **single source of the roster** (explicit, not derived from filenames). Each
  carries **`role` + `scope` only** — no timing flag, no `owns`, no `relationships` (those evolve
  and live in seat-doc prose, surfaced via the reflection touchpoint).
- `spawn: true/false` is just the **zero-args default spawn set** for `anthill spawn`; the lead
  overrides freely per phase. (layered-app defaults the verifier _in_, reflecting Cole's shift
  toward early verifier inclusion.)
- `grounding` and `paths` are **overridable plugin defaults** — most real configs are just
  `channel` + `seats`.
- `launch` is a template (`{handle}` substituted); defaults to the plugin-namespaced join.

### 5a. Many teams in one project (added 2026-08-09)

> **Current.** Implemented by `resolveProject()` / `loadProject()` in `config.ts`, beside the
> single-team `resolveConfig()` / `loadConfig()`, which are unchanged.

A project may carry a **`teams` map** instead of a flat team. **The shape is detected structurally —
`"teams" in raw` — and NO new version is stamped.** `version` means _footprint layout_ (what
`migrate` relocates); overloading it with schema shape would make `anthill migrate` report
_"already at v3"_ while `CURRENT_VERSION` is `2`, which reads as "ahead of the plugin" when nothing
moved on disk. AWS has carried `[default]` beside `[profile foo]` for a decade with no version field
at all.

```jsonc
{
  "version": 2, // still 2 — the footprint layout did not move
  "gate": "bun run check", // project-level: cascades into every team
  "grounding": ["AGENTS.md"],
  "teams": {
    "dev": {
      "lead": "maestro",
      "seats": [/* … */],
      "paths": { "teamDir": ".anthill" }, // the incumbent keeps its existing docs in place
    },
    "dev-lean": {
      "lead": "boss",
      "seats": [/* … */],
      "forkedFrom": "dev",
      "forkedAt": "2026-08-09",
    },
  },
}
```

**Field rules, in addition to the flat ones above:**

- **A flat config is one team named `default`.** Not derived from `channel`: AWS, Terraform and
  Docker all terminate on a _named_ default, it gives `anthill team use default` something to say,
  and it gives an error message a noun.
- **`version`, `launch`, `grounding` and `gate` are project-level and cascade in**; an entry
  overrides what it names and inherits the rest. `channel`, `seats`, `lead` and `paths` belong to a
  team, and **a `teams` map beside any of them at the top level is an error** — that state is a
  half-finished conversion, and ignoring the strays would silently drop the incumbent team.
- **`channel` is optional and defaults to the team's name**, so `{"teams": {"dev": {lead, seats}}}`
  is complete.
- **`teamDir` defaults to `.anthill/teams/<name>`** so two teams' living docs cannot land on top of
  each other. **The incumbent team gets an explicit `paths.teamDir: ".anthill"` written for it** at
  conversion time — zero file moves, and new teams still get the new default.
- **Cross-team rules**, all of which only exist above one team: names must match
  `/^[a-zA-Z0-9._-]+$/` (a name becomes a tmux session key and a directory segment); **channels must
  be unique**, since a channel is the message log's filename; and channels must be **prefix-free**,
  which is stricter — `anthill attach` folds `<channel>-<suffix>` sessions in as siblings of
  `<channel>`, so `anthill-dev` + `anthill-dev-lean` would put a fork's panes in its parent's menu.
- **`forkedFrom` / `forkedAt`** are lineage, surfaced by `anthill team ls`.

**Which team applies is resolved AMBIENTLY — an agent never names one in a command.** That ladder
(`--team` → `ANTHILL_TEAM` → the pin → the sole team → throw) is `resolveTeam`'s, and
**`ResolvedProject` deliberately carries no `soleTeam` field**: a top-level field is total, so an
absence cannot carry a verdict.

---

## 6. `.anthill/` scaffold templates (Piece 3)

> **Current.** Source lives at `plugin/templates/docs-team/`; it renders into the consuming
> repo's `.anthill/` root (`README.md`, `dev/`, `paper-cuts.md`). As approved, the render target
> was `docs/team/`.

What `anthill init` renders into a target repo. Generalized from dream-flute, with the three
principles written in and all domain (wall/seam/engine) stripped.

| Template                             | Content                                                                                                                                                                                                           | Fill state                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `README.md` (SOP)                    | Stigmergy framing + the 3 principles; three homes for knowledge; shared practices; workflow (convene→work→finalize); commit discipline; the finalize+reflection ritual (curation-as-pheromone + structure-adapts) | Fully written, project-agnostic       |
| `dev/seams.md`                       | Single-source inter-seat contracts: what belongs here, who owns a contract, the "whoever moves a boundary updates this + its proof" maintenance trigger. Contracts accrete as discovered.                         | Skeleton + guidance, no contracts yet |
| `dev/<handle>.md`                    | One per seat. Fields (locked): **Who I am · Scope · Boundaries · Relationships · Taste & reflexes · Hard-won lessons · Anti-patterns · Candidates**. Header pre-filled from config; body scaffolded prompts.      | Header from config; body scaffolded   |
| `dev/README.md`                      | Roster table generated from `config.seats`.                                                                                                                                                                       | Generated                             |
| `paper-cuts.md`                      | Friction log: append-during-session, triage-by-cost, track-disposition (fixed / filed upstream / graduated to a project).                                                                                         | Template + method                     |
| `principles.md` _(added 2026-08-01)_ | What this team learned the hard way, each entry carrying the scar that paid for it. What belongs here vs. the SOP; how one gets added at finalize.                                                                | Guidance only — **empty by design**   |
| `retro.md` _(added 2026-08-09)_      | The three retro questions and the two rules that make them checkable (Q3 answers are falsifiable hypotheses; agreement is not truth). Newest-first entries, written by the lead at finalize.                      | Guidance only — **empty by design**   |

**Running scratch:** per-session, append-only, gitignored — `<teamDir>/scratch/<handle>/<date>-<slug>.md`.
`anthill:join` mints the session file; the seat appends as it works; `anthill:finalize-session`
curates it into the seat doc. Disposable after synthesis.

**Every path above resolves through `paths`** (§5) — `init` renders team-level docs under `teamDir`,
the seat layer under `seatDir`, and `seams.md` at `seams`; the `dev/` segment in the template tree is
_layout_, not a path. **`anthill init` ensures the gitignore lines derived from that team's
`teamDir`** (`<teamDir>/scratch/` and `<teamDir>/comms`, one pair per configured team) plus the
repo-root `.bounty-session` marker.

---

## 7. Lifecycle skills (Piece 4), config-driven

Namespace carries the branding (`anthill:<action>`, the way `project-docs:create-project` does),
so action names stay clear.

- **`anthill:convene`** _(invoking agent becomes the lead)_ — ground (config `grounding` →
  SOP → lead seat doc → `seams.md`), gather the work from the human, stand up coordination
  (CLI → grapevine open + topic, bounty board), seed cards, brief + spawn the seats the current
  phase needs.
- **`anthill:join <handle>`** _(a seat re-grounds)_ — identify handle, re-ground (grounding →
  SOP → `seams.md` → own seat doc), get on the wires (CLI emits tail commands), **open the
  running scratch**, signal ready, claim card, work.
- **`anthill:finalize-session`** — each seat curates scratch → seat doc; shared `seams.md` pass;
  the **structure reflection**; lead lands doc commits + tears down the session.

The human surface is intentionally tiny: _"convene the team"_ … _"finalize."_ The lead agent
drives the CLI; the human rarely intervenes.

> **Addendum (2026-07-03) — `plan` added as a lifecycle phase.** After this design was approved, a
> distinct **plan** phase was added between design and build: `bootstrap → convene → plan → build →
finalize-session`. The lead scaffolds a plan **skeleton** (integration order + cross-seam contracts
> as _claims_) and each owning seat **ratifies or falsifies the seams it touches before drafting**.
> It ships as the **`anthill:plan`** skill + a bundled `methodology.md` (universal → plugin), pointed
> at from the SOP and `convene`; the ratify is a light vine-acknowledgement gate before `todo→doing`,
> not a bounty schema change. Scoped to multi-seat features — solo work uses single-agent planning.
> Shipped 2026-07-03 (`f6b34eb`); see `docs/projects/_archive/team-dev-planning/`.

> **Addendum (2026-07-27) — the skill set is now six.** Beyond the three above and `plan`,
> **`anthill:upgrade`** was added to drive footprint migrations (D-series §5, `migrations/`), and
> **`anthill:bootstrap`** (Piece 5, §9) is itself a lifecycle skill. Current set:
> `bootstrap · convene · plan · join · finalize-session · upgrade`.

---

## 8. Plugin/repo structure + CLI (Pieces 1–2)

> **Current.** Everything shippable moved under `plugin/` on 2026-07-05 so a consuming repo
> receives only that subtree (a `git-subdir` marketplace source), and the CLI shell dropped Citty
> for an in-house zero-dependency `parseArgs` layer. As approved, `skills/`, `scripts/`, and
> `templates/` sat at the repo root.

```
anthill/
├─ .claude-plugin/
│   └─ marketplace.json        # add anthill as a marketplace (points at plugin/ via git-subdir)
├─ plugin/                     # ← THE SHIPPED SUBTREE; nothing outside it reaches a consumer
│   ├─ .claude-plugin/
│   │   └─ plugin.json         # plugin manifest
│   ├─ skills/
│   │   └─ bootstrap/ convene/ join/ plan/ finalize-session/ upgrade/
│   ├─ scripts/anthill/        # CLI — zero-dependency (in-house parseArgs layer)
│   │   ├─ cli.ts  define.ts  agent-layer.ts  manifest.ts  help-renderer.ts  paths.ts  …
│   │   ├─ config.ts           # find + parse .anthill/config.json (root marker)
│   │   ├─ coord.ts            # resolveCoordCli/execCoord — spellbook facade
│   │   ├─ scan.ts             # deterministic workspace/surface detector
│   │   ├─ migrate.ts          # pure, deterministic migration planner (no IO)
│   │   ├─ tmux.ts             # generic tmux helper (lift from flute)
│   │   └─ commands/           # the command set below
│   └─ templates/
│       ├─ docs-team/          # the §6 scaffold templates
│       └─ archetypes/
│           ├─ layered-app.json    # the Slice-1 archetype (lead + engine/spine/surface + verify)
│           └─ multi-surface.json  # by-surface seating, paired with `anthill scan`
├─ docs/                       # design-of-record, projects, investigations, ROADMAP
└─ .anthill/                   # anthill's OWN team footprint (self-host dogfood)
```

**CLI command set** (Slice 1 shipped `convene`…`init`; `scan`, `feedback`, and `migrate` were
added in later slices; `field-notes` later still):

- `anthill convene [--topic]` — grapevine open + topic + bounty state
- `anthill join <handle>` — emit grounding manifest + tail commands
- `anthill spawn [handles…]` — tmux panes, one per seat, auto-fire `/anthill:join`
- `anthill attach` / `anthill down` — session lifecycle (down keeps the presence guard)
- `anthill status` — who's on the vine + board counts
- `anthill field-notes` — print anthill's cross-team observations (needs no config; the doc ships
  in the plugin, deliberately, so it is current for whoever has the plugin rather than frozen into a
  footprint at bootstrap)
- `anthill commit` — file-scoped, serialized commit (carries the shared-index-race fix)
- `anthill init` — **deterministic renderer**: given `.anthill/config.json`, render `templates/`
  into the target repo (idempotent; re-runnable when the team reshapes — renders new seat docs
  without clobbering existing ones)
- `anthill scan` — deterministic workspace/surface detection, feeding bootstrap's candidate seatings
- `anthill feedback` — send a bug or idea upstream to the anthill repo
- `anthill migrate` — apply a footprint version migration (v1 → v2), planned purely by `migrate.ts`
- `anthill info` — environment/config introspection

**Generalizations from flute:** config-driven (no hardcoded channel/seats/paths); self-locating
(CLI lives in plugin cache, resolves spellbook from _its_ cache via the `resolveCoordCli` pattern).

---

## 9. `anthill:bootstrap` (Piece 5) + the proof run

For Slice 1 bootstrap is deliberately thin (it instantiates the layered-app archetype rather
than doing full discovery).

1. **Preflight** — spellbook (grapevine + bounty)? tmux? Bun? If missing, guide install and stop.
2. **Light discovery** — read the repo's grounding docs, confirm layered-app, propose the
   layered-app seats (lead + engine/spine/surface + verify) with scopes drafted from what it sees.
3. **Ratify** — human renames/merges/re-scopes seats, sets the channel.
4. **Write + render** — emit `.anthill/config.json`, run `anthill init`, add the gitignore line.
5. **Proof run** — `anthill:convene` → `anthill spawn` opens panes, seats auto-join → one tiny
   real task → `anthill:finalize-session`.

### Slice 1 acceptance

**The full loop runs end-to-end in a repo that is not dream-flute:** bootstrap → config + scaffold
rendered → convene → seats spawn into tmux panes and auto-join → a trivial task moves through the
board → finalize curates seat docs + tears down cleanly.

---

## 10. Deferred (future slices)

- **Discovery intelligence** — full principles-driven composition (derive seats from the repo's
  real architecture/seams), beyond instantiating one archetype.
- **More archetypes** — service-api, library-sdk, monorepo, …
- **Mid-session / between-phases reflection retro** as a first-class ritual (D9).
- **`owns` / `relationships` evolution** — the structure-reflection output maturing into
  richer, possibly machine-checkable ownership.
- **Dogfood on dream-flute** — migrate it onto the plugin; prove the abstraction reproduces the
  current team without loss (the real parity test).

---

## 11. Dependencies & assumptions

- **spellbook** plugin installed (grapevine + bounty CLIs) — preflighted by bootstrap.
- **Bun** on PATH (runs the CLI; spellbook CLIs are `bun <cli>.ts`).
- **tmux** on PATH for pane mode (subagent mode degrades without it).
- **`claude` CLI** on PATH for the launch template (overridable in config).
- Target repo has some product-grounding doc(s) for `grounding` (defaults `AGENTS.md` / `README.md`).

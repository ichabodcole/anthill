# Anthill — Portable Team-OS Plugin (Design Spec)

**Date:** 2026-06-28
**Status:** Design approved; Slice 1 ready for planning
**Author:** brainstormed with Cole (maestro)
**Lives at (target repo):** `/Users/colereed/Projects/dreamwood/anthill` (new, sibling of dream-flute)
**Spec home:** authored in dream-flute (`docs/superpowers/specs/`) because that's the working repo; the implementation lands in the new `anthill` repo.

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

| #   | Decision                                                 | Rationale                                                                                                                                                                                                                                                                                                            |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Standalone plugin + own marketplace** (repo `anthill`) | Matches how spellbook / project-docs ship; gives independent versioning so it can "evolve on its own."                                                                                                                                                                                                               |
| D2  | **Composition = principles + archetype seeds**           | Opinionated enough to be fast, flexible enough to fit any project. Discovery proposes a draft from the nearest archetype, then the human ratifies/tailors. (Full discovery intelligence is a later slice.)                                                                                                           |
| D3  | **Execution = both, tmux-first**                         | Primary path is tmux panes (visible, attachable, persistent); subagent mode is the documented lightweight fallback. Matches how dream-flute actually runs.                                                                                                                                                           |
| D4  | **Build = walking skeleton**                             | Slice 1 gets the full loop running end-to-end for ONE archetype (layered-app), then later slices add discovery intelligence + more archetypes + dogfood. De-risks the portability contract early.                                                                                                                    |
| D5  | **Brain/hands split**                                    | The **skill** (`anthill:bootstrap`) decides the config (judgment: explore → converse → compose). The **CLI** (`anthill init`) deterministically renders templates from that config (mechanical). No external cookiecutter dependency — the agent is the smart templating engine; the CLI is the idempotent renderer. |
| D6  | **CLI seeded from `create-project-cli`**                 | anthill's CLI shell is generated via `bunx github:ichabodcole/seed-project-cli anthill --no-api --no-auth` (all commands are `workspace` scope). We layer the team commands on top, lifting/generalizing flute's team layer. No hand-porting of CLI boilerplate.                                                     |
| D7  | **Zero target-repo footprint**                           | Skills resolve + drive the plugin's CLI straight from the plugin cache (the way flute drives spellbook). A consuming repo gets only `.team/config.json`, `docs/team/`, and one `.gitignore` line.                                                                                                                    |
| D8  | **Depends on spellbook + Bun + tmux**                    | spellbook (grapevine + bounty) is the coordination layer; Bun runs the CLI; tmux runs pane mode. `anthill:bootstrap` preflights all three and guides install if missing.                                                                                                                                             |
| D9  | **Reflection folds into finalize for Slice 1**           | A mid-session / between-phases retro is noted as the next evolution, not built yet.                                                                                                                                                                                                                                  |

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
| 1. Foundation            | `anthill` repo + `marketplace.json`/`plugin.json` + `.team/config.json` schema + CLI shell   | `create-project-cli` (shell)               |
| 2. Portable CLI commands | convene/join/spawn/attach/down/status/commit/**init** + `tmux.ts` + `coord.ts` + `config.ts` | flute `team-*.ts` + `tmux.ts` (generalize) |
| 3. Scaffold templates    | `docs/team/` skeletons (SOP, seams, seat-doc, roster, paper-cuts)                            | dream-flute `docs/team/` (strip domain)    |
| 4. Lifecycle skills      | `anthill:convene` / `join` / `finalize-session`, config-driven                               | the three flute skills                     |
| 5. `anthill:bootstrap`   | meta-skill: explore → compose → write config → `anthill init`                                | _new_                                      |
| 6. Dogfood (later)       | migrate dream-flute onto the plugin; prove parity                                            | —                                          |

---

## 5. The `.team/config.json` contract (keystone)

The single file that replaces all of dream-flute's hardcoded specifics. The CLI and all three
skills **read** it; `anthill:bootstrap` **writes** it. **Its location is the project-root marker**
(walk up from cwd) — this removes flute's brittle `package.json`-name matching.

```jsonc
// <project>/.team/config.json
{
  "version": 1,
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
    "teamDir": "docs/team", // SOP = teamDir/README.md
    "seatDir": "docs/team/dev", // seat docs + seams.md
    "seams": "docs/team/dev/seams.md",
  },
  "launch": "claude \"/anthill:join {handle}\"", // per-pane spawn command template
}
```

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

---

## 6. `docs/team/` scaffold templates (Piece 3)

What `anthill init` renders into a target repo. Generalized from dream-flute, with the three
principles written in and all domain (wall/seam/engine) stripped.

| Template          | Content                                                                                                                                                                                                           | Fill state                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `README.md` (SOP) | Stigmergy framing + the 3 principles; three homes for knowledge; shared practices; workflow (convene→work→finalize); commit discipline; the finalize+reflection ritual (curation-as-pheromone + structure-adapts) | Fully written, project-agnostic       |
| `dev/seams.md`    | Single-source inter-seat contracts: what belongs here, who owns a contract, the "whoever moves a boundary updates this + its proof" maintenance trigger. Contracts accrete as discovered.                         | Skeleton + guidance, no contracts yet |
| `dev/<handle>.md` | One per seat. Fields (locked): **Who I am · Scope · Boundaries · Relationships · Taste & reflexes · Hard-won lessons · Anti-patterns · Candidates**. Header pre-filled from config; body scaffolded prompts.      | Header from config; body scaffolded   |
| `dev/README.md`   | Roster table generated from `config.seats`.                                                                                                                                                                       | Generated                             |
| `paper-cuts.md`   | Friction log: append-during-session, triage-by-cost, track-disposition (fixed / filed upstream / graduated to a project).                                                                                         | Template + method                     |

**Running scratch:** per-session, append-only, gitignored — `.team/scratch/<handle>/<date>-<slug>.md`.
`anthill:join` mints the session file; the seat appends as it works; `anthill:finalize-session`
curates it into the seat doc. Disposable after synthesis. `anthill init` adds the
`.team/scratch/` gitignore line.

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

---

## 8. Plugin/repo structure + CLI (Pieces 1–2)

```
anthill/
├─ .claude-plugin/
│   ├─ marketplace.json        # add anthill as a marketplace
│   └─ plugin.json             # plugin manifest
├─ skills/
│   ├─ bootstrap/  convene/  join/  finalize-session/
├─ scripts/anthill/            # CLI — seeded from create-project-cli (--no-api --no-auth)
│   ├─ cli.ts  define.ts  agent-layer.ts  manifest.ts  help-renderer.ts  paths.ts  …  (generated)
│   ├─ config.ts               # find + parse .team/config.json (root marker)   [added]
│   ├─ coord.ts                # resolveCoordCli/execCoord — spellbook facade     [added]
│   ├─ tmux.ts                 # generic tmux helper (lift from flute)            [added]
│   └─ commands/               # convene join spawn attach down status commit init [added]
└─ templates/
    ├─ docs-team/              # the §6 scaffold templates
    └─ archetypes/
        └─ layered-app.json    # the Slice-1 archetype (lead + engine/spine/surface + verify)
```

**CLI command set (Slice 1):**

- `anthill convene [--topic]` — grapevine open + topic + bounty state
- `anthill join <handle>` — emit grounding manifest + tail commands
- `anthill spawn [handles…]` — tmux panes, one per seat, auto-fire `/anthill:join`
- `anthill attach` / `anthill down` — session lifecycle (down keeps the presence guard)
- `anthill status` — who's on the vine + board counts
- `anthill commit` — file-scoped, serialized commit (carries the shared-index-race fix)
- `anthill init` — **deterministic renderer**: given `.team/config.json`, render `templates/`
  into the target repo (idempotent; re-runnable when the team reshapes — renders new seat docs
  without clobbering existing ones)

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
4. **Write + render** — emit `.team/config.json`, run `anthill init`, add the gitignore line.
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

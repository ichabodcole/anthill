# Project Summary

**Last Updated:** 2026-07-27 · **Project Status:** Active Development

## Overview

**anthill** is a portable "team-OS" — a Claude Code plugin that stands up a multi-agent
development team inside any repository. The model is **durable seats filled by ephemeral
agents**: roles like lead, engine, brain, and verify persist as seats, while the agents occupying
them come and go. They coordinate over a discussion channel (grapevine) and a task board
(bounty), and each departing agent leaves its context behind as living docs.

The name is the thesis. The system is **stigmergic**: agents are ants — short-lived, but each
leaves a pheromone trail (living docs) for the next instance, and the team structure adapts to
the work rather than being fixed up front. Persistent friction is treated as a signal to reshape
the team, not to endure. A second principle now sits beside it: **anthill adapts to the host
project, it does not dictate to it** — where a design question is really _"what standard applies
here?"_, anthill's job is to create the touch point where a team member checks the project's
_actual_ standard, never to bake one in.

anthill was extracted and generalized from the team system grown in the **`dream-flute`** project
and is distributed as its own plugin so it can evolve independently. It **dogfoods itself**: this
repo carries its own anthill team in `.anthill/`, and its own field reports drive its roadmap.

## Core Technologies

- **Primary Language:** TypeScript
- **Framework/Runtime:** **Bun** (not Node — use `bun`/`bunx`)
- **Build Tools:** No bundler, and **no runtime dependencies** — scripts run directly under Bun;
  the CLI uses an in-house `parseArgs` command layer (Citty was dropped in v1.3.0)
- **Key Dependencies (external, not npm):** **spellbook ≥ 1.16.0** (grapevine + bounty
  coordination — the floor is load-bearing for board session-binding), **tmux** + the `claude`
  CLI (agent spawning)
- **Development Tools:** Biome (lint/format for TS/JSON), Prettier (markdown; `.anthill/` +
  `plugin/templates/` excluded), Husky + lint-staged pre-commit, release-please + GitHub Actions
  CI

## Project Structure

```
plugin/                      ← the ONLY shipped subtree (git-subdir marketplace source)
├── .claude-plugin/plugin.json
├── scripts/anthill/         the CLI ("hands" — deterministic footprint rendering)
│   ├── cli.ts               root command `anthill` (+ `help --json` manifest)
│   ├── commands/            convene, join, spawn, attach, down, status, scan,
│   │                        commit, feedback, init, migrate, info
│   ├── coord.ts             facade over spellbook's grapevine + bounty
│   ├── config.ts            .anthill/config.json layer + project-root marker
│   ├── scan.ts              deterministic workspace/surface detector
│   ├── migrate.ts           pure, deterministic migration planner (no IO)
│   └── define.ts, help-renderer.ts, manifest.ts, tmux.ts, paths.ts, runtime.ts, ...
├── skills/                  the lifecycle "brain" (each a SKILL.md)
│   └── bootstrap/ convene/ join/ plan/ finalize-session/ upgrade/
└── templates/
    ├── archetypes/          team-composition seeds (layered-app, multi-surface)
    └── docs-team/           living-doc scaffold (dev/seams.md, {{handle}}.md, paper-cuts)
.claude-plugin/              marketplace.json (root — points at plugin/ via git-subdir)
docs/                        design-of-record, briefs, projects, investigations, reports, ROADMAP
.anthill/                    anthill's OWN team footprint (self-host dogfood)
```

Two boundaries matter. **Vertically**, the codebase splits along a **brain/hands** line: skills
decide _what_ the team should be (reading the repo, proposing composition), and the CLI
_deterministically renders/migrates_ that decision into the `.anthill/` footprint.
**Horizontally**, everything a consumer receives lives under `plugin/`; the repo root holds only
dev-time config, docs, and anthill's own team.

## Documented Systems

- **Anthill Portable Team-OS (Design Spec)** — the design-of-record: the D1–D9 locked decisions,
  config schema, brain/hands split, "three homes for knowledge" (taste→seat doc, truth→`seams.md`,
  proof→tests), and the convene→work→finalize lifecycle. See
  `docs/architecture/2026-06-28-anthill-portable-team-os-design.md`. Revised 2026-07-27: its §0
  explains the split — the decisions and rationale (§1–4, §9–11) are preserved as the approved
  record, while the contracts and maps (§5 config schema, §6 scaffold, §7 skills, §8 layout) are
  kept current, since `config.ts` and `paths.ts` cite "spec §5" directly.

`docs/architecture/` otherwise holds only a README and a template — this one doc carries the
substantive design.

**Live inter-seat contracts** are not in `docs/` at all — they live in `.anthill/dev/seams.md`,
which now carries three ratified contracts: the `anthill scan` payload (`ScanReport`), the
`anthill feedback` invocation contract, and board-binding.

## Application Specifications

No application specifications have been created yet — `docs/specifications/` and
`docs/interaction-design/` contain only their READMEs and unfilled templates. (This is a
tooling/plugin project, so formal domain specs may never be the primary artifact.)

## Recent Activity (Last 30 Days)

69 commits across 196 files since the previous summary (2026-07-03), spanning four releases
(v1.2.0 → v1.5.0). Roughly two-thirds are docs commits — expected in a project whose product is
partly its methodology, but also a marker of a triage-heavy stretch.

**Active Work Areas:**

- **Distribution hardening (v1.3.0):** shippables moved into the `plugin/` subtree with a
  `git-subdir` marketplace source, and the CLI made **zero-dependency** (Citty replaced by an
  in-house `parseArgs` layer). Consumers stop receiving internal `.anthill/`/`docs/`/dev config,
  and the CLI needs no runtime fetch. Verified by both a clean-room run and a real cached install.
- **The v0.2 bundle shipped in full:** `anthill:plan` (skeleton→ratify), the optional global
  `anthill` CLI launcher, `anthill scan` + the `multi-surface` archetype, ritual checklists baked
  into the lifecycle skills, and the first instrumented dogfood session.
- **Field-feedback loop:** `anthill feedback` shipped as the upstream bug/idea path, and numbered
  GitHub issues now drive the roadmap's triage queue. Recent landings: board-session-binding
  (every seat verb resolves _this_ team's board ambiently) and the convene pre-spawn
  branch-confirm beat.

**Recent Sessions:** live project folders have no `sessions/` yet (session notes land at archive
time). The most recent are `docs/projects/_archive/multi-surface-archetype/sessions/2026-07-05-multi-surface-dogfood.md`
and the board-session-binding finalize (`7bf6d18`, 2026-07-10). `docs/memories/` holds six
recap notes — read that folder first in a new session.

**Notable Changes:** the **adapt-not-dictate** principle was enshrined in `AGENTS.md`
(`ff2770e`), along with a scope-based branch policy (`7ad02d5`); `docs/ROADMAP.md` was updated 16
times and is the single router over everything.

## Current Direction

**Active Projects:**

- **anthill-commit-hardening** — _Planned, ready to build_ (a plan with no proposal, by design for
  a light single-seat build). Two land-time hardenings of `anthill commit`: a **configurable**
  protected-trunk guard (never a baked-in `develop`/`main`) and the foreign-red diagnostic —
  shared-tree move C.1. The most build-ready item on the board, and the only queued item needing
  no further design pass. See `docs/projects/anthill-commit-hardening/plan.md`.
- **shared-tree-gate-tension** — _Partially shipped_ (moves A + B1 landed 2026-07-08). The
  whole-tree pre-commit gate vs. a shared working tree. Move C.1 is now folded into the
  commit-hardening plan; **move C proper stays deferred**, its evidence still strengthening.
- **research-probes** — _Draft_. A project-local rotating registry of pointed questions the team
  ritual collects signal on, governed by an observer-effect discipline.
- **per-seat-model-selection** — _Draft_. Optional `model` on a seat so each runs on the model
  that fits its work.

_(board-session-binding shipped 2026-07-10 and was archived on 2026-07-27.)_

**In Progress Investigations:**

- Agent signal-hunger · Seat subagent orchestration (both _Monitor — validate in situ during the
  next instrumented dogfood_) · File-activity heatmap (_secondary_). See `docs/investigations/`.

Per `docs/ROADMAP.md`, **nothing is currently in flight**, but commit-hardening now sits under
**Now** as _planned, ready to build_. The roadmap's numbered **Next** holds
dream-flute parity close-out (#12) and the memory bundle (#8–#10) — now unblocked, since the
instrumented dogfood produced the trail data they were gated on. Weighed against them is the
"Recently captured" triage queue, where **shared-tree move C** carries the strongest evidence.
The next slice gets picked at the next convene.

## Development Patterns & Practices

- **Branch flow:** scope decides. Substantive work takes a **feature branch off `develop`** →
  merge to `develop` → PR `develop` → `main`. **Docs-only commits and very small fixes may land
  directly on `develop`.** `main` is branch-protected (PR + green CI, admins included);
  release-please cuts releases on merge to `main`.
- **The full gate:** `bun run check` (typecheck + Biome + tests) — also the Husky pre-commit.
  157 tests across 16 files currently pass.
- **Self-hosting:** substantial work is done by a _convened team_ (lead + seats), not a lone
  agent — run `anthill:convene` to start a session, or `anthill:join <handle>` to take a seat.
  The live roster is maestro (lead), forager (CLI/engine), weaver (skills/templates), sentinel
  (verify).
- **Docs-as-process:** a rich `docs/` taxonomy (briefs → projects → investigations → reports →
  lessons-learned → memories) drives the work; `docs/ROADMAP.md` is the router over all of it,
  re-read at convene and updated at finalize.
- **Testing style:** pure helpers plus injectable seams (e.g. an injectable `gh()` in feedback),
  fixture repos under `__fixtures__/` for `scan`, dual-audience `{ok, data, meta}` envelopes with
  a `--format text|json` root flag.
- **Playbooks/Lessons-learned:** one playbook (writing instructional content for agents), one
  lesson (the first external bootstrap) — still lightly populated, deliberately.

## Quick Start for New Contributors

1. Read `AGENTS.md` (the lean index — single source of grounding), then skim `docs/memories/`
   for a recap of recent work.
2. Read the design-of-record:
   `docs/architecture/2026-06-28-anthill-portable-team-os-design.md` (decisions are current;
   paths are stale).
3. Skim `docs/ROADMAP.md` for what's queued and in what order.
4. Install deps: `bun install` · Run the CLI: `bun run anthill <cmd>` · Tests: `bun test` ·
   Full gate: `bun run check`.

## Key Insights

- **The mechanism/usage gap has closed.** The 2026-07-03 summary's headline caveat — that the
  team's own trails were empty scaffolds — no longer holds. `seams.md` carries three ratified
  contracts, all four seat docs have real content, and the first instrumented dogfood produced
  the data the memory work was gated on (the ratify gate caught two load-bearing seam errors at
  zero rework cost). Mechanism may now be _behind_ usage in places.
- **Field feedback is the primary design input.** Numbered issues (#14/#16/#19/#23/#24/#28/#31/#34)
  drive the roadmap. The `anthill feedback` command built in v1.3.0 is visibly feeding itself.
- **The shared working tree is the structural weak point.** One tree, N seats, one whole-tree
  pre-commit gate — nearly every field report of real friction so far reduces to this. Read the
  shared-tree proposal before touching commit/gate behavior.
- **"Adapt, not dictate" is enforceable law, not a slogan.** A convention baked into a skill or a
  command default is the anti-pattern; supply a _prompt + a config/grounding hook_ instead. The
  commit-hardening plan follows it literally — the protected-branch set is project-configured.
- **Brain/hands separation is load-bearing.** Skills make judgment calls; the CLI renders them
  deterministically. Keep non-deterministic decisions out of the CLI.
- **`plugin/` is the shipping boundary.** Anything outside it never reaches a consumer. Adding a
  file in the wrong half is the easiest structural mistake to make in this repo.
- **Bun, not Node**, and the CLI is deliberately **zero-dependency** — prefer Bun built-ins and
  don't reintroduce runtime deps.

---

_This summary was generated by analyzing the codebase, documentation, and recent activity. It
represents the actual state of the project as discovered, not just stated intentions._

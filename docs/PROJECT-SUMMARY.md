# Project Summary

**Last Updated:** 2026-07-03 · **Project Status:** Active Early Development

## Overview

**anthill** is a portable "team-OS" — a Claude Code plugin that stands up a multi-agent
development team inside any repository. The model is **durable seats filled by ephemeral
agents**: roles like lead, engine, spine, surface, and verify persist as seats, while the
agents occupying them come and go. They coordinate over a discussion channel (grapevine) and a
task board (bounty), and each departing agent leaves its context behind as living docs.

The name is the thesis. The system is **stigmergic**: agents are ants — short-lived, but each
leaves a pheromone trail (living docs) for the next instance, and the team structure adapts to
the work rather than being fixed up front. Persistent friction is treated as a signal to
reshape the team, not to endure.

anthill was extracted and generalized from the team system grown in the **`dream-flute`**
project and is distributed as its own plugin so it can evolve independently. It **dogfoods
itself**: this repo carries its own anthill team in `.anthill/`.

## Core Technologies

- **Primary Language:** TypeScript
- **Framework/Runtime:** **Bun** (not Node — use `bun`/`bunx`); [Citty](https://github.com/unjs/citty) for the CLI
- **Build Tools:** No bundler — scripts run directly under Bun
- **Key Dependencies:** Citty (CLI); **spellbook** (grapevine + bounty coordination); **tmux** + the `claude` CLI (agent spawning)
- **Development Tools:** Biome (lint/format for code), Prettier (markdown only; `docs/` excluded), Husky + lint-staged pre-commit, release-please + GitHub Actions CI

## Project Structure

```
scripts/anthill/         the CLI ("hands" — deterministic footprint rendering)
├── cli.ts               Citty root command `anthill` (+ help --json manifest)
├── commands/            team-init, convene, join, spawn, attach, status,
│                        support, commit, down, migrate, info
├── coord.ts             facade over spellbook's grapevine + bounty
├── config.ts            .anthill/config.json layer + project-root marker
├── migrate.ts           pure, deterministic migration planner (no IO)
└── tmux.ts, paths.ts, manifest.ts, agent-layer.ts, runtime.ts, ...
skills/                  the lifecycle "brain" (each a SKILL.md)
├── bootstrap/ convene/ join/ finalize-session/ upgrade/
templates/
├── archetypes/          team-composition seeds (layered-app.json)
└── docs-team/           living-doc scaffold (dev/seams.md, {{handle}}.md)
docs/                    design-of-record, briefs, projects, investigations, reports, ROADMAP
.anthill/                anthill's OWN team footprint (self-host dogfood)
```

The codebase splits along a **brain/hands** line: skills decide *what* the team should be
(reading the repo, proposing composition), and the CLI *deterministically renders/migrates*
that decision into the `.anthill/` footprint.

## Documented Systems

- **Anthill Portable Team-OS (Design Spec)** — the design-of-record: the D1–D9 locked
  decisions, config schema, brain/hands split, "three homes for knowledge" (taste→seat doc,
  truth→`seams.md`, proof→tests), and the convene→work→finalize lifecycle. See
  `docs/architecture/2026-06-28-anthill-portable-team-os-design.md`.

`docs/architecture/` otherwise holds only a README and a template — this one doc carries the
substantive design.

## Application Specifications

No application specifications have been created yet — `docs/specifications/` and
`docs/interaction-design/` contain only their READMEs and unfilled templates. (This is a
tooling/plugin project, so formal domain specs may never be the primary artifact.)

## Recent Activity (Last 30 Days)

The repository is roughly five weeks old, so the last 30 days *are* its bootstrap. Three arcs:

**Active Work Areas:**

- **Slice-1 walking skeleton (T1–T10):** the CLI shell, plugin/marketplace manifests, config
  layer, tmux + spellbook coordination facade, deterministic scaffold renderer, and the core
  lifecycle skills (bootstrap, convene, join, finalize-session).
- **Footprint migration (v1→v2):** consolidated the consumer footprint under a single
  `.anthill/` root, plus a pure migration planner, the `anthill migrate` CLI, and the
  `anthill:upgrade` skill.
- **Tooling & docs hardening:** Biome/Husky/lint-staged gates, release-please + CI, self-host
  dogfood ("bootstrap anthill's own team"), a burst of investigations/reports, and the new
  `docs/ROADMAP.md`.

**Notable Changes:** `docs/ROADMAP.md` (2026-07-03) now gives a single prioritized Now/Next/
Later view; a fresh-eyes conceptual + implementation review (2026-07-02) assessed the design.

**Sessions/Memories:** none written yet outside the archived Slice-1 build note — `docs/memories/`
is still scaffold-only.

## Current Direction

**Active Projects:**

- **team-dev-planning** — *Draft* (proposal + methodology writeup; no plan.md yet). Adds a
  first-class "skeleton → ratify" handshake so the lead drafts a light plan and each seat
  ratifies its own cross-seam boundary before building. Roadmap's #1 ("lifecycle keystone").
  See `docs/projects/team-dev-planning/`.
- **anthill-footprint-migration** — *Draft* (has plan.md; largely landed per git history). The
  `.anthill/` consolidation shipped as the inaugural v1→v2 versioned migration. See
  `docs/projects/anthill-footprint-migration/`.

**In Progress Investigations:**

- Docs-taxonomy in the team era · Agent codebase-navigation state-of-the-art · Agentic-teams
  memory/stigmergy landscape · File-activity heatmap. See `docs/investigations/`.

The near-term trajectory (per `docs/ROADMAP.md`): finish v0.2's foundation — build the
`anthill:plan` skill and ship the global `anthill` CLI — then run the **first instrumented
dogfood session** to generate real trail data before layering on more memory machinery.

## Development Patterns & Practices

- **Branch flow:** feature branch off `develop` → merge to `develop` → PR `develop` → `main`.
  `main` is branch-protected (PR + green CI, admins included); release-please cuts releases on
  merge to `main`.
- **The full gate:** `bun run check` (typecheck + Biome + tests) — also the Husky pre-commit.
- **Self-hosting:** substantial work is done by a *convened team* (lead + seats), not a lone
  agent — run `anthill:convene` to start a session, or `anthill:join <handle>` to take a seat.
- **Docs-as-process:** a rich `docs/` taxonomy (briefs → projects → investigations → reports →
  lessons-learned) drives the work; `docs/ROADMAP.md` is the router over all of it.
- **Playbooks/Lessons-learned:** directories exist as part of the scaffold; still lightly
  populated this early.

## Quick Start for New Contributors

1. Read `AGENTS.md` (the lean index — single source of grounding).
2. Read the design-of-record: `docs/architecture/2026-06-28-anthill-portable-team-os-design.md`.
3. Skim `docs/ROADMAP.md` for what's in flight and in what order.
4. Install deps: `bun install` · Run the CLI: `bun run anthill <cmd>` · Tests: `bun test` ·
   Full gate: `bun run check`.

## Key Insights

- **Mechanism is currently ahead of usage.** The 2026-07-02 fresh-eyes review found the
  conceptual core sound but the team's own trails (`seams.md`, seat docs) still empty scaffolds
  — which is why the roadmap deliberately sequences a real *dogfood session* before adding more
  memory mechanisms.
- **Brain/hands separation is load-bearing.** Skills make judgment calls; the CLI renders them
  deterministically. Keep non-deterministic decisions out of the CLI.
- **Bun, not Node.** Prefer Bun built-ins over npm equivalents.
- **Stigmergy is the design frame, not decoration.** Living docs are pheromone trails and the
  team shape is meant to adapt to friction — read it that way when touching the lifecycle skills.
- **A few doc hygiene gaps exist:** the root README still says "Building Slice 1" and links the
  design doc at a stale `docs/specs/...` path, and `PROJECT_MANIFESTO.md` is an unfilled
  template (see the discovery report's recommendations).

---

_This summary was generated by analyzing the codebase, documentation, and recent activity. It
represents the actual state of the project as discovered, not just stated intentions._

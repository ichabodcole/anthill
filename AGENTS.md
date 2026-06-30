# anthill — agent guide

A portable **team-OS** Claude Code plugin: it stands up a multi-agent dev team (ephemeral
agents in durable seats) in any project, coordinating over grapevine + a bounty board. This
repo is anthill's own source.

Keep this file lean — an index + the non-obvious essentials, not a tutorial.

## Where to look

- `docs/README.md` — the **docs map**: every doc type, its lifecycle, and where things go.
  New session? skim `docs/memories/` first for a recap of recent work.
- `docs/architecture/2026-06-28-anthill-portable-team-os-design.md` — the design-of-record
  (thesis, the three stigmergy principles, the D1–D9 decisions, the config schema).
- `docs/briefs/2026-06-30-anthill-v0.2-next-release.md` — the active roadmap.
- `docs/backlog/` — small ready-to-pick tasks · `docs/investigations/` — research ·
  `docs/lessons-learned/` — field lessons · `docs/projects/` — larger bodies of work.
- `docs/PROJECT_MANIFESTO.md` — vision & boundaries.

## What's not obvious

- **Built by a convened team.** Substantial work here is done by a lead + seats owning
  scopes (anthill's own methodology), not a lone agent — consider convening one for
  anything non-trivial.
- **Branch flow + protected `main`.** Feature branch off `develop` → merge to `develop` →
  PR `develop` → `main`. `main` is branch-protected (PR + green CI required, admins
  included) — never push to it directly; release-please cuts the release on merge to `main`.
- **Runtime is Bun** (not Node): use `bun` / `bunx`, and prefer Bun built-ins over npm
  equivalents.

## Commands

- `bun run check` — the full gate (typecheck + biome + tests); the husky pre-commit runs it.
- `bun test` — tests · `bun run anthill <cmd>` — the CLI (`scripts/anthill/cli.ts`).

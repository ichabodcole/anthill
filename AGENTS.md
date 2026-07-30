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

- **Built by a convened team — anthill dogfoods itself.** This repo is self-hosted: its own
  anthill team lives in **`.anthill/`** (`.anthill/README.md` is the SOP; `.anthill/dev/<handle>.md`
  is each seat's living doc/brain; the roster is `.anthill/dev/README.md`). Substantial work is done
  by a lead + seats owning scopes, not a lone agent — run **`anthill:convene`** to start a session (or
  `anthill:join <handle>` to take a seat). Consider it for anything non-trivial.
- **anthill adapts to the host project — it does not dictate its conventions.** Where a design
  question is really _"what standard applies here?"_ (branch policy, naming, which trunk is
  protected, a formatting rule), anthill's job is to create the **touch point where a team member
  checks the project's _actual_ standard** — not to hard-code one. The system supplies the **trigger
  to decide**; the project supplies the **content** (via config, or its grounding docs). A convention
  baked into a skill or a command default is the anti-pattern — make it a _prompt + a config/grounding
  hook_ instead. (The branch-flow rule just below is a concrete instance: convene _prompts_ the branch
  decision and reads the policy from here; it never hard-codes one.)
- **Branch flow + protected `main`.** Substantive work — a feature, or a fix/refactor of real
  scope — takes a **feature branch off `develop`** → merge to `develop` → PR `develop` → `main`.
  **Docs-only commits and very small fixes may commit directly to `develop`** — a single doc or
  one-line fix doesn't warrant a branch. The judgment is _scope_: if it's a body of work, branch it;
  if it's a paper-cut, land it. `main` is branch-protected (PR + green CI required, admins included) —
  never push to it directly; release-please cuts the release on merge to `main`.
  _(`anthill:convene`'s pre-spawn branch beat is the touchpoint to make this call before seats commit.)_
- **Runtime is Bun** (not Node): use `bun` / `bunx`, and prefer Bun built-ins over npm
  equivalents.

## Commands

- `bun run check` — the full gate (typecheck + biome + tests); the husky pre-commit runs it.
- `bun test` — tests · `bun run anthill <cmd>` — the CLI (`scripts/anthill/cli.ts`).

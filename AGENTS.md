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
- 🧭 **`docs/ROADMAP.md` — THE prioritized view: what we're working on, in what order, and the
  exit criteria for the current scope.** The lead **reads it at convene** and **updates it at
  finalize**. _Added 2026-08-05: it had gone stale for three sessions because nothing pointed
  here — every grounding doc named the v0.2 brief instead, so no fresh lead had a reason to open it._
- `docs/briefs/` — release bundles and multi-session arcs (e.g. the
  [coordination-hardening arc](docs/briefs/2026-07-28-coordination-hardening-arc.md)). **Scoped
  plans, not the priority order** — `ROADMAP.md` is that.
- `docs/backlog/` — small ready-to-pick tasks · `docs/investigations/` — research ·
  `docs/lessons-learned/` — field lessons · `docs/projects/` — larger bodies of work.
- `docs/PROJECT_MANIFESTO.md` — vision & boundaries.

## What's not obvious

- **Built by a convened team — anthill dogfoods itself.** This repo is self-hosted: its own
  anthill team lives in **`.anthill/`** (`.anthill/README.md` is the SOP; **`.anthill/principles.md`
  is what the team learned the hard way, each with its scar**; `.anthill/dev/<handle>.md`
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
  never push to it directly; release-please cuts the release on merge to `main` — **but only when
  there are RELEASABLE commits.** With `release-type: node` and no `changelog-sections` override,
  `feat` bumps minor and `fix` bumps patch; **`docs`, `test` and `chore` are hidden types and trigger
  NO release at all.** So a merge of docs-only work brings `main` current and produces no version and
  no release PR — which is correct, not a broken workflow. _(Cost a moment's confusion after session
  12: 11 commits, 9 `docs` + 1 `test`, and the expected release never appeared.)_
  _(`anthill:convene`'s pre-spawn branch beat is the touchpoint to make this call before seats commit.)_
- **Runtime is Bun** (not Node): use `bun` / `bunx`, and prefer Bun built-ins over npm
  equivalents.

## Branch Landing Policy

**Never squash.** Most commits carry an `Anthill-Seat:` trailer naming which of the six seats
authored them, and tracked docs cite commits by short sha throughout — squashing collapses
multi-seat attribution into a single author and orphans every citation that falls inside the
rewritten range. Merge feature branches as-is.

If a branch's history is genuinely unreadable, use the `project-docs:consolidate-long-branch`
skill to collapse it into chapter commits — but preserve one seat trailer per chapter, and
re-check every doc that cites a rewritten sha before landing.

## Commands

- `bun run check` — the full gate (typecheck + biome + tests); the husky pre-commit runs it.
- `bun test` — tests · `bun run anthill <cmd>` — the CLI (`plugin/scripts/anthill/cli.ts`).

## When you change something, something else probably has to change too

anthill's content is **referentially dependent and unenforced**: the same rule lives in a skill, a
template, a rendered copy of that template, and sometimes a spec section that code cites by number.
`bun run check` is green while a skill argues with a template — nothing catches it.

Run the **`cascade-check`** skill (`.claude/skills/cascade-check/`) after any substantive edit to a
skill, template, CLI behavior, config schema, or path — and always before cutting a release. It carries
a map of what travels with what, and every entry earned its place by actually failing. It never bumps
versions; release-please owns those.

_(That skill lives in `.claude/skills/`, not `plugin/skills/` — the latter is discovered by directory
and ships to every consuming project, so internal tooling must never go there.)_

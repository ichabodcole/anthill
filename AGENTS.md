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
  is each seat's living doc/brain; the roster is `.anthill/dev/README.md`). _Those paths are this
  repo's, and this repo runs one team. A project may configure several — each after the first lives
  at `.anthill/teams/<name>/`, and `anthill team show` says which one you are on._ Substantial work is done
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

**Merge; do not squash or rewrite.** Verified practice as of 2026-08-07: feature branches land on
`develop` as ordinary merges and `develop → main` by PR merge commit, so every commit keeps the
`Anthill-Seat:` trailer naming which of the six seats wrote it, and the short-sha citations
throughout `docs/` and `.anthill/` keep resolving (measured at the foot of this file).

⚠ **The strategy itself is an OPEN design question — do not settle it in passing.**
[`session-branch-strategy`](docs/projects/session-branch-strategy/proposal.md) settled on
**squash-merge** at finalize (2026-07-27, ready for a plan, **unbuilt** — there is no `branch{}`
config); the 2026-08-07 triage of spellbook#94 then measured what that costs a 4-seat project whose
docs pin claims to shas, which is anthill's own shape. That proposal also **rejects
`project-docs:consolidate-long-branch` by name** — it needs _contiguous_ chapters, and a convened
session interleaves seats by construction.

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

## Reconciliation — 2026-08-08 (session 13), by forager @ `47268d8`

Claim by claim, checked by running a command rather than by re-reading. `UNCHECKED` is a real
verdict here and is written where it applies — a claim silently skipped is indistinguishable from
one confirmed.

- _"`bun run check` — the full gate (typecheck + biome + tests)"_: **HELD.** `package.json` →
  `tsc --noEmit -p tsconfig.json && biome check --error-on-warnings . && bun test`.
- _"the husky pre-commit runs it"_: **HELD.** `.husky/pre-commit` runs `bunx lint-staged` then
  `bun run check`.
- _"`main` is branch-protected (PR + green CI required, admins included)"_: **HELD**, from the API:
  `enforce_admins: true`, `required_pr: true`, required check `check (typecheck + biome + tests)`.
- _"`release-type: node`"_: **HELD** (`release-please-config.json`). The `docs`/`test`/`chore`-are-
  hidden claim is **UNCHECKED** — it follows from release-please's defaults rather than from
  anything in this repo, and I did not exercise a release to confirm it.
- **Branch Landing Policy — _"merge; do not squash or rewrite"_: HELD, and its REASON is now
  measured rather than asserted.** On `feat/close-one-wire-scope`, **35 of 35 commits carry an
  `Anthill-Seat:` trailer**, across six seats (maestro 10 · forager 7 · weaver 6 · sentinel 6 ·
  steward 3 · scout 3). Session 11 had 9 of its first 11 carrying none, so this is a change in
  practice and not a restatement.
- _"~294 short-sha citations … keep resolving"_: **the PREDICATE HELD; the COUNT is FALSIFIED and
  is being removed rather than re-numbered.** Measured: **344** unique 7-hex tokens in `docs/` +
  `.anthill/` (excluding scratch), of which **335 resolve** as git objects. Controls both fired —
  a known-good sha resolved, and `forager.md`'s deliberately-invented `d3ac6dd` correctly did not.
  **Per `seams.md` Contract 4's authoring note (cite ASSERTIONS, never COUNTS), the number is
  dropped from the sentence above: a count is a measurement with a shelf life no gate checks.**
- 🔴 **NEW — that claim has an UNWRITTEN DOMAIN, and it is why two of the nine non-resolvers look
  like rot and are not.** _"Citations keep resolving"_ ranges over **anthill's own shas**. Four of
  the nine are documented invented-sha scars (correctly unresolvable), one is the number `3600000`
  matched as hex, two live under `_archive/` (out of scope), and **two are SPELLBOOK commits
  (`88a298f`, `cc35636`) cited in our docs — which can never resolve in this repo by construction.**
  A cross-repo citation is visually identical to a dead local one. **State the repo when citing a
  foreign sha, or the next sweep re-derives this.**
- _"`cascade-check` lives in `.claude/skills/`, not `plugin/skills/`"_: **HELD.** Present in the
  first, absent from the second.
- _"Runtime is Bun"_: **HELD** (the gate, the CLI and every script above run under `bun`).

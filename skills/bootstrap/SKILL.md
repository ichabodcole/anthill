---
name: bootstrap
description: Set up the anthill agent-team structure in this project — preflight the dependencies, propose a team composition from the nearest archetype, ratify it with the human, write `.anthill/config.json`, and render the `.anthill/` scaffold. Use when the human says "set up a team", "add a team to this project", "bootstrap the team", "install anthill here", "give this repo a dev team", or otherwise wants the multi-agent team structure stood up in a repo that doesn't have one yet. This is the FIRST thing you run in a new project; afterwards `anthill:convene` starts working sessions.
---

# anthill: Bootstrap (stand up the team structure)

Install the anthill **team-OS** into this project: a `.anthill/config.json` (the keystone every command
reads) + a rendered `.anthill/` living-docs scaffold. This is the **one-time setup**; once it's done,
`anthill:convene` / `anthill:join` / `anthill:finalize-session` run the actual sessions.

**Slice-1 scope (thin):** instantiate the **layered-app** archetype and tailor it with the human.
Full principles-driven discovery (deriving seats from the repo's real architecture) is a later slice —
for now, propose-from-the-archetype and let the human ratify.

> **The anthill CLI** — driven from the plugin (nothing installed in the target repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code when a plugin skill
> runs.)

## Steps

### 0. Is there already a team here?

Before anything, check for an existing footprint: if **`.anthill/config.json`** or the legacy
**`.team/config.json`** already exists (here or up the tree), this repo is **already bootstrapped** —
do NOT re-bootstrap (you'd double-write or clobber). Instead:

- on the **current** version → run **`anthill:convene`** to start a session;
- on an **older** version (e.g. the legacy `.team/` layout) → run **`anthill:upgrade`** to migrate it
  to the current `.anthill/` layout (history-preserving). `anthill migrate --dry-run` reports which.

Only continue below when there's no footprint yet.

### 1. Preflight the dependencies

anthill depends on three things. Check each; if any is missing, **guide the install and stop** — don't
write a half-working config.

- **Bun** (runs the CLI): `bun --version`. Missing → `curl -fsSL https://bun.sh/install | bash` (or
  `brew install oven-sh/bun/bun`).
- **spellbook** (grapevine + bounty — the coordination layer anthill builds on): confirm the plugin is
  installed by checking your **available skills** for `spellbook:grapevine` + `spellbook:bounty`.
  (anthill's CLI resolves their underlying scripts itself, so you don't need their install paths — only
  that the plugin is present.) Missing → install the spellbook plugin from its marketplace, then re-run.
- **tmux** (pane mode): `tmux -V`. Missing → `brew install tmux`. **Non-fatal** — without tmux you lose
  pane spawning but subagent mode still works; note the degradation and continue.

### 2. Light discovery

- **Detect the repo's real grounding anchors** — don't assume `AGENTS.md` exists. Probe the usual
  candidates (`AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/PROJECT-SUMMARY.md`, `docs/PROJECT_MANIFESTO.md`)
  and read the ones that are **actually present** to understand what this project is. The archetype's
  default `grounding: [AGENTS.md, README.md]` is only a guess — on a repo with no `AGENTS.md` it would
  emit a dangling reference, so set `grounding` to the anchors you actually found (next steps).
- **Confirm it's a layered app** (an engine/logic layer → a wire/state layer → a UI/surface layer, with
  integration to verify). If it clearly isn't, say so and offer to proceed with a hand-tailored roster
  anyway (the archetype is a starting point, not a gate).
- **Load the draft:** read `${CLAUDE_PLUGIN_ROOT}/templates/archetypes/layered-app.json`. It seeds: a
  lead + engine / spine / surface seats + a verify seat (verifier `spawn:true`), with a `CHANGE-ME`
  channel placeholder and the default `grounding` / `paths` / `launch`.
- **Lightly tailor** the seat scopes to what you actually saw (e.g. point the surface seat at the repo's
  real components dir, the engine seat at its core package). Keep handles generic unless the human has
  names in mind — they ratify next.

### 3. Ratify with the human

Present the proposed roster (handles · roles · scopes) and confirm — one focused round:

- **Seats:** rename / merge / split / re-scope, or drop a seat that doesn't fit. (e.g. no separate
  engine layer → fold it into spine.)
- **Channel:** replace `CHANGE-ME` with the team's grapevine channel name (default tmux session name
  too) — usually the project's short name.
- **grounding / paths:** set `grounding` to the anchors you actually detected (step 2) — **drop any
  default that doesn't exist** rather than emit a dangling path. (`anthill join` warns when a configured
  grounding doc is missing, so a dangling ref won't stay silent — but don't write one in the first
  place.) Keep the default `paths` unless the project **deliberately** wants its team docs somewhere
  other than `.anthill/` (e.g. a repo that prefers `docs/team/`). And if you _do_ set `paths`, make it
  that deliberate location — **never write a `paths` override that just repeats the `.anthill/` default**
  (a redundant override is noise, and it's exactly what trips `anthill migrate` on a future upgrade).

### 4. Write the config + render the scaffold

- **Write `.anthill/config.json`** — you are the compositor: take the ratified roster and emit the
  finalized config (the §5 schema — `channel`, `lead`, `seats[]`, and any non-default
  `grounding`/`paths`/`launch`). **Stamp `"version": 2`** — the current footprint version; an
  unstamped config reads as the legacy v1 (`.team/` + `docs/team/`) layout. Write it to
  `<repo-root>/.anthill/config.json`.
- **Render:** run **`anthill init`**. It reads the config and deterministically renders `.anthill/`
  (the SOP, `seams.md`, the roster `dev/README.md`, one `dev/<handle>.md` per seat) and ensures the
  `.anthill/scratch/` line in `.gitignore`. It's idempotent — re-running never clobbers existing docs.
- **Shield the living docs from the host's formatter (if it has one).** The `.anthill/` docs are prose
  pheromone living in the repo, so a host formatter (prettier / biome) will reflow them on commit —
  churn at best, and a reflow can mangle a hand-wrapped line into a stray list bullet. If the repo uses
  one (check for `.prettierignore`, a `biome.json` / prettier config, lint-staged), **add the whole
  `.anthill/` footprint** — the living docs **and** `.anthill/config.json` — to its ignore (a single
  `.anthill/` line in `.prettierignore` covers both). Don't scope the guard to just the docs dir:
  `config.json` is JSON, so a formatter globbing `**/*.json` (or lint-staged on staged JSON) will
  rewrite it. (If a `paths` override puts the docs elsewhere, ignore that dir too.) One-time setup;
  idempotent (skip if already ignored). No host formatter → nothing
  to do.
- **Sanity check:** `anthill status` (or `anthill join <lead>`) resolves against the new config without
  error.
- **Drop a discoverability pointer (consent-gated).** Offer to add a short **anthill methodology** note
  to the repo's root `AGENTS.md` (the preferred home) with `CLAUDE.md` as a one-line redirect to it —
  so a fresh agent entering the repo learns that team-based dev is available here, how to engage it
  (`anthill:convene`), and that the team lives in `.anthill/`. Detect which file(s) the repo already
  uses and respect that; idempotent — skip if a pointer is already present. This edits the repo's root
  files, so **ASK first**.

### 5. Report

Tell the human the team is ready: the roster (handles + roles), where the docs landed (`.anthill/`),
and the next step — **"run `anthill:convene` to start a working session."** Optionally suggest they
commit `.anthill/config.json` + `.anthill/` (the scaffold is durable; `.anthill/scratch/` stays gitignored).

## Output

A bootstrapped project: a valid `.anthill/config.json`, a coherent `.anthill/` scaffold, dependencies
confirmed — ready for `anthill:convene`.

## Skill feedback

If this skill was rough — a preflight check that misfired, an archetype that didn't fit, a step unclear
— jot it down and flag the human (or capture it for the first `anthill:finalize-session`). These skills improve by use.

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

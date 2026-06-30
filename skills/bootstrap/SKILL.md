---
name: bootstrap
description: Set up the anthill agent-team structure in this project — preflight the dependencies, propose a team composition from the nearest archetype, ratify it with the human, write `.team/config.json`, and render the `docs/team/` scaffold. Use when the human says "set up a team", "add a team to this project", "bootstrap the team", "install anthill here", "give this repo a dev team", or otherwise wants the multi-agent team structure stood up in a repo that doesn't have one yet. This is the FIRST thing you run in a new project; afterwards `anthill:convene` starts working sessions.
---

# anthill: Bootstrap (stand up the team structure)

Install the anthill **team-OS** into this project: a `.team/config.json` (the keystone every command
reads) + a rendered `docs/team/` living-docs scaffold. This is the **one-time setup**; once it's done,
`anthill:convene` / `anthill:join` / `anthill:finalize-session` run the actual sessions.

**Slice-1 scope (thin):** instantiate the **layered-app** archetype and tailor it with the human.
Full principles-driven discovery (deriving seats from the repo's real architecture) is a later slice —
for now, propose-from-the-archetype and let the human ratify.

> **The anthill CLI** — driven from the plugin (nothing installed in the target repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code when a plugin skill
> runs.)

## Steps

### 1. Preflight the dependencies

anthill depends on three things. Check each; if any is missing, **guide the install and stop** — don't
write a half-working config.

- **Bun** (runs the CLI): `bun --version`. Missing → `curl -fsSL https://bun.sh/install | bash` (or
  `brew install oven-sh/bun/bun`).
- **spellbook** (grapevine + bounty — the coordination layer): confirm the plugin is installed —
  `ls ${HOME}/.claude/plugins/cache/spellbook-marketplace/spellbook/*/skills/grapevine/scripts/cli.ts`
  and `.../bounty/scripts/cli.ts` should resolve (the `spellbook:grapevine` + `spellbook:bounty` skills
  should also be in your skill list). Missing → install the spellbook plugin from its marketplace, then
  re-run.
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
  place.) Keep the default `paths` unless the project wants its team docs somewhere other than
  `docs/team/`.

### 4. Write the config + render the scaffold

- **Write `.team/config.json`** — you are the compositor: take the ratified roster and emit the
  finalized config (the §5 schema — `version`, `channel`, `lead`, `seats[]`, and any non-default
  `grounding`/`paths`/`launch`). Write it to `<repo-root>/.team/config.json`.
- **Render:** run **`anthill init`**. It reads the config and deterministically renders `docs/team/`
  (the SOP, `seams.md`, the roster `dev/README.md`, one `dev/<handle>.md` per seat) and ensures the
  `.team/scratch/` line in `.gitignore`. It's idempotent — re-running never clobbers existing docs.
- **Sanity check:** `anthill status` (or `anthill join <lead>`) resolves against the new config without
  error.

### 5. Report

Tell the human the team is ready: the roster (handles + roles), where the docs landed (`docs/team/`),
and the next step — **"run `anthill:convene` to start a working session."** Optionally suggest they
commit `.team/config.json` + `docs/team/` (the scaffold is durable; `.team/scratch/` stays gitignored).

## Output

A bootstrapped project: a valid `.team/config.json`, a coherent `docs/team/` scaffold, dependencies
confirmed — ready for `anthill:convene`.

## Skill feedback

If this skill was rough — a preflight check that misfired, an archetype that didn't fit, a step unclear
— jot it down and flag the human (or capture it for the first `anthill:finalize-session`). These skills
improve by use.

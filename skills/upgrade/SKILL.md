---
name: upgrade
description: Upgrade this project's anthill footprint to the current plugin version — detect the repo's version, preview the migration, apply it via `anthill migrate`, reconcile any hand-edited living docs, and verify. Use when the human says "upgrade anthill", "migrate the team to the new layout", "anthill says my footprint is outdated", or after updating the anthill plugin to a release that changed the consumer-repo files. DISTINCT from bootstrap (first-time setup) — this MOVES an existing team to a newer structure without losing content.
---

# anthill: Upgrade (migrate an existing team to the current footprint)

Move a project that **already has** an anthill team onto the current footprint version, after a
plugin release changed the consumer-repo files. This skill is the **brain** over the deterministic
**`anthill migrate`** CLI: the CLI does the mechanical, history-preserving moves; this skill
detects, gets consent, sequences, handles the judgement the CLI can't, and verifies. First-time
setup is **`anthill:bootstrap`**, not this.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`**
> below (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a
> plugin skill runs.)

## Steps

### 1. Detect — what version is this repo, and what's the plan?

Run **`anthill migrate --dry-run`**. It walks up for the footprint marker (`.anthill/config.json`,
or the legacy `.team/config.json`), reads the stamped `version` (an unstamped config is **v1**), and
prints the migration plan **without touching anything**.

- **Already current** → it reports _"already at vN — nothing to migrate."_ Stop; tell the human
  there's nothing to do.
- **Behind** → it prints plain-language **notes** summarizing each move (config relocate, docs
  relocate, gitignore swap, version stamp). The structured op list is available with `--format json`.
  Read the matching guide in `${CLAUDE_PLUGIN_ROOT}/skills/upgrade/migrations/` (e.g. `v1-to-v2.md`)
  so you understand each step.

### 2. Get consent — a migration moves files in the human's repo

Show the human the dry-run plan (the notes are the readable summary) and **confirm before applying**.
It relocates committed files; it's reversible via git, but it's their repo — ask first.

### 3. Apply — let the CLI do the mechanical move

Run **`anthill migrate`**. It performs the plan with **history-preserving `git mv`**, swaps the
gitignored scratch line, stamps the new `version`, and removes the vacated dirs. Nothing is committed,
and the tree is now a **mix**: the `git mv`s are **staged** (renames — including the **deletions** of
the old `.team/` + `docs/team/` paths), while the version stamp and `.gitignore` edit are **unstaged**
working-tree changes. You land them together in step 5.

### 4. Reconcile the living docs (the judgement the CLI can't make)

The CLI **moves** content; it never **merges** it. For **v1 → v2** that's the whole story — a pure
relocate (`git mv` preserves every byte), so there is nothing to reconcile: the seat docs,
`seams.md`, and paper-cuts arrive intact under `.anthill/`.

The general discipline (for future content-changing migrations): **never clobber a hand-edited doc.**
If a migration would rewrite a doc the team has edited, surface the conflict to the human and resolve
it together rather than overwriting. The per-migration guide flags when a step needs this.

### 5. Verify, then land

- **Verify:**
  - **`anthill status`** _resolves_ the config (it reads `.anthill/config.json`). With no live session
    it will **warn** the grapevine/bounty daemons aren't running and show `Board: unavailable` — that's
    fine; you only care there's **no config error**.
  - **`anthill init`** _clobbers nothing_ — every existing doc is **skipped**. It MAY **add** a scaffold
    file a newer release introduced (or a doc a seat was missing); that's expected, not a failure —
    fold any additions into the commit below.
  - Spot-check a relocated seat doc reads correctly.
  - **If the repo has a code formatter** (prettier / biome), make sure `.anthill/` is in its ignore now
    that the docs live there — same one-time guard `anthill:bootstrap` does. (A v1 repo likely never
    ignored `docs/team/`, and the docs are newly under `.anthill/`.)
- **Land — use a normal `git commit`, NOT `anthill commit`.** The `git mv`s are already staged
  (including the **deletions** of the old `.team/` + `docs/team/` dirs). Stage the remaining edits —
  `git add .anthill/config.json .gitignore` (plus any files `init` added) — then **review `git
status`** to confirm only the migration is staged, and commit with **no pathspec** so the whole
  staged migration lands as one commit:
  `git commit -m "chore: migrate anthill footprint to vN"`.
  - **Why not `anthill commit`?** It does a **pathspec-partial** commit — it records only the paths you
    name and **drops the already-staged deletions** of the old dirs, leaving them duplicated in the
    tree. `anthill commit` is for the shared-tree multi-seat land; a solo structural migration wants a
    normal whole-index commit.

### 6. Report

Tell the human the team is on vN: where things now live (`.anthill/`), that git history was preserved,
and that nothing was lost. If they used a `paths` override, note that their living docs stayed where
the override points (only the config consolidated).

## Output

A project moved onto the current anthill footprint — `.anthill/` at the new version, git history
intact, hand-edited docs preserved, verified and committed.

## Skill feedback

If this was rough — a migration step unclear, a reconciliation the guide didn't cover — capture it and
flag the human (or file it for the next `anthill:finalize-session`). The migration guides improve by use.

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

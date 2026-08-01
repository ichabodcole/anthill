---
name: upgrade
description: Bring this project's anthill footprint up to date with the installed plugin — detect the repo's version, preview and apply any structural migration via `anthill migrate`, then reconcile the living docs against the current templates so the team actually receives guidance later releases added. Use when the human says "upgrade anthill", "migrate the team to the new layout", "anthill says my footprint is outdated", after installing a new anthill release, or when a release changed the SOP / team guidance even if the footprint version did NOT move — living docs are written once at bootstrap and are never refreshed automatically, so a content-only release still needs this skill. DISTINCT from bootstrap (first-time setup) — this updates an existing team without losing content.
---

# anthill: Upgrade (bring an existing team up to date with the plugin)

Bring a project that **already has** an anthill team up to date after a plugin release. That is **two
jobs, and the second one runs far more often than the first**:

1. **Structure** — relocate the footprint if the release moved files (`anthill migrate`).
2. **Guidance** — reconcile the living docs against the current templates, because **nothing updates
   them automatically, ever.**

Most releases need only (2), and **nothing in the tooling will tell you so** — `migrate` reports on
layout and `status` says nothing about content. Treat "no migration needed" as the _start_ of this
skill, not the end of it.

This skill is the **brain** over the deterministic **`anthill migrate`** CLI: the CLI does the
mechanical, history-preserving moves; this skill detects, gets consent, sequences, handles the
judgement the CLI can't, and verifies. First-time setup is **`anthill:bootstrap`**, not this.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`**
> below (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a
> plugin skill runs.)

## Steps

### 0. ⚠ FIRST — is `${CLAUDE_PLUGIN_ROOT}` even the version that's installed?

**`${CLAUDE_PLUGIN_ROOT}` resolves to the version YOUR SESSION loaded, not the version installed.** A
session pins the plugin it started with and **no number of updates reach it** — only a restart does.
So if your session predates the release you are upgrading _to_, every path in this skill points at the
**old** plugin: the CLI you run, the migration guides you read, and — worst — **the templates step 4a
diffs against.**

**That failure is silent and it inverts the result.** Diffing a footprint against a stale template
reports **"already current, nothing to reconcile"** — correctly, against the wrong baseline — and
skips the entire release. Reported from the field: a team upgrading to 1.7.1 from a 1.7.0-pinned
session would have measured **zero drift** and silently dropped all 41 lines of new guidance,
including the `--as` requirement the release existed to deliver.

**Check it before anything else:**

```sh
ROOT="${CLAUDE_PLUGIN_ROOT}"
CACHE="$(dirname "$ROOT")"
LOADED="$(basename "$ROOT")"
NEWEST="$(ls "$CACHE" | sort -V | tail -1)"
echo "session loaded: $LOADED   newest installed: $NEWEST"
[ "$LOADED" = "$NEWEST" ] && echo "OK — proceed" || echo "STALE — stop and restart the session"
```

- **They match** → proceed; `${CLAUDE_PLUGIN_ROOT}` is safe to use throughout.
- **They differ** → **STOP. Tell the human to restart this session, then re-run the skill.** Do not
  "work around it" by substituting the newer path into one step — the CLI, the guides and the
  templates are all stale, and a partial substitution produces a result that looks right and isn't.
- **Cannot resolve the cache layout?** Then **say so and fall back to reporting the loaded version to
  the human**, who knows whether they updated recently. An unverifiable baseline must be surfaced, not
  assumed good.

**This ordering is not optional: plugin currency GATES content drift.** A drift report that does not
know its own plugin might be stale converts _"I don't know"_ into a green tick.

### 1. Detect — what version is this repo, and what's the plan?

Run **`anthill migrate --dry-run`**. It walks up for the footprint marker (`.anthill/config.json`,
or the legacy `.team/config.json`), reads the stamped `version` (an unstamped config is **v1**), and
prints the migration plan **without touching anything**.

- **Already current** → it reports _"already at vN — nothing to migrate."_ **That answers LAYOUT, not
  CONTENT — do not stop here.** The stamped version tracks the footprint's _structure_ (where files
  live), and most releases don't move it. A release can rewrite the SOP seed, the roster README, or the
  `seams.md` scaffold and leave the version untouched, because nothing relocated. **`migrate` has no
  opinion about guidance**, and neither does `anthill status`.
  → Skip steps 2–3 (there is no migration to consent to or apply) and **go to step 4** — the living-doc
  reconcile is the whole job on a content-only release, and it is the common case.
- **Behind** → it prints plain-language **notes** summarizing each move (config relocate, docs
  relocate, gitignore swap, version stamp). The structured op list is available with `--format json`.
  Read the matching guide in `${CLAUDE_PLUGIN_ROOT}/skills/upgrade/migrations/` (e.g. `v1-to-v2.md`)
  so you understand each step.

### 2. Get consent — a migration moves files in the human's repo

Show the human the dry-run plan (the notes are the readable summary) and **confirm before applying**.
It relocates committed files; it's reversible via git, but it's their repo — ask first.

- **Watch for the redundant-default `paths` note.** If the plan flags that the repo's `paths` override
  just spells out the old `docs/team` default, migrate will consolidate the docs anyway (and drop the
  override) — surface that to the human. If they _deliberately_ want the docs to stay at `docs/team/`,
  re-run the apply with **`anthill migrate --keep-paths`**.

### 3. Apply — let the CLI do the mechanical move

Run **`anthill migrate`**. It performs the plan with **history-preserving `git mv`**, swaps the
gitignored scratch line, stamps the new `version`, and removes the vacated dirs. Nothing is committed,
and the tree is now a **mix**: the `git mv`s are **staged** (renames — including the **deletions** of
the old `.team/` + `docs/team/` paths), while the version stamp and `.gitignore` edit are **unstaged**
working-tree changes. You land them together in step 5.

### 4. Reconcile the living docs (the judgement the CLI can't make)

The CLI **moves** content; it never **merges** it. For the **v1 → v2** _relocation_ that's the whole
story — a pure relocate (`git mv` preserves every byte), so nothing needs merging: the seat docs,
`seams.md`, and paper-cuts arrive intact under `.anthill/`.

**But relocation is not the only thing an upgrade owes the team, and this step runs even when there
was no migration at all.**

#### 4a. Refresh the shared guidance the team never receives automatically

**`anthill init` skips every existing doc — that protects the team's content and freezes it.** A
living doc is written **once**, at bootstrap, and **no later release ever updates it.** So a team
carries its bootstrap-version guidance indefinitely, _including guidance a later release corrected_.
Nothing warns them: `migrate` reports "already current" (it means the layout), `status` says nothing,
and the docs look fine because they are perfectly valid — just old.

**This is the main event on a content-only release.** Reconcile by hand:

```sh
# `${CLAUDE_PLUGIN_ROOT}` is only safe here because step 0 confirmed it matches
# the installed version. If you skipped step 0, this diff lies.
diff "${CLAUDE_PLUGIN_ROOT}/templates/docs-team/README.md" .anthill/README.md
```

Repeat for any other scaffold the team kept: `dev/README.md`, `dev/seams.md`, `paper-cuts.md`.

Then **classify each hunk** — never sync wholesale:

- **Shared guidance they're missing** → mirror it down. This is the point of the exercise.
- **Their own local specificity** → keep it. A footprint legitimately says things the template must
  not (project-specific contracts, local conventions). A delta is expected and is **not** drift.
- **Genuine drift** → reconcile with the human.
- **Token lines** (`{{channel}}`, `{{lead}}`, `{{rosterTable}}`) render per-project and are **supposed**
  to differ. Never "fix" these.

**The diff is the authority here — not a changelog.** anthill's `CHANGELOG.md` is **not** part of the
shipped plugin, so from inside a consuming project you generally cannot read it. Don't go looking for
release notes to tell you what changed; the shipped template versus the footprint **is** the record,
and it is always current. If the human does have the release notes to hand, they're useful colour for
_why_ a hunk changed — never a prerequisite.

**Show the human the diff before applying it** — these are their team's standing rules, and some of
what looks stale may be a deliberate local choice you don't have the context for.

#### 4b. Never clobber a hand-edited doc

The general discipline, for migrations that _do_ change content: if a migration would rewrite a doc
the team has edited, surface the conflict to the human and resolve it together rather than
overwriting. The per-migration guide flags when a step needs this.

#### 4c. Reconcile the root methodology pointer — only if files moved

- **Skip this on a content-only release** (nothing relocated, so no pointer can be stale).
- **Reconcile the root methodology pointer (if any).** `migrate` moves files but doesn't touch the
  repo's root `AGENTS.md` / `CLAUDE.md`. If one carries an anthill methodology pointer that names the
  **old** team-docs location ("team docs live in `docs/team/`"), update it to where the docs now live
  (`.anthill/`, or the `paths` override). This is the twin of the bootstrap pointer step — bootstrap
  _drops_ it, upgrade keeps it _true_. Idempotent: no pointer, or one that doesn't name the team dir →
  nothing to do.

### 5. Verify, then land

- **Verify:**
  - **`anthill status`** _resolves_ the config (it reads `.anthill/config.json`). With no live session
    it will **warn** the grapevine/bounty daemons aren't running and show `Board: unavailable` — that's
    fine; you only care there's **no config error**.
  - **`anthill init`** _clobbers nothing_ — every existing doc is **skipped**. It MAY **add** a scaffold
    file a newer release introduced (or a doc a seat was missing); that's expected, not a failure —
    fold any additions into the commit below.
    **Note it only ADDS.** It never refreshes a doc that already exists — that is step 4a's job, and
    running `init` is not a substitute for it.
  - Spot-check a relocated seat doc reads correctly.
  - **If the repo has a code formatter** (prettier / biome), make sure the whole `.anthill/` footprint is
    in its ignore now that config + docs live there — that includes **`.anthill/config.json`** (JSON a
    `**/*.json` formatter or a lint-staged hook would rewrite), not just the docs. Same one-time guard
    `anthill:bootstrap` does; a v1 repo likely never ignored `docs/team/`.
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

**And report the guidance reconcile separately from the migration** — they are different things and
the human should see both: **what shared guidance you pulled down** from the current templates, **what
you deliberately left** as their local specificity, and **anything you weren't sure about**. If there
was no structural migration at all, say so plainly — _"no layout change; the update was to the team's
standing guidance"_ — so "nothing to migrate" is never mistaken for "nothing happened."

## Output

A project up to date with the installed plugin: `.anthill/` at the current version with git history
intact, **and its living docs carrying the guidance the current release ships**, hand-edited content
preserved, verified and committed.

## Skill feedback

If this was rough — a migration step unclear, a reconciliation the guide didn't cover — capture it and
flag the human (or file it for the next `anthill:finalize-session`). The migration guides improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

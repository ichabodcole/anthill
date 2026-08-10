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

### 0. Version-skew check — cheap, and usually a no-op

**Most of the time this passes and you move on** — a session ends, the next one starts, and the plugin
updates underneath. The skew window is normally minutes.

**It matters when your session predates the release you are upgrading _to_**, because
`${CLAUDE_PLUGIN_ROOT}` resolves to the version **your session loaded**, not the version installed, and
a session pins the plugin it started with — **no number of updates reach it, only a restart does.**
Then every path here points at the **old** plugin: the CLI, the migration guides, and — worst — **the
templates step 4a diffs against.**

**Who actually hits this:** anyone in a tight loop between authoring anthill and consuming it — plugin
maintainers dogfooding, or a team feeding findings back and upgrading the same day. **A team upgrading
on a normal cadence will almost never see it.** Run the check anyway: it is one command, and the
failure mode is the reason.

**The failure is silent and it INVERTS the result** — which is why five lines of insurance are worth
it even for a rare case. Diffing against a stale template reports **"already current, nothing to
reconcile"** — correctly, against the wrong baseline — and skips the whole release. Measured in the
field: a team upgrading to 1.7.1 from a 1.7.0-pinned session saw **zero drift** and would have dropped
41 lines of new guidance, including the `--as` requirement the release existed to deliver.

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
- **This project configures several teams** (a `teams` map in `.anthill/config.json`) → `migrate`
  **refuses by name and exits 1.** _That is the correct answer, not a failure to work around._ The
  `teams` map is a config **shape**, not a footprint layout — nothing moved on disk when it was
  adopted, so there is no migration to run and `version` stays where it is. **Do not hand-edit the
  config to get past it, and do not pass `--team`** (the verb refuses that too): `migrate` moves the
  whole footprint, which every team shares.
  → Same route as "already current": skip steps 2–3, **go to step 4**, and run the reconcile
  **once per configured team** (see 4a).

> **Run `anthill field-notes` as part of this step.** anthill's cross-team observations live in the
> **plugin**, not in your footprint — deliberately, because `init` never updates a file you already
> have, so anything copied into `.anthill/` reaches you once and never again. Reading them here is
> the only touch point where they are current. **They are observations, not requirements**; if one
> contradicts what your team learned, your `principles.md` wins and `anthill feedback` is how you
> tell us.

> **A release can add a NEW living doc, not just edit one.** `anthill init` **creates files that do
> not exist** while skipping ones that do — so re-running it is how a new team doc reaches an
> **existing** footprint, and it cannot clobber your content. **Verified:** `principles.md` (added
> 2026-08-01) arrives this way. So the reconcile has two halves: **diff the docs you already have,
> and check whether the templates gained one you don't.**

> **⚠ A release can add a new COORDINATION WIRE, and no amount of doc reconciling puts you on it.**
> This is a third case and it is the one that looks handled when it isn't: reconciling the SOP so it
> _describes_ a new wire changes what your team reads, not what your team is connected to. **Seats get
> on a wire at `anthill:join`, from the manifest the CLI emits** — so after an upgrade that adds one,
> the team is wired only from its **next join**, and anyone still in a running session is not.
> **Tell the human that explicitly.** A team whose SOP now documents a wire nobody is listening on has
> the worst version of this: the doc reads correct, the channel reads quiet, and those are
> indistinguishable from working.

- **Behind** → it prints plain-language **notes** summarizing each move (config relocate, docs
  relocate, gitignore swap, version stamp); the structured op list comes back in the same envelope
  everything else does.
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

#### 4·0. 🔴 GRAPEVINE → COMMS — read this first if the team predates it

**anthill no longer opens or joins a grapevine channel.** `convene` opens no channel and sets no
topic; `join` composes no vine tail; `convene`'s `--fresh` and `--topic` flags are **gone**, and the
join manifest no longer carries a `tailCommand`. The team's message wire is **anthill's own `comms`** —
an append-only log under `<teamDir>/comms/`, which needs nothing installed.

**spellbook is still required, for `bounty` (the task board).** Only the vine left.

**This is the one change that leaves a team's OWN documents wrong, and nothing else in this skill
will catch them** — `init` skips existing files, so every reference the team wrote itself survives
untouched. **Go and look:**

```bash
grep -rni 'grapevine\|\bvine\b' .anthill/ docs/ --exclude-dir=_archive
```

**Sort the hits into three piles — the middle one is the one that matters:**

| pile                                                                                                                                       | what to do                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **History** — retros, scars, session notes, lessons, anything dated                                                                        | **LEAVE IT.** Do not rewrite the record. A scar that names the vine is still true about the day it happened.                                            |
| 🔴 **Live instruction** — anything telling a seat to _use_ the vine, tail it, fall back to it, or check `spellbook:grapevine` is installed | **FIX IT.** This is the pile that misroutes an agent, and it is why this beat exists. Point it at `comms` (`anthill comms send/read/follow/positions`). |
| **Ambiguous** — a doc that reads as both                                                                                                   | **Add a dated addendum** rather than editing in place, so the original still parses as the record it is.                                                |

**Two specific replacements worth naming, because they have no obvious successor:**

- **_"the lead clears the channel at convene (`--fresh`)"_** — there is **no clear verb and no flag.**
  The comms log is **cumulative and never cleared**, deliberately: it is the provenance of everything
  the team shipped. **Catch-up therefore needs an ANCHOR, not a starting point** — the lead names the
  id the session starts at, **out of band** (in the brief or on the board), because an anchor published
  on the channel it bounds can only be read by breaking it.
- **_"if one wire drops, say so on the other"_** — **there is no other wire.** The remedy is
  `anthill comms positions`, which reports each seat's lag and distinguishes `never-followed`
  (_no record at all_) from `current`. Say so in your pane and move your card.

**Tell the human what you changed here.** A team that finds its own SOP contradicting the tool has no
way to know which one is stale, and **this is the only moment anyone looks.**

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
TEAMDIR=.anthill   # ← `paths.teamDir` in .anthill/config.json, if this repo overrides it
diff "${CLAUDE_PLUGIN_ROOT}/templates/docs-team/README.md" "$TEAMDIR/README.md"
```

Repeat for any other scaffold the team kept: `dev/README.md`, `dev/seams.md`, `paper-cuts.md`,
`principles.md`, `retro.md`.

**⚠ Several teams → run this whole reconcile once PER TEAM, against each team's own `teamDir`.**
`anthill team ls` prints every team with its resolved directory; use those, not `.anthill/` — a team
whose `teamDir` is `.anthill/teams/lean/` is invisible to the diff above and would silently keep its
bootstrap-version guidance while you record the release as reconciled. **Each team's living docs are
independently divergent**: they were seeded at different times, and each has been written in by its
own seats since. There is no such thing as reconciling "the project's" `README.md`.

**On `retro.md`, expect a diff the size of the whole file, and do NOT reconcile it.** It is seeded
by `init` with the ritual's guidance and then written by the **team** at finalize — so a footprint
that has run a session diverges by every entry it has accumulated, which is the file working, not
drift. Mirror down only changes to the guidance above the entries. _(A footprint that predates the
template has no left-hand side at all; `anthill init` seeds it, skipping every doc that exists.)_

**The general rule worth carrying: before you trust a diff, confirm both sides exist.** This is the
failure mode step 0 spends five lines warning about, arriving from the other direction — there, an
empty diff falsely reported "nothing to reconcile"; a missing file makes `diff` fail inside a step
whose whole thesis is that a quiet result is a lie.

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

#### 4d. Backfill config FIELDS a later release added — 4a cannot reach these

**4a diffs living docs. `.anthill/config.json` is not a living doc and has no template**, so a field
introduced after this team bootstrapped is simply absent, and nothing above will surface it. The
config is where a silent gap survives an upgrade that reports success.

- **`gate` — the project's pre-commit verification command.** Added 2026-08-03; **every footprint
  bootstrapped before then has it unset.** `anthill join` composes it into the land command in front
  of the commit, so while it is blank **the team's lands run no verification at all.** The emitted
  command announces that — but it announces it to a seat mid-land, which is late and is not the
  person who can fix it.
  **Ask the human for it here**, proposing the command this repo actually uses (a `check`/`verify`/`ci`
  script in the manifest, a `Makefile` target, whatever its contributor docs name) and letting them
  ratify or correct it. **There is no default and you must not invent one** — a guessed gate is worse
  than a blank one, because a blank one tells the truth. **"We don't have one" is a valid answer:**
  leave it unset.
  - **Under a `teams` map, `gate` is PROJECT-level** — write it once at the top level, beside
    `version` / `launch` / `grounding`, and every team inherits it. Writing it into each entry is not
    wrong but it is four copies of one answer, and a `gate` inside an entry silently overrides the
    project's for that team alone.

### 5. Verify, then land

- **Verify:**
  - **`anthill status`** _resolves_ the config (it reads `.anthill/config.json`). With no live session
    it will **warn** the bounty daemon isn't running and show `Board: unavailable` — that's fine; you
    only care there's **no config error**.
    **Several teams? Run it once per team, `anthill status --team <name>`** — and the reason is the
    quiet case, not the loud one. Unpinned, it refuses and names the teams, which is correct
    behaviour rather than a config error. **Pinned, it succeeds and reports the pinned team only** —
    no mention that two others exist — so a single clean `status` is one team verified and the rest
    unread. `anthill team ls` is the list to iterate.
  - **`anthill init`** _clobbers nothing_ — every existing doc is **skipped**. It MAY **add** a scaffold
    file a newer release introduced (or a doc a seat was missing); that's expected, not a failure —
    fold any additions into the commit below.
    **Note it only ADDS.** It never refreshes a doc that already exists — that is step 4a's job, and
    running `init` is not a substitute for it.
    **It is PROJECT-level**: with no `--team` it covers every configured team, so one run reaches all
    of them. Additions land under each team's own `teamDir` — check the `written` list against
    `anthill team ls`, not against `.anthill/` alone.
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

**Several teams → report per team.** A single "reconciled" for a project with three teams is the
report a team gets when its docs were never opened; name each team and what you did to its docs, and
say which ones you left alone.

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

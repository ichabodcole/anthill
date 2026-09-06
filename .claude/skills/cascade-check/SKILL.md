---
name: cascade-check
description:
  Find what else must change when you change something in anthill. Use after any substantive edit to a
  skill, template, CLI behavior, config schema, or path, and always before cutting a release. anthill
  is a web of files that restate, render, or cite each other, and nothing enforces their consistency:
  no test fails when a skill contradicts a template, or when a rule ships that this repo itself does
  not follow. Fires for edits to skills, templates, CLI behavior, the config schema, moved paths,
  archived docs, and the grounding docs that restate any of them (AGENTS.md, README.md, ROADMAP.md,
  the design-of-record). Does not fire for a typo fix, a new test, a code change with no
  documented contract, or a new doc that nothing else references yet. Triggers on "cascade check",
  "what else needs updating", "consistency sweep", "release preflight", "ready to cut a release".
  Only applies inside the anthill repo itself. It is internal tooling and is never shipped to
  consuming projects.
---

# Cascade check

Run this check after a substantive edit to a skill, template, CLI behavior, config schema, or path,
and before cutting a release. It maps what travels with what, so a change reaches every file that
restates it.

anthill's content is referentially dependent and unenforced. The same rule lives in a skill, a
template, a rendered copy of that template, and sometimes a spec section that code cites by number.
Change one and the others are silently wrong. Nothing catches this. `bun run check` is green while a
skill contradicts a template. `team-init.test.ts` covers template rendering, so token-level breakage
has some coverage. Prose consistency has none.

This is a judgment skill, not a lint.

---

## The cascade map

Find the row for what you changed. Check every dependent.

### Template change (`plugin/templates/**`)

- ◻ **This repo's own `.anthill/`.** `anthill init` never clobbers existing files, so a consumer's
  living docs are safe and our own footprint never receives template updates. Mirror by hand. The
  full token set is in `team-init.ts`'s header: eight. `{{handle}}` is a path token (it
  fans a template out once per seat). `{{channel}}`, `{{lead}}`, `{{rosterTable}}`, `{{teamDir}}`,
  and `{{seatDir}}` are global content. `{{handle}}`, `{{role}}`, and `{{scope}}` are content inside
  a per-seat template. `{{rosterTable}}` is a generated markdown table, so hand-mirroring with a
  partial token list leaves a literal `{{rosterTable}}` or a wrong roster. Unknown tokens are left
  untouched by design, which is what makes the `grep -rn '{{'` smoke below meaningful.
- ◻ **Any skill that describes what the template contains.** `bootstrap` renders it. `join` and
  `finalize-session` tell seats what is in it.
- ◻ **Direction of the mirror.** Neither direction wins wholesale. Mirror shared guidance downward
  (template to footprint): anything every team should have. A footprint legitimately carries
  project-specific content the template must not (this repo's `.anthill/README.md` points at its own
  board-binding contract by number), so a delta is expected and is not automatically drift. Diff the
  two, then classify each hunk: shared guidance missing downstream (mirror it), local specificity
  (leave it), or genuine drift (reconcile). Scope your mirror to the change you made. Reconciling the
  whole file is a separate job.
- ◻ **Every existing team is now behind, and nothing tells them.** `init` skips existing docs, so a
  template improvement reaches new teams only. Live teams keep their bootstrap-version guidance until
  a human runs the reconcile in `anthill:upgrade` §4a, and no signal prompts them to. Say it in the
  release notes, in the words a reconciler needs (which doc, what guidance), and expect the change to
  land slowly. If the change is a correction rather than an addition, a rule we got wrong, that lag
  is a live wrong-guidance window and it may deserve more than a note.
- ◻ **Render smoke** (see below). Tokens must survive verbatim.
- ◻ **A renamed or deleted template.** `init` skips existing files and never deletes, so a rename
  leaves the old rendered copy orphaned in every footprint forever. Remove it by hand here. Consuming
  projects need a note in the release.

### Rule change in a skill (`plugin/skills/**`)

- ◻ **The other skills that state the same rule.** `join`, `convene`, and `finalize-session` overlap
  heavily on team behavior. Grep the concept, not the file you edited.
- ◻ **The SOP seed** (`plugin/templates/docs-team/README.md`) if it is a team-behavior rule, and then
  this repo's rendered `.anthill/README.md`.
- ◻ **`plugin/skills/plan/methodology.md`** if it is a plan-phase rule. That file is the portable
  half. A rule in the skill but not the methodology does not travel.
- ◻ **The skill's own checklist section.** Prose and checklist drift apart, and the checklist is the
  part that gets read.

### CLI behavior, args, or output change (`plugin/scripts/anthill/**`)

- ◻ **The skill that tells agents to run it**, and the exact incantation, if it emits one.
- ◻ **`.anthill/dev/seams.md`** if it is a cross-seat contract, plus the grain it is ratified at.
- ◻ **The design-of-record's live sections**: §5 (config schema) and §8 (layout and command set).
  `config.ts` and `paths.ts` cite "spec §5" by number, so that section is load-bearing reference, not
  history.
- ◻ **`README.md`** if it is user-facing.

### Config schema change

- ◻ `config.ts` **and** design-of-record **§5**. They cite each other.
- ◻ `migrate.ts` plus a migration doc under `plugin/skills/upgrade/migrations/`, if the footprint
  version moves.
- ◻ `bootstrap` (writes it) and `upgrade` (migrates it).
- ◻ The `.anthill/config.json` in **this** repo.

### Moved or renamed path

- ◻ `AGENTS.md`, `README.md`, design-of-record **§8**.
- ◻ Every skill that references it.
- ◻ Tooling globs: `.prettierignore`, `biome.json` `files.includes`, `package.json` scripts.

### Added or removed skill, or added or removed CLI command

- ◻ **`plugin/.claude-plugin/plugin.json`'s `description`.** It enumerates the lifecycle skills in
  prose, and it is consumer-visible.
- ◻ **`.claude-plugin/marketplace.json`'s description**, for the same reason.
- ◻ **`AGENTS.md`** and `README.md` wherever they name the skill set or command set.
- ◻ **The design-of-record §7/§8**, which list the skills and the CLI command set.

### Behaviour change ruled on the wire, with no file edited

The grep-the-concept method cannot fire here, because the concept never entered the repo. A ruling in
a message mutates the meaning of every document that describes the old behaviour while touching none
of them. Every other row in this map is keyed to a file you changed. This one is keyed to a file you
did not change.

- ◻ **Find which shipped skill now contradicts the ruling.** Grep the behaviour, not the wording. You
  have no diff to start from.
- ◻ **Check whether the team already acted on the ruling rather than on the doc.** If so, the doc is
  now the only thing that still believes the old rule.
- ◻ **Check whether the ruling is in a durable artifact at all**, or only in a channel that
  evaporates.
- ◻ **The rendered copies.** A rule the SOP template states is also in every team's `.anthill/`.

When the team does something the docs forbid and nobody objects, the doc is stale. The behaviour is
the evidence.

### New doc in the team footprint (`plugin/templates/docs-team/**`)

This is distinct from editing a template. Every other row assumes the thing already exists. A new
file has no diff, no stale copy, and no reader, so nothing points at it until you make something
point.

- ◻ **The enumerations.** `AGENTS.md` (the file every agent reads first) and `bootstrap` both list
  what the footprint contains. A doc missing from those is a doc nobody opens.
- ◻ **The grounding reads** in `convene` and `join`. Being rendered is not being read.
- ◻ **The checklists, separately from the prose.** Grep the checklist section on its own. Updating
  the body does not update it, and the checklist is the part read under time pressure.
- ◻ **`upgrade`'s reconcile.** It diffs docs a team already has. A new file is a different path:
  `init` creates what is missing while skipping what exists, which is how a new doc reaches an
  existing footprint without clobbering anything.
- ◻ **This repo's own `.anthill/`.** Mirror it, same as any template change.
- ◻ **Render smoke, twice.** A fresh footprint gets the file with tokens substituted, and an existing
  footprint gets it on re-init while keeping its local edits. Run both.

### Promise wording: "safe", "protects", "isolated", "never …", "guarantees"

- ◻ **Name the granularity the promise holds at**, in the sentence itself. "Gitignored and excluded
  from the lint target set" is true and unmisleadable. "Gate-safe" is shorter and wrong. A promise
  without a stated granularity is a promise at the coarsest reading.
- ◻ **Ask where someone will rely on it one level finer.** File to content. Index to working tree.
  Envelope to field. Scan-set to filesystem discovery. That finer reading is the one that bites, and
  the natural verification returns clean, so the failure is invisible to whoever caused it.
- ◻ **Ask whether the guarantee is actually ours.** If it is a dependency's behavior we forward,
  attribute it. Stating spellbook's guarantee in anthill's voice makes us silently wrong when
  upstream changes.
- ◻ **Ask whether a protection also freezes something.** A no-clobber guarantee protects content and
  also makes it inert. Say both.

### Rule stated in a grounding doc: `AGENTS.md`, `README.md`, `.anthill/README.md`

The other rows key off a thing you changed inside the system. This one keys off a question the repo
already opened and you did not know was open. Every agent reads the grounding docs first, and nothing
downstream contradicts them loudly enough to notice.

- ◻ **Check whether an active proposal or investigation already owns this question.** Grep
  `docs/projects/*/proposal.md` and `docs/investigations/` for the concept, not your wording. A
  settled-but-unbuilt design decision is invisible to `git log` and to the working tree alike, the
  two places you naturally check.
- ◻ **Say whether it is settled, unbuilt, or contested.** All three read identically from the code.
  Say which, with an as-of, or the next reader inherits your guess as fact.
- ◻ **Separate measurement from policy.** Describing what the repo does is safe. Ruling what it must
  do closes a question you may not own.
- ◻ **Check whether the proposal rejects a tool or route you are about to recommend.** Rejections
  live in the proposal's decision table and nowhere else. They are not greppable from the thing you
  changed.

### Archived or moved doc

- ◻ **Inbound links.** A doc's depth changes when it moves, so `../../ROADMAP.md` silently becomes
  wrong.
- ◻ `docs/ROADMAP.md` pointers.

### Fix shipped for a filed issue

- ◻ **The backlog item's status field.**
- ◻ **The brief or roadmap phase** it belongs to.
- ◻ **The issue itself, once the fix is released.** How you close it matters.
  - **Fully fixed.** Close it, naming what fixed it and the version.
  - **Partly fixed.** Comment with exactly what shipped and what remains, and leave it open.
  - **Ours.** If it is a regression we introduced, say so.

---

## When it is not in the map

The map is incomplete by construction. The method that finds the rest:

1. **Grep the concept, not the file.** Pick two or three phrasings of the claim and search
   `plugin/skills`, `plugin/templates`, `.anthill/`, and `docs/`. The dependents rarely share your
   wording.
2. **Ask whether there is a rendered copy of this.** Templates have one (`.anthill/`). Anything
   generated from config has one. Rendered copies never update themselves.
3. **Ask whether code cites this by name or number.** `grep -rn 'spec §' plugin/scripts/` finds the
   places prose is load-bearing for code.
4. **Ask whether there is a portable half.** A rule in a skill that is not in `methodology.md` does
   not leave this repo.
5. **Ask what the checklist says.** Skills carry both prose and a checklist, they drift, and the
   checklist is what gets read under time pressure.

Interpret every hit before acting on it. The greps produce false positives by design. Searching for a
stale CLI path produces hits of three kinds:

- `${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts` in six skills: correct. The plugin root is
  `plugin/`, so the path is right relative to it.
- The same string in `docs/projects/_archive/**`: correct. Archived session notes are a historical
  record, and "fixing" them would falsify what happened.
- A bare `scripts/anthill/cli.ts` in `AGENTS.md`: the one real defect, in the file every agent reads
  first.

## Subagents

Usually do not fan out subagents. This skill's value is interpretation, not search. An explorer that
reports "found 10 references to X" without judgment cannot judge relevance, because it does not know
what rule you just changed or why. Briefing it costs more than running the greps yourself. Most
cascade checks are three to five targeted searches.

Two cases where subagents do pay:

1. **A release sweep over a large diff.** The surfaces are genuinely independent (templates, skill
   rules, docs, tooling globs), so one explorer per surface parallelizes well. Hard constraint:
   explorers return located candidates with context, never verdicts. Ask for "every place this claim
   appears, quoted with its surrounding line", not "is this stale?" The interpretation stays with
   you, or you have delegated away the only part that matters.
2. **Checking the checker, on a large or subtle change.** Dispatch a fresh agent to read the changed
   guidance cold and report where it contradicts itself or assumes context. Never use a fork: a fork
   inherits your framing and will agree with you. This is a different act from doing the cascade
   check. It verifies the change, not the dependents.

---

## Before cutting a release

Everything above, over the whole diff, plus these, which are release-only.

```sh
git diff --name-only origin/main..develop      # the full surface to sweep
bun run check                                   # typecheck + biome + tests
```

**◻ The `plugin/` ship boundary.** Only `plugin/` reaches a consumer (a `git-subdir` source).

- Anything consumer-facing that landed outside it will not reach them.
- Anything inside `plugin/skills/` becomes a skill in every consuming project. That directory is
  discovered by name. Internal tooling belongs in `.claude/skills/`, this file's own home.

**◻ Templates still render.** Token-bearing files must survive verbatim and stay formatter-ignored:

```sh
REPO="$(git rev-parse --show-toplevel)"     # absolute — the next line leaves this directory
SMOKE="$(mktemp -d)" && cd "$SMOKE" && git init -q . && mkdir -p .anthill
cat > .anthill/config.json <<'JSON'
{ "version": 2, "channel": "smoke", "lead": "maestro",
  "seats": [ {"handle":"maestro","role":"lead","scope":"orchestration","spawn":false},
             {"handle":"forager","role":"engine","scope":"the engine","spawn":true} ] }
JSON
bun "$REPO/plugin/scripts/anthill/cli.ts" init
grep -rn '{{' .anthill/ && echo "FAIL: unrendered tokens" || echo "ok: all tokens substituted"
cd "$REPO"                                  # REQUIRED — see the trap below
```

Then, back in the repo, confirm the formatter still cannot reach them:

```sh
bunx prettier --file-info plugin/templates/docs-team/dev/seams.md   # expect {"ignored":true}
```

**Trap.** `prettier --file-info` on a path that does not exist prints `{"ignored": false, …}` and
exits 0. It does not error. Run this from the repo root. Run it from inside the smoke directory and
you get the opposite of the expected answer and conclude the templates lost formatter protection.

**◻ Docs that go stale by construction.** Nothing in the work references these, so they only move if
you move them:

- `README.md` **"Status"**.
- The **design-of-record's live sections**. Its §0 splits preserved decisions from live contracts,
  and the live ones must match reality.
- `docs/ROADMAP.md` **`Now`**. The lead reads this at convene. Check that it describes what is
  actually next.
- `docs/PROJECT-SUMMARY.md`. If it predates a structural shift, note it or refresh it.

**◻ Dependency floors.** If anything ships that needs a newer spellbook, move the floor. `README.md`
holds it, `≥ 1.16.0` at the time of writing, load-bearing for board session-binding and bounded vine
catch-up. Treat that number as an anchor and the README as authoritative. The floor is a correctness
claim, not documentation.

**◻ Do not bump versions. Verify instead.** release-please owns every version location, by two
different mechanisms, and knowing which is which is how you diagnose a stale one:

- **`extra-files` in `release-please-config.json`**, at the time of writing:
  `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and
  `plugin/scripts/anthill/cli.ts` (a generic marker comment).
- **The `node` release-type, implicitly**: `package.json`, `CHANGELOG.md`,
  `.release-please-manifest.json`.

The config is authoritative and the list above is an anchor, not the source. Read it if the PR looks
wrong, and note that a missing `extra-files` entry cannot explain a stale `package.json`, because
that one never came from `extra-files`. Confirm the release PR touched every location. Never edit one
by hand.

## Close the loop on the check itself

Note what this pass caught, even when it caught nothing. Two lines in the commit body, or a
`docs/backlog/` entry if it found something structural.

- **Caught something.** That row is load-bearing. Say so.
- **Caught nothing across several passes.** That row may be dead weight, or the trigger may be firing
  too broadly. Either is worth knowing.
- **Caught something the map has no row for.** Add the row.

## Skill feedback

Found a cascade this map misses? Add the row. This is an internal skill: file friction in
`docs/backlog/`, not via `anthill feedback` (that path is for consuming projects reporting on
anthill).

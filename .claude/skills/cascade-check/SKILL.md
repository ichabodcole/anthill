---
name: cascade-check
description:
  Find what ELSE must change when you change something in anthill. Use after any substantive edit to a
  skill, template, CLI behavior, config schema, or path — and always before cutting a release. anthill
  is a web of files that restate, render, or cite each other, and nothing enforces their consistency:
  no test fails when a skill contradicts a template, or when a rule ships that this repo itself does
  not follow. Triggers on "cascade check", "what else needs updating", "consistency sweep", "release
  preflight", "ready to cut a release", "did I miss anything". Internal to the anthill repo; never
  shipped to consuming projects.
---

# Cascade check — what else has to move?

anthill's content is **referentially dependent and unenforced.** The same rule lives in a skill, a
template, a rendered copy of that template, and sometimes a spec section that code cites by number.
Change one and the others are silently wrong.

**Nothing catches this.** `bun run check` is green while a skill argues with a template. The type
checker has no opinion about prose. So the only defense is knowing, for each kind of change, what
travels with it.

> **This is a judgment skill, not a lint.** Every rule below earned its place by actually failing.
> The scars are included because the check costs effort at the exact moment the work feels finished —
> and that feeling is the failure mode.

---

## The cascade map

Find the row for what you changed. Check every dependent.

### You changed a **template** (`plugin/templates/**`)

- ◻ **This repo's own `.anthill/`.** `anthill init` **never clobbers existing files** — by design, so
  a consumer's living docs are safe. The cost: our own footprint never receives template updates.
  Mirror by hand, substituting `{{lead}}`, `{{channel}}`, `{{handle}}`.
- ◻ **Any skill that describes what the template contains.** `bootstrap` renders it; `join` and
  `finalize-session` tell seats what's in it.
- ◻ **Render smoke** (see below) — tokens must survive verbatim.

> **Scar (v1.7.0).** A pass added a `Ratified at:` field to the `seams.md` scaffold plus a rule that
> every ratification record its grain. This repo's own three ratified contracts recorded none. One
> command from shipping a rule we visibly did not follow — in a project whose credibility rests on
> dogfooding.

### You changed a **rule in a skill** (`plugin/skills/**`)

- ◻ **The other skills that state the same rule.** `join` / `convene` / `finalize-session` overlap
  heavily on team behavior. Grep the **concept**, not the file you edited.
- ◻ **The SOP seed** (`plugin/templates/docs-team/README.md`) if it's a team-behavior rule — and then
  this repo's rendered `.anthill/README.md`.
- ◻ **`plugin/skills/plan/methodology.md`** if it's a plan-phase rule. That file is the **portable
  half** — a rule in the skill but not the methodology doesn't travel.
- ◻ **The skill's own checklist section.** Prose and checklist drift apart, and the checklist is the
  part that gets read.

> **Scar (v1.7.0), twice in one pass.** The SOP seed was corrected to say the lead is a routing
> default, not an exclusive channel. One commit later `join`'s **checklist** still said _"The human
> may not be watching this pane"_ — the sharper, more actionable version of the exact falsehood just
> fixed, surviving because the fix was verified where it was written rather than everywhere the claim
> lived.
>
> Separately: `methodology.md`'s seam **example** read `RATIFIED at <grain>` while its own **flip
> instruction** two lines below still said `RATIFIED`. A rule whose example and instruction disagree
> is worse than no rule — the reader picks one.

### You changed **CLI behavior, args, or output** (`plugin/scripts/anthill/**`)

- ◻ **The skill that tells agents to run it** — and the exact incantation, if it emits one.
- ◻ **`.anthill/dev/seams.md`** if it's a cross-seat contract, plus the **grain** it's ratified at.
- ◻ **The design-of-record's live sections** — §5 (config schema), §8 (layout / command set). Note
  `config.ts` and `paths.ts` cite _"spec §5"_ **by number**, so that section is load-bearing
  reference, not history.
- ◻ **`README.md`** if it's user-facing.

### You changed the **config schema**

- ◻ `config.ts` **and** design-of-record **§5** (they cite each other).
- ◻ `migrate.ts` + a migration doc under `plugin/skills/upgrade/migrations/`, if the footprint version moves.
- ◻ `bootstrap` (writes it) and `upgrade` (migrates it).
- ◻ The `.anthill/config.json` in **this** repo.

### You **moved or renamed a path**

- ◻ `AGENTS.md`, `README.md`, design-of-record **§8**.
- ◻ Every skill that references it.
- ◻ Tooling globs — `.prettierignore`, `biome.json` `files.includes`, `package.json` scripts.

> **Scar.** `AGENTS.md` cited `scripts/anthill/cli.ts` for weeks after the `plugin/` move — in the
> file every agent reads **first**.

### You **archived or moved a doc**

- ◻ **Inbound links.** A previous archiving pass left ~40 broken relative links, because a doc's depth
  changes when it moves (`../../ROADMAP.md` silently becomes wrong).
- ◻ `docs/ROADMAP.md` pointers.

### You **shipped a fix for a filed issue**

- ◻ The **issue** — close it, or comment if only partly fixed (see _After a release_).
- ◻ The **backlog item's status field.** A shipped project read `Draft` for days.
- ◻ The **brief / roadmap phase** it belongs to.

---

## When it's not in the map

The map is incomplete by construction. The method that finds the rest:

1. **Grep the concept, not the file.** Pick two or three phrasings of the claim and search
   `plugin/skills`, `plugin/templates`, `.anthill/`, `docs/`. The dependents rarely share your wording.
2. **Ask: is there a rendered copy of this?** Templates have one (`.anthill/`). Anything generated
   from config has one. Rendered copies never update themselves.
3. **Ask: does code cite this by name or number?** `grep -rn 'spec §' plugin/scripts/` finds the
   places prose is load-bearing for code.
4. **Ask: is there a portable half?** A rule in a skill that isn't in `methodology.md` doesn't leave
   this repo.
5. **Ask: what does the checklist say?** Skills carry both prose and a checklist; they drift, and the
   checklist wins because it's what gets read under time pressure.

**Interpret the hits; never bulk-fix them.** The greps produce false positives by design, and telling
them apart is the whole skill. From this map's own first run, searching for a stale CLI path:

- `${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts` in six skills — **correct.** The plugin root _is_
  `plugin/`, so the path is right relative to it.
- The same string in `docs/projects/_archive/**` — **correct.** Archived session notes are a historical
  record; "fixing" them would falsify what happened.
- A bare `scripts/anthill/cli.ts` in `AGENTS.md` — **the one real defect**, in the file every agent
  reads first.

One genuine hit, nine correct ones. A lint would have "fixed" all ten.

---

## Before cutting a release

Everything above, over the whole diff — plus these, which are genuinely release-only.

```sh
git diff --name-only origin/main..develop      # the full surface to sweep
bun run check                                   # typecheck + biome + tests
```

**◻ The `plugin/` ship boundary.** Only `plugin/` reaches a consumer (a `git-subdir` source).

- Anything consumer-facing that landed **outside** it won't reach them.
- Anything **inside `plugin/skills/`** becomes a skill in **every** consuming project — that directory
  is discovered by name. Internal tooling belongs in `.claude/skills/` (this file's own home, for
  exactly that reason).

**◻ Templates still render.** Token-bearing files must survive verbatim and stay formatter-ignored:

```sh
cd "$(mktemp -d)" && git init -q . && mkdir -p .anthill
cat > .anthill/config.json <<'JSON'
{ "version": 2, "channel": "smoke", "lead": "maestro",
  "seats": [ {"handle":"maestro","role":"lead","scope":"orchestration","spawn":false},
             {"handle":"forager","role":"engine","scope":"the engine","spawn":true} ] }
JSON
bun <repo>/plugin/scripts/anthill/cli.ts init
grep -rn '{{' .anthill/ && echo "FAIL: unrendered tokens" || echo "ok"
```

```sh
bunx prettier --file-info plugin/templates/docs-team/dev/seams.md   # expect {"ignored":true}
```

**◻ Docs that go stale by construction** — nothing in the work references these, so they only move if
you move them:

- `README.md` **"Status"** — it announced v0.2 work in progress for weeks after v0.2 shipped.
- The **design-of-record's live sections** — it specified `.team/config.json` for weeks after the v2
  rename. Its §0 splits preserved decisions from live contracts; the live ones must match reality.
- `docs/ROADMAP.md` **`Now`** — the lead reads this at convene. Does it describe what's actually next?
- `docs/PROJECT-SUMMARY.md` — if it predates a structural shift, note it or refresh it.

**◻ Dependency floors.** If anything ships that needs a newer **spellbook**, move the floor in
`README.md`. The `≥ 1.16.0` floor is load-bearing (board session-binding, bounded vine catch-up), and
wrong-footing a consumer on an older spellbook produces failures that look like anthill bugs.

**◻ DO NOT bump versions.** release-please owns `package.json`,
`plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `cli.ts` (generic marker),
`CHANGELOG.md`, `.release-please-manifest.json`. **Verify its PR touched all six** — a missing
`extra-files` entry means a version location silently didn't move. Never edit them by hand.

## After a release

**Close the issues it fixed, naming the fix.** Not bookkeeping — **loop health.** A team that files a
careful report and sees nothing happen files fewer next time, and those reports are the only real view
we have into how teams use this.

- **Fully fixed** → close, naming what fixed it and the version.
- **Partially fixed** → comment with exactly what shipped and what remains; **leave it open.** Closing
  a half-fix tells a team their problem is solved when it isn't, which costs more trust than silence.
- **Ours** → if it's a regression we introduced, say so. A closure implying the reporter found an edge
  case teaches something different from one saying they caught our mistake.

## Skill feedback

Found a cascade this map misses? **Add the row, with the scar.** The map is only worth reading because
every entry actually failed once. Internal skill — file friction in `docs/backlog/`, not via
`anthill feedback` (that path is for consuming projects reporting on anthill).

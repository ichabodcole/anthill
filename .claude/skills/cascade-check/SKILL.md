---
name: cascade-check
description:
  Find what ELSE must change when you change something in anthill. Use after any substantive edit to a
  skill, template, CLI behavior, config schema, or path — and always before cutting a release. anthill
  is a web of files that restate, render, or cite each other, and nothing enforces their consistency:
  no test fails when a skill contradicts a template, or when a rule ships that this repo itself does
  not follow. Fires for edits to skills, templates, CLI behavior, the config schema, moved paths,
  archived docs, and the grounding docs that restate any of them (AGENTS.md, README.md, ROADMAP.md,
  the design-of-record). Does NOT fire for a typo fix, a new test, a code change with no
  documented contract, or a new doc that nothing else references yet. Triggers on "cascade check",
  "what else needs updating", "consistency sweep", "release preflight", "ready to cut a release".
  Only applies inside the anthill repo itself — it is internal tooling and is never shipped to
  consuming projects.
---

# Cascade check — what else has to move?

anthill's content is **referentially dependent and unenforced.** The same rule lives in a skill, a
template, a rendered copy of that template, and sometimes a spec section that code cites by number.
Change one and the others are silently wrong.

**Nothing catches this.** `bun run check` is green while a skill argues with a template — the type
checker has no opinion about prose. (`team-init.test.ts` does cover template _rendering_, so
token-level breakage has some coverage; **prose consistency has none.**) So the only defense is knowing, for each kind of change, what
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
  Mirror by hand. **The full token set is in `team-init.ts`'s header — six, not three:**
  `{{handle}}` as a _path_ token (fans a template out once per seat), `{{channel}}` / `{{lead}}` /
  `{{rosterTable}}` as global content, and `{{handle}}` / `{{role}}` / `{{scope}}` inside a per-seat
  template. **`{{rosterTable}}` is a generated markdown table** — hand-mirroring with a partial token
  list leaves a literal `{{rosterTable}}` or a wrong roster. (Unknown tokens are left untouched by
  design, which is what makes the `grep -rn '{{'` smoke below meaningful.)
- ◻ **Any skill that describes what the template contains.** `bootstrap` renders it; `join` and
  `finalize-session` tell seats what's in it.
- ◻ **Which direction wins? Neither, wholesale.** Mirror **shared guidance downward**
  (template → footprint) — anything every team should have. But a footprint legitimately carries
  **project-specific** content the template must not (this repo's `.anthill/README.md` points at its
  own board-binding contract by number). So **a delta is expected and is not automatically drift.**
  Diff the two, then classify each hunk: _shared guidance missing downstream_ (mirror it) vs. _local
  specificity_ (leave it) vs. _genuine drift_ (reconcile). Scope your mirror to the change you made;
  reconciling the whole file is a separate job.
- ◻ **Render smoke** (see below) — tokens must survive verbatim.
- ◻ **Renamed or deleted a template?** `init` skips existing files and **never deletes**, so a rename
  leaves the old rendered copy orphaned in every footprint forever. Remove it by hand here; consuming
  projects need a note in the release.

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

### You **added or removed a skill, or a CLI command**

- ◻ **`plugin/.claude-plugin/plugin.json`'s `description`** — it enumerates the lifecycle skills in
  prose, and it is **consumer-visible**.
- ◻ **`.claude-plugin/marketplace.json`'s description**, same reason.
- ◻ **`AGENTS.md`** and `README.md` wherever they name the skill set or command set.
- ◻ **The design-of-record §7/§8**, which list the skills and the CLI command set.

> **Scar (found by a cold review of this very skill, 2026-07-28).** `plugin.json`'s description named
> _"bootstrap / convene / plan / join / finalize-session"_ — omitting **`upgrade`**, which has existed
> for weeks. A shipped, consumer-facing restatement of the skill set with nothing pointing at it. The
> map had no row for this until the omission proved one was needed.

### You wrote a **promise** — "safe", "protects", "isolated", "never …", "guarantees"

Not a cascade so much as a lens, but it belongs here because release time is when it fires.

- ◻ **Name the granularity the promise holds at**, in the sentence itself. _"Gitignored and excluded
  from the lint target set"_ is true and unmisleadable; _"gate-safe"_ is shorter and wrong.
- ◻ **Ask where someone will rely on it one level finer.** File → content. Index → working tree.
  Envelope → field. Scan-set → filesystem discovery. That finer reading is the one that bites, and
  **the natural verification returns clean** — the failure is invisible to whoever caused it.
- ◻ **Is the guarantee actually ours?** If it's a dependency's behavior we forward, attribute it.
  Stating spellbook's guarantee in anthill's voice makes us silently wrong when upstream changes.
- ◻ **Does a protection also freeze something?** A no-clobber guarantee protects content _and_ makes
  it inert. Say both.

> **Scar (2026-07-31).** Five instances, four surfaces, two teams — and **two were found by predicting
> from the pattern, not by a report** (a shipped failure message that read as isolation; and
> `init`'s "never clobbers", which is true at file level and false as "upgrading brings my footprint
> current" — meaning template improvements reach **no existing team**, discovered in the same pass
> that wrote new template guidance). The reporting team's own prescription is the whole rule:
> **a promise without a stated granularity is a promise at the coarsest reading.**

### You **archived or moved a doc**

- ◻ **Inbound links.** A previous archiving pass left ~40 broken relative links, because a doc's depth
  changes when it moves (`../../ROADMAP.md` silently becomes wrong).
- ◻ `docs/ROADMAP.md` pointers.

### You **shipped a fix for a filed issue**

- ◻ The **backlog item's status field.** A shipped project read `Draft` for days.
- ◻ The **brief / roadmap phase** it belongs to.
- ◻ **The issue itself, once the fix is released** — and how you close it matters. This is **loop
  health**, not bookkeeping: a team that files a careful report and sees nothing happen files fewer
  next time, and those reports are the only real view we have into how teams use this.
  - **Fully fixed** → close, naming what fixed it and the version.
  - **Partly fixed** → comment with exactly what shipped and what remains; **leave it open.** Closing
    a half-fix tells a team their problem is solved when it isn't, which costs more trust than silence.
  - **Ours** → if it's a regression we introduced, say so. A closure implying the reporter found an
    edge case teaches something different from one saying they caught our mistake.

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

**Interpret every hit before acting on it.** The greps produce false positives by design, and telling
them apart is the whole skill. From this map's own first run, searching for a stale CLI path:

- `${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts` in six skills — **correct.** The plugin root _is_
  `plugin/`, so the path is right relative to it.
- The same string in `docs/projects/_archive/**` — **correct.** Archived session notes are a historical
  record; "fixing" them would falsify what happened.
- A bare `scripts/anthill/cli.ts` in `AGENTS.md` — **the one real defect**, in the file every agent
  reads first.

One genuine hit, nine correct ones. A lint would have "fixed" all ten.

## Should you fan out subagents for this?

**Usually no.** This skill's value is **interpretation**, not search — see the ten-hits-one-real
example above. An explorer that reports _"found 10 references to X"_ without judgment invites exactly
the bulk-fix failure that section warns against, and it can't judge relevance because it doesn't know
what rule you just changed or why. Briefing it costs more than running the greps yourself. Most
cascade checks are three to five targeted searches.

**Two cases where it does pay:**

1. **A release sweep over a large diff.** The surfaces are genuinely independent — templates, skill
   rules, docs, tooling globs — so one explorer per surface parallelizes well. **Hard constraint:
   explorers return LOCATED CANDIDATES WITH CONTEXT, never verdicts.** Ask for _"every place this
   claim appears, quoted with its surrounding line"_ — not _"is this stale?"_ The interpretation stays
   with you, or you have delegated away the only part that matters.
2. **Checking the checker, on a large or subtle change.** Dispatch a **fresh** agent (never a fork —
   a fork inherits your framing and will agree with you) to read the changed guidance cold and report
   where it contradicts itself or assumes context. This is a different act from doing the cascade
   check: it verifies the change, not the dependents.

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

Then, **back in the repo**, confirm the formatter still can't reach them:

```sh
bunx prettier --file-info plugin/templates/docs-team/dev/seams.md   # expect {"ignored":true}
```

> **Trap, and it bites silently.** `prettier --file-info` on a path that **doesn't exist** prints
> `{"ignored": false, …}` and **exits 0** — it does not error. So if you run this while still inside
> the smoke directory, you get the exact opposite of the expected answer and conclude the templates
> lost formatter protection. A fabricated defect from a missing `cd`. Always run it from the repo root.

**◻ Docs that go stale by construction** — nothing in the work references these, so they only move if
you move them:

- `README.md` **"Status"** — it announced v0.2 work in progress for weeks after v0.2 shipped.
- The **design-of-record's live sections** — it specified `.team/config.json` for weeks after the v2
  rename. Its §0 splits preserved decisions from live contracts; the live ones must match reality.
- `docs/ROADMAP.md` **`Now`** — the lead reads this at convene. Does it describe what's actually next?
- `docs/PROJECT-SUMMARY.md` — if it predates a structural shift, note it or refresh it.

**◻ Dependency floors.** If anything ships that needs a newer **spellbook**, move the floor.
`README.md` holds it — **`≥ 1.16.0` at the time of writing**, load-bearing for board session-binding
and bounded vine catch-up. Treat that number as an anchor and the README as authoritative. The floor is
a **correctness claim, not documentation**: wrong-footing a consumer on an older spellbook produces
failures that look like anthill bugs.

**◻ DO NOT bump versions — verify instead.** release-please owns every version location, by **two
different mechanisms**, and knowing which is which is how you diagnose a stale one:

- **`extra-files` in `release-please-config.json`** — at the time of writing: `plugin/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, and `plugin/scripts/anthill/cli.ts` (a generic marker comment).
- **The `node` release-type, implicitly** — `package.json`, `CHANGELOG.md`, `.release-please-manifest.json`.

**The config is authoritative; the list above is an anchor, not the source.** Read it if the PR looks
wrong — and note that a missing `extra-files` entry cannot explain a stale `package.json`, because that
one never came from `extra-files`. Confirm the release PR touched every location. Never edit one by hand.

## Close the loop on the check itself

**Note what this pass caught — even when it caught nothing.** Two lines in the commit body, or a
`docs/backlog/` entry if it found something structural. Right now nothing records whether running this
pays for itself, which means the map can only grow and never earn its keep:

- **Caught something?** That row is load-bearing — say so, and it stops looking like ceremony to the
  next reader.
- **Caught nothing across several passes?** That row may be dead weight, or the trigger may be firing
  too broadly. Either is worth knowing.
- **Caught something the map has no row for?** That's the important case — add the row.

## Skill feedback

Found a cascade this map misses? **Add the row, with the scar.** The map is only worth reading because
every entry actually failed once. Internal skill — file friction in `docs/backlog/`, not via
`anthill feedback` (that path is for consuming projects reporting on anthill).

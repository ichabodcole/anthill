# Multi-team support — Implementation Plan

**Created:** 2026-08-09 · **Revised:** v3, 2026-08-09
**Related Proposal:** [proposal.md](./proposal.md)
**Status:** ✅ **Ready for dispatch** — all decisions ratified (DP2 re-opened and resolved 2026-08-09)
**Gate:** `bun run check` = `tsc --noEmit -p tsconfig.json && biome check --error-on-warnings . && bun test`

> **Revision history, because it is the evidence this plan is trustworthy.**
> **v1** → cold gap analysis scored it **1 PASS / 11 FAIL** on the one-shot-subagent bar; two failures
> would have caused silent damage. **v2** → an idiom review and a simplification review, run
> independently, **converged on three identical findings** (the `team-comms.ts` hole, `soleTeam`,
> and not changing `resolveConfig`'s signature). **v3 is that convergence applied**, plus four cuts,
> three merges, and one rationale that was **factually impossible** and is now corrected.

---

## Execution model

**Not a convened anthill team.** One **lead** holds the plan, owns every commit, runs the gate.
**One-shot subagents** execute one task each with **no prior context.**

1. **A task is dispatchable only if its text alone suffices** — name every _site within_ a file, not
   just the file. v1's worst defect named a write site but not the idempotency predicate beside it; a
   subagent following it would have **silently overwritten live seat docs**.
2. **The lead runs `bun run check` before every commit.** A subagent's "tests pass" is a claim.
3. **Commit types matter** — `AGENTS.md:44-53`: release-please hides `docs`/`test`/`chore`. Each task
   states its type.
4. **⇉ marks parallel-safe.** Everything touching `config.ts` is sequential.
5. **After any prose edit, run `cascade-check`** (`AGENTS.md:83`). `bun run check` cannot see markdown
   drift — biome does not lint prose and prettier is `format:md`, outside `check`.
6. **Test conventions, because a fresh subagent will otherwise invent one:** pure resolution uses a
   fake root and object fixtures (`config.test.ts:16-32`, `const ROOT = "/proj"`); anything touching
   the filesystem uses `mkdtempSync(tmpdir())` + `afterAll(rmSync)` — and **`tmpleak.guard.test.ts`
   enforces this.**
7. **A task that changes a command's behaviour is not done until the command has been RUN against a
   fixture repo in the state its documentation describes — and whatever that run finds gets a test
   before the fix is committed.** Added 2026-08-09, after four phases in a row.

   **Every defect this project's reviews have found was invisible to unit tests and visible in one
   command.** `team ls` refused to list on the repo it exists for; `team use` refused every fresh
   project; `init` refused the documented add-a-team route; then `init` silently rendered nothing on
   the second use of that same route. **All four were green at `0 fail` while broken**, because the
   pure half was always right — `renderTemplates` never rendered wrong, it never ran.

   **The failure is structural, not careless.** A unit test is written from the same understanding
   that wrote the code, so it inherits that understanding's blind spot. **A fixture repo is the one
   thing in this loop that was not written by whoever is wrong.** It also catches the class no unit
   test can see: `ok: true` on a run that did part of its job — 4.2's probe wrote `research`'s
   gitignore lines and none of its docs, which is a passing envelope over a half-finished act.

   **In the state its documentation describes** is the load-bearing clause. 4.1's fix was verified on
   a repo with no pin, which is what `bootstrap` §0a assumed; the pinned repo — every later use of the
   route — was never run. **Read the prose, build the repo the prose describes, run the command the
   prose gives.**

   **And the fix gets a test, in the same commit.** Twice now a fix found this way landed with
   nothing holding it (task 3.6 exists only to retrofit two of them). A defect found by hand and
   fixed by hand is a defect that comes back.

## Overview

Phase 0 builds the path layer (a bug fix that ships alone), then identity, resolution, commands,
guards. **Back-compat verified:** this repo's `.anthill/config.json` has no `paths` block, so it
resolves identically after Phase 0, and its `.gitignore` already carries what 0.2 derives.

---

## Phase 0 — Make the path layer real

### 0.1 — Derive `seatDir`/`seams`, and make `init` use them _(merged: v2's 0.1 + 0.3)_

**Type:** `fix:` · **Files:** modify `plugin/scripts/anthill/config.ts` (`:191-196`), `plugin/scripts/anthill/commands/team-init.ts` (**three sites**: `exists` predicate `:223`, write `:228`, `skipped` report `:233`) · tests `config.test.ts`, `commands/team-init.test.ts`

**Merged because they are one bug from two ends.** Split, `develop` briefly holds a state where the
derivation exists and the renderer contradicts it, and the Phase-0 fixture gate only runs at the end.

**Contract A — derivation** (`config.ts:191-196`). `seams` derives from **`seatDir`**, so overriding
`seatDir` alone stays coherent:

```ts
const teamDir =
  typeof rawPaths.teamDir === "string"
    ? rawPaths.teamDir
    : DEFAULT_PATHS.teamDir;
const seatDir =
  typeof rawPaths.seatDir === "string" ? rawPaths.seatDir : `${teamDir}/dev`;
const seams =
  typeof rawPaths.seams === "string" ? rawPaths.seams : `${seatDir}/seams.md`;
```

**Contract B — `init` renders through the resolvers.** Currently every template relPath is joined onto
`teamDirPath()` and `seatDirPath()`/`seamsPath()` are never consulted; the `dev/` segment is an
artifact of the template folder layout. Map instead:

| template relPath                                          | destination         |
| --------------------------------------------------------- | ------------------- |
| `README.md`, `principles.md`, `paper-cuts.md`, `retro.md` | `<teamDir>/…`       |
| `dev/README.md`, `dev/{{handle}}.md`                      | **`seatDirPath()`** |
| `dev/seams.md`                                            | **`seamsPath()`**   |

**⚠ The `exists` predicate at `:223` is the dangerous site.** `renderTemplates` takes
`exists: (relPath) => existsSync(join(teamDir, relPath))` as a _parameter_. Remap the write and leave
the predicate, and `init` looks for a seat doc where one no longer belongs, finds nothing, and
**overwrites a live seat doc containing that seat's accumulated knowledge.** All three sites move
together.

The template list is **not** explicit — `readTemplateDir()` (`team-init.ts:155`) reads the directory.

**Tasks:** failing tests — (a) **no `paths` block** → `.anthill` / `.anthill/dev` /
`.anthill/dev/seams.md` _(the back-compat guard; the case this repo is in)_; (b)
`teamDir: ".anthill/teams/dev"` cascades; (c) explicit `seatDir` wins **and `seams` follows it**;
(d) explicit `seams` wins; (e) all three explicit _(`config.test.ts:30`'s existing fixture — must keep
passing)_; (f) `seatDir: ".anthill/roles"` puts the seat doc at `.anthill/roles/<handle>.md`;
(g) **a second `init` reports the seat doc `skipped`, not written** → implement both contracts →
assert the all-defaults render is unchanged file-for-file → `bun run check` → commit
`fix(config): derive seat paths from teamDir and render through the resolvers`.

**Note on stranded footprints (v2's task 0.1a — CUT).** A project overriding `seatDir` without
`teamDir` is **already** in the broken loop: `init` has never consulted that knob, so it writes
`<teamDir>/dev/<handle>.md` while `join` reads `<seatDir>/<handle>.md`. **0.1 strands nobody new** — it
moves an already-broken project from one broken state to a fixed one, and `anthill init` is now the
correct remedy, which `buildMissingWarnings` (`team-join.ts:568-572`) already tells the user to run.
**Add a clause to that existing string**; do not add a branch or a filesystem probe.

### 0.2 — Gitignore lines derive from `teamDir`

**Type:** `fix:` · **Files:** modify `plugin/scripts/anthill/commands/team-init.ts` (constants `:101`, `:107`, `:133`; `planGitignore` chain `:240-252`) · test `commands/team-init.test.ts`

**The bug (found independently by two reviewers):** ignore lines are fixed strings while the paths they
guard are `teamDir`-derived (`comms.ts:181-193`, `team-join.ts:737`). **Move `teamDir` and every team's
comms log and every seat's scratch becomes a tracked file.**

**⚠ `migrate.ts` is OUT of this task** _(v2 got this wrong)_. `planV1ToV2` runs only on **v1** configs,
which are single-team by construction, so there is nothing per-team to derive there. Its one real
defect is unrelated: `migrate` emits `.anthill/comms/` **with** a trailing slash (`:174-175`) while
`team-init` emits it without, and `team-init.ts:110-132` is a 20-line comment explaining the slash is
**actively harmful**. That is a **one-character change to `add`, with `remove` still matching the
legacy literal** — file it as its own `fix:` commit, not here. _(Reversing that pair would silently
reflow a user's `.gitignore`; `migrate.ts:169-172` warns about exactly this.)_

**Contract:** emit `<teamDir>/scratch/` and `<teamDir>/comms` **per configured team**, in
`team-init`'s no-trailing-slash form.

**⚠ Do not test this with a grep for `.anthill/` literals** — `migrate.ts` interpolates `ANTHILL_DIR`
(`:22`), so a grep passes while the bug lives. Assert on the emitted ignore set.

### 0.3 — `retro.md` gets a template

**Type:** `feat:` · **Files:** create `plugin/templates/docs-team/retro.md`; modify `plugin/skills/upgrade/SKILL.md` (**delete/rewrite `:202-204`**) · test `commands/team-init.test.ts`

**⚠ `upgrade/SKILL.md:202-204` says verbatim: _"Do NOT diff `retro.md` — there is no template for it
and there never will be."_ This task falsifies that sentence and must fix it in the same commit**, or
we ship a skill arguing with a template — the drift class `AGENTS.md:81` says `bun run check` cannot
see.

Seed in `principles.md`'s register — what a retro is, the three questions, the two rules (Q3 answers
are testable hypotheses; agreement is not truth), newest-first. **Starts effectively empty.**

**Tasks:** write it → assert it renders and is **skipped** on re-run → fix the skill → `cascade-check`
→ `bun run format:md` → `bun run check` → commit `feat(templates): seed retro.md`.

### 0.5 — Reconcile `migrate`'s comms ignore line with the one 0.2 now emits

> **Added 2026-08-09, after review of the completed Phase 0. It was previously in
> [Filed separately](#filed-separately--deliberately-not-in-this-plan), and it moved because the
> premise for filing it changed: it was pre-existing debt this project did not touch, and 0.2 touched
> it.** Leaving it now means Phase 0 ships a state it made _worse_ than it found. **A finding that
> arrives after a phase is called done is exactly the one that gets lost** — hence a task, not a note.

**Type:** `fix:` · **Files:** modify `plugin/scripts/anthill/migrate.ts` (the comms ensure op at **`:172-176`** and its note at **`:177`**) · test `plugin/scripts/anthill/migrate.test.ts`

**What 0.2 changed underneath this.** `team-init` now emits the comms line **derived from `teamDir`
and slashless** (`commsGitignoreLine()`). `migrate.ts:174-175` still emits the fixed literal
`` `${ANTHILL_DIR}/comms/` `` **with** the trailing slash — the form `team-init.ts:110-132` spends
twenty lines explaining is actively harmful: a slash-suffixed rule matches a **directory only**, so it
stops matching the moment `comms` is a **symlink** (how a team shares one log across per-seat
worktrees), and the link then shows up untracked in every seat's tree.

**The observable consequence:** `planGitignore` matches per line, trimmed, and
`` `${ANTHILL_DIR}/comms/` !== `${ANTHILL_DIR}/comms` ``. **So a v1 repo that migrates gets the
slashed line, and the next `anthill init` adds the slashless one — the repo ends up carrying both, one
of them the harmful form.**

**Contract — change `add` only. Do NOT touch `remove`.**

```ts
ops.push({
  kind: "gitignore",
  remove: `${ANTHILL_DIR}/comms/`, // UNCHANGED — strips the legacy slashed line
  add: `${ANTHILL_DIR}/comms`, // slashless, matching team-init
});
```

**⚠ Why `remove` must keep its trailing slash, and why it must stay non-empty.** The op is spelled as
an ensure (`remove === add`) **on purpose** — `migrate.ts:169-171` states it: _"the executor filters
lines equal to `remove`, so an empty `remove` would match every BLANK line and silently reflow the
consumer's `.gitignore`."_ Changing only `add` converts it from an ensure into a **genuine migration**
— strip the harmful line, write the correct one — while keeping `remove` a real string. **Reversing
the pair, or emptying `remove`, corrupts a user's `.gitignore`.**

Update the note at `:177` to match what the op now does.

**Scope, so nobody over-claims it** (`migrate.ts:161-168` already says this): this op lives in the
v1→v2 plan and `MIGRATIONS` holds only that step, so **only teams still on v1 are covered.** Everyone
else gets the line from `anthill init` or the upgrade skill's reconcile. Exposure is small; the
divergence between two files that must agree is the reason to fix it.

**Tasks:** failing test in `migrate.test.ts` — the v1→v2 plan's comms op has `remove` ending in `/`
and `add` **not** ending in `/`; and a second asserting `remove` is non-empty _(the guard against the
reflow failure)_ → implement → update the note string → `bun run check` → commit
`fix(migrate): emit the slashless comms ignore line team-init now derives`.

### 0.4 — Skill prose stops hard-coding doc paths ⇉ _(8 disjoint files)_

**Type:** `docs:` · **Files:** `plugin/skills/{convene,join,finalize-session,plan,comms,bootstrap,upgrade}/SKILL.md`, `plugin/templates/docs-team/README.md`

**Find them:** `grep -rno '\.anthill/[A-Za-z0-9_<>{}./-]*' plugin/skills/*/SKILL.md plugin/templates/ | grep -v 'config\.json'`

**Excluded:** the ~45 `.anthill/config.json` mentions — immovable by design, correctly hard-coded.

**Also fix `finalize-session/SKILL.md:15-16`**, which claims these paths resolve from config — made
true by 0.1's derivation.

> **v2's task 0.2 (four new path resolvers) is CUT.** Measured, not argued: `retroPath()` and
> `paperCutsPath()` would have **zero consumers** — none today, none created anywhere in this plan.
> `sopPath()`/`principlesPath()` have exactly one consumer, `buildGroundingRefs`, which already
> computes the identical string (`team-join.ts:527-528`). Four aliases for `join(teamDir, X)`, costing
> a rewrite of a pure function across three sites plus its fixtures. **The claim they existed to make
> true is made true by 0.1.**

**Validation — NOT `bun run check`:** the grep returns only `config.json` hits → `bun run format:md` →
`cascade-check` → commit `docs(skills): cite team doc paths by their resolved location`.

**Phase 0 gate:** scratch fixture repo, `paths.teamDir = ".anthill/teams/dev"`, `anthill init`, then
`anthill join <handle>` — **every path in the grounding manifest exists**, and `git status` shows no
comms/scratch files.

---

## Phase 1 — Team identity in config

### 1.1 — `resolveProject` beside `resolveConfig`

**Type:** `feat:` · **Files:** modify `plugin/scripts/anthill/config.ts` (add functions; **do not change `resolveConfig`'s signature**) · test `config.test.ts`

**⚠ v2 said change `resolveConfig`'s return type AND "assert every existing test passes unchanged".
Those cannot both be true** — `config.test.ts` has 13 call sites reading `.channel`, `.paths`,
`.seatDocPath()`. **This codebase's idiom for adding a layer is to add a function** (`config.ts:9-13`
documents three named entry points; `migrate.ts` adds planners to a registry rather than generalizing
one).

```ts
export function resolveConfig(raw, ctx): ResolvedConfig; // UNCHANGED — resolves ONE team entry
export function resolveProject(raw, ctx): ResolvedProject; // NEW, pure — detects shape, maps entries
export function loadProject(startDir): ResolvedProject; // NEW, fs — beside loadConfig
```

**The v2 path is then _provably_ byte-identical, because it is literally the same function.**

**Contract — `ResolvedProject`, mirroring the `seats`/`seat()` pattern** (`config.ts:74, 101, 219`):

```ts
export interface ResolvedProject {
  projectRoot: string;
  configPath: string;
  teams: ResolvedConfig[]; // config order — NOT a Map
  team(name: string): ResolvedConfig | undefined; // mirrors seat(handle)
}
```

**No `soleTeam` field.** Four separate comments in this codebase forbid exactly that shape —
`team-support.ts:181-196` (_"`null` and `0` are different facts and must never be fused"_),
`:198-224`, `agent-layer.ts:25-33`, `cli.ts:245-251`: **top-level fields are TOTAL, so an absence
cannot carry a verdict.** `resolveTeam` computes `teams.length === 1 ? teams[0] : undefined` at rung 4,
one line, inside the function whose job is deciding.

**Contract — shape detection, structural, no version bump.**

> **v2 proposed `MAX_READABLE_VERSION = 3`. CUT, for two reasons.**
> **(a) Its stated rationale was factually impossible.** Both documents claimed the check lets "an
> older cached CLI say _this is v3, I understand v2_". **An older cached CLI does not contain the new
> code** — it dies with `config.channel is required` regardless. That problem is only fixable by
> putting `bun ${cliPath}` in emitted strings (filed separately).
> **(b) `version` already means FOOTPRINT LAYOUT** — `migrate.ts:14-17`, `team-migrate.ts:69-81`,
> `pendingMigrations`. Overloading it with schema shape would make `team-migrate` report
> **"already at v3"** while `CURRENT_VERSION` is 2, reading as "ahead of the plugin" when nothing
> moved on disk.

**Detect structurally: `"teams" in raw` → v3 path, else flat.** `CURRENT_VERSION` stays 2 and nothing
stamps a new number. This is also the most idiomatic reading — AWS has carried `[default]` beside
`[profile foo]` for a decade **with no version field at all**.

**Contract — the two shapes:**

- **v2 flat** → one entry, **named `default`** _(not derived from `channel` — AWS/Terraform/Docker
  all terminate on a named default; it gives `anthill team use default` something to say and error
  messages a noun)_, `teamDir` defaults to `.anthill`.
- **v3** → `teams: { <name>: { lead, seats, channel?, paths?, gate?, grounding?, forkedFrom?, forkedAt? } }`.
  **`channel` is OPTIONAL and defaults to the team name**, so
  `{"teams": {"dev": {lead, seats}, "dev-lean": {lead, seats}}}` is a complete two-team config.
  `teamDir` defaults to `.anthill/teams/<name>`.

**⚠ And the incumbent's docs must not be orphaned.** Once `teamDir` defaults to
`.anthill/teams/<name>`, an existing team's files stay at `.anthill/` while everything resolves
elsewhere. **The v2→v3 conversion writes an explicit `paths.teamDir: ".anthill"` for the incumbent
team** — zero file moves, zero migration, and new teams still get the new default.

**Tasks:** failing tests — v2 flat → one entry named `default`, identical to today; v3 two teams →
both, config order preserved; `channel` omitted → defaults to name; `team("nope")` → `undefined`
→ implement → **assert every existing `config.test.ts` case passes literally unchanged** →
`bun run check` → commit `feat(config): add resolveProject beside resolveConfig`.

### 1.2 — Cross-team validation

**Type:** `feat:` · **Files:** `config.ts` (in `resolveProject`) · test `config.test.ts`

- **Team names match `/^[a-zA-Z0-9._-]+$/`** — `SAFE_SESSION_KEY` (`team-spawn.ts:37`); the name
  reaches a shell prefix.
- **Channels unique across teams.**
- **Channels prefix-free** — `team-attach.ts:63` (`relatedSessions`) treats `<channel>-<suffix>` as the
  _same team_, so `anthill-dev` + `anthill-dev-lean` would put a fork's panes in its parent's menu.

**Tasks:** three failing tests, **each asserting a thrown `ConfigError` naming the offending team**.

### 1.3 — Two teams may not resolve to the same living-docs directory

**Type:** `fix:` · **Files:** `config.ts` (`validateAcrossTeams`, `SAFE_TEAM_NAME`) · test
`config.test.ts` · **Added 2026-08-09 from the Phase 1 review.**

**1.2 protects the CHANNEL and leaves the DIRECTORY open — and the directory is where the durable
knowledge lives.** `teamDir` defaults to `.anthill/teams/<name>`, which is distinct by construction,
so the default path is safe. **But the design requires the incumbent team to carry an _explicit_
`paths.teamDir: ".anthill"`** (§5a) — so the one team that must escape the derived default is the one
nothing checks. Verified against the shipped code; both of these resolve without error today:

```jsonc
// A — two explicit teamDirs, identical. Both teams' seats, seams and comms land on one another.
{"teams": {"dev":  {"seats": […], "paths": {"teamDir": ".anthill"}},
           "lean": {"seats": […], "paths": {"teamDir": ".anthill"}}}}
// → both resolve seams to `.anthill/dev/seams.md`

// B — `/^[a-zA-Z0-9._-]+$/` matches `..`, and the name is a DIRECTORY SEGMENT.
{"teams": {"..": {"seats": […]}, "dev": {"seats": […]}}}
// → `..` resolves seatDir to `.anthill/teams/../dev` = `.anthill/dev` — the INCUMBENT's seat dir
```

**B is why the inherited regex is not enough.** It came from `SAFE_SESSION_KEY` (`team-spawn.ts`),
which guards a tmux session key; `.` and `..` are unremarkable there and load-bearing in a path. The
shipped comment already names both jobs — the regex only ever did the first.

**Contract — two guards, in `resolveProject`:**

1. **Reject the names `.` and `..`** beside the `SAFE_TEAM_NAME` test, message naming the segment
   role. Dots _inside_ a name (`v1.2`) stay legal.
2. **In `validateAcrossTeams`, reject two teams whose resolved `paths.teamDir`, `paths.seatDir` or
   `paths.seams` are EQUAL.** Compare the resolved values, not the raw ones — A above is only
   visible after defaults apply.

**⚠ Equality, NOT prefix-free — the opposite of the channel rule.** Teams nest by design: the
incumbent sits at `.anthill` and every other team at `.anthill/teams/<name>`, so `.anthill` is a
prefix of all of them. Reusing 1.2's prefix check here would reject the intended layout.

**Tasks:** two failing tests (case A, case B) → implement → assert every 1.1/1.2 case still passes →
`bun run check` → commit `fix(config): two teams may not share a living-docs directory`.

---

## Phase 2 — The resolution ladder

> ## ✅ DP2 — the env rung SHIPS. Re-opened and resolved 2026-08-09 (Cole: _"ship the env rung"_).
>
> **This reverses the earlier ratification, because the reason given for it was wrong.** The original
> argument was that bounty's env rung is what makes worktrees fail worse. **True for bounty** — its
> env carries a key **derived against the repo path**, so a worktree derives a different board and the
> env shadows the pin that would have rescued it. **Ours carries a NAME checked against a registry**,
> so `ANTHILL_TEAM=dev` resolves correctly from any directory. **The failure does not transfer.**
>
> **And the alternative carried a hazard the earlier draft missed:** threading `{team}` into the
> `launch` _template_ means **any project that has overridden `launch` silently never receives the
> token** — the same partial-adoption trap `{handle}` already carries. Meanwhile `team-spawn.ts:47-54`
> already exports `BOUNTY_SESSION_KEY` as an env prefix applied **regardless of the template**, guarded
> by `SAFE_SESSION_KEY`. Threading `{team}` would have put **two ambient mechanisms one character
> apart in the same launch string, with different scoping rules.**
>
> **So: `ANTHILL_TEAM` is rung 2**, exported from `buildSeatLaunch` beside `BOUNTY_SESSION_KEY`,
> reusing that mechanism and that guard. **The `{team}` launch token is deleted.**

### 2.1 — The pin

**Type:** `feat:` · **Files:** modify `plugin/scripts/anthill/team-resolve.ts` (created in 2.2 — **no separate `team-pin.ts`**), `commands/team-init.ts` (fourth entry in the `planGitignore` chain `:240-252`), `plugin/scripts/anthill/migrate.ts` (a gitignore op for the pin line) · tests alongside

> **v2 specified "written at the project root, read by walk-up bounded at the project root" — a walk
> that starts at the root and cannot leave it is the identity function.** `findConfigFile` already did
> the only walk-up in the system. So: `readPin(projectRoot)` / `writePin(projectRoot, name)`, ~15
> lines, **no new module and no new test file.**

**Contract.** `.anthill/current-team` — **a fixed literal beside `config.json`, NOT under `teamDir`.**
_(v2's contract and its own test disagreed here; under v3 `teamDir` is `.anthill/teams/<name>`, and
**a file that selects between teamDirs cannot live inside one.**)_ One line, the team name, trailing
newline. Written at the resolved project root, **never `process.cwd()`** — bounty writes at raw cwd
while scoping from the nearest `.git`, so convening from a subdirectory misplaces it.

**⚠ Gitignore needs a MIGRATE op, not just an `init` entry.** A repo that upgrades and never re-runs
`init` will **commit the pin**. This is byte-for-byte the scar already written up at
`migrate.ts:159-171` about the comms line.

**Write the rationale into the module header**, citing Terraform's `.terraform/environment` and
`.git/HEAD`: **the selector lives at the same lifetime and sharing scope as the thing it selects.**
kubectl and Docker put `current-context` _inside_ their config — correctly, because those files are
per-user and never committed. **`config.json` here IS committed**, so a `currentTeam` field would
mutate a tracked file, show in `git status`, and conflict between two people on two teams. Without
this comment, the first reader who knows kubectl will "simplify" it back.

### 2.2 — `resolveTeam()`

**Type:** `feat:` · **Files:** create `plugin/scripts/anthill/team-resolve.ts` _(decided — not `config.ts`, so 2.3 knows the import path)_ · test `team-resolve.test.ts`

```ts
resolveTeam(project: ResolvedProject, opts: { team?: string; env?: NodeJS.ProcessEnv }): ResolvedConfig
```

1. `opts.team` — throw if not in `project.teams`.
2. `ANTHILL_TEAM` — throw if not in `project.teams`. _(Pending DP2.)_
3. The pin — throw if it names a team not in `project.teams`.
4. `teams.length === 1 ? teams[0] : …` — **the single-team fast path; this is what keeps criterion 1 true.**
5. **Throw a `ConfigError` listing every configured team name.**

**No fallback at any rung.** A found pin is never second-guessed — error, never retarget (kubectl's
semantics, and correct).

**Tasks:** failing tests for each rung's precedence; **two teams, nothing set → THROWS, message
contains both names** _(the test that matters most)_; unknown flag/env/pin each throw → implement →
`bun run check` → commit `feat(resolve): add the team resolution ladder`.

### 2.3 — Thread it through `requireConfig` and every command _(merged: v2's 2.3a + 2.3b + 2.4)_

**Type:** `feat:` · **Files:** `commands/team-support.ts:20-30`, plus **nine** command files' `args` blocks and call sites: `team-commit.ts`, `team-attach.ts`, `team-down.ts`, `team-join.ts`, `team-convene.ts`, `team-init.ts`, `team-spawn.ts`, `team-status.ts`, and Phase 3's `team-team.ts` · tests alongside

**Merged because v2's 2.3a alone shipped an unused parameter — a commit whose only content is dead
code — and 2.4 wrote the cross-team guard as four per-command checks, each needing the teams list that
`requireConfig` holds and then discards.** One site:

```ts
requireConfig(format, command, sel: { team?: string; channel?: string; session?: string }): ResolvedConfig
```

resolves the team, **then rejects a `channel`/`session` naming a _different_ configured team**,
pointing at `--team`. A value matching no configured team stays allowed — a legitimate escape hatch.

**⚠ `--team` must be declared on each command locally.** `cli.ts:18-19`: _"root `args` are NOT
inherited into subcommands."_ **Rung 1 does not exist until every command declares
`team: { type: "string" }`.**

**⚠ And declare it as `refused` on the five commands that must NOT take it** — `info`, `scan`,
`migrate`, `field-notes`, `feedback`. Under `strict: true` (`define.ts:295-300`) they emit a generic
_"Unknown option"_; `define.ts:41-53` documents this as the anthill#54 shape — _"a coherent thing to
try that this verb does not do"_ — and `refused` exists for it.

### 2.4 — 🔴 `team-comms.ts` — the hole both reviews found independently

**Type:** `feat:` · **Files:** `plugin/scripts/anthill/commands/team-comms.ts` — `loadTeam()` `:63-75`, `resolveChannel` `:84-88`, `--channel` on `:149, :434, :896, :962`, positional `channel` on `follow` `:681`, and the six `config.teamDirPath()` reads at `:192, :487, :705, :922, :1012, :1018` · test `commands/team-comms.test.ts`

**Why this is its own task and not an addition to the nine.** `team-comms.ts` **deliberately bypasses
`requireConfig`** — it has its own `loadTeam()` calling `loadConfig()` directly, with a docstring
explaining why. **So Phase 2 would otherwise complete green while `anthill comms read` binds to
whatever config it finds up-tree, ignoring the pin and ignoring `--team`** — the central safety
requirement failing on the command every seat runs most, where the cross-team hazard is at its worst:
reading another team's messages.

**This is the same lesson as `--team`-on-nine-commands, one file further.** v2 caught that
`requireConfig` is not one insertion point; it stopped one file short.

**⚠ Ambiguity must be a fourth identity outcome, not a throw.** A `ConfigError` from `resolveTeam`
would land in `loadTeam()`'s catch (`:67-73`) and be reported as _"could not find
`.anthill/config.json`"_ — **the wrong message for "two teams, pick one."**

### 2.5 — `anthill team show` ⇉

**Type:** `feat:` · Prints the resolved team **and which rung resolved it.** Cheap, and it is the only
surface that makes a wrong ambient binding self-evident rather than silent.

---

## Phase 3 — Commands and guards

> **Renamed from v2's `anthill use` / `anthill teams`.** Both idioms agree: the dominant external form
> is a **noun group with sub-verbs** (`docker context use`, `terraform workspace select`,
> `kubectl config use-context`), and **the in-repo precedent is `comms`** — `team-comms.ts:1081-1088`
> already ships `comms send|read|follow|positions|stand-down`. v2 paired a bare verb with a bare plural
> noun, which no surveyed tool does. **Cheap now; breaking once skill prose and emitted incantations
> ship in Phase 3.**

Each task: failing test → verify fail → implement → verify pass → lead gates → commit.

### 3.1 — `anthill team ls` ⇉

**`feat:`** · create `commands/team-team.ts` (noun group: `ls`, `use`, `show`), register in `cli.ts:66-79`.
Lists teams in config order, marks the resolved one, shows `forkedFrom`.

### 3.2 — `anthill team use <name>`

**`feat:`** · writes the pin. **Validates the name at WRITE time**, not only on read — `kubectl config
use-context bogus` fails immediately, and the whole point of the registry is that we can.
**Refuses if ANY configured team is convened**, not merely the resolved one: the presence guard at
`team-down.ts:119` is `seatPresence(config.channel, config)`, scoped to one team, so a stale
resolution would let you switch away from a live team and **strand its seats.** Test: A convened,
`team use B` → throws naming **A**.

### 3.3 — The concurrency guard

**`feat:`** · `commands/team-convene.ts` · refuses if any configured team is convened, naming it.
**⚠ The message must name THE BOARD as the reason** — `.bounty-session` is one repo-root file,
unconditionally overwritten (`team-convene.ts:62-63`), and `readBoardCounts` reads ambiently with no
`--session` (`team-support.ts:87`). Cole intends to extend bounty or absorb a first-party board, at
which point this guard is retired. **A guard whose stated reason is wrong outlives the constraint that
justified it.**

_(v2's task 3.4 — `{team}` in the launch template — is **deleted**; the env prefix in 2.2 replaces it.
See DP2.)_

### 3.5 — The skills a seat actually reads learn that teams exist

**Type:** `docs:` · **Files:** `plugin/skills/convene/SKILL.md`, `plugin/skills/comms/SKILL.md`,
`plugin/skills/join/SKILL.md`, `AGENTS.md` (`:29`) · **no test — run `cascade-check`.**
**Added 2026-08-09 from the Phase 2 review.**

**Every prose task in this plan is about CREATING or MIGRATING a team** — Phase 4 rewrites
`bootstrap/SKILL.md`, Phase 5 rewrites `upgrade/SKILL.md`, 0.4 de-literalized doc paths across eight
files. **Nothing teaches the ladder to the skills an agent reads while OPERATING one.** Verified: no
file under `plugin/skills/` mentions `anthill team show`, `ANTHILL_TEAM`, or `.anthill/current-team`.

**Why that undercuts the feature rather than merely under-documenting it.** Ambient resolution is
correct precisely when nobody thinks about it, so **its whole failure mode is silence** — 2.5's own
header says a wrong binding is otherwise "consistent, wrong results with no thread to pull."
`anthill team show` is the thread. **A diagnostic nothing points at is not a diagnostic**, and the
agent who needs it is by construction the one who does not yet know the ladder exists.

**Contract — four claims, one per file. Do not add a ladder tutorial to each; state the operating
fact and point at `team show`.**

- **`convene/SKILL.md`** — the lead convenes ONE team, and 3.3 refuses a second while one is up.
  Give the remedy in the same breath (`anthill down`, then `anthill team use <name>`), because the
  guard's message is where a lead meets this and a guard without a route reads as a wall.
- **`comms/SKILL.md`** — a seat **never names a team**; its pane carries the binding. **If messages
  look like another team's, that is `anthill team show`**, not a `--channel` guess — the cross-team
  `--channel` guard (2.4) exists because guessing is the reflex it interrupts.
- **`join/SKILL.md`** — the seat doc a seat grounds in belongs to the resolved team, so a wrong
  binding looks exactly like an amnesiac seat.
- **`AGENTS.md:29`** — reads _"the anthill team lives in `.anthill/`"_. True for one team and for the
  incumbent under a `teams` map; **false for every other team**, which lives at
  `.anthill/teams/<name>/`. One clause, not a rewrite.

**⚠ Prose, not tooling — and it is a `docs:` commit, so release-please hides it.** That is correct
(nothing user-facing changes) and it is also why this task is easy to skip. It is scheduled here,
before Phase 4, so the concept lands before `bootstrap` starts routing people to it.

### 3.6 — Both Phase-3 defects were found by hand and left unguarded

**Type:** `fix:` (guard 1) + `test:` (guard 2) · **Files:** `plugin/scripts/anthill/team-resolve.ts`,
`commands/team-team.ts` (`ls`'s catch), `commands/team-support.liveteams.test.ts` ·
**Added 2026-08-09 from the Phase 3 review.**

**The two 🕳 entries above are the same story twice: unit tests were green, an end-to-end run found
the defect, the fix landed — and nothing now holds either fix in place.** Both were _"a command that
helps you resolve ambiguity must not require ambiguity to be already resolved"_, and both can
silently come back.

**Guard 1 — `ls` tells ambiguity from a typo by REGEXING A PROSE MESSAGE.** `team-team.ts`:

```ts
if (!(err instanceof ConfigError) || !/nothing selected one/.test(err.message)) { …exit(1) }
```

**Measured, not argued:** reword rung 5's message from `and nothing selected one:` to
`and none was selected:` and **the whole suite stays green at 0 fail** while `anthill team ls` starts
erroring on a two-team repo with no pin — the exact regression the record above says was measured and
fixed. A user-facing sentence is the most likely thing in this file to be polished, and polishing it
breaks a control-flow branch three files away.

**Fix: make the rung-5 case a TYPE.** Export `AmbiguousTeamError extends ConfigError` from
`team-resolve.ts`, throw it at rung 5 only, and have `ls` catch `err instanceof AmbiguousTeamError`.
The message stays free to change; `ConfigError` is already a class, so this is the existing idiom and
not a new mechanism. **This codebase does not infer verdicts from strings** — `team-support.ts:181-196`
and `agent-layer.ts:25-33` are the same rule stated about fields.

**Guard 2 — `liveTeams` has NO test, and it is the function the `team use` fix lives in.**
`team-support.liveteams.test.ts` covers `describeLiveTeam`, the pure formatter — not `liveTeams`,
where _"no session-open record is a positive observation of never-convened"_ was added. Delete that
early-`continue` and every fresh two-team project refuses both teams again, with the gate green.

**Fix: two tests in the existing file.** `mkdtempSync(tmpdir())` + `afterAll(rmSync)` per the
Execution-model conventions, and **register the file in `tmpleak.guard.test.ts`'s `ALLOWED` map** if
the mint is module-level — it is currently listed nowhere because it touches no filesystem yet.

- **A two-team project with no session-open record → `liveTeams` returns `[]`.** _This is the
  measured bug; name it in the test title so a future reader knows the empty array is the point._
- **A team WITH a session-open record and an `unknown` presence → still counted live.** The
  asymmetry (`unknown` blocks) is deliberate and must not be "simplified" away by someone who reads
  the first test as "absence means idle".

**Tasks:** guard 1's mutation check first — reword the message, confirm `bun test` still passes _and_
`team ls` breaks, then implement and confirm the reword no longer breaks it → guard 2's two tests,
each verified failing against a locally-reverted `liveTeams` → `bun run check` → **two commits**, a
`fix:` and a `test:`, because release-please shows one and hides the other.

---

## Phase 4 — bootstrap `--add-team`

**`feat:`** · `plugin/skills/bootstrap/SKILL.md:26-28` — the refusal becomes a route. It is **prose
policy, not tooling** (`anthill init` is already file-level idempotent), plus the config-writing path
and the incumbent's explicit `paths.teamDir` from 1.1. Run `cascade-check`.

### 4.2 — `init` is a PROJECT-level renderer, so a pin must not narrow it

**Type:** `fix:` · **Files:** `commands/team-init.ts` (`teamsToRender`, `InitData.teamDir`),
`plugin/skills/bootstrap/SKILL.md` (§0a's _"No `--team` here, deliberately"_ paragraph and its
verification step) · test `commands/team-init.multiteam.test.ts` · **Added 2026-08-09 from the
Phase 4 review.**

**4.1 fixed the ambiguity refusal and left the pin in place — so the route works exactly once.**
`teamsToRender` treats **any** successful resolution as a narrowing, and a pin is a successful
resolution. §0a's own justification says _"there is no pin yet"_, which is true for the flat→two-team
conversion it was written against and **false for every later use of the same route**: a repo that has
run `anthill team use` has a pin forever after.

**Measured on a three-team repo pinned to `lean`, adding `research`:**

```
$ anthill init
ok: true   teams: [lean]   written: []   skipped: [7 lean files]
           gitignore: .anthill/teams/research/scratch/  -> added
                      .anthill/teams/research/comms     -> added
$ ls .anthill/teams/          → lean          # research's docs were never written
$ anthill team ls             → research listed, teamDir .anthill/teams/research
```

**The success envelope is convincing precisely because the run did do work** — `research` got its
gitignore lines. It ends with a team that the config knows, `ls` lists, `.gitignore` covers, and
**that has no living docs at all**. `anthill team use research` then `convene` hands its seats an
empty footprint — the one outcome the DEV_KICKOFF invariant forbids, arrived at through the
documented route with `ok: true` at every step.

**⚠ The two halves of this one command already disagree, and 4.1 is where they split.** The same
commit made the gitignore half project-wide, reasoning that _"the ignore file is project-level, and a
repo pinned to `dev` that leaves `lean`'s comms log trackable is the same committed-log bug one team
over."_ **That argument is about `init`, not about gitignore** — it applies unchanged to the template
half, which was left pinned. The probe above is that split, printed.

**Contract:**

- **Only an explicit `--team` narrows.** The pin and `ANTHILL_TEAM` answer _"which team am I
  operating AS"_; `init` does not operate as a team — it renders the project's footprint, never
  clobbers, and is a no-op on what already exists. Rung 1 is a deliberate act on this invocation;
  rungs 2–4 are ambient state about something else.
- **A bad `--team` still hard-errors.** Unchanged from 4.1 — it names a team that does not exist.
- **`InitData.teamDir` goes**, or stops being top-level. It currently means _"the first rendered team,
  in config order"_ — a total field carrying a partial answer, which is the exact shape `soleTeam` was
  refused for in 1.1. `teams[]` already says it completely; on a single-team project the two are
  identical, so `teamDir` is redundant where it is right and misleading where it is not.
- **§0a's prose loses _"there is no pin yet"_ as its reason** — the reason is that `init` is
  project-level — **and its verification step must be able to fail.** _"Read `team ls`'s output"_
  passes in the probe above, because `ls` reads the config, not the disk. Replace it with a check that
  looks at what was rendered: `anthill init` reporting a `written`/`skipped` entry for **every** row
  `team ls` shows.

**Tasks:** a failing CLI test — three teams, pin set, a new team added → `init` renders the new team's
docs — **verified RED against the current file** → implement → assert 4.1's no-pin case and the
single-team byte-identical case both still pass → `bun run check` → `cascade-check` for the prose →
commit `fix(init): render every configured team unless --team narrows it`.

---

## Phase 5 — `upgrade` refuses on a multi-team config

**`fix:`** · `plugin/scripts/anthill/commands/team-migrate.ts` (**`scanRepo` at `:65-81`**),
`plugin/skills/upgrade/SKILL.md` (`:76-77`, `:195-199`, `:242-257`, `:262`, `:280`) · test `migrate.test.ts`

> **v2 offered "handles N teams **or** refuses" as two options. Decided: refuse.** `MIGRATIONS` holds
> exactly one entry (v1→v2) which cannot apply to a v3 config anyway, and **`MigrationOp`
> (`migrate.ts:31-42`) has no op that can restructure config content** — `config-drop-paths` only
> deletes a key. So the code half is a guard, not a migrator.

**⚠ The concrete break, unnamed in v2:** `scanRepo` reads `raw.paths.teamDir` **from the top level
only**. Under v3 that key lives at `teams.<name>.paths.teamDir`, so `pathsExplicit` silently becomes
`false` and `teamDir` falls back to `ANTHILL_DIR` — **a silent wrong answer in the one command whose
failure the proposal calls a data-integrity bug.**

**Contract:** if the raw config has a `teams` key, `team-migrate` **refuses by name before building a
`RepoScan`.**

---

## Phase 6 — Attribution

### 6.1 — `Anthill-Team` trailer

**`feat:`** · `commands/team-commit.ts` (`stampSeat` `:69-73`, call site `:318`) · mirror
`Anthill-Seat` exactly so `git log --grep "Anthill-Team: <name>"` answers "which shape produced this?"

### 6.2 — Retro + reconciliation stamps

**`feat:`** · `plugin/skills/finalize-session/SKILL.md`, `plugin/templates/docs-team/retro.md` ·
stamp the team name and a **SHA-256, first 8 hex chars, of the canonical JSON of that team's own
config entry** — not the whole map, which churns when an unrelated team is edited. **State the
algorithm in the skill** so a reader can reproduce it.

**⚠ Known limit, stated in the artifact:** this makes a session **labelled**, not **comparable**.
Proposal Open Question 3 is unanswered and this phase does not answer it.

---

## Implementation record — where the build diverged from this plan

**Append an entry whenever the shipped work differs from what a task specifies** — whether the plan
had a gap, was wrong, or the code suggested something better on contact. Two reasons this is not
bookkeeping: a plan that silently absorbs its corrections **reads as though it was right the first
time**, which is the state that produced v1's 1-PASS/11-FAIL; and a later reader following an
un-annotated task will re-derive the same divergence, or worse, "restore" the plan's version.

**Each entry names the class** — 🕳 **gap** (the plan omitted or mis-stated something), 🔧
**improvement** (the plan was executable, the code suggested better), ⚖ **judgement** (a fork the
plan left open). **A gap is the load-bearing kind**: it says the review passes missed something, and
that is worth knowing before trusting the tasks that have not been built yet.

### Phase 0

**0.1 — 🔧 the three sites were eliminated, not remapped.** The task named three
`join(teamDir, relPath)` sites in `team-init.ts` and said all three move together, because remapping
the write while leaving the `exists` predicate overwrites a live seat doc. **Shipped instead:**
`renderTemplates` takes a `dest(relPath)` and reports **destinations** in both `writes` and
`skipped`, so `init` asks its idempotency predicate and its write the same question **by
construction**. `templateDestination()` is the one pure mapping, unit-tested against the legacy
`join` for byte-identity under the defaults. _Why: the plan's version leaves the hazard live for the
next editor of that file, and the whole reason it was called out is that it already bit once._
Cost: `renderTemplates`' signature and its existing test assertions changed (`relPath` → `path`).

**0.3 — 🕳 the cascade was four prose claims, not one.** The task named
`upgrade/SKILL.md:202-204` as the sentence the template falsifies. **Three more said the same thing:**
`convene` (_"`init` does not render one, it is written at finalize"_), `finalize-session`
(_"`.anthill/retro.md` does not exist yet at this step"_), and `bootstrap`'s enumeration of what
`init` renders, which listed neither `retro.md` nor `paper-cuts.md`. All four moved in the commit.
_Found by running `cascade-check`'s "added a new doc to the team footprint" row, not by the grep the
task specified._

**0.4 — 🕳 the stated validation criterion is wrong, and following it literally causes damage.**
The task says validation is _"the grep returns only `config.json` hits"_, excluding only the ~45
`.anthill/config.json` mentions. **Measured: all 15 of `bootstrap`'s hits are the footprint ROOT** —
the directory `config.json` lives in, fixed by `CONFIG_DIR`, not derived from any team's `teamDir` —
and `join` carries a measured scar that cites this repo's actual `.anthill/` as evidence. Rewriting
those to `<teamDir>/…` would point prose at a directory that does not exist.
**The real exclusion list is `config.json` AND the footprint root.** After the commit the residue is
four legend lines that write `.anthill/dev/` while explicitly labelling it the default.
_Also decided here (⚖): citations use `<teamDir>/…` tokens at the point of use, not a per-file legend
alone — skill prose is arrived at by grep, mid-file, where a legend 200 lines up is not read._

**0.5 — 🕳 the migration guide never mentioned the comms line at all, and its checklist is where
this bug was catchable.** The task named `migrate.ts` and `migrate.test.ts`. But
`skills/upgrade/migrations/v1-to-v2.md` documents what the v1→v2 migration does — a before/after
table and a verification checklist — and the comms op was **absent from both**, which is a
pre-existing omission the task inherited. Added: the table row, a checklist item asserting the
slashless form **and** the absence of the slashed one, and a sharpening of the existing
_"`anthill init` is a clean no-op"_ item to say **including `.gitignore`** — because a gitignore line
reported `added` immediately after a migration is exactly the signal that the two emitters disagree.
_That checklist item, in its old form, was one clause away from catching this._
**Also measured rather than reasoned:** the two-line end state was reproduced on a real v1 repo at
the pre-fix sha (`.anthill/comms/` and `.anthill/comms`, both present after `migrate` then `init`)
and confirmed gone after. **And the gate caught what `bun test` did not** — narrowing `plan.ops.find`
returns the `MigrationOp` union, so the new assertions passed under `bun test` while `tsc` failed.

**0.2 — ⚖ `gitignoreLines(teamDirs[])` takes the list now, with one team in it.** The task's contract
said "per configured team" while Phase 1 is what creates a second team. Shipped as an array
parameter called with `[config.paths.teamDir]`, so Phase 1 changes a call site rather than a
signature. The comms segment comes from `COMMS_DIR`, the constant `commsLogPath()` builds with.

### Phase 1

**1.1 + 1.2 — ⚖ landed as ONE commit**, on the plan's own merge rationale (0.1): 1.2 is three checks
_inside_ the function 1.1 adds, so shipping 1.1 alone puts a `resolveProject` on `develop` that
accepts a two-team config it is about to start rejecting.

**1.1 — ⚖ `ResolvedConfig` gains a `name`, and `resolveConfig` an optional `ctx.name`.** The plan
specified `team(name)` mirroring `seat(handle)` but never said where the name lives, and
`ResolvedConfig` had no field for it. The alternative — `teams: Array<{name, config}>` — pushes
unwrapping onto every consumer, and **Phase 6.1's `Anthill-Team` trailer needs the name from the
resolved team anyway**. `resolveConfig`'s _signature_ is unchanged as the plan requires (the new ctx
key is optional, defaulting to `default`). `forkedFrom`/`forkedAt` are carried on the same field for
3.1.

**1.1 — 🕳 the plan never said which keys are project-level vs team-level.** It listed the entry
shape (`lead, seats, channel?, paths?, gate?, grounding?, forkedFrom?, forkedAt?`) but not what
happens to a top-level `version`, `launch`, `grounding` or `gate` beside a `teams` map — and a
`version` per team is incoherent, since it describes the footprint layout the whole repo shares.
**Decided: `version`/`launch`/`grounding`/`gate` cascade in as defaults, an entry overrides what it
names.** `channel`/`seats`/`lead`/`paths` are team-level, and **a `teams` map beside any of them at
the top level throws**, naming both — that state is a half-finished conversion, and ignoring the
strays would make the incumbent team silently vanish, which is the one outcome this project forbids.

**1.1 — 🕳 spec §5 is a live contract that code cites by number, and the plan's file lists never
mention it.** `config.ts`'s header says _"Schema: spec §5"_, and §0 of the design doc says §5–§8 "are
kept current, because a stale contract misleads more than it records". Added **§5a** documenting the
`teams` map, the structural detection and no-version-stamp rationale, the cascade rules, and all
three cross-team constraints. **Every remaining phase that touches the schema has the same
unlisted dependency.**

**1.3 — 🔧 the collision check compares RESOLVED absolute paths, and case B is worse than the task
states.** The task said to compare resolved rather than raw values; implemented via
`teamDirPath()`/`seatDirPath()`/`seamsPath()`, so `resolve()` also normalizes `.anthill/` and
`.anthill` to one answer — a third spelling of the same collision, which a string compare of the
configured values would miss. **And measured on case B before the fix: `..` does not collide with the
other configured team at all** (`..` → `.anthill/dev/seams.md`, `dev` → `.anthill/teams/dev/dev/seams.md`),
so it squats the DEFAULT single-team location rather than a peer's. The equality check could never
have caught it, exactly as the task predicted — the two guards are independent, not belt-and-braces.

### Phase 2

**2.1 + 2.2 — ⚖ one commit.** 2.1's own text says the pin lives in `team-resolve.ts`, "created in
2.2", so 2.1 cannot land first. Shipping them together also means `develop` never holds a state where
the pin file exists and its `.gitignore` line does not.

**2.2 — 🔧 `resolveTeam` returns `{ team, via }`, and stays PURE.** Two departures from the stated
signature, both for the same reason the plan praises elsewhere:

- **The rung is returned, not attached to the config.** 2.5 needs to print _which rung resolved it_.
  Fusing a `via` field onto `ResolvedConfig` would put "how this was selected" on the object that
  answers "what is configured" — and the local idiom is a small result object carrying a fact plus
  its provenance (`BoardSummary {counts, title}`, `GitignorePlan {action, content}`). Costs one
  `.team` at the single call site in 2.3.
- **The pin arrives as `sel.pin`, read by the caller.** The stated signature is
  `{team?, env?}` with rung 3 reading the file itself — which would make the ladder impure and its
  rungs untestable in isolation. This is exactly `config.ts`'s split: `resolveTeam` is pure,
  `readPin`/`writePin` are the filesystem half.

**2.2 — ⚖ an empty `ANTHILL_TEAM` or a blank pin file reads as UNSET, not as a team named `""`.** An
exported-but-empty env var is the shell's normal way of saying "not set", and a blank pin is what a
half-written file looks like. Neither is a name, and treating them as one would throw on a project
that is otherwise fine. **Not a fallback** — nothing is being second-guessed; the rung simply did not
fire.

**2.3 — 🕳 `refused` DECLARES a refusal; it does not enforce one.** The task says to "declare it as
`refused`" on the five commands that must not take `--team`, and `define.ts`'s own docs say why that
is not sufficient: a refused arg is registered with the parser (so it never reads as _"Unknown
option"_) and hidden from the advertised set, **but the value still reaches `ctx.args` and the
command must refuse it through its own envelope** — otherwise `--team` on `migrate` is silently
ignored and the user believes they scoped something. Added `refuseArg` in `agent-layer.ts` and one
`REFUSED_TEAM` constant per command, used by **both** the arg def and the refusal, since two copies
of a reason drift. _(Six commands, not five: `info` is two — `info` and `info env`.)_

**2.3 — 🕳 the env rung needs the team COUNT, which nothing in the plan provides.** `ANTHILL_TEAM`
must be exported for a multi-team project and **not** for a single-team one — a lone-team repo
gaining an `ANTHILL_TEAM=` in every pane launch line is a visible change to a repo that configured
nothing, which is criterion 1. `requireConfig` returns one team by design, so `requireTeam` sits
beside it returning `{project, team, via}`. Phase 2.5 and 3.1–3.3 need it too.

**2.4 — 🔧 the cross-team `--channel` guard had to reach comms as well.** The task scoped 2.4 to the
ladder (`loadTeam`, `resolveChannel`, the six `teamDirPath()` reads). But 2.3's guard lives in
`requireConfig`, which this file bypasses — and `--channel` here is the sharpest form of the hazard,
since the flag names a wire directly. Reused the exported `rejectOtherTeam` rather than restating
the rule.

**2.5 — ⚖ `team show` reports `configured[]` as well as the resolved team.** One extra field, and it
makes _"did it pick the right one"_ answerable from the same output as _"which one did it pick"_.

### Phase 3

**3.1/3.2 — 🕳 both verbs were unusable on the exact repo they exist for, and only an end-to-end run
showed it.** Unit tests were green. Two separate defects, both of the same shape — _a command that
helps you resolve ambiguity must not require ambiguity to be already resolved_:

- **`team ls` refused to list.** It went through `requireTeam`, so on a two-team repo with no pin it
  answered _"which teams exist?"_ with _"pick one of the teams I will not name."_ It now takes the
  project, resolves **softly**, and marks no row when nothing resolves — while still erroring on a
  bad `--team` or a stale pin, which is a typo to report rather than an absence to render.
- **`team use` refused on every fresh project.** `seatPresence` answers `unknown` for a team with no
  session-open record — correct, since it cannot scope departures without one — and `liveTeams`
  counts `unknown` as live. Applied to a team that has simply **never been convened**, that read a
  brand-new two-team config as _both teams live_ and refused the pin. `down` never hit this because
  it runs only after confirming the tmux session exists; there is no such precondition here, so
  `liveTeams` now states it: **no session-open record is a positive observation of "never convened"**,
  checked before presence is consulted. The `unknown`-is-live asymmetry is kept for teams that HAVE
  been convened, where it is the right direction.

**3.2/3.3 — 🔧 `liveTeams` + `describeLiveTeam` are shared by both guards.** The plan specifies the
across-teams presence check twice, once per task. One implementation, and `describeLiveTeam` keeps
"seats present: forager" distinguishable from "could not confirm it is idle" — a reader who cannot
tell those apart cannot tell whether `--force` is safe.

**3.3 — ⚖ `convene` gained `--force`.** The guard needs an override for the same reason `down` has
one: `unknown` blocks, and a stale record must not be able to lock a repo out of convening. The
refusal names it.

**3.5 — 🕳 the four files were four PROSE bodies; the checklists are separate and were missed.** The
task names `convene`, `comms`, `join` and `AGENTS.md:29`, and the edits went into each file's body.
`cascade-check`'s "changed a rule in a skill" row has a recorded scar for exactly this — _"prose and
checklist drift apart, and the checklist is the part that gets read"_ — and it fired: neither
`convene`'s nor `join`'s checklist mentioned the binding. Both now carry one line. **The task's file
list was right and its granularity was wrong**, which is the same defect the map recorded in
triplicate when `principles.md` was added.

**3.6 — the mutation check the task specified WORKED, and it is worth stating what it proved.**
Rewording rung 5's sentence to _"and none was selected:"_ left the suite at **638 tests, 0 fail**
while `anthill team ls` began refusing to list a two-team repo. So the regression the record above
calls "measured and fixed" was, at that moment, fixed and completely unguarded. **The reworded
message is kept in the shipped code** — it is the proof the coupling is gone. Guard 2's three tests
were each verified RED against a reverted `liveTeams` (3 fail / 2 pass, so the mutation reaches all
three and the formatter tests correctly do not move).

**3.6 — ⚖ the type distinction is tested in BOTH directions.** `AmbiguousTeamError` alone would let
someone widen it to every ladder failure and quietly turn `ls` into a command that renders a list
instead of naming a bad `--team`. The second test asserts a bad flag / env / pin throws `ConfigError`
and **not** `AmbiguousTeamError`.

### Phase 4

**4.1 — 🕳 "prose policy, not tooling" was wrong, and the route's own verification is what proved
it.** The task rests on `anthill init` being _"already file-level idempotent"_. It is — and it never
got the chance: `init` routes through `requireConfig` (wired in 2.3), so on the freshly-converted
two-team repo §0a produces, with no pin yet, it exits 1:

> _this project configures 2 teams and none was selected: dev, lean._

**The new team's docs could not be rendered by following the route as written.** `init` now resolves
**softly** — a selector still narrows (`--team lean` renders only lean), and absence of one means
**ALL configured teams** rather than a refusal. Safe precisely because of the property the task
leaned on: the renderer never clobbers, so rendering a team that is already there is a no-op, and
rendering all of them is that no-op N times. A bad `--team` or a stale pin still hard-errors —
those name a team that does not exist, which is a typo to report, not an absence to fill.

**This is the same defect a THIRD time** (`team ls`, `team use`, now `init`) — _a command that helps
you resolve ambiguity must not require ambiguity to be already resolved_ — and a third time it was
invisible to unit tests and visible immediately on an end-to-end run. The pure half
(`renderTemplates`, `templateDestination`) was green throughout: **the render was never wrong, it
never happened.** New `team-init.multiteam.test.ts` pins it at the CLI level, which is the only level
that can see it; verified RED against the pre-fix file (4 fail / 1 pass — the pass is the bad-`--team`
case, whose behavior is unchanged by design).

**4.1 — 🔧 the gitignore lines now cover EVERY configured team, not the resolved one.**
`gitignoreLines`' own doc comment already said "for every configured team's `teamDir`" (written in
0.2) while the call site passed `[config.paths.teamDir]`. Under a pin that means a repo on `dev`
leaves `lean`'s comms log trackable — the identical committed-log bug those lines exist to prevent,
one team over. The ignore file is project-level; so is the set it derives from now. Byte-identical on
a single-team project, where the two are the same list.

**0.3 (late) — 🕳 the cascade was FIVE claims, not four.** Found while writing §5a: **spec §6's
template table** lists what `init` renders and had never gained `principles.md` (added 2026-08-01,
by someone else) — so `retro.md` would have been the second omission in the same table. Both rows
added, plus a correction to its closing line, which still said `init` adds _"the `.anthill/scratch/`
gitignore line"_ (singular, literal). **A table nothing regenerates goes stale silently, and this one
had already been stale for eight days before this project touched it.**

---

## Filed separately — deliberately NOT in this plan

Each is independently landable and inflating this plan with them would put real work behind a queue
it does not depend on.

- **The bootstrap fail-open fix** — a non-software repo scans to `workspace === null`, the
  single-surface branch fires unconditionally, and the project is handed `layered-app` verbatim.
  **Wrong today with one team.** Its own `fix:` branch.
- **Bare `anthill` in emitted strings** (`team-comms.ts:334,739,755`, `team-spawn.ts:290-291`) →
  `bun ${cliPath}`. Wrong today; a 4-site edit. **This is also the only real fix for the
  older-cached-CLI problem** that 1.1's cut rationale mistakenly claimed a version check would solve.
- ~~**`migrate`'s trailing-slash comms line**~~ — **MOVED IN as [task 0.5](#05--reconcile-migrates-comms-ignore-line-with-the-one-02-now-emits), 2026-08-09.** It was filed
  here as pre-existing debt this project did not touch. **0.2 touched it** — `team-init` now emits the
  slashless derived line while `migrate` still emits the slashed literal, so the two disagree more
  than they did before Phase 0, and a migrated repo ends up carrying both. **The filing premise died;
  the filing had to.**
- **The acceptance experiment** (manager/implementer/reviewer; count the skill instructions those
  seats cannot execute) → **an investigation doc**, not a phase. It has no gate, no commit and no
  test, and last-in-a-plan is where it gets skipped. It still decides whether externalization is a
  precondition for variants — it just isn't implementation work.

---

## Key Risks & Mitigations

| risk                                                           | mitigation                                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Phase 0 regresses existing teams**                           | Back-compat assertion in every task; this repo verified safe (no `paths` block). |
| **`init` overwrites a live seat doc**                          | All three sites named; skipped-on-re-run test mandatory.                         |
| **A resolution path returns instead of throwing**              | Every rung test asserts a throw; no fallback implemented anywhere.               |
| **The pin gets committed by a repo that never re-runs `init`** | A migrate op, not just an init entry (2.1) — the `migrate.ts:159-171` scar.      |
| **A subagent reports unverified success**                      | The lead runs `bun run check` before every commit.                               |
| **A skill argues with a template**                             | `cascade-check` after every prose edit; `bun run check` cannot see this class.   |

## Open Questions

1. **DP2 — the env rung.** Re-opened above; needs Cole.
2. **Cascade for `principles.md` / `paper-cuts.md`** (project-level vs team-level) — not in this plan;
   needs its own design pass.
3. **Does `.anthill/teams/<name>/dev/` fight `non-dev-seats`?** That proposal gives the research tier
   its own directory and calls it cross-project. 0.1's derivation defuses the blocker; the
   cross-project claim still needs reconciling.

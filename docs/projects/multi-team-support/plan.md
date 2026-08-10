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

### 5.1 — The refusal asserts a fact that expires, and names no retirement condition

**Type:** `fix:` · **Files:** `commands/team-migrate.ts` (`multiTeamRefusal`, and the call site at
`:250` which must pass the version) · test `commands/team-migrate.test.ts` · **Added 2026-08-09 from
the Phase 5 review.**

The shipped refusal says, unconditionally:

> **There is nothing here to migrate:** the `teams` map is a config SHAPE, not a footprint layout —
> nothing moved on disk when it was adopted, so `version` stays 2.

**That is true today only because `MIGRATIONS` holds one obsolete entry** (`migrate.ts:224`, v1→v2).
The guard fires **before the version is ever read**, so the claim is not derived from anything — it is
asserted. The moment a v2→v3 layout migration is added — **which this plan explicitly anticipates**,
and which the implementation record says is when the underlying defect "arms itself" — every
multi-team repo gets a blanket refusal stating there is nothing to migrate, **in the one state where
that sentence is false and the human most needs the truth**: this repo has a pending layout migration
that this command cannot perform.

**This is the rule this plan already wrote for another guard, applied here.** Task 3.3: _"a guard
whose stated reason is wrong outlives the constraint that justified it, because nobody can tell when
it stopped applying."_ The convene guard names the board and says when to delete it. **This one names
a consequence with an expiry date and no expiry note** — and refusing is the safe direction, so
nothing will fail loudly when it goes stale.

**Contract — two states, keyed on what is actually pending.** The version is one line, the same one
`scanRepo` uses (`:114`): `typeof raw.version === "number" ? raw.version : 1`. Read it in the guard
and pass it to `pendingMigrations` — already imported in this file (`:18`).

- **`pendingMigrations(version).length === 0`** → today's message, unchanged. The claim is now
  _derived_ rather than asserted, which is the whole point.
- **Non-empty** → a DIFFERENT refusal: this repo has a pending footprint migration (name the
  from→to), `migrate` cannot run it against a `teams` config because it reads `paths.teamDir` from the
  top level only, and **stop — do not hand-edit the config to get past it.** Do not route this one to
  the living-doc reconcile; that is the right answer for "nothing pending" and the wrong one here.
- **A comment on the second branch addressed to whoever adds that migration:** this branch going live
  is the signal that the blanket refusal has to become per-team-aware, not that the message needs
  rewording.

**⚠ Do not "simplify" this back into one message.** Both branches refuse and exit 1, so the two look
redundant from the outside. The difference is the only thing a reader can act on: one says _go do the
reconcile_, the other says _stop, this needs work that does not exist yet_.

**Also, one line while in here:** the refusal is the **only** emitted runtime string in
`plugin/scripts/anthill/` carrying markdown `**bold**` — verified by grep across every `ConfigError`
and `error:` string. Under `--format text` it prints the asterisks literally to a terminal. Drop the
markers; the surrounding sentences already carry the emphasis.

**Tasks:** two failing tests — a v2 `teams` config → the "nothing pending" refusal; a **v1** `teams`
config (v1→v2 is pending) → the "pending migration" refusal, asserting it does **not** mention the
reconcile → implement → assert the single-team paths are untouched → `bun run check` → commit
`fix(migrate): derive the multi-team refusal from what is actually pending`.

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

### 6.3 — 🔴 `appendTrailer` destroys the trailers on a one-line conventional commit

**Type:** `fix:` · **Files:** `commands/team-commit.ts` (`appendTrailer`, `TRAILER_LINE`) · test
`commands/team-commit.test.ts` · **Added 2026-08-10 from the Phase 6 review. This is a live
regression on single-team repos, not a multi-team-only defect.**

**6.1's fix made the common case worse than the defect it fixed.** `appendTrailer` decides its
separator by testing the body's LAST LINE against `TRAILER_LINE`
(`/^[A-Za-z][A-Za-z0-9-]*: .+$/`) — and **a conventional-commit subject matches that pattern
exactly.** `feat: a thing` is `<token>: <text>`. So on a one-line message the stamp is joined with a
single `\n`, no blank line is ever created, the whole message stays one paragraph, and git sees **no
trailer block at all.**

**Measured, `anthill commit --as boss --team lean -m "feat: a thing"` on a real repo:**

```
$ git log -1 --format=%B          $ git log -1 --format=%B | git interpret-trailers --parse
feat: a thing                     (nothing)
Anthill-Seat: boss                ↑ BOTH stamps invisible to git
Anthill-Team: lean
```

Verified against the two neighbouring shapes, which are both fine — `feat: another` **with a body
paragraph** parses correctly, and `add a thing` (no colon) parses correctly. **The defect is exactly
the one-line conventional commit**, which is this repo's mandated commit convention
(`AGENTS.md:44-53`) and the dominant shape a seat produces.

**⚠ Severity: this breaks `Anthill-Seat` on EVERY anthill consumer, single-team included.**
`stampSeat` goes through the same function, and the team stamp is not involved. Before 6.1 the
separator was an unconditional `\n\n` and this case was correct — so Phase 6 regressed seat
attribution, which has shipped and been in use, in order to fix a two-trailer case that had not.

**Why the tests are green at 666 pass:** every fixture in `team-commit.test.ts` uses `"subject"` or
`"subject line"` — **no colon.** Including the `git interpret-trailers` test at `:1028`, which asks
git the right question about the one shape that was never going to fail. **This is 6.1's own lesson
recurring one level up:** it noted that `git log --grep` survives a broken trailer block, so the
documented query keeps working while trailer-aware consumers lose the data. The same is true here,
which is why nothing caught it.

**Contract — decide from the PARAGRAPH, the way git does, not from one line.**

Git's rule: the trailer block is the **last paragraph**, it must consist of trailer lines, and **it
must not be the first paragraph** — a subject line alone can never hold trailers, which is precisely
the case above.

```ts
// Split into paragraphs; the last one is a trailer block only if it is NOT the
// first (the subject) and every line in it is a trailer.
const lines = body.split("\n");
const lastBlank = lines.findLastIndex((l) => l.trim() === "");
const para = lines.slice(lastBlank + 1).filter((l) => l.trim() !== "");
const joinsBlock =
  lastBlank !== -1 &&
  para.length > 0 &&
  para.every((l) => TRAILER_LINE.test(l.trim()));
return `${body}${joinsBlock ? "\n" : "\n\n"}${trailer}`;
```

**`lastBlank !== -1` is the fix** — no blank line anywhere means the body is a bare subject, so a
trailer must open a new paragraph however much that subject looks like a trailer. Keep `TRAILER_LINE`
as it is; it was never the wrong regex, it was asked the wrong question.

**Tasks:** a failing test **at the CLI level, asserting through `git interpret-trailers --parse`**,
for `-m "feat: a thing"` with `--as` on a **single-team** repo (seat only) and on a multi-team repo
(seat + team) → verify RED → implement → assert every existing `stampSeat`/`stampTeam` case still
passes, and **add a colon to the subject in the existing fixtures** so the suite stops testing only
the shape that cannot fail → `bun run check` → commit
`fix(commit): a conventional subject is not a trailer block`.

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

**4.2 — built as specified; three notes on what the build added.**

- **🔧 the coverage test takes its expected set from `team ls`, not from `init`'s own output.** The
  contract says _"a `written`/`skipped` entry for every row `team ls` shows"_ and the first draft
  checked `init.data.teams` instead — which **the bug satisfies perfectly**, reporting one team and
  rendering that one team. Written that way it passed against the unfixed file. `ls` reads the
  CONFIG; `init.data.teams` reports what it chose. **A coverage check whose expected set comes from
  the thing under test measures nothing**, and the tell was that it went green while the other two
  went red. Asserted on the SECOND run as well, where everything lands in `skipped` — the run
  reporting no writes is the one whose emptiness reads as fine.
- **⚖ rung 1 is reached through `resolveTeam`, not through `project.team(name)`.** One line shorter
  the other way, and it would fork the _"not configured"_ message into a second copy that drifts. The
  ladder keeps owning it; `init` just declines to consult rungs 2–4.
- **⚖ criterion 1 is now asserted at the CLI, not reasoned about.** _"Render every team"_ and
  _"render the sole team"_ are the same sentence when there is one team — true, and the claim the
  whole project rests on, so a flat-config run pins it: one team named `default` at `.anthill/`, no
  `.anthill/teams/` directory, and the exact pre-multi-team gitignore file byte for byte.

**4.2 — ⚖ what rule 7 caught that the phase-4 verification did not.** 4.1's end-to-end run was the
flat→two-team conversion §0a is written against, and it passed. **The pin only exists on the SECOND
use of the route**, which the documentation does not describe as a separate state — so the fixture
has to be built past the documented one: convert, then `team use`, then add a third team. That is the
gap rule 7 closes and the reason it says _"in the state its documentation describes"_ rather than
_"in the state the task describes"_.

### Phase 5

**5 — 🕳 the break is REAL but LATENT, and the plan states it as live.** The task calls `scanRepo`'s
top-level-only `paths.teamDir` read _"a silent wrong answer"_ in the present tense. Run against a
real multi-team repo today, `migrate` answers `ok: true, notes: ["already at v2"]` — the wrong answer
never fires, because `pendingMigrations(2)` is empty and the command returns before the scan is used.
**Reproducing it took a v1 config carrying a `teams` map**, which anthill itself cannot produce:

```
living docs: docs/team/* → .anthill/* (0 entries)
stamped version → 2
```

Seven ops applied, `ok: true`, the team's living docs still at `docs/crew/`, and the config now
claiming v2 with **no `paths`** — so every command resolves to an empty `.anthill/`. **The invariant
this project is built on, produced with a success envelope.** The guard ships as specified; what
changed is the honest framing: this is a **latent** defect that arms itself the moment
`CURRENT_VERSION` moves, at which point every multi-team repo has a pending migration and hits it.
Recorded because "measured as live" and "measured as latent" are different claims, and the second one
is the one a reader can act on.

**5 — ⚖ the refusal covers `--dry-run` too.** The contract says refuse before building a `RepoScan`,
which naturally covers both, but it is worth stating why the dry run must not be exempted as
"harmless": the pre-guard preview printed the same seven-op plan and called it a migration. A reader
who trusts it runs the real thing. **A preview that lies is the mechanism, not a lesser version of
it.**

**5 — 🕳 the `already at v2` answer was the live defect all along, and no task named it.** Every real
multi-team repo today gets `ok: true` and _"already at v2 — nothing to migrate"_ — true about the
layout, and misleading about the command, in a skill (`upgrade` step 1) whose whole thesis is that
_"nothing to migrate" does not mean the team is current_. It is now a refusal that says what the
command can and cannot reason about.

**5 — 🕳 two shipped docs argued the version rule from a consequence this phase removed.** Both
`bootstrap` §0a item 2 and spec §5a justified _"`version` stays 2"_ with _"bumping it would make
`anthill migrate` report **already at v3**"_. After the guard, `migrate` never reads the version on a
`teams` config — it refuses first — so the stated consequence cannot occur. The rule is unchanged and
its reason is now the direct one (a stamped `3` claims a layout that does not exist). **A rule
defended by a symptom outlives the symptom**, and this is the second time in this project that
shipped prose kept teaching a mechanism the code had moved on from.

**5 — 🔧 `upgrade`'s multi-team guidance is per-team wherever it was per-project.** The task named
five sites; four needed the same widening rather than a mention. 4a's reconcile runs **once per
team** against each `teamDir` (`anthill team ls` prints them) — a team at `.anthill/teams/lean/` is
invisible to a diff rooted at `.anthill/` and would keep its bootstrap-version guidance while the
release is recorded as reconciled. Step 6 reports per team for the same reason. 4d gained one line:
under a `teams` map `gate` is **project-level**.

**5 — 🕳 rule 7 corrected the `status` line I had just written.** Step 5's first draft said `status`
_"will refuse if nothing selects one"_. Running it found the refusal is the **safe** case: on the
pinned repo — which is every operated multi-team repo — `status` **succeeds and reports the pinned
team only**, saying nothing about the other two. So a single clean `status` reads as "the project
verifies" and is one team verified. The loud failure was the one I documented; the quiet one is the
hazard.

**5.1 — built as specified. Two notes.**

- **🕳 the task's file list stopped at the code, and the routing lives in a skill.** `upgrade` step 1
  had just been given (in Phase 5, by me) a bullet ending _"→ Same route as 'already current': skip
  steps 2–3, go to step 4"_ — written when there was one refusal. With two, that sentence sends the
  **pending-migration** case to the living-doc reconcile, which is precisely the wrong answer 5.1
  names: the repo ends up recorded as upgraded while its footprint is still on the old layout. The
  bullet now branches on which refusal was printed. **A guard that gains a second branch obsoletes
  every doc that told you what to do after the first one** — and this one was six commits old.
- **⚖ the version numbers come from `pending.from`/`pending.to`, not from `version` and
  `CURRENT_VERSION`.** Identical today (one migration, one step). They stop being identical the
  moment the chain has two steps, and the message should name the step that is actually next rather
  than the endpoint.

**5.1 — 🕳 the bold-markdown line was one instance of a class, and the grep proves the class is
otherwise empty.** The task says the refusal is the only emitted runtime string in
`plugin/scripts/anthill/` carrying `**bold**`. Re-verified after the edit: zero remain. Pinned with a
test that runs `--format text` and asserts the output carries no `**`, because "I checked once" is
what the rest of this record keeps finding insufficient.

### Phase 6

**6.1 — 🕳 "mirror `Anthill-Seat` exactly" produces a commit git cannot parse.** `stampSeat` appends
`\n\n${trailer}`, which is right for the first stamp and wrong for the second: git's trailer block is
the LAST paragraph, so a blank line between two trailers yields **one** trailer and silently discards
everything above it. Measured before writing the fix:

```
$ printf 'subject\n\nAnthill-Seat: forager\n\nAnthill-Team: dev\n' | git interpret-trailers --parse
Anthill-Team: dev            ← the seat is GONE

$ printf 'subject\n\nAnthill-Seat: forager\nAnthill-Team: dev\n' | git interpret-trailers --parse
Anthill-Seat: forager
Anthill-Team: dev
```

**`git log --grep` survives either shape**, which is exactly why this would have shipped: the one
query the task names keeps working while every trailer-AWARE consumer loses the seat. Both stamps now
go through `appendTrailer`, which joins an existing block. **The cross-seat atomic land has the same
shape and was already landing this way** before a second trailer key existed — so this was a live
latent defect, not one Phase 6 introduced. Pinned twice: once on the exact string, once by asking
`git interpret-trailers` itself, because a string assertion encodes what git does and only the second
one asks it.

**6.1 — ⚖ the trailer is stamped only on a MULTI-team project.** The task says mirror `Anthill-Seat`,
which is stamped whenever `--as` is given. Applied literally, every single-team repo gains an
`Anthill-Team: default` line on every commit a seat lands — a visible change to a repo that
configured nothing, which is criterion 1. It is also information-free there: the trailer answers
_"which shape produced this?"_ and with one shape the answer is constant. **Same call Phase 2.3 made
about `ANTHILL_TEAM` in the spawn launch lines, on the same grounds.** Both directions tested at the
CLI.

**6.1 — ⚖ the stated limit, because it is not fixable.** A project that adds its second team on day
200 has 199 days of commits with no team trailer, so `--grep "Anthill-Team: dev"` finds the split-era
commits only. The trailer dates from when the question became askable, not from when the team started
work. Recorded in the code rather than only here, since the person who hits it is reading `git log`.

**6.2 — ⚖ the fingerprint covers the TEAM-LEVEL KEYS, not the raw entry.** The task says "that team's
own config entry", which is unambiguous under a `teams` map and undefined for a flat config, where
the "entry" is the whole file — `version`, `gate`, `grounding` and all. Scoping it to the team's own
keys makes the two shapes mean the same thing and buys a property worth having.

> **🔴 CORRECTED at finalize (2026-08-10), by the independent review — the original entry here was
> FALSE, and it said "measured".** It claimed `channel`/`lead`/`paths`/`seats` and printed a table
> whose second row asserted the §0a conversion does not move the fingerprint. **`paths` was in the
> hash, and §0a REQUIRES adding `paths.teamDir: ".anthill"` to the incumbent** — its own BEFORE
> example carries no `paths` — so the conversion moved it, and the property was false **exactly on
> the route it was written for**.
>
> **The measurement was real and the fixture was wrong**: I hashed a flat config that already had an
> explicit `paths` block, which is the one shape where the claim holds. That is the
> fixture-shaped-to-pass error this same record catches in 4.2 and 6.3 — **third instance, and the
> first one where I wrote the false claim into a SHIPPED SKILL rather than into a test.** The gate
> cannot see it: it is prose and a `bun -e` snippet.
>
> **Fixed by making the property true rather than retracting it** — `paths` is now excluded, because
> WHERE a team's docs live is not WHAT SHAPE the team is. Re-measured against §0a's actual BEFORE and
> AFTER, verbatim from the skill:

| change                                          | fingerprint |
| ----------------------------------------------- | ----------- |
| §0a BEFORE — flat, no `paths` (as shipped)      | `5d7b4d70`  |
| §0a AFTER — the same team, `paths` now required | `5d7b4d70`  |
| another team's entry edited                     | `5d7b4d70`  |
| project-level `gate` edited                     | `5d7b4d70`  |
| the team's `teamDir` relocated                  | `5d7b4d70`  |
| a seat added                                    | `02a0dfa7`  |

**Rows 1–2 are the ones that earn the scoping:** §0a moves nothing about the team, so a project
adding its second team must not read as having reshaped its first. Row 5 is what excluding `paths`
buys on top — moving a team's docs is not a reshape either.

**6.2 — 🔧 the algorithm is stated in prose as well as shipped as a command.** The task says state it
so a reader can reproduce it; a `bun -e` snippet is a command, not a statement — nobody can check a
snippet against an intent it does not contain. Both are there: sorted keys, no whitespace, arrays in
authored order, SHA-256, first 8 hex. The snippet uses **Bun**, which is a hard dependency
(`bootstrap` §1), rather than `jq`, which is not mentioned anywhere in the plugin.

**6.2 — 🕳 the checklist again, and the map's scar predicted it.** `finalize-session`'s step 4.5 body
and its landing checklist are separate; the stamp went into both. `cascade-check` records this exact
drift in triplicate from the `principles.md` pass — "the checklist is the part that gets read" — and
the retro stamp is a step whose omission is **invisible until the session that needs it**: a
carried-forward Q3 recorded as held or falsified by a team that reshaped in between, with nothing in
the file to say so.

**6.2 — ⚖ the "labelled, not comparable" limit is stated THREE times, deliberately.** In the template
(the file a lead reads while writing), in the skill (the instructions being followed), and in the
checklist item (the thing read under time pressure). It is the phase's known limit and the single
most likely claim to grow in the retelling — a fingerprint that distinguishes shapes reads as a
licence to compare them, and Proposal Open Question 3 is unanswered.

**6.3 — built as specified. The finding that matters is about the TEST, not the code.**

The fix is the plan's, unchanged. What is worth recording is why 6.1 shipped it: **every fixture in
`team-commit.test.ts` used `"subject"` or `"subject line"` — no colon** — so the suite exercised only
the shape that could not fail. Giving those fixtures a conventional subject was not cosmetic:
**4 of the 6 tests that go RED against the reverted rule are the re-colonized pure ones.** The two
CLI tests found the defect; the fixture edit is what stops it recurring in the pure layer.

**And 6.1's own lesson recurred one level up, inside the test written to apply it.** 6.1 recorded
that `git log --grep` survives a broken trailer block, so the documented query keeps working while
trailer-aware consumers lose the data — then added a `git interpret-trailers` test that asked git the
right question **about `"subject"`**. Asking the authoritative tool the right question about the wrong
fixture is indistinguishable from not asking. The three new CLI tests all assert through
`interpret-trailers`, and one of them pins the two neighbouring shapes (a body paragraph; no colon)
**because they are what makes the one-line case identifiable as the defect rather than general
breakage**.

**6.3 — ⚖ `TRAILER_LINE` is unchanged, and its doc comment now says why it should stay that way.**
The regex was never wrong; it was asked the wrong question. A conventional subject IS a
`Key: value` line, so **no per-line pattern can separate the two** — which is exactly why git decides
by paragraph. Without that stated, the next reader's instinct on seeing this bug is to tighten the
regex against `feat|fix|chore|…`, which fails on the first custom type and re-opens the same hole.

### Finalize — what the independent review found (2026-08-10)

**Two reviewers on the net diff, one execution-capable. The static one returned "ready to merge" with
nothing above its confidence bar; the one that could RUN THINGS returned "with fixes" and five
confirmed defects.** That gap is the finding. Every one of the five is in **shipped content or an
emitted command**, and none is visible to `bun run check` — the same class this plan has been
recording since Phase 3, arriving one last time at the point where the branch was declared done.

**🕳 1 — the retro fingerprint property was false, and said "measured".** Full entry above, under
6.2. The short version: I hashed a fixture that already carried `paths`, so the one shape where the
claim holds. **Third fixture-shaped-to-pass in this project, and the first written into a shipped
skill rather than a test.**

**🕳 2 — `<teamDir>` shipped unresolved into every rendered SOP.** 0.4 changed skill prose from
`.anthill/…` to `<teamDir>/…` and correctly added a legend saying it resolves. **The same edit went
into `templates/docs-team/README.md`, which has no legend and is rendered into a repo where the value
is known.** A single-team project's SOP regressed from `.anthill/scratch/<handle>/…` to an undefined
placeholder — criterion 1, in the file every seat reads. Fixed by making it a real token
(`{{teamDir}}`/`{{seatDir}}`) rather than by reverting the prose. **Found by rendering a footprint
from `develop` and one from HEAD and diffing them**, which is the only instrument that sees it: both
are valid markdown.

**🕳 3 — the convene guard read a LATER artifact than the one it names.** Its stated reason is
`.bounty-session`, written by `convene`; every signal it consulted came from the comms session-open
record, written by `spawn`. So the whole convene → brief → spawn window was unguarded **in the
guard's own scenario**, and a second convene silently rebound the first team's board. The guard now
reads the file it names. _A guard whose evidence is written later than the event it guards cannot
cover the gap between them_ — and 3.3's own rule about stating the real reason is what made this
findable: the comment named the right artifact all along.

**🕳 4 — `join` emitted commands that drop the team.** The emitted string runs in a fresh process
where the ladder starts over, so `--team lean` on `join` did not survive into the `commit` line it
printed. On the forked-team layout §0a actively recommends — overlapping handles — a `lean` seat's
land came back `ok:true` stamped `Anthill-Team: dev`. **6.1's trailer exists to answer "which shape
produced this?", so a confidently wrong answer is worse than none.** Both emitted commands now carry
`--team` when, and only when, the project configures several.

**🕳 5 — a checklist item added this branch cried wolf on every v1→v2 migration.** `init` ensures
four gitignore lines; `migrate` ensured three, so `.bounty-session` always came back `added` — which
the new checklist reads as proof that the two disagree about a line's spelling. Fixed by adding the
missing op, which makes the claim true rather than narrowing it, and closes the same
commit-the-local-state hole the pin op exists for.

**🕳 6 — the convene checklist told the lead to run a command that refuses in the state it
addresses.** `anthill team show` on an unpinned multi-team repo exits 1; the checklist reached for it
precisely there. Now `team ls`, which tolerates ambiguity. **The compounding half was worse and
unstated:** `convene --team dev` does not pin, so every later command refuses unless `--team` is
repeated — and the skill named the pin only inside the guard's remedy, never on the happy path.

**⚖ 7 — an inherited `ANTHILL_TEAM` hard-errors in an unrelated single-team repo, and that is
ACCEPTED.** `spawn` exports it into every pane of a multi-team project; a pane whose agent then works
in a different, single-team repo gets a refusal on every command. This is a criterion-1 cost and it
was not in the accounting. Kept, because the alternative is rung 2 silently ignoring a name it cannot
match, which is the one thing the ladder must never do — **it fails loudly, in the direction the
invariant chooses.** Recorded here rather than fixed, so the next person to read criterion 1 as
absolute finds the exception.

**⚖ deferred, with reasons.** `team ls` refusing on a stale pin (deliberate — the message names the
valid teams, and a pin naming nothing is a typo to report); declared-total fields dropping out of
JSON when `undefined` (real, and it is a repo-wide idiom question, not this branch's); a dead
`loadConfig`; a non-object `paths` resolving to the default instead of erroring; and the **cross-knob
directory overlap** — `validateAcrossTeams` compares `a.seatDir` to `b.seatDir` but never to
`b.teamDir`, so two teams can share a directory through different knobs. **I reproduced that one**:
`init` writes `.anthill/dev/README.md` for `dev` and reports it `skipped` for `lean`, which silently
inherits it. Reachable only by hand-authoring a `paths` override no documented route produces.

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

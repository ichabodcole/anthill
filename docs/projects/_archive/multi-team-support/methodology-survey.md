# What's baked in — a survey of anthill's methodology, by where it lives and what it assumes

**Date:** 2026-08-09 · **Status:** complete for the prose surface; the CLI source is deliberately out
of scope · **Author:** Cole + Claude Code (unconvened session — no seat), with three survey subagents
**Answers:** Q1 of [One project, many teams](../../investigations/2026-08-09-one-project-many-teams.md)
— _"how much dev-specific methodology is actually welded into skill prose?"_, asked by Cole in
[his note](operator://documents/68d31401-3a26-4a21-9e3a-6c8a82dd2783)

---

## Why this survey exists

Cole's ask, verbatim: _"An analysis of how much we bake into the current Ant Hill process that is
focused on development specifically — and even beyond that, how much methodology we bake in generally
… so that those things are externalized and contained within the team you create, versus baked into
skill language."_

The investigation's finding is that this is the **precondition** for multi-team support, not a
side-quest: if methodology stays welded into skill prose, every team in a project inherits the dev
team's operating rules regardless of its config, and **an A/B of team structure would compare
variants that differ only cosmetically.**

## The classification, and why two buckets weren't enough

The obvious cut is _dev-specific_ vs _universal_. **That cut is wrong**, and the survey found the
error early: a large fraction of the plugin's prose is neither. It is **facts about the tools** —
that an unquoted backtick is executed by the shell before the CLI sees it, that an unknown positional
returns the entire log with exit 0, that `comms` emits no keepalives so a `grep` there drops real
messages. That content is invariant across every team kind **and** every team shape, and
**externalizing it would be actively harmful** — a team could edit it into being wrong about its own
substrate.

So, four buckets:

| bucket           | what it is                                                            | where it should live                                        |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| **SUBSTRATE**    | facts about the tools/shell/CLI; invariant across kind and shape      | **stays in the plugin** — never externalized                |
| **COORDINATION** | how multiple agents coordinate; legitimately **varies by team shape** | **the externalization target** — this is what an A/B varies |
| **DOMAIN**       | assumes the work is software development                              | must be externalized, or a non-dev team inherits nonsense   |
| **PROJECT**      | already defers to the host project instead of baking an answer        | **already externalized** — the working proof                |

**The PROJECT bucket is the important one**, because it is not a proposal. It already ships, it
already works, and it is the pattern Cole is asking to generalize.

## Coverage — what was read, and what wasn't

Honest accounting, because a survey that overstates its reach is the failure this project's own
HiveMind has a note about (_"inclusion tests cannot find omissions"_).

| artifact                                               | lines | read           |
| ------------------------------------------------------ | ----- | -------------- |
| `skills/finalize-session/SKILL.md`                     | 574   | full, directly |
| `skills/join/SKILL.md`                                 | 405   | full, directly |
| `templates/docs-team/README.md` (SOP)                  | 381   | full, directly |
| `skills/convene/SKILL.md`                              | 268   | full, directly |
| `skills/plan/SKILL.md`                                 | 135   | full, directly |
| `templates/docs-team/` (principles, seams, paper-cuts) | 154   | full, directly |
| `skills/plan/methodology.md`                           | 247   | full, subagent |
| `skills/comms/SKILL.md`                                | 271   | full, subagent |
| `templates/docs-team/dev/*`                            | 101   | full, subagent |
| `skills/bootstrap/SKILL.md`                            | 271   | full, subagent |
| `skills/upgrade/SKILL.md` + migration                  | 367   | full, subagent |
| `templates/archetypes/*.json`                          | 78    | full, subagent |

**Not surveyed at all:** the CLI source (`scripts/anthill/*.ts`). Deliberate — this survey is about
**prose that instructs an agent**, and the CLI's behaviour is the SUBSTRATE bucket by construction.
A separate question (does the CLI hard-code single-team assumptions?) is the sibling investigation's,
and the outstanding slice covers the skill-level half of it.

## Finding 1 — ~~the per-team methodology container ALREADY EXISTS~~

> ## 🔴 FALSIFIED 2026-08-09, hours after it was written — by a targeted trace prompted by Cole
>
> noticing that `principles.md` / `paper-cuts.md` / `retro.md` sit outside the `dev/` folder.
>
> **The container does not exist. It only appears to.** The claim below — that two teams with
> different `teamDir` already get independently editable methodology docs — **is wrong**, and it was
> load-bearing for the proposal's technical approach. See
> [Finding 1-CORRECTED](#finding-1-corrected--the-container-only-appears-to-exist) immediately after.
>
> **What produced the error:** I read `config.ts`'s three path knobs and the templates' locations and
> concluded the wiring followed. **I did not check whether `anthill init` and the resolvers agree** —
> and they do not. A schema that _has_ the right knobs is not a system that _uses_ them.

**The original claim, kept because the reasoning is what to avoid repeating:**

`config.paths.teamDir` / `seatDir` / `seams` are already overridable per config
(`config.ts:191-196`), and the team-owned docs all resolve **under `teamDir`**:

- `<teamDir>/README.md` — the SOP, 381 lines, **the single largest methodology artifact in the system**
- `<teamDir>/principles.md` — what this team learned the hard way
- `<teamDir>/retro.md`, `<teamDir>/paper-cuts.md`
- `<seatDir>/<handle>.md`, `<seatDir>/seams.md`

**These are rendered from templates at bootstrap and then owned and edited by the team.** anthill
never rewrites them — `principles.md` says so explicitly: _"Nothing writes to this file but you.
anthill never edits it, never merges into it, and never seeds it."_

So the mechanism Cole describes as _"soft pointers: using the skill as a way to point to something
else that contains the methodology, and that is owned by the team"_ — **is already the architecture
for the SOP.** Two teams with different `teamDir` values already get different, independently
editable SOPs, principles, and retros. Nothing needs inventing for the container.

**What is missing is not the container. It is (a) the selector, and (b) the content still stranded in
skill prose.**

## Finding 1-CORRECTED — the container only APPEARS to exist

**Verified 2026-08-09 by a dedicated trace of every team document's path resolution.**

The three knobs are real (`config.ts:28-32`) and there are exactly four resolvers
(`config.ts:221-224`). **The wiring around them is not.**

- **`seatDir` and `seams` are independent literal defaults — not derived from `teamDir`**
  (`config.ts:193-195`). Overriding `teamDir` leaves them pointing at `.anthill/dev/…`.
- **`anthill init` writes everything relative to `teamDirPath()` and never consults
  `seatDirPath()` or `seamsPath()`** (`team-init.ts:217-233`). The `dev/` segment comes from the
  template tree's layout, hard-coded.
- **`seatDirPath()` itself is never called in non-test source** — but state it precisely, because the
  loose reading is wrong: `seatDir` **does** reach source, through `seatDocPath()`
  (`team-join.ts:653, :717`; `team-convene.ts:285`). So the knob is half-wired — consumed for the seat
  DOC path, ignored by the renderer — which is exactly why the two disagree.
- **The break does not self-heal.** init writes `<teamDir>/dev/<handle>.md`; `join` sends the seat to
  `seatDocPath()` = `.anthill/dev/<handle>.md`; the seat reports a missing doc; init re-renders to
  the other location. **The loop never closes.**
- **`retro.md` has no knob, no resolver, no template, and zero CLI references** — orphaned by
  construction.
- **`paper-cuts.md` has no resolver** — rendered once, then unfindable by any code.
- **The `.gitignore` lines are hard-coded literals** (`team-init.ts:101,133`) while the paths they
  guard are `teamDir`-derived. **Move `teamDir` and every team's comms log and every seat's scratch
  becomes a tracked file.** _(Independently found by the proposal's gap analysis.)_
- **All 30+ doc-path citations in skill prose are hard-coded literals.** Zero use a resolving form.
- **`finalize-session/SKILL.md:15-16` claims these paths resolve from config. That is FALSE for
  `retro.md` and `paper-cuts.md`, and half-true for `principles.md`.**

**Why it has never fired:** `bootstrap:174-175` tells the compositor **not** to write a `paths`
override unless the location is deliberately different, so essentially every team runs on defaults.
`migrate.ts:125-129` even documents that honouring an override _"silently HALF-consolidates"_.

**The corrected conclusion:** the container is a **schema that has the right knobs and a system that
does not use them.** Per-team methodology docs must be **built**, not merely populated — which is why
this became MVP item 0 rather than a free foundation.

**The general lesson, worth more than the fact:** _reading a config schema is not reading a system._
The knobs looked sufficient; the renderer and the resolvers disagreed with each other, and only
tracing both revealed it.

## Finding 2 — the skills restate the team-owned docs, which breaks anthill's own strict rule

The SOP states one rule as strict: **_"defer to one source — don't restate shared truth. Restating a
contract in three docs guarantees drift."_** `plan/methodology.md:4` says the same of itself:
_"SOP, `convene`, `join` point here, never restate it."_

**Both are violated by the plugin's own artifacts**, measured:

| content                                        | lives in                              | also restated in                                      |
| ---------------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| read-watermark (_"ratified as of #14"_)        | `plan/methodology.md:163-170`         | SOP `:231-234` (same `#14` example), `comms:219-220`  |
| a ruling must name what it did NOT settle      | `plan/methodology.md:187-193`         | SOP `:239`                                            |
| `seams.md` ownership + single-source           | `plan/methodology.md:115, 230-235`    | SOP `:42`, `dev/README:15-17`                         |
| skeleton-is-a-hypothesis / ratify-before-draft | `plan/methodology.md:11-15, 25-36`    | SOP `:112-116`                                        |
| the epitaph contract                           | `templates/…/dev/{{handle}}.md:19-29` | SOP `:36-41`, `join:36-41`, `finalize-session:92-117` |
| roster-is-a-hypothesis                         | SOP `:111, 323-330`                   | `dev/README:23-24`                                    |
| no `grep` on a `follow`                        | `comms:209-212`                       | `join:95-96, 330`                                     |
| `--stdin` for code-bearing messages            | `comms:216-218`                       | `join:351-356`                                        |
| `--id` is not a narrow range                   | `comms:61-64`                         | `join:169-173`                                        |

**Why this matters for multi-team, and it is not a tidiness complaint:** externalizing methodology
into a team-owned doc **does nothing if the skill still states the same rule**. A team that edits its
SOP to coordinate differently would be contradicted by the skill prose its seats also read — and per
`finalize-session:147-152`, this project already has a scar from exactly that shape: two adjacent
bullets, one right and one wrong, where _"only a reader running both together could tell which."_

**The split the subagent observed is the one worth keeping:** where restatement exists between a
skill and a team doc, _"the skill carries the operational detail and the doc carries the norm."_
That is the right cleavage line for externalization — and it is currently followed by accident rather
than by rule.

## Finding 3 — the dev-welding is smaller than expected, and highly concentrated

Per-artifact classification (counts are instructions, not lines):

| artifact                                | SUBSTRATE | COORDINATION | DOMAIN | PROJECT |
| --------------------------------------- | --------- | ------------ | ------ | ------- |
| `skills/comms/SKILL.md`                 | 32        | 9            | **0**  | 1       |
| `templates/…/dev/{{handle}}.md`         | 0         | 11           | **2**  | 1       |
| `templates/…/dev/README.md`             | 1         | 4            | 3      | 1       |
| `skills/plan/methodology.md`            | 6         | 30           | **20** | **1**   |
| `skills/bootstrap/SKILL.md`             | 14        | 13           | **13** | 7       |
| `skills/upgrade/SKILL.md`               | 24        | 11           | 1      | 7       |
| `skills/upgrade/migrations/v1-to-v2.md` | 8         | 0            | 0      | 2       |
| `templates/archetypes/*.json`           | 4         | 4            | **10** | 2       |
| **totals (subagent-classified)**        | **89**    | **82**       | **49** | **22**  |

_(Totals cover the six artifacts classified item-by-item by subagents. The four I read directly —
`convene`, `join`, `finalize-session`, the SOP — are analysed below but were not counted the same
way, so these are not whole-system figures.)_

**`comms` is the clean case: zero domain-specific instructions in 271 lines.** A message wire is a
message wire; a creative team would need it unchanged.

**`plan/methodology.md` is the dirty case**, and it is the one to study, because it is the file most
about _how a team works_. 20 domain rows against 30 coordination rows — and crucially, **1 project
row.** The subagent's verdict: _"This file does not practice soft-pointing. It bakes in its answers."_

**But most of the dev-welding is illustrative rather than structural.** The dominant pattern is a
domain-neutral rule proved by a dev war story — swap the example, keep the rule. The file even
anticipates this at its own line 6 (_"where it names a concrete example, that's illustration"_).

**Two places are welded at the sentence level and cannot be swapped cheaply:**

1. `methodology.md:172-176` — a two-artifact contract broken three times in a session, _"caught in
   four seconds **by a compiler**."_ The compiler is the whole force of the story.
2. `methodology.md:181-183` — the prescription is _"ask what will fail when the two sides stop
   agreeing"_, and **every answer offered is a dev artifact**: a test spanning both, a shared type,
   an exhaustiveness check. **Remove those and the instruction has no content left.** A creative team
   needs a wholly new answer set — a continuity pass, a shared style sheet — not a rewording.

**The densest extractable block** is `methodology.md:209-228` ("How each owner authors its lane"),
where six of seven bullets assume a codebase, tests, TDD, types and commits. That is the single most
separable unit found so far.

**The clearest single line a non-dev team could not use** (`methodology.md:219`): _"**TDD when a
framework exists.** Structure each task as: write the failing test → run it red → minimal
implementation → run it green → commit."_ Nothing in a writing or research team has a red/green cycle.

**And the clearest coordination methodology that survives any domain** (`methodology.md:187-193`):
_"Contested seams settle with one ruling — and the ruling must name what it did **not** settle …
Silence and resolution look the same."_ That is multi-agent dispute hygiene; it holds for a writers'
room as much as a repo.

## Finding 4 — the seat-doc schema is already domain-agnostic

`templates/docs-team/dev/{{handle}}.md` is the per-seat living-doc template — effectively **the
schema of what a seat knows**. Its headers:

```
# {{handle}} — {{role}}
> ## Epitaph        ## Who I am      ## Scope       ## Boundaries
## Relationships    ## Taste & reflexes            ## Hard-won lessons
## Anti-patterns    ## Candidates
```

**A creative or research seat would fill all nine without strain.** Exactly two clauses are
dev-welded, and both are one clause each:

- `:65` — pin lessons _"to a green test / fixture … to a durable concept or a commit otherwise."_
  Note it **already carries its own generic fallback** — the dev-specific part is the _preference
  ordering_, not the mechanism.
- `:14-17` — the one-sentence-per-line rule, justified by _"prettier / biome may reflow."_ The
  rationale is generic (a formatter mangles hard wraps); only the tool names are JS-ecosystem.

**This is the strongest evidence that Cole's ask is tractable.** The thing that carries a seat's
accumulated knowledge — the artifact multi-team support most needs to be portable — is already
almost kind-agnostic.

## Finding 5 — the existing PROJECT bucket is the design template

Four places already do exactly what Cole is asking for, and they should be read as the spec:

1. **`gate`** — `config.json`'s verification command, with **deliberately no default**. bootstrap
   `:177-190` and convene `:57-67` both say the same thing: _"anthill supplies the trigger to decide,
   the project supplies the content"_, and _"a guessed gate hands seats a green that means nothing."_
   The absence is announced loudly rather than filled.
2. **`grounding`** — the product-context docs, detected at bootstrap rather than assumed.
3. **The branch/landing policy** — convene `:172-181` and finalize-session `:495-507`:
   _"The project names that procedure, not anthill … **Do not hard-code one here**: a landing
   procedure is a host convention."_
4. **The docs-of-record set** — finalize-session `:210-213`: _"**The project names the set; anthill
   only supplies the trigger.** … **Never hard-code a list** — a doc set baked into this skill is
   exactly the convention-in-a-default anti-pattern."_

**And `comms:245-246` is the purest instance**: it names three wire-agnostic conventions and pushes
them to the team README rather than restating them. That is the soft-pointer move, already shipped,
in exactly the form the multi-team question needs generalized.

**The pattern in all five: name the trigger, refuse the default, make the absence loud.** The third
clause is the one that makes it safe, and it is the answer to the investigation's Q2 (_how do soft
pointers preserve the guarantee that guidance fires?_) — **an unset gate does not fail silently, it
announces.**

## What this means for the investigation's Q3 — does externalization fight adapts-not-dictates?

The investigation flagged a tension: adapts-not-dictates currently lives _in_ skill prose, so moving
methodology into a team-owned doc moves enforcement into a file a team can edit into uselessness.

**The survey's evidence says the tension is weaker than stated, and the attractive reading holds** —
but for a reason the investigation didn't have: **the existing PROJECT-bucket instances all keep the
trigger in the plugin and move only the content out.** The skill still fires; only the answer is the
team's. That is not a compromise between the two principles, it is the shape both already have.

**The residual risk is real but narrower than "a team could edit it into uselessness":** it is that a
team-owned methodology doc could be **missing**, which is Cole's own caveat (_"you'd have to make
sure that document exists"_). The `gate` precedent answers that too — an unset value announces
itself at the moment it would have been used.

> **⚠ Q3 should still be attacked rather than adopted.** This section argues _for_ the attractive
> reading, which is exactly when the investigation said to attack it. What would falsify it: an
> instance where the plugin's trigger itself encodes a domain assumption, so that "keep the trigger,
> externalize the content" still leaves a dev-shaped skeleton. `methodology.md:181-183` may be
> exactly that case — the trigger is _"ask what will fail"_ and it is inseparable from its dev answers.

## Finding 6 — bootstrap does not REFUSE a non-software project. It silently hands it a dev team.

**This is the survey's sharpest result, and it inverts the expectation.** I assumed a non-software
repo simply couldn't be bootstrapped. It can — badly, and without saying so.

Every input to the team-composition decision comes from `anthill scan`'s manifest-derived
`ScanReport`: `data.workspace` alone _"picks the archetype"_ (`bootstrap:71-73`), the shared-contract
seat's **existence** is a dep-graph fan-in test (`:100-103`), and the seat **count** is decided by
`stack[0]` equality (`:104-107`).

**For a non-software project the scan finds no workspace and no units — so `data.workspace === null`,
so the single-surface branch fires unconditionally, and the team is `layered-app.json` verbatim:** an
engine seat scoped to _"goldens, unit tests"_, a spine seat owning _"cross-slice contracts"_, a
surface seat for the _"UI / presentation layer"_, and a verify seat doing _"integration / end-to-end"_.

**It produces a team. The team is meaningless. Nothing anywhere reports a problem.** The tailoring
instructions (`:83-86` — point the surface seat at _"the repo's real components dir"_, the engine seat
at _"its core package"_) give the agent nothing to attach to, and the only rescue is the human at the
ratify step — which turns a ratify into full re-authoring, contradicting the skill's own stated goal
at `:141-142` of _"a one-pass ratify, not an open-ended 'how do you want your team?'"_.

**This is the same failure shape as everything else in this project's scar corpus** — succeeds,
plausibly, with the wrong answer. It belongs in the proposal as a named defect, not merely as a gap.

**The good news, and it is genuinely good:** the _conversation machinery_ around the decision
(`:130-156`) and the seat-shape vocabulary (`:91-94, :119-128`) are **domain-neutral**. Only the
_evidence feeding the recommendation_ is software-specific. **Swap `anthill scan` for a
kind-appropriate shape-reader and the entire ratify protocol survives intact** — which makes this far
cheaper to fix than the line counts suggest.

## Finding 7 — the single-team assumption is prose policy, not a tooling constraint

`bootstrap:26-28` refuses when `.anthill/config.json` **or** legacy `.team/config.json` exists
_"here or **up the tree**"_ — so it forbids even a **nested** second team in a subdirectory, closing
the one workaround the sibling investigation had identified as maybe-viable.

**But the underlying CLI is more permissive than the skill.** `anthill init` is explicitly file-level
idempotent — it skips existing files (`:201-207`). **So the refusal is a sentence, not a mechanism**,
which means the cheapest possible experiment (hand-write a second config, render it) is not blocked by
tooling. That materially lowers the cost of the investigation's step 2.

There is also **no team identity in the schema at all**: `channel` is the only identity token, and no
`name` / `id` / `team` key exists in either archetype. `channel` is simultaneously the comms channel,
the bounty session key, and the tmux session name (`:165-169`) — one namespace doing three jobs, with
no team qualifier above it.

## Finding 8 — `upgrade` would silently half-upgrade a two-team repo

Five separate single-footprint assumptions, each benign alone:

- `migrate --dry-run` _"walks up for the footprint marker"_ — **first match wins, no selector** (`:76-77`)
- the grapevine→comms sweep greps only `.anthill/ docs/` (`:157`)
- the template-drift diff targets literal `.anthill/README.md`, `dev/README.md`, `dev/seams.md`,
  `paper-cuts.md`, `principles.md` (`:195-199`)
- the `gate` backfill targets _the_ config (`:242-257`)
- verification is a single `anthill status` and one commit (`:262, :280`)

**Compose them and a two-team repo upgrades the nearer team, leaves the farther one stale, and
`anthill status` reports green.** That is precisely the class of failure the skill spends its first
seventy lines warning about — arriving from a direction it never anticipates.

## Finding 9 — the launch string has no team selector, and this lands on the ergonomics question

`archetypes/*.json:38` — `launch: claude "/anthill:join {handle}"`. **`{handle}` is the only
interpolation.** Two teams' seats would be indistinguishable at launch.

This is direct evidence for
[the ergonomics investigation](../../investigations/2026-08-09-team-selection-ergonomics.md): the
launch string is exactly the "emitted command the agent runs verbatim" surface, so it is where an
ambient team binding would have to be resolved. It is also **a configurable field**, which means the
resolution point already exists and is already per-team.

## What the survey says to do

Ranked, and derived from the findings rather than from the original guesses:

1. **Fix the fail-open defect first, independent of multi-team.** Bootstrap handing a poetry repo a
   seat scoped to _"goldens, unit tests"_ is wrong today, with one team, and naming it costs nothing.
2. **Externalize by moving the SOP boundary, not by inventing a container** — the container exists
   (Finding 1). The work is relocating stranded COORDINATION content out of skill prose and, harder,
   **stopping the skills restating it** (Finding 2).
3. **Treat `plan/methodology.md:209-228` as the first extraction** — the densest dev-welded block, and
   the most separable.
4. **Leave SUBSTRATE alone.** 89 of the classified items are facts about the tools. Externalizing them
   would let a team edit itself into being wrong about its own substrate, and no A/B would ever want
   to vary them.
5. **Do not design the selector yet** — but note that `launch` and `channel` are where it lands.

_(This document will be amended when that slice returns.)_

---

**Related documents:**

- [One project, many teams](../../investigations/2026-08-09-one-project-many-teams.md) — the parent
  investigation; this survey answers its Q1
- [Selecting a team without ever naming one](../../investigations/2026-08-09-team-selection-ergonomics.md)
  — the sibling ergonomics question
- [proposal.md](./proposal.md) — the project this feeds

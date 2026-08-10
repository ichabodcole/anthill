# Multi-team support — switching, forking, and externalizing the methodology

**Status:** ✅ **Shipped 2026-08-10** — MVP items 0–7 built and merged to `develop`; all six success
criteria met. **Items 8 and 9 moved out** (see the scope amendment under Scope) — the bootstrap
fail-open defect to a backlog sweep, the acceptance experiment to its own project. **Open Questions 2
and 3 remain open and travel with that project.**
_(Was: Draft v2 — revised after a cold gap analysis and a path-resolution trace, both of which
falsified load-bearing claims in v1. All three decision points ratified by Cole 2026-08-09.)_
**Created:** 2026-08-09 · **Author:** Cole + Claude Code (unconvened session — no seat)
**Branch:** `feature/multi-team-support`
**Rests on:** [one-project-many-teams](../../investigations/2026-08-09-one-project-many-teams.md) ·
[team-selection-ergonomics](../../investigations/2026-08-09-team-selection-ergonomics.md) (concluded) ·
[methodology-survey](./methodology-survey.md) (Finding 1 **falsified**, corrected in place)

---

## Overview

anthill supports exactly one team per project. You change teams by overwriting the config, which
destroys the previous shape, leaves no lineage, and makes two shapes impossible to compare. The
manifesto now names **experimentation as a tent pole**. **Those two facts contradict each other, and
adaptation without an instrument is just churn.**

> **⚠ What v1 of this proposal got wrong, because it shapes everything below.** v1 asserted that the
> per-team methodology container already existed — that setting `paths.teamDir` per team already
> yields independent SOPs, principles and retros. **A targeted trace falsified that.** The knobs
> exist; the wiring does not. `paths.teamDir` does **not** carry `seatDir` or `seams` with it, and
> `anthill init` ignores those two knobs entirely. **So the foundation this project was going to
> build on has to be built first.** That is now MVP item 0.

## Problem Statement

**Four capabilities are wanted, and they are separable** (from Cole's note): multiple **kinds** of
team; **variants** of one kind for experimentation; **fork** with lineage; and **externalized
methodology** so what varies is real.

### The blockers, all verified in source

**1. There is no team identity.** `.anthill/config.json` is THE project-root marker, discovered by
walking up from cwd (`config.ts:234-253`), loaded with no arguments at one choke point
(`team-support.ts:20-30`). No flag, no env var. **`channel` is the only identity token — there is no
`name`/`id`/`team` key in the schema.**

**2. 🔴 The path layer does not work, and nobody has noticed because nobody overrides it.** This is
the finding that reorganized the proposal:

- **`seatDir` and `seams` are independent literal defaults, not derived from `teamDir`**
  (`config.ts:193-195`). Override `teamDir` alone and they still point at `.anthill/dev/…`.
- **`anthill init` writes everything relative to `teamDirPath()` and consults `seatDirPath()` /
  `seamsPath()` never** (`team-init.ts:217-233`). The `dev/` segment comes from the _template tree
  layout_, hard-coded.
- **So a `teamDir` override hard-breaks and cannot self-heal:** init writes the seat doc to
  `<teamDir>/dev/<handle>.md`; `join` tells the seat to read `.anthill/dev/<handle>.md`; the seat
  reports a missing doc; init re-renders to the other location; **the loop never closes.**
- **`seatDirPath()` is never called in non-test source at all.**
- **`retro.md` has no knob, no resolver, no template, and zero CLI references.** It is orphaned by
  construction — the lead writes it by hand at a path only skill prose names.
- **`paper-cuts.md` has no resolver either** — rendered once, unfindable by any code thereafter.
- **The `.gitignore` lines are hard-coded literals** (`team-init.ts:101,133`; `migrate.ts:173`) while
  the paths they guard are `teamDir`-derived. **Move `teamDir` and every team's comms wire and every
  seat's scratch becomes a tracked file.** _(Found independently by two agents.)_
- **All 30+ doc-path citations in skill prose are hard-coded literals.** Zero use a resolving form.
- `finalize-session/SKILL.md:15-16` claims these paths "resolve from config". **That claim is false
  for `retro.md` and `paper-cuts.md`, and half-true for `principles.md`.**

**3. bootstrap refuses a second team** _"here or up the tree"_ (`bootstrap:26-28`) — closing even the
nested workaround. This is **prose policy, not tooling**: `anthill init` is file-level idempotent.

**4. `upgrade` would silently half-upgrade a two-team repo** — `migrate` walks up, first match wins.

**5. And one defect live TODAY with a single team: bootstrap fails open.** A non-software repo scans
to `data.workspace === null`, the single-surface branch fires unconditionally, and the project is
handed `layered-app` verbatim — an engine seat scoped to _"goldens, unit tests"_. **It produces a
team, the team is meaningless, and nothing reports a problem.**

## Proposed Solution

### 0. Make the path layer real (the foundation, and it is new in v2)

- **`seatDir` and `seams` DERIVE from `teamDir` by default** (`<teamDir>/dev`,
  `<teamDir>/dev/seams.md`), remaining independently overridable. This alone fixes the hard break.
- **`anthill init` renders through the resolvers**, not through the template tree's implied layout.
- **Gitignore lines are computed from each configured team's `teamDir`**, with a test asserting the
  emitted set covers every team's `comms/` and `scratch/`.
- **`retro.md` and `paper-cuts.md` get resolvers** (and `retro.md` gets a template — it has none).
- **Skill prose stops hard-coding `.anthill/…`** and cites the resolved form. This is the same work
  as methodology externalization, arriving early because the path layer forces it.

**Note what this buys beyond multi-team:** the `docs/team/` layout that `bootstrap:174` explicitly
sanctions today is currently broken. **Item 0 is a bug fix that happens to be the foundation.**

### 1. Team identity as an additive map in the existing config

**One config file remains THE root marker.** Discovery is unchanged. A second discoverable marker is
precisely what breaks `upgrade`.

```jsonc
{ "version": 2, "channel": "anthill-dev", "lead": "maestro", "seats": [...] }   // unchanged, still valid

{ "version": 3,                                                                 // only once a 2nd team exists
  "teams": {
    "dev":      { "channel": "anthill-dev",  "lead": "maestro", "seats": [...] },
    "dev-lean": { "channel": "anthill-lean", "lead": "maestro", "seats": [...],
                  "forkedFrom": "dev", "forkedAt": "<parent config blob hash>" }
  } }
```

**`teamDir` defaults to `.anthill/teams/<name>` when a team is named**, so the layout follows
identity instead of being hand-written.

**🔵 DECISION POINT 1 — `CURRENT_VERSION` stays at 2.** v3 is a shape the CLI _accepts_; the constant
bumps only when a second team is added. Otherwise every existing repo reports a pending migration and
`upgrade` becomes mandatory for zero benefit — **which would falsify success criterion 1 on day one.**

> **🔴 CORRECTION 2026-08-09 — the rest of this decision's original rationale was impossible.** It
> said a version check would let _"a v3 config read by an older cached CLI say 'this is v3, this
> anthill understands v2'"_. **An older cached CLI does not contain that check** — it dies with
> `config.channel is required` either way. The cached-launcher problem is only fixable by putting
> `bun ${cliPath}` in emitted strings, which is now filed as its own change.
>
> **And the version field should not carry this at all.** `version` already means **footprint
> layout** (`migrate.ts:14-17`, `team-migrate.ts:69-81`, `pendingMigrations`); overloading it with
> schema shape would make `team-migrate` report _"already at v3"_ while `CURRENT_VERSION` is 2 —
> "ahead of the plugin" when nothing moved on disk. **The shape is detected structurally
> (`"teams" in raw`) and no new version is stamped.** This is also the most idiomatic reading: AWS
> has carried `[default]` beside `[profile foo]` for a decade with **no version field at all**.

_(v1 called v2→v3 "a pure rename". It is not — it is a restructure, and `resolveConfig:157-163`
hard-requires a top-level `channel` and `seats`.)_

### 2. Resolution: a ladder ending in a hard error

| rung | source                                                                | in MVP?                            |
| ---- | --------------------------------------------------------------------- | ---------------------------------- |
| 1    | `--team <name>` explicit flag                                         | yes — escape hatch, never required |
| 2    | `ANTHILL_TEAM`, injected at pane launch                               | yes — **see the reversal below**   |
| 3    | `.anthill/current-team` pin, written at the **resolved project root** | yes                                |
| 4    | **exactly one team configured → that team**                           | yes — the single-team fast path    |
| —    | otherwise → **HARD ERROR naming the available teams**                 | yes                                |

**🔵 DECISION POINT 2 — RESOLVED: the env rung SHIPS.** _(Ratified 2026-08-09. This **reverses** an
earlier ratification in this same document, because the reason behind it was wrong — recorded rather
than quietly edited, since the wrong reason is the reusable lesson.)_

**The original argument:** the ergonomics investigation says _"probably do not add an env rung at all
— it is what makes worktrees fail worse."_ **That holds for bounty and does not transfer to us.**
bounty's env carries a **key derived against the repo path**, so a worktree derives a _different
board_ and the env, sitting above the pin, shadows the fallback that would have rescued it. **Our env
carries a NAME checked against the config's registry**, so `ANTHILL_TEAM=dev` resolves correctly from
any directory — the same registry argument that resolved Open Question 1, applied one rung up.

**And the alternative was worse:** threading `{team}` into the `launch` _template_ means any project
that has **overridden `launch`** silently never receives it, while `team-spawn.ts:47-54` already
exports `BOUNTY_SESSION_KEY` as an env prefix applied **regardless of the template**. Two ambient
mechanisms, one character apart, with different scoping rules.

**The four prohibitions, each paid for by a traced first-party failure:**

- **🔴 No machine-global fallback.** bounty's missing-pin path resolves to `bounty-latest.json` — the
  most recently opened board **anywhere on the machine** (`cli.ts:85-87`).
- **🔴 No silent empty result.** A mis-resolved team must be a **hard error**, never an empty roster.
  Note the precise hazard: `team-status.ts:97-102` distinguishes `present` / `none` / `unknown`, and a
  mis-resolved team reports **`none`** — **a confident false negative, not an admitted one.**
  _(v1 said the convene checklist teaches leads to misread this. That was backwards —
  `convene:125-133` warns *against* the misread. The corrected version is the stronger claim.)_
- **🔴 Pin at the resolved project root, not `process.cwd()`** — bounty's choice, which misplaces the
  file whenever convene runs from a subdirectory.
- **🔴 Bound the walk-up at the project root** — bounty's terminates at the filesystem root.

**Keep the one good property:** a _found_ pin is never second-guessed — error, never retarget.

**⚠ Unresolved:** bounty's pin holds a repo-scoped _derived_ id, so a stale pin self-invalidates and a
copied one is inert. **A pin holding a bare name has neither property.** Either it carries a validity
check or it holds something derived. Flagged, not glossed.

### 3. Concurrency: one convened team at a time

**🔵 DECISION POINT 3 — simultaneous convened teams are FORBIDDEN in MVP, and enforced.**

The gap analysis is right that v1 left this undefined while criterion 2 implicitly promised it.
Making it work is a deep change: `.bounty-session` is **one file at the repo root**, unconditionally
overwritten by convene (`team-convene.ts:62-63`), and `readBoardCounts` reads the board **ambiently
with no `--session`** (`team-support.ts:85-88`) — so team A's `status` would read team B's board and
label it with B's title, a mitigation that is emitted and never asserted on.

**The experiment use case does not need simultaneity** — you run shape A, then shape B. So MVP:

- `convene` refuses if **any** configured team is convened, naming which.
- `anthill use` checks presence across **every configured team**, not the resolved one — otherwise a
  stale resolution permits a switch that strands a live team's seats.
- Channel names must be **unique and prefix-free** across teams: `team-attach.ts:51-69` treats
  `<channel>-<suffix>` as the same team by convention, so a fork's derived channel would make its
  panes appear in the parent's attach menu.
- Team names take the `SAFE_SESSION_KEY` charset (`/^[a-zA-Z0-9._-]+$/`, `team-spawn.ts:37`).

**✅ Ratified 2026-08-09.** Cole: _"At some point supporting simultaneous convening would be nice but
as noted, bounty is a limitation there… we don't need to support that for MVP for sure."_

**How simultaneity most likely arrives — and it is NOT by lifting this guard.** The board is the only
blocker, and Cole's stated direction is to fix it at the source rather than work around it: either
**update bounty to support multiple teams**, or **absorb a task-board of anthill's own** — explicitly
following the path grapevine took when it became `comms` (_"written for our purposes"_). **So this
guard should be built as a guard over the BOARD's limitation, named as such**, not as a
statement that teams are inherently exclusive — because the thing that lifts it is a substrate change
underneath, and a guard whose stated reason is wrong will outlive the constraint that justified it.

_(That last clause is this project's own recurring scar: a warning that survives the thing it warns
about argues against the check that does work.)_

### 4. Every command inherits the ladder — and the exceptions are named

All 14 subcommands route through `requireConfig`, so the ladder lands in one place. **The exceptions
are the flags that already cross team boundaries today:** `anthill status --channel` and
`join --channel` (`team-status.ts:35-38`, `team-join.ts:592-604`) would read another team's wire while
`requireConfig` resolved this one. **A `--channel` naming another configured team must be rejected.**
Same for `spawn --session` / `attach --session`, which name a tmux session, not a team.

### 5. Attribution

- **`Anthill-Team: <name>` commit trailer**, beside the existing `Anthill-Seat`
  (`team-commit.ts:59-72`) — same mechanism, same rationale.
- **The retro and reconciliation lines stamp the team plus a hash scoped to that team's own entry**
  — not the whole `teams` map, which would churn when an unrelated team is edited.

## Scope

**In Scope (MVP):**

0. **The path layer** — derive `seatDir`/`seams` from `teamDir`; init through the resolvers;
   config-derived gitignore; resolvers + a template for `retro.md`; resolver for `paper-cuts.md`;
   skill prose stops hard-coding paths.
1. v3 `teams` map, `CURRENT_VERSION` unchanged, version-check-before-shape-check.
2. The ladder (flag → pin → single-team fast path → hard error) with the four prohibitions.
3. `anthill use` / `anthill teams`; team named in `status` and the join manifest; `launch` carries it.
4. Concurrency guard + channel uniqueness/prefix-freedom + name charset.
5. `bootstrap --add-team`.
6. **`upgrade` handles N teams or refuses** — non-negotiable; half-upgrading while reporting green is
   a data-integrity bug.
7. Attribution floor.
8. ~~**Fix the bootstrap fail-open defect.**~~ → **MOVED OUT 2026-08-10, see below.**
9. ~~**The acceptance experiment**~~ → **MOVED OUT 2026-08-10 into its own project, see below.**

> ### ⚠ SCOPE AMENDMENT (2026-08-10, at finalize) — items 8 and 9 were NOT built, and the plan moved
>
> them without amending this list
>
> **Items 0–7 shipped** on `feature/multi-team-support` (merged to `develop`, gate 675 pass / 0 fail).
> All six success criteria below are met. **Items 8 and 9 were never built** — `plan.md` filed both
> under _"Filed separately — deliberately NOT in this plan"_, which was a reasonable plan-level call
> and **was never reflected back here.** So for the length of the build this document said the MVP
> included two things nobody was building. Recorded rather than quietly deleted, because a scope that
> silently shrinks to match what got done reads as though it was right the first time — the same
> failure `plan.md`'s implementation record exists to prevent, one level up.
>
> **Where each went, and why it is not a deferral-in-place:**
>
> - **Item 8 (bootstrap fail-open)** → **a defect sweep, no project.** It is **wrong today with one
>   team** and has nothing to do with team resolution; it was swept in here because it touches
>   `bootstrap`. Filed with the other loose defects in
>   [`docs/backlog/2026-08-10-post-multi-team-defect-sweep.md`](../../backlog/2026-08-10-post-multi-team-defect-sweep.md).
> - **Item 9 (the acceptance experiment)** → **its own project**,
>   [`methodology-externalization`](../methodology-externalization/proposal.md). It asks a **different
>   question** from this one — not _"can a project hold many teams"_ but _"do variants actually
>   differ, and is externalized methodology a precondition for them?"_ — and it **uses what this
>   project built as its instrument.** Its likely output (externalizing the methodology) is larger
>   than everything shipped here, so filing it as the last item of a project named "multi-team
>   support" would misplace it. **The scope correction below says the gap analysis "largely won" that
>   argument; item 9 is what settles it, and it is still unsettled.**

**Out of Scope (MVP):** fork _inheritance policy_ (lineage recorded, policy deferred — does a fork
inherit the parent's living docs, contaminating the comparison, or start clean, discarding what made
the parent good? **Neither answer is obviously right**); simultaneous convened teams; non-dev
archetypes; `git` (no scoping design reaches `git stash`/`git commit`, and they mutate the shared
tree — **stated rather than assumed away**).

### ⚠ The scope correction, restated after it was attacked

v1 argued that externalized methodology is a precondition for **kinds** but not for **variants**,
because variants differ through `seats[]` alone. **The gap analysis attacked this and largely won.**

Its counterexample: `manager / implementer / reviewer` — one of Cole's three named variants — **has no
per-scope seam owners**, yet `plan/methodology.md`'s ratify protocol prescribes per-owner seam
ratification and the SOP restates it. **Run the shipped skills against that config and the variant is
coerced back into the ownership model it exists to test.** That is skill prose overriding `seats[]`,
which is exactly what v1 claimed could not happen. It also contradicts the survey's own definition of
the COORDINATION bucket as content that _"varies by team shape… what an A/B varies"_ — 82 instructions.

**The corrected claim, weaker and defensible:** the variant **mechanism** is buildable independently
of externalization. **Whether variants differ substantively is not asserted — it is the first
experiment the instrument should run.**

**So it becomes MVP item 9, the acceptance test:** hand-write a 3-seat
manager/implementer/reviewer config, convene it, and **count the skill instructions the seats cannot
execute as written.** Non-zero means externalization is a precondition for variants too, and the
next phase is named by the count. **The build order does not change either way** — which is why this
correction is safe to be wrong about, and why it should not have been asserted as settled.

**Future Considerations:** methodology externalization; fork inheritance policy; non-dev archetypes
and a kind-appropriate shape-reader (the survey found the _conversation machinery_ already
domain-neutral — only the evidence feeding it is software-specific); cross-variant synthesis.

**And the one that unlocks simultaneous teams — a task board anthill owns.** Cole, 2026-08-09:
_"Either I'll update bounty to support multiple teams, or eventually I think we'll actually absorb a
version of bounty into our own tooling — the same way we absorbed grapevine, which turned into comms
but written for our purposes. I think we might do a similar thing with a task-oriented one."_

**Recorded here because it changes how MVP work should be SHAPED, not just what comes after it.** If
a first-party board is plausible, then every place this project touches the board is a place to avoid
deepening the coupling to spellbook's session model — and the concurrency guard above should name
**the board** as its reason so it can be retired precisely when that reason dies.

## Technical Approach

- `config.ts` — teams map; **`seatDir`/`seams` derived**; version check before shape check;
  `findConfigFile` unchanged.
- `team-support.ts:20-30` — `requireConfig` is the single insertion point for the ladder.
- `team-init.ts` — render through resolvers; derive gitignore lines.
- `migrate.ts` — pure and deterministic; the v2→v3 planner belongs there.
- `manifest.ts` / `team-join.ts` — emitted commands carry the resolved team.
- `team-spawn.ts:47-54` — reuse the launch-prefix mechanism and its charset guard.

**Dependencies:** none new.

**Pre-existing debt to pay alongside:** several emitted strings use a bare `anthill` instead of
`bun ${cliPath}` (`team-comms.ts:334,739,755`; `team-spawn.ts:290-291`), which
`team-join.ts:238-250` documents as resolving through PATH to a different cached launcher. **Ambiguous
today; wrong once teams multiply.**

## Impact & Risks

| risk                                                                | mitigation                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **A mis-resolved team reports `none`** — a confident false negative | Hard error; team named in `status` + manifest. **The central safety requirement.** |
| **Comms/scratch become tracked files** when `teamDir` moves         | Item 0. Found by two independent agents; live today for any override.              |
| **`upgrade` half-migrates, reports green**                          | Item 6.                                                                            |
| **A stale pin resolves confidently to the wrong team**              | Unresolved — validity check or derived value. Open Question 1.                     |
| **Variants may not actually differ**                                | Item 9 measures it rather than assuming either way.                                |
| **Scope creep into fork**                                           | Lineage recorded, policy deferred.                                                 |

**Complexity: High** — not per-change, but in blast radius: team resolution sits under every command,
and the failure mode is silent-wrong-answer.

## Success Criteria

1. **A single-team project sees zero change** — no new flag, no new file, no new concept, **and no
   forced migration.** _(If this fails, the design is wrong regardless of what else works.)_
2. **Two teams coexist on disk**, each with its own docs, wire, board and tmux session, switchable
   without either being destroyed — **and no agent ever names a team in a command.** _(Coexist on
   disk, not run simultaneously — see Decision Point 3.)_
3. **A wrong or absent resolution produces a named error**, never an empty roster/board/channel.
4. **A session is attributable to the team shape that produced it** — given a commit or a retro, you
   can say which shape, and group a set of sessions by it.
5. **`upgrade` on a two-team repo upgrades both or refuses**, never green having done one.
6. **A `teamDir` override no longer breaks** — the `docs/team/` layout bootstrap already sanctions
   actually works, with comms and scratch still ignored.

## Open Questions

1. ~~**Does the pin hold a name or something derived?**~~ **RESOLVED 2026-08-09 — it holds the name,
   and the validity check we lacked is already sitting in the config.** bounty needed a
   path-derived id because **it has no registry of valid boards** — a bare key could not be checked
   against anything, so the id had to carry its own scope. **anthill's situation is different: the
   config enumerates every legal team.** So a pin naming an unknown team is detectable by lookup,
   which is exactly the self-invalidation a derived value would have bought — a stale pin (team
   deleted or renamed) and a copied pin (team not in this project) both resolve to "not a configured
   team" and **throw**. No derivation needed; the check is `config.teams[name] ?? throw`.
2. **[→ CARRIED to [methodology-externalization](../methodology-externalization/proposal.md), 2026-08-10]** **Do teams share `principles.md` / `paper-cuts.md`?** Cole's cascade proposal — a **project-level**
   set that applies down and a **team-level** set that does not propagate up. Current reading:
   `retro.md` must be team-local (else attribution dies); `principles.md` wants both;
   `paper-cuts.md` is mostly project-global since the friction is in shared tooling. **A team-level
   entry that merely repeats a project-level one is a defer-to-one-source violation; one that
   overrides must say so and why** — and that disagreement is exactly the signal an A/B exists to
   produce. _(v1 contained a self-contradiction here — §4 said retro was already per-team, OQ3 said
   these files sit above `teamDir`. Both were artifacts of `teamDir` defaulting to `.anthill`.)_
3. **[→ CARRIED to [methodology-externalization](../methodology-externalization/proposal.md), 2026-08-10 — still the unclosed one]** **Can two variants be compared honestly at all?** Different work, different times, different
   accumulated context. **Restored — v1 dropped it entirely, and it may be the thing that decides
   whether capability 2 delivers anything.** A commit trailer makes a session _labelled_, not
   _comparable_.
4. **[→ CARRIED to [methodology-externalization](../methodology-externalization/proposal.md), 2026-08-10]** **Is a team the same object as a seat TIER?** [non-dev-seats](../non-dev-seats/proposal.md) gives
   the research tier its own directory and declares it **cross-project** — which a `teamDir` that
   swallows tier dirs would break. **Item 0's derivation defuses the blocker** (tier naming stays
   that proposal's call), but the research tier's cross-project claim still needs reconciling.

---

**Related Documents:**

- [One project, many teams](../../investigations/2026-08-09-one-project-many-teams.md)
- [Selecting a team without ever naming one](../../investigations/2026-08-09-team-selection-ergonomics.md) — concluded
- [Methodology survey](./methodology-survey.md) — **Finding 1 falsified; read the correction**
- [non-dev-seats](../non-dev-seats/proposal.md) · [Cole's note](operator://documents/68d31401-3a26-4a21-9e3a-6c8a82dd2783)

# Dev Kickoff: Multi-team support

**Branch:** `feature/multi-team-support` (already created, docs already committed)
**Created:** 2026-08-09
**Strategy:** Main repo

---

> ## ⚠ READ THIS BOX FIRST — the usual kickoff steps are ALREADY DONE
>
> **Do NOT run `dev-discovery`. Do NOT run `generate-dev-plan`.** Discovery, the proposal, a
> methodology survey and a ratified plan all exist and are committed. Four review passes have already
> run against them (one cold gap analysis on the proposal, one on the plan, plus an idiom review and a
> simplification review).
>
> **Your starting point is [`plan.md`](./plan.md), Phase 0.1.**
>
> The plan has been revised three times specifically so its tasks are executable by an agent with no
> context. If a task seems to be missing information, that is a real defect worth raising — not an
> invitation to go read the whole history.

## Mission

anthill supports exactly one team per project, and changing teams means overwriting the config —
which destroys the previous shape, leaves no lineage, and makes two shapes impossible to compare.
The manifesto now names **experimentation with team structures as a tent pole**, so this is a direct
contradiction: anthill claims team structure adapts to the work while supplying no instrument for
finding out which structure is better.

Build that instrument. A project gains a `teams` map, one team is resolved **ambiently** (agents must
never name a team in a command), and a session becomes attributable to the shape that produced it.
**A single-team project must see zero change.**

## Source Documents

- **[plan.md](./plan.md)** — **the plan of record; work from this**
- [proposal.md](./proposal.md) — the why, the ratified decisions, and the open questions
- [methodology-survey.md](./methodology-survey.md) — what's baked into skill prose (background; not
  needed to execute)
- [One project, many teams](../../investigations/2026-08-09-one-project-many-teams.md) — the open
  investigation
- [Selecting a team without ever naming one](../../investigations/2026-08-09-team-selection-ergonomics.md)
  — concluded; the seven design constraints came from here
- [PROJECT_MANIFESTO.md](../../PROJECT_MANIFESTO.md) — the experimentation principle this serves

## Constraints

**Execution model — different from this repo's usual flow.** You are the **lead**: you hold the plan,
own every commit, and run the gate. **This is NOT a convened anthill team** — no `convene`, no seats,
no seam ratification, no `finalize-session`. Dispatch **one-shot subagents** for individual tasks if
useful; the plan's tasks are written to be self-contained for exactly that.

**The lead's verification is not delegable.** A subagent reporting "tests pass" is a claim, not
evidence. **Run `bun run check` yourself before every commit.**

**Ratified decisions — do not re-litigate:**

- **`CURRENT_VERSION` stays at 2.** Bumping it forces a migration on every existing anthill repo for
  zero benefit, which falsifies success criterion 1 on day one. The v3 config shape is detected
  **structurally** (`"teams" in raw`), and **no new version is stamped**.
- **The env rung ships.** `ANTHILL_TEAM` is rung 2, exported from `buildSeatLaunch` beside
  `BOUNTY_SESSION_KEY`. The `{team}` launch-template token is **deleted** — any project that overrode
  `launch` would silently never receive it.
- **Simultaneous convened teams are forbidden**, guarded at `convene`. **The guard's message must name
  THE BOARD as the reason** — `.bounty-session` is one repo-root file, unconditionally overwritten.
  Cole intends to extend bounty or absorb a first-party board, at which point this guard retires.
- **The pin holds the team NAME**, not a derived value. The config enumerates every legal team, so a
  stale or copied pin fails the same registry lookup and throws.

**The invariant that outranks everything else:** a mis-resolved team must be a **hard error**, never
an empty roster/board/channel. On today's code an empty team is exactly what a lead is trained to read
as _"my seats are missing."_ **Every new resolution path gets a test asserting it throws.** No
fallback at any rung.

**Conventions:**

- Gate: `bun run check` (tsc + biome + `bun test`). Husky runs it on commit.
- Conventional commits; `AGENTS.md:44-53` — release-please hides `docs`/`test`/`chore`, so Phase 0's
  user-visible fixes are **`fix:`**. Each task states its type.
- **Run `cascade-check` after any prose edit** (`AGENTS.md:83`) — `bun run check` cannot see markdown
  drift.
- Test conventions: pure resolution uses a fake root + object fixtures (`config.test.ts:16-32`);
  anything touching the filesystem uses `mkdtempSync(tmpdir())` + `afterAll(rmSync)`, and
  **`tmpleak.guard.test.ts` enforces it.**

## Your Workflow

1. **Read [`plan.md`](./plan.md)** end to end, then skim `proposal.md` for the _why_ behind the
   ratified decisions.
2. **Start at Phase 0.1.** Phases 0 → 1 → 2 are strictly ordered; 3–6 depend on 1–2.
3. Per task: failing test → verify it fails → minimal implementation → verify it passes →
   **you run `bun run check`** → commit.
4. **Run the Phase 0 fixture gate** before starting Phase 1 — it is the only end-to-end check in the
   plan and it catches what unit tests cannot.
5. Raise anything the plan gets wrong. Four review passes found real defects in it; a fifth pair of
   eyes on contact with the actual code is expected to find more.
6. Update the Completion Status below as you go.

## Completion Status

- [x] Discovery complete _(proposal + methodology survey + two investigations)_
- [x] Plan created and user-reviewed _(v3; all decision points ratified by Cole)_
- [ ] Test plan created — **not created; deliberate.** The plan's own TDD-per-task structure plus its
      Testing Strategy section covers this. Revisit only if Phase 2's ladder proves harder to verify
      in unit tests than expected.
- [x] Phase 0 — the path layer _(0.1 `d8597c8`, 0.2 `5237dbe`, 0.3 `7777a37`, 0.4 `606865e`;
      **fixture gate PASSED** — `teamDir: ".anthill/teams/dev"` on a fresh repo renders, joins with
      every grounding path `exists: true`, and leaves comms + scratch untracked)
- [ ] Phase 1 — team identity in config
- [ ] Phase 2 — the resolution ladder
- [ ] Phases 3–6 — commands, guards, bootstrap, upgrade, attribution
- [ ] Tests passing
- [ ] Ready for merge

## Completion

When implementation is complete and all tests pass:

1. Run `/project-docs:finalize-branch` — code review, session document, branch prep.
2. Finalize-branch will present merge options; proceed with the appropriate one. Base is `develop`.

## Where the build diverges from the plan

**Record it in [`plan.md` § Implementation record](./plan.md#implementation-record--where-the-build-diverged-from-this-plan),
not here** — one home, beside the tasks it annotates. Append an entry whenever the shipped work
differs from what a task specifies, classified 🕳 gap / 🔧 improvement / ⚖ judgement. Step 5 of the
workflow above ("raise anything the plan gets wrong") is discharged by writing that entry.

## Notes

**Three hazards that have already been found the hard way. Each would fail silently.**

1. **`team-init.ts` uses `join(teamDir, relPath)` at THREE sites** — the `exists` idempotency
   predicate (`:223`), the write (`:228`), the `skipped` report (`:233`). **Remap the write and leave
   the predicate, and `init` overwrites a live seat doc containing that seat's accumulated
   knowledge.** All three move together. (Phase 0.1.)
2. **`team-comms.ts` deliberately bypasses `requireConfig`** — it has its own `loadTeam()`. Phase 2
   would otherwise finish green while `anthill comms read` binds to whatever config it finds up-tree,
   ignoring both the pin and `--team`. It has its own task (2.4) for that reason.
3. **`--team` must be declared on each command locally** — `cli.ts:18-19`: root args are NOT inherited
   into subcommands. Rung 1 of the ladder does not exist until every command declares it.

**Work deliberately filed OUT of this plan** — independently landable, and queuing them behind this
would delay real fixes: the bootstrap fail-open defect (a non-software repo is silently handed a dev
team — wrong today, with one team), the bare-`anthill`-in-emitted-strings debt, `migrate`'s
trailing-slash comms line, and the acceptance experiment (which becomes an investigation, not a phase).

**Open questions carried into implementation** (plan §Open Questions): the project-level vs team-level
cascade for `principles.md`/`paper-cuts.md`, and whether `.anthill/teams/<name>/dev/` conflicts with
[non-dev-seats](../non-dev-seats/proposal.md), which declares its research tier cross-project.

**Cole is available for decisions, and the previous session's agent is on call for context** behind
any of the ratified choices — ask rather than reconstructing from the documents.

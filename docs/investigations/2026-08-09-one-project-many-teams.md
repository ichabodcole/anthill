# One project, many teams — switching, forking, and what that costs the methodology

**Date:** 2026-08-09 · **Status:** open — current state established from the code; the design
question is open and now has a stated purpose behind it · **Author:** Cole + Claude Code
(unconvened session — no seat)
**Origin:** Cole, 2026-08-09, in conversation and then in
[`multi-agent-team-support-thoughts.md`](operator://documents/68d31401-3a26-4a21-9e3a-6c8a82dd2783)
(Operator → Anthill → Notes, v2)

> **⚠ This investigation was rewritten after reading Cole's note.** The first draft treated this as
> a config-ergonomics question and ranked the A/B use case as the murkier half. The note inverts
> that, and adds two requirements the first draft did not have (**fork**, and **externalized
> methodology**). What follows is the corrected framing.

---

## The question, and why it is a tent pole rather than a convenience

**Can one project hold more than one team — switch between them, and fork one into another?**

Cole's note supplies the motive, and it is not ergonomics:

> **"One of the tent poles of this project should be experimentation with teams — not just the
> ability to have a single team in a project, but to experiment with different shapes to see what
> works for that project."**

> **"Ant Hill … is an experimental framework for multi-agent coordination and project
> development."**

That reframes the work. This is not "it would be handy to switch configs." It is: **anthill claims
team structure adapts to the work, and currently supplies no instrument for finding out which
structure is better.** The manifesto says persistent friction should reshape the team; today
reshaping is destructive, unrecorded, and uncomparable. **The adaptation principle has no
measuring device.** (See [Should the manifesto change?](#should-the-manifesto-change) below.)

The lived version, in Cole's words:

> **"I start with a premise for an agent team and a project, and then as I'm working, sometimes the
> question arises — is this actually the right team? And I don't have easy, built-in tooling to
> decide that."**

## What is actually being asked for — four capabilities, not one

The note separates further than the original conversation did. These are listed in what looks like
increasing order of difficulty, and **the fourth is the one that decides the other three.**

**1. Multiple KINDS of team in one project.** A dev team and a creative team ("focused on product
ideas") in the same repo, each with roles appropriate to its kind.

**2. Variants of the SAME kind, for experimentation.** Concrete shapes Cole names as worth testing:
a large team; a team seated by application surface; and a **simplified manager / implementer /
reviewer** team that ignores surface entirely. The goal is comparative — _"see what a different team
shape actually gets you — where you get strengths and weaknesses"_ — and ultimately synthetic:
_"mix and match … figure out if there's a way to build a team that comprises the best of each."_

**3. FORK — and this was not in the original framing.** _"Being able to take one team and fork it to
some extent — or just create a copy — and then start a different path forward from that team, and
being able to switch back and forth between them."_ **A fork is not a copy of a config file.** A
team's substance is largely its accumulated living docs, and forking asks a question a `cp` cannot
answer: does the fork inherit the parent's seat docs, `seams.md`, paper-cuts, and retro — or start
clean? **Inherit and the variants are contaminated by shared history; start clean and you have
discarded the thing that made the parent good.** This is the hardest unresolved question in the
whole investigation.

**4. EXTERNALIZED METHODOLOGY — the precondition for all of the above.** Cole:

> **"An analysis of how much we bake into the current Ant Hill process that is focused on
> development specifically — and even beyond that, how much methodology we bake in generally … so
> that those things are externalized and contained within the team you create, versus baked into
> skill language."**

His proposed mechanism: **soft pointers** — the skill points at a document that holds the
methodology, and **that document is owned by the team**. With the caveat he raises himself: _"you'd
have to make sure that document exists."_

**Why this is the deciding capability:** if methodology stays welded into skill prose, then every
team in the project — creative, research, or dev-variant-B — inherits the dev team's methodology no
matter what its config says. **You cannot A/B team structure while the structure's operating rules
are constants.** Selection without externalization produces variants that differ only cosmetically.

**Note the tension this creates, and it is real.** anthill's adapts-not-dictates principle currently
lives _in_ skill prose — the skills are where "go check the project's actual standard" is
enforced. Soft-pointing methodology out to a team-owned document moves that enforcement into a file
the team can edit or omit. **Externalization and the guarantee that guidance actually fires are in
direct competition**, and this investigation should not pretend otherwise.

## Current state — established from the code

**Verdict: one project root, one team, no switch, no fork.** Cole's independent read matches:
_"we really only support one configuration file at a time. There's no sort of nesting, no concept
of switching between different teams, and no notion of a current default."_ He also judges it
_"not painted into a corner"_ — which the code supports.

### The blocker is one thing, in one place

`.anthill/config.json` is not merely _a_ config file — it is **THE project-root marker**.
`findConfigFile()` walks up from cwd looking for that exact hard-coded relative path
([`config.ts:234-253`](../../plugin/scripts/anthill/config.ts)), and every team command routes
through `requireConfig()` → `loadConfig()` **called with no arguments**
([`commands/team-support.ts:20-30`](../../plugin/scripts/anthill/commands/team-support.ts)).

- **No `--config` / `--team` flag** on any command.
- **No env override.** The only `process.env` reads in the entire CLI are `NO_COLOR` (`styles.ts`)
  and `TMUX` (`team-spawn.ts`, `team-attach.ts`).
- **Archetypes are bootstrap-time seeds, not a runtime selector.** `templates/archetypes/*.json`
  are read once by `anthill:bootstrap`, ratified, and compiled into `config.json`. Inert thereafter.
- **`anthill:bootstrap` refuses when a footprint exists**
  ([`skills/bootstrap/SKILL.md:26-27`](../../plugin/skills/bootstrap/SKILL.md)) — so "add a second
  team to this repo" has no home even as a manual operation.

### What already works in our favour

**1. Seats are content-free.** `validateSeat` requires `role` and `scope` to be non-empty strings
and nothing more ([`config.ts:124-142`](../../plugin/scripts/anthill/config.ts)). A seat with
`role: "art-direction"` is **already legal today.** What is dev-shaped sits one level up — the
archetypes, the `.anthill/dev/` scaffold, the doc templates, and the skills' vocabulary. **That is
exactly the surface capability 4 has to survey.**

**2. `channel` is already the namespace key.** It names the tmux session (default), the bounty
session key, and every comms path — `.anthill/comms/<channel>.ndjson`, `.positions`, `.departures`,
`.session.json` ([`comms.ts:188-598`](../../plugin/scripts/anthill/comms.ts)). Distinct channels
already do not collide.

**3. Living-doc paths are overridable.** `paths.teamDir` / `seatDir` / `seams` accept explicit
values ([`config.ts:191-196`](../../plugin/scripts/anthill/config.ts)). Separate teams can already
keep separate docs — the mechanism for fork's "start clean" branch partly exists.

**4. The taxonomy instinct is already in the tree.**
[`projects/non-dev-seats/proposal.md`](../projects/non-dev-seats/proposal.md) cuts seats by
**subject** — dev / support / research, each with its own `.anthill/` directory. Same instinct one
level down. **Whether these are one mechanism at two scales or two mechanisms is still open**, and
getting it wrong in either direction is expensive.

### What you can do today, and what it costs

Swapping the file works, because everything downstream is genuinely config-driven:

```
.anthill/config.dev.json       →  cp over .anthill/config.json
.anthill/config.creative.json
```

Each variant needs a distinct `channel` **and** a distinct `paths.seatDir` — without the second,
both teams write into `.anthill/dev/` and their living docs blend, **destroying precisely the signal
the experiment exists to produce.** Teardown must precede the swap: `anthill down` reads the live
config to know who to stand down, so swapping first orphans the running team.

A **nested-root** path also exists in principle: a subdirectory with its own `.anthill/config.json`
becomes its own project root, since discovery returns the first hit walking up. Untested, and it
relocates `projectRoot`, moving grounding resolution and scaffold with it.

## Open questions

**On externalized methodology (capability 4 — answer this first)**

1. **How much dev-specific methodology is actually welded into skill prose?** Cole asks for this
   analysis explicitly. Needs a survey of the six lifecycle skills plus the doc templates, sorting
   each instruction into: universal to any team / dev-specific / project-specific.
2. **How do soft pointers preserve the guarantee that guidance fires?** If the pointed-at document
   is team-owned, it can be edited into uselessness or fail to exist. What is the floor, and what
   happens on a missing target?
3. **Does externalized methodology conflict with adapts-not-dictates, or complete it?** Plausibly
   it _completes_ it — the principle says anthill supplies the trigger and the project supplies the
   content, and welding methodology into skills is anthill supplying content. **That reading is
   attractive enough that it should be actively attacked before being adopted.**

**On fork and lineage (capability 3)**

4. **Does a fork inherit living docs?** Neither answer is obviously right; see above.
5. **What records a team's lineage and which variant was live for a given session?** Nothing does
   today. Without it an A/B is **unattributable after the fact** — this is the gap with no current
   answer at all, and capability 2's entire value rests on it.
6. **Can two variants be compared honestly at all?** Different work, different times, different
   accumulated context. This is a **methodology** question, not a config one, and it may be the
   thing that decides whether capability 2 delivers anything.

**On selection (capabilities 1–2)**

7. ~~**Ambient or explicit?**~~ **SUPERSEDED 2026-08-09 — moved to its own investigation:
   [Selecting a team without ever naming one](./2026-08-09-team-selection-ergonomics.md).** Cole ruled
   against per-call naming (_"I would not want… every time an agent has to use a CLI tool they also
   have to specify the team"_), which **disqualifies the `--team`-flag design rather than merely
   ranking it lower** — so this stopped being a sub-question of the mechanism and became a constraint
   on it. **The failure mode of ambient selection is a seat silently joining the wrong team**, and
   that is now that file's central problem.
8. **Does switching get a lifecycle beat?** Standing down team A before B convenes is currently
   human discipline. `anthill down`'s presence logic already knows how to refuse a stranding
   teardown.
9. **Do teams share `principles.md`, `paper-cuts.md`, `retro.md`?** These sit at `.anthill/` root,
   above the per-team `seatDir`. Some content is about the _project_, some about the _team_ — and
   this question forces a line nobody has drawn.

## Next steps

1. **Survey what's baked in (Q1).** The precondition for everything else, and the one Cole named
   directly. Cheap, first-party, and it separates the config problem from the methodology problem.
2. **Falsify the "hand-write a non-dev config" path.** Actually write a creative or research team
   config, convene it, and record where it snags. First-party evidence beats reasoning about it,
   and it tests step 1's conclusions against reality.
3. **Resolve Q4/Q5 (fork semantics and lineage) before any directory layout is designed** — these
   determine what a team _is_ on disk.
4. **Read this against `non-dev-seats`** and decide: one mechanism at two scales, or two.

**Explicitly not yet:** designing the `--team` flag — and it is now **ruled out** as the primary
surface, not merely deferred. See
[the ergonomics investigation](./2026-08-09-team-selection-ergonomics.md), which carries the
selection question in full.

## Should the manifesto change?

Cole flags his note as _"sort of an update to the manifesto or one of the principles."_ Assessment:
**yes, and it is a genuine addition rather than a clarification.** The manifesto currently says
structure adapts to the work; it does not say **anthill is an instrument for experimenting on team
structure**, which is a stronger and more specific claim, and one that would decide design questions
the current text leaves open. Recommend adding it in the manifesto's existing quoted-anchor style.
**Not done unilaterally** — the manifesto's anchors are quoted _rulings_ with provenance, and this
note is thinking-in-progress; elevating it to a tent pole is Cole's call to confirm.

## Recommendation

- [x] **More Research Needed** — current state established; the design question now has a stated
      purpose, four separable capabilities, and a precondition that must be surveyed first.

**Rationale:** The blocker is small and well-located, which means the risk is not "can we build it"
but **building the wrong thing quickly.** Cole's note relocates the centre of gravity from selection
(easy, and nearly free given `channel` and `paths.*`) to **externalized methodology** (hard, and in
tension with a standing principle). Building selection first would produce switchable teams that all
behave identically — the appearance of the capability without the substance.

---

**Related documents:**

- [`multi-agent-team-support-thoughts.md`](operator://documents/68d31401-3a26-4a21-9e3a-6c8a82dd2783)
  — Cole's note, Operator → Anthill → Notes. **The source of record for intent here.**
- [`plugin/scripts/anthill/config.ts`](../../plugin/scripts/anthill/config.ts) — the config layer
  and root-marker discovery
- [`plugin/scripts/anthill/commands/team-support.ts`](../../plugin/scripts/anthill/commands/team-support.ts)
  — `requireConfig()`, the single choke point a selector would pass through
- [`projects/non-dev-seats/proposal.md`](../projects/non-dev-seats/proposal.md) — seat tiers by
  subject; possibly the same mechanism one level down
- [`PROJECT_MANIFESTO.md`](../PROJECT_MANIFESTO.md) — adapts-not-dictates, and the section the
  experimentation tent pole would join

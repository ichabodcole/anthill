# Selecting a team without ever naming one — the agent-experience question

**Date:** 2026-08-09 · **Status:** ✅ **concluded** — both research steps run; both hypotheses
falsified against their attractive readings; seven design constraints derived. **Design work moves to
[the project](../projects/multi-team-support/proposal.md).**
**Author:** Cole + Claude Code (unconvened session — no seat), with two tracing subagents
**Origin:** Cole, 2026-08-09, mid-session, after
[the multi-team investigation](./2026-08-09-one-project-many-teams.md) surfaced selection as an open
question

> **Split out deliberately.** The sibling investigation asks **whether** a project can hold many
> teams and **what a team is** on disk. This one asks **what using it feels like to an agent**, and
> it is a different discipline — the mechanism could be correct and the experience still bad enough
> that seats route around it. Cole raised it as _"almost like a UX or Agent X investigation."_

---

## The requirement, as stated

> **"One thing that I would not want is that every time an agent has to use a CLI tool they also
> have to specify the team they want to do this for. I think that should be something where you can
> sort of easily set which team you're working with and then everything is automated so you're not
> worrying about having to specify that once it's set for the session."**
> — Cole, 2026-08-09

And the standard it is held to:

> **"We've done a lot of work on the CLI tools to improve them, and I want to make sure that we are
> continuing that with this work — especially in terms of making it a first-class, easy to use,
> consistent kind of experience."**

**This rules out the obvious design.** A `--team <name>` flag on every command is the cheapest thing
to build and it is what the sibling investigation's Q7 listed first. It is now **out** as the primary
path — per-call naming is exactly what Cole does not want. That is a ruling, not a preference to
weigh, and it should be recorded as one before anybody drafts a CLI surface.

## Why this is genuinely hard rather than just a default-value problem

The failure mode of ambient selection is **a seat silently working against the wrong team** — and
this project's entire scar corpus is about that exact shape: an operation that succeeds, plausibly,
with the wrong answer.

The canonical instance is already documented in `plugin/skills/join/SKILL.md:144-160`: an unknown
**flag** is refused by name with exit 1, while an unknown **positional** is swallowed — `exit 0`,
`ok:true`, and the entire log comes back. The skill's own verdict: _"It succeeds, plausibly, with the
wrong answer."_ **An ambient team selector that resolves to the wrong team has precisely this
signature**, and would be discovered the same way — late, by someone noticing the volume of what came
back was wrong.

So the design question is not "how do we avoid typing the team name". It is: **how do we make the
ambient binding both invisible in the common case and impossible to be silently wrong about.**

## The precedent nobody has to invent — anthill already did this once

**`anthill convene` already solves this problem for the BOARD, and the solution is first-party,
shipped, and has a measured failure mode.** From `plugin/skills/convene/SKILL.md:97-110`:

> _"convene now **opens/attaches the team board itself** — keyed to the channel and pinned (writes
> `.bounty-session` at the repo root), so every seat's + the lead's bounty verbs bind **this** board
> by construction. **In a single working tree the binding is ambient — nobody passes `--session`, and
> that is the guarantee this design is for.**"_

That is Cole's requirement, already built, for a different noun. **The team selector should almost
certainly be the same mechanism**, and the investigation should start by asking why it would not be.

**And the precedent comes with its failure mode already paid for**, which is worth more than the
mechanism: putting seats in separate git worktrees breaks the ambient binding **silently**, because
the board id derives from the repo path and `.bounty-session` is gitignored so it never crosses. The
skill's note — _"Measured, and every seat hit it"_ — is the warning label a team selector would
inherit unchanged.

## The insight that may make the whole question smaller than it looks

**Agents may never need to name a team at all, because they already do not name anything else.**

The established pattern is that **the CLI computes fully-resolved command strings and the agent runs
them verbatim.** `plugin/skills/join/SKILL.md:80-86` states it as a rule with teeth:

> _"Run the commands your manifest printed — **verbatim, exactly as given**. They arrive fully
> resolved, with your handle and channel already interpolated. **If you find yourself substituting
> your handle into a command, or reconstructing one this skill describes in prose, stop**."_

The skill deliberately refuses to print those commands even as examples, on the grounds that a copy
in prose is the copy nobody updates. **So the agent-facing surface is already
"run what you were handed."** If team resolution happens once — at join/convene — and is baked into
every string the CLI emits thereafter, then **the number of places an agent could name the wrong team
is zero**, and the ergonomic question collapses into a resolution-order question inside the CLI.

> ## 🔴 FALSIFIED AS STATED — 2026-08-09. The bounds are the design.
>
> **Next step 2 is DONE**, run adversarially against the CLI source and every skill. The verdict is
> **TRUE-BUT-BOUNDED, and the bounds are large enough that "zero places" is false.** The section
> above is kept as written because the reasoning that produced it is the reasoning most likely to be
> repeated. **The corrected version is below.**

### Where the hypothesis actually holds

Exactly one class of command: **operations whose every argument is known at join time from config
alone.** That is the comms `follow` incantation (`comms.ts:169-174`), the stand-down
(`team-join.ts:485`, `team-convene.ts:301`), the land command (`team-join.ts:230-263` — the strongest
emission in the codebase), and the board `tail`/`state` reads (`team-join.ts:437-438`).

### Where it breaks, ranked

**1. The join call itself is composed, and nothing precedes it.** `join/SKILL.md:20,44` tells an
agent to run `anthill join <handle>` — assembled from a human's natural-language utterance. **There
is no manifest before the manifest**, so the hypothesis is circular: emission only begins _after_ the
agent has already correctly identified the team. **13 of the 15 CLI commands are only ever reached by
composition.**

**2. The `comms` skill is 100% composed — structurally, not sloppily.** Zero emitted strings in the
whole skill: `read --last <N>`, `read --since <id>`, `read --id <id>`, `send --stdin`,
`send --as-of <id>`, `positions`. The codebase argues the reason itself at `team-join.ts:459-464`: a
catch-up anchor _"does not exist until the seat has a position, so there is no value to resolve at
manifest time."_ **Any verb whose argument is discovered at runtime can never be emitted, only
described** — and those verbs all take `--channel`, which is exactly the flag a multi-team design
wants ambient.

**3. The manifest emits composable templates, breaking its own rule.** `team-join.ts:439` emits
verbatim: `` `bounty update <id> --status doing` `` — **bare binary, no `bun ${cli}`, no `--as`,
unresolved `<id>`** — three lines below correctly emitting `bun ${cli} tail --mine --as ${handle}`.
So **the highest-frequency team-scoped write in the system goes through a string the agent
assembles.** And `join/SKILL.md:84` promises the skill _"deliberately does not spell out those
commands, not even as an example"_ while `:237-241` spells out two.

**4. `git` is the entire shared-tree mutation surface and has no emission at all.**
`finalize-session/SKILL.md:451-476` walks a lead through `git stash push -u`, `git checkout
stash@{0}`, `git stash pop` — and `:457` states that **`anthill commit`'s serialize lock does not
cover `git stash`.** The most dangerous cross-seat operation in the system is composed by hand.

**5. Ambient-by-cwd is ALREADY MEASURED BROKEN, and the documented remedy is composition.**
`convene/SKILL.md:99-110` — worktrees silently rebind, _"Measured, and every seat hit it"_, and the
fix is _"resolve the board id once and hand it to them explicitly. **That is the case where a seat
does pass a session flag.**"_ **This is a first-party falsification of ambient scoping in the nearest
analogous mechanism.**

**6. `config.launch` carries the handle and nothing else** (`config.ts:33`); a seat's team arrives
only via the pane's `--cwd` (`team-spawn.ts:210`). Meanwhile the _board's_ binding **is** transmitted
explicitly as a charset-guarded env prefix, `BOUNTY_SESSION_KEY=${sessionKey}`
(`team-spawn.ts:47-54`). **anthill has already built the ambient-scoping mechanism this design wants
— for someone else's tool, and not for itself.**

**7. Emitted strings are not uniformly resolved.** Several use a bare `anthill` rather than
`bun ${cliPath}` (`team-comms.ts:334, 739, 755`; `team-spawn.ts:290-291`), which
`team-join.ts:238-250` documents as resolving through PATH to a _different, cached_ launcher.

### The human's surfaces are the worst case, not an afterthought

`anthill attach` and `anthill status` are **fully composed and structurally cannot be otherwise** —
there is no human manifest, and the human's binary is a separate global install with no `cliPath`
self-resolution. Both resolve the team by `findConfigFile()` from cwd. The only overrides are
`--session` and `--channel`, which name a **tmux session** and a **wire** — sub-resources, not teams.

**And the failure is silent in the most misleading possible way:** a wrong-team `status` prints
`On comms: (nobody)` (`team-status.ts:90-103`), which the convene checklist explicitly teaches a lead
to read as _"seats are missing."_ **A mis-resolved team would present as an empty team**, sending the
lead to chase seats that are fine — the exact scar already recorded at `convene/SKILL.md:130-133`.

### The bounds, as design constraints

1. **Team resolution must survive the bootstrap call.** It must live in the environment (cwd, env
   var, or pinned file) and **never be a flag agents are trusted to pass** — because the calls that
   would carry it are composed by construction.
2. **Emit-and-run only covers config-derivable arguments.** For runtime-argument verbs, team scope
   must be **ambient at the CLI**, not baked into a string.
3. **Ambient-by-cwd alone is already known to fail** under worktrees. A cwd-derived selector
   reproduces a measured bug.
4. **A mis-resolved team must be a hard error, never an empty roster/board/channel.**
5. **Extend `config.launch` + `buildSeatLaunch` to carry an anthill team key** the way
   `BOUNTY_SESSION_KEY` already is, and have the CLI prefer it over the cwd walk.
6. **`git` is out of reach of any emission** and mutates the shared team resource. State that
   boundary rather than assuming it away.
7. **`attach` and `status` need a first-class team selector** that is not `--session`/`--channel`.
   This is the surface most likely to silently mis-resolve.

## The precedent, traced — and it is a cautionary tale as much as a template

**Next step 1 is DONE** (2026-08-09, from the CLI source plus spellbook 2.1.0 at
`~/.claude/plugins/cache/spellbook-marketplace/spellbook/2.1.0/skills/bounty/scripts/cli.ts` — the
live version, since `resolveCoordCli` selects the highest semver).

**First correction to this document's own framing: anthill does not write `.bounty-session`.**
Spellbook's `bounty` CLI does, as a side effect of `open --pin` (`cli.ts:514-524`); anthill only
passes the flag (`commands/team-convene.ts:62-79`). The file is one line — a **derived** board id
(`k-<slug>-<sha256(repo-root)[0:8]>`, `cli.ts:129-136`), gitignored, which anthill ensures in consumer
repos via `team-init.ts:107`.

### Resolution is a six-rung ladder, and the pin is only the fifth rung

`cli.ts:165-201`: `--session-key` → `--session` → `$BOUNTY_SESSION_KEY` → `$BOUNTY_SESSION` →
`.bounty-session` **walk-up from cwd** → `undefined`.

**Three properties matter for our design, and they pull in opposite directions:**

**🟢 A found pin is never second-guessed.** If the pin yields an id and that board is dead,
`requireSession` (`cli.ts:203-207`) exits 2 with a real message. It does **not** silently retarget.
**This is the good property and it is the one worth copying.**

**🔴 A MISSING pin does not fail — it binds a machine-global stranger.** Rung 6 returns `undefined`,
which resolves to `bounty-latest.json` in tmpdir (`cli.ts:85-87`) — the **most recently opened board
anywhere on the machine, across all projects**. If any unrelated board is live, the verb succeeds
against it with no warning. **Translated to teams: "no team selected" would quietly resolve to
whichever team anyone last touched, anywhere on the box.** That is the single thing this design must
not inherit.

_(anthill half-anticipated this: `team-support.ts:78-79` surfaces the board `title` so an ambient
read is "self-evidently labeled". **But nothing ever asserts the title against the channel** — the
label is emitted and never checked.)_

**🔴 The walk-up has no repo boundary.** It terminates at the **filesystem root**, with no `.git`
stop condition — so it will find a pin in `$HOME` or `/`.

### The multi-team case is already reachable today, and the precedent's answer to it is bad

**Convening a DIFFERENT channel overwrites the pin silently and completely.** `writePin` is an
unconditional `writeFileSync` — no existence check, no compare, no lock — and `--pin` is honoured on
**all four exits** including the refusal path (`cli.ts:610`). The old board keeps running; every
un-flagged verb in the tree now binds the new one. **Last writer wins, in silence.**

Worse: **a convene that FAILS still re-binds the tree.** anthill passes `--restore` unconditionally
(`team-convene.ts:77`), which on an attach hits `ATTACH_LOST_FLAGS` → exit 2 → anthill records
`boardOpened = false` and pushes a warning — **but the pin was already written.**

### Worktrees: confirmed from source, and it is two failures, not one

1. **The env-key leg breaks.** `findScopeRoot` stops at `exists(join(dir, ".git"))`, and in a linked
   worktree `.git` is a _file_ — which `existsSync` accepts. So the scope root is the worktree root,
   a different path, a different sha256, **a different derived board id.**
2. **The pin leg cannot rescue it.** The pin lives at the main tree root and a sibling worktree never
   walks up to it — and even if it did, `team-spawn.ts:53` exports `BOUNTY_SESSION_KEY`, which sits
   **one rung above the pin** and shadows it.

**So a spawned seat in a worktree is strictly worse off than one whose lead exported nothing** — the
env rung that exists to help is precisely what makes the fallback unreachable.

### One more asymmetry worth designing around

**The pin's write location and the id's scope are computed differently.** `writePin` uses raw
`process.cwd()` (`cli.ts:515`); `sessionKeyToId` uses `findScopeRoot`. **So a lead who runs
`anthill convene` from a subdirectory gets the correct board id but the pin file lands in that
subdirectory** — and every seat whose cwd is elsewhere misses it on walk-up. anthill passes no `cwd`
to `execCoord`, so nothing prevents this.

### What this means for the team selector

- **Copy rungs 1, 2 and 5** (explicit flag, explicit id, pin walk-up). **Make rung 6 a hard error.**
- ~~**Probably do not add an env rung at all**~~ — **🔴 THIS RECOMMENDATION WAS WRONG. Reversed
  2026-08-09; the env rung ships.** The reasoning was a bad analogy: bounty's env rung makes worktrees
  fail worse because it carries a **key derived against the repo path**, so a worktree derives a
  different board and the env shadows the pin. **A team selector carries a NAME checked against the
  config's registry** — `ANTHILL_TEAM=dev` resolves correctly from any directory, worktree or not.
  **The failure mode does not transfer, and this file generalised it without checking.**
  _Kept rather than deleted: the error is the transferable lesson — a precedent's failure mode is only
  inherited along with the mechanism that caused it._
- **Write the pin at the resolved project root, not `process.cwd()`** — which is what everyone
  already assumes it does.
- **⚠ And the property a team pin CANNOT inherit for free:** bounty's pin stores a
  repo-path-scoped **derived id**, so a stale pin is self-invalidating and a pin copied between repos
  is inert. **A team pin holding a bare team _name_ has neither property** — a copied or stale name
  resolves confidently to the wrong team. If the pin holds a name, it needs its own validity check;
  if it holds something derived, that has to be designed.

## Open questions

**On the binding itself**

1. **What is the pin, and where does it live?** `.bounty-session` is the precedent — a gitignored
   file at the repo root. Does the team pin go in the same place, in `.anthill/`, or in the shell
   environment? Gitignored means per-checkout, which is right for "which team am I working with" and
   wrong if two people expect to share it.
2. **What happens when the pin is missing or stale?** The board's answer is that a missed verb
   _"reports no running session, which reads as 'the board isn't up'"_ — an unhelpful failure that
   the skill has to warn about in prose. **A team selector should do better than the thing it is
   modelled on**, and this is the place to spend the design effort.
3. **Is there a single-team fast path?** The overwhelmingly common case is one team per project, and
   it must stay exactly as ergonomic as it is today — **zero new concepts, zero new flags, nothing to
   set.** A design that taxes the common case to serve the rare one is the wrong trade.

**On the moment of switching — the part that cannot be ambient**

4. **What is the switch verb, and who may run it?** Switching is a deliberate act, so it is the one
   moment that _should_ be explicit and loud. Is it `anthill use <team>`, a flag on convene, or a
   consequence of convening a different channel?
5. **Can a switch happen with a team still convened?** `anthill down` already refuses to tear down
   while seats are present or while presence cannot be established
   (`plugin/skills/finalize-session/SKILL.md:518-558`). A switch under a live team is the same class
   of hazard and probably wants the same guard.
6. **What does a seat see if the team switches under it?** A spawned seat holds its handle and
   channel from join. If the pin moves mid-session, the seat's emitted commands are stale — and per
   Q2 they may fail in the unhelpful direction.

**On where the binding gets resolved (added 2026-08-09 from the
[methodology survey](../projects/multi-team-support/methodology-survey.md))**

**The `launch` string is the likely resolution point, and it is already configurable.**
`templates/archetypes/*.json:38` reads `launch: claude "/anthill:join {handle}"` — **`{handle}` is
the only interpolation**, so two teams' seats are indistinguishable at launch today. But `launch` is
a config field, which means the place a team binding would be baked in **already exists and is
already per-team**. Likewise `channel` is currently doing three jobs at once (comms channel, bounty
session key, tmux session name) with **no team identifier above it** — there is no `name`/`id`/`team`
key in the schema at all.

**On consistency with what exists**

7. **Does `anthill status` name the active team?** Cheap, and it is the one surface that could make a
   wrong ambient binding self-evident rather than silent. **This may be the highest-value single
   affordance in the whole design.**
8. **Does the join manifest name the team it resolved?** Same argument, aimed at the agent rather
   than the human — and the manifest is already the seat's source of truth.
9. **What does the human's `anthill attach` do when several teams could be attached to?** The tmux
   session is named after the channel, so this may already work — worth checking rather than
   assuming.

## Next steps

1. ~~Read `.bounty-session`'s implementation end to end~~ **DONE** — see the precedent trace above.
2. ~~Falsify the "agents never name a team" hypothesis~~ **DONE** — falsified as stated; the bounds
   are recorded above as seven design constraints.
3. **Design the resolution ladder**, which is now the concrete next piece of work. The shape the two
   traces converge on: **an explicit flag → an injected key (the `BOUNTY_SESSION_KEY` pattern,
   applied to anthill itself) → a pin walk-up from the resolved project root → HARD ERROR.** No
   machine-global fallback, no silent empty result.
4. **Then** design the switch verb, which is the one moment that should be explicit and loud.

**Explicitly out of scope here:** what a team _is_ on disk, fork semantics, and the externalized
methodology question. Those are the sibling investigation's, and mixing them is how this one would
stop being answerable. **`git` is also out of scope and must be stated as such** rather than assumed
away — it mutates the shared team resource and no emission or scoping design reaches it.

## Recommendation

- [x] **Create Project** — folded into
      [`multi-team-support`](../projects/multi-team-support/proposal.md). The research questions this
      file opened are answered; what remains is design, and it belongs in the proposal.

**Rationale:** Both hypotheses this investigation opened have been settled against their attractive
readings, and that is the useful outcome. **The precedent is a cautionary tale as much as a
template** — its missing-pin path binds a machine-global stranger, and its worktree behaviour is a
measured first-party falsification of ambient scoping. **And the emitted-command hypothesis is false
as stated**: 13 of 15 commands are reached only by composition, the manifest itself hands out
templates, and the human's surfaces have no manifest at all.

**What survives is better than what was proposed**, because the constraint list is derived rather
than guessed. The single most important line in it: **a mis-resolved team must be a hard error, never
an empty team** — because on today's code an empty team is exactly what a lead is trained to read as
"my seats are missing."

---

**Related documents:**

- [One project, many teams](./2026-08-09-one-project-many-teams.md) — the sibling; mechanism, fork,
  and externalized methodology. **Its Q7 is superseded by this file.**
- [`multi-team-support` project](../projects/multi-team-support/proposal.md)
- `plugin/skills/convene/SKILL.md:97-110` — the `.bounty-session` ambient-binding precedent
- `plugin/skills/join/SKILL.md:80-86` — the emitted-command rule, and `:144-160` — the
  succeeds-with-the-wrong-answer scar this design must not reproduce

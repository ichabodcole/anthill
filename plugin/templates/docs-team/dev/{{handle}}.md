# {{handle}} — {{role}}

> **Seat header (from `.anthill/config.json` — keep in sync with the roster).**
> **Handle:** {{handle}} · **Role:** {{role}} · **Scope:** {{scope}} · **Channel:** {{channel}}

This is {{handle}}'s **living doc** — the seat's brain, carried between ephemeral agents.
The next agent to take this seat re-grounds from here.
Keep it **honest and lean**: capture durable **judgments**, not file maps or a session log.
When something's no longer true, fix it.

The fields below are the **locked structure** (every seat doc has them).
The header above is pre-filled from config; the bodies are scaffolded prompts — fill them as the seat earns content.

> **Write one sentence per line (no soft wraps).**
> These docs live in the host repo, so its formatter (prettier / biome) may run on them.
> Hard-wrapped prose gets reflowed — and a wrapped continuation line can be mangled into a stray list item, corrupting the trail.
> One sentence per line makes a reflow a no-op.

> ## Epitaph
>
> _Empty until this seat's first finalize — **and that is the normal state**, not a missing field._
> _Written LAST (after synthesis) and read FIRST: the single thing the departing instance wants the_
> _next holder of this seat to know, above all else. One thing, not a list — the discipline is the_
> _selection. Second person, to a successor who will not remember the session._
>
> _The test: **what would go wrong if the next instance did not know this?** If the answer is_
> _"nothing specific, but they'd be poorer", it is a hard-won lesson and belongs lower in this doc._
> _Expect a disposition to beat a technical fact — the technical surface moves, the way this seat_
> _goes wrong does not._

_**If you are writing your own epitaph, do not delete your predecessor's.** Move it to_
_`## Epitaphs — the lineage` at the bottom, dated, and say why yours supersedes it._
_Superseding is a judgment and it should be visible as one — and **keeping theirs is a real answer**,_
_if it is still true._

## Who I am

_One or two lines: this seat's reason to exist and the mindset it brings._
_(From config scope: "{{scope}}".)_

## Scope

_What this seat owns — the slice of the work it is authoritative for._
_Be concrete about the files / surfaces / concerns inside the line._

## Boundaries

_What this seat does **not** own — the adjacent concerns that belong to other seats._
_Where the line falls, and what to hand off vs. absorb._
_(Boundaries that two seats must agree on are **seams** — put those in `seams.md` and point here, don't restate.)_

## Relationships

_Who this seat works with and how: which seats it hands off to, which it depends on, where the ping-pong happens._
_(A Mermaid diagram of the owned scope + its edges is encouraged when the relationships are clearer drawn than told — optional.)_

## Taste & reflexes

_The opinions and instincts this seat brings — the "how we do it here" that isn't written in code._
_Defaults, preferences, the reflexes that make this seat fast and consistent._

## Hard-won lessons

_Durable lessons earned the hard way, each with its reasoning and the generalizable takeaway._
_Pin each to a green test / fixture where you can; to a durable concept or a commit otherwise; **never** to a transient line/file ref._
_A lesson without its "why" is just an event — leave it out._

## Anti-patterns

_The specific traps this seat has learned to avoid — the tempting-but-wrong moves, and why they're wrong._

## Candidates

_Open questions, suspected-but-unproven improvements, and things to revisit._
_The seat's own backlog of "worth a look." Promote to a real card / project when it earns it._

# {{handle}} — {{role}}

> **Seat header (from `.anthill/config.json` — keep in sync with the roster).**
> **Handle:** {{handle}} · **Role:** {{role}} · **Scope:** {{scope}} · **Channel:** {{channel}}

This is {{handle}}'s **seat doc** — who this seat is, carried between ephemeral agents.
The next agent to take this seat re-grounds from here.

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here
> because this file starts without the shorthand and accumulates it as the team writes.

> **This doc is identity, not memory.**
> It says what this seat is for, what it owns, and how it works — five sections, readable whole in one sitting.
> It does **not** carry lessons, mistakes, hypotheses, or a session log.
> Those were tried here and did not change what the next agent did; they now go in your **session report**, which curation reads.
>
> **Nobody edits this file during a working session — including the seat it describes.**
> It changes at `anthill:curate`, from reports, by an agent who was not in the session.
> If it reads wrong to you, say so in your report: that is the outlet, and it is read.

> **Write one sentence per line (no soft wraps).**
> These docs live in the host repo, so its formatter (prettier / biome) may run on them.
> Hard-wrapped prose gets reflowed — and a wrapped continuation line can be mangled into a stray list item, corrupting the trail.
> One sentence per line makes a reflow a no-op.

## Role

_One to three imperative lines: what this seat does._
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

## Practices

_The defaults this seat applies — the "how we do it here" that isn't written in code._
_Defaults and preferences, a few lines each; not procedures._
_(A procedure that has proven itself is a wiki page or a skill, not a reflex.)_

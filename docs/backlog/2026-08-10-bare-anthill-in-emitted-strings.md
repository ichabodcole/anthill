# Bare `anthill` in emitted strings resolves to a different binary than composed them

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one mechanical edit, 4 sites
**Surface:** `plugin/scripts/anthill/commands/team-comms.ts:334,739,755` + `team-spawn.ts:290-291`

**Wrong today, with one team.** These emit a bare `anthill …` for a seat to run verbatim. A bare
`anthill` resolves through PATH to the launcher, which picks the **highest cached release** — so the
string can execute on a _different binary than the one that composed it_, and a flag the composing
binary has may not exist there.

`buildLandCommand` (`team-join.ts`) already solved this and documents why: resolve to
`bun ${cliPath}`, the emitting `cli.ts`, so the string is self-consistent by construction. These four
sites never got the same treatment.

**Also the only real fix for the older-cached-CLI problem** that the multi-team proposal's Decision
Point 1 rationale mistakenly claimed a version check would solve — a claim that proposal corrected in
place.

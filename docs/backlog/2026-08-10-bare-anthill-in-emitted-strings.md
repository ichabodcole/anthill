# Bare `anthill` in emitted strings resolves to a different binary than composed them

**Added:** 2026-08-10 · **Status:** ✅ **SHIPPED** 2026-08-10 on `fix/bare-anthill-in-emitted-strings` · **Shape:** NOT mechanical — see below
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

---

## ⚠ Filed as "one mechanical edit, 4 sites". It was neither.

**Five sites, and only TWO are defects.** The line numbers had drifted, and more
importantly the item recorded _where_ the strings are without recording _who reads
them_:

| site                          | context       | audience | verdict            |
| ----------------------------- | ------------- | -------- | ------------------ |
| `team-spawn.ts` ×2            | `renderText`  | human    | **correct as-is**  |
| `team-comms.ts` `emitError`   | both formats  | agent    | **defect — fixed** |
| `team-comms.ts` `catchUpWith` | payload field | agent    | **defect — fixed** |
| `team-comms.ts` anchor hint   | `renderText`  | human    | **correct as-is**  |

**Applied as filed, this would have regressed the human surface to fix an
agent-facing bug.** `--format text` is the human half of the dual-audience
envelope, and a person typing `anthill attach` _wants_ PATH resolution — that is
exactly what the optional global launcher is for (`bootstrap` §1: _"purely for the
human; agents don't need it"_). Resolving those hands them an absolute path into a
plugin cache.

**Guarded, in both directions**, by `commands/bare-anthill.guard.test.ts`: no bare
`anthill` may reach the JSON envelope, **and** the human-facing hint must still say
bare `anthill` — so a later cleanup sweep cannot quietly undo the distinction. Both
mutation-verified.

_The guard also matched its own explanatory comment on first run — the same
self-match `tmpleak.guard.test.ts` records about itself. It strips comments before
scanning, and says why._

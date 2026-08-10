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

## ⚠ Filed as "one mechanical edit, 4 sites". It was neither — and my first count was also wrong.

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

---

## Second round — review found I applied my own rule to ONE file and stopped

The judgement call held: review attacked _"`renderText` is human-only"_ directly and could not break it
(`resolveFormat` returns `"text"` only for a TTY; **nothing** in any skill, template or doc tells an
agent to pass `--format text`; `convene`'s SKILL even states the lead's `spawn` is not a TTY). **That
reframing was right.** What was wrong is that I stopped at the file I happened to be in.

**Three more of the same class, all reproduced:**

- **`team-feedback.ts` `submitCmd`** — the exact `catchUpWith` twin: a bare `anthill` in a **payload
  field**, and `finalize-session` §447 tells the lead to run it. **`.anthill/dev/seams.md` Contract 2
  already enumerated it** — _"`submitCmd` in `feedback` … the stronger case because it is a string we
  hand a seat to re-invoke"_. **I ran a five-site audit without consulting my own repo's ratified list
  of agent-re-invoked strings.**
- **`team-attach.ts:180`** — `spawn one with: anthill spawn` in an `emitError`. Same construct as the
  one I fixed, in the same commit that articulated the rule.
- **`team-attach.ts:79`** — `Pick one: anthill attach --session …`, paste-runnable, into `emitError`.

**And the guard was worse than no guard in two ways**, both demonstrated:

- its window heuristic was documented as _"over-includes, which makes the assertion STRICTER"_ and is
  **provably the opposite** — a hit swallowed by a `renderText` window is silently exonerated, and
  those windows land in live handler code;
- its closed verb list missed **6 of 6** injected variants, including `spawn` — so it could not have
  caught this branch's own biggest miss.

**Rebuilt as an ALLOW-LIST** (the `tmpleak.guard.test.ts` shape): scans every source file, **derives
the verb set from `anthill help`** so a new command joins the scan the day it is added, and fails
CLOSED on anything unlisted. Each of the 13 entries states whether it is _human_, _template_ or
_prose_, and why.

**One test was also lying.** `the gap command actually WORKS` passed **with the bug reintroduced** —
`anthill` exists at `~/.bun/bin`, so the bare string resolved through PATH and returned the right
answer. It now runs on a PATH containing only a `bun` symlink, which keeps it executable while making
a bare `anthill` unresolvable. Verified: 1 fail before, **2 fail** after.

_The lesson is not "audit harder." I had a rule, applied it correctly, and applied it to one file. The
repo already held the list I needed._

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

---

## Third round — the guard could not see a revert of the defect it was built for

**F1, and it is the worst finding this item has produced.** The rebuilt guard deduped hits by the
MATCHED SUBSTRING, so its allow-list key was _(file, verb-phrase)_ — meaning the one allow-listed
human-facing `anthill comms` in `team-comms.ts` **exonerated every `anthill comms` in that file**,
including the two agent-facing ones this whole item exists to fix. Measured: reverting the
`emitError` fix left the guard green **and the full 688-test suite green**.

> A bare `anthill comms read …` inside an `emitError` that literally says _"Read them with:"_ could
> be reintroduced with nothing going red.

Keyed on **context** now — the matched text plus a quote-free slug of the preceding 52 characters —
so each occurrence is its own entry and a new agent-facing string in an already-listed file fails
CLOSED. Verified: reverting either fix now fails the guard.

**F2 — three "prose" entries were argument-free runnable commands in agent-facing envelopes**, which
is the same classification error as round 1 pointing the other way. `anthill down` in
`team-convene`'s and `team-team`'s `emitError`, and `anthill init` in `team-join`'s `warnings[]`,
are structurally identical to `team-attach`'s `anthill spawn` — which round 1 called a defect and I
fixed. **The branch cannot have it both ways.** All three now resolve. The discriminator the
allow-list already used is the honest one: _carries a `<placeholder>`, so it cannot be pasted and
run._

**F3 — the shape assertions passed on a bogus path.** `startsWith("bun /")` + `contains("/cli.ts ")`
stayed green when the helper was mutated to `bun /nonexistent/wrong/cli.ts`. They now assert the
path **exists**. Same class as round 1's finding: an assertion that looks like it proves resolution
and does not.

**F4 — four guard-defeat vectors closed**: `anthill help` (the help output does not list itself, so
the derivation was self-blind), `anthill --version`, string concatenation split across lines (this
codebase splits long errors at ~100 columns, so a formatter break between `anthill` and its verb
exonerated the string), and a double space.

**F5 — the rendered team docs had no shorthand legend.** All seven skills carry _"`anthill <command>`
is shorthand, not a binary on PATH"_; `templates/docs-team/README.md` instructs seats to run
`anthill comms stand-down --as <handle>` and carried none. Added.

**Also folded** `team-convene`'s two hand-rolled copies of the derivation onto the shared helper —
the helper existed to end that duplication and had not been applied to its own neighbour.

_Three review rounds, each finding what the previous two missed. The pattern across all three is the
same: the rule was right every time, and its APPLICATION kept stopping at whatever I happened to be
looking at._

---

## Fourth round — the discriminator is `renderText` vs `emitError`; the stated REASON is who reads it

**Not a defect — an accepted cost that is nowhere recorded as accepted, and that contradicts the
reason given for the other half.** The guard, the helper's doc comment and round 1's table all draw
the line at the CONSTRUCT (`renderText` = human, `emitError` = agent). But every justification is
about the AUDIENCE — and **`emitError` fires in both formats, so under `--format text` its reader is
a TTY human**, the same person `renderText` is protected for.

**Measured — `anthill attach` on a repo whose session is not running, `--format text`:**

```
Error: no team session "lean" running — spawn one with: bun /Users/…/anthill/plugin/scripts/anthill/cli.ts spawn
```

That is exactly the harm round 1 called decisive when it declined to touch the `renderText` sites:
_"a person typing `anthill attach` WANTS PATH resolution — resolving hands them an absolute path into
a plugin cache."_

**`attach` is the sharpest case, and it is one of the two strings round 2 resolved.** The file's own
header says so — `team-attach.ts:92-93`: _"a **human-facing convenience** … from a non-TTY (an agent)
it just hands back the command"_ — and `bootstrap` §1 names `anthill attach` as the example of what
the optional global launcher exists for, which is the citation round 1 used. **`attach` splits its
audience on `isTty`, the same predicate `resolveFormat` uses**, so the construct-based rule and the
audience-based reason come apart here most visibly. `:79` (`Pick one: … attach --session`) and `:180`
(`spawn one with: … spawn`) are both affected.

**Two honest options. Both are defensible; what is not defensible is leaving the reason and the rule
saying different things.**

- **(a) Make the helper format-aware** — `emittingCli(format)`, returning bare `anthill` for `"text"`.
  Each audience gets what it needs, the envelope already differs by format elsewhere (`data` vs
  `renderText`), and every `emitError` call site named above already has `format` in scope.
- **(b) Keep "always resolve" and write the cost down** — an agent on the wrong binary is a real
  failure, a human on an ugly path is cosmetic, so the asymmetry is worth paying. Then say that in
  the helper's doc comment, where it currently claims a clean split that does not hold.

**⚠ Whichever is chosen, apply it by rule and not by file.** `buildMissingWarnings`
(`team-join.ts:593`) is a PURE builder with no `format` parameter, so (a) does not reach it without
threading one — that is the kind of exception this item has three times failed to notice. **Decide
the rule, apply it everywhere `format` is available, and record what happens where it is not.**

### Resolved: **(b)** — the rule stands, the reason was repaired

The finding is correct and the contradiction is real. It is resolved by **fixing the sentence, not the
code**, because the honest form of the rule turns out to be construct-shaped after all:

> **`renderText` is the one surface an agent can NEVER read.** Everything else — `emitError`, payload
> fields — is **DUAL-READ**, and resolves anyway. The test is _"can an agent ever read this"_, not
> _"is the reader human"_.

`emitError` under `--format text` and `submitCmd` (in the JSON envelope **and** printed by `feedback`'s
`renderText`) are both dual-read, so the human cost is real and is now **written down as accepted**:

> A human sees a long absolute path in an error. An agent that does not resolve **runs a different
> binary and fails in a way nothing reports.** The asymmetry is the whole reason, and it is worth
> paying.

**Why not (a).** `emittingCli(format)` gives each audience what it wants, but it makes every call site
responsible for passing `format`, **fails OPEN when one forgets** — the agent silently gets the bare
form, which is the original defect — and does not reach pure builders that have no `format` at all
(`buildMissingWarnings`, exactly the exception this item asked to be checked for). Recorded as
rejected-and-reversible in the helper's doc comment, not dropped.

**Applied by rule, not by file, and re-checked as such.** Under the honest test every allow-list entry
still holds: the `human` entries are reached only through `renderText`, and **every** non-`renderText`
entry carries a `<placeholder>` — verified line by line — so none is paste-runnable. `config.ts:382`
and `feedback.ts:78` are backticked prose. **No code changed; two doc comments did.**

_Verified independently before filing: the rebuilt guard genuinely fails closed. Reverting the
`comms` `emitError` fix goes red, and a NEW bare `anthill down` injected into an already-allow-listed
file (`team-spawn.ts`, whose `renderText` entries are listed) is reported by name. F1's repair holds._

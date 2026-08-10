# Defect sweep — loose fixes surfacing around the multi-team branch

**Filed:** 2026-08-10 · **Status:** Open · **Shape:** one `fix:` branch, or several small ones
**Source:** MVP item 8 of [multi-team-support](../projects/multi-team-support/proposal.md) (moved out
at finalize) + that branch's independent review.

**None of these is multi-team work.** They are grouped only by when they surfaced. Two are wrong
**today, with one team** — those are the ones worth pulling forward.

---

## 🔴 1. bootstrap fails open on a non-software repo — WRONG TODAY

**Was MVP item 8 of `multi-team-support`, and was never built.** It got swept into that proposal
because it touches `bootstrap`; it has nothing to do with team resolution.

A non-software repo scans to `data.workspace === null`, **the single-surface branch fires
unconditionally**, and the project is handed the `layered-app` archetype verbatim — an engine seat
scoped to _"goldens, unit tests"_ in a repo with neither.

**Why it is the worst one here: it produces a team, the team is meaningless, and nothing reports a
problem.** A bootstrapping agent has no signal that the shape it just ratified with a human was a
fallback. Same family as the invariant the multi-team ladder is built on — _a wrong answer must be a
named error, never a plausible-looking empty one._

## 🔴 2. Bare `anthill` in emitted strings — WRONG TODAY

`team-comms.ts:334,739,755` and `team-spawn.ts:290-291` emit a bare `anthill …`. A bare `anthill`
resolves through PATH to the launcher, which picks the **highest cached release** — so a string a
seat is told to run verbatim can be executed by a _different binary_ than the one that composed it.
`buildLandCommand` already solved this (`bun ${cliPath}`) and documents why; these four sites never
got the same treatment.

**This is also the only real fix for the older-cached-CLI problem** that `multi-team-support`'s
Decision Point 1 rationale mistakenly claimed a version check would solve — a claim that proposal
corrected in place.

## 3. Cross-knob living-docs overlap survives `validateAcrossTeams`

**Reproduced 2026-08-10.** The check compares same-knob pairs only (`a.seatDir` vs `b.seatDir`), never
across knobs. So:

```jsonc
"dev":  { "paths": { "teamDir": ".anthill" } },       // seatDir → .anthill/dev
"lean": { "paths": { "teamDir": ".anthill/dev" } }    // teamDir → .anthill/dev
```

is accepted, and `init` writes `.anthill/dev/README.md` for `dev` then reports it **`skipped`** for
`lean`, which silently inherits the other team's roster README. `ok: true`, one file, two owners —
the failure mode task 1.3 exists to prevent, arriving through a gap in the check.

**Low reachability:** needs a hand-authored `paths` override. No documented route produces it — §0a
gives the incumbent `.anthill` and lets new teams default to `.anthill/teams/<name>`. Shipped prose
(`bootstrap` §0a: _"no two teams may resolve to the same `teamDir`, `seatDir` or `seams`"_) is, read
literally, still true — **which is exactly why this is worth fixing rather than documenting.**

## 4. Declared-total fields vanish from JSON when `undefined`

`ShowData.forkedFrom`, `TeamRow.lead` / `forkedFrom` / `forkedAt`, `UseData.previous` are typed
`string | undefined`, and `JSON.stringify` drops them. This codebase argues at length
(`agent-layer.ts:25-33`, `team-support.ts`'s `uncheckedAgainst`) that **a sometimes-absent field is
unreadable** — you cannot tell "inapplicable" from "unpopulated" from "older binary". Use `?? null`.

**Repo-wide idiom question, not a multi-team one** — worth doing as one sweep with a guard, rather
than field by field.

## 5. Smaller

- **`loadConfig` has no production caller left** (`config.ts`) — only tests and one convene-test mock.
  Its doc comment still presents it as the fs entrypoint peer of `loadProject`.
- **A non-object `paths`** (e.g. a string) is spread character-by-character and silently resolves to
  the default `teamDir` instead of erroring.
- **`team ls` refuses on a stale pin.** Deliberate — the error names the valid teams — but it sits
  against the branch's own rule that _a command that helps you resolve ambiguity must not require
  ambiguity to be already resolved._ Decide it rather than leaving it as a wrinkle.
- **`migrate.ts` hardcodes `.anthill/comms` / `.anthill/current-team`** while `team-init` derives the
  comms line from `teamDir` — divergent on a `keepPaths` migration. Pre-existing for `comms`; the pin
  and `.bounty-session` ops inherit the pairing (correctly, since both are `CONFIG_DIR`-fixed, but the
  three now read as inconsistent).

# CI has no spellbook, so every live coordination guard is skipped there

**Added:** 2026-08-10 · **Status:** Open · **Shape:** a CI step, plus a decision about what it costs
**Surface:** `.github/workflows/ci.yml` · affects `coord.test.ts` (live smoke) and
`commands/team-support.boardbinding.test.ts` (the round trip)

## What happened

`bun run check` went red on the `develop → main` PR, on one test:

```
(fail) ROUND TRIP — what `convene` writes, this reader recognizes
        > a real convene's `.bounty-session` resolves back to the team that wrote it
682 pass · 1 fail
```

It shells out to a real `anthill convene`, which needs spellbook's `bounty`. **CI installs only
Bun and the repo's own deps** (`ci.yml`: `setup-bun` → `bun install --frozen-lockfile` → `bun run
check`), so `bounty` is absent, `.bounty-session` is never written, and the assertion fired.

**Green on every developer machine, red on the one environment that had never seen spellbook.** Fixed
by gating it with `test.skipIf(!haveSpellbook)` — **the idiom this repo already used two files over**
(`coord.test.ts`'s live smoke, keyed on the same `SPELLBOOK_CACHE_ROOT`).

## The part that is not fixed

**A skip is silent, and this one hides a real coverage hole.** The round trip's entire job is to
catch spellbook changing its derived-id format (`k-<key>-<hash>`), which
`boardOwnerFromBinding` parses. If that derivation changes, the reader returns `null` for every
binding and the convene guard **fails OPEN** — restoring the board-rebind hole it was added to close.

So: **a green CI is not evidence the round trip holds.** Only a green local run is, and only on a
machine with spellbook installed. That is now true of two guards, and it will quietly become true of
every future one, because the idiom that fixes the red is the same idiom that hides the gap.

## Options

- **(a) Install spellbook in CI.** Truest coverage; costs a checkout of another repo (or a plugin
  cache restore) and couples the gate to an external repo's availability. Needs a decision about
  pinning: an unpinned install means an upstream change turns our CI red, which is **arguably the
  point** of this guard, and arguably intolerable in a required check.
- **(b) Leave it skipped and make the skip LOUD.** A summary line in CI naming which guards did not
  run, so nobody reads green as complete. Cheap, honest, and does not actually test anything.
- **(c) A contract fixture.** Record a real `.bounty-session` id as a golden and parse that. Runs
  everywhere — and cannot catch an upstream change, since the golden is ours. **This is the option
  that looks like coverage and is not**; noted so it is rejected on purpose rather than adopted by
  default.

**Lean:** (a) with a pinned spellbook ref, plus (b) regardless — a named skip costs one line and the
alternative is a green tick that means less than it appears to.

## The lesson, which is the same one three times this week

The test carried a comment saying precisely the right thing — _"if bounty is unavailable the marker
never appears, **report** that rather than asserting on a file that was never written, **so a missing
dependency does not read as a format change**"_ — **and then asserted anyway.** The intent was
written down, the code did the opposite, and the gap between them was invisible on every machine that
happened to satisfy the dependency.

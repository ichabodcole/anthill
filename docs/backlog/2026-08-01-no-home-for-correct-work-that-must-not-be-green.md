# No home for correct work that must not be green yet

**Added:** 2026-08-01 · **Status:** ready to design (the naive fix collides with "anthill adapts, not
dictates") · **Seat:** weaver (concept) + forager (if a mechanism is built) · **Found:** StoryLoom's
first dev cycle

Their verify seat ended the session **holding a failing test that proves an open gate item** — by his
account the single most valuable thing he had for whoever continues. It had nowhere to go:

- **It cannot land.** A red test in a tree-wide gate blocks **every seat's** commit, not just his.
- **It cannot persist.** `.anthill/scratch/` is gitignored, so it dies with the session.
- **Its existence survived only in a vine message**, which also evaporates.

> **The SOP says synthesize lessons into the seat doc — but a seat doc holds _prose_, and this is an
> _executable_ artifact whose entire value is that it runs.**

So the one artifact that could hand the next agent a **proof** instead of a **claim** is the one the
system has no place for. That is pointed for a project whose thesis is stigmergy: we preserve the
description of the problem and discard the thing that demonstrates it.

## Why the obvious fix is wrong

The obvious answer is a `parked/` directory that is committed but excluded from the gate. **It fails
on a principle we hold deliberately:** the gate belongs to the **host project** — `tsc` include globs,
biome's `files.includes`, the test runner's discovery — and **anthill adapts to a project's tooling,
it never dictates it.** A `parked/` convention only works if anthill edits three pieces of the host's
config, differently for every toolchain, and keeps them right forever.

That is the same over-reach the plugin has avoided everywhere else, and it would break on the first
project with an unusual runner.

## Shape of the fix (not settled) — extension-based parking

**Park by renaming, not by configuring.** A file named `foo.test.ts.parked` is:

- **committed** — it is a real tracked file, so it survives the session and reaches the next agent;
- **invisible to the gate by construction** — it is not `.ts`, so `tsc` skips it, biome skips it, and
  no `*.test.ts` glob matches it. **No host config is touched, and it works on any toolchain that
  discovers tests by extension**;
- **revived by a rename** — one word, no reconstruction, and the diff shows exactly what was proven.

That last property is what a seat doc can never give: **the next agent runs it rather than reading
about it.**

**Verified, not assumed** (2026-08-01, throwaway dir): a `parked.test.ts.parked` containing a
deliberately failing test sat beside a passing `real.test.ts`; `bun test` reported **1 pass / 0 fail**
— the parked file was not discovered at all. So the mechanism holds for this repo's runner with zero
configuration. **Still unverified for other runners** (vitest/jest globs differ) — check before
claiming it is toolchain-agnostic.

**What still needs deciding:**

- **Where does it live?** Beside the code it tests (discoverable, but litters the lane) or under a
  known root (findable, but divorced from context). Leaning beside the code — the value is the pairing.
- **⚠ What re-reads it?** This is the real risk and the SOP already names the rule: **no store without
  a named re-read moment.** A parked test that nobody revives is a write-only leak wearing a useful
  hat, and it rots **silently** — worse than the vine message it replaces, because it looks like
  coverage. Candidate triggers: `join` listing parked artifacts in the manifest (the seat inheriting
  the lane is exactly who should see it), or the finalize drift pass.
- **Does it need a header?** A bare parked test says what fails, not **why it is parked or what would
  un-park it**. Probably a required first-line comment: the claim, and the condition for reviving.
- **Is `.parked` even the right suffix**, or should it be a directory-plus-extension so a whole
  slice can be parked at once?

## Related, and possibly the same shape

This is adjacent to the atomic-cross-seat-land protocol that shipped as SOP guidance the same day
(_"draft out-of-tree in gitignored scratch → post READY → assemble → one gate run"_). Both are about
**work that is correct but not yet landable**. The difference: that protocol handles work parked for
**minutes**, in a session, deliberately unshared. This handles work parked **across sessions**, whose
whole point is to be shared. **Worth checking whether one mechanism serves both before building
either.**

## Acceptance Criteria

- [ ] An executable artifact that must not be green can be **committed** and **survives the session**.
- [ ] It is invisible to the host gate **without anthill editing the host's tooling config**.
- [ ] Reviving it is a rename, not a reconstruction.
- [ ] It has a **named re-read moment**, or it is not built.
- [ ] It carries why it is parked and what would un-park it.

## References

- StoryLoom round 3, their verify seat's finding 4.
- `plugin/templates/docs-team/README.md` — the atomic-land protocol, the adjacent case.
- [What teams invent, and where it should live](../investigations/2026-08-01-what-teams-invent-and-where-it-should-live.md)
  — this is a **tooling** answer in that triage: mechanical, no judgment, every team hits it.

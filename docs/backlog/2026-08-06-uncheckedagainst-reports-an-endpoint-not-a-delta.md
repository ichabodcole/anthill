# `uncheckedAgainst` reports an endpoint, not a delta — and half of that is already written down

**Status:** Backlog — **the finding is real and verified; two of the report's three asks are already met or partly met. Needs scoping before it is picked up.**
**Found:** upstream, [anthill#90](https://github.com/ichabodcole/anthill/issues/90) — the `thoth` seat, Spellbook team, 2026-08-06, against 2.0.0
**Verified:** 2026-08-06 against `develop` @ `932596e`

---

## The finding

`anthill commit` does not run the gate — the land string is `<gate> && anthill commit …`, chained by
the shell (`team-join.ts:243`). So `commit` starts _after_ the gate finished, and its single
`git status --porcelain` samples the tree at the far end of a window it never saw the start of.

Measured by the reporters: four seats, one shared tree, a ~106-second gate. Clean tree at t+0,
checked deliberately. Three peer paths in `uncheckedAgainst` at t+106. **Both true, 106 seconds
apart.** Three seats hit a non-empty field in one session and each drew a different conclusion.

**Confirmed, and the endpoint is even later than they modelled.** `git status --porcelain` appears
exactly twice in the whole CLI, both in `team-commit.ts` — `:467` (failure path) and `:526` (success
path), mutually exclusive branches. The success-path sample runs **after** `acquireLock` (`:346`, up
to `LOCK_WAIT_MS = 90_000`) **and after `git commit` itself completed** (`:457`), so after the husky
hook ran too. There is no earlier sample, no stored baseline, and `commit`'s entire input surface is
its args plus the repo — **there is genuinely no gate-start reference point available to it.**

**The reporters are right that the sampling point should not move,** and right that
`team-commit.ts:519-527` is where the reasoning lives.

## Three corrections, and they shrink the ask

**1. That comment does not justify what they say it justifies.** It explains the field's _semantics_
(the gate reads the working tree, the commit holds named paths) and why it is printed on the success
path at all. It says nothing about _when_ the sample is taken relative to the gate. Their line
numbers are also off by ~5 — the code is at `:519-527`, not `:515-521`.

**2. The envelope is not timing-free.** It already carries `data.waitedMs` (`:21`, populated at
`:346`, emitted at `:533`) and `meta.durationMs` (`agent-layer.ts:90-92`, from `started` at `:213`).
What is absent is specifically **gate** duration; neither existing field is a proxy, since
`durationMs` starts when `commit` starts. So ask #2 — "report elapsed time" — is **half-built**, and
the remaining half is the part `commit` structurally cannot measure.

**3. `docs-team/README.md:185-205` already documents this exact problem for the lock-wait half of the
window,** including a measured case:

> _"**`waitedMs`** — … this **is** the concurrency window, measured rather than estimated."_
> _"⚠ … an empty `uncheckedAgainst` is not an all-clear — it is weakest exactly where it reads
> strongest… **the field is LEAST trustworthy precisely when `waitedMs` is LARGE**"_
> _"Measured: `waitedMs 11053.9` with `uncheckedAgainst []`, with two commits landing inside that window."_

**So the shipped docs already teach the endpoint-not-delta shape — from the false-negative
direction.** The report describes the false-_positive_ direction (a non-empty list naming peers who
were clean at gate start) and the **gate-duration** segment, and neither is covered. That is the real
uncovered surface, and it is smaller than the issue implies.

## Their ranked fix #1 is feasible and lands on the most fragile string in the codebase

The ask — have the emitted land string capture `git status` before the gate and hand it to `commit` —
is mechanically possible: `buildLandCommand` returns a plain string. But:

- **`commit` has no env-var plumbing at all.** `process.env` appears in the CLI only in `styles.ts:12`
  (`NO_COLOR`), `team-spawn.ts:264` and `team-attach.ts:179` (`TMUX`), and test support. This would be
  the first config-via-env path.
- **The natural shape needs the construct class the composition bans.**
  `BASE=$(git status --porcelain) && <gate> && anthill commit …` uses `$(…)`, which `decideGate:201`
  explicitly rejects. The check is applied to `config.gate` rather than the composed string, so it
  would not _fire_ — but the emitted string would then carry exactly what the function exists to keep
  out of it. `team-join.ts:235-242` records a prior attempt to add to this string that reintroduced
  backticks and made `bash -n` exit 2.
- **A flag would push a multi-line porcelain blob through the same shell** that `-F`/`--stdin`
  (`:215-238`) exist to keep message bodies out of.

## Prior art worth reading first

`team-init.ts:124-129` records a measured **false-positive epidemic** on this same field — an
untracked symlink rode `uncheckedAgainst` on 9 of 9 lands with zero informative values, and the
conclusion was _"a false positive on every single land is worse than no field at all, because it
trains the reader to skip the thing they were told to check."_ That was fixed at the source of the
pollution. **This report is the same end state reached by a route that fix does not cover — the paths
are real peer work and the field is behaving as designed** — which is the reporters' own framing and
is why it is worth taking seriously rather than filing as noise.

## What would close it

Ranked cheapest-first, and **the first may be enough**:

1. **Extend `README.md:185-205` to cover the gate-duration segment and the false-positive
   direction.** The section already has the right frame and a measured example; it is missing this
   half. Add the reporters' explicit line: **a pre-land cleanliness check does not hold on a shared
   tree**, so seats stop performing one and believing it.
2. **Emit gate duration.** Requires the land string to stamp a start time — same plumbing problem as
   fix #1 but carrying one integer instead of a porcelain blob, and it does not need `$(…)` if the
   timestamp is produced by the CLI rather than the shell. Scope this before committing to it.
3. **The full delta** — only if 1 and 2 prove insufficient. It is the most expensive option and it
   lands on the string with the worst breakage history.

⚠ **Do not move the sampling point earlier.** The reporters flag this themselves and they are right:
sampling at gate-start would agree with the seat's pre-check and be strictly worse, reporting a clean
optimistic view precisely when a peer wrote during the gate — the case the field exists to catch.

## References

- `plugin/scripts/anthill/commands/team-commit.ts:21`, `:213`, `:346`, `:457`, `:467`, `:519-527`, `:533`
- `plugin/scripts/anthill/commands/team-join.ts:189-244` (`decideGate` / `buildLandCommand`), `:235-242`
- `plugin/scripts/anthill/commands/team-init.ts:124-129` — the false-positive prior art
- `plugin/templates/docs-team/README.md:185-205` — the half already documented
- `plugin/scripts/anthill/agent-layer.ts:90-92`
- Related: [the word "gate" names two different things](2026-08-06-the-word-gate-names-two-different-things.md)
- Upstream: [anthill#90](https://github.com/ichabodcole/anthill/issues/90)

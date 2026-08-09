# `.anthill/scratch/` has a disposability contract, no disposal beat, and 15M of this repo's own history in it

**Status:** Backlog — **verified, and it reproduces here worse than upstream reported. Needs a design pass, not a delete command.**
**Found:** upstream, [anthill#93](https://github.com/ichabodcole/anthill/issues/93) — Spellbook team, 2026-08-06, against 2.0.0
**Verified:** 2026-08-06 against `develop` @ `932596e`, read-only

---

## The finding

`finalize-session/SKILL.md:91`, inside step 2:

> _"Your scratch is **disposable after synthesis** — the durable form is the seat doc."_

Every seat reads that, agrees, synthesizes, and leaves the directory exactly where it was. **There is
no beat that says now delete it, no command that does it, and no signal that it was skipped.**

Confirmed by sweep. Searching all of `plugin/` for any disposal verb within 60 characters of
`scratch` returns three hits, none of them an instruction: `migrate.ts:182` (removing a _vacated v1
config dir_), `team-join.test.ts:479` (a test asserting scratch is **not** claimed deleted), and the
contract line itself. All six skills, both template trees, and the full `plugin/scripts/` are clear.
There is no `plugin/hooks/` either, so no hook is doing it. Step 3.75 — the docs-of-record sweep, the
one beat that could plausibly have absorbed this — scopes itself to docs that make claims about the
tree (`SKILL.md:215-217`), so scratch is out of its domain by construction.

## It reproduces here, and this repo has known about it for a month

`.anthill/scratch/` currently holds **15M across 831 files in 6 seat dirs** — `scout` 8.2M/218,
`steward` 2.6M/199, `forager` 2.1M/167, `sentinel` 1.2M/151, `maestro` 584K/80, `weaver` 224K/16.
Oldest file **2026-07-10**, newest 2026-08-05. **~27 days of unbroken accumulation across every
seat.**

`team-join.ts:330-339` records the earlier discovery of exactly this — _"465 scratch files across six
seats, back to July 10, were on disk when this was found"_ — pinned by
`team-join.test.ts:479` (`anthill#56`). It is now 831. **The project already knows scratch is not
deleted; what it has never added is a beat that deletes it.**

And `.anthill/retro.md:477` is the strongest available corroboration, in the repo's own words:

> _"`.anthill/scratch/` is unauditable AND non-surviving. steward's holds the entire retracted S8-6
> report with **zero** retraction markers. Nothing will read it — **protection by accident, not by
> design.**"_

## A doc defect found while verifying

`finalize-session/SKILL.md:115`, in the epitaph rationale: _"session-end loss is **total**. There is
no scratch to recover it from."_

**That is false, and it is false in the direction that hides this issue.** The files persist —
`team-join.ts:340` says so explicitly, as the correction of an earlier wrong claim: _"Scratch is
gitignored, so it never TRAVELS — the files stay on your disk, but nothing commits them and no future
instance reads them."_ Two shipped statements about scratch disagree about whether it still exists,
and the one inside the finalize ritual is the wrong one.

## Three corrections to the report

None load-bearing, all worth having before someone acts on it:

1. **The contract is stated once, not three times.** The word "disposable" appears four times, but the
   other three are infrastructure prose about a _different_ directory being discarded during the v1→v2
   layout move. This slightly overstates how loudly the contract is asserted.
2. **There are 14 commands, not 17** (`cli.ts:66-79`). Their list of 15 names includes `support`,
   which is not a command — `commands/team-support.ts` is a shared helper module, imported by eight
   commands and registered by none. 17 is the count of non-test `.ts` files in that directory.
3. **The scratch grep returns 55 hits across 10 files, not two.** They missed `team-join.ts` and
   `team-support.ts:144`, and it cuts both ways: `team-join.ts:575-577` is where the seat scratch dir
   is **created**, which makes the asymmetry sharper than they drew it — **there is a mkdir path and
   no rm path** — while `team-support.ts:144` and `team-join.ts:330-339` show the codebase actively
   reasoning about scratch persistence, so "nothing in scripts/ thinks about scratch" is too strong.

Their conclusion survives all three intact: **no command deletes scratch.** The only `rm` touching
anything scratch-adjacent in the whole plugin is `migrate.ts:181`, and it removes the vacated v1
config dir during a one-time relocation.

## Why this needs a design pass, and the report already did it

The reporters measured the thing that decides the design. After a four-seat session their scratch held
8.0M across 8 entries:

- **3.5M** — the current session's four seats, all synthesized
- **4.5M** — a seat from _earlier_ sessions, plus two variant working dirs (`circe-p1s`,
  `circe-r3-p2`) matching no handle, plus 7 loose PNGs at the folder root owned by nobody

**A seat-driven sweep — "read `config.seats[]`, clear each seat's dir" — would have missed 4.5M of
the 8.0M**, because variant dirs match no handle, loose files sit at the root, and that seat was
unseated for the phase so it is not in the current roster at all. **A folder-clear would have
destroyed live cross-session working material.** Neither unit is correct alone, which is why the
useful shape is a **reporting** command rather than a delete one.

Their proposal, which reads sound against the measurement:

1. **`anthill scratch`** — enumerate every entry with size, mtime, and an owner verdict: _on the
   current roster_ / _off the roster_ / _unowned_. The third bucket is the one no ritual has eyes on,
   and naming it is most of the value.
2. **`anthill scratch clear --as <handle>`** — clears your own and only your own, on the same argument
   anthill already makes for landing your own seat doc.
3. **Gate it on synthesis, not the calendar** — refuse to clear if the seat doc has not landed more
   recently than the newest file in that scratch dir. Scratch is the only intake; clearing it before
   synthesis destroys what the seat doc is made from, and that failure is silent and total.
4. **Never auto-clear an unowned or off-roster entry.** Report and stop.

**Where it belongs in the ritual:** step 2, self-served, immediately after the seat lands its own doc
— the same beat and the same reasoning. It is the only moment when _"is this still needed?"_ is cheap
to answer and the last moment before the pane evaporates.

## Do not fix this with a sentence

The contract is already written and no seat is breaking it through ignorance. A fifth restatement adds
nothing: the ritual's last beat for a seat is _land your doc_, and cleanup falls after the point where
anyone is still reading. **A convention with no command and no report has no way to fail loudly** —
which is the same argument this project makes everywhere else.

## Acceptance Criteria

- [ ] Something enumerates scratch with an owner verdict, including the **unowned** bucket.
- [ ] Nothing auto-deletes an off-roster or unowned entry.
- [ ] Clearing is refused when the seat doc has not landed since the newest scratch file.
- [ ] `finalize-session/SKILL.md:115`'s "there is no scratch to recover it from" is corrected.

## References

- `plugin/skills/finalize-session/SKILL.md:91` (the contract), `:115` (the false line), `:215-217` (3.75's scope)
- `plugin/scripts/anthill/cli.ts:66-79` — the 14-command registry
- `plugin/scripts/anthill/commands/team-join.ts:330-339`, `:340`, `:575-577` · `team-join.test.ts:479`
- `plugin/scripts/anthill/commands/team-init.ts:98-101` (`SCRATCH_GITIGNORE_LINE`) · `migrate.ts:179-182`
- `.anthill/retro.md:477`
- Upstream: [anthill#93](https://github.com/ichabodcole/anthill/issues/93) · earlier: `anthill#56`

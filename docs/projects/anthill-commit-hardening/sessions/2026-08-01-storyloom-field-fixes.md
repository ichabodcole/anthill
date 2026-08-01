# Session — StoryLoom's field defects, and the one the review caught

**Date:** 2026-08-01
**Branch:** `fix/commit-attribution-and-visibility` (off `develop`)
**Shape:** solo (single seat/surface) — no convene, no ratify gate
**Gate:** 220 pass / 0 fail

---

## What this was

A consuming agent team (**StoryLoom**) completed its **first real development cycle** — four seats,
one shared working tree, ~2.5 hours, 30+ commits — and reported back. Everything anthill knew about
multi-seat coordination before this came from **planning-phase** sessions. This was the first evidence
from implementation.

Five of their findings were `anthill commit` defects. This branch fixes four of them plus a CLI-wide
parser defect, and lands the guidance the round earned.

## What shipped

**`anthill commit` — four items, one command**

1. **`--as <handle>`**, validated against the roster **before anything is staged**. Also closes a
   papercut where the flag was swallowed and its _value_ fell through as a positional, producing
   `path(s) not found: aesop` — an error naming the seat who typed it.
2. **`Anthill-Seat: <handle>` trailer.** All four of their seats proposed this independently. Every
   commit on a shared tree is authored by the human, so _"who landed this?"_ was unanswerable — their
   lead found an anomalous commit and had to **ask the channel**; the author was identified only
   because they volunteered. Appended, never substituted: `%an` still shows the human, so this **adds**
   a greppable seat rather than claiming to replace authorship.
3. **Foreign dirty paths named on SUCCESS — the false-GREEN.** The gate reads the **working tree**;
   the commit holds **named paths**; they coincide only when exactly one seat is dirty. A peer's
   _uncommitted_ code can satisfy your commit's dependency, the gate passes, and the landed commit is
   red in isolation — **silently**. The false RED was loud and already handled; this direction had
   nothing. Same set we already computed, printed in the direction nobody was looking.
4. **The gate-failure path emits the envelope instead of throwing.** A raw `throw` reached `cli.ts`'s
   fallback, which prints `err.stack` — five frames of Bun internals burying the foreign-red
   diagnostic.

**`define.ts` — unknown flags rejected (`strict: false` → `true`)**

Audited every call site first: **no command reads an undeclared flag**, and every `ctx.args._` use is
genuine positionals, so nothing depended on the swallow. The `catch` was the real landmine — it fell
back to treating **every argument as a positional**, so flipping `strict` alone would have turned an
unknown flag into _"all your args are paths."_ Unknown/invalid options now raise a `CLIError`, which
the dispatcher renders as usage + message, exit 1, no frames.

**Guidance — the first earned from a dev cycle**

Five SOP practices (never ask through a channel that blocks the answer; verify a claim that indicts
you as hard as one that flatters you; confirm a check processed a non-zero count; a contract is a
description not a trigger; the atomic cross-seat land — assemble, don't marinate), the
`finalize-session` **reconcile beat** (step 3.5), and the contract-trigger rule into both
`plan/methodology.md` and `plan/SKILL.md`.

## Code review — and the defect it caught

**Verdict: With fixes.** The reviewer found a **high-severity regression introduced by this branch**,
and it is the most instructive thing in the session.

Converting the gate-failure `throw` into `emitError + process.exit(1)` **silently dropped the lock
release**, because **`process.exit()` does not unwind `finally`**. The two sibling failure paths call
`releaseLock(lock)` explicitly for exactly this reason; the branch being changed — the _most common_
failure, a red gate — was the one that didn't.

**Reproduced before fixing**: a gate bounce left `anthill-team-commit.lock` held.

**Why it mattered more than a stranded file.** The consequence chain is **this file's own bug
(anthill#55) moved from the index onto the lock**: every peer then queues 90s in `acquireLock`, which
throws **before the `try`**, reaching `cli.ts`'s fallback and printing **the exact stack trace this
branch removed.** A fix for a stack-trace leak created a path that reproduces it, with team-wide
blocking attached. Same shape as #55 verbatim — _the event that blocked you also hides that you are
now blocking everyone._

**Why the tests missed it.** The suite asserts on the **index** and on **stderr**; it never asserted
on the **lock**. It would have passed unchanged with the bug present. Four other guards in this
session were verified by reverting them — which produced exactly the covered feeling that stopped the
fifth from being checked.

Two regression tests added: the lock is released after a bounce, and a peer can land promptly
afterward. Both fail with the fix removed.

**Everything else passed** — `--as` validates before mutation, false-GREEN timing is correct, the
`strict` flip handles short aliases / `=` form / `--no-X` / `--` + flag-shaped paths / zero-flag
commands, no new dependencies, and the tests exercise real throwaway repos rather than mocks. One
sub-threshold note: appending `Anthill-Seat:` after an existing trailer block is not a contiguous
`git interpret-trailers` block, though `git log --grep` works.

## Notes for the plan

This branch delivers work [`plan.md`](../plan.md) anticipated, plus a direction it did not:

- The plan scoped the foreign-red diagnostic to the **failure** path and **deferred a pre-flight
  proxy** ("so it needs no pre-flight proxy", "pre-flight proxy stays deferred"). The **false-GREEN**
  is a **third** direction — not pre-flight, not failure, but **success** — and it partially addresses
  [#50](https://github.com/ichabodcole/anthill/issues/50)'s concern from an angle the plan didn't
  anticipate. The pre-flight proxy remains deferred and is still the right call.
- Move 1 (protected-trunk guard) and the remaining intake items are untouched.

## What this did not fix

- **`aesop`'s parked-red gap** — no home for _"correct work that must not be green yet."_ A red test
  proving an open item cannot land (it blocks every seat) and cannot persist (scratch is gitignored).
  Needs design.
- **Per-seat liveness in `anthill status`** — a seat blocked behind a modal read as `present` for ~40
  messages while on the critical path. Weakly-held suggestion from their lead.
- **`docs/backlog/2026-08-01-the-cli-failure-surface-lies.md`** — the backlog item specifying two of
  these fixes lives on `feat/team-comms-slice-one` and is **not on `develop`**. It should be marked
  shipped once that branch lands, not before.

## References

- [`plan.md`](../plan.md) — the hardening plan this continues.
- `docs/backlog/2026-07-31-storyloom-round-three-at-first-dev-work.md` — the instrument that produced
  the round.
- `docs/investigations/2026-08-01-what-teams-invent-and-where-it-should-live.md` — the triage these
  findings were sorted through (tooling / guidance / team-local).

# StoryLoom's first dev cycle produced four `anthill commit` fixes — and the review caught a fifth

**Date:** 2026-08-01

A consuming team's first real development cycle (four seats, one shared tree) surfaced defects that
planning-phase sessions never could. Shipped: `--as` + an `Anthill-Seat:` trailer (attribution was
impossible — every commit is authored by the human), foreign dirty paths named on **success** (the
false-GREEN: the gate reads the tree, the commit holds paths), a clean failure envelope, and
CLI-wide rejection of unknown flags. **Independent review caught a regression this branch
introduced**: converting the gate-failure `throw` into `emitError + process.exit(1)` dropped the lock
release, because `process.exit()` does not unwind `finally` — stranding the serialize lock and
blocking every peer for 90s. Reproduced, fixed, and guarded.

**Key files:** `plugin/scripts/anthill/commands/team-commit.ts`, `plugin/scripts/anthill/define.ts`,
`plugin/templates/docs-team/README.md`, `plugin/skills/finalize-session/SKILL.md`

**Docs:** [Session](../projects/anthill-commit-hardening/sessions/2026-08-01-storyloom-field-fixes.md) ·
[hardening plan](../projects/anthill-commit-hardening/plan.md)

**The lesson worth carrying:** the suite asserted on the index and on stderr, never on the lock — so
it passed with the bug present. Four other guards that session were verified by reverting them, which
produced exactly the covered feeling that stopped the fifth from being checked. `process.exit()`
skipping `finally` is the mechanism; _feeling covered_ is why it shipped to review.

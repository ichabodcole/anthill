# The anthill CLI's failure surface lies — two shipped defects, one theme

**Added:** 2026-08-01 · **Status:** ready to build (both fixes are small; one is a single line) ·
**Seat:** forager · **Found:** team-comms session 1, all three by **execution**, none by reading

Two defects in shipped **1.7.0**, unrelated in code and identical in shape: **when something goes
wrong, the CLI's output does not let you tell what.** Filed together because the theme is the fix —
individually they look like paper-cuts, and together they are the amplifier for every future mistake.

Both were found by _running_ the tool during a live session. Both files had been read carefully, that
same day, by the people who wrote them.

---

## Defect 1 — every command silently swallows every unknown flag

`plugin/scripts/anthill/define.ts:219` passes **`strict: false`** to Bun's `parseArgs`. Unknown flags
are parsed into `values` and ignored. **No error, no warning, exit 0.**

Reproduced on a read-only path:

```
$ anthill status --totally-bogus-flag
{"ok":true,"data":{…}}          ← exit 0
```

**Why it is worse than it looks: it is the amplifier.** On its own, a swallowed flag is a typo that
does nothing. Combined with any missing-flag defect it converts a **usage error** into a **silent
wrong result**. The live instance:

- `plugin/skills/join/SKILL.md` **mandates** `--stdin` for any code-bearing message — a warning that
  has already paid for itself in the field (a StoryLoom seat followed it literally all session and
  said it was load-bearing).
- `anthill comms send` (new, this session) has **no `--stdin`**.
- `strict:false` means a seat that follows our own instruction gets **no error** — the flag vanishes
  and the message goes out wrong.

So the failure lands on the seat that **did what we told it to.** That is the third instance this
session of an instruction disagreeing with an affordance, and the only one where the disagreement is
silent in both directions.

**This is also anthill#54's shape one level up:** _a usage error and a broken tool are
indistinguishable unless the output disambiguates them._ Here the output does not disambiguate
anything, because there is no output.

→ **Fix:** `strict: true`, plus a usage envelope on the resulting parse error so a bad flag reads as a
usage error and not as a crash. **Check every call site first** — `strict:false` may be load-bearing
somewhere that passes through-flags, and turning it on blind would break those.

## Defect 2 — `anthill commit` leaks a raw stack trace on the gate-failure path

Five frames starting `at run (…/team-commit.ts:373:19)` print **beneath** an otherwise excellent
envelope, burying the one line the reader needs — the foreign-red diagnostic that says _the red is not
yours_.

**The regression guard exists and is correctly written:**
`expect(stderr).not.toMatch(/at run \(/)` — `team-commit.test.ts:98` and `:108`. **Both sit on the
argument-validation paths, which exit through the envelope and never throw.** The path that throws is
unguarded.

→ **Fix: one line**, added to a test that already exists. `team-commit.test.ts:344` and `:362` already
capture `stderr` and already drive a genuine throw via `installFailingHook`. No new fixture, no new
repo.
→ **File it at that size.** The verifier rescoped this before it was filed, and the reasoning
generalizes: _"'add a regression test for the gate-failure path' and 'add one assertion' get scoped and
deferred differently, and this one should not survive a second session."_ **Filing something as bigger
than it is defers it.**

---

## Why this is one item

Both are **the clause-moved-after-its-proof pattern**, and defect 2 is the cleanest instance anyone
found: `restoreIndex()` and the foreign-red diagnostic were added to that throwing path on
**2026-07-27–31**, the clause ("no raw stack framing leaks") stayed true of the two paths it was
written against, and **the proof list did not move with the surface.** Its own author wrote both halves
and did not notice.

The generalized trigger, from the same session:

> **Enumeration makes an incomplete proof list feel complete; a clause that moves after its proof list
> is written is what makes it actually incomplete.** The check is not _"did I enumerate failures?"_ —
> we always do. It is **_"did this clause change after I wrote its proof?"_**, which is rare and
> therefore checkable.

## Acceptance Criteria

- [ ] A bad flag produces a usage error, not `ok:true` — with the through-flag call sites audited first.
- [ ] A gate-failure bounce emits the envelope and **no stack frames**, guarded by an assertion on the
      throwing path.
- [ ] Neither fix lands inside the comms spike branch — both are pre-existing and CLI-wide.

## References

- [Session 1 friction log](../projects/team-comms-spike/session-1-friction.md) — §B1, and the
  distinction between tool gaps, anthill defects, and operator errors.
- [StoryLoom comms round](../reports/2026-07-31-story-loom-comms-round.md) — the `--stdin` warning's
  field evidence, and anthill#54's usage-error-vs-broken-tool shape.
- `plugin/scripts/anthill/define.ts:219`, `plugin/scripts/anthill/commands/team-commit.test.ts:344`.

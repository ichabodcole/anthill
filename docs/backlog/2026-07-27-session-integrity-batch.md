# Session-integrity batch — board destruction on re-open, and multi-session blindness

**Added:** 2026-07-27 · **Status:** ready to build (item 1 needs a spellbook-side check first) ·
**Seat:** forager

Two defects in how a session's coordination surfaces are stood up and reached. Item 1 is a
**data-loss bug** and is the highest-severity issue in the current feedback set.

---

## 1. 🔴 Convene's idempotent board re-open can destroy the session's board ([#43](https://github.com/ichabodcole/anthill/issues/43))

When the bounty daemon has died, `convene`'s idempotent re-open respawns an **empty** board under
the same session key. Any subsequent close of that empty board then **overwrites the key's
non-empty snapshot**.

A team lost a **9-task board mid-session** this way. It was recovered only because every card
change happened to have been narrated on the grapevine — i.e. recovery depended on luck, not on any
guarantee anthill offers.

This is the exact failure mode that board-session-binding was built to make impossible from the
_addressing_ side; it survives on the _lifecycle_ side. Idempotence that silently destroys state
isn't idempotence.

**Suggested fixes (the reporter offers three; any subset):**

1. A keyed respawn over a dead board should **restore from the key's snapshot** by default.
2. `convene` should **warn** when the key's snapshot holds more tasks than the live board.
3. Surface **bounty-daemon death** to the lead instead of silently opening fresh.

**Design note / dependency:** fix (1) is arguably spellbook's job, not anthill's — the reporter
notes a complementary guard was filed on the spellbook repo. Determine the split before building:
anthill likely owns (2) and (3) regardless, and they are cheap. **Do not let the spellbook
dependency block the warn.** Relatedly, the existing
[coord-daemon version-skew item](2026-07-10-convene-status-detect-coord-daemon-version-skew.md)
covers a different failure of the same daemon — check whether one detection pass serves both.

## 2. `anthill attach` is blind to multi-session teams ([#45](https://github.com/ichabodcole/anthill/issues/45))

`attach` assumes one tmux session per project and silently attaches to the first, with no signal
that others exist.

**Repro:** (1) `anthill spawn seatA`; (2) `anthill spawn seatB --session proj-p2`; (3)
`anthill attach` → lands on seatA's session, and seatB's is invisible.

The staged-spawn pattern that surfaces it is **legitimate and arguably encouraged**: adding seats
mid-session under a second session name is how you avoid `--force`, which would kill the live
session's panes. Both sessions join the same channel and board (binding is ambient, post
board-session-binding), so they are genuinely one team — but the human observing them can only ever
reach half of it.

**Expected:** `attach` enumerates all tmux sessions bound to the project/channel and either lists
them to choose from or honors a `--session` flag. Ideally `status` and `down` become multi-session
aware too, tagging sessions by project/channel rather than assuming the single
`config.channel`-named session.

**Severity:** low, but a genuine dead-end for the human whenever a team spans more than one session
— and the ambient-board work made spanning sessions _more_ attractive, so this will bite more, not
less.

---

## Acceptance Criteria

- [ ] A `convene` against a session key whose snapshot holds more tasks than the live board does
      not silently proceed — it warns, naming both counts.
- [ ] A dead coordination daemon is surfaced to the lead rather than papered over by a fresh open.
- [ ] The anthill-side vs. spellbook-side split for snapshot restore is decided and recorded.
- [ ] `anthill attach` reveals every tmux session bound to the project/channel; `--session` selects.
- [ ] `status` / `down` behavior under multiple sessions is decided (fixed, or explicitly deferred).

## References

- `plugin/scripts/anthill/commands/team-convene.ts` — the idempotent board open.
- `plugin/scripts/anthill/commands/team-attach.ts`, `team-status.ts`, `team-down.ts`, `tmux.ts`.
- `plugin/scripts/anthill/coord.ts` — the spellbook facade (daemon liveness would live near here).
- Related: [coord-daemon version-skew detection](2026-07-10-convene-status-detect-coord-daemon-version-skew.md) ·
  board-session-binding ([archived](../projects/_archive/board-session-binding/proposal.md)).
- Issues: [#43](https://github.com/ichabodcole/anthill/issues/43) ·
  [#45](https://github.com/ichabodcole/anthill/issues/45)

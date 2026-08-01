# A blocked seat is invisible to every coordination surface

**Added:** 2026-08-01 · **Status:** ready to design (the signal is cheap; the framing is the hard part)
· **Seat:** forager (`anthill status`) · **Found:** StoryLoom's first dev cycle

A seat put a question to the human through a **blocking prompt on its own pane**. The pane held for
**~40 messages**, on the critical path. During that window:

| surface          | said        |
| ---------------- | ----------- |
| the board        | `doing`     |
| the vine         | nothing     |
| `anthill status` | **present** |
| the tree         | nothing     |

**Every instrument read healthy.** The only thing with any coverage was the lead eventually running
`tmux capture-pane`, which nothing in the workflow tells anyone to do — and which was refused by the
harness classifier on the very next call, so recovery is **not reliably available** either.

Worse: the seat **had already routed the question correctly** on the vine. The lead ruled and the
human answered — **both replies sat on the vine while the seat sat in front of a modal waiting for the
same information.**

## The convention already shipped; the instrument has not

`plugin/templates/docs-team/README.md` now carries the seat-side rule (2026-08-01):

> **Never ask through a channel that stops you receiving the answer.** Asking twice through two
> channels is not redundancy — the blocking one silently wins.

That is the right fix for the seat. **It does nothing for the lead**, who still has no way to tell a
blocked seat from a thinking one. A convention prevents the careful case; an instrument catches the
rest. This item is the instrument.

## What's actually available (checked, not assumed)

- **`grapevine who <channel>`** returns `subscribers` / `humans` / counts — **no timing at all.** So
  presence cannot be enriched in place.
- **`grapevine pull <channel>`** returns messages carrying **`from` and `ts`**. So **last-spoke-per-seat
  is computable today**, from data `status` can already reach, with **no upstream change**.
- `anthill status` already shells `grapevine who`; adding a bounded `pull` is one more call.
- **tmux pane idle** is the other candidate and is worse: it only covers tmux-spawned seats, and the
  lead's tmux access proved unreliable mid-session.

## Shape of the fix (not settled)

- **Report `lastSpoke` per present seat** — an age, from the channel log. Cheap, no new dependency,
  works for every terminal seat.
- **⚠ Frame it as a hint, never a verdict.** Silence is not blockage: a seat deep in a 20-minute
  refactor is legitimately quiet, and a verify seat can be silent for a long stretch by design. A
  signal that reads as an accusation will be ignored within one session — the same cry-wolf failure
  the [staleness drift check](2026-07-31-nothing-tells-a-team-its-guidance-is-stale.md) has to avoid.
  **Report the age; let the lead interpret it.**
- **Open: is age even the right axis?** A seat that is blocked and a seat that is finished look
  identical from the vine. Possibly pair it with the board — `doing` + long silence is a much stronger
  signal than either alone, and `status` already reads both.
- **Open: should it be in `status` at all, or surfaced at the lead's natural check-in?** `status` is
  pull-only; nothing makes a lead run it. The failure took ~40 messages precisely because nobody
  looked.

## Acceptance Criteria

- [ ] `anthill status` reports, per present seat, how long since it last spoke on the channel.
- [ ] The output cannot be read as "this seat is stuck" — it reports an observation, not a diagnosis.
- [ ] No new dependency and no upstream (spellbook) change.
- [ ] Works for a seat that has never spoken (joined and went quiet) — that is the worst case and must
      not render as blank or zero.

## References

- StoryLoom round 3, finding 4 (their lead). The suggestion is theirs and was offered **weakly held**.
- `plugin/templates/docs-team/README.md` — the seat-side convention that shipped alongside this.
- `plugin/scripts/anthill/commands/team-status.ts` — where presence is read today.

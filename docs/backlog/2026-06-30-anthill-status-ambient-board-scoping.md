# `anthill status` surfaces ambient/unrelated bounty boards

**Added:** 2026-06-30 · **Status:** Partially done (`95dfe31`) — remainder tracked in
[`projects/anthill-footprint-migration`](../projects/_archive/anthill-footprint-migration/plan.md)

On a FRESH bootstrap, `anthill status` surfaced an ambient bounty board ("done:13") from
a prior/other board, reading as if the new team already had history. Scope `status` to
THIS team's board (by session id / config), or clearly label ambient boards as
not-this-team so a fresh team's status isn't polluted by a stranger's history.

## Acceptance Criteria

- [ ] `anthill status` on a fresh team shows only this team's board (no stranger history)
- [x] if ambient boards are shown at all, they are clearly labeled as such

**Disposition:** the labeling half shipped (`95dfe31`) — `anthill status` now reads the board
title (`Board «<title>»: …`), so an ambient/stranger board is self-evidently labeled. True
session-scoping (showing _only_ this team's board) needs anthill to persist its own board id,
which lands with the `.anthill/` footprint work — tracked in the footprint-migration project.

**Update 2026-07-10 — likely delivered by board-session-binding.** The remainder ("persist its own
board id" so status shows only this team's board) is essentially what **board-session-binding**
shipped (`8a7471b`): convene now opens the board **keyed + pinned** (`bounty open --session-key
<channel> --pin`, writing `.bounty-session`), and `bounty state`/`anthill status` resolve that pinned
board by walk-up rather than the daemon's global `latest`. **To close:** confirm `anthill status` on a
fresh team, with a stranger board live as `latest`, reports only this team's board — then archive.
See [board-session-binding proposal](../projects/board-session-binding/proposal.md).

## References

- `scripts/anthill/commands/team-status.ts` (wherever status resolves the board)
- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)

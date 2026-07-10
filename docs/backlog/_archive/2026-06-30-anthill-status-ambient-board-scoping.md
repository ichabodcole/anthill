# `anthill status` surfaces ambient/unrelated bounty boards

**Added:** 2026-06-30 · **Status:** ✅ **Done** (labeling `95dfe31` + true session-scoping via
board-session-binding `8a7471b`; **verified live 2026-07-10** — see the verification note below).

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

**Update 2026-07-10 — delivered by board-session-binding, verified live.** The remainder ("persist its
own board id" so status shows only this team's board) is what **board-session-binding** shipped
(`8a7471b`): convene opens the board **keyed + pinned** (`bounty open --session-key <channel> --pin`,
writing `.bounty-session`), and `bounty state`/`anthill status` resolve that pinned board by walk-up
rather than the daemon's global `latest`.
See [board-session-binding proposal](../../projects/board-session-binding/proposal.md).

**Verification (2026-07-10, the exact original-bug scenario).** Reproduced the bug's precondition — a
**stranger board live as the global `latest`** (opened from `/tmp`, no pin, seeded a `done` card) — then
from the repo root:

- `bounty state` (ambient, no `--session`) → resolved **our** pinned board (`anthill-dev ·
verify-scoping` / `OURS-team-card`), **not** the stranger.
- `anthill status` → `boardTitle: "anthill-dev · verify-scoping"`, counts `{todo:1, doing:0, review:0,
done:0}` — **our** single card, **zero** stranger history (the original bug was a stranger's `done:13`
  leaking in).
- Negative control: the same ambient `state` from `/tmp` **did** resolve the stranger, confirming it was
  genuinely `latest` and that `.bounty-session` walk-up is what overrides it.

The original failure (a stranger board's history polluting a fresh team's `status`) no longer occurs.
**Closed — archived.**

## References

- `scripts/anthill/commands/team-status.ts` (wherever status resolves the board)
- Related: [field report](../../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)

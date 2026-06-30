# `anthill status` surfaces ambient/unrelated bounty boards

**Added:** 2026-06-30

On a FRESH bootstrap, `anthill status` surfaced an ambient bounty board ("done:13") from
a prior/other board, reading as if the new team already had history. Scope `status` to
THIS team's board (by session id / config), or clearly label ambient boards as
not-this-team so a fresh team's status isn't polluted by a stranger's history.

## Acceptance Criteria

- [ ] `anthill status` on a fresh team shows only this team's board (no stranger history)
- [ ] if ambient boards are shown at all, they are clearly labeled as such

## References

- `scripts/anthill/commands/team-status.ts` (wherever status resolves the board)
- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)

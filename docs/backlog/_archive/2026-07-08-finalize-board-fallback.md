# finalize-session: treat git + vine as the durable record when the board is down

**Added:** 2026-07-08

The finalize-session **step-6 closing checklist** assumes a reliable bounty board — "Board
settled — cards → review/done" reads as a gate. In a real dream-flute dogfood session the
board **idle-died 4×** (even with a host keep-alive tail) and was abandoned as unreliable;
the grapevine + git history became the actual durable record of the session.

The ritual should acknowledge that fallback: **if the board is down/unreliable, git history +
the grapevine ARE the record**, and card-settle becomes best-effort (restore-once-to-snapshot),
not a step that can block finalize.

This is the **anthill-side** half of the friction. The underlying board idle-death is a
spellbook/bounty daemon bug, filed upstream at
[ichabodcole/spellbook#64](https://github.com/ichabodcole/spellbook/issues/64).

## Status

**Anthill half shipped 2026-07-08.** Reworded the step-6 "Board settled" checklist beat in
`plugin/skills/finalize-session/SKILL.md` to "**best-effort, never a gate**", naming git history + the
grapevine as the session's durable record. The underlying board idle-death is still open upstream at
[spellbook#64](https://github.com/ichabodcole/spellbook/issues/64) — anthill issue #15 stays open until
that lands.

## Acceptance Criteria

- [x] finalize-session step 6 names git + grapevine as the durable record of a session.
- [x] Card-settle is explicitly best-effort (attempt once; don't block finalize if the board
      is unreachable).
- [x] The ritual reads correctly whether or not the board survived the session.

## References

- `plugin/skills/finalize-session/SKILL.md` (step-6 closing checklist)
- Source: anthill issue [#15](https://github.com/ichabodcole/anthill/issues/15) (`anthill feedback`)
- Upstream (board idle-death): [spellbook#64](https://github.com/ichabodcole/spellbook/issues/64)
- Related cluster: [`projects/shared-tree-gate-tension`](../projects/shared-tree-gate-tension/proposal.md)

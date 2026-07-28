# Name subagent dispatch as an available seat move — and fix thread↔seat misrouting

**Added:** 2026-07-27 · **Status:** ✅ **SHIPPED** 2026-07-27 · **Seat:** weaver (skills text)

> Item 1 landed in `join` (the cold-audit-before-you-post pattern, framed as option not mandate);
> item 2 landed in `convene` (the thread≠seat routing hazard). **Still open:** moving the
> [seat-subagent-orchestration investigation](../investigations/2026-07-09-seat-subagent-orchestration.md)
> off _Monitor_ — #36 is the in-situ validation it was waiting for.

Two related findings about seats and subagents.

## 1. Seats don't reach for subagents — and it isn't a weighed decline ([#36](https://github.com/ichabodcole/anthill/issues/36))

A survey of two implementation-heavy terminal seats after a **16-slice build** found **zero
Task/Agent dispatches**, and neither seat had _consciously considered_ them. The work's shape —
serial lanes, small per-step verdicts, a peer verifier already serving as a second pair of eyes —
made subagents **invisible**, not rejected.

This confirms the standing
[seat-subagent-orchestration investigation](../investigations/2026-07-09-seat-subagent-orchestration.md)
(status: _Monitor — validate in situ_). **This is that validation.** The investigation can move off
Monitor on the strength of it.

**The one genuine pattern both seats independently converged on:** a blank-context **cold-audit
subagent dispatched _before_ posting a classification or cut you own** — exhaustively re-derive,
adversarially find what I missed. The owner's framing is the blind spot; fresh context is the
antidote. A real 5-item under-enumeration in that session would have been caught pre-post.

**Fix:** join/SOP text names subagent dispatch as an available move, with this **one worked
pattern** (cold-audit-before-you-post-a-cut), framed as **option, not mandate**. One good worked
example beats a menu.

## 2. Subagent-mode re-dispatches route by thread, not seat identity ([#47](https://github.com/ichabodcole/anthill/issues/47))

A verify-seat re-gate **misrouted to the builder's thread**, and only the subagent's own honesty
caught it. When seats run as subagents rather than tmux panes, "continue the agent" resumes a
_thread_, and thread ≠ seat.

**Fix:** convene/finalize name this hazard — keep a thread→seat map, and verify the mapping before
continuing an agent. Cheap prose; the failure is silent and produces work attributed to the wrong
seat, which then poisons that seat's living doc at finalize.

## Acceptance Criteria

- [ ] Seat-facing guidance (join and/or the SOP seed) names subagent dispatch as an option and
      carries the cold-audit-before-you-post pattern as its worked example.
- [ ] The framing is explicitly non-mandatory — the evidence says seats need the _option surfaced_,
      not a quota.
- [ ] convene/finalize name the thread↔seat routing hazard for subagent-mode teams.
- [ ] The seat-subagent-orchestration investigation is updated with #36 as its in-situ validation
      and moved off _Monitor_.

## References

- `plugin/skills/join/SKILL.md`, `plugin/templates/docs-team/README.md` (the SOP seed),
  `plugin/skills/convene/SKILL.md`, `plugin/skills/finalize-session/SKILL.md`.
- [Seat-subagent-orchestration investigation](../investigations/2026-07-09-seat-subagent-orchestration.md)
  — this is its awaited field data.
- Sibling: [agent signal-hunger investigation](../investigations/2026-07-08-agent-signal-hunger.md).
- Issues: [#36](https://github.com/ichabodcole/anthill/issues/36) ·
  [#47](https://github.com/ichabodcole/anthill/issues/47)

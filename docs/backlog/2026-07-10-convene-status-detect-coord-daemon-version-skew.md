# convene/status: detect a coord-daemon ↔ CLI version skew and offer to align/restart

**Added:** 2026-07-10 · **Status:** idea capture (surfaced by sentinel during the board-session-binding session)

anthill resolves its coordination CLI via `resolveCoordCli` — it picks the **highest cached
spellbook version**. But a grapevine/bounty **daemon** started by an earlier session keeps running
the version it launched with. So the CLI a fresh convene invokes can be **newer than the daemon
that actually serves its verbs** — and the mismatch is silent until a new-CLI flag hits an
old-daemon that doesn't understand it.

This is not hypothetical for us: board-session-binding hard-depends on spellbook **≥ 1.16.0**
(caller-owned session key). If the running bounty daemon is a pre-1.16.0 process, the CLI emits
`--session-key` but the daemon resolves the old way — exactly the silent cross-board hijack the
feature was meant to kill, reintroduced by a stale daemon rather than a stale CLI. The seat feels
correctness it isn't actually getting.

**Proposed:** at `convene` (and/or `anthill status`), detect a version skew between the resolved
coord **CLI** and the **running daemon**, and if they diverge, surface it — with an offer to align
(restart the daemon on the resolved version). Fail loud at stand-up, not silently mid-session.

## Acceptance Criteria

- [ ] `convene`/`status` compares the resolved coord CLI version against the live daemon's version.
- [ ] On skew, it reports clearly (which is stale, which the team needs) rather than proceeding as
      if aligned.
- [ ] It offers a one-step align/restart (or names the exact command), so the human isn't left to
      diagnose a silent resolution failure.
- [ ] Named minimum: the daemon meets anthill's declared spellbook floor (≥ 1.16.0) or the team is
      warned.

## Open Questions

- Does spellbook expose a queryable **daemon version** (vs. only the CLI's `--version`)? If not,
  this may need an upstream spellbook affordance first (a `grapevine/bounty status --json` carrying
  the serving version) — file that if so.
- Is a restart safe mid-life, or only at convene (before seats attach)? Restarting a live daemon
  could drop in-flight state; leaning toward **detect-at-convene, offer-restart-before-spawn**.
- Auto-align vs. warn-only? Leaning warn + offer (don't restart a daemon the human may be sharing
  across teams without asking).

## References

- `plugin/scripts/anthill/coord.ts` (`resolveCoordCli` — highest-cached-version resolution)
- `plugin/scripts/anthill/commands/{team-convene,team-status}.ts` (the two surfaces)
- Spellbook floor: board-session-binding requires spellbook ≥ 1.16.0
  ([proposal](../projects/board-session-binding/proposal.md))
- Same surface, related: [`2026-06-30-anthill-status-ambient-board-scoping.md`](./2026-06-30-anthill-status-ambient-board-scoping.md)

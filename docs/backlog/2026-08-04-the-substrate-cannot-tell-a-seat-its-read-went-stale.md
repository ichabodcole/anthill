# The substrate cannot tell a seat that something it READ has changed

**Added:** 2026-08-04 · **Status:** ready to design (the evidence is overwhelming; the "what counts as read" question is the work)
· **Seat:** forager (CLI) + weaver (the convention it would replace) · **Found:** by the human, from a mechanism in another agent-coding tool

**A seat reads a file, acts on it, and never learns it changed underneath.** Every mitigation anthill
has for this is a **convention** — and the project's most confirmed principle is that prose guards
lose to mechanical ones (H1, confirmed against the lead twice in one session).

## Why this is the highest-evidence gap in the backlog

**Stale reads are this project's single most recurrent failure class.** From the record, all
artifact-backed:

- **`--as-of` failed the lead twice, same mechanism** — a head fetched but not read.
- **The read-watermark convention exists entirely for this**, and two teams invented it
  independently — the clearest signal available that the tool is missing something.
- Three logged incidents: _a migration applied while a STOP was in flight; a ruling written after a
  correction it did not see; a hold placed on paths already committed._ **None was carelessness —
  all three were correct actions on a stale read.**
- **R12 cited line numbers that moved inside the session that wrote them.** scout's count **rotted in
  40 minutes.** A `seams.md` proof pointed at a **deleted** probe artifact.
- A backlog item read `ready to build` for work that had shipped; a handoff told a lead to run an
  experiment already completed.
- **`finalize-session` step 2.5 exists solely to catch this by hand** — _"assume it has drifted"_ —
  and the one session that measured it found drift in **every seat's docs.**

## The half-instance we already have

**`anthill commit`'s `uncheckedAgainst`** already reports dirty paths outside the commit at land
time. That _is_ "the world moved under you," built and shipping. **Extend it rather than invent a
second thing.** _(Note its scar: it fired 9/9 identical false positives from a `.gitignore` trailing
slash — the shape was right and the relevance filter was absent, which is exactly the trap below.)_

## ⚠ The design constraint that IS the feature: relevance, not change

**A naive watcher on a shared tree with six seats fires constantly**, and this project has already
been burned twice by alarms that are correct on every firing and informative on none
(`uncheckedAgainst` 9/9; the heartbeat item). **An alarm nobody reads is worse than no alarm, because
it also retires the question.**

So the notification must be scoped to **a file THIS seat actually read, that it has not re-read
since.** That filter is the whole feature; a generic file watcher is the failure mode wearing the
feature's clothes.

## The open question, and it is the real work

**What counts as "read"?** The `anthill join` grounding manifest is known and enumerable. Ad-hoc
reads during work are not, and tracking them may need harness support a CLI cannot provide.

**Cheap first version that needs no daemon and no harness change:** at `send` / `read` / `commit`,
the CLI compares mtimes (or blob shas) of the seat's **registered** reads and appends a notice to the
envelope. **Poll-on-interaction, not push.** It fits the existing brain/hands split, catches the slow
drift that actually bit us, and proves the relevance filter before anything watches anything.

## Acceptance Criteria

- [ ] A seat that read file X, where X then changed, is told — **once**, on its next CLI interaction.
- [ ] A seat that read X and has since re-read it is **not** told.
- [ ] The notice names **what changed**, not merely that something did.
- [ ] **Control, per sentinel's rule:** the same command demonstrably produces the other answer —
      show a run where nothing is reported because nothing went stale.

## References

- `plugin/scripts/anthill/commands/team-commit.ts` — `uncheckedAgainst`, the half-instance to extend
- `plugin/scripts/anthill/commands/team-join.ts` — `groundingPaths`, the enumerable read set
- Related: [agent-signal-hunger](../investigations/2026-07-08-agent-signal-hunger.md) — established
  the pull/push framing; **this is the pull-shaped signal it predicted would ship as tooling**
- Related: [file-activity heat map](../investigations/2026-06-30-file-activity-heatmap.md) — the
  other substrate signal, and the decay argument
- Related: [slice three](../projects/team-comms-spike/slice-three-proposal.md) — a substrate
  notification has **no seat author**, so it needs the same capability model as guest/human/mute

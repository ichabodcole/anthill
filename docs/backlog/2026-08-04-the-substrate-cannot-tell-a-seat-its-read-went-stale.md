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

## ⚠ Session 7 measured three more instances, and one of them narrows the design

Added at session 7's finalize. **All three are artifact-backed and one was measured with an
instrument, not inferred** — so this item's evidence is no longer only retrospective.

**1. A verify seat's baseline was wrong by 9 tests because a peer's file appeared MID-RUN.**
It measured **436** where the truth was **427** — another seat's uncommitted `team-convene.test.ts`
landed inside the test run. It discarded the number and redid the whole verification in detached
worktrees, which is the only reason its later 427→482 delta means anything. **Adopted as a session
rule: any count taken in the live shared tree is untrustworthy.**

**2. The lead reported the session's gate delta as +5. It was +55.** He anchored on a mid-session
number (`ec404b1` → 477) and treated it as the session baseline (`853094c` → 427). **This is a stale
read of the team's own headline metric, by the person who had `cite the sha, never the bare number`
in front of him**, and it went out to the team before anyone checked it.

**3. A ~100ms window in which a file is briefly the WRONG BYTES — or absent entirely.** Measured in
an isolated clone, 5 instrumented runs at ~0.021ms sampling:

```
t+0.0000  marker=1 bytes=20687   <- worktree content
t+0.1796  open=0   bytes=0       <- FILE MOMENTARILY GONE
t+0.1804  marker=0 bytes=20642   <- INDEX content
t+0.3227  marker=1 bytes=20687   <- restored
window: 143.1 ms
```

Mechanism: **not `git stash`** — this repo never runs `stash push`. It is lint-staged's
`hidePartiallyStaged` → `git restore --worktree`, restoring from the **index**. It affects **only
files that are staged AND further worktree-modified (`MM`)**; purely unstaged files are never
touched. **`anthill commit` fires it on every land**, because it stages the named paths and then
commits with no pathspec (`team-commit.ts:398`, `:440`) — a pathspec commit does _not_ trigger it.

### Why instance 3 NARROWS this item's design rather than just supporting it

**An mtime/blob-sha comparison sampled inside that window reads the index blob, or a zero-byte file,
and would report a spurious staleness notice on a file nobody touched.** That is precisely the
9/9-false-positive trap this item already warns about, arriving from a direction the warning does not
cover — **not a noisy-but-correct alarm, but a factually wrong one.**

**So the cheap poll-on-interaction version needs a stability condition**, not just a relevance filter:
compare against a quiesced tree, or re-read once on a mismatch before reporting, or exclude paths in
the `MM` state at sample time. **Cheap to add now; expensive to discover as flakiness later.**

_A fourth, still open: a seat read its own committed test file as `0 matches / 19 tests` when it held
`6 / 29`, with the tree byte-identical to its commit. The confirmed window above does **not** explain
it — a committed-clean file cannot be `MM`. It also saw `git status --porcelain` report `M ` for files
it had already committed clean, which should be impossible. **Recorded as unexplained rather than
folded into the mechanism it superficially resembles.**_

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
- Related: [slice three](../projects/capability-state/proposal.md) — a substrate
  notification has **no seat author**, so it needs the same capability model as guest/human/mute

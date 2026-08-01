# Session 1 friction log — building slice one ON grapevine + bounty

**Date:** 2026-08-01 · **Session:** team-comms slice one · **Seats:** maestro (lead), forager, weaver,
sentinel · **Captured:** live, during the session, not reconstructed after

The proposal's reason for building this session on the current stack:

> _"It is the last session where we feel the current friction as users rather than remember it."_

So this is the required output, not a side effect. Captured **as it happened** because the same
proposal names the failure mode: a team that has absorbed a workaround stops experiencing it as
friction.

**Scope note.** Three different things surfaced and they must not be pooled — a coordination-tool gap
is a spike input, an anthill defect is a backlog item, and an operator error is neither.

---

## A. Friction with the coordination tools (spike inputs)

**A1. There is no finite-read verb, and the live one impersonates it.**
`bounty tail --since 0` — a live tail used for a finite read — hung for 2 minutes and returned
nothing. The lead did this, hours after editing the anthill warning that names exactly this trap for
grapevine. **The warning is grapevine-scoped and the mistake was bounty-scoped; the warning is read at
join and the mistake happens at catch-up.** Filed under the wrong tool's namespace, at the wrong
moment, to ever fire.
→ Slice-one design consequence, already taken: `follow` streams and cannot terminate, `read`
terminates and cannot stream, and **no flag on either can express the other's behaviour.**

**A2. The ~200-character preview is the unit of decision, and every substantive message exceeds it.**
The lead ran `grapevine read <channel> <id> --text` on essentially every message that mattered — the
preview was never sufficient to rule on anything. This is StoryLoom's finding reproduced from the
lead's chair rather than a seat's: **truncation is the attention mechanic, not volume.**

**A3. No addressing. Every message went to all four seats.** The `## sender → recipient:` convention
carried the entire routing load, and it works only because it lands inside the preview window. Nobody
proposed it this session — it arrived with the SOP, which is itself the transmission datum.

**A4. Messages cross, and the channel has no notion of in-flight.** At least five crossings:
sentinel's withdrawal crossed forager's ratify (#11/#10); weaver's ratify was under-scoped against a
message he hadn't seen; forager's answer crossed weaver's question twice. **All five were caught in
flight by the read-watermark convention**, not discovered afterward — see §C.

**A5. Board state lags vine substance, structurally.** All three cards sat in `todo` while the vine
carried sixteen messages of ratified contract. The board is _state_ and the vine is _substance_, so
this is arguably correct — but it means **the board is not a reliable read of where the work is**, and
the lead has to reconstruct that from the vine.

**A7. ⚠ The crossing problem also happens between FILES, and the read-watermark has no equivalent for
it. This is the sharpest coordination finding of the session.**

One clause — Contract 4(b)'s absent-branch — drifted **three times**, and every individual fix was
correct and independently verified:

1. The contract promised an "explicitly absent" branch; the shipped code had **no such marker**.
   weaver falsified it — against a contract **he had personally ratified twice** — by reading the code
   rather than the owner's description of it.
2. forager corrected the contract to match the code (always-present, `{ channel, incantation }`).
   Right fix, verified on disk.
3. Which made **weaver's prose false**: it now instructs a seat to read a marker the manifest has no
   way to emit.

**Nobody was careless, and no fix was wrong.** The mechanism:

> **Two artifacts were fixed one at a time, each against the other's previous state, while both were
> moving.** Every writer was correct about the state they had read.

This is exactly the message-crossing problem, **with files as the medium** — and the convention that
solves it for messages **does not transfer**. `ratified as of #14` works because a message has a
stable id. **A file has no id to cite**, so there is no way to say _"I read `seams.md` as of which
version"_ — and `git` hashes, which would serve, are not what anyone quotes in a ratify.

**Design consequence for the comms tool, unproven and worth testing:** a ratify that can cite **both**
a message watermark and a content hash of the artifact it ratifies would close this. Whether that is
worth its ceremony is exactly the kind of thing the spike should learn by use rather than decide now.

**Note the asymmetry that made it survivable:** the three message-level crossings this session were
all caught _in flight_ by the watermark. This file-level one was caught only because a human-role seat
read both artifacts side by side. **The convention we shipped covers the cheaper case and misses the
more expensive one.**

**A6. A timestamped green goes stale in seconds.** sentinel's `213/0 at 00:09:08Z` was false 77
seconds later. Every seat began bracketing gate claims with timestamps unprompted. **A shared-tree
team cannot cite a gate result; it can only cite a gate result _at an instant_.**

---

## B. anthill defects surfaced (backlog, not spike)

**B1. `anthill commit` leaks a raw Bun stack trace on the gate-failure path — shipped in 1.7.0.**
Five frames starting `at run (…/team-commit.ts:373:19)` land beneath an otherwise excellent envelope,
burying the one line the reader needs. **The regression guard exists, is correctly written
(`not.toMatch(/at run \(/)`), and is applied to the two argument-validation paths that never throw.**
The path that throws is unguarded.
→ Found by **execution**, not reading — the file had been read repeatedly that day by its own author.
→ It is the _clause-moved-after-its-proof_ case: `restoreIndex()` and the foreign-red diagnostic were
added to that failure path the same morning, and the guard was not extended to the new surface.

→ **Rescoped by the verifier before filing, and the rescope matters:** the fix is **one line**
(`expect(stderr).not.toMatch(/at run \(/)`) added to a test that **already exists** at
`team-commit.test.ts:344`/`:362` — both already capture `stderr` and already drive a genuine throw
via `installFailingHook`. No new fixture, no new repo. _"File it as a one-line assertion, not as 'add
a regression test for the gate-failure path.' Those get scoped and deferred differently, and this one
should not survive a second session."_ **Filing something as bigger than it is defers it.**

**B2. The whole-tree gate makes any seat's transient red a global stop-the-world.** The lead's land of
a **markdown-only** seat doc bounced on forager's in-flight TypeScript rename. Known (#24/#28), felt
again, and the cost is real: doc lands must queue behind a peer's green window.
→ **Mitigated well:** the foreign-red diagnostic named the nine dirty paths outside the commit and
said it isn't yours. That worked exactly as designed and prevented the lead from debugging a clean
file.
→ **⚠ This is a STRUCTURE signal, not a paper-cut — and it was corroborated with timestamps rather
than argued.** The verifier watched the gate go red three separate times (`00:08:44Z`, `00:14:46Z`,
`00:14:54Z`) and **every one was a single seat's in-flight work while every other seat's paths were
clean** — two mid-save, one mid-refactor. Generalized:

> **A whole-tree gate makes every seat's landability a function of the noisiest seat's edit cycle —
> and TDD's red phase guarantees there will be one.**

A prose-only seat is maximally exposed: it can never cause the red and can always be blocked by it.
**This belongs in finalize's structure reflection**, and it is the first thing this session produced
that reads as a genuine composition question rather than a defect. It also connects directly to the
worktree-isolation material in the
[shared-tree investigation](../../investigations/2026-07-27-shared-tree-failure-modes.md).

**B2a. A verification principle worth keeping, from the verifier declining to run something.**
Asked to confirm B1, sentinel verified it **statically** and said why it refused to reproduce live:

> _"`anthill commit` is an effecting path. On this shared tree with three seats' uncommitted work, a
> live run that happened to catch a green window would land real commits. **A live run of an effecting
> path isn't a verification, it's an incident.**"_

This is a real limit on "execution beats testimony": **execution is the better instrument only where
the execution is safe.** For effecting paths on shared state, static verification against the actual
source is the honest instrument, and saying which one you used is part of the finding.

**B3. `anthill spawn` puts a human prompt in front of every seat, making the wrong move the visible
one.** forager asked _his_ pane's human whether to proceed; the human was in the lead's pane. The SOP
says decisions route through the lead, and the interface offers the other thing anyway. **Third
instance this session of prose losing to an affordance.**

---

## C. What the 1.7.0 conventions actually did (first live test)

Shipped that morning; this is their first use. **Caveat that bounds all of it: we wrote them, so this
is mechanics working, not transmission working.** StoryLoom's next round is the transmission test.

- **Read-watermark (`ratified as of #N`) — earned its keep, unambiguously.** Five crossings detected
  and repaired _in flight_. Cost: one clause. Two seats used it to reconstruct exactly which message
  their peer had not yet seen. **This was shipped as an untested guess; it should now be stated as
  load-bearing.**
- **"A ruling must name what it did not rule on" — paid for itself twice.** The lead's two rulings
  each listed four items deliberately left open; at least two would otherwise have been read as
  decided.
- **Preview-first / verdict in the headline — held under load**, and is the only reason a
  four-way channel at ~50 messages stayed navigable.
- **"There is no message budget"** — no seat visibly rationed. Not provable from one session.
- **Shared-file discipline (announce the hold)** — forager announced taking `seams.md`, held it under
  a minute, announced the drop. **Used unprompted, before anyone asked.**

---

## D. Operator errors (ours, listed so they aren't miscounted as tool gaps)

- The lead nearly convened on **anthill 1.5.0** while 1.7.0 was installed — the Skill tool resolved
  the stale version and only the path revealed it. Would have handed every seat the three defects the
  release had just fixed.
- The lead hedged contamination **across the team** when it is per-seat and checkable.
- The lead read the gate against a mid-edit tree, got red, and nearly announced it. It was green 60
  seconds later with no fix in between.

---

## Open Question 2 — ANSWERED, on day one, by an artifact

**"Does seat-aware identity actually change anything on day one, or is it only groundwork?"**
_(Superseded an earlier note in this file saying the session had not answered it. It had — the
evidence landed while this log was being written.)_

**Yes.** The verifier ran the wire and the real messages in the log carry:

```json
"role": "brain (skills/methodology)"
```

**`role` is unrecoverable from `--as weaver` alone.** It can only have come from
`.anthill/config.json`. That is the spike's entire wedge — the thing grapevine cannot do by trying
harder, because a general tool can never know your roster — **observable in a message rather than
argued for**, inside one session.

The proposal said that if seat-awareness changed nothing observable on day one, that would be a signal
about how much of the roster-awareness thesis is real. **It changed something observable on day one.**

**What is still NOT answered, so this doesn't overclaim:**

- **No session has yet run _on_ the tool.** The wedge is proven; the tool being _usable for real
  coordination_ is not. Slice one's success criterion — _"one real convened session runs on it"_ —
  remains open and is the next session's job.
- **`follow` is unverified over a live append.** The verifier checked `read` and said so; the
  streaming path has not been exercised.
- **Whether seat-awareness is worth its cost** is a different question from whether it does anything,
  and only use will answer it.

## The spike-framing check

The proposal's own success criterion: _"at least one thing we were sure we'd need turns out to be
unnecessary — that is the signal the spike framing is working rather than being a design in
disguise."_

**Candidate: the explicitly-absent branch.** Contract 4(b) originally promised a marker distinguishing
_"told there is none"_ from _"wasn't told anything,"_ and it was argued for hard and ratified twice.
It turned out to be **unbuildable and unnecessary in slice one** — the skill and the tool ship in one
subtree from one release, so the absent case cannot arise. The contract was amended to match. **We
were sure we needed it; we did not.**

Weaker but worth watching: the read-watermark was shipped as a guess and **earned its keep
immediately**, which is the opposite signal — a convention we were _not_ sure about turning out
load-bearing.

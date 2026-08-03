# scout report — session 6, per-seat worktree isolation

**Session:** 2026-08-03, 01:51 → ~02:35 · **Seats:** maestro (lead), forager, weaver, sentinel, steward, scout
**Branch:** `feat/team-comms-slice-one`, five seat branches `seat/<handle>` in separate worktrees
**Card:** `t-abbccd8a` — observe; named question: _do non-verify seats keep worktree discipline under load?_

> **How to read this.** `artifact:` means a thing in the repo a stranger can run or read.
> `testimony:` means somebody said it, however many somebodies.
> Neither wire is an artifact — both are gitignored, so quoting our own messages is quoting ourselves.
> Where I could only reach testimony, I say so rather than dressing it up.

## 1. What the tree says

> **Every count below is anchored to integration head `8fd0741` at 02:36:36.**
> Stated that way on purpose: I wrote "40 commits" into a draft of this file at 02:33 and it was **53** three minutes later.
> A count in this session's own report began rotting before the session ended — which is the finding in §2.5 arriving one more time, in my own hands.

_artifact:_ **53 commits** on the integration branch since 01:30 (28 non-merge, 25 merges). **Zero reverts.**
_artifact:_ gate 390 pass / 0 fail at join → **423 pass / 0 fail** at close (`8fd0741`, working tree clean), same command, same suite.
_artifact:_ one integration red (408/1), caught and green again inside ~90 seconds.
_artifact:_ every seat-stamped commit carried an explicit pathspec and an `Anthill-Seat` trailer; two commits carried it twice (cosmetic — both name the same seat).
_artifact:_ session opened at **01:51:23**; first seat commit at **02:08:58**.

The session shipped the cross-seat `comms positions` verb, the `anthill commit` worktree fix, the `down` presence-guard inversion and its command-path test, the scaffold's missing comms wire, and worktree guidance in the SOP.

## 2. Findings

### 2.1 Isolation did not remove coupling — it relocated it, and only one third was priced

The session read _"no seat was blocked by a peer's red"_ as the experiment succeeding.
That is true and it is one third of the ledger.

_artifact:_ the restored `anthill commit` lock keys on the **shared** git dir, so worktrees still serialize.
Measured waits: `0.19` (uncontended), then **`13199.9`**, **`10139.7`**, **`7103`** under real contention — approximately the gate's own runtime, because the lock is held across the pre-commit hook.
**A seat does not queue behind a peer's commit; it queues behind a peer's entire gate run.**

**Isolation did not remove the wait. It changed what you wait for: from _"a peer's red blocks my land"_ to _"a peer's green costs me ten seconds."_**

H4 as stated is **falsified**: it predicted ≥1 refusal and isolation predicted zero waiting.
The defensible claim is that isolation **converts a blocking coupling into a queueing one, and adds an unguarded integration point.**
Both halves cost something; only the first was priced.

### 2.2 The integration point has no gate, and that is where the failures moved

_artifact:_ at 02:18 the published integration head was **408 pass / 1 fail**, while every contributing branch had been green alone.

forager's mechanism is better than my framing and belongs to him:
**the shared tree was doing integration testing for free, as a side effect of being a bottleneck.**
Remove the bottleneck and you remove the free testing, and nobody noticed the second half was part of the trade.

**The sharp part: the warning existed and could not fire.**
sentinel predicted this exact failure before the merge — _"my `401cd91` will go 0 pass / 4 fail against your change."_
Correct, on the wire, and the merge happened anyway.
That is not a lapse by anyone. It is the team's own principle: **a contract is a description, not a trigger.**
A predicted breakage sitting in a message cannot stop a merge; only a gate at the integration point can, and there isn't one.

Two seats ran merge-then-gate afterwards, and both did it **because they had read the message.**
It is a discipline held by whoever was paying attention, which is precisely the shape this team has a principle against.

### 2.3 The session's defining self-criticism rested on a number that was wrong by an order of magnitude

_artifact:_ the lead's #304 said _"We are hours in and the tree contains one commit."_
Session opened #284 at **01:51:23**; #304 was written at **02:04:55**.
**Thirteen minutes and thirty-one seconds.**

That message produced the session's biggest claim about itself — _"we have optimised into a local maximum where correcting each other IS the work"_ — and every seat, including me, adopted it as established.

**The diagnosis may still be right.** The zero-commit count was true.
But _"hours in, one commit"_ **welds a checkable claim to a rhetorical one**, and the checkable half lends its credibility to the other.
I verified the commit count. Nobody verified the duration.

**This is my own failure as much as the lead's**, and worse in kind: I am the seat whose function is separating those two things, and I ran the check on the easy half and passed the hard half through, in the same sentence, into my own notes.

### 2.4 The measurement apparatus was less reliable than the thing it measured

_artifact:_ zero reverts across 53 commits.
_testimony (mine, but reconstructible from my own commands):_ **five** distinct false signals from my instruments in one session — lint-staged backup stash objects read as unstamped commits; a torn read during an in-flight commit; integration merge commits; a stale tree that lacked the commit under test; and prose _about_ trailers matching my trailer grep, on the very commit that fixed trailer handling.

All five were caught before posting. None reached the wire.
**The five causes were all different**, so no single guard would have caught them — which is the argument against _"be more careful"_ and for verifying an instrument before its first output rather than after its first surprising one.

**The asymmetry that makes this seat's tooling different from a builder's: my false positives are not wrong numbers, they are allegations about a named colleague.**
The one that did cost someone: I deleted the main-tree `.bounty-session` under a persisted `cd`, reported the disappearance as _"unaccounted for by any account on the wire,"_ and forager spent a message auditing himself for a deletion I had made.

### 2.5 An alarm correct on every firing and informative on none

_artifact:_ `uncheckedAgainst` reported **9 times, 9 identical values** (`[".anthill/comms"]`), zero informative.
_artifact:_ cause was one character — `.gitignore:44` read `.anthill/comms/`, and a trailing slash matches a directory while the path had become a symlink.

`uncheckedAgainst` is **the** field session 5's scar is about — _"the affordance was not missing; it was unnamed."_
This session the team finally named it and began reading it, and a 100%-false-positive rate un-names it again by training everyone that skimming past is correct.
The drift was visible in our own prose within five lands, moving from quoting the value to _"uncheckedAgainst only `.anthill/comms`"_ — the sentence someone writes immediately before they stop looking.

**Not proposed as a principle. See §3.**

### 2.6 A remedy degrading an instrument, twice

Both of this session's instrument corruptions were **caused by fixes**:

1. The comms symlink repaired a dead wire and **carried `emittedThrough` across a log swap**, so two seats were reported `current`, gap `0`, having never been emitted ids 7–284 — a genuine `0` that is false, which Contract 6(c) does not cover because it protects `null` from being flattened into `0`.
2. The same symlink made `.anthill/comms` untracked in every tree, producing §2.5.

**The direction nobody watches: the tool got better and the instrument got worse.**

### 2.7 The observer altered the experiment — not the measurement

Session 5 asked whether this seat decorates what it measures.
This session produced something sharper and I want it recorded plainly.

I posted an **unverified** hazard about the shared `refs/stash`.
Within one message the lead imposed announce → ack → land across the whole team — **which is the exact variable the session existed to measure.**
For roughly two minutes H4 was not measurable at all, and the cause was a message of mine containing no evidence.

The hazard was then **proven real** by its owner and replaced with a mechanical lock, so the outcome was good.
**Being right does not retire the cost.** An identical message with identical confidence would have cost the identical tax had I been wrong, and nothing about it would have looked different from outside.
What made it cheap was forager converting it to a fact in minutes, not anything I did.

### 2.8 The named question — answered, positively

**Do non-verify seats keep worktree discipline under load?** _Yes._

The test arranged itself: the lead ordered five seats to land in parallel at the moment `anthill commit` was broken in every worktree.
_artifact:_ every seat that landed used an explicit pathspec, gated first, and added the `Anthill-Seat` trailer by hand.
_artifact:_ weaver put the deviation **in the commit message body** — _"Landed with raw git: anthill commit is broken in every worktree"_ — so it survives the wire evaporating.
That is the strongest single discipline artifact of the session.

**The caveat, which costs me the clean result:** the deviation was **publicly sanctioned** — a peer broadcast the fallback and the lead endorsed it.
Discipline under a sanctioned deviation is the easier test.
The harder one — a private deviation under time pressure — did not occur, and I am not claiming it as evidence.

## 3. Recommendations

### Build this

**Gate the merge result, not just the seat branches.**
The instance is §2.2's red. Cost is one command in the lead's merge sequence.
It would have caught the failure without anyone having to remember a prediction.

**Give `comms positions` a named re-read moment.**
_artifact:_ it ships with exactly one passing mention in the skills and nothing in join's checklist, the SOP, convene, or finalize saying when to run it.
The moment already exists and is unnamed: twice this session the lead and a seat established who was wired **by hand**, which is exactly what the verb automates.
**H12 is answered for the capability and still open for the trigger.**

### Try this differently (hypotheses with falsifiers)

**Stamp the instrument, not just the read watermark.**
We record _"as of #N"_ on every message and never the command we ran.
Four seats produced four wrong board headlines and the differences were in our own commands — mine was literally adding `env -u` between two runs I then compared.
_Predicts: requiring the exact command beside a measurement kills this class. Falsifier: a session that stamps commands and still retracts a headline for instrument drift._

**Separate a claim's checkable half from its rhetorical half before quoting it.**
_Predicts: §2.3's class does not recur if the convention is to quote the number and drop the adjective. Falsifier: a session that does this and still adopts a false quantity._

**This seat may raise the team's measure-to-build ratio.**
Not observer bias — a seat whose deliverable **is** the artifact-backed finding makes measuring the prestigious activity.
_Falsifier: run a session without this seat and compare commits-per-hour at the same elapsed point._
Now properly measurable, since §2.3 establishes the real elapsed numbers.

### Impressions (labelled, not actionable)

The team's error-correction rate was extremely high and its self-accounts were where nearly all the errors lived.
Whether that is a healthy team catching itself or a team generating enough errors to need to, I cannot settle — but **the split is legible from outside: the artifacts were clean and the claims were not.**

## 4. For the human, directly

**One principle candidate was declined, deliberately.**
_An alarm correct on every firing and informative on none is worse than no alarm_ (§2.5) is a good argument with a count behind it.
I declined to promote it because **the bar is a scar and this is a near-miss** — we caught it in one session and no real warning was ever missed.
Forty minutes earlier I declined, on the same reasoning, to promote my own instrument lesson to this seat's epitaph.
Promoting a near-miss to a **team** principle while refusing one for **myself** would have been inconsistent in the direction that flatters me.
**It is registered as a watch item with what would make it earned: the first time a genuinely non-empty `uncheckedAgainst` is skimmed past because nine benign ones trained us to.**

**The participation question you ruled on 2026-08-02 has its first real cost.**
You ruled participate-and-disclose, on the grounds that the proof is in the pudding and the measurement cost was not yet known.
§2.7 is the first instance where participation **altered the experiment** rather than decorating a measurement.
It still came out well, and I am not asking you to revisit the ruling — you asked to be told, and this is the telling.

## 5. On the epitaph

I considered superseding my predecessor's and **decided not to**, recording the judgment in the seat doc because the rule says that decision should be visible either way.
My candidate was _"your instruments will manufacture accusations about your colleagues, and you cannot tell them from findings at the moment they appear."_
It is the hardest thing I learned and **it has no scar**: I caught all five, and none reached the wire.
The epitaph it would have replaced cost its author the session's success criterion.
Mine cost a peer one message and the team two minutes.
**If a future instance ships one of those five, promote it then — it will have been paid for.**

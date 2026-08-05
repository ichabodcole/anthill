# Shipping the comms spike — the route from "it works" to "we can recommend it"

**Created:** 2026-08-04 · **Status:** Draft, for session 9's lead to convene against
**Author:** maestro (session 8), from the human's three questions at session 8's close
**Follows:** [slice-two](./slice-two-proposal.md) · [slice-three](./slice-three-proposal.md) · [session 8 retro](../../../.anthill/retro.md)

---

## Why this document exists

The human asked three questions and they have sharply different answers:

1. **Is comms ready to replace grapevine for intra-team communication?** — **Yes, one blocker.**
2. **What features do we still want first?** — **Two are blockers; the rest are wants.**
3. **Have we settled on a communication PATTERN worth shipping as guidance?** — **No, and more sessions of the current kind will not get us there.**

The third answer is the reason this is a plan and not a checklist. **The stated goal is to avoid a
cycle of feeling close without converging**, and the honest diagnosis is that our pattern evidence
cannot converge under the method we have been using. That is fixable, and fixing it is most of this plan.

## Question 1 — comms vs grapevine: ready, with one blocker

**The gate passed at the hardest setting we have run.** Session 8: **279 messages, six live seats,
parallel (not staged), sole wire, zero fallbacks** from convene to teardown. `grapevine pull` → 1
message (the topic string); `grapevine who` → 0 subscribers.

**The strongest evidence is one nobody set out to gather.** Hunting a comms defect, we found grapevine's:

```
grapevine pull <ch>   | cat   →   65,536 bytes · INVALID JSON · exit 0
anthill comms read    | cat   →  983,449 bytes · VALID
```

**Comms is measurably more robust than grapevine on the axis we stress-tested hardest** — 15× the pipe
buffer, clean. Filed upstream as [spellbook#77](https://github.com/ichabodcole/spellbook/issues/77).

**Not a blocker, stated so it is not rediscovered:** `--as` is unauthenticated (two independent
instances — [anthill#76](https://github.com/ichabodcole/anthill/issues/76) and our own, a neighbouring
agent session writing under the lead's handle). **Grapevine has the identical hole**, so it does not
gate a swap. It gates _treating attribution as proof_, which is a larger and separate question.

## Question 2 — blockers vs wants

|             | item                                                        | why                                                                                                                                         |
| ----------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **BLOCKER** | **session rotation**                                        | the wire opens carrying the previous session's log; a team will read old history as current                                                 |
| **BLOCKER** | **`comms stand-down`**                                      | departure and death are indistinguishable, so every session ends in `--force` — which trains the reflex the teardown guard exists to resist |
| want        | capability state ([slice three](./slice-three-proposal.md)) | unblocks four things: guest identity, human-on-wire, mute, substrate-as-sender                                                              |
| want        | ratify record (the human's poll idea)                       | the durable half is the real gap — see below                                                                                                |
| want        | addressed delivery                                          | [backlog](../../backlog/2026-08-01-comms-has-no-addressed-delivery.md)                                                                      |

### Session rotation — NOT a clear verb

**Ruled by the human, 2026-08-04, and it corrects this author's earlier framing.** The first version of
this plan said `comms clear` / `--fresh`. **That was wrong: the log is the provenance of everything a
session ships.**

> _"I don't want a situation where we have a clear verb that actually deletes the previous session's
> logs. It should really just be create new… we're losing a valuable historical artifact of what
> produced ultimately the artifacts we generated."_

**Session 8 is its own evidence.** weaver's upstream issue draft was pulled **out of the comms log after
teardown**, and scout's entire measurement lane reads from it. A clear verb would have destroyed the
provenance of two of the session's four shipped outputs.

**Model.** Each new session mints `.anthill/comms/<channel>/<session-id>.ndjson` and a per-session
positions directory, with a `CURRENT` pointer. Prior sessions stay on disk, addressable by id.
**Deleting is the human's choice, never the tool's.**

**It fixes three things and only one was the ask:**

1. **The historical record** — the stated requirement.
2. **A live bug hit at session 8's convene.** `comms positions` reported forager `behind` gap 1 and
   weaver `behind` gap 8 **before either seat existed** — session 7's records surviving, because
   positions are keyed by **channel**. Per-session paths make that structurally impossible rather than
   something a guard must catch.
3. **Contract 6(e)'s repair.** That clause is a known-unfixed defect: a live follower whose log is
   swapped underneath it carries `emittedThrough` across and reports `current`, gap 0, having emitted
   none of the new log. 6(e) says the fix is _"a change to what `follow` RECORDS"_ — **a session id in
   the path is exactly that**, because the follower can detect its path no longer resolves to `CURRENT`.
   Two seats measured 6(e) on themselves in session 6.

**It also retires the mtime trap** in cross-session measurement: session 7's report records a transcript
whose mtime sat inside session 7's window while containing only session-6 messages, nearly
misattributing a large block of spend. Session ids make "which messages are this session's" a lookup
rather than an inference.

> ### ⚠ Design constraint — name it before building
>
> **`convene` is documented as idempotent** — re-convening re-attaches rather than spawning a stranger.
> **Rotate-on-every-convene would silently mint an empty log and orphan the live one mid-session.** The
> trigger must distinguish **new session** from **re-attach** — the same distinction `bounty` already
> solves with `--session-key`.

## Question 3 — patterns: not settled, and the method is why

### What we actually have

- **Session 6** — worktree isolation. **n=1**
- **Session 7** — staged, shared tree. **n=1**
- **Session 8** — parallel, shared tree. **n=1**

**Every cross-session comparison is confounded**: different payloads, different seat counts (6 vs
2-live vs 6), different durations, and session 8's token figures are **void on model mix** (cold reads
and review lenses ran on a second model). scout said it in its own report — _"I cannot separate 'less
efficient' from 'ran longer with more seats talking'."_

**Exactly one pattern claim is established across sessions:** cold reads find _guard-did-not-guard_
defects that owning seats miss. **And even that was confirmed in session 8 against a contaminated
instrument** (three readers carried ~10K chars of our own commit messages), so it is a **lower bound**.
Session 7's sharper version — _"owning seats catch zero"_ — was **falsified** by session 8.

**Shipping guidance now would ship n=1 opinions as recommendations.**

### The structural problem, which is the important part

**We keep trying to A/B across sessions, and that can never work.** No two sessions share a payload, a
seat count, or a duration. **More sessions will not fix it — they will add more n=1s.** That is the
"feeling close without converging" cycle, named.

**Every clean result this project has produced came from a WITHIN-session control** — everything held
constant but one variable:

| control                   | held constant          | varied                       | result                          |
| ------------------------- | ---------------------- | ---------------------------- | ------------------------------- |
| weaver's pipe test        | payload, machine, tool | file vs pipe                 | 160,419 valid vs 65,536 invalid |
| sentinel's mutation pairs | test, file, command    | fix applied or not           | green before → red after        |
| sentinel's read-4         | brief, target class    | diff-only vs commit-messages | contamination isolated          |

**So pattern guidance needs a different instrument, not more sessions.**

## The pipeline

### Session 9 — "comms replaces grapevine" · _ships the swap_

**Build:** session rotation · `comms stand-down` · the measurement headline fix (lead with **output**
tokens; demote cumulative to a labelled cache-read line; drop tokens-per-commit as an efficiency claim
— see the [session-8 correction card](#) and the human's finding that 98.5% of the headline is context
re-reads).

**Run:** the session itself on comms with the vine **closed, not merely untailed**.

**Exit criterion — testable, not aspirational:**

> A session convenes, runs, and tears down cleanly with **no grapevine at all**, **and** the previous
> session's log is still readable by id afterwards.

**Confidence: high.** The work is small and mostly specified. **Slice three may land in parallel — it
blocks nothing here.**

### Session 10 — "the within-session control" · _makes pattern claims possible_

**Pick one variable and hold everything else constant inside a single session.** The obvious first one:
dispatch the **same artifact** to a cold reader and to its owning seat, **same brief, same moment**, and
compare what each finds. That is the claim we have leaned on for three sessions and never controlled.

**Build only what the measurement needs.** If that means a capability-state guest identity so an
observer cannot contaminate, that is the argument for slice three landing here rather than in 9.

**Exit criterion:**

> One pattern claim with a real control behind it — the comparison stated with what was held constant,
> what varied, and what would have falsified it.

**Confidence: medium.** The design of the control is the risk, not the build.

### Session 11 — "guidance draft + a second control" · _the ship decision_

**Draft the guidance from what actually has controls behind it**, and run a second within-session
control on whatever the draft leans on hardest.

**Exit criterion:**

> **Either** the guidance is defensible, **or** we can name precisely which claims lack evidence.
> **Both outcomes are shippable** — "here is what we know and here is what we do not" is more useful to
> another team than confident advice with n=1 underneath it.

**Confidence: medium.** This is the session where the answer could legitimately be "not yet", and the
plan should not pretend otherwise.

## Non-goals

- **Not** rewriting grapevine. It stays the cross-project wire; this is about intra-team comms only.
- **Not** solving `--as` authentication. Real, filed, and it does not gate the swap because grapevine
  shares the hole.
- **Not** producing more cross-session token comparisons. They are confounded by construction and the
  headline figure measures context re-reads rather than work.

## Risks

- **The biggest risk is this plan's own third leg.** Sessions 9 and 10 are buildable; session 11 asks
  the team to judge its own evidence, and this team's measured failure mode is **bounding a class from
  the instance it just fixed** (n=6 in one session, zero survived a grep by someone else). **The
  guidance draft should be cold-read by someone who did not write it**, against the
  `git archive <pre-session-sha>` surface, which session 8 established as the only genuinely cold one.
- **A rotation bug is worse than no rotation** — orphaning a live log mid-session loses exactly what the
  feature exists to preserve. The idempotence constraint above is the specific trap.
- **Slice three may pull session 10 forward.** If the control needs guest identity, 10 becomes a build
  session and the guidance slips to 12. **That is an acceptable outcome and should be said out loud
  rather than absorbed.**

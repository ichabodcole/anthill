# Criterion 7 — the close

**Status:** 🟡 **DRAFT — NOT CLOSED.** Written by the lead while the session is live, deliberately,
because the artifact describing what is left is the one that gets cut at teardown.
**Session:** 13 · **Branch:** `feat/close-one-wire-scope` · **Written by:** maestro

> **Criterion 7 is the last of eight. Closing it closes "SHIP THE ONE-WIRE TEAM", open since
> 2026-08-05.** This document exists so that closing it is an act with a record rather than a
> sentence someone writes at 2am.

---

## The two halves, and both are now built

Criterion 7 was **half discharged** at session start: the GitHub half was done twice over, and the
**board read-back was untouched.** The handoff described the untouched half as _"the 13 mis-stating
`review` cards and the missing `MOOT` class."_

### Half A — the mechanism (forager) ✅ LANDED, ⬜ VERIFICATION PENDING

**`f8a7bd8` — every seat re-reads its own `review` cards at join.**

It is `no store without a named re-read moment` applied to the board: a card is a **prediction about
the tree**, and nothing re-checked it across sessions. The emitted block gives a seat its own cards
and three verdicts — **SHIPPED / OPEN / MOOT** — and tells it to _run a command, not read the notes,
because the notes describe the world when the card was filed._

- **`+9 measured, 9 enumerated, no residue`**, run in an isolated `git archive` copy rather than the
  working tree (an earlier `+7` off the dirty tree included two peers' uncommitted files and was
  withdrawn before publication).
- **⬜ sentinel's verification is the open item**, pulled in at the verification point rather than at
  teardown. The question that matters: **is the read-back capable of failing?** A read-back that
  emits a list on a healthy board is indistinguishable from one that emits unconditionally.

### Half B — the triage (steward) ✅ DONE

**30 of 30 judged, every verdict by execution against the tree rather than by reading the notes.**

🔴 **27 of 30 mis-stated the tree. The inherited figure of "13" was a 2× UNDERCOUNT.**

That number is the single most important result of the night, and it runs **against** us: the problem
criterion 7 exists to fix was **twice the size we had been carrying**, and every prior statement of it
— including the handoff that scoped this session — understated it.

**`MOOT` shipped as a TAG, not as a status.** We cannot mint a bounty status, and a distinction living
only in anthill's emission would be invisible to anyone opening the board directly — which is exactly
what a fresh agent does. **Five cards now carry `tag: moot`**, applied without further negotiation,
and the read-back surfaced steward's own exemplar (`t-dd8b9b8a`, `convene --fresh` — the subject was
_deleted_, not fixed) without the two halves being wired together.

**Board: `review` 30 → 8, `done` 13 → 40.**

## 🔴 THE EXCEPTION THIS CLOSES OVER, AND IT DOES NOT GET TO CLOSE SILENTLY

**`t-9768866f` — grapevine is not gone.** steward measured **9 live lines, 7 of them a real
`grapevine who` call on the presence path, and it resolves.**

Step 4 shipped for its stated scope and `t-94ba16d1` is correctly SHIPPED; **the remainder was never
carded.** So the release criteria rest on comms running as the **sole** wire, and presence still reads
a wire the project believes it removed.

**The lead ruled it OUT OF SCOPE tonight** — this session closes criterion 7, and re-opening step 4
mid-flight is the continuously-rewritten-plan behaviour the sprints brief indicts. **That ruling is
recorded with its price rather than as a clean call:**

> **If criterion 7 closes tonight, it closes with a live `grapevine who` on the presence path.**
> The criterion is met **with a named exception**, not met cleanly. Whoever writes _"SHIP THE ONE-WIRE
> TEAM is closed"_ inherits this sentence and owes it a decision: either the criterion does not range
> over the presence path — **and says why** — or the scope ships with a known hole that is carded,
> owned, and scheduled.

**This paragraph exists because a criterion that quietly closes over its own exception is
indistinguishable from one that was met.**

## What this session did NOT do, stated so absence is readable

- ⬜ **sentinel's verification of the read-back** — open at the time of writing.
- ⬜ **The read-back's own prose understates the defect 2×** (`team-join.ts:287`, `:391` still cite
  _"13 of 27 (~48%)"_). **Ruled: the stale figure does not ship.** The form is forager's — a fresh
  count rots identically, so an assertion that survives both measurements is preferred.
- ⬜ **The convene pure builder** is still owed. sentinel's K1 guard reads `team-convene.ts` as
  **source text** and its own header says it _"must never be recorded as 'leadStandDown is
  covered.'"_ It is a stopgap and is labelled as one.
- ⬜ **`t-42dd65bf`'s second blind spot** — forager's own envelope named an **untracked** file, which
  contradicts the card's claim that `uncheckedAgainst` cannot see untracked work. **Carded as a
  question, not amended**, because the observation arrived without the mechanism.

## The unplanned result: `uncheckedAgainst`'s false empty, three times in one session

Not on any lane, and the strongest evidence the night produced for **S13-B**.

| land                    | `waitedMs` | `uncheckedAgainst` | what was actually true                                                 |
| ----------------------- | ---------- | ------------------ | ---------------------------------------------------------------------- |
| maestro `cbfab78`       | **26913**  | **`[]`**           | `f8a7bd8` and `99b8619` both landed **inside** the queue               |
| sentinel `bf2fd6c`/land | **17070**  | near-empty         | same shape, independently hit                                          |
| forager `f8a7bd8`       | 0.13       | non-empty          | the easy direction — nothing landed inside, so the list is trustworthy |

**All three in ordinary traffic, none constructed.** The sharpened form: the field is not merely least
trustworthy when `waitedMs` is large — **it grows more reassuring as it grows more wrong**, because a
longer queue means more peers land inside it and every one of them is clean by the time the porcelain
read fires 180 lines later.

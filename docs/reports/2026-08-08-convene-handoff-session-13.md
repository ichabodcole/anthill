# Convene handoff → SESSION 13 — close the one-wire scope

**Written:** 2026-08-08, by an unseated agent (no convene held) · **For:** the next lead, cold
**Tree state:** `develop` @ `0b852cf`, clean, pushed, gate green (543 pass / 1 todo / 0 fail)
**Your first action:** run **`anthill:convene`**. This doc is the "gather the work from the human"
step, pre-answered — **Cole has already ratified the shape below.** Confirm, don't re-litigate.

> **Why this exists.** Cole's 2026-08-05 ruling closed the release bar at 6-of-8 _"so long as we
> capture the remaining work in a way that makes the continuation easy for a fresh agent."_ This is
> that artifact, for the session that closes the remaining criterion.

---

## 1. The one thing this session is for

**Criterion 7 (`S13-E`) is the last of eight. It is half discharged.**

- ✅ **The GitHub half is DONE** — twice. All 27 open issues carry rulings
  ([2026-08-07 triage](2026-08-07-feedback-triage-70-73-94.md),
  [2026-08-08 triage](2026-08-08-feedback-triage-96-102.md)).
- 🔴 **The board read-back is UNTOUCHED.** The bounty board's **13 mis-stating `review` cards** and the
  missing **`MOOT`** class (_the subject was deleted_ — distinct from _we fixed it_, because they send a
  fresh agent to different places).

**Closing that closes criterion 7, which closes "SHIP THE ONE-WIRE TEAM" — open since 2026-08-05.**
Everything else in this doc is cargo riding along with a convened session that has to happen anyway.

## 2. ⚠ TWO ACTIONS THAT MUST HAPPEN AT EXACT MOMENTS — read before anything else

### 🔴 (a) CAPTURE THE BOUNTY DAEMON PID **AT ATTACH**, BEFORE ANYTHING ELSE

We owe the Spellbook team a measurement for
[spellbook#64](https://github.com/ichabodcole/spellbook/issues/64), under a **frozen, pre-registered
protocol**: [`backlog/2026-08-08-spellbook-64-idle-death-measurement-protocol.md`](../backlog/2026-08-08-spellbook-64-idle-death-measurement-protocol.md).

**`bounty info` at attach is the ONE permitted `cli.ts` call** — every bounty verb resets the idle
timer, so any later poll is a keep-alive that would **manufacture a survival**. Capture the pid at
t=0, then sample only with `ps -p <pid>`, snapshot mtime, and the daemon log.

**Miss this one call and the session is unmeasurable.** The protocol is **frozen — do not amend it
during the run**, and if six seats keep the board busy throughout, the honest result is **NOT TESTED**,
not survival.

### 🔴 (b) YOU, THE LEAD, STAND YOURSELF DOWN **LAST** — `anthill comms stand-down --as <you>`

`anthill down` will refuse and **name you**, because `commsPresenceFor` builds rows from
`config.seats` (lead included) and the `live-follower` branch preempts the spawned-seat check.
`convene`'s WIRE-YOURSELF-FIRST beat _guarantees_ you a live follower, so this is not an edge case —
it is the default ending.

**The reflex the guard exists to prevent — reaching for `--force` — will be one keystroke away.**
`finalize-session/SKILL.md:504-507` currently tells you a clean session tears down with no override.
**That sentence is false** (it states a sufficient condition that isn't), and the teardown checklist
has **no stand-down beat for anyone**. Fixing that is weaver's lane below; until it ships, this
paragraph is the only thing standing between you and a wrong `--force`.

## 3. Branch — decide BEFORE spawn

**Proposed: `feat/close-one-wire-scope`, off `develop`.** Convention is `feat/<slug>`
(`feat/one-wire-trustworthy`, `fix/spawnset-pin-order-dependence`).

This session **builds code**, so `AGENTS.md`'s branch flow applies: substantive work branches, and
only docs-only or paper-cut fixes land straight on `develop`. **Spawn is when seats gain commit
power** — cut the branch first.

⚠ **`AGENTS.md:57` now carries a `## Branch Landing Policy`: merge, do not squash or rewrite.** The
`project-docs` `finalize-branch` skill reads that heading. Attribution trailers and ~294 short-sha
citations depend on it.

## 4. Lanes — ratified by Cole

| seat                            | lane                                                                                                                                                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **forager** (CLI/engine)        | **THE BOARD READ-BACK — the criterion-7 deliverable, and the session's reason to exist.** Then `S13-B` (`uncheckedAgainst`'s false empty — the porcelain read at `team-commit.ts:526` sits _after_ `acquireLock` at `:346`) and **`#102`'s parser**      |
| **weaver** (skills/methodology) | **`#96`** — correct the false sentence at `finalize-session/SKILL.md:504-507`, add a stand-down beat to the checklist, and **make `convene` EMIT the lead's stand-down** the way `join` emits every seat's. Then document **`--as-of`** in the comms SOP |
| **sentinel** (verify)           | **`#100`** — three leaking fixtures (`lock.test.ts:20` +5/run, `comms.test.ts:498/:541/:548` +8, `comms.rotation.test.ts:37` +7) and **a gate cell so forgetting is RED**. Then cross-verify the other lanes                                             |
| **steward** (support)           | **The board triage** — the 13 mis-stating `review` cards and the `MOOT` class. This is criterion 7's other half and it is not forager's                                                                                                                  |
| **scout** (research)            | Observation, plus **trial the no-stake-reader brief** ([item](../backlog/2026-08-08-the-no-stake-reader.md)) as a measured thing rather than a proposal                                                                                                  |
| **maestro** (lead)              | The atomic land, the `#64` pid capture at t=0, and routing §7's rulings to Cole                                                                                                                                                                          |

**Full BUILD index:** [`backlog/2026-08-08-triage-build-batch.md`](../backlog/2026-08-08-triage-build-batch.md)
and [`backlog/2026-08-07-triage-build-batch.md`](../backlog/2026-08-07-triage-build-batch.md). Read
the reports before building — **five of seven reports in the latest batch were weaker than filed in a
way that changed the fix.**

## 5. Session 12's Q3 hypotheses — brief these verbatim

From [`.anthill/retro.md:87-95`](../../.anthill/retro.md). **Say out loud that a wrong prediction is
the valuable outcome**, or seats will quietly protect them.

1. **A "cannot" ships without a command, and no peer asks for one.** _(sentinel)_
   ⭐ **You already have an outside instance:** spellbook's `#101` asserted _"the only rule that never
   needed memory"_ — a cannot-claim, shipped without a command, **and false** (`--as-of` is opt-in
   with two bypasses). Carry it in as a prior.
2. **Announcing a design before writing code gets it falsified pre-implementation.** _(forager)_
   ⚠ **Named confound: all three instances had adjacent live cards.**
3. **A lesson stored in the shape of its instance does not fire on a different instrument.** _(steward)_
4. **Corrections land on CONCLUSIONS, not SUPPORT, unless a beat asks for support.** _(weaver)_
   Prediction: support class **under 20%**, all from steward or sentinel.
5. **Tag the MECHANISM separately from the OBSERVATION, or omit it.** _(scout)_
6. **Every thread gets a named owner and a stated relation to the critical path.** _(scout)_
7. **`comms send` refuses a body whose watermark disagrees with `--as-of`.** _(scout)_
   ⭐ **Scoreable this session with real data** — this is `#101`'s exact subject, and we now know the
   guard is **opt-in**, so the hypothesis as written overstates. See
   [the triage](2026-08-08-feedback-triage-96-102.md) § #101.

## 6. 🔴 DO NOT DO THESE — each would be a plausible, wrong move

- ⛔ **Do not exempt the lead from the presence count.** The
  [down-presence card](../backlog/2026-08-01-down-presence-guard-cannot-pass-for-a-correctly-wired-lead.md)
  ranked that fix top for seven days; **it is amended and the fix is forbidden** by #96 — the lead's
  follower is real and a lead can still be working. **The refusal is correct.**
- ⛔ **Do not "fix" `team-commit.test.ts`.** #100 names it as a leaker. **It is clean** — all 28 sites
  are `try/finally`, measured +0 per run.
- ⛔ **Do not ship `<gate> || <explain>`** for #97. `A || B` exits with **B's** status, so a red gate
  would report success — the exact failure `decideGate` exists to prevent. **Withdrawn by its own
  author.**
- ⛔ **Do not delete `boardShadowWarning`** (`S13-N`). Trigger fired, but the ruling is Cole's and the
  live proposal is **re-scope onto `/state.snapshotBackedUp`**, not delete.
- ⛔ **Do not amend the `#64` protocol during the run.**
- ⚠ **`#102`: there is no bare-words tradeoff.** An earlier ⚠ of ours claimed one; it was falsified.
  Implement rule 1 **and** keep bare words.

## 7. Pending with Cole — route, don't decide

1. **`S13-N`** — re-scope `boardShadowWarning` onto `/state.snapshotBackedUp`, keep the recovery
   sentence, name the **highest-`taskCount`-not-newest** rule. Unblocked: spellbook confirmed the field
   is safe to build against.
2. **The `&&` land-string cluster** — `#97`/`#98`/`#92`/`94·main` as **one** conversation. Our read on
   `procedures.land`: **sound argument, wrong hook** — `gate` resolves at _join_; finalize has no
   resolver, so the real scope is a finalize-side counterpart to `buildChecklist`. The Spellbook lead
   wants a time and will bring #97/#98 folded in.
3. **The squash question** —
   [card](../backlog/2026-08-07-squash-decision-predates-the-evidence-against-it.md). Cheap first move:
   count how many of the 294 cited shas fall inside merged feature branches.
4. **`70·2` + `73·2` — decide in the SAME room.** Roster-routing mis-routes exactly the findings that
   fall between seats.
5. **Two `principles.md` candidates + a format proposal** —
   [the terminal-guard rule](../backlog/2026-08-08-a-guard-that-emits-to-the-terminal-is-a-prose-guard.md)
   (with its boundary and repeal criterion), **reason-rot**, and the proposal that every principle
   carry _an imperative + a boundary check + a repeal criterion_. **Several of ours have neither, and a
   rule with no repeal criterion cannot be wrong — which means it cannot be checked.**

## 8. Cross-team state — nothing blocks us

**We are not waiting on Spellbook.** On two items they are waiting on us:

- **`#102`'s fix shape** — they have the identical defect (`--` eats `--session-key`, exit 0) and would
  rather adopt ours than invent a second. Send them the refusal text before we write it.
- **`#64`'s measurement** — this session.

**The wire is live:** `grapevine anthill-spellbook-r2`, their handle `spellwright`. Read msgs `#1`–`#14`
before posting; the exchange is dense and mostly settled. Daemon is now **2.1.0**, skew cleared.

## 9. The uncomfortable number, and it applies to you

Three independent samples of claims by competent authors who had **just read the thing they were wrong
about**: **3-of-6**, **5-of-7**, and the Spellbook team's own **6-of-6**. In one afternoon, two experts
designing the _same_ measurement each shipped an instrument that would have manufactured a pass, and
**each was caught only by the other.** A third instance was mine, in a document arguing that claims
must be run rather than read — caught by Cole asking one sentence.

**Re-reading is not the intervention. Not having a stake is.** `.anthill/principles.md:179-222` already
says this and ends _"the deficit is not company, it is that the mechanism has no trigger."_
[The no-stake-reader item](../backlog/2026-08-08-the-no-stake-reader.md) supplies the trigger — an
extension of that entry, **not a new finding.** scout's lane is to test whether it works.

## 9b. ⛔ A structural change is coming and it is NOT IN THIS SESSION'S SCOPE

Cole raised adopting **sprints inside long-lived projects**, modelled on Spellbook's `spell-hardening`
— immutable numbered sprints with `plan.md` / `outcome.md` / `decisions.md`, instead of one
continuously-rewritten `plan.md`. Written up in
[`briefs/2026-08-08-sprints-inside-long-lived-projects.md`](../briefs/2026-08-08-sprints-inside-long-lived-projects.md).

**It is real, we have the scars for it (`S13-*` is a sprint with no sprint), and it must not touch this
session.** Restructuring the docs mid-flight is precisely the behaviour the sprint model exists to
prevent. **The recommendation is to adopt at the arc boundary — i.e. at THIS session's close, once the
scope is actually shut.**

**What that means for you:** build as scoped. **At finalize, expect to write the first `outcome.md`**
for what becomes sprint 01 retroactively. Do not renumber anything, and do not migrate the backlog.

## 10. The agent that wrote this is STILL LIVE — how to use it, and what it is not

Cole is holding that session open. **Route through Cole** (it holds no seat and is not on
`anthill-dev`); it is also on `grapevine anthill-spellbook-r2` as `anthill-mercer` if the cross-team
wire is faster.

**⚠ It is deliberately NOT tailing `anthill-dev`, for two reasons worth knowing:**

- **Context is why this handoff exists.** Filling it with five seats' traffic re-creates the problem
  the handoff was written to avoid.
- **A non-roster follower is invisible to the presence guard** (`commsPresenceFor` builds rows from
  `config.seats` only), so it would _not_ block your teardown — **but do not generalise that to
  seats.** See §2(b).

**What it is genuinely useful for:**

- **A no-stake reader on this session's CODE.** It has no stake in anything you build today, and §9 is
  the argument for using one. **scout's lane is testing exactly this — here is a free subject.** Brief
  it the way the [item](../backlog/2026-08-08-the-no-stake-reader.md) says: refs and nothing else,
  _assume at least one contradiction exists_, four buckets, **do not fix**.
- **The reasoning behind a correction in the triage**, where the report records the verdict but not
  the path to it.
- **The `#64` protocol's history** — including both instruments that would have faked a pass, which is
  the fastest way to understand why the rules are shaped as they are.

**⛔ Where it is NOT no-stake, and this matters:** it **wrote** the triage, the BUILD indices, the #64
protocol and this handoff. **On anything derived from those it is the author, not an outside reader** —
its agreement is worth nothing there, and it has already been wrong twice today inside its own
documents. **Use it as a reader for the code; treat it as an interested party for the docs.**

---

_Router: [`ROADMAP.md`](../ROADMAP.md) — S13 table, the upstream-to-spellbook section, and the S13-E
box. Everything above is reachable from there; this doc is the ordering, not a second copy._

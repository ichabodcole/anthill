# Triage BUILD batch — `#96`–`#102`, the 2026-08-08 upstream reports

**Added:** 2026-08-08 · **Status:** ready to pick up, none started
**Source:** [`reports/2026-08-08-feedback-triage-96-102.md`](../reports/2026-08-08-feedback-triage-96-102.md)
— the evidence, the corrections and the verification for every item live there. **This file is the
actionable index, not a second copy of the argument.**

Every claim was verified against `develop` first, by four parallel passes each instructed to hunt for
overstatement. **Five of seven reports were weaker than filed in a way that changed the fix.** Read
the report before building any of these.

---

## 🔴 Do this first — it is a repair, not a feature

| what                                                                                                                                                                                                                                                                                                                                                                         | why it is urgent                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`2026-08-01-down-presence-guard…`](2026-08-01-down-presence-guard-cannot-pass-for-a-correctly-wired-lead.md) has been amended — verify nobody built from it.** Its premise (_"can never pass"_) was falsified by `comms stand-down`, and its top-ranked fix (_"exclude the lead"_) is **explicitly forbidden** by [#96](https://github.com/ichabodcole/anthill/issues/96) | It was marked **"ready to build"** for seven days with a wrong fix. **A card that converts diligence into a defect is the worst shape in the backlog.** Amendment landed; this row exists so the amendment is not the only thing that notices |

## Small, independent, no design call needed

| item                 | what to do                                                                                                                                                                                                                                                                                 | the sharp bit                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#100**             | Fix **three** files — `lock.test.ts:20` (+5/run), `comms.test.ts:498/:541/:548` (+8), `comms.rotation.test.ts:37` (+7). Move the end-of-body `rmSync` sites in `team-comms.test.ts` to `try/finally`. Add a gate cell asserting no `anthill-*` survives                                    | **A green suite leaks exactly +20.** ⚠ **`team-commit.test.ts` is CLEAN — do not "fix" it**; the report names it wrongly. The correct pattern already exists at `team-commit.test.ts` (`try/finally`) and `team-migrate.test.ts` (`afterEach`). The existing ~9,046 dirs are a **separate manual sweep** |
| **#102**             | Treat a leading-dash positional as message text in `feedback` **and `comms send`**; make `feedback` refuse surplus positionals the way `team-comms.ts:222-232` already does; **add `--stdin` to `feedback`**; relax the `--` hint at `define.ts:326-333` so it reaches `--`-leading values | 🔴 **`submitCmd` is poisoned** — it re-quotes the contaminated body **and hardcodes `--category friction`**, so the documented next step files the misfiled issue. ⚠ `feedback` declares `positionals` (plural) and joins them deliberately — the naive fix **drops the bare-words form**                |
| **#96** (docs half)  | Correct `finalize-session/SKILL.md:504-507` — the `all-spawned-departed` predicate is stated as **sufficient** and is not. Add a `comms stand-down` beat to the teardown checklist, **for the lead, last**                                                                                 | The sentence is **false**, so this is a correction and not an addition. The checklist currently has no stand-down beat **for anyone**                                                                                                                                                                    |
| **#101** (docs half) | Document `--as-of` in the `comms` SOP that already teaches the prose watermark                                                                                                                                                                                                             | **`--as-of` appears in ZERO skills or templates** — a load-bearing coordination mechanism discoverable only from `--help`                                                                                                                                                                                |
| **#97** (cheap half) | Promote the red-side foreign population from an error **string** to a **structured field**. Needs `emitError` to grow a `data` slot (`agent-layer.ts:98-104`)                                                                                                                              | Contract 5(a) was applied to the green side (`uncheckedAgainst`) and never to the red. Unambiguously correct, and a fraction of the cost of anything either report proposed                                                                                                                              |

## Needs one decision first

| item                          | the decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#96** (mechanical half)     | Prose in a skill, or **`convene` emitting the lead's stand-down line** the way `join` emits every seat's? This repo's own count favours emission — _"join's emitted manifest has worked in every session while prose guards went 0-for-4"_. **⛔ Whatever ships must not exempt the lead from the presence count**                                                                                                                                                                                                                                    |
| **#98**                       | Which route for a tool-authored `Gate:` trailer. **Cheap:** the hook's stdout is **already captured and discarded** at `team-commit.ts:457-459` — zero land-string surgery, but covers only hook-gated projects. **General:** `(<gate>) > <log> 2>&1 && … --gate-log <log>` in `buildLandCommand` — parens **mandatory**, kills live output on a 2-minute gate, and `buildLandCommand` has the worst breakage history in the repo. ⚠ **Either way it cannot assert a pass count** — anthill has no default gate, so it cannot parse an unknown runner |
| **#99** → folds into **94·1** | 94·1's decision now has a resolved answer: the start-notice may be the anchor **only if it reports the session origin.** ⛔ `previousPosition` must never be blessed as the anchor — it is what over-read a seat by 13 messages into the previous sprint. ⚠ And `openedAt` is the **wrong number**: stamped at spawn, _after_ the brief the SOP orders first, so it would cut off the brief                                                                                                                                                           |

## Newly surfaced, unfiled anywhere — worth a line each

- **The gate runs entirely BEFORE `acquireLock`** (`team-commit.ts:346`, `LOCK_WAIT_MS = 90_000`), so
  peers can land during the wait and **the commit lands on a tree the gate never saw.** Documented
  from the _reporting_ side at `README.md:195-205`, never as a **validity** hazard. This is the fourth
  ordering hazard in the `&&` chain — #98 says there are three.
- **`rotateSession` (`comms.ts:289-331`) has NO CLI caller**, yet `join/SKILL.md:130` points at
  rotation as an available remedy and `comms.ts:445-451` claims positions are per-session. **Both
  describe something no deployed team can reach**, and the second is the root cause of #99.
- **The red-side gate diagnostic can never fire for the LAND gate** — `&&` short-circuits, so `commit`
  never exists to compute it. Append to
  [`the-word-gate-names-two-different-things`](2026-08-06-the-word-gate-names-two-different-things.md),
  which must land first or #97 cannot be stated unambiguously.

## Covered, declined, or already shipped — recorded so it is not re-litigated

- **#97's headline is REFUTED.** The red-side instrument exists at `team-commit.ts:461-487`, **predates
  `uncheckedAgainst`**, and the success-path comment calls itself its _counterpart_. It shipped as
  `shared-tree-gate-tension` **move C.1**. 🔴 **And its fix #2 is actively unsafe** — `<gate> || …`
  exits with the _right-hand_ status, so a red gate would report success. That is exactly what
  `decideGate` exists to prevent (`team-join.ts:205`).
- **#101 is corroboration, not a new principle.** `.anthill/principles.md:320-325` already states it
  verbatim with the same 0-for-4 prose-guard scar. Its headline — _"the only rule that never needed
  memory"_ — is **false**: `--as-of` is **opt-in**, with two bypasses, and it has
  [failed here twice](2026-08-04-the-substrate-cannot-tell-a-seat-its-read-went-stale.md). Graft its
  one new idea — **name the crosser** — onto that item.
- **#99's requested warning already shipped** in `join/SKILL.md:121-132` (`90a67ae`, first released in
  **2.1.0**, measured n=2). They ran 2.0.0. **That strengthens the item rather than closing it:** their
  session is a third instance the prose could not prevent, which is `principles.md:320-325` firing
  again.
- **`anthill-rot-`, which #100 could not attribute, is `comms.rotation.test.ts:37`** — landed
  `81d3991`, tagged **2.1.0**, i.e. a build _newer_ than their newest cached copy, not one "not
  distributed here."

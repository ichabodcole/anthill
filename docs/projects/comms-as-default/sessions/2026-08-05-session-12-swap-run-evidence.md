# Session 12 — the swap run: criterion 2's evidence, and the three artifacts that FAILED first

**Status:** evidence record · **Session:** 12, 2026-08-05 · **Author:** maestro (lead)
**Branch:** `feat/one-wire-trustworthy` · **Baseline tree:** `4cb2f32`

> **Why this file exists.** The t=0 reading below **cannot be retaken** — it is the "before"
> half of a delta criterion, and the only moment it was available was before `anthill convene`
> ran. It was captured in gitignored scratch, which dies with the session. **This is its
> promotion to the tree**, per `principles.md`: _the channel evaporates — land decisions in an
> artifact._

**Taken 2026-08-05T20:37:11Z, BEFORE `anthill convene` ran. Tree at `4cb2f32` (develop, clean).**
Taken by maestro. This is the delta criterion's "before" reading and it cannot be retaken.

## `anthill-dev`, via `grapevine list` (spellbook 1.16.0)

| field                 | value at t=0                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `message_count`       | **2**                                                                                                                                         |
| `subscribers`         | **0**                                                                                                                                         |
| `connections`         | **0**                                                                                                                                         |
| `named` / `anonymous` | 0 / 0                                                                                                                                         |
| `loaded`              | true                                                                                                                                          |
| `archived`            | false                                                                                                                                         |
| `last_activity`       | 1785917996936                                                                                                                                 |
| `topic`               | session 11's, still set (verbatim: "Phase 3 — comms as the default wire: rotation, grapevine removal, the prose migration, and the swap run") |

## Tail processes — SCOPED TO `anthill-dev`, not global

**0 `grapevine tail` processes on `anthill-dev`.**

5 tail processes exist on this machine at t=0, every one on a different channel
(`comfy-callback-node` x2, `operator` x1, plus their shell wrappers).
**The global predicate is the epitaph's exact scar** — "absent from the process table" was a
global claim standing for a channel-scoped one, against a daemon serving twenty other projects.
**Scope every tail check to `anthill-dev` or it is unsatisfiable by construction.**

## What this baseline does NOT establish

**It is the absence-of-USE half only.** The absence-of-OPENING half needs a POSITIVE artifact
and `channelOpened` was deleted with step 4 — an absent field is not an observation (Contract 6(c)).
**Candidates visible in this baseline, none yet certified:** `last_activity` (an `open` touches it),
`loaded` (false→true on a cold open), `topic` (an `open --topic` rewrites it).
**sentinel must name and certify ONE before the run, not after.** That is criterion 2's own wording.

---

## 🔴 PRE-RUN ARTIFACT HUNT — all three runtime candidates FALSIFIED, before the run

**Run 2026-08-05T20:4xZ by maestro, on a throwaway channel (`maestro-s12-openctl`, since closed).
`anthill-dev` verified byte-identical to baseline afterwards (`last_activity` 1785917996936, msgs 2).**

| candidate           | control                              | result                                                                                      |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `last_activity`     | `open` an EXISTING channel twice     | **does not move.** Moves only on CREATE (absent → exists)                                   |
| `loaded`            | `anthill-dev` at baseline            | already `true`; nothing to observe                                                          |
| `topic`             | re-`open` with a DIFFERENT `--topic` | **not rewritten** — stays the first topic                                                   |
| **`message_count`** | re-`open` an existing channel        | **does not move** (1→1, 2→2); moves on CREATE and on `send`/`topic`                         |
| (`who` read)        | bare `who` against the channel       | does **not** move `last_activity` — clean, but it is the negative control, not the artifact |

> **⚠ CORRECTED 2026-08-05 by steward (comms `#715`), who re-ran every arm independently on his own
> throwaway channel rather than re-reading this file. THREE amendments, all his, all adopted:**
>
> **1. My conclusion below was an UNBOUNDED UNIVERSAL and it is FALSE AS WRITTEN. The bound is
> `archived`.** On an **archived** existing channel, `open` auto-unarchives and it IS observable on
> two surfaces — the envelope carries `{"unarchived": true}` and `list` flips `archived` true→false.
> **This does NOT rescue criterion 2:** `anthill-dev` is `archived: false`, so the branch is
> unreachable for our channel and the code-altitude ruling stands untouched. **The correction is to
> the SENTENCE, not the decision** — and it is worth the paragraph because _this is my own epitaph's
> exact shape, one artifact later_: a predicate published without the domain it ranges over. An
> unbounded universal in the reasoning that justifies the artifact is quotable at finalize, and the
> next reader has no way to know it was only ever true of the non-archived case.
>
> **2. `message_count` was MISSING from this table** and is the most obvious field a fresh reader
> reaches for. Added above. _An enumeration that omits a member reads complete_ — the enumeration
> principle, firing on the enumeration built to catch a domain error.
>
> **3. The `loaded` row is CONFIRMED-BUT-UNMEASURABLE, not verified.** Neither of us produced a cold
> channel, so **no `false`→`true` transition was ever observed** and the mechanism is uncertified.
> It is inert here; that is all either of us can say.
>
> **Independently re-verified by steward hours later: `anthill-dev` is byte-identical to the t=0
> reading above** (`message_count 2 · last_activity 1785917996936 · loaded true · archived false`).
> **The delta criterion's "before" reading — the one that cannot be retaken — is confirmed intact by
> someone who did not take it.** That is the half of a baseline nobody usually checks.

### The conclusion, with the domain steward supplied

**No runtime observation on an already-existing, NON-ARCHIVED channel distinguishes "convene opened
it" from "convene did not."** Every candidate moves on CREATE and is inert on RE-OPEN, and
`anthill-dev` has existed since session 3 and is not archived. The criterion's own wording — _"cite convene's own envelope"_ — was
written when `channelOpened` existed; step 4 deleted the field, and **an absent field is not an
observation** (Contract 6(c)).

**Therefore the absence-of-OPENING half must be established at CODE altitude, not at runtime:**
an executable assertion that `convene`'s reachable code path contains no `grapevine open`
invocation. Positive, runnable by a stranger, and it does not depend on daemon semantics.

**→ sentinel certifies the assertion's shape; forager pins it as a test. Named BEFORE the run,
per the criterion's own requirement. The absence-of-USE half is unaffected and its baseline stands.**

---

## MID-SESSION READING — 2026-08-05T21:04:15Z, ~1.5h into a live six-seat session

**Comms head at this instant: `#736`** — so **46 messages** (`#690` → `#736`) across six seats,
parallel, the full convene→build→verify cycle including three landed commits.

| field                                              | t=0           | mid-session       | delta |
| -------------------------------------------------- | ------------- | ----------------- | ----- |
| `message_count`                                    | 2             | **2**             | **0** |
| `last_activity`                                    | 1785917996936 | **1785917996936** | **0** |
| `subscribers`                                      | 0             | **0**             | 0     |
| `connections`                                      | 0             | **0**             | 0     |
| `grapevine tail` procs **scoped to `anthill-dev`** | 0             | **0**             | 0     |

### What this DOES establish — the absence-of-USE half

**A full working session ran on `comms` and put ZERO traffic on the grapevine.** 46 messages went
somewhere, and it was not here. `message_count` is the load-bearing number: it **does** move on
`send` (steward measured that with a live positive control at `#715`), so a delta of 0 across 46
messages is a **reading, not an inert field**.

### 🔴 What this does NOT establish, stated so a later reader cannot mistake it

**`last_activity` delta 0 is NOT evidence of non-opening.** That field is **inert on re-open of an
existing non-archived channel** — measured twice, by two seats, before the run. **A 0 there is
exactly what we would see whether or not `convene` opened the channel**, and quoting it as
absence-of-OPENING evidence would be the false green this whole criterion exists to prevent.

**The absence-of-OPENING half rests entirely on sentinel's code-altitude assertion** — the
**whole-spawn-set** form, never `not.toContain("grapevine")`, which passes vacuously in CI.

**The `topic` still reads session 11's string**, which is consistent with never having been re-opened
with a topic — and is also consistent with having been re-opened, since `open --topic` does not
rewrite an existing topic. **It is not evidence in either direction and is recorded only so nobody
later mistakes it for some.**

**Closing reading still owed at teardown.**

---

## ✅ CLOSING READING — 2026-08-05T21:34:12Z. CRITERION 2's absence-of-USE half is MET.

**The session ran start to finish and put nothing on the grapevine.**

| field                                              | t=0 (20:37:11Z) | close (21:34:12Z) | delta             |
| -------------------------------------------------- | --------------- | ----------------- | ----------------- |
| `message_count`                                    | 2               | **2**             | **0**             |
| `last_activity`                                    | 1785917996936   | 1785917996936     | **0**             |
| `subscribers` / `connections`                      | 0 / 0           | **0 / 0**         | 0                 |
| `grapevine tail` procs **scoped to `anthill-dev`** | 0               | **0**             | 0                 |
| **comms head (the wire we DID use)**               | **#690**        | **#792**          | **+102 messages** |

**Gate at close: exit 0 · 543 tests across 32 files · 0 fail** (baseline was 525 tests).
**25 commits. Six seats. Parallel. One wire.**

### Why the `message_count` delta is a READING and not an inert field

**It moves on `send`** — steward measured that with a live positive control on a throwaway channel
(`#715`), and again on create. **So 0 across 102 messages is an observation that the traffic went
somewhere else, not a field that never changes.**

### 🔴 The half this does NOT establish, restated at the close so it cannot be quoted loose

**`last_activity` delta 0 is NOT evidence of non-opening** — the field is inert on re-open of an
existing non-archived channel, measured twice by two seats. **The absence-of-OPENING half rests
entirely on the code-altitude artifact** (`plugin/scripts/anthill/commands/team-convene.spawnset.test.ts`),
which asserts the **whole spawn set** rather than the absence of the vine, because
`not.toContain("grapevine")` **passes vacuously on the empty ledger CI produces.**

**And that artifact carries its own bound, at its author's width:** it observes exactly one
boundary — spawns routed through `execCoord`. **The honest claim is "convene makes no vine
invocation through the coordination layer", NOT "convene cannot touch the vine."**

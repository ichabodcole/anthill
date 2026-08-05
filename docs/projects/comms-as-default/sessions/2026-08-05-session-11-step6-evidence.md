# Session 11 — the step-6 evidence envelope, preserved because the live instrument stops reporting it

**Date:** 2026-08-05 · **Session:** 11 (Phase 3) · **Branch:** `feat/comms-as-default-phase-3`
**Stamped by:** maestro, at `91e9c5c`, clean tree
**Why this file exists:** steward's `#568`, whose concrete ask is the whole point of it.

---

## The ask this file discharges

> _"Whoever writes the step-6 verdict must cite the 08:13Z `channelOpened: true` envelope, not a live
> `grapevine who`. If that envelope is not preserved somewhere durable…"_ — steward, `#568`

**It was not.** It existed only in the lead's scrollback and in a comms message. Neither is an artifact
a stranger can run or read. This file is the artifact.

---

## The mechanism, stated before the readings — a correct remedy that blinded the instrument

Exit criterion v3 is **three readings, and they do not have the same durability.** Ruling R1 (kill the
grapevine tails) was correct and was executed. **Its side effect is that the two readings anyone would
run first now read GREEN on a criterion that is permanently FAILED.**

| sub-reading                              | at 08:19Z             | after R1                               | durable?                                      |
| ---------------------------------------- | --------------------- | -------------------------------------- | --------------------------------------------- |
| `subscribers` empty                      | `["scout","steward"]` | `[]` — **reads PASS**                  | ❌ **transient — R1 made it green**           |
| vine log unchanged across the run        | 2 entries             | 2 entries — reads FAIL                 | ✅                                            |
| `convene` never invoked `grapevine open` | `channelOpened: true` | **only in an envelope nobody re-runs** | ✅ permanent, ❌ **hardest to observe later** |

**The smallest, most wave-off-able reading is the only permanent one, and the two that now read clean
are the two anybody runs first.** A finalize sweep that runs `grapevine who` and stops gets a green on
a permanently-failed criterion.

**And it is a scheduled event rather than a hypothetical** (forager `#566` + steward `#568`, neither
seat looking at the other's half): `team-support.ts:469` invokes `grapevine who`, fired by **`status`
and `down`** — so **`anthill down` consults the vine as part of teardown, automatically**, and it will
see `subscribers: []` because R1 emptied it.

---

## The envelopes, verbatim

### 1. `anthill convene --fresh` — 2026-08-05T08:13Z. **The permanent failure of absence-of-OPENING.**

```json
{
  "ok": true,
  "data": {
    "channel": "anthill-dev",
    "channelOpened": true,
    "boardOpened": true,
    "fresh": true,
    "freshOutcome": "cleared",
    "freshSnapshot": "/Users/colereed/.grapevine/archive/anthill-dev-1785917587282.jsonl",
    "topicSet": true,
    "board": { "todo": 51, "doing": 4, "review": 19, "done": 11 },
    "commsIncantation": "… comms follow anthill-dev --as maestro"
  },
  "meta": { "command": "convene", "durationMs": 122 }
}
```

**`channelOpened: true` is the envelope reporting a real call**, not a self-description — steward
verified the call site rather than taking the field's word for it:

```
plugin/scripts/anthill/commands/team-convene.ts:261
  const open = await execCoord(grapevineCli, ["open", channel, ...(fresh ? ["--fresh"] : [])]);
```

**Absence-of-OPENING failed at 08:13Z, before any seat existed. No seat's behaviour is load-bearing
for the verdict.**

### 2. `grapevine who anthill-dev` — 08:19:01Z, **before** R1. The failure of absence-of-USE.

```json
{
  "ok": true,
  "channel": "anthill-dev",
  "subscribers": ["scout"],
  "humans": [],
  "count": 1,
  "connections": 1,
  "named": 1,
  "anonymous": 0
}
```

Re-read moments later: `subscribers: ['scout','steward']`, `count: 2` — climbing as seats joined.
Live tails enumerated (**listed, not counted** — `grep -c` first returned `3`, of which three lines
were the measurer's own `who` invocations):

```
pid 515/517   grapevine tail anthill-dev --as scout
pid 2599/2601 grapevine tail anthill-dev --as steward
```

### 3. The vine log — the one FAILING reading that survives

```
grapevine pull anthill-dev  ->  exactly 2 entries
  id 1  from "system"  kind "topic"    <- convene set it
  id 2  from "scout"   kind "message"
senders enumerated: scout 1, system 1.    CONTROL 'zzzznotoken' -> 0
```

### 4. Post-R1, for completeness — **this is the false green, recorded AS the false green**

```json
{ "subscribers": [], "count": 0, "connections": 0 }
```

**This reading passes. The criterion does not.** Anyone quoting it as evidence the swap run succeeded
is quoting the instrument after the remedy blinded it.

---

## The verdict this file fixes in place

**Session 11 FAILS exit criterion v3, permanently, on both halves.** Not by a margin that later work
can close — **a session cannot un-open a channel.**

- **absence of OPENING** — failed 08:13Z by the lead's own `convene`, before any seat booted.
- **absence of USE** — failed at first tail attach; three seats armed the vine from the join manifest
  before reading the brief that would have told them not to (`t-772653d5`, n=3).

**R1 stops the violation growing and undoes none of it.** Per Cole's ruling, **step 6 is a successor
session** — stand down after Phase 3 lands, re-convene on the new code, and measure there.

**⚠ The sentence that must never be written about session 11:** _"we ran the session with the vine
off."_ It is false at the front. The vine was opened, subscribed to by three seats, and turned off
partway through.

---

## What the swap-run session must cite

**The 08:13Z envelope above, or the equivalent one from its own convene — never a live `grapevine
who`.** If the swap run's `convene` returns `channelOpened: false` (or the field is gone because
step 4 deleted the call site), **that** is the artifact. A green `who` proves nothing either way,
which is the entire lesson of this file.

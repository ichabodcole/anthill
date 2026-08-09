# spellbook#64 — idle-death measurement, session 13 (LIVE RUN)

**Protocol:** [`backlog/2026-08-08-spellbook-64-idle-death-measurement-protocol.md`](../backlog/2026-08-08-spellbook-64-idle-death-measurement-protocol.md)
— **frozen, not amended during this run.**
**Daemon:** spellbook `2.1.0` (`idleTimeout: 255`), board `k-anthill-dev-adad92ec`
**Recorded by:** maestro (lead), session 13

---

## ⚠ READ FIRST — there were TWO daemons, and the first death was MINE, not an idle death

Scoring the pid change at 19:02:43Z as a `#64` failure would be **wrong**, and it is the single
most likely misreading of this record. It is stated here rather than in a footnote because the
protocol says _"a changed pid is a respawn and therefore a failure"_ — that rule is correct and
this transition is outside it.

| daemon    | born      | died      | cause                                                  |
| --------- | --------- | --------- | ------------------------------------------------------ |
| pid 71107 | 18:54:10Z | 19:02:43Z | **SIGKILL by the lead, deliberately** — board recovery |
| pid 74370 | 19:02:43Z | —         | **the measurement subject** — window opens here        |

**Why 71107 was killed.** `anthill convene` spawned it fresh against an **empty** board while a
**102-task snapshot** sat on disk (`boardShadowWarning` fired and was correct). Recovery required
terminating it, and `close` / `--fresh` / **SIGTERM** all run the teardown, which **writes the live
board to the snapshot** — flushing empty over 102 tasks. `SIGKILL` is untrappable, so it skips the
teardown and leaves the snapshot alone. Verified before and after: mtime `2026-08-06T17:15:36Z`,
118736 bytes, 102 tasks — **byte-identical across the kill.**

**So 71107's death carries no information about `#64`.** The measurement subject is **74370**.

## t=0 — the baseline

- **pid: `74370`** · born **2026-08-08T19:02:43Z** · restored board, **102 tasks** live
- **Captured with `lsof -nP -iTCP:<port> -t`, not `bounty info`** — the discovery file
  (`$TMPDIR/bounty-k-anthill-dev-adad92ec.json`) carries the **port** but no pid, and `lsof` turns
  the port into a pid while touching the daemon **not at all**.
  → **The protocol's one permitted `cli.ts` call is therefore UNSPENT.** That is a margin the
  protocol did not assume, and it is worth keeping: the permitted call exists because the author
  believed a pid could only be had by asking the daemon for it. It can't be had that way for free,
  and it doesn't need to be.

## Sampling — the three non-touching probes only

1. `ps -p 74370` — liveness
2. `stat` on `~/.bounty/snapshots/k-anthill-dev-adad92ec.json` — mtime moves only on real mutation
3. the append-only daemon log

**No `cli.ts` verb is used to sample.** Seats using the board for real work is the **workload under
test**, not a protocol violation — the protocol's own NULL RESULT clause anticipates exactly that.

| sample @  | pid alive        | snapshot mtime (LOCAL) | note                                         |
| --------- | ---------------- | ---------------------- | -------------------------------------------- |
| 19:02:58Z | ✅ yes           | 2026-08-06 17:15:36    | t=0, board restored, no mutations yet        |
| 19:30:47Z | ✅ yes, 28m04s   | 2026-08-08 12:28:57    | 6 seats live, board mutating — real workload |
| 19:42:36Z | ✅ yes, 39m53s   | —                      | continuous six-seat traffic                  |
| 19:53:40Z | ✅ yes, 50m57s   | —                      | criterion 7 landing; heavy board mutation    |
| 20:08:23Z | ✅ yes, 1h05m40s | 2026-08-08 13:07:35    | still alive, board still mutating            |

### Probe 3 — the daemon log, and it independently confirms the SIGKILL reasoning

```
17:54:49.377Z  k-r2probe-f4249899   pid 31386  reason:"close"  subscribers:0  idleMs:0.08
18:54:10.455Z  k-anthill-dev-adad92ec  pid 71107  reason:"ready"  port 50058
19:02:43.684Z  k-anthill-dev-adad92ec  pid 74370  reason:"ready"  port 50155
```

**Two facts fall out of this that no other probe gives us:**

1. **`pid 71107` has NO `closed` frame.** The log records `reason:"close"` for other sessions (the
   `k-r2probe` row above), so the field exists and fires. **71107 simply never emitted one — because
   `SIGKILL` is untrappable and the teardown never ran.** That is the exact property the board recovery
   depended on, confirmed from the daemon's own record rather than from my reasoning about it.
2. **`pid 74370` has no `closed` frame either — because it is still running.** `ps` and the log agree.

**⚠ Read (1) correctly:** the absence of a `closed` frame for 71107 is **evidence the teardown was
skipped**, which is what made the snapshot survive. It is **not** evidence about `#64`, because that
death was mine.

**⚠ UNIT CORRECTION, MINE, AGAINST MY OWN EARLIER ROWS.** `stat -f %Sm -t '…Z'` prints **local
time** and the `Z` is a suffix I supplied, not an observation — so the snapshot mtimes above are
**local, not UTC**, and the first row's original `2026-08-06T17:15:36Z` was mislabelled by me. **The
pid timestamps are genuine UTC** (`date -u`), and **survival is judged on the pid**, so nothing in
the verdict moves. Recorded rather than silently fixed because it is the same defect this session
ruled on twice within the hour — a correct measurement carrying the wrong unit (bytes vs chars at
R3, `n=6` vs `n=5` at scout's `#854`). **Third instance, same shape, and this one is the lead's.**

## 🔴 OUTCOME — **NOT TESTED.** The pre-registered null result is the one that occurred.

**pid 74370 was alive at every sample and at session close — 1h23m23s — and that is NOT a survival
result.** The protocol named this outcome in advance precisely so it could not be claimed as one:

> _"If six seats keep the board busy throughout, the run never exercises the condition and reads as
> **NOT TESTED — not as survival.** This is the outcome most likely to be quietly read as success,
> which is exactly why it is written down before the run."_

**Six seats worked the board continuously for the whole window.** Every board verb resets the idle
timer, so `idleMs` never accumulated. **The daemon did not survive an idle period; it never had one.**
**Reporting this as a survival would be the manufactured green this protocol was rewritten twice to
avoid** — and it would be the third such instrument in `#64`'s history.

## ✅ BUT THE RUN PRODUCED SOMETHING BETTER: TWO REAL IDLE-DEATHS, WITH THE FIELD

**The append-only daemon log carries `#64`'s failure mode on this exact board, twice, in the
pre-committed form — `reason` read as a field, nobody interpreting anything:**

```
2026-08-05T20:23:46.963Z  k-anthill-dev-adad92ec  pid 15132  reason:"timeout"  subscribers:0  idleMs:7200140.41
2026-08-05T20:40:32.369Z  k-anthill-dev-adad92ec  pid 93692  reason:"ready"    port 56437
2026-08-07T00:15:36.402Z  k-anthill-dev-adad92ec  pid 93692  reason:"timeout"  subscribers:0  idleMs:7200209.98
2026-08-08T18:54:10.455Z  k-anthill-dev-adad92ec  pid 71107  reason:"ready"    port 50058     <- my convene
2026-08-08T19:02:43.684Z  k-anthill-dev-adad92ec  pid 74370  reason:"ready"    port 50155     <- subject, alive at close
```

**Both deaths: `reason: "timeout"`, `subscribers: 0`, `idleMs ≈ 7200000` (two hours).** That is the
`#64` mechanism with its cause as a **field** rather than a judgement, which is what the protocol
asked for.

**⚠ AND IT ALSO EXPLAINS THE THING THAT STARTED OUR SESSION.** The `2026-08-07T00:15:36Z` timeout is
**why the board was empty at convene** — that daemon idle-died between session 12 and session 13, and
`boardShadowWarning` fired against the snapshot it left behind. **`#64` was not an abstraction we were
measuring for someone else tonight; it had already cost us 102 cards' worth of scare and an hour of
recovery, before anyone thought to look at the log.**

### 🔴 THE QUESTIONS THIS RECORD CANNOT ANSWER, AND spellwright CAN

1. **Were pids 15132 and 93692 running `2.1.0`, or an earlier build?** They died on 08-05 and 08-07.
   **We cannot date the binary from the log, and the whole value of these rows turns on it.** If they
   predate `2.1.0`, they are the "before" arm `#64` has been missing. If they are `2.1.0`, the fix did
   not hold.
2. **`idleMs ≈ 7200000` against a stated `idleTimeout: 255`.** The observed threshold is **two hours**,
   not 255 of anything. **We are not asserting a contradiction — we do not know the unit or which
   timer the log stamps.** Stated as an observation for its owner.

**Neither is ours to resolve.** Both are reported rather than interpreted, per the protocol's
_"nobody interprets anything"_ rule.

## ✅ REPORTED — and the protocol's last criterion was RULED, not skipped

**Sent 2026-08-08 as `grapevine anthill-spellbook-r2` msg `#17`**, delivered: the NOT TESTED verdict,
the no-subscriber admission, both log deaths verbatim, the two questions, and the dedicated-test
design **offered for their review before we run it.**

**⚠ The frozen protocol's acceptance criteria say _"the result is posted to
[spellbook#64](https://github.com/ichabodcole/spellbook/issues/64) whichever way it goes."_ That box
is NOT ticked, and it is a RULING rather than an omission.**

> **Cole, 2026-08-08: _"The channel route covers it, don't post to the issue."_**

He is routing it to the Spellbook team himself. **Recorded here because an unchecked criterion and a
silently-skipped one are the same artifact to a future reader** — and this protocol's own discipline
is that `UNCHECKED` is a verdict that must be written. **The criterion is DISCHARGED BY A DIFFERENT
ROUTE, by the human's decision, and the protocol is still not amended.**

---

## 🔴 AMENDMENT, 2026-08-09 — THE SUBJECT DIED AFTER WE CLOSED, AND IT ANSWERS QUESTION 1

**Read after the report above, which stands as written. Nothing below changes the NOT TESTED
verdict** — it changes what we know about the daemon, not what this run measured.

```
2026-08-09T00:02:00.725Z  k-anthill-dev-adad92ec  pid 74370  reason:"timeout"  subscribers:0  idleMs:7200099.21
```

**`pid 74370` is this report's measurement subject.** It was alive at session close and idle-died
**two hours later**, at the same threshold as every other death on this board.

**⚠ This is NOT a `#64` confirmation.** `subscribers: 0`, and nobody was tailing — a daemon with no
subscribers idling out at its idle timeout is the timer **working**. It is reported because it
resolves a question this report left open, not because it demonstrates the bug.

### It answers Q1 — and it answers it by making the question stop mattering

**Q1 asked whether pids 15132 / 93692 were running `2.1.0`, because the value of those two rows
turned on it.** We still do not know. **We no longer need to:** `74370` was spawned by this session
from the installed `2.1.0`, so **its build is certain** — and it died with `idleMs` within **0.1
seconds** of both of them. **`2.1.0` idles out at 2h with 0 subscribers exactly as its predecessors
did.** The "before/after" arm the report was fishing for shows **no difference in the observable**.

### The census — 34 deaths, 8 boards, four weeks, one number

Read from the full `~/.bounty/daemon.log` (499 frames), **not from the excerpt above**:

| fact                      | value                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `reason:"timeout"` frames | **34**, 2026-07-14 → 2026-08-09                                                                                |
| distinct boards           | **8** (`anthill-dev`, `spellbook`, `dream-flute`, `operator`, `story-loom`, `media-buffet`, `forge`, + probes) |
| `subscribers` at death    | **0 — all 34, no exceptions**                                                                                  |
| `idleMs` at death         | **≈ 7 200 000 (2h), every one within ±0.22s**                                                                  |
| the single outlier        | `k-daed-probe`, `idleMs 5215` — a deliberate short-timeout probe, not a counterexample                         |

**And the `subscribers` field is not stuck at zero — it reports up to 4.** Eight frames carry
`subscribers > 0`; every one is a `reason:"close"` with `idleMs ≈ 0.1ms` (an explicit close while
active). **So "0 at all 34 timeouts" is a real measurement, and that matters more than the count.**

### 🔴 THE THING THE LOG CANNOT DO, AND IT IS THE WHOLE REASON A DEDICATED TEST EXISTS

**A death at `subscribers: 0` is equally consistent with two stories, and the log has no frame that
separates them:**

1. **No tail was ever attached** — the daemon idled out correctly, by design.
2. **A tail WAS attached and got severed** — `subscriberCount` fell to 0, and the daemon idled out
   two hours later. **That is `#64`'s mechanism exactly.**

**There is no subscriber-attach/detach frame in the log.** By the time the timeout fires, both
stories have produced a byte-identical record. **34 deaths cannot distinguish them, and neither
could 340** — which is why the answer needs an experiment that holds a tail open and watches the
connection, rather than more log-reading.

**⚠ So do not read the census as evidence for `#64`, and do not read it as evidence against it.**
It is evidence about the _idle timeout_, which is a different claim.

### 📎 Also observed — `snapshotBackedUp` fired in the wild, unprompted

```
2026-08-08T21:03:46.825Z  k-spellbook-f4249899  pid 23405  reason:"snapshotBackedUp"
   priorTasks:35  nextTasks:0  backup:.../k-spellbook-f4249899.pre-1786223026825.bak.json
```

**A real board, not ours, about to shrink 35 → 0 — caught and backed up automatically.** `S13-N`
proposes re-scoping `boardShadowWarning` onto exactly this field; **this is the field doing its job
on live traffic, which is stronger than the source read this report already recorded.** The ruling
is still Cole's.

### ✅ RESULT 2026-08-09T02:32Z — the board SURVIVED its idle timeout with a tail attached

**Pre-registered outcome, and it went the way the log could not predict.** The daemon crossed
7200 s at `t+7202s` and was still serving at `t+7803s`. Evidence of continuous attachment is
**received bytes, not process liveness**: the tail's keepalive stream grew `+304 bytes / 240 s`
with **no gap for 1h40m** — 16 frames per 4 min, one per 15 s, matching `server.ts:923`.
A drop-and-reconnect would show as a discontinuity; there is none.

**This is the verification the maintainer said was missing** — `#64`'s own thread records 2.1.0 as
shipping _"a probable root cause — staying open, because nobody has reproduced the original symptom
against it."_ Posted as `#64` comment `5229438564`.

**The mechanism is deterministic, and the arithmetic is the whole story:** the SSE keepalive is
**15 s** and Bun's default request `idleTimeout` is **10 s**, so before 2.1.0 _every keepalive
arrived 5 s after the connection had already been severed._ `subscriberCount` fell to 0 in every
gap and `shouldIdleClose` (`server.ts:216` — returns false whenever `subscriberCount > 0`) then
fired correctly. 2.1.0 sets `idleTimeout: 255` (`server.ts:1183`), ~17× the keepalive.

**The control arm is our own pid 74370**: same machine, same 2.1.0 build, **no subscriber**, dead at
7200 s to within 0.1 s. So the timeout works as documented and the subscriber is the variable.

**⚠ A hypothesis this report should NOT be read as supporting.** Mid-probe, maestro proposed that
the dream-flute team's keep-alive tail had been _attached to nothing_ — generalising from our own
cwd-scoping scar below. **That is downgraded.** The `idleTimeout` mechanism explains their report
better, it was already written in `#64`'s thread, and their tail was attached — it was being
severed. **The scar was reached for instead of the document, which is the same failure this report
already logs twice.** The non-attachment problem is real but separate, and is filed as
spellbook`#98` on its own evidence: a tail that resolves no board retries forever, exits 0, and
looks alive in `ps`.

**What it does not establish:** n=1; 1.15.0 was never run side by side, so this shows 2.1.0 holds
rather than reproducing the old failure; and it does not isolate _which_ property of the connection
resets the clock (keepalive frames vs. the socket merely being open) — those imply different fixes
if it ever regresses.

### ▶ The dedicated test was launched 2026-08-09T00:32Z

Board `k-anthill-64-probe-adad92ec`, daemon **pid 9772**, port 51922, **one live tail**, 4h window,
zero-touch sampling to `~/.bounty/probe64/samples.log`. **It is on its OWN board key, so anthill
development traffic cannot reset its idle timer** — which retires the design doc's claim that the
experiment and ordinary work are mutually exclusive. **That claim was true of one board and was
written as though true of the machine.**

---

### The honest one-line summary for `#64`

> **Survival: NOT TESTED — the workload never let the board idle.** **But the log carries two
> `reason:"timeout"` deaths on this board at ~2h idle with 0 subscribers, and one of them is what
> emptied our board between sessions.** **The protocol's one permitted `cli.ts` call went unspent.**

_Superseded 2026-08-09T02:32Z by the dedicated probe — see the RESULT section above. Survival is now
**TESTED and POSITIVE** on 2.1.0 with a subscriber attached. The line above remains accurate about
what the **log** could establish, which was the point it was making; it is the log's limit, not a
finding, and the probe is what moved past it._

## An unplanned first-hand finding, logged because it is `S13-N`'s subject

**`boardShadowWarning` fired at convene and was RIGHT** — it named a 102-task snapshot behind a
0-task live board and told the reader not to close. Acting on it is what saved the cards.

`S13-N` proposes re-scoping that warning onto `/state.snapshotBackedUp`. **That field is real and
live in 2.1.0** (`server.ts:758`, spread at the `/state` handler `:1203-1209`), so the re-scope is
buildable — confirmed by reading the source, not by report. **The ruling remains Cole's.**

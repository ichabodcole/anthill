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

## Outcome — NOT YET DETERMINED

Per the protocol's pre-committed outcomes:

- **survives the session** → `spellwright` closes `#64` on this report
- **pid gone at any sample** → death; read `closed.reason` as a **field** (`timeout` vs
  `user`/`close`/`signal`), exit `124` is the process-side twin
- **🔴 board busy throughout** → **NOT TESTED**, never "survival". Six seats on a live board makes
  this the most likely outcome, and it is the one most easily misread as success.

## An unplanned first-hand finding, logged because it is `S13-N`'s subject

**`boardShadowWarning` fired at convene and was RIGHT** — it named a 102-task snapshot behind a
0-task live board and told the reader not to close. Acting on it is what saved the cards.

`S13-N` proposes re-scoping that warning onto `/state.snapshotBackedUp`. **That field is real and
live in 2.1.0** (`server.ts:758`, spread at the `/state` handler `:1203-1209`), so the re-scope is
buildable — confirmed by reading the source, not by report. **The ruling remains Cole's.**

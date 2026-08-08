# A DEDICATED test session for `spellbook#64` — because session 13 could not have tested it

**Added:** 2026-08-08, at Cole's direction after session 13 returned **NOT TESTED**
**Status:** design, not scheduled. **Cole: _"we might just want to do some sort of dedicated test,
separate from development work… spin up a team, do a test where we're figuring out how to orchestrate
this."_** Scheduling left to the team.

---

## 🔴 THE THING THAT MAKES THIS WORTH A DEDICATED SESSION, AND IT IS NOT "WE WERE TOO BUSY"

Session 13 reported NOT TESTED because six seats kept the board busy and it never idled. **That is
true and it is the smaller half.**

**The larger half: session 13 had NO SUBSCRIBER, so it could not have tested `#64` even if it had sat
perfectly idle for six hours.**

`#64`'s hypothesis is specifically about a daemon dying **under a live tail**:

> `spellbook-v2.1.0` sets `idleTimeout: 255`. Bun's default **request** `idleTimeout` is **10s** and
> bounty's SSE heartbeat fires every **15s** — so on an otherwise-idle connection **the heartbeat
> could never fire, the tail's connection was severed, `subscriberCount` fell to 0, and the daemon
> idle-closed because its keep-alive died.**

**The failure mode is: a tail exists, and dies anyway.** Both idle-deaths session 13 found in the log
carry **`subscribers: 0`** — and so would ours, because **nobody ran `bounty tail` all night.**

**So a plain idle test measures the ordinary idle timeout, not `#64`.** It would go quiet, die at the
threshold, and look like a confirmation while testing a different mechanism. **That is a third
instrument that would have manufactured a result, and it is the one we would have built next.**

## The design

### The arm that matters — a LIVE TAIL, then silence

1. **Open a keyed board.** Capture the pid **zero-touch**: `lsof -nP -iTCP:<port> -t`, where the port
   comes from `$TMPDIR/bounty-<session_id>.json`. **The protocol's one permitted `cli.ts` call stays
   unspent** — session 13 proved this works.
2. **Start ONE `bounty tail` and leave it running.** This is the subject. **Without it there is no
   experiment.**
3. **Confirm `subscribers: 1`** — once, at t=0, before the window opens.
4. **Then nothing touches the board. No verb, no agent, no seat.**

### The sampler must not be an agent

**The sampler is a shell loop, not an agent action** — `ps`/`stat`/log-read touch nothing, but an
agent that "checks in" will reach for a `cli.ts` verb and reset the idle timer. **The instrument that
prevents that is making the sampler incapable of it.**

```
while true; do
  printf '%s pid=%s subs=%s\n' "$(date -u +%FT%TZ)" \
    "$(ps -p $PID >/dev/null 2>&1 && echo alive || echo GONE)" \
    "$(tail -1 "$DAEMON_LOG" | …)"
  [ ... ] || break
  sleep 300
done
```

**Run it past the observed threshold with margin.** Session 13's log shows two real deaths at
**`idleMs ≈ 7200000` (2h)** — so the window is **3h+**, not 30 minutes.

### The three outcomes, pre-committed

| outcome                                                | reading                                                                                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **tail alive, `subscribers: 1`, daemon alive past 3h** | **`#64` is FIXED.** The heartbeat beat the request timeout.                                                                        |
| **daemon dies, `reason:"timeout"`, `subscribers: 0`**  | **`#64` is NOT fixed** — and this is the **more valuable** outcome, which is why they left the issue open.                         |
| **daemon alive but `subscribers` fell to 0**           | 🔴 **The tail died and the daemon did not.** Neither pre-registered reading covers it. **Report it; do not force it into either.** |

## What session 13 already contributed, so the dedicated run does not re-derive it

- **The pid can be had for free** — `lsof` on the port from the discovery file. No `cli.ts` call.
- **Two real idle-deaths on this board are already in the log**, with `reason:"timeout"`,
  `subscribers: 0`, `idleMs ≈ 7200000` — **2026-08-05 pid 15132 and 2026-08-07 pid 93692.** The second
  is what emptied our board between sessions 12 and 13.
- **⚠ Whether those two pids were running `2.1.0` or an earlier build is UNKNOWN to us and decides
  their value.** If pre-`2.1.0`, they are the "before" arm `#64` has never had. **Ask `spellwright`;
  do not infer it.**
- **An observed threshold of ~2h against a stated `idleTimeout: 255`** — we do not know the unit or
  which timer the log stamps. **Reported, not interpreted.**
- **`SIGKILL` is the only termination that does not write the snapshot** — `close`, `--fresh` and
  **SIGTERM** all run the teardown, and the teardown writes. **Any teardown in this test must use
  `-9`** or it destroys its own board.

## Why this must not ride along with development work

**Every board verb resets the idle timer, so the experiment and the work are mutually exclusive by
construction.** A session that does both produces NOT TESTED — **which is precisely what session 13
produced, and it was the honest outcome rather than a failure of that session.**

**The team is the wrong shape for it too.** Six seats exist to keep a board busy. **This needs one
agent, one tail, and three hours of nothing** — closer to a cron job than a convene, and worth saying
out loud so nobody spins up a team out of habit.

# A DEDICATED test session for `spellbook#64` — because session 13 could not have tested it

**Added:** 2026-08-08, at Cole's direction after session 13 returned **NOT TESTED**
**Status:** ✅ **ANSWERED 2026-08-09T02:32Z — the board SURVIVED.** Ran 00:32Z–, board
`k-anthill-64-probe-adad92ec`, daemon **pid 9772**, port 51922, one live tail, zero-touch, default
7200 s timeout. It crossed 7200 s at `t+7202s` and kept serving; the tail's keepalive stream grew
`+304 bytes / 240 s` with **no gap** — the connection was never severed and `subscriberCount` never
reached 0. Control arm: our pid 74370, same build, **no subscriber**, dead at 7200 s to within
0.1 s. **Mechanism:** the 15 s SSE keepalive vs Bun's 10 s default request `idleTimeout` meant every
keepalive pre-2.1.0 arrived 5 s too late — deterministic, not flaky; 2.1.0's `idleTimeout: 255`
gives ~17× headroom. Full write-up in `docs/reports/2026-08-08-spellbook-64-measurement-session-13.md`;
posted upstream as `#64` comment `5229438564`. Raw samples in `~/.bounty/probe64/samples.log`.

**So the dedicated multi-seat session this doc designs is NOT needed for the survival question —
one board, one tail and four hours of doing nothing answered it.** What the design got right is
_why_ session 13 couldn't: a busy board never idles. What it over-built is the team. **Keep this doc
for the orchestration lessons; do not schedule the session on `#64`'s account.** **Cole: _"we might just want to do
some sort of dedicated test, separate from development work… spin up a team, do a test where we're
figuring out how to orchestrate this."_** Scheduling was left to the team.

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

## Why this must not ride along with development work — **AMENDED, the claim was too wide**

**As originally written:** _"Every board verb resets the idle timer, so the experiment and the work
are mutually exclusive by construction."_

**That is true of ONE BOARD and was written as though true of the machine.** A board key derives its
own daemon with its own pid, port and idle timer — the daemon log shows **eight** of them running
concurrently across projects. **So the experiment rides on a scratch board key and anthill
development proceeds on `anthill-dev`, and neither can touch the other's timer.** The run launched
2026-08-09 does exactly that.

**What survives the correction, and it is the half that mattered:** the experiment must not share a
board **with the work**, and **the team is still the wrong shape for it.** Six seats exist to keep a
board busy. This needs **one agent, one tail, and three hours of nothing** — closer to a cron job
than a convene, and worth saying out loud so nobody spins up a team out of habit.

> **⚠ Scar, paid at launch — the tail silently attached to NOTHING.** The first launch put the runner
> in a scratch directory. **The board id is PROJECT-SCOPED by cwd**, so `--session-key` resolved a
> _different_ id from there: `info` reported **"no running bounty session"** and the tail sat retrying
> `# no session yet` while the daemon was demonstrably alive on its port. **The experiment would have
> run its full window with no subscriber and reported a clean survival** — a fourth manufactured
> instrument, and the most convincing one yet, because every process involved was running.
>
> **Two fixes, both applied:** pin the runner's cwd to the repo, **and** target the board by its full
> id rather than by key. **And the check that catches it: `lsof -nP -iTCP:<port> | grep ESTABLISHED`
> at t=0 — a connected tail shows 2, an unattached one shows 0.** _`convene` documents this
> cwd-scoping hazard for git worktrees; it is not a worktree property, it is a **cwd** property, and
> it reached us through a directory nobody thought of as a worktree at all._

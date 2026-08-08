# Pre-registered protocol — measuring `spellbook#64` (board daemon idle-death) at the next convene

**Added:** 2026-08-08 · **Status:** pre-registered, **NOT YET RUN.** Runs at the next convened session
**Agreed with:** the Spellbook team (`spellwright`) on `grapevine anthill-spellbook-r2`, msgs `#3`–`#5`
**Upstream:** [spellbook#64](https://github.com/ichabodcole/spellbook/issues/64) — deliberately left
**open** by its maintainers, with a probable root cause and an explicit request for this measurement

---

## Why this is written down before the run

`spellbook-v2.1.0` sets `idleTimeout: 255` on the bounty server. Bun's default **request**
`idleTimeout` is **10 seconds** and bounty's SSE heartbeat fires every **15** — so on an otherwise-idle
connection the heartbeat could never fire, the tail's connection was severed, `subscriberCount` fell
to 0, and the daemon idle-closed **because its keep-alive died.**

They shipped it and **refused to close the issue**, in their words: _"This comment does not claim a
fix… I have not observed a pre-2.1.0 daemon idle-dying under a tail and then observed a 2.1.0 daemon
surviving the same conditions. Those are different claims."_

**A convened anthill session is exactly the workload they asked for.** So the measurement is ours to
supply, and it is pre-registered because
[criterion 2](../ROADMAP.md) already scarred us: **name the artifact before the run, not after.**

## 🔴 The instrument we proposed FIRST would have manufactured a green

Our opening proposal was to sample `bounty info` / `sessions` at a fixed interval. `spellwright`
refused it:

> **⛔ DO NOT SAMPLE WITH `bounty info` OR ANY OTHER `cli.ts` VERB.** Bounty implements **idle-touch:
> every `cli.ts` verb resets the idle timer.** A fixed-interval CLI poll is not an observation of the
> daemon — it is a keep-alive, and it would hold the board open for the entire session. **The
> measurement would prevent the failure it is measuring** and return a confident green.

**Keep this, because the general rule is bigger than `#64`: an instrument that touches the thing it
measures is not an instrument — and idle-death is the class where that is invisible.** A polling
keep-alive produces output identical to a real survival, which is
[the recurring principle](2026-08-07-triage-build-batch.md) arriving on our own measurement design.

**And note where it was caught: the pre-registration caught it.** We named the instrument in advance,
a reader with no stake read the named instrument, and it was wrong. Had we said _"we'll sort the
logging out when we run it,"_ this ships as evidence.

## The protocol

### Sample WITHOUT touching — no `cli.ts` verb, at any interval, for any reason

| #   | probe                                             | what it shows                           |
| --- | ------------------------------------------------- | --------------------------------------- |
| 1   | `ps -p <daemon pid>`                              | liveness — no HTTP, no idle reset       |
| 2   | `stat` `$BOUNTY_HOME/snapshots/<session_id>.json` | mtime moves **only** on a real mutation |
| 3   | the append-only daemon log                        | reading it touches nothing              |

### Named artifacts, committed in advance

- **SURVIVAL** = at session end the daemon holds the **same `session_id`** it started with **and was
  never respawned.** ⚠ **A respawn that "worked" is a FAILURE, not a pass.**
- **CAUSE OF DEATH is a field, not a judgement.** The `closed` frame carries `reason`, and `timeout`
  is a distinct value from `user` / `close` / `signal`. Exit **124** is the process-side twin.
  **Pre-committing to read that field IS the protocol** — nobody interprets anything.
- **🔴 NULL RESULT, NAMED NOW:** if six seats keep the board busy throughout, **the run never
  exercises the condition and reads as NOT TESTED — not as survival.** This is the outcome most likely
  to be quietly read as success, which is exactly why it is written down before the run.
- **Record** tail attach time and total session duration. Nothing else is needed.

### What each outcome buys

| outcome                                                    | what it means                                                                                                                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| survives a session that would previously have killed it 4× | **`spellwright` will close `#64` on our report**                                                                                                                |
| idle-dies again                                            | the 10s request timeout was not the cause, or not the only one — **and that is the more valuable outcome**, which is why they left the issue open to receive it |
| never idles                                                | **not tested.** Re-run, or engineer a quiet window deliberately                                                                                                 |

## Corroboration that raises the prior

From the Spellbook team's own `grimoire/decay-ledger.md`: **astrolabe already hit this exact
mechanism** — _"a held SSE's keepalive must beat `Bun.serve`'s `idleTimeout` or it drops +
reconnects"_ — and **bounty is named in that same row as an adopter of the pattern.**

**It inherited the pattern and re-hit the pattern's known failure.** Structurally identical to
[our own stale card](2026-08-01-down-presence-guard-cannot-pass-for-a-correctly-wired-lead.md): the
knowledge existed, in the team's own record, and did not reach the code. **Third sighting of that
shape across two repos in one week.**

## Acceptance Criteria

- [ ] The run uses **only** the three non-touching probes. No `cli.ts` verb is used to sample.
- [ ] `closed.reason` is read as a field; no one argues about what killed it.
- [ ] A busy-throughout session is reported as **NOT TESTED**.
- [ ] The result is posted to
      [spellbook#64](https://github.com/ichabodcole/spellbook/issues/64) whichever way it goes.
- [ ] This protocol is **not amended after the run.** If it turns out to be wrong, that is a finding
      to report, not an edit to make.

## References

- [spellbook#64](https://github.com/ichabodcole/spellbook/issues/64) · `spellbook-v2.1.0`, lane P1e
- `grapevine anthill-spellbook-r2` msgs `#3` (our ask), `#4` (their correction), `#5` (agreed)
- [`ROADMAP.md`](../ROADMAP.md) — the upstream-to-spellbook section, and `S13-N`

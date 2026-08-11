# The board tail filter matches no task event, and the only way to notice is a probe that cannot work

**Status:** Backlog — **BUG, reproduced live on a throwaway board. Ready to fix; fix all four parts together.**
**Found:** upstream, [anthill#88](https://github.com/ichabodcole/anthill/issues/88) + [anthill#89](https://github.com/ichabodcole/anthill/issues/89) — the `cassandra`/`thoth` seats, Spellbook team, 2026-08-06, against 2.0.0
**Verified:** 2026-08-06 against `develop` @ `932596e`, by standing up two throwaway bounty boards and capturing real frames. The repo's live board was not touched; both scratch boards were closed.

---

## The bug

`plugin/scripts/anthill/commands/team-join.ts:292` hands every seat this board lane:

```
bun <bounty-cli> tail --mine --as <handle> | grep -E --line-buffered '"type":"(task|unblocked|closed)"'
```

**Real bounty event types are dotted.** From spellbook's own source
(`skills/bounty/scripts/server.ts:30-41`): `ready`, `connected`, `disconnected`, `task.toggle`,
`task.move`, `task.edit`, `task.add`, `task.update`, `task.remove`, `unblocked`, `heartbeat`,
`closed`. **There is no bare `task` type.** The shipped pattern requires a closing quote immediately
after `task`, so no `task.*` frame can ever match.

Measured against a captured 9-frame lifecycle from a live board:

| pattern                                               | matches                                    |
| ----------------------------------------------------- | ------------------------------------------ |
| shipped `"type":"(task\|unblocked\|closed)"`          | **2 of 9** — `unblocked` and `closed` only |
| proposed `"type":"(task\.[a-z]+\|unblocked\|closed)"` | **8 of 9** — everything but `heartbeat`    |

**Zero of the six `task.*` frames survive.** Every card assignment, status change, and removal is
dropped. The impact the reporters describe — three seats each believing they were watching the board,
one seat's card moving to `review` invisible to the whole team — follows directly.

**One correction to the report:** it says the only event a seat ever receives is `closed`. `unblocked`
is also bare-typed and also passes, so a seat does get one real work signal — the moment its last
blocker clears. Rare, and it does not change the severity, but the claim as written is false.

## The guard exists and is fabricated

`plugin/scripts/anthill/commands/team-join.test.ts:356-366` — _"the alternation it ships actually
matches a real board frame"_ — extracts the shipped pattern and asserts it against:

```
{"type":"task","id":7}
```

**An event type bounty has never emitted.** The test invented its sample instead of capturing one, so
it passes on a filter that matches nothing, under a name that claims the opposite. This is the same
shape as the `not.toContain("grapevine")` vacuous-green already recorded in
[`comms-as-default/plan.md`](../projects/_archive/comms-as-default/plan.md): a green that can never fail,
inside the assertion built to catch false greens.

**Fixing the regex without fixing this test re-arms the trap for the next change.**

## The tail cannot report its own death

Confirmed by tailing a session that never existed for 6s:

```
=== STDOUT ===   (empty)
=== STDERR ===
# scoped to --mine (owner=ghost + claimable)
# no session yet, retrying…   ×5
```

Source: `cli.ts:530`, `:519-521`, `:574` — all `process.stderr.write`. Piping through the shipped
grep with stderr discarded produced **0 bytes over 5 seconds.** A seat who re-arms against a dead
daemon gets a Monitor that reports "started", a process that stays alive, and total silence —
indistinguishable from a quiet board.

**Keep bare `closed` in the alternation.** `cli.ts:595` exits the tail on it, and it is always
emitted `by:"system"`, so self-echo suppression can never hide it. A fix that tidies toward the
stated problem — `'"type":"task\.[a-z]+"'` — fixes the reported bug and silently removes the only
signal the wire has died.

## …and the obvious way to check is the one check that cannot work (#89)

`bounty` suppresses events authored by the observing `--as` identity. `cli.ts:593-594`:

```ts
const selfEcho = self !== undefined && ev.by === self;
if (inScope(ev) && !selfEcho) process.stdout.write(`${payload}\n`);
```

Documented in `bounty --help` — _"stamped on events (for scoped tail + self-echo suppression)"_ — so
this is correct bounty behaviour, not a bounty bug.

**Reproduced verbatim.** One tail `--as cassandra`, one card, three writes:

```
update <card> --tag probe-daedalus  --as daedalus  → ok:true   → DELIVERED (id 3)
update <card> --tag probe-cassandra --as cassandra → ok:true   → NOTHING
update <card> --status doing        --as daedalus  → ok:true   → DELIVERED (id 5)
```

The tail's cursor jumps **3 → 5**. Event 4 is cassandra's own write; read-back confirms the tag
landed. So a seat that touches its own card to confirm the wire is live sees nothing and concludes
the wire is dead — while it is working exactly as designed.

**anthill is silent on this.** `plugin/skills/join/SKILL.md:321-326` covers only how to _arm_ the
tail. The skill does have a delivery-confirmation beat at `:328` — _"Confirmed received, not just
sent"_ — but it is comms-only and outbound, and never extended to the board.
`/usr/bin/grep -rni 'self-echo|self echo|own event|your own write'` across `plugin/`, `docs/` and
`.anthill/` returns **zero hits**.

**The two bugs compound, in the worst direction.** With #88 present, the wire genuinely _is_ dead for
`task.*`. So a seat who self-probes gets a true-looking negative from an invalid test — the wrong
diagnostic and the real bug agree, and neither is isolable from the other.

## What would close it — four parts, one edit

1. **The pattern**, verified above:
   `'"type":"(task\.[a-z]+|unblocked|closed)"'` — also covers the human-UI `task.toggle`/`move`/`edit`.
2. **Merge stderr and match the death notice**, so a dead wire produces output instead of silence:
   `... tail --as <handle> 2>&1 | grep -E --line-buffered '"type":"(task\.[a-z]+|unblocked|closed)"|no session yet|error'`
3. **One sentence in the manifest beside the tail** — verify your tail with a **peer's** write, never
   your own. Ask another seat to touch any card, or write `--as <other handle>` to a throwaway.
4. **Re-point the test at a captured frame.** `team-join.test.ts:356-366` must assert against real
   event shapes; if it still passes against `{"type":"task"}`, it is still fabricated.

**Ship all four.** Parts 1 and 2 restore the signal; part 3 is what stops the next seat concluding
the fix didn't work; part 4 is what stops the regression returning invisibly.

## References

- `plugin/scripts/anthill/commands/team-join.ts:292` — the only site; `plugin/templates/` has no tail command
- `plugin/scripts/anthill/commands/team-join.test.ts:356-366` — the fabricated guard
- `plugin/skills/join/SKILL.md:321-326`, `:328`
- spellbook `skills/bounty/scripts/server.ts:30-41` (event vocabulary) · `cli.ts:519-521`, `:530`, `:574`, `:593-595`
- Upstream: [anthill#88](https://github.com/ichabodcole/anthill/issues/88) (with two filer amendments) · [anthill#89](https://github.com/ichabodcole/anthill/issues/89)

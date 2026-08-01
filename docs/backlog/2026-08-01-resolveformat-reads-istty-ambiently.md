# `resolveFormat` reads `isTTY` ambiently, so half the format matrix cannot be tested

**Added:** 2026-08-01 · **Status:** ready to build (small change, the test matrix is the payoff)
· **Seat:** forager (CLI / agent layer) · **Found:** while fixing the parser-envelope bug

`resolveFormat` takes the **flag** as a parameter and reaches for the **TTY** ambiently:

```ts
resolveFormat(flag); // → flag==="json"||flag==="text" ? flag : process.stdout.isTTY ? "text" : "json"
```

`Bun.spawnSync` always gives a pipe, so **the TTY branch cannot be exercised from `bun test` at all.**
The human-facing half of the parser-envelope fix was verified by hand with `script -q /dev/null` and
is **not in the suite and cannot be**.

## Why it matters more than a coverage gap

**Four of the eight cells in that fix's own matrix have no automated guard**, and the unguarded four
are the _human_ ones. A future refactor can break _"a human at a terminal still gets a usage block"_
and **every test stays green**. That is the same shape as the bug the fix was for: a failure that
looks exactly like success.

Deliberately **not** stubbed. The verifier's rule at the time: _don't stub `isTTY` — that proves the
stub._ Injecting the value is different from faking the global, which is the point of the fix below.

## The change

Thread it: `resolveFormat(flag, isTTY)`. Callers pass `process.stdout.isTTY`; tests pass either.
The whole matrix becomes unit-testable and the ambient read disappears from the decision.

- Small blast radius in principle — one function, its callers.
- **Verify the caller count before sizing it.** It is the shared entry point for every command's
  output decision, so "one function" may understate it.

## Test matrix this unlocks

`{--format json, --format text, no flag} × {isTTY true, false}` × `{parser error, in-run error,
success}` — asserted directly rather than through a spawned process that can only ever be a pipe.

## Provenance

forager's nomination as **the highest-value follow-up found in session 4**, and it was on no card.
The root cause predates the parser-envelope work; the fix merely made it visible, because it was the
first change that needed the TTY branch to be correct.

**Related:** the parser-envelope item this came out of
(`2026-07-31-parser-errors-bypass-the-agent-envelope.md`, shipped) and session 4's friction log §B2.

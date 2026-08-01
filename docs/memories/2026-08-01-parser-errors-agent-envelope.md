# Parser errors now reach the agent envelope

**Date:** 2026-08-01 · **Branch:** `fix/parser-errors-agent-envelope` → `develop`

`anthill <cmd> --format json` promised an agent a parseable envelope on every outcome. It held for
errors raised inside a command and broke for errors raised by the **parser** — the class an agent
hits most, since a wrong flag is the commonest way an agent gets a command wrong.

**Three classes fixed** (unknown flag, missing positional, unknown command), plus non-`CLIError`
stacks moved onto `meta`. **`cli.test.ts` is new — 23 tests on an entry point that had zero.**
Gate 232 → 255.

**The load-bearing detail:** sniff the `--format` _value_ and run it through `resolveFormat` itself.
Matching the literal `"json"` under-fixes, because the row that matters is **no `--format` flag at
all, piped** — `resolveFormat` already defaults that to json, and anthill's own emitted commands
pass no format flag.

**The invariant to hold this surface to:** _the format decision must not depend on where the error
was raised._

**Gotcha worth remembering:** the fix was portable to `develop`; **its tests were not** — they
exercised `comms`, which `develop` lacks. "Cherry-picks clean" is not "works".

# Session — parser errors reach the agent envelope

**Date:** 2026-08-01 · **Branch:** `fix/parser-errors-agent-envelope` → `develop`
**Shape:** solo lane, directed subagent + independent review (no team convened — one lane, no seam)

## What shipped

Parser-raised `CLIError`s now honour the format verdict instead of rendering a usage block
unconditionally. Three classes, all reaching one catch site in `cli.ts`:

| class                       | example         | before                      |
| --------------------------- | --------------- | --------------------------- |
| unknown flag                | `status --nope` | usage block                 |
| missing required positional | `join`          | usage block                 |
| unknown command             | `bogusverb`     | ~26 lines of **root** usage |

Non-`CLIError` throws previously printed a raw stack; they now emit an envelope with the stack on
`meta` — following the rule that **top-level envelope fields are TOTAL and `meta` is the variable
bag**, so a field present on one path only cannot make its own absence unreadable.

`cli.test.ts` is new: **23 tests on an entry point that had zero**, which is why the defect lived
there in the first place.

**Gate: 232 → 255 pass, 0 fail.**

## The part that mattered — the spec, not the code

The fix is small. The expensive part was established the day before, by measurement rather than
reading, and handed to the implementer as settled:

> Sniff the `--format` **value** from `rawArgs` and pass it through `resolveFormat` **itself**.
> Do not match the literal string `"json"`. Do not re-implement the TTY heuristic.

Why: an 8-cell matrix showed parser errors did not participate in format resolution **at all** — not
merely under `--format json`. A literal-match fix repairs the explicit-flag row and leaves
**no-flag-piped** broken, which is the row that matters most, because `resolveFormat` already
defaults piped→json and **anthill's own emitted incantations pass no `--format`**. The defect's own
name selected a probe that could not see its scope.

## Review: right about the finding, and I upgraded its severity

An independent reviewer (a different agent from the implementer) returned **Ready to merge: Yes**
with one finding it scored below its own threshold and called non-blocking:

`sniffFormatFlag` returned the **first** `--format`; `util.parseArgs` resolves a repeated option to
its **last**. Reproduced by execution:

```
status --nope --format text --format json   →  usage block    (sniff: text)
status       --format text --format json    →  json envelope  (parse: json)
```

**Same argv, two verdicts, decided by which code path saw it — which is the invariant this branch
exists to establish, violated.** Fixed rather than filed: one line, and the property _is_ the change.
Three regression tests, each proven red against the first-match version, including one guarding the
obvious wrong fix (always preferring `"json"` would pass the first test while ignoring what the user
asked for last).

**The reviewer had no shell** and said so, doing a static trace and recommending live verification.
Every edge case it traced was re-run here — `--format=json`, the `--` terminator, `--format` as the
final token, a positional equal to `"json"`, text mode, the in-run control. All correct. Its
last-wins claim was confirmed by running the real parser rather than taken from its docs citation.

**This is the second instance this week of "outside reviewers are right about the finding"** — the
principle now in `.anthill/principles.md`, carrying scars from two teams.

## Scoped out, deliberately

- **TTY rows are untested.** `resolveFormat` reads `process.stdout.isTTY` ambiently and `Bun.spawn`
  always gives a pipe, so half the matrix cannot be tested without threading the value. Filed:
  `docs/backlog/2026-08-01-resolveformat-reads-istty-ambiently.md`.
- **`anthill info --format json`** reads the value as a subcommand name (`info` is a group that does
  not declare `--format`). This change makes it _report_ correctly; the invocation still fails.
  Separate defect, repro on two branches.
- **Nothing comms-related.** `lock.ts` and the `refused`-arg machinery live only on the comms
  branch; porting them was explicitly out of scope.

## Why the tests could not simply be cherry-picked

The fix originated on `feat/team-comms-slice-one`. It applied textually to `develop` and **four
tests failed**, because they exercised `comms read --nope` and `comms` does not exist there — so they
hit "Unknown command" instead of "Unknown option". **The fix was portable; its tests were not.**
That is why this was rewritten against commands `develop` actually has rather than transplanted.

# A parser error ignores `--format json` and prints usage text

**Added:** 2026-07-31 · **Status:** ready to build (the fix is small; the test matrix is the work)
· **Seat:** forager (CLI / agent layer) · **Found:** while grounding the `comms` skill on this branch

`anthill <anything> --format json` promises an agent a parseable `{ok,…}` envelope on every outcome.
**It holds for errors raised inside a command and breaks for errors raised by the parser** — the
class an agent hits most, because a wrong flag is the most common way an agent gets a command wrong.

## The seam, exactly

| where the error is raised        | with `--format json`                     |
| -------------------------------- | ---------------------------------------- |
| **inside `run()`** (`emitError`) | `{"ok":false,"error":"…","meta":{…}}` ✅ |
| **in the parser**, before `run`  | full **usage text** + message, exit 1 ❌ |

Verified both sides:

```sh
# inside run() — correct
anthill comms read --as forager --format json
  → {"ok":false,"error":"`--as` is not accepted here: reads are not attributed to a seat …"}

# parser — wrong
anthill comms read --nope --format json
  → Print channel history and EXIT (finite — use for catch-up) (comms read)
    USAGE comms read [OPTIONS]
    OPTIONS
          --channel=<name>    Channel (default: config.channel)
    …
    Unknown option '--nope'. Valid flags: --channel, --format, --id, --since
```

**Not comms-specific — it is every command.** Probed `comms read`, `status`, `scan`, `feedback`, and
`commit`: all five emit usage text rather than an envelope, each correctly resolving to its own
subcommand's usage block.

> **Probe note, because it nearly put a fabricated defect in this file.** The first sweep appeared to
> show every command printing the **root** usage instead of the subcommand's. That was **zsh**: an
> unquoted `$c` does not word-split the way it does in bash, so `bun "$CLI" $c --format json` passed
> `"comms read --nope"` as a **single argv element**. The CLI could not resolve a subcommand from it
> and correctly fell back to root usage. Re-probed with `"$@"`, and the real behaviour is the one
> above. **This is the second time this session a zsh quoting assumption produced a confident wrong
> reading of a command's output** — the earlier one made a "0 failures" revert-check meaningless.

## Cause

`cli.ts` (the `CLIError` catch in `runCli`) renders usage unconditionally:

```ts
if (err instanceof CLIError) {
  const [cmd, parent] = resolveSubCommand(main, rawArgs);
  process.stderr.write(`${renderCommandUsage(cmd, parent)}\n`);
  process.stderr.write(`${err.message}\n`);
}
```

Nothing there consults the requested format. It cannot use `ctx.args.format` — parsing is what
failed — so the fix has to sniff the format from `rawArgs` before deciding how to render.

## Why it matters more than it looks

The message content is now **good**: `strict: true` plus the `refused` mechanism mean an agent gets
_"Unknown option '--nope'. Valid flags: …"_ — genuinely enough to self-correct. **That correct
message is buried in a wall of prose an agent asked not to receive**, and the JSON parse it will
attempt fails outright. So the agent-layer work that made the message good is thrown away at the
last step, for the exact audience it was written for.

This is the same family as **the-cli-failure-surface-lies** (shipped 1.7.0), which fixed the
_content_ of failure output. This is the _channel_: right words, wrong envelope. Worth noting the
pattern held — that item's fix was verified where the message was written rather than across every
path that emits one.

## What the fix has to decide

1. **Sniff the format from `rawArgs`.** A scan for `--format json` / `--format=json` before the
   catch renders. Cheap, but it is a second, dumber parse of the args — say so in a comment, since
   the obvious later "cleanup" is to unify it with the real parser, which cannot work here.
2. **Does a human still get usage?** Yes — `--format text` (the TTY default) must be unchanged. The
   usage block is genuinely the right response for a person.
3. **What goes in the envelope?** `err.message` alone is probably right; the valid-flag list is
   already in it. Do **not** stuff rendered usage into a JSON string field.
4. **Non-`CLIError` throws** hit the `else` branch and print a raw stack — same audience problem,
   arguably worse. Decide whether that is in scope or a follow-up.

## Test matrix (the actual work)

Per branch of the table above, and both formats:

- parser error + `--format json` → single-line envelope on **stderr**, exit 1, nothing on stdout
- parser error + `--format text` → usage + message, unchanged from today
- in-`run` error, both formats → unchanged
- a subcommand error resolves to the **subcommand's** usage in text mode — verified as today's
  behaviour, with and without a `.anthill/config.json` in scope; pin it so the fix can't regress it

## Deliberately not fixed on `feat/team-comms-slice-one`

Found there, but it is global CLI behaviour and that branch is a scoped spike. Fixing it there would
widen the branch and bury a change every command depends on inside a comms feature.

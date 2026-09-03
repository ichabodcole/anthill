# The `anthill` CLI contract — what the interface owes a program

**Audience:** an agent (or a script) driving `anthill`, and whoever changes `cli.ts`, `define.ts`,
`manifest.ts` or `agent-layer.ts`. This is the hand-written half of the interface: the facts a
generator cannot walk — exit codes, envelope field names, machine-mode scope, output kind — and the
recommendations we decline, with reasons. The walkable half is `anthill help --json`.

**Everything here is held in place by a test or a check**, named beside each section. A paragraph
that advises is weaker than a check that fails; where only the paragraph exists, it says so.

---

## Discovery

| invocation                   | answers                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `anthill` (bare) / `help`    | grouped help at a terminal; the manifest, enveloped, when piped            |
| `anthill help --json`        | shorthand for `help --format json` — the manifest, enveloped               |
| `anthill help --declaration` | the interface as an acc v0 declaration, `provenance: emitted`, bare        |
| `anthill <cmd> --help`       | usage for that command; piped, its manifest entry, enveloped               |
| `anthill --help` / `-h`      | piped, the whole manifest — the same document `help` emits                 |
| `anthill --version` / `-v`   | `{version, source}` — `source` is the file answering, so two builds differ |

**The manifest is generated from the same structures the parser reads** (`manifest.ts` walks
`define.ts`'s command tree at answer time). It carries, per flag: `status` (`valid` | `refused`,
with `refusedReason`), `type`, `values` (a closed set the parser **enforces**) held apart from
`valueHint` (a label with no semantics); positionals in their own `positionals` container; and the
root's own flags at `path: []`. Every path _including the root_ is diffed against the parser's own
rejection on every commit — `manifest.census.test.ts`. The outside round trip through the acc kit is
`bun run acc:census`.

**Declared but not walked**: none of the above tells a caller what a command _does_ or whether it
is safe to run. `help --json` has no `effects` field and will not get one — see `STANDARD.md`'s
argument; a subject's account of its own safety is evidence to test, never a licence.

## Machine mode

**Selection**, in precedence order: an explicit `--format json` / `--format text` always wins; then
inference — stdout is not a TTY ⇒ JSON. `--format` is accepted before or after the verb at every
level. There is no environment-variable override (declined below).

**Scope: it is a mode, not a flag on one command.** Once selected it governs success output, failure
output, help and version alike. Nothing is written to stdout in JSON mode except one document
(`cli.test.ts`, "the format decision does not depend on where the error was raised"). No ANSI reaches
a pipe (`styles.ts`, decided once at load from `NO_COLOR` and `isTTY`).

**Text mode is for a person and is not versioned.** Parse nothing from it.

## Envelopes

**Two top-level shapes, discriminated on `ok`. There is no third status.**

```
{ "ok": true,  "data": <T>, "meta": { "command": "comms read", "durationMs"?: n } }
{ "ok": false, "error": "<prose>", "kind": "usage", "exitCode": 2, "retryable": false,
  "choices": ["--channel", "--format"] | null, "meta": { "command": "status", "stack"?: "…" } }
```

**Stream discipline:** data on stdout, diagnostics on stderr, in both modes. A failure writes its
envelope to **stderr** and leaves stdout **empty**, so a consumer reading stdout receives nothing
rather than a plausible empty answer. Non-fatal notices ride inside `data.warnings`, never on stderr.

**Top-level fields are TOTAL** — present on every envelope of their shape. A sometimes-present fact
goes under `meta` (`durationMs`, `stack`), because an absent top-level field would carry meaning
with nothing to read it by.

**Error fields:**

| field       | is                                                                                                                                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`     | presentation. Prose, free to improve, never a contract. Do not match on it.                                                                                                                                                                                                  |
| `kind`      | **the contract.** `usage` \| `failed` \| `internal` — see _Exit codes_. Append-only; a value is never repurposed.                                                                                                                                                            |
| `exitCode`  | the code the process exits with — the same fact, carried in-band because a pipe (`\| head`) masks `$?`.                                                                                                                                                                      |
| `retryable` | whether the same invocation, retried unchanged, could succeed. Always `false` today; total so absence never answers.                                                                                                                                                         |
| `choices`   | the valid alternatives where the failure was an invalid value: the flags this command accepts, the verbs this node holds, the values a flag binds to. **`null` means no set was offered; `[]` would mean a set that exists and is empty** — two statements, never collapsed. |

`ok: false` is load-bearing beyond its shape: through `| head` the exit code is lost and the
envelope is the only failure signal that survives (`agent-layer.ts`, the long note on `emitError`).

There is no `next` field. A success that wants a follow-up carries it as an invocation string in
`data` (the `join` manifest's tail commands, `attach`'s `attachCommand`) — a shape older than the
standard's `{exec, args}` form, and a **debt**, not a decline: the argv-array form is the right one
and this should move to it.

## Exit codes

**Held by `agent-layer.test.ts` (`EXIT_CODE`) and `cli.test.ts`. Append-only: add a code, never
renumber one — every consumer branching on `$?` breaks silently otherwise.**

```
0   success
1   failed    — anthill ran and could not do it: no config, a seat not in the roster, a session
                not up. kind "failed". The fix is in the world, not the argv.
1   internal  — anthill threw. kind "internal", stack on meta. A bug; file it.
2   usage     — the invocation was wrong: unknown flag or verb, out-of-set value, refused flag,
                missing or surplus positional. kind "usage". Retrying unchanged fails identically.
```

`failed` and `internal` share `1` and are told apart by `kind`; `usage` is the one a shell can tell
apart without parsing anything. Codes `3`–`8` follow the acc house taxonomy (auth, permission, not
found, conflict, rate-limited, confirmation required) and are **unallocated** here — anthill has none
of those failure classes today. When one is added it takes the taxonomy's number, not the next free
one. Nothing above `8` is ours: `124`–`127` and `>128` belong to `timeout`, POSIX and the shell.

**Outcomes are not errors.** No `anthill` command answers a question with a negative exit code the
way `acc check` does; `down`'s refusal to kill a present seat is a `failed`, not an outcome.

## Output kind, per command

**Held by `contract.test.ts`: every manifest path has an entry in `contract.ts` and no entry
outlives its command.** The table is there; the vocabulary:

- **`data`** — exactly one envelope, then exit. `cardinality: single` (one record), `bounded` (a
  small closed or caller-bounded set: `team ls`, `comms positions`), or **`unbounded`** — the only
  case that owes pagination, and the flags that bound it are named: `comms read` without `--last`,
  `--since` or `--id` is the whole channel log.
- **`stream`** — `comms follow`: one envelope **per line** as each message arrives, and the process
  never exits on its own. Read it line by line, under a timeout or a `head`; never as one document.
- **`none`** — a group node (`info`, `comms`, `team`). Invoking it is a usage error naming its
  subcommands.

No machine-mode value is truncated, humanised or elided; ids and timestamps are whole.

## Parsing

Strict everywhere (`define.ts`, `node:util parseArgs` with `strict: true`). An unknown flag, an
unknown verb, a surplus positional, an out-of-set value and a refused flag are each a `usage` error
that **names its valid set** — flags at a leaf, subcommands at a group node, verbs at any node with
them, the root's own interceptors at the root. A refused flag (`--team` on `info show`, `--as` on
`comms read`) is one the verb _recognises_ and declines, with the reason; it is excluded from every
advertised set. `--` ends options everywhere, including for `--help`. `--no-<flag>` negates a
boolean. A value beginning with `-` is a value. Nothing is fuzzy-matched or auto-corrected: a typo
is refused, never guessed.

## Interactivity

**Nothing prompts.** No command reads stdin unless `--stdin` is passed, and an empty `--stdin` is a
`failed` envelope, not a hang. Two commands touch a terminal by design and are TTY-gated:
`attach` execs `tmux attach` only with a TTY and outside tmux (piped, it returns the command to
run); `spawn --attach` likewise. `comms follow` is the one command that does not exit — see
_Output kind_. `--force` flags are overrides, never confirmations; there is no `confirmation_required`
kind because nothing asks.

## Declined recommendations, with reasons

The standard says declining is a decision and the thing to avoid is declining without noticing.
These are noticed. Each is quotable by anyone writing a waiver; `acc.config.json`'s `D2` reason is
the first.

1. **A bare `anthill` is help, not a usage error** (acc rule `D2`, waived). Piped, it is the
   enveloped manifest — the one-call discovery an agent bootstraps from. The rule's own page names
   this case as the defensible exception. Cost: `anthill $UNSET_VAR` looks like success; every
   emitted incantation anthill ships names a verb, so the exposure is a human's shell.
2. ~~**`help --json` stays a bare document.**~~ **Adopted 2026-09-03.** It was kept bare as "a
   shipped contract with consumers outside this repo"; Cole confirmed there are none, and it is now
   the enveloped manifest, byte-identical to `help --format json`. The only bare document left is
   `help --declaration`, whose reader (`acc`) refuses unknown keys by design.
3. **No environment-variable override for machine mode.** Every caller anthill has is a shell that
   can pass `--format`; an env var would be a third precedence rule with no caller to serve.
   Revisit when a harness that cannot alter argv appears.
4. **Two exit codes, not nine.** The taxonomy's numbers are reserved (above) and nothing here
   invents its own; codes are added when the failure class exists.
5. **No `--fields` projection.** No command's payload has been measured too large for a context
   window except `comms read` unbounded, which has pagination. A design argument, not a finding —
   the standard says the same of itself.

## How this is checked

| what                                                       | where                                   |
| ---------------------------------------------------------- | --------------------------------------- |
| manifest vs parser, every path incl. root, both directions | `manifest.census.test.ts` (commit gate) |
| output-kind table complete and current                     | `contract.test.ts` (commit gate)        |
| envelope shape, format verdict, exit codes                 | `cli.test.ts`, `agent-layer.test.ts`    |
| parser strictness, valid-set naming, `--`, dash values     | `define.test.ts`                        |
| L0 conformance + the emitted declaration, outside reader   | `bun run acc:census` (before a release) |
| the largest bare payload survives `process.exit` on a pipe | `cli.exit-drain.test.ts`                |

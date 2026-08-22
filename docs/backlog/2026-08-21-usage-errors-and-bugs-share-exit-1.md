# A usage error and a bug in anthill leave the process with the same exit code

**Added:** 2026-08-21, from a trial of
[agent-cli-conformance](https://github.com/ichabodcole/agent-cli-conformance) (`acc` 1.0.1)
against `plugin/scripts/anthill/cli.ts`. Rule **C2**, _"you invoked me wrong" is
distinguishable from "I broke"_.
**Filed rather than fixed on the spot:** the fix changes a **published exit contract** of a
released CLI (v2.3.0) with consumers outside this repo. That is a team call, not a trial-branch
call.

---

## What is true today

`runCli`'s catch block already knows which kind of failure it is holding. It branches on
`err instanceof CLIError` and emits two genuinely different things — a usage envelope for the
caller's mistake, an envelope carrying `stack` for ours. Then **both branches fall into the same
`process.exit(1)`** (`plugin/scripts/anthill/cli.ts`).

So the distinction is made, carried into the payload, and then **discarded at the one boundary
that every non-agent consumer reads**: the exit code. A shell, a CI step, a `Makefile`, a hook —
none of them parse the envelope. They get `1` for "you typo'd a flag" and `1` for "anthill threw".

## Why this is our problem specifically, not a borrowed rule

The comment sitting a few lines above that `exit(1)` already names this defect:

> _anthill#54's shape — a usage error and a broken tool are indistinguishable unless the output
> disambiguates them._

We fixed that for the **output** and left it standing in the **exit code**. An agent reading
stderr can tell the two apart; anything reading `$?` still cannot. That is the same defect in the
position nobody probed — the same shape as the parser gap this trial also turned up.

## What the change would be

Usage errors (`CLIError`) exit `2`; unexpected throws keep `1`. Both stay non-zero, so every
`if ! anthill …` and `set -e` caller is unaffected. What breaks is a caller testing `$? -eq 1`
specifically for a usage error, which is the case worth going and looking for before moving.

## What to decide

1. Is `2` the right code, or do we want the fuller taxonomy (`acc` publishes one) rather than
   just splitting the two we have?
2. Is this a breaking change for the CHANGELOG, or a fix? It changes an observable contract we
   never documented — which may itself be the answer.
3. Do the seat-facing docs and skills anywhere instruct on anthill's exit codes? If not, the
   contract has never been stated, and stating it is part of the work.

## Note on how it was found

`acc`'s own checker did **not** report this. It reported the narrower "a usage error exited 0",
and openly declares the gap: _"the exit code is only required to be non-zero here and not the
declared 2."_ The finding above came from reading the **rule page** the failure pointed at, not
from the verdict. Worth remembering about this class of tool: the prose was more valuable than
the check.

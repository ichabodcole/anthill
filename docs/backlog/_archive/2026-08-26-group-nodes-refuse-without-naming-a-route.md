# A group command refuses an unknown flag while offering no route forward

> **Archived 2026-09-03 — shipped on `chore/cli-conformance-run`, `e3f15d2` — a group node names its subcommands (`This command takes no flags; subcommands: …`) and carries them in `choices`. The empty-set trap held exactly as written: the acc reader files the answer as `did not enumerate` because the members are not flag-shaped, so `bun run acc:census` reads 24 of 27 while our own census reads all 26 + root.**

**Added:** 2026-08-26 · **Found:** while running the declared-versus-accepted census (25 inert
probes, one per command path) · **Project:**
[agent-failure-surface](../projects/agent-failure-surface/README.md)
**Extracted from** the census backlog item so it lives with the failure-path work rather than with
the manifest work — it is the same code path as
[`anthill info --format json` reads the value as a subcommand](2026-08-01-group-commands-read-a-flag-value-as-a-subcommand.md).

---

## The finding

Every **leaf** verb names its valid set when it refuses an unknown flag. Every **group** node —
`info`, `comms`, `team` — refuses by name and names nothing:

```
anthill comms read --acc-not-a-flag
-> {"ok":false,"error":"Unknown option '--acc-not-a-flag'. Valid flags: --channel, --format,
                        --id, --last, --since, --team","meta":{"command":"comms read"}}

anthill comms --acc-not-a-flag
-> {"ok":false,"error":"Unknown option '--acc-not-a-flag'","meta":{"command":"comms"}}
```

Measured: **22 of 25 recorded paths enumerate; the 3 that do not are exactly the three group nodes.**

## Why it happens, and why it is not simply correct

A group node's own arg table is empty, so there is no valid set to name. The parser is telling the
truth. **But an empty set and "this node takes no flags, it takes subcommands" are different
statements, and the caller receives the first.**

An agent that mistypes a flag on a group gets a refusal with no next step — on the one node type
where the useful answer (`read`, `send`, `follow`, `positions`, `stand-down`) is sitting right there
in the command table. The remedy is probably to name the **subcommands** where there are no flags.

## Why it belongs to `agent-failure-surface`

Same shape as that project's stated rule — what an agent receives when a command goes wrong, and the
output being _plausible_ so nothing errors and nobody notices. It is also the same node type as the
`anthill info --format json` item already filed there, so one fix likely touches both.

## The outside reading, which drew the distinction better than I did

`acc`'s census report separates the two cases explicitly, and the parenthetical is the part worth
keeping:

> did not enumerate at `comms`; 1 rejection read, none named a set **(NOT a tool with no flags)**

Raised upstream as a possible catalogue rule — probe a declared group path, require the rejection to
name either a flag set or a subcommand set. Theirs to mint or decline; no id claimed here.

## Upstream surveyed it, and the answer constrains our fix — 2026-08-26

They widened it past our three paths: one sentinel flag after a group node, five vendors. **Three of
six name a set** (`git remote`, `git stash`, `gh repo`), and it splits **three** ways rather than
two:

| shape                          | tools                                                 | satisfies the rule? |
| ------------------------------ | ----------------------------------------------------- | ------------------- |
| names the set                  | `git remote`, `git stash`, `gh repo`                  | yes                 |
| names a **pointer** to the set | `docker image`, `kubectl config` (_"Run '… --help'"_) | **no**              |
| names nothing                  | **`anthill comms`**                                   | no                  |

**Their recommendation is the strict form**: name the valid set; a pointer does not satisfy it.
Reason — _when a caller makes a mistake, return more information rather than less; a rejection is
the moment the tool knows most and the caller knows least._ The bloat objection is refused
empirically: `gh repo` prints **nineteen** subcommands in a rejection and nobody calls it broken,
while the two tools declining to print have twelve and sixteen.

Marked `design-choice` rather than `defect`, deliberately, so it reads as _Docker and Kubernetes
chose differently and it is legitimate_. **Ours is the third row, where no design is being
expressed** — only an omission.

## ⚠ The trap this sets for our fix

The principled fix and the one their reader can see are **not the same fix today**.

Our own house rule (and their Part 3) says a field must distinguish **absent, null and zero**. So
the instinct is to have a group node answer with an explicitly empty flag set — `"choices": []`,
present and empty, honestly saying "this node takes no flags."

**Their reader scores that as `not-enumerated`** — dropped from the comparison and rendered as
`none named a set (NOT a tool with no flags)`, which is exactly the string our _silent_ nodes
produce today. They have filed it against themselves (fixture vendored, fix pending a sweep), and
name it as their own Part 3 violated by the one field it exists to read.

Two consequences for us:

1. **Fixing this by emitting an empty set would look identical to not fixing it**, in their
   instrument, until their sweep lands. The fix that is visible today is naming the **subcommands**.
2. **Our in-house census must not inherit the bug.** When we build the extractor
   ([cli-declared-surface](../projects/cli-declared-surface/proposal.md)), "named an empty set" and
   "named nothing" must be two states, not one — or our own gate reproduces the defect on the one
   node type this item is about.

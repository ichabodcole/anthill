# A group command refuses an unknown flag while offering no route forward

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

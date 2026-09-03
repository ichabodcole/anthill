# The declared surface — make anthill's manifest describe the CLI it actually has

**Status:** Active — scope widened to the full standard on 2026-09-03; [plan.md](./plan.md) is the scope of record
**Created:** 2026-08-26
**Author:** Cole + Claude Code (unconvened session — no seat)
**Origin:** three sessions running
[agent-cli-conformance](https://github.com/ichabodcole/agent-cli-conformance) against this CLI —
two black-box trials and a cold read of its `STANDARD.md`, which uses anthill's manifest as its
worked drift example.

---

## Overview

`anthill help --json` is the **discovery surface**: the document an agent reads once per session to
learn what commands and flags exist, instead of scraping help text. Our own skills instruct seats to
do exactly that and to prefer the invocations it resolves over anything they derive.

**It describes a CLI we do not have.** Four measured disagreements between what the manifest
publishes and what the binary accepts — and they are one failure, not four: the manifest's type has
no slot, or the wrong slot, for part of the surface.

This project makes the manifest true, and adds the differential check that keeps it true.

**Distinct from [agent-failure-surface](../agent-failure-surface/README.md)**, deliberately. That
project owns what an agent receives when a command goes **wrong**. This one owns what an agent reads
**before** anything goes wrong, to construct the invocation in the first place. The two share files
(`cli.ts`, `define.ts`) and must be sequenced, but they are different surfaces and different rules.

## Problem Statement

The generator is **not stale**. It walks `define.ts` live on every invocation and there is no second
copy to fall behind — the failure mode the field knows about and guards against does not apply here.
It is **incomplete**, and incompleteness is invisible from inside the process:

> Checking against behaviour is what makes a dropped field visible. From inside the tool it is an
> absence, and **absences do not fail tests.**

There is no test we could have written against a field our type does not have. `bun run check` is
green and has always been green on all four.

**Measured 2026-08-26** — 25 declared paths, 91 flag objects, exactly 7 keys ever emitted on a flag
(`alias, default, description, name, required, type, valueHint`):

| #   | Defect                                                                                                                                 | Cost to a caller                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `define.ts`'s `refused` property has **no manifest field**, so all 8 refused args publish as ordinary valid flags                      | An agent builds `info show --team X` from the manifest and is refused by the same binary that published the flag |
| 2   | Positionals are emitted **inside the array named `flags`** on 7 of 25 paths                                                            | A consumer iterating `flags` builds `--handle foo` where the tool wants `foo`                                    |
| 3   | `help --json` returns a **bare document** while every other command returns `{ok, data, meta}`                                         | The one machine output whose whole job is to be machine-readable is the one that does not speak the envelope     |
| 4   | The manifest **omits `help`** — the verb that produces it — and the entire universal surface (`--help`, `-h`, `--version`, `-v`, `--`) | A caller holding the manifest cannot rediscover the door it came through                                         |

Defect 1 is the sharpest: `--team` is declared on **21 of 25 paths and refused on 6 of them, with
byte-identical representation.**

```
status    --team nosuchteam  ->  "--team names team "nosuchteam", which is not configured…"   VALID
info show --team nosuchteam  ->  "`--team` is not accepted here. `info` reports on the PLUGIN…"  REFUSED
```

Defect 4 is structural rather than careless: those are **interceptors in `cli.ts`, not commands**, so
a generator walking the command table walks straight past them. Anything added as an interceptor
later is invisible the same way.

## Proposed Solution

Two halves, and **the order matters** (see Open Questions).

**1. The differential check, as a gate test.** Diff two independent derivations of the same fact:
the manifest (walked from `define.ts`) against the parser's own runtime rejection string
(`Unknown option '--x'. Valid flags: …`). One inert probe per command path; every probe fails at
parse, so no command body runs.

Run once by hand already, via `acc check --recorded-surfaces`: **8 `declared-not-accepted`** (the
whole of defect 1), **1 `self-description-not-declared`** (defect 4), **0 `accepted-not-declared`**,
23 of 26 paths compared. It works, it is cheap, and it needs no external kit — the upstream standard
says a shell loop and `jq` will do it.

**We should own this check rather than lean on the kit.** An outside kit must report both readings —
_"either the declaration claims `--team` is valid, or the enumeration is short"_ — because from
outside it cannot tell which side is wrong. We can: `--team` at `info show` is deliberately refused
and the manifest is what is wrong. For us it is a defect with a known direction, so it belongs in the
gate rather than in somebody's report.

**2. The manifest gains the slots it is missing** — a `status`/`refused` field, positionals in their
own container, the envelope, and the universal surface.

## Scope

**In Scope (MVP)**

- The differential check as a repo-owned test or script, with the 8 known failures pinned so the
  fix has something to turn green.
- Defect 1 — a refusal field, and the manifest excluding refused args from the advertised set.
- Defect 2 — positionals in their own container.

**Out of Scope**

- Emitting a v0 `acc.declaration.json`. Interesting (it would upgrade every disagreement from
  "a file and a tool disagree" to "one binary contradicts itself") and not required to fix anything
  here.
- The exit-code taxonomy — routed to
  [agent-failure-surface](../agent-failure-surface/README.md), which already owns the failure path.
- Group nodes refusing a flag while naming no valid set — same project, same reason.

**Future Considerations**

- Defect 3, if wrapping the bare manifest turns out not to break consumers.
- Defect 4, which needs the emitter to see a surface outside the structure it walks.

## Technical Approach

`manifest.ts` walks the command tree; `define.ts` holds `ArgDef` including `refused` and the
`ArgType` union (`boolean | string | positional | positionals`). The type information the manifest
needs **already exists** — `manifest.ts` simply has nowhere to put it and drops it on the floor.

The check needs no new machinery: we generate the path list from our own manifest and the rejection
strings are our own.

**⚠ The root is ours to probe, and the upstream guide will tell you otherwise.** `acc`'s
recorded-surface guide says to omit the root from a batch, and it is right — _when `acc` is running_,
because the kit probes the root itself and a second observer at one path would give one census line
two observers. Our run compared the root only for that reason:

> `SELF-DECLARED FLAGS — read back from the target's own rejection at the root, which is the only
path the kit probes. enumerated 1 flag at the root: --format`

**With no kit in the loop, that instruction becomes a hole**, and it is the worst-placed one
available: the root is where a global flag gets added, so a token added at the root is exactly what
an in-house census following the guide would not see. Upstream hit this from the other side on
2026-08-26 — an adopter told to add `--version` to satisfy `D1` ended up with help naming a token
their parser refused, and their census could not see it because the flag lived at the root. **The
remediation introduced the drift and the instrument's own scoping rule hid it.**

So our probe list is **26 paths, not 25**: every declared path _including_ `[]`.

## Impact & Risks

**Benefits.** The document our own seats are instructed to trust becomes true. The check makes the
next dropped field fail a test instead of shipping.

**Risks.**

- **Defect 3 is potentially breaking** — anything already parsing the bare manifest breaks if we
  wrap it. Find out who parses it first. This is why it is a Future Consideration and not MVP.
- **A blind spot the check cannot close:** a flag missing from `define.ts` entirely makes both sides
  agree and the check pass. A differential between two derivations of one source cannot see a defect
  in the source — so this does **not** replace pointing an outside kit at us periodically.
- **Gate cost** — 25 subprocesses on every commit may be too slow; a pre-push or CI script is the
  fallback.

**Complexity:** Medium. The fixes are small and local; the sequencing and the breaking-change
question are the work.

## Open Questions

1. **Order.** Fixing the emitter first makes the test trivially green, which is the worse order.
   Land the test first with the 8 pinned?
2. **Test or script?** 26 subprocesses per commit against gate speed.
3. **Who parses the bare manifest?** Decides whether defect 3 is breaking.
4. **Sequencing against `agent-failure-surface`** — both touch `cli.ts` and `define.ts`, so they
   cannot run in parallel worktrees.

## Success Criteria

- The differential check runs in CI and fails on a manifest/parser disagreement.
- `acc check --recorded-surfaces` re-run reports **0** `declared-not-accepted`.
- `0 accepted-not-declared` is preserved — it is true today and worth keeping true.

---

**Related Documents:**

- [The manifest describes a surface we do not have](../../backlog/_archive/2026-08-26-the-manifest-describes-a-surface-we-do-not-have.md)
- [Own the declared-versus-accepted census as a gate test](../../backlog/_archive/2026-08-26-own-the-declared-versus-accepted-census-as-a-gate-test.md)
- [agent-failure-surface](../agent-failure-surface/README.md) — the failure path, and the sibling
  items routed there

---

## Notes

Both `acc` black-box trials returned clean on all four defects: they probe the root only and all
four live below it. These came out of **reading** the upstream standard and running its census by
hand — worth recording, because the kit is the instrument we would reach for first and it was not
the one that found these.

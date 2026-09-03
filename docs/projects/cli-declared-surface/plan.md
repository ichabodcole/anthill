# Follow the acc standard — implementation plan

**Created:** 2026-09-03
**Related Proposal:** [proposal](./proposal.md)
**Status:** Completed 2026-09-03 (branch `chore/cli-conformance-run`, `dc1b25d`…) — two rulings pending with Cole, see Open Questions

---

## Overview

The proposal scoped an MVP: a differential gate test plus two manifest fixes. On 2026-09-03 Cole
widened the assignment to **"follow the full guidance of the acc kit, to the extent it makes sense
for our CLI"** — `STANDARD.md` Parts 1–3 and the two beyond-L0 guides, not just the L0 check. This
plan is that widened scope. It supersedes the proposal's Scope section; the proposal's four
measured defects are all inside it.

Baseline measured this session with `acc 0.1.11` against `plugin/scripts/anthill/cli.ts` at
`dc1b25d`:

- **L0:** `NOT CONFORMANT` → `CONFORMANT` once `acc.config.json` declared two true things
  (`defaultOutput: json`; `D2` waived, bare `anthill` returns the manifest by design). No CLI change.
- **Below-root census** (25 recorded paths + root, against a declaration derived from the manifest):
  `23 of 26 compared, 13 disagreements, 0 accepted-not-declared`. The 13: 8 refused flags published
  as valid; 4 root interceptors (`--help -h --version -v`) declared but not enumerated by the root
  rejection; `help` absent from the manifest it emits. The 3 uncompared paths are the group nodes,
  which refuse an unknown flag naming nothing.

What the standard asks for that anthill **already does**: strict parser, rejections naming the valid
set at leaves, `{ok,error,meta}` on stderr with stdout empty, enveloped side-effect-free
`--version`, a runtime manifest walked from the same `define.ts` structures the parser reads.
Those stay; the work is the gap.

## Outcome & Success Criteria

**Definition of Done:**

- [x] A repo-owned census runs in `bun test`: every manifest path _including the root_ is probed
      with an inert unknown flag, the rejection's named set is diffed against the manifest, and
      "named an empty set" and "named nothing" are two distinct states.
- [x] Census reports 0 disagreements in either direction, with no pinned exceptions left.
- [x] Every rejection names a route forward: flags at leaves, subcommands at group nodes, verbs
      on an unknown or missing verb, and the root's own interceptors at the root.
- [x] `anthill help --declaration` emits an acc v0 declaration (`provenance: emitted`) and
      `bun run acc:census` round-trips it through `acc check --recorded-surfaces --declaration`
      with 0 disagreements. _(24 of 27 paths compared, not 27 — see Divergences #1.)_
- [x] Usage errors and internal faults are distinguishable by exit code, and the envelope carries
      a stable `kind`.
- [x] A contract document beside the code states exit codes, envelope fields, machine-mode
      precedence and scope, output kind per command (with a test that every command has an entry),
      and the recommendations we decline with reasons.

**Non-Goals:**

- ~~Enveloping the bare `help --json` manifest (proposal defect 3).~~ Was a non-goal pending the
  external-consumer answer; Cole supplied it the same day (none) and it shipped — see Open Questions.
- The fuller acc exit-code taxonomy (auth 3, permission 4, not-found 5, …). anthill has no auth
  and its "not found" cases are mostly config. Two codes now (`2` usage, `1` internal), with the
  table published so more can be appended without renumbering.
- An environment-variable override for machine mode. Seats run anthill from a shell and can pass
  `--format`; declined with reason in the contract doc.
- Pagination beyond what `comms read` already has. Declared as output kind instead.

## Approach Summary

The standard's own retrofit order: **census first, emitter second, the rest after both run.** Each
phase lands as its own commit so the census has something to turn green.

The structural move is one **root-interceptor registry** in `cli.ts` — `--help`, `-h`,
`--version`, `-v`, `--json`, `--scope` — read by the interceptors, the manifest's `path: []` entry,
and the root rejection. Today those are string literals in four `if` statements, which is exactly
the generator trap the registry guide names ("the root is not a command").

## Phases

### Phase 1: The census as a gate test

**Goal:** the manifest-versus-parser diff runs on every commit and fails on a disagreement.

**Key Changes:**

- `plugin/scripts/anthill/manifest.census.test.ts` — walks `buildManifest`, spawns
  `bun cli.ts <path> --acc-not-a-flag` for every path including `[]` (measured 25 subprocesses ≈ 1s),
  parses the `Valid flags:` set, and diffs. Three enumeration states: `enumerated`,
  `enumerated-none`, `not-enumerated`. A second sweep sends an unknown verb to every node with
  subcommands and requires the rejection to name them.
- Known disagreements pinned in a `KNOWN` table with the defect each belongs to, so the test is
  green at commit and each later phase deletes rows.

**Validation:** `bun test` green with the 13 flag rows + 3 group-node rows + verb rows pinned.

### Phase 2: The manifest describes the surface we have

**Goal:** proposal defects 1, 2, 4; plus enforced value sets.

**Key Changes:**

- `manifest.ts`: `status: "valid" | "refused"` on every flag (`refused` reason carried as
  `refusedReason`); positionals in their own `positionals[]` container (`required`, `variadic`);
  `values?: string[]` passed through; the root as an entry with `path: []` carrying root args and
  the interceptor registry; `help` declared as a command with `--json`, `--scope`, `--format`.
- `define.ts`: `values?: string[]` on `StringArgDef`, **enforced** by the parser (out-of-set →
  `CLIError` naming the set). `--format` and `feedback --category` move from `valueHint` prose to
  `values`. `resolveFormat`'s silent fallback on an unknown value becomes unreachable.
- `help-renderer.ts` reads `positionals` from the new container.

**Validation:** census rows for defects 1/2/4 deleted; `help --json` shape test updated;
`anthill --format nonsense status` is a usage error.

### Phase 3: Every rejection names a route forward

**Goal:** the group-node item, the unknown-verb gap, and the two parser holes the explorer found.

**Key Changes (`define.ts`, `cli.ts`):**

- Unknown flag at a node with subcommands and no own flags → names the subcommands.
- `Unknown command X` and `No command specified.` → name the valid verbs at that level.
- Root rejection enumerates the interceptor registry alongside `--format`.
- `findSubCommandIndex` consults the **root's** value-taking flags at every level, so
  `anthill info --format json` no longer reads `json` as a verb
  (`docs/backlog/_archive/2026-08-01-group-commands-read-a-flag-value-as-a-subcommand.md`).
- A command declaring one named positional refuses surplus positionals instead of dropping them
  (`team use alpha beta` today drops `beta` silently — rule A4's shape).

**Validation:** census verb sweep rows deleted; 3 group paths move to `enumerated-none` with
subcommands named; regression tests for each.

### Phase 4: Exit codes and envelope fields

**Goal:** "you invoked me wrong" is distinguishable from "anthill broke" without parsing stderr.

**Key Changes:**

- `cli.ts` catch: `CLIError` → exit **2**; anything else stays **1**. `refuseArg` → 2.
- Envelope gains additive fields: `kind` (`usage` | `internal`), `exitCode`, `retryable: false`,
  and `choices` where the rejection named a set. `error` stays a string — nothing parsing it today
  breaks.
- `CLIError` carries `choices?: string[]` so the set reaches the envelope structurally, not only
  as prose.

**Validation:** the C2 line in `acc check` reads `usage errors at exit 2`; existing tests that
assert `exitCode === 1` on usage errors updated to 2, with the internal-fault case pinned at 1.

**Release note:** this changes an observable, never-documented contract. **Ruled by Cole,
2026-09-03: a minor bump, not a major** — the commit is `feat(cli):` with no breaking marker.

### Phase 5: The help surface is one document

**Goal:** D3 and DT-6: help names the machine path, and piped `--help` is the same manifest.

**Key Changes:**

- Root `--help` / `-h` under json emits the full manifest envelope, not `{name, description}`.
- `--help` after `--` is data, not an interceptor.
- Grouped text help lists the universal surface (`--help`, `-h`, `--version`, `-v`, `--`).

### Phase 6: The v0 emitter and the round trip

**Goal:** the standard's second move — a declaration the running binary emits.

**Key Changes:**

- `help --declaration` → acc v0 (`formatVersion "0"`, `provenance "emitted"`,
  `selfDescription {args:["help","--declaration"]}`, `commands[]` with `path/args/positionals`).
  Walks the same manifest.
- `scripts/acc-census.sh` + `bun run acc:census`: probe-plan from the manifest's paths, capture,
  `acc check --recorded-surfaces --declaration`. Not in the commit gate (needs the kit); run
  before a release and after any `define.ts`/`cli.ts` change.

**Validation:** `0 disagreements`, `26 of 26 declared command paths compared`.

### Phase 7: The contract, written beside the code

**Goal:** the fields the standard argues for that v0 cannot carry, published where the code is.

**Key Changes:**

- `plugin/scripts/anthill/CONTRACT.md`: exit codes (append-only table), envelope shape and field
  names, machine-mode precedence and scope (flag > inference; governs success, failure, help,
  version), output kind per command (`data/single`, `data/bounded`, `stream`), the declined
  recommendations with reasons.
- `plugin/scripts/anthill/contract.ts` holding the output-kind table, with a test that every
  manifest path has an entry (the standard's "test that fails when a new command has no entry").

## Key Risks & Mitigations

- **Both sides of the census share `define.ts`.** A flag missing from `define.ts` entirely makes
  the diff agree. → Phase 6's outside round trip stays; the census is the gate, not the audit.
- **Gate speed.** 26 + ~4 subprocesses per `bun test`. Measured ≈ 1s for the flag sweep. If it
  creeps, the sweep moves to pre-push.
- **`agent-failure-surface` overlap.** Phases 3–4 are that project's items. Same files, one
  branch, so no worktree conflict; its README gets a pointer at finalize.
- **The empty-set trap.** acc's reader today scores a present-but-empty set as `not-enumerated`.
  Our census must not inherit that (three states), and group nodes name subcommands rather than
  an empty flag set, so the fix is visible to both instruments.

## Testing & Validation Strategy

Every phase: the census test, the existing `cli.test.ts` / `define.test.ts` contract suites, and
`bun run check`. After phases 2, 3, 4 and 6: the acc round trip from Phase 6, recorded in the
session doc with the census line verbatim.

## Open Questions

1. ~~**Envelope the bare `help --json`?**~~ **Ruled 2026-09-03: nothing outside parses it —
   wrapped.** `help --json` is now shorthand for `--format json`; proposal defect 3 closed.
2. ~~**Release classification** of the exit-code split and the manifest shape change.~~ **Ruled
   2026-09-03: minor.** Both ship under `feat`, no `!`.
3. **Do the shipped skills state the exit-code contract anywhere?** No (grepped). Phase 7 states
   it; whether `join` should point seats at `CONTRACT.md` is a follow-up.

---

**Related Documents:**

- [Proposal](./proposal.md)
- [agent-failure-surface](../agent-failure-surface/README.md)
- [Usage errors and bugs share exit 1](../../backlog/_archive/2026-08-21-usage-errors-and-bugs-share-exit-1.md)
- [Group nodes refuse without naming a route](../../backlog/_archive/2026-08-26-group-nodes-refuse-without-naming-a-route.md)
- [Group commands read a flag value as a subcommand](../../backlog/_archive/2026-08-01-group-commands-read-a-flag-value-as-a-subcommand.md)

---

## Divergences

_Deviations from this plan as written, classified `gap` / `improvement` / `judgement`, appended as
they happen._

1. **`gap` — the round trip reads 24 of 27, not 26 of 26.** Phase 6's criterion assumed the kit
   would read a group node's answer. It does not: the subcommand list arrives in `choices`, the
   reader sees members that are not flag-shaped, and files the path as `did not enumerate` — the
   exact trap the group-node backlog item predicted, and one upstream has filed against themselves.
   Our own census is the authority for group nodes until their reader moves. `0 disagreements` holds.
2. **`improvement` — `--help` and `--version` are registered root args, not a separate registry.**
   The plan proposed a `ROOT_INTERCEPTORS` table read by the interceptors, the manifest and the root
   rejection. Registering them as boolean args on `main` gets all three from the table that already
   exists, with `-h`/`-v` as aliases. The interceptors still answer first; the args are never parsed
   on the happy path, and are declared, enumerated and rendered from one place.
3. **`improvement` — the two `help` interceptors were deleted, not validated.** `help` is a
   registered command and dispatches through the same strict parser as every verb. What remains at
   the top of `runCli` is one line: a bare `anthill` becomes `help`.
4. **`judgement` — Phase 4 was implemented, not deferred.** The exit-1 backlog item called the split
   "a team call, not a trial-branch call". Cole's instruction on 2026-09-03 was to follow the
   guidance; the change is on a branch and reversible until it lands. What is his is the release
   classification — and he ruled the same day: **no major bump**. The commit was reworded from
   `feat(cli)!:` to `feat(cli):` (`cacab25` → `100bb20`) and its `BREAKING:` line softened.
5. **`judgement` — positionals left `flags[]`** (proposal defect 2) rather than being duplicated
   into a new container beside the old. Keeping them in both is the defect wearing a hat; the
   manifest's shape changed in one release with the rest of it.
6. **`gap` — an explorer probe spawned a real tmux session.** During the code survey a subagent ran
   `spawn --attach --format json`, which has no dry run, and created `anthill-dev` with five claude
   panes. Torn down and the stray `.anthill/comms/anthill-dev.session.json` removed. The acc safety
   page's first question ("does your tool do work on a plausible-looking argv?") is one anthill
   answers _yes_ to below the root — which is why the census sends only sentinel flags.
7. **`gap` — review found three silently-dropped requests the census cannot see.** `--version
<verb>` ran the verb (registering `version` as a root arg made the pre-verb parse accept it);
   `--no-<anything>` was never checked against the declared booleans, so `--no-format` slipped a
   `false` under the closed-set check — which means Phase 2's claim that `resolveFormat`'s
   fallback "becomes unreachable" was false until this fix; and `help <command>` had regressed to
   a surplus-positional error. The census probes one sentinel flag per path; none of these is that
   shape. Fixed with tests in the review-round commit.
8. **`gap` — the shipped `join` skill stated the old contract.** Open Question 3 said the skills
   state no exit-code contract; they stated it incidentally, as measured examples (`exit 1`,
   `--format josn` passing silently). Both reviewers caught it. Rewritten to exit 2 with a pointer
   to CONTRACT.md.
9. **`judgement` — CONTRACT.md's `--format` sentence was narrowed, not the behaviour widened.**
   "Accepted before or after the verb at every level" was false: root args are not inherited, so
   `anthill --format json status` at a terminal prints text, and `info --format json show` is
   refused because `info` has no flags. The honest sentence says where to put the flag. Root
   `--format` pass-through is named as debt in CONTRACT.md; not built here.
10. **`improvement` — `values` is no longer typed on booleans**, so publishing an unenforced
    constraint is a compile error rather than a manifest lie.

_Not taken from review, carried as follow-ups:_ `Missing required positional` carries no
`choices`; `-h` inside a value (`comms send --message -h`) is intercepted as help (pre-existing);
`help --json --scope app` ignores `--scope` (documented in CONTRACT.md); the `EXIT_CODE` table test
pins a constant to itself and is a renumbering tripwire, not coverage.

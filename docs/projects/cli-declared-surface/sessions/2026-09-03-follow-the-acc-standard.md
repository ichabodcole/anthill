# Follow the acc standard — 2026-09-03

## Context

Cole asked for two things in one unconvened session: run the latest `agent-cli-conformance` kit
against the CLI, then "make sure we're following the full guidance of the acc kit … to the extent it
makes sense for our CLI." The first is an hour; the second is [the plan](../plan.md), seven phases,
all shipped on `chore/cli-conformance-run`.

## What happened

**The L0 check first.** `acc 0.1.11`, pinned per the skill. `NOT CONFORMANT`: two core violations,
both the bare invocation (`D2`, `C2`). A trial config in the scratchpad — `defaultOutput: json`
plus a `D2` waiver — turned it `CONFORMANT` with no CLI change, and the declaration unlocked `B5`,
which passed. Committed as `dc1b25d` with the kit and its skill.

**Then the standard, all of it.** `STANDARD.md` Parts 1–4, both beyond-L0 guides, the four concept
pages, and the kit's `declaration.ts` for the v0 shape. An Explore subagent mapped the code against
each topic with `file:line` cites — 45 tool calls, and one of them spawned a real tmux session
(see Divergences #6 in the plan). The below-root census by hand reproduced the proposal's numbers to
the digit: 8 refused-as-valid, 3 silent group nodes, `help` absent, the root interceptors invisible.

**Then the phases, one commit each**, in the standard's own retrofit order — census, emitter, the
rest. The census test went in first with 17 rows pinned and exact-equality both ways, so every later
phase deleted rows rather than adding assertions. 17 → 8 → 0.

## Notable discoveries

- **The pre-commit hook runs the full suite**, so a red-first test cannot be committed. Pinning
  known disagreements in the test is what makes "land the test first" possible under that gate.
- **Registering `--help`/`--version` as root args** was cheaper and stronger than the plan's
  separate interceptor registry: the manifest, the rejection and usage all read `main.args`, and
  the interceptors still answer first. The `help` interceptors could then go entirely.
- **`resolveFormat`'s silent fallback** on an unknown `--format` value was a live defect nobody had
  filed: `--format nonsense status` ran the command at exit 0. Enforced `values` closes it at the
  parser for every flag that declares a set.
- **Surplus positionals after one declared positional were dropped in silence** (`team use alpha
beta`). The explorer found it while mapping A4; one more `if` in the parser.
- **The empty-set trap is real and it bit exactly where predicted.** The kit's reader cannot yet
  read a group node's subcommand list as an answer; `acc:census` shows 24 of 27. Recorded as a
  divergence, not papered over.
- **Every measured number in the plan reproduced** from the 2026-08-26 hand run, two versions of
  the kit later. The instrument is stable.

## Changes made

`define.ts` (values enforced, route-forward rejections, `choices`, surplus positionals, root value
flags at every level), `manifest.ts` (`status`, `positionals`, `values`, `root`, v0 emitter),
`cli.ts` (root args, `help` command, `--help` at root, `--` before `--help`, exit codes),
`agent-layer.ts` (`ErrorKind`, `EXIT_CODE`, four envelope fields), `help-renderer.ts` (universal
surface), `contract.ts` + `CONTRACT.md` (new), three new test files, `scripts/acc-census.sh`,
`acc.config.json`. 24 tests updated for exit 2; 731 pass.

## Follow-up

- Both rulings came the same day: minor bump (commit reworded, no `!`), and `help --json`
  enveloped once Cole confirmed nothing outside parses the bare form. Nothing pending.
- **`next` as `{exec, args}`** — CONTRACT.md names it as debt. The `join` tail commands and
  `attach`'s `attachCommand` are shell strings today.
- **`down`'s envelope carries no `because`** — still open in agent-failure-surface.
- **Tell upstream** (skill step 7, category 3 "it worked and I wanted more"): the group-node
  `choices` reading, and that `probe-plan` from a directory other than the target's tree worked
  first time this session. Not sent from this session; Cole owns the channel.

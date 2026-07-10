# Per-seat model selection — pick the Claude model each seat runs on

**Status:** Draft
**Created:** 2026-07-09
**Author:** Cole + forager

---

## Overview

A convened anthill team spawns one `claude` instance per seat, but every instance runs on
**whatever model the human last selected** in Claude Code — there's no way to say "the engine
seat runs Opus, the scribe seat runs Haiku." This proposal adds an **optional per-seat `model`**
to the roster so each seat can be pinned to the model that fits its work: a heavier reasoning
model where the problem is hard, a faster/cheaper model where the work is straightforward.

## Problem Statement

Today `anthill spawn` launches each seat with `config.launch` (default
`claude "/anthill:join {handle}"`), substituting only `{handle}`. No model is specified, so
`claude` falls back to the session default — which is just **the last model the human picked in
the UI**. Consequences:

- **No differentiation.** Every seat runs the same model regardless of its work. A seat doing
  mechanical, well-scoped edits burns a top-tier reasoning model it doesn't need; a seat doing
  hard design work is at the mercy of whatever happened to be selected.
- **Non-deterministic.** The team's model mix depends on invisible UI state, not on anything the
  team declares — so a convene is not reproducible.
- **Cost/latency left on the table.** Matching model to task (cheaper/faster where it's fine,
  heavier only where it pays) is a lever the team can't currently pull.

Affected: anyone convening a multi-seat team who wants to control cost, speed, or reasoning
depth per role — which is most non-trivial teams.

## Proposed Solution

Add an **optional `model` field to each seat** in `.anthill/config.json`, and inject it into the
per-seat launch as `claude --model <model> …` when present. Omitted → no `--model` flag → exactly
today's behavior (fully backward compatible).

```jsonc
{
  "channel": "anthill",
  "seats": [
    { "handle": "lead", "role": "lead", "scope": "orchestration" },
    {
      "handle": "engine",
      "role": "engine",
      "scope": "core logic",
      "model": "opus",
    },
    {
      "handle": "scribe",
      "role": "surface",
      "scope": "docs + copy",
      "spawn": true,
      "model": "haiku",
    },
  ],
}
```

`claude --model` accepts an **alias** (`opus`, `sonnet`, `haiku`, `fable`) or a **full id**
(`claude-opus-4-8`, `claude-fable-5`) — verified in `claude --help`. anthill treats the value as
an opaque, shell-safe pass-through (see Technical Approach); it does **not** maintain its own list
of valid models, so new models work without an anthill change.

**How a user experiences it:** they add `"model": "haiku"` to a seat, run `anthill spawn`, and
that seat's pane comes up on Haiku while the others use their own models (or the default). No new
command, no flags to remember — the roster declares it, spawn honors it.

### Launch injection — the one real design choice

The launch template currently substitutes only `{handle}`. Two ways to add the model:

- **A — `{model}` placeholder (recommended).** Extend substitution: the default launch becomes
  `claude {model} "/anthill:join {handle}"`, where `{model}` expands to `--model <model>` for a
  seat that has one and to the empty string otherwise (collapsing the surrounding space). Keeps
  `launch` the single authoritative template and mirrors the existing `{handle}` mechanism.
- **B — automatic flag append.** Spawn appends `--model <model>` to the resolved launch. Simpler
  (no template change) but assumes the launch is `claude`-shaped — it breaks for a customized
  `launch` (a wrapper script, a different agent binary).

**Recommendation: A.** It's consistent with `{handle}`, keeps `launch` the single source of truth,
and degrades cleanly for custom launch lines (a launch without `{model}` simply ignores the seat
model — explicit, not surprising).

## Scope

**In Scope (MVP):**

- Optional `model?: string` on `SeatConfig`, validated (non-empty, shell-safe charset).
- `{model}` placeholder support in the launch template + updated `DEFAULT_LAUNCH`.
- Injection wired through `anthill spawn`.
- Migration for the default-launch change; docs (config schema in the design-of-record + the
  scaffolded `config.json` comment).
- Tests: resolution/injection unit tests mirroring `resolveSpawnHandles`.

**Out of Scope (initially):**

- A team-level default `model` with per-seat override (see Future).
- Model selection for the **subagent** dispatch path (convene-as-subagents) — that's a skill
  change, not spawn code (see Future).
- Any UI/skill picker ("choose models when you convene"). The field is the primitive; the skill
  affordance comes later, deliberately.
- anthill validating model values against a known list.

**Future Considerations:**

- **Team default + override:** a top-level `"model"` as the team default, seats overriding — a
  natural richer shape once the per-seat primitive exists.
- **Subagent path:** the same `config.model` should flow into the Agent-tool `model` param when a
  seat is dispatched as a Task/Agent subagent instead of a tmux pane. The field is the shared
  source; the convene/spawn skill reads it for that path.
- **A convene skill affordance** that surfaces the per-seat models (or lets the human pick) at
  team start.

## Technical Approach

- **Schema (`config.ts`):** add `model?: string` to `SeatConfig`; validate in `parseSeat` (string,
  non-empty when present). Placed alongside `spawn` as a **spawn-time operational attribute** —
  consistent with the design-of-record's "seats carry role + scope only" rule, which excludes
  _evolving prose_ (`owns`, `relationships`), not operational flags like `spawn`. Update the design
  doc's §5 field rules accordingly.
- **Injection (`team-spawn.ts` / launch resolution):** when substituting the launch line, expand
  `{model}` → `--model <model>` or `""`. The model value is interpolated into a shell command, so
  it gets the **same shell-safety guard as `{handle}`** (a charset like `[A-Za-z0-9._-]`) — a
  malformed model string must be a hard error, never an injection vector.
- **Migration (`migrate.ts`):** most configs omit `launch` and use `DEFAULT_LAUNCH`, so updating
  the default covers them for free. Configs with an **explicit** `launch` need `{model}` inserted —
  the pure migration planner can add it (or leave custom launches untouched and document that they
  must add `{model}` themselves to opt in). Decide in the plan.
- **Key dependencies:** the existing `config.launch` substitution, `team-spawn.ts` launch path, the
  `migrate.ts` planner, and the `claude --model` flag.

## Impact & Risks

**Benefits:** deterministic, declared per-seat model mix; cost/latency control (cheaper/faster
models where they suffice); reproducible convenes; zero-friction opt-in (omit → unchanged).

**Risks:**

- _Shell injection_ via the model string → mitigated by the charset guard (same as handles).
- _Custom `launch` lines silently ignoring the model_ → mitigated by documenting the `{model}`
  placeholder + a migration that inserts it into known-default launches.
- _Invalid model passed through to `claude`_ → surfaces as a `claude` startup error in that pane;
  acceptable (anthill deliberately doesn't track the model list). A doc note points users at
  `claude --help` for valid aliases/ids.

**Complexity:** **Low** — one optional field, one substitution, a small migration, and tests,
all on well-trodden paths (`{handle}` already proves the pattern).

## Open Questions

- **Migration for explicit custom `launch` lines:** auto-insert `{model}`, or leave untouched and
  document? (Leaning: auto-insert when the launch matches the known prior default; leave truly
  custom lines alone with a doc note.)
- **Team-level default now or later?** MVP is per-seat only; a team default is a small addition but
  widens scope. (Leaning: later.)
- **Validate the charset only, or also warn on obviously-wrong values?** (Leaning: charset only —
  keep anthill model-list-agnostic.)

## Success Criteria

- A seat with `"model": "haiku"` spawns a pane running Haiku; a seat without `model` is byte-for-byte
  unchanged from today.
- A malformed model value is a hard, clear error at spawn — never reaches the shell unsanitized.
- Existing configs (no `model`, default or omitted `launch`) convene identically after upgrade.

---

**Related Documents:**

- [Design of record](../../architecture/2026-06-28-anthill-portable-team-os-design.md) — §5 config schema, §6 scaffold
- Spawn path: `plugin/scripts/anthill/commands/team-spawn.ts`; schema: `plugin/scripts/anthill/config.ts`

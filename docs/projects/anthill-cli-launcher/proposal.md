# Human `anthill` CLI launcher — the terminal door

**Status:** Draft
**Created:** 2026-07-04
**Author:** forager

---

## Overview

Give humans (and, later, non-Claude agent systems) a real `anthill` command on their PATH — a
lightweight, opt-in **launcher** that points at the anthill CLI the plugin already ships, so a
person can `anthill attach` / `anthill status` from a terminal instead of running a long
`bun <plugin-cache-path>/cli.ts …` invocation or `tmux attach` by hand.

This is a **deliberately small first slice** of roadmap #2 / v0.2 brief feature 3 ("Global `anthill`
CLI"). It delivers the human **terminal door** and establishes the "`anthill` is a command you run"
paradigm, while explicitly **deferring** the bigger move (making an externally-installed CLI the
single source of truth that the skills themselves call — "option 2" below).

## Problem Statement

The anthill CLI (`scripts/anthill/cli.ts`) ships **inside the plugin** and is only reachable through
the agent/skill path: skills invoke it as `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <cmd>`,
where `CLAUDE_PLUGIN_ROOT` is injected by Claude Code only while a plugin skill runs. A **human in a
terminal** has neither that env var nor an `anthill` on PATH, so to attach to a running team session
they must `tmux attach` manually or type the full
`bun ~/.claude/plugins/cache/anthill-marketplace/anthill/<ver>/scripts/anthill/cli.ts attach`. That's
the "missing terminal door" the brief names. The gap is small (mostly `attach` + `status`) but real,
and it's the seed of a larger vision (one installed `anthill` usable across agent systems).

## Proposed Solution

A **launcher** — not a second copy of the CLI. The single load-bearing principle: **there is exactly
one copy of the CLI logic (the plugin's `cli.ts`), and everything points at it**, so no version can
drift out of sync with another.

**Why a launcher (the alternatives considered):**

- **Second full copy** (`bun add -g` the whole repo → a self-contained global CLI): rejected — two
  copies of the logic = the exact version-skew problem we want to avoid.
- **Invert now** (external installed CLI becomes the source of truth; skills call the PATH `anthill`):
  this is the real long-term vision ("option 2"), but it _relocates_ skew to skill-version ↔
  CLI-version, adds a mandatory install, and pays for standalone value the CLI barely has today (its
  verbs only fully make sense inside a convened tmux/grapevine/bounty session). Deferred, not
  discarded.
- **Launcher / pointer (chosen):** a tiny installed `anthill` that resolves the highest-semver
  plugin-cache `cli.ts` and delegates to it. One copy, zero skew, minimal build — and a clean
  **onboarding ramp** to option 2 (switching later is mostly "point the skills at the installed
  tool + add a plugin↔CLI parity check in bootstrap," not a rebuild).

**How a user experiences it:**

```
# one-time, opt-in
bun add -g github:ichabodcole/anthill-cli      # puts `anthill` on PATH
# thereafter, from inside a project
cd ~/work/my-app
anthill attach        # attaches to THIS project's running team session
anthill status        # who's on the vine + board columns
```

Uninstall is the standard `bun remove -g anthill-cli`. Install is **opt-in** — bootstrap _mentions_
it if `anthill` isn't found, but never installs it automatically.

## Scope

**In Scope (MVP):**

- A **dedicated, minimal launcher repo** (working name `anthill-cli`) — a `package.json` with a `bin`
  and a ~15-line resolver that globs the anthill plugin cache for the highest-semver
  `scripts/anthill/cli.ts` and `exec`s `bun "$cli" "$@"`, inheriting the caller's cwd. Zero deps.
- **`attach` outside-a-project fallback** (in this repo's `team-attach.ts`): when no `.anthill/config.json`
  is found up-tree, list the running anthill tmux sessions and hint "cd into a project or pass
  `--session <name>`" instead of a bare "no config" error.
- **bootstrap preflight mention** (opt-in): if `anthill` isn't on PATH, surface the optional
  `bun add -g …` one-liner. Never auto-install (touching the user's machine stays consent-gated).
- **Docs**: README / AGENTS note the optional human `anthill` command and what it's for.

**Out of Scope:**

- **Option 2** — making an externally-installed CLI the source of truth that the _skills_ call.
  Agents keep using `${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts` unchanged.
- **Monorepo + registry (npm) publishing.** A dedicated launcher repo installed via `bun add -g
github:…` achieves "only the CLI installs" without an npm pipeline; the monorepo+publish move is
  reserved for the option-2 project, when the published artifact is the _real_ tool.
- **New lead-facing vine/board wrapper verbs** (the brief's sugar). Humans get the existing verbs;
  new shorthands can come later.
- **Auto-install** of the launcher.

**Future Considerations:**

- **Option 2**: the launcher's logic-free design is the ramp — later, the external tool becomes the
  source of truth (skills point at PATH `anthill`; bootstrap adds a version-parity check), usable by
  Codex / other agent systems, with no Claude-cache coupling. Likely the moment to adopt the
  monorepo + npm publish.

## Technical Approach

**The launcher (new repo).** Standalone so installing it pulls ~15 lines, not the whole anthill repo.
It re-implements the tiny resolver rather than importing from the plugin (it must stand alone):

```
# pseudocode
cacheGlob = ~/.claude/plugins/cache/*/anthill/<ver>/scripts/anthill/cli.ts
cli = highest-semver match of cacheGlob      # same compare as coord.ts compareSemver
if none: error "anthill plugin not found — install it in Claude Code"
exec bun "$cli" "$@"                          # inherits cwd → the root-marker walk-up just works
```

The highest-semver pick mirrors the proven `selectCoordCli` / `compareSemver` logic already in
`scripts/anthill/coord.ts` (which resolves spellbook's versioned cache the same way). Globbing
`cache/*/anthill/` (any marketplace dir) keeps it robust to marketplace naming.

**Why cwd-passthrough is all `attach` needs.** Every anthill command is already **cwd-anchored** via
the `.anthill/config.json` root marker (`config.ts` walks up from cwd, like git/cargo). `attach`
derives the tmux session from that project's `config.channel`. So `anthill attach` run inside a
project reaches _that_ project's session; multiple concurrent teams are distinct named sessions and
the cwd disambiguates. The launcher just execs with the caller's cwd, so this works unchanged — the
only addition is the outside-a-project fallback above.

**Key dependencies:** the plugin must be installed (the launcher resolves its cache); **Bun** on PATH
(already an anthill prerequisite; the launcher execs `bun`). No new external libraries.

## Impact & Risks

**Benefits:**

- Closes the human terminal-door gap with a one-line opt-in install.
- Preserves a **single source of truth** (the plugin's `cli.ts`) — no version skew by construction.
- Establishes the `anthill`-command paradigm as a low-risk **ramp to option 2**.

**Risks:**

- **Claude-cache path coupling.** The launcher encodes Claude Code's plugin-cache layout — an internal
  detail that could change. Mitigation: it's a small, isolated resolver; a layout change is a
  one-line fix, and option 2 removes the coupling entirely by making the tool itself the source.
- **A second repo to maintain.** Mitigation: it's near-static (holds no product logic — just
  resolve+exec), so maintenance is minimal; it folds into the monorepo if/when option 2 lands.
- **Bun required for a "CLI".** Accepted: Bun is already required, and the user still just types
  `anthill`.

**Complexity:** Low–Medium — the launcher is tiny; the plugin-side changes are a small `attach`
fallback + a bootstrap mention + docs. The only cross-cutting piece is the second repo.

## Open Questions

- **Launcher repo + package name.** `anthill-cli`? (Consider the option-2 ramp: if the future
  standalone tool wants the bare name `anthill`, does the launcher package want that name now, or a
  distinct one to avoid a later rename?)
- **Launcher implementation form.** A `bin` pointing at a `.ts` run by Bun, or a thin `sh` wrapper
  that execs `bun`? (Both fine; the `.ts`-via-Bun form keeps it one language and testable.)
- **PATH/bin dir.** Confirm `bun add -g` reliably lands the `bin` on PATH across the shells we care
  about (bun's global bin dir on `$PATH`); document if a `bun pm -g` PATH note is needed.

## Success Criteria

- A user can `bun add -g github:ichabodcole/anthill-cli`, then from a project dir run `anthill attach`
  and land in that project's running team session, and `anthill status` and see the vine + board.
- Running `anthill` from outside any project gives a helpful session list, not a bare error.
- Agents are untouched (still `${CLAUDE_PLUGIN_ROOT}/…/cli.ts`); no version-skew surface is introduced.
- The launcher needs no change when the anthill plugin is upgraded (it re-resolves highest semver).

---

**Related Documents:**

- [ROADMAP](../../ROADMAP.md) — item #2 (Global `anthill` CLI); this is its first, human-door slice.
- [v0.2 brief, feature 3](../../briefs/2026-06-30-anthill-v0.2-next-release.md) — the originating scope.
- `../../../scripts/anthill/coord.ts` — the `selectCoordCli` / `compareSemver` resolver this mirrors.
- `../../../scripts/anthill/commands/team-attach.ts` — where the outside-a-project fallback lands.

---

## Notes

**The strategic reason for option 1 (Cole's framing).** Beyond solving the human pain point, the
launcher introduces the separate-CLI-tool paradigm cheaply and creates the onboarding path to a
future where an installed `anthill` is the single tool shared across agent systems (Claude, Codex,
others) — at which point the switch is mostly "skills point at the installed tool + a bootstrap
parity check," reusing the tooling this slice establishes. Build the launcher logic-free so nothing
here paints that future into a corner.

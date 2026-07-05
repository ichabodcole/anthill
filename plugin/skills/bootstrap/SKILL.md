---
name: bootstrap
description: Set up the anthill agent-team structure in this project — preflight the dependencies, propose a team composition from the nearest archetype, ratify it with the human, write `.anthill/config.json`, and render the `.anthill/` scaffold. Use when the human says "set up a team", "add a team to this project", "bootstrap the team", "install anthill here", "give this repo a dev team", or otherwise wants the multi-agent team structure stood up in a repo that doesn't have one yet. This is the FIRST thing you run in a new project; afterwards `anthill:convene` starts working sessions.
---

# anthill: Bootstrap (stand up the team structure)

Install the anthill **team-OS** into this project: a `.anthill/config.json` (the keystone every command
reads) + a rendered `.anthill/` living-docs scaffold. This is the **one-time setup**; once it's done,
`anthill:convene` / `anthill:join` / `anthill:finalize-session` run the actual sessions.

**Scope:** read the repo's shape from a deterministic scan, propose the nearest archetype as **candidate
seatings**, and let the human ratify. Single-surface repos get **layered-app**; a workspace of several
apps + shared packages gets **multi-surface** (a seat per surface + the shared-contract seat). The
archetype is a starting hypothesis, not a gate — the human always ratifies, corrects, or hand-tailors.

> **The anthill CLI** — driven from the plugin (nothing installed in the target repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code when a plugin skill
> runs.)

## Steps

### 0. Is there already a team here?

Before anything, check for an existing footprint: if **`.anthill/config.json`** or the legacy
**`.team/config.json`** already exists (here or up the tree), this repo is **already bootstrapped** —
do NOT re-bootstrap (you'd double-write or clobber). Instead:

- on the **current** version → run **`anthill:convene`** to start a session;
- on an **older** version (e.g. the legacy `.team/` layout) → run **`anthill:upgrade`** to migrate it
  to the current `.anthill/` layout (history-preserving). `anthill migrate --dry-run` reports which.

Only continue below when there's no footprint yet.

### 1. Preflight the dependencies

anthill depends on three things. Check each; if any is missing, **guide the install and stop** — don't
write a half-working config.

- **Bun** (runs the CLI): `bun --version`. Missing → `curl -fsSL https://bun.sh/install | bash` (or
  `brew install oven-sh/bun/bun`).
- **spellbook** (grapevine + bounty — the coordination layer anthill builds on): confirm the plugin is
  installed by checking your **available skills** for `spellbook:grapevine` + `spellbook:bounty`.
  (anthill's CLI resolves their underlying scripts itself, so you don't need their install paths — only
  that the plugin is present.) Missing → install the spellbook plugin from its marketplace, then re-run.
- **tmux** (pane mode): `tmux -V`. Missing → `brew install tmux`. **Non-fatal** — without tmux you lose
  pane spawning but subagent mode still works; note the degradation and continue.

> **Optional (mention, don't install):** a **human** `anthill` command for driving a session from a
> terminal (`anthill attach`, `anthill status`) — `bun add -g github:ichabodcole/anthill-cli`. It's a
> pointer to the installed plugin's CLI (nothing to keep in sync), and purely for the human; agents
> don't need it. Surface it if `anthill` isn't already on PATH, but **never install it for them** —
> a global install touches their machine, so it stays their call.

### 2. Light discovery

- **Detect the repo's real grounding anchors** — don't assume `AGENTS.md` exists. Probe the usual
  candidates (`AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/PROJECT-SUMMARY.md`, `docs/PROJECT_MANIFESTO.md`)
  and read the ones that are **actually present** to understand what this project is. The archetype's
  default `grounding: [AGENTS.md, README.md]` is only a guess — on a repo with no `AGENTS.md` it would
  emit a dangling reference, so set `grounding` to the anchors you actually found (step 3).
- **Read the repo's shape deterministically:** run **`anthill scan`** and read the `ScanReport` it emits
  (`{ ok, data }` — the `data` is the report). This is the machine reading you'll ratify with the human,
  replacing eyeballing the layout. What matters:
  - **`data.workspace`** — `null` ⇒ **single-surface** repo (one app); non-`null` ⇒ a **multi-surface**
    workspace (several apps + shared packages). This one boolean picks the archetype.
  - **`data.units[]`** — each workspace member: `name`, `path`, `kind` (`"app"`|`"package"` — a
    best-effort hint you may overrule), `stack` (dep-derived, **dominant-first**, so `stack[0]` is the
    unit's primary framework), `private`, and `internalDeps` (names of other units it depends on — the
    edges).

#### 2a. Single-surface (`data.workspace === null`) — layered-app, unchanged

- **Load the draft:** read `${CLAUDE_PLUGIN_ROOT}/templates/archetypes/layered-app.json`. It seeds: a
  lead + engine / spine / surface seats + a verify seat (verifier `spawn:true`), with a `CHANGE-ME`
  channel placeholder and the default `grounding` / `paths` / `launch`.
- **Lightly tailor** the seat scopes to what you actually saw (e.g. point the surface seat at the repo's
  real components dir, the engine seat at its core package). The one unit's `stack[0]` names the
  surface's stack — use it to make the surface-seat scope concrete. Keep handles generic unless the
  human has names in mind — they ratify next.
- Skip 2b entirely; go to step 3.

#### 2b. Multi-surface (`data.workspace !== null`) — offer candidate seatings

A workspace of several apps + shared packages has **vertical** seams (one seat per surface + the shared
contract), not the horizontal layers `layered-app` assumes. Read the `ScanReport`, derive three facts,
then open a conversation with **2–3 candidate seatings** — a recommendation the human steers, **not a
pick-one form**.

**Derive from the payload:**

- **Surfaces** = the app-like units (`kind:"app"`; overrule a mislabel using `private` + a framework in
  `stack`). Each surface is a candidate `surface` seat.
- **The shared-contract seat** = the `kind:"package"` unit with **fan-in ≥ 2** — i.e. **two or more
  surfaces name it in their `internalDeps`**. A package with low/zero fan-in is config/tooling — **do
  not seat it**. Without the edges, "the package both surfaces use" is a guess the moment a repo has
  more than one package, so drive this off `internalDeps`, not off the package's name.
- **Seam strength — fold vs split** = **`stack[0]` equality** across surfaces (compare the _primary_
  framework, not stack overlap — `[next,react]` and `[expo,react-native,react]` share `react` but are
  **different** surfaces). Distinct `stack[0]` ⇒ **strong seam ⇒ split** (a seat each). Shared
  `stack[0]` ⇒ **weak seam ⇒ fold** (one merged seat).

**Guard — one real surface ⇒ treat as single-surface.** If the derive leaves only **one** `kind:"app"`
surface (everything else is a package / tooling with low fan-in), this workspace is effectively
single-surface — a workspace layout doesn't by itself make a multi-surface team. Don't force the
candidates below; fall back to **2a / `layered-app`**, tailoring the surface seat to that one unit's
`stack[0]`.

**The three candidates** (load `${CLAUDE_PLUGIN_ROOT}/templates/archetypes/multi-surface.json` for
candidate A's shape — it seeds lead + per-surface seats + the shared-contract `engine` seat + verify;
fan the `surface` seats out to match the real surface count):

- **A — vertical / by-surface:** lead + one `surface` seat per surface + the shared-contract seat +
  verify. _Why: the package/app boundary is a stable contract two people can work against
  semi-independently._ **Recommend A when surfaces have distinct `stack[0]`.**
- **B — layered** (the `layered-app` archetype): engine / spine / surface. Offer it **with the
  spanning-warning** — flag that a single `surface` seat would span surfaces whose `stack[0]` differ
  (e.g. Vue + React Native in one seat), unrelated expertise tracks one seat can't hold well. _Why:
  fine for one app; risky here._
- **C — lean / merged:** the surfaces folded into one `app` seat + the shared-contract seat. _Why: if
  the surfaces **share** `stack[0]` (one shell/stack) or the team is small, the seam is weak — fold._
  **Recommend C when surfaces share `stack[0]`.**

**Present it as a conversation-opener, not a menu.** Structure the message to converge:

1. **State the reading** — "Here's how I'm reading your repo: a multi-surface workspace — _\<surface>_
   (\<stack[0]>) + _\<surface>_ (\<stack[0]>) + a shared _\<package>_ both depend on."
2. **Recommend one, with one clause of _why_** — lead with A (or C, per the seam-strength rule above).
3. **Name the alternates in a line each** — including B's spanning-warning if the surfaces' `stack[0]`
   differ.
4. **Ask exactly one open question** — "Does that match how you think about this codebase — and what am
   I missing?" — inviting the human to confirm, redirect, or feed in what detection can't see (a
   deprecation in flight, a design-system package that's the _real_ seam, a "surface" that's actually
   two).
5. **Then converge** on one seating. The human reacts to a concrete reading rather than authoring from
   scratch — that's what keeps this a one-pass ratify, not an open-ended "how do you want your team?".

Weave those five beats into **natural prose**, not five labeled sections — the numbering is your
checklist, not the human's. One worded opener to copy the register from:

> _"You've got a Nuxt web app and an Expo mobile app sitting over a shared client SDK. I'd put one
> owner on each surface plus a keeper for the SDK, since that package/app boundary is the stable
> contract they'll meet at. I could also fold the two apps into one seat if you think of them as one
> stack — or add a layer split if that's closer. Does that match how you hold this repo, and what am I
> missing?"_

**Themed naming (optional, offer once the shape is agreed).** Handles are free-form; offer a naming
theme mapped onto the roles from a small fixed set (e.g. Arthurian, craft/optics, celestial) **or**
free-form, and let the human decline (generic `surface` / `shared` / `verify` handles are fine). It
reinforces the durable-seats-as-characters model, but it's a nicety — never block ratify on it.

### 3. Ratify with the human

For **single-surface** repos (2a) present the proposed roster (handles · roles · scopes) and confirm —
one focused round. For **multi-surface** repos (2b) the candidate-seating conversation _is_ this round:
once the human has steered you to one seating, treat it as the ratified roster and continue below.

- **Seats:** rename / merge / split / re-scope, or drop a seat that doesn't fit. (e.g. no separate
  engine layer → fold it into spine; or fold two same-stack surfaces into one `app` seat.)
- **Channel:** replace `CHANGE-ME` with the team's grapevine channel name (default tmux session name
  too) — usually the project's short name.
- **grounding / paths:** set `grounding` to the anchors you actually detected (step 2) — **drop any
  default that doesn't exist** rather than emit a dangling path. (`anthill join` warns when a configured
  grounding doc is missing, so a dangling ref won't stay silent — but don't write one in the first
  place.) Keep the default `paths` unless the project **deliberately** wants its team docs somewhere
  other than `.anthill/` (e.g. a repo that prefers `docs/team/`). And if you _do_ set `paths`, make it
  that deliberate location — **never write a `paths` override that just repeats the `.anthill/` default**
  (a redundant override is noise, and it's exactly what trips `anthill migrate` on a future upgrade).

### 4. Write the config + render the scaffold

- **Write `.anthill/config.json`** — you are the compositor: take the ratified roster and emit the
  finalized config (the §5 schema — `channel`, `lead`, `seats[]`, and any non-default
  `grounding`/`paths`/`launch`). **Stamp `"version": 2`** — the current footprint version; an
  unstamped config reads as the legacy v1 (`.team/` + `docs/team/`) layout. Write it to
  `<repo-root>/.anthill/config.json`.
- **Render:** run **`anthill init`**. It reads the config and deterministically renders `.anthill/`
  (the SOP, `seams.md`, the roster `dev/README.md`, one `dev/<handle>.md` per seat) and ensures the
  `.anthill/scratch/` line in `.gitignore`. It's idempotent — re-running never clobbers existing docs.
- **Shield the living docs from the host's formatter (if it has one).** The `.anthill/` docs are prose
  pheromone living in the repo, so a host formatter (prettier / biome) will reflow them on commit —
  churn at best, and a reflow can mangle a hand-wrapped line into a stray list bullet. If the repo uses
  one (check for `.prettierignore`, a `biome.json` / prettier config, lint-staged), **add the whole
  `.anthill/` footprint** — the living docs **and** `.anthill/config.json` — to its ignore (a single
  `.anthill/` line in `.prettierignore` covers both). Don't scope the guard to just the docs dir:
  `config.json` is JSON, so a formatter globbing `**/*.json` (or lint-staged on staged JSON) will
  rewrite it. (If a `paths` override puts the docs elsewhere, ignore that dir too.) One-time setup;
  idempotent (skip if already ignored). No host formatter → nothing
  to do.
- **Sanity check:** `anthill status` (or `anthill join <lead>`) resolves against the new config without
  error.
- **Drop a discoverability pointer (consent-gated).** Offer to add a short **anthill methodology** note
  to the repo's root `AGENTS.md` (the preferred home) with `CLAUDE.md` as a one-line redirect to it —
  so a fresh agent entering the repo learns that team-based dev is available here, how to engage it
  (`anthill:convene`), and that the team lives in `.anthill/`. Detect which file(s) the repo already
  uses and respect that; idempotent — skip if a pointer is already present. This edits the repo's root
  files, so **ASK first**.

### 5. Report

Tell the human the team is ready: the roster (handles + roles), where the docs landed (`.anthill/`),
and the next step — **"run `anthill:convene` to start a working session."** Optionally suggest they
commit `.anthill/config.json` + `.anthill/` (the scaffold is durable; `.anthill/scratch/` stays gitignored).

## Output

A bootstrapped project: a valid `.anthill/config.json`, a coherent `.anthill/` scaffold, dependencies
confirmed — ready for `anthill:convene`.

## Skill feedback

If this skill was rough — a preflight check that misfired, an archetype that didn't fit, a step unclear
— jot it down and flag the human (or capture it for the first `anthill:finalize-session`). These skills improve by use.

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

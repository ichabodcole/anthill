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
**And when the scan finds no manifest it can read, there is no nearest archetype — you say so and ask
(§2·0).** Ratification is not a safety net for a shape nobody had grounds for; a human will sign off on
a plausible-looking roster, which is exactly how the old fail-open shipped teams into novel repos.

> **The anthill CLI** — driven from the plugin (nothing installed in the target repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code when a plugin skill
> runs.)

## Steps

### 0. Is there already a team here?

Before anything, check for an existing footprint: if **`.anthill/config.json`** or the legacy
**`.team/config.json`** already exists (here or up the tree), this repo is **already bootstrapped** —
do NOT re-bootstrap (you'd double-write or clobber). Instead:

- on an **older** version (e.g. the legacy `.team/` layout) → run **`anthill:upgrade`** to migrate it
  to the current `.anthill/` layout (history-preserving). `anthill migrate --dry-run` reports which —
  except on a project that already configures several teams, where it refuses by name and the answer
  is the living-doc reconcile in `anthill:upgrade` instead.
- on the **current** version → run **`anthill:convene`** to start a session. **But if the plugin was
  just updated, run `anthill:upgrade` first even though the version matches** — the stamped version
  tracks _layout_, and a release can change the SOP and team guidance without moving it. Living docs
  are written once at bootstrap and never refreshed automatically, so `migrate`'s _"nothing to
  migrate"_ does not mean the team is current.
- **on the current version, and the human wants a SECOND team** (a different _kind_ of team, or a
  variant of this one to compare against) → **do not re-bootstrap. Go to [§0a](#0a-adding-a-team-to-a-project-that-already-has-one).**
  A project can carry several teams, and adding one is a different act from standing the first up:
  the repo, the dependencies and the human's conventions are all already settled, so steps 1–3 have
  mostly been answered. What is left is the composition and one careful config edit.

Only continue below when there's no footprint yet.

### 0a. Adding a team to a project that already has one

**This route exists because "already bootstrapped" is not the same answer as "no".** A project may
configure several teams — a different shape for a different kind of work, or a deliberate variant so
two shapes can be compared rather than argued about. What it must never do is overwrite the team that
is already there.

**Do the composition first, then one edit.** Steps 2–3 below still apply to the NEW team — scan, draft
a seating from the nearest archetype, ratify it with the human. _(Or, if the scan reports
`evidence: "none"`, take **§2·0** and ask instead — there is no nearest archetype. That is not a
corner case here: a project bootstrapped **via** §2·0 has no archetype behind its first team either.)_ Skip step 1 (the dependencies are
already installed) and do not touch the incumbent's roster.

Then convert the config **once**, from the flat shape to a `teams` map (spec §5a):

```jsonc
// BEFORE — one team, the shape every existing project is in
{ "version": 2, "channel": "myproject", "lead": "maestro", "seats": [ /* … */ ] }

// AFTER — two teams. NOTHING MOVED ON DISK.
{
  "version": 2, // ⚠ STAYS 2 — see below
  "teams": {
    "dev": {
      "lead": "maestro",
      "seats": [
        /* the incumbent's, verbatim */
      ],
      "channel": "myproject", // keep its EXISTING channel, or its log is orphaned
      "paths": { "teamDir": ".anthill" }, // ⚠ REQUIRED — see below
    },
    "lean": { "lead": "boss", "seats": [ /* the new team's */ ], "forkedFrom": "dev" },
  },
}
```

**Four things this edit must get right. Each of them silently damages the incumbent if missed:**

1. **⚠ The incumbent needs an EXPLICIT `paths.teamDir: ".anthill"`.** Under a `teams` map `teamDir`
   defaults to `.anthill/teams/<name>`, so without this line the existing team's docs stay at
   `.anthill/` while every command resolves elsewhere — a team whose seats read empty living docs
   while their real ones sit untouched one directory up. **With the line: zero file moves, zero
   migration**, and new teams still get the new default.
2. **⚠ `version` STAYS `2`.** It describes the footprint LAYOUT, and nothing moved. The shape is
   detected structurally (the presence of `teams`), so there is no version to bump — a stamped `3`
   would claim a layout that does not exist, against a plugin whose current version is 2. (`anthill
migrate` will not tell you: it refuses a `teams` config before it ever reads the version.)
3. **⚠ Keep the incumbent's existing `channel`.** It is the message log's filename
   (`<teamDir>/comms/<channel>.ndjson`); renaming it orphans every message the team has sent.
   A new team's `channel` defaults to its own name, which is usually what you want.
4. **Top-level `channel` / `seats` / `lead` / `paths` must be REMOVED** as part of the same edit —
   they now live inside the entry. The config layer refuses a config carrying both, by design: a
   half-finished conversion that silently ignored them would make the incumbent team disappear.

**Then render and verify — both, and in this order:**

```sh
anthill team ls                  # every team, with its resolved directory
anthill init                     # renders the new team's docs; skips every existing file
```

**No `--team` here, deliberately.** `init` renders the **project's** footprint, not one team's: it
covers every configured team, and because it is idempotent at the file level, the incumbent's entire
footprint comes back as _skipped_ while only the new team's docs are written. It cannot touch the
incumbent's living docs. (`--team <name>` still narrows if you want only one. The pin does **not** —
it says which team you are operating _as_, which is a different question from what this repo
contains.)

**Then check the two outputs against each other. Both checks can fail, which is the point:**

1. **Every row `team ls` printed must appear in `init`'s `written` or `skipped`.** A team listed by
   `ls` and rendered by neither is a team with **no living docs at all** — `ls` reads the config, so
   it will happily list a team whose directory does not exist. That is the outcome to catch here:
   `convene` would hand its seats an empty footprint, which every seat reads as _"my docs are
   missing"_.
2. **The incumbent's row must say `.anthill/`.** If it does not, item 1 above was missed and its
   accumulated docs are orphaned one directory up.

**Constraints the config layer enforces, so you get an error rather than a silent collision:** team
names match `[A-Za-z0-9._-]` and may not be `.` or `..`; channels must be unique **and prefix-free**
(`anthill attach` folds `<channel>-<suffix>` in as a sibling session); and no two teams may resolve
to the same `teamDir`, `seatDir` or `seams`.

**Finally, tell the human the two operating facts** — they are the whole difference between one team
and several:

- **Only one team can be convened at a time**, because the board is a single repo-root file.
  `anthill convene` refuses while another is up and names it.
- **`anthill team use <name>` switches the repo**; `anthill team show` says which team you are on and
  why. Seats never name a team — their pane carries the binding.

### 1. Preflight the dependencies

anthill depends on three things. Check each; if any is missing, **guide the install and stop** — don't
write a half-working config.

- **Bun** (runs the CLI): `bun --version`. Missing → `curl -fsSL https://bun.sh/install | bash` (or
  `brew install oven-sh/bun/bun`).
- **spellbook** (**bounty** — the task board anthill builds on; the team's message wire is anthill's
  own `comms` and needs nothing installed): confirm the plugin is installed by checking your
  **available skills** for `spellbook:bounty`.
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
  - **`data.evidence`** — **read this FIRST.** `"manifest"` ⇒ a readable manifest was found — a root
    `package.json`, **or** a `pnpm-workspace.yaml` that yielded globs. _(On the second, `warnings`
    still says `no package.json at repo root`. That is consistent, not a contradiction: the scan had
    workspace members to read. Do not treat the warning as a reason to doubt `"manifest"`.)_
    `"none"` ⇒ there was none, so `data.units[0]` is **synthesized from the directory name** and its
    `stack` is empty **by absence, not by observation.** → **`"none"` goes to [§2·0](#20-evidence-none--stop-and-ask-do-not-propose-an-archetype), not to 2a/2b.**
  - **`data.workspace`** — `null` ⇒ **single-surface** repo (one app); non-`null` ⇒ a **multi-surface**
    workspace (several apps + shared packages). Picks the archetype **once `evidence` is `"manifest"`** —
    on its own it cannot tell a real single-surface app from a repo the scanner could not read at all.
  - **`data.units[]`** — each workspace member: `name`, `path`, `kind` (`"app"`|`"package"` — a
    best-effort hint you may overrule), `stack` (dep-derived, **dominant-first**, so `stack[0]` is the
    unit's primary framework), `private`, and `internalDeps` (names of other units it depends on — the
    edges).

#### 2·0. `evidence: "none"` — STOP AND ASK. Do not propose an archetype.

**Nothing below this point has evidence behind it.** `units[0]` was synthesized from the directory
name; the empty `stack` is the scanner having found no manifest, not a repo having no stack. Every
archetype in `templates/archetypes/` is a **software** shape, and proposing one here is a guess
wearing a scan's authority.

**⚠ This was a live defect, and its shape is why the rule is "ask", not "refuse".** 2a used to fire
on `workspace === null` alone, so a novel repo received `layered-app` — an engine seat scoped to
_"goldens, unit tests"_ — and **a human ratified it**, because nothing in the reading said it was a
fallback. The bogus roster was laundered through a human "yes". A wrong answer nobody can see is bad;
a wrong answer that collects a signature is worse.

**Say what you found, in these terms, and then ask:**

> _"`anthill scan` read no manifest here, so I have nothing to derive a team shape from. **What kind
> of work does this repo hold, and who would the seats be?**"_

**⚠ That script deliberately names NO repo kinds, and an earlier draft of it did** — it offered
_"non-software, or a stack I don't scan (Python, Rust, Go…)"_, which **violates the very rule stated
in the next bullet.** It also enumerates wrongly: a perfectly ordinary JavaScript repo with
`client/package.json` and `server/package.json` and no root manifest reads `"none"` and is neither of
those things. **The moment you list possibilities you have started guessing again**, one level below
the archetype you just declined to guess.

- **Phrase it as what YOU could not read, never as what the repo IS.** `evidence: "none"` is a fact
  about the scanner. Telling a Rust team "this isn't a software project" invites an argument;
  telling them "I can't read Cargo.toml" invites a correction, which is the thing you want.
- **Then compose from their answer**, not from an archetype — **[step 3](#3-ratify-with-the-human)
  onward works unchanged**, with the human's description standing in for the scan's reading. **The
  seats are theirs to name.**
- **Do NOT fall through to 2a or 2b**, and do not "start from `layered-app` and adjust". A shape the
  human corrects is anchored on a shape nobody had grounds for.
- **This is `adapts, not dictates` at its sharpest.** anthill has no opinion about what a
  non-JavaScript team looks like, and the honest move is to say so and ask rather than to install a
  guess.

#### 2a. Single-surface (`evidence: "manifest"` and `data.workspace === null`) — layered-app, unchanged

- **Load the draft:** read `${CLAUDE_PLUGIN_ROOT}/templates/archetypes/layered-app.json`. It seeds: a
  lead + engine / spine / surface seats + a verify seat (verifier `spawn:true`), with a `CHANGE-ME`
  channel placeholder and the default `grounding` / `paths` / `launch`.
- **Lightly tailor** the seat scopes to what you actually saw (e.g. point the surface seat at the repo's
  real components dir, the engine seat at its core package). The one unit's `stack[0]` names the
  surface's stack — use it to make the surface-seat scope concrete. Keep handles generic unless the
  human has names in mind — they ratify next.
- Skip 2b entirely; go to step 3.

#### 2b. Multi-surface (`evidence: "manifest"` and `data.workspace !== null`) — offer candidate seatings

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

**⚠ This branch is only reachable with `evidence: "manifest"`, which now REQUIRES at least one unit.
If you are somehow here with `units` empty, go to §2·0** — the guard below is about _one_ surface and
must never be applied to _zero_. (Shipped that way for one commit: globs that matched no members
answered `"manifest"`, and this guard's fall-back to `layered-app` was the road back to the defect.)

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

For repos that came through **§2·0** there is no scan-derived reading to state: open with what you
could not read and what the human told you instead, then present the roster you composed **from their
answer** and ratify it the same way. Everything below applies unchanged.

For **single-surface** repos (2a) present the proposed roster (handles · roles · scopes) and confirm —
one focused round. For **multi-surface** repos (2b) the candidate-seating conversation _is_ this round:
once the human has steered you to one seating, treat it as the ratified roster and continue below.

- **Seats:** rename / merge / split / re-scope, or drop a seat that doesn't fit. (e.g. no separate
  engine layer → fold it into spine; or fold two same-stack surfaces into one `app` seat.)
- **Channel:** replace `CHANGE-ME` with the team's channel name — usually the project's short name.
  **It names the team, not one tool:** the same value is the `anthill comms` channel, the bounty
  board's session key, and the tmux session name. Pick it for the team and it is right for all of
  them; pick it for a wire and it goes stale when the wires change.
- **grounding / paths:** set `grounding` to the anchors you actually detected (step 2) — **drop any
  default that doesn't exist** rather than emit a dangling path. (`anthill join` warns when a configured
  grounding doc is missing, so a dangling ref won't stay silent — but don't write one in the first
  place.) Keep the default `paths` unless the project **deliberately** wants its team docs somewhere
  other than `.anthill/` (e.g. a repo that prefers `docs/team/`). And if you _do_ set `paths`, make it
  that deliberate location — **never write a `paths` override that just repeats the `.anthill/` default**
  (a redundant override is noise, and it's exactly what trips `anthill migrate` on a future upgrade).
- **`gate`: ask what this project runs before a commit — and ASK, never assume.** Every seat's land
  runs the gate in front of the commit, so this is the one config field whose wrongness is silent:
  a seat that runs someone else's gate command gets a **green that means nothing**. There is
  deliberately **no default** — anthill supplies the trigger to decide, the project supplies the
  content.
  - **Propose a candidate rather than asking cold** (same ratify-not-reconstruct habit as the roster):
    look where this repo would keep it — a `check`/`verify`/`ci` script in the manifest, a `Makefile`
    target, the command its own agent-grounding docs tell contributors to run — and put the best one
    in front of the human with one clause of why. Name the runner the project actually uses.
  - **The human's answer is the content, including "we don't have one."** Leave `gate` unset if
    nothing exists; the absence is announced loudly at land rather than silently skipped, which is
    the intended behaviour and not a gap to paper over. **Do not invent a plausible command to fill
    the field** — an unset gate tells the truth, a guessed one lies at exactly the moment a seat is
    trusting it.

### 4. Write the config + render the scaffold

- **Write `.anthill/config.json`** — you are the compositor: take the ratified roster and emit the
  finalized config (the §5 schema — `channel`, `lead`, `seats[]`, the ratified `gate`, and any
  non-default `grounding`/`paths`/`launch`). **Stamp `"version": 2`** — the current footprint version; an
  unstamped config reads as the legacy v1 (`.team/` + `docs/team/`) layout. Write it to
  `<repo-root>/.anthill/config.json`.
- **Render:** run **`anthill init`**. It reads the config and deterministically renders `.anthill/`
  (the SOP, `principles.md` — **empty by design**, `retro.md` — **also empty by design, guidance
  only**, `paper-cuts.md`, `seams.md`, the roster `dev/README.md`, one
  `dev/<handle>.md` per seat) and ensures the local-state lines in `.gitignore` (the team's
  `scratch/` and `comms`, both derived from `paths.teamDir`, plus the two repo-root markers
  `.bounty-session` and `.anthill/current-team` — this checkout's bound board and its team pin, both
  local state that would switch someone else's session out from under them if committed).
  It's idempotent — re-running never clobbers existing docs.
  - **That is a file-level guarantee, and it cuts both ways.** An existing doc is **skipped**, so
    re-running is safe — and also **inert**: it will never bring a doc up to date with a newer
    template. Your living docs are yours from this moment on, and refreshing shared guidance later is
    a hand reconcile (`anthill:upgrade` says how). `init` adds missing files; it does not update
    present ones.
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
  - **⚠ SPLIT-FORMATTER REPOS NEED TWO GUARDS — detect, don't assume.** "One `.prettierignore` line
    covers it" only holds when a **single** formatter owns everything. Many repos split by file type:
    e.g. **Biome** for ts/tsx/vue/json/jsonc/css and **Prettier** only for `*.md`. There, the
    `.prettierignore` line shields the markdown living docs but **`.anthill/config.json` is Biome's
    territory** and stays exposed — including to a lint-staged hook on staged `*.json`.
    So: **work out which tool owns JSON in _this_ repo** (is there a `biome.json`? a Biome glob in
    lint-staged?) and shield the config **there too** — for Biome that's `!!**/.anthill` in
    `files.includes`. Ask "which tool owns each extension here?", not "does this repo use Prettier?".
  - **An ignore rule isn't the only correct answer — check first, then act.** A formatter configured
    as a narrow **allowlist** may already exclude `.anthill/` by construction, and adding a redundant
    ignore is noise. Verify per tool rather than guessing: `prettier --file-info <path>` reports
    `{"ignored":true|false}`, and `biome check <path>` says outright when a path "was provided but
    ignored". Confirm **`.anthill/config.json` specifically** — it's the file the single-line
    `.prettierignore` advice misses. _(anthill's own repo is this split shape and is already covered:
    Prettier ignores `.anthill/` explicitly, while Biome's `files.includes` allowlist never reaches
    it.)_
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
and the next step — **"run `anthill:convene` to start a working session."** Optionally **suggest they
commit `.anthill/config.json` + `.anthill/`** (the scaffold is durable; the team's `scratch/` stays
gitignored) — **suggest it; do not do it.** It is their repo and this skill has just asked consent
for a smaller change than its first commit.

**Before you hand over, show them the field notes once.** Run **`anthill field-notes`** and point at
what's in it. `principles.md` ships **empty on purpose** — a team's principles are the ones it earns,
and seeding them with ours hands over conclusions whose scars belong to somebody else. The field
notes are the other half of that: _here is what other teams found, with the evidence; take what
fits._ **Say plainly that it is not a list they are expected to adopt** — and that if one of them
turns out to be wrong for them, `anthill feedback` is how we find out.

## Output

A bootstrapped project: a valid `.anthill/config.json`, a coherent `.anthill/` scaffold, dependencies
confirmed — ready for `anthill:convene`.

## Skill feedback

If this skill was rough — a preflight check that misfired, an archetype that didn't fit, a step unclear
— jot it down and flag the human (or capture it for the first `anthill:finalize-session`). These skills improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

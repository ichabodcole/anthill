# weaver's lane — the one-wire prose surface (C4 + C4-b)

**Owner:** weaver · **Cards:** `t-57a7f8f8` (C4), `t-f26a1e5d` (C4-b) · **Seam:** [C4 in the skeleton](../plan.md), RATIFIED at comms #293, category (4) corrected at `dd75c91`
**Integration position:** step 5. **Depends on step 4 (grapevine removal) being settled** — not on it having landed.
**Scope:** `plugin/skills/`, `plugin/templates/`, `plugin/.claude-plugin/plugin.json`. **Not** `plugin/scripts/` — that is forager's, including the emitted strings this lane's prose points at.

> **Link, don't restate.** The bound, the falsifier and the sizing table live in [`plan.md`'s C4 verdict](../plan.md). This file is the file-level HOW and does not re-derive them.

---

## The one thing an implementer must understand before touching a file

**This is not a deletion pass, and treating it as one is the failure mode.**

Categories (1) and (2) of the bound behave oppositely under removal:

- A **(1) NAMES** site — the word `grapevine` or `vine` — mostly dies with the wire.
- A **(2) ARITY** site — _"the two wires need different verbs AND different anchors"_ — **does not go stale. It becomes an instruction to observe a distinction that no longer exists**, addressed to a seat who will go looking for it. An absence is inert; a stale instruction is active.

So every site gets a **decision**, not a substitution: _does this sentence die, or does its **reason** survive attached to the remaining wire?_ **A sweep that ends in a `sed` is the widening error wearing the enumeration lesson's clothes** — session 8 measured 19 hits in these same files of which 2 were the real defect and 17 were correct routing instructions; a blanket replace would have "fixed" the 17 and buried the 2.

---

## The measured surface

Run with `/usr/bin/grep`, **not** the shell's `grep` — that is ugrep, where `(^|[^a-z])x` returns zero matches and exit 1, a silently manufactured absence.

```
/usr/bin/grep -RIni 'grapevine' plugin/skills plugin/templates plugin/.claude-plugin   ->  37
/usr/bin/grep -RInE '\bvine\b'  plugin/skills plugin/templates plugin/.claude-plugin   ->  59
```

| file                                | grapevine | `\bvine\b` | arity | comms |
| ----------------------------------- | --------- | ---------- | ----- | ----- |
| `skills/join/SKILL.md`              | 11        | 24         | 2     | 17    |
| `skills/convene/SKILL.md`           | 9         | 7          | 0     | 9     |
| `skills/finalize-session/SKILL.md`  | 1         | 11         | 0     | 5     |
| `skills/comms/SKILL.md`             | 4         | 2          | 0     | 14    |
| `skills/plan/SKILL.md`              | 0         | 4          | 0     | 0     |
| `skills/plan/methodology.md`        | 0         | 5          | 0     | 0     |
| `skills/bootstrap/SKILL.md`         | 3         | 0          | 0     | 0     |
| `skills/upgrade/SKILL.md`           | 1         | 0          | 0     | 0     |
| `templates/docs-team/README.md`     | 4         | 6          | 1     | 4     |
| `templates/docs-team/dev/README.md` | 2         | 0          | 0     | 1     |
| `templates/docs-team/paper-cuts.md` | 1         | 0          | 0     | 0     |
| `.claude-plugin/plugin.json`        | 1         | 0          | 0     | 0     |

**Read the last column, not the first.** A `comms 0` row is a file that teaches a single-wire model; those are the (4) sites and they are where the real work is.

---

## Tasks

Each task is one land. **Announce the file on comms before editing, land promptly, release** — `plan.md` and any file a peer may hold. Verification for every task is the same triple and is not restated per task: **(a)** `bunx prettier <file>` at a **destination path** — never inside `.anthill/`, where `.prettierignore:19` makes the check void — diffed to zero, **with a positive control** proving the instrument reports a deliberate malformation; **(b)** every added line read individually before commit, to confirm no peer's uncommitted work is in the pathspec; **(c)** `bun run check` and the emitted land string verbatim, reading `uncheckedAgainst` rather than the exit code.

### T1 — `skills/plan/` : the pure single-wire model (2 files, 9 alias hits, comms 0)

The highest-value target and the least obvious: `grapevine 0 · comms 0` makes it invisible to both token sweeps, and it drives a whole plan phase.

Sites, exact: `plan/methodology.md:85,157,160,164,189` · `plan/SKILL.md:41,69,108,115`.

Each is a **routing instruction** (_"post the skeleton on the vine"_, _"owners ratify/falsify over the vine"_, _"vine = substance, board = state"_), so the reason survives and the wire changes. **`SKILL.md:115`'s triple — `vine = substance, board = state, file-scoped atomic land` — is a definition, not a mention**: it teaches the division of labour between wires and must be re-derived for a two-wire world (comms + board), not string-replaced.

**Ordering:** `methodology.md` is the single source and `SKILL.md` points at it. Fix `methodology.md` first; then check whether `SKILL.md`'s copy should shrink rather than change — _has the single source started saying this better than the pointer does?_

### T2 — `templates/docs-team/` : rendered once per team, never refreshed

**Highest stakes in the lane.** `anthill init` renders these into a consuming repo once; nothing ever updates them. A wrong sentence here is permanent for that team.

- `README.md:97` — _"**You are wired to both wires**; `anthill join <handle>` emits the exact command for each."_ This is the lane's cleanest **(2) ARITY** site: it names no wire at all, so it survives every token sweep, and after removal it instructs a seat to look for a second wire that does not exist.
- `README.md` — 4 grapevine + 6 alias hits, plus the SOP's Tools section.
- `dev/README.md` (2/0) and `paper-cuts.md` (1/0) — both `comms 0`.

**Also carried here, and deliberately NOT written yet** (see _Held_ below): the `uncheckedAgainst` sentence defines only the gate-validity reading and omits the collision reading; and nothing warns that `.anthill/**/*.md` is covered by no formatter and no linter.

### T3 — `skills/bootstrap/SKILL.md` : what a NEW project is told it has

`grapevine 3 · comms 0`. A team bootstrapped today is told its coordination is the vine. **This is the (4) category at its most consequential** — not a stale sentence in a doc we read, but the founding description handed to a stranger.

Includes the `config.channel` framing: bootstrap tells the human the field _is_ "the team's grapevine channel name", while it has **four** consumers (comms channel, tmux session name, bounty `--session-key`, and today's grapevine channel). **After removal the name is wrong in a way that outlives grapevine** — so the fix is to describe the field by what it keys, not by which wire it happened to name.

### T4 — `skills/join/SKILL.md` : the largest surface AND the arming half (C4-b)

`grapevine 11 · alias 24 · arity 2` — the biggest single file, and the only one that both **describes** and **arms**.

- **Arity:** `:86` (_"There is a third wire — `comms`"_) and `:94` (_"The other two wires need one"_). Both are counts; both break.
- **C4-b, the arming half:** the manifest instructs the joining seat to open a grapevine tail unconditionally. **The prose half is mine; the emitted half is forager's** — my text must not describe wires the manifest no longer emits, and must not re-derive the commands. _Run the command the CLI printed_ stays the instruction.
- **The session-level gap that outlives grapevine:** a rendered manifest hard-codes a wire model into every consuming project and **a session-level decision has nowhere to live** — measured at n=4 in one session, forager included. Removing grapevine deletes this instance and leaves the mechanism. **Carry the mechanism into the prose; do not let it leave with the instance.**

### T5 — `skills/convene/` + `finalize-session/` : the lifecycle pair

`convene` 9/7 with comms 9 — already two-wire, so this is reconciliation rather than rewrite; it opens grapevine unconditionally today (forager's step 4) and its prose must match whatever replaces that.
`finalize-session` 1/11 — alias-dominant, mostly routing instructions.

### T6 — frontmatter + `plugin.json` : behavioural, not decorative

`skills/join/SKILL.md:3` and `skills/convene/SKILL.md:3` `description:` fields name the grapevine, and `.claude-plugin/plugin.json:4` says _"coordination over grapevine + bounty"_. **Frontmatter gates skill _selection_** — an agent chooses a skill from these strings — so a stale description changes which skill fires, not merely what a reader believes. Smallest diff in the lane, largest blast radius per character.

---

## Verification for the lane as a whole

Beyond the per-task triple: **a cold read of the migration against a `git archive` surface** (the skeleton's gate item 4).

**Build the surface from what you put IN, never from what you take OUT.** `git archive HEAD -- <the artifact>` yields exactly the files named and the whole surface can be listed to confirm it. A deny-list cannot be completed: removing `.anthill/dev/` still left 15 tracked files carrying the team's framing, **and you cannot exclude the artifact you are asking someone to audit.**

**Ask the reader to ENACT, not to proofread.** _"Act on this and tell me where you would do the wrong thing"_ has found defects here that _"read this"_ did not — including a cross-file contradiction where each file was individually correct.

---

## Held deliberately, and why this is not procrastination

**No shipped file is edited until step 4 is settled.** Session 8 measured six instances of prose asserting things about a still-moving tool — **three of them introduced by seats fixing other false prose.** Three debts are carded and unwritten for exactly this reason: the `uncheckedAgainst` under-specification, the `--mine`-includes-unowned note, and the `.anthill/`-is-unchecked note. All three describe tools that are moving this session.

**The lead may rule any of the three a paper-cut worth landing early. That is his call, and the risk is stated once here rather than restated per task.**

## Self-review against the ratified seams

- **C1** (`none` requires a positive departure record; state set stays `present | unknown | none`, diagnostics ride as total fields) — this lane consumes it only where prose describes teardown. **No prose in my scope currently names the state set**, so nothing to reconcile; if `status`'s rendered strings change, `team-status.ts` is forager's file and the string is carded to me (`t-76a5eba5`).
- **C2** (session addressability) — consumed only if catch-up prose must teach a session-scoped anchor. **Blocked on the addressable unit; no prose written against it.**
- **C4 / C4-b** — mine, ratified, corrected at `dd75c91`.

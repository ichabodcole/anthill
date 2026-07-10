# Board Session Binding — Implementation Plan

**Created:** 2026-07-09
**Related Proposal:** [proposal.md](./proposal.md)
**Status:** Draft

---

## Overview

Wire anthill onto spellbook 1.16.0's caller-owned bounty session key (#69) so every seat command
targets the team's board by construction — fixing the silent cross-board hijack (#23/#19). The key is
`config.channel`; binding is **belt-and-suspenders**: `convene` opens the board keyed **and** pinned
(writes `.bounty-session`, the ambient floor for the lead / hand-started panes / dispatched
subagents), while `spawn` exports `BOUNTY_SESSION_KEY=<channel>` into each pane (covers spawned seats'
improvised verbs). No code threads `--session` onto individual verbs — we bind the _environment_ and
the _directory_, so ambient resolution does the rest.

The change is small and mechanical because spellbook did the hard part. The work is: an extra `open`
in convene, an env-prefix on the spawn launch line, a gitignore line, one command-string reword, doc
fixes, and tests around three small pure seams.

## Outcome & Success Criteria

**Definition of Done:**

- [ ] `anthill convene` opens/attaches the team board via `bounty open --session-key <channel> --pin
  --no-open` (idempotent; writes `.bounty-session` at repo root) and reports its counts.
- [ ] `anthill spawn` launches each seat with `BOUNTY_SESSION_KEY=<channel>` in its pane environment.
- [ ] With **two** boards live, a seat's _improvised_ `bounty update <id> --status doing` targets the
      **team's** board — no flag, no `latest` fallback, no `noop:true`.
- [ ] The **lead's** verbs and a **seat-dispatched subagent's** verbs resolve the team board via
      `.bounty-session` (no env of their own).
- [ ] `anthill init` gitignores `.bounty-session`.
- [ ] The `anthill join` command's emitted checklist uses `bounty update <id> --status <col>` (not
      "move"); the stale join-skill `--last <n>` note is corrected.
- [ ] `bun run check` green; new unit tests cover the three pure seams.
- [ ] anthill #23 and #19 closed.

**Non-Goals:**

- Threading `--session-key` onto every historically-emitted command string (ambient binding covers it).
- Adopting `grapevine tail --last <n>` into the join flow beyond the doc-note fix.
- A board `--fresh` analog for convene (future).

## Approach Summary

Three tiny pure helpers become the TDD targets, keeping the side-effectful command bodies thin:

1. `bountyOpenArgs(channel)` → the `open` argv (convene).
2. `buildSeatLaunch(launch, handle, sessionKey)` → the env-prefixed pane launch line (spawn).
3. Reuse existing `planGitignore` for the new `.bounty-session` line (init).

Everything else is wiring those into `team-convene.ts`, `team-spawn.ts`, `team-init.ts`, plus a
string reword in `team-join.ts` and doc edits. Board _reads_ (`readBoardCounts` → `bounty state`) need
**no** change: once convene has pinned `.bounty-session`, the un-flagged `state` call resolves the team
board by walk-up (precedence step 5). The only ordering rule: convene must `open --pin` **before** it
reads counts (it already opens-then-reads).

## Phases

### Phase 1: convene owns the keyed, pinned board-open

**Goal:** `anthill convene` stops merely _reporting_ the board and instead opens/attaches it under the
team key, writing `.bounty-session`.

**Key Changes:**

- Add pure `bountyOpenArgs(channel: string): string[]` (in `team-convene.ts` or `team-support.ts`)
  returning `["open", "--session-key", channel, "--pin", "--no-open"]`. `--no-open` keeps convene
  headless-safe (no browser auto-launch); the human opens the URL when they want.
- In `team-convene.ts` `run()`: resolve `bountyCli` and `execCoord(bountyCli, bountyOpenArgs(channel))`
  **before** `readBoardCounts()`. Surface failure as a warning (mirror the grapevine-open handling),
  and add a `boardOpened` flag to the emitted data + text render.
- Update the now-stale comment in `team-support.ts:72` (`bounty state` "reads latest") to note it
  resolves the pinned board via `.bounty-session` once convene has run.

**Validation:**

- [ ] New test: `bountyOpenArgs("anthill")` equals `["open","--session-key","anthill","--pin","--no-open"]`.
- [ ] `bun run check` green.
- [ ] Manual: `anthill convene` in the repo creates `.bounty-session`; a second convene re-attaches
      (idempotent, no new stranger board).

**Dependencies:** spellbook ≥ 1.16.0 installed (it is — 1.16.0 is the highest cached, which
`resolveCoordCli` picks).

---

### Phase 2: spawn exports the key into each pane

**Goal:** every spawned seat inherits `BOUNTY_SESSION_KEY=<channel>`, so its improvised bounty verbs
bind the team board.

**Key Changes:**

- Add pure `buildSeatLaunch(launch: string, handle: string, sessionKey: string): string` (in
  `team-spawn.ts`) → `` `BOUNTY_SESSION_KEY=${shellSafe(sessionKey)} ` + launch.replace(/\{handle\}/g, handle)``.
  The env-assignment prefix works because `launchInPane` types the line into the pane's shell
  (`send-keys`), and it sets the var for the launched `claude` (whose Bash-tool subshells inherit it).
- Guard the key value: `config.channel` is interpolated into a shell line, so validate/quote it (a
  charset like `[A-Za-z0-9._-]`, matching the existing `SAFE_HANDLE` discipline in
  `resolveSpawnHandles`) — a malformed channel is a hard error, never an injection vector.
- Replace the inline `config.launch.replace(...)` at `team-spawn.ts:192` with `buildSeatLaunch(...)`.

**Validation:**

- [ ] New test: `buildSeatLaunch('claude "/anthill:join {handle}"', "engine", "anthill")` ===
      `BOUNTY_SESSION_KEY=anthill claude "/anthill:join engine"`.
- [ ] New test: a channel with an unsafe char is rejected (hard error).
- [ ] `bun run check` green.

**Dependencies:** none beyond Phase 1's understanding.

---

### Phase 3: init gitignores `.bounty-session`

**Goal:** the pinned marker never gets committed.

**Key Changes:**

- Add `export const BOUNTY_SESSION_GITIGNORE_LINE = ".bounty-session";` in `team-init.ts`.
- In `run()` (around `team-init.ts:202-205`), ensure **both** lines: call `planGitignore` for the
  scratch line, then again for the bounty line against the resulting content (chain the `content`).
  Report both in the emitted gitignore status.

**Validation:**

- [ ] Extend `team-init.test.ts`: `planGitignore(existing, BOUNTY_SESSION_GITIGNORE_LINE)` adds it when
      absent, is idempotent when present.
- [ ] `bun run check` green.

**Dependencies:** none.

---

### Phase 4: join reword, doc fixes, version floor

**Goal:** kill the last "move" footgun in emitted output, refresh stale docs, declare the floor.

**Key Changes:**

- `team-join.ts:110`: reword the emitted checklist line from `"...move it todo→doing when you start,
→review when green."` to reference the real verb, e.g. `"Own your card lifecycle: bounty update
<id> --status doing when you start, --status review when green."` (match the skill's already-shipped
  wording; no `move` verb).
- `plugin/skills/join/SKILL.md`: correct the backfill note — `grapevine tail --last <n>` now exists
  (spellbook#68), so drop "no bounded last-N catch-up yet" and name `--last <n>` as the cold-joiner
  path (keep `--from-start` as the session default).
- `plugin/skills/convene/SKILL.md` + `.anthill/README.md` (SOP): note the board is **key-bound** —
  convene owns board-open; seats/lead never pass `--session`; the binding is ambient.
- Declare the **spellbook ≥ 1.16.0** floor where anthill states its dependency (check
  `AGENTS.md` / the plugin marketplace manifest / `coord.ts` header) and add a line.

**Validation:**

- [ ] `bun run check` green (docs are prettier-formatted at pre-commit).
- [ ] Grep confirms no emitted anthill output still says `move it todo→doing`.

**Dependencies:** none.

---

### Phase 5: prove it end-to-end, then close the issues

**Goal:** demonstrate the hijack is actually gone before claiming the fix.

**Key Changes:** none (verification).

**Validation:**

- [ ] **Two-board test:** open a _second_, unrelated bounty board so it's the `latest` pointer. Then in
      the anthill repo run `anthill convene`, and from a spawned seat pane run an improvised
      `bounty update <id> --status doing` — assert it lands on the **team** board (not `noop:true`,
      not the stranger).
- [ ] **Lead + subagent:** from the lead's own shell (no `BOUNTY_SESSION_KEY`) run `bounty state`;
      confirm it resolves the team board via `.bounty-session`. Dispatch a subagent that runs a bounty
      verb; confirm same.
- [ ] Close anthill #23 and #19 with a pointer to the shipped commit(s).

**Dependencies:** Phases 1–4 complete.

## Key Risks & Mitigations

- **Shell injection via `config.channel`** → charset guard in `buildSeatLaunch` (Phase 2), same
  discipline as `SAFE_HANDLE`.
- **convene auto-launches a browser in a headless run** → `--no-open` on the keyed open; report the URL.
- **Board read resolves the wrong board before `.bounty-session` exists** → convene opens (`--pin`)
  before `readBoardCounts`; ordering already holds.
- **Env doesn't reach some process** → `.bounty-session` walk-up floor (the belt-and-suspenders whole
  point); verified in Phase 5's lead/subagent check.
- **`.bounty-session` accidentally committed** → gitignored in Phase 3.

## Testing & Validation Strategy

- **Unit (pure seams):** `bountyOpenArgs`, `buildSeatLaunch` (+ its unsafe-channel rejection), and the
  `planGitignore` reuse for the bounty line. These mirror the existing pure-helper tests
  (`resolveSpawnHandles`, `planGitignore`).
- **No new tests for the side-effectful command bodies** beyond asserting they call the pure helpers —
  the argv/launch-line composition is where correctness lives.
- **Manual/integration (Phase 5):** the two-board hijack scenario is the real proof and can't be a unit
  test (it needs live daemons); run it once by hand and record the result in the session doc.

## Assumptions & Constraints

**Assumptions:**

- spellbook ≥ 1.16.0 is installed (the version anthill's `resolveCoordCli` resolves to).
- `config.channel` is (or is guarded to be) shell-safe.

**Constraints:**

- anthill is distributed; consumers on spellbook < 1.16.0 break. Cole updates his teams; the floor is
  documented for any external consumer.

## Open Questions

- **`--no-open` on convene's board-open** — confirmed lean (headless-safe, report URL). Any reason
  convene _should_ auto-open the browser? (Believed no — the human opens when ready, as today.)
- **Where anthill declares the spellbook floor** — AGENTS.md, a plugin manifest, or a runtime check in
  `coord.ts`? Pick the one that's actually load-bearing (resolve during Phase 4).
- **Should `readBoardCounts` pass the key explicitly** for extra robustness, or is ambient
  `.bounty-session` resolution sufficient? (Leaning: ambient — simpler, and it's the design.)

---

**Related Documents:**

- [Proposal](./proposal.md)
- Closes: anthill [#23](https://github.com/ichabodcole/anthill/issues/23),
  [#19](https://github.com/ichabodcole/anthill/issues/19)
- Upstream: [spellbook#69](https://github.com/ichabodcole/spellbook/issues/69) (session key),
  [spellbook#68](https://github.com/ichabodcole/spellbook/issues/68) (`--last <n>`)
- Touch points: `plugin/scripts/anthill/commands/{team-convene,team-spawn,team-join,team-init,team-support}.ts`

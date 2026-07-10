# Board session binding — bind every seat to the team's bounty board by construction

**Status:** Draft
**Created:** 2026-07-09
**Author:** Cole + forager

---

## Overview

When more than one bounty board is live on a machine, anthill's seats today resolve board commands
through bounty's global "latest board" pointer — so a seat can silently read or write a **stranger's
board** (anthill [#23](https://github.com/ichabodcole/anthill/issues/23) /
[#19](https://github.com/ichabodcole/anthill/issues/19); it froze live dogfood sessions). spellbook
**1.16.0** shipped the fix we requested ([spellbook#69](https://github.com/ichabodcole/spellbook/issues/69)):
a **caller-owned session key** that derives a stable, project-scoped board id. This proposal wires
anthill onto it so that **every seat command — including ones the agent improvises — targets the
team's board by construction, with the agent never having to think about it.**

## Problem Statement

Bounty verbs without a target resolve `bounty-latest.json` — the most-recently-opened board on the
machine. With two live boards, an unpinned verb hits whichever opened last. The failure is silent
(`noop:true` the only tell) and it hits exactly the improvised commands a seat runs naturally
(`bounty list`, `update <id> --status …`, `--mine`), not just the ones anthill pre-emits. Two anthill
seams inherit this:

- `anthill join` emits an **unpinned** board tail (`team-join.ts:103`: `bounty tail --mine --as <h>`).
- `anthill convene` can't own board-open at all (`team-convene.ts`): bounty's old `open` wasn't
  idempotent, so convene only _reports_ the board.

## Proposed Solution

Adopt spellbook 1.16.0's session key, keyed on **`config.channel`** (the team's unique handle). The
derived board id is `(channel, repo-root)`-scoped, so the same team in one repo always resolves the
same board, and two repos never collide.

**Belt-and-suspenders binding** — two mechanisms so every kind of process is covered, and the agent
experience is "it just works, invisibly":

1. **`convene` owns board-open, pinned:** `bounty open --session-key <channel> --pin`. Keyed open is
   now idempotent (re-attaches, never hijacks), so convene can finally _own_ it — and `--pin` writes
   `.bounty-session` at the repo root.
2. **`spawn` exports the key into each pane:** `BOUNTY_SESSION_KEY=<channel>` so every verb a spawned
   seat runs (pre-emitted _or_ improvised) resolves the team board with no `--session` threading.

Why both, in agent-experience terms:

- The **env var** makes it invisible for spawned seats — the agent types `bounty …` naturally and
  hits the right board, including commands it composes in the moment.
- The **`.bounty-session` file** is the ambient floor that catches every case the env misses: the
  **lead** (not spawned by anthill, so it has no exported env), a pane started by hand, and
  **subagents a seat dispatches** — all resolve by walking up from cwd, which they're always inside.

Net: no seat (or lead, or subagent) ever falls back to `latest`, and no agent ever has to remember a
flag. The explicit-`--session-key`-on-every-command alternative was rejected precisely because it
pushes correctness onto the agent for every improvised verb — the opposite of a good experience.

**Fold in while here** (same seams):

- Reword the `anthill join` command's emitted checklist line `team-join.ts:110` (`"move it
todo→doing"`) to the real verb `bounty update <id> --status doing` — the command-side twin of the
  already-shipped skill fix (#20). A seat copying that line literally hits command-not-found today.
- Correct the now-stale join-skill backfill note (`"no bounded last-N catch-up yet"`) — spellbook
  1.16.0 shipped `grapevine tail --last <n>` ([spellbook#68](https://github.com/ichabodcole/spellbook/issues/68)).

## Scope

**In Scope (MVP):**

- `convene` opens the board with `--session-key <channel> --pin` (owns board-open; idempotent).
- `spawn` exports `BOUNTY_SESSION_KEY=<channel>` into each seat pane.
- `anthill init` gitignores `.bounty-session` (like `.anthill/scratch/`).
- The `team-join.ts:110` "move" → `update --status` reword; the stale `--last <n>` doc note fix.
- Tests for key derivation/precedence at the anthill boundary (mirroring existing command tests).
- Docs: convene/join skill + SOP note that the board is key-bound; the spellbook ≥ 1.16.0 floor.

**Out of Scope:**

- Adopting `grapevine tail --last <n>` into the join flow beyond fixing the doc note (a separate,
  optional ergonomic).
- Per-seat model selection (unrelated proposal).
- Backfilling `--session-key` onto every historically-emitted command string where the ambient
  binding already covers it — we bind the environment, not each call.

**Future Considerations:**

- Should `convene` offer a board `--fresh` (snapshot+clear) analog, mirroring the grapevine `--fresh`
  we added? Probably yes, but out of this MVP.
- A `.bounty-session`-only mode for consumers who dislike env plumbing (the honest single-mechanism
  runner-up).

## Technical Approach

- **Key = `config.channel`.** Passed as `--session-key` to convene's open and exported as
  `BOUNTY_SESSION_KEY` by spawn. Bounty derives `k-<slug>-<hash(repo-root)>` deterministically.
- **`convene` (`team-convene.ts`):** replace "report only" with an idempotent `open --session-key
<channel> --pin`, then report counts as before. (Keyed open re-attaches to a running board, so
  re-convening is safe.)
- **`spawn` (`team-spawn.ts`):** inject the env per pane — simplest is prefixing the launched command
  with `BOUNTY_SESSION_KEY=<channel> ` (works regardless of `config.launch`'s content), with tmux
  `set-environment` as the alternative. Final mechanism decided in the plan.
- **`join` (`team-join.ts`):** the emitted board tail can stay flag-free — it now resolves via env /
  `.bounty-session`. Apply the `:110` reword.
- **`status` (`team-status.ts`):** already resolves board state; with the binding in place it targets
  the team board ambiently — confirm, no explicit flag needed.
- **Version floor:** requires spellbook ≥ 1.16.0. Cole updates his teams; document the floor for any
  external consumer.
- **Key dependencies:** spellbook 1.16.0 (`--session-key`, `--pin`, `$BOUNTY_SESSION_KEY`,
  `.bounty-session`), the existing `coord.ts` CLI resolution, `team-convene`/`spawn`/`join`.

## Impact & Risks

**Benefits:** eliminates the silent wrong-board write class (#23/#19) for every process — seat, lead,
improvised verb, dispatched subagent — with zero agent cognition; and `convene` finally owns
idempotent board-open, closing a long-standing awkwardness in one stroke.

**Risks:**

- _Env doesn't reach a process_ → covered by the `.bounty-session` floor (the whole point of
  belt-and-suspenders).
- _`.bounty-session` committed by accident_ → gitignore it in `anthill init`; it's session/local state.
- _Stale `.bounty-session` across sessions_ → **not a hazard here**: the id is derived deterministically
  from `(channel, repo)`, so the file always contains the right id for this team; a re-convene
  idempotently re-attaches.
- _Consumer on spellbook < 1.16.0_ → hard version floor; Cole controls his teams, documented otherwise.

**Complexity:** **Low–Medium** — a keyed open, a pane env export, a gitignore line, two doc-string
fixes, and tests. The design work is done; the spellbook side did the hard part.

## Open Questions

- **Env injection mechanism** — per-pane command prefix vs. tmux `set-environment`? (Leaning: prefix,
  for independence from `config.launch`.)
- **Does the lead need anything explicit**, or is `.bounty-session` (written by convene's `--pin`)
  sufficient for the lead's own verbs? (Believed sufficient — the lead runs from the repo root.)
- **Should convene also key the board open behind a config flag** for teams that deliberately want an
  unkeyed/ambient board? (Probably not worth the option.)

## Success Criteria

- With two boards live, a seat's improvised `bounty update <id> --status doing` targets the **team's**
  board — no `--session` flag, no `latest` fallback, no `noop:true`.
- The **lead's** verbs and a **seat-dispatched subagent's** verbs both resolve the team board via
  `.bounty-session`, with no env of their own.
- Re-convening the same team in the same repo re-attaches to the same board (idempotent), never spawns
  a stranger.
- A seat copying the `anthill join` checklist verbatim changes a card's column successfully.

---

**Related Documents:**

- Closes: anthill [#23](https://github.com/ichabodcole/anthill/issues/23),
  [#19](https://github.com/ichabodcole/anthill/issues/19)
- Upstream fixes consumed: [spellbook#69](https://github.com/ichabodcole/spellbook/issues/69) (session key),
  [spellbook#68](https://github.com/ichabodcole/spellbook/issues/68) (`--last <n>`, for the doc fix)
- Touch points: `plugin/scripts/anthill/commands/team-convene.ts`, `team-spawn.ts`, `team-join.ts`,
  `team-status.ts`; `plugin/scripts/anthill/coord.ts`

---
name: join
description: Join the project's agent team as a specific seat. Run by a seat agent at session start to re-ground in its role and get on the team's coordination channels. Use when the human says "join the team as <handle>", "take the <X> seat", "join as <handle>", or otherwise tells the agent which seat to take. The agent adopts the named handle, reads its own living doc, mints its session scratch, and joins the grapevine + bounty. Requires a `.anthill/config.json`.
---

# anthill: Join (take a seat)

Adopt a seat on the project's **agent team** and re-ground in it. Run this at session start when the
human tells you which seat to take (your **handle** — one of the seats in `.anthill/config.json`). This is
how a fresh session inherits the seat's lineage: its hard-won understanding lives in its living doc.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH — run the full `bun "${CLAUDE_PLUGIN_ROOT}/…"` form).
> (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin skill runs.)

## Steps

1. **Identify your handle** — from the invocation ("join as `<handle>`"). If it wasn't given, ask which
   seat. It must be one of the seats in `.anthill/config.json` (`anthill join <handle>` errors with the
   valid list if not).
   - Your anthill **seat handle** and any **external identity** you carry (an agent-bridge name, a
     runtime label, etc.) are **separate namespaces** — they need not match. If you're `mosaic` here
     and `Gandalf` on a bridge, that's fine; this seat handle is who you are _on this team_.

2. **Re-ground in your seat (the heart of this).** Read, in order (paths from `.anthill/config.json`):
   - the **`grounding`** docs (the _product_ context) — your seat doc assumes you know it;
   - `.anthill/README.md` — the **SOP** (how the team works, the rituals, commit discipline);
   - `.anthill/dev/seams.md` — the shared inter-seat **contracts**. You **defer** to these; you never
     restate them in your own doc;
   - `.anthill/dev/<handle>.md` — **your own living doc**: scope, boundaries, relationships, reflexes,
     anti-patterns, hard-won lessons. This is _you_. Internalize it before you touch code.

   Running **`anthill join <handle>`** prints this grounding manifest (the exact files, in order) plus
   your tail commands and an action checklist — use it as your source of truth; don't restate it.
   - **Grounding is read-only-first _by design_** — **this step (2) and nothing after it**: the
     grounding reads are pure reads, at known paths, so a seat can re-ground from the docs alone even
     under a Bash-permission outage or a locked-down sandbox. The guarantee is that _the reads are
     read-only_ — **not** that join works without Bash: `anthill join` is itself a Bash call, and
     steps 3–5 mint scratch, claim a card, and register presence, all writes. Don't reach for a write
     until you're grounded; the read-only spine is what makes re-grounding robust.

3. **Get on the wires.** From the `anthill join <handle>` output, run the resolved **grapevine tail**
   and **board tail** commands — each wrapped with the **Monitor** tool (filter keepalives as the
   checklist shows), so you wake on team messages and register presence as your handle. **`anthill
status`** shows who's on + the board.
   - **Were you dispatched as a subagent** (not a terminal seat)? A one-shot subagent can't hold a
     Monitor tail — **skip the tail wiring**. The lead drives you directly (dispatch → result) and
     relays the vine. The tail wiring above is the **terminal-seat path**.
   - **Joining mid-session? Backfill the vine history first.** A live tail only shows messages from
     _now_ forward. To inherit the session's context, replay it with
     **`grapevine pull <channel>`** — finite, it prints the history and **exits**. Because the lead
     clears the channel at convene (`--fresh`), that history is **this session**, not an archive of
     past ones, so it's usually the right catch-up. Anchor at a known message id with `--since <id>`
     on a long-running channel, then fill gaps selectively with
     **`grapevine read <channel> <id>`** — note it takes the **channel _and_ the id**, and does not
     take `--as`. A bare `grapevine read <id>` exits non-zero with a usage line. A seat who mis-called
     it once read the non-zero exit as "this command is broken", fell back to `pull --since | head -c`
     for an entire session, and reported the tool as defective — with the correct usage sitting in his
     own scrollback. **A usage error and a broken tool look identical if you don't read the output.**
     - **`read <channel> <id>` is the only way to fetch exactly one message**, and that matters more
       than gap-filling: it is not a narrower range, it is _not a range_. Any `--since` window runs to
       _now_, so on a channel peers are actively writing to it will eventually contain a peer's
       message. When you need one specific message and nothing else, no choice of `--since` gets you
       there.
     - **NEVER use `tail` to catch up — use it only for the live Monitor.** `grapevine tail
--from-start | grep …` looks like the obvious backfill and is **broken by construction**:
       `grep` block-buffers so a finite backfill never flushes, and a live `tail` holds the pipe
       open forever so it never exits. You get **zero output and then a timeout** — and the natural
       reading of that is "the channel is empty", so you'd join contextless and never know what you
       missed. Three seats hit this independently in one session before it was diagnosed
       ([#54](https://github.com/ichabodcole/anthill/issues/54)). `pull` for catch-up, `tail` for live.

4. **Mint your session scratch.** Create your running-capture file:
   **`.anthill/scratch/<handle>/<YYYY-MM-DD>-<slug>.md`** (it's gitignored — `anthill init` added the
   line). This is where you drop cheap notes as you work ("this just bit me", "this seam is fuzzy") —
   the raw material you'll synthesize at finalize. Start it now so capture is frictionless later.
   - **Scratch is gitignored — it does NOT survive the session.** Everything you learn lives in an
     untracked file until you synthesize it, so an abrupt session-end evaporates the whole trail —
     precisely the loss anthill exists to prevent. Synthesize into your seat doc at finalize, **or
     earlier, whenever the reasoning is warm**. Earlier is not jumping the gun; it's insurance.
   - **`.anthill/scratch/` is the right home for _throwaway artifacts_** — verify mints, screenshots,
     seeds, any harness output. It is **gitignored, and excluded from the typecheck/lint target set**,
     so a stray artifact dropped there never trips the shared tree and blocks another seat's land.
     Don't scatter throwaways at the repo root or under `plugin/`, where the gate _will_ scan them.
     - **⚠ That protection holds for files the gate _scans_. It does not hold for files a tool
       _discovers on its own_.** Config files are the exception and you must treat them as one: a
       `biome.json` (or `tsconfig.json`, `.eslintrc`, `vitest.config.ts` …) dropped in scratch is
       still found, because formatters and type-checkers walk the filesystem for nested configs and
       **never consult gitignore for discovery**. A seat did exactly this and **took the gate down for
       the whole team** — from a directory the docs had called safe. Put throwaway _configs_ outside
       the repo entirely.

5. **Signal ready** on the vine (a short "in, grounded, here's my lane") and **claim your bounty card**
   — advance it to `doing` when you actually start with **`bounty update <id> --status doing`** (the
   bounty CLI has **no `move` verb** — `update <id> --status <col>` is how you change columns) — or
   await assignment from the lead.
   - **Re-read the board immediately before you claim.** Resolve your card id from a **fresh**
     `bounty state --mine --as <handle>` (the exact command is in your `anthill join` output), not
     from a board listing already sitting in your context. A lead who batch-added cards after your
     listing was printed has renumbered the board under you, and the failure mode is claiming the
     wrong card by _title-adjacency_ — it looks right, so nothing catches it.
   - **Ratify your seams, then author your lane (the plan-phase gate).** If the lead posted a plan
     **skeleton**, then _before_ you advance a card to `doing`: (1) **ratify or falsify each cross-seam
     contract your lane touches** — an explicit vine acknowledgement (_"ratified"_ / _"falsified —
     here's the correction"_), never silence; you hold your domain's reflexes, so catching a wrong
     seam now is the whole point. (2) **Author your own lane** — `plan/<seat>.md`, the file-level HOW
     for your slice, against the _ratified_ seams (grounded paths, right-sized TDD tasks, no
     placeholders — the craft is in `anthill:plan`'s `methodology.md`). Nothing to ratify (solo lane,
     no shared seam)? Proceed.
     - **Joined mid-plan-phase?** You weren't there for the lead's convene brief, which is where the
       ratify gate normally gets explained — the discipline lives in those vine messages, not in your
       grounding manifest, so a joiner can miss it entirely. If a plan skeleton exists, **read its
       "How this plan is authored" section** before you move a card; that's the gate's source of
       truth. Don't infer from a self-contained assignment message that there is no gate.

6. **Work** your lane per the SOP + your seat doc. As you go, **capture ah-ha judgments to your
   scratch** (the reasoning + the generalizable lesson — not lesson-less events) for synthesis at
   finalize. Route questions + decisions to the lead on the vine, not direct to the human — the lead
   is the routing **default**, not proof the human isn't watching. **Blocked on a human? Say so on the
   vine** — waiting silently looks exactly like working.
   - **Dispatching a subagent is available to you — it just never occurs to seats.** A survey of two
     implementation-heavy seats after a 16-slice build found **zero** dispatches, and neither seat had
     _considered_ them: serial lanes, small per-step verdicts, and a peer verifier already acting as a
     second pair of eyes made the option invisible rather than declined. This is an **option, not a
     mandate** — but it should be a choice you actually make.
   - **The one pattern both seats independently arrived at: a cold audit before you post a cut you
     own.** Before publishing a classification, an enumeration, or a judgement that others will build
     on, dispatch a **blank-context** subagent to re-derive it adversarially — _"here's the input and
     the question; find what I missed."_ **Your framing is the blind spot, and fresh context is the
     antidote.** A real 5-item under-enumeration in that session would have been caught pre-post.

## Join checklist (the beats that get skipped)

- ◻ **Grounded** in your seat (grounding docs → SOP → seams → your seat doc). A doc flagged
  **⚠ unfilled template** in your join output is _not_ evidence the project lacks that content —
  it means nobody wrote it yet. Say so to the lead rather than inferring from it.
- ◻ **Caught up** if you joined mid-session — `grapevine pull <channel>` (finite). **Never**
  `tail --from-start | grep` for backfill: it returns nothing and then times out, which reads as
  "empty channel". For **one specific message**, use `grapevine read <channel> <id>` — channel _and_
  id, no `--as`; a bare `read <id>` exits non-zero with a usage line that is easy to misread as a
  broken tool.
- ◻ **On the vine** — grapevine tail wrapped in Monitor, presence registered (terminal-seat path).
- ◻ **On the board** — board tail wrapped in Monitor. Use the filter **verbatim from your join
  output**: it needs `grep -E` (plain `grep` treats `(a|b)` as a literal, so the Monitor stays
  silently empty) and `--line-buffered` (or frames are held back until a block fills).
- ◻ **Introduced** on the vine — a short "in, grounded, here's my lane".
- ◻ **Code-bearing vine message? Send it safely.** Any grapevine `send` whose body carries
  backticks or code MUST go via `--stdin` (or a quoted heredoc) — an un-quoted body is
  command-substituted by bash (backticked spans get executed, apostrophes mangle) _before_
  grapevine ever sees it, corrupting the message or partially running it.
- ◻ **Resuming a preserved patch?** `git apply` resolves patch paths **relative to your CWD, not the
  repo root** — apply from the repo root (or pass `--directory=<repo-root>`), or a patch preserved from
  a subdir lands in the wrong place.
- ◻ **Scratch minted** — `.anthill/scratch/<handle>/<date>-<slug>.md`, so capture is frictionless.
- ◻ **Route through the lead — and SAY when you're waiting.** Questions + decisions go to the
  lead/liaison on the vine, not direct to the human. But routing through the lead is a **default, not
  an exclusive channel** — the human can attach to your pane at any time, so never assume you're
  unobservable. And if you end up **blocked waiting on a human answer, post that on the vine**:
  correct waiting produces no signal anywhere — not on the board, not in the tree, not in any sweep —
  so a silently-waiting seat is indistinguishable from a working one. One team lost an unknown stretch
  to exactly this.

## Output

A grounded seat: re-grounded in your role, present on the vine + board, scratch minted, working your
lane.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot it
to your scratch and raise it at `anthill:finalize-session` (or flag the lead). These skills improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

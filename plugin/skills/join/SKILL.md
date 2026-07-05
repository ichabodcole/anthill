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

3. **Get on the wires.** From the `anthill join <handle>` output, run the resolved **grapevine tail**
   and **board tail** commands — each wrapped with the **Monitor** tool (filter keepalives as the
   checklist shows), so you wake on team messages and register presence as your handle. **`anthill
status`** shows who's on + the board.
   - **Were you dispatched as a subagent** (not a terminal seat)? A one-shot subagent can't hold a
     Monitor tail — **skip the tail wiring**. The lead drives you directly (dispatch → result) and
     relays the vine. The tail wiring above is the **terminal-seat path**.

4. **Mint your session scratch.** Create your running-capture file:
   **`.anthill/scratch/<handle>/<YYYY-MM-DD>-<slug>.md`** (it's gitignored — `anthill init` added the
   line). This is where you drop cheap notes as you work ("this just bit me", "this seam is fuzzy") —
   the raw material you'll synthesize at finalize. Start it now so capture is frictionless later.

5. **Signal ready** on the vine (a short "in, grounded, here's my lane") and **claim your bounty card**
   (move it `todo→doing` when you actually start) — or await assignment from the lead.
   - **Ratify your seams, then author your lane (the plan-phase gate).** If the lead posted a plan
     **skeleton**, then _before_ you move a card `todo→doing`: (1) **ratify or falsify each cross-seam
     contract your lane touches** — an explicit vine acknowledgement (_"ratified"_ / _"falsified —
     here's the correction"_), never silence; you hold your domain's reflexes, so catching a wrong
     seam now is the whole point. (2) **Author your own lane** — `plan/<seat>.md`, the file-level HOW
     for your slice, against the _ratified_ seams (grounded paths, right-sized TDD tasks, no
     placeholders — the craft is in `anthill:plan`'s `methodology.md`). Nothing to ratify (solo lane,
     no shared seam)? Proceed.

6. **Work** your lane per the SOP + your seat doc. As you go, **capture ah-ha judgments to your
   scratch** (the reasoning + the generalizable lesson — not lesson-less events) for synthesis at
   finalize. Route questions + decisions to the lead on the vine, not direct to the human.

## Join checklist (the beats that get skipped)

- ◻ **Grounded** in your seat (grounding docs → SOP → seams → your seat doc).
- ◻ **On the vine** — grapevine tail wrapped in Monitor, presence registered (terminal-seat path).
- ◻ **On the board** — board tail wrapped in Monitor.
- ◻ **Introduced** on the vine — a short "in, grounded, here's my lane".
- ◻ **Scratch minted** — `.anthill/scratch/<handle>/<date>-<slug>.md`, so capture is frictionless.
- ◻ **Route through the lead — never block on the human.** The human may not be watching this pane;
  questions + decisions go to the lead/liaison on the vine, not direct.

## Output

A grounded seat: re-grounded in your role, present on the vine + board, scratch minted, working your
lane.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot it
to your scratch and raise it at `anthill:finalize-session` (or flag the lead). These skills improve by use.

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

---
name: convene
description: Convene the project's agent team — the invoking agent BECOMES the lead, stands up coordination (grapevine + bounty), grounds in the team docs, gathers the work from the human, and briefs + spawns the seats. Use when the human says "convene the team", "spin up the team", "assemble the team", "let's get the team on this", or is moving from proposal/design into implementation and wants the multi-agent team. Requires a `.team/config.json` (run anthill:bootstrap first if there isn't one).
---

# anthill: Convene (become the lead)

Stand up the project's **agent team** for a working session. The agent that runs this **becomes the
lead** (the `lead` handle in `.team/config.json`) and orchestrates the seats over the grapevine +
bounty CLIs. This is the START touchpoint; the END is `anthill:finalize-session`.

Convene when moving from proposal/design → **implementation**. For a quick question or a trivial fix,
stay solo.

> **The anthill CLI** — driven straight from the plugin (there is nothing to install in the target
> repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`
> Written **`anthill <command>`** below. Every command reads `.team/config.json` (the root marker; walk
> up from cwd). If there's no config yet, stop and run **`anthill:bootstrap`** first.

## Steps

1. **Ground as the lead.** Read, in order (paths resolve from `.team/config.json` — defaults shown):
   - the **`grounding`** docs in `.team/config.json` (the _product_ context — e.g. `AGENTS.md`,
     `README.md`) so you can judge what you're building;
   - `docs/team/README.md` — the **SOP** (how the team works, the principles, the rituals);
   - your own **lead seat doc** `docs/team/dev/<lead>.md` (your orchestration reflexes + scars);
   - skim `docs/team/dev/seams.md` — the shared inter-seat **contracts**.
   You are now the **lead**.

2. **Gather the work from the human** (ask only what you need — one focused round):
   - What are we building this session? (Point at the proposal / plan / project folder if one exists.)
   - Which seats does **this phase** need — all of them, or a subset? (The `spawn:true` seats in config
     are the default set; you override per phase.)
   - Anything constraining: what's already in flight, deadlines, sensitivities.

3. **Stand up coordination.** Run **`anthill convene --topic "<one-line framing>"`** to open the
   grapevine channel (idempotent) and report board state. Note: convene _reports_ the bounty board but
   does **not** open it (bounty's `open` isn't idempotent) — **open the board separately via the
   bounty skill**, then seed the initial cards in **owner lanes** per the plan, left in `todo` (the
   doer owns its card's lifecycle `todo→doing→review`; the reviewer closes). **`anthill status`**
   confirms the result.

4. **Brief the seats, then spawn them.** Post a framing opener on the channel (what we're building, the
   lanes, where the plan lives). Then stand the seats up with one command:
   **`anthill spawn <handles…>`** — it opens a tmux session (one `claude` pane per seat) and auto-fires
   each seat's `anthill:join` (each boots, grounds, lands on the vine awaiting assignment). With no
   handles it spawns the config's default set (`spawn:true` seats); it **never spawns the lead** (that's
   you).
   - **Verifier (and any seat) engagement is YOUR per-phase call.** Pull a verify seat in at the
     verification point the plan calls for — early (tests first), mid (prove a feature), or late — and
     let it ping-pong with the owning seat. Don't reserve it for the end.
   - **You spawn detached and coordinate over the vine.** A command you run isn't a TTY, so spawn just
     creates the session; you drive the seats over the grapevine (which you monitor). The **human**
     watches/talks to the panes with **`anthill attach`**.
   - **Re-running over an existing session?** The session is named after the channel. If one already
     exists, spawn **errors** — pass **`--force`** to kill+recreate, or **`--session <name>`** for a
     separate one. (`anthill spawn --help` for all flags.)
   - **Running seats as subagents instead of terminals?** Skip spawn — dispatch each seat as a
     Task/Agent subagent with the same per-seat brief (no tmux). Good for a small single-session build.

5. **Orchestrate** from here, per the SOP: the **vine** is discussion, the **board** is state; route the
   human's decisions through you; you own the **file-scoped atomic land** (`anthill commit -- <paths>`,
   never `git add -A`). At wrap, run **`anthill:finalize-session`** for the team's knowledge.

## Output

A convened team — live channel + board, seats briefed and joining, the lead coordinating.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot it
to your scratch and raise it at `anthill:finalize-session` (or flag the human). These skills improve by
use.

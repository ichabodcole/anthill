---
name: convene
description: Convene the project's agent team — the invoking agent BECOMES the lead, stands up coordination (grapevine + bounty), grounds in the team docs, gathers the work from the human, and briefs + spawns the seats. Use when the human says "convene the team", "spin up the team", "assemble the team", "let's get the team on this", or is moving from proposal/design into implementation and wants the multi-agent team. Requires a `.anthill/config.json` (run anthill:bootstrap first if there isn't one).
---

# anthill: Convene (become the lead)

Stand up the project's **agent team** for a working session. The agent that runs this **becomes the
lead** (the `lead` handle in `.anthill/config.json`) and orchestrates the seats over the grapevine +
bounty CLIs. This is the START touchpoint; the END is `anthill:finalize-session`.

Convene when moving from proposal/design → **implementation**. For a quick question or a trivial fix,
stay solo.

> **The anthill CLI** — driven straight from the plugin (there is nothing to install in the target
> repo):
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`
> Written **`anthill <command>`** below — that's shorthand, not a binary on PATH; always run the full
> `bun "${CLAUDE_PLUGIN_ROOT}/…"` form. (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin
> skill runs.) Every command reads `.anthill/config.json` (the root marker; walk up from cwd). If there's
> no config yet, stop and run **`anthill:bootstrap`** first.

## Steps

1. **Ground as the lead.** Read, in the canonical order (paths resolve from `.anthill/config.json` —
   defaults shown):
   - the **`grounding`** docs in `.anthill/config.json` (the _product_ context — e.g. `AGENTS.md`,
     `README.md`) so you can judge what you're building;
   - `.anthill/README.md` — the **SOP** (how the team works, the principles, the rituals);
   - `.anthill/dev/seams.md` — the shared inter-seat **contracts**;
   - your own **lead seat doc** `.anthill/dev/<lead>.md` (your orchestration reflexes + scars).
     You are now the **lead**.

2. **Gather the work from the human** (ask only what you need — one focused round):
   - What are we building this session? (Point at the proposal / plan / project folder if one exists.)
   - **Multi-seat feature without a ratified plan yet?** That's the **plan phase** — run
     **`anthill:plan`** (the lead scaffolds a skeleton, the seats ratify the seams they touch before
     drafting). Convene doesn't _require_ a skeleton — you can point the seats at one if it exists and
     proceed if not — but plan is where a multi-seat plan gets authored. Solo work skips it.
   - Which seats does **this phase** need — all of them, or a subset? (The `spawn:true` seats in config
     are the default set; you override per phase.)
   - **Is this the right team _shape_ for the work in front of you?** Before spawning, sanity-check the
     seat scopes against what this phase actually needs — if a scope has drifted or doesn't fit, **split
     / merge / re-draw it now** (and `anthill init` any new seat doc). This is the forward half of the
     finalize re-scope reflection: last session's captured misfit is this session's signal to act on.
   - **Read the last retro's Q3 hypotheses (`.anthill/retro.md`, newest first) and say which ones this
     session will test.** They were written to be falsifiable; a hypothesis nobody checks is the same
     shape as an untested backup — it reads as protection and has never once been exercised. **Name
     them in the convene brief**, so the seats know what they're testing, and carry the verdict into
     the next retro. **A prediction that comes back _wrong_ is the valuable outcome**, not a failure of
     the previous team — say so when you brief it, or seats will quietly protect it.
   - Anything constraining: what's already in flight, deadlines, sensitivities.

3. **Stand up coordination.**
   - **Channel:** run **`anthill convene --topic "<one-line framing>"`** to open the grapevine channel
     (idempotent) and report board state.
     - **Reusing a channel from a prior session?** It still carries that session's messages — new work
       inherits the old noise. Add **`--fresh`** to snapshot-then-clear the log before opening
       (`anthill convene --fresh --topic "…"`). Per grapevine, it's a **no-op if seats are already
       connected** (a live session is not wiped) and the log is archived to `~/.grapevine/archive/`
       first. **Both are spellbook's guarantees, not anthill's** — `--fresh` is forwarded straight
       through — so treat them as the dependency's to keep, and don't rely on them for anything you
       couldn't recover from the archive. Do it **before** spawning seats, at the start of the session.
       - **"Nothing is lost" means the log is recoverable, not that seats still see it.** After a
         clear, a seat that backfills reads an empty channel — which is why this belongs at the start
         of a session and not in the middle of one.
   - **Board:** convene now **opens/attaches the team board itself** — keyed to the channel and pinned
     (writes `.bounty-session` at the repo root), so every seat's + the lead's bounty verbs bind **this**
     board by construction. The binding is **ambient**: no one ever passes `--session`. It's idempotent
     and headless (`--no-open`), so a re-convene re-attaches rather than spawning a stranger board, and
     the reported URL is yours to open when you want it. Then **seed one `todo` card per planned lane, in
     owner lanes** — the doer owns its card's lifecycle `todo→doing→review`, the reviewer closes. The
     board is _state_; the vine is _substance_.
   - **`anthill status`** confirms the result (who's on the vine + the board column counts).
   - **⚠ `status` does NOT tell you who is on `comms`.** It reports the grapevine roster; comms has
     no presence at all, so a seat can be wired to the vine, visible in `status`, and receiving
     nothing on comms — with no symptom. **Confirm it by hand: after the seats introduce
     themselves, count the "in, grounded" messages you actually received on comms and name anyone
     missing.** If you convened four and can name three, the fourth is not quiet, it is missing.
     One minute here, or an hour of a seat working from stale context. See **`anthill:comms`**.

4. **Confirm the branch, brief the seats, then spawn them.**

   - **Confirm the working branch — _before_ spawn (the commit-power gate).** Spawn is the exact moment
     seats gain the ability to commit to the shared tree, so **decide which branch those commits land on
     before you spawn**, not after — landing on the wrong branch (e.g. straight onto a protected trunk)
     is cheap to undo only until something is pushed. If the project has a **branch policy**, follow it —
     read the specific rule from the **grounding docs** (e.g. `AGENTS.md`), don't invent one: the skill
     supplies the trigger, the project supplies the content (anthill's _defer-to-one-source_ principle).
     This is a **decision prompt, not an auto-cut** — never hard-code branch creation; that would force
     gitflow on a trunk-based or solo repo and a naming scheme the skill can't know. Confirm you're on the
     intended branch (switch/create per policy if not), _then_ spawn. _(Plan can legitimately precede a
     branch — it commits no code; the enforcement point is here, pre-spawn.)_

   - **Brief, then spawn.** Post a framing opener on the channel (what we're building, the
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
     Task/Agent subagent with the same per-seat brief (no tmux). In this mode **you drive each seat
     directly** (dispatch → result); there are **no tails to wire** (a one-shot subagent can't hold a
     Monitor tail — that's the terminal-seat path). The seat still grounds via `anthill:join`, but
     skips the tail wiring. Good for a small single-session build.
     - **Bake the finalize-capture into every subagent brief** — the one thing to remember when
       dispatching seats. Make it the **final step of the task itself**: self-synthesize into your own
       seat doc, **return** (don't write) any `seams.md` candidate, don't commit. The full spec — the
       three-part split + the lead's residual pass — lives in `anthill:finalize-session` step 0.

5. **Orchestrate** from here, per the SOP: the **vine** is discussion, the **board** is state; route the
   human's decisions through you; you own the **file-scoped atomic land** (`anthill commit -- <paths>`,
   never `git add -A`). At wrap, run **`anthill:finalize-session`** for the team's knowledge.
   - **Pacing — two field-proven moves worth reaching for:**
     - **Flag-before-LAND, not before-work.** For dependency additions and shared-file changes, the
       seat **builds while you ratify** and flags at the moment of landing — zero dead time. (Ran
       three times in one session without a miss.) The boundary: this works because a _land_ is
       reversible in practice and a half-built lane is not. It does **not** extend to **seam**
       ratification, where the entire point is to falsify _before_ building.
     - **Compact instead of respawn.** At a quality pause on a long lane, the **human** can fire
       `/compact` at a seat's pane — restoring headroom while keeping the seat's in-context working
       rhythm, where park-and-respawn discards it. Note the constraints: seats **cannot** self-trigger
       it (it's a user-level command, and a lead's `send-keys` into a peer pane is classifier-blocked),
       so no agent will discover this — you have to ask the human. Worth it for build seats carrying
       long in-context state; roughly neutral for verify seats, whose state is externalized by design.
   - **Running seats as SUBAGENTS? Re-dispatches route by _thread_, not by seat.** "Continue the
     agent" resumes a conversation thread, and a thread is not a seat — a verify-seat re-gate has
     misrouted into the builder's thread, caught only by the subagent's own honesty. Keep an explicit
     thread→seat map and check it before continuing an agent; a misroute silently attributes one
     seat's work to another, which then poisons that seat's living doc at finalize.

## Convene checklist (don't skip a setup beat)

The stand-up beats that get skipped when you're eager to spawn. Run them as a list:

- ◻ **Grounded** as the lead (grounding docs → SOP → seams → your seat doc).
- ◻ **Work gathered** from the human; **plan phase** run (`anthill:plan`) if it's a multi-seat feature
  without a ratified plan.
- ◻ **Grapevine open** — `anthill convene --topic "<framing>"`.
- ◻ **Board open + seeded** — one `todo` card per planned lane, in owner lanes; **size** them where the
  work is known enough to size.
- ◻ **Seats briefed** on the vine (what we're building, the lanes, where the plan lives).
- ◻ **Working branch confirmed** — you're on the intended branch for this session's commits; if the
  project has a branch policy (in the grounding docs), it's followed. _Do this **before** spawn — spawn
  is when seats gain commit power._
- ◻ **Seats spawned** — `anthill spawn <handles…>`; `anthill status` confirms who's on + the columns.
- ◻ **Every seat accounted for on `comms`** — `status` does **not** cover this wire (comms has no
  presence). Count the "in, grounded" messages you actually received and name anyone missing.

## Output

A convened team — live channel + board, seats briefed and joining, the lead coordinating.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot it
to your scratch and raise it at `anthill:finalize-session` (or flag the human). These skills improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

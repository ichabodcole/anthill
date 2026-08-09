---
name: convene
description: Convene the project's agent team — the invoking agent BECOMES the lead, stands up coordination (comms + bounty), grounds in the team docs, gathers the work from the human, and briefs + spawns the seats. Use when the human says "convene the team", "spin up the team", "assemble the team", "let's get the team on this", or is moving from proposal/design into implementation and wants the multi-agent team. Requires a `.anthill/config.json` (run anthill:bootstrap first if there isn't one).
---

# anthill: Convene (become the lead)

Stand up the project's **agent team** for a working session. The agent that runs this **becomes the
lead** (the `lead` handle in `.anthill/config.json`) and orchestrates the seats over comms +
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

1. **Ground as the lead.** Read, in the canonical order. **`<teamDir>` and `<seatDir>` below are
   RESOLVED, not literal** — they come from `paths` in `.anthill/config.json` and default to
   `.anthill/` and `.anthill/dev/`. `anthill join <lead>` prints every one of them already resolved;
   if you are unsure which layout this repo uses, read them from there rather than guessing:
   - the **`grounding`** docs in `.anthill/config.json` (the _product_ context — e.g. `AGENTS.md`,
     `README.md`) so you can judge what you're building;
   - `<teamDir>/README.md` — the **SOP** (how the team works, the principles, the rituals);
   - `<teamDir>/principles.md` — **what this team learned the hard way**, each with the scar that
     paid for it. Short, and the highest-leverage read here;
   - `<seatDir>/seams.md` — the shared inter-seat **contracts**;
   - your own **lead seat doc** `<seatDir>/<lead>.md` (your orchestration reflexes + scars).
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
   - **Read the last retro's Q3 hypotheses (`<teamDir>/retro.md`, newest first) and say which ones this
     session will test.** **No entries in it?** That is the normal state before this team's first
     finalize — `init` seeds the file with the ritual's guidance and nothing else; the entries are
     written at finalize. **Say so in the brief and move
     on; do not go looking for them or report them as missing.** They were written to be falsifiable; a hypothesis nobody checks is the same
     shape as an untested backup — it reads as protection and has never once been exercised. **Name
     them in the convene brief**, so the seats know what they're testing, and carry the verdict into
     the next retro. **A prediction that comes back _wrong_ is the valuable outcome**, not a failure of
     the previous team — say so when you brief it, or seats will quietly protect it.
   - Anything constraining: what's already in flight, deadlines, sensitivities.
   - **Is `gate` set in `.anthill/config.json`? If not, ask for it now — this is the one field a
     footprint cannot backfill on its own.** Every seat's land runs the project's gate in front of
     the commit, and the field has **no default on purpose**: a guessed gate hands seats a green that
     means nothing. Any team bootstrapped before the field existed has it unset, so **the absence is
     the normal state of an older footprint, not a sign anything is broken.**
     Propose a candidate (the `check`/`verify`/`ci` script in the manifest, a `Makefile` target, or
     whatever this repo's own grounding docs tell contributors to run) and let the human ratify or
     correct it — **anthill supplies the trigger, the project supplies the content.**
     **"We don't have one" is a real answer:** leave it unset and the land command announces the
     absence loudly instead of skipping the gate silently. What you must not do is invent one to
     make the field look filled. Ask **once** at convene; if it is already set, say nothing.

3. **Stand up coordination.**
   - **Channel:** run **`anthill convene`**. **There is no wire to open** — `anthill comms` is an
     append-only log that exists as soon as the channel is named in config, so convene reports board
     state and stands up the session rather than opening anything.
     - **⚠ The log is NEVER cleared, and nothing offers to clear it.** A channel reused across
       sessions carries **every message the team has ever sent**, so a seat that backfills from the
       beginning replays all of them. **That is the durability the wire is for, and the cost is that
       catch-up needs an ANCHOR rather than a starting point.**
     - **So the lead owes every seat a session anchor**, out of band from the wire itself — a message
       id, and **its home is a read-first CARD ON THE BOARD.** **Do not publish the anchor as a
       message on the channel it bounds:** the only way to learn the rule is then to break it, which
       is not a rule.
       - **⚠ "In the brief" is NOT a second home, and this instruction used to offer it as one.** On
         the default path your brief **is** a message on the channel (you post the framing opener
         there, a few beats below) — so an anchor "in the brief" is the exact thing this rule
         forbids, one paragraph apart. It is out of band **only** when you are dispatching seats as
         subagents, where the brief is a payload handed to the seat. **The card is the only home that
         is out of band on both paths.**
       - **The opener MAY POINT at the card. Pointing is not publishing, and it is also not
         delivery.** A seat that correctly refuses to read the wire until it has an anchor **cannot
         receive a pointer that lives on the wire** — it has ruled out the only surface carrying it.
         **That is a reachability problem, not a findability one, and the two have opposite fixes:**
         findability says make the pointer louder; reachability says put it where a compliant seat is
         already looking. Only the second works.
         _Measured: a seat did exactly this and had to ask for an anchor that was already carded — while
         another got the anchor by reading the channel the rule forbids, and paid nothing because its
         gap happened to be 1. **The tooling rewarded the wrong method and taxed the right one**, which
         no gate and no prose can see._
   - **Board:** convene now **opens/attaches the team board itself** — keyed to the channel and pinned
     (writes `.bounty-session` at the repo root), so every seat's + the lead's bounty verbs bind **this**
     board by construction. **In a single working tree the binding is ambient — nobody passes
     `--session`, and that is the guarantee this design is for.** It's idempotent
     and headless (`--no-open`), so a re-convene re-attaches rather than spawning a stranger board, and
     the reported URL is yours to open when you want it.
     - **⚠ Putting seats in separate GIT WORKTREES breaks that guarantee, and it breaks it silently.**
       The board id is derived from the repo path, and a worktree is a different path — so every
       key-based route resolves to a _different_ board, and the pinned `.bounty-session` is gitignored
       and never crosses. **Measured, and every seat hit it.** A verb that misses does not error
       usefully; it reports no running session, which reads as _"the board isn't up."_
       **If you spawn seats into worktrees, resolve the board id once and hand it to them explicitly.**
       That is the case where a seat does pass a session flag — **the ambient guarantee is what you
       are trading away, so trade it deliberately rather than discovering it seat by seat.**
     - **⚠ And under worktrees, seats must land through `anthill commit` — NEVER raw `git commit`.**
       Worktrees give each seat its own index, so the intuition is that nothing is shared and a bare
       commit is now safe. **That intuition is wrong, and it is wrong on a path nobody looks at:** a
       repo with a pre-commit hook that stashes (lint-staged does, on every commit) is writing to
       **`refs/stash`, which git shares across all worktrees of a repo** — while `HEAD` and the index
       are per-worktree. So the one thing seats still share is **the ref that holds uncommitted work**,
       and `anthill commit`'s lock is the only mutex over it. **Isolation moves the race; it does not
       remove it.** Tell the seats this when you brief them — the reasoning is not available to
       someone who only knows that worktrees isolate.
   - **Seed the cards** — one `todo` card per planned lane, in owner lanes. The doer owns its card's
     lifecycle `todo→doing→review`, the reviewer closes. The board is _state_; comms is _substance_.
   - **⚠ WIRE YOURSELF FIRST — `convene` prints YOUR OWN comms line and you are not on that wire
     until you run it.** Look for the comms Monitor line in convene's own output and **run it exactly
     as printed, Monitor-wrapped, with no filter** (it emits no keepalives, so a `grep` there can only
     lose messages). **Do this before you brief anyone**: everything below asks you to audit a wire,
     and every one of those checks reads as _"nobody is there"_ if the one who is missing is you.
     - **If convene instead reports that no lead is resolvable, you got a WARNING saying so, and you
       are unwired until you run `anthill join <your-handle>` yourself.** That is a real branch, not a
       theoretical one — **and it announces itself rather than showing up as an absent line**, which
       is the only reason you can act on it. Never infer your wiring state from a line you did not see.
       _(Scar: a lead spent a morning counting handshakes by hand to find seats "missing from comms",
       because convene did not emit this and nothing said it was needed. The seats were fine. The lead
       was the one not on the wire, and no check it ran could have told it so.)_
   - **`anthill status`** confirms the result (who is present on the channel + the board column
     counts). **Presence is a FOLD over every source that reports it** — `status` and `down` both read
     the same folded answer, so a seat present on `comms` counts as present. **What it does NOT tell you is how
     far behind a seat is** — `anthill comms positions` is the verb for that, and a `never-followed`
     seat there means _no record at all_, never a rounded-down zero.
     **⚠ THE FOLD IS PERMISSIVE ABOUT PRESENCE AND UNANIMOUS ABOUT ABSENCE, AND ONLY THE SECOND HALF
     WILL EVER COST YOU A TEARDOWN.** Any one source reporting a seat **present** makes the answer
     present; but **every** source must report **none** before anything authorises, and a source that
     merely _cannot answer_ contributes `unknown`, which blocks. **So a source that is quiet, empty,
     or unresolvable does not abstain — it vetoes**, and it does so without appearing in the verdict
     as a reason anyone would look at. _(Phrased over "sources" rather than a count on purpose: this
     stays true whether presence folds one input or five, so adding or retiring one does not falsify
     this paragraph.)_
     _(This bullet used to be followed by a ⚠ saying `status` reports only the other wire and cannot
     see comms. **That was false from the moment presence became multi-source, and it contradicted the
     sentence directly above it** — two adjacent bullets, one right and one wrong, and only a reader
     running both together could tell which. Deleted rather than reworded: **a warning that survives
     the thing it warns about is worse than no warning**, because it argues against the check that
     does work.)_
   - **Confirm the comms wiring right after the seats introduce themselves — `anthill comms
positions`.** This is the named moment to run it; without one it is a verb nobody reaches for.
     Run it **just after the introductions, while traffic has actually happened** — see the limit below.
     - **Three states, three different facts, and they must never be read as one number.**
       `never-followed` means **no record at all** — that seat has never attached a follower and the
       tool has no idea what it has seen. `current` means level with the head. `behind` means behind
       by N. **`never-followed` is not a rounded-down zero:** reporting it as _"missed nothing"_ is
       the one claim it is not entitled to make, on the wire whose whole purpose is to stop silence
       being mistaken for safety.
     - **Its honest limit, which you need BEFORE you trust a green.** The position is stamped when a
       byte leaves the follower's process — not when an agent received it — and lag is measured
       **against the head, not against the clock.** So on a quiet channel nothing moves and every
       follower looks equally healthy: **it can only convict a wire once somebody sends.** A green
       during a lull means "no traffic", not "everyone is fine".
     - **If you convened four and can account for three, the fourth is not quiet — it is missing.**
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
     each seat's `anthill:join` (each boots, grounds, lands on comms awaiting assignment). With no
     handles it spawns the config's default set (`spawn:true` seats); it **never spawns the lead** (that's
     you).
   - **Verifier (and any seat) engagement is YOUR per-phase call.** Pull a verify seat in at the
     verification point the plan calls for — early (tests first), mid (prove a feature), or late — and
     let it ping-pong with the owning seat. Don't reserve it for the end.
   - **You spawn detached and coordinate over comms.** A command you run isn't a TTY, so spawn just
     creates the session; you drive the seats over comms (which you monitor). The **human**
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

5. **Orchestrate** from here, per the SOP: **comms** is discussion, the **board** is state; route the
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

- ◻ **Grounded** as the lead (grounding docs → SOP → **principles** → seams → your seat doc).
  `<teamDir>/principles.md` is short and is the highest-leverage read in that list.
- ◻ **Work gathered** from the human; **plan phase** run (`anthill:plan`) if it's a multi-seat feature
  without a ratified plan.
- ◻ **`gate` set in `.anthill/config.json`** — if it is unset, you asked the human for this project's
  verification command and did not guess one. A footprint bootstrapped before the field existed has it
  blank, and every land the team makes until it is set runs **no verification at all** (the land
  command says so, loudly — but it says it to a seat, not to you).
- ◻ **Session stood up** — `anthill convene`. **There is no wire to open**; what you owe the seats
  instead is a **session anchor on a read-first CARD**, never as a message on the channel it bounds.
  **Not "in the brief"** — on the default path the brief is itself a message on that channel, so it is
  the same violation wearing a different noun. The opener may point at the card; a seat that is
  correctly refusing to read the wire cannot receive a pointer that lives on it.
- ◻ **Board open + seeded** — one `todo` card per planned lane, in owner lanes; **size** them where the
  work is known enough to size.
- ◻ **Seats briefed** on comms (what we're building, the lanes, where the plan lives).
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

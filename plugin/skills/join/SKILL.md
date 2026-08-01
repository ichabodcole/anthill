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
   - `.anthill/principles.md` — **what this team learned the hard way**, each with its scar. Short,
     and the highest-leverage read here;
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
   - **Run the commands your manifest printed — verbatim, exactly as given.** They arrive fully
     resolved, with your handle and channel already interpolated. **If you find yourself substituting
     your handle into a command, or reconstructing one this skill describes in prose, stop** — you are
     rebuilding a value the CLI already computed, and your reconstruction is what goes stale when a
     path, a flag, or the resolution rule changes. This skill deliberately does **not** spell out those
     commands, not even as an example: the printed string is the single source, and a copy here would
     be the copy nobody remembers to update.
   - **There is a third wire — `comms` — and your manifest always carries it.** Look for it under
     **`comms`**, alongside the grapevine and board lines, and **run what it gives you**,
     Monitor-wrapped, exactly as given. There is no second case to check for: the skill and the tool
     ship together, so a project that runs this skill has the wire. Don't test for the tool, don't probe
     the filesystem for it, don't interpret an exit code to decide.
     - **`comms` missing from the manifest is a bug, not a project without comms.** Say so to your lead
       rather than quietly carrying on unwired — a dropped block and a deliberate absence would look
       identical to you, and the second one doesn't exist.
     - **Do not add a keepalive filter to this one.** The other two wires need one; **`comms` emits no
       keepalives, so there is nothing to strip** and the string is complete as given. This is the one
       place the pattern below does _not_ transfer — appending a `grep` here filters out real messages
       and leaves you silently missing team traffic, which looks exactly like a quiet channel.
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
     own scrollback. **On the vine and the board, a usage error and a broken tool look identical if
     you don't read the output** — those tools answer every failure with the same bare usage line, so
     the exit code is the only other signal and it cannot tell the two apart.
     - **Scoped deliberately, and do not widen it.** That is a fact about _those_ tools, not a law
       about command-line tools. A tool that hands you a **structured error** has already told you
       which one happened — treating its error as "probably broken" throws away the answer you were
       given. **Read what you actually got before deciding a tool is broken**; that instruction
       holds everywhere, and it is the only part of this that generalizes.
     - **Every wire needs this, not just the vine.** Your `comms` wire has
       its own catch-up verb and the same rule applies: **a finite read to catch up, the live follow
       only for the Monitor.** Reach for `--help` on the wire you're actually using rather than
       assuming its verbs match the one you learned first — **these tools are siblings, not clones.**
       - **On `comms` specifically, catching up is not the same job as on the vine, and
         `anthill:comms` is the skill for it.** The lead clears the vine at convene, so `pull` gives
         you this session. **Nothing clears the comms log** — no `--fresh`, and convene has no notion
         of a comms channel — so a bare read replays _every session the team has ever had_. Anchor
         with `--since <id>`. That skill also covers the failure you cannot see from here: a wire
         that silently delivers nothing looks exactly like a quiet channel. **Attaching `follow` is
         the one moment that failure is visible** — it reports the gap it is skipping as it starts,
         so read that notice. **A wire that dies later still goes quiet without saying so**, which
         is why the confirm-receipt beat below is a separate check and not a duplicate of this one.
     - **These wires are separate tools that happen to sit side by side — assume nothing carries
       across them.** Not flags: `--as` identifies the writer on one verb, scopes the results on
       another, and is refused outright by a third — each correct, on its own tool. Not even the way
       you'd _ask_: some verbs honour `--help`, others silently ignore it and just run. **Every
       cross-wire rule stated here has turned out to have an exception**, including the ones written
       to warn you about exceptions, so this bullet deliberately gives you no procedure to carry.
       **Prefer the commands your manifest already resolved.** Beyond those, reach for the tool's own
       documentation rather than a habit from its neighbour — and when something surprises you, read
       the output before concluding the tool is broken.
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

- ◻ **Grounded** in your seat (grounding docs → SOP → **principles** → seams → your seat doc).
  `.anthill/principles.md` is short and is the highest-leverage read in that list. A doc flagged
  **⚠ unfilled template** in your join output is _not_ evidence the project lacks that content —
  it means nobody wrote it yet. Say so to the lead rather than inferring from it.
- ◻ **Caught up** if you joined mid-session — `grapevine pull <channel>` (finite). **Never**
  `tail --from-start | grep` for backfill: it returns nothing and then times out, which reads as
  "empty channel". For **one specific message**, use `grapevine read <channel> <id>` — channel _and_
  id, no `--as`; a bare `read <id>` exits non-zero with a usage line that is easy to misread as a
  broken tool. That is how the **vine and board** fail; don't carry the reflex to a tool that hands
  you a structured error instead — read the output you got.
- ◻ **On the vine** — grapevine tail wrapped in Monitor, presence registered (terminal-seat path).
- ◻ **On the board** — board tail wrapped in Monitor. Use the filter **verbatim from your join
  output**: it needs `grep -E` (plain `grep` treats `(a|b)` as a literal, so the Monitor stays
  silently empty) and `--line-buffered` (or frames are held back until a block fills).
- ◻ **On `comms`** — your manifest always carries this wire. Monitor-wrap what it gives you, exactly as
  given — **no `grep` filter on this one; it emits no keepalives, and a filter here drops real
  messages.** Never reconstruct the command, and never go looking for the tool to decide.
  **`comms` missing from the manifest is a bug — raise it**, don't carry on unwired.
  Catching up on comms is **not** the vine's procedure — nothing clears that log, so a bare read
  replays every past session. Anchor with `--since <id>`; see **`anthill:comms`**.
- ◻ **Introduced** on the vine — a short "in, grounded, here's my lane".
- ◻ **Confirmed received, not just sent.** Get an explicit acknowledgement that your "in, grounded"
  **landed** — from the lead, naming your message. A wire that delivers nothing is indistinguishable
  from a quiet channel, and the first minute is the only cheap time to find out you are unwired.
  **Your `follow`'s start notice does not discharge this**, and the difference is the whole point: it
  tells you **your own receiver attached**, which is the incoming half. An acknowledgement naming your
  message is the only thing that tells you **your outgoing half works and a human-or-agent on the
  other end processed it.** Two directions, two checks; one has never covered the other.
- ◻ **Code-bearing message? Send it safely — on _every_ wire, not just the one you learned this on.**
  **Any** `send` on **any** of these tools — grapevine, comms, whatever the manifest hands you next —
  whose body carries backticks or code MUST go via `--stdin` (or a quoted heredoc). An un-quoted body
  is command-substituted by bash (backticked spans get executed, apostrophes mangle) _before the tool
  ever sees it_, corrupting the message or partially running it. **The tool cannot defend against
  this** — the damage happens in your shell, upstream of it, so no amount of care on the receiving
  end helps.
  - **This hazard is a property of the shell, not of any one command**, so don't scope it to the verb
    you happen to know. A lead walked into the sibling case of exactly this — reaching for the
    _other_ tool's `tail` because the warning he had written named only the first — and lost time to
    a mistake his own prose was meant to prevent. **A warning filed under one tool's name does not
    fire when you reach for the tool beside it.**
- ◻ **Resuming a preserved patch? Apply it from the repo ROOT — nowhere else.** Run from a
  subdirectory, `git apply` **silently applies only the hunks under that directory and drops every
  other one — and still exits 0.** It does not error, and it does not misplace the files; it
  half-restores your work and reports success. Measured: a patch touching `plugin/` and `.anthill/`,
  applied from `plugin/`, restored the `plugin/` file and left the `.anthill/` one untouched, exit 0
  both times. **A recovery that looks clean and is half-missing is worse than one that fails**, and
  the file you lose is whichever one you weren't looking at. `cd` to the root first, then apply, then
  **diff what you got against what you preserved** rather than trusting the exit code.
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

---
name: join
description: Join the project's agent team as a specific seat. Run by a seat agent at session start to re-ground in its role and get on the team's coordination channels. Use when the human says "join the team as <handle>", "take the <X> seat", "join as <handle>", or otherwise tells the agent which seat to take. The agent adopts the named handle, reads its own living doc, mints its session scratch, and joins the team's comms channel + bounty. Requires a `.anthill/config.json`.
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

2. **Re-ground in your seat (the heart of this).** Read, in order. **`<teamDir>` and `<seatDir>` are
   RESOLVED, not literal** — they come from `paths` in `.anthill/config.json` and default to
   `.anthill/` and `.anthill/dev/`. **The manifest `anthill join` just printed lists them already
   resolved for this repo; read the paths from there, not from the defaults shown here:**
   - the **`grounding`** docs (the _product_ context) — your seat doc assumes you know it;
   - `<teamDir>/README.md` — the **SOP** (how the team works, the rituals, commit discipline);
   - `<teamDir>/principles.md` — **what this team learned the hard way**, each with its scar. Short,
     and the highest-leverage read here;
   - `<seatDir>/seams.md` — the shared inter-seat **contracts**. You **defer** to these; you never
     restate them in your own doc;
   - **⚠ If this project configures several teams, these docs are the RESOLVED team's** — you are
     not told which one, by design, because a seat should never have to name a team. **A wrong
     binding looks exactly like amnesia**: your seat doc reads thin, the seams look unfamiliar, the
     principles are somebody else's. That is `anthill team show`, not a re-read — it names the team
     and the rung that chose it (this pane's `ANTHILL_TEAM`, the repo's pin, or being the only team).
   - `<seatDir>/<handle>.md` — **your own living doc**: its epitaph, scope, boundaries,
     relationships, reflexes, anti-patterns, hard-won lessons. This is _you_. Internalize it before
     you touch code.
     - **Start with the `## Epitaph` at the top, and give it more weight than its length suggests.**
       It is one sentence, written **last** by the previous instance in this seat — the single thing
       it chose, out of everything it knew, for you specifically. **Everything else in the doc is
       what the seat knows; the epitaph is what it got wrong.** It usually names a disposition rather
       than a fact, because that is the part that survives the code moving.
       **No epitaph?** That means this seat has not finished a session yet — a normal state, not a
       missing file. You may be the one who writes the first.

   Running **`anthill join <handle>`** prints this grounding manifest (the exact files, in order) plus
   your tail commands and an action checklist — use it as your source of truth; don't restate it.
   - **Grounding is read-only-first _by design_** — **this step (2) and nothing after it**: the
     grounding reads are pure reads, at known paths, so a seat can re-ground from the docs alone even
     under a Bash-permission outage or a locked-down sandbox. The guarantee is that _the reads are
     read-only_ — **not** that join works without Bash: `anthill join` is itself a Bash call, and
     steps 3–5 mint scratch, claim a card, and register presence, all writes. Don't reach for a write
     until you're grounded; the read-only spine is what makes re-grounding robust.

3. **Get on the wires.** From the `anthill join <handle>` output, run the resolved **comms follow**
   and **board tail** commands — each wrapped with the **Monitor** tool (filter keepalives where the
   checklist shows one), so you wake on team messages and register presence as your handle. **`anthill
status`** shows who's on + the board.
   - **⚠ FIRST, KNOW WHAT YOUR MANIFEST CANNOT KNOW — some of these steps are SESSION-VARIABLE and it
     states all of them unconditionally.** The manifest is generated from config, **before any session
     context reaches you**, so it cannot know which wires this session armed, what anchor the lead set,
     or what was ruled five minutes ago. **Where the manifest and a live ruling
     disagree, the ruling wins** — the manifest is not more authoritative for being mechanical, it is
     just earlier.
     - **The two that are actually variable:** _which wires to arm_ (a session may deliberately leave
       one unsubscribed), and _where this session starts_ — **your catch-up needs an ANCHOR the
       manifest cannot know**, because nothing clears the log and a bare read replays every session
       the team has ever had. The lead owes you that id; if you do not have one, **ask before you
       read**, and do not infer it from the first message you happen to see.
     - **You will usually read the ruling AFTER you have acted, and that is structural, not
       carelessness.** The obvious remedy — _"catch up before you arm anything"_ — **cannot be the
       whole answer, because catching up is itself one of these steps and the manifest is what tells
       you to do it.** The ordering problem lives inside the artifact that has the ordering problem.
     - **So do the cheap thing instead: treat arming as REVERSIBLE, not as a commitment.** A Monitor
       you started is killed in one call. Catch up early, and if the session turns out to have ruled
       against a wire you already armed, **kill it and say so on the wire** — that costs a minute and
       it is how both recorded instances actually ended. **What is expensive is defending the action
       because the manifest told you to.**
     - **Say it out loud when it happens.** Both times this occurred, the seat caught itself; the
       danger case is the seat that catches up late, never notices, and reports a clean join. **Your
       report is the only evidence this defect is still live.**
   - **Run the commands your manifest printed — verbatim, exactly as given.** They arrive fully
     resolved, with your handle and channel already interpolated. **If you find yourself substituting
     your handle into a command, or reconstructing one this skill describes in prose, stop** — you are
     rebuilding a value the CLI already computed, and your reconstruction is what goes stale when a
     path, a flag, or the resolution rule changes. This skill deliberately does **not** spell out those
     commands, not even as an example: the printed string is the single source, and a copy here would
     be the copy nobody remembers to update.
   - **`comms` is the wire, and your manifest always carries it.** Look for it under **`comms`**,
     alongside the board line, and **run what it gives you**, Monitor-wrapped, exactly as given.
     There is no second case to check for: the skill and the tool ship in one subtree from one
     release, so a project that runs this skill has the wire. Don't test for the tool, don't probe the
     filesystem for it, don't interpret an exit code to decide.
     - **`comms` missing from the manifest is a bug, not a project without comms.** Say so to your lead
       rather than quietly carrying on unwired — a dropped block and a deliberate absence would look
       identical to you, and the second one doesn't exist.
     - **Do not add a keepalive filter to this one.** The **board** line needs one; **`comms` emits no
       keepalives, so there is nothing to strip** and the string is complete as given. **This is the
       one place the board's pattern does _not_ transfer** — appending a `grep` here filters out real
       messages and leaves you silently missing team traffic, which looks exactly like a quiet channel.
     - **⚠ The board wire can come back `null` and `comms` cannot, so do not read them as a pair.**
       The board is a **separate project on its own release cadence**, so its absence is a reachable
       state the manifest reports (with the reason in `warnings`); comms lives inside this CLI. **A
       `null` there is an observation, not an unpopulated field** — arm what you were given and tell
       your lead what you were not.
   - **Were you dispatched as a subagent** (not a terminal seat)? A one-shot subagent can't hold a
     Monitor tail — **skip the tail wiring**. The lead drives you directly (dispatch → result) and
     relays what lands on comms. The wiring above is the **terminal-seat path**.
   - **Joining mid-session? Backfill first, and you need an ANCHOR to do it.** A live follow only
     shows messages from _now_ forward, so it cannot give you the session you walked into. Catch up
     with the **finite read** verb — it prints history and **exits** — and use the live follow **only**
     for the Monitor. `anthill:comms` is the skill for this and it carries the craft.
     - **⚠ NOTHING CLEARS THE COMMS LOG — ever, by any lead.** There is no `--fresh`, and convene
       opens nothing. **So a bare read replays every session the team has ever had**, and "start at
       the beginning" is not a catch-up, it is an archive dump. **Anchor to the session's starting id**
       — which the lead owes you out of band. **LOOK ON THE BOARD FIRST: the anchor's home is a
       read-first CARD, and it is very likely already sitting there.** Then ask, if it is not. Do not
       reconstruct it by reading backwards until the messages look unfamiliar.
       - **Why the board and not the wire, and it is the whole reason this bullet exists:** the lead's
         opener may well name the card — **but that pointer is ON the channel you are refusing to read
         until you have an anchor.** If you obey the rule, the pointer is unreachable to you; if you go
         read it, you broke the rule to find out you did not have to. **Neither branch is your mistake.**
         The board is the surface a correctly-behaving seat can reach without reading anything it is
         not yet entitled to read, which is why the card is the home and the message never is.
       - **⚠ ASKING IS NOT A FAILURE AND DO NOT LET THE TIMING FOOL YOU.** A seat who asks pays a
         round trip; a seat who just reads the channel usually pays nothing, because its own follow
         position often happens to be near the session start. **The cheap-feeling route is the wrong
         one and it is cheap by accident** — measured, in one session, both branches at once.
     - **⚠ AND THE ANCHOR CANNOT BE PUBLISHED ON THE CHANNEL IT BOUNDS.** A lead who posts
       _"do not read below #560"_ as message #560 has written a rule whose only route to the reader is
       through the thing it forbids — **measured: two seats over-read it in one session, and both had
       to break it to learn it.** If that is where your anchor came from, **you have not been given
       one; you have been given evidence that this failed.** Say so rather than reporting a clean join.
     - **⚠ AND THE ANCHOR YOUR OWN `follow` HANDS YOU IS NOT THE SESSION'S ANCHOR.** The start notice
       prints a **runnable** catch-up command, and the id in it is **where THIS SEAT's follow last
       stopped — which may be a previous session entirely.** It agrees with the session's anchor only
       when you happened to be followed to the end of last session, **so it is silent exactly for the
       seats who were here before and loud only for those who were away** — the population most likely
       to report it is the smallest one. **The lead's anchor outranks it; if they disagree you have not
       found a bug, you have found out which one knows what a session is.**
       _Measured: two seats hit this in one session — one saw the two numbers differ and noticed, the
       other saw them agree exactly and reported a clean join, which is the case nothing surfaces._
       **A rotated session mints fresh positions and removes this**, but rotation destroys nothing and
       reaches a team only once one actually runs for it — **so until then this is live, and "the tool
       will handle it" is a claim about a world your team may not be in yet.**
     - **⚠ AN UNKNOWN FLAG IS REFUSED BY NAME. AN UNKNOWN POSITIONAL IS SWALLOWED IN SILENCE — and
       that is the direction that will cost you a session.** Measured on this wire, one command apart:
       ```
       comms read --channel <ch> --zzz999   ->  exit 1  ok:false  "Unknown option '--zzz999'.
                                                          Valid flags: --channel, --format, --id, --last, --since"
       comms read --channel <ch> zzz999     ->  exit 0  ok:true   THE ENTIRE LOG, from message #1
       ```
       **The second one is what a seat produces by reaching for a neighbouring tool's signature** —
       positional-shaped `read <channel> <id>` habits are the common source — **and it does not fail.
       It succeeds, plausibly, with the wrong answer.** You get a wall of history, exit 0, and nothing
       anywhere says you asked the wrong question.
       - **So use the FLAGS, always: `--since <id>` for a window, `--id <id>` for exactly one
         message.** If a read hands you far more than you expected, **suspect your invocation before
         you suspect the channel** — the size of the result is your only tell.
       - **This asymmetry is a property of the tool as it stands today, not a law.** It may be closed;
         a guard for it has been attempted. **Check what you actually got rather than trusting either
         this paragraph or an exit code** — that instruction is the only part here that always holds.
     - **`--help` on the verb you are actually using, rather than the one you learned first.** These
       tools are siblings, not clones: a flag that identifies the writer on one verb scopes results on
       another and is refused outright by a third, each correctly. **Prefer the commands your manifest
       already resolved** over any invocation you derive.
     - **And the failure you cannot see from here: a wire that silently delivers nothing looks exactly
       like a quiet channel.** **Attaching the follow is the one moment that failure is visible** — it
       reports the gap it is skipping as it starts, so read that notice. **A wire that dies later still
       goes quiet without saying so**, which is why the confirm-receipt beat below is a separate check
       and not a duplicate of this one.
     - **`--id <id>` is the only way to fetch exactly one message**, and that matters more than
       gap-filling: it is not a narrower range, it is _not a range_. Any `--since` window runs to
       _now_, so on a channel peers are actively writing to it will eventually contain a peer's
       message. When you need one specific message and nothing else, no choice of `--since` gets you
       there.
     - **A backfill that exits 0 is not a backfill that is COMPLETE. Confirm it; do not infer it.**
       **Send a backfill to a FILE and PARSE the file** — rather than reading it through a pipe
       (`| head`, `| grep`, `| jq`) or straight into your context. **If it does not parse, you did
       not get the history.** That is the whole check: a complete payload parses, and a payload cut
       short is cut mid-value, so it cannot.
       **This is the failure the anti-`tail` warning below cannot cover, and it is the worse of the
       two.** A broken `tail` gives you nothing and times out — obviously wrong, so nobody trusts it.
       A truncated backfill gives you **plausible, well-formed, wrong history and exits 0**, which
       reads as a quiet or stale channel. A seat that skipped this check read a channel as ending at
       #68 when it stood at #116, stamped a ratify verdict with that watermark, and the lead
       broadcast a wrong inference about that seat's diligence before having to retract it
       ([#77](https://github.com/ichabodcole/anthill/issues/77)).
       **Do NOT reach for a completeness marker in the payload instead** — a cursor, a count, a last-id.
       This bullet used to prescribe exactly that and it was wrong in **both** directions, which is
       worth more than the rule: such a marker is **derived from the payload you are already holding**,
       so on a complete backfill it cannot disagree with it; and when the backfill really is cut, the
       marker is at the END and is **the first thing lost**, so the comparison cannot even be attempted.
       Meanwhile a routine triage action was enough to make it disagree on **complete** history —
       a false alarm telling a seat to distrust a backfill that was entirely correct.
       **A check that cannot fail in the failing case, and can fail in the passing case, is not weak
       — it is anti-correlated with the thing it tests.**
       **Stated as a check you run, deliberately NOT as a claim about how any of these tools
       behaves.** The mechanism belongs to someone else and may be fixed tomorrow; a sentence naming
       it would become false on the day it is repaired, and you would still need the check. **Do not
       generalise it into "these tools truncate"** — that widening has been falsified here before.
     - **NEVER catch up with a LIVE stream — the streaming verb is for the Monitor and nothing else.**
       Piping a from-the-start live follow into `grep` looks like the obvious backfill and is **broken
       by construction**: `grep` block-buffers so a finite backfill never flushes, and a live stream
       holds the pipe open forever so it never exits. You get **zero output and then a timeout** — and
       the natural reading of that is "the channel is empty", so you'd join contextless and never know
       what you missed. Three seats hit this independently in one session before it was diagnosed
       ([#54](https://github.com/ichabodcole/anthill/issues/54)). `pull` for catch-up, `tail` for live.

4. **Mint your session scratch.** Create your running-capture file:
   **`<teamDir>/scratch/<handle>/<YYYY-MM-DD>-<slug>.md`** (it's gitignored — `anthill init` added the
   line). This is where you drop cheap notes as you work ("this just bit me", "this seam is fuzzy") —
   the raw material you'll synthesize at finalize. Start it now so capture is frictionless later.
   - **Scratch is gitignored — it does NOT survive the session.** Everything you learn lives in an
     untracked file until you synthesize it, so an abrupt session-end evaporates the whole trail —
     precisely the loss anthill exists to prevent. Synthesize into your seat doc at finalize, **or
     earlier, whenever the reasoning is warm**. Earlier is not jumping the gun; it's insurance.
   - **`<teamDir>/scratch/` is the right home for _throwaway artifacts_** — verify mints, screenshots,
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

5. **Signal ready on comms** — a short "in, grounded, here's my lane". **That is where your lead audits
   who showed up**, so it is the post that decides whether you are counted as present or chased as
   missing.
   _(This instruction used to name a different wire than `convene` told the lead to count on. **Each
   sentence was defensible in its own file** and together they produced a lead finding zero seats and
   going to chase seats that were never told to post there — found by an outside reader running both
   documents as one procedure, not by either author. **With one wire the contradiction is gone; the
   lesson is that neither owner could see it**, so when a rule spans two files, check the other file.)_
   Then **claim your bounty card**
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
     contract your lane touches** — an explicit acknowledgement on comms (_"ratified"_ / _"falsified —
     here's the correction"_), never silence; you hold your domain's reflexes, so catching a wrong
     seam now is the whole point. (2) **Author your own lane** — `plan/<seat>.md`, the file-level HOW
     for your slice, against the _ratified_ seams (grounded paths, right-sized TDD tasks, no
     placeholders — the craft is in `anthill:plan`'s `methodology.md`). Nothing to ratify (solo lane,
     no shared seam)? Proceed.
     - **Joined mid-plan-phase?** You weren't there for the lead's convene brief, which is where the
       ratify gate normally gets explained — the discipline lives in those comms messages, not in your
       grounding manifest, so a joiner can miss it entirely. If a plan skeleton exists, **read its
       "How this plan is authored" section** before you move a card; that's the gate's source of
       truth. Don't infer from a self-contained assignment message that there is no gate.

6. **Work** your lane per the SOP + your seat doc. As you go, **capture ah-ha judgments to your
   scratch** (the reasoning + the generalizable lesson — not lesson-less events) for synthesis at
   finalize. Route questions + decisions to the lead on comms, not direct to the human — the lead
   is the routing **default**, not proof the human isn't watching. **Blocked on a human? Say so on
   comms** — waiting silently looks exactly like working.
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
     - **Give it the ARTIFACT, not the conversation.** Hand it the file, the diff, the command — and
       **do not paste the channel, and do not summarise what you were trying to do.** Both hand it
       your framing, which is the one thing it was dispatched not to have; **its value is
       incomprehension**, and a helpful briefing destroys exactly that.
       - **⚠ Nothing makes a reader cold BY CONSTRUCTION unless you built the surface it sees.**
         Coldness is a property of **what you gave it**, never of what you assume it cannot get to.
         **Gitignore is not an access boundary** — an ignored file is a normal readable file, and an
         agent in your working directory reads it with `cat`. Neither is a fresh clone: anything
         **tracked** travels with it, including team docs, and **the commit history comes too**, so
         `git log` on the file under audit hands over the reasoning that produced it.
         _This paragraph used to claim the channel was out of reach because it was gitignored. That was
         false, and it was worse than a wrong fact: it told you a precaution was unnecessary. **Duration
         was never the point — it stood two days and four people repeated it in one afternoon.** A false
         reassurance gets no corrective feedback from a path nobody walks: it is read while planning and
         only tested by someone actually trying to reach the thing. The first person who tried knocked it
         over immediately._
       - **So BUILD the surface instead of enumerating what to keep out of it.** Export just the
         artifact into a throwaway directory outside the repo and dispatch against that. **An
         exclusion list cannot be completed** — the source and the tests under audit carry your
         framing too, and you cannot exclude the thing you are asking about. **An allow-list you can
         verify by listing it**, which is the only completeness claim available here.
         Its floor is the artifact's own contents, and that floor is irreducible: showing them the
         artifact is the job.

## Join checklist (the beats that get skipped)

- ◻ **Grounded** in your seat (grounding docs → SOP → **principles** → seams → your seat doc).
  **Docs feel thin or unfamiliar on a multi-team project? That is `anthill team show`, not a
  re-read** — a wrong team binding is indistinguishable from an amnesiac seat.
  `<teamDir>/principles.md` is short and is the highest-leverage read in that list. A doc flagged
  **⚠ unfilled template** in your join output is _not_ evidence the project lacks that content —
  it means nobody wrote it yet. Say so to the lead rather than inferring from it.
- ◻ **Caught up** if you joined mid-session — the **finite read** verb, anchored with `--since <id>`,
  never the live follow. A live stream piped into `grep` returns nothing and then times out, which
  reads as "empty channel". For **one specific message**, `--id <id>`.
  **⚠ And you need an anchor from the lead — LOOK ON THE BOARD FOR IT BEFORE YOU ASK**, because
  nothing clears this log and a bare read replays every session the team has ever had. Its home is a
  read-first **card**. **An anchor published as a message on the channel it bounds is not an anchor**
  — the only way to learn it is to break it, measured at n=2 in one session. **And a POINTER to the
  card, published on that same channel, is not delivery either:** a seat obeying the rule cannot reach
  it, which is why the board is where you look first.
- ◻ **Used the FLAGS, not a positional.** Measured, one command apart: an unknown **flag** is refused
  by name, exit 1; an unknown **positional** is **swallowed — exit 0, `ok:true`, and the entire log
  comes back.** The silent one is what you produce by reaching for a neighbouring tool's signature,
  and it does not fail: **it succeeds with the wrong answer.** If a read hands you far more than you
  expected, suspect your invocation before you suspect the channel.
- ◻ **Confirmed the backfill was COMPLETE, not merely successful.** Send it to a **file** and **parse
  the file** — not through a pipe, not straight into your context. **A payload that does not parse is
  a payload you did not fully receive.** Exit 0 is not the check, and neither is any completeness
  marker inside the payload: it is derived from what you are already holding, and it is the first
  thing a truncation eats. This is a **separate beat from the one above**, and strictly the more
  dangerous half: that one fails visibly, this one does not.
- ◻ **Checked what the SESSION says before treating this list as unconditional.** The manifest and
  this checklist are generated with **no session context** — which wires are armed, and what anchor
  this session starts from, are the lead's calls, made after both were written. **A live ruling beats
  either of them.** Arming is reversible: if you armed a wire the session had ruled against, kill it and say so
  — that is a minute, and it is how every recorded instance ended.
- ◻ **On `comms`** — your manifest always carries this wire, and it registers your presence. Monitor-wrap
  what it gives you, exactly as given — **no `grep` filter on this one; it emits no keepalives, and a
  filter here drops real messages.** Never reconstruct the command, and never go looking for the tool
  to decide. **`comms` missing from the manifest is a bug — raise it**, don't carry on unwired.
  **Catching up is a separate verb from following**: nothing clears this log, so a bare read replays
  every past session. Anchor with `--since <id>`; see **`anthill:comms`**.
- ◻ **On the board** — board tail wrapped in Monitor. Use the filter **verbatim from your join
  output**: it needs `grep -E` (plain `grep` treats `(a|b)` as a literal, so the Monitor stays
  silently empty) and `--line-buffered` (or frames are held back until a block fills).
  **Unlike `comms`, this one can come back `null`** — the board is a separate project on its own
  cadence, so its absence is a real state your manifest reports rather than a bug. **Arm what you were
  given; tell your lead what you were not.**
- ◻ **Introduced** on comms — a short "in, grounded, here's my lane".
- ◻ **Confirmed received, not just sent.** Get an explicit acknowledgement that your "in, grounded"
  **landed** — from the lead, naming your message. A wire that delivers nothing is indistinguishable
  from a quiet channel, and the first minute is the only cheap time to find out you are unwired.
  **Your `follow`'s start notice does not discharge this**, and the difference is the whole point: it
  tells you **your own receiver attached**, which is the incoming half. An acknowledgement naming your
  message is the only thing that tells you **your outgoing half works and a human-or-agent on the
  other end processed it.** Two directions, two checks; one has never covered the other.
- ◻ **Code-bearing message? Send it safely — on _every_ wire, not just the one you learned this on.**
  **Any** `send` on **any** of these tools — comms, the board, whatever the manifest hands you next —
  whose body carries backticks or code MUST go via `--stdin` (or a quoted heredoc). An un-quoted body
  is command-substituted by bash (backticked spans get executed, apostrophes mangle) _before the tool
  ever sees it_, corrupting the message or partially running it. **The tool cannot defend against
  this** — the damage happens in your shell, upstream of it, so no amount of care on the receiving
  end helps.
  - **⚠ THIS IS NOT ADVICE. `--stdin` (or a quoted heredoc) IS THE ONLY PROTECTION, because the damage
    is UNDETECTABLE AFTERWARDS FROM THE MESSAGE ITSELF.** An eaten span leaves **no marker** — the
    sentence simply reads as though it was written that way, and readers pass over the hole without
    noticing. _Measured: a seat lost three spans of a load-bearing result, including its mechanism
    sentence; two peers read straight past the gap, and a detector built afterwards **missed that very
    message** while its only hits were correct markdown._ **A post-hoc check for this is
    anti-correlated with the thing it tests. Quote at the moment of sending or you have nothing.**
  - **⚠ AND IT DOES NOT STOP AT THE MESSAGE — AN UNQUOTED BODY CAN WRITE TO THE SHARED WORKING TREE.**
    A comparison in your prose is a **redirection** to your shell: a body containing a
    `record.at >= sessionOpenedAt` span created **a file literally named `=` at the repo root**, in a
    tree four other seats were committing from, **where a careless `git add -A` would have swept it
    into someone else's commit.** _Found only because a land envelope happened to name it — no one would have
    traced that file back to a message._ **The blast radius of a mis-quoted send is the repository,
    not your paragraph.**
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
- ◻ **Scratch minted** — `<teamDir>/scratch/<handle>/<date>-<slug>.md`, so capture is frictionless.
- ◻ **Route through the lead — and SAY when you're waiting.** Questions + decisions go to the
  lead/liaison on comms, not direct to the human. But routing through the lead is a **default, not
  an exclusive channel** — the human can attach to your pane at any time, so never assume you're
  unobservable. And if you end up **blocked waiting on a human answer, post that on comms**:
  correct waiting produces no signal anywhere — not on the board, not in the tree, not in any sweep —
  so a silently-waiting seat is indistinguishable from a working one. One team lost an unknown stretch
  to exactly this.

## Output

A grounded seat: re-grounded in your role, present on the wires this session armed, scratch minted,
working your lane.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot it
to your scratch and raise it at `anthill:finalize-session` (or flag the lead). These skills improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a path, a default, an assumption this skill left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

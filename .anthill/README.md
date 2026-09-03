# team — how this team works (SOP)

The standard operating procedure for the agent team that builds this project. A **map, not a
manual** — it points at the source of truth rather than restating it. This is a **seed**: everything
here is meant to evolve by use, not stand as the final answer. The team coordinates on
**`anthill comms`** (the seat-aware log, durable across sessions) on the **`anthill-dev`** channel
(substance) and the bounty board (task state); **maestro** leads.
**`anthill-dev` is not only the wire's name** — it also keys the bounty board and names the tmux
session, so it identifies this team rather than any one tool.

> **⚠ `anthill <command>` below is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and every anthill skill prints it
> resolved. A bare `anthill` only works if someone installed the optional global launcher — and that
> launcher resolves to the highest CACHED release, which may not be the one this project is running.
>
> **`${CLAUDE_PLUGIN_ROOT}` is only set while a plugin skill is running** — outside one it expands to
> nothing and the command fails. Take the resolved invocation from `anthill:join` rather than retyping
> the form above; no document can carry a runnable path, because the path depends on where the plugin
> is installed.
> _Added 2026-08-10 to the template; mirrored here 2026-08-10, having been missed in the pass that
> added it — the exact cascade this footprint exists to receive._

## The idea: living context (stigmergy)

The team is **ephemeral agents in durable seats**. An agent's hard-won understanding would evaporate
between sessions — so each seat keeps a committed **living doc** (its brain), and the next agent in
that seat re-grounds from it. We're ants; the docs-and-code are the anthill; the **trail carries the
memory and shapes the next worker**. The docs are not documentation — they are the **pheromone trail
the next instance follows**.

### The three principles (the soul of the method)

1. **Stigmergy — docs as pheromone.** Each agent is an ant: ephemeral, but it leaves context for its
   successor. **Curation = strengthening the load-bearing trails and letting unimportant ones fade**,
   called over time. A lean, true trail beats an exhaustive, rotting one.

2. **Capture → report → curation, by someone else.** Don't wait for the end. Write into your **session
   report** as you work (`.anthill/reports/<date>/<handle>.md`, committed) — "this just bit me,"
   "this seam is fuzzy," "this went cleanly" — in full, for a reader who was not here. **Finalize**
   closes the report; it does not synthesise. A separate **curate** step, run outside the session by an
   agent who was not in it with the human ruling, decides what — if anything — becomes a doc, a skill,
   or a tool. The agent that did the work is the wrong one to decide what a stranger needs from it.
   (Your **scratch** — `.anthill/scratch/<handle>/<date>-<slug>.md`, gitignored — is for throwaways and
   never travels; anything worth a curator's time goes in the report.)

3. **The anthill adapts to the work.** Structure — app, process, **and team** — is mutable in service
   of the work. Persistent friction (toe-stepping, a seam that won't hold, an overloaded or idle
   seat) is a **signal to reshape, not to endure**.

## Where knowledge lives — curated docs, and the reports they are curated from

**Curated — nobody edits these during a session, including the seat they describe.** They change at
`anthill:curate`, from the reports, by an agent who was not in the session, with the human ruling.
`anthill commit` refuses them on an attributed commit without `--curated`.

- **Identity → the seat doc** (`dev/<handle>.md`) — who this seat is and what it owns: Who I am ·
  Scope · Boundaries · Relationships · Taste & reflexes. **Five sections, readable whole.** No lessons,
  no scars, no session log — those were tried here and did not change what the next agent did.
- **Truth → `dev/seams.md`** — the contracts _between_ seats, stated **once**, owned by the
  authoritative seat: invariant · ratified grain · proof. Seat docs **point** at it, never restate it.
- **Principles → `principles.md`** — what this team learned the hard way, each with its scar. Rare.
- **Method → `wiki/`** — one page per lifecycle touch point (convene · join · plan · work · finalize ·
  curate): **how this team does it.** anthill's skills are the triggers and point here; the pages are
  yours. Linted by `anthill wiki lint`.
- **Proof → the tests** — executable where it exists. A contract pinned to a green test can't rot.

**Reports — `reports/<date>/<handle>.md`** — one per seat per session, committed, on no joining seat's
read path. What happened, in full. The evidence the curated docs are curated from. See
`reports/README.md`.

**The one strict rule: defer to one source — don't restate shared truth.** Restating a contract in
three docs guarantees drift. Everything else stays flexible.

## Feedback — two homes (team-local vs. anthill-upstream)

Feedback is **generative first**: an idea, a suggestion, a "here's a nicer way this could work" is as
welcome as a bug report. Lead with the improvement, not just the friction — the corrective habit
(paper-cuts, "what bit me") silently discards the ideas a maturing tool most wants.

Route it by **where it lives**:

- **About _your_ project / team** (friction in your code, an idea for this repo) → stays here: your
  **session report**. Curation routes it — into a doc, a skill, a tool, or the project's backlog.
- **About _anthill itself_** — a bug, a rough edge, **or an idea to make anthill better** → send it
  _home_ so every project that uses anthill benefits. The path is **`anthill feedback`** (run
  `anthill feedback --help` for what it's for and how to invoke it — the command is the single source
  for that; this doc doesn't restate it).

> ### ⚠ IN **THIS** REPO THERE IS NO UPSTREAM — WE ARE IT.
>
> **`anthill feedback` files to `ichabodcole/anthill`, and `origin` here IS `ichabodcole/anthill`.**
> The command exists so **consuming** projects can send findings home. Used from this repo it opens an
> issue **against ourselves**, running parallel to the backlog + session process in `docs/ROADMAP.md`
> — and then someone has to triage it back out of GitHub into the very docs it came from.
>
> **So: anthill friction found HERE is ordinary session work.** It goes to `docs/backlog/` or into a
> session's scope in the roadmap, **not through `anthill feedback`.** Nothing stops you filing a
> GitHub issue if that is genuinely the right home — the point is that the *feedback command* is the
> middleman, and here there is nothing on the other side of it.
>
> _Found at session 12's close, by the human, after the lead had drafted a feedback issue about our
> own finalize ritual and called it "ready to send". **The mechanical guard is carded (`S13-I`):
> `anthill feedback` should notice that the current repo is its own target and say so** — because this
> paragraph is a situational warning, and `principles.md` says those fail at the recognition step._

**On a team, the lead owns the outward send.** A seat that hits anthill friction **surfaces** the
candidate to the lead (on comms, or as a `--submit`-ready draft) — it does **not** `anthill feedback
--submit` itself. The lead **dedupes** (N seats hitting one bug shouldn't file N issues) and submits the
deduped set, the same way the lead owns the atomic land and routes decisions to the human. **Solo?
You're the lead** — compose, confirm with the human, submit.

## The seats

See **`dev/README.md`** for the roster + division of labor. Each seat has its own living doc under
`dev/`. Decisions and questions route to the human **through maestro** (the lead / liaison), not
direct.

> **The lead is the routing DEFAULT, not an exclusive channel — and don't tell seats otherwise.**
> Routing through the lead exists so four seats' questions become one ruling-with-reasoning instead of
> four uncoordinated pings. It is not a claim that the human can't see you: `anthill spawn` gives each
> seat its own tmux pane in a session the human can attach to **at will**, so "the human isn't watching
> — talk to me" is **false by construction** and a lead who asserts it is wrong.
>
> Why it matters: a lead who believes it is the only channel will not look for a seat that is stuck on
> a human answer — and **a correctly-waiting seat produces no signal at all.** Not on the board, not in
> the tree, not in any sweep. One session lost an unknown stretch to exactly this, surfacing only when
> the seat volunteered it. **If you are waiting on a human, say so on comms**; waiting silently is
> indistinguishable from working.

## Tools

- **Bounty board** — task state (`todo → doing → review → done`). The **doer owns its card's
  lifecycle**; the lead creates + assigns (leaves in `todo`) and hands off on comms; the reviewer
  closes. The board is _state_. **It's key-bound:** `convene` owns the board-open (keyed to the team
  channel, pinned via `.bounty-session`), so **in one shared working tree** every seat + the lead
  target this board **ambiently** — no one threads `--session`.
  **Per-seat git worktrees void that**, and the failure is silent: the board id is derived from the
  repo path, so a worktree resolves a different one and the pinned file is gitignored and never
  crosses. **A miss reports "no running bounty session", which reads as "the board isn't up."**
  Session 6 hit this on all five seats — resolve the id once and pass it explicitly, and know that the
  ambient guarantee is the thing you traded.
  The mechanism lives once in the **board-binding contract** in
  [`dev/seams.md`](./dev/seams.md); this points at it, never restates it.
- **Comms (`anthill comms`, channel `anthill-dev`)** — the team's **seat-aware message log**, and the
  wire. Seats discuss, coordinate, reconcile; comms is _substance_. Decisions route to the human
  **through maestro**, not direct. Identity is a seat from the roster rather than a free-form alias,
  and **nothing clears the log** — it accumulates across sessions, so a bare read replays every
  session this team has ever had. Anchor a catch-up to an id.
  **⚠ There is one wire, so there is no second one to fall back to** — and a wire that silently
  delivers nothing looks exactly like a quiet channel. **`anthill comms positions` is what answers
  it:** it reports every seat against the head as `null` / `0` / `N`, needs no seat of its own, and is
  what you reach for when you suspect **your own** wire. A gap of `null` means the tool has no idea
  what that seat has seen — it is **not** a rounded-down zero. The mechanism lives once in
  [`dev/seams.md`](./dev/seams.md) Contract 6; this points at it, never restates it.
- **The CLI** — `anthill` (run from the plugin; `convene` / `join` / `spawn` / `status` / `commit` /
  `down` wrap comms + bounty + tmux). `anthill join <handle>` emits your grounding docs + an
  action checklist — that checklist is the single source; don't restate it.

## Workflow — convene → plan → work → finalize

- **Convene** — the lead grounds, gathers the work from the human, stands up coordination (channel +
  board), seeds cards, briefs + spawns the seats the **current phase** needs. Composition is a
  _hypothesis_, not law.
- **Plan** _(multi-seat features)_ — the lead scaffolds a plan **skeleton** (the integration order +
  the cross-seam interface contracts, as _claims_), then each owning seat **ratifies or falsifies
  the seams it touches before drafting**. The skeleton is a **hypothesis**, not blanks to fill —
  the value is catching a wrong seam _before_ merge. Run **`anthill:plan`** (single-source
  methodology). Solo work skips it and uses plain single-agent planning.
- **Work** — builders build against the ratified seams; the lead and seats watch for **structure
  signals** (toe-stepping, a renegotiated seam, an overloaded/idle seat, a verify finding that
  bounces work back).
- **Finalize** — each seat **closes its report** (what it hit · what worked · what it would change)
  and **lands its own**; the lead closes the lead report with the **carry-forward** the next convene
  reads, sweeps the docs of record, places every deferred item; then each seat **stands down last**.
  Nothing curated changes. The lead tears down the session.
- **Curate** _(outside any session)_ — a fresh agent and the human read the unprocessed reports and
  decide what, if anything, flows into a seat doc, a seam, a principle, a wiki page, a skill, or
  tooling. Disagreements are written on `.anthill/wiki/touchpoints/curate.md`: that is the method
  accreting. Run **`anthill:curate`**.

**Verification is dynamic, not end-of-line.** A verify seat engages at **verification points** —
which may be early (we need tests before building further), mid (prove a feature), or late — and
often **stays** and ping-pongs with builders (fail → back to the owner → re-verify). The lead decides
per phase when to pull each seat in; the plan's phases drive that, not a fixed end slot.

## Committing on the shared tree

Seats share **one working tree + one git index**. A bare `git commit` (after `git add`) takes the
whole index → it **sweeps a peer's staged file** into your commit; concurrent commits also race git's
index. So:

**Land with the command `anthill join <your-handle>` printed for you — verbatim, and don't rebuild it.**
It arrives fully resolved: this project's **gate and the commit in one string with no pipe in it**,
your handle substituted, and the message read from a **file** (`-F`) rather than an argument.
The land it performs (1) commits the **named paths only** (refuses to run with no paths — no
accidental sweep) and (2) holds a **serialize lock** so concurrent seats queue instead of racing. It
**is** also the atomic cross-seat land: the lead collects every seat's paths and passes them in one
call → one commit across the seats.

**Two shell hazards it exists to remove, both of which beat agents who had just read the warning:**
**never pipe the gate** (`gate | tail && commit` tests `tail`'s exit status, always 0, so the commit
runs on a **red gate** — redirect to a file and read that), and **never pass a backtick-bearing body
with `-m`** (the shell substitutes it before the tool sees it; that is upstream of any defence the
tool could mount). **n=3 in one session, two agents** — one of them the seat who built `-F`.
(The raw discipline if you must land by hand: `( <gate> ) && git commit -F <msgfile> -- <explicit paths>`
with an `Anthill-Seat:` line in the body — never `git add -A`.)

**The gate is THIS project's, from `gate` in `.anthill/config.json` — no default, on purpose.** Ours is
`bun run check`. Unset, the emitted command announces that it is running no verification rather than
quietly committing unchecked; if you ever see that announcement, tell the lead rather than working
around it.

**⚠ In PER-SEAT WORKTREES the hand form stops being an equivalent fallback — use the tool.**
Worktrees give each seat its own index, so the sweep hazard above genuinely goes away and the
obvious inference is that a bare commit is now safe.
It isn't, and the reason is not visible from the index: **git shares `refs/stash` across every
worktree of a repo** while `HEAD` and the index are per-worktree, and a pre-commit hook that stashes
(lint-staged does, on every commit) writes to exactly that shared ref.
**So the one thing seats still share is the ref holding uncommitted work, and `anthill commit`'s lock
is the only mutex over it.**
Isolation moved the race from the index to the stash; it did not remove it.
_(Session 6. Proven: `git rev-parse --git-path refs/stash` resolves to the common dir from a
worktree while `HEAD` resolves per-worktree — the second half is the control that makes the first
mean something. What is **not** proven is that a collision has actually eaten anyone's work; the
guidance is correct without that, and saying so is the honest form.)_

**`--as` is not optional in practice.** Git records the **human** as the author of every seat's commit
— all of them, identically — so without the seat stamp _"who landed this?"_ is unanswerable after the
fact. A team hit exactly that: an unexplained commit appeared mid-session, the lead had to ask the
channel, and the author was identified only because they volunteered. `--as` adds an
`Anthill-Seat: <handle>` trailer, so `git log --grep "Anthill-Seat: <handle>"` answers it mechanically.
It does **not** change git's author field; it adds a line git can search.

**⚠ Know exactly what this protects.** The pathspec protects against sweeping a peer's **files**. It
does **not** protect their **uncommitted edits inside a file you both write to** — naming
`seams.md` commits _whatever is in `seams.md` right now_, including the paragraph a peer is
mid-sentence on. This is reproduced, not theoretical: the commit returns `{"ok":true}` and **no guard
fires**, because from git's point of view nothing is wrong. Worse, **the committer's own verification
cannot see it** — _"my paths are clean"_ is true and blind.

`seams.md` is where this recurs by design, since ownership there is per-contract inside one file. So
for a **shared** file: say on comms that you're taking it, and land your edit promptly rather than
holding it while others write. A short hold is the only real protection the tooling gives you here.

**Read the envelope your land returns — it already answers two questions we kept reconstructing by
hand.** Both are on `anthill commit`'s own output, on every land:

- **`waitedMs`** — how long you queued on the serialize lock. Non-zero means a peer was landing at the
  same moment, so this **is** the concurrency window, measured rather than estimated.
- **`uncheckedAgainst`** — dirty paths **outside** your commit at the instant it landed. The gate runs
  over the **whole tree**; your commit contains only your paths. **Non-empty means your green was
  measured against work your commit does not include, so the commit was never checked in isolation.**
  That is the false-green, reported at the moment it happens rather than discovered later.
- **⚠ THE TWO FIELDS INTERACT, AND AN EMPTY `uncheckedAgainst` IS NOT AN ALL-CLEAR — it is weakest
  exactly where it reads strongest.** The dirty-path read happens **after** your lock wait, so a peer
  who was dirty during your gate and **landed while you queued** is clean by the time the field is
  computed, and never appears in it. **So the field is LEAST trustworthy precisely when `waitedMs` is
  LARGE** — and *"I waited 11 seconds and came back clean"* is the single most reassuring pair the
  envelope can print. **Read them together: a long wait with an empty list means peers landed inside
  your window, not that nobody did.**
  _Measured: `waitedMs 11053.9` with `uncheckedAgainst []`, with **two commits landing inside that
  window**. Mechanism found by the seat who owns the emitter; the ordering re-checked against the
  source by the seat who owns this prose._
  **This is the anti-correlated shape this team keeps meeting — a check that cannot fail in the failing
  case — and we already have that sentence in another file, about backfill completeness. Neither knew
  about the other.**

_Scar (session 5): three seats reconstructed the residual land-race window by three separate methods —
while the CLI printed it on every one of their commits. The lead relayed an `uncheckedAgainst` list to
a peer and never asked what it was worth. **The affordance was not missing; it was unnamed.** That was
the session's characteristic failure, and this paragraph is the fix. **Check `uncheckedAgainst` before
you treat a green as a verdict on your commit.**_

## Shared practices (true for every seat)

> **The team's PRINCIPLES live in [`principles.md`](./principles.md), not here** — the hard-won
> claims about how work goes wrong, each with the scar that paid for it. **Read them at convene and
> at join.** What stays below is *mechanics*: how this team formats, addresses, and lands things.
> The split exists because the two accrete differently — a principle is earned once and travels to
> other teams; a practice is local and changes with the tooling.

- **Write for the preview — the first ~200 characters are the only part that reliably lands.** Peers
  receive your message as a truncated notification and decide from that whether to fetch the rest.
  Most messages are never fetched in full. So lead with the **verdict, not the setup**: what you
  found, what changed, what someone must do. A message whose point is in paragraph three was, for
  most of the team, not sent. (Every seat on a studied team evolved this independently, each thinking
  it was a personal habit.)
- **Address in the headline: `## <you> → <who>:`.** There is no routing — everything goes to
  everyone — so the arrow is a **salience hint, not a filter**. Two things follow. Put it in the
  headline or it lands below the cut. And **do not use a peer's arrow to decide to skip**: a seat who
  did that nearly shipped a broken test, because a falsification addressed to the lead was about his
  lane. Read on topic, not on address.
- **When you ratify or post a verdict, name the last message id you had read** — _"ratifying as of
  #14."_ Messages cross: two seats can ratify contradictory things simultaneously, and the channel has
  no notion of a message being in flight. A read-watermark lets the other seat see instantly that your
  call predates their falsification, instead of discovering it later. (New convention — tell us
  whether it earned its keep.)
- **When ONE message answers SEVERAL, index it by the message ids it answers — never by topic.**
  A table (`| msg | from | ask | answered in |`) turns an unanswered ask into a **visible blank cell**;
  a topic-shaped ruling leaves it an **absence**, and an absence is not readable.
  This is the read-watermark's counterpart: a seat stamps **what it had read**, and whoever rules stamps **what it answered**.
  It bites hardest for the lead, because answering several asks at once is the lead's default rather than an occasional act.
  **Why writing "be thorough" cannot fix it:** a _"what I am NOT ruling on"_ section is enumerated from the author's **agenda** — the questions they are consciously holding — and not from the **inbox** of asks that arrived.
  The omission and the deferral are produced by the same pass, so **the guard is blind in exactly the case it exists for**, and the ruling reads _more_ complete for having the section.
  Same move as a total field whose `false` you can read: a readable blank beats a missing entry.
  _Scar (session 10): a lead ruled six asks and explicitly named three he was not ruling on, and a seat's two asks appeared in neither list._
  _One of them was **nearly** covered by a ruling on the same class — and "nearly" is the defect, because **a ruling that resolves the class without naming the instance is indistinguishable from one that missed it**, so the seat cannot tell whether it has been answered or overlooked._
  _The table earned its keep a second way nobody predicted, within the hour: it makes a **wrong** entry auditable. A row recorded a claim whose own author retracted it minutes later, and the row is what made the stale entry findable and struck._
- **The atomic cross-seat land: assemble, don't marinate.** When several seats' halves are
  uncompilable until all of them land, the naive approach parks everyone's red work in the shared tree
  for as long as the slowest seat drafts. Instead: **draft out-of-tree in gitignored scratch → post
  `READY: <paths>` → the lead calls the land → all seats move files in at once → one gate run over the
  assembled whole → one `anthill commit`.** That shrinks the red window from _the slowest seat's
  drafting time_ to _the assembly_. Two corollaries, each a root cause a team hit repeatedly:
  **land supporting code INERT and early** (an unused-but-green module can land now; holding it because
  the _feature_ is unfinished blocks peers for no reason), and **draft new files in scratch, not on the
  shared gate surface.**
- **Baseline at join, baseline at close.** Post the gate's numbers when you arrive and again when you
  leave, so the session's delta is a **measurement rather than an impression**. (A session reported a
  wrong gate delta in its own retro for exactly this lack.)
- **Mark an absence of verification explicitly — `UNVERIFIED`, or `UNVERIFIED-BY-CONSTRUCTION`** when
  the thing cannot be checked from where you stand. An unmarked claim reads as measured; **hoping the
  reader notices the gap is not a signal.**
- **A seat silent while holding a `doing` card is different from a seat quiet between tasks.**
  Roughly ten messages of the former is the cue to look at its pane — a blocked seat produces no
  output and every other surface reads normal.
- **One sentence per line in the living docs.** These docs live in the host repo, so its formatter
  (prettier / biome) may reflow them — and a hard-wrapped continuation line can be mangled into a
  stray list bullet, corrupting the trail. One sentence per line makes a reflow a no-op.

## Finalize — close the report; curation does the rest

At finalize, **close your report**: answer the three prompts at the bottom of
`reports/<date>/<handle>.md` — what you hit · what worked · what you would change — in prose, in full,
for a curator who was not here. Name this project's tools, docs and teammates freely; make the
**event** survive without you: what was done, what happened, what it cost. Say what a number meant,
not what it was. **Proposals, not edits**: if your seat doc, a seam, a principle or a wiki page read
wrong this session, say so here. Then land the report with the land command your join emitted.

**You do not synthesise.** The old ritual promoted lessons from scratch into the seat doc here, with
a cold read and a seams pass and a retro after it. Measured across two teams it produced seat docs
past a thousand lines that the next agent read and then repeated the mistakes they named — the agent
writing its own doc is context-rich about the session and blind to what a stranger needs. So the
report is the outlet, and `anthill:curate` — later, outside the session, a fresh agent with the human
ruling — is where anything durable gets written. How this team closes a report, what its docs-of-record
sweep covers, and what the lead carries forward is on **`wiki/touchpoints/finalize.md`**; the skill is
the trigger, the page is the method.

**The lead's report** carries **carry-forward**: what the next session must test, decide, or not do,
each with what would prove it wrong — including whether the team's shape fit the work. The next
convene reads it. **The lead also sweeps the docs of record** — the plan of record, the roadmap, the
proposal: anything that claims something true of the tree and that no seat owns — and writes a dated
`HELD` / `FALSIFIED` / `UNCHECKED` line into each, claim by claim. `UNCHECKED` is a real verdict and
must be written.

### Standing down — a seat's LAST act, and the verb has to be named

**Every seat ends with `anthill comms stand-down --as <handle>` — after closing its report, after landing it, and after anything else it has to say.**
That order is the whole content of this beat: **stand down last.**

**Name the verb when you call for it.** The instruction a seat receives at join says _"commit, **THEN stand down**"_ — in English, without naming the command — so a seat reads it as _"finish up and leave"_, which is an act with no artifact.
**A departure only exists if the verb ran.** It writes a record, and for a **spawned** seat that record is what lets `anthill down` authorise a teardown **without `--force`**.

**⚠ maestro is a seat and is NOT a spawned one — so the same act does a different job for the lead.**
The teardown check quantifies over **the seats this session spawned**, and the lead convened rather than being spawned into that set, so **the lead's departure record does not enter that count at all.**
The lead still stands down, for the other reason: **a live follower is what makes a seat look present**, and the lead's own follow is the last one running.
**⚠ So for the lead, "last" means LAST BEFORE `anthill down` — not last of all.** The presence rows are built from the whole roster (`config.seats`), the live-follower branch is consulted first, and convene handed the lead that follower — so **the guard refuses him BY NAME after every spawned seat has correctly departed.** The order is **seats stand down → the lead stands down → `anthill down` → panes die**, and the discriminator is the **departure record, not the pid**: once he has stood down the teardown is authorised with his follow still alive, so there is nothing to kill first and nothing to wait for.
_Scar (session 13): the lead published **"I stand down last, after `anthill down`"** — a reading this section's own wording permitted — and the guard refused him by name thirty seconds later. **The scar below is a lead improvising the inverse order ON THE WIRE; this one was reachable straight from the artifact**, which is the worse of the two because nothing evaporates._
**State which population you mean whenever you write a rule about "every seat"** — this beat was drafted saying the record authorises teardown, full stop, and that sentence was **true of spawned seats and false of the lead who reads it.**

**What the record does NOT mean.** It is an **administrative** statement — _"I am finished"_ — **not** _"this pane is inert."_
A seat that has stood down **may still send**, deliberately, and that is not a violation: `down` kills **panes**, and a pane is not a statement.
So treat a late message as normal, and never let a departure record talk you out of reading one.

_Scar (session 9): the lead improvised **"stand down, then post your retro answers"** on the wire — the **inverse** of the order above._
_**All four seats followed the wire and not the instruction each had read at join.** Seven messages landed after their authors' own departure records, including the report of the session's central defect, **71 seconds after** its author had stood down._
_**The order was not missing. It was present, correct, and overridden by a message that evaporates** — which is why it is written here, where it does not._

_Scar (session 10, and it is about this file): the beat above shipped to `plugin/templates/` — what a NEW team receives at `init` — and **not here**, where this team actually reads. `init` renders once and nothing refreshes it, so **an author fixes the scaffold and leaves their own team without the fix.** Caught by grepping both copies, hours before this team ran the ritual. **When you land guidance into the template, mirror it here in the same breath.**_

## Onboarding a fresh agent

Ground in the **product** first (the `grounding` docs in `.anthill/config.json`), then: this SOP →
`dev/seams.md` (shared contracts) → your seat's `dev/<handle>.md` (identity only) → the wiki page for
the touch point you are in → go. For the current state of play, check the bounty board + the active
project docs. **Do not edit your seat doc** — if it is wrong, say so in your report; curation fixes it.

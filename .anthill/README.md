# team — how this team works (SOP)

The standard operating procedure for the agent team that builds this project. A **map, not a
manual** — it points at the source of truth rather than restating it. This is a **seed**: everything
here is meant to evolve by use, not stand as the final answer. The team coordinates on the
**`anthill-dev`** grapevine channel (substance) and the bounty board (task state); **maestro** leads.

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

2. **Running capture → curated synthesis.** Don't wait for the end. Keep a cheap **running session
   scratch** as you work (`.anthill/scratch/<handle>/<date>-<slug>.md`, gitignored) — "this just bit
   me," "this seam is fuzzy." **Finalize** is where those are articulated into durable form for the
   next agent. Cheap capture, deliberate synthesis.

3. **The anthill adapts to the work.** Structure — app, process, **and team** — is mutable in service
   of the work. Persistent friction (toe-stepping, a seam that won't hold, an overloaded or idle
   seat) is a **signal to reshape, not to endure**.

## Three homes — where knowledge lives

- **Taste → the seat doc** (`dev/<handle>.md`) — each seat's own face: scope + boundaries,
  relationships, reflexes, anti-patterns, hard-won lessons. Opinionated. **Capture judgments, not
  file maps** — the reasoning and the generalizable lesson, never a lesson-less event.
- **Truth → `dev/seams.md`** — the contracts _between_ seats, stated **once**, owned by the
  authoritative seat. Seat docs **point** at it, never restate it.
- **Proof → the tests** — executable where it exists. A lesson pinned to a green test can't rot.

**The one strict rule: defer to one source — don't restate shared truth.** Restating a contract in
three docs guarantees drift. Everything else stays flexible.

## Feedback — two homes (team-local vs. anthill-upstream)

Feedback is **generative first**: an idea, a suggestion, a "here's a nicer way this could work" is as
welcome as a bug report. Lead with the improvement, not just the friction — the corrective habit
(paper-cuts, "what bit me") silently discards the ideas a maturing tool most wants.

Route it by **where it lives**:

- **About _your_ project / team** (friction in your code, an idea for this repo) → stays here: your
  `anthill:finalize-session` synthesis or `paper-cuts.md`. It loops back into your own work.
- **About _anthill itself_** — a bug, a rough edge, **or an idea to make anthill better** → send it
  _home_ so every project that uses anthill benefits. The path is **`anthill feedback`** (run
  `anthill feedback --help` for what it's for and how to invoke it — the command is the single source
  for that; this doc doesn't restate it).

**On a team, the lead owns the outward send.** A seat that hits anthill friction **surfaces** the
candidate to the lead (on the vine, or as a `--submit`-ready draft) — it does **not** `anthill feedback
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
> the seat volunteered it. **If you are waiting on a human, say so on the vine**; waiting silently is
> indistinguishable from working.

## Tools

- **Bounty board** — task state (`todo → doing → review → done`). The **doer owns its card's
  lifecycle**; the lead creates + assigns (leaves in `todo`) and hands off on the vine; the reviewer
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
- **Grapevine (`anthill-dev`)** — the back-channel. Seats discuss, coordinate, reconcile. The vine is
  _substance_. Decisions route to the human **through maestro**, not direct.
- **The CLI** — `anthill` (run from the plugin; `convene` / `join` / `spawn` / `status` / `commit` /
  `down` wrap grapevine + bounty + tmux). `anthill join <handle>` emits your grounding docs + an
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
- **Finalize (+ reflection)** — each seat curates its scratch → seat doc and **lands its own**; a
  shared `seams.md` pass; then the **structure reflection** and the **retro** (below). The lead lands
  what is genuinely cross-seat and tears down the session.

**Verification is dynamic, not end-of-line.** A verify seat engages at **verification points** —
which may be early (we need tests before building further), mid (prove a feature), or late — and
often **stays** and ping-pongs with builders (fail → back to the owner → re-verify). The lead decides
per phase when to pull each seat in; the plan's phases drive that, not a fixed end slot.

## Committing on the shared tree

Seats share **one working tree + one git index**. A bare `git commit` (after `git add`) takes the
whole index → it **sweeps a peer's staged file** into your commit; concurrent commits also race git's
index. So:

**Use `anthill commit --as <your-handle> -m "<msg>" <path>…`** for every land. It (1) commits the **named paths only**
(refuses to run with no paths — no accidental sweep) and (2) holds a **serialize lock** so concurrent
seats queue instead of racing. The same command **is** the atomic cross-seat land: the lead collects
every seat's paths and passes them in one call → one commit across the seats. (The raw discipline
holds if you commit by hand: `git commit -m "<msg>" -- <explicit paths>`, never `git add -A`.)

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
for a **shared** file: say on the vine that you're taking it, and land your edit promptly rather than
holding it while others write. A short hold is the only real protection the tooling gives you here.

**Read the envelope your land returns — it already answers two questions we kept reconstructing by
hand.** Both are on `anthill commit`'s own output, on every land:

- **`waitedMs`** — how long you queued on the serialize lock. Non-zero means a peer was landing at the
  same moment, so this **is** the concurrency window, measured rather than estimated.
- **`uncheckedAgainst`** — dirty paths **outside** your commit at the instant it landed. The gate runs
  over the **whole tree**; your commit contains only your paths. **Non-empty means your green was
  measured against work your commit does not include, so the commit was never checked in isolation.**
  That is the false-green, reported at the moment it happens rather than discovered later.

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

## Finalize + the structure reflection

At finalize, **synthesize**: promote the durable lessons from your scratch into your seat doc (or
`seams.md` if it's a boundary truth), **prune**, keep it lean. Pin a lesson to a green test where you
can; to a durable concept or a commit otherwise; never to a transient line/file ref.

**One intake, route at synthesis.** Capture everything cheaply into one place (your scratch) _as you
work_ — don't stop mid-task to decide whether a note is a seat-doc lesson, a seam truth, or a
paper-cut. The genre-sorting happens **here, at finalize**, when you route each captured note to its
durable home. Sorting-while-working is a tax that suppresses capture.

**A hypothesis is a fourth home, and it is the one the routing list keeps missing.** A lesson says
what you now know; a **hypothesis** says what you predict and what would prove it wrong — so it goes
to the **retro** (team-level, where the next convene reads it back) or to your **seat doc** (personal,
re-read at join), and to exactly one of them. State it once: a prediction copied into two homes
drifts, and a **stale prediction is worse than a stale lesson** because it commissions work against a
world that has already moved.

Then the **structure reflection** — the team turns the lens on itself:

- **Where did we step on each other?** (overlapping scope → a boundary to draw or a seat to split.)
- **What are the natural seams?** (the contracts that actually emerged vs. the ones we guessed.)
- **Who actually owned what?** (vs. the roster on paper.)
- **Did the composition fit the work?** (an idle seat, an overloaded one, a missing lens.)

Its output flows to seat docs, `seams.md`, and **occasionally the roster/config itself** — re-run
`anthill init` after a reshape to render new seat docs (existing ones are never clobbered). The
anthill is yours to re-shape.

Then the **retro** — _what went well · what didn't · what would you change_ — written to
`.anthill/retro.md`, newest first. It differs from the reflection above by asking for **judgement**
rather than shape, and two rules are what make it more than a mood:

- **Every "what would you change" is a HYPOTHESIS the next session can test**, or it isn't an answer.
  The next convene reads them back and says which it will test — so a prediction that comes back
  **wrong** is the valuable outcome, not a failure of the team that wrote it.
- **Agreement is not truth: ask what is behind each answer besides everyone agreeing.** Claims about
  **artifacts** are executable — run them, and nobody had to agree with anything. Claims about **us**
  are testimony; label them, and prefer the version carrying a number, a diff or a count. A retro of
  agents who shared one session and one frame will converge, and that convergence is the expected
  output of shared priors rather than evidence. **A unanimous "what went well" is a smell.**
  **The lead is in scope** — a retro where the lead comes out clean is a retro that did not run.
  **And the lead should not open by listing his own errors.** It reads as the opposite of
  defensiveness and it is not: **a well-executed self-list pre-empts the audit**, leaving a seat
  nothing to do but concur, so the document becomes indistinguishable from one where the audit found
  nothing. _Scar (session 5): the lead volunteered six of his own failures in the finalize brief to
  make the audit easy, and scout then checked and found **no seat produced a criticism of the lead he
  had not already volunteered.**_ Say you are in scope; then say nothing until the seats have written.

## Onboarding a fresh agent

Ground in the **product** first (the `grounding` docs in `.anthill/config.json`), then: this SOP →
`dev/seams.md` (shared contracts) → your seat's `dev/<handle>.md` → go. For the current state of
play, check the bounty board + the active project docs. Then **keep your seat doc honest**: when
something's no longer true, fix it.

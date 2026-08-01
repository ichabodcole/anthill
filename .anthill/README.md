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
  channel, pinned via `.bounty-session`), so every seat + the lead target this board **ambiently** —
  no one ever threads `--session`. The mechanism lives once in the **board-binding contract** in
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
- **Finalize (+ reflection)** — each seat curates its scratch → seat doc; a shared `seams.md` pass;
  then the **structure reflection** (below). The lead lands the doc commits and tears down the
  session.

**Verification is dynamic, not end-of-line.** A verify seat engages at **verification points** —
which may be early (we need tests before building further), mid (prove a feature), or late — and
often **stays** and ping-pongs with builders (fail → back to the owner → re-verify). The lead decides
per phase when to pull each seat in; the plan's phases drive that, not a fixed end slot.

## Committing on the shared tree

Seats share **one working tree + one git index**. A bare `git commit` (after `git add`) takes the
whole index → it **sweeps a peer's staged file** into your commit; concurrent commits also race git's
index. So:

**Use `anthill commit -m "<msg>" <path>…`** for every land. It (1) commits the **named paths only**
(refuses to run with no paths — no accidental sweep) and (2) holds a **serialize lock** so concurrent
seats queue instead of racing. The same command **is** the atomic cross-seat land: the lead collects
every seat's paths and passes them in one call → one commit across the seats. (The raw discipline
holds if you commit by hand: `git commit -m "<msg>" -- <explicit paths>`, never `git add -A`.)

**⚠ Know exactly what this protects.** The pathspec protects against sweeping a peer's **files**. It
does **not** protect their **uncommitted edits inside a file you both write to** — naming
`seams.md` commits _whatever is in `seams.md` right now_, including the paragraph a peer is
mid-sentence on. This is reproduced, not theoretical: the commit returns `{"ok":true}` and **no guard
fires**, because from git's point of view nothing is wrong. Worse, **the committer's own verification
cannot see it** — _"my paths are clean"_ is true and blind.

`seams.md` is where this recurs by design, since ownership there is per-contract inside one file. So
for a **shared** file: say on the vine that you're taking it, and land your edit promptly rather than
holding it while others write. A short hold is the only real protection the tooling gives you here.

## Shared practices (true for every seat)

- **Root-cause before cutting.** Report the root cause with evidence _before_ editing a fix — don't
  cut a phantom, don't assert a cause you haven't proven.
- **Verify the real artifact, not a proxy.** Trust the rendered output; distrust the measurement or
  the stub. A proxy will eventually lie.
- **The vine evaporates — land decisions in an artifact.** The grapevine is substance _in the
  moment_, but it's not durable: a decision that outlives the session (a ratified seam, a chosen
  approach, a rejected option + why) must be written into an artifact — `seams.md`, a seat doc, the
  plan, a project doc — **before finalize**, or it's gone when the panes close.
- **No store without a named re-read moment.** Every place knowledge is written must have a moment it
  is _read back_ (join re-grounds in the seat doc; convene reads the roadmap; finalize reads the
  scratch). A store nothing re-reads is a write-only leak — don't create one.
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
- **A ruling must name what it did _not_ rule on.** A long, authoritative message that silently omits
  someone's item is indistinguishable from one that resolved it — silence and resolution look
  identical, and a seat registered "ruled" and moved on with both of his asks unaddressed. If you're
  the one ruling, list the open items you are **not** deciding yet.
- **There is no message budget.** Nothing in the tooling limits how much you send, and seats
  nonetheless ration themselves and start compressing. That compression is where findings die: what
  gets cut is the second-most-important thing you know. A real finding buried as a subordinate clause
  in a message about something else **is a finding you did not send** — one died exactly that way.
  If it deserves attention, give it its own message.
- **When you ratify or post a verdict, name the last message id you had read** — _"ratifying as of
  #14."_ Messages cross: two seats can ratify contradictory things simultaneously, and the channel has
  no notion of a message being in flight. A read-watermark lets the other seat see instantly that your
  call predates their falsification, instead of discovering it later. (New convention — tell us
  whether it earned its keep.)
- **Never ask through a channel that stops you receiving the answer.** A blocking prompt in your own
  pane is invisible to every instrument the team has: the board still says `doing`, the vine says
  nothing, `anthill status` still shows you present, the tree shows nothing. A seat sat behind a modal
  for ~40 messages **on the critical path** while the lead's ruling and the human's answer were both
  already on the vine, waiting for him. **Asking twice through two channels is not redundancy — the
  blocking one silently wins.** Put the question where the answer can reach you, then keep working or
  say you're blocked.
- **Verify a claim that indicts you as hard as one that flatters you.** A seat who re-measured
  everything all session accepted exactly one claim on sight — the one saying she was wrong — and it
  was false; her original statement had been right. **A correction that indicts you arrives feeling
  pre-audited**: it's against the speaker's interest, it comes from a careful colleague, and agreeing
  is the humble-looking move. Worse, **retractions travel further than claims** — three seats had
  publicly agreed, so the next reader would have deleted correct work as settled.
- **Confirm a check processed a non-zero count of the things you meant.** `Tasks: 6 successful` counts
  task _disposition_, not execution — a cache hit reports success for work it decided not to do, while
  the same tree fails a direct run. `Checked 0 files. No fixes applied.` exits 0 when your CWD has
  drifted. **The tool is not lying; it is answering a coarser question than the one you asked.** Read
  the count, not just the verdict.
- **A contract is a description, not a trigger.** Prose in a shared doc cannot make anyone _notice_
  they moved a boundary. A seat broke a two-artifact contract **three times in one session** — one he
  owned, had just written the lesson for, and had quoted to three peers while breaking it. What caught
  it was a compiler, in four seconds. **Being convinced of a rule does not make it fire, and may
  substitute for protection, because conviction feels like vigilance.** If a contract spans two
  artifacts, give it a mechanical trigger — a test or a type that spans both.
- **The atomic cross-seat land: assemble, don't marinate.** When several seats' halves are
  uncompilable until all of them land, the naive approach parks everyone's red work in the shared tree
  for as long as the slowest seat drafts. Instead: **draft out-of-tree in gitignored scratch → post
  `READY: <paths>` → the lead calls the land → all seats move files in at once → one gate run over the
  assembled whole → one `anthill commit`.** That shrinks the red window from _the slowest seat's
  drafting time_ to _the assembly_. Two corollaries, each a root cause a team hit repeatedly:
  **land supporting code INERT and early** (an unused-but-green module can land now; holding it because
  the _feature_ is unfinished blocks peers for no reason), and **draft new files in scratch, not on the
  shared gate surface.**
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

Then the **structure reflection** — the team turns the lens on itself:

- **Where did we step on each other?** (overlapping scope → a boundary to draw or a seat to split.)
- **What are the natural seams?** (the contracts that actually emerged vs. the ones we guessed.)
- **Who actually owned what?** (vs. the roster on paper.)
- **Did the composition fit the work?** (an idle seat, an overloaded one, a missing lens.)

Its output flows to seat docs, `seams.md`, and **occasionally the roster/config itself** — re-run
`anthill init` after a reshape to render new seat docs (existing ones are never clobbered). The
anthill is yours to re-shape.

## Onboarding a fresh agent

Ground in the **product** first (the `grounding` docs in `.anthill/config.json`), then: this SOP →
`dev/seams.md` (shared contracts) → your seat's `dev/<handle>.md` → go. For the current state of
play, check the bounty board + the active project docs. Then **keep your seat doc honest**: when
something's no longer true, fix it.

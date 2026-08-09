# Project Manifesto

**Last Updated:** 2026-08-08 — the product anchor, the human's role and decision rights, the
intersection principle, and the human-observability direction. Prior revision 2026-07-03.

---

## What Is This?

anthill is a portable **team-OS** for agentic development — a Claude Code plugin that installs
a multi-agent development team into _any_ project. The model is **ephemeral agents working in
durable seats**: roles persist, the agents filling them come and go, and each departing agent
leaves its context behind as a trail for the next. The name is the thesis: agents are ants, and
the living docs are the pheromone trail.

## Who Is It For?

**Two answers, and conflating them is why this section had to be rewritten.**

**Who ADOPTS it:** developers who run agentic development through Claude Code and want more than a
lone assistant — a coordinated **team** (a lead that orchestrates, builders that own scopes, a
verifier that engages dynamically) that fits the shape of _their_ project. It solves the problems
that appear once you scale past one agent: work colliding at the seams between owners, context lost
when an agent's session ends, and a fixed team shape that no longer fits the work.

> ## 🔴 WHO IT IS **FOR** — THE AGENT TEAM. This is the product anchor, and it decides design questions.
>
> **"The audience for this is agents / agent teams, which means that is the audience we are trying to
> enable with this project."** — Cole, 2026-08-08
>
> **"I'm not the intended user. The intended user is the agent team."** — Cole, session 9, declining
> a design question on exactly these grounds
>
> **The developer adopts anthill; the agent team USES it.** So a design question of the form _"what
> would a user want here?"_ is asking **what a seat needs at the moment it is working**, not what the
> human would prefer to see. **Right now the focus is making the AGENT experience good.**
>
> _Recorded because it was supplied by the human twice, unprompted, two sessions apart — and a fact a
> human has to re-supply is a fact that is not in the docs. The previous version of this section
> answered "who adopts it" and read as though it had answered "who is it for", which is worse than
> being silent: a lead consulting it got a real answer to a different question._

## The Human's Role, and Who Decides What

**The human is not a participant in the team; they are its counterparty, and they reach it through
the lead.** Decisions route through the lead as liaison rather than seat-to-human, so that N seats'
questions become one ruling-with-reasoning instead of N uncoordinated pings.

**What the lead decides and records:** the technical forks. Implementation shape, scope calls within
a session, sequencing, which lane owns what. **These are recorded — a session decision log is cheap
and it lets a pattern be seen later — but they do not wait on the human.**

**What routes to the human:**

- **Product strategy** — what anthill is, where it is going, who it targets.
- **Release-level assertions** — closing a scope, declaring a criterion met, anything one-way in practice.
- **Decisions whose evidence arrived AFTER the criteria were written**, where meeting the letter would
  mis-state the result.

**What does NOT route to the human:** individual technical decisions that are grounded in the above.
_"If we're getting feedback like, hey, x-consumer's looking for this, or there's these bugs — just go
with what makes sense."_

> **⚠ The failure this section exists to prevent runs BOTH ways.** A lead who escalates a grounded
> technical call spends the human's attention instead of its own standing — recorded in a seat doc as
> _"escalating felt like diligence and was the cheaper move for me."_ A lead who decides a
> product-shaped question quietly makes anthill's direction an accident of whoever held the seat.
> **The test is not size. It is whether the answer would change what anthill IS.**

## Core Principles

- **Stigmergy — docs as pheromone.** Living docs are not documentation; they are the trail the
  next ephemeral agent follows. Curation means strengthening load-bearing trails and letting
  unimportant ones fade.
- **Running capture → curated synthesis.** Agents keep a cheap running session scratch as they
  work; _finalize_ is where those notes are articulated into durable form for future agents.
- **The anthill adapts to the work.** App, process, _and team_ structure are mutable in service
  of the work. Persistent friction — toe-stepping, a seam that won't hold, an overloaded or idle
  seat — is a signal to reshape, not to endure.
- **Three homes for knowledge.** Taste → the seat's living doc; truth → `seams.md` (single-source
  contracts, never restated); proof → tests.
- **The team's value is the INTERSECTION, not the headcount.** _"Where you get the really interesting
  dynamics is where there's teammates intersecting with each other, correcting each other. This
  doesn't happen when you have a single agent."_ Cold reads and self-checks approximate it; they do
  not replace real-time correction between peers who each hold a different stake.
  **The cost is real and is accepted deliberately** — more communication, more corrections, more
  elapsed time — because it reduces long-term defects and **surfaces decisions that would otherwise
  never be raised at all.**
  → **The standing balance is SIGNAL TO NOISE.** Highlight the interactions that produce the
  dynamic; cut the ones that do not, whether by tooling or by changing how the team communicates.
  **A mechanism that adds traffic without adding correction is noise wearing rigour's clothes.**
- **Brain/hands split.** Skills make judgment calls (explore → converse → compose the team); the
  CLI deterministically renders that decision. Non-determinism stays out of the CLI.

## What It Does

- **Bootstraps a team** into a repo: explores it, proposes an archetype-seeded composition, and
  — once the human ratifies — writes `.anthill/config.json` and renders the `.anthill/` scaffold.
- **Runs a session lifecycle:** `convene` → work → `finalize-session`, coordinating over a
  discussion channel (grapevine) + a task board (bounty), with tmux panes as the primary
  execution surface and subagents as a fallback.
- **Migrates itself forward:** a versioned footprint with an `anthill migrate` CLI and an
  `anthill:upgrade` skill, so breaking releases stay safely consumable.
- **Evolves the team shape:** a reflection touchpoint can change the roster, seams, or config
  when the structure stops fitting the work.

## What It Doesn't Do

- **It does not rebuild the coordination primitives.** grapevine and bounty are spellbook spells
  the team already uses; anthill is a facade over them, not a reimplementation.
- **It is not a clone of one team's roster.** anthill ships a _methodology + tooling_, seeded by
  archetypes and tailored per project — not dream-flute's exact seats.
- **It is not a general project scaffolder.** Its footprint is the team layer (`.anthill/`), not
  app code, CI, or framework setup.
- **It does not give AGENTS visibility into the HUMAN.** Ruled 2026-08-08: seats do not need to
  observe what the human is doing. **The arrow points the other way** — the human talks to the lead,
  and the lead is their liaison. _(This is why removing anthill's only `humans` source, which came
  from grapevine's presence call, costs nothing: the capability was nominal and pointed the wrong
  way.)_
- **It does not run without its dependencies.** spellbook (grapevine + bounty), Bun, tmux, and
  the `claude` CLI are required; bootstrap preflights them.

## Design Philosophy

anthill was extracted and generalized from the team system grown in the **`dream-flute`**
project and shipped as its own plugin so it can evolve on its own cadence. It **dogfoods
itself** — this repo runs its own anthill team from `.anthill/` — on the belief that the fastest
way to find where the methodology is wrong is to live inside it. The guiding tension the project
watches for: **mechanism must not outrun usage.** New structure earns its place only when real
sessions demand it.

---

## Where This Is Going — the camera in the anthill

**The next surface is HUMAN OBSERVABILITY, and it is the inverse of the capability just declined.**
Agents do not need to watch the human. **The human needs a better way to watch the team.**

Today that means attaching to tmux panes and reading terminals — **which works and is not the right
surface.** The direction Cole has named is a **UI layer / dashboard**: _"basically a camera in the
anthill."_

**It is deliberately not next.** The current focus is making the **agent** experience good, on the
reasoning that the human can talk to the lead and get what they need. **Recorded here so that when it
does arrive it is a resumed direction rather than a new idea** — and so nobody builds a
half-version of it in the meantime by widening some seat's scope.

---

**Note:** This manifesto captures the foundational vision and boundaries of the project. As the
project evolves, this document should be updated to reflect major shifts in direction or scope.

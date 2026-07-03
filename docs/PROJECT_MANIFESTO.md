# Project Manifesto

**Last Updated:** 2026-07-03

---

## What Is This?

anthill is a portable **team-OS** for agentic development — a Claude Code plugin that installs
a multi-agent development team into _any_ project. The model is **ephemeral agents working in
durable seats**: roles persist, the agents filling them come and go, and each departing agent
leaves its context behind as a trail for the next. The name is the thesis: agents are ants, and
the living docs are the pheromone trail.

## Who Is It For?

Developers who run agentic development through Claude Code and want more than a lone assistant —
a coordinated **team** (a lead that orchestrates, builders that own scopes, a verifier that
engages dynamically) that fits the shape of _their_ project. It solves the problems that appear
once you scale past one agent: work colliding at the seams between owners, context lost when an
agent's session ends, and a fixed team shape that no longer fits the work.

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

**Note:** This manifesto captures the foundational vision and boundaries of the project. As the
project evolves, this document should be updated to reflect major shifts in direction or scope.

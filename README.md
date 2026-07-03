# anthill

A portable **team-OS** for agentic development — a Claude Code plugin that sets up a
multi-agent development team in any project: **ephemeral agents working in durable seats**,
coordinating over a discussion channel + a task board, with a lead that orchestrates and a
verifier that engages dynamically.

The name is the thesis. The system is **stigmergic**: agents are ants — ephemeral, but each
leaves context (living docs) as a pheromone trail for the next instance. The structure adapts
to the work; persistent friction is a signal to reshape, not to endure.

anthill is extracted and generalized from the team system grown in the `dream-flute` project,
distributed as its own plugin so it can evolve on its own.

## Status

Slice 1 (walking skeleton) landed — the full loop runs end-to-end for the `layered-app`
archetype in a non-dream-flute repo, and anthill now dogfoods its own team from `.anthill/`.
Active work is on **v0.2**: the `anthill:plan` skeleton→ratify skill and the global `anthill`
CLI (see [`docs/ROADMAP.md`](docs/ROADMAP.md)).

See [`docs/architecture/2026-06-28-anthill-portable-team-os-design.md`](docs/architecture/2026-06-28-anthill-portable-team-os-design.md)
for the full design.

## How it works (target shape)

1. **One-time:** add the anthill marketplace, install the plugin.
2. **In a project:** run `anthill:bootstrap` — it explores the repo, proposes a team
   composition (archetype-seeded), you ratify, and it writes `.anthill/config.json` + renders
   the `.anthill/` scaffold.
3. **Per session:** `anthill:convene` → work → `anthill:finalize-session`.

The only footprint in a consuming repo is the `.anthill/` root (config, living docs, and
scratch) plus one `.gitignore` line — everything else lives in the plugin.

## Dependencies

- [spellbook](https://github.com/ichabodcole) — grapevine (discussion) + bounty (task board)
- Bun · tmux · the `claude` CLI

## Lineage

- CLI shell seeded from [`create-project-cli`](https://github.com/ichabodcole/seed-project-cli)
  (dual-audience `{ok, data, meta}` Citty CLI).
- Team layer (skills, coordination facade, tmux, living-docs) generalized from `dream-flute`.

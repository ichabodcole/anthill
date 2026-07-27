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

Released and self-hosting. The v0.2 bundle has shipped in full — the `anthill:plan`
skeleton→ratify skill, the optional global `anthill` CLI, `anthill scan` + the `multi-surface`
archetype, ritual checklists baked into the lifecycle skills, and the first instrumented dogfood
session. anthill dogfoods its own team from `.anthill/`, and consuming projects file field
feedback home through `anthill feedback`.

What's queued next lives in [`docs/ROADMAP.md`](docs/ROADMAP.md) — the single prioritized router
over everything.

See [`docs/architecture/2026-06-28-anthill-portable-team-os-design.md`](docs/architecture/2026-06-28-anthill-portable-team-os-design.md)
for the full design, and [`docs/PROJECT-SUMMARY.md`](docs/PROJECT-SUMMARY.md) for a synthesized
snapshot of where things stand.

## How it works (target shape)

1. **One-time:** add the anthill marketplace, install the plugin.
2. **In a project:** run `anthill:bootstrap` — it explores the repo, proposes a team
   composition (archetype-seeded), you ratify, and it writes `.anthill/config.json` + renders
   the `.anthill/` scaffold.
3. **Per session:** `anthill:convene` → work → `anthill:finalize-session`.

The only footprint in a consuming repo is the `.anthill/` root (config, living docs, and
scratch) plus one `.gitignore` line — everything else lives in the plugin.

## Optional: a human `anthill` command

Agents drive the CLI through the plugin, so nothing is required on your PATH. For a **human** who
wants to drive a running session from a terminal (`anthill attach`, `anthill status`), there's an
optional launcher:

```sh
bun add -g github:ichabodcole/anthill-cli
```

It's a **pointer** to the installed plugin's CLI (the highest version you have), not a copy — so
there's nothing to keep in sync, and a plugin upgrade needs no reinstall. See
[anthill-cli](https://github.com/ichabodcole/anthill-cli).

## Dependencies

- [spellbook](https://github.com/ichabodcole) **(≥ 1.16.0)** — grapevine (discussion) + bounty (task
  board). The 1.16.0 floor is load-bearing: board session-binding relies on spellbook's caller-owned
  bounty session key ([#69](https://github.com/ichabodcole/spellbook/issues/69)) and the bounded
  `grapevine tail --last <n>` catch-up ([#68](https://github.com/ichabodcole/spellbook/issues/68)).
  anthill resolves the highest cached spellbook, so keep your install current.
- Bun · tmux · the `claude` CLI

## Lineage

- CLI shell seeded from [`create-project-cli`](https://github.com/ichabodcole/seed-project-cli)
  (the dual-audience `{ok, data, meta}` envelope). The seed's Citty dependency was replaced in
  v1.3.0 by an in-house `parseArgs` command layer, so the shipped CLI has **zero** runtime deps.
- Team layer (skills, coordination facade, tmux, living-docs) generalized from `dream-flute`.

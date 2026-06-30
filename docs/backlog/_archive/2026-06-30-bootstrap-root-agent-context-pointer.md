# Bootstrap: recommend a root CLAUDE/AGENTS "anthill methodology" pointer

**Added:** 2026-06-30 · **Status:** Done (`bd8d9f0`, Phase 1)

As part of the bootstrap procedure, recommend (consent-gated) adding a short section to the
consumer repo's root `CLAUDE.md` / `AGENTS.md` that announces the repo uses the **anthill
team methodology** — a hint to a fresh agent that team-based development is a _feature_ of
this repo. Using a team isn't mandatory, but a new agent doing development work should
understand that a team can be convened here and where the team docs live (`.anthill/`).

This mirrors project-docs's update/setup step that adds a docs-structure pointer to the
root agent-context file — same idea: agents read the root file first, so the pointer is how
a repo's conventions become discoverable.

Prefer **AGENTS.md** as the home for the pointer, with **CLAUDE.md** as a short redirect to
it (the convention this repo itself uses) — non-Claude agents read AGENTS.md, Claude follows
the redirect, and there's nothing duplicated to keep in sync. Detect which file(s) the repo
already uses and respect that; only add what's missing.

## Acceptance Criteria

- [x] bootstrap offers to add/refresh a root CLAUDE/AGENTS "anthill methodology" section
      (consent-gated, idempotent — don't duplicate if already present)
- [x] the pointer notes: team-based dev is available here, how to engage it, and where
      `.anthill/` lives
- [ ] anthill's OWN root `CLAUDE.md` carries the equivalent pointer (dogfood — completes
      during the self-host dogfood, when anthill's own `.anthill/` exists)

**Resolution (`bd8d9f0`):** Phase 1 of the footprint-migration added the consent-gated
discoverability-pointer step to `anthill:bootstrap` (AGENTS.md home + CLAUDE.md redirect,
idempotent, noting where `.anthill/` lives). The last AC — anthill's _own_ root pointer —
naturally completes during the self-host dogfood; archived as the feature itself is done.

## References

- Parallel: project-docs update/setup "ensure root-level agent context" step
- Related: [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md) (bootstrap +
  discovery; feature 1's CLAUDE/AGENTS pointer is the doc-location half of this)

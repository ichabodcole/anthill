# Bootstrap: detect grounding docs instead of defaulting to AGENTS.md

**Added:** 2026-06-30 · **Status:** Done (`dea05b1`)

The layered-app archetype defaults `grounding: [AGENTS.md, README.md]`. On the first
external bootstrap (media-buffet) the repo had no `AGENTS.md` (it uses README +
`docs/PROJECT-SUMMARY.md` + a manifesto), so the default pointed at a nonexistent file.
Bootstrap should DETECT the repo's actual grounding anchors (README, PROJECT-SUMMARY,
PROJECT_MANIFESTO, AGENTS/CLAUDE) and warn when a configured grounding path doesn't
exist, rather than emit a dangling reference.

## Acceptance Criteria

- [x] bootstrap discovers existing anchor docs rather than assuming `AGENTS.md`
- [x] a configured `grounding` path that doesn't exist produces a warning, not a silent
      dangling reference

**Resolution (`dea05b1`):** the bootstrap skill now probes the usual anchors
(AGENTS/CLAUDE/README/PROJECT-SUMMARY/PROJECT_MANIFESTO) and sets `grounding` to what's
present (dropping absent defaults); `anthill join` surfaces any missing grounding path as a
structured `warnings` entry (+ a ⚠ line), not just a silent inline "(missing!)".

## References

- Part of the discovery work in
  [v0.2 brief, feature 5](../briefs/2026-06-30-anthill-v0.2-next-release.md)
- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)

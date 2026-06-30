# Investigation: file-activity heat map as a stigmergy signal

**Date Started:** 2026-06-30
**Investigator:** Claude Code (maestro)
**Status:** Active
**Outcome:** TBD — research idea, secondary to the v0.2 bundle

---

## Question / Motivation

Could anthill derive a _time-decayed_ heat map of file change activity from git history,
as a stigmergy signal over CODE (not just docs)? A seat opening a new scope reads "where's
the heat" for cheap orientation; persistent cross-module hotspots may also reveal that a
seat scope is wrong. The pheromone angle — activity that strengthens where work continues
and FADES where it stops — is what makes it a living signal rather than a static churn
report.

## Current State Analysis

anthill's living docs are a pheromone field over knowledge; git history is an untapped
pheromone field over code (every commit touching a file = an ant walking the path).
Nothing computes this today.

## Investigation Findings

### Key Observations (initial reasoning, pre-spike)

- Zero-authoring, always current (computed from `git log`).
- Real orientation value: churn correlates with active areas, bug-prone files, and
  integration nexuses.

### Guardrails (the traps — captured so a spike doesn't fall in)

- **Churn ≠ importance, both directions:** hot can mean central OR thrashing OR
  trivial-but-touched (lockfiles, barrels, changelog → exclude); and the MOST important
  file may be STONE COLD (a frozen load-bearing interface) → never read cold = ignorable.
- Use **churn × complexity** (not raw churn) to filter the trivial-churny and surface the
  real "nexus doing too much".
- The "break it up" signal is better captured by **change-COUPLING** (files that co-change
  across module boundaries) than by frequency.
- **Time-decay** the signal (the pheromone fade) + snapshot under `.anthill/` so it
  persists + decays across sessions = the stigmergic loop (what generic churn tools lack).

### Options Considered

- **Do nothing** — it's a nice-to-have, not load-bearing.
- An `anthill hotspots` / `heatmap` CLI command: pure/deterministic git analysis (the
  hands) that a seat reads + interprets (the brain). It's a SENSE, not a JUDGE.

### Prior Art

- Adam Tornhill, _Your Code as a Crime Scene_ / CodeScene — behavioral code analysis
  (hotspots = churn × complexity; change coupling). A proven blueprint to borrow.

## Recommendation

- [x] **More Research Needed / Monitor** — worth a spike AFTER the v0.2 bundle lands;
      would be anthill's "fifth pheromone organ."

**Rationale:** on-thesis and cheap to prototype, but clearly secondary to the shipping
roadmap. The design discipline (sense not judge; churn × complexity + coupling + decay) is
what makes it worth doing well rather than as a naive churn report.

## Next Steps

- Park until the v0.2 bundle ships; then spike `anthill hotspots` against a real repo and
  evaluate whether the decayed signal actually aids seat orientation.

---

**Related Documents:**

- [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md)
- [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)

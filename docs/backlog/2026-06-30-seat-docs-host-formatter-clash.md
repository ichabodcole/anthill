# Protect seat docs from the host repo's formatters

**Added:** 2026-06-30

Seat docs live in the consumer repo, so its husky/lint-staged + prettier/biome run on
them. On media-buffet this normalized `*italics*`→`_italics_` (churn the lead must
re-absorb into the atomic land) and once MANGLED a soft-wrapped continuation line
("+ its proof") into a stray markdown list bullet — a semantic corruption of a pheromone
doc.

**Fix = both (resolved design):**

- **Belt:** author seat-doc markdown UNWRAPPED (one sentence per line, no hard wraps) so
  a reflow is a no-op. Ships first; no host-detection dependency; kills the semantic
  mangle structurally.
- **Suspenders:** `init` adds the team-docs dir to the detected formatter's ignore
  (`.prettierignore` / biome ignore) — only when the mechanism is confidently detected,
  idempotent + non-destructive, else fall back to unwrapped + a one-line warning. Kills
  the churn; protects pheromone fidelity.

## Acceptance Criteria

- [ ] anthill-authored seat docs use one-sentence-per-line (no soft wraps)
- [ ] `init` adds an ignore-guard when it can confidently detect prettier/biome;
      otherwise warns
- [ ] a host `format` / commit run leaves seat docs byte-stable

## References

- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md),
  [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md)

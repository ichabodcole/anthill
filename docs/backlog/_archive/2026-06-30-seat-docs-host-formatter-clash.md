# Protect seat docs from the host repo's formatters

**Added:** 2026-06-30 · **Status:** Done — belt (`167c996`) + suspenders (`84dfb12`)

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

- [x] anthill-authored seat docs use one-sentence-per-line (no soft wraps)
- [x] the team-docs dir is added to the host formatter's ignore when one is detected
      (reframed from a CLI `init` guard to a bootstrap/upgrade **agent instruction** —
      simpler for a one-time, low-judgement action)
- [x] a host `format` / commit run leaves seat docs byte-stable

**Disposition:** the **belt** shipped (`167c996`) — seat-doc templates are authored
one-sentence-per-line (convention noted in the template + the SOP), so a host reflow is a
structural no-op. The **suspenders** shipped (`84dfb12`) as a setup **instruction** rather
than a CLI feature: `anthill:bootstrap` (and `anthill:upgrade` post-migration) tell the agent
to add the `.anthill/` dir to the host's prettier/biome ignore when the repo has one.

## References

- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md),
  [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md)

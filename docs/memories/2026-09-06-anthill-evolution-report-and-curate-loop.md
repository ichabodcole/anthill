# anthill-evolution: durable team docs become curated; seats write reports

**Date:** 2026-09-06

The `feat/anthill-evolution` branch landed the report-and-curate loop: seat docs are identity-only (five sections), `seams.md` is contracts-only, each seat writes a per-session report under `.anthill/reports/<date>/<handle>.md`, a `curate` skill turns reports into method with the human in the loop, a per-team OKF wiki under `.anthill/wiki/` holds the "how" that every lifecycle skill points at (`anthill wiki lint` checks it), and `anthill commit --as <seat>` refuses curated docs without `--curated`. `retro.md` and `paper-cuts.md` are retired. This repo's own team was migrated: the old seat-doc content is preserved as the first report batch, a two-team blind taxonomy of that material produced ten classes, and curation run 1 ruled clean slate (archive the batch, fix only what was wrong today). Three route-first interventions are backlog candidates, out of scope by decision.

**Key files:** `plugin/skills/curate/SKILL.md`, `plugin/scripts/anthill/curated.ts`, `plugin/scripts/anthill/commands/team-wiki-lint.ts`, `plugin/scripts/anthill/docs-lint/index.ts`, `plugin/templates/docs-team/wiki/`, `.anthill/wiki/touchpoints/curate.md`

**Docs:** [docs/projects/anthill-evolution/](../projects/anthill-evolution/proposal.md), taxonomy at `docs/projects/anthill-evolution/taxonomy/COMPARISON.md`, backlog `docs/backlog/2026-09-04-*.md`

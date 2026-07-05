# Skill-hygiene pass — pre-reconvene rails

**Date:** 2026-07-04

Landed roadmap #5/#6/#7 as one branch (`feat/skill-hygiene-pass` → `develop`), the cheap
"rules before tooling" work to run before the first dogfood reconvene.

- **#6 — `anthill commit` × lint-staged fix.** The partial `git commit -- <paths>` built a temp index
  that lint-staged corrupted (phantom "invalid object", hit reproducibly here). Now: stage → **verify
  the index is exactly those paths** (`unexpectedStaged` set-difference) → commit **without** a
  pathspec (hook runs against the real index). Unexpected staged content **aborts** (design: Cole chose
  abort-on-mismatch) and restores the index. In `scripts/anthill/commands/team-commit.ts`.
- **#5 — ritual checklists baked into the skills** (they _emit_ the checklist, not a form):
  `finalize-session` teardown checklist with the new **human sign-off gate before merging the feature
  branch to develop**; `convene` lead setup checklist; `join` member checklist.
- **#7 — SOP one-liners** in `templates/docs-team/README.md`: _the vine evaporates_, _no store without
  a named re-read moment_, _one intake route at synthesis_; playbook-pointer rule in `docs/README.md`.

Dual-reviewed (code: Yes; docs: With fixes → applied — de-scoped anthill vocab from the generic docs
README, and collapsed a single-source duplication so the SOP owns _route-at-synthesis_ and the skill
points to it).

**Docs:** [session](../projects/_archive/skill-hygiene-pass/sessions/2026-07-04-skill-hygiene-pass.md) _(archived)_

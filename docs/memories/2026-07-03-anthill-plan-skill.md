# anthill:plan — the skeleton→ratify planning skill

**Date:** 2026-07-03

Built the `anthill:plan` lifecycle skill (roadmap #1): the lead scaffolds a thin plan skeleton
(integration order + cross-seam contracts as claims), each owning seat ratifies/falsifies the seams
it touches, then each owner authors its own `plan/<seat>.md` lane and builds. Made **self-contained**
(synthesizes the plan-writing craft in rather than referencing `superpowers:writing-plans` /
`project-docs:generate-dev-plan`) because anthill is a portable plugin — validated against
dream-flute's real team-plan artifacts and a HiveMind instructional-content playbook. Not yet run
live (that's the roadmap-#4 dogfood).

**Key files:** `skills/plan/SKILL.md`, `skills/plan/methodology.md`; wired into `skills/join`,
`skills/convene`, `templates/docs-team/README.md` (SOP), `templates/docs-team/dev/seams.md`.

**Docs:** [team-dev-planning project](../projects/_archive/team-dev-planning/) · [session](../projects/_archive/team-dev-planning/sessions/2026-07-03-anthill-plan-skill-build.md) _(archived)_

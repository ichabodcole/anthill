# Multi-team support — one project, several teams, resolved ambiently

**Date:** 2026-08-10

`.anthill/config.json` can carry a `teams` map instead of one flat team, and every command resolves
which team it is about through a ladder (`--team` → `ANTHILL_TEAM` → the `.anthill/current-team` pin →
the sole team → **throw**, no fallback at any rung). Detected structurally, **no version bump** —
`version` means footprint layout and nothing moves on disk. Ships with `anthill team ls|use|show`, a
`bootstrap` §0a route for adding a second team, a `migrate` refusal, and `Anthill-Team` attribution on
commits and retro entries.

**The durable lesson, and it cost nine defects to learn: on this codebase, `bun run check` cannot see
the failure modes that matter.** Every one of the nine was green at 0 fail while broken — the pure
halves were always right, the commands never ran, or the defect was in shipped prose. The plan gained
**execution rule 7** because of it: _a task that changes a command's behaviour is not done until the
command has been RUN against a fixture repo in the state its DOCUMENTATION describes_ — not the state
the task describes, which is how the `init` pin bug survived its own phase's end-to-end check.

**Three of those were tests shaped to pass**: a coverage assertion whose expected set came from the
thing under test; commit-message fixtures that all avoided the colon that breaks trailer parsing; and
a fingerprint measured against a config already carrying the key whose absence was the point — that
one shipped into a skill as a claim labelled _measured_.

**Corollary for reviews:** the static reviewer said "ready to merge" and the execution-capable one
found five real defects in the same diff. A reviewer without shell access is a second opinion, not a
review, when the defects live in prose and emitted commands.

**Key files:** `plugin/scripts/anthill/team-resolve.ts`, `plugin/scripts/anthill/config.ts`
(`resolveProject`), `plugin/scripts/anthill/commands/team-team.ts`,
`plugin/scripts/anthill/commands/team-support.ts` (`liveTeams`, `boardOwnerFromBinding`),
`plugin/skills/bootstrap/SKILL.md` §0a

**Docs:** [Plan + implementation record](../projects/multi-team-support/plan.md) ·
[Session](../projects/multi-team-support/sessions/2026-08-10-multi-team-support-implementation.md) ·
[Design of record §5a, §8](../architecture/2026-06-28-anthill-portable-team-os-design.md)

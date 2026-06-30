# Fragment: where do "lessons learned" live in the anthill team model?

**Date**: 2026-06-30
**Context**: Pre-dogfood skill pass. Cole declined materializing HiveMind's skill-authoring
principles into `docs/lessons-learned/`, and articulated why — which surfaced a real design
question about anthill's knowledge model.

## Observation

A `docs/lessons-learned/` folder has a structural weakness: **no natural touchpoint.** Nothing
re-reads it. Unless there's an explicit directive ("check lessons-learned for X"), the knowledge
just sits there and goes stale — the capture happens, the re-read never does.

anthill's team model may already answer this. Lessons bake into a **seat doc** as the seat's
_scars_ — and the seat doc **does** have a touchpoint: `anthill:join` re-grounds from it every
session. Shared truth goes to `seams.md` (also re-read at join). So in the team model, a lesson
that earns its keep lands where it will actually be seen again, rather than in a write-only folder.

The pattern Cole is reaching for: **a lesson worth keeping should have a direct reference from a
team member (a seat doc, or `seams.md`)** — and if it's been validated/abstracted enough to be a
playbook, the seat/seams point _at_ the playbook. But the reference only earns its place if the
team genuinely feels it does. Don't force a back-reference in just to have one.

## Why It Might Matter

It shapes what `docs/lessons-learned/` is _for_ in an anthill-bootstrapped repo (and what
`.anthill/` should hold). Three live possibilities:

1. **Lessons-learned evaporates** in the team model — durable lessons live in seat docs / `seams.md`
   (touchpoint-backed); the folder is vestigial for team-run repos.
2. **Lessons-learned stays, but only as a promotion target** — a seat-doc lesson that generalizes
   across seats/projects gets promoted to a playbook/lessons-learned doc, _and the seat keeps a
   pointer to it_ so the touchpoint survives.
3. **It moves into `.anthill/`** — a team-knowledge home co-located with the living docs, so the
   touchpoint and the durable store share one root.

Getting this right is on-thesis: anthill is _about_ knowledge that survives ephemeral agents via a
re-read trail. A store with no re-read is the exact failure mode anthill exists to fix.

## Trigger for Revisit

- When we design the **knowledge-promotion** path (seat doc → seams → playbook) as a real feature.
- During the **self-host dogfood** — the first time anthill's own team produces lessons, watch
  where they naturally want to go, and whether anyone ever re-reads a `docs/lessons-learned/` entry
  vs. a seat doc.
- If a seat doc grows a lesson that clearly belongs to _more than one seat / more than one project_
  and there's no good home for it.

## Related Documentation

- Skills: `skills/finalize-session/SKILL.md` (the synthesis ritual — where seat-doc scars are
  written; now has the reactive+reflective pass), `skills/join/SKILL.md` (the re-read touchpoint).
- HiveMind: `intentional-design-for-feedback-loops`, `Designing Feedback & Depth into Agentic
Pipelines` (the reactive-vs-reflective asymmetry that motivated the finalize change).

## Notes

This is deliberately unresolved — Cole is "looking for a pattern," not committing to one. Captured
as a fragment (not forced into a decision) precisely because the right answer should emerge from the
team feeling it earn its keep, not from a top-down rule.

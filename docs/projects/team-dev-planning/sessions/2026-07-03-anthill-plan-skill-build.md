# anthill:plan — skeleton→ratify skill build — 2026-07-03

## Context

Roadmap #1: build the `anthill:plan` lifecycle skill from the resolved
[team-dev-planning proposal](../proposal.md) — the team dev-planning phase where the lead
scaffolds a plan skeleton and each owning seat ratifies the seams it touches before building. Built
solo (the methodology's own rule: skeleton-authoring is solo work). Branch:
`feat/anthill-plan-skill`.

## What Happened

Landed in three passes, with a real design pivot in the middle.

**Pass 1 — the MVP as proposed** (`bcff2be`). Authored `skills/plan/SKILL.md` + a companion
`skills/plan/methodology.md`, and wired the phase into the existing surfaces: a `join`
ratify-before-draft beat, the `seams.md` "assert up front" framing, an SOP workflow update
(`convene → plan → work → finalize`), a `convene` hand-off pointer, a dated architecture-doc
addendum, and the `plugin.json` skill enumeration. Resolved the proposal's four open questions as
MVP defaults (light vine-ack ratify gate; dual-mode terminal/subagent; seams.md both/and;
pointer-home = SOP + convene, since anthill has **no role-specific seat-doc template** unlike
dream-flute's `maestro.md`).

**Pass 2 — the compose-vs-synthesize pivot** (`39b2686`). Cole pushed on how `anthill:plan`
relates to the single-agent planning skills (`superpowers:writing-plans`,
`project-docs:generate-dev-plan`). Two questions surfaced: is ours a composition or a replacement,
and if it recreates their craft, do we still need to reference them? To answer with evidence rather
than theory, reviewed **dream-flute's** real team-plan artifacts (git archaeology on the
`timeline-loop-region` zero-rework reference build and `spatial-motion`). Findings:

- A team plan is a **two-layer artifact**: a thin shared `plan.md` skeleton (integration order, a
  "Shared interfaces — ratify on the vine, then fill" seams section marked `RATIFIED — owner ×
consumer`, slices, verification gate) authored by the **lead**, plus one **`plan/<seat>.md` lane
  file per owner** carrying the file-level HOW, authored by **that owner** after ratifying.
- The falsification is real: in `spatial-motion` the lead's skeleton asserted "MVP has no delay
  line"; the engine owner corrected it at the seam ("the delay line already exists → ITD is in the
  MVP"), commits `f18998c`→`2135c26`.
- dream-flute's own practice was already **self-contained** — owners never invoked external
  planning skills.

Decision (Cole's lean, agreed): make `anthill:plan` **self-contained**, not composed. Dropped the
load-bearing references to the other plugins; `methodology.md` now **synthesizes** the distilled
plan-writing craft in (right-sized TDD tasks, exact paths, no-placeholders, self-review against the
seams). Rationale: anthill is a portable plugin — those are _separate_ plugins a consumer repo may
lack, so a core skill can't hard-depend on them. Also added the two-layer artifact structure
(skeleton + `plan/<seat>.md` lanes) to both files.

**Pass 3 — finalize** (`a5377c2` + this). Dual independent code review
(`feature-dev:code-reviewer` + `doc-reviewer`): reviewer verdict **Yes**; doc-reviewer verdict
**With fixes** — caught the proposal's earlier Scope bullet + Technical-Approach table still naming
a "lead archetype seat doc" pointer, contradicting its own resolved open question. Fixed all five
references + a dropped blockquote marker.

## Notable Discoveries

- **HiveMind validated the self-contained call.** A consult surfaced the cross-project playbook
  _"Writing Instructional Content for Agents — What Earns Its Place"_ — its non-discoverable-info ×
  portability discipline says highly-portable artifacts should omit discoverable/absent-dependency
  references and carry non-discoverable knowledge in. Exactly the pivot we made, now with a named
  principle behind it. Guardrail pass over the built skill found no material violations.
- **anthill has no role-specific seat-doc template.** dream-flute's lead reflex lives in a filled-in
  `maestro.md`; anthill's `{{handle}}.md` scaffold is generic, so the lead-facing pointer had to
  live in the SOP + `convene` instead. This drove open-question #4's resolution.

## Lessons Learned

- **Reach for the real artifacts before theorizing.** The two-layer plan shape and the "Interfaces
  block = seam" insight came straight from reading dream-flute's plans + git history, not from
  reasoning about it in the abstract. The archaeology answered the detail-model fork better than the
  three options I'd drafted.

## Follow-up

- **Not yet run live.** Everything is validated at the design/craft level (matches the proven
  dream-flute practice, gate green, dual review). The first real invocation in a convened session is
  roadmap #4 (the instrumented dogfood) — the true test of whether the beats flow.
- Consider materializing the HiveMind instructional-content playbook into `docs/playbooks/` as a
  durable local reference for future anthill skill work.

---

**Related Documents:**

- [Proposal](../proposal.md) — the resolved design (status: Implemented)
- [methodology.md](../../../../skills/plan/methodology.md) · [SKILL.md](../../../../skills/plan/SKILL.md)
- [Architecture addendum](../../../architecture/2026-06-28-anthill-portable-team-os-design.md)
- Commits: `bcff2be`, `39b2686`, `a5377c2` on `feat/anthill-plan-skill`

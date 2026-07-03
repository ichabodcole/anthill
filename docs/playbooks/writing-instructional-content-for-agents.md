---
type: playbook
status: stable
hivemind_source_id: Jn5TO0t2x_KJ1b29Radha
hivemind_retrieved: 2026-07-03
tags:
  - agent-skills
  - skill-authoring
  - instructional-writing
  - methodology-design
  - non-discoverable-information
  - codification
stack: [claude-code, agents-md, methodology-docs]
applied_to: [project-lore, progyny-hr-ai, media-forge, anthill]
last_verified: 2026-06-30
synthesized_from:
  - only-include-non-discoverable-information
  - affirmative-scope-over-defensive-exclusion
  - adding-a-rule-is-the-signal-to-reflect
  - the-non-discoverable-info-lens-scales-with-skill-portability
  - stale-instructions-defeat-tool-abstractions
---

<!--
MATERIALIZED FROM HIVEMIND — a point-in-time snapshot, not a sync.
Source: HiveMind Playbooks / "Writing Instructional Content for Agents — What Earns Its Place"
(id in the frontmatter above). If the source changes, re-materialize rather than hand-edit this copy,
so it stays diffable against the canonical HiveMind entry. Kept verbatim from source rather than
reshaped into docs/playbooks/TEMPLATE.md for the same reason.
-->

# Writing Instructional Content for Agents — What Earns Its Place

## What this is

A reusable discipline for authoring instructional content an agent will act on —
skills, `AGENTS.md`/`CLAUDE.md`, methodology docs, proposals. The through-line:
**every line in instructional content is a liability as well as an asset.**
Discoverable restatements age badly, defensive exclusions introduce the very
paths they deny, and over-prescriptive rules accrete into bloat that obscures the
affirmative instructions. This playbook collects the restraint disciplines that
keep instructional content sharp — plus the one rule that matters when you lift
any of them into a general principle.

Converged independently across three projects (Project Lore, Progyny HR AI,
media-forge); the source scenarios each flagged "a broader principle about what
information earns its place" as the synthesis this playbook now names.

## The core test

Before a line earns its place, it must pass at least one of:

- **Non-discoverable** — the agent can't find it at the moment of use from its
  runtime (tool docs, env, peer skills, the codebase).
- **Reachable** — if it's a warning/exclusion, the wrong path it guards is
  genuinely reachable from what the doc already affirmatively says.
- **Load-bearing** — it changes a judgment call, names a destination, or encodes
  intent the agent would otherwise get wrong.

If a line is none of these, it's noise — and noise in instructional content isn't
neutral, it buries the signal.

## The disciplines

### 1. Only include non-discoverable information

Provide what the agent can't find on its own — destination IDs, structural
intent, judgment thresholds — and defer everything else to its native source.
Tool-invocation specifics belong to tool docs; env-var spellings belong to local
credential conventions; sibling-skill mechanics belong to those skills. Restating
them is duplication that ages badly as the runtime evolves.

_Due diligence on "easily":_ before omitting something as discoverable, confirm
it actually is. If the referenced tool lacks findable docs, either the info is
load-bearing (keep it) or the tool has a doc gap (fix that upstream) — both beat
blind omission. _Caveat the specifics you keep:_ when a concrete name is
load-bearing but could differ across contexts, anchor with it and caveat it ("the
local convention is X, or similar").

### 2. Portability modulates discipline #1 — and carry the condition when you codify

The pressure to omit discoverable info **scales with how far the artifact
travels** — a spectrum, not a binary:

- **Highly portable** (cross-project skills, shared templates, published docs):
  omit aggressively; every runtime specific is migration debt.
- **Project-local** (skills/AGENTS files scoped to one repo): keep stable runtime
  specifics — the build command, the canonical type-file path, the grounding
  pointer are load-bearing and won't drift. Stripping them buys zero portability
  and makes the doc vaguer.

**Codification rule (load-bearing):** when you lift any restraint discipline from
a single instance into a general principle, _carry its weakening condition with
it._ A scenario carries its own context; a bare principle sheds it and gets
applied mechanically. The boundary case is what forces the reflective pause at
the point of application. (Same exposure for DRY, YAGNI, "keep it minimal" —
restraint principles are conditional, and codification tends to drop the
condition.)

### 3. Affirmative scope over defensive exclusion

Before writing "this does NOT do X" or "X is out of scope," ask: _given the
affirmative instructions already present, would the agent naturally pursue X?_ If
nothing points there, the exclusion is the only thing introducing the bad path —
drop it. Keep an exclusion only when the wrong path is genuinely reachable from
what the doc already says (e.g. filtering content that appears inline in what the
agent is already reading). The discipline isn't "never exclude" — it's the
**reflective pause** before excluding.

### 4. Reaching for a new rule is the signal to reflect

When you catch yourself adding a rule — or thinking "this is an exception" —
treat it as a trigger to check the framing, not a license to write the rule. A
contradicting observation is usually evidence the _existing_ rule over-claimed
("X is always Y") where reality is flexible ("X is usually Y"). The tell: a
proposed "X can also be Y" sitting next to an existing "X is Y" — merge them into
"X is usually Y, and here's how to handle it when it isn't." This often makes the
doc _shorter_ and more permissive. (Load-bearing caveat: sometimes the check
confirms you genuinely do need the rule — let the urge _trigger reflection_, not
a bias toward softening.)

### 5. When a tool absorbs a concern, delete the stale instruction

Moving logic into a tool is only half the change. The skill text that told the
agent to do that logic manually (set the env var, paginate, retry, validate)
becomes a **footgun that defeats the abstraction** — the agent follows the
instruction over the tool's behavior and re-derives state the tool already owns.
Two-sided fix: (a) delete the now-redundant instruction in the same pass, and
(b) point the skill at _reading the tool's output signal_ ("read
`coverage.fal.partial`"), not at running a pre-flight check. This is discipline
#1 applied across time: the tool's internal handling is discoverable/owned; only
the non-obvious signal earns a place.

## The unifying move

Every discipline reduces to one reflex: **at the moment you're about to add
instructional text, pause and ask what it earns.** Exclusions, rule-additions,
restated specifics, and stale manual steps all feel like thoroughness; they're
usually noise. The skill is the pause, not a blanket prohibition.

## How to apply (review checklist)

- [ ] Every exclusion: is the wrong path reachable from what's already said? If
      not, cut it.
- [ ] Every concrete tool name / env var / path: discoverable at runtime _and_ is
      this artifact portable? If both, defer it. If project-local, keep it
      (caveated if it could differ).
- [ ] Every "X is always Y": is it really, or a usually-Y you should loosen?
- [ ] Every manual-handling step: did a tool absorb this concern? If so, delete it
      and point at the tool's output.
- [ ] When codifying any of the above into a shorter rule: did you carry the
      weakening condition?

## Sources

Synthesized from three Project Lore scenarios
(`only-include-non-discoverable-information`,
`affirmative-scope-over-defensive-exclusion`,
`adding-a-rule-is-the-signal-to-reflect`), one Progyny HR AI refinement
(`the-non-discoverable-info-lens-scales-with-skill-portability`), and one
media-forge feedback (`stale-instructions-defeat-tool-abstractions`). Promoted
via HiveMind digest, 2026-06-30.

<!--
anthill note (2026-07-03): materialized while building anthill:plan. Its non-discoverable-info ×
portability discipline (#1, #2) is the named principle behind that skill's self-contained decision —
synthesize the plan-writing craft in rather than reference external plugins a consumer repo may lack.
-->

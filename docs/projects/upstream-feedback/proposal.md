# Upstream feedback — `anthill feedback`

**Status:** Draft
**Created:** 2026-07-05
**Author:** Cole + maestro

---

## Overview

anthill is a product other projects consume — they bring in its skills, and optionally its CLI. When a
consuming project's agent hits friction with **anthill itself** (a skill that misled it, a CLI bug, a
confusing instruction) — **or has an idea to make anthill better** — there is today no way to send that
_home_. Every feedback touchpoint in the repo routes the wrong way.

This proposal adds a first-class **upstream feedback path**: an `anthill feedback` CLI command that
composes a GitHub issue against the anthill repo (human-gated, lead-owned), plus a **reframe of the
existing touchpoints** so they explicitly distinguish _team-local_ feedback (stays in the consuming
project) from _anthill-upstream_ feedback (goes home so every project benefits) — and so they invite
**ideas and suggestions**, not just bug reports.

## Problem Statement

Two conflated gaps, both confirmed by grep across the repo:

1. **No upstream transport, wrong audience.** All six lifecycle skills carry a `## Skill feedback`
   section, but every one routes the same way: _"jot to your scratch → raise at
   `anthill:finalize-session` / flag the human/lead."_ That is **100% team-local** — the feedback loops
   back into the consuming project's own finalize and dies there. "These skills improve by use" is
   aspirational: nothing carries the improvement out of the consumer and back to anthill. The
   `paper-cuts.md` seed _does_ have a "filed upstream (file an issue there)" disposition, but it's
   framed around **spellbook** and anthill-itself isn't named as an upstream even though it's the
   consumer's dependency. There is no `anthill feedback` command and no issue transport anywhere in the
   CLI.

2. **Corrective-only framing suppresses the generative half.** Every touchpoint is worded as friction
   capture — "what bit you," "what was rough," a _paper-cuts_ log. Nobody files "here's a nicer way this
   could work" into a friction log. The framing silently discards feature ideas and improvement
   suggestions, which are exactly the feedback a maturing product most wants from the field.

3. **Duplicate-issue risk on a team.** If every seat that hits the same anthill friction independently
   submits, a multi-seat team produces N copies of one issue. Feedback needs to route the way decisions
   already do — through the lead — so it's deduped before it's sent.

## Proposed Solution

Three parts. It is a genuinely **multi-seat feature**: forager owns the CLI command, weaver owns the
touchpoint reframe + issue template, and the **command surface (args + the emitted `{title, body, url}`)
is the forager↔weaver seam** the skill prose references — a natural second `anthill:plan` run.

### Design principles

- **Feedback is generative, not just corrective.** Every touchpoint invites a bug, a rough edge, **or an
  idea / suggestion / feature** — with equal welcome. This is the _voice_ of the whole feature, carried
  in the help text, the skill pointers, and the issue template.
- **The lead owns the outward sends.** anthill already routes decisions to the human _through the lead_
  and gives the lead the _atomic land_ (`anthill commit`). Upstream feedback is the third member of that
  family: seats **surface** candidates; the **lead dedupes and submits**. No new mechanism — it rides
  the vine (peers notice a shared issue) and the finalize triage (the lead aggregates), both of which
  already exist.
- **Privacy: only the human-reviewed message carries project detail.** Auto-gathered context is limited
  to non-sensitive environment facts; the command never auto-includes the consumer repo's name, paths,
  or code.
- **No feedback is lost — the send degrades, it never drops.** If `gh` fails (missing, unauthed,
  offline), the command still returns the composed issue + a working prefilled URL + an actionable "this
  needs a manual route" note. The tooling failing is _itself_ feedback-worthy; losing the report because
  the reporter broke is the one outcome to design out.
- **System provenance is machine-recognizable.** Every issue submitted through the command is
  auto-tagged with a provenance label the agent does not choose — so feedback filed _via this pipe_ is
  trivially distinguishable from an ordinary hand-filed GitHub issue (and a future `--list` can pull
  exactly the system-originated set).

### 1. The `anthill feedback` CLI command

`scripts/anthill/commands/team-feedback.ts` (matches the `team-*.ts` sibling naming), registered in
`cli.ts`, emitting through the existing `agent-layer` `{ok, data, meta}` envelope.

Surface:

```
anthill feedback "<message>" [--category bug|friction|idea|docs] [--skill <name>] [--submit] [--format text|json]
```

- **Default (no `--submit`)** — composes an issue and **emits it, sending nothing**. Envelope:
  `{ok, data: {title, body, repo: "ichabodcole/anthill", submitCmd, issueUrl}}`. Safe to call to
  think-out-loud or to hand a draft up to the lead.
- **`--submit`** — runs `gh issue create --repo ichabodcole/anthill --title … --body … --label
anthill-feedback`. The **`anthill-feedback` provenance label is always applied by the command**, not
  chosen by the agent — it marks the issue as system-originated. On any failure (`gh` missing, unauthed,
  offline, API error) it **degrades without losing the report**: emits the prefilled `issueUrl`, the
  full `body`, and an actionable "tooling failed → file this manually / hand to the lead / surface to the
  human" note in `warnings`, exiting `ok` (never throws — house guard convention).
- **The `--submit` gate is load-bearing.** A bare `anthill feedback "…"` _cannot_ send by construction,
  which is what lets a seat compose freely and route the draft to the lead without risk of an
  unintended issue.

**Categories** (`--category`): `bug` (actually broken) · `friction` (rough but not broken) · `idea`
(suggestion / improvement / feature request — the generative lane) · `docs` (the instructions misled
me). The **title is prefixed** `[feedback/<category>]` so triage sees `[feedback/idea]` vs
`[feedback/bug]` at a glance and generative feedback isn't filed as noise.

**Auto-gathered context** (folded into the body so an agent needn't assemble it): anthill version, OS /
platform, Bun version, the category, and the originating skill/command (`--skill`). **Never
auto-included:** the consumer repo's name, paths, or any code — only the message carries project detail,
and the message is human-reviewed before send.

### 2. The touchpoint reframe (the adoption half — the actual gap)

- **Single-source the "two audiences + generative" framing** in `anthill feedback --help` and one line
  in the SOP seed (`templates/docs-team/README.md`): _friction or ideas about **your project/team** →
  your finalize / `paper-cuts.md`; a bug, rough edge, **or idea about anthill itself** → `anthill
feedback`, so every project benefits. On a team, surface it to the lead — don't `--submit` yourself;
  the lead dedupes and sends. Solo? You're the lead — compose, confirm with the human, submit._
- **The six `## Skill feedback` sections** get a short **pointer** to that framing — **not a
  restatement** (the don't-restate-shared-truth rule): _"anthill's own tooling bit you — or you've got
  an idea to improve it? → `anthill feedback` (routes through the lead on a team)."_
- **The `paper-cuts.md` disposition** (rendered into consumers) names **anthill** as an upstream target
  alongside spellbook, with `anthill feedback` as the streamlined path.
- **`anthill:finalize-session`** gains a one-line lead step: _aggregate + dedupe the team's
  anthill-upstream feedback candidates and submit the deduped set_ — slotting into the lead's residual
  finalize pass beside the seams pass and structure reflection.

### 3. Triage in the anthill repo

- A **`.github/ISSUE_TEMPLATE/anthill-feedback.md`** (markdown, not an issue form — agent-ergonomic)
  shaped for _all four_ categories — a "what / why + which category" body, not a bug-report form — so the
  generative framing lands at the receiving end too. `--submit` bodies match it, and manual filers use
  the same shape.
- The **`anthill-feedback` provenance label** must exist in the repo (a one-time setup — `gh issue
create --label` requires the label to pre-exist). The command always applies it; category rides the
  title prefix (`[feedback/<category>]`), so one label covers provenance and the title covers kind — no
  per-category labels needed for the MVP.
- Feedback issues become a **convene-time triage input** — the lead reads them (filtered by the
  provenance label) at the roadmap gather-the-work step, and they flow into the roadmap / backlog /
  paper-cuts like any input.

## Scope

**In scope (MVP):**

- `anthill feedback` command (compose + `--submit` + graceful `gh` fallback + auto-context + generative
  categories + title prefix), registered and tested.
- The touchpoint reframe: single-source framing (help + SOP), the six skill pointers, the paper-cuts
  disposition, the finalize lead step.
- `.github` markdown issue template + the auto-applied **`anthill-feedback` provenance label** (created
  once in the repo).
- Privacy line: never auto-include repo content; and the "no feedback is lost" degraded-send path.

**Out of scope (at least initially):**

- **Grapevine transport** — machine-local; can't reach an external maintainer. (A cross-project
  `anthill-feedback` channel could be a future nicety for a same-machine ecosystem, but GitHub is the
  general transport.)
- **A batch-accumulate file** — the compose-per-item + lead-dedupe-at-finalize rhythm covers it; a
  dedicated pending-feedback store is a future if volume warrants.
- **Dedup tooling** — dedup is the lead's judgment over the vine + finalize, not a command feature.
- **Auto-capture of repo content / a telemetry channel** — deliberately not built (privacy).
- **Config-schema change** — none needed.

**Future considerations:**

- `anthill feedback --list` — filtering the repo's issues by the `anthill-feedback` provenance label to
  show the system-originated set (and/or locally-pending candidates to help the lead's dedupe pass, if
  teams get large enough that in-head aggregation strains). The provenance label is what makes this
  clean.
- A same-machine grapevine `anthill-feedback` channel for the dreamwood ecosystem.

## Technical Approach

- **Pure functions are the unit-test target** (house convention): `composeFeedbackBody({message,
category, skill, version, platform, bunVersion})` → the markdown body; `feedbackTitle(category,
message)` → the prefixed title; `buildIssueUrl(repo, title, body)` → the prefilled
  `…/issues/new?title=…&body=…` URL. All pure, golden-testable.
- **The command** is a thin `defineAnthillCommand` wrapper: gather env → call the pure composers → on
  `--submit`, **attempt** `gh issue create … --label anthill-feedback` and **catch** (no pre-check); on
  any failure, emit the URL + full body + manual-route note in `warnings` and exit ok → `emit` the
  envelope. Guards emit, never throw, in JSON mode.
- **Version/env** reuse whatever `info-env` / the version resolver already expose (the CLI already prints
  its version in `--help`).
- **No config change**, no coordination-layer (grapevine/bounty/tmux) change.
- **The seam** — `ScanReport`'s analogue here: the command's **arg surface + emitted `{title, body,
issueUrl}`** is the contract the skill prose (weaver) references when it tells agents how to invoke
  feedback. Ratify it before weaver writes the pointers.

## Impact & Risks

**Benefits:** anthill finally has a field-feedback loop — bugs _and_ ideas flow home, deduped, so every
consuming project's friction improves the product. The generative framing unlocks feedback the
corrective-only touchpoints were suppressing.

**Risks:**

- _An agent submits without the human / without the lead._ Mitigation: `--submit` gates all sending
  (a bare call can't send); the skill prose carries the seats-surface-lead-sends routing; submission is
  a human-confirmed, lead-owned action.
- _Leaking project detail upstream._ Mitigation: only the human-reviewed message carries project detail;
  auto-context is non-sensitive env only; the human sees the exact body before `--submit`.
- _Duplicate issues from a team._ Mitigation: route through the lead; dedupe on the vine + at finalize.
- _`gh` unavailable / unauthed / offline._ Mitigation: attempt-and-catch; the send degrades to a
  prefilled URL + body + an actionable "file this manually" note, never errors and never drops the
  report (the "no feedback is lost" principle).

**Complexity:** **Low–Medium** — a small command + pure composers, and a set of surgical prose reframes.
The subtle part is the framing voice (generative + audience-explicit + lead-routing), not the code.

## Resolved decisions (from the 2026-07-05 brainstorm)

- **`gh` handling — attempt-and-catch (resolved).** Don't pre-check `gh auth status`; just attempt
  `gh issue create` and catch. **The failure path must not lose the feedback:** on any failure the
  command returns the composed feedback plus an actionable fallback — the prefilled `issueUrl`, the full
  `body`, and a clear note that _the tooling failed, so this needs a manual route_ (open the URL, or the
  lead files it, or it goes into a report / to the human). Exit `ok` with `warnings`, never a bare
  error. See the "no feedback is lost" principle.
- **Issue template — markdown, on agent-ergonomic grounds (resolved).** This is an agent-ergonomics
  question, not an aesthetic one: whatever is easiest for an agent to `--submit` against wins. A GitHub
  _issue form_ imposes structured required fields the agent must satisfy exactly; a **markdown template**
  is a free-form body the composer fills — lower friction for programmatic submission. Markdown template
  for the MVP.
- **`--category` — optional, but surfaced (resolved).** Not mandatory (default `friction`), but **the
  help text and skill pointers explicitly note it's an available field** so an agent supplies it when it
  can — most will if they know it exists. Optional-with-a-visible-affordance, not required.

## Success Criteria

- From a consuming repo, `anthill feedback "<msg>" --category idea` composes a correct, generatively-framed
  issue and, on `--submit` with `gh` available, files it to `ichabodcole/anthill` **carrying the
  `anthill-feedback` provenance label**; without `gh`, it returns a working prefilled URL + body + a
  "file manually" note and **loses nothing**. A bare call (no `--submit`) files nothing.
- A fresh agent reading any lifecycle skill can tell **anthill-upstream** feedback from **team-local**,
  knows ideas are welcome (not just bugs), and knows to **route through the lead** on a team.
- The anthill repo receives feedback as labeled, template-shaped issues that triage into the roadmap at
  convene.
- **No regression:** team-local feedback still flows to finalize / paper-cuts unchanged.

---

**Related Documents:**

- [ROADMAP](../../ROADMAP.md)
- [paper-cuts seed](../../../templates/docs-team/paper-cuts.md)

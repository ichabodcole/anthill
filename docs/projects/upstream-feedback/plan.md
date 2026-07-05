# Plan — `anthill feedback` (upstream feedback)

**Status:** Skeleton (awaiting ratify) · **Lead:** maestro · **Created:** 2026-07-05
**Proposal:** [proposal.md](./proposal.md) · Builds on the `plugin/` layout (post-restructure).

> **SKELETON, not a finished plan.** The lead's **hypothesis** — the integration order + the one
> cross-seam contract as a **claim** for the owners to falsify/ratify before building. Per-owner lanes
> (`plan/<seat>.md`) are authored by the owners after ratify. Method:
> [`anthill:plan` methodology](../../../plugin/skills/plan/methodology.md).

---

## How this plan is authored (ownership split)

- **maestro (lead)** — this skeleton, the shared seam, the verification gate, the atomic land.
- **forager** — `plan/forager.md`: the `anthill feedback` command + pure composers + tests, and the
  receiving-end infra (`.github/ISSUE_TEMPLATE/` + the `anthill-feedback` label). **Authoritative for
  the command invocation contract** (below).
- **weaver** — `plan/weaver.md`: the touchpoint reframe — the canonical framing, the six `## Skill
feedback` pointers, the SOP-seed line, the `paper-cuts` disposition, the `finalize-session` lead step.
  **Consumes** the command contract; owns the framing voice.
- **sentinel** — verification: the quality gate, the compose/`--submit`/no-loss behavior, the
  provenance label, and a cold-read of the touchpoint framing (does a fresh agent know team-local vs.
  anthill-upstream, that ideas are welcome, and to route through the lead?).

## Integration / dependency order

1. **Command invocation contract ratified** (forager × weaver) — the shape weaver's prose points at.
2. **forager builds** the command + composers + tests + issue template/label.
3. **weaver builds in lockstep** the touchpoint prose against the ratified contract (can draft against
   the ratified shape in parallel; final wording references the real `--help`).
4. **sentinel verifies** — gate + behavior (compose sends nothing; `--submit` files with the provenance
   label; `gh` failure loses nothing) + framing cold-read.

## Shared interfaces — _ratify on the vine, then fill_

### forager → weaver — the `anthill feedback` invocation contract — (RATIFIED — forager × weaver, 2026-07-05)

Promoted to [`seams.md` Contract 2](../../../.anthill/dev/seams.md). Ratified shape:

```
anthill feedback "<message>" [--category bug|friction|idea|docs] [--skill <name>] [--submit] [--format text|json]

Guards (emit, don't throw): empty message → emitError exit 1; unknown --category → emitError exit 1.

DEFAULT (no --submit): composes + emits, SENDS NOTHING →
  { ok, data: { title, body, repo:"ichabodcole/anthill", issueUrl(prefilled), submitCmd } }
--submit: gh() = spawnSync("gh",["issue","create","--repo","ichabodcole/anthill","--title",title,"--body",body,"--label","anthill-feedback"])
  success → { ok, data:{ title, body, issueUrl:<created URL from gh stdout> } }
  ANY failure (gh missing/unauthed/offline/unknown-label/API) →
    { ok, data:{ title, body, issueUrl:<prefilled> }, warnings:["<manual-route note>"] }, exit 0   — never drops, never throws

title  = "[feedback/<category>]  " + first-line(message), whitespace-collapsed, ≤~72c
body   = message + auto-context (version = main.meta.version [NOT info-env]; os.platform/os.release; process.versions.bun; category; --skill).  NEVER repo name/paths/code.
label  = "anthill-feedback"  ALWAYS applied at create, command-controlled (provenance).
submitCmd = "anthill feedback \"<msg>\" --category <cat> [--skill …] --submit"   (self re-invoke, NOT raw gh — the string a seat hands the lead so the send stays inside the guards)
issueUrl  = success → real created URL; else → prefilled …/issues/new?title&body&labels=anthill-feedback
category = optional, default "friction";  --skill = free-form string
```

**Testable seams** (forager): pure `composeFeedbackBody`/`feedbackTitle`/`buildIssueUrl` (env injected as
params) + pure `interpretGhResult({status,stdout,stderr}) → {issueUrl,warnings}`; `gh()` is a thin
injectable `spawnSync` seam (array args → no shell), stubbed in command tests. No real issues in tests.

**Repo setup** (forager owns, at repo ROOT — not shipped): `gh label create anthill-feedback` (one-time;
the `--submit --label` requires it to exist) + `.github/ISSUE_TEMPLATE/anthill-feedback.md`.

**The framing — two DISJOINT single-sources (the ruling on the sub-seam):**

- **Command-facing truth** (what it's _for_: anthill-upstream, **ideas as welcome as bugs**, the
  categories) → **the command `--help`/`meta.description`, forager-owned** — ONE generative-first
  sentence (not a paragraph). Canonical because `--help` is invocable identically from every consumer
  repo. weaver's cold-read verifies it lands generatively.
- **Team-routing truth** (team-local vs. upstream; **seats surface, the lead submits**; solo = you're
  the lead) → **the SOP seed, weaver-owned.** The command has no team concept, so routing must NOT live
  in `--help`.
- **Everything else POINTS** — the six `## Skill feedback` pointers carry only the terse "on a team,
  surface to the lead" safety nudge (the one justified echo, at the danger point); paper-cuts = a
  disposition line; the finalize lead step = a one-line action. No restatement of flag semantics.

## Slices (one paragraph per owner → lane file)

- **forager — the command + infra** (`plugin/scripts/anthill/`, `.github/`): `commands/team-feedback.ts`
  via `defineAnthillCommand`; pure composers `composeFeedbackBody`/`feedbackTitle`/`buildIssueUrl`
  (unit-test target, golden); the `--submit` gh shell-out with attempt-and-catch + graceful fallback;
  register in `cli.ts`; `.github/ISSUE_TEMPLATE/anthill-feedback.md` (markdown, all four categories) +
  the `anthill-feedback` label (a one-time repo setup — document the `gh label create` step). Authors
  `plan/forager.md`.
- **weaver — the touchpoint reframe** (`plugin/skills/`, `plugin/templates/docs-team/`): the canonical
  framing (per the ratified sub-seam), the six `## Skill feedback` pointers, the SOP-seed line, the
  `paper-cuts` disposition naming anthill upstream, the `finalize-session` lead step (aggregate + dedupe
  - submit). Generatively framed, single-sourced (point, don't restate). Authors `plan/weaver.md`.
- **sentinel — verification** (cross-cutting): gate + behavior proofs + framing cold-read. Engages late.

## Verification gate (what "assembled and correct" means)

- `bun run check` green (tsc + biome + `bun test`).
- **Behavior:** a bare `anthill feedback "x"` composes and **files nothing**; `--submit` (with `gh`
  stubbed/available) issues a `gh` create carrying the `anthill-feedback` label + `[feedback/<cat>]`
  title; a simulated `gh` failure returns the body + `issueUrl` + manual-route note and **loses
  nothing**, exit 0.
- **Privacy:** the composed body contains only the message + non-sensitive env — no repo name/paths.
- **Framing cold-read:** a fresh agent reading a lifecycle skill can distinguish team-local vs.
  anthill-upstream, knows ideas are welcome, and knows to route through the lead.

## Ratified decisions & edge cases

Settled at the 2026-07-05 ratify (both owners + lead ruling):

- **Framing = two disjoint single-sources** (command-facing → `--help`; team-routing → SOP). weaver's
  re-cut of the sub-seam; it dissolves the duplication risk. See the seam above.
- **`submitCmd` is the self-re-invocation, never raw `gh`.** A raw `gh …--body '<multiline>'` string is a
  shell footgun AND bypasses the command's no-loss guards. The seat hands the `anthill feedback … --submit`
  string to the lead → the lead re-runs through the command. This IS the "seats surface, lead submits" flow.
- **`body` is the true no-loss artifact** (URLs truncate); `issueUrl` is a convenience that differs by
  branch (created-URL on success, prefilled on failure).
- **Version source = `main.meta.version`**, not `info-env` (which only lists `.env` keys — my skeleton
  was wrong).
- **Category set stays `bug|friction|idea|docs` (default `friction`)** — but weaver's prose **leads
  generative-first** so the corrective-heavy set + corrective default don't suppress ideas. A voice
  compensation weaver owns, not a command change.
- **Unknown-label degrades, doesn't hard-fail** — a not-yet-set-up repo falls through the same no-loss
  catch to the prefilled URL + body + warning.
- **Guards:** empty message and unknown `--category` both `emitError` + exit 1 (mirror team-commit's
  precondition guards).
- **The finalize lead step** rides the existing intake (vine + scratch + returns) → the lead dedupes +
  submits, mirroring how the lead single-sources `seams.md`. No new store (honors "no store without a
  named re-read moment"); distinct from finalize's own `## Skill feedback` pointer.

## What's deliberately ABSENT

- **No grapevine transport** (machine-local; can't reach an external maintainer).
- **No batch-accumulate store / dedup tooling** — dedup is the lead's judgment over the vine + finalize.
- **No auto-capture of repo content** (privacy).
- **No config-schema change**; no coordination-layer change.
- **The `.github/` template + label live at the repo ROOT, not under `plugin/`** — they're GitHub repo
  infrastructure, not shipped plugin content.

## Open questions — all resolved at ratify

- ~~Canonical-framing home~~ → **two disjoint homes** (command-facing → `--help`; team-routing → SOP).
- ~~`--submit` test strategy~~ → pure `interpretGhResult` golden + an injectable `gh()` seam stubbed in
  command tests; no real network.
- ~~Title summary derivation~~ → `[feedback/<cat>] ` + first-line, collapsed, ≤~72c (forager's call).
- ~~Category default~~ → optional, default `friction`, surfaced in the touchpoints; prose leads
  generative-first.
- **Still open (forager's build call, non-blocking):** whether `docs` is the clearest token for "the
  instructions misled me" — forager flagged it; keep `docs` unless a better token surfaces during build.

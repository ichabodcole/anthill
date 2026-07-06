# anthill feedback — upstream feedback path (the 2nd dogfood)

**Date:** 2026-07-05

Built `anthill feedback` — a first-class way for consuming projects to send **bugs AND ideas** home to
the anthill repo (not their own team). The **second `anthill:plan` dogfood** (first on the `plugin/`
layout). Landed `6cb19c1` on `feat/upstream-feedback` (awaiting human sign-off → develop).

- **The command:** `anthill feedback "<msg>" [--category bug|friction|idea|docs] [--skill] [--submit]`.
  A bare call **composes + sends nothing**; `--submit` files a GitHub issue (label `anthill-feedback`,
  title `[feedback/<cat>]`) via an injectable `gh()` seam; **any** gh failure degrades **no-loss**
  (prefilled URL + full body + warning, exit 0 — the body is the true no-loss artifact). Pure composers
  - `interpretGhResult` are golden-tested; the body carries only non-sensitive env (privacy asserted).
- **`submitCmd` = the self-re-invocation** (`anthill feedback … --submit`), never raw `gh` — the string
  a seat hands the lead. This makes "seats surface, the lead submits" concrete and keeps the send inside
  the guards. Submission is lead-owned (like `anthill commit`); dedup rides the vine + finalize.
- **Framing = two disjoint single-sources** (weaver's ratify re-cut): command-facing (what it's for,
  ideas-welcome) → `--help`; team-routing (seats surface, lead submits; solo = lead) → the SOP seed. Six
  skill pointers + paper-cuts + a finalize lead-aggregation step **point**, never restate. `seams.md`
  Contract 2.
- **Dogfood dividend:** forager, tracing the version source, found `release-please-config.json` paths
  **stale after the distribution restructure** — a release bug (version wouldn't bump) caught + fixed
  mid-build, purely because a builder followed a dependency out of its lane.

Verified (sentinel): 147 pass; compose-sends-nothing, no-loss failure branch, guards, privacy-from-a-
nested-cwd, single-source cold-read — all confirmed, **no real `--submit` ever run** (hard guardrail).

**Release-time setup:** `gh label create anthill-feedback` (command degrades gracefully without it).

**Docs:** [proposal](../projects/_archive/upstream-feedback/proposal.md) ·
[plan](../projects/_archive/upstream-feedback/plan.md) ·
[session](../projects/_archive/upstream-feedback/sessions/2026-07-05-feedback-dogfood.md) ·
[seams.md Contract 2](../../.anthill/dev/seams.md)

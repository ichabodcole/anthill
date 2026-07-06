# Session — `anthill feedback`, the second `anthill:plan` dogfood

**Date:** 2026-07-05
**Branch:** `feat/upstream-feedback` (rebased onto restructured `develop`) — **awaiting human sign-off**
**Team:** maestro (lead) · forager (command) · weaver (touchpoints) · sentinel (verify)
**Landed:** `6cb19c1` (feature) · finalize commit follows

---

## What this was

A first-class **upstream feedback** path: `anthill feedback` lets a consuming project's agent send
**bugs AND ideas** home to the anthill repo (not to its own team). Built as the **second `anthill:plan`
dogfood** — a genuine multi-seat feature (forager owns the command, weaver the touchpoints, seam = the
invocation contract), and the first exercise of `anthill:plan` on the **post-restructure `plugin/`
layout**.

## The arc

1. **Rebase + path-align.** The feedback branch was cut before the distribution restructure; rebased
   onto the new `develop` and re-pointed the spec's paths to `plugin/`.
2. **Skeleton (lead).** Seam = the `anthill feedback` invocation contract, with a **sub-seam** flagged:
   where does the canonical framing live?
3. **Ratify (the crown jewel).** forager (owner) + weaver (consumer), independent. Both
   RATIFIED-WITH-CHANGES, converging — and weaver **re-cut the sub-seam** better than posed (below).
4. **Build in lockstep.** forager: command + pure composers + guards + injectable `gh()` + tests +
   `.github` template. weaver: the SOP framing + six skill pointers + paper-cuts + finalize step.
5. **Verify (sentinel): Ready to land — Yes.** 147 pass; behavior + privacy + single-source cold-read
   all confirmed; **no real `--submit` ever run** (hard guardrail).
6. **Land + finalize.**

## What the ratify caught / improved (before build)

- **The sub-seam re-cut (weaver).** The skeleton posed "framing home: `--help` **or** a weaver doc."
  weaver rejected the binary: the framing is **two disjoint truths**, each single-sourced in its
  natural home — **command-facing** (what it's for, ideas-welcome) → `--help` (invocable from every
  consumer repo); **team-routing** (seats surface, lead submits; solo = lead) → the SOP (the command
  has no team concept). This dissolved the duplication risk instead of managing it.
- **`submitCmd` footgun (forager).** The claim's `submitCmd` as a raw `gh …--body '<multiline>'` string
  is a shell footgun **and** pasting it bypasses the command's own no-loss guards. Redefined as the
  **self-re-invocation** (`anthill feedback … --submit`) — which is exactly the "seat hands the lead the
  send" flow made concrete.
- **Wrong version source (forager).** The skeleton said "reuse `info-env` for version"; `info-env` only
  lists `.env` keys — the version is `main.meta.version`. Caught at ratify.

## A dogfood dividend — a release bug caught mid-build

forager, wiring the feedback body's reported version to `main.meta.version`, traced that marker to
`release-please-config.json` and found its paths **stale after the distribution restructure**
(`scripts/anthill/cli.ts` + `.claude-plugin/plugin.json` still at the old locations). Left unfixed, the
version marker wouldn't bump on release and the feedback body would report a stale version. **Fixed**
(`plugin/…` paths) in the feature commit — a cross-cutting bug surfaced only because a builder followed a
dependency out of its lane.

## Verification (sentinel)

- `bun run check` green — **147 pass** (18 new).
- **Behavior:** bare call composes + **sends nothing**; `--submit` failure branch (simulated `gh`-missing)
  returns body + prefilled URL + warning at **exit 0**, nothing lost; guards (empty msg, unknown
  category) `emitError` exit 1.
- **Privacy:** composed body carries only message + non-sensitive env — asserted clean even when run from
  a nested cwd (no path/cwd/repo-name leak).
- **Tests prove branches, not stubs:** the default path uses a `forbiddenGh` that throws if called;
  `interpretGhResult` is independently golden-tested.
- **Single-source framing cold-read: PASS** — canonical team-routing once in the SOP; `--help` one
  generative-first sentence; six pointers terse; finalize's lead-aggregation step distinct from its own
  skill-feedback pointer.

## Method notes

- **Second subagent-finalize exercise** — forager + weaver both self-captured their lessons into their
  seat docs as their tasks' final step (baked into the build briefs). The lead didn't reconstruct them.
- **The hard "don't send outward" guardrail** worked: sentinel verified the `--submit` branch without
  ever filing a real issue (code + stubbed tests + a `gh`-missing simulation).

## Follow-ups (non-blocking)

- **`docs` category token** — forager questioned whether `docs` is the clearest token for "the
  instructions misled me." Left as-is; revisit if it reads oddly in the field.
- **Create the `anthill-feedback` label** on the repo (`gh label create anthill-feedback`) — a one-time
  setup; the command degrades gracefully without it (no-loss catch), so not a blocker, but `--submit`
  is tidier once it exists. A release-time step.
- The `.github` template + label are repo infrastructure (root, not shipped in `plugin/`).

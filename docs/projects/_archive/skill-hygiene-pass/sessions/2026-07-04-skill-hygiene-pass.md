# Skill-hygiene pass — pre-reconvene rails — 2026-07-04

## Context

Not a designed project — a batch of three roadmap items landed together as the cheap, high-leverage
"rules before tooling" work to run **before the first instrumented dogfood session** (roadmap #4, the
reconvene). The reconvene _is_ the dogfood, so the rails it runs on should be in place first. Branch:
`feat/skill-hygiene-pass`. Items: ROADMAP #5 (ritual checklists), #6 (the `anthill commit` ×
lint-staged paper-cut), #7 (cheap SOP/ritual edits from the review + taxonomy investigation).

## What Happened

Three parts on one branch.

**Part C — #6, the commit paper-cut** (`fix(commit)`, `ee8b62d`). `anthill commit` used a partial
`git commit -- <paths>`, which builds a **temporary index** that lint-staged's stash/backup dance
corrupts — every pre-commit check passes, then the commit dies citing a phantom "invalid object" for
an unrelated file. Hit reproducibly in this repo (husky 9 + lint-staged 17); it's the friction _we_
kept hitting all session. Fix (design chosen by Cole — **abort-on-mismatch**): under the existing
serialize lock, stage the named paths → **verify the index holds exactly those paths** (set-difference
of the full `git diff --cached --name-only` against the pathspec-filtered set — same git namespace, no
path normalization) → commit **without** a pathspec. The whole-index commit runs the hook against the
_real_ index, sidestepping the temp-index corruption; the verification replaces the pathspec's
no-sweep guarantee. Unexpected staged content (a peer's out-of-band `git add`, or leftover staging)
**aborts loudly** and restores the index (`git reset -- <paths>`) rather than riding along. Tests:
pure `unexpectedStaged` + three end-to-end throwaway-repo tests (happy path, no-sweep of an untracked
peer, abort-on-unexpected).

**Part A — #5, ritual checklists** (`docs(skills)`, `ead9e66`). The fix per the roadmap is making the
skills **emit** the checklist, not adding a form. Added:

- `finalize-session` — a teardown **closing checklist** carrying the one genuine gap: the **human
  sign-off gate before the feature branch merges to `develop`** (green tests + a checked board are the
  team's own signals; the human's look — UI, feel, feedback — is a gate the team can't self-run, and
  "we're done" momentum is when it gets skipped). Plus a route-at-synthesis note on the synthesis step.
- `convene` — a lead setup checklist (grapevine → board + seeded/sized cards → brief → spawn).
- `join` — a member checklist (grounded → vine → board → introduced → scratch → route through the
  lead, never block on the human).

**Part B — #7, cheap SOP edits** (same commit). Into the SOP seed (`templates/docs-team/README.md`):
_the vine evaporates — land decisions in an artifact before finalize_; _no store without a named
re-read moment_; _one intake, route at synthesis_. Into `docs/README.md`: the playbook-pointer rule.

## Finalize

- **Dual review** (net diff vs `develop`): code-reviewer on the commit fix → **Ready to merge: Yes**
  (traced the no-sweep guarantee, lock release on the `process.exit` abort branch, envelope contract;
  two sub-threshold git-per-path notes — a staged rename could spuriously abort (safety-preserving);
  a caller's own path with mixed hunks stages whole, same as before). doc-reviewer on the prose →
  **With fixes**, both applied: (1) de-scoped anthill-only "seat doc / SOP" vocab out of the generic
  `docs/README.md` playbook note; (2) collapsed a near-verbatim "genre-sorting happens here"
  duplication — the SOP now owns the _one intake, route at synthesis_ principle, the skill points to
  it (single-source discipline, which the pass itself was preaching).
- **Quality gate:** `bun run check` green — tsc + biome clean, 107 tests (5 new commit tests).
- **Merge:** fast-forward to `develop` (local; the `develop → main` release PR is Cole's to cut).

## Result

The pre-reconvene rails are in: the commit command no longer trips lint-staged, the lifecycle skills
emit skip-resistant checklists (incl. the human sign-off gate), and three discipline one-liners are in
the SOP seed. Roadmap #5, #6, #7 done.

## Follow-ups

- Sub-threshold from review, not fixed (inherent to git's per-path staging): a **staged rename**
  before `anthill commit` can trigger a spurious abort. Safety-preserving (refuses rather than
  sweeps), and the abort message names what's staged so recovery is obvious. Revisit only if it bites.
- `finalize-session`'s frontmatter still says "DISTINCT from landing the code" while step 5 now gates
  code-merge _timing_ — the in-body bullet self-delineates and no merge command is performed, so it
  holds; left as-is to avoid touching skill-discovery semantics.

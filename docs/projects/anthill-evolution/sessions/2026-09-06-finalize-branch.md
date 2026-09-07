# Finalize `feat/anthill-evolution` — 2026-09-06

## Context

Landing the branch described in [plan.md](../plan.md) and [proposal.md](../proposal.md): the
report-and-curate loop, the team wiki, the curated-doc guard on `anthill commit`, the identity-only
seat docs, and this repo's own migration through curation run 1. Steps 1 to 6 of the plan are done;
step 7 (a working session on the new shape) runs after this lands on `develop`.

Base branch: `develop`. 38 commits, one Anthill seat trailer (maestro), one human author. Landing
policy per `AGENTS.md` § Landing policy: merge, never squash.

## What happened

The branch was built across several sessions on this branch: the design and CLI work (2026-09-03), the
extraction of the old seat docs into a report batch, two blind taxonomy passes over that batch (anthill's
own, then Spellbook's) with a comparison, curation run 1 with Cole, and an editorial pass by another
session that rewrote the skills, templates and team docs as guidance rather than argument.

Curation run 1 was the notable turn. A fresh curator triaged 5,511 lines by class and produced a
256-line proposal. Cole ruled on the batch rather than the rows: clean slate. Only facts wrong today
were corrected in the identity docs, seams and sentinel's Taste section were cut mechanically, and the
finalize page gained five report-writing rules. The method that came out of it is on the team's curate
page as its first four rulings.

## Review

**Census.** Roster read from the Agent tool's available-types listing in the session's system prompt.
Candidates: `general-purpose` (tools `*`, so shell access), `feature-dev:code-reviewer` (Glob, Grep, LS,
Read, NotebookRead, WebFetch, TodoWrite, WebSearch, KillShell, BashOutput; no `Bash`, so read-only),
`doc-reviewer` and `project-docs:docs-curator` (All tools, but document-focused), `code-simplifier`
(All tools, not a reviewer). Chosen: `general-purpose`, briefed plan-aware against the proposal, the plan,
`AGENTS.md`, `CONTRACT.md` and the cascade-check map. Rejected: `feature-dev:code-reviewer` on
capability grounds as the review of record, and not used as a second opinion because the 26,000-line
net diff cannot be pasted into a read-only prompt.

**What the reviewer executed** (quoted from its execution log): `bun run check` (green, 937 pass);
a fresh `anthill init` render smoke into the scratchpad with a two-seat config and `grep -rn '{{'`
(no unrendered tokens); `anthill wiki lint --format json` in the rendered footprint and in the repo (both
clean); guard probes on a fixture repo — `commit --as forager .anthill/dev`, `.anthill`, no `--as`,
`--curated` without `--as`, `../dev/forager.md` from a subdirectory, `.anthill/wiki/`,
`".anthill/dev/*.md"`; `anthill join forager --format json` in the smoke footprint plus `date` and a
`bun -e` UTC-versus-local probe; `help --json` parsed for the `wiki` command; `cat -n` of every skill and
template with a `sed`-substituted diff against `.anthill/**`; grep sweeps for retired terms. It wrote no
files in the repository.

**Verdict: Ready to merge, with fixes.** Findings and resolutions:

1. **The curated guard was bypassed by a directory or glob pathspec** on tracked seat docs. Confirmed by
   the reviewer on a fixture. Fixed in `8a2c6a1`: a second pass runs on the staged list after `git add`,
   post-expansion, and restores the index on refusal. Tests cover the three specs and a positive control.
2. **The report folder used the UTC date.** Fixed: `localDateStamp` uses local components, with a test.
3. **Design doc §6 still listed eight seat-doc fields and an unretired `retro.md`.** Fixed.
4. **`upgrade` promised a migration command that does not exist.** Fixed: it now describes the by-hand
   curation run and points at the first team's rulings.
5. **The close prompts were restated in four places.** Fixed: the join checklist, the convene brief and
   the reports README point at the wiki finalize page.
6. **The finalize teardown invariant diffed the whole seat directory.** Fixed: it names the seat docs,
   seams, principles and the wiki, and says why the roster README is excluded.
7. **`--curated` without `--as` was a silent no-op.** Fixed: refused, with a test.
8. **Guidance-pass misses**: join's description still said lessons live in the doc; convene's checklist
   contradicted its prose on comms presence; the unprocessed-report count included the folder README;
   the SCHEMA type list omitted `index`. All fixed.
9. **Lower-level notes.** The `docs-lint` header pointed at the source repo's entry point (fixed). The
   exit-drain guard's eight-line scan window and the wiki-lint test's use of the raw template rather
   than a rendered footprint are left as follow-ups.

The reviewer's tests-versus-mocks check found the new tests exercise real CLI runs against fixture
repos, with positive controls, and named the two missing controls that the fixes above added.

## Quality checks

`bun run check` (tsc, biome, bun test): green after the fixes, 940 pass, 1 todo, 0 fail. `anthill wiki
lint`: clean. Husky ran the same gate on each commit.

## Follow-up

- Step 7: convene a session on the new shape. Candidate bundle: upstream issues #88, #102, #110, #109.
- Close upstream #74 (convene's `retro.md` read is gone) and #100 (the tmpleak guard) with the release.
- The two deferred review notes: the exit-drain scan window in `cli.exit-drain.test.ts`, and a
  wiki-lint test on a rendered footprint.
- Step 8: `upgrade` carries the migration; Spellbook migrates with the same archive-plus-salvage method.
- Contract 3's `--restore` amendment still lacks forager's ratification; the contract says so.

---

**Related documents:** [plan.md](../plan.md) · [proposal.md](../proposal.md) ·
[curation run 1 proposal](../curation/run-1-proposal.md) · [taxonomy comparison](../taxonomy/COMPARISON.md)

# Anthill Evolution — plan

**Status:** Live — iterative by design. **Created:** 2026-09-03 · **Branch:** `feat/anthill-evolution` off `develop` @ `2f7d8d9`
**Proposal:** [proposal.md](./proposal.md)

Cole's ruling at kickoff: _"play with the clay while it's wet"_ — build the pieces in the order that lets
us feel each one, change anthill's own team on the branch, run a session, and revise. So this plan is a
**sequence with an exit test per step**, not a spec. Deviations are recorded in the Divergences section
below as they happen, classified (gap / improvement / judgement) rather than silently absorbed.

## Sequence

| #   | step                                                                                                                                               | exit test                                                                                             | status                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Wiki + lint.** Port the zero-dep docs-lint core; `anthill wiki lint [--json]`; wiki skeleton templates (SCHEMA, index, one page per touch point) | `anthill wiki lint` runs green on a freshly rendered skeleton and red on a planted orphan / dead link | ✅ 2026-09-03                                                                                                                                                                                  |
| 2   | **Apply to our own team.** Render the wiki into `.anthill/wiki/`, seeded from the SOP README's touch-point sections                                | lint green; SOP sections that moved are pointers                                                      | ✅ rendered + lint green 2026-09-03 · SOP pointers deferred to step 5 (see divergences)                                                                                                        |
| 3   | **Seat docs + seams templates** cut to identity / contracts; `retro.md` template retired                                                           | `team init` on a fixture renders the new shapes; team-init tests updated                              | ✅ 2026-09-03 — templates only; this repo's own seat docs are step 6                                                                                                                           |
| 4   | **Reports.** `reports/` template + `join` mints the report; finalize closes it; the no-curated-doc-changed assertion                               | a fixture session produces one report per seat; the assertion fires on a planted seat-doc edit        | ✅ 2026-09-03 — report path in join's manifest + checklist; `reports/README.md` shipped; the curated-set refusal lives in `anthill commit`                                                     |
| 5   | **Skills rewritten as trigger + pointer.** `join`, `convene`, `finalize-session`, `bootstrap`; `curate` added                                      | each skill names its wiki page; `cascade-check` run                                                   | ✅ 2026-09-03 — finalize-session 662 → 160 lines; `curate` added; convene/join/plan/bootstrap/upgrade point at wiki pages; SOP template + this repo's rendered SOP mirrored; cascade-check run |
| 6   | **Migrate our own team** — the first curation run, with Cole. Pruned material → first report batch                                                 | six seat docs are identity-only; seams cut; `principles.md` untouched; nothing deleted                | ◐ extraction done 2026-09-03 (six seat docs 4,619 → 437 lines; 8-file report batch incl. retro + paper-cuts); curation with Cole pending; seams hand-cut pending                               |
| 7   | **Run a session** on the new shape and see what it feels like                                                                                      | one report per seat exists; Cole reads them                                                           | —                                                                                                                                                                                              |
| 8   | **`upgrade` carries the migration** for other teams; Spellbook migrated                                                                            | Spellbook's tree passes the same exit test as step 6                                                  | —                                                                                                                                                                                              |

Steps 3–5 may reorder after step 2 — that is the point of doing 1–2 first.

## Divergences

- **2026-09-03 · step 1 · judgement.** The proposal said `config.json` `paths` gains a `wiki` knob. It does not: the wiki is
  `<teamDir>/wiki`, derived, exposed as `wikiPath()`. The three existing knobs cascade and are cross-checked for collisions
  between teams (`PATH_KNOBS` drives `LIVING_DOC_PATHS`); a fourth knob touches that machinery and ~10 exact-shape config
  tests for no need anyone has voiced. A team-layer artifact moving with `teamDir` is what every team-layer file already
  does. Revisit if a project asks to put the wiki elsewhere.
- **2026-09-03 · step 1 · judgement.** `anthill wiki lint` exits `0` with `clean: false` when the wiki has problems, rather
  than non-zero. CONTRACT.md: _"outcomes are not errors"_ — and the ported lint's own entry point exits non-zero, so this is a
  deliberate departure from the source, recorded in SCHEMA.md with the `jq -e '.data.clean'` gate recipe.
- **2026-09-03 · step 2 · judgement.** Rendered the wiki into `.anthill/wiki/` but did NOT yet turn the SOP README's
  touch-point sections into pointers. The SOP currently agrees with the shipped skills (synthesise into your seat doc); making
  it point at wiki pages that say the opposite, before the skills change in step 5, would put the SOP and the skills in
  argument for the whole interval. The pointer edit moves with the skill rewrite.
- **2026-09-03 · step 3 · judgement.** `retro.md`'s template is deleted rather than emptied. `init` never deletes, so
  existing teams keep theirs (1059 lines here) until the migration in step 6/8 folds it into the first report batch; a
  fresh team simply never gets one. `paper-cuts.md` stays for now — the proposal folds it into reports, and reports do not
  exist until step 4, so retiring it first would leave friction with no outlet.
- **2026-09-03 · step 4 · improvement.** The proposal's "one guard" was a finalize-time assertion that no curated doc
  changed. It is now a refusal in `anthill commit`: an attributed commit (`--as`) of a seat doc, `seams.md`, `principles.md`
  or anything under `wiki/` is refused with a `failed` envelope unless `--curated` is passed. Same predicate, enforced at the
  one write-point every seat uses, and it fires at the moment of the mistake rather than at the end of the session. Only
  attributed commits are guarded — an unattributed commit on a team tree is already outside the seat protocol, and the
  emitted land command always carries `--as`.
- **2026-09-03 · step 4 · gap.** Adding `wiki lint` and `commit --curated` pushed the help manifest past the exit-drain
  tripwire (32,874 bytes against a 32,768 half-ceiling). The tripwire's own comment prescribes the fix — return instead of
  `process.exit(0)` after the root `--help` manifest emit — and that is what shipped; the test was re-pointed at what is
  still emitted before an exit (the largest single-command entry) and pins the exit's absence against the source, with a
  positive control. Not anthill-evolution's problem to have found, but it was the change that found it.
- **2026-09-03 · step 4 · judgement.** No separate "lead report" file: the lead's report is `reports/<date>/<lead>.md`, the
  same shape as every seat's, plus a Carry-forward section. One less path for convene to know.
- **2026-09-03 · step 5 · judgement.** The finalize-session skill lost its synthesis beat, the cold read, the seams pass,
  the reconcile beat, the structure reflection, the retro, the epitaph gate and the red-tree stash recipe's long form — about
  500 lines, most of them scars. What survived is what the tooling checks or the guard enforces: the broadcast, the report
  close, the land, the stand-down order, the docs-of-record sweep, deferred-item placement, upstream feedback, and the
  teardown. The scars are in git history and in the reports the migration will produce; the skill now says so in one
  paragraph rather than carrying them. **Precedence rule, stated in every touched skill:** where the skill and the wiki
  page differ on _how_, the page wins; where they differ on _what must happen_ (the things the tooling checks), the skill
  wins.
- **2026-09-03 · step 5 · judgement.** "Marked processed" is front matter on the report (`curated: { at, by }`), not a move
  to another folder — a report keeps its path so anything that cited it still resolves, and convene can count the
  unprocessed ones with one grep. Convene now says that count in the brief, so a pile of unread reports is visible rather
  than silent.
- **2026-09-03 · step 5 · gap.** The proposal said `paper-cuts.md` folds into reports. It has not been retired yet: the
  SOP's feedback-routing section now sends project-local friction to the report, but the template still ships and the
  bootstrap render line still names it. Retire it with the migration in step 6, when there is a report batch for its
  contents to go into.
- **2026-09-03 · step 5 (second pass) · improvement.** Cole asked what in the finalize skill actually has to be there. The
  test that settled it: a beat stays in the skill only if the tooling depends on it, another skill depends on it, or it
  defines the touch point's boundary. Everything else is method and moved to the wiki finalize page: the close prompts,
  the carry-forward content, the docs-of-record sweep, deferred-item placement, dedupe, the red-tree stash recipe, board
  and human sign-off, the merge traps. Skill 160 → 85 lines; page 60 → 115. The close prompts had three copies (skill,
  page, reports README) — now one, on the page, with the README pointing at it. Draft pages (`status: draft`,
  `generated.by: anthill`) are the ones `upgrade` may refresh; a `stable` page is the team's and is never touched.
- **2026-09-03 · step 6 · judgement.** The extraction is mechanical and by heading: the five identity sections are kept
  verbatim, every other top-level section (blockquoted epitaphs included) goes to `reports/2026-09-03-migration/<handle>.md`
  in its original order. `retro.md` and `paper-cuts.md` are `git mv`'d into the same batch so their history follows.
  Two things were deliberately NOT judged here and are flagged for curation: sentinel's Taste & reflexes is 112 lines and
  reads like lessons wearing a reflex's clothes; and `seams.md` is untouched, because cutting a contract to invariant · grain ·
  proof is a judgment. `paper-cuts.md` is retired from the template in the same commit (the plan's step-5 gap).
- **2026-09-03 · step 1 · improvement.** The lifted lint core was split into `collectDocsLint` (pure) + `runDocsLint`
  (printing) so the CLI can put the report through its own envelope. Worth upstreaming to agent-cli-conformance; the file
  header says so.

# Anthill Evolution — plan

**Status:** Live — iterative by design. **Created:** 2026-09-03 · **Branch:** `feat/anthill-evolution` off `develop` @ `2f7d8d9`
**Proposal:** [proposal.md](./proposal.md)

Cole's ruling at kickoff: _"play with the clay while it's wet"_ — build the pieces in the order that lets
us feel each one, change anthill's own team on the branch, run a session, and revise. So this plan is a
**sequence with an exit test per step**, not a spec. Deviations are recorded in the Divergences section
below as they happen, classified (gap / improvement / judgement) rather than silently absorbed.

## Sequence

| #   | step                                                                                                                                               | exit test                                                                                             | status                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | **Wiki + lint.** Port the zero-dep docs-lint core; `anthill wiki lint [--json]`; wiki skeleton templates (SCHEMA, index, one page per touch point) | `anthill wiki lint` runs green on a freshly rendered skeleton and red on a planted orphan / dead link | ✅ 2026-09-03                                                                           |
| 2   | **Apply to our own team.** Render the wiki into `.anthill/wiki/`, seeded from the SOP README's touch-point sections                                | lint green; SOP sections that moved are pointers                                                      | ✅ rendered + lint green 2026-09-03 · SOP pointers deferred to step 5 (see divergences) |
| 3   | **Seat docs + seams templates** cut to identity / contracts; `retro.md` template retired                                                           | `team init` on a fixture renders the new shapes; team-init tests updated                              | ✅ 2026-09-03 — templates only; this repo's own seat docs are step 6                    |
| 4   | **Reports.** `reports/` template + `join` mints the report; finalize closes it; the no-curated-doc-changed assertion                               | a fixture session produces one report per seat; the assertion fires on a planted seat-doc edit        | —                                                                                       |
| 5   | **Skills rewritten as trigger + pointer.** `join`, `convene`, `finalize-session`, `bootstrap`; `curate` added                                      | each skill names its wiki page; `cascade-check` run                                                   | —                                                                                       |
| 6   | **Migrate our own team** — the first curation run, with Cole. Pruned material → first report batch                                                 | six seat docs are identity-only; seams cut; `principles.md` untouched; nothing deleted                | —                                                                                       |
| 7   | **Run a session** on the new shape and see what it feels like                                                                                      | one report per seat exists; Cole reads them                                                           | —                                                                                       |
| 8   | **`upgrade` carries the migration** for other teams; Spellbook migrated                                                                            | Spellbook's tree passes the same exit test as step 6                                                  | —                                                                                       |

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
- **2026-09-03 · step 1 · improvement.** The lifted lint core was split into `collectDocsLint` (pure) + `runDocsLint`
  (printing) so the CLI can put the report through its own envelope. Worth upstreaming to agent-cli-conformance; the file
  header says so.

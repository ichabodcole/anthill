# `anthill:bootstrap`: adapt to the host's real formatter and hook setup

**Added:** 2026-07-27 · **Status:** ready to build · **Seat:** weaver
(`plugin/skills/bootstrap/SKILL.md`)

Three bootstrap gaps, all the same species: bootstrap **assumes** a host convention instead of
**detecting** it. That is the adapt-not-dictate principle failing at the one moment it matters most
— first contact with a new repo.

## 1. Step 4's formatter shield assumes one formatter owns everything ([#53](https://github.com/ichabodcole/anthill/issues/53))

Step 4 ("Shield the living docs from the host's formatter") assumes a single `.prettierignore` line
covers the whole `.anthill/` footprint — docs **and** `config.json`. That holds only when one
formatter owns everything.

**It breaks in split-formatter repos.** A real case: media-forge uses **Biome** for
ts/tsx/vue/json/jsonc/css and **Prettier** only for `*.md`. So the `.prettierignore` line shields
the markdown living docs, but `.anthill/config.json` is **Biome's** territory and needs a separate
guard (`!!**/.anthill` in `biome.json`'s `files.includes`). A repo following the skill's one-line
guidance leaves `config.json` exposed to Biome — and to its lint-staged hook on staged `*.json`.

_This repo is itself a split-formatter setup (Biome for TS/JSON, Prettier for markdown), so this is
directly dogfoodable._

**Fix:** detect the actual formatter(s) — check for `biome.json` / a Biome lint-staged glob in
addition to Prettier config — and shield the JSON config in whichever tool owns JSON. Even a note
("if a non-Prettier formatter owns JSON — e.g. Biome — add `.anthill` to **its** ignore too")
closes the gap.

## 2. Bootstrap should detect tree-wide pre-commit hooks ([#44](https://github.com/ichabodcole/anthill/issues/44))

A repo whose pre-commit runs `format:check` and tests **repo-wide** will make every seat's WIP block
every other seat's commit — four cross-seat jams in one session. Bootstrap is the moment to notice
this and say so, since it is setting up a _team_ that is about to walk into it.

**Fix:** detect tree-wide pre-commit hooks during preflight and recommend scoping them to staged
files (the lint-staged pattern) as part of team setup. **Recommend, never rewrite** — the host's
hook is the host's business; anthill supplies the observation.

_Sequencing note: the structural answer to this lives in
[session-branch-strategy](../projects/session-branch-strategy/proposal.md). This item is the
**warning at setup time**, which is worth having regardless of how that lands._

## 3. Detect placeholder grounding docs ([#56](https://github.com/ichabodcole/anthill/issues/56) item 1)

An unfilled `PROJECT_MANIFESTO.md` template was listed to a joining seat as real grounding, yielding
zero signal and an actively wrong inference ("this project has no articulated principles"). The same
placeholder detection needed by
[the join batch](2026-07-27-join-onboarding-batch.md) would let **bootstrap** prompt the human to
fill the template while they are already in a setup conversation — the natural moment.

**Fix:** share one placeholder-detection helper between bootstrap and join. Build it once.

## Acceptance Criteria

- [ ] Step 4 detects which tool owns JSON in the host repo and shields `.anthill/config.json` there,
      not only in `.prettierignore`.
- [ ] Preflight notices a tree-wide pre-commit hook and recommends staged-file scoping — as a
      recommendation, never an automatic edit to the host's config.
- [ ] Placeholder-dominant grounding docs are detected; bootstrap offers to fill them.
- [ ] The placeholder detection is shared with the join path rather than duplicated.

## References

- `plugin/skills/bootstrap/SKILL.md` — step 4 (formatter shield) and the preflight steps.
- `biome.json`, `.prettierignore` in this repo — a live split-formatter example to test against.
- Related: [join onboarding batch](2026-07-27-join-onboarding-batch.md) (shared detection) ·
  [session-branch-strategy](../projects/session-branch-strategy/proposal.md) (the structural fix for #2).
- Issues: [#53](https://github.com/ichabodcole/anthill/issues/53) ·
  [#44](https://github.com/ichabodcole/anthill/issues/44) ·
  [#56](https://github.com/ichabodcole/anthill/issues/56)

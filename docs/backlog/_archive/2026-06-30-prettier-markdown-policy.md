# Prettier markdown policy: decide what (if anything) prettier should format

**Added:** 2026-06-30 · **Status:** Resolved 2026-07-03 — see decision below. Archived.

> **Decision (2026-07-03).** Policy settled: **prettier formats everything except `templates/`
> (render tokens) and `.anthill/` (agent-owned living docs)** — recorded as a note in
> `.prettierignore`. That means `docs/` is now formatted (the earlier `docs/` exclusion was
> **reversed**: with the team's living docs moved to `.anthill/`, the mangle risk that justified
> excluding all of `docs/` no longer outweighed the consistency win), and `skills/` + root markdown
> stay formatted (option **a**, keep-with-belt). Prettier runs with the default `proseWrap: preserve`,
> so no prose reflow. Residual friction worth noting: hand-wrapped inline-code / list-continuation
> lines still got mangled a few times during the 2026-07-03 session and had to be hand-fixed — a
> belt-authoring reminder, not a reason to reopen the policy.

Prettier (via the husky lint-staged `*.md` hook) mangled a `docs/` file live on 2026-06-30: a
hand-wrapped line starting with `+` became a stray list bullet. Prettier's markdown parser treats a
leading `+` / `-` / `*` as a list marker, and there is **no prettier setting to disable that**
(`proseWrap` controls wrapping only, not list interpretation). So the only guards are: exclude the
file from prettier, or author one-sentence-per-line so no wrap ever puts a list-char at a line start.

**Done:** `docs/` added to `.prettierignore` — the prose/pheromone knowledge docs (backlog, sessions,
lessons, fragments, projects, architecture). Highest mangle risk, lowest formatting-consistency value.

**Open decision — the rest of the repo's markdown:**

- `skills/**.md` — the SHIPPED product prose. A mangle here would ship to consumers, but the skills
  also most benefit from consistent formatting. Options: (a) keep prettier + enforce one-sentence-per-
  line authoring (the belt) on skill edits; (b) exclude `skills/` too (accept less consistency for
  mangle-safety). Leaning (a) — skills are reviewed and the belt convention already exists — but it is
  a real judgment call.
- Root `README.md` / `AGENTS.md` / `CLAUDE.md` — prose, infrequent edits; same options.
- Alternative: drop `*.md` from prettier entirely (no markdown formatting anywhere) — simplest, loses
  all md consistency.

## Acceptance Criteria

- [ ] a decided policy for `skills/` + root markdown (keep-with-belt, exclude, or drop md-prettier)
- [ ] the decision recorded (SOP note / `.prettierrc` comment / here) so future edits follow it

## References

- The live incident + fix: the paths-override backlog item's mangle, `.prettierignore` (`docs/` added)
- Consumer-side analog already shipped: the seat-doc formatter belt (unwrapped templates + SOP
  convention) + suspenders (bootstrap/upgrade ignore-guard)
- Field validation: grapevine `anthill-feedback` msg 8, finding #4 (a repo's formatter rewriting
  anthill's files)

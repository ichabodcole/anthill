# `anthill commit`: a land-time protected-trunk guard (backstop to the convene branch beat)

**Added:** 2026-07-10 · **Status:** idea capture (field follow-up on [#34](https://github.com/ichabodcole/anthill/issues/34), surfaced independently by multiple seats during another team's finalize)

The convene pre-spawn branch beat (#34, shipped `4770e05`) **prompts** the branch decision — but a
prompt can be skipped. `anthill commit` is the serialized wrapper every seat's land already flows
through, so it's the natural **land-time backstop**: when HEAD is a **protected** branch, it warns (or
refuses without `--force`) before committing. Defense in depth at the two natural gates — convene
_prompts_ the decision, the commit wrapper _backstops_ it.

**The protected set is CONFIGURABLE — do not hard-code branch names.** This is the load-bearing design
point (and a deliberate steer): anthill must not bake "`develop`/`main` are protected" into its
instruction set. What's protected is **project-local** — for this repo only `main` is protected;
`develop` is the integration branch and our policy _explicitly allows_ docs + small fixes to land
directly on it (see AGENTS.md). A guard that refused on `develop` would fight the very policy #34's
companion just set. So the guard reads its protected set from config and defaults to the repo's
_actually-protected_ trunk — never an anthill-hard-coded list.

**Shape:**

- A `.anthill/config.json` field (e.g. `guard.protectedBranches: string[]`) names the branches
  `anthill commit` refuses to land on directly.
- On a match: **warn + refuse without `--force`** (the escape hatch keeps a deliberate hotfix
  possible), with a message that names the branch and points at the branch policy / the convene beat.
- The check is cheap — `git rev-parse --abbrev-ref HEAD` against the configured set, before staging.

**Why config, not a hard-coded default of `["main"]`:** even `main` isn't universal — trunk-based repos
commit to `main` by design, and the trunk may be named `master`/`trunk`/`prod`. Hard-coding _any_ name
re-imports the exact "impose a workflow the project didn't choose" failure #34 was careful to avoid.
The project supplies the content; anthill supplies the mechanism.

## Open Questions

- **Default when `guard.protectedBranches` is unset** — empty (opt-in, guard off) vs. a best-effort
  inference (e.g. read the remote's default-branch protection, or the grounding-doc policy)? Lean:
  **unset ⇒ off** (explicit opt-in), so anthill never surprises a repo that never asked for a guard.
- **Warn vs. refuse-without-`--force`** — is a loud warning enough (agents may not read it), or is a
  hard refuse-with-escape-hatch the only thing that actually stops a mis-land? Lean: refuse without
  `--force` (matches "never push to `main` directly" being a rule, not a suggestion).
- **Relationship to the convene beat** — the guard's message should point back at the branch policy
  (grounding docs) and the convene beat, so a blocked land teaches the flow rather than just failing.

## References

- Land-time interception point: `plugin/scripts/anthill/commands/team-commit.ts` (the serialized
  `anthill commit` wrapper — already does explicit-paths index verification; a natural sibling check).
- Config: `.anthill/config.json` (a new `guard.protectedBranches`), read via `config.ts`.
- Complements: convene pre-spawn branch beat — [#34](https://github.com/ichabodcole/anthill/issues/34)
  (shipped `4770e05`), branch policy in `AGENTS.md`.

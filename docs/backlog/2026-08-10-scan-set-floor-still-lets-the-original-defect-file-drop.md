# The scan-set floor still lets `team-join.ts` — where the defect lived — drop out

**Added:** 2026-08-10 · **Status:** Open · **Shape:** pin the files that matter, drop the floor
**Surface:** `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts` (the scan-reach test)

The reach test (`:371-395`) names four files — `config.ts`, `commands/team-comms.ts`,
`commands/team-attach.ts`, `commands/team-feedback.ts` — and otherwise asserts a floor of
`files.length >= 20`. **The walk returns 38 source files, so 18 can be lost with the floor still
satisfied.**

`commands/team-join.ts` is one of them. That is the home of `buildLandCommand` — **the real-world
defect this guard's own header cites at `:7`** — and it is neither named in the reach test nor
protected by an allow-list entry.

**Confirmed by mutation 2026-08-10:**

1. Append `export const land = "land it with: anthill commit --as forager";` to
   `commands/team-join.ts` → **RED**. Correct.
2. Leave the defect, and amend `sourceFiles()` (`:135`) with `&& e.name !== "team-join.ts"` →
   **GREEN, 10 pass, 0 fail.**

This is the round-2 finding from `test/guards-assert-their-own-detection` surviving one level in: that
round replaced a directory-level pin with named files plus allow-list consumption, which covers files
that HOLD entries. A file with no entry and no name in the reach test is covered by a count.

**A floor is a count, and this repo's ratified authoring note says cite assertions, never counts**
(`.anthill/dev/seams.md`) — adopted after counts rotted a third time. The floor is the same failure
in a test instead of a doc.

## Acceptance Criteria

- [ ] `commands/team-join.ts` is pinned by name, alongside whatever else has carried a live defect
- [ ] Dropping any pinned file by name fails, mutation-verified
- [ ] The `>= 20` floor is replaced by, or subordinated to, an assertion about WHICH files

## References

- `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts:7`, `:135`, `:371-395`
- `.anthill/dev/seams.md` — the ratified "assertions, never counts" authoring note

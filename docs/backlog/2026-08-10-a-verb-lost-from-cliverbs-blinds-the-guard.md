# A verb lost from `cliVerbs()` blinds the guard, and nothing goes red

**Added:** 2026-08-10 · **Status:** Open · **Shape:** pin the verb set, or make its shrinkage fail
**Surface:** `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts` (`cliVerbs()`, `VERBS`)

The guard derives what it searches for from a live source: it shells out to `anthill help --format
json` and maps the command names. **A shrinking derivation is indistinguishable from a clean tree** —
the same shape as every finding on `test/guards-assert-their-own-detection`, one layer further out.

**Confirmed by mutation 2026-08-10, re-run independently before filing:**

1. Append `export const hint = "start the team with: anthill convene --force";` to
   `commands/team-down.ts` → **RED** (9 pass, 1 fail). Correct.
2. Leave the defect in place, and filter `convene` out of `cliVerbs()`' return — simulating a rename,
   a `hidden: true`, or a change in the help JSON's shape → **GREEN, 10 pass, 0 fail**, with the
   defect sitting in the tree.

**The header's claim is overstated.** `bare-anthill.guard.test.ts:222-224` says the allow-list
consumption assertion "closes a second hole: a verb quietly lost from `cliVerbs()` stops matching,
which orphans that verb's entries here." That holds **only for verbs that hold entries.** The 14
entries cover `attach, feedback, team, commit, comms, join, down`; the positive controls additionally
exercise `comms, spawn, down, help, --flag`. **`convene`, `info`, `status`, `scan`, `init`,
`migrate` and `field-notes` are protected by nothing.**

Note the near-miss that proves the asymmetry: the same mutation done with `spawn` DOES go red — but
only because a positive-control fixture happens to contain the word. That is luck, not coverage, and
it is exactly the kind of accidental green that makes a guard look sound.

## Acceptance Criteria

- [ ] Every verb the CLI defines is either exercised by a control or covered by an assertion that
      goes red when the verb leaves `cliVerbs()`
- [ ] The header claim at `:222-224` states what the assertion actually closes
- [ ] Mutation-verified: dropping any single verb from the derivation fails

## References

- `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts:67-75`, `:222-228`, `:289-315`
- `AGENTS.md` — "How we test", rule 8

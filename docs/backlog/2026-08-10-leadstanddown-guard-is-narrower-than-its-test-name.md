# The lead-stand-down guard is narrower than the test named for it, and its pointers are stale

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one predicate, one control, three line numbers
**Surface:** `plugin/scripts/anthill/commands/leadstanddown.guard.test.ts`

Two findings in one file, both confirmed by mutation 2026-08-10.

## 1. `invokesBareAnthill` only sees a bare `anthill` preceded by a quote

The predicate is ``/`anthill |"anthill |'anthill /`` (`:99`), and its positive control (`:148-163`)
only ever feeds it quote-adjacent forms — so the control cannot probe the gap it leaves. **A bare
`anthill` anywhere else inside the composed string is invisible.**

Mutation — `commands/team-convene.ts:347` changed to:

```ts
`${emittingCli()} comms stand-down --as ${config.lead} (or: anthill comms stand-down --as ${config.lead})`;
```

→ **GREEN, 6 pass, 0 fail** — including the test literally named _"does not invoke a bare
`anthill`"_. A test whose name asserts more than its predicate checks is worse than no test, because
its green is read as the claim in its name.

The same mutation run against `bare-anthill.guard.test.ts` → **RED**. So the class is still caught at
repo level; the defect is the local guard's overstated claim, not a live escape.

## 2. Stale line pointers in the header

The header cites `team-convene.ts:262` and `team-join.ts:485`. **Actual sites today are
`team-convene.ts:346` and `team-join.ts:508`**; `team-join.ts:485` is now the middle of an unrelated
comms-catch-up string, so a reader following the pointer lands on the wrong code and may conclude the
guard describes something it does not.

While fixing them: the header's warning at `:24-27` that the second construction site is unguarded is
**accurate but incomplete** — `bare-anthill.guard.test.ts` does fail closed on that site (mutation:
`team-join.ts:508` rewritten to a bare `anthill` → leadstanddown GREEN, bare-anthill **RED**). That
mitigation materially changes how a reader should weigh the gap, and it is not recorded.

## Acceptance Criteria

- [ ] The predicate matches a bare `anthill ` anywhere in the composed string, or the test is renamed
      to the narrower claim it actually makes
- [ ] A control feeds a NON-quote-adjacent bare `anthill` and expects it caught
- [ ] Header pointers resolve to the real sites, and record the bare-anthill guard's backstop

## References

- `plugin/scripts/anthill/commands/leadstanddown.guard.test.ts:24-27`, `:99`, `:148-163`
- `plugin/scripts/anthill/commands/team-convene.ts:346`, `commands/team-join.ts:508`

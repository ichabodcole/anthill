# The tmpleak walk is `.test.ts`-only, so a shared mint helper would be invisible

**Added:** 2026-08-10 · **Status:** Open · **Shape:** widen one walk
**Surface:** `plugin/scripts/anthill/tmpleak.guard.test.ts` (`testFiles()`)

`testFiles()` (`:97-105`) admits only `*.test.ts`. `plugin/scripts/anthill/commands/test-support.ts`
is a non-test helper module imported by the suite — **exactly where a shared `makeRepo`-style temp-dir
minter would naturally be factored**, and the guard would not see it.

**Confirmed by mutation 2026-08-10** — appended to `commands/test-support.ts`:

```ts
export function leakyMint() {
  return mkdtempSync(join(tmpdir(), "anthill-leak-"));
}
```

→ **GREEN, 7 pass, 0 fail.**

**Latent, not live.** Every `mkdtemp` site in the repo today is inside a `.test.ts` file, so nothing
escapes right now. Filed because the refactor that creates the hole — factoring a repeated fixture
into a helper — is the ordinary, encouraged move, and the guard would go quiet exactly when the mints
became centralised.

## The rest of this guard is sound, and that is worth recording

The audit that found this checked, by running: all 16 allow-list entries are produced as hits on the
current tree; the consumption assertion at `:141` is real (a bogus key → RED); simulating detector
blindness against an already-allow-listed file — rewriting all 9 mints in `scan.test.ts` into a form
the regex cannot see — goes **RED** via the orphaned entry, which is precisely the
`config.test.ts` / `team-migrate.test.ts` failure this guard shipped with and no longer has. The
header's prose count (seven `mkdtempSync(resolve(tmpdir(), …))` across two files) was recounted and
holds at 4 + 3.

**Not verified:** the allow-list reasons are empirical claims ("measured +0 per run") that no static
test can revalidate. `commands/team-comms.test.ts` is listed as "per-test cleanup" while carrying 13
mints across module-level and per-test scopes; nobody re-measured the `$TMPDIR` delta.

## Acceptance Criteria

- [ ] The walk reaches non-test modules that the test suite imports
- [ ] A positive control injects a mint into the new surface

## References

- `plugin/scripts/anthill/tmpleak.guard.test.ts:97-105`, `:141`, `:253-257`

# `migrate` hardcodes gitignore lines that `team-init` derives

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one file, one golden test
**Surface:** `plugin/scripts/anthill/migrate.ts` (`planV1ToV2`) · test `migrate.test.ts`

`migrate` writes `.anthill/comms` and `.anthill/current-team` as literals while `team-init` derives
the comms line from each team's `teamDir`. **Divergent on a `keepPaths` migration**, where the docs
stay put and the derived line would differ from the literal.

Pre-existing for `comms`; the pin and `.bounty-session` ops inherit the pairing. Both of those are
genuinely `CONFIG_DIR`-fixed and correct as literals — **which is exactly what makes the trio
confusing to read**: three literals, two right for a reason and one wrong. Derive the one that should
be derived, and say in a comment why the other two are not.

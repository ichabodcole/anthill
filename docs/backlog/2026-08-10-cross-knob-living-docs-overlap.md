# Two teams can share a living-docs directory through DIFFERENT knobs

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one function, one test
**Surface:** `plugin/scripts/anthill/config.ts` (`validateAcrossTeams`, `LIVING_DOC_PATHS`) · test `config.test.ts`

**Reproduced 2026-08-10.** The check compares same-knob pairs only (`a.seatDir` vs `b.seatDir`), never
across knobs:

```jsonc
"dev":  { "paths": { "teamDir": ".anthill" } },       // seatDir → .anthill/dev
"lean": { "paths": { "teamDir": ".anthill/dev" } }    // teamDir → .anthill/dev
```

Accepted. `init` then writes `.anthill/dev/README.md` for `dev` and reports it **`skipped`** for
`lean`, which silently inherits the other team's roster README. `ok: true`, one file, two owners —
the failure task 1.3 exists to prevent, arriving through a gap in the check rather than past it.

**Low reachability:** needs a hand-authored `paths` override; no documented route produces it. Shipped
prose (`bootstrap` §0a: _"no two teams may resolve to the same `teamDir`, `seatDir` or `seams`"_) is,
read literally, still true — **which is why this is worth fixing rather than documenting.**

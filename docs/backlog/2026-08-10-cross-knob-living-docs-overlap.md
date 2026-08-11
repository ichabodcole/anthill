# Two teams can share a living-docs directory through DIFFERENT knobs

**Added:** 2026-08-10 · **Status:** Fixed 2026-08-10 (`fix/config-resolver-hygiene`) · **Shape:** one function, one test
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

---

## Resolution — 2026-08-10

`validateAcrossTeams` now compares **every knob against every knob** (the full 3×3 between each pair)
rather than each knob against its own name. The framing that made the old check look complete was
treating the knobs as three separate namespaces; what actually makes a directory contested is that
two teams **write there**, and the file underneath cannot see which knob each team arrived through.

The error message names **both** knobs, so the report reads `` `paths.teamDir` resolves to X, the
same location as team "dev"'s `paths.seatDir` `` rather than leaving the reader to work out how two
different-looking settings met.

Three tests added: the reported repro, the reverse ordering (the pair loop visits each unordered
pair once, so both directions need pinning), and a `seams`-against-`seatDir` case — `seams` is a
file and the others are directories, which is exactly the surface reasoning that made a same-knob
check feel sufficient.

**The intended nesting is still accepted.** Teams nest by design — the incumbent at `.anthill`, the
rest under `.anthill/teams/<name>` — so this stays **equality**, never prefix-free. The existing
"intended nesting is not rejected" test was already in place and stayed green.

**Mutation-verified:** restoring the same-knob comparison turns the suite red on the two new
cross-knob tests. Shipped prose in `bootstrap` §0a and design §5a both sharpened to say
any-knob-against-any-knob, since the old wording was true only under a reading that no longer
matches the check.

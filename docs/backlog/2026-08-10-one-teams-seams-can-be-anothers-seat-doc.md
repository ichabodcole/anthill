# One team's `seams` file can be another team's SEAT DOC — the collision check sees only configured knobs

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one list, one test
**Surface:** `plugin/scripts/anthill/config.ts` (`LIVING_DOC_PATHS`, `validateAcrossTeams`)

`validateAcrossTeams` now compares every configured knob against every other (fixed 2026-08-10, see
[`cross-knob-living-docs-overlap`](_archive/2026-08-10-cross-knob-living-docs-overlap.md)). But
`LIVING_DOC_PATHS` enumerates the three **configured** knobs, and the per-seat living doc is a
**derived** path — `seatDocPath(handle) = <seatDir>/<handle>.md` (`config.ts:328`). Nothing compares
it across teams.

**Reproduced 2026-08-10:**

```jsonc
"dev":  { "paths": { "teamDir": ".anthill/dev-t",  "seams": ".anthill/shared/a.md" } },
"lean": { "paths": { "teamDir": ".anthill/lean-t", "seatDir": ".anthill/shared" } }
```

with a seat handled `a` in `lean`. Accepted. `dev`'s seams register and `lean`'s seat doc for `a`
both resolve to `/repo/.anthill/shared/a.md`. The 3×3 compares `.anthill/shared` against
`.anthill/dev-t/dev` and sees nothing.

**Why this is worth fixing rather than documenting** — the same argument the cross-knob item made.
The refusal text that branch rewrote says two teams sharing a location _"would write their **seat
docs**, seams and comms log on top of each other."_ **Seat docs are named first in the promise and
are the one thing not checked.** A guarantee stated one level coarser than it holds is this repo's
recorded promise-granularity failure, and here it is inside the error message of the check itself.

**Reachability is lower than the cross-knob case**, which was already low: it needs a hand-authored
`seams` override AND a matching seat handle in the other team. No documented route produces it.

## Acceptance Criteria

- [ ] Two teams cannot resolve a seat doc onto another team's seams, seat doc, or team dir
- [ ] The comparison is derived from the roster, since seat docs depend on `seats[]` and not on
      `paths` alone — a seat ADDED later can create the collision, so consider where the check
      belongs
- [ ] Mutation-verified: the repro above throws, and the intended nesting still resolves

## References

- `plugin/scripts/anthill/config.ts:328` (`seatDocPath`), `:343-352` (`LIVING_DOC_PATHS`), `:391-402`
- Found by the review round on `fix/config-resolver-hygiene`, 2026-08-10; re-verified before filing

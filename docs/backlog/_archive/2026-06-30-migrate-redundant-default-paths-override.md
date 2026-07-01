# `anthill migrate`: a redundant `paths` override that equals the v1 default half-consolidates

**Added:** 2026-06-30 · **Status:** Done (`fc813fa`)

`migrate` treats ANY `paths` presence in the config as a deliberate escape hatch, so it leaves the
living docs where the override points and moves only config + scratch into `.anthill/`. On
media-buffet the override wasn't deliberate — it just spelled out the **v1 DEFAULT** (`docs/team`,
`docs/team/dev`, `docs/team/dev/seams.md`). Result: a HALF-consolidated split — `.anthill/config.json`
was created, but the living docs stayed at `docs/team/`, which is the exact thing v2 set out to kill.
Only a human paying attention caught it; the lead then hand-rolled the rest: a `git mv` of the
`docs/team/` contents into `.anthill/`, dropping the redundant `paths` block, and fixing two live
`docs/team/dev/seams.md` references. This was the single highest-leverage finding of the run.

**The fix (both halves are one feature):**

- **Detect `paths == the v1 default layout` and treat it as NON-deliberate.** The v1 default was
  `{ teamDir: "docs/team", seatDir: "docs/team/dev", seams: "docs/team/dev/seams.md" }`. If the override
  equals that, don't silently honor it — **offer to consolidate**: move the docs into `.anthill/` AND
  drop the redundant `paths` block so it falls to the v2 default. Only a genuinely bespoke location
  (docs the team deliberately put elsewhere) should be left in place.
- **A consolidation affordance.** The guide says "re-point `paths` later if you want the docs under
  `.anthill/`" but nothing does it. A `migrate --consolidate-paths` (or the prompt above) is the
  missing command — today it's uncabled manual `git mv` work the lead has to know to do.

## Acceptance Criteria

- [x] `migrate` recognizes a `paths` override equal to the v1 default and consolidates by default (moves
      docs + drops the override) rather than silently half-consolidating
- [x] a genuinely custom `paths` location is still left in place (the real escape hatch is preserved)
- [x] there is a CLI path to finish the consolidation — no hand-rolled `git mv` (auto for a redundant
      override; `--keep-paths` opts out)

**Resolution (`fc813fa`):** `planV1ToV2` now branches on `isRedundantDefaultPaths` — a `paths` override
equal to the v1 default consolidates the docs anyway and drops the redundant block (new
`config-drop-paths` op) with a loud plan note; a bespoke location is honored; `--keep-paths` forces
honoring a redundant one. Bootstrap also warns against authoring a redundant override in the first
place. Covered by planner + subprocess tests.

## References

- Field report: grapevine `anthill-feedback` msg 8 (arthur / media-buffet) + msg 9 (synthesis) —
  findings #1 (the trap) and #2 (the missing affordance)
- Code: `scripts/anthill/migrate.ts` (`planV1ToV2`, the `pathsExplicit` branch);
  `scripts/anthill/commands/team-migrate.ts` (`scanRepo` sets `pathsExplicit`) — the fix knows the v1
  default, which already lives as `V1_DEFAULT_TEAM_DIR`
- Project: [anthill-footprint-migration](../projects/anthill-footprint-migration/plan.md)

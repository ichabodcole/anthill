# Two session-pacing patterns worth naming in the docs

**Added:** 2026-07-27 · **Status:** ready to build · **Seat:** weaver (skills text)

Two field-proven pacing patterns, both currently tribal knowledge. Grouped because they both belong
in the same place: the convene/finalize docs' pacing section.

## 1. Compact-instead-of-respawn as a documented seat resume path ([#37](https://github.com/ichabodcole/anthill/issues/37))

At a quality pause on a long lane, the **human** fires `/compact` at a seat's pane. This keeps the
seat's in-context working rhythm while restoring headroom — as opposed to park-and-respawn, which
restores headroom by discarding the rhythm. Worked twice in one session on a build seat.

**Two constraints that make this a docs item rather than a feature:**

- **Seats cannot self-trigger it** — `/compact` is a user-level command, and a lead's `send-keys`
  into a peer pane is classifier-blocked. It is inherently a _human_ move, which is exactly why it
  needs documenting: no agent will discover it.
- **The value is seat-shape-dependent** — valuable for build seats carrying long in-context state;
  roughly neutral for verify seats whose state is externalized by design.

**Fix:** name it in the pacing guidance alongside park-and-respawn, with the shape-dependence stated.

## 2. Flag-before-LAND (not before-work) for ratifications ([#41](https://github.com/ichabodcole/anthill/issues/41))

For dependency additions and shared-file changes, the seat **builds while the lead ratifies**, and
flags at the moment of landing rather than before starting. Zero dead time. Ran three times in one
session without a miss.

This is a positive pattern the reporting team asked be named — it inverts the intuitive
"ask permission first," and the inversion is the point: ratification is cheap to obtain in parallel
and expensive to wait on serially.

**Fix:** name it in the SOP/convene guidance as the default posture for dep and shared-file
ratifications. Note the boundary — it works because a _land_ is reversible-in-practice and a
half-built lane is not; it is not a licence to skip the ratify gate on **seams**, where the whole
point is to falsify _before_ building.

## Acceptance Criteria

- [ ] Compact-as-resume is named in the pacing guidance, marked as a human-only move, with the
      build-seat vs. verify-seat distinction stated.
- [ ] Flag-before-land is named as the default for dep/shared-file ratifications, with an explicit
      note that it does **not** extend to seam ratification.

## References

- `plugin/skills/convene/SKILL.md`, `plugin/skills/finalize-session/SKILL.md`,
  `plugin/templates/docs-team/README.md` (the SOP seed).
- `plugin/skills/plan/SKILL.md` — the seam ratify gate that item 2 must not undercut.
- Issues: [#37](https://github.com/ichabodcole/anthill/issues/37) ·
  [#41](https://github.com/ichabodcole/anthill/issues/41)

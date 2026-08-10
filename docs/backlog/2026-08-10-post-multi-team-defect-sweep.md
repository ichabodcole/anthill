# Post-multi-team defect sweep — INDEX, not a work item

**Added:** 2026-08-10 · **Status:** Split into seven items, 2026-08-10 · **Shape:** register only
**Source:** MVP item 8 of the archived
[multi-team-support](../projects/_archive/multi-team-support/proposal.md) proposal + that branch's
independent review.

**This file was filed as one "sweep" and that was a mis-grouping by this repo's own rule.** The
grouping rule is stated in
[`anthill-commit-correctness-batch`](_archive/2026-07-27-anthill-commit-correctness-batch.md):

> grouped because they are **the same file, the same seat, and the same test surface**; they are
> **not** one change.

These items share none of that — bootstrap's archetype selection, four emitted strings, a config
validator, a repo-wide JSON idiom, and two small hygiene items. **They were grouped only by when they
were noticed**, which makes a holding pen rather than a work unit: nobody can start "the sweep", only
one of its parts.

**Kept as an index rather than deleted** because the archived proposal links here, and because the
provenance is worth one file.

## The items

| item                                                                                                     | shape                        | wrong today? |
| -------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| [bootstrap fails open on a non-software repo](./2026-08-10-bootstrap-fails-open-on-non-software-repo.md) | ⚠ carries a design decision  | **yes**      |
| [bare `anthill` in emitted strings](./2026-08-10-bare-anthill-in-emitted-strings.md)                     | one mechanical edit, 4 sites | **yes**      |
| [cross-knob living-docs overlap](./2026-08-10-cross-knob-living-docs-overlap.md)                         | one function, one test       | no           |
| [declared-total fields drop from JSON](./2026-08-10-declared-total-fields-drop-from-json.md)             | repo-wide idiom + a guard    | no           |
| [`config.ts` resolver hygiene](./2026-08-10-config-resolver-hygiene.md)                                  | two small fixes, one file    | no           |
| [`migrate` gitignore lines not derived](./2026-08-10-migrate-gitignore-lines-not-derived.md)             | one file, one golden         | no           |
| [DECIDE: `team ls` on a stale pin](./2026-08-10-team-ls-refuses-on-a-stale-pin.md)                       | a decision, not a defect     | no           |

**Order:** the two "wrong today" items first. The bootstrap one leads — it is the only one that
produces a wrong artifact **a human then ratifies**, which is the thing that makes it worse than the
others rather than merely first.

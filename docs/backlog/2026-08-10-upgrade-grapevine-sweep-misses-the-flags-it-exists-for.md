# `upgrade` §4·0's sweep greps the old tool's NAME, so docs naming its removed FLAGS survive

**Added:** 2026-08-10 · **Status:** Open · **Shape:** widen one grep, widen its paths
**Surface:** `plugin/skills/upgrade/SKILL.md` §4·0

**Found by a blind cold read, 2026-08-10**, under "what would still be wrong after I follow this
plan" — i.e. the reader followed the instruction correctly and predicted the miss itself.

The sweep is:

```sh
grep -rni 'grapevine\|\bvine\b' .anthill/ docs/ --exclude-dir=_archive
```

## 1. It matches the tool's name, not the surface that changed

A team doc reading _"the lead runs `convene --fresh`"_, or naming `tailCommand` or `--topic`, contains
**no match** and survives untouched — pointing seats at flags that are **gone**. The reader:

> _"This is the same class of failure 4·0 exists for, and the given command does not catch it. I'd
> know only by additionally grepping `--fresh|--topic|tailCommand`, which the skill never says to do."_

The general form: **a migration sweep keyed on the departed tool's name misses every doc that
absorbed its vocabulary without naming it** — and absorbed vocabulary is what a living doc
accumulates.

## 2. The paths contradict §4a's own warning

`.anthill/ docs/` assumes cwd is the repo root and assumes the team docs live under `.anthill/` —
which §4a itself warns is false whenever `paths.teamDir` is overridden or a project has several
teams. It also **excludes the repo root**, so a live instruction in root `AGENTS.md` / `CLAUDE.md`,
or anything under `.claude/`, is never searched.

## 3. The pile-sorting is the easiest instruction in the document to quietly skip

The reader named it unprompted:

> _"The grep is one command; the judgement is per-hit and unbounded. I'd be tempted to fix the obvious
> live instructions and call the ambiguous pile empty rather than write dated addenda. The addendum
> instruction is the easiest thing in this document to quietly not do."_

## Acceptance Criteria

- [ ] The sweep covers removed FLAGS and API names, not only the tool's name — and the list is
      derived from the migration guide rather than typed here, or it rots the same way
- [ ] Paths come from `team ls` resolved dirs plus the repo root, matching §4a
- [ ] The ambiguous pile has a cheaper discharge than a hand-written dated addendum, or the skill
      says plainly that an empty ambiguous pile is a claim requiring evidence

## References

- `plugin/skills/upgrade/SKILL.md` §4·0
- `plugin/skills/upgrade/migrations/` — where the removed-surface list should come from

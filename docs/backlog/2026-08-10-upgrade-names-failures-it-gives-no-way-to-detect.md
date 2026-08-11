# `upgrade` names three failure modes and hands the reader no way to detect any of them

**Added:** 2026-08-10 · **Status:** Open · **Shape:** three sections, each needs a detection rule
**Surface:** `plugin/skills/upgrade/SKILL.md` §0, the coordination-wire warning, §4d

**Found by a blind cold read, 2026-08-10.** A fresh agent was told only _"your project uses anthill;
the human said upgrade anthill"_ and asked to write the plan it would actually execute. Its closing
observation is the item:

> _"The document is unusually good at naming its own failure modes — silent inversion, 'recorded as
> done', 'the doc reads correct and the channel reads quiet'. But in three places it names the failure
> and then hands me no mechanism to detect it. Those are exactly the places where I would produce a
> clean report and be wrong."_

## 1. §0's fallback has no detection rule

> **Cannot resolve the cache layout?** Then **say so and fall back to reporting the loaded version**

The reader understood the intent and had no way to decide it was in that state: **every command in
the block succeeds on a wrong layout.** `ls` on a wrong-but-existing directory prints a confident
wrong answer, and `basename` of a source checkout is not a version. It had to invent the rule
_"`$LOADED` doesn't look like a semver"_ and flagged that it was guessing. `sort -V` over a parent
holding sibling plugins compares unrelated projects.

**The skill's own thesis is that this check's failure mode is silent inversion** — and its detection
story is the part left to the reader.

## 2. The coordination-wire warning has no mechanism

> **⚠ A release can add a new COORDINATION WIRE, and no amount of doc reconciling puts you on it.**
> … **Tell the human that explicitly.**

The skill calls this _"the one that looks handled when it isn't"_ — and the only instruction is to
tell the human, with no command, no artifact to inspect, no "compare the join manifest to X". The
reader: _"I would either report a wire I noticed incidentally in a 4a diff hunk, or say nothing and
believe I'd complied. I could not tell whether this paragraph was work for me or context."_

## 3. §4d is plural in its heading and singular in its body

> #### 4d. Backfill config FIELDS a later release added

One field (`gate`) is described. No config schema or field inventory is referenced, so for any other
field the reader has no way to know it exists. The section **names itself** as _"where a silent gap
survives an upgrade that reports success"_ and then leaves the reader unable to close it in general.
Design §5 is the field inventory and this never points at it.

## The pattern worth fixing once

All three share a shape: **a warning is written as prose because the mechanism does not exist yet,
and prose is indistinguishable from work that has been done.** A reader who reads it carefully and a
reader who skims it produce the same report.

## Acceptance Criteria

- [ ] §0 states the rule for "cannot resolve", or the check is restructured so a wrong layout fails
      loudly instead of answering confidently
- [ ] The wire warning names an artifact to compare, or is demoted to context and says so
- [ ] §4d points at design §5 as the field inventory, or names the fields
- [ ] Re-cold-read blind, asking for the executable plan, and check these three produce actions

## References

- `plugin/skills/upgrade/SKILL.md` §0, the coordination-wire blockquote, §4d
- `docs/architecture/2026-06-28-anthill-portable-team-os-design.md` §5 (the field inventory)

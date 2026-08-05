# `anthill join`'s grounding manifest omits `principles.md`, which the skill calls the highest-leverage read

**Added:** 2026-08-01 · **Status:** ready to build (one entry in the manifest)
· **Seat:** forager (CLI) · **Found:** by the lead at session start, grounding from the skill and the manifest side by side

`anthill join <handle>` emits a `grounding` array — the exact files, in order. It contains:

```
AGENTS.md · README.md · .anthill/README.md · .anthill/dev/seams.md · .anthill/dev/<handle>.md
```

**`.anthill/principles.md` is not in it.**

## Why that is a contradiction and not a preference

`skills/join/SKILL.md` says two things that cannot both hold:

1. Ground in _"`.anthill/principles.md` — **what this team learned the hard way**, each with its
   scar. Short, and the **highest-leverage read** here"_ — it is in the skill's ordered list and in
   the join checklist.
2. _"Running **`anthill join <handle>`** prints this grounding manifest (the exact files, in order)
   … **use it as your source of truth**; don't restate it."_

So the skill tells a seat the manifest is authoritative, and the manifest omits the file the skill
calls the most valuable. **A seat that follows the instruction never reads the principles.**

## Why it matters more than one missing path

`principles.md` exists **because the SOP is rendered once at bootstrap and never updated** — a
principle written into the SOP could never travel to an existing team. The standalone file is the
mechanism by which hard-won claims reach anyone at all, and **its only named re-read moments are
convene and join.** Dropping it from join halves that.

`bootstrap` and `upgrade` both point at it. The manifest is the one surface that does not.

## The fix

Add it to the `grounding` array, between the SOP and `seams.md` — matching the skill's stated order.
Then re-read the skill's list against the emitted list, because **this is the class where prose and
emitted output drift and only the emitted one is followed.**

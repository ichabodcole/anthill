# Field-notes conventions instruct against tools the reader has no way to identify

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one section, rewritten for a reader outside this repo
**Surface:** `plugin/scripts/anthill/field-notes.md` (the conventions list) · ships to every team

**Found by a blind cold read, 2026-08-10.** A fresh agent given the audience's context — "your
project uses anthill, your lead sent you here" — and nothing about this repo ranked the conventions
block **last of 23 entries for clarity**, and could not act on it.

## The one it could not execute at all

```
- **`## you → who:` in the headline** — channels rarely route, so this is a **salience hint, not a filter**.
```

The reader could not tell what to literally type. Is `you` the literal string or a placeholder for
its own handle? Is `who` the recipient? _"The arrow's direction implies sender→recipient, which makes
the literal word `you` read as the sender — but the entry is named as an addressing convention, which
suggests the recipient matters. Two plausible readings, opposite meanings, and the entry never shows
a filled-in example."_ Every other convention in that list is quoted in use; this one is not.

## Three more that name a property of a tool the doc never names

- **Read-watermarks** — _"stamping `as of #N`, the highest message id you had read"_. The reader has
  no way to check whether its channel exposes stable numeric message ids. If it does not, there is no
  `#N` to stamp and it would be inventing one.
- **Baseline on arrival, baseline at close** — _"run **the** build-and-test gate"_. The definite
  article assumes the reader already knows which command that is. Ours is `bun run check`; a
  consuming project's is whatever it configured as `gate`, and the doc never says to look there.
- **Dispatch an outside reviewer to FIND, never to DESIGN** — the reader understood the principle
  completely and could not act on it: _"'Dispatch' how? Is there a command, a seat, a subagent type?
  'Blank-context reviewer' is described by its property, never by how one comes into existence."_
  Same for "standing to refuse" — the reader could not tell whether that is a social norm the doc
  asserts or a mechanism that exists somewhere.

**This is not the in-house-vocabulary problem.** Naming a tool the reader has is legitimate — that
was settled when `finalize-session` step 2.6 was written. The failure here is the opposite: the
entries describe a capability by its PROPERTIES while never naming the thing that provides it, so a
reader who _does_ have the tool still cannot connect the two.

## Acceptance Criteria

- [ ] `## you → who:` carries a filled-in example, or says plainly which parts are placeholders
- [ ] Each convention that depends on a tool capability either names the capability's source or says
      "if your wire has one"
- [ ] The reviewer-dispatch entry names how a blank-context reader is obtained, in terms that survive
      leaving this project (a fresh agent, not a fork — never inheriting the author's framing)
- [ ] Re-cold-read after the edit, blind, and check the conventions block leaves the bottom of the
      clarity ranking

## References

- `plugin/scripts/anthill/field-notes.md:197` and the surrounding conventions list
- `plugin/skills/finalize-session/SKILL.md` step 2.6 — the cold-read procedure that found this

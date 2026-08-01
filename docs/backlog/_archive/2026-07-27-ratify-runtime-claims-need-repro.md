# `anthill:plan` ratify: a runtime-behavior claim needs a measured repro, not pattern memory

**Added:** 2026-07-27 · **Status:** ✅ **SHIPPED (complete)** — skill 2026-07-27, `methodology.md`
mirror 2026-07-28 · **Seat:** weaver

> The API-shape vs. runtime-behavior distinction landed in the plan skill's ratify step, with the
> proportionality caveat intact. **Still open:** mirroring it into `methodology.md`, the portable
> half.

A seam clause was **ratified from pattern memory** — a claim about Bun `ReadableStream`
enqueue-throw behavior on dead sockets — and **died on first contact mid-build**
([#46](https://github.com/ichabodcole/anthill/issues/46)).

The ratify gate's whole value is catching false premises _before_ they're built on. It delivered
exactly that in anthill's own first dogfood (two load-bearing seam errors caught at zero rework
cost). But ratification currently makes no distinction between two very different kinds of claim:

- **API shape** — "this function takes X and returns Y." Checkable by reading; pattern memory is
  usually reliable.
- **Runtime behavior** — "under condition C, this throws / blocks / retries." Pattern memory is
  _plausible-sounding and frequently wrong_, and the failure surfaces mid-build, which is exactly
  when the gate was supposed to have saved you.

**Fix:** plan-skill ratify guidance asks for a **~20-line repro** on any claim about _runtime
behavior_, while leaving API-shape claims ratifiable by inspection. Keep the bar proportionate — a
blanket "repro everything" would make the gate expensive enough that seats route around it, which
costs more than the occasional bad clause.

**Note the tension with the ratify gate's other virtue:** teams report that "falsifying a seam now
is a win, not friction" is _the_ reason seats push back instead of building around a bad premise
(#56). Any added cost must not erode that. Framing matters — "measure it, then ratify" is a cheaper
ask than "prove it."

## Acceptance Criteria

- [ ] The plan skill distinguishes API-shape claims from runtime-behavior claims at the ratify step.
- [ ] Runtime-behavior claims ask for a small measured repro before ratification.
- [ ] The guidance stays proportionate — no blanket repro requirement.
- [ ] `methodology.md` reflects the same distinction (it is the portable half).

## References

- `plugin/skills/plan/SKILL.md` — the ratify gate.
- `plugin/skills/plan/methodology.md` — the universal methodology shipped alongside it.
- `.anthill/dev/seams.md` — this repo's own contracts, ratified under the current bar.
- Issue: [#46](https://github.com/ichabodcole/anthill/issues/46)

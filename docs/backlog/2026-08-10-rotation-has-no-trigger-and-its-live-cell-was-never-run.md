# Rotation has no caller, so seams 6(e)'s decisive cell is not merely un-run — it is un-runnable

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one trigger, then one measurement
**Surface:** `plugin/scripts/anthill/comms.ts:305` (`rotateSession`), `.anthill/dev/seams.md` 6(e)

**Carried out of [`comms-as-default`](../projects/_archive/comms-as-default/plan.md) at its close-out,
2026-08-10.** Every one of that project's eight exit criteria is met and the grapevine leg
is gone from the presence path (`4d091dc`). This is the one substantive commitment it made that has
no evidence at any rung, so it travels rather than closing with the folder.

## 1. The finding that was not in the plan: there is no way to rotate

`plan.md` recorded rotation as _"landed **INERT**"_ — the live channel was never rotated. **Measured
at close-out, that understates it.** `rotateSession` is exported at `comms.ts:305` and its only
callers in the entire tree are its own tests:

```
grep -rn 'rotateSession' plugin/
  comms.ts:305                 the definition
  comms.rotation.test.ts       ×7, all in test bodies
```

**No CLI verb, no command, no lifecycle hook invokes it.** So "nobody rotated the channel" is not a
scheduling accident — a seat that wanted to rotate had no way to ask. The trigger that `1b905c4`
landed is a **documentation obligation** (_whoever runs the first rotation owes 6(g)'s amendment in
the same change_), not a code path.

**Why this matters more than the un-run cell itself:** the project shipped a feature, wrote its
safety analysis, landed ten tests, and recorded a live verification as owed — and the reason it stayed
owed is that **the feature cannot be invoked.** Nothing in the gate says so, because a library
function with no caller and full test coverage is green by every measure we run.

## 2. The measurement that is still owed

`plan.md`'s prediction **H**, published before the code existed:

> rotation re-mints the session-open record and leaves position records untouched → immediately after
> rotation, `comms positions` reports **every seat `current` / gap 0 against a log they have emitted
> none of** — the most reassuring state, on the wire whose entire purpose is to stop silence being
> mistaken for safety.

**Falsifier arm 1 was satisfied by the design** — forager used a per-session positions directory, so
rotation re-scopes position records by construction, and the prediction was answered by the code
before any test ran. That half is genuinely discharged.

**The live half is not, and a fixture cannot reach it.** From `plan.md:583`:

> a fixture cannot answer the live half: whether five `follow` processes that resolved the log path
> once at attach survive a real rotation, or die silently while their positions still read healthy.

**The decisive cell needs no new instrument: rotate, then run `comms positions` WITHOUT restarting
any follower.** It requires a convened session with live followers attached, which is why it could
not be discharged from a single seat.

## 3. The hazard has a rule and no mechanism

`comms.ts:221` states the operating constraint in its own voice:

> **THE MECHANISM IS THEREFORE SAFE TO LAND AND NOT SAFE TO FIRE ON A CHANNEL WITH LIVE FOLLOWERS.**
> Rotate at a session boundary, when nobody is attached.

**Nothing enforces that.** It is prose at the definition site, and once a trigger exists, the first
thing that trigger can do is violate it. This is the same shape as the three `upgrade` findings filed
today — _a warning written as prose because the mechanism does not exist yet, and prose is
indistinguishable from work that has been done._ Here the prose predates the caller, so the fix is
cheap **only if it lands with the trigger**; afterwards it is a retrofit onto a live verb.

Note the standing evidence that this class is real: **two seats derived the 6(e)/rotation collision
independently and from opposite ends** — steward from the contract, forager from the call site
(`team-comms.ts:706`), neither having seen the other's.

## 4. Contract state, verified at HEAD rather than quoted

- **6(e) is still `Not fixed`**, and says so with a standing refusal to paper over it: _"the plausible
  repair is that `follow` invalidates its own position when the log identity changes under it … which
  is a change to what `follow` RECORDS and therefore a revision of (a)."_
- **6(c-bis) is explicitly NOT a fix for (e)** — it catches only a record **ahead** of the head, the
  one false `0` with a free tell. Every false `0` at or **behind** the head remains undetectable.
- **6(g)'s lead-veto clause is still true at HEAD**, because no rotation has executed. `.anthill/comms/`
  holds the legacy layout (`anthill-dev.ndjson`, `.positions`, `.departures`, `.session.json`) with
  **no `.current` pointer** — measured 2026-08-10. The amendment `1b905c4` obliges is not yet due.

## Acceptance Criteria

- [ ] `rotateSession` has a caller — a verb, a lifecycle hook, or a deliberate written ruling that it
      stays library-only and why
- [ ] Whatever fires it refuses, or loudly warns, when the channel has live followers — landed **with**
      the trigger, not after
- [ ] The decisive cell is run on a real session: rotate, then `comms positions` with no follower
      restarted, and the reading is recorded whichever way it falls
- [ ] 6(g)'s amendment rides with the first executed rotation, per `1b905c4`
- [ ] 6(e) is either repaired or re-stated with the live reading attached

## References

- `plugin/scripts/anthill/comms.ts:215-235` (the hazard, stated at the definition) and `:305`
- `plugin/scripts/anthill/comms.rotation.test.ts` — 10 tests, the safe design set; **do not re-derive it**
- `.anthill/dev/seams.md` Contract 6, clauses (a), (c-bis), (e), (g)
- `docs/projects/_archive/comms-as-default/plan.md` § _What a fresh agent must NOT re-derive_, item 1b
- `81d3991` (rotation landed) · `1b905c4` (the amendment trigger)

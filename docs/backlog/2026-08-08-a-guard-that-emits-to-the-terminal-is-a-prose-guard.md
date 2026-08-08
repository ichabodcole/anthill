# `principles.md` CANDIDATE — a mechanical guard whose output lives only in the terminal is a prose guard with extra steps

**Added:** 2026-08-08 · **Status:** **candidate, NOT ratified.** Ratification is a team beat and no
seat was held when this was written — it needs a convene, or Cole
**Source:** the cross-team wire with the Spellbook team (`grapevine anthill-spellbook-r2`, msgs
`#4`–`#7`). **The observation that these are one thing and not four is `spellwright`'s.**

---

## The gap it fills

[`.anthill/principles.md:320-325`](../../.anthill/principles.md) already carries the first half:

> **A dispositional instruction holds; a situational warning fails at the recognition step.** …
> **Situational warnings need a mechanical guard, not better wording.**
> _Scar: prose guards went 0-for-4 in one session._

**That says build a guard. It does not say where the guard's output has to land** — and four
independent findings in one day all turned on exactly that.

## The four, which are the same finding

| #   | the guard                                                                                                   | why the terminal-only form failed                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`snapshotBackedUp`** (spellbook)                                                                          | Shipped as an event **and** on `GET /state`, deliberately: _"an event is **absent** when nothing happened, so 'no rotation' and 'a daemon that never emits this' are byte-identical to a consumer."_ **The guard was real; the terminal-only form was not observable.** |
| 2   | **The version-skew warning** (proposed, both sides)                                                         | A stderr warning is gone by the time a triager reads the issue. **In the footer it survives into the artifact** — `anthill: 2.0.0 (latest: 2.1.0 — this report may predate a fix)` would have pre-empted **three** version-boundary errors across both teams this week  |
| 3   | **The lead's `comms stand-down`** ([#96](https://github.com/ichabodcole/anthill/issues/96))                 | `join` **emits** the departure verb into a manifest the seat keeps; `convene` states it in a skill. Our own count: _"join's emitted manifest has worked in every session while prose guards went **0-for-4**."_                                                         |
| 4   | **`uncheckedAgainst` vs the red-side diagnostic** ([#97](https://github.com/ichabodcole/anthill/issues/97)) | Same information, same helper, opposite sign — but the green side is a **total typed field** and the red side is **prose interpolated into an error string** (`team-commit.ts:474-487`, because `emitError` has no `data` slot). **Only one of them survives a pipe.**  |

### The fifth instance arrived in the substrate we were discussing it over

`spellwright`, warning us that Cole was about to roll the grapevine daemon out from under our tail:

> **_"A dropped tail and a quiet channel look identical from your side."_**

**This is the cleanest instance in the set, because nothing is broken.** The channel behaves
correctly, the daemon behaves correctly, and the consumer still cannot distinguish _"nobody is
talking"_ from _"I am no longer connected."_ There is no documentation gap and no missing feature —
**the absence is simply ambiguous, and the surface that would disambiguate it is `tail`'s
`: grapevine-keepalive` tick, which rides stderr.** Terminal-only, by design, for a signal whose
absence is not transient at all.

**And the resolution was an out-of-band human-mediated message.** They sent prose because the
substrate has no frame for it — which is [`#99`'s session anchor](https://github.com/ichabodcole/anthill/issues/99)
one layer down: _a correct prohibition with no supported affirmative._

## Why it is a principle and not a habit

Because **(4) is the Spellbook team's own `#82` argument arriving from a different direction**, and
that argument was settled between these two teams three days earlier:

> **The envelope is the only signal that survives the way agents actually invoke a CLI. The exit code
> is not.**
> _(anthill's framing, adopted as the central claim of spellbook's investigation —
> `grapevine anthill-spellbook` msg `#24`)_

**A guard that emits to a terminal has chosen the channel that does not survive.** It is the same
claim, one level up: not _which field_ carries the signal, but _which surface_.

## The candidate wording

> **A mechanical guard whose output lives only in the terminal is a prose guard with extra steps.**
>
> Building the guard is half the work; the other half is choosing a surface that outlives the process
> that ran it. A warning on stderr, an event with no read-back, and a fact interpolated into an error
> string all fail the same way — **they are gone by the time anyone is in a position to act on them.**
> Prefer, in order: a **field on the envelope**, a **footer on the artifact**, an **emitted manifest
> the reader keeps**. And prefer **present-and-null over absent**, so _"nothing happened"_ stays
> distinguishable from _"this build does not report it."_
>
> **Boundary — terminal-only is legitimate exactly when the signal is self-evidently transient**, i.e.
> when its absence means _"nothing is happening"_ and a reader who missed it has lost nothing. **The
> test is not importance, it is whether ABSENCE IS AMBIGUOUS.** If a consumer cannot distinguish
> _"this did not happen"_ from _"this build does not report it,"_ the terminal is the wrong channel no
> matter how loud the line is. A progress line or a spinner is correctly terminal-only.
>
> **Repeal criterion:** if a guard is found whose absence is genuinely ambiguous **and** whose
> terminal-only emission still reached every consumer that needed it, this rule is too strong.

### ⚠ The boundary is not decoration — the first draft overreached, and `spellwright` attacked it

The version above without its boundary would have condemned progress lines and spinners, and **a rule
applied where it does not fit gets obeyed selectively and then not at all.** Their house style
requires an imperative **plus a boundary check plus a repeal criterion** for exactly that reason, and
we should steal the discipline along with the content.

**The reframe is the real gain.** It moves the rule from _where the output goes_ to **what a reader
can conclude from not seeing it** — which is why present-and-null keeps falling out of it as the
remedy rather than being a separate idea. `snapshotBackedUp`, the skew footer and `uncheckedAgainst`'s
missing red twin are **all ambiguous-absence.** A spinner is not.

## Two notes for whoever ratifies it

1. **It does not replace `:320-325`, it extends it.** The existing entry is about _whether_ a guard is
   mechanical. This is about _where its output goes_. Both are needed and neither implies the other —
   a mechanical guard shouting into a dead terminal passes the first test and fails in practice.
2. **The present-and-null clause was handed back and forth twice in one exchange**, which is part of
   the evidence: `spellwright` applied it to our proposed skew footer, and our footer argument was
   their `/state` argument from an hour earlier. **Two teams independently deriving the same rule in
   two costumes inside one conversation is the strongest signal available that it is not local.**

## References

- `.anthill/principles.md:320-325` (the half that ships) · `:298-304`
- `grapevine anthill-spellbook-r2` msgs `#4`–`#7`; earlier `anthill-spellbook` msg `#24`
- [`reports/2026-08-08-feedback-triage-96-102.md`](../reports/2026-08-08-feedback-triage-96-102.md)
  §§ #96, #97, #101
- [`2026-08-08-triage-build-batch.md`](2026-08-08-triage-build-batch.md) — the skew footer and the
  `convene`-emits-stand-down items are both instances

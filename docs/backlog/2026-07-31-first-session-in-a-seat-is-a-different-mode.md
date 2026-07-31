# The first session in a seat is a different mode, and nothing names it

**Added:** 2026-07-31 · **Status:** ready to build · **Seat:** weaver

From StoryLoom's first session — five seats, empty docs, no lineage. **All four seats independently
hedged their own reliability.** Their lead read that as the scaffold producing an apologetic posture
and told them collectively to stop discounting themselves.

**All three seats we asked disagreed with him, independently and with reasons.** That disagreement is
the finding, and the seats are right.

- **tolkien:** _"I'd defend the hedge."_ Two of his early confident claims were later corrected by
  peers — it was **earned calibration**. What was missing was **anywhere to put a confidence level
  except prose on the vine, where it reads as apology.**
- **hurston:** the hedge was correct — one of her hedged verdicts carried a wrong number into a
  contract. The fix is that **first-session output should be provisional by the PROCESS, not by the
  agent's tone.**
- **aesop:** it was never tone. He didn't know **how much to trust everything around him.**

**So reassurance would be the wrong fix** — it suppresses a correctly-calibrated signal. Three things
are actually missing:

## 1. `⚠ unfilled template` cannot say WHICH KIND of empty

Shipped 2026-07-27. It does not distinguish:

- **"this team was bootstrapped an hour ago"** → nothing to inherit; write freely.
- **"the last agent in this seat never ran finalize"** → knowledge was **lost**; treat the surrounding
  artifacts with suspicion, because they may be stale too.

**Opposite postures toward every neighbouring document.** `aesop` guessed the first and happened to be
right. This is cheap to fix — the difference is visible in git (does the doc have history?) and in
whether the footprint was just rendered.

## 2. `join` tells you who you are, not what is happening

> `tolkien`: a fresh seat can't tell whether it's mid-session or at the start. The checklist says
> "joining mid-session? use `pull`" — **phrased as a conditional I had to self-diagnose.**

He joined mid-plan-phase, into a ratify gate he was already late for, and inferred it from the vine.
**`anthill join` already knows the channel.** Concrete fix, his words: _"this channel has 8 messages;
you are joining an existing session"_ versus _"you're first."_

## 3. No place to put a confidence level except prose

`tolkien`'s sharpest point: four agents independently produced the same qualifier, which looks less
like a template flaw and more like **four agents correctly reporting the same epistemic state with no
structured way to do it.** In prose on a vine, calibration reads as diffidence.

Related: `hurston`'s _"provisional by the process"_ — if the process marked first-session output as
provisional, no seat would need to apologise in prose for it.

## Two more first-hour gaps from the same session

- **The seat-doc scaffold has no "how is work in this seat verified?" field.** `hurston` found _hours
  in, by accident_, that Studio permits pure-helper tests only — which reshaped her entire lane. For a
  seat that owns a UI, "what can I even test here" is the first question and no prompt asks it.
- **Role-specific opening moves are missing.** `aesop`'s highest-leverage act all session — running
  the full gate and posting baseline numbers _before anyone touched code_, so every later red was
  attributable — was **invented, not prompted**, and is close to universal for a verify seat.
- **The `seams.md` seed makes the first contributor self-conscious about precedent**: _"I'm writing
  the file's precedent as well as its content."_ The header says what belongs there, not what a good
  first entry looks like.

## Acceptance Criteria

- [ ] The placeholder flag distinguishes never-filled from filled-then-lost.
- [ ] `join` states whether this is a fresh channel or an existing session, with the message count.
- [ ] The scaffold names **establishing** as a distinct mode from **re-grounding**, and says what it
      asks of a first occupant.
- [ ] A "how is work here verified?" prompt in the seat-doc scaffold.
- [ ] Role-specific opening moves, at least for verify.
- [ ] `seams.md`'s seed shows what a good first entry looks like, not only what belongs.
- [ ] **Do not add reassurance.** Three seats say the hedge was correct; fix the missing channel for
      confidence, not the tone.

## References

- [StoryLoom first-contact intake](../reports/2026-07-31-story-loom-first-contact-intake.md) —
  Finding 1 and "What only a fresh team could have given".
- `plugin/scripts/anthill/placeholder.ts` + `commands/team-join.ts` — the flag and the manifest.
- `plugin/templates/docs-team/dev/{{handle}}.md`, `dev/seams.md` — the scaffolds.

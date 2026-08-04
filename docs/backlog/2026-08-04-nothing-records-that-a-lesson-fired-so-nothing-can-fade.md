# Nothing records that a lesson FIRED — so nothing can fade, and the docs only grow

**Added:** 2026-08-04 · **Status:** ready to design (the measurement is done; the model is sketched; the finalize beat is the buildable part)
· **Seat:** weaver (the ritual) + forager (any tooling) · **Found:** by the human, from the stigmergy metaphor taken seriously

**anthill calls its living docs a pheromone trail. A pheromone that never evaporates is not a
pheromone — it is an archive.**

## The measurement, and it makes this concrete rather than philosophical

`artifact:` Across the entire history of every seat doc + `seams.md`:

|               |           |
| ------------- | --------- |
| lines added   | **2,770** |
| lines removed | **304**   |
| current total | **2,529** |

**And `git log --numstat` counts an edited line as one add plus one remove**, so genuine _deletion_ is
well below that 11%. Re-runnable: `git log --numstat --format="" -- .anthill/dev/<file>.md`.

### ⚠ It is not this project's habit. It is the SYSTEM's shape — measured across all 7 footprints

`artifact:` Every repo with an `.anthill/` on this machine, same method:

| repo          | added      | removed   | current    | del-rate |
| ------------- | ---------- | --------- | ---------- | -------- |
| dream-flute   | 7,312      | 50        | **7,262**  | **0.7%** |
| story-loom    | 3,187      | 493       | 2,694      | 15.5%    |
| **anthill**   | 2,838      | 309       | 2,529      | 10.9%    |
| media-buffet  | 2,187      | 138       | 2,049      | 6.3%     |
| operator-mono | 1,984      | 420       | 1,564      | 21.2%    |
| Spellbook     | 1,868      | 116       | 1,752      | 6.2%     |
| media-forge   | 904        | 143       | 761        | 15.8%    |
| **total**     | **20,280** | **1,669** | **18,611** | **8.2%** |

**Seven of seven grow monotonically.** No footprint anywhere has ever meaningfully pruned.

**Read the rates the right way round.** A _high_ rate is ambiguous — `numstat` cannot tell a deletion
from a rewrite, so operator-mono's 21% may be revision rather than pruning. **A LOW rate is
unambiguous**, and **dream-flute at 0.7% means its docs are very nearly pure APPEND** — not even
revised, let alone pruned, across their whole life.

**The read cost is already being paid, and it is worst where the docs are oldest.** Largest single
seat docs: `dream-flute/fathom.md` **1,519 lines**, `loom.md` 1,482, `prism.md` 1,365, `mosaic.md`
1,336, plus an 853-line `seams.md`. **A seat there reads ~2,400 lines of accumulated history at every
join** — before the SOP, principles, and product grounding. anthill's own largest is 531.

**So dream-flute is the future of every other footprint**, and it is the repo to measure the
firing-rate question against, not this one.

**`finalize-session` step 2 already instructs this** — _"**Prune / compact** — keep it lean; shed
stale lines"_ — and it has been executing at approximately **zero** for the project's life. **This is
a mechanism with a measured 0% firing rate**, which is the third such instruction found in two days
(see the signal-hunger capture, and the prune rule itself). _(H1 again: a prose guard, this time
about knowledge hygiene.)_

## ⚠ Do not build decay. Build the FOOTFALL.

**The obvious design is a pruning pass, and it is the wrong one** — for the reason the human named:
in nature evaporation is passive and free, but here it must be a **judgment**, made by an **ephemeral
agent present for one session**, who will systematically over-value what happened in front of it.
**That agent will prune the line that was load-bearing three sessions ago and silent in this one.**

**Invert it. Decay is the DEFAULT; reinforcement is the event worth capturing.** Nothing needs to
decide what fades — things fade because nothing recorded that they fired. That removes the judgment
from the pruner entirely and puts it where evidence exists.

### A seat already invented the convention, unprompted

forager, session 7, on keeping its predecessor's epitaph:

> **KEPT, DELIBERATELY** … _Stated because an unreplaced epitaph and an unconsidered one look
> identical, which is this seat's own anti-pattern._ **It fired today, twice, and both times before I
> built anything.**

— and it then names **what** fired and **what changed**: the epitaph's instruction turned a card into
a ruling posted ahead of the fix, where _"the cheaper direction was to change the docstring, and it
would have been catastrophic."_

**That is the reinforcement event with its evidence attached, invented by a seat with no prompting.
Generalise it rather than designing something new.** And note forager's stated reason — _an
unreplaced line and an unconsidered one look identical_ — **is this whole item one level up:** the
absence of a decay signal is indistinguishable from a deliberate decision to keep.

## The model behind the judgment: two axes

**Frequency alone would prune exactly what we most need to keep.** The
[heat-map investigation](../investigations/2026-06-30-file-activity-heatmap.md) already recorded the
guardrail for code — _"the MOST important file may be STONE COLD"_ — and it transfers exactly: **a
lesson about a rare catastrophic failure fires rarely BY DESIGN.**

So: **firing frequency × cost-of-forgetting.**

**And the move that makes it safe — judge severity ONCE, at write time, by the instance that paid the
scar.** Not repeatedly, later, by a stranger with only its own session's salience. **The author knows
what it cost; the auditor does not.** That converts an ongoing judgment into a one-time annotation
plus a mechanical count.

### Three rules that make a WRONG decay cheap

1. **Never delete — DEMOTE.** Move to a quiet section: still in the file, still greppable, restorable.
   Reversible decay is what real pheromones do, and it is what makes an incorrect fade survivable.
2. **Half-life in SESSIONS, not days.** Sessions are the unit of agent turnover; wall-clock is noise.
3. **One firing restores fully.** No gradual re-earning — a trail an ant walks again is a live trail.

## ⚠ The limit, stated rather than papered over

**A lesson that fires silently leaves no trace.** An agent that avoids a mistake because of a line it
read produces no artifact. **This is the same seam as `emittedThrough`: the tool can observe what it
emitted, never what was taken in.**

**So firing is REPORTED, not measured — testimony, permanently.** No instrument will ever infer it.
Which means it needs **a step with an owner in `finalize-session`**, or it becomes another convention
that never runs — **and this item exists because we measured that happening twice already.**

## Acceptance Criteria

- [ ] A seat can record that a durable line **fired**, naming **what it changed** — not that it was
      "useful."
- [ ] `finalize-session` **asks for it, with an owner.** Not an instruction to remember.
- [ ] A line unfired for N sessions is **demoted, not deleted**, and one firing restores it.
- [ ] **Severity is set once, at write time, by the author**, and exempts a line from frequency decay.
- [ ] **Control (sentinel's rule):** demonstrate the mechanism produces the other answer — a session
      where a line that DID fire is correctly retained, alongside one that did not and faded.
- [ ] **Before building, measure:** how many of the current 2,529 lines have fired in the last three
      sessions? **We assume the docs are bloated and have never checked.** If most lines are live,
      the problem is smaller than the growth curve suggests.

## References

- `plugin/skills/finalize-session/SKILL.md` step 2 — the prune instruction this would replace with a
  mechanism
- `.anthill/dev/forager.md` — the `KEPT, DELIBERATELY` note; the seed convention
- Related: [file-activity heat map](../investigations/2026-06-30-file-activity-heatmap.md) — owns the
  decay argument for **code**; this is its counterpart for **knowledge**, and the stone-cold guardrail
  transfers directly
- Related: [agent-signal-hunger](../investigations/2026-07-08-agent-signal-hunger.md) — the other
  instruction with a 0% firing rate, found the same day

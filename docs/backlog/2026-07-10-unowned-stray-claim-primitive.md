# A claim primitive for an unowned stray (no card, no owner → seats race to fix it)

**Added:** 2026-07-10 · **Status:** idea capture (field feedback [#31](https://github.com/ichabodcole/anthill/issues/31))

An untracked/unowned **stray** in the shared tree — a leftover artifact, a paper-cut, anything nobody
carded — has **no claim primitive**. The bounty board's `claim` is for _carded_ tasks, but the strays
that most invite collision are precisely the ones nobody carded yet. So when a stray is noticed,
multiple seats **and** the lead race to fix it in parallel. A team hit this: a local-storage artifact
dir (`data/`) got flagged by one seat, then the lead, the api seat, and the verify seat all reached for
it near-simultaneously; the lead minted a commit that a seat's already-placed better fix superseded.

**The convention the team landed on** (the candidate content, whatever shape it takes):

- **Before cutting a fix for an unowned stray, post a claim on the vine carrying a one-line PROVENANCE
  GUESS** — what it is / whose lane it smells like. The provenance hypothesis is the load-bearing part:
  it lets the true lane owner _recognize_ the stray and take first refusal, rather than the race just
  moving from the fix to the claim.
- **If the stray's CREATOR is identifiable, the creator self-claims on discovery** — even if another seat
  spotted it first.
- **When lane-owner and creator are DIFFERENT seats, the durable fix can be two reconciled layers**, not
  one winning claim. In the field case the lane owner took the config layer (`.gitignore`) and the
  creator took the source layer (a `mkdtemp` harness pin); the outcome was strong _precisely because
  nobody picked a winner_.

**Why this is bigger than a one-line SOP note (and why it's captured, not built):** the three candidate
product shapes span very different weights —

- **(a)** an SOP note in convene/join about ownerless-stray claims — _cheap, anthill-local skill edit_;
- **(b)** a bounty **claim-freeform / "loose card"** verb that doesn't require a pre-existing card —
  _spellbook/bounty upstream feature_;
- **(c)** a first-class **provenance-guess field** on a claim so owner-recognition is structural, not
  prose — _bounty schema/upstream feature_.

Only (a) is a quick win; (b)/(c) are real upstream design. This needs its own small design pass to pick
the shape before it's actionable — so it's parked as an idea, with the convention preserved above so
nothing is lost.

## Open Questions

- Is the cheap **(a)** SOP note enough in practice, or does the race recur without a structural
  **(b)/(c)** affordance? (Lean: try (a) first; it's prime-safe and costs a paragraph.)
- Does the "two reconciled layers" outcome generalize, or was it lucky? If it generalizes, the primitive
  should _not_ force a single winner — it should support layered claims.
- Relationship to the **parked "self-selection bounties"** roadmap item and the stigmergy model — is the
  stray-claim a special case of self-selection, or its own thing?

## References

- Field feedback: [#31](https://github.com/ichabodcole/anthill/issues/31) (filed via `anthill feedback`).
- Likely (a) homes: `plugin/skills/convene/SKILL.md`, `plugin/skills/join/SKILL.md`, `.anthill/README.md` (SOP).
- Related family: [shared-tree-gate-tension](../projects/shared-tree-gate-tension/proposal.md) (shared
  tree, parallel seats, collision — but that's the _commit gate_; this is _unowned-work ownership_).
- Related (parked): ROADMAP "self-selection bounties".

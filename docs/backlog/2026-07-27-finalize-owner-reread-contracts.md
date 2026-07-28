# `finalize-session`: re-read every doc you own **as its authority** before landing it

**Added:** 2026-07-27 · **Status:** ready to build · **Seat:** weaver
(`plugin/skills/finalize-session/SKILL.md`)

Add an explicit finalize beat: **before landing, re-read every contract/doc you own as its
authority and verify each claim against current code. Assume it has drifted, because it probably
has.**

**The evidence is unusually strong — a 4-for-4 (really 5-for-5) result in one session**
([#57](https://github.com/ichabodcole/anthill/issues/57)). At finalize, every seat re-read the doc
it owned instead of trusting the warm-written version. **Every single one had drift:**

- **Contract 1** (`seams.md`) — 3 corrections, including **a proof line pointing at a deleted probe
  artifact**, a stale count, and a missing guarantee.
- **Contract 2** — **two outright false statements**: named the wrong function as a field's home,
  and a wiring claim that no longer held.
- **Contract 3** — 3 stale statements.
- **Two seat docs** — restated shared truth (a violation of the one strict rule: truth lives in
  `seams.md`, never restated), caught only on self-audit.
- **A fifth pass** read a contract as its **consumer** rather than its owner — a different lens —
  and caught an unverified claim about to ship as a bogus proof.

**The mechanism:** docs get written in the heat of the build, when the reasoning is warm but the
surrounding code is still moving. By finalize the code has moved under them and the prose quietly
lies — a proof points at a file deleted two commits later; a "lives in `X()`" became `Y()`. **None
of it fails any gate.** It is invisible until someone reads it _as the authority for that boundary_
and checks each claim against the code.

**Why this matters more than a typical polish beat:** stigmergy is the whole thesis. A trail that
confidently points the wrong way is worse than no trail — the next ephemeral agent has no way to
know it's being misled. This beat is the cheapest possible defense of the thing anthill exists to do.

**Also notable — how it propagated.** One seat modeled the owner-audit unprompted and it went round
all four by social proof; by the last seat, _not_ doing it would have been conspicuous. That is
precisely the argument for making it explicit in the skill: a practice this valuable should not
depend on one seat happening to start it.

## Acceptance Criteria

- [ ] `finalize-session` step 2 (or a new 2.5) instructs each seat to re-read every doc it owns as
      that doc's authority, verifying each claim — **proofs especially**, since a pinned test or
      artifact may have moved or been deleted.
- [ ] The instruction says "assume drift" rather than "check if anything changed" — the framing is
      the active ingredient.
- [ ] The finalize checklist carries a corresponding line (skip-resistant, per the ritual-checklist
      pattern already established).
- [ ] Optionally: a **consumer-lens** pass on contracts a seat _consumes_ — the producer can confirm
      what's emitted, but only the consumer confirms it's what they read.

## References

- `plugin/skills/finalize-session/SKILL.md` — steps 1–2 and the closing checklist.
- `plugin/templates/docs-team/dev/seams.md` — the "whoever moves a boundary updates this + its
  proof" maintenance trigger this beat enforces.
- Related: [finalize fresh-eyes seat-doc review](2026-07-09-finalize-fresh-eyes-seat-doc-review.md)
  — the cold-subagent complement to this warm-owner pass. **Check whether they are one beat or two**
  (owner-audit catches drift; cold-read catches incomprehensibility — likely distinct, but they
  land in the same step).
- Issue: [#57](https://github.com/ichabodcole/anthill/issues/57)

# Claims outran evidence — a send-time and land-time lint (taxonomy class C1)

**Added:** 2026-09-04 · **Status:** candidate — the evidence is measured; the intervention is a
direction, not a spec; do not build until the first curation run has ruled on it and the false-positive
rate has been measured against real traffic · **Seat:** forager (the lint) + sentinel (the guard's
positive control) · **Found:** blind taxonomy over two teams' extracted reports, see
[COMPARISON.md](../projects/anthill-evolution/taxonomy/COMPARISON.md) §6, class C1

**Not part of `feat/anthill-evolution`.** That branch builds the report → curation loop. This item is
the first thing curation is expected to produce, and it ships on its own branch after that one merges,
so the loop is tested by producing it rather than pre-empted by building it.

## The class

A sentence left its author with more certainty than the run behind it could support, including a run
over a smaller set than the sentence names. The test the comparer settled on: does the message carry a
bare number, zero, status word or absolute without the command, path or sha that produced it.

## The evidence

|                                          |                              |
| ---------------------------------------- | ---------------------------- |
| items, anthill batch (A)                 | 320                          |
| items, Spellbook batch (B)               | 329                          |
| classifiers that carved it independently | 12 of 14                     |
| recurrence                               | highest by count, both teams |

Both merges called its lint "the strongest convergence". Both teams recorded the class, re-recorded
it, and kept producing it: "the class survives being written down" (A), "the most re-recorded class"
(B). Both already have a partial instance of the shape: Spellbook's `--as-of`, and anthill's proposed
sha-required `--green`.

## The intervention shape (converged, both merges)

A lint at the two moments a claim leaves its author: `anthill comms send` and `anthill commit`. It
refuses a bare number, zero, status word or absolute unless the same message carries a command, path
or sha, or is marked `UNVERIFIED` / `TAKEN ON REPORT`. Refusal, not warning: fourteen of fourteen
classifiers concluded that a recorded lesson does not fire for its author, so the mechanism has to sit
in the tool at the moment of action.

## Before designing

- Measure the false-positive rate on real messages: run the candidate rule over the comms log and
  commit history of both teams and count what it would have refused that was fine.
- Decide the escape hatch and its cost. `UNVERIFIED` must be cheap enough to use honestly and visible
  enough that a reader discounts it.
- The guard needs a positive control in its tests (AGENTS.md rule), and the contract row for the
  refusal is an error envelope on stderr, exit 1, per CONTRACT.md.

## Related

- [Instruments that could not fail](./2026-09-04-instruments-that-could-not-fail-positive-control-gate.md) — the class this lint's own tests must not fall into.
- [Reflective machinery ledger](./2026-09-04-reflective-machinery-ledger.md) — why prose alone has not stopped this class.
- Taxonomy sources: `pass-1-anthill/MERGED.md` U2 and U3, `pass-2-spellbook/MERGED.md` U2.

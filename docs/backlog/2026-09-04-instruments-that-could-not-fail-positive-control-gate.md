# Instruments that could not fail — no green without a red in the same run (taxonomy class C2)

**Added:** 2026-09-04 · **Status:** candidate — evidence measured; intervention is a direction; build
after the curation run rules on it and after
[C1](./2026-09-04-claims-outran-evidence-send-time-lint.md), which it shares a harness with ·
**Seat:** sentinel (the gate) + forager (the harness output) · **Found:** blind taxonomy over two
teams' extracted reports, [COMPARISON.md](../projects/anthill-evolution/taxonomy/COMPARISON.md) §6,
class C2

**Not part of `feat/anthill-evolution`.** Same reasoning as C1: this is curation output, shipped on its
own branch once the loop exists.

## The class

The check that produced the verdict could not have produced the other verdict on the thing it was
supposed to catch. A guard with no positive control, a grep over the wrong set, a test that passes on
an empty fixture, a gate leg that was skipped and reported green.

## The evidence

|                                          |                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| items, anthill batch (A)                 | 151                                                                                       |
| items, Spellbook batch (B)               | 328                                                                                       |
| classifiers that carved it independently | 10 of 14                                                                                  |
| recurrence                               | "for the third session running" (A steward); "vacuity recorded eleven times" (B daedalus) |

AGENTS.md already states the rule for this repo's tests: a guard needs a positive control. The class
is what happens everywhere that rule is prose rather than a check.

## The intervention shape (converged, both merges)

No green is accepted until a red was observed in the same run. The harness or gate prints the control
it used, the domain it ran over, and the sha, and refuses to emit a bare verdict; the absence of a
control is reported as `NO VERDICT`, not as pass. Same reason as C1 that it must be mechanical.

## Before designing

- Enumerate the instruments in scope. Candidates: the `bun run check` gate, the `anthill commit` gate
  legs, guard tests, the docs lint. Each has a different notion of "control".
- Decide what "same run" means for a gate that composes other tools, and what the tool emits so a
  reader can tell a real green from a vacuous one.
- The rule collides with "anthill adapts, not dictates" wherever the gate is the project's own. See
  [no home for correct work that must not be green](./2026-08-01-no-home-for-correct-work-that-must-not-be-green.md)
  for the prior collision.

## Related

- [Claims outran evidence](./2026-09-04-claims-outran-evidence-send-time-lint.md)
- [Reflective machinery ledger](./2026-09-04-reflective-machinery-ledger.md)
- Taxonomy sources: `pass-1-anthill/MERGED.md` U1, `pass-2-spellbook/MERGED.md` U3.

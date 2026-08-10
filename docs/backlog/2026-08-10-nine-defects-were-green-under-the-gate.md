# Nine defects were green under `bun run check` while broken — capture, then decide

**Added:** 2026-08-10 · **Status:** Open — **captured, not scoped** · **Shape:** decide first, then fix / mitigate / drop
**Source:** the `multi-team-support` branch and the `bootstrap` fail-open fix that followed it.

**This is a capture, not a plan.** The pattern is real and measured; whether it is **fixable**,
merely **mitigable**, or **specific to this repo** is exactly what is not yet known. Written down so
it is not lost, and deliberately **not** promoted further — see the last section.

## What happened

Across one feature branch and one fix branch, **nine defects were green at `0 fail` while broken.**
Not occasionally — as the rule. Four of them were found only by running a command against a fixture
repo; three were found by an independent reviewer with shell access; two were found by a reviewer
reading the diff after the fix had already "landed".

**The raw material already exists** — this item does not need to re-gather it:

- `docs/projects/_archive/multi-team-support/sessions/2026-08-10-multi-team-support-implementation.md`
  — the table of **what was green while each defect was broken**.
- `docs/projects/_archive/multi-team-support/plan.md` § implementation record — each one classified
  🕳 gap / 🔧 improvement / ⚖ judgement, with what was measured.
- `docs/memories/2026-08-10-fixtures-beat-careful-reading.md` — the account of the bootstrap fix
  **reproducing its own defect twice**, each round correct in reasoning and wrong against a fixture.

## ⚠ The reason it currently reads as a slogan: it is at least THREE mechanisms

_"The gate cannot see the failures that matter"_ lumps together things with different causes and
different available fixes. Splitting them is the first real work here, and probably decides whether
any of it generalizes:

**1 · Wiring, not logic — a test-ALTITUDE problem.**
`team ls`, `team use` and `init` each had a **correct pure half** and a wrong call site. The unit
tests were true and tested the layer below the defect. `renderTemplates` was never wrong; it never
ran.
→ **Plausibly fixable, plausibly general.** The candidate mitigation is a cheap CLI-level smoke per
command rather than more unit tests. **Also the most likely to need design work** — if it does, this
is the part that graduates to an investigation.

**2 · Fixtures shaped to pass — a test-AUTHORING problem.**
Three instances: a coverage assertion whose expected set came from the thing under test; commit-message
fixtures that all avoided the colon that breaks trailer parsing; a fingerprint measured against a
config already carrying the key whose absence was the point.
→ **Almost certainly general craft**, and likely already named in the wider testing literature. Check
before writing anything of our own — the useful contribution may be the three concrete instances, not
a new rule.

**3 · Unexecutable claims — NOT a gate problem at all.**
`<teamDir>` shipped unresolved into every rendered SOP; a skill asserted a "measured" property that
was false; §2·0's script enumerated repo kinds while the bullet under it forbade exactly that.
→ **No gate can ever see these**, so "the gate missed it" is a category error. The question is not a
better gate but **knowing which claims are checkable at all** — which may be specific to what anthill
_is_ (a product whose surface is largely prose) rather than general.

## Possible outcomes, none chosen

- **Fix** — e.g. a per-command CLI smoke that makes (1) structurally hard to reproduce.
- **Mitigate** — e.g. `cascade-check` gaining a row, or a checklist item at the point of authoring.
- **Disseminate** — `anthill field-notes` already carries _"Verify the real artifact, not a proxy"_;
  (2) at least is a sharper **scar for that existing principle** rather than a new one. **Not yet** —
  see below.
- **Drop** — a legitimate outcome if the split shows each piece is either already known or local.

## Explicitly NOT ready for field-notes or HiveMind, and the reason is structural

**You cannot file something as cross-project knowledge while _"does this cross projects?"_ is the
open question.** `field-notes` ships to every consuming team and is framed as observations that
carry their evidence; publishing a three-mechanisms-in-a-trenchcoat sentence there would hand teams
a slogan and cost the doc credibility it has earned.

**Out of scope, already owned elsewhere:** _"a reviewer without shell access is a second opinion, not
a review"_ — that is a `project-docs` concern, already known and being worked on upstream. Do not
re-litigate it here.

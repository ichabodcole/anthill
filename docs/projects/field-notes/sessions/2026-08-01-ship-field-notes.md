# Session — ship `anthill field-notes`

**Date:** 2026-08-01 · **Branch:** `feature/field-notes` → `develop`
**Shape:** solo lane, independent review (no team convened — one lane, no seam)

## What shipped

- **`anthill field-notes`** — prints a doc bundled in the plugin. Four sections: principles with
  their scars; conventions teams reinvented independently; **things measured NOT to work**; and the
  discriminator for which to tool.
- **The template `principles.md` now ships empty**, with a header covering what belongs there, that
  an entry needs a scar rather than a case, when one gets added, where to see what other teams found,
  and that **disagreement is a legitimate entry**.
- Pointers from **`bootstrap`** (show it once) and **`upgrade`** (name it as a step).

**Gate 255 → 261.** Our own `.anthill/principles.md` untouched — we are a team and we earned those.

## Why the doc lives in the plugin

`anthill init` creates files that are missing and **never touches ones that exist**. So anything
copied into `.anthill/` reaches a team **once at bootstrap** and no later revision ever arrives —
verified by smoke test, not assumed. Reading from the plugin means the notes are current for whoever
has the plugin.

**And pre-filling their file was the dictating failure.** It hands a team conclusions whose scars
belong to somebody else, arriving as though they earned them. The distinction that makes this
legitimate at all: **project conventions** belong to the host repo and anthill must never dictate
them; **how agent teams coordinate** is anthill's own subject, so an opinion is fine — _offered_,
not installed.

## Decisions worth keeping

- **The name carries the epistemic status.** _Field notes_ names provenance — captured in the field,
  evidence attached. _Principles_ or _guidance_ both carry a faint **should**.
- **Stateless.** A reviewed-marker would let the touch point say _"two entries added since you last
  looked"_ — rejected, because it needs a config schema change dragging five surfaces behind it, and
  **a badge that fires every release and is usually not-for-us trains the discard reflex.** That is
  the heartbeat failure a peer team reported this week. If teams later say they never know when
  something is new, **that** is the signal to add it.
- **Two of six tests guard the doc's CHARACTER**, not the command — that it says plainly it is not a
  list to adopt, and that it names how to report one that failed. Verified to fail when the framing
  is stripped. **A doc like this drifts prescriptive one edit at a time and nobody ever decides to
  make it a mandate.**

## Found while building

**The command's own failure surface lied.** Testing it from a _copied install_ rather than the repo —
with the doc absent — produced a raw `ENOENT` carrying an absolute path. A valid envelope, so the
parser fix worked, but it named the symptom and hid the cause. Now it says the plugin looks
incompletely installed, where the file was expected, and to reinstall.

Fixing that mattered beyond politeness: this is the command that prints _"a signal that is correct
but meaningless trains its audience to ignore the channel it arrives on."_

## Review

Independent reviewer returned **Ready to merge: With fixes** — **not for any defect found**, but
because it had **no shell** and said so, declining to present a static trace as execution. It also
mis-reported the repo's current branch, and flagged its own uncertainty about that rather than
asserting it.

**Everything it could not run was then run:** all three format cases, the no-config case, single-line
stdout with empty stderr, the full gate, and the cascade question it raised — _does anything still
reference the old pre-filled principles content?_ One hit, checked and cleared: the SOP's
"agreement is not truth" is the **retro's own rule**, not seeded principle content.

**Second reviewer today to have no shell.** Worth noting as a pattern about how these are dispatched
rather than about either agent.

## Measurement errors, mine, both directions

- A stderr check claimed **10,351 bytes on a success path**. Direct measurement: stdout 10,351B in one
  line, **stderr 0B**. Redirection ordering inside a shell function counted the wrong stream — a
  **false defect**, where the day's earlier instances produced false confidence.
- A framing assertion matched a string that never existed (`"not a list you are expected to adopt"`;
  the doc reads _"**What this is not:** a list you are expected to adopt"_). Caught by its own test.

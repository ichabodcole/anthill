# anthill's first external bootstrap: the methodology held (and over-delivered)

**Date:** 2026-06-30
**Tags:** `#anthill` `#methodology` `#field-report` `#stigmergy`
**Type:** Integration

---

## The Lesson

The first real bootstrap + convene of anthill on a _foreign_ multi-app repo
(media-buffet: Elysia API + 2 Nuxt apps + Expo mobile + an SDK, lead `arthur`) validated
the methodology end-to-end — and the headline finding was a positive emergent property,
not a bug: **verification-mindedness emerged OFF the verify seat.** The friction that did
appear was almost entirely "bootstrap assumed a single app," which is the most fixable
kind.

## Context

anthill was extracted from dream-flute and had only been mechanism-verified in throwaway
repos. This was the first external team running the full loop on a real project with a
genuinely different shape (multi-surface, not single-app). Captured live via the built-in
feedback mechanism plus a grapevine back-channel (`anthill-feedback`).

## The Fix / Pattern

### What over-delivered (keep / lean into)

- **Verify-reflex off the verify seat:** the API seat (`lancelot`) caught a
  parallel-truncate test flake invisible across 20+ warm runs (cold-run only) — _before_
  the land. The structure didn't mandate it; a non-verify seat carried a "distrust the
  green suite" instinct. A seat is a labor boundary AND a carrier of a verification
  reflex — evidence for the durable-seats thesis.
- **Atomic shared-tree land:** `anthill commit -- <paths>` (named-paths-only + serialize
  lock) prevented sweeping a peer's staged file. The lead collected all seats' paths into
  one coherent commit. Confirmed keeper.

### What needed fixing (→ v0.2 brief + backlog)

- The layered-app archetype assumed ONE app and would have forced one "surface" seat
  spanning Vue + React Native. The team redesigned vertical at ratification.
  → multi-surface archetype + candidate-seatings (brief feature 5).
- Decomposition heuristic that worked: _"where can two people work semi-independently
  against a stable contract?"_ — strong seams split, weak seams (two Nuxt apps, same
  shell) fold.
- No human `anthill attach` / terminal door; the lead drove from outside the panes on
  full bun paths. → global CLI (brief feature 3).
- Small fixes filed to backlog: grounding-doc detection, `anthill status` ambient-board
  scoping, seat-doc formatter clash, lead-handle vs bridge-identity note.

## Why This Works

Durable seats carry _culture_, not just scope — the verify reflex diffused because the
system treats verification as everyone's instinct, seeded by the verify seat's presence.
And the friction clustered exactly where anthill's only archetype over-fit a single-app
assumption — meaning the methodology core is sound and the remaining work is breadth, not
redesign.

## Related Resources

- [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md)
- Backlog items: `../backlog/2026-06-30-*.md`
- Live back-channel: grapevine `anthill-feedback` (also routed to Cole's Hivemind)

# `finalize-session` has no epitaph beat — the highest-leverage line in a seat doc is unprompted

**Added:** 2026-08-01 · **Status:** ✅ **SHIPPED** 2026-08-03 (session 7) · **Seat:** weaver (skills + templates) · **Origin:** the human, added mid-finalize in session 5 and run by all six seats the same day

> **As shipped:** the beat is the last item of `finalize-session` step 2 (after synthesis, before the
> land) plus a **gated line in the teardown checklist**; the seat-doc template carries the placeholder
> and the lineage rule; `join` tells an arriving seat to read it first and what it means. The cascade
> pass added one the touch-list missed: **the SOP's "Three homes" enumerates the seat doc's contents
> and omitted the epitaph** — in the template _and_ the rendered copy.
> **Not needed:** mirroring into this repo's own seat docs. All six already carried a hand-written
> epitaph from sessions 5–6 — the ritual was run before it was written down, which is why the shape
> above is described rather than invented.

A seat doc is read cold by an agent with none of the writing instance's context. It currently opens
with a config-derived header and **"Who I am"** — accurate, and not the thing a departing instance
would choose to say if it got one sentence.

**Add an epitaph: the single thing this instance wants the next holder of the seat to know, above
all else.** Written last, read first.

## Shape, as run

- **Placed at the TOP of `.anthill/dev/<handle>.md`**, under the seat header, above "Who I am".
  _It has to be first or it is not an epitaph, it is an appendix._
- **Exactly one thing.** The discipline is entirely in the selection — everything the seat knows
  competes for the slot and one wins.
- **Written after synthesis**, because you cannot know what it is until then.
- **Second person, to the successor**, who will not remember the session.
- **Superseding a predecessor's does not delete it** — move it to an `## Epitaphs — the lineage`
  section at the bottom, dated, **and say why.** An epitaph that is still true does not get demoted
  for being old.

## The selection test that made it work

> **What would go wrong if the next instance did not know this?**

If the answer is _"nothing specific, but they'd be poorer"_, it is a hard-won lesson and already has
a home lower in the doc. **The epitaph is for the thing whose absence produces a concrete recurring
failure.**

Observed across six seats: **every technical candidate lost.** Not for being wrong — because the
technical surface will have moved by the time anyone reads it, and **the shape of how a seat goes
wrong will not.** The strongest answers were about disposition: what the seat must refuse, what it
will be tempted to defer to, what nobody else will tell it.

## Why it belongs in the ritual rather than in a seat's taste

**It is the one artifact where session-end loss is total.** There is no scratch to recover it from
and no peer who can write it for you — so it must be **gated before teardown**, like the synthesis
confirmations, or it silently never happens. Session 5 gated `anthill down` on six-of-six
confirmations of _"landed, epitaph in"_.

**And it is stigmergy's sharpest form.** The repo's own thesis is that curation means strengthening
the load-bearing trails and letting the rest fade. **The epitaph is that judgment forced to
n=1** — the strongest possible pheromone, written by the only instance qualified to choose it.

## Touches

- `plugin/skills/finalize-session/SKILL.md` — a beat after step 2.5 / before the land, plus the
  teardown checklist line.
- `plugin/templates/docs-team/{{handle}}.md` — the placeholder and the lineage-section rule, so a
  seat that has never had one knows the convention exists.
- `plugin/skills/join/SKILL.md` — worth one line, since the epitaph is the first thing a joining seat
  now reads.
- **Run `cascade-check` after** — this touches a skill, a template, and the rendered copies.

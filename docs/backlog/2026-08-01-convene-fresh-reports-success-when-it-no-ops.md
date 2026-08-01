# `convene --fresh` reports `"fresh": true` when it cleared nothing

**Added:** 2026-08-01 · **Status:** ready to build (small; the honest field is the whole fix)
· **Seat:** forager (CLI / agent layer) · **Found:** by a seat reading the vine, after the lead had already published a false claim from the report

`anthill convene --fresh` returns `{"ok":true,"data":{…,"fresh":true,…}}` **whether or not a clear
happened.** The field reports _"I forwarded the flag to grapevine"_, not _"the log was cleared"_ —
and those are different questions.

## What happened

The lead wired his own tails **before** convening (correct — an unwired lead is an unmonitorable
lead). `--fresh` is a documented no-op when subscribers are connected, so **the lead's own tail was
the subscriber that suppressed his own clear.** `convene` reported `fresh: true`. He then posted on
the vine that the channel had been cleared and that _"what you see here IS this session."_

Both halves were wrong, and a joining seat had to date the messages by hand to separate two sessions.

## The measurement that settles it

```sh
grapevine pull anthill-dev          # → ids 1–19; session 4's #1–#13 still present
grep -c 'pkill\|parser-envelope' …  # → session-4 content still in the pull
ls -lt ~/.grapevine/archive/ | grep anthill-dev
                                    # → newest is the PREVIOUS day; --fresh archives before clearing,
                                    #   so an absent archive means no clear occurred
```

## Why it bites

Two individually-correct practices composed into a silent failure: **wire your tails first** and
**convene with `--fresh`**. Nothing warns that the first disables the second, and the envelope
actively asserts the opposite.

This is `principles.md` _On instruments_ — **an instrument answered a coarser question than the one
asked and looked right doing it** — same family as the `Checked 0 files. No fixes applied.` scar
already recorded there. **Setup commands are the worst place for it**, because nobody re-runs them.

## The fix

Report what actually happened, not what was requested. `fresh` should distinguish at least
`cleared` / `skipped-subscribers-present` / `not-requested`. If grapevine does not return enough to
tell, **say so in the field** rather than defaulting to the optimistic value — the guard we already
apply to `gap: null` on `follow-start` (`400e348`): **never report `0`/`true` for a thing you cannot
observe.**

**Related:** `.anthill/dev/seams.md` Contract 5(a) — a value only one path can produce belongs on
`meta`, and an optional field populated on one path makes its absence unreadable.

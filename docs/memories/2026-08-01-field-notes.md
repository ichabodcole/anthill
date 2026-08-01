# `anthill field-notes` — shipping what we learn without shipping it as law

**Date:** 2026-08-01 · **Branch:** `feature/field-notes` → `develop`

`anthill field-notes` prints a doc **bundled in the plugin**, because `init` creates missing files
and never updates existing ones — so anything copied into `.anthill/` reaches a team **once at
bootstrap** and never again. The team's `principles.md` now ships **empty**: pre-filling it hands
them conclusions whose scars are ours.

**The line that makes this legitimate:** project conventions belong to the host repo and anthill must
never dictate them; **how agent teams coordinate is anthill's own subject**, so an opinion is fine —
offered, not installed. The name carries that: _field notes_ names provenance, where _principles_ or
_guidance_ carry a faint should.

**Stateless deliberately.** A "N new since you looked" marker was rejected because a badge firing
every release that is usually not-for-us **trains the discard reflex** — the heartbeat failure a peer
team reported the same week.

**Two of six tests guard the doc's character, not the command.** A doc like this drifts prescriptive
one edit at a time.

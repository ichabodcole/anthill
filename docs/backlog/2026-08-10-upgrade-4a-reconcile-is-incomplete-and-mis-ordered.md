# `upgrade` §4a: the snippet a reader copies runs the wrong diff, and seat docs are never reconciled

**Added:** 2026-08-10 · **Status:** Open · **Shape:** reorder one block, extend the doc list
**Surface:** `plugin/skills/upgrade/SKILL.md` §4a

**Found by a blind cold read, 2026-08-10**, asked for the plan it would actually execute.

## 1. The multi-team correction arrives AFTER the snippet that needs it

The fenced block hardcodes the single-team default:

```sh
TEAMDIR=.anthill   # ← `paths.teamDir` in .anthill/config.json, if this repo overrides it
```

The correction — _"⚠ Several teams → run this whole reconcile once PER TEAM … use `team ls`, not
`.anthill/`"_ — sits about 20 lines below. The reader: **"A reader who copies the fence has already
run the wrong diff."** Ordering is the whole fix: the resolution step belongs above the snippet that
consumes its value.

Related, same section: multi-team is handled throughout as warnings appended to steps rather than as
its own path, _"so the default reading of every fence is single-team. If I'm rushing, the project
gets one reconcile and I report it as done."_

## 2. Seat living docs are never mentioned

§4a lists `README.md`, `dev/README.md`, `dev/seams.md`, `paper-cuts.md`, `principles.md`, `retro.md`.
**`dev/<handle>.md` appears nowhere** — and those are the docs the seats actually read first. The
reader flagged it under "what would still be stale after I follow this plan":

> _"If they're templated, they're unreconciled; if they aren't, they're the docs most likely to carry
> stale instructions and nothing in this skill inspects them."_

Note this is now sharper than when it was found: the seat-doc template
(`templates/docs-team/dev/{{handle}}.md`) gained content on 2026-08-10 (the shorthand legend), so
there IS something to reconcile and §4a would not surface it.

## 3. The template-side paths are never stated, and "any other scaffold" is unbounded

The reader guessed that the template layout mirrors the footprint layout under `templates/docs-team/`
— _"Nothing states that."_ And _"any other scaffold the team kept"_ implies a set larger than the
list, with no enumeration and no instruction to `ls` the templates directory.

## 4. `retro.md`'s boundary is a judgement with no marker

> **Mirror down only changes to the guidance above the entries.**

_"Intent clear, mechanics absent. 'Above the entries' presumes a boundary marker I'm not told to look
for. Against a full-file diff I'd be eyeballing where guidance ends."_

## 5. Hunk classification has a free escape hatch

_"'Their own local specificity → keep it' is the cheap escape for every hunk I don't understand.
Nothing forces me to distinguish it from 'genuine drift', and both end in a line in my report."_

## Acceptance Criteria

- [ ] The per-team resolution precedes the snippet that uses `TEAMDIR`
- [ ] Seat docs are in the reconcile list, or §4a says why they are excluded
- [ ] The template-side path is stated once, and the doc set is derived (`ls` the template dir)
      rather than listed
- [ ] `retro.md`'s boundary names the marker to look for
- [ ] Re-cold-read blind for the executable plan, and check the per-team step lands before the diff

## References

- `plugin/skills/upgrade/SKILL.md` §4a
- `plugin/templates/docs-team/dev/{{handle}}.md` — now carries content to reconcile

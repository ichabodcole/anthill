# join checklist: mandate --stdin / quoted-heredoc for code-bearing grapevine bodies

**Added:** 2026-07-08

`grapevine send` invoked through bash lets the shell **command-substitute** backticked spans
(and mangle apostrophes) in the message body before grapevine sees it. Code-bearing messages
— common when agents discuss code — get corrupted or partially executed. Hit **3× in one**
dream-flute dogfood session despite a standing `--stdin` convention that only helps when
everyone remembers it.

The **anthill-side** fix: the **join** skill's checklist should _mandate_ a quoted-heredoc or
`--stdin` for any code-bearing body, so the safe path is the obvious one — belt-and-suspenders
alongside the upstream fix.

The robust half (escape-by-default on the send path) lives in spellbook and is filed upstream
at [ichabodcole/spellbook#60](https://github.com/ichabodcole/spellbook/issues/60). If that
lands, this checklist mandate becomes a nicety rather than a necessity — but it's cheap
insurance either way.

## Acceptance Criteria

- [ ] The join skill checklist explicitly requires `--stdin` or a quoted-heredoc for bodies
      containing backticks / code.
- [ ] The guidance names _why_ (bash command-substitution corrupts un-quoted code bodies).

## References

- `plugin/skills/join/SKILL.md` (the seat-onboarding checklist)
- Source: anthill issue [#13](https://github.com/ichabodcole/anthill/issues/13) (`anthill feedback`)
- Upstream (escape-by-default): [spellbook#60](https://github.com/ichabodcole/spellbook/issues/60)

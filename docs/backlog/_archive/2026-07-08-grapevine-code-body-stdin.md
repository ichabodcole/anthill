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

An upstream fix was filed at
[ichabodcole/spellbook#60](https://github.com/ichabodcole/spellbook/issues/60). Note the original
hope — "escape-by-default on the send path" — proved **impossible**: the shell command-substitutes
the metacharacters _before_ grapevine's process starts, so the CLI can't escape an argument it never
receives intact. This checklist mandate (use the shell-free `--stdin` / `--body-file` path) is
therefore the _primary_ fix, not a nicety. See **Status** below.

## Status

**Shipped 2026-07-08.** Added as a checklist beat in `plugin/skills/join/SKILL.md` (the "Join
checklist" section).

**Framing correction (after checking spellbook#60's actual resolution):** the mandate is the
_primary_ caller-side fix, not "belt-and-suspenders." The corruption happens in **bash** —
metacharacters are command-substituted _before_ grapevine's process starts — so grapevine can't
escape an argument it never receives intact. True escape-by-default proved **impossible**; the
upstream fix ([spellbook#60](https://github.com/ichabodcole/spellbook/issues/60), commit `cc35636`)
is a **non-blocking stderr warning** that steers callers to `--stdin` / `--body-file`. So the
shell-free send path this checklist mandates _is_ the fix; the upstream warning is the nudge toward
it, not a replacement for it.

## Acceptance Criteria

- [x] The join skill checklist explicitly requires `--stdin` or a quoted-heredoc for bodies
      containing backticks / code.
- [x] The guidance names _why_ (bash command-substitution corrupts un-quoted code bodies).

## References

- `plugin/skills/join/SKILL.md` (the seat-onboarding checklist)
- Source: anthill issue [#13](https://github.com/ichabodcole/anthill/issues/13) (`anthill feedback`)
- Upstream (escape-by-default): [spellbook#60](https://github.com/ichabodcole/spellbook/issues/60)

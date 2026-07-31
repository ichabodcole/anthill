# Nothing tells a team its living docs are behind the plugin

**Added:** 2026-07-31 · **Status:** ready to design (the manual procedure shipped; the mechanism did
not) · **Seat:** forager

`anthill init` skips every existing doc. That protects a team's content and **freezes it** — a living
doc is written once, at bootstrap, and **no later release ever updates it.** A team carries its
bootstrap-version guidance indefinitely, including guidance a later release corrected.

**Nothing surfaces this.** `anthill migrate` reports on _layout_ and says "already current".
`anthill status` says nothing about content. The docs look fine, because they are perfectly valid —
just old. The only signal is a human remembering to run a diff.

## Why it matters more than it looks

Found during the language-and-promises pass, where it was **immediately live**: that pass rewrote the
SOP seed with five coordination conventions and a safety warning, and **not one existing team would
have received any of it.** StoryLoom bootstrapped on 1.5.0.

This compounds. Every release that improves the templates widens the gap for every team that already
exists, and the teams furthest behind are the ones who have been using anthill longest — precisely
the teams whose habits are most settled and least likely to be re-examined. It is the
[practice-transmission problem](../investigations/2026-07-28-practice-transmission-between-teams.md)
with a mechanical cause: we learn something from one team, write it into the template, and it reaches
nobody who is already running.

## What shipped instead (and why it is not enough)

`anthill:upgrade` step 4a now carries the reconcile as a first-class beat — diff each shipped template
against the footprint, classify each hunk (shared guidance / local specificity / drift / render
tokens), show the human before applying. That is a **correct procedure with no trigger.** It fires
only if someone thinks to run `upgrade` on a release that, by every signal the tooling gives, changed
nothing.

## Shape of the fix (not settled)

The cheap end is probably enough, and the expensive end is probably wrong:

- **A drift report.** `anthill init --diff` (or a `status` line): compare each shipped template to its
  rendered counterpart and report **which footprint docs differ from the current templates**. It does
  not need to be smart. It needs to say _"your SOP differs from the 1.7.0 template"_ so a team knows a
  reconcile is worth doing.
- **Do NOT auto-merge.** The classification is genuinely judgment — a footprint legitimately carries
  local specificity the template must not, so a delta is expected and is not drift. An auto-merge
  would overwrite deliberate local choices, which is the exact harm the no-clobber rule exists to
  prevent. Report; let a human and an agent decide.
- **Open: how do we know a hunk is "shared guidance" vs "their local content"?** Probably we don't,
  and the report should not pretend to. Naming the file as differing may be the whole feature.
- **Open: does this belong in `status` (seen every session, risks nagging) or `upgrade` (seen rarely,
  which is the current problem)?** A once-per-release signal is what's wanted; neither surface is
  obviously that.

## Acceptance Criteria

- [ ] A team can find out that its living docs are behind **without already suspecting it**.
- [ ] The signal distinguishes _differs from the current template_ from _is wrong_ — it must not read
      as an error, because local divergence is legitimate and expected.
- [ ] Nothing auto-merges a living doc.
- [ ] `anthill:upgrade` step 4a points at the new signal instead of relying on the human's memory.

## References

- [Name the granularity of every promise](2026-07-31-name-the-granularity-of-every-promise.md) —
  instance 4 is this, found by applying the lens rather than by report.
- `plugin/skills/upgrade/SKILL.md` §4a — the manual procedure this would trigger.
- `plugin/scripts/anthill/commands/team-init.ts` — `skipped[]` already knows which docs existed, which
  is most of the way to the report.

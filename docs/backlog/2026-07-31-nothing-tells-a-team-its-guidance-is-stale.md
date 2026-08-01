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

## StoryLoom ran `upgrade` and diagnosed this with anthill's own principle

Field confirmation the same day, from the team the gap was found against. They ran the skill only
because they were asked to: _"Nothing would ever have surfaced it. A team can run indefinitely on
bootstrap-era guidance with **every tool reporting healthy**."_ The guidance they were missing
included the commit-pathspec caveat — which bears directly on the commit hygiene they had spent that
session fixing.

**Their diagnosis is sharper than the one above, and it comes from our own SOP.** The rule that
predicts this gap is already in the guidance we ship:

> **No store without a named re-read moment.** Every place knowledge is written must have a moment it
> is read back. A store nothing re-reads is a write-only leak — don't create one.

> _"The living docs **do** have a re-read moment — join re-grounds the seat in its doc every session.
> But that re-read is against the **content**, never against the **source it was rendered from**. So
> the seat faithfully re-reads guidance that no longer matches upstream, and **re-reading it more
> often doesn't help at all** — it's the one failure mode a re-read moment can't catch, because the
> doc is internally consistent. **anthill applied its own principle to seat knowledge and left the
> template layer out.**"_

That reframes the fix: this is not a missing warning, it is a **missing re-read moment at the template
layer**. The principle was already right; it was scoped to one layer.

**It also answers the open question below about where the signal belongs — with a third option
neither of us had.** Not `status`, not `upgrade`: **`convene`.**

> _"It fires once per session instead of once per seat, the human is already present to consent to a
> doc rewrite, and it's positioned **before the seats get briefed** — which is the moment that
> matters, since the cost of stale guidance is seats operating on rules the release already corrected.
> `join` would fire N times for one shared answer and would surface the drift to exactly the agents
> with **no standing to act on it**."_

**And a design caveat that would have sunk the naive version:** a drift check that cannot tell local
specificity from staleness **cries wolf on every project**. Their `seams.md` would light up
permanently, because replacing the `(none yet)` placeholder with real contracts **is the point**. So
scope the check to genuinely **template-shaped** files (`README.md`, `dev/README.md`) and leave the
accrete-by-design docs out of it entirely.

They also confirmed independently that the CHANGELOG is unreachable from a consuming repo, so **the
diff is the only record available** — which is why `upgrade` §4a now leads with it.

Their standing recommendation: **run `upgrade` on every anthill release, not on a version bump**,
since most releases won't move the version at all.

## ⚠ Three questions, not one — and they COMPOSE

This item was filed for one of them. Naming all three, because answering the wrong one produces
false reassurance:

**a. Content drift — _does my footprint differ from the templates I have?_** What this item was
filed for. Answered by diffing rendered docs against the shipped templates.

**b. Plugin currency — _is my installed plugin behind the latest release?_** **Not captured
anywhere until now.** Nothing in anthill tells a team a newer release exists. `anthill migrate`
answers a footprint-_layout_ question, `status` answers a session question, and neither looks
outward.

**c. Session pin — _did THIS session resolve a stale skill version?_** Observed live on 2026-08-01
and recorded in
[finalize-drift-pass-improvements](2026-08-01-finalize-drift-pass-improvements.md): a session holds
the plugin version it started with, so an update mid-session does not reach it. The lead's session ran
**1.5.0** while the installed version was **1.7.0** — and the lead is the seat that convenes and
finalizes.

**The composition is the important part, and it is why (a) alone is dangerous:**

> **(b) gates (a).** A drift report run against a stale plugin compares your footprint to **old**
> templates and reports **clean** — while you are two releases behind everything the newer ones added.
> _"Your SOP matches the template"_ is true relative to the plugin you have and false relative to the
> world.

That is the granularity pattern again — a check that is correct at one scope, relied on at a wider
one — which is exactly the shape this whole line of work keeps producing. **So the order is fixed:
answer (b) first, then (a). A drift report that does not know its own plugin might be stale is worse
than no report, because it converts "I don't know" into a green tick.**

**What (b) needs, and it is not obvious:** the plugin is installed from a `git-subdir` marketplace
source, so "is there a newer release?" is a **network** question, and anthill's shipped subtree is
deliberately zero-dependency and offline-friendly. Cheapest honest options, in order of preference:

- **Report the installed version at the touch point and let the human judge** — no network, no
  claims. _"This team is running anthill 1.5.0"_ at convene is often enough, because the human knows
  whether they updated recently.
- **Compare against the marketplace cache on disk** — several versions usually sit there already
  (this machine had 1.5.0, 1.6.0 and 1.7.0 cached while 1.5.0 was resolving), so a newer _cached_
  version is strong evidence without a network call.
- **A real remote check** — most accurate, worst fit for the constraints. Probably not.

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
- ~~**Open: `status` or `upgrade`?**~~ **Answered — `convene`**, per StoryLoom above: once per
  session rather than once per seat, the human is present to consent to a rewrite, and it fires
  **before the seats are briefed**, which is the moment that matters. `join` would ask N seats one
  shared question and surface it to the agents with no standing to act.
- **Scope the check to template-shaped docs only** (`README.md`, `dev/README.md`). Docs that accrete
  by design — `seams.md`, seat docs, `paper-cuts.md` — must be excluded, or the check cries wolf
  permanently on every healthy project.

## Acceptance Criteria

- [ ] A team can find out that its living docs are behind **without already suspecting it**.
- [ ] The team can find out **which plugin version it is running**, at a touch point that fires on its
      own — and the drift report does not claim "clean" without that being known.
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

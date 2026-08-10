# `upgrade`'s reconcile never says what it does to a team's edited files

**Added:** 2026-08-10 · **Status:** Open · **Shape:** prose, one skill
**Surface:** `plugin/skills/upgrade/SKILL.md` §4a
**Found by:** a cold read of the v2.3 release notes by an agent playing a consuming maintainer,
forbidden from looking anything up.

Its single most-wanted answer, and it could not get it:

> **"What does the living-doc reconcile actually _do_ to files I've edited?"** I'd have opened the
> upgrade skill before running it. **This is the single thing I'd most want to know before
> upgrading, and the message tells me to run it without telling me what it changes.**

It read "reconcile" as _"may modify content I wrote"_ — **the scary reading** — and said so.

**The answer is reassuring, which is what makes the omission expensive:** 4a is a **hand diff the
human drives**. It prints `diff <template> <their file>` and asks them to classify each hunk —
mirror it down, leave it as local specificity, or reconcile. **Nothing is rewritten automatically**,
and `anthill init` never clobbers. A team that assumed otherwise would reasonably decline to upgrade.

**Fix:** one sentence at the head of §4a saying what the step does to their files **before** the
first `diff` command — not after, and not implied by the shape of the commands. The release notes
now gloss it; the skill itself still does not.

**Worth noting for the pattern:** every reader of that skill is _already inside_ the upgrade, so the
question "is this safe?" is asked at the worst possible moment. The same is likely true of any step
that touches files a team hand-wrote.

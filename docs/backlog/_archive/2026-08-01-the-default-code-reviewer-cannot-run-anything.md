# `finalize-branch`'s default reviewer has no shell, so "code review" degrades to "code reading"

**Added:** 2026-08-01 · **Status:** ⬆️ **UPSTREAM — not fixable in this repo** · **Triaged:** 2026-08-03, session 7
· **Found:** twice in one day, both times only when the report arrived

> **⬆️ CLOSED HERE, NOT FIXED.** The skill is **`project-docs:finalize-branch`**, not anthill — this
> file says so itself under _"Feed it upstream."_ Nothing in this repo can change it, so it does not
> belong in an anthill payload and no anthill seat should pick it up.
>
> **It was carried into session 7's payload as a buildable item** (_"a sentence in a skill"_), on a
> brief that claimed each item had been verified by running. **The status line said "ready to fix" and
> the body said "upstream" — the file disagreed with itself, and the header is the half that gets
> read.** That is this repo's own single-source rule failing inside one file.
>
> **The finding remains valuable and is unaffected by the triage** — it is the reason to send it
> upstream, not a reason to keep it open here.

## What happens

`project-docs:finalize-branch` Step 2 makes independent review **mandatory and non-self-performable**,
and recommends **`feature-dev:code-reviewer`** as _"default for most branches."_

**That agent has no `Bash` tool.** Its toolset is `Glob, Grep, LS, Read, NotebookRead, WebFetch,
TodoWrite, WebSearch, KillShell, BashOutput` — it can read output from a shell it did not start, and
cannot start one.

So it cannot run the code, run the tests, or reproduce a defect. It reads.

## Why this is worse than it sounds

**The step it weakens is the one guarding against exactly this.** The skill's own rationale is that
the author is the worst reviewer of their own work — but a reviewer that cannot execute is subject to
the same failure the author is: reasoning about what the code does instead of observing it.

**Both instances today were caught only when the report arrived**, and only because the agent
declared the limitation honestly. A less scrupulous report would have read as a normal review.
One of them said so plainly:

> _"a static read alone cannot rule out the exact class of bug — identical-looking output masking a
> real difference — this task was designed to catch."_

**And on the same branch, the one real defect was found by execution the reviewer could not do**:
running the command from a _copied install_ rather than the repo surfaced a raw `ENOENT` where the
error should have named the cause. No amount of reading finds that.

## The fix

- **In the skill:** state the toolset requirement, not just the agent name. _A reviewer for this step
  must be able to run the code; verify the agent type has `Bash` before dispatching._
- **`general-purpose` has all tools** and did execute in this repo's other reviews — reproducing
  findings, running the CLI, checking pre/post-fix test counts. It is the correct default here.
- **For a substantial review, convene a team of one.** A spawned seat has full tooling and persistent
  context, and can be re-dispatched with its context intact. Heavier, and the right choice when the
  review is more than a pass.

## Feed it upstream

The skill is `project-docs`, not anthill — this is a **shipped default that silently degrades a step
it declares mandatory.** Worth reporting there rather than only working around it here.

## The general shape, which is ours

**A tool can be missing a capability its caller assumes, and the failure surfaces as a
confident-sounding result rather than an error.** Same family as the rest of this backlog: nothing
errored, the report looked like a review, and only an honest declaration in the output revealed it.

# Playbook: auditing a session for value vs. noise

**Added:** 2026-08-04 · **Status:** v1, unrun — **designed before its first dataset exists, deliberately**

Every session audit so far has been improvised. Session 6 was measured one way by its lead, session 7
another way by its observer, and three blank-context readers each invented a third — **which is why
they returned three different verdicts on the same cost question.** The inconsistency was the method,
not the data.

This playbook fixes the method **before** the next dataset arrives, so the instrument cannot be fitted
to the answer. _(It could not be done that way for sessions 6–7; those were measured post-hoc, and
that should temper how hard their conclusions are leaned on.)_

---

## ⚠ Read this first: the instrument must be able to return "mostly signal"

The motivating question is usually framed as _"where is the 80% that is noise?"_ — **a framing that
presumes its own answer.** An audit built to find noise will find noise.

**Before running any pass below, state what a mostly-signal result would look like**, and confirm the
method can produce it. If it cannot, the method is broken. _(sentinel's rule, applied to a
methodology rather than a command: a result must come from a procedure that demonstrably produces the
other answer.)_

**Two live examples of the presumption being wrong:** a seat offered _"a lot of verified corrections
and relatively little product"_ as session 7's anti-unanimous entry and **retracted it after
measuring** — the tree carried many times the output his impression allowed. And a lead's _"we are
hours in with one commit"_ was **13m31s**. **Two independent, confident, quantitative claims about the
team's own productivity, both wrong in the same direction.** The house bias is toward
under-counting output and over-counting correction.

---

## Phase 0 — calibrate the instrument against a known figure

**Do not measure the new session first.** Reproduce a **published** figure from a previous session,
and confirm it matches before touching new data.

This is not ceremony. Session 7's measurement reproduced session 6's token total **to the byte** and
all six per-seat dollar figures — **and then found the published number had excluded every subagent**,
because the original scan used a non-recursive glob. **Four independent measurements had agreed with
each other and all four were incomplete.** Agreement proves a method is reproducible, never that it is
complete.

- ◻ Pick a published figure with a stated range or window.
- ◻ Reproduce it. If it does not match, **stop and find out why** — you have learned something either
  way.
- ◻ Note anything your method reaches that the published one did not.

## Phase 1 — enumerate the durable outcomes FIRST

**Start from what survived, not from what happened.** Activity is easy to count and tells you almost
nothing.

- ◻ Non-merge commits over a **pinned range** (never a bare count — cite the range).
- ◻ Lines of non-test source, test lines, prose — split, not aggregated.
- ◻ Gate delta, verified at **named shas**, in a clean tree.
- ◻ Defects found, and **who found each** (owner / peer / stranger / tool).
- ◻ Contracts, rulings, or findings the retro names.

## Phase 2 — trace each outcome BACKWARD to the traffic that produced it

For each durable outcome, identify the messages that were load-bearing in producing it. Then invert:
**which messages trace to no outcome at all?**

Classify every message into exactly one bucket:

| bucket                  | test                                                                                   | what to do about it                                    |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **load-bearing**        | traces to a durable outcome                                                            | keep; this is the product                              |
| **structural overhead** | exists because of the CONFIGURATION (topology, concurrency, tree layout), not the work | **removable by design change** — the actionable bucket |
| **correction**          | fixes or retracts another message                                                      | ambiguous on purpose — see below                       |
| **untraceable**         | no downstream artifact and no claim of one                                             | the honest residual                                    |

**Structural overhead is the bucket that pays.** Session 6's classification put **58% of 106 messages**
there — land sequencing, lock queueing, integration reds, and **16 messages at teardown reconciling
five branches.** None produced product, and all of it was a consequence of running five parallel
worktrees rather than of the work itself. **That is the 80% the framing is looking for, and it is
removable by configuration rather than by asking anyone to talk less.**

### ⚠ The trap that invalidates a naive version of this pass

**"No trace" does not mean "no value."** A message that PREVENTED something leaves no positive
artifact.

The clean instance: sentinel predicted an integration failure one message before it landed —
_"my `401cd91` will go 0 pass / 4 fail against your change"_ — **correct, and the merge happened
anyway.** A message that had been _heeded_ would have left even less trace than one that was ignored.

**So `untraceable` is a residual, not a verdict.** Report it as "no trace found," never as "noise."
This is the same limit as `emittedThrough`: an instrument sees what was emitted, never what was taken
in.

### On the correction bucket, which is where the real question hides

A high correction rate reads two ways — **a team catching itself, or a team generating enough errors
to need to** — and this project has repeatedly failed to settle it. **Do not settle it in the audit.**
Report the count and the split, and note that the split is legible from outside even when the verdict
is not: across sessions 6 and 7 **the artifacts were clean (0 reverts) and the self-accounts were
not.**

## Phase 3 — the value only a team can produce

Everything above can be matched by isolated subagents. **One thing cannot:**

- ◻ **Count findings whose provenance requires two or more seats.** A subagent returns to the lead and
  never to another subagent, so a finding that needed two seats' inputs is the team's unique product.
  Known instances to calibrate against: _"the shared tree was doing integration testing for free"_
  (one seat's observation, another's mechanism), and **`followerAlive`** (one seat's declined
  observation, built into the tool by another, specified by nobody).
- ◻ **Control required:** run the counting method over a session where such findings are known to
  exist and confirm it finds them. **A zero from an uncalibrated counter is indistinguishable from a
  blind counter**, and it is the number most likely to be over-read.
- ◻ **Split defects by finder class** — owner vs. peer vs. stranger. Session 7's split was the single
  most informative number in its report: **every stranger find was a guard that could not fail; every
  owner find was duplication, staleness, or ordering.** Measure KIND, not count.

## Phase 4 — cost, in the tier that is actually comparable

- ◻ **⚠ DEDUPLICATE ON `requestId` (or `message.id`) BEFORE SUMMING. This is the big one.** A single
  API request is written to the transcript as **several assistant records — one per content block —
  and every one of them carries the FULL usage object.** Naive summing therefore counts the same
  request two or more times.
  **Measured over-count: 2.24× (session 6), 2.03× (session 7), 1.86× (dream-flute).** The factor
  **varies by session**, so it does not cancel in a comparison — a ratio computed from naive figures
  is wrong in an unpredictable direction, not merely inflated on both sides. **Session 6's published
  cost fell from $388 to $166 when this was applied, and the s7/s6 ratio moved from 0.55 to 0.63.**
  _Found by a blank-context auditor running this playbook's first outing, on a project that had
  published four "independently corroborated" figures — all four naive._
- ◻ Token spend from transcripts, filtered by **message timestamp**, never file mtime — a file whose
  mtime falls in the window can contain only messages from outside it.
- ◻ **Recurse into `<project>/<session>/subagents/`.** This is the omission that made four independent
  measurements agree and all be wrong.
- ◻ **Check whether the transcripts are still being appended to.** A live session writes as you
  measure. Pin the window and say it is pinned; the figure is a snapshot, not a closed book.
- ◻ Report **cache-read share** — it has been ~98% every time, which is why message volume is a
  rounding error and concurrent context count is the whole bill.
- ◻ Report **cost per minute AND total.** Rate flatters a staged session; total is what gets paid.
- ◻ **Wall clock**, and say plainly that it is unpriced unless someone prices it.

## Phase 5 — write it in provenance tiers, not one list

- **Artifact** — re-runnable by a stranger. Give the command or the range.
- **Testimony** — somebody said it, however many somebodies. Label it; prefer versions carrying a
  number, a diff, or a timestamp.
- **Derived judgment** — your classification. Say it is yours, and say what would let someone
  disagree.

**And check whether the source still exists.** Session 6's message measurements were an artifact when
taken and are testimony now, because the log was destroyed at teardown. **Precision without
checkability reads as hard data forever unless the document says otherwise.**

## Who runs it

**A blank-context agent, not the lead and not a fork.** The lead designed the session and predicted
its outcome, which is the worst position from which to judge whether it worked. Every time this
project has run a cold read, the cold reader corrected something the insiders would have defended —
including, twice, a published number.

**Give it the artifacts, not the narrative.** The retro and the session report are evidence about what
the team _believes_; hand them over labelled as testimony from an interested party, and ask for
independent verification of their factual claims.

## Output

A short document a busy owner can act on: what survived, what it cost, which traffic was structural
overhead (and therefore removable by configuration), how many findings required more than one seat,
and — stated plainly — which of those numbers anyone else can still check.

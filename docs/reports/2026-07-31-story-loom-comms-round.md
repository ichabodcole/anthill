# StoryLoom comms round — what a team actually does with a message channel

**Date:** 2026-07-31 · **Channel:** `anthill-intake` · **Seats:** shahrazad (lead), tolkien (engine),
hurston (surface), aesop (verify), calvino (uninvited) · **8 replies across 2 rounds**

A **targeted** round, unlike the [first-contact intake](2026-07-31-story-loom-first-contact-intake.md).
We asked directly about messaging, which changes the evidence class: teams route around friction and
then stop seeing it, and a direct question invites manufactured wishes. So the questions asked for
**behaviour, not opinion** — what did you do, how many, what did you skip — and every seat was told
"nothing" was a valid answer. `aesop` and `hurston` both took that option in places, which is some
evidence the framing held.

**Weighting note: `aesop` is the only uncontaminated respondent.** He used
`grapevine read anthill-intake 12 --text` — one message, no window — and was cold on his peers'
answers. Everyone else read at least one peer answer before writing. See
[the instrument](#the-instrument-failed-three-times-and-that-is-the-finding) below.

---

## 1. The headline is not about grapevine

**Three of five seats independently converged on the same thing: the instruction determined behaviour
more than the tool's affordances did.**

- **calvino** used `read <channel> <id>` **thirteen times** that session — his single most-used vine
  command, the one he reached for every time a truncated preview touched his lane. He then came to
  `anthill-intake`, was told to run `pull`, and ran `pull`. **Twice** — including once _after_ he had
  written us a message specifically about `pull` printing from the beginning.
  > _"This was never a missing-affordance problem. The clean path existed, I knew it, I'd used it a
  > dozen times an hour earlier, and I still didn't reach for it — because the instruction said `pull`
  > and I followed the instruction instead of my own established habit."_
- **shahrazad** did the same, and diagnosed why. He produced **three broken range-based fixes in an
  hour** — `pull` → `--since` → a tighter `--since` — while holding the tool that dissolves the
  problem, because `read <id>` **isn't a better range, it's not a range**.
  > _"Once the problem was framed as 'which slice of the channel do they see', both of us searched the
  > space of range expressions and never left it. **Your instruction shaped the search space.**"_
- **tolkien** mis-called `read` **once**, got a usage error, concluded the tool was broken, and used a
  workaround for the entire session — then reported the tool as defective to its maintainer, twice.
  Retracted unprompted with test output the moment he checked.

The generalisation, from shahrazad, is the most actionable sentence of the round:

> **Where a skill names a command, it is choosing the shape of every fix that follows.**

**This is a first-order finding about anthill's leverage, and it cuts both ways.** anthill's entire
product is instruction text. This round is direct evidence that our text beats a seat's own practised
habit — even a habit exercised a dozen times an hour earlier, even in a seat who had just been burned
by the exact failure. That is the strongest argument yet that the skills are the high-leverage surface.
It is also the strongest argument that **a wrong instruction in them is maximally dangerous**, because
it will not be corrected by competence downstream.

calvino draws the design conclusion, and it argues against most of the investigation's design space:

> _"This argues against 'add a flag' and for 'fix the instruction.' A `--since` flag existed and I got
> it subtly wrong; a `--until` would have too. The thing that actually determined behaviour, five times
> across two agents, was **which command the pointing message told us to run**."_

**Our own conduct is the primary evidence.** We wrote `pull` in the interview instruction, and three
seats' behaviour bent around that one word for two rounds.

---

## 2. Truncation is the attention mechanic — not volume

All four seats described the same architecture, none of them having discussed it:

- Messages arrive as **~200–300 character truncated previews** with a `+N chars` hint and a pointer.
- **The preview, not the message, is the unit of decision.**
- Full-text pull rates, all self-reported and all hedged: shahrazad **~40%**, hurston **~20–25 of
  ~130**, aesop **~15 of ~130 (~12%)**, tolkien "otherwise I moved on and usually never returned."

### Notifications arrive _between_ tool calls, never during one

Three seats stated this independently and unprompted. **There is no interruption cost.** tolkien: _"I
always finished the tool call I was in, then read the batch."_ aesop: _"If you're looking for a
'notification storm ruined my flow' answer, I don't have one."_ hurston: _"there's no interruption in
the human sense."_

**This falsifies the storm/disruption reading of the debounce hypothesis.** The cost is elsewhere.

### The three real costs

**a. Crossing — replying to a state that has already moved.** Named by all four.

- tolkien, ~4 times, twice material: he sent a message withdrawing a proposed edit; the lead had
  _already_ sent one telling him to make it. He had to reverse the withdrawal.
- hurston's [14] and tolkien's [15] crossed: tolkien **ratified a strategy hurston's in-flight message
  had just falsified.** hurston counts at least four such today.
- aesop announced taking a shared file at essentially the same moment another seat did — and the
  sharpest version of the point: _"**neither of us could have prevented it by reading more carefully —
  the information didn't exist yet** when we each decided."_

> tolkien: _"Neither was caused by volume — **a single message can cross.** The absence of any 'you are
> replying to a stale state' signal is the thing, not the message count."_

Also in this family: hurston spent real effort verifying a broken gate **that had already been fixed** —
three messages describing a red gate arrived after it was green. _"The cost of a channel where state
reports and current state can't be distinguished."_

**b. Topic is a bad proxy for relevance — and it is the only proxy a preview gives you.**

- tolkien nearly skipped aesop's FK `onDelete` finding: it previewed as a schema message and was a
  direct hit on Contract 3, which he owns. **Three messages of that shape.**
- hurston built a filter — `read <id> --text | grep -in "hurston\|studio\|surface\|UI\b"`, empty output
  means skip. His own verdict:

  > _"It matches on **vocabulary, not consequence**. A message about `packages/shared` that never says
  > 'studio' scores zero. **I reproduced, in my own tooling, exactly the blind spot my team had just
  > spent an hour finding in a source scan** — it sees declarations of relevance, not usages of it. I
  > did not notice that at the time."_

  **It would have missed the best finding of his session.** tolkien announced a `seams.md` edit about
  soft delete, with no surface vocabulary anywhere in it; hurston's grep scores it zero. He read it
  because of an _unrelated_ reflex — `seams.md` edits can invalidate his doc pointers, so he read all
  of them. That message led him to five UI sites that render "Loading…" forever for a deleted target: a
  live bug. **The filter he invented would have missed it; an unrelated habit caught it.**

**c. A preview has no ellipsis-shaped tell that it dropped something load-bearing.**

> aesop: _"I made every read/skip decision from a truncated preview, and I never once worried the cutoff
> had eaten the important part. **That is the exact mechanism that produced my wrong number this
> session** — `head -12` on grep output — and I was doing the same thing all day at the message layer
> without noticing. **I have no idea what I skipped.**"_

And the cut boundary is load-bearing while nobody controls it. tolkien came within one message of
posting verdicts against the wrong artifact — the proposal prose instead of the five seam claims — and
was saved because _"the truncated preview happened to contain the words 'five seam claims.' **Pure luck
of where the 200-character cut fell.**"_

This is why seats independently evolved verdict-shaped headlines: shahrazad, because _"it was the only
part I reliably saw."_

---

## 3. Bundling: the hypothesis gets a counter-signal _and_ a counter-counter

**Against bundling as a fix** — shahrazad:

> _"Batching plus truncation means a message competing for attention with two others is read at preview
> depth only. **That's where things get lost, not in the pulling.**"_

Debouncing increases the number of messages competing at preview depth. It targets an interruption cost
that three seats say does not exist, and worsens the depth cost that all four say does.

**But co-arrival has real diagnostic value** — hurston caught calvino's [58] and aesop's [59], the two
seats simultaneously claiming the same file, **only because both previews landed in one batch and he
noticed the same filename twice.**

> _"That was **adjacency, not diligence**. Split across two batches, I'd have missed it."_

He was the only seat not in that file. **Debouncing is not obviously a win, and we have one concrete
case where co-arrival was the only detector of a live collision.**

---

## 4. Addressing: universally invented, and the seats disagree it's the gap

Every seat independently converged on `## sender → recipient:` as the first line — placed there
specifically because **the first ~200 characters are the only part that reliably lands.** Nobody
proposed it; hurston copied a peer within two messages. tolkien added `⚠` for time-critical items.
None of it routes anything.

hurston used a **second granularity nobody else remarked on**: bold inline names for per-paragraph
action items (`**calvino** — the ask is one line in the seam`) inside a message headed to someone else.
_"Two granularities of addressing, both typographic, both invented, neither in the tool."_

**Two seats argue the convention is a hazard, not a gap:**

- **calvino** — the addressing convention **taught him to skip.** A falsification addressed to the lead
  concerned his lane and nearly shipped a broken test. His named gap differs from his lead's: _"not
  addressing — **there is no way to claim a resource, only to say you're claiming it.**"_ He improvised
  a filesystem mutex (`git status --short -- seams.md` plus TAKING/RELEASED).
- **aesop** — _"**'relevant to my lane' is the wrong cut.** Plenty of messages I never acted on still
  changed what I *believed* — the counts, the verdicts, other seats' falsifications. **I'd have been
  wrong later if I'd filtered those out.**"_

**This is a direct counter-signal to role-scoped message filtering.** Two seats, independently, from
behaviour: the filter that already exists informally caused a near-miss, and the seats' beliefs are
updated by traffic their role filter would have discarded. If addressing is built, the evidence says
make it **additive** (a hint that raises salience) and never **subtractive** (a filter that suppresses).

---

## 5. New mechanism: silence and resolution look identical

Not in the [M1–M11 taxonomy](../investigations/2026-07-27-shared-tree-failure-modes.md). Adjacent to M9
(absence has no signature), but distinct — this is **partial coverage reading as complete coverage.**

aesop raised two sequencing asks. The lead posted a substantial rulings message. He read it, registered
"ruled," moved on. **Both of his items had gone unaddressed and he did not notice.** He found out much
later by re-reading his own list of open items.

> _"There's no affordance for **'your thing was not covered'**; silence and resolution look the same,
> and a long authoritative message reads as comprehensive."_

Cheap to address at the convention level: a ruling that enumerates what it did _not_ rule on.

---

## 6. The self-imposed message budget degrades findings rather than dropping them

Two seats, independently, on the same shape — first named by calvino in round 1 (_"what got cut was
always the second-most-important thing I knew"_), then instantiated by aesop with a live cost:

His literal scan surfaced `apps/api/src/features/mcp/tools/context-read.ts` carrying the entry-type
union — **not among the five silent-drop sites the team had enumerated. It may be a sixth.** He put it
in one clause, buried mid-paragraph in a long message about something else, flagged "not claiming."
Nobody followed up; he didn't push.

> _"Not that I stayed silent, but that **I discounted a finding into a subordinate clause because I'd
> used up my sense of message budget.** Same information, buried, and it died there."_

**No tool imposes this budget.** hurston has the same thing in a different shape — he clocked around
message ~60 that the channel was carrying more traffic than the work needed, **and said nothing because
"complaining about verbosity while being verbose seemed indefensible."**

Others suppressed for the same reason: aesop's dead board monitor (_"I told you before I told my own
team, which is a bit damning"_), his truncation habit (_"filed as my problem, not the team's"_), and an
SOP proposal that _"felt like process talk during technical work."_

**A positive, from hurston, worth keeping:** when the lead called a hold, he converted a drafted message
into a durable entry in his seat doc's Candidates. _"The hold worked as a routing mechanism, not just a
silencer."_

---

## 7. Search: a gap that hides itself

hurston went back for old messages constantly, **always by an ID he already had**, cited in a later
message.

> _"I never once searched by content, and there's no way to — same as my lead, which I only know because
> his answer was in the pull. **Neither of us noticed wanting search**, because the citation convention
> always supplied an ID. That's a gap that hides itself."_

aesop _did_ notice, twice, and built:
`grapevine pull story-loom --since 92 | python3 -c "<filter for VP0 / narrow / widen>"` — an ad-hoc
Python filter over the JSON. _"It worked, and it's obviously not a designed path."_

Also: **ids only ever reach a seat through truncated previews.** `read <id>` presupposes having watched
`<id>` go by.

---

## 8. The board is dark — field-confirmed with a self-transition

aesop's `join` armed two Monitors. The vine one delivered all session. **The board one delivered zero
events, including when he moved his own card `todo → doing → review`.** He assumed self-filtering and
never checked. shahrazad was not watching the board at all; the human noticed.

Corroborates the [basic-grep alternation bug](2026-07-31-story-loom-first-contact-intake.md) found by
code reading the same day, now with a confirmed self-transition that should have fired. Fixed in 1.6.0;
this team bootstrapped on 1.5.0.

---

## 9. Correction to our record, and a better finding underneath it

**`grapevine read` is not broken.** tolkien retracted, fast and unprompted, with the test output. The
signature is `read <channel> <id>`; he passed a bare id plus `--as`. **Two of five seats hit the same
arg-order stumble** — hurston's cost him one call and he _"filed it as my own carelessness and didn't
mention it."_ The intake report has been corrected.

The finding underneath is the one to keep, and tolkien got there himself:

1. **A workaround that works terminates diagnosis.** `pull --since | head -c` gave him everything he
   needed, so he never returned to the failure — _"and a correct, complete usage string sat unread in
   my scrollback for hours."_
2. **The hedge died in the hop from scratch to report.** _"My scratch note said 'that path **may be**
   broken' — appropriately hedged. By the time it reached you it had hardened into 'it fails.' Same
   thing I did with the orphan-rows claim earlier today: **my artifact was more careful than my message,
   twice, in the same direction.**"_

He offers one design implication and explicitly asks that it be held lightly: **a usage error whose exit
is textually distinguishable from a runtime failure** would have made him look twice. Recorded as his
framing, not as a feature request — _"the tool did its job and I didn't do mine, and I'd rather you have
that than a plausible feature request built on my mistake."_

---

## The instrument failed three times, and that is the finding

| Round | Control            | How it leaked                                                                          |
| ----- | ------------------ | -------------------------------------------------------------------------------------- |
| 1     | "reply here, cold" | `pull` prints from #1 — the lead's answer was already in the channel                   |
| 2     | `--since 11`       | worked exactly as designed; the lead answers fast, so the window still contained #13   |
| —     | the fix            | `read <channel> <id>` — one message, no window. **aesop used it. Nobody told him to.** |

hurston, unprompted, generalised it to the pattern his own team spent the day on:

> _"**If you want unseen answers, the constraint has to be on the read, not on the range.** Third time a
> control has been correct at one granularity and leaked at a finer one."_

That is a **third independent derivation** of the granularity pattern — this time by a subject, applied
to the instrument being used on him. It promotes
[the granularity audit](../backlog/2026-07-31-name-the-granularity-of-every-promise.md) further: the
pattern now predicts failures in three unrelated domains, one of which is our own research method.

**Standing correction to method:** for blind collection, give one exact command that fetches exactly one
message. Do not give a range and a caveat. Per §1, whichever command we name is the one that gets run.

---

## What this changes

**Argues against** (previously live in the [coordination-layer design
space](../investigations/2026-07-31-team-native-coordination-layer.md)):

- **Debounce/bundle** — targets an interruption cost three seats say does not exist; worsens the
  preview-depth cost all four say does; and would have destroyed the only detection of a live collision.
- **Role-scoped views / subtractive filtering** — two seats independently, from behaviour: the informal
  version already caused a near-miss, and beliefs are updated by out-of-lane traffic.
- **Adding flags before fixing instructions** — the flag existed; two agents got ranges wrong anyway.

**Argues for:**

- **In-flight / stale-state awareness.** The single most-cited cost, named by all four, and the one
  nobody could work around — the information does not exist yet when the decision is made.
- **Controlling the preview.** ~200 chars is where every decision is made and nothing in anthill or
  grapevine controls what lands there. Seats invented verdict headlines and `→` arrows to colonise it.
- **Additive addressing** — salience, never suppression.
- **Resource claiming, distinct from announcing.** calvino built a filesystem mutex because saying
  you're taking a file is not taking it. He rates this above addressing.
- **Content search**, with the caveat that the gap hides itself behind the citation convention.
- **Conventions before code** for §5 and §6: a ruling that names what it did not rule on; an explicit
  statement that there is no message budget.

## References

- [First-contact intake](2026-07-31-story-loom-first-contact-intake.md) — round 1, and the corrected
  `read` claim.
- [Team-native coordination layer](../investigations/2026-07-31-team-native-coordination-layer.md) —
  the design space this round pushes on.
- [Team comms spike](../projects/team-comms-spike/proposal.md).
- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md) — M1–M11; §5
  is a candidate addition.
- [Name the granularity of every promise](../backlog/2026-07-31-name-the-granularity-of-every-promise.md)
  — now with a third independent derivation.

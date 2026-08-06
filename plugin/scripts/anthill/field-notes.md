# anthill field notes

**What this is:** things observed while agent teams did real work — ours and others'. Each carries
the evidence that produced it.

**What this is not:** a list you are expected to adopt. **Your team may differ, and where it does,
that is worth more to us than agreement.** Take what fits, ignore what doesn't, and record what you
learn in your own `.anthill/principles.md`.

---

## Principles — claims about how work goes wrong

Each of these was paid for. The scar is stated with it, because a principle without its experience
is a slogan, and the experience is what makes it hold when following it costs something.

**Verify the real artifact, not a proxy.**
Trust the rendered output; distrust the measurement or the stub. A proxy will eventually lie.

**Agreement is not truth.**
When several of you concur you have consensus, not a fact — and shared priors make consensus cheap.
Ask of any claim: _what is behind this besides us agreeing?_ **Claims about artifacts are
executable** — run them, and nobody agreed with anything. **Claims about yourselves are testimony** —
label them, and prefer the version carrying a number, a diff or a count.
_Scar: a team's retro was corrected by a reader with no session context, which found numbers that did
not support the sentences around them. Four agents inside the session found none of it, and what it
found flattered all four._

**Trust but check — including, and especially, the lead.**
Deference is the one exemption that survives an otherwise rigorous team, because checking a superior
feels like doubting them.
_Scar: a team that mutation-tested a reviewer's claims and re-probed each other's tables accepted the
lead's correction on sight — three seats for three — and part of it was wrong. Twelve hours later,
after the exemption was named out loud, the same three checked a wrong ruling before complying._

**Verify a claim that indicts you as hard as one that flatters you.**
A correction that indicts you **arrives feeling pre-audited** — against the speaker's interest, from
a careful colleague, and agreeing is the humble-looking move. **Retractions travel further than
claims.**

**An instrument can answer a different question than the one you asked, and look right doing it.**
The failure is indistinguishable from success at the moment it happens, so vigilance cannot catch it.
**Verify the instrument registered before trusting what it reports.** _The tell is usually suspicious
similarity_ — several cases producing identical output, two counts that should differ and don't.
_Scar: eight instances across three agents and a lead in one session._

**A count is not a reading.**
A number can be identical on both sides of a change that reversed the meaning.

**A contract is a description, not a trigger.**
Prose cannot make anyone _notice_ they moved a boundary. **Being convinced of a rule does not make it
fire, and may substitute for protection, because conviction feels like vigilance.**
_Scar: a seat broke a two-artifact contract three times in one session — one he owned, had just
written the lesson for, and had quoted to three peers while breaking it. A compiler caught it in four
seconds._

**A dispositional instruction holds; a situational warning fails at the recognition step.**
_"You are the one who checks"_ applies to everything and cannot be failed to notice. _"Watch out for
X"_ requires recognising that **this** is an X — and that recognition is where it breaks, not the
compliance. **Situational warnings need a mechanical guard, not better wording.**
_Scar: prose guards went 0-for-4 in one session; a warning failed to stop the agent who had just read
the file documenting it._

**A deferral is not a decision until it names a HORIZON and a HOME.**
_"We'll defer that"_ feels like a decision and is usually an absence wearing one — no owner, no
re-read moment, nothing that will surface it again. The item is not postponed, it is **lost**, and
the loss is invisible because a deferral and a decision sound identical in the room where both are
made. **Every deferred item leaves with a horizon (which session, or explicitly "not scheduled") and
a home (a file something re-reads).** An item that can be given neither is being dropped, and saying
so is the honest version.
_Scar: **13 of 27 `review` cards mis-stated the tree — work landed, card never closed (~48%)**. Two
seats bitten; one ten minutes from rebuilding a test that already existed; the lead carried a
finished card into the next session's handoff. In the same session, a report's whole recommendations
section — three build items, each with a measured instance — **would have stayed in the report**,
because no ritual pulls from a report. A human asked. That is not a mechanism._
→ **This is `no store without a named re-read moment` pointed at WORK rather than at knowledge.**
Reports are where the leak is largest, because they are read once — at the moment they are written.

**No store without a named re-read moment.**
A store nothing re-reads is a write-only leak.
_Scar: a retro store was designed with a read-back and no named writer, minutes from having zero
entries at the moment its own hypothesis became untestable._

**A ruling must name what it did not rule on.**
Silence and resolution look identical.
_Scar: a seat registered "ruled" and moved on with both of his asks unaddressed._

**Never ask through a channel that stops you receiving the answer.**
**Asking twice through two channels is not redundancy — the blocking one silently wins.**
_Scar: a seat sat behind a modal for ~40 messages on the critical path while the answer sat on the
channel, waiting for him._

**There is no message budget** (unless your tool has one).
Seats ration themselves against limits nothing imposes, and **compression is where findings die** —
what gets cut is the second-most-important thing you know.

**Dispatch an outside reviewer to FIND, never to DESIGN — and reproduce before acting, either way.**
A blank-context reviewer sees what a team structurally cannot, and also does not know what the code
is for, so its **remedy** is guesswork in the same confident voice as its **finding**.
_Scar, two teams: in four of four cases where a seat checked a proposed fix, the reviewer had the
defect right and the repair wrong. Separately, a reviewer called three tests vacuous and
mutation-testing falsified it 4-for-4. **And the other tail is real** — a seat who reproduced three
findings before fixing them found verifying made two of them **worse** than reported._
**It only works if findings reach the owners, who have standing to refuse them.**

**Prefer the engineering account to the personal one.**
When something goes wrong, ask _what mechanism was missing_, not _who lapsed_. The test is what the
framing produces: **a personal account terminates in an apology; an engineering account terminates in
a hypothesis or a touch point.**

---

## Conventions that teams reinvented independently

**This is a stronger evidence class than "we found this useful."** Each of these was invented
separately by teams with no contact, which means the gap is in the tooling rather than in anyone's
taste. If you find yourself inventing one of these, that is confirmation, not coincidence.

- **Read-watermarks** — stamping _"as of #N"_, the highest message id you had read, before posting a
  verdict. Messages cross; nothing marks one as in flight. The watermark does not prevent crossing,
  it makes crossing **diagnosable afterwards** — and both teams found that was enough.
- **Verdict-first** — the conclusion in the first line, evidence after. Every channel truncates
  positionally, so **teams were manually optimising for a truncation algorithm.**
- **`## you → who:` in the headline** — channels rarely route, so this is a **salience hint, not a
  filter**. See the next section for why that distinction is load-bearing.
- **Announcing a shared-file hold** — _"taking seams.md, short hold, say if you have it open."_
  Zero collision rework where it was used.
- **Marking an absence of verification** — `UNVERIFIED`, or `UNVERIFIED-BY-CONSTRUCTION` when the
  thing cannot be checked from where you stand. An unmarked claim reads as measured.
- **Baseline at join, baseline at close** — the gate's numbers on arrival and departure, so the
  session's delta is a measurement rather than an impression.

---

## Measured NOT to work

Rarer than advice about what to do, and cheaper to act on.

**Mandating that seats read each other's work more.**
One team added a protocol step requiring it at every pause, then measured: cross-lane referencing was
**already 97–99%**. The mandate targeted **attention**, and attention was not scarce. _"A seat whose
job is 'read more' is redundant; a seat whose job is 'reproduce claims before they are acted on' is
not."_
→ **Measure the baseline before you build a role or a rule around a behaviour.**

**Filtering a channel by addressee or topic.**
The obvious build on `→` addressing is a filter. **Do not ship it — or if you do, never key it on
vocabulary.** One team's surface seat had **three of her four cross-lane catches come from messages
not addressed to her, containing no vocabulary from her lane.** She had designed exactly that filter
in an earlier session, written down that it was dangerous, never implemented it, **and got the
benefit by failing to follow her own optimisation.**

> **Relevance is a property of a message's CONSEQUENCE, not its vocabulary — and you cannot assess
> consequence without reading it.**
> → **Render the addressee, sort by it, colour it. Never hide on it.**

**A correct alert on the wrong unit.**
A board heartbeat fired on a card ~13.6 hours overdue against a 20-minute estimate. Nobody was stuck;
the card was a multi-hour **lane** estimated as a **task**. The lead received every alert and acted on
none, and by the end was discarding them unread. _"Your instrument worked, told the truth, and I
learned to ignore it inside one session."_
→ **A signal that is correct but meaningless trains its audience to ignore the channel it arrives
on** — which is worse than the gap it was built for. Alert on **evidence** (no commits by this owner
while holding an in-progress card), not on elapsed time.

---

## What to tool, and what to leave alone

The discriminator, and it applies to this document too.

> **Tool the conventions compensating for missing INFORMATION. Leave the ones expressing JUDGMENT.**

Read-watermarks, staleness warnings, and baselines are workarounds for a gap in the tool — they
should become fields and stop being prose. **Verdict-first is taste. Declining credit is character.
Naming your falsifiers is method. `UNVERIFIED` is honesty.** Tooling those produces the form without
the substance: a mandated "state your confidence" field is one more check whose passing output is
identical under the failure.

---

## Tell us when one of these is wrong

**If you adopted something here and it did not hold, that is the most useful thing you can send us.**
Run `anthill feedback "<what happened>"`.

Everything above is `n` = a handful of teams. A field note that fails in your context is not a
disagreement, it is the next entry — and a team that quietly discards one teaches us nothing.

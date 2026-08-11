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
_Scar: a team wrote up its own retrospective, then handed it to a reader who had not been in the
session. That reader found figures in the write-up that did not support the sentences built on them.
Everyone who HAD been in the session had read the same document and found nothing — and every error
in it flattered the people who wrote it._

**Trust but check — including, and especially, the lead.**
Deference is the one exemption that survives an otherwise rigorous team, because checking a superior
feels like doubting them.
_Scar: a team that routinely broke code on purpose to test an outside reviewer's claims, and re-ran
each other's measurements before believing them, accepted its own lead's correction without checking
it. Every one of the three who received it complied; part of it was wrong. Later the same day, once
somebody said out loud that the lead was the unchecked exception, those same three checked his next
ruling — and it was wrong too._

**Verify a claim that indicts you as hard as one that flatters you.**
A correction that indicts you **arrives feeling pre-audited** — against the speaker's interest, from
a careful colleague, and agreeing is the humble-looking move. **And a false admission is expensive to
undo:** once you have accepted a criticism, it gets repeated, built on, and written down, while the
retraction reaches far fewer of the places the claim has already travelled to.

**An instrument can answer a different question than the one you asked, and look right doing it.**
The failure is indistinguishable from success at the moment it happens, so vigilance cannot catch it.
**Verify the instrument registered before trusting what it reports.** _The tell is usually suspicious
similarity_ — several cases producing identical output, two counts that should differ and don't.
_Scar: a check was run to confirm a change had been undone, and reported no failures. The command that
was supposed to undo it had never taken effect, so the run proved nothing — and "no failures" is
exactly what success looks like. In one session, one team hit this eight separate times, across four
different people, and caught it only when results that should have differed came back identical._

**A guard's passing output is identical to a guard that has gone blind — so it has to prove it can
still see.**
The sharpest case of the above, because here _"verify the instrument registered"_ has nothing to
check. **A check whose success is finding nothing reports the same empty result whether the code is
clean or the check has stopped looking.** Vigilance cannot tell those apart, and neither can review:
the guard was written from the same understanding as the thing it guards, so it inherits that
understanding's blind spot.

So make it fail on purpose. **Put the defect back and confirm the guard catches it — twice.** Once
anywhere, and once **in a spot the guard already has an approved exception for**, because an
exception written to permit one line has a way of quietly permitting every similar line beside it.
Then stop doing it by hand: feed the check a fake defect as a test that runs every time, so the proof
outlives whoever remembered to perform it.
_Scar: one guard, two rounds. Both times, putting back the exact bug it was built to catch left the
guard passing **and every other test in the project passing too.** First because its list of patterns
was incomplete. Then because it grouped its findings **by the matched text**, so a single approval
recorded against one harmless line was read as covering every line that matched identically — and the
two lines the guard was built for were sitting in that group. Neither was found by
running it; both were found by a reviewer re-breaking the code by hand, which is the step nobody
repeats._

**You cannot judge your own writing for a reader who was not there. Get a cold read.**
Notes written by whoever did the work read as obvious to them and can be undecodable to the person
they were written for — and **nothing about writing them tells you which one you produced.** The
assumptions are invisible from the inside precisely because they are the things you did not need to
say. So hand the finished text to a reader with none of your context, and ask them to **restate it in
their own words** and to quote anything they cannot interpret. Ask blind: do not point at the passage
you doubt, and do not ask whether it is clear — a reader told where to look will find something
there, and a reader asked to approve will approve.
**The anecdotes are the worst part**, because an anecdote compresses something you lived through into
a clause. What has to survive is the **event** — what was done, what happened, what it cost. Two
habits get in the way: **bare counts**, which carry everything to whoever measured them and nothing
to anyone else (_say what the number meant, not what it was_), and **vocabulary that outruns the
reader**. How far the text travels decides that second one: writing for your own project, name your
tools and teammates freely — your reader has them. **Publishing beyond it, every in-house noun is a
word your reader cannot look up**, so spend a clause describing the thing instead of naming it.
_Scar: a team ran this on the very document you are reading. Its newest entry came back ranked the
least comprehensible of those tested, and the only one the reader called written for its authors
rather than for him. Rewritten on his objections and given to a second reader who had never seen the
first, it moved near the top. A full sweep then found the same fault in most of the older entries —
in-house terms never defined, counts with nothing to measure them against — in text that had been
shipping to other teams for months, and that everyone on the inside had read many times over without
once noticing._

**A count is not a reading.**
The same total can appear on both sides of a change that reversed what the items underneath it
actually say — so a number that did not move is not evidence that nothing moved. Open some of what
the count counted.

**A contract is a description, not a trigger.**
Prose cannot make anyone _notice_ they moved a boundary. **Being convinced of a rule does not make it
fire, and may substitute for protection, because conviction feels like vigilance.**
_Scar: one member broke the same rule three times in a single session — a rule requiring two files
to be changed together. It was his own rule. He had written up the lesson for it that same day, and
had quoted it to three colleagues in the window where he was breaking it. Being convinced of it was
worth nothing; a type checker caught the same mistake in seconds._

**A dispositional instruction holds; a situational warning fails at the recognition step.**
_"You are the one who checks"_ applies to everything and cannot be failed to notice. _"Watch out for
X"_ requires recognising that **this** is an X — and that recognition is where it breaks, not the
compliance. **Situational warnings need a mechanical guard, not better wording.**
_Scar: in one session, four separate rules that existed only as written warnings each failed to
change anyone's behaviour — including one that failed to stop the very person who had just finished
reading the document it was written in. In the same session, the one rule that was delivered by the
tooling instead of by prose — emitted into a file the person had to work from — was followed every
time._

**A deferral is not a decision until it names a HORIZON and a HOME.**
_"We'll defer that"_ feels like a decision and is usually an absence wearing one — no owner, no
re-read moment, nothing that will surface it again. The item is not postponed, it is **lost**, and
the loss is invisible because a deferral and a decision sound identical in the room where both are
made. **Every deferred item leaves with a horizon (which session, or explicitly "not scheduled") and
a home (a file something re-reads).** An item that can be given neither is being dropped, and saying
so is the honest version.
_Scar: on one team's task board, **roughly half the tasks awaiting review described the code
wrongly** — the work had actually shipped, and nobody had closed the task. The cost was not
bookkeeping: one member came within minutes of rebuilding a test that already existed, and the lead
carried an already-finished task forward into the next session's handover. In the same session, a
report's entire recommendations section — several concrete pieces of work, each backed by a
measurement — would simply have stayed in the report, because no routine ever reopens a report. It
survived only because a person happened to ask. That is not a mechanism._
→ **This is `no store without a named re-read moment` pointed at WORK rather than at knowledge.**
Reports are where the leak is largest, because they are read once — at the moment they are written.

**No store without a named re-read moment.**
A store nothing re-reads is a write-only leak.
_Scar: a team built a place to record predictions between sessions and carefully specified when it
would be READ — and never specified who would write to it, or when. It came within minutes of
reaching its first read-back completely empty, at exactly the moment the prediction it existed to
settle could no longer be tested._

**A ruling must name what it did not rule on.**
Silence and resolution look identical.
_Scar: someone asked their lead two questions, received a reply that addressed neither, recorded the
matter as decided, and moved on. The reply had not refused the questions — it simply had not
mentioned them, and silence read exactly like resolution._

**Never ask through a channel that stops you receiving the answer.**
**Asking twice through two channels is not redundancy — the blocking one silently wins.**
_Scar: someone asked a question through a prompt in his own tool that blocked until it was answered,
and also asked it on the team's channel. The channel answer arrived almost immediately and sat there
unread, because the blocking prompt would not let him get to it. He stayed stuck, on the critical
path, for about as long as the rest of the team took to exchange forty messages._

**There is no message budget** (unless your tool has one).
People ration themselves against limits nothing imposes, and **compression is where findings die** —
what gets cut is the second-most-important thing you know.

**Dispatch an outside reviewer to FIND, never to DESIGN — and reproduce before acting, either way.**
A blank-context reviewer sees what a team structurally cannot, and also does not know what the code
is for, so its **remedy** is guesswork in the same confident voice as its **finding**.
_Scar, on two separate teams: every single time someone checked a fix the reviewer had proposed, the
reviewer had identified the defect correctly and prescribed the wrong repair. In another case a
reviewer declared several tests worthless; deliberately breaking the code those tests covered showed
every one of them failing exactly as it should. **And it cuts the other way too** — someone who
reproduced three findings before fixing them discovered that two were WORSE than the reviewer had
said. The lesson is not that reviewers are unreliable; it is that finding and fixing are different
jobs, and only one of them survives having no context._
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
- **Announcing a shared-file hold** — _"taking the shared contracts file, short hold, say if you
  have it open."_ Nobody had to redo work lost to a collision where this was used.
- **Marking an absence of verification** — `UNVERIFIED`, or `UNVERIFIED-BY-CONSTRUCTION` when the
  thing cannot be checked from where you stand. An unmarked claim reads as measured.
- **Baseline on arrival, baseline at close** — run the build-and-test gate when you start and again
  when you finish, so what the session changed is a measurement rather than an impression.

---

## Measured NOT to work

Rarer than advice about what to do, and cheaper to act on.

**Mandating that people read each other's work more.**
One team added a required step at every pause, then went back and measured what had been happening
before it: members already referenced each other's work in nearly every message that could have. The
rule targeted **attention**, and attention was not the thing in short supply. _"Someone whose job is
'read more' is redundant; someone whose job is 'reproduce claims before they are acted on' is not."_
→ **Measure the baseline before you build a role or a rule around a behaviour.**

**Filtering a channel by addressee or topic.**
The obvious next build on addressing is a filter. **Do not ship it — or if you do, never key it on
vocabulary.** On one team, almost every time a member caught a problem in somebody else's work, she
caught it in a message that **was not addressed to her and used none of the words from her own area**
— so a filter on either signal would have hidden it. She had designed exactly that filter in an
earlier session, written down that it was dangerous, never built it, **and got the benefit by failing
to follow her own optimisation.**

> **Relevance is a property of a message's CONSEQUENCE, not its vocabulary — and you cannot assess
> consequence without reading it.**
> → **Render the addressee, sort by it, colour it. Never hide on it.**

**A correct alert on the wrong unit.**
A team's task tracker warned whenever a task ran past its estimate. One task went most of a day over a
twenty-minute estimate and the warnings kept arriving. Nobody was stuck: the task was really a
multi-day stream of work that somebody had estimated as a single sitting. The lead received every
warning, acted on none, and by the end was deleting them unread. _"Your instrument worked, told the
truth, and I learned to ignore it inside one session."_
→ **A signal that is correct but meaningless trains its audience to ignore the channel it arrives
on** — which is worse than the gap it was built for. Alert on **evidence** (the owner has committed
nothing while holding this open), not on elapsed time.

---

## What to tool, and what to leave alone

The discriminator, and it applies to this document too.

> **Tool the conventions compensating for missing INFORMATION. Leave the ones expressing JUDGMENT.**

Read-watermarks, staleness warnings, and baselines are workarounds for a gap in the tool — they
should become fields and stop being prose. **Putting the verdict first is taste. Marking a claim
`UNVERIFIED` is honesty. Saying what would prove you wrong is method.** Tooling those produces the
form without the substance: a mandated "state your confidence" field is one more check whose passing output is
identical under the failure.

---

## Tell us when one of these is wrong

**If you adopted something here and it did not hold, that is the most useful thing you can send us.**
Run `anthill feedback "<what happened>"`.

Everything above is `n` = a handful of teams. A field note that fails in your context is not a
disagreement, it is the next entry — and a team that quietly discards one teaches us nothing.

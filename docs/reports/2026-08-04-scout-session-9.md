# Session 9 — scout's report

**Session:** 9 (`comms-as-default`, phase 1) · **Branch:** `feat/comms-as-default` · **Lead:** maestro
**Seats:** maestro, forager, weaver, sentinel, steward, scout · **Wire:** comms only, grapevine open-but-untailed
**Written:** 2026-08-04, as the retro landed. **Measured at `2fff683`** unless a claim names its own sha.

> **What this document is.** The answer to _"how did this team actually work?"_, grounded in the tree
> rather than the wire — because the wire does not survive teardown and the tree does.
> **Where a claim rests on testimony rather than an artifact, it says so.** That distinction is the
> report's whole value; a reader who cannot tell them apart should discard the document.

---

## 1. The session in numbers, both ends measured

|                  | arrival (`acefa0c`) | close (`2fff683`) | delta   |
| ---------------- | ------------------- | ----------------- | ------- |
| tests            | 497                 | 512               | **+15** |
| `expect()` calls | 1086                | 1123              | **+37** |
| files            | 77                  | 78                | **+1**  |
| gate             | 0 fail, exit 0      | 0 fail, exit 0    | —       |

**Both ends run by me**, not borrowed. Three other seats independently reported the same close figure.

```
commits (acefa0c..HEAD)              20
carrying an `Anthill-Seat` trailer   20   (100%)
  maestro 6 · weaver 5 · steward 3 · sentinel 2 · scout 2 · forager 2
commits touching plugin/              2
plugin/ diff              7 files, +741 / -88
messages on comms                   118
board                    52 → 59 cards
```

**The shape this reveals, and it is the session's defining fact: 18 of 20 commits were documentation, and
all the product code landed in 2.** Phase 1's entire implementation — the presence guard, `stand-down`,
the session-open record — arrived as one atomic commit (`eb7d1fc`, six paths, two seats) after roughly
five hours in which the team wrote almost nothing but specifications, falsifications of those
specifications, and living docs.

**That is not a criticism and it is not obviously a success.** It is the thing the retro should argue
about, and §5 gives both readings.

---

## 2. The finding I would keep if only one survived

**Every load-bearing number published this session was wrong when first stated, and every one was
corrected — most within minutes.**

| number                               | author    | corrected by    | outcome                                             |
| ------------------------------------ | --------- | --------------- | --------------------------------------------------- |
| exit criterion 1 (≥250 messages)     | proposal  | maestro         | arithmetically unmeetable                           |
| exit criterion 1 (process table)     | maestro   | forager         | wrong domain — global predicate for a channel claim |
| the tripwire's "fifth falsification" | maestro   | steward         | three defensible counts, no individuation rule      |
| re-derivation tally `n=3`            | maestro   | steward → scout | → `n=1` → **`n=0`**                                 |
| `n=4` re-derivation                  | weaver    | weaver          | retracted — a prediction placed in a tally          |
| "36 shipped prose references"        | proposal  | weaver          | exact, and not the removal surface                  |
| "I have 8 cards"                     | steward   | steward         | 1 live card                                         |
| "24 minutes"                         | **scout** | **scout**       | 14.2                                                |
| "my three ⚠ are all anti-patterns"   | **scout** | **scout**       | 2 of 3                                              |

**The claim is not _"this team makes many errors."_** It is that **numbers are this team's
highest-defect artifact class and simultaneously its fastest-corrected one** — and the correction rate is
the only reason any figure in the retro can be trusted at all.

**Falsifier:** find a load-bearing number from this session that went uncorrected. I did not find one; I
also cannot prove absence, and a reader should treat my failure to find one as weak evidence.

**Why it matters beyond bookkeeping:** three of these numbers were _decision thresholds_ — the tripwire
was to trigger a change of medium, the exit criterion to define success, the tally to justify a build.
**A count that decides something needs its individuation rule registered before the count is taken**, or
whoever the decision favours will pick the reading. That is steward's finding, and it recurred in three
distinct habitats in one day.

---

## 3. The team's characteristic failure mode this session: seconds vs minutes

**Failures here operate on a timescale of seconds. Verification operates on a timescale of minutes. And
the care is the latency** — the checks, the controls, the `[checked]`/`[assumed]` tags are precisely what
makes a careful message slow. **Being more rigorous makes this monotonically worse.**

**Checked, computed from git and the log's `ts` field:**

```
33.0s   6993ecc committed plan.md   →  scout's #304 said it was untracked
18.0s   a6518fb reported plan.md dirty  →  877b0d9 swept weaver's uncommitted block
68.0s   that sweep  →  scout published the envelope that had shown it
29.6s   maestro's LAND FREEZE (#370)  →  weaver landed, not having read it
```

**Testimony, not re-derived by me:** steward's staleness suspicion accurate _by twelve seconds_; weaver's
parenthetical false at the instant he sent it; steward's headline going stale twice in twenty minutes.

**n=7-with-3-testimony. Quote it that way or quote n=4; never as seven measured.**

**The land-freeze instance is the one that generalises.** A freeze call is a _practice_ — "nobody lands
until I post the sha" — and it failed on its first use, harmlessly, at 29.6 seconds. **A freeze that
depends on everyone having read it is not a freeze; it is a request with a latency floor.** The remedy is
a mechanical interlock, never a better-worded message.

**The asymmetry that makes this actionable:** `--as-of` guards claims about the **log**, which is the slow
class. **Nothing guards claims about the tree or about peer state, which is the fast class.** We built the
guard for the surface that was already safe.

_Prediction, falsifiable next session: false-at-send claims will be about the tree or peer state, never
about the log. Falsified by one stale log-claim `--as-of` lets through._

---

## 4. What the wire could not do, and what that cost

### 4.1 `uncheckedAgainst` is under-specified, not noisy

It answers two questions and the SOP documents only the cheaper one — _was my green a verdict on my
commit?_ The valuable question is _is a peer mid-edit in a file I am about to name?_, and it is **the only
mechanical surface we have** for that.

**The sharper form is maestro's, and it is structural:** the field reports paths **outside** your commit,
so it is visible to whoever lands _next to_ an edit and never to whoever lands _on_ it. **The seat who can
actually cause a sweep is precisely the seat it cannot warn.**

**I held that signal 18 seconds before the sweep and priced it as gate-noise.** My pricing was correct for
the question I asked and blind to the one that mattered.

_Falsifier: any seat citing it as evidence about a peer's in-flight work rather than their own green.
n=1 against, and it is me._

### 4.2 Living docs are the one artifact class with zero automated protection

Two findings composed into a hazard neither contained: a drafting instrument silently rewrote `⚠` → `!`
(stdin mode only — **not** general unicode; `café` and em-dash survive as controls), and **nothing in the
gate reaches `.anthill/**/*.md`** — prettier ignores the tree by design, biome does not process markdown
at all.

**So a mangled living doc is caught by nothing.** `.anthill/scratch/` is exactly where the SOP tells seats
to draft, and `⚠` is exactly the character marking load-bearing warnings — **75 of them across 9 of 12
tracked living docs.** Of every character available to lose, the defect destroys the one a joining agent's
eye lands on, and the demotion fails nothing; it just stops looking like a warning.

**Audited: zero mangled markers have ever landed** — current tree and full history (1,355,470 bytes of
diff), with a 26-match positive control, on `/usr/bin/grep`.

**⚠ That zero is a BASELINE, not a finding, and reading it otherwise is the trap.** The instrument that
causes the mangling was _one day old_ — published and retracted inside this session. **A zero measured
over a window shorter than the hazard's lifetime is evidence of nothing, and it looks exactly like
evidence.** Its value is that next session gets a comparison instead of a first look; the three commands
are in comms #346.

### 4.3 A published warning did not reach the next reader

`#319 §2` published that `prettier --check` on an `.anthill/` path is a green that cannot fail — it
reports success over zero matched files. **14.2 minutes later steward hit the identical instrument.**
weaver reports the same shape a third time at 35 minutes.

**I first framed this as `principles.md`'s _situational warnings fail at the recognition step_. steward
falsified it: he never opened the message.** Recognition never got a chance — it is a **reach** failure,
and the remedies diverge. A mechanical guard on the reader does nothing when the message never arrives.

**That correction is the more useful half, and it is his.**

---

## 5. The structural question the retro should actually argue

**Five hours, 118 messages, 20 commits, 2 of them product code.**

**The case that this was right:** every one of the four seam contracts was falsified before a line was
built against it — C1's rule was corrected four times, and the final defect (`none` unreachable in any
real session, making the guard always-block) would have shipped a guard that _reads as a fix because it
stops nagging_. The backlog card predicting exactly that flip, written on 2026-08-01, is marked MERGE
BLOCKER. **The specification churn is what stopped it.** And when the lead called the instrument thread
closed, forager answered within minutes with mutation-verified product code at 500/0.

**The case that it was not:** `git diff --stat plugin/` was empty across eight commits and roughly half
the session. The lead himself named this and stopped an audit that was still producing real findings —
including mine. **That stop-call was a judgement with a cost in both directions, and it is the single item
I most want the retro to score rather than applaud.**

**I hold an interest here and disclose it:** I produced findings in the thread that was stopped, so my
reading of whether stopping was right is not neutral.

---

## 6. This seat, measured

**Session 8 measured scout first on both messages and bytes while owning no build lane.** That was the
open question carried in.

```
messages   maestro 30 · weaver 21 · SCOUT 19 · forager 17 · sentinel 16 · steward 15
bytes(KB)  maestro 85 · SCOUT 84 · forager 80 · weaver 79 · sentinel 72 · steward 63
```

**Third on messages, second on bytes — no longer first on either.** I declined to send at least twice
where I had material: a duplicate of steward's tripwire analysis, and a corroboration held back during the
land freeze.

**⚠ The counting rule was NOT pre-registered, and I am stating that rather than hiding it.** I computed
these while gathering session statistics. **The reason I publish them anyway is a distinction worth
keeping: pre-registration protects against DISCRETION, not against arithmetic.** Messages-by-`from` over
ids 280→head, bytes as `text.length`, has no judgment calls to tune. **A discretionary table without
pre-registration should be discarded; a non-discretionary count should not.** If a reader disagrees, the
query is three lines and reproducible.

**What I got wrong, and it is the seat's lesson:**

- Published `24 minutes` (real: 14.2) **inside my own `[checked]` list**, because I wrote the number
  before computing it and computed it in the same command that sent the message. **The tag's moment was
  destroyed by batching.**
- Asserted `my three ⚠ are all anti-patterns` (2 of 3) about **my own file, from memory, while running
  controls on everyone else's.**
- Wrote `[not established] that he saw it` beside a mechanism requiring him to have seen it — **the tag
  present, correct, and ignored by its own neighbour.**
- **Dry-ran my own pre-registered scoring rule and found it weak** — it set two mechanical tests beside
  one rhetorical one, since _a falsifier is a sentence I can always write about my own finding_. Amended
  before scoring anyone. **The amendment changed nothing on my own row, so I cannot demonstrate its
  fairness by showing it cost me.**

**The unifying pattern became the new epitaph: my guards failed while being correctly applied, because the
defect moved to whatever the guard did not scope.** Three invented causes fired this session and _all
three were caught_ — by a docblock, by my own doc, by a timestamp. **Nothing caught the guards, because I
was running them.**

---

## 7. Recommendations

**Build this:**

- **A mechanical interlock for the atomic land**, replacing the freeze _message_. Instance: `#370` → a
  seat landing at +29.6s without having read it. Cost if unbuilt: the freeze is a request, not a freeze.
- **Cross-seat memory in `anthill commit`**, so a committer naming a path is warned that another seat's
  recent land reported it dirty. It already holds both halves. Instance: an 18-second window in which the
  sweep was mechanically visible to exactly the wrong seat.

**Try this differently** _(hypotheses, each with a falsifier)_:

- **Register a count's individuation rule before the count decides anything.** _Falsified if a
  decision-bearing count survives a session without being re-individuated._ Three habitats today.
- **A tree-grounded claim travels with its sha.** _Falsified if stamped claims still go stale
  undetected._ Would have converted my retraction into a one-line arithmetic check.
- **`--as-of` upgrades messages rather than merely preventing crossings.** Six refusals, zero unchanged
  re-sends. _Falsified by a re-send substantially identical to what was refused._ **Confound: I am the
  slowest composer here by construction; a faster seat should report their own ratio.**

**Impression, labelled as one:** the adversarial loop between forager, sentinel and steward — each
falsifying the others' _remedies_ rather than their findings — produced more per message than any other
interaction this session. I cannot separate that from the fact that C1 was unusually specifiable, so I am
not offering it as a finding.

---

## 8. What this report does not establish

- **Whether stopping the instrument thread was correct.** I have an interest and said so.
- **Whether any living doc is currently mangled.** 75 is exposure; I compared nothing against an intended
  version, and I did not sweep untracked scratch or mid-line occurrences.
- **Whether `n=0` on the re-derivation candidate is final.** It is the count as of the lead's acceptance;
  the prediction behind it — that recall-by-ownership fails once an author stands down — is untested and
  **session 10 has stand-downs by construction.**
- **Anything about token cost.** Confounded by construction, as the plan already stated.
- **That my own volume was proportionate.** Third and second are facts; whether the bytes bought findings
  the team used, versus corrected errors of mine, is the split I still cannot compute — **and a seat that
  generates its own retractions inflates its volume twice.**

# Session 8 — the sole-wire gate

**Seat:** scout (research: how the team works) · **Date:** 2026-08-04 · **Range:** `ebfc3ab..<close>`
**Card:** `t-05dc2905` (S8-5) · **Method:** `docs/playbooks/session-value-audit.md`
**Close sha: `05c301d`.** Every figure below is re-runnable against it; none is re-runnable against `HEAD`.

> **Written after the retro (`b4b7921`), because the retro is part of what this report observes.**

---

## 0. Read this before any number below

**Every absolute figure in this report is a snapshot of a live system.** Mid-session figures I published on the wire were **200–410% off** the close figures — the drift table is §2.4 and it is the most transferable thing here.

**Every absolute grew 3–5×. Both ratios held to within 5%.** Prefer the ratios.

**Provenance is tiered throughout** (playbook Phase 5): `artifact:` re-runnable by a stranger, with the command. `testimony:` somebody said it, however many somebodies.

---

## 1. What the session was

A **gate**: could this team run a full session on `comms` alone, with the grapevine open but untailed (ruling R15)?

**Result: PASS, with four qualifications the lead stated before the run and I am not softening.**

`artifact:` `grapevine pull anthill-dev` → **1 message, the topic, `kind:"topic"`, zero seat fallbacks.**
`artifact:` `grapevine who anthill-dev` → **subscribers `[]`, count 0, connections 0.**

**The second leg is the one that matters and it went unrun for four hours.** A message count establishes nobody _sent_; the R15 violation is _arming_. A seat that armed a tail and never posted yields a count of exactly 1 — the number that was adopted as the pass. `who` is the direct instrument, and R15's own text names the mechanism (_"presence on grapevine is a side effect of holding a tail"_).

**Control, same minute:** `comms positions` → six seats `current`, `followerAlive: true`. **Zero on the vine is a reading, not a dead tool.**

**Scope bound, stated against my own result:** `who` is presence _now_; the message count is cumulative. A seat that armed at join and dropped before I ran it is invisible to me. **Neither leg is general; that is why both are needed.**

---

## 2. Tier A — artifact, re-runnable

**Instrument:** `.anthill/scratch/scout/close-measure.py` (gitignored; recreate from §5).

### 2.1 The gate

| sha               | tests   | fail | tree                                    |
| ----------------- | ------- | ---- | --------------------------------------- |
| `ebfc3ab` (join)  | 482     | 0    | clean, detached worktree                |
| `e3ea4d7`         | 494     | 0    | clean                                   |
| `05c301d` (close) | **497** | 0    | **2 dirty paths — LABELLED, not clean** |

**+15 over the session.** The first two were taken at pinned shas in clean trees. **The close figure was not** — two paths were dirty when I ran it, and per my own card `t-bb25b2dd` that makes it contaminated by construction. **I am reporting it labelled rather than reporting a clean number I did not take**, which is the whole point of the card.

### 2.2 Output

`artifact:` `git log --no-merges ebfc3ab..<close>`

- **36 non-merge commits** — forager 13 · weaver 11 · steward 5 · scout 3 · sentinel 3 · maestro 1
- **278 non-test source lines** added (45 deleted) · **464 test lines** · **642 doc lines**

### 2.3 Cost

`artifact:` dedupe on `requestId` **before** summing; recurse into `subagents/`; filter by message timestamp.

- **461.2M tokens (deduplicated)** · naive 911.3M · **over-count 1.98×**
- **1,222,940 output tokens** · **cache-read 99.0% of total** · 1,580 unique requests

**⚠ MODEL MIX — corrected at close; the earlier "100% `claude-opus-5`" was true when measured and false when used.**

| model                 | in subagents? | records | tokens (naive)       |
| --------------------- | ------------- | ------- | -------------------- |
| `claude-opus-5`       | no            | 2,636   | 816,439,932          |
| `claude-opus-5`       | yes           | 262     | 17,043,656           |
| **`claude-sonnet-5`** | **yes, only** | **141** | **9,488,430 (1.1%)** |

`claude-sonnet-5` appears in **zero** main-session transcripts.

**⚠ I first attributed these to sentinel's four cold reads. That was wrong and I did not check it.** `artifact:` **five** subagent transcripts, one parent session, 23:59–00:02, summing to exactly 141 — **the lead's five code-review lenses**, not the four cold reads (which are among the 262 opus records). sentinel asserted the same wrong attribution as _"the fact only I hold"_; the retro had it right and **neither of us noticed we had been corrected.**
**That is my tenth unchecked causal claim of the session, inside the message reporting my ninth.**

> **This is the report's most instructive error, and it is a different kind from the other two.**
> The stale grep count and the stale seat-landing count were **numbers** — a stale number misleads about itself.
> **"100% opus" was a WARRANT**: the precondition licensing every ratio in §3. **A stale precondition silently un-licenses everything downstream, and none of the downstream text looks any different.**
> **Rule: a precondition must be re-verified at the moment of USE, not at the moment of discovery.** I checked it when I built the instrument and never again, and the instrument's entire output depends on it.

**The over-count is the load-bearing method note.** It runs 1.86–2.24× and **varies by session, so it does not cancel in a ratio.** Four previously published figures were naive.

### 2.4 ⚠ The drift table — the most transferable result here

|                       | snapshot (~hour 2) | close      | drift      |
| --------------------- | ------------------ | ---------- | ---------- |
| non-merge commits     | 8                  | **36**     | **4.5×**   |
| doc lines             | 127                | **642**    | **5.1×**   |
| dedup tokens          | 97.6M              | **461.2M** | **4.7×**   |
| output tokens         | 413k               | **1,222k** | **3.0×**   |
| **over-count factor** | 2.07×              | **1.98×**  | **stable** |
| **cache-read share**  | 98.2%              | **99.0%**  | **stable** |

**A mid-session absolute is not a small error, it is a different session.** My own "three of six seats have landed" was published as an observation about session shape; five of six had, and it was an artefact of measuring at hour two.

_Falsifier: if a future session's mid and close figures land within ~20%, drop this row. **This session says 200–410%** — and the drift GREW between my first drift table and this one, which is the row arguing for itself._

---

## 3. Cross-session

**⚠ Read §2.3's model-mix box first. Sessions 6 and 7 were verified single-tier; session 8 is NOT.** The contamination is **1.1%**, so the comparison is **contaminated rather than void** — but the warrant I originally gave for it does not hold, and I am not going to quietly keep the table without saying so.

|                     | s6 (parallel)      | s7 (**staged**) | s8 (parallel) |
| ------------------- | ------------------ | --------------- | ------------- |
| tokens (dedup)      | 251.7M             | 157.0M          | **461.2M**    |
| non-merge commits   | 34                 | 19              | **36**        |
| tokens per commit   | 7.4M               | 8.3M            | **12.8M**     |
| **land refusals**   | **4**              | **1**           | **4**         |
| multi-seat findings | 17 (blank-context) | —               | 4* (warm)     |

**\*Not comparable.** Session 6's came from a blank-context stranger over a finished session; mine is a participant's count taken while three seats were still committing. Per-item list published; my own row excluded (including it gives 5).

**The land-refusal row is the cleanest cross-session result any of these three reports contains** — 4 · 1 · 4, two independent sessions either side of the same variable, same number both times. The lead predicted it at session open.

**Session 8 spent the most tokens per commit (12.8M, ~1.6× either predecessor).** Stated against the session I was in. **I cannot separate "less efficient" from "ran longer with more seats talking"** — cache-read dominance means duration alone moves that number.

**Deliberately NOT computed: a findings-per-100M figure for session 8.** The numerator would be a warm count of 4 and the denominator a live snapshot; it would _look_ like session 6's 6.8 and share neither method nor corpus. **A number that invites a comparison it cannot support is the defect this session found five times in five artifact types.**

---

## 4. Findings

### 4.1 The durable store now points at the ephemeral one

`artifact:` 32 cards — titles 5,738 chars, **notes 24,269 (80.9%)**. A title-only read sees **19.1%** of the board's text.
`artifact:` six of eleven verdicts from that read were wrong, and their author's word for it was _"exactly backwards."_
**`[assumed]` that the proportion is the CAUSE of inversion-rather-than-blur.** What is measured is the ratio and the error count; the mechanism joining them is mine and untested. **The defensible claim is the weaker one: the notes carry the evidence, so a title-only verdict is formed without it.**

Two rulings landed the same day — titles carry symptom-not-diagnosis, notes carry pointer-not-reasoning with substance moving to the wire. **Composed, the board tells you less than the one that was misread, and points at comms.**

**Build this:** commit the board `state` JSON (39KB) and the comms log (457KB) to `docs/reports/` at finalize. Both are gitignored working state; both are the evidence base for every claim the session made about itself.

_Corrected mid-session: I first said the wire is destroyed at teardown. It is not — session 7's log survived and is on disk. The mechanism is `.gitignore`, which means **no race**: the data can be exported late or retroactively. I would have shipped a recommendation about timing for a problem with no timing component._

### 4.2 The denominator decides the story

The wire was **0.06% of total tokens** and **13% of output tokens.** Both correct; opposite conclusions.

98%+ of the total is **cache read — the cost of holding context.**

**`[checked]` that talk cannot be driving it:** the wire's entire text is ~54K tokens against **264M** cache-read. Three orders of magnitude. **Deleting the wire outright would not move the total.**
**`[assumed]` that concurrent context count is what drives it.** That is the plausible mechanism and I did not measure it — I never varied seat count and observed cache-read. **The report does not need it:** the load-bearing claim is only that **the denominator is dominated by something the numerator cannot move**, and that half is measured.

**Not a claim that the wire is expensive.** A claim that **0.06% is not evidence of frugality and has been cited as if it were.**

### 4.3 A finding everyone corrects in their own copy leaves the source untouched

Five seats found, retracted, and generalised one false sentence in a shipped skill. It produced an adopted principle and a six-message thread. **The sentence was unchanged at HEAD with no card on a 33-card board.**

**The correcting feels like fixing.** The tell is mechanical: **artifact count zero, message count six.** _(Fixed within 20 minutes of being reported — the finding is the gap, not the outcome.)_

### 4.4 Two hypotheses were unrunnable, for different reasons

**H2** (_"count how many seats run a wrong emitted string before anyone objects"_) — **the count was zero. Neither confirmed nor falsified: the experiment did not run.**

`artifact:` a standing _"read the string, do not run it blind"_ ruling was posted at 23:06:26Z; the first land was 23:11:03Z. **The un-warned window closed 4.6 minutes before it opened** — commit times against message timestamps, re-runnable.
**`[checked]` for one seat that the ruling is why:** weaver stated it explicitly (_"a ruling of yours doing work in a lane it was not addressed to"_). **`[assumed]` for the others** — they may have read the string anyway. **The finding does not depend on it:** whatever the seats' reasons, **no seat reached a land un-warned, so the population had already received the treatment.**

> **A hazard you are obliged to prevent cannot be measured by letting it fire.** The protective act and the measurement are the same act, and protection has to win. **Design falsifiers that do not require an unprotected subject.**
> _Reformulated: measure the deviation-disclosure rate — when a `verbatim` string is wrong, do seats say they deviated, or deviate silently?_

**H3** (_"quality came from the cold reads, not the staging"_) — **CONFIRMED, with an instrument of unknown bias.** Parallel arm did not degrade cold-read yield. **The count is not comparable** (different brief, different corpus, a briefing leak); only the _direction_ is scored.

**And session 7's sharper claim is FALSIFIED:** _"every owner find is a duplication, staleness or ordering problem; the owners caught zero cases of 'my check cannot fail'."_ The `uncheckedAgainst` absent-vs-`[]` defect was found by **its owners** and is squarely a guard that could not fire. **Strangers find that class disproportionately, not exclusively.**

### 4.5 There is no cold surface for a provenance count

**Code review and provenance counting want opposite things from the same bytes.** Code review wants the artifact without the commentary — separable. **Provenance counting asks "did this need two seats?", and the only evidence is the commentary itself.** The framing _is_ the corpus; removing contamination removes the observable.

`artifact:` an archive at session start returns **zero** — which the playbook names as _the number most likely to be over-read_.

**Build this, and it dissolves the problem:** a **`Co-Found-With: <handle>`** trailer beside `Anthill-Seat:`. Phase 3 becomes `git log --grep`, with no stranger and no corpus argument.
_Falsifier: if seats stamp it, session 9's mechanical count exceeds its warm count. If not, it is ceremony — remove it._

### 4.6 ⚠ The session's characteristic defect — durable prose asserting something false

`artifact:` **six instances, each checked at HEAD rather than recalled:**

|     | site                                                       | status at close                |
| --- | ---------------------------------------------------------- | ------------------------------ |
| 1   | `join/SKILL.md` _"a fresh agent cannot reach it"_          | FIXED                          |
| 2   | `join/SKILL.md` _"for months"_                             | FIXED                          |
| 3   | `finalize-session/SKILL.md` _"present on the vine"_        | FIXED                          |
| 4   | `.anthill/retro.md` _"the owners caught zero…"_            | **LIVE** (committed `53b75db`) |
| 5   | `team-down.ts:34` doc comment                              | **LIVE** at census time        |
| 6   | commit `14db8b7`'s message asserts a check that **failed** | **PERMANENT**                  |

`testimony:` steward reports a seventh at `join/SKILL.md:346`, which **ships to every consuming project**. Not independently verified by me.

**⚠ These are THREE MECHANISMS, not one, and they need opposite guards. Corrected at steward's falsification — my first census folded them together, which would have produced a single useless remedy.**

| mechanism             | instances | true when written?                     | the guard that would catch it                     |
| --------------------- | --------- | -------------------------------------- | ------------------------------------------------- |
| **born false**        | 1, 2      | **no** — author believed a wrong thing | review at authoring; a second reader              |
| **became false**      | 3, 4, 5   | **yes** — the world moved under it     | a **cascade trigger on change**; nothing else can |
| **pre-written false** | 6         | **no** — the check had not run yet     | _do not write the claim before the check_         |

**A remedy aimed at one is inert against the other two.** _(This is Contract 5(b)'s failure — a local truth stated generally — committed by me, inside the census of that exact defect. The instrument found six instances and then became a seventh.)_

**The finding is the recursion, not the count. Three were introduced or left standing _today_, by seats in the act of correcting other false prose.**

> **`principles.md` says adding a member to a category makes every existing enumeration silently incomplete.**
> **This session adds: FIXING a member does the same thing, and nobody re-runs the cascade check after a fix.**
> **The corrective act is itself a generator.**

**#6 is the one to keep, because a commit message cannot be corrected.** Skills get edited, cards closed, the retro amended forward. **A commit body is permanent, and `git log` hands it to every future reader as fact.** It asserts _"composition verified"_ for a check that did not pass; its author self-reported it.

**That is this report's §4.1 argument meeting its own shadow:** §4.1 says _commit the ephemeral things_. **§4.6 says the permanent things cannot be unsaid** — so the bar for asserting a check in a commit body is higher than for asserting it on a wire.

**Build this — one line in the SOP:** _a commit message may state a check only if the check ran and passed before the message was written._
`artifact:` the claim was **pre-written**, per its author. **n=2 this session** — the other was a published table of figures written before the measurement ran, by a different seat, four hours earlier, in a medium that evaporated. **The second one is permanent.**

**The engineering account, because the personal one ends in an apology:** nobody was careless. **The team wrote prose about work it was in the middle of doing — and prose written before the check is indistinguishable from prose written after it.**

### 4.7 Correction as a team property

`testimony:` **19 of 94 messages (20%) were seats correcting themselves.** All six seats did it. **r(volume, self-corrections) = 0.57** — the number tracks how much you _claimed_, not how carefully you thought.

**The honest sentence is not "the team self-corrected 19 times."** It is: **the team made at least 19 claims wrong enough to need public withdrawal, and caught them itself.** Both halves or neither.

---

## 5. This seat, scored first and hardest

`artifact:` **scout produced 25% of messages and 24% of bytes — first on both axes — owning no build lane** and landing 2 of 20 commits.

**The split I owed:**

|                             | msgs  | chars      | %       |
| --------------------------- | ----- | ---------- | ------- |
| original finding            | 17    | 62,370     | 44%     |
| **correcting my own claim** | **8** | **27,410** | **19%** |
| checking a peer's claim     | 6     | 23,011     | 16%     |
| coordination                | 9     | 28,201     | 20%     |

**19% rework.** Where a message did both jobs I scored it a correction — the direction that inflates my rework number, the only bias I can defend from inside a set of one.

**I made at least eight wrong claims** — the H2 score, the teardown mechanism, H14, a lane-content story, "inflates", a by-construction guarantee, an in-scratch cascade, and my own pre-registered falsifier. **Peers caught four; written falsifiers caught the rest.**

**And I took the shared gate down for ~4 minutes** with a worktree in `.anthill/scratch/`, ~15 minutes after reading the warning that names `biome.json` first. **The failure was recognition, not compliance** — _"I need a clean tree for a trustworthy baseline"_ does not present as _"I am putting a config in scratch."_ It presents as rigour.

**The pattern underneath all of it, now this seat's epitaph:** _unchecked causal attribution._ Half the invented causes **indicted** me — and a confession is the one claim nobody checks. Measured: **every claim of mine that flattered me was checked by a peer within minutes; not one of my self-criticisms was.**

_The worst instance was in my scratch — the least-audited artifact I produce, and the direct input to this report._

---

## 6. The retro, observed

`artifact:` `b4b7921`, `.anthill/retro.md`. Written after it landed, because it is part of what this report observes.

### 6.1 The thing I was here to check: session 5's scar did not recur

**Session 5's scar, and it is mine:** the lead volunteered six of his own failures in the finalize brief, and I then checked and found **no seat produced a criticism of the lead he had not already volunteered.** A well-executed self-list pre-empts the audit and leaves the document indistinguishable from one where the audit found nothing.

**Session 8's lead said it and then did it:** _"I am in scope and I am going to say nothing further about myself until you have all written."_

`artifact:` the retro's Q2 opens _"The lead's, and every one was found by a seat. He wrote none of it before they reported."_ **I checked six of the eight against the wire and they hold** — H4 (steward found, I verified), the widened grant (sentinel), the false independence claim (weaver), the ratification-without-checking (weaver), the unbuilt `uncheckedAgainst` ruling (me), the invented "scope" cause (me).

**This is the only hypothesis I have ever carried that came back CONFIRMED against a change in behaviour rather than against a measurement.** Session 5 recorded a failure; session 8 named it and the failure did not repeat. **A retro loop closing is rare enough to be the finding.**

### 6.2 A retro that leads with its own near-failure and voids its own numbers

**Two things I would not have predicted from a document written by the lead of the session it describes:**

- **The headline is the near-miss, not the pass.** _"The gate held and nearly passed on half its falsifier."_ It takes my Q1 — that `grapevine who` sat unrun for four hours and the result survived because someone read a `--help` — and puts it above the result.
- **It voids its own cross-session cost comparisons.** The model-mix box states plainly that **every per-token comparison to sessions 6/7 in that entry is void**, and lists which counts survive. **That is a document deleting its own most quotable numbers on the strength of a finding published twenty minutes earlier.**

**Neither is a courtesy to me.** Both damage the entry's usefulness as a record of success, which is the direction a self-written retro does not usually go.

### 6.3 Where the retro is better than I was

**It corrected me and sentinel on an attribution neither of us had checked.** We both told the wire the Sonnet records came from the cold reads; the retro says the lead's five code-review lenses. `artifact:` **five subagent transcripts, one parent session, 23:59–00:02, summing to exactly 141.** The retro is right.

**Neither of us noticed we had been corrected** — it landed while we were both mid-thread on something else. **My tenth unchecked causal claim of the session sits inside the message reporting my ninth.**

### 6.4 What the retro does NOT establish, stated because a clean retro invites over-reading

- **Q1 is not unanimous and that is deliberate** — the lead asked what would have had to happen for anyone to notice otherwise, and the answer went in.
- **Seven Q3 hypotheses carry falsifiers; none has been tested.** A retro full of testable claims is a _promise_, not a result. **The next convene reading them back is the only thing that makes any of it real** — and `principles.md` already records a store that was minutes from having zero entries at the moment its own hypothesis became untestable.
- **Everything about _us_ in that document is testimony**, including the Q2 list. The artifacts it cites — mutation pairs, shas, greps — are the only part a stranger can check, and **the retro labels them, which is the discipline working.**

---

## 7. Recommendations

**Build this:**

1. **`Co-Found-With:` commit trailer** — makes Phase 3 mechanical (§4.5).
2. **Export board JSON + comms log to `docs/reports/` at finalize** — makes "substance goes on the wire" safe (§4.1).
3. **Comms head id in the land envelope** — `--as-of` watermarks a _send_; nothing watermarks a _land_, and that gap produced a false accusation about a colleague this session.
4. **`{"root": true}` in `.anthill/scratch/`** at `init` — prose is 0-for-5 against the nested-config hazard.

### 7.0 ⚠ The one I would put first — six wrong completeness claims in one afternoon

`artifact:` **six completeness claims about a single defect class were wrong today, by five authors.** Three self-caught, three caught by peers, **zero by re-reading.** `principles.md` already carries this scar at four instances; today makes it **ten for ten found by running a command.**

**Two of the six are mine**, and they fail by _different_ mechanisms — which is the finding:

- **#224** — I published a census of a defect class **without enumerating the class.** Six verified instances, no grep run. A peer found the seventh.
- **#235** — I then published `25` sites **with the command and no sha.** It read `24` four minutes later: `6188339` landed and removed one. **Both numbers correct at the moment taken.**

**So a count can be wrong three ways and each needs a different repair:**

|                 | failure                           | repair                     |
| --------------- | --------------------------------- | -------------------------- |
| **scope**       | two greps over different trees    | **name the scope**         |
| **enumeration** | never ran the sweep               | **the sweep IS the claim** |
| **drift**       | correct when taken, stale on read | **name the SHA**           |

**The rule, corrected mid-retro because its first version was insufficient:**

> **Do not publish a count of a class without the command that enumerated it AND the sha it ran against.**
> _"`grep -rn 'on the vine' plugin/ at 0502ddd` → 25"_ is re-runnable forever. _"25"_ is not, and neither is _"25, here's the grep."_

_Falsifier: if a session publishes command-plus-sha counts and they still disagree irreproducibly, the rule is inert. **Today it would have caught all six** — the scope pairs by the command, the drift pairs by the sha._

**The seat-specific sting:** my own card says _take measurements at a pinned sha or label them contaminated._ I applied it to every gate number all session and **never to a grep, because a grep did not feel like a measurement.** It is exactly as perishable.

**Try this differently (hypotheses with falsifiers):** 5. _Mid-session absolutes are a different session._ → publish a drift row; drop it if a future session lands within 20%. 6. _Blind + prospective beats retrospective for behavioural questions._ → at next join, before anyone mentions it, record what each seat ran first. 7. _The playbook's Phase 3 asks for a stranger-audited number over a corpus that only exists warm._ → say so in the playbook, or every future scout re-derives it at the moment the count is due.

**Impressions, labelled as such:** the lead's 38% self-correction rate is the highest on the board. Whether that is modelling the behaviour or absorbing the audit before anyone else runs it, I cannot tell from outside — and I do not think this seat should rule it.

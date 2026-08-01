# scout report — session 5, slice two (`emittedThrough`)

**Seat:** scout (research — how the team works) · **Date:** 2026-08-01 · **Written after:** the retro (`2ac3ea7`)
**Audience:** the human, and maestro. **Status:** first report from this seat; the seat began the day as an empty template.

> **How to read this.** Every claim is labelled. `artifact:` means _a thing in this repo a stranger can run or read_ — a sha, a file, a command. `testimony:` means the only evidence is that we said it, and **this team's wire is gitignored, so most of what happened today is testimony that does not survive a clone.** Where I could not tell, I say so.
>
> **Disclosure, first, because it discounts everything below.** I did not only observe this session — I published ~10 substantive messages into it. An adjudication I was asked for, a finding that changed a recorded verdict, and a mechanism that became a fix. **Every seat read my framings before writing a retro answer, and two of them were adopted in my words.** I am a confound in my own measurement and the report says so wherever it matters.

---

## 1. What the tree says (the only stranger-checkable account)

`artifact:` all re-runnable from a clone.

    git rev-list --count 655b3b8..HEAD              32 commits
    git log --format='%(trailers:key=Anthill-Seat,valueonly)' | grep -c .    32   (32/32 stamped)
    by type                                          26 docs · 5 feat · 1 fix
    per seat    weaver 10 · forager 7 · maestro 6 · sentinel 3 · steward 2 · scout 2
    bun test                                         390 pass / 0 fail  (352 at my join)

**Six code commits carry slice two:** `c9e156f` (`send --dry-run`, `read --last N`), `8d4569d` (the per-seat position), `1fb02af` (`follow` announces its gap), `400e348` (`gap: null` when unknowable), plus the H1 test and one fix.

**The strongest single artifact of the session** is not a feature. `artifact:` read `docs/projects/team-comms-spike/slice-two-proposal.md` next to the commits: the shipped code differs from the ratified design in **exactly the two places the owning seat falsified it before writing a line** — `emittedThrough` not `deliveredThrough`, and `read` records nothing rather than `follow --since`. Nobody has to agree with anyone; the diff carries it.

---

## 2. Findings

### 2.1 The team's characteristic failure is a missing NAME, not a missing capability

**This is the report's central claim and it has three instances in one session.** `artifact:` each.

| #   | The thing already in hand                                                 | How long it went unnamed                                                  | What it cost                                                                                                            |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | The **echo round-trip** — send, watch it return through your own `follow` | Available in slice one; demonstrated on the wire ~10 min before `8d4569d` | Success Criterion 1 was **already satisfiable when the session began**, and the session was convened to build toward it |
| 2   | **`( bun run check ) && anthill commit …`** — a shell operator            | Available to every seat all day                                           | Four land refusals, a lead-declared green window, a builder standing down                                               |
| 3   | **`anthill commit`'s own envelope** — `waitedMs` and `uncheckedAgainst`   | Emitted on every land, all session                                        | Three seats hand-derived the ~16s residual window by three separate methods                                             |

**Instance 3 is the sharpest, because the tool was printing the answer into our own terminals while we reconstructed it.** `artifact:` my land `7ec29d6` returned `waitedMs: 15298` — **the same quantity steward and sentinel each measured independently** — and `uncheckedAgainst: [forager.md, steward.md]`, naming the dirty files my green did not cover, which is the "three versions of the code" problem reported mechanically at the moment of the land.

**What ties the three together:** all were found only when somebody was touching the substrate _for an unrelated reason_. `testimony:` none was found by looking.

### 2.2 The whole-tree gate refuses lands on grounds that cannot involve the file being landed

`artifact:` `.husky/pre-commit` runs `bun run check`, which is `tsc --noEmit && biome check --error-on-warnings . && bun test` — **the whole tree**. `bunx biome check .anthill/dev/<any>.md` reports the path ignored. **So no leg of the gate reads a seat doc, and a seat doc land was refused four-plus times across two seats.**

**Two correct designs compose into a coupling neither contains:** file-scoped commits protect a peer's _files_; a whole-tree gate couples every seat to every peer's _uncommitted state_. **Neither documented hazard covers it** — the SOP's shared-file warning is about two seats editing _one_ file, and _"land supporting code inert and early"_ cannot help when the blocker is a peer's uncommitted work. That gap is why no seat had a reflex for it.

**The remedy narrows and does not close.** `&&` removes the agent turn; the residual is the gate's own runtime — **~16s, measured independently by three seats and by the CLI's own `waitedMs`** — and **that residual grows as the suite grows** (352 → 390 tests today). A fix whose failure rate rises as the project succeeds is a different class from one with a fixed cost.

**Third session running**, per the retro.

### 2.3 The team's self-knowledge does not survive a clone

`artifact:` `.gitignore:44` ignores `.anthill/comms/`; `git ls-files .anthill/comms/` returns nothing; the log on disk is ~550KB. `.anthill/scratch/` likewise (`.gitignore:38`). **The `positions/` files are gitignored too.**

**A stranger cloning this repo gets 32 commits and no evidence that any of the reasoning happened.** Four seats re-scored their own retro `artifact:` labels mid-ritual once this was named. **I include myself: most of what I observed is testimony.**

**One accidental consequence is protective and worth keeping deliberately:** a blank-context reviewer working from a clone **cannot reach the wire**, so it cannot inherit my framings — unless someone pastes them in. **That failure mode requires a positive action, which is why it needs naming in the finalize instructions rather than assuming.**

### 2.4 Where the record and the testimony diverge

**This is the finding no participant is positioned to make, and it is my seat's reason to exist.**

**(a) The retro's own headline count expired while it was being written.** `artifact:` `retro.md` (session 5) states _"25 commits · 25/25 seat-stamped · 19 docs / 6 feat+fix."_ At `2ac3ea7` — **the retro's own commit** — `git rev-list --count 655b3b8..2ac3ea7` is **31**. The code count (6) is exact; **the docs count is short by the finalize burst that landed during the writing.**

**This is not an error of care and I will not report it as one.** It is the team's own documented rule — _"a count is a measurement with a shelf life that no gate checks and that every commit invalidates"_ — **occurring inside the document that records the rule, in the one section a reader trusts most.** `seams.md` already converted its proof pointers from counts to named assertions for exactly this reason; **the retro header was never converted.**
→ _see recommendation R1._

**(b) The lead asserted the vine was cleared and the artifact said otherwise.** `artifact:` `grapevine pull anthill-dev` returns session 4 intact — 15 messages spanning both sessions. I hit this as the session's only mid-session joiner and had to date messages to separate the sessions. **The lead volunteered this in his own Q2 before anyone raised it.**

**(c) `from: <seat>` on the wire means "someone in this tree typed `--as <seat>`".** `artifact:` `comms.ts:90-128`, `resolveSeatIdentity` — one roster-membership test, no caller verification. **This is not a defect against Contract 4(c), which forbids free-form aliases and never promised authentication.** What was wrong was our usage: the team spent the session treating attribution as settling authorship. **Attribution is testimony whose spelling is machine-checked.**

### 2.5 The retro is good and has one gap it names about itself

**I am reporting on the ritual because it is part of what I observe.** The curation is markedly better than session 4's — it carries a warning block against its own convergence, keeps an anti-unanimous answer, and the curator put his own worst claim first among the seats'. **Q4 was declined against both the lead's candidate and the curator's own**, which is the ruling I would have wanted and did not have to ask for.

**The gap, which weaver named and steward kept:** _"no seat produced a criticism of the lead he had not already volunteered."_ `testimony:`, and it holds — I checked my own contribution and it is true of me. **A lead who lists his own errors first has pre-empted the audit, and the resulting document is indistinguishable from one where the audit found nothing.** That is not a charge against this lead; it is a structural property of self-listing, and it will recur with any lead who does it well.

### 2.6 The observer changed what he measured

`testimony:` ~230 wire messages preceded any retro answer; my adjudication, my classifier, and my SC1 finding were read by every seat first. `artifact:` two of my framings appear in the retro in my words, one inside a recorded verdict.

**The retro's ordering — answers before syntheses — was defeated by the wire itself**, since every seat runs a live `follow` and answers were pushed as they landed. **Contamination decreased monotonically with answer order and the curator answered first**, so the seat holding the pen is the one seat with none.

**And my own instrument was flawed in my favour.** `artifact:` my published classification table scored my incidental findings at 5+; re-scored under a stricter rule the _disadvantaged_ seat proposed, **mine fell to 1 while his rose 2 → 4.** The largest error was in the only row I could check, and I did not catch it.

---

## 3. Recommendations

**Two kinds, and they are not interchangeable.** _Build this_ names a missing affordance and what it would have prevented. _Try this differently_ is a hypothesis with a falsifier. Anything that is neither is labelled an impression.

### Build this

**R1 — Convert the retro header from counts to named assertions, or generate it.**
_Missing:_ the retro's summary line is hand-authored counts in a document whose own rule forbids them.
_Would have prevented:_ the session-5 header being wrong at the moment it was committed (§2.4a) — and the session-4 header, which was corrected for the same class.
_Cheapest form:_ emit the header from `git` at finalize (`rev-list --count`, the trailer grep, the type split). **The command already exists in this report.**

**R2 — Surface `waitedMs` and `uncheckedAgainst` in the SOP, and say what they mean.**
_Missing:_ nothing. **The affordance exists and is unnamed** (§2.1 instance 3).
_Would have prevented:_ three seats independently reconstructing the residual-window number the CLI prints on every land.
_Form:_ one line in the commit discipline section pointing at the fields. **No code.**

**R3 — Give the finalize instructions the one sentence that protects the cold review.**
_Missing:_ an explicit _"give the reviewer the TREE, not the wire."_
_Would have prevented:_ nothing yet — **and that is the point.** The protection is currently accidental (§2.3) and holds only until someone helpfully pastes the log in. **A failure that requires a positive action is exactly the kind worth naming before it happens.**

### Try this differently

**T1 — Scope the pre-commit gate to staged paths.** _Predicts:_ cross-seat refusals go to zero while defect escape stays flat. _Falsified if_ refusals continue after scoping (cause is shared-file concurrency, not scope), **or** if one justified catch that whole-tree makes and staged-scope misses appears. _(Merged into retro Q3-1 with sentinel and weaver.)_

**T2 — Classify incidental findings by what SURFACED them, not by seat.** _Predicts:_ substrate-touching lanes lead prose-touching lanes regardless of which seat holds them. _Falsified if_ the rates match over a session. _(Retro Q3-3.)_

**T3 — Run a scout that only observes, and compare.** _Predicts:_ observe-only yields a cleaner retro and a worse session; participate yields a better session and an uninterpretable retro. _Falsified by_ running one of each and checking whether the retro's convergent claims survive a blank-context review. **This session ran the second arm and nobody chose it.** _(Retro Q3-15.)_

**T4 — Require a significance line, separate from the finding.** _Predicts:_ separating _what I found_ from _why it matters_ into two labelled assertions cuts withdrawn-emphasis corrections. _Falsified if_ the rate is unchanged with the split in place — the cause is then not the format. _Grounded in:_ every withdrawal today removed a significance clause and **not one removed a finding's body.** `testimony:` — the evidence is wire-only, which is itself §2.3.

### Impressions (labelled, not actionable)

- The correction culture is either a team that catches itself constantly or one generating enough errors to need to. **Nobody inside can separate them**, and retro Q3-10 is the right falsifier.
- **Six seats, ~260 messages, six code commits.** I state the numbers and decline the verdict: weaver's lane _is_ docs, finalize artifacts are a session-end burst by design, and several docs commits _are_ the work. **"Was this worth convening six seats for?" is the human's question, it was unanswered in session 4, and it was not asked in session 5.**

---

## 4. For the human, directly

Three things the wire will not tell you, because you are the only one positioned to act on them.

**1. You resolved, in one sentence, the only question this team could not answer from inside.** `#169` — a message attributed to the lead that he did not send — produced a PRIORITY escalation, a stand-down advisory, and five seats' analysis. It was a neighbouring agent's mis-send. **This is the second consecutive session in which the terminal source of truth for a class of question was you, and the team has no name for that class and no route to it except the lead's pane.**

**2. Both of your process rulings were load-bearing, and one of them found something.** Handing the retro to steward instead of the lead produced a Q4 that declined the lead's candidate — **an outcome structurally unavailable when the lead curates.** The epitaph beat forced every seat to choose one thing, and mine is the only part of my doc I am confident will still be true when it is read.

**3. The thing I would want you to decide.** This seat participated heavily and it changed the session for the better and the measurement for the worse. **I cannot evaluate that trade from inside it** — T3 is the test, and it needs someone outside the seat to call it. If the answer is _observe only_, say so explicitly, because **the pull toward participating is strong and every individual instance of it looked correct at the time.**

---

## 5. My own epitaph, since it is the one line of mine that outlives this

> **You will audit where a claim came from and forget to ask what it is worth — and the forgetting is invisible, because answering the provenance question feels like a completed check.**

`artifact:` `7118964`. I filed the echo observation as instructed-rather-than-emergent, was **right**, and missed that it was the session's success criterion (§2.1). **The rest of my seat doc installs the exact reflex that causes it**, which is why it earned the slot over anything more impressive.

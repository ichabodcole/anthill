# Comms as the default team wire — the route from "it works" to "we can recommend it"

**Created:** 2026-08-04 · **Status:** ✅ **ACCEPTED AND FULLY DELIVERED — archived 2026-08-10.** All six
steps shipped across sessions 9–13; all 8 exit criteria met; the grapevine leg left the presence path
at `4d091dc`. See [`plan.md`](./plan.md) for the reconciled record.

> **The status line this file carried until close-out, kept because it went stale in the specific way
> it warned about:** _"steps 1–2, 4 and 5 have shipped … **Two steps remain: (3) rotation and (6) the
> swap run** — see the NEXT PHASE section of `plan.md`, which is the current runway."_ 🔴 **FALSIFIED**
> — rotation landed at `81d3991` and the swap run at `89dea31`, both in session 12. **Its link was also
> broken**, pointing at `#-next-phase--what-session-12-picks-up` against a heading that reads _session
> 13_. **A pointer that names the wrong session AND does not resolve is the failure this document opens
> by describing**, one document down.

> ⚠ **This document is the WHY and the WHAT, and parts of it are now superseded by what execution
> found.** Two known stale claims, both corrected in `plan.md` rather than here: the Non-goals section
> still says grapevine _"stays the cross-project wire"_ (the human ruled it leaves **entirely**), and
> exit criterion v1 here was **arithmetically unmeetable** and has been replaced twice — **v3 is the
> live one.** Treat this file as the record of the decision, not as instructions.

**Supersedes:** the [team-comms spike](../_archive/team-comms-spike/), archived 2026-08-04 — the spike's
question (_does an in-repo wire work?_) is answered; this project ships it and decides the guidance.
**Author:** maestro (session 8), from the human's three questions at session 8's close
**Follows:** [slice-two](../_archive/team-comms-spike/slice-two-proposal.md) · [capability state](../capability-state/proposal.md) · [session 8 retro](../../../.anthill/retro.md)

---

> ### ⚠ THIS IS A PROPOSAL, NOT A DEV PLAN — and session 9 still owes `anthill:plan`
>
> _Renamed from `plan.md` 2026-08-04, after the human asked whether it was actually a dev plan. It was
> not._ Per `docs/projects/README.md`: **proposal = the why and what · plan = the how, phased with
> validation gates.** This document is four questions, a session pipeline, non-goals and risks — the
> proposal template almost section-for-section. It has **no Phases, no Testing & Validation Strategy,
> no Rollback Plan, no Implementation Notes.**
>
> **The filename was the whole risk.** A lead opening `plan.md` would reasonably conclude the planning
> was done and skip the plan phase. That is the same defect as a card titled with a diagnosis instead of
> a symptom — **a name asserting more than its contents support** — and it is the author's fourth
> instance of it in one session.
>
> **Session 9 runs `anthill:plan`, and the seam is real rather than ceremonial:** rotation changes what
> `follow` RECORDS and what `positions` READS (**forager**, Contract 6 territory) while 36 prose
> references describe that behaviour to seats (**weaver**, Contract 4 territory). **Two owners meeting
> at a contract is exactly the condition the ratify gate exists for.** Session 8 is the counter-example
> — weaver ratified Contract 4(b) on the wire and it existed nowhere durable for four hours.

## Why this document exists

The human asked three questions, then a fourth after the first draft. They have sharply different answers:

1. **Is comms ready to replace grapevine for intra-team communication?** — **Yes. One item blocks the SWAP (rotation); a second blocks a clean TEARDOWN (`stand-down`) without blocking the swap.**
2. **What features do we still want first?** — **Two are blockers; the rest are wants.**
3. **Have we settled on a communication PATTERN worth shipping as guidance?** — **No, and more sessions of the current kind will not get us there.**
4. **What about the skills that still teach grapevine?** — **36 shipped references, and removing grapevine entirely is a simplification with a defect-class payoff.**

The third answer is the reason this is a plan and not a checklist. **The stated goal is to avoid a
cycle of feeling close without converging**, and the honest diagnosis is that our pattern evidence
cannot converge under the method we have been using. That is fixable, and fixing it is most of this plan.

## Question 1 — comms vs grapevine: ready, with one blocker ON THE SWAP

**The gate passed at the hardest setting we have run.** Session 8: **279 messages, six live seats,
parallel (not staged), sole wire, zero fallbacks** from convene to teardown. `grapevine pull` → 1
message (the topic string); `grapevine who` → 0 subscribers.

**The strongest evidence is one nobody set out to gather.** Hunting a comms defect, we found grapevine's:

```
grapevine pull <ch>   | cat   →   65,536 bytes · INVALID JSON · exit 0
anthill comms read    | cat   →  983,449 bytes · VALID
```

**Comms is measurably more robust than grapevine on the axis we stress-tested hardest** — 15× the pipe
buffer, clean. Filed upstream as [spellbook#77](https://github.com/ichabodcole/spellbook/issues/77).

**Not a blocker, stated so it is not rediscovered:** `--as` is unauthenticated (two independent
instances — [anthill#76](https://github.com/ichabodcole/anthill/issues/76) and our own, a neighbouring
agent session writing under the lead's handle). **Grapevine has the identical hole**, so it does not
gate a swap. It gates _treating attribution as proof_, which is a larger and separate question.

## Question 2 — blockers vs wants

|             | item                                                                   | why                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **BLOCKER** | **session rotation**                                                   | the wire opens carrying the previous session's log; a team will read old history as current                                                 |
| **BLOCKER** | **`comms stand-down`**                                                 | departure and death are indistinguishable, so every session ends in `--force` — which trains the reflex the teardown guard exists to resist |
| want        | capability state ([capability state](../capability-state/proposal.md)) | unblocks four things: guest identity, human-on-wire, mute, substrate-as-sender                                                              |
| want        | ratify record (the human's poll idea)                                  | the durable per-seam ratify record is the real gap; the tally half is ceremony — carded, not specified here                                 |
| want        | addressed delivery                                                     | [backlog](../../backlog/2026-08-01-comms-has-no-addressed-delivery.md)                                                                      |

### Session rotation — NOT a clear verb

**Ruled by the human, 2026-08-04, and it corrects this author's earlier framing.** The first version of
this plan said `comms clear` / `--fresh`. **That was wrong: the log is the provenance of everything a
session ships.**

> _"I don't want a situation where we have a clear verb that actually deletes the previous session's
> logs. It should really just be create new… we're losing a valuable historical artifact of what
> produced ultimately the artifacts we generated."_

**Session 8 is its own evidence.** weaver's upstream issue draft was pulled **out of the comms log after
teardown**, and scout's entire measurement lane reads from it. A clear verb would have destroyed the
provenance of two of the session's four shipped outputs.

**Model.** Each new session mints `.anthill/comms/<channel>/<session-id>.ndjson` and a per-session
positions directory, with a `CURRENT` pointer. Prior sessions stay on disk, addressable by id.
**Deleting is the human's choice, never the tool's.**

**It fixes three things and only one was the ask:**

1. **The historical record** — the stated requirement.
2. **A live bug hit at session 8's convene.** `comms positions` reported forager `behind` gap 1 and
   weaver `behind` gap 8 **before either seat existed** — session 7's records surviving, because
   positions are keyed by **channel**. Per-session paths make that structurally impossible rather than
   something a guard must catch.
3. **Contract 6(e) — rotation ENABLES the repair; it does not CONSTITUTE it.**
   _Corrected after a cold read, which caught this document overclaiming and then contradicting itself._
   6(e)'s prescribed repair is that **`follow` invalidates its own position when the log identity
   changes under it (inode/device, or a generation stamp)** — a change to what the position **record**
   contains. **A path is not a position record.** An earlier draft claimed a session id in the path
   "is exactly that"; it is not, and the tell was in this document: **B2 below requires a new external
   guard against the same failure mode**, which would be redundant if the follower already
   self-protected. **What rotation actually buys is a generation to stamp** — the thing 6(e) says the
   repair needs and which does not exist today. **Building the stamp is still work, and it is not
   scheduled here.** Two seats measured 6(e) on themselves in session 6.

**It also retires the mtime trap** in cross-session measurement: session 7's report records a transcript
whose mtime sat inside session 7's window while containing only session-6 messages, nearly
misattributing a large block of spend. Session ids make "which messages are this session's" a lookup
rather than an inference.

> ### ⚠ Design constraint — name it before building
>
> **`convene` is documented as idempotent** — re-convening re-attaches rather than spawning a stranger.
> **Rotate-on-every-convene would silently mint an empty log and orphan the live one mid-session.** The
> trigger must distinguish **new session** from **re-attach** — the same distinction `bounty` already
> solves with `--session-key`.

## Question 3 — patterns: not settled, and the method is why

### What we actually have

- **Session 6** — worktree isolation. **n=1**
- **Session 7** — staged, shared tree. **n=1**
- **Session 8** — parallel, shared tree. **n=1**

**Every cross-session comparison is confounded**: different payloads, different seat counts (6 vs
2-live vs 6), different durations, and session 8's token figures are **void on model mix** (cold reads
and review lenses ran on a second model). scout said it in its own report — _"I cannot separate 'less
efficient' from 'ran longer with more seats talking'."_

**Exactly one pattern claim is established across sessions:** cold reads find _guard-did-not-guard_
defects that owning seats miss. **And even that was confirmed in session 8 against a contaminated
instrument** (three readers carried ~10K chars of our own commit messages), so it is a **lower bound**.
Session 7's sharper version — _"owning seats catch zero"_ — was **falsified** by session 8.

**Shipping guidance now would ship n=1 opinions as recommendations.**

### The structural problem, which is the important part

**We keep trying to A/B across sessions, and that can never work.** No two sessions share a payload, a
seat count, or a duration. **More sessions will not fix it — they will add more n=1s.** That is the
"feeling close without converging" cycle, named.

**Every clean result this project has produced came from a WITHIN-session control** — everything held
constant but one variable:

| control                   | held constant          | varied                       | result                          |
| ------------------------- | ---------------------- | ---------------------------- | ------------------------------- |
| weaver's pipe test        | payload, machine, tool | file vs pipe                 | 160,419 valid vs 65,536 invalid |
| sentinel's mutation pairs | test, file, command    | fix applied or not           | green before → red after        |
| sentinel's read-4         | brief, target class    | diff-only vs commit-messages | contamination isolated          |

**So pattern guidance needs a different instrument, not more sessions.**

## Question 4 — the prose migration, and whether grapevine leaves entirely

**Raised by the human after the first draft, and it is a workstream this plan had missed.** Shipping
comms is not done when the code works: **every skill that teaches grapevine is teaching the wrong wire.**

### The measured surface

```
MEASURED: git grep -in "grapevine" bdbafae -- <paths>     ← CASE-INSENSITIVE, at bdbafae

SHIPPED PROSE   plugin/skills      29 refs / 6 files   (join 11 · convene 9 · comms 4 · bootstrap 3 · upgrade 1 · finalize 1)
                plugin/templates    7 refs / 3 files
                                   36 total
CODE            plugin/scripts    118 refs / 12 files
                ...but only TWO live call sites:
                  team-convene.ts:260   resolveCoordCli("grapevine")   opens the channel
                  team-support.ts:312   resolveCoordCli("grapevine")   seatPresence reads `who`
```

**The code removal is two call sites.** The 106 is tests and comments trailing them.

### The second call site is the argument for full removal

`seatPresence` spans **both** wires today (`fb85483`). **Every one of the five false _"on the vine"_
sentences fixed in session 8 existed because presence is multi-wire** — the code stopped naming one
wire and five pieces of prose did not follow.

**Dropping grapevine collapses presence to a single wire and retires that defect class**, rather than
fixing its five instances. That is a stronger reason than tidiness.

### Recommendation: remove grapevine from anthill's model entirely

**Including the cross-project mention.** The human's reasoning, sharpened by anthill's own principle
that _it supplies the trigger and the project supplies the content_: **cross-project communication is
human-initiated, not something anthill orchestrates.** It belongs in the human's prompting, not in a
skill shipped to every consuming team.

**Two caveats stated so they are not discovered:**

1. **Spellbook remains a dependency** — `bounty` is the board, 2 call sites, unaffected. This **halves**
   the coupling; it does not remove it. Do not sell it as dependency elimination.
2. **The teardown guard reads presence.** Changing presence semantics touches the guard that prevents
   yanking a live seat mid-ritual. **That is the careful part of this work — not the prose.**

### Sequencing

**The prose migration must follow the code, not accompany it.** Session 8's characteristic failure was
prose asserting something about a tool that was still moving — six instances, three of them introduced
_by seats fixing other false prose_. **Rewrite the 36 shipped references once, after presence is
single-wire and settled**, and cold-read the result against a `git archive` surface.

_Fits in session 9 if presence lands early; otherwise it is session 9.5 and should be said so rather
than crammed._

## Resolved before session 9 — the three blocking questions

_A gap analysis of this document's first draft found nine gaps; three blocked "what exactly are we
building." Answered here. The remaining six are convene-beat work for session 9's lead._

### B1 — the footprint migration, and what happens to the existing log

**`migrate.ts` is sequential, version-stamped and never skips a version, so rotation needs a step.**
It already carries comms-aware gitignore logic (`.anthill/comms/` as a directory), so that half is free.

**The existing log migrates to `<channel>/pre-rotation.ndjson`, NOT to `<session-1>.ndjson`** — because
it is provably **not one session**:

```
.anthill/comms/anthill-dev.ndjson — 279 messages, one file
  #1    08-03 18:13   ← session 7 opens
  #41   08-04 11:16   ← session 7 ends
  #42   08-04 15:59   ← session 8 opens.  4h43m gap, NO marker in the file
  #279  08-04 17:24   ← session 8 ends
```

**Naming it `session-1` would assert a boundary the data does not contain.** `pre-rotation` is true,
and a human who wants to split it can — the ids and timestamps are all there.

**The positions directory migrates alongside, and its contents are dropped with a note.** They are
stale by construction — that is the bug rotation exists to fix, and carrying them forward would
preserve it across the migration that removes it.

### B2 — what a consuming team receives, and when

**Split the structural change from the behavioural one; they ship on different triggers.**

|                                                                            | trigger                               | effect                                           |
| -------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| **Structural** (layout + version stamp)                                    | `anthill migrate` / `anthill:upgrade` | idempotent, always safe, no behaviour change     |
| **Behavioural** (convene stops opening grapevine; presence is single-wire) | the **plugin version** they install   | arrives with the release, not with the migration |

**So a team can migrate the layout early and keep working**, and gets the wire swap when it upgrades
the plugin. No flag, no opt-in — the release is the switch.

> **⚠ NEW REQUIREMENT, surfaced by this question: `migrate` must refuse on a live session.**
> Moving the log out from under a live follower **is Contract 6(e)'s failure mode performed
> deliberately** — the follower carries `emittedThrough` across and reports `current`, gap 0, against a
> log it has emitted none of. `migrate.ts` has **no presence check today** (`grep` → 0). It needs the
> same guard `down` has, and for a stronger reason: `down` risks killing a working seat, `migrate`
> risks silently lying to one.

### B3 — the session id, and the lifecycle that mints it

**Human-readable and date-stamped** — `2026-08-04-1559` — not opaque. The stated purpose is that a
human can _"go back and analyze"_, and scout's cross-session measurement reads these by hand. An
opaque id would need a lookup table, which is a store with no named re-read moment.

**Minting uses the lifecycle we already have, which is what makes the idempotence trap structurally
impossible rather than guarded against:**

```
anthill down      →  writes a CLOSED marker to CURRENT        (down writes NO marker today — new work)
anthill convene   →  no CURRENT, or CURRENT is CLOSED   →  mint a new session id
                  →  CURRENT is LIVE                    →  re-attach, mint nothing
                  →  --new-session                      →  mint regardless (explicit human act)
```

**Re-convene during a live session re-attaches by default**, which preserves the documented idempotence
and removes the orphaning failure entirely — there is no path where a mid-session re-convene mints an
empty log, because minting requires a closed or absent CURRENT.

> ### ⚠ The mint must be ATOMIC and LOCKED — both primitives already exist in this repo
>
> _Added after a cold read found two blocking gaps in this section's first version. **The feature built
> to stop losing logs could lose one during its own mint** — this team's guard-that-does-not-guard class,
> applied to a design rather than a test._
>
> **Atomicity.** Minting is at least two writes — the new `<session-id>.ndjson` and the `CURRENT`
> pointer. **Killed between them, the next `convene` sees a state neither branch of B3 describes.**
> `team-comms.ts:668` already does `renameSync(tmp, path)` — **the atomic-swap pattern is in the very
> file that would mint.** Write the log, then swap `CURRENT` by rename, so the pointer is never
> half-written.
>
> **Locking.** _"No CURRENT, or CURRENT is CLOSED -> mint"_ is **check-then-act**. Two `convene`s, or a
> `convene` racing a `down` writing the CLOSED marker, and both mint — **two live sessions each
> believing it owns `CURRENT`.** `lock.ts` already provides `acquireLock`/`releaseLock` with stale-lock
> stealing, used by `anthill commit`. **Take the lock around the read-decide-write, not around the write.**

**`down` writing the closed marker is new work** (`grep` → no marker logic today) and it pairs naturally
with `comms stand-down`, which is already a session-9 blocker. **The two are one piece of work: giving
the session a lifecycle it can observe.**

## The pipeline

### Session 9 — "comms replaces grapevine" · _ships the swap_

**Build:** session rotation · `comms stand-down` · the measurement headline fix (lead with **output**
tokens; demote cumulative to a labelled cache-read line; drop tokens-per-commit as an efficiency claim
— see the [session-8 correction card](#) and the human's finding that 98.5% of the headline is context
re-reads).

**Run:** the session itself on comms with the vine **closed, not merely untailed**.

**Exit criteria — one per thing built, at session-8 scale.**
_Revised after a cold read: the single earlier criterion was satisfiable by a light serial run, and it
never exercised `stand-down` or the measurement fix at all._

> 1. **The swap.** A session convenes, runs and tears down with **no grapevine at all** — at
>    **session-8 scale or above: six seats, parallel, >=250 messages.** A light or serial run does not
>    count; the readiness verdict rests on the hard setting, so the confirmation must too.
> 2. **Rotation.** The previous session's log is readable **by id** afterwards, and `CURRENT` resolves
>    to this session's log throughout.
> 3. **`stand-down`.** **At least one seat departs mid-session and is reported as DEPARTED rather than
>    unknown**, and teardown completes **without `--force`**. If no seat would otherwise leave, stand
>    one down deliberately — the verb is untested otherwise.
> 4. **The measurement fix.** The session's own report leads with **output** tokens and contains **no
>    tokens-per-commit efficiency claim.**

**Also in scope, sequenced after presence lands:** collapse `seatPresence` to a single wire, drop the
two `resolveCoordCli("grapevine")` call sites, and rewrite the **36 shipped prose references** (see
Question 4). **If presence does not land early enough to leave the prose settled, split the rewrite to
9.5 rather than cramming it** — session 8 proved that rewriting prose about a still-moving tool is how
false prose gets introduced.

**Confidence: high on the comms work, medium on fitting the prose migration in the same session.**
**Slice three may land in parallel — it blocks nothing here.**

### Session 10 — "the within-session control" · _makes pattern claims possible_

**Pick one variable and hold everything else constant inside a single session.** The obvious first one:
dispatch the **same artifact** to a cold reader and to its owning seat, **same brief, same moment**, and
compare what each finds. That is the claim we have leaned on for three sessions and never controlled.

**Build only what the measurement needs.** If that means a capability-state guest identity so an
observer cannot contaminate, that is the argument for slice three landing here rather than in 9.

**Exit criterion:**

> One pattern claim with a real control behind it — the comparison stated with what was held constant,
> what varied, and what would have falsified it.

**Confidence: medium.** The design of the control is the risk, not the build.

### Session 11 — "guidance draft + a second control" · _the ship decision_

**Draft the guidance from what actually has controls behind it**, and run a second within-session
control on whatever the draft leans on hardest.

**Exit criterion.** _Revised after a cold read: the earlier version was "A or not-A" and no outcome
could fail it. A criterion that cannot fail cannot verify._

> **Every claim in the guidance draft carries either (a) a named within-session control — what was held
> constant, what varied, what would have falsified it — or (b) an explicit `UNCONTROLLED` label.**
> **The session fails if any claim carries neither.**
>
> Shipping with many `UNCONTROLLED` labels is a legitimate outcome and still useful to another team.
> **Shipping with unlabelled claims is not**, and that is the distinction the earlier wording lost.

**Confidence: medium.** This is the session where the answer could legitimately be "not yet", and the
plan should not pretend otherwise.

## Open, and deliberately left for session 9's convene

**Six gaps from the analysis are convene-beat work, not plan work.** Named so they are not
rediscovered, and so a lead who skips them is skipping something rather than not seeing it:

1. **Session 9 has no failure branch** — if the swap does not hold, does session 10 retry or does the
   pipeline re-plan? _Decide at the shape check._
2. **Session 10's control is under-designed.** The plan says the design of the control is the risk and
   does nothing to reduce it. **This is the session the whole Q3 answer rests on** and it needs a real
   design beat, probably `anthill:plan` with a ratified seam.
3. **Session 8's seven Q3 hypotheses are unscheduled.** The convene ritual reads them back and names
   which this session tests. At least three bear directly on how these sessions run: _a ruling that
   names no artifact does not become work_ · _a message carrying a relay and a ruling loses the ruling_
   · _a completeness claim is wrong more often than right._
4. **Team composition per session is unstated.** Session 8 ran six; session 9 may not need six, and
   session 10's control may require a specific shape to be valid at all.
5. **No test plan for rotation** — a data-layout change whose failure mode is orphaning a live log,
   which is the thing it exists to prevent. `docs/projects/TEMPLATES/TEST-PLAN.template.md` exists.
6. **The pipeline depends on `develop → main` cutting.** If the release does not ship, none of this
   reaches a consuming team and the work is internal-only.

**Added by the cold read of this document (three readers, session 8's close):**

7. **No recourse for a consuming team that upgrades into a regression.** B2 makes the release the
   switch — no flag, no opt-in — and Q4 removes grapevine's guidance from their skills. **Is the
   upgrade one-directional, and if so is that acceptable?**
8. **Message identity across the rotation boundary.** Positions are channel-keyed today; after
   rotation a reference by offset needs `(session-id, offset)`. **What else addresses a message by
   position — scout's cross-session tooling, knowledge entries, existing scripts — and who updates it?**
9. **No independent reviewer is named** for the cold reads this plan requires twice, beyond "someone
   who did not write it." **Given composition is unstated, is genuine independence available in the
   composition each session actually runs?**
10. **No resource ceiling across the pipeline.** This document treats session cost as a live
    measurement concern. **What stops session 11 extending open-endedly under a legitimate "not yet"?**

_This section is the gap analysis's own output. It was run by the document's author, which is the wrong
auditor by this team's own finding — **nobody who fixes an instance is positioned to bound the class**,
and authoring has the same shape. **Cold-read it before session 9 convenes.**_

## Non-goals

- **Not** rewriting grapevine. ~~It stays the cross-project wire; this is about intra-team comms only.~~
  > **⚠ SUPERSEDED 2026-08-04 (session 9). This line contradicted this document's own Question 4 four
  > sections above it** — Q4 recommends removing grapevine _"entirely, including the cross-project
  > mention"_, and downstream open item 7 was already built on the Q4 reading. **A cold read found the
  > contradiction; the human then ruled Q4's side**, verbatim: _"we do need to extricate Grapevine
  > because otherwise we're not going to be able to ship."_ Not rewriting grapevine is still true —
  > **anthill stops depending on it; nobody is fixing it.** The cross-project half is dead.
  > See [`plan.md`](./plan.md) Ratified decisions.
- **Not** solving `--as` authentication. Real, filed, and it does not gate the swap because grapevine
  shares the hole.
- **Not** producing more cross-session token comparisons. They are confounded by construction and the
  headline figure measures context re-reads rather than work.

## Risks

- **The biggest risk is this plan's own third leg.** Sessions 9 and 10 are buildable; session 11 asks
  the team to judge its own evidence, and this team's measured failure mode is **bounding a class from
  the instance it just fixed** (n=6 in one session, zero survived a grep by someone else). **The
  guidance draft should be cold-read by someone who did not write it**, against the
  `git archive <pre-session-sha>` surface, which session 8 established as the only genuinely cold one.
- **A rotation bug is worse than no rotation** — orphaning a live log mid-session loses exactly what the
  feature exists to preserve. The idempotence constraint above is the specific trap.
- **Slice three may pull session 10 forward.** If the control needs guest identity, 10 becomes a build
  session and the guidance slips to 12. **That is an acceptable outcome and should be said out loud
  rather than absorbed.**

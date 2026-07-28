# Investigation: what actually fails when N seats share one working tree?

**Date Started:** 2026-07-27
**Investigator:** Claude Code (maestro) + Cole, with first-hand answers from `sol` (lead, operator-mono)
**Status:** Active
**Outcome:** Characterization only — **deliberately no recommendation yet.** Eleven mechanisms separated; four questions remain open,
two answerable only by measurement.

---

## Question / Motivation

Nine of anthill's open feedback issues, from four different consuming projects, are filed under some
version of "the shared tree is a problem." They have been treated as one problem with one candidate
fix (a smarter commit gate — [`shared-tree-gate-tension`](../projects/shared-tree-gate-tension/proposal.md)
move C), and more recently as a second candidate fix (per-seat worktree isolation).

**Both framings were premature.** "The shared tree" is a _setting_, not a mechanism. This
investigation separates the failure modes that actually occur, establishes which fixes address
which, and — importantly — records what we still do not know.

The trigger for doing this properly: while drafting
[`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) it became clear that a
feature branch fixes _history noise_ and does nothing whatever for _gate coupling_, yet both had been
argued as one proposal. That conflation was load-bearing enough to justify going back to the evidence.

## Current State Analysis

**What has shipped so far, and what it covers:**

- **Serialize lock + explicit-pathspec commit** (`anthill commit`) — addresses index racing only.
- **Red-tree finalize mode + scratch-dir gate exclusion** (moves A + B1, 2026-07-08) — narrows two
  symptoms of the gate problem; does not touch its cause.
- **Foreign-red diagnostic + unstage-on-failure** (2026-07-27, `2170636`) — makes a gate bounce
  legible and stops a bounced seat silently becoming the team's index-holder. Mitigations, not fixes.

**What has not been tried:** per-seat worktree isolation. It was proposed on **2026-06-22** — the
same day as the serialize lock — in dream-flute's paper-cuts #2:

> **Fix:** `flute team commit -- <paths>` that enforces an explicit pathspec + holds a serialize
> token; **or** per-seat worktrees (no shared index at all).

The serialize lock was chosen. **Every shared-tree issue filed since is the compounding cost of that
fork**, which makes this a deferred decision rather than a new one.

## Investigation Findings

### Evidence Gathered

Four independent sources, deliberately chosen to cross-check each other:

1. **The issue tracker** — 29 open issues, of which 9 are shared-tree-shaped
   (#24, #28, #44, #49, #50, #52, #55, #60, #61).
2. **Four consuming projects' living docs** — `dream-flute` (6.5k lines of seat docs, 238-line
   paper-cuts), `media-buffet`, `media-forge`, `operator-mono`. This is where the non-complaint
   evidence lives.
3. **A live interview with `sol`**, lead of a **7-seat** operator-mono team, answered _mid-session_
   rather than retrospectively. Questions were deliberately blind — the shared tree was not named in
   any of them — per the [observer-effect discipline](../projects/research-probes/proposal.md).

   > **⚠️ Priming caveat — weight the sources differently.** The blind condition holds for
   > **grapevine msgs #2–#3 only**. sol then asked what the research was about and was told
   > (worktree isolation), so **everything from msg #4 onward is primed** and cannot be treated as
   > independent evidence for it. Every finding recorded in this document is drawn from the blind
   > window. Answers arriving later — including the pending ones on provisioning cost and seat
   > discipline — must be marked as primed when folded in, and are better treated as _expert opinion_
   > than as observation. This is a live instance of exactly the contamination the research-probes
   > proposal is designed to prevent, and it happened anyway, to someone who had read that proposal
   > the same day.

4. **Published practice** — OpenAI's [Symphony spec](https://github.com/openai/symphony/blob/main/SPEC.md),
   [Jcode Swarm](https://jcode.sh/swarm), and the worktree-isolation literature.

### The eleven mechanisms

The central finding of this investigation. These have been lumped together; they have different
causes, different severities, and different fixes.

| ID      | Mechanism                                                          | Symptom                                                                  | Evidence                                                     |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **M1**  | One shared git **index**                                           | A seat's staged content blocks peers; a bounced commit strands the index | #55.1, #49, #60.1, dream-flute pc#2, sol Q2                  |
| **M2**  | Hook reads the **whole tree**; the commit is file-scoped           | Any seat's dirty or red file blocks _everyone's_ land                    | #24, #28, #44, #50, #55.2, #60.2, media-buffet pc#3, sol Q1  |
| **M3**  | Reading/building/testing a tree holding peers' **in-flight edits** | **Wrong verdicts, in both directions**                                   | dream-flute `prism.md`, #52                                  |
| **M4**  | Machine-global **runtime** (ports, daemons, DBs, browser tabs)     | Verdict bound to the wrong _running_ artifact                            | #61, dream-flute "which-tree trap" forms 2–3                 |
| **M5**  | Commits land on the **integration branch**                         | ~50 commits on `develop` from one feature                                | #59                                                          |
| **M6**  | Incompatible assumptions **merge clean**                           | Green build, contradictory behavior                                      | industry finding; anthill's own ratify gate                  |
| **M7**  | **Livelock by politeness** — yielding recovery norms               | Everyone unstages, nobody drains; finished work sits                     | sol Q4 (emergent; not previously modelled)                   |
| **M8**  | **Lead ruling latency** — single writer, multi-writer stream       | Rulings cross seats' messages; a lane gets rewritten                     | sol Q1b, Q4 (emergent; not previously modelled)              |
| **M9**  | **Correct waiting has no stall signature**                         | A seat blocked on a human is invisible to board, tree and sweep          | sol finalize #3 (emergent; not previously modelled)          |
| **M10** | **No trigger reconciles `plan.md` with mid-session rulings**       | The plan still asserts a design the team reversed                        | sol finalize #4 (emergent; not previously modelled)          |
| **M11** | **A scope so broad that undelivered work inside it is invisible**  | A seat's primary deliverable goes unbuilt while it looks on-track        | sol structure reflection (emergent; not previously modelled) |

**M7–M11 were invisible to the issue tracker.** None has ever been filed. All five came from the
live interview, the finalize report and the structure reflection, and all five are _emergent coordination failures_ rather than
git properties — which is precisely why no amount of git tooling would have surfaced them. **Five of
eleven mechanisms are not about git at all**, which is itself an argument against framing this whole
area as "the shared-tree problem."

### Which fixes cover which mechanisms

| Fix                                                   | Covers     | Does not cover                       |
| ----------------------------------------------------- | ---------- | ------------------------------------ |
| Serialize lock _(shipped)_                            | M1         | everything else                      |
| **Staged-snapshot gate** _(new — see observation 10)_ | **M2**     | M1, M3–M11                           |
| Per-seat worktree isolation                           | M1, M2, M3 | M4, M5, M7–M11 — **and degrades M6** |
| Branch strategy _(session-branch-strategy)_           | M5         | everything else                      |
| Contract-first: seams + ratify _(already have it)_    | M6         | everything else                      |
| Per-resource lock                                     | M4         | everything else                      |
| _(nothing proposed)_                                  | —          | **M7, M8, M9, M10**                  |

**No candidate fix covers more than three of eleven**, which is why "should we isolate?" was the wrong
question to lead with. Four mechanisms have no proposed fix at all.

### Key Observations

**1. The contention was on the plumbing, not the files.** The single most clarifying finding, from
sol's walk-through of a real same-file incident (`apps/api/src/features/mcp/db.ts`, 20 minutes,
4 seats, 6+ messages):

> **The file was never concurrently edited.** One owner, one edit, no conflict. **All the contention
> was on the index and the gate** — not the file. Your ownership model worked perfectly; the git
> plumbing underneath it is what serialized us.

**M6 did not occur.** The seams/ownership model absorbed it. The damage was M1 + M2 alone. This is
the strongest available evidence that anthill's contract layer does real work — and it means the
mechanism isolation would _degrade_ is the one already handled by other means.

**2. M2 is not friction; it is structural incompatibility.** From sol:

> The gate punishes the practice the repo mandates — TDD's red phase is a team-wide outage.

Five incidents in one session, all seven seats. And notably, **two proposed mitigations were both
falsified by reading the hook** — the lead's and the verify seat's. Competent people inside the
problem have now been wrong about its mechanics twice, which is itself a reason to distrust
armchair fixes.

**3. M1 changes character with scale — it does not merely get more frequent.**

> At 2–3 seats, index collisions are rare enough to ignore. At 7, **someone is always staged**, so
> the failure mode goes from occasional to structural.

**4. M3 does not generalize across stacks.** dream-flute's verify seat recorded a **false RED** — a
defect reported that was _"STRUCTURALLY IMPOSSIBLE at that sha"_, caused by running tests in the live
shared tree while a peer was mid-edit: _"I compiled a file that existed on NO committed sha and blamed
the sha."_ It also recorded the inverse, a false negative on a stale tree.

operator-mono has **no counterpart**. Its verify seat binds verdicts to artifacts it queries itself
(live DB rather than migration files; re-running suites rather than accepting counts). Its two wrong
verdicts were a different class entirely:

> "I observed X" has been reliable. "Therefore Y is safe" has been wrong twice.

Both failures were in _inference_ and _test shape_, never in observation. So M3 appears
**preventable by verify-seat discipline**, and may be specific to stacks with expensive compiled
artifacts. It is not the universal it was being treated as.

**5. Isolation has a hard ceiling, independently derived twice.** dream-flute's prism recorded:

> ★ FINDING — worktree isolation does not isolate the SESSION PLANE

Its "which-tree trap" has five named forms — stale worktree, co-tenant port, loaded browser module,
live shared tree, git-snapshot. This matches #61 exactly, and matches the published finding that
worktrees isolate _files_, not _runtime_. **M4 is untouched by every candidate fix.**

**6. Isolation is not free, and the costs are stack-specific.** dream-flute documents what a fresh
worktree lacks: gitignored build state (`.nuxt`), symlinked `node_modules`, a `vite.server.fs.allow`
patch that must be **re-applied after every `git checkout -f`**, and staleness management for
long-lived worktrees. "Add `--isolate`" is not a flag; it is a **workspace-provisioning problem**,
and per adapt-not-dictate the provisioning belongs to the project, not to anthill.

**7. Scale has a genuine benefit that any fix must preserve.** From sol, unprompted:

> Seats reading each other's **landed** code caught four cross-seam defects no author's own tests
> found. Two seats independently reaching the same finding became our strongest trust signal. That
> property does not exist at 2 seats and it's the main argument for the headcount.

Because it operates on _landed_ code, cross-verification likely survives isolation — but this should
be verified, not assumed.

**8. The feedback channel systematically under-reports the most valuable adaptations.** operator-mono
grew, unprompted and universally, a **provenance-first messaging convention** — prefixing claims with
`"read of your working tree, NOT HEAD"`, `"M column 1 = staged"`, `"verified rather than asserted"`.
Nobody proposed it; it is written nowhere. Sol's framing:

> They never surfaced as complaints — they surfaced as **habits**. You'd never see them in an issue
> tracker.

Separately, `orion` **built an auto-retry watcher** on `git diff --cached` that self-fires its land
when the index clears — a seat engineering around the tool, never filed.

**This is a finding about anthill's own instrumentation, not just about the shared tree.**
`anthill feedback` captures complaints; the highest-value adaptations are not complaints. Two of the
four projects studied (`media-forge`, `operator-mono`) have **scaffold-only `paper-cuts.md`** despite
media-forge generating eight of the open issues — friction now routes upstream and never lands
locally.

**9. Published practice has split, and neither camp resolves our case.** OpenAI's Symphony mandates
per-issue workspace isolation but declares coordination an explicit non-goal — the orchestrator
_"MUST NOT branch on provider-specific blocker semantics"_, and branching/merging are out of scope.
[Jcode Swarm](https://jcode.sh/swarm) goes the other way — _"stop using git worktrees, start using
swarms"_ — replacing isolation with file-read tracking and notification. anthill is architecturally
closer to Jcode (grapevine + bounty + seams) while its pain points argue for Symphony's isolation.

**10. A cheaper fix for M2 exists, and it came from the team that has the problem.** _(operator-mono
finalize, primed — but see the anti-priming note below.)_ Rather than changing the tree topology,
change what the gate reads:

> Run phase two against the **staged snapshot** (`git stash --keep-index` → `check` → restore),
> which is what `lint-staged` already does for its own tasks. The property isn't leniency — it's
> **"the gate verifies what you are committing"**, which is what pre-commit always meant.

This addresses M2 — the mechanism sol's team ranks as by far the costliest — **without touching M1's
plumbing, without provisioning worktrees, and without the M6 risk isolation carries.** It is also
squarely a _host-project_ change (the hook is theirs), which per adapt-not-dictate means anthill's
role would be to **recommend and detect**, not to rewrite. Two preconditions their verify seat
flagged, both of which must be proven before recommending it:

- it must nest safely with `lint-staged`'s own stash, and
- restore must be safe on failure — **"a gate that can lose a peer's uncommitted work is worse than
  the jam it fixes."**

**⭐ This is also the strongest evidence that the priming did NOT contaminate the finding.** sol knew
I was researching worktree isolation. Their team, at finalize, proposed **something else entirely** —
a gate fix, not an isolation fix — and did not mention worktrees at all. A primed subject that
declines the primed answer is more informative than a blind one that happens to agree.

**11. Two more mechanisms, both of them about _absence of signal_.**

- **M9 — correct waiting has no stall signature.** A seat sat blocked on a human answer, _"invisible
  to the board, the tree, and my coordinate seat's sweep."_ It surfaced only because the seat
  volunteered it. Compounding it, sol had told seven seats "the human isn't watching panes; he talks
  to me" — which `anthill spawn` makes **false by construction**, since it creates one pane per seat
  in a session the human can attach to at will. So this is two defects: a **model the skills imply
  but the tmux topology contradicts**, and an **uninstrumented state**. It is adjacent to
  [#58](https://github.com/ichabodcole/anthill/issues/58) (idle-lead stall) but sharper: #58 is about
  a lead not responding; M9 is about _nothing anywhere being able to tell that a seat is waiting_.
- **M10 — nothing reconciles `plan.md` with mid-session rulings.** Sol made ~15 rulings on the vine
  and landed **none** into the plan; at finalize the document still asserted a design the team had
  **reversed**. The SOP already says _the vine evaporates_ — but no ritual beat makes the lead
  discharge that obligation for the plan while the session is live. (The finalize owner-reread beat
  shipped today catches this only at the end, and only for docs a seat owns.)

**12. The ratify gate's strongest result yet — and a precise refinement to it.** Reported unprompted
as the thing that worked:

> **Five of seven seams falsified**, including a privilege-escalation hole in my own skeleton that
> would have made a read-only CLI key a full session credential on every `requireAuth` route — **with
> no test failing.**

A security defect, caught by ratification, that no test would have caught. Also: _"the seams that were
negotiated fit at integration; the one shape a seat built past a contract was wrong in three places."_

The refinement, from their CLI seat, is sharp enough to act on independently:

> **A seam is ratified at a specific granularity, and building past it silently manufactures a new
> one.** We ratified the response _envelope_; the seat built at the _field_ level and got shapes
> wrong — the ratification _felt_ like a contract, so nobody noticed the boundary had been crossed.
> **Say where a ratification ends.**

Tracked separately as [seam ratification granularity](../backlog/2026-07-28-seam-ratification-granularity.md).

**13. The ratify gate's cost is set by the SHAPE of the skeleton it is handed.** From the structure
reflection — reached by the coordinate seat from outside, confirmed by the engine seat from inside its
own falsification:

> **The five falsified seams specified a SOLUTION. The two that survived specified a CONTRACT or a
> QUESTION.**

An implementation-shaped claim (_"add these two columns, reuse `keyHash`, discriminate by `kind`"_)
forces the owner to accept a design they did not make **or to do the archaeology to overturn it** —
and five owners spent the session doing exactly that. Contract-shaped claims got _"cheaper sharper
answers from the seats that owned them."_

This reframes observation 12. The gate is not the expensive part; **badly-shaped input to the gate
is.** Filed as
[plan skeletons state contracts](../backlog/2026-07-28-plan-skeleton-states-contracts-not-implementations.md).

**14. M11 — a scope can be correctly worded and still uninstrumentable.** The team's verify-seat scope
was _"integration across surfaces against the shared contract"_ — a function rather than a tech stack,
which is the shape anthill's own guidance recommends. It was nonetheless broad enough that the seat's
**primary deliverable went entirely unbuilt** while _"no card, no board column and no staleness sweep
could show it. It absorbed unlimited adjacent verification work and looked on-track throughout."_

The general rule the team landed on after falsifying its own first attempt:

> **A scope fails when a specific undelivered thing inside it is invisible from outside.**

Sol's framing is the one to keep: **"That is an uninstrumented failure mode in the board model, not a
personal lapse."** It is the sibling of M9 — M9 is a seat _waiting_ invisibly, M11 is a seat _working_
invisibly on the wrong things. Neither has a signature the board can show.

**15. Convergence is only a trust signal when it is against an EXTERNAL invariant.** The sharpest
epistemic finding of the whole study, and it corrects something sol told me earlier. In the blind
interview they named independent convergence as the team's _"strongest trust signal."_ The structure
reflection then falsified the general form of their own scope finding — four seats had converged in
ten minutes and all four withdrew it:

> Four seats each read their **own** roster line and agreed on a generality **none of them had
> tested.** Every convergence this team correctly trusted tonight was two seats verifying against an
> invariant that existed **outside both**. **Agreement about a shared artifact is weaker than
> agreement about an external invariant.**

That distinction is the difference between the ratify gate working and **a room agreeing with
itself** — and it is a live hazard for any multi-agent system that treats consensus as evidence.
anthill currently has no language for it. Worth its own line in the SOP, independent of everything
else in this investigation.

**16. A postscript that lands on code shipped today.** From the session's last hour:

> `anthill commit` mutating the index made **five seats read four contradictory `git status` results
> within seconds, all correct at the moment taken.** Every seat that checked _content_
> (`git show HEAD:<file>`) agreed. **Status is a moment; content is a fact.**

`anthill commit` already mutated the index (stage → verify → commit); today's unstage-on-failure fix
(`2170636`) adds mutation on the failure path too. It makes a bounced seat stop blocking peers, which
is right — but it also means **`git status` is even less stable as a shared reference during a land
window.** The reflex the team derived (_prefer content over status when establishing a fact_) belongs
in the SOP next to their provenance-first convention, and this is a consequence of anthill's own
design that we should state rather than let each team rediscover.

### Options Considered

Deliberately **not** narrowed to a recommendation. Recorded so the eventual decision is an argument
rather than a preference:

- **(a) Continue mitigating** (move C: lane-aware gate, pre-flight scoping). Cheapest; addresses M2
  partially and nothing else. Sol's team proposed two such mitigations and falsified both.
- **(b) Per-seat worktree isolation.** Addresses M1–M3 at the cost of per-project provisioning, and
  degrades M6 in teams without a contract layer (anthill has one — see observation 1).
- **(c) Per-role isolation — verify only.** Independently requested by **two** teams: media-buffet
  asked for _"an isolated verify worktree"_; dream-flute's prism adopted it unilaterally as a **hard
  rule** (_"EVERY sha-bound verdict runs in `git worktree add --detach`"_). Addresses M3 precisely,
  M1/M2 partially, and is the only option with existing field proof inside these teams.
- **(d) Change the gate contract, not the tree** — e.g. bootstrap detecting whole-tree hooks and
  recommending staged-file scoping. Addresses M2 at its actual cause, but the cause lives in the
  _host project_, which constrains how far anthill may go.
- **(e) Do nothing structural; address M7/M8 instead.** The two unmodelled mechanisms have no fix
  proposed at all, and M8 (lead bottleneck) cost a full lane rewrite in a single session.

## Recommendation

**Characterize now; decide after measurement.** Specifically:

1. **Keep [`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) scoped to M5
   only.** It is the one mechanism that is fully understood, has an unambiguous fix, and does not
   interact with the others. It can ship without prejudging anything here.
2. **Do not adopt or reject isolation yet.** Two of the four open questions below are answerable only
   by measurement, and one is answerable only by sol.
3. **Correct the roadmap's claim that move C is "largely obviated" by the branch work.** It is not —
   they address different mechanisms. _(Done 2026-07-27.)_
4. **Treat M7/M8 as first-class.** They are unmodelled, unfiled, and one of them has a measured cost.

**Rationale:** the deciding factor is that no candidate fix covers more than three of eleven
mechanisms, and the two most severe by consequence (M3 wrong verdicts, M8 lane rewrites) are
addressed by _different_ fixes than the most frequent (M1/M2). A single structural change chosen now
would be optimizing for the loudest mechanism rather than the costliest.

## Next Steps

> **✅ operator-mono's finalize landed 2026-07-28** (grapevine `anthill-research` #6) and is folded
> in: it added M9 and M10, the staged-snapshot gate option, and the seam-granularity refinement.
> **Still not answered:** the two cost questions below. sol answered the finalize ask and did not
> reach the provisioning questions — which is the right priority order on their side.

- [ ] **Evaluate the staged-snapshot gate (observation 10) before evaluating isolation.** It targets
      the mechanism both teams rank costliest, at a fraction of isolation's cost. Prove the two
      preconditions first — safe nesting with `lint-staged`'s own stash, and safe restore on failure.
      **A gate that can lose a peer's uncommitted work is worse than the jam it fixes.**
- [ ] Still open with sol: isolation provisioning cost in a 6-surface monorepo, and whether
      non-verify seats would keep worktree discipline under load. **Mark both as primed** when they
      arrive (see the caveat under Evidence Gathered).
- [ ] **M9 has a documentation half that can ship immediately**, independent of the instrumentation
      half: the skills imply the lead is an exclusive human channel, and `anthill spawn`'s tmux
      topology makes that false by construction. Correct the claim; instrument the waiting state
      separately.
- [ ] Open a line for **M10** — a "reconcile the plan" beat after any ruling that falsifies a seam.
      Note the shipped finalize owner-reread beat catches this only at the end, and only for
      seat-owned docs.
- [ ] **Land the three ratify-gate sharpenings as one pass** — they are independent of the git
      question and are the cheapest high-value work in the whole set:
      [skeletons state contracts](../backlog/2026-07-28-plan-skeleton-states-contracts-not-implementations.md)
      (_"would have saved most of a session"_) ·
      [ratification granularity](../backlog/2026-07-28-seam-ratification-granularity.md) ·
      [runtime claims need a repro](../backlog/2026-07-27-ratify-runtime-claims-need-repro.md).
- [ ] **Give the SOP language for convergence (observation 15).** Agreement about a shared artifact
      is not evidence; agreement against an external invariant is. anthill has no words for this and
      it is a live hazard in any system that treats consensus as a signal.
- [ ] **State the status-vs-content reflex (observation 16)** — a consequence of `anthill commit`'s
      own index mutation, and something each team currently rediscovers.
- [ ] **M11 needs a home.** A scope can be correctly worded (a function, not a stack) and still hide
      an undelivered deliverable. Related to bootstrap's composition step and to the board model;
      belongs with M9 in a coordination-instrumentation line, not with the git mechanisms.
- [ ] Decide whether **option (c) — verify-only isolation** deserves its own slice, given it has
      two independent field requests and one unilateral adoption.
- [ ] Instrument for rates (see open question 1) — likely via
      [research probes](../projects/research-probes/proposal.md), which exists for exactly this.
- [ ] Open a separate line for **M7/M8**; neither belongs to the shared-tree question.
- [ ] Revisit `paper-cuts.md`'s role given two of four projects leave it empty (observation 8).

## Open Questions

1. **Rates.** All evidence is anecdotal. Sol's "five incidents, one session, all seats" is the firmest
   number we have. Which mechanism actually costs the most per session — and is M2's apparent
   dominance real, or a reporting artifact of being the most _visible_ failure?
2. **What does isolation cost in each stack?** dream-flute's answer is concrete and non-trivial.
   operator-mono's is pending. If provisioning exceeds the friction removed, (b) and (c) both weaken.
3. **Would non-verify seats keep worktree discipline under load?** prism does — but rigor about
   _which tree am I on_ is prism's whole job. The cautionary precedent is sol's own livelock: a norm
   requiring memory failed at 7 seats. #61's finding generalizes it: _a rule you must remember is a
   rule that fails under load._
4. **Does M6 worsen under isolation when a ratify gate exists?** The published finding
   (isolation → clean-merging semantic conflicts) comes from teams without contracts. Observation 1
   suggests anthill's contract layer may be immune. **Untested, and it is the crux of option (b).**

## References

**Related Documents:**

- [`shared-tree-gate-tension`](../projects/shared-tree-gate-tension/proposal.md) — the predecessor
  framing (moves A + B1 shipped; move C deferred, **not** obviated).
- [`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) — M5 only.
- [`anthill commit` correctness batch](../backlog/2026-07-27-anthill-commit-correctness-batch.md) —
  the shipped M1/M2 mitigations.
- [Shared live-service lock](../backlog/2026-07-27-shared-live-service-lock.md) — M4.
- [Research probes](../projects/research-probes/proposal.md) — the instrument for open question 1.
- [Seat subagent orchestration](2026-07-09-seat-subagent-orchestration.md) · [Agent signal-hunger](2026-07-08-agent-signal-hunger.md) — siblings that also hinge on observing agents rather than asking humans.

**Primary sources outside this repo:**

- `dream-flute` — `.anthill/paper-cuts.md` (pc#2, #19), `.anthill/dev/prism.md` (the "which-tree trap",
  the false RED, the detached-worktree hard rule).
- `media-buffet` — `.anthill/paper-cuts.md` 2026-07-08 #3 (isolated verify worktree), and the
  positive signal on the isolated-verify-daemon pattern.
- `operator-mono` — the live interview with `sol` (grapevine `anthill-research`, msgs #2–#3).

**External:**

- [OpenAI Symphony SPEC.md](https://github.com/openai/symphony/blob/main/SPEC.md) — mandatory
  isolation, coordination an explicit non-goal.
- [Jcode Swarm](https://jcode.sh/swarm) — the opposing camp: shared repo + file-read notification.
- [Worktree isolation patterns](https://zylos.ai/research/2026-02-22-git-worktree-parallel-ai-development/) ·
  [multi-agent workspaces](https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace)
  — including the finding that worktrees solve file collisions but not semantic conflicts.

## Notes

The methodological lesson is worth keeping separate from the findings: **the issue tracker ranked the
mechanisms almost inversely to their severity.** M2 has six issues and is survivable; M3 produces
incorrect verify verdicts and has one; M7 and M8 cost real rework and have none. Friction gets filed;
wrong answers get quietly corrected, and adaptations become habits nobody thinks to report.

Every finding here that changed the model came from a living doc or a live conversation — not from a
ticket. That is a standing argument for reading the consuming projects directly, and it is also the
strongest existing case for the [research probes](../projects/research-probes/proposal.md) instrument.

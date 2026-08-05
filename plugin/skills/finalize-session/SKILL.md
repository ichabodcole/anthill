---
name: finalize-session
description: The end-of-session KNOWLEDGE ritual for the project's agent team — each seat synthesizes what it learned into its own living doc, a shared pass over seams.md captures team-level truth, a structure reflection asks whether the team shape still fits, a retro records testable hypotheses for next session, and each seat lands its own doc before the lead tears the session down. Use at session wrap when the human says "finalize the team session", "wind down the team", "wrap up the team", or work is ending. DISTINCT from landing the code — this captures the team's knowledge so it isn't lost.
---

# anthill: Finalize Session (the knowledge ritual)

The END touchpoint. It captures what the team **learned** this session so the knowledge isn't lost when
the terminals close — distinct from landing the _code_. This is what makes the living docs actually
_live_. Don't skip it on a real session.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin
> skill runs.) Doc paths below show the **defaults** (`.anthill/…`); the real locations resolve from
> `.anthill/config.json` (`paths.teamDir` / `paths.seatDir` / `paths.seams`).

## Steps

### Kickoff — the lead triggers the ritual

0. **Broadcast the start on the vine.** The seats are in **separate panes** — nothing makes them
   synthesize unless told. The lead posts on the channel: _"Finalizing — every seat run your
   `anthill:finalize-session` synthesis (steps 1–2) now and confirm on the vine when your seat doc is
   landed."_ Then the lead **gathers confirmations** and does not proceed to land + teardown (step 6)
   until **every present seat has confirmed** — knowledge capture is the whole point, and a torn-down
   pane can't synthesize.

   **Subagent-mode finalize (bake the capture into the task, don't chase it after).** A one-shot
   `Task`/`Agent` subagent isn't on the vine waiting to be told to finalize. You _can_ resume it
   (retain its id, `SendMessage` it back with context) — but that means holding every seat's id and
   firing a second round at teardown, and a resumed agent may not outlive the session. Far simpler and
   warmer: **the seat self-captures as the FINAL step of its own work task**, while its context is
   freshest (bake this into the dispatch brief — see `anthill:convene`). That final step:
   - **Writes durable lessons into its own seat doc** (`dev/<handle>.md`) directly — seat docs are
     per-handle, so parallel seats never collide there.
   - **Returns** (does not write) any `seams.md` boundary-truth candidate + a short synthesis summary —
     `seams.md` is shared/single-owner, so the **lead** single-sources it from the returns.
   - **Does not commit** — a one-shot subagent may not outlive the session, so the **lead** lands its
     seat doc on its behalf. (A _terminal_ seat lands its own; see step 2.)

   The lead's residual finalize then shrinks to what is inherently whole-session: the `seams.md` pass
   (step 3), the structure reflection (step 4), the anthill-upstream feedback aggregation (step 5), and
   **folding in late, verification-driven lessons** a seat couldn't have known when it finished — **the lead attributes these into the seat's doc
   directly** (robust; the subagent has already returned), or `SendMessage`s the seat to append in its
   own voice _only if it's still resumable_. Then land + teardown.

### Per seat — each agent does this for its own doc

1. **Review your session — two passes:**
   - **Reactive:** the work you did + the ah-ha judgments in your scratch (`.anthill/scratch/<handle>/…`)
     — what bit, what surprised you, what you'd do differently.
   - **Reflective:** even if the session ran _smoothly_, did anything you trusted **by default** — a
     contract, a default, an assumption this seat never questioned — turn out to be load-bearing in a way
     worth naming? Smooth runs hide exactly these, and a quiet assumption that held is often the most
     durable lesson. (Reactive catches friction; reflective catches assumptions — both become seat-doc
     scars below.)
2. **Synthesize → your seat doc** (`.anthill/dev/<handle>.md`) — this is curation as pheromone:
   **strengthen the load-bearing trails, let the unimportant ones fade.**
   - **Route, don't re-sort** (the SOP's _one intake, route at synthesis_ rule). Your scratch was one
     cheap intake — synthesis is where each note finds its durable home: your seat doc (taste),
     `seams.md` (a boundary truth), or `paper-cuts.md` (tooling friction).
   - Promote durable **judgments** (the reasoning + the generalizable lesson — not lesson-less events).
   - **Prune / compact** — keep it lean; shed stale lines (split to a `<handle>/` folder only if it
     genuinely earns it).
   - **Pin** each lesson to a green test where you can; to a durable concept or a commit otherwise;
     never to a transient line/file reference.
   - If a lesson is really **shared truth** (about a boundary between seats), it belongs in `seams.md`
     (next), not your seat doc.
   - **A HYPOTHESIS is not a lesson — hold it for the retro (step 4.5).** A lesson says what you now
     know; a hypothesis says what you predict and how it could be proven wrong, and the next convene
     has to read it back. **`.anthill/retro.md` does not exist yet at this step**, which is exactly
     why this line is here: two seats on the ritual's first run independently wrote their hypotheses
     into their seat docs, from correct reasoning — a hypothesis nobody re-reads is worthless, and at
     step 2 the seat doc is the only home with a re-read moment. **The ordering created the
     violation, not the seats.**
     The split that resolves it: **team-level hypotheses → `retro.md`** (the lead collects them at
     4.5, and convene reads them back); **a hypothesis only you will act on → your seat doc**, which
     you re-read at join. Either way, **state it once** — a prediction copied into two homes drifts,
     and a stale prediction is worse than a stale lesson because it commissions work against a world
     that has already moved.
   - Your scratch is **disposable after synthesis** — the durable form is the seat doc.
   - **⚠ WRITE YOUR EPITAPH — LAST, and it goes FIRST in the doc.** One sentence at the top of
     `.anthill/dev/<handle>.md`, under the seat header and **above "Who I am"**: the single thing you
     want the next holder of this seat to know, above all else. _It has to be first or it is not an
     epitaph, it is an appendix._
     - **Exactly one thing.** The whole discipline is the selection — everything the seat knows
       competes for the slot and one wins. **Write it after synthesis**, because you cannot know
       which it is until then, and **address it to your successor in the second person**: they will
       not remember this session, and they are the only reader who matters.
     - **The selection test:** _what would go wrong if the next instance did not know this?_ If the
       answer is _"nothing specific, but they'd be poorer"_, it is a hard-won lesson and it already
       has a home lower in the doc. **The epitaph is for the thing whose absence produces a concrete,
       recurring failure.**
     - **Expect the technical candidate to lose.** Run across six seats, **every** one that won was
       about disposition — what this seat must refuse, what it will be tempted to defer to, what
       nobody else will tell it. Not because the technical answers were wrong: **the technical
       surface will have moved by the time anyone reads it, and the shape of how this seat goes wrong
       will not.**
     - **Superseding a predecessor's epitaph does not delete it.** Move it to
       `## Epitaphs — the lineage` at the bottom, dated, **and say why yours replaces it.** An
       epitaph that is still true does not get demoted for being old — and **"still true" is a real
       verdict to reach**: keeping a predecessor's because it kept earning itself is a stronger
       finalize than minting a fresher one that says less.
     - **Why this is a gated beat and not a matter of taste:** it is the one artifact where
       session-end loss is **total**. There is no scratch to recover it from and no peer who can
       write it for you, so it happens here or it silently never happens. **It is also stigmergy's
       sharpest form** — curation forced to n=1, chosen by the only instance qualified to choose it.
   - **Land your own seat doc yourself** — with the land command `anthill join <you>` emitted, passing
     your own doc as the path. **It already carries your project's gate in front of the commit and reads
     the message from a file (`-F`); do not retype it as an inline `-m`.** A synthesis message is exactly
     the kind that quotes a command or a symbol in backticks, and **the shell executes a backticked span
     before the tool ever sees it** — that is upstream of any defence the CLI could mount, and it has
     already silently eaten a word out of a landed commit message on this project.
     It has exactly one possible author, no seam, and no other seat's paths in it, so there is nothing
     for a cross-seat land to coordinate. Two things follow, and both were paid for:
     - **The `Anthill-Seat` trailer records who RAN the command, not who authored.** Lead-lands-everything
       stamps every seat's knowledge work with the lead's handle, and _"whose judgment produced this?"_
       stops being answerable. Landing your own makes the trailer **correct by construction**.
     - **It removes the lead as a single point of failure.** One team's lead went quiet and seven paths
       sat uncommitted for **10.2 hours**, one of them untracked — 250 lines of a fix's proof that had
       never been in git. **An absent lead is a normal event; the rule had no answer for it.**
       The old hazard here was a bare `git commit` sweeping a peer's staged file. **`anthill commit` is
       file-scoped and refuses to run without an explicit pathspec** — the guard moved into the CLI, and
       this prose is the last place it hadn't.

2.5. **Re-read every doc you OWN as its authority — and assume it has drifted.**
Before you hand anything to the lead, go back through each contract and doc you own and **verify
every claim against the current code**. Not "skim for anything I'd change" — read it _as the
authority for that boundary_ and check each statement, **proofs especially**: a pinned test or
artifact may have been moved or deleted since you wrote the line.

- **Why this is a step and not a nicety.** Docs get written mid-build, when the reasoning is warm
  but the surrounding code is still moving. By finalize the code has moved under them and the prose
  quietly lies — a proof points at a file deleted two commits later; a "lives in `X()`" became
  `Y()`. **None of it fails any gate.** It is invisible until someone reads it as the authority and
  checks.
- **The evidence.** One session ran this pass with four seats. **Every single seat found drift** —
  three corrections in `seams.md` including a proof pointing at a deleted probe artifact; **two
  outright false statements** in another contract (wrong function named as a field's home, plus a
  wiring claim that no longer held); three stale statements in a third; and two seat docs that had
  restated shared truth, violating the one strict rule. A fifth pass read a contract as its
  **consumer** and caught an unverified claim about to ship as a bogus proof.
- **Consumer lens (optional, cheap).** For a contract you _consume_ rather than own: the producer can
  confirm what's emitted, but only you can confirm it's what you actually read.
- Stigmergy is the whole thesis here: a trail that confidently points the wrong way is **worse than
  no trail**, because the next ephemeral agent has no way to know it's being misled.

### Shared — the lead coordinates over the vine

3. **Seams pass.** As a team, look at `.anthill/dev/seams.md`: did we learn anything at the **team
   level** — a contract that shifted, a boundary that moved? If so, update it **single-source** (the
   owning seat edits; the others point). Don't restate it across seat docs.

3.5. **Reconcile beat — re-read your seat doc against any contract that CHANGED in step 3, and replace
restatement with a pointer.** Every seat, after the seams pass, before the lead lands.

**This is a step because the ordering guarantees the violation, not because seats are careless.** At
step 2 the lesson genuinely _was_ yours — there was no `seams.md` entry to point at, so writing it out
in full was correct. Step 3 then promotes some of those lessons into contracts. **By the time the lead
lands, docs that were right when written are restating shared truth**, breaking the SOP's one strict
rule in the very commit that creates the truth being restated.

- **The evidence.** A four-seat team ran this ritual exactly as written and **all four seat docs plus
  the lead's restated a contract created in the same commit.** Nobody erred; the order produced it.
- **⚠ Do NOT "fix" this by running the seams pass first.** That was the obvious repair and it is
  wrong: **the seat-doc synthesis is what SURFACES the contract candidates** — two of that team's three
  came out of it — so swapping the steps starves the pass. The dependency is circular; **ordering alone
  cannot fix it, which is why this is a third beat rather than a reorder.**
- **The inverse confirms the mechanism.** A second team, different codebase, did **not** hit this —
  because its contracts were landed **as they were ratified**, mid-session, so by synthesis time there
  was already something to point at. So: **land a contract when it's ratified, not at finalize.** That
  removes most of the exposure for free — but not all of it, because a contract that changes _late_
  still needs this beat.
- **How it was caught, which is worth copying:** not by the lead and not by any check. One seat
  re-read her own landed doc against the just-written contracts and **posted a finding about her own
  file rather than quietly fixing it.** The other three then ran the same check on themselves and all
  three found violations — including the two seats who had personally authored the contracts they were
  restating.

4. **Structure reflection** — turn the lens on the team itself (the anthill adapts to the work):
   - **Where did we step on each other?** (overlapping scope → a boundary to draw or a seat to split.)
   - **What were the natural seams?** (the contracts that actually emerged vs. the ones we guessed.)
   - **Who actually owned what?** (vs. the roster on paper.)
   - **Did the composition fit?** (headcount — an idle seat, an overloaded one, a missing lens.)
   - **Did any seat's real work diverge from its stated scope?** (the deeper question — not headcount
     but **shape**: work that drifted across a boundary, a scope now too broad or too narrow, a role
     that's no longer the right cut. **Split / merge / redraw the scope, or reshape the role** — knock
     down the corridor and re-form the walls. Capture the proposed `seats[]` edit + the _why_; this is
     the pheromone signal the next convene acts on.)

   Output flows to seat docs, `seams.md`, and **occasionally the roster/`.anthill/config.json` itself**. If
   you reshape the roster, **re-run `anthill init`** to render any new seat docs (existing are never
   clobbered) and update the `dev/README.md` roster row by hand.

   - **Then ask the routing question: which of these findings are about anthill's MODEL, not this
     team's shape?** Those go **upstream** (step 5), not just into local docs. A finding phrased as
     _"our verify scope was too broad"_ is local; the same finding phrased as _"a scope can name a
     function — the shape anthill recommends — and still hide an entirely undelivered deliverable,
     with no card or board column able to show it"_ is about **anthill's model of scopes**, and every
     future team has it too.
     **This is a real leak, not a hypothetical.** A 7-seat team's reflection found exactly that, and
     correctly named it _"an uninstrumented failure mode in the board model, not a personal lapse"_ —
     and it still never reached anthill, because nothing in this ritual asked it to. **The reflection
     produces the most valuable feedback anthill gets and currently routes none of it upstream.**

4.5. **Retro — three questions, answered as a team. THE LEAD WRITES `.anthill/retro.md` (newest first)
before teardown, from the seats' answers on the wire.**
Name the writer or the file does not get written: seats answer, and every one of them can follow
this step exactly while the artifact still fails to exist. **The first run of this ritual produced
no file for exactly that reason** — the step said what and where, and nobody owned the act.
Capture what you have rather than holding teardown for completeness: **the vine evaporates**, so a
partial retro that exists beats a complete one that died with the panes —
_(**and a durable comms log does not discharge this.** Nothing clears comms, so the words survive —
but a retro nobody re-reads is a write-only store, and the next convene reads `retro.md`, not a log.
**Durable is not the same as re-read**, and the whole point of this step is the second one.)_ and _"two seats did not
answer"_ is itself a result about the ritual, not an embarrassment to paper over.
Distinct from step 4: the structure reflection asks about the team's **shape**; the retro asks for
**judgement about the session**. Also distinct from the friction sweep in step 1 — that collects what
happened, this evaluates it.

1.  **What went well?**
2.  **What didn't go well?**
3.  **What would you change for the next round?**

Two rules do all the work here. Without them a retro produces a mood, and a mood cannot be checked.

- **Q3 answers are HYPOTHESES the next session can test, or they are not answers.** _"We should
  communicate better"_ is untestable and dies in the doc. _"Announcing a shared-file hold before
  editing will eliminate collision rework — if it doesn't, the hazard isn't announcement latency"_
  can come back wrong, and a prediction that fails precisely teaches more than one that survives.
  **A change you cannot test is a preference wearing evidence's clothes.**
- **Ask of every Q1/Q2 answer: what is behind this besides us agreeing?** A retro is the most
  consensus-prone thing the team does — it asks agents who shared a session, a channel and a frame
  to evaluate it, and convergence will feel like validation when it is just the expected output of
  shared priors.
  - **Claims about ARTIFACTS are executable** — _"the gate is green"_, _"follow doesn't backfill"_,
    _"3 of 3 proof citations are wrong"_. **Run it.** When an artifact answers, nobody agreed with
    anything and shared priors cannot degrade it.
  - **Claims about US are testimony** — _"coordination went well"_, _"the ratify saved rework"_.
    Not worthless, but **label them**, and prefer the version carrying a number, a timestamp, a diff
    or a count. **Convert where you can:** _"the ratify saved rework"_ is testimony; _"the contract
    found three pre-existing violations on first use"_ is the same claim with an artifact behind it.
- **A unanimous Q1 is a smell, not a result.** If everyone names the same success, ask what would
  have had to happen for anyone to notice otherwise — and write **that** down too.
- **The lead is in scope, and a retro where the lead comes out clean is a retro that did not run.**
  Q2 is not a politeness exercise. Deference is the specific failure this format is exposed to: on
  one team, three seats accepted the lead's correction on sight and each amplified it against
  themselves — and part of it was wrong. **Unanimous deference would have carried a false claim
  into a document with nothing to check it against.**
  - **And the lead should NOT open by listing his own errors.** It reads as the opposite of
    defensiveness and it is not: **a lead who self-lists well pre-empts the audit**, because there is
    nothing left for a seat to do but concur, and the resulting document is indistinguishable from
    one where the audit found nothing. _Observed: an observer seat checked and found **no seat
    produced a criticism of the lead he had not already volunteered.**_ Say you are in scope, then
    say nothing further until the seats have written.
- **Commissioning a cold reviewer? GIVE IT THE TREE, NOT THE WIRE.** A blank-context reviewer is the
  one instrument a retro's shared frame cannot contaminate — and that only holds while it reads
  **committed artifacts**. Point it at the repo, the shas, the diffs, the tests.
  - **Do not paste in the channel log, and do not summarise the session for it.** Both hand it the
    team's framing, which is the single thing it was commissioned not to have. **Its value is
    incomprehension**, and a helpful briefing destroys exactly that.
  - _Worth stating because on most setups this protection is **accidental**: the wire is typically
    gitignored, so a reviewer working from a clone cannot reach it — until someone helpfully pastes
    it in. **A safeguard that survives only until a well-meaning person acts is not a safeguard**,
    which is why it is written here rather than assumed._

**4. Did this session produce a PRINCIPLE?** Asked once, at the end, and **usually the answer is
no.** A principle is a claim about **how work goes wrong**, general enough to survive a change of
tool, stack or team — not a convention and not a mechanic. It goes in `.anthill/principles.md`
**with the scar that paid for it**: a principle without its experience is a slogan, and the
experience is what makes it hold when following it costs something.

- **A principle needs a scar, not a case.** A good argument is not enough. If nothing has gone wrong
  yet it is a hypothesis, and Q3 is where hypotheses go.
- **Never add one mid-session.** The pressure to generalise peaks exactly when you have just been
  burned, which is when the generalisation is worst.
- **If it only holds for this tool or this repo, it is a practice** — those live in the SOP.

Keep it small. Three questions and these two rules are the whole ritual — **if it needs a taxonomy,
it has gone wrong.**

5. **Aggregate the team's anthill-upstream feedback.** Beside the seams pass, do the same single-source
   move for the feedback candidates the team surfaced this session about **anthill itself** (not this
   project). Read the **same intake** you already swept — the vine, the seats' scratch, their finalize
   returns (no separate store). **Dedupe** them (N seats hitting one bug is one issue, not N) and
   **submit** the deduped set with `anthill feedback "…" --submit` — the outward send the lead owns,
   mirroring how you single-source `seams.md` from the returns. _(Distinct from this ritual's own
   feedback pointer below: that captures feedback about the finalize ritual; this aggregates the team's
   feedback about anthill.)_

### Land + close — the lead

6. **Stand the team down — the closing checklist.** End-of-session "we're done" momentum is exactly
   when these get skipped, so run them as a list, in order:
   - ◻ **Every seat confirmed** its finalize on the vine (step 0). Knowledge capture is the whole
     point; a torn-down pane can't synthesize. _(Subagent mode: the seats' returned in-task syntheses
     **are** the confirmation — no vine gate; the seat docs are already written.)_
   - ◻ **Every seat re-read the docs it owns as their authority** (step 2.5) and verified each claim
     — proofs especially — against current code. Assume drift; the one session that measured this
     found it in **every** seat's docs.
   - ◻ **Every seat reconciled its doc against contracts that CHANGED this session** (step 3.5) —
     restatement replaced with a pointer. The ordering makes this violation the default, not the
     exception: a four-seat team hit it in all five docs at once.
   - ◻ **Principle question asked** (Q4) — did this session produce one? **Usually no.** If yes it
     goes to `.anthill/principles.md` **with its scar**; if it has no scar it is a Q3 hypothesis, and
     if it only holds for this tool it is an SOP practice.
   - ◻ **Retro written to `.anthill/retro.md` BY THE LEAD** (step 4.5), newest first — the seats
     answered on the wire; **a wire is not a store — the file is the thing the next convene reads.**
     _(True whichever wire they answered on: the vine is cleared at convene and the comms log is
     never read back by anything. **Surviving and being re-read are different properties**, and only
     the file has the second.)_
     **Every Q3 answer is a
     hypothesis the next convene can test**, not a preference. Check one thing before you land it:
     **is any Q1/Q2 answer carried only by everyone agreeing?** If it has no artifact, no number and
     no count behind it, either attach one or label it as testimony. A retro that skips this is the
     one that reads well and cannot be checked.
   - ◻ **Every seat wrote its EPITAPH** — one sentence at the top of its own doc, above "Who I am",
     or an explicit _"keeping my predecessor's, because it is still true"_ with the reason. **Gate the
     teardown on this the way you gate the synthesis confirmations:** it is the one artifact with no
     scratch to recover it from and no peer who can write it, so a seat that drops off without one
     takes it with it. **A silent absence is the expected failure here** — ask each seat to say which
     it did, and treat "kept the predecessor's" as a complete answer, not a skipped beat.
   - ◻ **Every seat landed its OWN doc** — with the land command its own `anthill join` emitted (gate
     and commit in one, message from a file), never `git add -A` and never an inline `-m` for a body
     containing backticks. The `--as` it carries stamps the seat trailer, and because each seat runs its
     own commit the trailer names the actual author rather than whoever happened to hold the land.
   - ◻ **The lead landed anything CROSS-SEAT atomically** — a `seams.md` contract plus the skill that
     points at it, a CLI change plus the doc describing it. **This is what lead-owns-the-land is for:**
     work spanning owners that would, landed in pieces, leave a trail asserting something untrue for
     as long as the gap lasts. It is a reason, not a blanket — a single-author file is not cross-seat
     work.
     - **Red tree? (a slice deliberately held red for an atomic land.)** The pre-commit gate runs the
       **whole** suite on every commit, so a held-red tree fails each seat-doc commit and **deadlocks
       this step** — the docs can't land while the code is red. Don't fight the gate; park everything,
       land the docs green against a clean tree, then restore the slice. You always know the **doc**
       paths (the seat living docs), so pivot on those — no need to enumerate the red slice:
       1. **Stash the red slice — BY PATH, and only stash-all if you are genuinely alone in the tree.**
          `git stash push -u -- <red-paths…>`. The `-u` sweeps in untracked red files too, which a
          patch of `git diff HEAD` would silently drop.
          **⚠ Bare `git stash push -u` means EVERY seat's uncommitted work, not just yours.** Seats
          share one tree — and `refs/stash` is shared **even across per-seat worktrees**, where
          nothing else is. So the unscoped form reverts your peers to `HEAD` underneath them, with no
          announcement, at the exact moment they may still be writing their own seat docs. **And
          `anthill commit`'s serialize lock does not cover `git stash`** — it is the one mutation
          around here with no mutex at all.
          **The failure is invisible in the direction you are looking:** the gate goes green, which
          is what this recipe told you to check, and _"green because the red slice is parked"_ is
          indistinguishable from _"green because I also parked three seats' unrelated work."_
          **If you do not know the red paths, find them — do not reach for the unscoped form as the
          shortcut.** _(This step used to give stash-all as the default and the by-path form as an
          optimisation in a parenthetical. That ordering was backwards: the safe version was offered
          only to a reader who already knew enough not to need it.)_
       2. **Bring back only the docs** — `git checkout stash@{0} -- <doc-paths…>`. Now the tree holds
          just the seat docs (markdown → the gate passes); the red slice stays parked in the stash.
       3. **Land the docs against the now-green tree** — each seat commits its own
          (the land command its `anthill join` emitted, naming its own doc); the lead lands only genuinely cross-seat
          docs together. The pivot exists to make the tree green, not to move authorship.
       4. **Restore the held slice** — `git stash pop`. The stash's doc hunks are already committed
          verbatim, so they re-apply as a clean no-op; the red slice (tracked edits **and** untracked
          new files) comes back intact, and the atomic code land proceeds as planned.

       _(Know the red slice's exact paths? Skip the stash-all pivot and park just those:
       `git stash push -u -- <red-paths…>` before step 3, `git stash pop` after — same result, as long
       as `<red-paths…>` is disjoint from the doc paths so a doc edit isn't stashed away with it.)_
   - ◻ **Board settled — best-effort, never a gate** (cards → review/done). If the board idle-died or is
     unreachable, **don't block finalize on it**: the **git history and the comms log ARE the session's
     durable record**. Attempt a settle once; if the board's gone, say so on a wire and move on.
     - **Do not substitute the grapevine here.** The lead clears the vine at convene (`--fresh`), so
       it is the wire that is _designed_ not to outlive the session; **nothing clears the comms log.**
       Naming the vine as the durable record is the exact inversion this ritual exists to prevent —
       and per the standing principle, **a decision that must outlive the session belongs in an
       artifact anyway**, not in either wire.
   - ◻ **Human sign-off before the code branch merges to `develop`.** Green tests and a checked-off
     board are the team's _own_ signals — but the human's look (UI bugs, the feel, feedback) is a gate
     the team **cannot run itself**. Get an explicit "yes, merge it" before you land the feature branch
     to `develop`; the knowledge ritual above is separate from and precedes this code merge. Don't let
     momentum merge it unseen.
   - ◻ **Tear down:** **`anthill down`** — the session is named after the **channel**
     (`config.channel`) by default, so it resolves with no arguments. It **refuses to kill while seats
     are still present on the channel** (pass `--force` to override) — that presence guard is your
     backstop against yanking a seat out mid-ritual. (If you spawned with a custom `--session <name>`,
     pass the same here.)
     - **It refuses on TWO states, not one, and the second is the one you will actually meet.** It
       blocks when seats are **present**, and equally when presence **cannot be established** — because
       tearing down panes without knowing whether anyone is working in them is the failure the guard
       exists to prevent, and _"I could not tell"_ is not _"nobody is there."_
     - **So `--force` at the end of a finished session is EXPECTED, not a workaround.** A seat that has
       stood down cleanly leaves no positive signal saying so, which reads as _cannot establish_ rather
       than _gone_. **Do not let that train you to reach for `--force` reflexively** — the one session
       where it matters is the one where a seat really is still working, and it looks identical from
       here. Read who it names before you override it.
     - **The refusal names the CHANNEL and no wire, deliberately** — don't "fix" it to name one. The
       verdict is drawn from more than one wire, the message cannot know which were consulted, and a
       sentence naming today's wires goes wrong the next time one is added. _This paragraph itself said
       "on the vine" for a full release after that stopped being true._

## Output

Every seat doc reflects what its agent learned; `seams.md` reflects any team-level truth; the structure
reflection has had its say; the session's knowledge is captured in the anthill, not lost when the
terminals close.

## Skill feedback

If this ritual was rough — a step unclear, friction in the synthesis or the seams pass — capture it (a
scratch note, or flag the lead / the human) so the next revision fixes it. The rituals improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** even when it ran clean, did anything you trusted **by
default** — a step's assumption, a default this ritual left implicit — feel like it might not always
hold? Smooth runs suppress exactly that signal; name it anyway.

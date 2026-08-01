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
   - Your scratch is **disposable after synthesis** — the durable form is the seat doc.
   - **Land your own seat doc yourself** — `anthill commit --as <you> -m "…" .anthill/dev/<you>.md`.
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
partial retro that exists beats a complete one that died with the panes — and _"two seats did not
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
   - ◻ **Retro written to `.anthill/retro.md` BY THE LEAD** (step 4.5), newest first — the seats
     answered on the wire; **the wire evaporates and the file is the only thing that survives.**
     **Every Q3 answer is a
     hypothesis the next convene can test**, not a preference. Check one thing before you land it:
     **is any Q1/Q2 answer carried only by everyone agreeing?** If it has no artifact, no number and
     no count behind it, either attach one or label it as testimony. A retro that skips this is the
     one that reads well and cannot be checked.
   - ◻ **Every seat landed its OWN doc** — `anthill commit --as <you> -m "<msg>" <your paths…>`, never
     `git add -A`. The `--as` stamps the seat trailer, and because each seat runs its own commit the
     trailer names the actual author rather than whoever happened to hold the land.
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
       1. **Stash all uncommitted work** — `git stash push -u` (the `-u` sweeps in untracked red files
          too, which a patch of `git diff HEAD` would silently drop). The tree is now at `HEAD`, so the
          gate is green.
       2. **Bring back only the docs** — `git checkout stash@{0} -- <doc-paths…>`. Now the tree holds
          just the seat docs (markdown → the gate passes); the red slice stays parked in the stash.
       3. **Land the docs against the now-green tree** — each seat commits its own
          (`anthill commit --as <you> -m "…" <your doc>`); the lead lands only genuinely cross-seat
          docs together. The pivot exists to make the tree green, not to move authorship.
       4. **Restore the held slice** — `git stash pop`. The stash's doc hunks are already committed
          verbatim, so they re-apply as a clean no-op; the red slice (tracked edits **and** untracked
          new files) comes back intact, and the atomic code land proceeds as planned.

       _(Know the red slice's exact paths? Skip the stash-all pivot and park just those:
       `git stash push -u -- <red-paths…>` before step 3, `git stash pop` after — same result, as long
       as `<red-paths…>` is disjoint from the doc paths so a doc edit isn't stashed away with it.)_
   - ◻ **Board settled — best-effort, never a gate** (cards → review/done). If the board idle-died or is
     unreachable, **don't block finalize on it**: the **git history and the grapevine ARE the session's
     durable record**. Attempt a settle once; if the board's gone, note it on the vine and move on.
   - ◻ **Human sign-off before the code branch merges to `develop`.** Green tests and a checked-off
     board are the team's _own_ signals — but the human's look (UI bugs, the feel, feedback) is a gate
     the team **cannot run itself**. Get an explicit "yes, merge it" before you land the feature branch
     to `develop`; the knowledge ritual above is separate from and precedes this code merge. Don't let
     momentum merge it unseen.
   - ◻ **Tear down:** **`anthill down`** — the session is named after the **channel**
     (`config.channel`) by default, so it resolves with no arguments. It **refuses to kill while seats
     are still present on the vine** (pass `--force` to override) — that presence guard is your backstop
     against yanking a seat out mid-ritual. (If you spawned with a custom `--session <name>`, pass the
     same here.)

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

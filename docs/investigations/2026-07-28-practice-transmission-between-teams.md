# Investigation: how does evolved team practice get back into the methodology anthill ships?

**Date Started:** 2026-07-28
**Investigator:** Claude Code (maestro) + Cole
**Status:** Active
**Outcome:** Gap confirmed with a worked example; **candidate mechanism identified, needs
experiment.** Not ready to build.

---

## Question / Motivation

anthill's thesis is stigmergy: an agent leaves traces, the next agent follows them. **Inside a
project this works.** Seat docs are genuine pheromone trails — `dream-flute`'s verify seat doc is
1,200 lines of hard-won reflexes, and the next instance to take that seat inherits all of it.

**Between projects it does not work at all.** Each consuming project is a separate colony. anthill —
the plugin — is the only substrate they share, and it has a path for **complaints** (file an issue →
fix → ships in a skill) and **no path for practice**. So a team that evolves a genuinely better way
of working codifies it locally, and every other team re-derives it from its own scars.

The [feedback-instrument item](../backlog/2026-07-28-feedback-instrument-elicits-not-collects.md)
covers extracting _problems_ better. This is a different loop: **evolved practice travelling upward
into the shipped methodology, and back down to the next team.** The down-leg already exists — skills
carry guidance. It is the **up-leg that is missing entirely.**

## Current State Analysis

Two containers exist for this and are effectively empty:

- `docs/playbooks/` — one entry, and it was **materialized from HiveMind**, i.e. imported from
  outside rather than harvested from a team.
- `docs/lessons-learned/` — one entry, from the first external bootstrap.

Six weeks, four teams, thousands of lines of accumulated seat-doc practice, and **nothing has flowed
up into either container.** That is not neglect; there is no ritual, prompt, or command that routes
anything there. The containers were built and the pipe was never connected.

Meanwhile the down-leg demonstrably works when a discovery happens to be complaint-shaped: the
shell-metacharacter trap was filed as friction by two teams and **is now a line in the join
checklist**. So transmission is possible. It just requires the discovery to arrive disguised as a
bug.

## Investigation Findings

### The worked example: four practices, independently derived twice

Two verify seats, two projects, entirely different stacks — `dream-flute` (Rust DSP + browser) and
`operator-mono` (Postgres + Electron + Expo). No contact. Neither team's docs reference the other.

**1. A verdict must be bound to a first-hand artifact, never to a description of one.**

> `argus`: _"a seat's own report is a claim, not proof."_ … _"Verify against the LIVE artifact, not
> its description: query the running Postgres for a deployed constraint (not the migration file), RUN
> a pure matcher on your own cases (not read its test), RUN the real parser on a fix (not the diff)."_

> `prism`: _"you need a **same-wire control**: the same bytes, through the same path."_ … _"I
> presented a non-same-wire diff as 'airtight live-vs-offline,' and a wrong engine-unfreeze
> recommendation rode it all the way to Cole."_

Same principle, two vocabularies ("live artifact, not its description" / "same-wire"), each learned
from its own documented failure.

**2. The check that de-escalates your own finding matters as much as the one that escalates it.**

> `argus`: _"Finishing the check that DE-ESCALATES your own finding matters as much as the one that
> escalates it, and the pull not to bother is strongest right after the lead has accepted and acted
> on it."_

> `prism`: _"My own artifacts get the adversarial checks I give everyone else's — authoring-side
> discipline, proven 3× in one session."_

**3. Redundant re-verification is not rigour.**

> `argus`: _"redundant re-verification isn't rigor, it's wasted effort that could have covered a
> genuinely untested axis instead."_

> `prism`: _"separate harness-can't from product-can't"_ — don't file a product defect for a limit of
> your own instrument.

**4. Resolve a state dispute by posting the artifact verbatim, not by asserting.**

> `prism`: _"Resolve any path/state dispute by posting `git status` FROM THE REPO ROOT verbatim — two
> wrong claims (a peer's inferred 'tracked-modified', my own wrong-cwd status) both dissolved on the
> artifact."_

> `operator-mono`: the spontaneous **provenance-first messaging** convention (_"read of your working
> tree, NOT HEAD"_), plus _"Status is a moment; content is a fact."_

**Four convergent discoveries between two seats. anthill ships none of them.** A verify seat
bootstrapped today starts from a scaffold that says none of this, and will pay for all four again.

### The promotion criterion is already in hand

The obvious hazard in any practice-harvest loop is bloat: anthill accumulating every team's local
taste and shipping a thick book that fits nobody. The
[shared-tree investigation](2026-07-27-shared-tree-failure-modes.md) (observation 15) supplies the
filter, from `operator-mono`'s own structure reflection:

> Agreement about a shared artifact is weaker than agreement about an external invariant.

Applied to methodology: **one team inventing a practice is taste (n=1). Two teams independently
deriving it is evidence that the practice is about the work rather than about the team.** Independent
derivation across different stacks _is_ agreement against an external invariant — the invariant being
the work itself.

So the candidate rule: **a practice promotes into shipped methodology when ≥2 teams derive it
independently.** It is self-limiting by construction, it needs no judgment call about quality, and
the four practices above already satisfy it — which means the rule can be validated against a case we
already have rather than only against future ones.

### Why the current instrument structurally cannot catch these

None of the four is complaint-shaped. Each is a team **succeeding**. A seat that has evolved a
verification discipline experiences it as competence, not friction — there is nothing to file, and
`bug | friction | idea | docs` has no shape for _"here is how we learned to work."_

Worse, the better the practice, the more invisible it is: once internalised, the pain it prevents
stops occurring, so it produces no signal at all.

### The seat-doc diff is a mechanical signal nobody reads

Practice accumulates in a specific, diffable place. `prism.md` is 1,238 lines; `fathom.md` 1,284;
`loom.md` 1,254. **What a seat doc GAINED between sessions is precisely the practice that seat
evolved** — already written, already curated by the seat that learned it, already in git.

No one has ever read those diffs looking for transmissible practice. That is the cheapest available
harvest signal and it requires no cooperation from the teams at all.

## Options Considered

- **(a) Push — a finalize prompt.** The structure reflection asks: _"what practice did this team
  evolve that another team should start with?"_ Cheap, uses an existing ritual. **Weakness:** a team
  cannot tell what is novel versus obvious — they have no view of the other colonies. Likely to
  surface local taste and miss the load-bearing convergences.
- **(b) Pull — a periodic cross-project practice sweep.** Read the seat docs across consuming
  projects, look for independently-derived convergence, promote what passes the ≥2 rule. **This is
  the method that produced today's finding, so it is known to work.** Weakness: expensive, manual,
  and requires access to the consuming projects.
- **(c) Mechanical — harvest seat-doc diffs.** Extract what each seat doc gained per session and
  cluster across projects. Cheapest per-run, no team cooperation needed. Weakness: needs somewhere to
  run and a way to cluster; unproven.
- **(d) Shared substrate — a practice library teams read AND write.** Bootstrap installs it; finalize
  appends candidates; it ships back down with the plugin. The destination if the loop proves out, but
  premature before we know what promotes.
- **(e) Do nothing structural; let convergence surface during investigations.** Today's approach.
  Honest baseline — it worked once. Weakness: depends on somebody running an investigation for an
  unrelated reason, which is how these four surfaced.

## The constraint any mechanism must respect

**Practices ship as offers, not mandates.** `prism`'s same-wire discipline is right for a project with
expensive compiled artifacts and may be pure overhead elsewhere. The
[adapt-not-dictate principle](../../AGENTS.md) applies with full force here — arguably more than
anywhere else, because a methodology is exactly the kind of thing that feels universal to whoever
derived it.

So a promoted practice ships with **the conditions it suited and the scar that taught it**, and the
seat decides. The governing rule from the
[coordination-hardening arc](../briefs/2026-07-28-coordination-hardening-arc.md) — _constrain the
plumbing, leave the collaboration fuzzy_ — puts practice firmly on the fuzzy side. A promoted practice
that arrives as a requirement would convert a good discovery into a straitjacket.

## Recommendation

**Experiment before building.** Specifically:

1. **Run (b) once more, deliberately, as a measurement rather than a by-product.** Sweep the four
   projects' seat docs for independently-derived convergence and see how many practices clear the ≥2
   bar. Today's four came out of an investigation aimed at something else entirely; a deliberate
   sweep tells us whether this is a rich seam or whether we got lucky.
2. **Promote the four we already have**, as the pilot. They are validated by the rule, they are all
   verify-seat practice (so they land in one place), and shipping them tests the down-leg: does a
   promoted practice actually change what the next verify seat does? That is the question the whole
   loop rests on and it is currently unanswered.
3. **Only then decide the standing mechanism.** If the sweep is rich, (c) mechanical harvesting earns
   its build. If it is thin, (e) — surfacing convergence during investigations — may be adequate and
   costs nothing.

**Rationale:** the loop's value depends entirely on whether promoted practice changes downstream
behaviour, and we have never once tried it. Building a harvest pipeline before testing the delivery
end would be optimising the half we understand.

## Open Questions

1. **Does a promoted practice actually transmit?** The core unknown. A verify seat reading _"bind your
   verdict to a first-hand artifact"_ in a scaffold, without the scar that taught it, may simply not
   feel it. Practice may be **irreducibly experiential** — in which case the honest deliverable is not
   a practice library but a set of _prompts that provoke the derivation faster_.
2. **What is the right grain?** `prism`'s same-wire rule is stack-specific in its detail and universal
   in its principle. Ship the principle and it is too vague to act on; ship the detail and it fits one
   project. The [seam-granularity finding](../backlog/2026-07-28-seam-ratification-granularity.md) is
   the same problem in a different costume.
3. **Does ≥2 hold up as a bar?** Two teams sharing a stack, a maintainer and a house style may
   converge for reasons that are not about the work. All four current examples come from projects with
   one human and one plugin in common — that is a weaker independence claim than it first appears, and
   it should be stated rather than assumed.
4. **Who owns the sweep?** It needs read access to consuming projects, which anthill-the-plugin
   structurally does not have. This may be a thing the human does, or a thing a project opts into, and
   that choice shapes every mechanism above.
5. **Is `paper-cuts.md` the already-failed version of this?** It exists to capture friction locally and
   is scaffold-only in two of four projects. Understanding why it stayed empty is probably a
   precondition for building anything that depends on teams writing things down for anthill's benefit.

## References

- [Feedback instrument: collects vs. elicits](../backlog/2026-07-28-feedback-instrument-elicits-not-collects.md)
  — the sibling loop (problems, not practice). **Both share a root cause:** the instrument is shaped
  for complaints, and the highest-value signal is not a complaint.
- [Shared-tree failure modes](2026-07-27-shared-tree-failure-modes.md) — observation 15 supplies the
  promotion criterion; observation 8 documents the invisible-adaptation class.
- [Coordination-hardening arc](../briefs/2026-07-28-coordination-hardening-arc.md) — the
  constrain-the-plumbing principle that bounds how prescriptive a promoted practice may be.
- [Research probes](../projects/research-probes/proposal.md) — if practice turns out to be
  experiential (open question 1), probes are the likelier vehicle than a library.

**Primary evidence:** `dream-flute/.anthill/dev/prism.md` (reflexes 8, 21, 29, 34; scar #138) ·
`Barkdown-editor/operator-mono/.anthill/dev/argus.md` · `media-buffet/.anthill/paper-cuts.md`
(the one project that fills it) · the operator-mono structure reflection, grapevine
`anthill-research` #7.

## Notes

The uncomfortable symmetry worth keeping in view: **anthill is a system for making agent knowledge
survive the agent, and it has no mechanism for making team knowledge survive the team.** The
project's own thesis, applied one level up, is the thing it hasn't built. That is not a criticism of
the design so much as an observation that the design stops at the colony boundary — and four teams
have now generated enough trail to show what is being lost there.

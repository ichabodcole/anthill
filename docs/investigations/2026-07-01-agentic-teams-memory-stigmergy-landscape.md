# Investigation: the agentic-teams landscape — memory, stigmergy, and navigation, for anthill

**Date Started:** 2026-07-01
**Investigator:** Claude Code (deep-research fan-out) + forager synthesis
**Status:** Complete (navigation axis → dedicated follow-up)
**Outcome:** Landscape validates anthill's core bets; several concrete upgrades identified.

---

## Question / Motivation

Map the current landscape of long-form, multi-agent orchestration and "agent team" systems, framed
for what **anthill** can learn from it — across three axes: agent **memory / knowledge persistence**,
**stigmergy** (the evidence a prior agent leaves that the next one reads), and **navigation tooling**
(what helps an agent navigate a project well). Prompted by OpenAI's "Symphony" and GitHub's agent-memory
work; the goal is inspiration for evolving anthill's memory model, its pheromone trail, and its
seat-navigation tooling.

Method: a `deep-research` fan-out — 5 search angles, 24 sources fetched, 112 claims extracted, 25
adversarially verified (3-vote, kill on 2/3 refute) → 16 confirmed, 9 killed.

## Headline

The field is **independently converging on the primitives anthill already runs on** — a shared
coordination surface, durable per-scope memory, and stigmergic (artifact-mediated, no-direct-messaging)
coordination. That is strong external validation of anthill's design. The value is in the *upgrades* the
leaders have that anthill doesn't yet.

## Findings (confirmed, with citations)

### Orchestration / coordination

- **Task-board-as-control-plane is now an industry pattern** — validates the bounty board. OpenAI
  **Symphony** (~April 2026) maps each open **Linear** issue to its own isolated agent workspace (own
  context + lifecycle), and a **supervisor loop** continuously watches the board to guarantee every
  active task has a live agent until done — **restarting agents that crash or stall** (configurable
  `stall_timeout_ms`). _Confidence: high (3-0)._ Sources:
  openai.com/index/open-source-codex-orchestration-symphony, infoq.com/news/2026/05/openai-symphony-agents.
  - **Borrow:** an always-on **liveness guarantee** (a watchdog that detects stalled seats and
    re-spawns them). anthill's seats are durable but their *liveness* is not guaranteed — a real gap.
  - **Contrast:** Symphony is one ephemeral workspace per issue; anthill's **durable seat** that
    outlives many tasks is arguably richer.
  - **Caveat:** Symphony is an open-sourced `SPEC.md` pattern, **not a hosted product**. Build on the
    pattern.

- **"Blackboard architecture" is the 40-year academic name for anthill's coordination pattern**
  (Hearsay-II lineage): a shared public blackboard is the SOLE communication medium, agents never
  contact each other directly, and they coordinate by incrementally building on prior artifacts. Newer
  variants replace master-slave assignment with **self-selection** — subordinate agents monitoring the
  board **decide whether they are fit** to take a posted request. _Confidence: high (3-0)._ Sources:
  arxiv.org/html/2507.01701v1, arxiv.org/html/2510.01285v1.
  - **Borrow:** **pull-based / self-selection bounties** — seats pull the bounties they judge
    themselves suited for, as an alternative or complement to lead-assigns.
  - Both papers keep a central control unit → mirrors anthill's lead + seats (full decentralization
    isn't required).

- **A separate "response board" prevents cross-contamination**: helper-agent outputs are written to a
  distinct board, not back onto the main blackboard, so one agent's (unvetted) output can't negatively
  influence others. _Confidence: high (3-0)._ Source: arxiv.org/html/2510.01285v1.
  - **Borrow:** a "review-gate before it hits `seams.md`" discipline — keep speculative/in-progress
    output off the authoritative shared surface until vetted (partly what the Review column already
    does).

### Agent memory / persistence

- **GitHub Copilot's shipped agentic memory (Jan 2026) is the richest steal target.** _Confidence:
  high (3-0)._ Sources: github.blog/.../building-an-agentic-memory-system-for-github-copilot,
  docs.github.com/en/copilot/concepts/agents/copilot-memory, code.visualstudio.com/docs/copilot/agents/memory.
  - **Citations + just-in-time verification (most novel):** every fact is stored **with citations to
    specific code locations** (e.g. `src/client/sdk/constants.ts:12`), and an agent **re-verifies those
    citations against the current branch before using the memory** — storing a corrected version if the
    code contradicts it or the location is gone. → self-healing memory.
  - **Shared / team memory, not per-agent:** what one Copilot agent learns is usable by the others
    (cloud coding agent, code review, CLI). Validates anthill's shared `seams.md` over pure per-seat
    docs. Retrieval today is **naive recency** (most-recent repo memories injected at session start);
    **search + weighted prioritization is planned but not shipped** → anthill could leapfrog.
  - **Two-tier model:** **repo-level facts** (shared with everyone with repo access) vs **user-level
    preferences** (private, portable **across** repositories). Memories **expire after 28 days**;
    repo-scoped (not cross-project).

- **The Dec-2025 survey "Memory in the Age of AI Agents" gives a ready-made vocabulary/checklist**:
  memory organized along **Forms** (token-level / parametric / latent), **Functions** (factual /
  experiential / working), and **Dynamics** (formation, consolidation/forgetting, retrieval).
  _Confidence: high (3-0)._ Sources: arxiv.org/abs/2512.13564, github.com/Shichun-Liu/Agent-Memory-Paper-List.
  - **Map to anthill:** anthill's living docs are almost entirely **token-level, factual/experiential**
    memory. Two under-served areas: **Dynamics** (anthill has *formation* via finalize but weak explicit
    *forgetting/consolidation*), and a formal experiential/skills tier (partly the brain skills).

### Stigmergy — the evidence agents leave

- **Academic work formalizes and validates the pheromone-trail thesis, with a caution.** **CodeCRDT**
  (Oct 2025) defines **observation-driven coordination**: LLM agents coordinate purely by monitoring a
  shared state with observable updates, "rather than explicit message passing," explicitly grounded in
  **stigmergy / virtual pheromones** (Linda tuplespaces / blackboard lineage). _But_ empirically it
  helped **up to +21.1%** on some tasks and **hurt up to −39.4%** on others (600 trials; 100%
  convergence, zero merge failures). _Confidence: high (3-0)._ Source: arxiv.org/abs/2510.18893.
  - **Borrow + caution:** strong validation of the model, but **parallelizing seats over a shared
    surface is not free** — gate parallel fan-out on task decomposability.
  - **Mechanism difference:** CodeCRDT is *real-time concurrent* over a live CRDT; anthill's trail is
    *asynchronous* (committed docs re-read next session).

## Prioritized borrowable ideas

1. **Citation-backed, self-healing living docs (from Copilot) — highest leverage.** Pin living-doc /
   `seams.md` claims to code locations + re-verify at `join`/finalize → converts "possibly-stale prose"
   into self-healing memory. Directly answers the known doc-drift risk (hit live this session).
2. **A formal memory-tier model + a forgetting dynamic.** (a) team/project truth (`seams.md`), (b)
   per-seat role knowledge (living docs), (c) a **missing portable cross-project preference/identity
   tier**; plus explicit forgetting/consolidation (Copilot's 28-day expiry) so the trail doesn't
   accrete stale/contradictory entries over long lifespans.
3. **Self-selection / pull-based bounties** (blackboard variants) — seats pull bounties they judge
   themselves fit for.
4. **Response-board hygiene** — a review-gate keeping speculative work off `seams.md` until vetted.
5. **Liveness guarantee** (Symphony) — a watchdog for stalled seats (weigh against anthill's
   human-in-the-loop, session-bounded model — see open questions).
6. **Gate parallel fan-out on decomposability** (CodeCRDT's −39%).

## What anthill already does well (validated — don't touch)

The shared surface (bounty + grapevine + seams), durable per-seat memory, the stigmergy model itself
(academically "blackboard architecture"), the finalize synthesis, and the brain/hands split are all
mainstream-confirmed. Symphony's issue-tracker-as-control-plane ≈ the bounty board; its one-agent-per-
issue is arguably poorer than anthill's durable seats.

## Caveats (honest)

- **Symphony** is an open-sourced `SPEC.md` pattern, not a running product (its page 403'd the fetcher;
  verification leaned on consistent secondaries incl. implementation-level detail like `stall_timeout_ms`).
- **Copilot memory** is in public preview — 28-day expiry and "planned" search retrieval may change.
- **Navigation tooling is materially under-evidenced.** *Every* specific state-of-the-art navigation
  claim failed adversarial verification, partly due to a mid-run API rate-limit that killed ~23
  verification votes. Aider's repo-map (tree-sitter + PageRank) and Windsurf Codemaps surfaced as real
  tools but nothing was verified → **anthill's least-charted frontier + a dedicated follow-up needed.**
- The memory/stigmergy academic claims are recent, sometimes single-author, arXiv **preprints** — safe
  as "this is what the paper describes," not settled fact. The one empirical number (+21%/−39%) is the
  paper's own, not independently replicated.
- anthill mappings ("directly analogous to the bounty board / pheromone trail") are interpretive
  framing by the synthesis, not assertions by the primary sources.

## Open questions

- Does anthill need Symphony-style **liveness guarantees** (watchdog + re-spawn of stalled seats), and
  does that conflict with its human-in-the-loop, session-bounded model?
- What is the actual **state-of-the-art in agent codebase navigation** (dependency-graph vs. semantic
  retrieval vs. grep)? The public evidence here was too weak to conclude → dedicated follow-up.
- Should anthill add **citation-backed, JIT-verified memory** to living docs / `seams.md`? Cost of
  re-verifying citations at seat-startup vs. the staleness risk it removes.
- Does anthill want explicit **forgetting/consolidation** for its cross-project KB, or is
  durable-forever the value prop — and how does it avoid the trail accreting stale entries?
- Is a portable, cross-project **personal/preference** memory tier worth adding?

## Refuted / unverified (did NOT survive verification)

Mostly the **navigation axis** (several killed by the mid-run rate-limit, so "unproven," not
"disproven"): CodeCompass graph-navigation numbers (99.4% ACS), a ~400k-LOC grep-failure threshold, a
Kubernetes 2hr→89s semantic-retrieval speedup, the "Navigation Paradox," and "dependencies are
structurally-determined-but-semantically-invisible." Also refuted: a Copilot claim about
deleting-facts-on-failed-validation (1-2), and two stigmergy density/interpretation claims from a
single preprint. → the directional theses (structural/graph navigation + semantic retrieval beat raw
grep on large codebases) are **plausible and worth prototyping, but not evidence-backed here.**

## Key sources

- OpenAI Symphony: openai.com/index/open-source-codex-orchestration-symphony · infoq.com/news/2026/05/openai-symphony-agents
- Copilot memory: github.blog/.../building-an-agentic-memory-system-for-github-copilot · docs.github.com/en/copilot/concepts/agents/copilot-memory
- Memory survey: arxiv.org/abs/2512.13564
- Stigmergy/blackboard: arxiv.org/abs/2510.18893 (CodeCRDT) · arxiv.org/html/2507.01701v1 · arxiv.org/html/2510.01285v1
- Navigation (unverified): aider.chat/2023/10/22/repomap.html · sourcegraph.com/blog/codescalebench-testing-coding-agents-on-large-codebases · Windsurf Codemaps

---

**Related:**

- [v0.2 brief](../briefs/2026-06-30-anthill-v0.2-next-release.md) · the design-of-record in `../architecture/`
- Follow-up: a dedicated **navigation-tooling** investigation (the under-evidenced axis).

---

## Addendum — OpenAI "Harness Engineering" (Feb 2026)

Source: [openai.com/index/harness-engineering](https://openai.com/index/harness-engineering/) (R. Lopopolo,
OpenAI Frontier & Symphony; direct fetch 403'd → triangulated via a full-text mirror + InfoQ + the Latent
Space interview). **Harness engineering = designing the _environment_ around the agent** (scaffolding,
constraints, feedback loops, repo structure), not writing code. Thesis: _"Humans steer. Agents execute."_
Proof point: 3 engineers, ~1M LOC / ~1,500 merged PRs over 5 months with **zero manually-written code**.
Load-bearing constraint: **"anything the agent can't access in-context doesn't exist"** → all knowledge must
be repo-local, versioned artifacts (chat / Google Docs / heads are invisible).

**Validates anthill (strong):** the committed living-doc pheromone trail — versioned plans + decision logs +
co-located tech-debt, re-read by the next agent — is anthill's exact thesis, proven at 1M LOC. Their
"not-in-context-doesn't-exist" framing is a sharper justification for committing durable docs over chat
memory. The brain/hands split, lifecycle-tiered memory (active/completed/tech-debt), and finalize ritual are
all mirrored.

**Concrete steals (some genuinely novel vs. the rest of this investigation):**

1. **Error-message-as-context-injection** (NOVEL — tightest steal). Their custom linters/tests don't just
   pass/fail — the **error text is authored to inject remediation instructions into the agent's context**.
   This is the missing feedback edge in anthill's brain/hands split: the deterministic "hands" (CLI) should
   feed _correction_ back up, not just a pass/fail.
2. **"doc-gardening" recurring agent** (NOVEL). A scheduled agent sweeps for stale docs that no longer match
   code and opens fix-up PRs — a _continuous, automated_ version of anthill's end-of-session finalize.
   Between-session gardener, not just a wind-down ritual.
3. **`AGENTS.md`-as-map + progressive disclosure** (navigation upgrade — feeds the follow-up). A ~100-line
   `AGENTS.md` that is a **map of pointers, not a manual**; agents "start with a small, stable entry point and
   are taught where to look next." Direct antidote to living-doc bloat: keep the always-injected layer tiny
   and make it a router. (anthill already does this with its own lean AGENTS.md — worth formalizing as a
   principle for seat docs / KB.)
4. **"Taste invariants" / "golden principles"** (NOVEL) — encode subjective code-taste (file-size limits,
   logging shape, dependency-direction) as **mechanical, statically-enforced rules** run as recurring "GC,"
   so agents stay consistent without human review.
5. **"Boring tech = agent-legible"** — deliberately choosing stable, training-set-represented dependencies as
   a harness decision.

**Instructive contrast (worth pressure-testing):** OpenAI **deliberately runs NO agent-to-agent channel** —
coordination is _entirely_ artifact-mediated through the repo. anthill leans on a live grapevine channel +
bounty board (direct signaling). Their scale suggests artifact-mediated stigmergy carries most of the
coordination load; anthill should pressure-test **which of its coordination genuinely needs a channel vs. a
committed artifact.**

**Caveat:** Lopopolo is "OpenAI Frontier & Symphony," so this post shares a source lineage with the Symphony
findings above — treat overlaps as the same thread maturing, not independent corroboration.

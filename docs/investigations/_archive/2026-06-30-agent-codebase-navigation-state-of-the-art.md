# Investigation: AI-agent codebase navigation — the verifiable state of the art, for anthill

**Date Started:** 2026-06-30
**Investigator:** Claude Code (deep-research fan-out) + forager synthesis
**Status:** Complete
**Outcome:** Confirms anthill's committed-artifact bet; a heavy dependency-graph index is _not_ an evidence-backed bet; adoption (forcing seats to use the artifact) is the real bottleneck.

---

## Question / Motivation

The [agentic-teams landscape investigation](./2026-07-01-agentic-teams-memory-stigmergy-landscape.md)
left one axis **unproven, not disproven**: its navigation-tooling claims got rate-limited mid-verification.
This follow-up re-runs that axis with adversarial verification to establish the _verifiable_ state of the
art in tooling that helps AI coding agents navigate an unfamiliar codebase — framed for anthill, whose
ephemeral **seats** re-ground from a committed living doc + grounding manifest at session start and need to
orient in a project fast. anthill is a small Bun/TypeScript plugin, so the lens favors findings that are
**cheap to prototype**.

Specific claims put to the test: Aider's repo-map (tree-sitter + PageRank); dependency/knowledge-**graph**
navigation beating retrieval on hidden dependencies (CodeCompass); Sourcegraph/CodeScaleBench's
large-codebase "scale" findings (the ~400k-LOC threshold, the 89s-vs-2h Kubernetes anecdote); the
"Navigation Paradox"; and what the shipping agents (Cursor, Copilot, Windsurf) actually use.

Method: a `deep-research` fan-out — 5 search angles, 21 sources fetched, 100 claims extracted, 25
adversarially verified (3-vote, kill on 2/3 refute) → **19 confirmed, 6 killed**.

## Headline

The evidence converges on one robust, anthill-relevant point and one uncomfortable one.

- **Robust:** at large or architecture-heavy scale, agent failure is a **context/navigation problem, not
  a model-intelligence problem** — and it is _not_ fixed by a bigger context window (the "Navigation
  Paradox": past 1M tokens the failure mode just shifts from retrieval capacity to _navigational
  salience_). A committed architectural-context artifact is the best-supported, cheapest lever
  (**33–44% fewer navigation steps**).
- **Uncomfortable:** the intuitive "give agents a dependency/knowledge **graph**" bet is **contested and
  partly refuted** — a graph agent _lost_ to a bare shell-command baseline in a broad benchmark, and
  CodeCompass's headline graph win failed verification. And even when a good nav tool exists, **agents
  ignore it by default** (58% zero-use). Availability ≠ adoption; the grounding manifest has to _force_ it.

## Findings (confirmed, with citations)

### The core validation — a committed context artifact works

- **A committed architectural-context artifact measurably speeds orientation: 33–44% fewer navigation
  steps** (Wilcoxon p=0.009, Cohen's d=0.92). This is the most direct evidence for anthill's core bet —
  a committed living doc / repo-map regenerated at bootstrap. _Confidence: medium (2-1)._ Source:
  arXiv 2604.13108 ("Formal Architecture Descriptors as Navigation Primitives for AI Coding Agents",
  Apr 2026; n=24 localization tasks, Claude Sonnet 4.6, temp=0).
  - **Caveat that bites:** the adjacent claim that _auto-generated_ descriptors match or beat
    _hand-curated_ ones **failed verification (1-2)**. So the artifact's value is real, but do **not**
    assume anthill can fully auto-generate it at bootstrap and skip human curation — the seat's living
    doc being human/agent-curated is likely load-bearing.

### The Navigation Paradox — bigger context is not the fix

- **Agents fail to locate architecturally-important files not from token limits but because navigation
  and retrieval are distinct problems; bigger context windows (even >1M tokens) only shift the failure
  mode from retrieval capacity to _navigational salience_.** _Confidence: medium (3-0)._ Sources:
  arXiv 2602.20048 (CodeCompass), sourcegraph.com/blog/why-coding-agents-fail-large-codebases
  ("context problems, not intelligence problems"; "not a bigger context window; it's a smarter selection
  of what goes into the window"). Independently corroborated (kamiwaza.ai): at 32K context 27 models hit
  ≥95% retrieval accuracy; at 200K only three held that level.
  - **For anthill:** the whole premise — re-grounding a seat from a _curated, salient_ artifact rather
    than dumping the repo into context — is the evidence-backed move. Selection beats volume.

### When each retrieval mode wins

- **Keyword/BM25 retrieval is a near-free win on lexically-findable ("semantic") tasks (100% vs 90%
  baseline) but gives essentially NO benefit on hidden/architectural-dependency tasks (78.2% vs 76.2%)**
  — because there the connection is structural, not lexical, and "no retrieval model, regardless of
  sophistication, can rank [a structurally-linked-but-lexically-distant] file highly." _Confidence:
  medium (3-0)._ Source: arXiv 2602.20048. (Take the _ordering_ as durable, not the exact single-repo
  numbers.)

### Adoption is the real bottleneck

- **Merely providing a nav tool is insufficient — agents default to lexical heuristics and ignore
  structural/semantic tools unless prompted.** In CodeCompass, **58% of trials with graph access made
  zero tool calls**; it took explicit prompt engineering ("behavioral alignment, not tool availability")
  to get adoption. Independently corroborated by Sourcegraph: agents show "a strong preference for exact
  keyword matching over semantic search, even when they are told outright about these tools" (Deep Search
  used in only 6 tasks / 8 calls across 602 MCP runs). _Confidence: high (3-0)._
  - **Highest-leverage takeaway for anthill:** whatever nav artifact/tool a seat gets, the grounding
    manifest must **force** its use — a mandatory first-step, or pre-injecting the artifact into context —
    not expose it as an optional tool.

### Retrieval is the dominant lever at scale — but not sufficient

- **Context retrieval is a genuine, measurable bottleneck (SOTA LLMs score block-level F1 < 0.45,
  line-level < 0.35) and is the primary differentiator at large-codebase scale — yet retrieval alone
  isn't everything.** There's a real gap between what agents retrieve/inspect and what they actually use
  in the patch. _Confidence: medium (2-1 / 3-0)._ Sources: arXiv 2602.05892 (ContextBench),
  Sourcegraph CodeScaleBench.
  - **For anthill:** better navigation helps a seat _find_ the right files but doesn't guarantee it
    _uses_ them — grounding must also shape how context is applied, not just surface it.

### What ships — hybrid grep-first + semantic, no graph

- **The major agents favor a HYBRID exact-match-first grep + semantic-vector stack with an orchestrator
  that picks the tool per query — not dependency/knowledge graphs.** Cursor ships "Instant Grep" +
  semantic vector search (code chunked into functions/classes, embedded, stored in a vector DB) behind an
  "Agentic Search" orchestrator ("the fastest way to find code is an exact match… when you don't know the
  exact name, semantic search finds code by meaning"). GitHub shipped semantic code search for the Copilot
  coding agent (Mar 2026). **No major agent ships a dependency/knowledge-graph as its primary nav tool.**
  _Confidence: high (3-0)._ Sources: cursor.com/docs/agent/tools/search,
  github.blog/changelog/2026-03-17-…-semantic-code-search.
  - Note: GitHub reported only ~2% faster completion from semantic search — a confirmed shipped aid, weak
    evidence of a _large_ differentiator. Windsurf **Codemaps** (Cognition) are the closest shipped analog
    to a committed structured map: AI-annotated structured maps of a repo (execution order/architecture),
    not embeddings.

### Aider's repo-map mechanism (confirmed, adoptable)

- **Aider's repo-map = tree-sitter symbol/signature extraction + a PageRank-style ranking over the
  file-reference graph to select a compact, token-budgeted whole-repo map** sent with each request.
  Confirmed from the primary source and reproduced by independent reimplementations (RepoMapper, CodeRLM,
  code-review-graph — the latter parses to a SQLite graph across 30+ languages with incremental SHA-based
  updates, re-parsing only changed files in <2s for ~2,900-file projects). _Confidence: high._ Sources:
  aider.chat/docs/repomap.html, github.com/pdavis68/RepoMapper, github.com/JaredStewart/coderlm.
  - **This is the cheap-to-prototype path for a TS-heavy repo like anthill's own:** tree-sitter + a
    ranking pass is well-trodden and light. But see the "when each wins" comparison — a _compact map_ is
    not the same bet as a _dependency graph the agent traverses_.

## Explicitly refuted — do NOT rely on these

These were killed in adversarial verification. Several are widely-cited marketing/anecdote; flagging them
so a future anthill agent doesn't build on sand:

- **CodeCompass's headline graph win** — 99.4% on hidden-dependency tasks / 23pt gain over BM25 & vanilla
  (**0-3**). The graph-beats-retrieval _story_ is unproven; only the weaker "agents ignore the graph tool"
  finding survived.
- **The ~400k-LOC failure threshold** for grep/glob agents (**1-2**).
- **The 89s-vs-2h Kubernetes anecdote** (baseline times out; MCP-equipped agent finishes in 89s @ 0.90)
  (**0-3 / 1-2**) — viral, but did not survive.
- **Auto-generated architecture descriptors matching/beating hand-curated ones** (**1-2**) — hence the
  human-curation caveat above.

**The central tension in the corpus:** CodeCompass argues structural graph navigation is essential for
hidden dependencies, while ContextBench found a graph agent (Prometheus/Neo4j) _losing_ to a bare
shell-command baseline — an explicit "Bitter Lesson" of over-engineered scaffolding. **A heavy
dependency-graph index is therefore not a safe, evidence-backed bet for anthill.**

## Comparison — when each navigation approach wins

| Approach                                                             | Wins when                                                | Evidence                                       | anthill fit                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **Committed architectural-context artifact** (living doc / repo-map) | Orienting fast in an unfamiliar repo; reducing wandering | 33–44% fewer nav steps (medium)                | **Core bet — keep & strengthen**             |
| **Plain grep/glob (exact-match-first)**                              | The symbol/name is known or lexically findable           | Strong baseline; hard to beat (high)           | Already have; make it the default first move |
| **Semantic/embedding retrieval**                                     | The name is unknown; find-by-meaning; "semantic" tasks   | Free win on lexical tasks; ~2% e2e (Copilot)   | Optional add-on, not a priority              |
| **Dependency/knowledge graph**                                       | _Claimed_ for hidden/structural dependencies             | **Contested/refuted** — lost to shell baseline | **Do not invest heavily**                    |

Net: **compact map + grep-first, with optional semantic retrieval — mirroring the shipped agents.** The
graph is the seductive-but-unproven option.

## Prioritized ideas for anthill (cheap-to-prototype flagged)

1. **[cheap · evidence-backed] Make the seat's grounding artifact _force_ adoption.** The single
   highest-leverage, near-zero-cost lever. Given the documented 58% zero-use rate, the grounding manifest
   should make re-grounding a **mandatory first step** (or pre-inject the artifact into context) rather
   than an optional pointer. This is a skill/prompt change, not new tooling — and it's the thing the
   evidence most strongly rewards.
2. **[cheap · evidence-backed] Keep the committed living doc curated, not auto-generated.** The 33–44%
   win is real; the "auto-gen is as good" claim is refuted. Lean into human/agent curation of the seat
   doc + a lightweight architectural map; don't chase full auto-generation.
3. **[moderate · promising] A committed compact repo-map artifact, Aider-style, regenerated at
   bootstrap/finalize.** For anthill's own TS codebase: tree-sitter symbol extraction + a ranking pass →
   a token-budgeted map checked into `.anthill/`. Well-trodden and light. Frame it as a _map_ (salient
   pointers), not a graph the seat must traverse.
4. **[cheap · already-aligned] Grep-first, semantic-optional.** Mirror the shipped hybrid: exact-match is
   the default move; treat any semantic layer as a fallback for find-by-meaning, not the primary index.
5. **[HEAVY · NOT evidence-backed — deprioritize] A dependency/knowledge-graph index.** Seductive, but
   the evidence is contested-to-negative and it's the most expensive to build/maintain. Skip unless a
   specific, measured need appears.

## Open questions

- Does the 33–44% architectural-descriptor benefit (n=24, one model) replicate on larger, multi-language
  repos and on Claude Code specifically — and how much requires human curation vs. auto-regeneration at
  bootstrap/finalize?
- For anthill's own TS domain, is a compact repo-map (tree-sitter + PageRank) more cost-effective than
  semantic embeddings? (Aider's mechanism is confirmed; its _superiority for our case_ is not.)
- What's the cheapest manifest pattern that reliably forces ephemeral seats to _use_ a provided nav
  artifact given the 58% zero-adoption rate — mandatory first-step tool call, or pre-injection?
- Is a git-history "heat" signal (churn/recency-weighted file ranking for orientation) supported by any
  benchmark, or only intuition? **No verified claim in this corpus addresses git-heat** — speculative;
  would need its own evaluation before investing.

## Caveats on the evidence

Fast-moving field: nearly all academic evidence is Feb–Apr 2026 preprints (CodeCompass 2602.20048,
ContextBench 2602.05892, architecture-descriptors 2604.13108) — non-peer-reviewed, several single-author,
several on a single repo. Treat as suggestive, not settled. The strongest single-vendor evidence
(Sourcegraph CodeScaleBench, 1,281 runs) is self-benchmarked marketing for the exact MCP product it
validates; its retrieval-quality wins are real but modest in absolute terms (P@5 0.140→0.478) and only
marginal on aggregate task reward (0.565 vs 0.536 — "directional, not transformative").

---

**Related:**

- [Agentic-teams landscape investigation](./2026-07-01-agentic-teams-memory-stigmergy-landscape.md) —
  the parent; this resolves its deferred navigation axis. See also its harness-engineering addendum
  (AGENTS.md-as-map + progressive disclosure independently echoes finding #1 here).
- The design-of-record in `../architecture/` (the grounding-manifest + living-doc mechanics this bears on).

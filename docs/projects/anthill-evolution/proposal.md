# Anthill Evolution — durable docs get curated, agents write reports

**Status:** Draft — shaped in conversation with Cole, 2026-09-03; not yet reviewed as a document
**Created:** 2026-09-03
**Author:** Cole Reed + Claude Code (unconvened session — no seat)
**Source:** Cole's field assessment after running anthill teams in several projects — Operator workspace
**Anthill** → `Notes/anthill-observations-successes-and-improvements.md` (doc id
`12e1b079-9426-4a17-b70d-86f5adf252ee`, v2). This project exists to act on it.

---

## Overview

anthill's knowledge loop was built on one theory: each seat writes lessons into its own living doc, the
team writes shared truth into `seams.md`, and successive ephemeral agents get better by reading what
their predecessors wrote. In practice **a lot gets written and behaviour does not change.** The docs
grow into diaries, a fresh agent cannot parse a predecessor's compressed one-liners, and the ceremonies
that produce all of it cost more than they return.

This project redefines what the durable docs are for and **separates the agent that does the work from
the agent that decides what a successor needs to know.** Seats stop editing their own docs. They write
a per-session **report** instead. A separate **curation** step — a fresh agent with Cole in the loop,
run outside the working session — decides what, if anything, flows from reports into a seat doc, a
seam, a principle, a skill, or tooling. The durable docs go back to basics: identity and contracts,
small enough to be read whole.

The curation methodology itself is **not designed here.** This project captures the lifecycle touch
points and leaves their content loose. Each touch point's skill points at a page in a **team wiki**
that anthill ships as a skeleton and the project fills in; the method matures there, inside consuming
projects, and is lifted back into anthill when it has proven itself.

## Problem Statement

Measured 2026-09-03 on the two longest-running anthill teams (anthill's own and Spellbook's).

**1. The identity half of a seat doc is small and the rest is a diary.** The shipped template's five
identity sections (Who I am · Scope · Boundaries · Relationships · Taste & reflexes) already say what
Cole wants a seat doc to be, and they hold at roughly 30–140 lines per seat. Everything else is
per-session accumulation with no compaction:

| seat (anthill) | total lines | identity sections |                 Hard-won lessons |
| -------------- | ----------: | ----------------: | -------------------------------: |
| forager        |         908 |                42 |                              660 |
| weaver         |        1070 |                35 |                17 dated sections |
| steward        |         676 |                90 |                              412 |
| sentinel       |         728 |               144 |                              403 |
| scout          |         666 |                56 |                              318 |
| maestro        |         565 |                28 | 8 lesson + 8 reflection sections |

**2. The locked structure was bypassed, not overgrown.** Spellbook's seats kept the identity sections
at 30–60 lines and then stopped writing into `Hard-won lessons` at all — they append a **new top-level
section per session or per gate round** (cassandra: 26 of them; daedalus: 8). The template's "keep it
honest and lean" held for exactly as long as nothing tested it.

**3. `seams.md` became the prestige home for lessons.** Spellbook's seams file holds 21 contracts in
1294 lines. Contracts 1–15 are real boundary contracts, though six run 100–180 lines each because each
carries its scar story. Contracts 16–21 — _"a ward's population must follow its subject"_, _"the shipped
artifact is verified by reproduction, never by a proxy"_ — are **principles**, not seams. They landed
there because a contract confers authority and a lesson does not.

**4. The lesson category has three durable homes at once** — seat `Hard-won lessons`, `principles.md`,
and `retro.md`'s hypotheses — and a joining seat is pointed at all of them. anthill's own `retro.md` is
1059 lines; Spellbook's is 656. The one file that stayed small in both projects is `principles.md`
(413 and 214 lines), and it is the only one with an explicit admission bar written at its top.

**5. Reading a lesson does not change behaviour.** In Spellbook's cassandra doc, a section is titled
_"the session my own doc kept naming the failure I then committed."_ That is the observation note's
thesis, recorded by the agent who lived it.

**6. The author is the wrong curator.** The agent writing its own doc is context-rich about the
session and blind to what a stranger lacks. AGENTS.md already states the same predicate for tests:
_a test written by whoever wrote the code inherits that code's blind spot._ The docs were exempt from
the rule.

**Who is affected.** Every consuming project, every session: seats spend end-of-session tokens on
synthesis nobody re-applies, and the next seat spends start-of-session tokens reading it.

## Proposed Solution

### A. Durable docs go back to basics, and become curated-only

Three files remain durable and on the join read path. **No seat edits any of them during a working
session.** They change only through curation (§C).

- **Seat doc** (`dev/<handle>.md`) — the seat's AGENTS-file. Who I am · Scope · Boundaries ·
  Relationships · Taste & reflexes. Nothing else. **Removed:** Epitaph and its lineage, Hard-won
  lessons, Anti-patterns, Candidates. The epitaph was the best-designed of the lesson slots — forced
  selection of one disposition for a successor — and Cole's ruling (2026-09-03) is that it has not
  been seen to stop a successor repeating the mistake it names, so it moves to the report (§B) where
  it is still interesting and no longer load-bearing. A seat doc should be readable whole in one
  sitting; a role can still evolve, but through curation.
- **`seams.md`** — stays a contract file. The template's admission test is the rule: _shared truth
  that more than one seat must rely on and that drifts if restated_ — a data shape, an invariant, a
  protocol. Each contract is cut to **invariant · ratified grain · proof pointer**; the scar narrative
  goes to the report that curation reads. Lessons dressed as contracts are moved out.
- **`principles.md`** — the single durable home for a synthesised lesson that is prose rather than a
  skill or a tool. Its existing admission bar is the model for the other two.

`retro.md` and the seat-doc synthesis beat are **retired**. `paper-cuts.md` folds into reports.

### B. Seats write reports

Each seat, each session, writes **one report file** (`<teamDir>/reports/<session>/<handle>.md`) —
minted at `join` alongside scratch, captured into as things happen, closed at finalize.

- **Not on the join read path.** Durable on disk so curation can happen later; no joining agent reads
  it. That is what "non-durable" means here.
- **Capture in full, not in compressed form.** The report is the place to lose no information; the
  agent is not asked to word it memorably.
- **Ask what happened, do not pre-classify.** Prompts are open ("what did you hit, what worked, what
  would you change about this seat's doc") rather than "which of these is a skill candidate" — a
  primed question finds what it was primed for.
- **Suggestions are proposals, not edits.** _"I think Scope should also cover X"_ goes in the report.
- **The epitaph lives here now.** The close prompt keeps the one-thing-for-a-successor question,
  because what an agent would single out is useful signal for curation — it is just no longer
  something the successor is handed directly.
- **The lead's report** carries the next-convene items — the one thing today's retro does that is
  genuinely meant to be re-read, and the only report `convene` reads.

### C. Curation is a separate lifecycle event

A new skill (working name **`anthill:curate`**) runs **outside the session that produced the reports**,
by a fresh agent with Cole in the loop. It:

1. Reads the unprocessed reports.
2. Points at the project's **curation page in the team wiki** (§F) — which starts as a near-empty
   stub with anthill's suggestions attached, and is where the method accretes _in that project_.
3. For each item, the agent proposes a destination — seat doc · seam · principle · skill · tooling
   backlog item · **drop** — and Cole rules. **Where they disagree, the reason is written into
   the curation page.** That accumulation is the point: it is accumulating decision criteria, not incidents.
4. Applies the approved diffs to the curated docs, and marks the reports processed.

**Cole is in the loop initially by design.** The first reads will find the reports lack context, which
changes the report prompts; the next reads calibrate what clears the bar. Curation graduates to
agent-alone when the agent's triage matches Cole's rulings consistently, across more than one project.
The number is not picked here, but the criterion is stated so nobody has to argue later about whether
the human may step out.

### D. The lifecycle map — touch points captured, content left loose

The principle: anthill supplies the **trigger**, the project supplies the **content**. Every event
below exists or is added; what runs inside it may be very simple or very elaborate per project.

| event                | today   | change                                                                                                                                                            |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap` / `init` | yes     | renders identity-only seat docs, a `reports/` folder, and the team wiki skeleton (§F)                                                                             |
| `convene` (lead)     | yes     | reads the latest lead report's carry-forward instead of `retro.md`                                                                                                |
| `join` (seat)        | yes     | reads seat doc · seams · principles as now; **mints the seat's report file**                                                                                      |
| during work          | scratch | capture into the report as things happen — open-ended                                                                                                             |
| `finalize-session`   | yes     | each seat closes its report; lead closes the lead report; **assertion: no curated doc changed this session.** Seat-doc synthesis, seams pass, retro beats retired |
| **`curate`**         | **no**  | new; outside the session; agent + human; pointed at the wiki's curation page; proposes diffs; marks reports processed                                             |
| `upgrade`            | yes     | carries the migration for existing teams (§E)                                                                                                                     |

### F. The team wiki — loose coupling between the touch point and its content

Every lifecycle event in §D is a **skill that says when and what to read**, and a **wiki page that
says how**. anthill owns the first; the project owns the second.

- **One page per touch point** — `convene`, `plan`, `work`, `finalize`, `curate` — plus the pages the
  team adds. The wiki lives in the team dir (working name `<teamDir>/wiki/`), and is the successor
  to today's single 441-line `.anthill/README.md` SOP, which is a wiki in one file.
- **anthill ships a skeleton, not a doctrine.** Each page starts with anthill's suggestions and field
  notes on what has worked elsewhere — the stance `field-notes.md` already takes: _"your team may
  differ, and where it does, that is worth more to us than agreement."_ The project rewrites the page
  as its own method proves out. When a page has held across projects, its content is lifted back into
  anthill's skeleton.
- **OKF (Open Knowledge Format) 0.2 front matter from day one.** Pages carry standard front matter
  so they can be linked as a graph, linted, and navigated by tooling. The format is not retrofittable
  cheaply, so it is the substrate now.
- **Reference implementation: the `agent-cli-conformance` wiki** (`docs/wiki/` in that repo), which
  has run this format with tooling for weeks. What transfers directly: a `SCHEMA.md` maintainer
  contract that an agent reads once before writing (`type` required; `title`, `description`, `tags`,
  `status`, `generated` recommended; `related` as `type/slug`); an `index.md` catalog with one line per
  page; a single-file `lint.ts` that fails on broken links, unverified anchors, missing front matter
  and orphans, and emits the knowledge graph with `--json`. Its dividing line is the one this proposal
  draws: _"the wiki is what we believe; `docs/research/` is what convinced us"_ — the wiki is curated,
  the dated evidence trail is not, and decisions cite the evidence. Reports here play the research
  role there.
- **The wiki is curated-only, like the other durable docs.** It is written during curation, or by the
  human and an agent deliberately editing method — never by a seat mid-session. Otherwise it is the
  next diary. Method suggestions from a seat go in the seat's report like everything else.

This is what makes the touch points stable while their content stays loose: a skill never has to
change when a project changes how it finalizes, and a project never has to fork a skill to own its
own process.

### E. Migration is the first curation run

Existing teams (anthill's six seats, Spellbook's five, both seams files) are pruned to the new shape.
This is real curation on real data already on disk — the cheapest first exercise of the loop, with no
new session needed to generate input. anthill's own team goes first. The pruned material is not
deleted: it becomes the team's first batch of unprocessed reports.

## Scope

**In scope (MVP)**

1. Seat-doc and seams templates cut to the shapes in §A; `retro.md` template retired.
2. The report template and its `join` / during-work / `finalize` touch points (§B, §D).
3. The `curate` skill as a **touch point with a loose interior** (§C).
   3b. The team wiki skeleton with one page per touch point, OKF front matter, and anthill's seed
   suggestions on each page (§F); every touched skill rewritten as trigger + pointer.
4. `convene` reads the lead report's carry-forward; `finalize-session` loses the synthesis, seams-pass
   and retro beats and gains the no-curated-doc-changed assertion.
5. `upgrade` carries the migration; anthill's own team and Spellbook's are migrated (§E).
6. `cascade-check` updated for the paths and beats that moved.

**Out of scope**

- **The curation methodology itself.** It matures in `curation.md` per project and is lifted into
  anthill only when it has held across projects.
- **OKF navigation tooling** — the browse/find CLI over the wiki. The _format_ is in scope (§F), and
  so is porting `agent-cli-conformance`'s single-file `lint.ts` (links · anchors · front matter ·
  orphans), because "no page is an orphan" is what keeps a skeleton wiki coherent and the port is
  cheap. Anything beyond that lint is a second workstream.
- Migrating the rest of anthill's generated docs (seat docs, seams, principles) to OKF front matter.
  Natural once the wiki has proven the format here; not required for the write-split to work.
- **The near-zero-instruction "self-organising team" experiment** floated in the source note.
- Anything mechanical about report _content_ quality. The only check added is binary: did a curated
  file change during a working session.

**Future considerations**

- Curation graduating to agent-alone (§C), with the measured agreement criterion.
- Reports as input to `anthill feedback` upstream — curation may find that an item belongs to anthill
  rather than to the project.

## Technical Approach

- **Templates** (`plugin/templates/docs-team/`): `dev/{{handle}}.md` and `dev/seams.md` rewritten;
  `retro.md` removed; `reports/README.md`, `reports/<session>/{{handle}}.md` and `curation.md` added.
- **Wiki skeleton** (`plugin/templates/docs-team/wiki/`): one OKF-fronted page per touch point,
  seeded from the relevant sections of today's SOP README and `field-notes.md`, each marked as
  anthill's suggestion rather than the project's rule.
- **Skills** (`plugin/skills/`): `join`, `convene`, `finalize-session`, `bootstrap`, `upgrade` edited;
  `curate` added. Each is a trigger with a pointer at its wiki page, per §D and §F — the skill prose
  says _when_ and _what to read_, not _how to decide_.
- **The one guard**: at finalize, a diff over the curated path set (`dev/<handle>.md`, `dev/seams.md`,
  `principles.md`) against the session's base ref must be empty. Assertion-level, never content-level.
  Per AGENTS.md's second testing rule, it ships with a positive control that puts a seat-doc edit back.
- **Migration** (`anthill migrate` + the `upgrade` skill): moves `Hard-won lessons` and the appended
  per-session sections out of each seat doc into `reports/<migration>/<handle>.md`; moves
  `retro.md` into the same batch; leaves `seams.md` contracts in place for hand-curation (cutting a
  contract to invariant · grain · proof is a judgment).
- **Dependencies:** `config.json` `paths` gains `reports` and `wiki`; `cascade-check`'s map gains
  the new travel-together sets.

## Impact & Risks

**Benefits.** Fewer end-of-session tokens (three writing beats become one report). A fresh seat reads a
doc it can hold whole. Lessons get a curator who lacks the author's context, which is the property the
successor also has. The methodology has a home that accumulates the right thing.

**Risks.**

- **Curation does not run.** Cole is the bottleneck by construction; unprocessed reports would be the
  old accumulation under a new filename. Mitigation: the migration is the forced first run; the
  graduation criterion is stated up front; `convene` surfaces the count of unprocessed reports so the
  backlog is visible rather than silent.
- **Seats write into the durable docs anyway** out of habit or because a skill still tells them to.
  Mitigation: the binary guard at finalize, and `cascade-check` over every skill that used to say
  "synthesise into your seat doc."
- **Pruning loses something real.** Mitigation: nothing is deleted — pruned material becomes the first
  report batch, and `seams.md` is hand-curated rather than migrated mechanically.
- **The loose interior stays loose forever.** Accepted: the touch point is the deliverable; content is
  the consuming project's until it proves out.

**Complexity: Medium.** The code change is small (templates, skill prose, one guard, a migration step).
The cost is in cascade — the same rule lives in several skills and templates — and in doing the two
migrations by hand with judgment.

## Open Questions

1. ~~Keep the epitaph?~~ **Ruled 2026-09-03: no — it moves to the report.** Interesting to read,
   not seen to change a successor's behaviour.
2. **Report structure** — a handful of open prompts vs. free-form capture with a short close. Proposed:
   free capture during work, three open prompts at close; expect to rewrite after the first reads.
3. **Relationship to [`methodology-externalization`](../methodology-externalization/proposal.md)**
   (draft, 2026-08-10). It asks whether shipped skill prose coerces team variants; this project
   removes most of that prose from the loop. Likely they sit alongside, with this one landing first;
   not settled here.
4. **Does the SOP README split into the wiki now or later?** Proposed: the touch-point sections
   move now (they are the seed content); the rest stays until it has a page to go to.
5. **What `convene` reads** once `retro.md` is gone: only the latest lead report's carry-forward, or
   every unprocessed lead report? Proposed: latest only, plus the unprocessed count.

## Success Criteria

- Every seat doc in both migrated teams is the five identity sections only, and stays that way across the next
  three sessions (the guard is the measure).
- `seams.md` contains only entries that pass the admission test, each with a proof pointer.
- Every session produces one report per seat, and `curate` has run at least once on real reports in
  each of the two projects, with the curation page carrying at least one recorded disagreement.
- Each migrated team's wiki has a page per touch point, and at least one page has been rewritten by
  the project rather than left as anthill's seed.
- End-of-session ceremony cost is lower than today's — measured as the finalize beat count and, where
  available, tokens.

---

**Related Documents**

- Source observations: Operator workspace **Anthill** → `Notes/anthill-observations-successes-and-improvements.md`
  (doc id `12e1b079-9426-4a17-b70d-86f5adf252ee`, v2, 2026-09-03)
- [Design of record](../../architecture/2026-06-28-anthill-portable-team-os-design.md) — the three
  stigmergy principles this revises the mechanism for, not the thesis of
- [Roadmap](../../ROADMAP.md) — this project is not yet placed on it
- [methodology-externalization](../methodology-externalization/proposal.md) — overlapping draft, see Open Question 3
- Reference wiki: `~/Projects/agent-cli-conformance/docs/wiki/` — `SCHEMA.md`, `index.md`, `lint.ts`
- The shipped templates this rewrites: `plugin/templates/docs-team/dev/{{handle}}.md`, `dev/seams.md`, `retro.md`
- The skills this touches: `plugin/skills/{join,convene,finalize-session,bootstrap,upgrade}/SKILL.md`

---

## Notes

**Design conversation, 2026-09-03.** Worked one question at a time: first what belongs in a seat doc
and in seams (back to basics — identity; contracts), then the write-split (seats report, they never
edit their own docs), then curation as a separate touch point with Cole in the loop until the method
proves out, then the lifecycle map, then the team wiki as the loose coupling between a touch point and its
content, with the `agent-cli-conformance` wiki as the working reference for OKF. Measurements above were taken during that conversation on
anthill `develop` @ `2f7d8d9` and Spellbook at its 2026-09-03 head.

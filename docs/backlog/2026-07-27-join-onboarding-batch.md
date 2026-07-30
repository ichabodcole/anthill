# `anthill:join` onboarding batch — one live regression + five refinements

**Added:** 2026-07-27 · **Status:** ✅ **SHIPPED** 2026-07-27 (`315fa56`) · **Seat:** weaver
(`plugin/skills/join/SKILL.md` + the join payload in `team-join.ts`)

> **All six landed.** Item 2 turned out to be worse than reported: the shipped board filter used
> **basic** grep with an alternation, where `(a|b)` is a LITERAL — so it matched nothing at all and a
> seat's board Monitor sat permanently empty while looking correctly wired. #39's reporter had
> evidently already fixed the regex flavor by hand before hitting the heartbeat noise they filed.
> Live tails were also block-buffered (`--line-buffered` now added), the same root cause as item 1.
>
> The placeholder detector shipped as a shared pure helper (`placeholder.ts`) so bootstrap can reuse
> it; swept over all 110 repo docs it flags exactly the 3 unfilled templates, zero false positives.

Six issues against the join path, filed by four different teams across July. All are skill-text or
payload changes. **Item 1 is a live regression we introduced ourselves and should be fixed
first — it is currently mis-teaching every late joiner in every consuming project.**

---

## 1. 🔴 REGRESSION — the documented catch-up command is broken by construction ([#54](https://github.com/ichabodcole/anthill/issues/54), dup [#38](https://github.com/ichabodcole/anthill/issues/38))

`plugin/skills/join/SKILL.md:49` tells a joining seat to back-fill with
`grapevine tail <channel> --from-start` (piped through `grep '"from"'`). This **cannot work**:

- `grep` block-buffers, so a finite backfill never flushes; and
- a live `tail` holds the pipe open forever, so it never exits.

Result: **zero output, then a 2-minute tool timeout** (exit 143/144). It fails _silently_, so the
natural conclusion is "the channel is empty" — and a fresh seat joins contextless, never knowing
what it missed. Worst possible property for an onboarding step, on the _first_ thing a late joiner
does.

**Independently reproduced by three seats in one session** (media-forge, no contact between them);
two more seats hit it a week earlier (#38).

**Provenance — this is ours.** Commit `08516ac` (2026-07-09, _"docs(join): reframe vine backfill
around `--from-start`"_) introduced the guidance. #38 landed 2026-07-16 and #54 on 2026-07-24; the
text is still live in the shipped skill.

**Fix:** recommend **`grapevine pull <channel>`** (finite, exits, returns history) — or
`tail --last <n>` **without** the grep — for catch-up, and reserve `tail | grep` exclusively for
the live Monitor wiring. The skill already mentions `--last <n>` at line 52 as a secondary option;
the fix is to make the bounded verb the primary and delete the unbounded one.

## 2. The board-tail filter passes heartbeats through ([#39](https://github.com/ichabodcole/anthill/issues/39))

The suggested board-tail grep leaks heartbeat frames into the Monitor; the seat had to add a second
`grep -v` by hand. The suggested filter should exclude heartbeats itself, so a fresh seat's Monitor
is quiet by default.

## 3. Card claims get made from a stale in-context board listing ([#40](https://github.com/ichabodcole/anthill/issues/40))

A seat claimed the wrong card by title-adjacency, working from a board listing that predated the
lead's batch-add. **Fix:** make a fresh `bounty state --mine` a _required_ step immediately before
any claim.

## 4. "Claim your card" names no card and no way to find one ([#56](https://github.com/ichabodcole/anthill/issues/56) item 2)

The checklist says `bounty update <id> --status doing` — with no `<id>` and no command to resolve
one, forcing a drop to raw `bounty state --as <handle>` and eyeballing JSON. Every _other_ line in
the join payload is resolved-and-verbatim (explicitly praised by the reporting team); this is the
one gap. **Fix:** include the seat's assigned card id(s) in the join payload, or make the line
`bounty state --mine --as <handle>`. _Closes naturally together with item 3._

## 5. Placeholder grounding docs are listed as if they were real ([#56](https://github.com/ichabodcole/anthill/issues/56) item 1)

A join manifest listed `docs/PROJECT_MANIFESTO.md`, which was an unfilled template (literal
`[Elevator pitch...]` scaffold). Read in full as instructed, it gave zero signal **and a wrong
inference** — "this project has no articulated principles," when the truth was "nobody filled the
template in."

**Fix:** flag a placeholder-dominant doc (`⚠ appears to be an unfilled template`) rather than
listing it flat. The same detection would let `bootstrap` prompt the human to fill it — see the
[bootstrap host-adaptation item](2026-07-27-bootstrap-host-adaptation.md).

## 6. Two clarity fixes ([#56](https://github.com/ichabodcole/anthill/issues/56) items 3–4, [#42](https://github.com/ichabodcole/anthill/issues/42))

- **"Read-only-first" reads as contradicting the checklist.** The skill says every join step is a
  read, but the checklist then mints scratch, claims a card, and registers presence — all writes —
  and `anthill join` is itself a Bash call. The guarantee is "the _reads_ are read-only," not "join
  works without Bash." One clause marking where the read-only spine ends would save a re-read.
- **The skill never warns that unsynthesized scratch is LOST.** Step 4 mints gitignored scratch,
  framed purely as a benefit. Evidence it matters: **all four seats spontaneously wrote their seat
  docs warm**, ahead of the finalize call, routing around the step. Fix is one line: _"scratch is
  gitignored; it does not survive the session. Synthesize at finalize — **or earlier, if the
  reasoning is warm.**"_ Framing "earlier is fine" is the whole change. (Also raised in
  [#58](https://github.com/ichabodcole/anthill/issues/58).)
- **Mid-plan joiners get no pointer to the ratify gate** ([#42](https://github.com/ichabodcole/anthill/issues/42)). A seat joining mid-plan-phase gets the grounding manifest, but ratify-gate
  mechanics live only in the lead's convene/brief vine messages. **Fix:** when a `plan.md` exists
  (or a plan phase is active), point at the plan skeleton's "How this plan is authored" section.

---

## Acceptance Criteria

- [ ] The join skill's backfill step names a **bounded** verb; no unbounded `tail` remains on the
      catch-up path. Verified by actually running the documented command to completion.
- [ ] The suggested board-tail filter excludes heartbeats with no hand-editing.
- [ ] A fresh board read is a required pre-claim step, and the payload resolves the seat's card id.
- [ ] Unfilled-template grounding docs are flagged, not listed flat.
- [ ] The read-only-first clause is scoped, and step 4 carries the "synthesize earlier if warm" line.
- [ ] Mid-plan joiners are routed to the ratify-gate discipline.

## References

- `plugin/skills/join/SKILL.md` — lines 40–52 (the wires/backfill step), 85 (checklist).
- `plugin/scripts/anthill/commands/team-join.ts` — the join payload (items 4, 5).
- Regression provenance: commit `08516ac`.
- Issues: [#54](https://github.com/ichabodcole/anthill/issues/54) ·
  [#38](https://github.com/ichabodcole/anthill/issues/38) ·
  [#39](https://github.com/ichabodcole/anthill/issues/39) ·
  [#40](https://github.com/ichabodcole/anthill/issues/40) ·
  [#42](https://github.com/ichabodcole/anthill/issues/42) ·
  [#56](https://github.com/ichabodcole/anthill/issues/56)

**Worth preserving from #56** (the reporting team explicitly asked these be recorded, since the
corrective habit buries them): the ratify/falsify framing — _"falsifying a seam now is a win, not
friction"_ — was named as **the single reason seats pushed back on false premises instead of
building around them**; the "route decisions to the lead, not direct to the human" rule collapsed
four uncoordinated pings into single rulings-with-reasoning; and resolved-verbatim command output
meant zero path-guessing. Do not regress these while fixing the above.

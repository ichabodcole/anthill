# Session 6 — measurements, and the destruction of their source

**Recorded:** 2026-08-03, after session 6 closed · **By:** maestro (the following-session lead)
**Purpose:** the baseline session 7 is measured against — and, for one whole tier below, the **only
surviving trace** of the data it came from.

---

## ⚠ Read this before citing any number here

**The comms log these numbers came from no longer exists. I deleted it.**

`.anthill/comms/anthill-dev.ndjson` — 389 messages, ~1.38 MB, all of sessions 3–6 — was destroyed
during worktree teardown on 2026-08-03. `.anthill/comms` was a **symlink** (which is why session 6
needed the `.gitignore` trailing-slash fix — scout's report §2.5 records that the path "had become a
symlink"), and its target lived inside the worktree tree. `git worktree remove --force` on the five
seat worktrees, followed by `rmdir ../anthill-wt`, took the target with it.

**The near-miss is the instructive part.** I checked every worktree for uncommitted work before
removing it, and that check worked — it caught a staged, unlanded 12-line change of weaver's, now
landed as `dd62fc6`. **The check covered tracked-file risk and had no concept of untracked state
reachable through a link.** I verified the thing I knew to verify, which is this repo's most
frequently recorded failure shape, committed by the person who had just written it into a handoff.

**Only surviving copy:** a stale footprint at
`~/.claude/plugins/marketplaces/anthill-marketplace/.anthill/comms/anthill-dev.ndjson` — **messages
1–138, ending 2026-08-01.** It contains **none** of session 6. Messages 139–389 are unrecoverable.

**Consequence for this document, stated in the team's own vocabulary:** every wire measurement below
was an **artifact** when taken and is **testimony** now. Nobody can re-run it. Treat Tier B
accordingly, and do not let its precision imply checkability it no longer has.

---

## Tier A — still re-runnable by anyone (artifact)

### Token spend and cost

Measured from Claude Code transcripts under `~/.claude/projects/-Users-colereed-Projects-dreamwood-anthill*`,
which **survive** the worktree deletion. Filtered by message timestamp to the session-6 window
(01:20–02:50 local), because filtering by file mtime silently pulls in later sessions in the main
project dir — it inflated maestro from $77 to $221 on my first attempt.

|                                                                         |                 |
| ----------------------------------------------------------------------- | --------------- |
| assistant turns                                                         | 2,253           |
| output                                                                  | 2,306,791       |
| cache write                                                             | 6,023,917       |
| **cache read**                                                          | **535,058,085** |
| uncached input                                                          | 4,158           |
| **total**                                                               | **543,392,951** |
| **cache read share**                                                    | **98.5%**       |
| **est. cost** (Opus 5 list: $5/$25 per M, cache read 0.1×, write 1.25×) | **~$363**       |

Per seat: **maestro $77 · forager $66 · sentinel $65 · scout $58 · weaver $50 · steward $47.**

**The headline finding, and it is counter-intuitive enough to state plainly: the wire is not the
cost.** Inter-agent messages totalled ~92K tokens — **0.017% of spend.** 98.5% is six agents
re-reading a large context every turn. **Cutting messages saves almost nothing; cutting live
contexts saves nearly everything.** Any efficiency change aimed at "less chatter" is aimed at the
wrong variable.

> **Corroboration, which matters more than usual given Tier B's fate.** Three blank-context agents
> independently measured this from the same transcripts without access to each other or to this file:
> **531.9M / 532.0M / 535.1M cache read**, **~$361 / ~$361 / ~$363**. Four measurements within ~1%,
> and **all five seat-level figures matched exactly.**

> ### ⚠ CORRECTION (2026-08-03, session 7) — the figures above are MAIN-THREAD ONLY
>
> **Everything above excludes subagent spend, and I did not notice.** Subagent transcripts live at
> `<project-dir>/<session-uuid>/subagents/agent-*.jsonl` — **one directory deeper than the
> non-recursive glob** used above (`<dir>/*.jsonl`). There are 274 such transcripts across the anthill
> project dirs; the scan never saw one.
>
> **Corrected session-6 total, verified by re-running with `glob(..., recursive=True)`:**
>
> |           | main threads | subagents                      | **TOTAL**       |
> | --------- | ------------ | ------------------------------ | --------------- |
> | tokens    | 543,392,951  | **20,406,258** (7 transcripts) | **563,799,209** |
> | est. cost | $363         | **$25**                        | **~$388**       |
>
> **Use $388 / 563.8M for any comparison.** The $363 figure is main-thread spend and is correct only
> as that.
>
> **Found by scout (blank-context, one-shot) during session 7's measurement**, which **reproduced this
> file's main-thread total to the byte (543,392,951) and all six per-seat dollar figures** before
> finding the omission. That ordering is the point: it calibrated the instrument against my published
> numbers, matched them exactly, and _then_ showed they were incomplete.
>
> **The three-way corroboration above did not catch it either** — which is the more useful lesson.
> **Four independent measurements agreeing tells you the METHOD is reproducible, not that it is
> complete.** All four scanned the same wrong depth. A shared blind spot survives any amount of
> agreement, and this is the second time in two sessions that a figure of mine was wrong in a way
> consensus could not see.

_Cost is a list-price estimate from transcript `usage` fields, not an invoice._

### Git — re-run over `236c45b..0d3d8f4`

- **34 non-merge commits**, 2,138 lines changed, **0 reverts**
- Gate **390 → 427 pass / 0 fail** (see reconciliation below)
- Split: **CODE 1,120 (52.4%)** — 509 impl, 611 test — **PROSE 1,018 (47.6%)**, of which team living
  docs 493, project docs 361, shipped skills/templates 160

### Grounding cost per seat

Common reads ≈ **19K tokens** (AGENTS, README, `.anthill/README`, principles, seams) plus the seat's
own doc (5–18K). All-seats ≈ **185K tokens** before any work happens.

---

## Tier B — TESTIMONY: source destroyed, not re-runnable

Taken from the log on 2026-08-03 before its deletion, by the author of this file. **Nobody can check
these.**

- **106 messages**, 01:51:23 → 02:43:12 = **51.8 min** (2.05 msg/min)
- **367,190 characters ≈ 92K tokens**; median message **3,190 chars**
- Per seat — maestro 24 / 76,616 · weaver 18 / 76,378 · steward 18 / 51,840 · scout 17 / 56,520 ·
  forager 15 / 53,232 · sentinel 14 / 52,604
- **Verified against the log while it existed:** message #284 at 01:51:23, #304 at 02:04:55 —
  **delta 13m31s**, confirming scout's central correction of the lead's "we are hours in."

---

## Tier C — DERIVED JUDGMENT, and the source is gone

A classification of all 106 messages by whether they would exist if one seat worked at a time.
**This is my bucketing, not a measurement**, and the log that would let someone disagree with it no
longer exists. **Weight accordingly.**

| bucket                                              | msgs                                                |
| --------------------------------------------------- | --------------------------------------------------- |
| teardown: reconciling 5 parallel branches           | 16                                                  |
| worktree/board substrate broken by isolation        | 11                                                  |
| land sequencing — holds, windows, who-goes-first    | 11                                                  |
| land announcements                                  | 7                                                   |
| lock queueing / `waitedMs` analysis                 | 6                                                   |
| stash hazard (raw-git fallback under parallel land) | 4                                                   |
| integration RED + unblock                           | 4                                                   |
| branch sync across worktrees                        | 2                                                   |
| **parallelism / isolation tax**                     | **61 of 106 (58%)** — 190,529 chars (52% of volume) |
| work, findings, ritual                              | 45                                                  |

---

## Reconciliations — numbers that appear more than once, differing, all correct

- **Gate:** `423` (R14, scout's report — measured on the merged tree at `8fd0741` during finalize),
  `427` (this file and R11's correction — HEAD after the later finalize commits). **Both correct at
  their own anchor.** Cite the sha, never the bare number.
- **Session span:** scout's report says `01:51 → ~02:35 (~44 min)`; this file says `51.8 min` to
  `02:43:12`. Different endpoints — scout anchored on the work closing, this on the last message.
- **Commit counts:** 53 / 54 / 56 / "26 of those are merges" all appeared during the session. This
  file states **34 non-merge over a named range**; use the range, not the number.

---

## What this is for

Session 7 runs staged on a shared tree and reports against Tier A. **Compare only Tier A** — it is
the tier anyone can re-run. Tier B is a one-time reading of a destroyed instrument; if session 7's
message count is compared against it, say so and label it.

**And note what the deletion did to the comparison itself:** session 7 will produce a comms log that
_can_ be measured, against a session-6 figure that no longer can. **That asymmetry is not fixable
after the fact** — it is the cost of the deletion, and it is larger than the file that was lost.

## The mechanism, for whoever writes the next teardown procedure

**An untracked symlink target living inside a worktree is destroyed by `git worktree remove`, and no
git-level check can see it.** `git status` is clean, `rev-list` is zero, every safety check this repo
has passes — and the data is gone. Filed against the [shared-tree
investigation](../investigations/2026-07-27-shared-tree-failure-modes.md), which forecast that
worktrees break implicitly-shared state but priced it as _breakage during the session_, not as
_destruction at teardown_.

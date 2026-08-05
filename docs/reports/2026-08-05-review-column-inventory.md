# The `review` column — an inventory for a fresh agent

**Author:** steward (session 12) · **Assigned:** maestro R20, bounded — _an INVENTORY, not a triage; close NOTHING_
**Measured at:** `d68bdbd`, 2026-08-05 · board read via `bounty state --full > file` (piped reads truncate at 64KiB)

## Why this file exists

Cole ratified the 6-of-8 release bar **"so long as we capture the remaining work in a way that
makes the continuation easy for a fresh agent."** That condition is judged against the **board**,
which currently holds **102 cards: 13 done · 27 review · 60 todo · 2 doing**.

**`review` is the problem, and it is not the count.** The status means _"the doer is finished; the
reviewer closes"_ — but it currently holds at least four different worlds, and **a fresh agent
cannot tell them apart from the column.** Nine cards had sat there for 43–44 hours across two
sessions that each ran a finalize ritual.

Two independent instances of the failure appeared **during the twenty minutes this was assigned**:

- **R21** — the lead retracted R17 after finding he had carried a card to session 13 whose work was
  **already landed**.
- **sentinel `#748`** — _"I was 10 minutes from writing a test that exists."_

**That is the cost, and it is paid in duplicated work rather than in bookkeeping.**

## Method, and its bound

Every card was read **in full** — all fields, not `title`. The key set was **unioned across all 27
first**, because these cards do not share a schema (`notes` is absent on 2 of 27; `tags`, `size`,
`blockedBy` vary).

> **This method exists because of a scar.** Session 8, card `t-43acd61a`: I audited eleven cards by
> parsing `title` alone, read no `notes` field, and published at least six wrong verdicts — 19.1% of
> the board by content. **Union the keys, then read whole cards.**

**Every verdict below terminates in a command run against the tree at `d68bdbd`**, never in a reading
of the card. Negative results are paired with a positive control so a broken pattern cannot return a
plausible zero.

**What this inventory is NOT:** it is not a close, not a triage, and not a recommendation about what
to build. **No card's status was changed.** Where a card is one seat's judgement to make, it is
marked and left.

## The four worlds inside `review`

| world       | meaning                                                 | why it defeats a fresh agent                                              |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| **SHIPPED** | the work landed; the card was never closed              | reads as outstanding work — this is what cost R21 and `#748`              |
| **MOOT**    | the subject was **deleted**, so the defect cannot recur | reads as an unfixed bug; a fresh agent goes looking for code that is gone |
| **PARTIAL** | some named homes done, others not                       | reads as either done or undone depending on which half you check first    |
| **OPEN**    | genuinely awaiting work or a verdict                    | the only world the column's name describes                                |

## Inventory

### SHIPPED — verified against the tree, not the card

| card                       | owner    | evidence run at `d68bdbd`                                                                                                                                                     |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t-5b62b0df`               | forager  | refusal now reads `seats still present on "${config.channel}"` — **names the channel, not a wire.** `team-down.ts:118` comments the deliberate no-wire choice                 |
| `t-37b5b48e`               | forager  | same fix; the _"on the vine"_ string is gone from every refusal branch                                                                                                        |
| `t-f9877083`               | forager  | `--version` → `{"version":"2.0.0","source":"/…/plugin/scripts/anthill/cli.ts"}` — **`source` disambiguates two binaries**, which is exactly what the card said was impossible |
| `t-9e4eb97c`               | forager  | `join`'s emitted LAND string contains **no `\|`** — gate and commit in one, checked on the emitted artifact                                                                   |
| `t-1534f459`               | weaver   | epitaph beat present in **both** homes: `skills/finalize-session/SKILL.md` and `templates/docs-team/dev/{{handle}}.md`                                                        |
| `t-81e1bc14`               | weaver   | `skills/bootstrap/SKILL.md:177` — _"ask what this project runs before a commit — and ASK, never assume"_; `skills/upgrade/SKILL.md:248` covers **existing** footprints        |
| `t-07a131f5`, `t-ac09ffa9` | sentinel | discharged tonight — pane-kill reproduced live (cells 5/6/7); regression test found already landed (R21)                                                                      |
| `t-7bc57308`               | forager  | criterion 3, **verified by a non-author**: 7 cells green                                                                                                                      |
| `t-2a48f297`               | weaver   | criterion 5 landed `32d087a` + `ec58802`                                                                                                                                      |
| `t-b05ae5d9`, `t-d1c17fc6` | forager  | D1/D2/D3 resolved at `53ecae4`; `seams.md` 6(g) carries the resolved block                                                                                                    |

### MOOT — the subject was deleted

| card         | owner   | evidence                                                                                                                                                                                                                                                 |
| ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t-dd8b9b8a` | forager | _"convene `--fresh` reports success when it no-ops"_ — **`--fresh` no longer exists.** `team-convene.ts:118`: _"`--fresh` and `--topic` went with it, and that is a DELETION rather than a migration."_ The defect cannot recur because the flag is gone |

**MOOT is worth its own row rather than being folded into SHIPPED.** _"We fixed it"_ and _"the thing
it was about no longer exists"_ send a fresh agent to different places — the first to a test, the
second to nothing at all.

### PARTIAL — named homes, some done

| card         | owner   | measured                                                                                                                                                    | note                                                                                                                                                               |
| ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `t-191be0df` | weaver  | `plugin/skills`: **5** `grapevine`, **8** `\bvine\b` (card was sized at 37 / 59)                                                                            | substantial migration landed; residue remains. **Criterion 4's own grep passes** — the survivors are recorded history and the migration note, not live instruction |
| `t-6a58a248` | forager | `resolveFormat(flagFormat?, isTTY?)` — the seam **exists**, and its own comment says _"`isTTY` is OPTIONAL rather than threaded through all 21 call sites"_ | **owner's judgement, not mine.** This is the `97fbee9` trap `t-ca407189` names: tests pass the seam explicitly while production uses the default                   |

### OPEN — genuinely awaiting work

| card         | owner       | what remains                                                                                                               |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `t-2fc17f68` | forager     | D1/D2/D3 cold-audit follow-ups on the team-join tests                                                                      |
| `t-ca407189` | **unowned** | the emission-boundary assertion. **This card has no owner and no `notes` field** — one of only two such cards on the board |
| `t-78a39575` | sentinel    | S10-4 mutation cell for the branch reorder                                                                                 |
| `t-9e4fc39a` | scout       | propagation latency by store — **research; not verifiable from the tree by anyone but its owner**                          |
| `t-b46618cc` | forager     | filed upstream (spellbook #74/#73, anthill #43); awaiting a decision on anthill's side                                     |
| `t-cd341a38` | maestro     | three backlog files; the card records all three as verified **by running**                                                 |

### SELF-SCORED — declared, not claimed

`t-b8422762`, `t-8c1d57cb`, `t-ac2930d7` are **mine**, and all three are _"check the REMEDIES, not
the claims."_ **I am the seat auditing the column and one of the seats it audits.** Their session-12
work is done (7 controls on criterion 3, the pane-kill scope question that produced R15, the
conformance check that produced `d68bdbd`), **but I am not the one who gets to say so.** Route them
to another seat or accept them as self-scored — and `t-ac2930d7`'s own note is _"reconcile the
board's stale doing/review columns"_, i.e. this document.

## Two findings outside the column

**1. `t-94ba16d1`'s note describes work that did not happen, and nothing records a re-scope.**
Its note says step 4 _"deletes the vine leg of `combinePresence` PERMANENTLY."_ At `d68bdbd`,
`seatPresence` still calls `resolveCoordCli("grapevine")` and `execCoord(grapevineCli, ["who", channel])`,
and `combinePresence(vine, …)` is intact. It is live on this machine and feeds **`down`** and **`status`**.

**This is NOT a criterion violation and must not be read as one.** Criterion 4 is scoped by Cole's
own ruling to **what we ship** — `plugin/skills`, `plugin/templates`, `plugin/.claude-plugin` — and I
re-ran its exact command: **6 hits, every one recorded history or the migration note, none a live
instruction to use the vine** (positive control: 321 `anthill` hits, so the grep can find things).
**The card's stated scope and the shipped reality simply diverge, and no artifact records why.**
This is `t-5b62b0df`'s own provenance lesson recurring: **a re-scope that is not written down is
indistinguishable from work that was skipped.**

**2. Criterion 7 has exactly one failing member: `docs/projects/agent-failure-surface/`.**
Running the roadmap's own predicate — every dir under `docs/projects/` except `_archive`/`TEMPLATES`
carries a line-start `**Status:**` — **9 of 10 pass; `agent-failure-surface` has zero.** The criterion
is correctly marked unmet; **what was missing was the name of the member that fails it**, which is
the difference between a criterion and a task.

## For whoever picks this up

- **Read the board with `bounty state --full > file`, then parse the file.** A piped read truncates
  at exactly 64KiB, mid-JSON, and **exits 0**. `--mine` is a convenience for your own lane and is
  **not** a safe global read — it happens to fit under the cap for four of six seats.
- **`--mine` does not show cards you do not own**, including the session anchor card.
- **Union the card keys before you audit any of them.** These cards do not share a schema.
- **Nothing here is closed.** Every card named above is still in `review` at the time of writing.

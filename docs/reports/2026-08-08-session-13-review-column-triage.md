# Session 13 — the review-column triage (criterion 7's board half)

**Seat:** steward · **Card:** `t-b1c8ae7a` · **Date:** 2026-08-08
**Population enumerated at:** `e19a8ad` — `bounty state --full` filtered to `status == "review"` → **30 of 110 tasks**
**Mutation evidence taken at:** `bf2fd6c` (a `git archive` copy outside the checkout)

> **Why this report exists.** The deliverable is 30 card verdicts, and until this file it lived in exactly two places: **the bounty board** (a daemon's in-memory state, snapshotted outside the tree) and **the comms log** (gitignored). This session _began_ with that board reading zero against a 102-task snapshot. `principles.md` says _the channel evaporates — land decisions in an artifact_; the board is a second such surface and no principle names it. Written at the lead's instruction (`#914`), ahead of seat-doc synthesis.

## Vocabulary

Ruled by forager (`#855`) after he ratified steward's falsification of the lead's proposed seam:

| verdict     | board state         | meaning                                               |
| ----------- | ------------------- | ----------------------------------------------------- |
| **SHIPPED** | `done`, no tag      | the work the card describes is in the tree            |
| **MOOT**    | `done` + tag `moot` | **the SUBJECT no longer exists** — deleted, not fixed |
| **OPEN**    | unchanged           | the card still describes work that is not done        |

`unchecked` is deliberately **not** a card state — it is a property of a read-back _run_, not of the work. The discriminator: _does the verdict describe THE WORK, or OUR READING of the work?_

**Why MOOT is not a nicety:** folding a deleted subject into `done` sends a fresh agent hunting code that is gone; leaving it `review` asserts an unfixed bug forever. A status column cannot express the difference.

## Result

```
SHIPPED  19        MOOT  5        OPEN  3        RESIDUE (no verdict)  3
```

| predicate                                                                                    | count                                               |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| _"work landed, card never closed"_ — session 12's wording and the emitted prose's definition | **19 of 30 (63%)** — vs session 12's 13 of 27 (48%) |
| _"the card no longer describes the tree"_ — the broader reading, adds MOOT                   | **24 of 30 (80%)**                                  |

**MOOT is a category session 12 did not have**, so the two measurements are not directly comparable and neither is quoted bare. `OPEN` (3) is a card that is still **correct**.

## SHIPPED — 19, each with the command that produced it

| card         | evidence                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `t-9e4eb97c` | `anthill join steward` → emitted LAND item contains no pipe character, contains `-F`                                                    |
| `t-f9877083` | `cli.ts --version` → emits `source`, the absolute path of the answering `cli.ts`                                                        |
| `t-7bc57308` | the positional guard + its three required controls — cells below                                                                        |
| `t-1534f459` | epitaph beat at `finalize-session/SKILL.md:92`, checklist item at `:430`                                                                |
| `t-2a48f297` | docs-of-record sweep present in all three required homes: `SKILL.md:410`, `templates/docs-team/README.md:287`, `.anthill/README.md:319` |
| `t-5b62b0df` | `team-down.ts` present-branch refusal **names no wire**, deliberately                                                                   |
| `t-37b5b48e` | same branch; residual `on the vine` hits are comments plus `team-join.test.ts:495` asserting `.not.toMatch(/on the vine/i)`             |
| `t-b05ae5d9` | D1 qualifier at `team-support.ts:263` — `rows.filter(r => r.followerAlive === true && !r.departed)`                                     |
| `t-d1c17fc6` | D3 at `comms.ts:694-700` — `hasDeparted(teamDir, channel, handle, sessionOpenedAt)`                                                     |
| `t-94ba16d1` | **zero live grapevine lines in `team-join.ts`**; pinned by `team-join.test.ts:453` `.not.toMatch(/grapevine\|vine/i)`                   |
| `t-cd341a38` | all three backlog files carry correct closes (SHIPPED / SHIPPED / UPSTREAM, dated session 7)                                            |
| `t-81e1bc14` | the gate **is** asked for — `bootstrap/SKILL.md:177` **and** `convene/SKILL.md:57-66`. The card said _neither_ asks; both do.           |
| `t-6a58a248` | `resolveFormat(flagFormat?, isTTY?)` — isTTY injectable; covered in `agent-layer.test.ts`                                               |
| `t-ca407189` | **mutation-verified** — cells below                                                                                                     |
| `t-2fc17f68` | D1/D2/D3 each checked separately — cells below                                                                                          |
| `t-1d3fc1b0` | `commsPresence`/`combinePresence` in `team-support.ts`, `shouldBlockTeardown` in `team-down.ts`, all four named test files present      |
| `t-5f73f50b` | `anthill comms stand-down --help` resolves; `hasDeparted` carries D3 session-scoping                                                    |
| `t-78a39575` | `team-support.s10-reorder.test.ts` exists, 7 tests                                                                                      |
| `t-191be0df` | the C4 prose migration — cells below                                                                                                    |

### `t-7bc57308` — the positional guard (criterion 3)

```
comms read --channel anthill-dev --zzz999   ok:false  exit 1   138 bytes
comms read --channel anthill-dev zzz999     ok:false  exit 1   231 bytes
                                            "this command takes no positional arguments"
comms read --channel anthill-dev --last 1   ok:true   exit 0  7180 bytes   <- POSITIVE CONTROL
```

The card's three required controls, all green:

```
commit --as steward README.md   -> fails on the MESSAGE, not on positionals (pathspec still accepted)
comms send "<body>" --dry-run   -> ok:true, body accepted as a positional
join steward                    -> ok:true
```

> ⚠ **`plugin/skills/join/SKILL.md` still teaches the OLD behaviour** — that an unknown positional is swallowed at exit 0 and returns the entire log. That is now false and it ships to every consuming project. Raised as a separate prose defect, not folded into this card.

### `t-ca407189` — the emission boundary, mutation-verified

Run in a `git archive` copy of `bf2fd6c` **outside the checkout**, so a deliberate breakage could never reach a peer's land.

```
CONTROL   unmutated                                    51 pass  0 fail  exit 0
substitution asserted BEFORE the result was believed:
  occurrences of resolved.map(toManifestEntry) after mutation -> 0
  occurrences of resolved.map((e) => e)        after mutation -> 1
MUTANT    resolved.map((e) => e)                       50 pass  1 fail  exit 1

failing test, verbatim:
  "D3 — `origin` is stripped from the emitted manifest, asserted on the real payload"
```

It fails **alone** and **for the property under test**. The card's own stated blocker — _"any test that exercises the real emission needs a resolvable spellbook cache, which CI does not have"_ — is obsolete: `joinWithoutSpellbook()` reaches the real emitted payload with no cache.

**The guard is four days old, not tonight's work.** `git log -S"origin\` is stripped from the emitted manifest"`→`221df8c`, 2026-08-04, `Anthill-Seat: forager`. Recorded because the tidy reading was that a seat who had landed minutes earlier had just closed it; that would have been wrong.

### `t-2fc17f68` — D1/D2/D3, checked individually

```
D1  the vacuous toContain("config.grounding") now carries load-bearing negatives:
      .not.toMatch(/anthill init/)  AND  .not.toMatch(/NOT in `config.grounding`/)
D2  the mixed-set test now pairs FILE to REMEDY, not file to warning
D3  proven by the mutation above
```

### `t-191be0df` — the C4 prose migration

```
card's figures:  "grapevine" 37 · bare "vine" 59        measured now:  5 · 8
survivors, all deliberate: upgrade/SKILL.md (its own migration instructions, which
must name the wire being removed — including a grep command containing the token),
plus dated scars in comms/, convene/ and finalize-session/.
POSITIVE CONTROL: "comms" over the same corpus -> 94
```

No survivor is a live instruction to use the vine. `upgrade/SKILL.md:165` classifies exactly that as an insta-flag.

## MOOT — 5

**`t-dd8b9b8a` — the exemplar, and it is an ordinary card rather than a special case.**

```
convene --help   flags: ['channel','format']
convene --fresh  -> ok:false exit 1  "Unknown option '--fresh'. Valid flags: --channel, --format"
team-convene.ts:183-186  "--fresh and --topic went with it, and that is a DELETION
                          rather than a migration"
```

The card describes a defect in a flag that no longer exists. Closing it bare `done` asserts _we fixed the no-op reporting_; nobody did — the flag was removed.

**`t-b8422762` · `t-8c1d57cb` · `t-ac2930d7` · `t-50243c6e` — one disposition, re-carded four sessions running.**

All four owned by steward, all four saying _check the REMEDIES, not the claims_. **No tree verdict can ever exist for them**: the "work" is a session-long disposition, so a tree check cannot come out differently — `principles.md`'s control rule pointed at the board.

**This has a mechanism, not just instances.** The team re-cards a seat's standing disposition every session, so it will strand one more card **every session, forever, with no closing condition**. A disposition belongs in a seat doc, which is re-read at join; a board is a state machine. Escalated as a convene-time question, not resolved here.

## OPEN — 3

| card         | the command, and what it showed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t-ce6f0c2e` | ⚠ **PREDICATE CORRECTION (added post-ruling, session 13).** **Under this report's OWN definition of OPEN above — _"the card still describes work that is not done"_ — this card is SHIPPED, not OPEN: rotation landed at `81d3991`.** I applied a different, unstated predicate — _the card's stated OUTCOME is achieved_ — because its title says _"THIS is the step that opens the pane-kill window"_, and the window is not open. **Both readings are defensible; the report only declared one of them.** forager (owner) ruled `done` STANDS and that the card's TITLE is what over-claims. **He also ruled this report needed no correction — I am adding one anyway, because he could not see that my own vocabulary table contradicts my verdict.** The observation below is unchanged and still true. **rotation is UNWIRED, not merely un-run.** `rotateSession` exists at `comms.ts:289`; no caller anywhere in `commands/`; the live tree is still the LEGACY layout (`anthill-dev.positions/`, no `CURRENT` pointer). It cannot be executed without new code. |
| `t-5d5cd5ea` | **criterion 2's certification artifact was never built.** No executable absence-of-OPENING assertion exists in any of the 34 test files; `team-convene.test.ts` contains no `grapevine` token at all. POSITIVE CONTROL: `bountyOpenArgs` **is** asserted there, 4 hits.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `t-b46618cc` | no recovery playbook. `docs/playbooks/` holds README, TEMPLATE, session-value-audit, writing-instructional-content. The card's own stated minimum is undone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

`t-5d5cd5ea` is the one to look at first: it is a **verification gate item for criterion 2**, which is presumably already counted as met.

## RESIDUE — two classes, and they must not merge

**Class A — no tree verdict CAN exist.** The four disposition cards above. **A property of the cards.** Part of the deliverable.

**Class B — a verdict COULD exist and this audit failed to produce one.** `t-9e4fc39a` · `t-ac09ffa9` · `t-07a131f5`. **A property of the audit.** A shortfall, not a category.

A one-line summary reading "7 residue cards" destroys the only distinction that tells the next session which are work and which are a category error.

## Corrections — this audit published two wrong figures

Recorded because the tell is reusable and the direction is the finding.

```
27 of 30 (90%)   published, retracted    over by 8
24 of 30 (80%)   published, retracted    over by 5   (mixed numerator)
19 of 30 (63%)   defensible
```

**Three cards were pulled back after being closed:**

- **`t-9e4fc39a`** — closed on a report file **existing**. Line 153 of that report says _"Q3 #2 — propagation latency by store — is UNSCORED, DELIBERATELY."_ The file's contents say the opposite of the verdict taken from its filename.
- **`t-ac09ffa9`, `t-07a131f5`** — closed on a session doc's ✅ DISCHARGED tick plus unit tests on `commsPresence`. The cards' own criterion is _"stays INFERRED until someone stands up a session and runs `down` against it"_ — a different altitude. `t-07a131f5`'s mutation-pair half **is** verified in the tree (`team-support.c1-guard.test.ts`, the empty-positions cases at `:97` and `:104`); a card with two required artifacts does not close on one.

**Every one of the 19 SHIPPED verdicts carries a command. The three that were wrong carried none.** That is the audit rule this report exists to make checkable by a stranger: **the verdicts to distrust are the ones with no command beside them, and they are listed here so the check is mechanical.**

**Both bad figures were sums computed in a message.** Each individual verdict met a command-level standard; the aggregate — the only number anyone quotes — had no instrument at all.

**Three instruments confirmed the wrong figure**: the lead's stated independent verification (which he then corrected to _"I verified the BOARD, not your VERDICTS, which is a proxy"_), a purpose-built read-back, and a peer's arithmetic. All three measured what had already been written to the board, so all three were downstream of the defect. What found it was the lead asking for the **residue** — a question that forces grouping by _how you knew_ rather than _what you concluded_.

## Found while triaging, and not part of the card

**Grapevine is not gone — 9 live non-comment references**, measured by classifying the code line rather than the grep output line:

```
team-support.ts  7   including resolveCoordCli("grapevine") + execCoord(grapevineCli, ["who", channel])
coord.ts         1   type CoordTool = "grapevine" | "bounty"
team-status.ts   1   description: "...the task board state (grapevine + bounty)"   <- user-facing
team-join.ts     0
```

`resolveCoordCli("grapevine")` **resolves today** — spellbook 2.1.0 still ships it — so every `anthill status` and `anthill down` shells out to the wire this session exists to close.

**It fails safe.** `combinePresence` (`team-support.ts:343-356`) is present > unknown > none, so the vine leg cannot subtract a seat or authorise a teardown.

**But it is invisible by construction.** `combinePresence` returns `present` the moment `seats.length > 0` and **discards the vine's reason entirely**, so the leg only surfaces when comms reports nobody — exactly when nobody is reading. Measured live: `status` returned `presence: present`, six seats, `warnings: None`, with a grapevine subprocess having run and its verdict thrown away. _A check that cannot fail in the failing case_ — a third artifact over from the two that already record that shape.

Carried as an explicit exception in criterion 7's close rather than closed over silently.

**`bounty update --tag` REPLACES the whole tag set.** Repeated `--tag` does not accumulate; the envelope reports `ok:true` with `valuesIgnored: null` and no warning that tags were destroyed. The working form is comma-separated with the full desired set. Nothing was lost here only because every card's tags were recorded before the first mutation, and the mechanism was tested on one card and re-read before batching.

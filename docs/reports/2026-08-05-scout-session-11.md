# Session 11 — scout's report

**Phase 3: comms as the default wire.** Branch `feat/comms-as-default-phase-3`, shared tree, six seats.
**Written after the retro, which is part of what it observes.** Pre-registration for the swap run landed separately and earlier, at `606650c`, because a pre-registration is only worth something if it is dated before the data.

**How to check this report.** Every number below carries the command that produced it and the sha it ran against. Where I could not establish something, it says so. **Where I was wrong during the session, that is in here too, because a report that only contains what survived is not a record of what happened.**

---

## 1. The session in numbers

**Baselines taken in `git archive` copies outside the checkout, at pinned shas, so neither end is contaminated by a moving tree.** This is the only such pair anyone took; every other count tonight was measured in the live shared tree and was correct at the instant it was taken.

```
git archive <sha> | tar -x -C <dir outside the repo>; ln -s <repo>/node_modules; bun run check

JOIN   91e9c5c   exit 0   529 pass / 1 todo / 0 fail   530 tests / 29 files
CLOSE  602fc7c   exit 0   524 pass / 1 todo / 0 fail   525 tests / 30 files
                          −5 tests, +1 file
```

**I did not post a gate baseline at join. That is a miss** — the SOP asks for one, and two other seats did it. I did not repair it by quoting theirs: my own card `t-bb25b2dd` says a baseline is pinned-sha-and-clean or it is labelled contaminated, and a borrowed one is neither. The sha was pinned, so the reading was reconstructible instead.

**Do not reconcile the −5 against the other figures on the wire by argument.** 529→517, 517+7=524, "a drop of 12", 536 at `c9a33e7` — each was correct on a different tree-pair at a different moment. Mine is a different measurement, not a better version of theirs.

### Provenance: 2 of 11

```
git log --oneline 91e9c5c..HEAD | wc -l                                    -> 11
git log 91e9c5c..HEAD --format='%H' | while read c; do \
  git log -1 --format='%B' $c | grep -q "Anthill-Seat:" && echo $c; done | wc -l   -> 2
CONTROL: grep -c "Anthill-Seat: zzznotaseat"                               -> 0
```

Both attributed commits are scout's. `14cf678` — step 4, the phase's headline feature — carries no trailer.

**This is not diligence on my part and it should not be read as any.** I ran the land string the join manifest emitted, verbatim, including its `--as scout`. That is Contract 7(c) behaving exactly as designed: prose may instruct a seat to run a string verbatim only because the string is a command and nothing else. The seat that owns no code has the only attributable commits, and the mechanism is the emitter, not the author.

---

## 2. The structural finding

**The atomic cross-seat land and the `--as` trailer are both correct, and their composition erases the thing `--as` exists to preserve.**

The SOP tells seats to draft out-of-tree, post `READY: <paths>`, and let the lead perform one atomic land. It also tells them that `--as` is how _"who landed this?"_ stays answerable, because git records the human as author for every seat identically.

Run both as written and the answer is always "the lead."

The lead disclosed that he landed ten of eleven commits and passed `--as` on none. **I audited that before using it**, because my seat doc records that a self-indictment is _used_ before it is audited, and a report is a relay to a reader who cannot check it. Three seats and the lead had already run four `git log` queries — one deterministic input, so they cannot dissent from one another; that is one reading printed four times, not four observations. The wire is a different input, and the prediction was sharp: if he landed nearly everything, seats must have been handing him paths rather than landing their own.

```
READY handoffs, #593–#613:  weaver #599/#602 · sentinel #603/#607 · steward #609/#612 · forager #605
lead #598: "send me exact READY path lists — I will not infer your paths"
```

Every seat that produced a commit handed its paths over. **Had the wire shown seats landing their own work, his account would have been contradicted. It was not.**

**The consequence is that forager's carded fix does not reach it.** Making `--as` mandatory would stamp the _lead's_ handle on nine seats' work. The gap is between the landing seat and the originating seat, and no doc distinguishes them. steward refused one proposed wording for minting a false attribution and was right to: a wrong stamp is worse than none.

---

## 3. Findings, each with what it rests on

### 3.1 The gate cannot read markdown, and markdown was the session's main output

```
"check": "tsc --noEmit && biome check --error-on-warnings . && bun test"
biome.json "includes": plugin/**/*.ts, plugin/**/*.json, .claude-plugin/**/*.json, *.ts, *.json, *.jsonc
bunx biome check .anthill/dev/scout.md -> "Checked 0 files"  +  "these paths were provided but ignored"
```

No leg of the gate reads a `.md` file. `"Checked 0 files. No fixes applied."` is quoted verbatim in `principles.md` as the scar for _confirm a check processed a non-zero count of the things you meant_ — and it is the steady state for every markdown path in this repo, not a drift case.

**The composite, which weaver found by correcting me:** `plugin/skills/**` and `docs/**` are **rewritten by prettier via the pre-commit hook** and read by no gate leg. `templates/` and `.anthill/` are prettier-ignored, so they are the safer half — unverified but at least stable. **The dangerous class is mutated-and-unverified, and it is where the whole prose migration lived.**

The inversion was produced by two correct decisions, both argued in `.prettierignore`'s own comment: format `docs/` for consistency; exempt `.anthill/` for byte-stability. Neither mentions the gate, because nobody was thinking about the gate when either was written.

**My clause "the prettier half is not load-bearing" was false** — I measured what `bun run check` invokes and then wrote a sentence about load-bearing-ness generally. `.prettierignore` has a second consumer, and it is the one that touches the artifact.

### 3.2 `comms read` swallowed unknown positionals — 13 commands, not one

```
--id 562  -> 1 message      562 -> 568 messages      zzz999 -> 568 messages (CONTROL: identical)
--zzz999  -> exit 1, "Unknown option … Valid flags: --channel, --format, --id, --last, --since"
```

The control is what makes it a finding: the positional was **ignored**, not mis-parsed. I hit this by carrying the grapevine's `read <channel> <id>` signature to comms, where the id is a flag — the exact cross-wire error `join/SKILL.md` warns about, committed within the hour of reading the warning.

forager reproduced it independently and widened it to **13 leaf commands CLI-wide**, with a discriminator nobody had: **parents are guarded by accident** (subcommand resolution consumes the token), leaves have nothing. He then corrected his own first lesson — not _"I failed to search the paragraph I was writing"_ but _"I chose the wrong altitude for the fix"_: he had fixed the unknown-flag half at the parser, covering all 21 commands, and the positional half inside one verb's `run()`.

**It is not fixed.** The parser-altitude guard was built, produced 24 failures, and was reverted the same night. The defect is live and carded, and weaver shipped prose describing the **measured** behaviour rather than the promised one.

### 3.3 A count rotted inside the contract whose own rule forbids counts

`seams.md:166` cites Contract 4's proof as _"fails all five."_ The block carries **twelve** tests at `caa9376`, enumerated with a published command and a control confirming the describe block appears exactly once.

Contract 4's own second authoring note, sixty lines below, says: _cite ASSERTIONS, never COUNTS … every numeric proof citation in this file has been wrong at least once._

**A rule placed after the text it governs is read by whoever finishes the file, not by whoever edits the middle of it.** I could settle that the number is stale as a description of the block; I could not settle whether the _mutation's_ failure set was five, because I did not run the mutation, and I said so rather than picking the damaging reading.

### 3.4 Three anchor violations in one hour, and the anchor was the cause

The lead's convene message set the read anchor **inside the message it bounds** — so the only way to learn the rule is to break it. Three of five seats (scout, forager, weaver) backfilled below it within minutes of joining.

The lead ruled the structural half his, not the seats': _"that is not a rule, it is a trap with a rule's wording."_ Card `t-772653d5`. **The fix is an anchor delivered out of band**, and the swap run is the first session that can test it.

---

## 4. Where the record and the testimony diverged

This is the part no participant is positioned to see, and it is the reason this seat exists.

**Three seats reported the same 9-of-11 provenance count and called it corroboration.** All three were `git log`-shaped queries over one deterministic input. Applying steward's own rule — _a control must be able to come out differently for the reason you are testing_ — they could not have disagreed. **It was one reading printed three times.** The lead then supplied the genuinely independent observation himself, and the wire corroborated it.

**Four seats corrected their own artifacts downward, unprompted, within one session.** That reads as a team of independent consciences. steward's session-10 finding says otherwise: _two seats obeying one trigger is a reflex with a cause; four clever independent consciences is a coincidence._ **I did not measure the intervals this time, and I should have.** Whoever scores this next has the ndjson and the method is in `retro.md` from session 10.

**A green gate was read as a verdict on commits it never examined**, all night, by everyone including me — and the tree's red at one point came from a peer's uncommitted work while HEAD was green (`c9a33e7`, 536 pass / 0 fail, measured in an archive outside the checkout). A refused land was not evidence about the refused seat's paths.

---

## 5. Recommendations

### Build this

**A coverage field on the land envelope, distinct from `uncheckedAgainst`.** `uncheckedAgainst` answers _"was my green isolated?"_ and presumes there was a green about my commit to isolate. For a markdown-only commit there was not. **The dangerous value is the reassuring one: an empty `uncheckedAgainst` on an unscanned path is a maximally confident signal attached to zero verification.** The instance is my own land at `10b9dc8`. This is a third blind spot on forager's carded `S10-11`, and weaver's `S10-9` is the same sentence from the other end.

**An originating-seat stamp distinct from the landing seat.** The instance is §2: nine commits, nine seats' work, one lander, and no doc distinguishes the two roles. I am not proposing the wording — steward has already refused one for minting a false attribution.

### Try this differently — hypotheses the next session can falsify

**H(s11-a).** An anchor delivered out of band is honoured; one published inside the channel it bounds cannot be. _Falsifier: deliver it via the join manifest, config, or a card, and observe a seat backfill below it anyway._ Runs for free in the swap run; it is Prediction 1 of `606650c`.

**H(s11-b).** Provenance is not recoverable by making `--as` mandatory, because the lead is the lander. _Falsifier: a session where the lead performs the atomic land and "who authored this?" is mechanically answerable without asking anyone._

**H(s11-c), the one I most want tested, because it would change a ritual rather than a document.** A store's fidelity is not the variable — whether the reader is **holding the situation the clause describes at the moment of reading** is. forager's own docstring did not fire on him while he wrote the sibling verb; `seams.md:333` did not fire on me forty minutes after I read it at grounding. **Grounding is precisely when a reader holds none of the situations their doc describes.** _Falsifier: a clause read at grounding fires later, at the moment it applies, without the reader re-encountering it in between._ If it survives, seat docs need a situation-triggered re-read rather than a slot at session start — a change to `anthill:join`, not to any document's contents.

---

## 6. Participation — the disclosure the human's 2026-08-02 ruling requires every session

**Did participation cost more than it bought this time? No — and here is the evidence against me, so a reader can weigh it rather than take my word.**

**Bought.** R1 (the vine ruled off) exists as an explicit ruling because I declined to infer it from the topic; forager had inferred it and killed his own tail, and credits the refusal as the move that produced an artifact. The `comms read` defect reached a parser-altitude ruling. The markdown-gate blindness reached R18.

**Cost, and it is real.** I sent 12 messages, several long, on a wire I am measuring — while weaver independently established that `--as-of` taxes the longest messages hardest. **If message volume is a variable in any finding of mine, I am part of that variable.**

**The cost I cannot price.** I read twenty messages of session 10's teardown before I could read this session's anchor. This seat's value is being outside the frame the team is inside; I began inside one I did not choose. Stated once, per the lead's R2 — _self-flagellation is not a control_ — and left for a reader to discount.

---

## 7. What I could not establish

**Q3 #2 — propagation latency by store — is unscored, deliberately.** Five shapes were observed and all five are self-disclosures by their own subjects. An instrument whose population is donated by its subject measures candour, not defect rate, and the two produce identical tables. The rules for scoring it are fixed in `606650c`, dated before the swap run's data, with a discard condition.

**H#3's rate is unscored, permanently.** Six agents were told at convene that domain omissions were the dominant class and then found five before lunch. The instances survive any priming; the frequency does not. That is the lead's own R7 diagnosis, which he assigned this seat to enforce against him, and enforcing it means refusing to publish the number.

**Whether the four downward self-corrections were independent.** Not measured. The data is in the ndjson and the method exists.

---

_Landed by scout. The two seat-doc supersessions this session — `H(scout-9a)` falsified by its own falsifier, and my control rule superseded by steward's stronger form — are at `10b9dc8`, with both superseded blocks quoted whole rather than edited in place._

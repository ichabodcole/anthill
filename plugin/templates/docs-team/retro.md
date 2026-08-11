# Retro — what this team predicts, and what came back wrong

**This file starts empty on purpose.** The lead writes an entry at
**`anthill:finalize-session`** (step 4.5), from the seats' answers on the wire. **Newest first** —
the next convene reads the top of this file, and a retro nobody re-reads is a write-only store.

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here
> because this file starts without the shorthand and accumulates it as the team writes.

---

## The three questions

1. **What went well?**
2. **What didn't go well?**
3. **What would you change for the next round?**

## The two rules that make it worth writing

Without them a retro produces a **mood**, and a mood cannot be checked.

- **Q3 answers are HYPOTHESES the next session can test, or they are not answers.** _"We should
  communicate better"_ is untestable and dies in the doc. _"Announcing a shared-file hold before
  editing will eliminate collision rework — if it doesn't, the hazard isn't announcement latency"_
  **can come back wrong**, and a prediction that fails precisely teaches more than one that survives.
- **Agreement is not truth.** A retro asks agents who shared a session, a channel and a frame to
  evaluate it — convergence will feel like validation when it is just the expected output of shared
  priors. So ask of every Q1/Q2 answer: **what is behind this besides us agreeing?**
  - **Claims about ARTIFACTS are executable** — _"the gate is green"_, _"3 of 3 citations are
    wrong"_. **Run it**, and nobody had to agree with anything.
  - **Claims about US are testimony** — _"coordination went well"_. Label them, and prefer the
    version carrying a number, a timestamp, a diff or a count.

**The next session's job is to come back to the last entry's Q3 and say what happened.** A
hypothesis nothing ever tests was a preference wearing evidence's clothes.

## The stamp on every entry

Each entry carries **which team wrote it** and **what shape that team was in** — an 8-hex
fingerprint of this team's own config entry (`anthill:finalize-session` step 4.5 has the command).

**It answers one question and you should not ask it a second one:** _were these two entries written
by the same team in the same shape?_ A changed fingerprint means the roster, channel or paths moved
between sessions, so a Q3 hypothesis carried forward is being tested by a **different** team than
proposed it — which is worth knowing before you record it as held or falsified.

**⚠ This makes an entry LABELLED, not COMPARABLE.** Two entries from two team shapes are still two
sessions on different work with different people, and the fingerprint does nothing to control for
that. It tells you the shapes differed; it does not license _"shape A outperformed shape B."_ Nothing
here makes that inference sound, and the stamp is easy to mistake for something that does.

---

<!--
Entries below, NEWEST FIRST. Suggested shape:

## <date> — session <n>: <label>

**Team:** <name> · **shape:** `<8 hex>`

**Q1 — what went well**
- <claim> — <artifact / testimony>

**Q2 — what didn't**
- <claim> — <artifact / testimony>

**Q3 — hypotheses for next session** (each one falsifiable, each one owned)
- **<prediction>.** Falsified if <what would have to be observed>. (<seat>)

**Carried in from last session** — what happened to the previous Q3:
- **<prediction>** → held / falsified / never tested, because <why>.
-->

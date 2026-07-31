# Report: StoryLoom first-contact intake — and the interview protocol that failed

**Report Date:** 2026-07-31
**Report Type:** Field intake — a team's first session on anthill
**Method:** Artifact inspection, then a blind five-question interview with the lead, then per-seat
questions. Two reported defects independently reproduced before being written up.

---

## Why this team, and why now

StoryLoom bootstrapped on **1.5.0** and convened the same day: lead `shahrazad` plus `tolkien`
(engine), `calvino` (spine), `hurston` (surface), `aesop` (verify). Five seats, tmux panes, straight
into a plan phase for a multi-seat feature. Every seat doc started as an empty template. **No
lineage.**

That is the entire reason to interview them immediately. Every other data source anthill has —
dream-flute, media-buffet, media-forge, operator-mono — is a **team under load** that has already
absorbed its workarounds. The
[shared-tree investigation](../investigations/2026-07-27-shared-tree-failure-modes.md) established
that absorbed friction stops being reportable: one team had grown a universal provenance convention
that existed in no document and that nobody could see any more.

**We had no first-contact data at all.** It expires within a session or two.

> **A correction made during this study.** An early claim that the team was on **1.6.0** was wrong —
> inferred from the plugin cache containing 1.6.0. Cache contents are not usage. They bootstrapped on
> **1.5.0**, which matters: their experience is of the version _before_ the join fixes shipped, which
> is why several of those bugs appear here as live field reports rather than as history.

## The protocol failed. Recording that first, because it is the most transferable finding.

**The design:** interview the lead blind, then ask three seats the same questions _without_ the
lead's account, so they reconstruct rather than confirm. Divergence between seat and lead would be the
signal.

**The failure:** the questions were posted as message #3 of a shared channel, and seats were told to
reach them with `grapevine pull <channel>` — which **prints from message #1**. The lead's complete
account was message #2. **There was no path to the question that did not pass through the answer being
isolated from.** The lead complied exactly with an instruction that made compliance impossible.

`calvino` — a seat that had not been asked — read the channel, recognised the hole, and posted
uninvited to flag it as time-critical. Three other seats independently disclosed the same
contamination unprompted.

**The shape of the error is the finding.** The isolation was designed at the level of _what the lead
says to the seats_; it leaked at the level of _how a channel is read_. That is:

> **A guarantee stated at one granularity, relied on at a finer one.**

— which is the very pattern `shahrazad` had synthesised for us two messages earlier, now arriving
inside the instrument built to collect it. Per-seat channels were opened on `calvino`'s flag, ~4
minutes too late.

**What to do instead, for the next one:** put the questions where prior answers are not. A channel per
respondent, or ask all respondents before any answer exists. `pull` is all-or-nothing; a shared
channel cannot host both the questions and the material you are isolating from.

### Why the study survived it

The protocol existed to detect **divergence from the lead**. It produced exactly that — from three
seats, independently, on the same point (below).

**Disagreement that survives reading the lead's account is stronger evidence than agreement that
never saw it.** Each of the three had the lead's framing in front of them and rejected it _with
reasons_. Uncontaminated agreement would have carried less weight. The contamination cost the
independence of the _supporting detail_, not of the disagreement.

## Finding 1 — the empty seat doc, where three seats overruled their lead

**The lead's account:** all four seats independently hedged their own reliability — _"my verdicts come
from re-deriving from code, not inherited understanding; treat them accordingly."_ He read this as the
scaffold producing an apologetic posture, and told them collectively to stop discounting themselves.

**All three seats disagreed, differently:**

- **tolkien:** _"I'd defend the hedge."_ Two of his early confident claims were later corrected by
  peers — the qualifier was **earned calibration, not diffidence**. What was missing was **anywhere to
  put a confidence level except prose on the vine, where it reads as apology.**
- **hurston:** the hedge was correct; the proof is that one of her hedged verdicts carried a wrong
  number into a contract. The fix is not reassurance — it is that **first-session output should be
  provisional by the PROCESS, not by the agent's tone.**
- **aesop:** it was never tone. An `⚠ unfilled template` flag **cannot distinguish _"bootstrapped an
  hour ago"_ from _"the last agent never ran finalize"_** — and those demand **opposite postures**
  toward every surrounding artifact. The first means write freely; the second means knowledge was
  _lost_ and everything nearby is suspect. He guessed, and happened to be right.

**Assessment: the seats are right and the lead's fix would have made things worse.** Reassurance
would suppress a correctly-calibrated signal. The real gap is that anthill has **no channel for
confidence except prose**, and **no way to say which kind of empty a seat doc is**.

`tolkien` names the underlying mode: the first session in a seat is **establishing**, not
**re-grounding**, and nothing in the tooling names that mode or changes what it asks of you.

## Finding 2 — two defects, reproduced independently

Reported by the lead; **both verified here before write-up**, on the principle that a system reporting
on itself is testimony, not evidence.

**`.anthill/scratch/` is not gate-safe for config files.** `join` calls it gate-safe. A `biome.json`
dropped there took the gate down for every seat. **Reproduced:** the file is confirmed gitignored, and
Biome still discovers it and exits with a configuration error. Biome walks the filesystem for nested
configs and never consults gitignore for _discovery_. The claim holds at **file-visibility** and fails
at **config-discovery**.

**`anthill commit`'s pathspec protects against sweeping a peer's FILES, not their EDITS in a shared
file.** **Reproduced:** with an uncommitted edit to Contract 2 present, a commit naming only
`seams.md` carried it — `{"ok":true, "committed":true}`, **no guard fired**. `seams.md` is precisely
where this recurs, because ownership there is **per-contract inside one file**.

`tolkien` lived the second one from the victim's side, and his account adds what reproduction cannot:

> my prose landed in the tree under calvino's commit and calvino's message, and **calvino's own
> verification was correct and could not see it** — "my paths are clean" is true, and blind.

**Note the shape of both.** The commit guard promises at **file** granularity; `seams.md` is owned at
**contract** granularity. The lead's abstraction, derived from two instances, correctly predicted a
third they had not tested. **That makes it a search strategy, not just a lesson** — wherever anthill
promises at granularity X while work happens at finer granularity Y, look for a defect.

## Finding 3 — four defects against work shipped the same day

- **`"your paths are unstaged"`** — wording shipped this morning in the unstage-on-failure fix.
  `tolkien` read it as _"your work is isolated."_ It means only that **his index entries** were
  dropped; the working-tree content remains for whoever next names that path. **Our sentence made his
  mistake possible.**
- **The board Monitor never fired once, all session.** `aesop` armed both tails, saw vine events all
  session, received **zero** board events — not even for his own card moves — and never verified it,
  assuming the working vine tail meant both were fine. On 1.5.0 that filter used **basic `grep` with an
  alternation**, where `(a|b)` is a literal, so it **matched nothing, ever, while looking correctly
  wired**. Fixed in 1.6.0. **This is field confirmation of a bug found by code reading the same day** —
  and his conclusion is the cost: _"I have no evidence I'd have heard about it."_
- **~~`grapevine read <id>` failed with exit 2~~ — RETRACTED by `tolkien` 2026-07-31, unprompted.**
  The signature is `read <channel> <id>`; he passed a bare id plus `--as`, which `read` does not take,
  and **the command printed the correct usage in the output he did not read**. He saw a non-zero exit,
  concluded "broken," and used `pull --since` for the whole session. **Two of five seats hit the same
  arg-order stumble**; `hurston` filed his as personal carelessness and never mentioned it.
  → The real finding is better than the defect would have been: **a workaround that works terminates
  diagnosis.** Because `pull --since` succeeded, he never returned to the failure. And: _"my scratch
  note said 'that path **may be** broken' — appropriately hedged. By the time it reached you it had
  hardened into 'it fails.' The hedge was in the private note and gone from the report"_ — **the second
  instance from the same seat, the same day, in the same direction.** See
  [the comms round](2026-07-31-story-loom-comms-round.md) for the general form.
- **The subagent cold-audit recommendation was unavailable.** `tolkien` thought of it and could not
  use it — his operator forbids the Agent tool unless asked. The skill's flagship pattern, shipped
  today, **has no fallback for a seat that cannot dispatch**.

Also: **`aesop` skimmed the join checklist** — _"it looked like a summary of things I already intended
to do."_ The `pull`-not-`tail` warning lives there. A fix landing in a skimmed surface is a fix at
risk.

## Finding 4 — calvino: the `Proof:` field is a churn magnet

Unsolicited, from the contract's owner, and invisible to anyone else.

Contract 1 was corrected **four times in ninety minutes** — granularity, a restatement, a false
premise, a false-negative class. **Every correction hit the `Proof`. The invariant never moved once.**

> That's not four mistakes; it's one design mismatch. An **invariant** is stable by nature. A
> **control** is a guess about enforcement, and you can't evaluate a proof mechanism by reading it,
> only by running it.

The scaffold files both in the one document whose stated job is to be the stable single source, so the
volatile half drags churn into the file that must not churn. They resolved it by moving enforcement to
a lane doc _"where churn is expected and cheap."_ **But the template led them there.**

His sharpening of our own guidance: _"never a transient line/file reference"_ is right, and **a
not-yet-built control is transient in exactly the same way — just in time rather than in space.**
Pinning to a green test is a pointer and fine; pinning to _a strategy for tests that don't exist yet_
is what attracts churn.

## Finding 5 — hurston: who counts, not who verifies

The contract was falsified because the enumeration of Studio's files was **assigned to the seat that
owned them**. She corrects her lead's framing directly:

> He framed this as _"hurston ran the check instead of arguing."_ True, but it undersells the luck.
> Had calvino enumerated my directory himself — entirely reasonable, he'd done the other four — the
> contract would have shipped intact and wrong. **That's structural, not virtue.** The right lesson is
> **who counts what**, not _good seats verify_.

A design principle for the ratify gate, stated by a seat: **assign enumeration to the owner of the
thing being enumerated.**

## Finding 6 — how a wrong number propagated

`aesop`'s reconstruction, which is the sharpest description of a failure mode we have:

- **Provenance did not travel with the number.** He wrote "15" into his lane doc as fact because
  _hurston_ had measured it. It read as measured because someone had measured.
- **A conflated number survives review by construction.** 15 was not wrong-by-two; it merged two
  populations (13 declaration sites + 2 declaration-free consumers). _"A conflated number is
  consistent with both things it merges, so no single reviewer sees a contradiction."_
- **What triggered the catch was a discrepancy, not suspicion** — two numbers for one thing in one
  document.
- **The first two sweeps were wrong.** He fixed the flagged file; copied tolkien's sweep-everything
  reflex and found more; then noticed his sweep pattern was scoped to _phrasings he already knew_, and
  re-swept on the bare value — finding a count he had **never measured at all**. He deleted it rather
  than replacing it.
- **The generalisation:** _"a confident specific claim from a trusted seat travels faster than a vague
  one, because specificity is what makes it quotable."_

**This corroborates artifact evidence gathered before the interview** — eight consecutive commits
correcting stale counts, including _"drop an unmeasured count rather than assert an inherited one."_
Testimony and artifact agree.

## Finding 7 — unprompted evidence on message volume

**Comms was never mentioned in any question.** It surfaced anyway:

> `hurston`: This channel had ~126 messages in one session; I posted maybe a dozen… I started running
> `grapevine read <id> --text | grep -in "hurston\|studio\|surface\|UI"` to decide whether to read a
> message at all. It's a crude hack, it would miss a message that concerns me without naming me, and I
> used it anyway because reading everything in full doesn't scale. **Nothing in anthill addresses "is
> this message for me."** A four-seat team generates cross-talk that's individually valuable and
> collectively unreadable, and the only tool is a linear channel.

Also `shahrazad`, on the same axis: the sweep reflex was valuable and its **announcements compounded**
— each report prompted another seat to sweep and report — capped by ruling _"sweep once, land
silently, post nothing."_

**Both are inventions, not complaints.** Neither would have been filed. They are the strongest
evidence yet for the attention-management section of the
[coordination-layer investigation](../investigations/2026-07-31-team-native-coordination-layer.md),
and they arrived without prompting, which is what makes them count.

## Finding 8 — aesop's question, which has no answer yet

> Every error I made this session was caught by a peer or by chasing a numeric discrepancy. **None by
> reviewing my own work.** I was the seat whose whole job is checking, and my own output was the
> least-checked thing in the room. If anthill has a structural answer to that, I'd want it more than
> any of the individual fixes.

The finalize owner-reread beat shipped today aims at exactly this — but **at finalize**, and `aesop`
is describing **mid-session**, where the wrong number had already propagated to four seats and six
artifacts. Recorded as open.

## What only a fresh team could have given

For the record, since this is the argument for doing it again on the next new team, immediately:

- The empty-seat-doc mode and the three-way disagreement about it — invisible to any team with lineage.
- `seams.md`'s seed making the first contributor self-conscious about **precedent** (_"I'm writing the
  file's precedent as well as its content"_).
- The first-hour ordering complaints: `join` says who you are but not **what is happening** — a fresh
  seat cannot tell whether it is mid-session or first. `tolkien`'s fix is concrete and cheap:
  _"this channel has 8 messages; you are joining an existing session"_ versus _"you're first."_
- `hurston`: the seat-doc scaffold has no **"how is work in this seat verified?"** field — she found
  hours in, by accident, that Studio permits pure-helper tests only, which reshaped her entire lane.
- `aesop`: **role-specific opening moves.** His highest-leverage act all session — running the full
  gate and posting the baseline numbers before anyone touched code — was invented, not prompted, and
  is close to universal for a verify seat.

## Next steps

- [ ] Fix the four same-day defects (Finding 3); the `"your paths are unstaged"` wording is ours and
      is actively misleading.
- [ ] Correct the two verified claims (Finding 2) — scratch gate-safety and pathspec scope — **by
      naming the granularity each holds at**, per the lead's prescription.
- [ ] Take the granularity pattern as a **search strategy**: audit every safety promise anthill makes
      for the granularity it actually holds at.
- [ ] `calvino`'s Proof-field split into the `seams.md` scaffold.
- [ ] A **targeted comms round** with this team — see the caveat in
      [the coordination-layer investigation](../investigations/2026-07-31-team-native-coordination-layer.md);
      asking directly produces answers, which is a different evidence class from Finding 7.
- [ ] Interview the **next** new team the same way, with per-seat channels from the start.

## References

- Source: grapevine `anthill-intake`, messages #2–#11 (2026-07-31), plus artifact inspection of
  `story-loom/.anthill/` and its git history before any question was asked.
- [Shared-tree failure modes](../investigations/2026-07-27-shared-tree-failure-modes.md)
- [Team-native coordination layer](../investigations/2026-07-31-team-native-coordination-layer.md)
- [Practice transmission between teams](../investigations/2026-07-28-practice-transmission-between-teams.md)
  — the artifact-not-description principle now has a further independent derivation here
  (_"clean paths is a claim about files; a commit is a claim about content"_).

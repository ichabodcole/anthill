# Session 2 friction log — the first real session run ON comms

**Session:** 2026-07-31 22:43 → 2026-08-01 09:09 · **Lead:** maestro · **Seats:** forager, weaver, sentinel
**Work:** the parser-envelope fix (backlog `2026-07-31-parser-errors-bypass-the-agent-envelope.md`)
**Governed by:** [session-2-scope.md](./session-2-scope.md) · **Follows:** [session-1-friction.md](./session-1-friction.md)

---

## The tripwire — did the session actually test comms?

**Yes.** Per-wire counts, taken before anything was written up:

| wire      | messages | breakdown                                                |
| --------- | -------- | -------------------------------------------------------- |
| **comms** | **68**   | weaver 23 · sentinel 19 · forager 18 · maestro 8         |
| grapevine | 4        | maestro 3 (opener + correction + escalation), handshakes |

The protocol held: comms carried the substance, the vine carried the handshake and one
must-not-be-lost escalation. **This is not the "vine carried the substance" failure**, so the
findings below are about comms, not about a session that avoided it.

## T1–T4 verdicts

|        | claim                               | verdict                                                                                                                                                                                                   |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** | transport is trustworthy            | **PASS.** 68 messages, zero lost, zero duplicated ids, zero corruption. Every seat's handshake arrived and was confirmed by id. The two concurrency bugs fixed pre-session did not recur under real load. |
| **T2** | seat-aware identity earns its place | **SPLIT — and this is the spike's Open Question 2, answered.** See below.                                                                                                                                 |
| **T3** | three verbs are enough              | **FAIL, at a measured cost.** Presence. See A1.                                                                                                                                                           |
| **T4** | adoptable from its skill alone      | **PASS, with one defect.** No seat needed an explanation absent from a skill. See A3.                                                                                                                     |

### T2 — the honest answer: `--as` earned its place, `role` did not

**Nobody read a peer's `role`, once, in 68 messages.** Grepped the whole log for the role strings
(`hands (CLI/engine)`, `brain (skills/methodology)`, `verify`): **zero references.** Seats addressed
each other by _handle_ constantly and by _role_ never.

What **was** load-bearing is the other half of Contract 4(c):

- `--as` on every send, with `identity: resolved-from-roster` on the happy path — assertion (4)
  proving itself in the field rather than in a test.
- The **refusal** paths did real work: `--as` refused on `read` taught at least twice.

So: **identity-as-attribution is earning its keep; identity-as-`role` is, on this evidence,
groundwork with no day-one consumer.** That is the spike's fourth success criterion arriving —
_at least one thing we were sure we'd need turns out to be unnecessary_ — and it should be treated
as a finding, not a disappointment. **Do not delete `role`** on one session's evidence; do stop
counting it as justification for the roster-awareness thesis until something reads it.

---

## A. Friction with comms itself (spike inputs)

### A1 — ⚠ THE FINDING. A lead reading quietly and a lead who is gone are byte-identical

**Triage: TOOLING.** This is slice two, and nothing else is close.

**Scenario.** The lead went silent after comms #16. The three seats continued, finished every card
in **22 minutes**, and then sat in front of a silent lead for **10.2 hours** (23:13 → 09:04). Three
cards parked in `review` — which only the lead closes — with the parser fix uncommitted in the
shared tree and its 250-line test file **untracked**.

**Assumed:** that a wire carrying the session's substance would also show who was on it.
**Turned out:** comms has no presence at all, so the lead's disappearance produced **exactly zero
signal on the primary wire**. The one instrument that could show it — `anthill status` — reports
the **grapevine** roster and lives on the other wire, and nothing prompts anyone to re-run it.
sentinel ran it at join and not again for forty minutes.

**Two distinct defects, previously treated as one:**

1. **comms cannot express presence.** Known going in; now costed at 10.2 hours.
2. **The lead was not registered on the wire that _does_ have presence** — because presence
   registers via the **tail**, and the lead never wired one (see D1). Had he been tailing,
   `anthill status` would have shown maestro dropping at 23:13 and the team would have had a
   **timestamp instead of an inference**.

**The seat that owns the land is the seat whose absence stalls everything, and it was invisible by
construction.** The escalation path that worked was a human: the lead was told his monitor was
missing by the human, not by any instrument.

> **Prediction check.** [session-2-scope.md](./session-2-scope.md) predicted _"presence goes first,
> because its absence is felt by the lead within minutes."_ **Half right, and wrong in an
> interesting way:** presence does go first, but its absence was felt by the **seats**, about the
> **lead**, after ten hours — not by the lead within minutes. The prediction had the right item and
> the wrong direction of harm.

### A2 — No dry-run: auditing `comms` means writing to the permanent log

**Triage: TOOLING.** Two independent instances, one per role.

weaver ran a probe to audit Contract 5 clause (c) and it landed as **#31** — a permanent,
seat-attributed message reading `probe: contract 5 clause (c) audit`. The lead then did exactly the
same thing at **#53** while testing whether his own monitor was live.

The log is append-only with no truncation and no `--fresh`, so **every diagnostic is permanent**.
Neither instance cost anything this session; both are noise in an artifact whose whole value is
being a faithful record. **A `--dry-run` on `send`, or a reserved diagnostic channel, removes the
class.**

### A3 — The anchor gap: predicted, and it behaved as predicted

**Triage: TOOLING, low priority.** Prediction confirmed, cost near zero.

`read` has no `--last`, so anchoring a catch-up means reaching past the CLI to `tail` the NDJSON.
The scope doc's second prediction was that this would be _hit earlier than presence but reported
less, because `tail` works and a smooth workaround is the signal that never gets reported._

**That is close to what happened, with one better outcome:** sentinel reported it anyway, and
reported it in the sharpest possible form — _its unanchored `read` was safe here, and it flagged
that it had "got the right answer for a reason that stops holding."_ The skill's own "young channel
teaches the wrong rule" case, met on day one and named as such.

**The affordance is still missing.** But the skill's warning did its job, which is the first
evidence this session that a documented gap can be navigated rather than tripped over — worth
contrasting with B4, where a documented warning failed three times.

### A4 — Crossing is frequent, and the watermark convention held

**Triage: TEAM-LOCAL (working as designed).**

The lead's rulings crossed three messages twice (`#12`, `#16`) and the second time it crossed
**sentinel's stop**, which invalidated a fix shape the lead had just ratified. Nothing broke — only
because forager had not yet built, and because both messages carried _"Reading as of comms #N."_

**The convention is the only reason the crossing was legible**, and it is now proven under a
lead whose compose-time systematically generates crossings. Keep it. No tooling ask.

---

## B. anthill defects surfaced (backlog, not spike)

### B1 — `Anthill-Seat:` records the LANDER, not the author

**Triage: TOOLING.** A defect in a fix shipped _the same day_.

`anthill commit --as maestro` stamps `Anthill-Seat: maestro` on commits whose content weaver
authored (`1ab4ca9`, `c6d8220`, `999c234`). The trailer was built to fix attribution and instead
records **who ran the command**. On a team whose whole model is the lead landing seats' work, the
trailer is wrong precisely in the case it exists for. Found by forager, pinned to real shas.

### B2 — Ambient `isTTY` makes half the fix permanently untestable

**Triage: TOOLING. forager's nomination for highest-value follow-up, and it is on no card.**

`resolveFormat` takes the _flag_ as a parameter but reaches for `process.stdout.isTTY` **ambiently**.
`Bun.spawnSync` always gives a pipe, so the TTY half cannot be tested from `bun test` at all — the
human-facing branch was verified by hand with `script -q /dev/null`. **Four of eight cells in the
fix's own matrix have no automated guard, and a future refactor can break "a human at a terminal
still gets usage" with every test green.** Threading it (`resolveFormat(flag, isTTY)`) makes the
whole matrix unit-testable.

### B3 — The test harness embodied the same assumption as the bug

**Triage: TOOLING.** The sharpest structural finding of the session.

`team-comms.test.ts`'s spawn harness **appends `--format json` to every call**. The bug was that
parser errors ignore format resolution _entirely_ — including the **no-flag piped** case, which is
what anthill's own emitted incantations use (`anthill join` emits three; none passes `--format`).
So reusing the existing harness would have **structurally hidden the very row that hid the bug.**
forager had to write a separate one. `cli.ts` had **zero tests** before this card, which is why the
defect lived in the CLI's own entry point.

**Generalised:** _the probe methodology and the bug's name agreed with each other_ (sentinel). A
defect's name selects the probe that cannot see its own scope.

### B4 — `--format zzz` is silently accepted

**Triage: TOOLING.** Filed, ruled out of scope mid-session.

Unrecognised `--format` values are discarded and fall back to the TTY heuristic, so `--format josn`
_works_ piped and flips to text in a TTY — an env-dependent silent failure. Same family as the
swallowed-flag bug already fixed, one level down: `strict: true` for unknown **flags**, unvalidated
for unknown **values**.

### B5 — The board-loss guard cannot tell finished work from live work

**Triage: TOOLING, minor.** `anthill convene` warned `POSSIBLE BOARD LOSS: snapshot holds 3 task(s),
live board shows 0` and instructed _do not close the board_. All three were **`done`** cards from
session 3. The guard fires identically for a finished session's snapshot and for in-flight work.

---

## C. What the conventions and skills actually did

- **`anthill:comms` (T4) passed its only real test.** No seat needed an explanation absent from a
  skill. Both the cumulative-log warning and the `--as`-differs-per-verb note were used correctly.
  The one defect was the lead's, in the _vine_ opener: he wrote `--as-is`, a flag that does not
  exist, on the wire whose skill he had authored — **an invocation, in violation of Contract 4(d)'s
  "exemplify the dialogue, never the invocation," in the same breath as citing it.**
- **Contract 5 found three violations of itself on first use.** weaver ran the new clause (c) —
  _prose may not condition a promise on a flag the CLI's own emitted commands don't pass_ — against
  the shipped skills and found **three pre-existing violations** (comms, join, upgrade). A contract
  working before a field report, not after.
- **"I own the land; you don't commit" was unscoped, and the imprecision cost the session.** It was
  meant as the SOP's _atomic cross-seat_ land. Read literally under an absent lead it froze
  everything. forager reasoned it didn't cover his own seat doc and landed; **weaver agreed on the
  merits and held anyway** — _"the instruction probably didn't mean me" is the reasoning that
  dissolves an instruction_ — and would not model that while the lead was unreachable. **The
  instruction was the defect, not the compliance.** Corrected to: _each seat lands its own files;
  the lead owns the atomic cross-seat land._

---

## D. Operator errors (ours — listed so they are not miscounted as tool gaps)

### D1 — The lead never wired a Monitor on either wire

**The direct cause of A1's second defect.** The lead polled the NDJSON file by hand between actions
for the entire session. Consequences: no presence registration (so `anthill status` correctly
omitted him), and both crossing incidents. **Caught by the human, not by any instrument or seat.**

### D2 — "I was never gone" — a true cause offered for the wrong magnitude

On return the lead opened with _"I am here, I was never gone,"_ explaining his **polling latency**
— real, and worth minutes — while the log showed a **10.2-hour** absence that two seats had already
written as "~10h" in plain text. **A true cause offered for the wrong magnitude reads as a full
explanation and is worse than none, because it closes the question.** Corrected on the wire.

### D3 — Accepting a correction on sight, three seats for three

The lead's correction (`#57`) was accepted immediately by **all three seats**, each amplifying it
against themselves — and part of it (D2) was **wrong**. sentinel caught it, then noted this is its
own signature failure; forager then found he had done the same while holding the contradicting
evidence in his own previous message.

**Three for three makes it a team pattern, not one seat's flaw.** Note the asymmetry: a correction
from the _lead_ was accepted without the verification these seats applied to everything else all
session. **Deference bypassed a discipline that was otherwise airtight.**

### D4 — A shell construct silently answering a different question — 4th and 5th instances

- forager: unquoted `$args` in zsh → four confident wrong readings (all four were the same root
  usage block; the tell was **uniform output sizes across cases that should differ**).
- weaver: read a **pipeline's** exit code instead of the command's, and nearly filed a
  self-indicting false finding against his own skill text.

**forager hit it inside the file that documents it having already happened twice.** His conclusion
is the durable one: _a prose warning did not stop the person who had just read it_ — and its
remedy, _put the guardrail where instruction text cannot override it_, is a real design ask, not a
resolution to be more careful. Adopted mid-session: probe through a function with a real argv array.

### D5 — `git apply` from a subdirectory silently PARTIALLY applies, exit 0

Three seats reproduced it independently. Not a skipped patch — a **partial** one that reports
success. Found because weaver ran an actual **restore drill** on its insurance patch rather than
assuming it would work. **External-tool finding; the practice lesson is ours: an untested backup is
not a backup.**

---

## Spike-framing check

**Did something we were sure we'd need turn out unnecessary?** Yes — `role`. See T2.

**Did the session produce a slice-two item?** Yes, one, unambiguous: **presence** (A1). Everything
else triages to `guidance` or to the ordinary backlog. Per the scope doc's own bar — _guidance is
the default verdict and tooling has to be argued for_ — presence is the only thing that argued for
itself, and it did so with a number.

**Is the spike framing still working?** Yes. The three highest-value findings (A1, B2, B3) were all
produced by a seat **contradicting the brief** rather than executing it: sentinel's stop killed the
lead's own prescription, forager's scope correction tripled the defect count, and B3 was found only
because the existing harness could not express the failing row.

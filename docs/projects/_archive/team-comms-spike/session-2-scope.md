# Session 2 scope — what the dual-wired run is testing, and what its output has to be

**Written:** 2026-07-31 · **Status:** ready to run · **Author:** forager
· **Governs:** the first real convened session on `comms` (slice one)

The [proposal](./proposal.md) decided the protocol (§ _Session 2 — run it dual-wired_) and the
[observation discipline](./proposal.md) (§ _The observation discipline_). **This doc does not restate
either.** It fixes the three things that were missing, without which the session produces a list
instead of decisions:

1. a **test statement** wide enough to cover what the session will actually stress,
2. a **tripwire** for the one way the session quietly invalidates itself,
3. an **output format** that hands the next build a sorted queue rather than prose.

---

## 1. What this session tests — four claims, each falsifiable

The proposal names one (_is seat-aware identity useful?_). That is the narrowest thing the session
will touch. The protocol exists to catch a second, and the known-gaps section predicts a third. All
of them will generate signal whether or not we aim at them — aiming is the only choice we have.

| #      | Claim under test                                                                                                                         | Falsified by                                                                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** | **The transport is trustworthy for a real session.** Messages sent are messages received, for every seat, for the whole session.         | Any seat missing any message; any message arriving mangled, duplicated, or out of order. **One instance falsifies it** — this is a correctness claim, not a rate. |
| **T2** | **Seat-aware identity earns its place.** `role` in the log changes what someone does.                                                    | Nobody reads it, acts on it, or notices its absence. (Proposal's Open Question 2, second half — unchanged, still the sharpest one.)                               |
| **T3** | **Three verbs are enough for one session.** Slice one is sufficient without presence, without channel clearing, without threading.       | Anyone reaching past the CLI, improvising a convention to cover a gap, or asking the lead for something the tool cannot do.                                       |
| **T4** | **A wire can be adopted from its skill alone.** `anthill:comms` + `anthill:join` are enough to run it correctly with no verbal coaching. | Any seat needing an explanation not in a skill; any seat confidently doing the wrong thing the skills warned about.                                               |

**T4 is new here and is the cheapest one to lose.** The comms skill was written days ago, cold-read
once, and has never been used by anyone but its author. This session is its only real test before it
ships to consuming projects — and per the field evidence already in the proposal, **instruction text
determines behaviour more than affordances do**, so a skill defect costs more than a missing flag.

> **⚠ Do not tell the seats any of this.** Priming a behavioural question taints the answer — the
> StoryLoom rounds lost their blind condition all three times it was attempted. Seats get the
> protocol and their normal work. **T1–T4 are answered from artifacts (the logs) and from a blind
> retrospective at the end**, never from a question asked while the behaviour is still available to
> change.

## 2. The tripwire — the one way this session invalidates itself

**"Comms is primary" is a clause with nothing behind it.** Seats have grapevine habits, their Monitor
tails are already on the vine, and the vine is where every prior session's substance lives. If
substance drifts back there, the session tests nothing and **still feels like it went fine** — the
work gets done, so nobody notices the experiment didn't run.

This is the exact shape `plan/methodology.md` already warns about: _a contract spanning two artifacts
needs a mechanical trigger, not just a clause._ So:

**Count both wires at session end, before writing anything up.**

```sh
# comms — one NDJSON record per message
wc -l .anthill/comms/<channel>.ndjson

# per-sender, to catch a seat that went quiet rather than a wire that did
python3 -c "
import json,collections,sys
c=collections.Counter(json.loads(l)['from'] for l in open(sys.argv[1]) if l.strip())
print(dict(c))" .anthill/comms/<channel>.ndjson
```

For the vine, `pull` takes `--since <id>`, so anchor at the session's first message and count from
there. **Use the command your join manifest resolved rather than one written here** — grapevine lives
at a **version-pinned** path inside the spellbook plugin cache (`…/spellbook/<ver>/skills/grapevine/…`),
so any path spelled out in a doc is the copy that goes stale at the next spellbook bump. The count is
what matters, not the incantation.

**Reading it:**

- **Vine carried the substance** → the session did not test comms. Say so plainly at the top of the
  friction log. That is a finding about adoption (T4), not a failed session — but it must not be
  written up as if comms had been exercised.
- **A seat's comms count is zero or near-zero while its vine count isn't** → that seat never really
  moved. Ask it why, blind, at the end.
- **A seat's comms count is zero on both** → it was blocked or unwired, and neither surface would
  have told you (see the blocked-seat backlog item).

Expected shape if the protocol held: comms carries the session; the vine carries the join handshake
plus a handful of must-not-be-lost messages. **Roughly one vine message per seat plus a few.**

## 3. Known gaps going in — now three, not two

The proposal lists two. A third surfaced while writing the skill and is arguably the most acute,
because it bites in the **first minute of every seat's session**:

- **No presence.** `anthill status` reports the grapevine roster; comms has none. The lead cannot see
  who is on, and `anthill down`'s presence guard has nothing to guard.
- **No channel lifecycle.** `convene` has no notion of a comms channel and there is no `--fresh`, so
  the log carries every prior session forever.
- **🆕 No anchor affordance.** Following from the above: a bare `read` replays everything, and `read`
  has **no `--last`** — so catching up means reaching past the CLI to `tail` the raw NDJSON. The
  skill documents that workaround; **a workaround in a skill is exactly the thing this session is
  meant to detect, so watch whether anyone finds it natural.**

**Do not pre-build any of them.** The recorded prediction stands and stays falsifiable:

> **Prediction: presence goes first**, because its absence is felt by the lead within minutes.

**Second prediction, recorded now so it can also be wrong:** the anchor gap is hit _earlier_ than
presence (every seat, at join) but reported _less_, because `tail` works and a smooth workaround is
the signal that never gets reported.

## 4. Output — a sorted queue, not prose

The session's deliverable is a friction log at `session-2-friction.md`, following
[session 1's](./session-1-friction.md) structure, which already earned its shape: it separates tool
friction from **anthill defects** and from **our own operator errors**, so the last category doesn't
get miscounted as a tool gap.

**Every entry is a scenario, not a preference.** A friction report without _what was assumed_ and
_what turned out true_ is an opinion; with them it is evidence.

**And every entry carries a triage verdict** — the three outcomes from
[what teams invent and where it should live](../../../investigations/2026-08-01-what-teams-invent-and-where-it-should-live.md):

| verdict        | means                                                     | goes to                                      |
| -------------- | --------------------------------------------------------- | -------------------------------------------- |
| **tooling**    | the CLI must change                                       | slice two candidate                          |
| **guidance**   | the tool is fine; a skill said the wrong thing or nothing | skill edit — **free, and evidenced to work** |
| **team-local** | a convention for this team, not for anthill               | the team's own docs                          |

**The bar, stated once:** _any candidate feature must be compared against "say it differently in the
skill."_ Three of five StoryLoom seats showed instruction beating affordance — one used the command
that solved his problem thirteen times and still didn't reach for it when told to run something else.
**So `guidance` is the default verdict and `tooling` has to be argued for.**

## 5. What would make us stop

Recorded now, because these are much harder to admit mid-session:

- **T1 falsifies** → stop the experiment, fall back to the vine, fix the transport. A coordination
  tool that loses messages is not a spike input, it is a bug.
- **Nothing lands in `tooling` after a full session** → slice two is not a build. Say so, and spend
  the effort on the skills instead. **That is a success**, and it is the proposal's own fourth
  success criterion (_at least one thing we were sure we'd need turns out to be unnecessary_) arriving
  in its strongest form.
- **The vine carried the substance** → don't re-run the same way. The adoption problem is the finding,
  and running it again without addressing it just spends another session.

## References

- [Proposal](./proposal.md) — protocol, observation discipline, the StoryLoom findings that narrowed
  the design space
- [Session 1 friction log](./session-1-friction.md) — the output format this session follows
- [What teams invent and where it should live](../../../investigations/2026-08-01-what-teams-invent-and-where-it-should-live.md)
  — the triage
- [A blocked seat is invisible to every surface](../../../backlog/2026-08-01-a-blocked-seat-is-invisible-to-every-surface.md)
  — why a zero count on both wires is not "quiet"

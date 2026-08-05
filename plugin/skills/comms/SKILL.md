---
name: comms
description: Use the team's comms wire well — catch up from a real anchor instead of replaying every past session, confirm your messages are actually landing, and pick the right verb for reading vs streaming. Use when a seat or lead is coordinating over `anthill comms` and needs more than the flags — "catch up on comms", "am I actually on the channel", "how far back should I read", "nobody is answering on comms". Getting ON the wire at session start is `anthill:join`; this is how to run it once you are on. Requires a `.anthill/config.json`.
---

# anthill: Comms (running the wire, not just calling it)

The `comms` wire is a **seat-attributed, append-only message log**. Three verbs — `send`, `read`,
`follow` — and `anthill comms <verb> --help` documents every flag. **Read `--help` for anything about
a flag; it is the source.** This skill covers what help cannot: what the log's _shape_ does to
catch-up, and how to notice the one failure this kind of tool fails with. Where it does restate a
flag below, it is because the flag needs a reason attached, not because the list belongs here.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH — run the full `bun "${CLAUDE_PLUGIN_ROOT}/…"` form).
> (`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code whenever a plugin skill runs.)
> Every command reads `.anthill/config.json` (the root marker; walk up from cwd).

> **The verbs are siblings, not clones.** `--as` is **required** on `send` and `follow` (identity is
> never inferred) and **refused** on `read` (reads are not attributed — you are observing, not
> writing). That is three verbs and three different answers, so check rather than generalise from the
> one you learned first.
>
> **Get `--as` wrong and the tool tells you why** — that a read is not attributed to a seat, that
> identity is never inferred — because each of those refusals has an authored reason behind it.
> **Get a flag NAME wrong and there is no why to give you**, so don't expect one: what you get is
> what you typed and the flags that exist, which is all a typo can honestly be answered with. Two
> different kinds of wrong, two different kinds of answer; reading the first as a promise of the
> second is how you end up thinking the tool is being unhelpful when it is being exact.

## 1. The log is CUMULATIVE. Nothing clears it. This breaks the habit you brought.

Most seats arrive expecting a per-session channel — one a lead clears at convene, so a catch-up read
gives you **this session**. **That model is wrong here**, and there is no flag that restores it:

- `convene` does not open or clear a comms channel — it has no notion of one.
- There is no `--fresh`, and no verb truncates the log.

So a bare `anthill comms read` replays **every message the team has ever sent**, across every
session. On a young channel that looks fine and teaches you the wrong rule.

**Anchor your catch-up.** You need a recent id first, and `read --last <N>` is what gets you one —
it is finite, it exits, and finding an anchor is the job it exists for. Then read forward from that
id with `read --since <id>`. (A `send` also returns the id it assigned, which anchors you from the
moment you first speak.)

Reach past the CLI to the log file only when you want something the verbs do not offer — it is one
NDJSON file per channel, at `.anthill/comms/<channel>.ndjson`.

- **⚠ An anchor past the end returns EMPTY and exits 0.** `read --since 999` on a 7-message log
  prints nothing and succeeds. That is indistinguishable from "nothing new since I last looked", so
  a fat-fingered or stale anchor silently tells you the team has gone quiet. If a read comes back
  empty, **re-derive the anchor with `read --last <N>` before believing it** — that is the verb that
  hands you a real id.
  _(This line used to say "confirm the anchor against `tail`". **`comms` has no `tail`** — that is
  grapevine's verb, imported by habit into the skill written to warn against importing habits across
  these wires. The instruction would have sent a reader either to an unknown command or to the one
  verb `anthill:join` calls "broken by construction" for catch-up. Left visible: the failure this
  file is about caught its own author.)_
- **`--id <id>` fetches exactly one message and is not a narrow range.** No `--since` substitutes
  for it: every `--since` window runs to _now_, so on a channel peers are writing to, it will keep
  collecting their new messages while you read. When you want one specific message, `--id` is the
  only thing that gets you it.
- **Timestamps are there when you need a boundary.** Every message carries `ts` (epoch ms). If you
  need "since this session started" rather than "since this id", that is the field to filter on.

## 2. The failure mode is SILENCE — and silence is also what success looks like on a quiet channel.

If your messages are not landing, or you are not receiving, **nothing tells you.** No error, no
warning: you see an idle channel, which is exactly what a genuinely idle channel looks like. This
project has hit that shape three separate ways already — a board Monitor dead for a whole session; a
`grep` filter that matched nothing while looking correctly wired; and a backfill pipe that returned
zero output and timed out, which three seats independently read as "empty channel"
([#54](https://github.com/ichabodcole/anthill/issues/54)). **Every one of them looked like quiet.**

**So confirm receipt once, early, rather than inferring it from traffic.** At join, post your "in,
grounded" and get an explicit acknowledgement **naming your message id** — _"got #7, forager"_. One
exchange in the first minute is the only cheap moment to discover you are shouting into a
disconnected wire.

**Leads — `anthill status` DOES cover this wire, and it is not the whole story.** Presence is
multi-wire: `status` and `down` read one combined source, so a seat present on comms counts as
present. **What `status` cannot tell you is how far behind a seat is** — for that, and for
`never-followed` (which is _no record at all_, not a rounded-down zero), use `anthill comms
positions`. Count it by hand when you want the receipts:

```sh
# --format json is explicit here because a lead reading in a terminal would otherwise get text
anthill comms read --since <session-anchor> --format json    # then count distinct `from` values
```

If you convened four seats and can name three, the fourth is not quiet, it is **missing** — go and
ask it directly (dispatch it, or check its pane) rather than waiting.

**If comms drops mid-session there is no second wire to fall back to** — comms is the team's only
channel. Say so **in your pane** so the human sees it, and if you can still reach the board, move your
card and put the reason in its notes. **Record where it broke**; that is the finding, not an
inconvenience. _(Teams used to fall back to a grapevine here. anthill no longer opens or joins one.)_

### What the tool knows about who got what — and the three things it may never say

`follow` records, per seat, an **`emittedThrough`** position: how far through the log that seat's
follower **has been written to**. Everything the wire can eventually tell you about presence,
backfill, or crossing is derived from that one number, so it is worth knowing exactly what it is.

**It is emission, not reading, and the gap between them is not pedantry.** The tool stamps when it
writes to stdout. Downstream of that write sit a pipe buffer, the harness that turns lines into
notifications, and its batching — none of which the tool can see. That gap is **zero in the normal
case and unbounded in the case that matters**, because a follower that has died is written to
exactly as successfully as one that is healthy. A number named for _delivery_ would report a seat as
current at the instant its wire dies.

**The same gap loses content, not just time, and it is not the same for every reader.** Measured on
this project: one message reached two seats through their own Monitors, and **one of them received it
without its `from` and `role` fields while the other received them intact** — from a single log line
that carried both. Neither seat was misreading; the wire and the log were correct throughout. So a
peer saying _"there was no attribution on that message"_ and the log showing attribution plainly can
both be true. **When a claim turns on what a message contained, go and read the log** — the
notification you reasoned over is a rendering of the record, not the record.

**But know exactly how far that gets you, because it is less far than it sounds.** The log is
authoritative for **what a message says**. It is not authoritative for **who wrote it**: `--as` checks
that a handle is on the roster, not that the sender is that seat, so the `from` field is a
roster-checked name rather than a proven author. Going to the log therefore settles a disagreement
about contents and **cannot** settle one about authorship — there, the log will agree with itself and
still tell you nothing. That is the honest reach of a local, unauthenticated file, not a defect to
work around; the fix for a doubted message is to ask the seat, not to re-read the record.

Three claims follow, and the first is the one that will be violated:

1. **One direction only.** _"#13–#15 had not been emitted to that follower"_ is licensed — an
   absence of emission is a real observation. _"She had seen your correction and sent anyway"_ is
   **not**, and never will be, however the tooling improves. The tool can report what did **not**
   reach a follower; it can never report what a seat **took in**. The useful-sounding sentence is
   the unsupported one, so watch for it in your own writing rather than someone else's.
2. **Freshness measures the traffic, not the wire.** A position that has not moved means _behind_
   only if the log head moved without it. Head unchanged and position unchanged is a dead follower
   and a healthy one on a quiet channel, byte-identical — **no information at all.** So **a presence
   statement must name the head it was read against**: _"weaver at #143, head #143"_ is a reading;
   _"weaver is at #143"_ is a number that cannot be wrong.
   **And "no position recorded" is a third state, not a very stale one.** Only `follow` records a
   position, so a seat that has only ever `read` has none at all — it is not behind, it is unmeasured,
   and reading it as _behind by everything_ would invent a fact about someone who may be perfectly
   current. Absent and stale are different answers; do not collapse them.
3. **A recorded position is local state, not an audit trail.** It lives beside the log, and the log
   is **gitignored** — neither survives the machine it was written on. Quote an id to orient a
   teammate who is on that machine now; do not cite either as evidence in anything durable, because
   nobody reading it later can check you.

**The one liveness check you can run on yourself, at any moment:** send something and watch it come
back through your own `follow`. That round-trip clears the pipe, the harness and the batching, so it
is a genuine end-to-end confirmation — and it works **in both directions**: the echo returning proves
your wire is alive, and the echo **failing** to return, when the send itself succeeded, is how you
find out it is dead. Check that the send landed before reading the silence, or a failed send and a
dead follower look identical.

**What is true is not that you cannot know — it is that you are never told.** Passive silence is
worthless: an hour of quiet looks the same whether your follower is healthy or was killed forty
minutes ago, and no stored position changes that. But you can settle it whenever you choose to ask.
**So the thing that is actually missing is a trigger, not an instrument** — nothing on this wire will
ever prompt you to wonder, and that is the moment the failure survives. Run it deliberately after any
suspicious quiet; do not wait for the channel to reassure you, because it never will.

**The price is one permanent line in a log nothing clears** — so probe when you have a reason, and
note that `--dry-run` cannot do this job: it never traverses the follow loop, which is exactly what
makes it dry.

**And what you never think to ask about yourself, a peer can simply see — which is why this is worth
looking at unprompted.** Recorded positions are readable by the whole team, so anyone can compare your
position against the head and notice your follower has stopped receiving, without you having done
anything at all. That is the half the probe above cannot supply: it answers only when asked, and the
case that matters is the one where nobody asks. Demonstrated on this project:
a seat with no recorded position at all was identified from outside, by a teammate who noticed the
absence, while the seat itself had no symptom to notice. **So do not read a quiet channel as a report
on your own wire; it never was one. If you want to know whether a teammate is still receiving, look —
and if you want that known about yourself, someone else has to.**

**⚠ A seat can show as never-followed while a record for it plainly exists — and that is the tool being honest, not losing your data.** A stored position can be **ahead of the log head**, which is impossible for anything actually following this log: it means the record outlived the log it described, or the log was replaced underneath it. The tool therefore reports what it genuinely knows, which is **nothing** — no position, no gap — and raises a separate `staleRecord` tell so you can tell _"nobody ever followed"_ apart from _"a record from somewhere else survived here."_ Same verdict, two different facts about the world.
**Read it as a question about the LOG, not about the seat.** The seat may be fine; what is established is that the record cannot speak for this log. Re-attach the follow and the position becomes real again.
**Why this is worth knowing before it happens to you:** this defect was found by a lead running the cross-seat read as its **first user of the session**, and being told **every seat was current, gap 0** — against an empty log, with most of those seats not yet existing. A surviving record subtracted from a fresh head produced a _negative_ gap, and a negative rounded down into the most reassuring answer available. **On a wire whose entire purpose is to stop silence being mistaken for safety, the audit instrument was the thing reassuring everyone.** If your team's positions look implausibly healthy at the very start of a session, that is the shape of it.

## 3. `read` terminates; `follow` streams. Don't make one do the other's job.

- **Catch-up → `read`.** It prints and exits, so it is the one to pipe into other tools.
- **Live → `follow`.** It never exits, and it **starts from the current end** — it replays nothing,
  so it is not a catch-up tool and has no flag to make it one. Backfill with `read` first, then
  attach `follow`.
  **It does, however, tell you what it is skipping.** On attach it emits a start notice with where
  your seat was, where the log head is, and the catch-up command to run — so a re-armed follower
  reports its gap instead of resuming silently. **Read that notice; it is the one moment the wire
  volunteers what you missed.** Where the gap cannot be known — a seat that has never followed — it
  says so rather than reporting zero, and **zero and unknown are different answers**: the first says
  you missed nothing, the second says nobody can tell you.
- **Never add a `grep` filter to a `follow`.** Unlike the other wires, **`comms` emits no
  keepalives**, so there is nothing to strip — a filter carried over from the vine out of habit
  removes real messages and leaves you silently missing team traffic. This is the one place that
  pattern does not transfer.

## 4. Sending

- **Code, backticks, or anything multi-line → pipe it in with `--stdin`.** Correctly-quoted backticks
  do survive the argument path, so this is a robustness rule rather than an absolute law of physics —
  but the failure is a mangled or shell-executed body, and `--stdin` removes the whole class.
- **Message ids are stable, and they are the unit of the read-watermark convention** — _"ratified as
  of #14."_ That is what ids are for; quote them.
- **⚠ The tool can act on your watermark. It cannot check it, and the difference is the whole seam.**
  Declaring the id your view was formed as of lets the wire compare that number against the head and
  refuse a send that would cross messages you have not seen. **What it compares is the number you
  typed.** Nothing anywhere establishes that you actually took those messages in — the tool does
  arithmetic on your testimony, it does not verify it. So a refused send means _"the log moved past
  the id you gave"_, and an accepted one means **only** that your number was current, never that you
  were. **Give it an id you have honestly read to**, because it is the one input here that no
  instrument can audit and every downstream claim inherits.
  - **⚠ So never COMPUTE the id in the same command that sends.** Reaching for the head
    programmatically and passing it straight through is the natural move for anything driving this
    from a shell — and it **defeats the check silently and always**, because a number fetched
    milliseconds earlier cannot have been crossed. The send is accepted, no warning is emitted, and
    the accepted send is indistinguishable from one where you had actually read to that id.
    **The instruction is dispositional and this case does not feel like violating it** — the number
    is the true head, so it reads as diligence. _Measured, with a control: a computed head produced
    an acceptance carrying no crossing report at all, while a deliberately stale id reported the
    crossing correctly. The guard was not weakened; it was answered about a question that had been
    substituted._
- **What belongs in a message, how to signal salience, and when not to ask through a blocking
  channel** are wire-agnostic team conventions and live in the team README, not here.

## Output

You are caught up from a **verified** anchor rather than from the beginning of time, your presence on
the wire has been **confirmed by another seat** rather than assumed, and you are using the
terminating verb for history and the streaming verb for live.

## Skill feedback

If this skill was rough — a step unclear, an `anthill` command that misbehaved, a missing case — jot
it to your scratch and raise it at `anthill:finalize-session` (or flag the human). These skills
improve by use.
Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? → `anthill feedback` (on a team, surface it to the lead).

**Reflective pass (not just "what broke"):** comms is new and deliberately thin, and this skill names
the gaps it routes around rather than hiding them — chiefly **no presence**, so a seat receiving
nothing has no symptom. Did you hit it? Did you reach for something that wasn't there — clearing the
channel, threading, reply-to? **Name it even if you worked around it smoothly**, because a smooth
workaround is exactly the signal that never gets reported.

**And check the reverse before you trust this section:** a gap named here may have been _closed_ since
it was written, which is the failure this skill is least able to notice — the tool improves and the
prose quietly becomes wrong while still reading fine. `--last` was listed here as a missing flag until
the day it shipped. If a gap you were warned about does not seem to be there, it probably isn't; say
so rather than working around a wall that has gone.

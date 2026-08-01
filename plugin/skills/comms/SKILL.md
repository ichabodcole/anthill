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
> one you learned first. The tool says so at the point you get it wrong, with the reason.

## 1. The log is CUMULATIVE. Nothing clears it. This breaks the habit you brought.

On the grapevine the lead clears the channel at convene (`--fresh`), so `pull` gives you **this
session**. That is the model most seats arrive with, and **it is wrong here**:

- `convene` does not open or clear a comms channel — it has no notion of one.
- There is no `--fresh`, and no verb truncates the log.

So a bare `anthill comms read` replays **every message the team has ever sent**, across every
session. On a young channel that looks fine and teaches you the wrong rule.

**Anchor your catch-up.** You need a recent id first, and `read` has no `--last`, so get one from
the log file directly — the channel is one NDJSON file per channel:

```sh
tail -n 5 .anthill/comms/<channel>.ndjson     # <channel> is config.channel
```

Then read forward from it: `anthill comms read --since <id>`. (A `send` also returns the id it
assigned in its `--format json` envelope, which anchors you from the moment you first speak.)

- **⚠ An anchor past the end returns EMPTY and exits 0.** `read --since 999` on a 7-message log
  prints nothing and succeeds. That is indistinguishable from "nothing new since I last looked", so
  a fat-fingered or stale anchor silently tells you the team has gone quiet. If a read comes back
  empty, confirm the anchor against `tail` before believing it.
- **`--id <id>` fetches exactly one message and is not a narrow range.** No `--since` substitutes
  for it: every `--since` window runs to _now_, so on a channel peers are writing to, it will keep
  collecting their new messages while you read. When you want one specific message, `--id` is the
  only thing that gets you it.
- **Timestamps are there when you need a boundary.** Every message carries `ts` (epoch ms), visible
  under `--format json`. If you need "since this session started" rather than "since this id", that
  is the field to filter on.

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

**Leads — `anthill status` does NOT cover this wire.** It reports the grapevine roster; **comms has
no presence at all**, so a seat can be wired to the vine, visible in `status`, and receiving nothing
on comms with no symptom. Count it by hand:

```sh
anthill comms read --since <session-anchor> --format json    # then count distinct `from` values
```

If you convened four seats and can name three, the fourth is not quiet, it is **missing** — go and
ask it directly (dispatch it, or check its pane) rather than waiting.

**If comms drops mid-session**, say so on **the grapevine** — the wire `anthill:join` also puts you
on — and coordinate there until it is back. **Record where it broke**; that is the finding, not an
inconvenience.

## 3. `read` terminates; `follow` streams. Don't make one do the other's job.

- **Catch-up → `read`.** It prints and exits, so it is the one to pipe into other tools.
- **Live → `follow`.** It never exits, and it **starts from the current end** — it replays nothing,
  so it is not a catch-up tool and has no flag to make it one. Backfill with `read` first, then
  attach `follow`.
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

**Reflective pass (not just "what broke"):** comms is new and deliberately thin, and this skill
routes around two gaps rather than hiding them — **no presence**, and **no `--last` on `read`**, which
is why anchoring means reaching past the CLI to `tail` a file. Did you hit either? Did you reach for
something else that wasn't there — clearing the channel, threading, reply-to? **Name it even if you
worked around it smoothly**, because a smooth workaround is exactly the signal that never gets
reported.

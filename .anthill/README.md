# team — standard operating procedure

How the agent team that builds this project works.
This file points at the source of truth for each topic. It does not restate it.

The team coordinates on `anthill comms`, channel `anthill-dev`, and on the bounty board.
`anthill-dev` also keys the bounty board and names the tmux session.
maestro leads.

## The `anthill` shorthand

`anthill <command>` in these docs is shorthand.
The real invocation is `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`.
`${CLAUDE_PLUGIN_ROOT}` is set only while a plugin skill is running.
Take the resolved command from the output of `anthill:join`. Do not retype it.
A bare `anthill` works only if the optional global launcher is installed, and that launcher resolves to the highest cached release, which may differ from the one this project runs.

## The model

The team is ephemeral agents in durable seats.
A seat persists across sessions. The agent filling it does not.
Each seat has a committed seat doc that states its identity. The next agent in that seat grounds from it.

Three rules follow:

1. Knowledge that must survive a session is written to a curated doc, by curation, from reports.
2. During a session, a seat writes to its session report, not to a curated doc.
3. Team structure changes when the work shows friction: seats stepping on each other, a seam that does not hold, an overloaded or idle seat.

## Where knowledge lives

**Curated docs.** Nobody edits these during a session, including the seat they describe.
They change at `anthill:curate`, from the reports, by an agent that was not in the session, with the human ruling.
`anthill commit` refuses them on an attributed commit unless `--curated` is passed.

- Seat doc, `dev/<handle>.md`: what the seat does and what it owns, as a job description. Five sections: Role, Scope, Boundaries, Relationships, Practices.
- `dev/seams.md`: the contracts between seats, each stated once and owned by one seat. Seat docs point at it. They do not restate it.
- `principles.md`: rules about how work goes wrong. Read at convene and at join.
- `wiki/`: one page per lifecycle touch point (convene, join, plan, work, finalize, curate). The skills are the triggers; the pages are the method. Linted by `anthill wiki lint`.
- Tests: executable proof, where it exists.

**Reports.** `reports/<date>/<handle>.md`, one per seat per session, committed.
A report is the record of what happened, for a curator who was not there. See `reports/README.md`.
No joining seat reads reports.

**Scratch.** `scratch/<handle>/<date>-<slug>.md`, gitignored. For throwaways. Anything worth a curator's time goes in the report.

**One rule for all of these:** state shared truth once and point at it. Do not restate it.

## Feedback

Feedback includes ideas and suggestions, not only bugs.

Route it by where it lives:

- About this project or team: write it in your session report. Curation routes it.
- About anthill itself, from a consuming project: `anthill feedback`. Run `anthill feedback --help` for usage.

**In this repo there is no upstream.** `anthill feedback` files to `ichabodcole/anthill`, which is this repo.
Anthill friction found here is ordinary session work. Put it in `docs/backlog/` or in the roadmap. Do not use `anthill feedback` from this repo.

On a team, the lead owns the outward send.
A seat that finds anthill friction surfaces the candidate to the lead on comms or as a `--submit`-ready draft. The seat does not run `anthill feedback --submit`.
The lead dedupes across seats and submits.
A solo agent is the lead: compose, confirm with the human, submit.

## Seats

The roster and division of labour are in `dev/README.md`.
Decisions and questions for the human route through maestro.

Routing through the lead is the default, not an exclusive channel.
The human can attach to any seat's tmux pane at any time.
If you are waiting on a human answer, say so on comms. A seat waiting silently is indistinguishable from a seat working.

## Tools

**Bounty board.** Task state: `todo`, `doing`, `review`, `done`.
The lead creates and assigns a card and leaves it in `todo`.
The doer moves the card through `doing` and `review`.
The reviewer closes it.
The board is key-bound to the team channel. On one shared working tree every seat targets this board with no `--session` flag.
Per-seat git worktrees break the binding silently. The failure reads as "no running bounty session". Resolve the board id once and pass it explicitly. The mechanism is Contract 3 in `dev/seams.md`.

**Comms.** `anthill comms`, channel `anthill-dev`. The seat-aware message log.
Identity is a roster seat, not a free-form alias.
The log is never cleared. A bare read replays every session. Anchor a catch-up to a message id.
There is one wire. If you suspect your own wire is silent, run `anthill comms positions`. It reports every seat's gap against the head as `null`, `0`, or `N`. `null` means the tool has no record for that seat. It is not zero. The mechanism is Contract 6 in `dev/seams.md`.

**The CLI.** `anthill convene`, `join`, `spawn`, `status`, `commit`, `down` wrap comms, the board, and tmux.
`anthill join <handle>` prints your grounding docs and an action checklist. That checklist is the single source. Do not restate it.

## Workflow

- **Convene.** The lead grounds, gathers the work from the human, opens the channel and the board, seeds cards, briefs and spawns the seats the current phase needs. Composition is a hypothesis.
- **Plan** (multi-seat work). The lead writes a plan skeleton: the integration order and the cross-seam contracts, stated as claims. Each owning seat ratifies or falsifies the seams it touches before drafting. Run `anthill:plan`. Solo work skips this step.
- **Work.** Builders build against the ratified seams. Everyone watches for structure signals: seats stepping on each other, a renegotiated seam, an overloaded or idle seat, a verify finding that bounces work back.
- **Finalize.** Each seat closes its report and lands it. The lead closes the lead report with a Carry-forward section, sweeps the docs of record, and places every deferred item. Each seat stands down last. Nothing curated changes. The lead tears down the session.
- **Curate** (outside any session). A fresh agent and the human read the unprocessed reports and decide what flows into a seat doc, a seam, a principle, a wiki page, a skill, or tooling. Run `anthill:curate`.

Verification is not an end-of-line step.
The verify seat engages at verification points, which may be early, mid, or late, and often stays to re-verify after a fix.
The lead decides per phase when to pull each seat in.

## Committing on the shared tree

Seats share one working tree and one git index.
A bare `git commit` takes the whole index and can sweep a peer's staged file into your commit.
Concurrent commits race the index.

Rules:

1. Land with the command `anthill join <your-handle>` printed. Run it verbatim. Do not rebuild it.
   It commits the named paths only, holds a serialize lock so concurrent seats queue, and reads the message from a file (`-F`).
2. Never pipe the gate. `gate | tail && commit` tests the exit status of `tail`, which is always 0. Redirect to a file and read that.
3. Never pass a message body containing backticks with `-m`. The shell substitutes them before the tool runs. Use `-F`.
4. Never run `git add -A`.
5. If you must land by hand: `( <gate> ) && git commit -F <msgfile> -- <explicit paths>`, with an `Anthill-Seat: <handle>` line in the body.

The gate is this project's `gate` value in `.anthill/config.json`. There is no default. Ours is `bun run check`.
If the emitted command announces that no gate is configured, tell the lead. Do not work around it.

**Per-seat worktrees.** Use the tool there too.
Worktrees give each seat its own index, but `refs/stash` is shared across all worktrees of a repo, and a pre-commit hook that stashes (lint-staged does) writes to it.
The lock in `anthill commit` is the only mutex over that ref.

**`--as`.** Git records the human as the author of every seat's commit.
`--as <handle>` adds an `Anthill-Seat: <handle>` trailer so `git log --grep "Anthill-Seat: <handle>"` answers who landed a commit.
Always pass it.

**Shared files.** The pathspec protects a peer's files, not a peer's uncommitted edits inside a file you both write to.
Committing `seams.md` commits whatever is in it now, including a peer's half-written paragraph, and no guard fires.
For a shared file: say on comms that you are taking it, edit, and land promptly.

**Read the envelope `anthill commit` returns.** Two fields matter:

- `waitedMs`: how long you queued on the lock. Non-zero means a peer was landing at the same time.
- `uncheckedAgainst`: dirty paths outside your commit when it landed. The gate runs over the whole tree, so a non-empty list means your green was measured against work your commit does not include.

Read the two together.
The dirty-path read happens after the lock wait, so a peer who landed while you queued does not appear in `uncheckedAgainst`.
A long `waitedMs` with an empty `uncheckedAgainst` means peers landed inside your window. It is not an all-clear.

## Shared practices

Mechanics for every seat. Principles are in `principles.md`.

- **Put the point in the first 200 characters.** Peers receive a truncated preview and decide from it whether to fetch the rest. Lead with the verdict: what you found, what changed, what someone must do.
- **Address in the headline:** `## <you> → <who>:`. Everything goes to everyone. The arrow is a salience hint, not a filter. Read on topic, not on address.
- **When you ratify or post a verdict, name the last message id you had read.** Example: "ratifying as of #14."
- **When one message answers several, index it by the message ids it answers.** Use a table: `| msg | from | ask | answered in |`. An unanswered ask then shows as a blank cell. Do not index by topic.
- **Atomic cross-seat land: assemble, do not marinate.** When several seats' halves do not compile apart: draft out-of-tree in scratch, post `READY: <paths>`, the lead calls the land, all seats move files in at once, one gate run, one `anthill commit`. Land supporting code inert and early. Draft new files in scratch, not on the shared gate surface.
- **Post the gate's numbers at join and at close.** The session's delta is then a measurement.
- **Mark an unverified claim `UNVERIFIED`**, or `UNVERIFIED-BY-CONSTRUCTION` when it cannot be checked from where you stand. An unmarked claim reads as measured.
- **A seat silent for about ten messages while holding a `doing` card is a cue to look at its pane.** A blocked seat produces no output.
- **One sentence per line in the living docs.** The host repo's formatter may reflow hard-wrapped prose into broken lists. One sentence per line makes a reflow a no-op.

## Finalize

Close your report: answer the prompts at the bottom of `reports/<date>/<handle>.md`, in prose, for a curator who was not here.
Name tools, docs, and teammates freely.
Say what a number meant, not only what it was.
If your seat doc, a seam, a principle, or a wiki page is incorrect or needs to change, say so in the report. Do not edit it.
Land the report with the land command your join emitted.

Do not synthesise into a curated doc. That is curation's job.
The full method is on `wiki/touchpoints/finalize.md`.

**The lead's report** has a Carry-forward section: what the next session must test, decide, or not do, each with what would prove it wrong, and whether the team's shape fit the work.
The next convene reads it.
The lead also sweeps the docs of record (the plan of record, the roadmap, the proposal) and writes a dated `HELD` / `FALSIFIED` / `UNCHECKED` line into each, claim by claim.
`UNCHECKED` is a verdict. Write it.

### Standing down

Every seat ends with `anthill comms stand-down --as <handle>`.
Run it after closing the report, after landing it, and after anything else you have to say.
Stand down last.

The command writes a departure record.
For a spawned seat, that record is what lets `anthill down` tear down without `--force`.

**The lead's order differs.** The teardown check counts spawned seats, and the lead was not spawned.
The lead still stands down, because its live follower makes it look present and `anthill down` refuses it by name.
Order: every spawned seat stands down, then the lead stands down, then the lead runs `anthill down`.

A departure record means "I am finished". It does not mean the pane is inert.
A seat that has stood down may still send. Read a late message normally.

When you write a rule about "every seat", state which population you mean: spawned seats, or the whole roster including the lead.

## Onboarding a fresh agent

1. Ground in the product: the `grounding` docs in `.anthill/config.json`.
2. Read this SOP.
3. Read `dev/seams.md`.
4. Read your seat doc, `dev/<handle>.md`.
5. Read the wiki page for the touch point you are in.
6. Check the bounty board and the active project docs for the current state.

Do not edit your seat doc. If it is wrong, say so in your report.

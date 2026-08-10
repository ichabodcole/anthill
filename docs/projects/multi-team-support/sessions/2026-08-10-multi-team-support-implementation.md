# Session — multi-team support, Phases 0–6

**Date:** 2026-08-09 → 2026-08-10 · **Branch:** `feature/multi-team-support` → `develop`
**Shape:** solo lane, dual independent review (no team convened — one lane, no seam)
**Gate:** 669 → **675 pass / 0 fail** · 37 commits · 55 files · +7.1k/−0.2k

## What shipped

One project can now configure **several teams**, and every command resolves which one it is about
**ambiently** — an agent never names a team.

- **`teams` map in `.anthill/config.json`**, detected **structurally** (`"teams" in raw`) with **no
  version bump**: `version` means footprint LAYOUT, and nothing moves on disk when a project adopts
  the map. A flat config is one team named `default`.
- **The resolution ladder** (`team-resolve.ts`): `--team` → `ANTHILL_TEAM` → the pin
  (`.anthill/current-team`) → the sole team → **throw**. No fallback at any rung.
- **`anthill team ls | use | show`**, the pin, cross-team collision checks, `--team` on every command
  that takes one and a stated refusal on every command that must not.
- **`bootstrap` §0a** — adding a second team is a route, not a refusal.
- **`migrate` refuses a multi-team config** by name, in two branches keyed on what is actually
  pending.
- **Attribution** — an `Anthill-Team` commit trailer and a team + shape-fingerprint stamp on retro
  entries.

## The two invariants, and what they bought

**A mis-resolved team must be a HARD ERROR, never an empty roster/board/channel.** An empty team is
what a lead reads as _"my seats are missing"_ — so a silent wrong answer doesn't look like a bug, it
looks like a **different, plausible bug somewhere else.** Every rung that finds a name it cannot
match throws.

**Criterion 1: a single-team project sees zero change.** This one did real work all branch. It is why
`ANTHILL_TEAM` is exported into panes only on a multi-team project, why the `Anthill-Team` trailer is
stamped only there, and it is what turned an unresolved `<teamDir>` in the rendered SOP from a
cosmetic nit into a defect worth blocking the merge for.

## The finding that outlasts this branch

**Nine defects on this branch were invisible to `bun run check` and visible in one command.** Not
occasionally — as the rule. The pure halves were green every single time:

| found                                              | what was green while it was broken                 |
| -------------------------------------------------- | -------------------------------------------------- |
| `team ls` refused to list                          | `renderTemplates`, `resolveTeam` — every unit test |
| `team use` refused every fresh project             | ditto                                              |
| `init` refused the documented add-a-team route     | the render was never wrong; it never ran           |
| `init` rendered nothing on the route's second use  | `ok: true`, `written: []`                          |
| a conventional subject destroyed both trailers     | every fixture used a colon-free subject            |
| the retro fingerprint property was false           | prose + a snippet; nothing executes them           |
| `<teamDir>` shipped unresolved into every SOP      | valid markdown either way                          |
| convene silently rebound another team's board      | the guard read a later artifact than it names      |
| `join` emitted commands that misattribute a commit | the emitted string is never executed by a test     |

This is why the plan gained **execution rule 7** mid-flight — _a task that changes a command's
behaviour is not done until the command has been RUN against a fixture repo **in the state its
documentation describes**_ — and why the phrase is "its documentation" rather than "the task's". Task
4.2 exists because 4.1's fixture stopped at the state §0a describes; the pin only appears on the
route's **second** use, which no document called a separate state.

**The sharpest form: a test can be fixture-shaped-to-pass three different ways, and I did all three.**
A coverage assertion whose expected set came from the thing under test (4.2). Commit-message fixtures
that all avoided the shape that fails (6.3). And a fingerprint measured against a config that already
carried the key whose absence was the whole point (6.2) — that one reached a **shipped skill**, as a
claim labelled _measured_.

## Independent review — and the gap between the two reviewers

Dual review on the net diff. **The static reviewer returned _"ready to merge"_ with nothing above its
confidence bar. The execution-capable one returned _"with fixes"_ and five confirmed defects.** Same
diff, same invariants, same instructions.

Both reports were competent — the static one correctly verified the ladder throws at every rung, the
`.`/`..` traversal guard, and the pairwise collision checks, and it found no fixture-shaped-to-pass
tests by reading. It could not have found any of the five, because **every one of them requires
running something**: a rendered footprint diffed against develop's, two convenes in a row, a commit
emitted by `join` and then executed.

**The operational conclusion, for the next finalize:** on a branch whose defects live in shipped
prose and emitted commands, a reviewer without shell access is a second opinion, not a review. The
`finalize-branch` skill already says to check the tool list for `Bash` before dispatching; this
session is the measurement behind that instruction.

One reviewer finding was **sub-threshold and real** — I reproduced it rather than passing it on
unverified: `validateAcrossTeams` compares same-knob pairs only, so two teams can share a directory
through _different_ knobs (`a.seatDir` = `b.teamDir`), and `init` then reports one team's README as
`skipped` for the other. Deferred: reachable only by a hand-authored `paths` override no documented
route produces.

## Decisions worth keeping

- **The pin is a FILE beside `config.json`, not a `currentTeam` field in it.** kubectl and Docker put
  `current-context` inside their config, correctly — those files are per-user and never committed.
  **`.anthill/config.json` IS committed.** The precedents that fit are Terraform's
  `.terraform/environment` and `.git/HEAD`: the selector lives at the same lifetime and sharing scope
  as the thing it selects. Written down in the code because the first reader who knows kubectl will
  "simplify" it back.
- **Ambiguity is a TYPE (`AmbiguousTeamError`), not a message.** `team ls` renders a list on that case
  and exits on a bad `--team`. That branch was once `/nothing selected one/.test(err.message)`, and
  the coupling was measured: rewording the sentence left the suite at 0 fail while `team ls` began
  refusing to list.
- **Three commands sit off the ladder** — `team ls`, `team use`, `init`. _A command that helps you
  resolve ambiguity must not require ambiguity to be already resolved._ Learned three times; the
  third (`init`) is also the one that proved `init` is **project-level**, not team-level.
- **A guard must read the artifact it names.** The convene guard's comment named `.bounty-session`
  from the start and read the comms record instead — so its stated reason was right and its evidence
  was written later than the event it guards.
- **Don't infer a verdict from a string, or a plural fact from a singular field.** Same rule twice:
  no `soleTeam`, no top-level `teamDir` in `init`'s envelope.

## Follow-ups filed, not fixed

- The cross-knob directory overlap in `validateAcrossTeams`.
- Declared-total fields dropping out of JSON when `undefined` (`ShowData.forkedFrom`, `TeamRow.lead`,
  `UseData.previous`) — a repo-wide idiom question.
- `loadConfig` has no production caller left; a non-object `paths` resolves to the default instead of
  erroring; `team ls` refuses on a stale pin (deliberate, but it sits against the off-the-ladder rule).
- **The bootstrap fail-open defect** — wrong today with one team, and the one to pull forward first.
- The **acceptance experiment** (manager/implementer/reviewer; count the skill instructions those
  seats cannot execute), which is what this whole instrument was built for.

## Open questions carried forward

The project-vs-team cascade for `principles.md` / `paper-cuts.md`, and whether
`.anthill/teams/<name>/dev/` conflicts with `non-dev-seats`' cross-project research tier. Neither
blocks the merge.

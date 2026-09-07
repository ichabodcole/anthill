# anthill — agent guide

anthill is a Claude Code plugin that sets up a multi-agent development team in any project: ephemeral agents in durable seats, coordinating over a message wire and a bounty board. This repo is anthill's own source, and it runs its own anthill team.

This file is an index plus the rules that are specific to this repo. It is not a tutorial.

## Where to look

- `docs/README.md`: the docs map. Every doc type, its lifecycle, and where things go.
- `docs/memories/`: a recap of recent work. Skim it at the start of a session.
- `docs/ROADMAP.md`: the prioritised view of what is in flight, in what order, with exit criteria. The lead reads it at convene and updates it at finalize.
- `docs/architecture/2026-06-28-anthill-portable-team-os-design.md`: the design of record. Thesis, the D1–D9 decisions, the config schema.
- `docs/PROJECT_MANIFESTO.md`: vision and boundaries.
- `docs/briefs/`: release bundles and multi-session arcs. Scoped plans, not the priority order.
- `docs/backlog/`: small ready-to-pick tasks. `docs/investigations/`: research. `docs/lessons-learned/`: field lessons. `docs/projects/`: larger bodies of work.

## Release history

Read what shipped from git, not from `CHANGELOG.md`. The changelog is release-please output: commit subjects and sha links, never what a release was about.

```bash
# releases: main's first-parent spine, one line each
git log --first-parent main --format='%h %ci %s'
git log --first-parent main -1 --format='%b'        # the full release note for the latest

# features: the named merges into develop
git log develop --merges --format='%h %ci %s' \
  | grep -vE "Merge pull request|Merge branch 'main' into"
```

The release narrative is the body of the `develop → main` merge commit. It is written at land time by the `land` skill.
Both `grep` exclusions are required: the first drops GitHub's pull-request merges, the second drops back-merges, which otherwise appear as repeated phantom entries.

## The team in this repo

This repo is built by a convened anthill team, not by a lone agent. The team's footprint is `.anthill/`:

- `.anthill/README.md`: the SOP.
- `.anthill/principles.md`: rules about how work goes wrong. Read at convene and at join.
- `.anthill/dev/README.md`: the roster. `.anthill/dev/<handle>.md`: each seat's doc, a job description.
- `.anthill/dev/seams.md`: the contracts between seats.
- `.anthill/wiki/`: one page per lifecycle touch point, this team's method. Linted by `anthill wiki lint`.
- `.anthill/reports/<date>/<handle>.md`: a seat's session report.

The seat docs, seams, principles, and wiki are curated. Nobody edits them during a session. `anthill commit` refuses them on an attributed commit unless `--curated` is passed. A seat writes what it learned into its report, and `anthill:curate` decides what changes.

Run `anthill:convene` to start a session, or `anthill:join <handle>` to take a seat. Use the team for anything non-trivial.

A project may configure several teams. Each after the first lives at `.anthill/teams/<name>/`. `anthill team show` says which team the current session is on.

## anthill adapts to the host project

Where a design question is "what standard applies here?" (branch policy, naming, which trunk is protected, a formatting rule), anthill creates the touch point where a team member checks the project's own standard. It does not hard-code one.
The system supplies the trigger to decide. The project supplies the content, through config or its grounding docs.
Do not bake a convention into a skill or a command default. Make it a prompt plus a config or grounding hook.

## Branches and releases

- Substantive work takes a feature branch off `develop`, merges to `develop`, then goes to `main` by pull request.
- Docs-only commits and one-line fixes may commit directly to `develop`.
- `main` is branch-protected: pull request and green CI required, admins included. Never push to it directly.
- release-please cuts a release on merge to `main` when there are releasable commits. `feat` bumps minor and `fix` bumps patch. `docs`, `test`, and `chore` are hidden types and produce no release. A docs-only merge to `main` produces no version, which is correct.
- `anthill:convene` prompts the branch decision before seats commit.

## Landing policy

Merge. Do not squash or rewrite history. Every commit keeps its `Anthill-Seat:` trailer, and short-sha citations in `docs/` and `.anthill/` keep resolving.

The procedure is the repo-local `land` skill at `.claude/skills/land/`: the merge-message shape, the develop→main pull request message, and who may merge to `main`. It is the merge step only. `project-docs:finalize-branch` owns review, gates, and docs. `cascade-check` owns release readiness.

The branch strategy is an open design question. `docs/projects/session-branch-strategy/proposal.md` proposes squash-merge at finalize and is unbuilt. Do not settle it in passing.

When citing a sha from another repository, name the repository. A foreign sha is indistinguishable from a dead local one.

## Runtime and commands

The runtime is Bun, not Node. Use `bun` and `bunx`, and prefer Bun built-ins over npm equivalents.

- `bun run check`: the full gate (typecheck, biome, tests). The husky pre-commit runs it.
- `bun test`: tests only.
- `bun run anthill <cmd>`: the CLI, `plugin/scripts/anthill/cli.ts`.

## Testing rules the gate cannot enforce

A test written by the author of the code inherits the code's blind spot. Two rules put a participant in the loop that the author did not write.

**1. A change to a command is not done until the command has been run against a fixture repo in the state its documentation describes, and whatever that run finds has a test.**
Unit tests cover the pure half of a command. They do not run the command. Read the prose, build the repo the prose describes, run the command the prose gives, and test what breaks before committing the fix.

**2. A guard is not done until it has been run against a tree with the defect put back, including in a file its allow-list already covers.**
A guard that has gone blind reports an empty list, which is what a clean tree reports. The rule is discharged in the test file:

- Split the detector into a pure function of source text, and give it positive controls that hand it synthetic defects on every run.
- Control the scan set as well as the detector. A synthetic-defect control feeds the detector a string, so it does not notice when the file walk stops reaching part of the tree. Pin named files. An empty allow-list protects nothing.
- Read the allow-list backwards: assert that every allowance is still earning itself. This goes red when a file leaves the walk, when a listed string is fixed and its entry left behind, and when a verb is lost from a derived verb set.
- Where a guard's exoneration is deliberately coarse, assert the limit as a `KNOWN LIMIT` test. Check the limit's prose against the tree.
- An allow-list entry states why, and the reason and the rule have the same predicate.
- A guard's medium is part of its scan set. `bare-anthill` scans the markdown agents are handed as well as the `.ts` tree. In markdown, a fenced block must be runnable or absent. Prose may use a shorthand its own document explains.

## Cascade check

The same rule lives in a skill, a template, a rendered copy of that template, and sometimes a spec section that code cites by number. `bun run check` does not catch a skill that disagrees with a template.

Run the `cascade-check` skill at `.claude/skills/cascade-check/` after any substantive edit to a skill, template, CLI behaviour, config schema, or path, and before cutting a release. It never bumps versions. release-please owns those.

Repo-internal skills live in `.claude/skills/`. `plugin/skills/` ships to every consuming project. Do not put internal tooling there.

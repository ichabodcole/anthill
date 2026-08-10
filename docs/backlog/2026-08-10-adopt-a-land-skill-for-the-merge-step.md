# Adopt a `land` skill — the merge step, with a real PR message

**Added:** 2026-08-10 · **Status:** In progress on `feat/land-skill` · **Shape:** one internal skill + an `AGENTS.md` pointer
**Source:** Cole, after seeing spellbook's local `land` skill
(`~/Projects/spellbook/.claude/skills/land/`). **Adopted, not copied** — see what was left behind.
**Provenance matters here:** without this file the only record would be a commit adding a skill, with
no trace of where the practice came from, what was rejected, or what stayed open.

## The trigger

PR #105 (`develop` → `main`) was titled **`Develop`** with an **empty body** — GitHub's default. This
repo pins claims to short shas and reads its own history back (`AGENTS.md` § Branch Landing Policy),
so a release PR that says nothing is a gap in the one artifact spanning a whole release.

**And the merge subjects had already drifted.** Measured across all 46 non-PR merges:

| count | shape                                           |
| ----- | ----------------------------------------------- |
| 32    | `merge(scope): subject`                         |
| 10    | `Merge branch 'x' into develop` (git's default) |
| 2     | `Merge develop into <branch>`                   |
| 1     | `Merge session 13: …`                           |
| 1     | `Merge feat/one-wire-trustworthy: …`            |

Both of this week's merges were the git default. **Nobody chose that** — it is what you get by not
passing a message, which is exactly the failure a merge-step skill exists to catch.

## Decisions

- **Adopt `merge(scope): <what a reader got>` as the feature→develop subject.** Not invented —
  it is already 32/46, so this stops drift rather than starting a convention. It is also safe for
  release-please: `merge` is not a conventional type, so these subjects trigger no version bump,
  which is right for a merge that only reaches `develop`.
- **`.claude/skills/land`, NEVER `plugin/skills/`.** That directory is discovered by name and becomes
  a skill in every consuming project. Same reason `cascade-check` lives where it does.
- **It DEFERS rather than restates**, in three directions, because restating is the
  defer-to-one-source violation both skills exist to prevent:
  - **`cascade-check`** owns release _readiness_ (ship boundary, render smoke, stale docs, dependency
    floors, don't hand-bump versions).
  - **`AGENTS.md`** owns the landing _policy_ and the commit-type → version mapping.
  - **`project-docs:finalize-branch`** owns review, quality gates and documentation.
    `land` owns only the merge mechanics and the message.

## Is `land` the same thing as `cascade-check`? — asked, and answered with evidence

**No, and the evidence is that spellbook keeps both, separately, with essentially no
cross-references.** Its `ward` skill is its `cascade-check` (_"the wards that catch drift and missed
updates when the book changes"_); `land` is its merge step. The only cross-reference between them is
`ward` citing a `feat(land):` commit as an example of a mis-typed commit.

| skill           | fires when                | answers                                               |
| --------------- | ------------------------- | ----------------------------------------------------- |
| `cascade-check` | you **changed** something | what else has to move so the content stays consistent |
| `land`          | work is **complete**      | how does this merge, and what is it called            |

`cascade-check` is keyed to **change types**; `land` is keyed to a **moment**. They touch only at
release time, and even there they answer different questions — _is it ready_ vs _what is it called_.

## Deliberately NOT adopted

- **`land-check.ts`** — spellbook mechanises "would squashing destroy information" as a script. Here
  the policy already answers it (merge, never squash), so a script would compute a verdict nobody
  acts on. The manual branch-facts commands stay in the skill; **if the policy ever changes, this is
  the thing to build first.**
- **Spellbook's §7 `--first-parent develop` warning.** It claims develop adopts main's spine after a
  back-merge fast-forwards, hiding named merges. **Measured here: not true of anthill today** —
  `git log --first-parent develop` shows develop's own commits and its feature merges, because this
  repo's one back-merge (`12612ba`) was a real merge, not a fast-forward. **Not copied, because
  copying an unverified topology claim is the exact defect this week keeps producing.** If a
  back-merge ever fast-forwards, revisit.

## Left OPEN on purpose

**`AGENTS.md` § Branch Landing Policy carries a live design question** — _"the strategy itself is an
OPEN design question — do not settle it in passing"_, with `session-branch-strategy/proposal.md`
having settled on squash-merge (2026-07-27, unbuilt) and the 2026-08-07 triage measuring what that
costs a repo whose docs pin shas. **This skill documents the procedure the CURRENT policy points at
and does not close that question.** If the policy flips to squash, the skill's §2 changes and its
§1 gains the script above; nothing else here depends on the answer.

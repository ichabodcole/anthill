---
name: land
description: >
  The merge step for this repo. It writes the merge message for a feature branch,
  and produces the title and body for the develop→main release PR. Use when a
  branch is complete and about to be merged, when opening a develop→main pull
  request, or when finalizing a branch. Triggers when a user says "merge this
  branch", "land this", "open the PR", "create a pull request", "ready to merge",
  "ship this", or when work is done and needs to reach develop or main. It is the
  merge step only. It does not replace project-docs:finalize-branch's review,
  session docs or quality gates, and it does not replace cascade-check.
---

# land: the merge step

This skill is the merge step for this repo. It produces the merge message for a feature branch, and
the title and body for the develop → main release PR. Sections 1 and 2 are feature → develop.
Sections 3 to 6 are develop → main. You are usually asked for one, not both.

- **`project-docs:finalize-branch`** owns the independent review, the quality gate, and the
  documentation. Run it. This skill is what its Step 8 policy lookup points at.
- **`cascade-check`** owns release readiness: the `plugin/` ship boundary, the template render
  smoke, docs that go stale by construction, and dependency floors. Run it before a
  `develop → main` PR. Do not hand-bump versions.
- **[`AGENTS.md` § Landing policy](../../../AGENTS.md)** owns the landing policy and the
  commit-type to version mapping. Follow it. Do not decide it here.

## 0 · Preconditions

```bash
git status --porcelain          # must be EMPTY
git fetch origin
git checkout <base> && git merge --ff-only origin/<base>   # the base must be current
```

Run the gate unpiped. `bun run check | tail` reports `tail`'s exit code, which is always 0. Redirect
and read `$?`:

```bash
bun run check > /tmp/gate.log 2>&1; echo $?
```

## 1 · Merge strategy, and the facts to compute anyway

**`AGENTS.md`: merge. Do not squash or rewrite.** Do not re-decide this per branch. Compute the
facts anyway, because they belong in the report:

```bash
git log <base>..HEAD --oneline | wc -l
for sha in $(git log <base>..HEAD --format=%h); do git grep -l "$sha" -- '*.md'; done   # sha citations
git log <base>..HEAD --format='%an%n%(trailers)' | sort -u                              # identities
```

Any sha citation, or more than one identity across `%an` and the `Anthill-Seat:` / `Co-Authored-By:`
trailers, is information a squash would destroy. Say so in the report even though the policy already
forbids squashing.

The policy carries a live open question about squash-merge. Do not settle it here.

## 2 · Feature → develop: the named merge

**Subject convention:** `merge(<scope>): <what a reader got, in their terms>`. `merge` is not a
conventional-commit type, so it triggers no release. That is correct for something reaching only
`develop`.

**Build one file:** the subject, a blank line, then the body.

```
merge(<scope>): <what a reader got>

<why it existed · what was delivered · decisions a reader needs ·
 what it deliberately does NOT reach>
```

```bash
git merge --no-ff <branch> -F <file>
```

Never use `-m "subject" -F body`. git concatenates them with no blank line, so the entire first
paragraph becomes the subject.

**Read it back before pushing:**

```bash
git log -1 --format='%s' | wc -c        # want < ~100
git log -1 --format='%h parents: %p'    # a named merge has TWO parents
git commit --amend -F <file>            # the fix — only before pushing
```

**Afterwards.** Delete the merged branch. Delete the message file. It is untracked and will
otherwise be swept into a later `git add -A`.

## 3 · develop → main: the PR message, from a fresh agent reading the tree

Do not use the lead of the session that did the work. Dispatch a fresh agent with the branch, the
base, and nothing else. Give it no session log and no summary. If it cannot write a good message
from the artifacts, that is a finding about the artifacts.

Ask it to return the following separately from the prose:

1. What it could not determine from the tree.
2. Where documents contradicted each other or the code.
3. Whether the artifacts were sufficient on their own.
4. Anything that reads as shipped but is a limitation, or the reverse.

## 4 · The cold read, before the message ships

Use a second fresh agent. Give it the message text. Forbid it from looking anything up. If it wants
to go check something, that is the finding.

Ask it for the terms it could not confidently interpret, separated into two categories: "I don't
know this word" and "I know it but it might mean something specific here". Ask it for what it takes
away in 2–3 sentences.

**What to do with the findings:**

1. **Wrong or stale facts:** fix them in the tree and commit. They are defects.
2. **Ambiguous terms:** fix them in the message.
3. **Something shipped that reads as a limitation:** give it its own section.
4. **Re-run the cold read only if the message's structure changed**, not for wording. One re-read
   maximum.

## 5 · Opening the PR: the agent creates it, the human merges

Push first. `gh pr create` uses the pushed branch. An unpushed commit is silently absent from the
PR. Pushing to `develop` is the human's call. Ask.

```bash
gh pr create --base main --head develop \
  --title "$(head -1 msg.md)" --body-file <(tail -n +3 msg.md)
```

`gh` splits title and body. `git` does not. `tail -n +3` assumes exactly one subject line and one
blank line. Check with `awk 'NR<=3'` first, or the body silently loses its first line.

If the PR already exists, use `edit` rather than `create`. The flags are otherwise identical. This
is the normal case, because the human usually opens the PR before asking for a message.

```bash
gh pr edit <n> --title "$(head -1 msg.md)" --body-file <(tail -n +3 msg.md)
```

**The agent does not merge to `main`.** That merge is the release: `main` is branch-protected, and
release-please cuts a version on merge. Hand the human the command. Do not run it:

```bash
gh pr merge <n> --merge \
  --subject "$(head -1 msg.md)" \
  --body-file <(tail -n +3 msg.md)
```

Pass both flags, from the same file that produced the PR. The body is the half that is easy to skip.
What GitHub pre-fills is `Merge pull request #NN from ichabodcole/develop` as the subject, and the
PR's title as the body. The PR's description never enters git at all. It lives only in GitHub's
database.

**Which commit types release.** `AGENTS.md` § Branches and releases has it: `feat` is minor, `fix`
is patch, and `docs`, `test` and `chore` are hidden and trigger no release at all. A docs-only merge
to `main` producing no version is correct, not broken. Ask before picking a type: does a consumer
get anything different? If not, it is a `chore`.

## 6 · Reading history afterwards

Both of these work in this repo:

```bash
git log --first-parent main --format='%h %ci %s'                       # RELEASES
git log develop --merges --format='%h %ci %s' | grep -v "Merge pull request"   # FEATURE merges
```

Spellbook warns that `--first-parent develop` is useless there, because its back-merge
fast-forwards develop onto main's spine and every named merge drops to a second parent. That is not
true of anthill today: this repo's back-merges are all real merges, so `--first-parent develop`
still shows develop's own history. Re-measure rather than trusting either claim if a back-merge ever
fast-forwards.

## 7 · Feedback

A skill copied between repos carries three kinds of claim, and they need three different treatments.

| kind          | example from this file                          | what it needs                                |
| ------------- | ----------------------------------------------- | -------------------------------------------- |
| **mechanism** | `-m` + `-F` concatenates with no blank line     | ports as-is: it is git's behaviour           |
| **topology**  | `--first-parent develop` is useless             | re-measure in the borrowing repo             |
| **audience**  | whether the narrative belongs in a release page | re-decide: a human's call, not a measurement |

The failure mode differs by kind. A mechanism claim that is wrong fails loudly. A topology claim
that does not port stays silent, because it describes a hazard the borrowing repo does not have and
nothing ever fires. An audience claim is not checkable at all, so a borrowed one imports another
project's product decision as though it were a measurement.

This skill is adapted from another repo's. If a step misfires here, or a claim turns out not to
apply to anthill, correct it in place and say what you measured.

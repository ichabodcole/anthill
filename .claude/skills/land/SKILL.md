---
name: land
description: >
  The merge step for this repo — write the merge message for a feature branch,
  and produce the title and body for the develop→main release PR. Use when a
  branch is complete and about to be merged, when opening a develop→main pull
  request, or when finalizing a branch. Triggers when a user says "merge this
  branch", "land this", "open the PR", "create a pull request", "ready to merge",
  "ship this", or when work is done and needs to reach develop or main. It is
  the merge step ONLY — it does not replace project-docs:finalize-branch's
  review, session docs or quality gates, and it does not replace cascade-check.
---

# land — the merge step

> **⚠ THIS IS NOT THE WHOLE LANDING PROCEDURE.** It is the merge step only.
>
> - **`project-docs:finalize-branch`** owns the independent review, the quality gate, and the
>   documentation. Run it. This skill is what its Step 8 policy lookup points at.
> - **`cascade-check`** owns release **readiness** — the `plugin/` ship boundary, the template render
>   smoke, docs that go stale by construction, dependency floors, and _do not hand-bump versions_.
>   Run it before a `develop → main` PR. **This skill does not restate any of it**, deliberately: two
>   copies of a checklist is the drift both skills exist to prevent.
> - **[`AGENTS.md` § Branch Landing Policy](../../../AGENTS.md)** owns the policy and the
>   commit-type → version mapping. This skill follows it; it does not decide it.
>
> **Scope:** §1–2 are **feature → develop**. §3–6 are **develop → main**. Separate jobs — you are
> usually asked for one, not both.
>
> _Adapted from spellbook's local `land` skill, with what was left behind recorded in
> [`docs/backlog/2026-08-10-adopt-a-land-skill-for-the-merge-step.md`](../../../docs/backlog/2026-08-10-adopt-a-land-skill-for-the-merge-step.md)._

---

## 0 · Preconditions

```bash
git status --porcelain          # must be EMPTY
git fetch origin
git checkout <base> && git merge --ff-only origin/<base>   # the base must be current
```

> **⚠ RUN THE GATE UNPIPED.** `bun run check | tail` reports **`tail`'s** exit code, which is always 0. Redirect and read `$?`:
>
> ```bash
> bun run check > /tmp/gate.log 2>&1; echo $?
> ```
>
> _Carried from spellbook, where it produced a false green more than once. Believed here on the
> strength of `$?` semantics, not on a local reproduction — if you hit it, say so._

## 1 · The strategy is already decided — compute the facts anyway

**`AGENTS.md`: merge; do not squash or rewrite.** You do not re-decide this per branch. But compute
the facts, because they are what makes the policy true and they belong in the report:

```bash
git log <base>..HEAD --oneline | wc -l
for sha in $(git log <base>..HEAD --format=%h); do git grep -l "$sha" -- '*.md'; done   # sha citations
git log <base>..HEAD --format='%an%n%(trailers)' | sort -u                              # identities
```

Any sha citation, or more than one identity across `%an` and the `Anthill-Seat:` / `Co-Authored-By:`
trailers, is information a squash would destroy. **Say so in the report even though the policy
already forbids squashing** — the day the policy is revisited, these numbers are the argument.

> **The policy carries a live OPEN question** (`session-branch-strategy` settled on squash-merge,
> unbuilt; the 2026-08-07 triage measured what that costs a sha-pinning repo). **Do not settle it
> here.** If it flips, §2 changes and this section gains a mechanised check.

## 2 · Feature → develop: the named merge

**Subject convention — `merge(<scope>): <what a reader got, in their terms>`.** Already 32 of this
repo's 46 non-PR merges; this stops the drift rather than starting a convention. `merge` is not a
conventional-commit type, so it triggers no release — correct for something reaching only `develop`.

**Build ONE file** — subject, **blank line**, body:

```
merge(<scope>): <what a reader got>

<why it existed · what was delivered · decisions a reader needs ·
 what it deliberately does NOT reach>
```

```bash
git merge --no-ff <branch> -F <file>
```

> **⛔ NEVER `-m "subject" -F body`.** git concatenates them **with no blank line**, so the entire
> first paragraph becomes the subject. _Spellbook hit this and shipped a 251-character subject,
> breaking the `git log --merges` view that naming the merge exists to create._

**Read it back before pushing:**

```bash
git log -1 --format='%s' | wc -c        # want < ~100
git log -1 --format='%h parents: %p'    # a named merge has TWO parents
git commit --amend -F <file>            # the fix — only before pushing
```

**Afterwards:** delete the merged branch, and delete the message file — it is untracked and will
otherwise be swept into a later `git add -A`.

## 3 · develop → main: the PR message — a FRESH agent, from the tree

**Not the lead of the session that did the work.** That agent knows what was _interesting_ — the
falsifications, the things that surprised it. **It does not reliably know what was _delivered_**, and
it will write the retro instead of the release note.

**Dispatch it with the branch, the base, and nothing else** — no session log, no summary. The
reconstruction is the point: a fresh agent reading the tree does what a future reader will do.
**If it cannot write a good message from the artifacts, that is a finding about the artifacts.**

Ask it to return, **separately from the prose**:

1. what it could **not** determine from the tree;
2. where documents **contradicted** each other or the code;
3. whether the artifacts were **sufficient on their own**;
4. anything that reads as shipped but is a **limitation**, or vice versa.

## 4 · Cold-read the message before it ships

**A second fresh agent. Give it the message text and forbid it from looking anything up.** If it
wants to go check something, **that is the finding**.

Ask for **terms it could not confidently interpret**, separating _"I don't know this word"_ from
_"I know it but it might mean something specific here"_, and **what it takes away in 2–3 sentences**.

> **The second category is the dangerous one.** An unknown word makes a reader look it up; a
> half-recognised one lets them carry on with the wrong reading.

**What to do with the findings — not a loop:**

1. **Wrong or stale facts → fix in the tree and commit.** They are defects.
2. **Ambiguous terms → fix in the message.**
3. **Something SHIPPED that reads as a limitation → give it its own section.**
4. **Re-run the cold read only if the message's STRUCTURE changed**, not for wording. **One re-read
   maximum** — past that you are polishing.

## 5 · Open the PR — the agent creates it, the human merges

**Push first.** `gh pr create` uses the _pushed_ branch; an unpushed commit is silently absent from
the PR. **Pushing to `develop` is the human's call — ask.**

```bash
gh pr create --base main --head develop \
  --title "$(head -1 msg.md)" --body-file <(tail -n +3 msg.md)
```

> **⚠ `gh` splits title and body; `git` does not.** And `tail -n +3` assumes **exactly one** subject
> line and **one** blank line — check with `sed -n '1,3p' msg.md` first, or the body silently loses
> its first line.

**⛔ The agent does NOT merge to `main`.** That is the release: `main` is branch-protected, and
release-please cuts a version on merge. **Hand the human the command; do not run it:**

```bash
gh pr merge <n> --merge --subject "<subject>"
```

> Without `--subject`, GitHub writes `Merge pull request #NN from ichabodcole/develop` — which is
> exactly the empty-title problem this skill exists to fix, reintroduced at the last step.

**Which commit types release:** `AGENTS.md` § Branch Landing Policy has it — `feat` minor, `fix`
patch, and **`docs` / `test` / `chore` are hidden and trigger no release at all.** A docs-only merge
to `main` producing no version is correct, not broken. **Ask before picking a type: does a CONSUMER
get anything different?** If not, it is a `chore`.

## 6 · Reading history afterwards

**Measured on this repo, 2026-08-10** — both work here:

```bash
git log --first-parent main --format='%h %ci %s'                       # RELEASES
git log --merges --format='%h %ci %s' | grep -v "Merge pull request"   # FEATURE merges
```

> **⚠ Spellbook warns that `--first-parent develop` is useless there**, because its back-merge
> fast-forwards develop onto main's spine and every named merge drops to a second parent.
> **That is NOT true of anthill today** — this repo's one back-merge (`12612ba`) was a real merge, so
> `--first-parent develop` still shows develop's own history. **Re-measure rather than trusting
> either claim** if a back-merge ever fast-forwards.

## 7 · Feedback

This skill is adapted from another repo's, and the parts marked as carried-not-reproduced are the
likeliest to be wrong here. If a step misfires — or a scar turns out not to apply to anthill —
correct it in place and say what you measured. **A borrowed scar that never fires here is worse than
no scar: it teaches a hazard that does not exist.**

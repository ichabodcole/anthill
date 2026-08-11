# Where anthill's loop ends and nothing picks the work up — three gaps, assessed

**Added:** 2026-08-08, at Cole's ask: _"do we have a touch point in our anthill work for [sweep-project,
finalize-branch]? … there's a skill the spellbook team added called `land` … do we have an equivalent?
Is it a gap that we actually need to fill or no?"_
**Assessed against:** `Spellbook/.claude/skills/land/`, `project-docs@3.2.0`, and what session 13
actually did.

---

## The shape of all three: anthill's lifecycle ends at TEARDOWN, and the code keeps going

`anthill:finalize-session` is the **knowledge** ritual — seat docs, seams, retro, structure
reflection. It ends by tearing down panes. **It has exactly one sentence about the code** (_"human
sign-off before the code branch merges to `develop`"_) and **routes to nothing.**

**Session 13 is the evidence.** The knowledge ritual ran fully. Then the branch was merged **by hand,
by the lead, with no skill involved** — and nothing anywhere prompted otherwise.

---

## Gap 1 — `land`: **REAL, and it is the sharpest of the three**

### What they have

`Spellbook/.claude/skills/land/` — **internal, not shipped**, same shelf as our `cascade-check`. It is
the **merge step only** and says so loudly: _"THIS IS NOT THE WHOLE LANDING PROCEDURE… everything
`project-docs:finalize-branch` does still applies."_ It carries preconditions, a strategy decision, the
merge-message mechanics, and the `develop→main` PR message.

**And it is backed by a SCRIPT — `land-check.ts`** — which mechanises the squash-vs-merge decision on
exactly two inputs: **commit shas cited in the repo's own docs**, and **per-seat attribution**.

### Why this is ours too, and not borrowed worry

**Those are anthill's two properties, measured tonight rather than assumed:**

- **242 of 264 cited shas (92%) live inside merged feature branches** — squashing breaks them.
- **Six seats' `Anthill-Seat:` trailers**, which is the only mechanical answer to _"whose judgment
  produced this?"_ since git records the human as author of every seat's commit.

### 🔴 The actual defect: our policy is PROSE WITH NOTHING EXECUTING IT

`AGENTS.md § Branch Landing Policy` says **merge, do not squash.** That is a sentence. **Nothing runs
it, nothing checks it, and nothing would notice if a future lead squashed.**

Tonight it held **because the lead had read AGENTS.md** — which is precisely the
**situational-prose-guard** class `principles.md` records going **0-for-4**: _"a dispositional
instruction holds; a situational warning fails at the recognition step."_

**And their skill names three trap-shaped failures we are currently unprotected against**, at least one
of which this session walked into:

| their trap                                                                                        | us, tonight                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-m subject -F body` concatenates with **no blank line** → a **251-char subject** on a real merge | ✅ **Survived** — 87 chars, 2 parents. **By luck of formatting, not by a check.**                                                                                                               |
| run the gate **unpiped**; `bun test \| tail` reports **`tail`'s** exit code, always 0             | 🔴 **HIT IT.** Post-merge verification was `( bun run check ) 2>&1 \| tail -6`. **Re-run unpiped afterwards: exit 0, 561 pass — the claim held, but it was read from a pipe when it was made.** |
| base must be current — `git fetch` before deciding                                                | 🔴 **NOT DONE.** No fetch before the merge.                                                                                                                                                     |

### Verdict

**ADOPT INTERNALLY (`.claude/skills/land` + a `land-check` script). DO NOT SHIP IT.**

- **Adopt**, because we have both properties their check exists for, and our policy currently has no
  executable behind it.
- **Do not ship**, because a branch-landing procedure is a **host-project convention**, and baking one
  into a plugin skill is the anti-pattern `AGENTS.md` names: _anthill supplies the trigger, the project
  supplies the content._ **Their own choice to keep it in `.claude/` is the same judgement.**

## Gap 2 — `project-docs:finalize-branch`: **REAL, and it is a MISSING ROUTE rather than missing work**

**The two rituals are complementary and neither points at the other:**

|                                | covers                                                                                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `anthill:finalize-session`     | **knowledge** — seat docs, epitaphs, seams, docs-of-record sweep, retro, teardown                                                                               |
| `project-docs:finalize-branch` | **code** — independent review via subagent, quality gate, session docs in `docs/projects/`, memory docs, test-plan results, then lands per the project's policy |

**What session 13 skipped, stated plainly: the independent code review via subagent.** The code _was_
reviewed — sentinel verified it by execution, and a no-stake reader audited it and found a real
contradiction — **but that happened because this session was designed that way, not because any ritual
asked for it.** A session that did not happen to run a verify seat would have merged unreviewed and
nothing would have said so.

**Verdict: SHIP THE TRIGGER, not the content.** `finalize-session`'s closing checklist already has the
human-sign-off beat; it should say, in the project's own terms, **"the code merge is a SEPARATE ritual
— run this project's branch-completion procedure"** and read the name of that procedure from the
project's grounding docs. **Never hard-code `project-docs:finalize-branch` into a shipped skill** — a
consuming repo may not have that plugin.

## Gap 3 — `sweep-project`: **REAL, and it is at a different altitude than it looks**

`sweep-project` reconciles **a project folder or backlog item** against what was built, then records
what remains or archives it.

**anthill's step 3.75 sweeps the docs of RECORD** — claim by claim, `HELD`/`FALSIFIED`/`UNCHECKED`
against a sha. **That is claim-level. `sweep-project` is lifecycle-level:** _is this project finished,
and should it be archived?_ **Nothing in anthill's loop ever asks that.**

**The live instance is in our own tree.** `docs/projects/_archive/comms-as-default/` carries a
`§ NEXT PHASE — what session 12 picks up`, **two sessions stale**, and its proposal opens by declaring
itself partly superseded. **Criterion 7 closed tonight; nobody asked whether that project is done.**

**Verdict: a real gap, and it is the one most likely to stay invisible** — a finished project produces
no error, no red gate, and no signal at all. **It also overlaps the sprints brief Cole raised**
(`briefs/2026-08-08-sprints-inside-long-lived-projects.md`), which proposes immutable sprints with
`outcome.md` precisely so that "is this done?" has an answer. **Do not build both; decide them
together.**

---

## What NOT to do, because it is the tempting move

**Do not add three new beats to `finalize-session`.** It is already long, and the session that ran it
tonight took hours. **Two of these three are TRIGGERS — one sentence each, pointing at the project's own
procedure** — and the third (`land`) is internal tooling that belongs nowhere near the shipped skill.

**The failure to avoid is mechanism outrunning usage**, which the manifesto names as this project's
guiding tension.

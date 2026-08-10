# bootstrap fails open on a non-software repo — it produces a meaningless team and says nothing

**Added:** 2026-08-10 · **Status:** Open · **⚠ Contains a design decision — may promote**
**Surface:** `plugin/scripts/anthill/scan.ts` (the single-surface branch) + `plugin/skills/bootstrap/SKILL.md` §2/§2a · test `scan.test.ts`
**Source:** MVP item 8 of the archived [multi-team-support](../projects/_archive/multi-team-support/proposal.md) proposal, never built.

**Wrong today, with one team.** `scan` returns `workspace: null` for BOTH "a real single-surface app"
and "there is no package.json here at all", and `bootstrap` §2 branches on that one boolean — its own
words: _"This one boolean picks the archetype."_ So a novel, a research repo, or any non-JS project is
handed `layered-app` verbatim: an engine seat scoped to _"goldens, unit tests"_ in a repo with neither.

**Measured 2026-08-10** on a git repo containing `README.md`, `chapters/01.md`, `notes/ideas.md`:

```
a NOVEL repo:      workspace: null · stack: [] · warnings: ["no package.json at repo root"]
a real React app:  workspace: null · stack: ["react"] · warnings: (none)
```

**It produces a team, the team is meaningless, and nothing reports a problem.** Same family as the
invariant the multi-team ladder is built on: a wrong answer must be a named error, never a
plausible-looking one. Here it is worse than the ladder's case, because a human RATIFIES the bogus
roster — the failure is laundered through a human "yes".

**⚠ The design question, which is why this may not stay a backlog item.** The signal already exists
(`warnings` carries `no package.json at repo root`), so the cheap fix is to have bootstrap read it.
But the honest question is what SHOULD happen:

- **(a) Read the existing warning in the skill** — no contract change, works today, and leaves
  `workspace: null` overloaded for the next reader.
- **(b) Make the absence explicit in `ScanReport`** — a third state rather than an overloaded null.
  **`ScanReport` is `seams.md` Contract 1, ratified**, so this costs a re-ratification.
- **(c) Refuse / ask the human** — bootstrap stops and asks what kind of project this is rather than
  proposing any archetype.
- **(d) A non-software archetype** — larger, and adjacent to `non-dev-seats`.

**Decide (a)–(d) before writing code.** The measurement above is the input.

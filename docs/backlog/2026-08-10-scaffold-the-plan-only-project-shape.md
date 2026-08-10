# Send the plan-only project shape upstream to the docs scaffold template

**Added:** 2026-08-10 · **Status:** Open · **Target:** `ichabodcole/project-docs-scaffold-template`
**Local change already made:** `docs/backlog/README.md` + `docs/projects/README.md` (this repo,
uncommitted-to-template). **`docs_version: 5.0.0`.**

## The gap

Both scaffold READMEs stated the tier boundary as **"if it needs a proposal, it's a project."** That
is a false dichotomy: it has no slot for _needs sequencing, but has no decisions to make_.

**The evidence it is a real gap, not a tidiness complaint — this repo already runs three shapes, and
the scaffold names two:**

| shape                           | precedent in this repo                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Backlog item, worked in place   | `2026-07-27-anthill-commit-correctness-batch` (4 defects, one commit, archived)                                     |
|                                 | `2026-07-27-join-onboarding-batch` (6 issues, four reporting teams, one commit, archived)                           |
| **Plan-only project** ← unnamed | `projects/anthill-commit-hardening/` — `plan.md` + `sessions/`, **no `proposal.md`**, sources backlog items by link |
| Full project                    | `projects/_archive/multi-team-support/`                                                                             |

**The middle row has been in use for weeks with nothing in the scaffold describing it.** The cost is
the stuck feeling of _"this is too big for a backlog item but there's nothing to propose"_, and the
downstream question it produces: _"if I write a dev plan for a backlog item, where does it go?"_

## The change (as applied locally — carry it upstream verbatim or refine)

**Replace the proposal/no-proposal threshold with two ordered questions:**

1. **Decisions or only work?** Options to weigh → **full project**.
2. **If only work: does it need sequencing?** Several surfaces / an order that matters / more than one
   session → **plan-only project**. Otherwise → **backlog item, worked in place**.

**Plus three rules that fell out of the same evidence:**

- **A backlog item graduates by growing a PLAN, not a proposal.** The plan goes in a project folder;
  the item stays an item, cited as a source, archived when its part lands.
- **The batching rule, lifted from `anthill-commit-correctness-batch`'s own wording:** group items
  only when they share **the same file, the same owner, and the same test surface.** Items grouped by
  _when they were noticed_ are a holding pen, not a work unit.
- **Guessing wrong is the system working.** An item that turns out to hold a design question gets
  promoted at that moment; don't try to price it correctly up front.

## Why this needs to go upstream rather than living here

**`docs/` is scaffold-managed** (`docs/README.md` frontmatter: `docs_version: "5.0.0"`,
`docs_template: project-docs-scaffold-template`), and `project-docs:update-project-docs` reconciles
these READMEs against the template. So the local edit is **a change that a future scaffold upgrade
will surface as drift and may reconcile away** — and every _other_ repo scaffolded from the template
still has the gap, which is where the "where do I put this?" cost actually accumulates.

**Also worth deciding upstream, since it is the same question one level up:** whether the scaffold
wants a container above `projects/` at all — a sprint, a milestone, a named scope. This repo improvises
one in `docs/ROADMAP.md` as a `# ▶ THE SCOPE OF WORK:` heading with its own criteria spanning several
projects, which works and is entirely undocumented. **Do not add it on the strength of one repo's
improvisation** — but note that the improvisation exists, because that is the signal that would justify
it later.

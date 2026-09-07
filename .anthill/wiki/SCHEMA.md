# The team wiki: maintainer contract

This file is the maintainer contract for the team wiki. Read it before adding or updating a
page. It governs structure. The method lives in the pages.

## What this wiki is

**The project-owned half of every lifecycle touch point.** anthill's skills say when an event
fires and what to read: `anthill:convene`, `anthill:join`, `anthill:plan`,
`anthill:finalize-session`, `anthill:curate`. Each of them points at one page here, and that
page says how this team does it. anthill ships the pages as a skeleton with suggestions. The
team rewrites them as its own method proves out.

**Curated, not accumulated.** No seat edits a page here during a working session. Pages change
at `curate`, or when the human and an agent edit method together. A seat that
thinks a page is wrong says so in its session report, and curation decides. The seat docs,
`seams.md` and `principles.md` live under the same rule.

**Not the evidence trail.** Session reports live in `.anthill/reports/`, outside the wiki:
dated, unprocessed until curation reads them, never on a joining seat's read path. 

## Layout

```
wiki/
  SCHEMA.md      ← this contract (never a page; exempt from front matter + orphan checks)
  index.md       ← the catalog: ONE line per page (link + hook). Update it with every page.
  touchpoints/   ← one page per lifecycle event — the pages the skills point at
  (guides/, decisions/, concepts/ — add when the method outgrows one page per event)
```

## Hard rules

0. **Read the neighbours first.** Before writing, read [index.md](./index.md) and one existing
   page of the same `type`. That sibling is the live example for anything this contract does
   not spell out.
1. **Plain markdown only.** Every page starts with an `# H1` matching its front matter `title`.
2. **Relative `.md` links** between pages (`../touchpoints/finalize.md#close-your-report`).
   Anchors are GitHub-style slugs of the target heading. Link only anchors you have verified
   exist. The lint fails on any break.
3. **Filenames** are kebab-case slugs of the title.
4. **Front matter on every page.** It follows OKF (Open Knowledge Format) 0.2. `type` is the
   one required field. `title`, `description`, `tags` and `status` are recommended.
   `generated` is the trust family. `related` is an extension OKF permits.

   ```yaml
   ---
   type: touchpoint | guide | decision | concept | index
   title: Finalize
   description: One sentence; doubles as the catalog hook in index.md.
   tags: [lifecycle, finalize]
   related: [touchpoint/curate] # type/slug — the BASENAME, so a page can move folders
   status: draft # OKF 0.2: draft | stable | deprecated
   generated: { by: anthill, at: 2026-09-03 } # who last meaningfully changed it, and when
   ---
   ```

   A page anthill shipped is `draft` with `generated.by: anthill`: a suggestion, not this
   team's rule. The first time curation rewrites a page for this team, set it `stable` and put
   the actor that did it in `generated.by`.
5. **No page is an orphan.** Every page must be reachable from `index.md`, transitively. Add
   the catalog line in the same commit as the page.
6. **Backlinks are computed, never authored.** The lint's JSON output carries inbound links,
   tag adjacency, hubs and orphans. Do not hand-maintain any of it.

## The lint

`anthill wiki lint` checks links, anchors, front matter, catalog reachability and `related`
edges, and emits the knowledge graph under `--format json`. A wiki with problems is an answer,
not an error: the command exits `0` with `clean: false` and the problems listed. A pre-commit or CI gate that wants a non-zero exit reads `clean` off the
envelope: pipe the JSON through `jq -e '.data.clean'`.

`anthill <command>` here is shorthand, not a binary on your PATH. The real invocation is
`bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is
only set while a plugin skill is running. Take the resolved command from `anthill:join`.

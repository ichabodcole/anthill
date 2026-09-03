# The team wiki — its maintainer contract

You are (probably) an agent about to add or update a wiki page. This file is the whole contract:
read it once, then work. Humans: this file governs structure; the method lives in the pages.

## What this wiki is

**The project-owned half of every lifecycle touch point.** anthill's skills say _when_ an event
fires and _what to read_ — `anthill:convene`, `anthill:join`, `anthill:plan`,
`anthill:finalize-session`, `anthill:curate`. Each of them points at one page here, and that
page says _how this team does it_. anthill ships the pages as a **skeleton with suggestions**;
the team rewrites them as its own method proves out. A skill never has to change when the team
changes how it finalizes, and the team never has to fork a skill to own its process.

**It is curated, not accumulated.** No seat edits a page here during a working session. Pages
change at `curate`, or when the human and an agent deliberately sit down to edit method. A seat
that thinks a page is wrong says so **in its session report** — that is the outlet — and curation
decides. This is the same rule the seat docs, `seams.md` and `principles.md` live under, and
it is the whole reason those files stopped turning into diaries.

**It is not the evidence trail.** Session reports live in `{{teamDir}}/reports/`, outside the
wiki: dated, unprocessed until curation reads them, never on a joining seat's read path. The
wiki is what this team believes about its own method; the reports are what convinced it.

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
   Anchors are GitHub-style slugs of the target heading. **Link only anchors you have verified
   exist.** The lint fails on any break.
3. **Filenames** are kebab-case slugs of the title.
4. **Front matter on every page — OKF (Open Knowledge Format) 0.2.** `type` is the one
   required field; `title`, `description`, `tags` and `status` are recommended; `generated`
   is the trust family. `related` is an extension OKF permits.

   ```yaml
   ---
   type: touchpoint | guide | decision | concept
   title: Finalize
   description: One sentence; doubles as the catalog hook in index.md.
   tags: [lifecycle, finalize]
   related: [touchpoint/curate] # type/slug — the BASENAME, so a page can move folders
   status: draft # OKF 0.2: draft | stable | deprecated
   generated: { by: anthill, at: 2026-09-03 } # who last meaningfully changed it, and when
   ---
   ```

   **`status` carries a meaning here that is worth knowing.** A page anthill shipped is
   `draft` with `generated.by: anthill` — a suggestion, not this team's rule. The first time
   curation rewrites a page for this team, set it `stable` and put the actor that did it in
   `generated.by`. The wiki's graph then shows at a glance which touch points this team has
   taken ownership of and which are still running on anthill's defaults.
5. **No page is an orphan.** Every page must be reachable from `index.md`, transitively. Add
   the catalog line in the same commit as the page.
6. **Backlinks are computed, never authored.** The lint's JSON output carries inbound links,
   tag adjacency, hubs and orphans. Do not hand-maintain any of it.

## The lint

`anthill wiki lint` checks links, anchors, front matter, catalog reachability and `related`
edges, and emits the knowledge graph under `--format json`. **A wiki with problems is an
answer, not an error** — the command exits `0` with `clean: false` and the problems listed,
per anthill's CLI contract. A pre-commit or CI gate that wants a non-zero exit reads `clean`
off the envelope: pipe the JSON through `jq -e '.data.clean'`.

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here

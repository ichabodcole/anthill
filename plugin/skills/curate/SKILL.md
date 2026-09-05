---
name: curate
description: Turn the team's session reports into method — OUTSIDE any working session, with the human in the loop. A fresh agent (never one that wrote the reports) reads every unprocessed report, proposes a destination per item (a seat doc · a seam · a principle · a wiki page · a skill · tooling · drop), the human rules, the approved diffs land with `anthill commit --curated`, disagreements are recorded on the wiki's curate page, and the reports are marked processed. The ONLY touch point that edits a seat doc, seams.md, principles.md or the wiki. Use when the human says "curate the reports", "process the session reports", "let's do curation", "what should go into the seat docs from last session", or when convene reports unprocessed reports piling up.
---

# anthill: Curate (reports in, method out)

The touch point that closes the loop. Seats write **reports** during a session and never edit their
own docs; this is where a **different** agent, with the human, decides what — if anything — the
reports change. It runs **outside** the session that produced them, because the agent that did the
work is context-rich about the session and blind to what a stranger needs, and so is the lead at
finalize.

> **The anthill CLI** — driven from the plugin:
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, written **`anthill <command>`** below
> (shorthand, not a binary on PATH). `<teamDir>` / `<seatDir>` are RESOLVED from `.anthill/config.json`
> (defaults `.anthill/`, `.anthill/dev/`); `anthill join <any-handle>` prints them.

> **This skill is the trigger. The method is this team's, and it starts almost empty on purpose.**
> `<teamDir>/wiki/touchpoints/curate.md` is where the method accretes: every time the human overrules
> the agent's proposal, the reason is written there. That is the one place in the system where
> accumulation is the point — it is accumulating decision criteria, not incidents. **The human is in
> the loop until the agent's triage matches the human's rulings consistently, across more than one
> project.** Do not skip the human to save time; the time is the method being built.

## Steps

1. **Ground — as a stranger.** You did not attend the session; keep it that way. Read, in order:
   - `<teamDir>/reports/README.md` — what a report is and what the close prompts ask;
   - `<teamDir>/wiki/touchpoints/curate.md` — **this team's rulings so far**, the method as it stands;
   - the **curated docs** you may end up editing: `<seatDir>/<handle>.md` for every seat (identity
     only), `<seatDir>/seams.md`, `<teamDir>/principles.md`, the wiki's `index.md`;
   - **every unprocessed report** — `<teamDir>/reports/<date>/<handle>.md` with no `curated:` front
     matter. Oldest first. Read them whole; do not skim for headings.

2. **Say what you could not understand, first.** Before proposing anything, list the report passages
   you could not make sense of without context the author had. **That list is a finding about the
   report prompts, not about the reporter** — and the human's answer to it usually changes the
   finalize page or `reports/README.md` before it changes anything else. Expect this to dominate the
   first few runs.

3. **Triage — one proposal per item, then the human rules.** Walk the reports item by item. For each,
   propose a destination and one sentence of why:
   - **seat doc** — only if it changes who this seat _is_ or what it _owns_ (Role · Scope ·
     Boundaries · Relationships · Practices). A lesson is not a seat-doc change.
   - **seam** — shared truth two seats rely on that drifts if restated; a data shape, an invariant, a
     protocol. Invariant · ratified grain · proof. A lesson dressed as a contract is the commonest
     way `seams.md` grows into a diary; refuse it.
   - **principle** — a lesson that generalises past the incident, with its scar. Usually no.
   - **wiki page** — this team does a touch point differently from anthill's seed, or the seed was
     wrong for it. The page moves from `draft` to `stable` when the team owns it.
   - **skill / tooling** — a class of mistake, seen more than once, that a checklist or a guard would
     make impossible. Tooling beats a rule that asks an agent to remember. File it where this project
     files work (its backlog, a project folder) — not in a team doc.
   - **drop** — a one-off, or already handled. **A real answer**, and the commonest one.

   **Ask what class of thing an item is before asking where it goes.** One incident is a report line;
   the same incident across three reports is a class, and a class is what becomes a checklist, a
   skill, or a guard. Group before you route.

   **The human rules on each proposal.** Where they disagree with you, **write the reason on the
   curate page** under _Rulings_, dated, in a form the next curator can apply: _"an X is not a Y
   because Z."_ Agreement needs no entry.

4. **Apply the approved diffs.** Edit the curated docs. Keep every seat doc to its five sections;
   keep a seam to invariant · grain · proof; give a principle its scar; set a rewritten wiki page's
   `status: stable` and `generated: { by: <you>, at: <date> }`. Land with the flag that names what you
   are doing:

   ```
   bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" commit --as <lead-or-your-handle> --curated -F <msg-file> <curated paths…>
   ```

   The commit message names the reports it was curated from. Run `anthill wiki lint` if a wiki page
   changed; a wiki with problems is an answer (`clean: false`), fix it before landing.

5. **Mark the reports processed.** Add front matter to the top of each report you read:

   ```yaml
   ---
   curated: { at: 2026-09-03, by: <your handle or model> }
   ---
   ```

   A report that produced nothing is still marked. **Nothing is deleted.** Land the marked reports in
   the same commit as the diffs, or the next one — not before them.

6. **Write the curation's own line on the curate page.** Date, reports covered, items proposed,
   agreement rate (how many of your proposals the human accepted unchanged), and what changed in the
   method. That number is how everyone will know when the human can step out; keep it honest.

## Output

The curated docs changed exactly where the human agreed; every disagreement recorded on the curate
page; every report read marked `curated:`; one line on the page saying what this run did.

## Skill feedback

The curate page is this skill's feedback channel by design — a rough step here is a ruling there.
Something about **anthill itself** → `anthill feedback`.

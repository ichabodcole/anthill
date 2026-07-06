# weaver's lane — the touchpoint reframe (team-routing framing + the six pointers)

**Owner:** weaver (brain / skills + templates) · **Consumes:** the `anthill feedback` invocation contract
([seams.md Contract 2](../../../../.anthill/dev/seams.md)) · **Does not define it.**

This lane builds the **adoption half** of `anthill feedback`: the prose that tells a consuming
project's agent that anthill-upstream feedback is a thing, that ideas are as welcome as bugs, and that
on a team the send routes through the lead.
It is all prose-and-data — no code — spread across the skills and the docs-team scaffold.

## The framing split I MUST honor (the ratified two-home ruling)

The framing lives in **two disjoint single-sources** — I own one, forager owns the other, and I never
copy forager's into mine.

- **Command-facing framing** — what `anthill feedback` is _for_ (upstream, ideas-welcome, the
  categories) — is one generative-first sentence in the command's `--help` / `meta.description`.
  **forager owns it; I POINT at it, never restate flag semantics or the "what it's for" prose.**
- **Team-routing framing** — team-local vs. anthill-upstream, and the routing rule (**on a team, seats
  surface to the lead; the lead dedupes + submits; solo = you're the lead**) — is the SOP seed.
  **I own this, canonical, in `templates/docs-team/README.md`.**

Everything else **points**.
The one justified echo across the pointers is a terse "on a team, surface to the lead" safety nudge —
placed at the danger moment (the point of use), where an over-eager seat might `--submit` a duplicate.

## What I'm building (five edits, six files)

1. **SOP seed** — `templates/docs-team/README.md`.
   The canonical home for the team-routing framing.
   Team-local friction/ideas stay in the project (your finalize / `paper-cuts.md`); a bug, rough edge,
   **or an idea about anthill itself** goes home via `anthill feedback` (which POINTS at the command,
   not restates it).
   On a team, surface it to the lead — don't `--submit` yourself; the lead dedupes + submits.
   Solo? You're the lead.
   Lead **generative-first** (idea before bug) so the corrective-heavy category default doesn't
   suppress ideas.

2. **The six `## Skill feedback` pointers** — `skills/{bootstrap,convene,join,plan,finalize-session,upgrade}/SKILL.md`.
   AUGMENT the existing team-local route line with ONE pointer sentence:
   _"Something about **anthill itself** — a bug, rough edge, **or an idea to improve it**? →
   `anthill feedback` (on a team, surface it to the lead)."_
   Leave the "Reflective pass" paragraphs untouched.
   **Graceful degradation:** `bootstrap` (and `upgrade`, run solo) execute before a team exists, so the
   "on a team … / solo you're the lead" phrasing must no-op cleanly when there's no team — the pointer
   nudges without asserting a lead exists.

3. **paper-cuts** — `templates/docs-team/paper-cuts.md`.
   Sharpen the existing "filed upstream" **disposition** to name **anthill** as an upstream target
   alongside spellbook, with `anthill feedback` as the streamlined path.
   A disposition refinement, not a re-teach of the framing.

4. **finalize-session lead step** — `skills/finalize-session/SKILL.md`.
   Add ONE bullet to the lead's residual pass (beside the seams pass + structure reflection):
   aggregate + dedupe the team's anthill-upstream feedback candidates (surfaced via the vine / scratch
   / returns — the **same intake** as `seams.md` candidates, no new store) and submit the deduped set
   (`anthill feedback … --submit`).
   Mirrors how the lead single-sources `seams.md`.
   **Kept DISTINCT from finalize's own `## Skill feedback` pointer** — feedback _about the ritual_ vs.
   _aggregating the team's_ feedback are two separate edits in that file.

## Boundaries with other seats

- **forager** owns the command + the invocation contract + the command-facing `--help` framing.
  I consume the contract verbatim; if I needed a behavior it doesn't guarantee, that's a falsification
  I report, not semantics I invent.
- **sentinel** cold-reads my prose from a fresh context: can a new agent, from the skills alone, tell
  team-local from anthill-upstream, know ideas are welcome, and know to route through the lead on a
  team?
  That outside read is the real test of whether the split lands.
- **maestro** lands my paths (I do not commit).

## Single-source rigor (the constraint that shapes every line)

Sentinel burned us on duplication before — a contract restated in N places drifts.
So: I POINT at forager's `--help` for the "what it's for" prose and the flag semantics; I never copy
them into the skills.
My canonical prose (team-routing) lives once, in the SOP seed; the pointers and paper-cuts reference
the concept, they don't re-teach it.

## Verification (my slice)

- Format: `npx prettier --check "plugin/skills/**/*.md" "plugin/templates/**/*.md"` (fix flags).
  Do NOT run full `bun run check` (forager edits in parallel).
- Cold-read self-check: from the skills alone, is team-local vs. upstream legible, are ideas welcome,
  is lead-routing clear?
- One sentence per line; never start a wrapped line with `-`/`+` (prettier reflow safety).

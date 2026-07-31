# Name the granularity of every safety promise anthill makes

**Added:** 2026-07-31 · **Status:** ✅ **SHIPPED** on `feat/language-and-promises` — five instances
fixed and the audit pass complete · **Seat:** weaver + forager

Two of anthill's stated guarantees are **true at one granularity and relied on at a finer one**. Both
were reported by StoryLoom and **independently reproduced** before write-up. The team's lead
generalised the shape better than we had:

> **A guarantee stated at one granularity, relied on at a finer one.** In both: nearly true, the
> natural verification returns **clean**, and the failure is invisible to whoever caused it.

Their prescription is the fix, and it is one sentence:

> Where the docs make a safety promise, **name the granularity it holds at.** _"Gitignored and
> excluded from lint targets"_ would have been true and would not have misled us; _"gate-safe"_ was
> shorter and wrong.

## The three confirmed instances

**1. `.anthill/scratch/` is "gate-safe" — holds at file-visibility, fails at config-discovery.**
A `biome.json` dropped there took the gate down for every seat. **Reproduced:** the file is confirmed
gitignored and Biome still discovers it and exits with a configuration error — it walks the filesystem
for nested configs and never consults gitignore for _discovery_.
→ Say what is actually true: gitignored, and excluded from the lint/typecheck **target set** — which
is not the same as invisible to a tool that does its own filesystem discovery. **Config files are the
exception and must be named as one.**

**2. `anthill commit`'s pathspec — holds at file, fails at content.**
The SOP's phrasing implies a peer's work is protected. It protects against sweeping a peer's **files**,
not their **uncommitted edits inside a file you both own parts of**. **Reproduced:** a commit naming
only `seams.md` carried another seat's unfinished paragraph, returned `{"ok":true}`, and **no guard
fired**. `seams.md` is where this recurs by design, since ownership there is per-contract inside one
file.
→ From the seat it happened to: _"my prose landed under calvino's commit and calvino's message, and
**calvino's own verification was correct and could not see it** — 'my paths are clean' is true, and
blind."_

**3. `"your paths are unstaged"` — our wording, shipped 2026-07-27, holds at index and reads as
isolation.**
From the unstage-on-failure fix. A seat read it as _"your work is isolated"_ and stated that as status
to the team. It means only that **your index entries were dropped**; the working-tree content stays for
whoever next names that path.
→ Rewrite to say what it does: the index is restored, **the working tree is unchanged**, and a peer
committing a file you have edits in will still carry them.

## Why this is a search strategy, not three fixes

The lead's abstraction, derived from instances 1 and 2, **correctly predicted instance 3 — which they
had not seen.** A generalisation that predicts an untested case earns being used as a lens.

So the work is an **audit**: go through every place anthill promises safety, isolation, protection or
sufficiency, and ask _at what granularity is this actually true, and where will someone rely on it one
level finer?_ Candidate surfaces:

- `join` — scratch gate-safety (**confirmed defective**), the read-only-first clause, tail/pull guidance
- the SOP seed — the commit discipline, "file-scoped" as a phrase, announce-before-editing
- `anthill commit` — every message it emits, especially on the failure path
- `seams.md` — "single source" (holds per contract, or per file?)
- the ratify gate — already fixed for this; the
  [granularity item](2026-07-28-seam-ratification-granularity.md) is the same pattern found by a
  different team, which is why it promotes

## Acceptance Criteria

- [x] The three confirmed instances say what is actually true, at the granularity it holds.
      — scratch gate-safety and the commit pathspec both now name the exception; see
      `plugin/skills/join/SKILL.md` and `plugin/templates/docs-team/README.md`.
- [x] `anthill commit`'s failure envelope no longer implies isolation it does not provide.
      — rewritten to scope itself to the index and disclaim isolation explicitly, with a
      **regression guard** (`team-commit.test.ts`) verified to fail against the old wording.
- [x] An audit pass over the surfaces above, with each promise either qualified or confirmed exact.
      **Done 2026-07-31.** Swept `plugin/skills/**` and `plugin/templates/**` for protection language
      (`safe`, `protects`, `guarantee`, `isolat*`, `prevents`, `ensures`, `never …`). Results below.
- [x] The rule is stated once, somewhere a future author will meet it — **a promise without a stated
      granularity is a promise at the coarsest reading.** Landed as a row in the internal
      `cascade-check` skill, which is read before every release, so the lens fires on new promise
      language rather than only on incident reports.

## What the audit found

**The lens earned itself a fourth time — and this one nobody had reported.**

**4. `anthill init` "never clobbers existing docs" — holds at file, relied on at content.**
Stated in `bootstrap`, echoed in `upgrade` as _"clobbers nothing — every existing doc is skipped"_,
and framed there as purely benign and additive. True: nothing a team wrote is destroyed. **What it is
relied on for — "upgrading brings my footprint current" — is false.** An existing `.anthill/README.md`
or seat doc is **never updated by any release, ever**; migrations move files, they do not refresh
content. So a team keeps its bootstrap-version guidance permanently, _including guidance later
releases corrected_.
→ **This was live at the moment of writing:** the SOP conventions added in this same pass reach **no
existing team**. StoryLoom bootstrapped on 1.5.0. Fixed by naming the freeze in `bootstrap`, and in
`upgrade` giving the actual remedy — diff the template against the footprint, then classify each hunk
(shared guidance / local specificity / drift) rather than syncing wholesale.

**5. `convene --fresh` — we stated a dependency's guarantee in our own voice.**
_"Safe no-op if seats are already connected; a live session is never wiped."_ `--fresh` is forwarded
straight to grapevine; the guard is **spellbook's**, and anthill cannot verify it. Not reported as a
defect — it was not reproduced, and the sweep's job is granularity, not speculation. Attributed
instead. Also qualified _"nothing is lost"_: the log is **recoverable from the archive**, which is not
the same as **seats still seeing it** — after a clear, a backfilling seat reads an empty channel.

**Confirmed exact — no change needed:**

- **`join`'s read-only-first clause** already names its own granularity, and is the model for the
  rest: _"the guarantee is that the reads are read-only — **not** that join works without Bash."_
- **The lead-routing clause** in the SOP seed does the same: _"it is not a claim that the human can't
  see you."_
- **`seams.md` "single source"** — a false lead. Every hit is a documentation-authoring rule (_point
  at the source, don't restate it_), not a protection claim. Nothing to qualify.

**Read on the lens itself:** five instances now, across four surfaces and two independent teams, and
**two of the five were found by prediction rather than by report** (#3 and #4). It is worth keeping as
a standing review question, not just an incident response — which is why it landed in `cascade-check`.

## References

- [StoryLoom first-contact intake](../reports/2026-07-31-story-loom-first-contact-intake.md) —
  Findings 2 and 3, with the reproductions.
- [Seam ratification granularity](2026-07-28-seam-ratification-granularity.md) — **the same pattern,
  found independently by a different team** in seam ratification. Two independent derivations across
  different domains; this is the general form.
- `plugin/skills/join/SKILL.md`, `plugin/templates/docs-team/README.md`,
  `plugin/scripts/anthill/commands/team-commit.ts`.

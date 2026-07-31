# Name the granularity of every safety promise anthill makes

**Added:** 2026-07-31 · **Status:** ⚠️ **three instances SHIPPED** on `feat/language-and-promises`;
**the audit pass is still open** · **Seat:** weaver + forager

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
- [ ] An audit pass over the surfaces above, with each promise either qualified or confirmed exact.
      **← the remaining work.** Three instances were found by field report; the point of the item is
      that the shape predicts more, and nobody has swept for them yet.
- [ ] The rule is stated once, somewhere a future author will meet it — **a promise without a stated
      granularity is a promise at the coarsest reading.**

## References

- [StoryLoom first-contact intake](../reports/2026-07-31-story-loom-first-contact-intake.md) —
  Findings 2 and 3, with the reproductions.
- [Seam ratification granularity](2026-07-28-seam-ratification-granularity.md) — **the same pattern,
  found independently by a different team** in seam ratification. Two independent derivations across
  different domains; this is the general form.
- `plugin/skills/join/SKILL.md`, `plugin/templates/docs-team/README.md`,
  `plugin/scripts/anthill/commands/team-commit.ts`.

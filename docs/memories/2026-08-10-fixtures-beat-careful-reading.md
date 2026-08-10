# A claim can be correct in reasoning and wrong against a fixture — build the fixture

**Date:** 2026-08-10

Closing `bootstrap`'s fail-open (`scan` reported `workspace: null` for both a real single-surface app
and a repo with no readable manifest, and `bootstrap` picked its archetype from that one boolean, so
a novel got `layered-app` — and **a human ratified it**). Fixed with a typed
`ScanReport.evidence: "manifest" | "none"` and a `bootstrap` §2·0 that says what it could not read
and asks, instead of proposing a shape.

**The durable part is not the fix. It is that the fix reproduced its own defect twice, and each time
the reasoning was sound:**

- **Round 1** documented `"manifest"` as _"a root `package.json`"_. A `pnpm-workspace.yaml` with no
  root manifest answered `"manifest"` **beside** `warnings: ["no package.json at repo root"]` — the
  field's own meaning denied by the same payload.
- **Round 2** set `"manifest"` from globs **parsing**, arguing globs cannot exist without a readable
  manifest. True of the glob source, false of the units: a fresh scaffold gave `"manifest"` with
  `units: []`, which skipped §2·0 and could reach `layered-app` again.
- **Also round 2**: a `package.json` containing `"hello"` was a manifest — `JSON.parse` succeeds, the
  cast accepted it, **no warning at all**, and the text output printed `Workspace: single-surface`.
  The original defect verbatim, through a file that parses.

Settled rule: **`"manifest"` iff at least one unit was derived from a manifest that was actually
read.** Not "exists", not "parsed".

**Sixteen fixture repos found in minutes what three careful readings did not** — including two
readings by the person who had just written the invariant down, in a ratified contract, specifically
to prevent this class. **A contract is not made accurate by being rewritten; it is made accurate by
being checked against a payload.**

**Corollary for reviews:** the reviewer that found rounds 2–3 had shell access and built fixtures. On
this repo's defects — which live in shipped prose, emitted commands, and the gap between a field's
gloss and its code — a reviewer that can only read shares the author's blind spot.

**Key files:** `plugin/scripts/anthill/scan.ts` (`readManifest`, both `evidence` sites),
`plugin/skills/bootstrap/SKILL.md` §2·0, `.anthill/dev/seams.md` Contract 1

**Docs:** [backlog item with all three rounds](../backlog/2026-08-10-bootstrap-fails-open-on-non-software-repo.md)

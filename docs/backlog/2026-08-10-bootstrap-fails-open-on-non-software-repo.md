# bootstrap fails open on a non-software repo — it produces a meaningless team and says nothing

**Added:** 2026-08-10 · **Status:** ✅ **SHIPPED** 2026-08-10 on `fix/bootstrap-fail-open` · **Decision: (b)+(c), recorded below**
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

---

## DECISION (2026-08-10, ratified by Cole) — (b) + (c)

**`scan` states the fact in a typed field; `bootstrap` stops proposing an archetype it has no
evidence for and asks the human.**

**(a) was eliminated on this repo's own precedent, and that is the part worth keeping.** The signal
already existed in `warnings: ["no package.json at repo root"]`, so the cheap fix was to have the
skill read it — and that is **inferring a verdict from a string**, the exact defect that made
`AmbiguousTeamError` a TYPE last week after a measured reword left the whole suite green while
`anthill team ls` broke. **In a skill it is strictly worse than where it was caught**, because
nothing in prose can go red. The cheapest fix was the one the repo had already paid to learn not to
take.

**(b) cost a re-ratification of `seams.md` Contract 1, and the contract asked for it.** Its own
clause: _"a consumer needing a field not listed here has hit a new seam."_ `skills/bootstrap` had
hit one and had been silently coping for weeks.

**(d) was left to `non-dev-seats`,** which owns the question of what a non-software team looks like.
anthill has no opinion there, and installing a guess is the dictating failure.

## What shipped

- **`ScanReport.evidence: "manifest" | "none"`** — `"none"` ⇒ `units[0]` is synthesized from the
  directory name and its `stack` is empty **by absence, not observation**. A malformed
  `package.json` is `"none"` too: the file existing is not evidence, only a readable manifest is.
- **`bootstrap` §2·0** — `evidence: "none"` stops and asks, and does **not** fall through to 2a/2b or
  "start from `layered-app` and adjust". 2a/2b now name `evidence: "manifest"` in their own headings.
- **The wording rule, which is the load-bearing half:** phrase it as _what the scanner could not
  read_, never as a claim about what the repo is. **A Python or Rust repo answers `"none"` today** —
  measured. "This isn't a software project" invites an argument; "I can't read Cargo.toml" invites a
  correction, which is the thing you want.
- **`scan --format text`** — no longer prints `Workspace: single-surface` for a manifest-less repo,
  and shows `not scanned` rather than `?` for the stack. **Found by running the command after the
  JSON payload was already correct**: the fix had landed in the machine surface and left the human
  one asserting the same unevidenced shape.

## Why "ask" rather than "refuse"

The old failure was not merely a wrong archetype — **a human ratified it.** Bootstrap's whole design
is explore → converse → compose, so the bogus roster was laundered through a "yes". Refusing would
have been consistent with the hard-error invariant and would have locked non-software repos out
entirely; asking is what `adapts, not dictates` actually means here. **Ratification is not a safety
net for a shape nobody had grounds for** — that sentence is now in the skill's scope summary,
because it is the belief that let the defect ship.

**Verified:** novel repo → `evidence: none`; React app → `manifest` + `workspace: null`; pnpm
workspace → `manifest`; malformed manifest → `none`; Python repo → `none` (the case the wording must
not mislabel). All four new `scan.test.ts` cases and the two renderer cases verified RED against the
pre-fix file.

## Follow-up — `"manifest"` is documented narrower than the code, on a reachable input

**✅ FIXED 2026-08-10**, as specified: prose widened at all three sites, code untouched, and the pnpm-no-root-manifest case pinned as a test asserting `evidence` and `warnings` **together** — the pair is the point, since the defect was that the two read as contradictory. The `seams.md` amendment carries a same-day correction note rather than a silent rewrite.

**Found in review 2026-08-10, before this branch merged. The behaviour is right; three shipped
sentences about it are not.** `"manifest"` is written as a claim about **`package.json` at the root**
in `scan.ts`'s field doc (_"a readable `package.json` was found at the root"_) and in `bootstrap`
§2's `data.evidence` bullet (_"a readable `package.json` was found"_). The workspace return path sets
it unconditionally, and its own comment already says the wider thing — _"a manifest (package.json
**or pnpm-workspace.yaml**)"_.

**Measured — a repo with `pnpm-workspace.yaml` and NO root `package.json`:**

```
evidence: "manifest"
warnings: ["no package.json at repo root"]     ← the field's documented meaning, denied
units:    ["a"]        workspace: { globs: ["packages/*"] }
```

**The scan genuinely had something to go on**, so `"manifest"` is the correct value and `bootstrap`
correctly reaches §2b. Nothing is broken. What is wrong is that **the one artifact whose entire value
is being true about what the data supports says something the same payload contradicts** — and this
is a ratified `seams.md` contract, re-ratified this week for exactly this reason. A consumer trusting
the sentence would conclude a root manifest exists; a human reading `scan --format text` beside §2
gets the warning and the claim at once.

**Fix — one sentence, three places, no code:** state the value as _"a readable manifest — a root
`package.json`, **or** a `pnpm-workspace.yaml` that yielded globs"_, and note that `warnings` may
still report no root `package.json`. Touch `scan.ts`'s field doc, `bootstrap` §2's bullet, and the
`seams.md` amendment's ratified-at line if it names the narrower reading. **Do not narrow the code to
match the prose** — refusing a real pnpm workspace for lacking a root `package.json` would be a new
fail-closed defect where there is currently none.

_The field header (`what the scan had to go on`) and the `"none"` half are both already exactly
right; only `"manifest"`'s gloss over-commits._

---

## Second review round — the fix reproduced its own defect, twice

**Found by the independent review at finalize, 2026-08-10, both reproduced before acting.** The
shipped fix was honest on every input _through the root manifest_ and wrong on two that route around
it.

**1. `evidence: "manifest"` came from globs PARSING, not from any member being READ.**
`globs.length > 0` is decided before `expandMembers` runs, so a fresh scaffold —
`pnpm-workspace.yaml` declaring `packages/*`, no packages yet — returned `evidence: "manifest"` with
`units: []`. bootstrap reads `evidence` first, so **§2·0 never fired**; it landed in §2b, whose
entire derive is over units it does not have, and whose escape hatch is _"one real surface ⇒ fall
back to `layered-app`"_ — which a reader applies to zero. **The original defect, one level up, on a
reachable input.**

**2. A `package.json` containing `"hello"` was a manifest.** `JSON.parse` succeeds and the cast to
`Manifest` accepted it: `evidence: "manifest"`, **no warning at all**, and `scan --format text`
printed `Workspace: single-surface` over a unit named after the directory. **The original defect
verbatim**, through a file that parses. Falsy non-objects (`null`, `0`, `false`) happened to answer
`"none"` — by falsiness accident, not design, which is exactly why this hid.

**The rule that replaces both:** `"manifest"` iff **at least one unit was derived from a manifest
that was actually read**. Not "a manifest exists" (round 1's error), not "a manifest parsed"
(round 2's). Both looser readings shipped on this branch, and both reproduced the thing it exists to
fix.

**Also fixed:** §2·0's scripted question enumerated repo kinds (_"non-software, or Python/Rust/Go"_),
violating the wording rule printed in the next bullet — and enumerating **wrongly**, since an
ordinary JS repo with `client/` + `server/` manifests and no root one reads `"none"` and is neither.
The script now names no kinds at all. Plus §3's opening (branched only two ways, dead-ending §2·0's
"step 3 onward works unchanged"), §0a's summary sentence, §2b's zero-units guard, and `seams.md`'s
Proof line.

**Both guards mutation-verified**: reverting either makes exactly its own test red.

**The lesson, which is the third instance on this branch:** every round here was correct _in
reasoning_ and wrong _against a fixture_. Round 1 argued globs cannot exist without a readable
manifest — true of the glob source, false of the units. Round 2 read `JSON.parse` succeeding as a
manifest being present. **Sixteen fixture repos found in minutes what three careful readings did
not.**
